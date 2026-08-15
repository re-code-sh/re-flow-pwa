import { Hono } from 'hono';
import type { Bindings, Variables, PairRequest, PairResponse } from '../types';
import { generateSyncKey, resolveUserBySyncKey } from '../services/sync-engine';

export const authRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/**
 * POST /api/auth/pair
 * Generates a 6-character sync key for a new device cluster or pairs an existing one.
 */
authRouter.post('/pair', async (c) => {
  const body = (await c.req.json<PairRequest>().catch(() => ({}))) as PairRequest;
  const db = c.env.DB;
  const now = Date.now();

  const requestedSyncKey = body.sync_key?.trim().toUpperCase();
  const deviceId = body.device_id?.trim() || crypto.randomUUID();
  const deviceName = body.device_name?.trim() || 'Web Browser';

  // Case 1: Pairing with an existing Sync Key
  if (requestedSyncKey) {
    const existing = await resolveUserBySyncKey(db, requestedSyncKey);
    if (!existing) {
      return c.json(
        {
          error: 'INVALID_SYNC_KEY',
          message: 'The provided 6-character Sync Key was not found.',
        },
        404
      );
    }

    // Register/update device
    await db
      .prepare(
        `INSERT INTO devices (id, user_id, device_name, last_seen_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET
           device_name = excluded.device_name,
           last_seen_at = excluded.last_seen_at`
      )
      .bind(deviceId, existing.userId, deviceName, now)
      .run();

    const response: PairResponse = {
      user_id: existing.userId,
      sync_key: requestedSyncKey,
      status: 'paired',
      device_id: deviceId,
      server_time: now,
    };
    return c.json(response);
  }

  // Case 2: Create a new cluster with a fresh 6-character key
  let newKey = generateSyncKey();
  let keyAttempts = 0;

  // Collision safety retry
  while (keyAttempts < 5) {
    const exists = await db
      .prepare('SELECT id FROM users WHERE sync_key = ?')
      .bind(newKey)
      .first();
    if (!exists) break;
    newKey = generateSyncKey();
    keyAttempts++;
  }

  const userId = crypto.randomUUID();

  // Create User
  await db
    .prepare('INSERT INTO users (id, sync_key, created_at, last_active_at) VALUES (?, ?, ?, ?)')
    .bind(userId, newKey, now, now)
    .run();

  // Create Device
  await db
    .prepare('INSERT INTO devices (id, user_id, device_name, last_seen_at) VALUES (?, ?, ?, ?)')
    .bind(deviceId, userId, deviceName, now)
    .run();

  const response: PairResponse = {
    user_id: userId,
    sync_key: newKey,
    status: 'created',
    device_id: deviceId,
    server_time: now,
  };
  return c.json(response, 201);
});
