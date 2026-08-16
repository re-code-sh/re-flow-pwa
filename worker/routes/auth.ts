import { Hono } from 'hono';

export interface Env {
  DB: D1Database;
}

export const authRouter = new Hono<{ Bindings: Env }>();

// Generate or verify pairing key
authRouter.post('/pair', async (c) => {
  try {
    const { key } = await c.req.json();
    const db = c.env.DB;
    const now = Date.now();

    const finalKey = key || 'flw_' + Math.random().toString(36).substring(2, 12);

    await db
      .prepare(
        'INSERT INTO sync_clients (key, created_at, last_synced_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET last_synced_at = ?'
      )
      .bind(finalKey, now, now, now)
      .run();

    return c.json({
      success: true,
      key: finalKey,
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Pairing failed' }, 500);
  }
});
