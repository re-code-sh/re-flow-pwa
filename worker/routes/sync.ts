import { Hono } from 'hono';
import type { Bindings, Variables, SyncPushRequest, SyncPushResponse, SyncPullResponse } from '../types';
import { resolveUserBySyncKey, applyLwwMutations, pullChangesSince } from '../services/sync-engine';

export const syncRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/** Middleware to resolve and attach user authentication from Sync Key */
syncRouter.use('*', async (c, next) => {
  const headerKey = c.req.header('X-Sync-Key') || c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  const queryKey = c.req.query('key') || c.req.query('sync_key');
  let syncKey = headerKey || queryKey;

  // If in body for POST requests
  if (!syncKey && c.req.method === 'POST') {
    try {
      const cloned = c.req.raw.clone();
      const body = (await cloned.json()) as { sync_key?: string };
      syncKey = body.sync_key;
    } catch {
      // ignore
    }
  }

  if (!syncKey) {
    return c.json(
      {
        error: 'UNAUTHORIZED',
        message: 'A 6-character Sync Key is required via X-Sync-Key header, Authorization, or key query parameter.',
      },
      401
    );
  }

  const user = await resolveUserBySyncKey(c.env.DB, syncKey);
  if (!user) {
    return c.json(
      {
        error: 'INVALID_SYNC_KEY',
        message: 'The specified Sync Key does not exist.',
      },
      403
    );
  }

  c.set('userId', user.userId);
  c.set('syncKey', syncKey.toUpperCase());
  await next();
});

/**
 * POST /api/sync/push
 * Batch push mutations with Last-Write-Wins (LWW) conflict resolution.
 */
syncRouter.post('/push', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json<SyncPushRequest>().catch(() => null);

  if (!body || !body.mutations) {
    return c.json({ error: 'BAD_REQUEST', message: 'Missing mutations payload.' }, 400);
  }

  const now = Date.now();
  const applied = await applyLwwMutations(c.env.DB, userId, body.mutations);

  // Update device presence if provided
  if (body.device_id) {
    await c.env.DB.prepare('UPDATE devices SET last_seen_at = ? WHERE id = ? AND user_id = ?')
      .bind(now, body.device_id, userId)
      .run();
  }

  const response: SyncPushResponse = {
    success: true,
    server_time: now,
    applied,
  };
  return c.json(response);
});

/**
 * GET /api/sync/pull
 * Delta sync pull: retrieves all changes since timestamp.
 */
syncRouter.get('/pull', async (c) => {
  const userId = c.get('userId');
  const sinceParam = c.req.query('since');
  const since = sinceParam ? parseInt(sinceParam, 10) : 0;
  const validSince = isNaN(since) || since < 0 ? 0 : since;

  const now = Date.now();
  const changes = await pullChangesSince(c.env.DB, userId, validSince);

  const response: SyncPullResponse = {
    server_time: now,
    changes,
  };
  return c.json(response);
});
