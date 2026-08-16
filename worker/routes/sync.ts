import { Hono } from 'hono';

export interface Env {
  DB?: D1Database;
  ASSETS?: Fetcher;
}

export const syncRouter = new Hono<{ Bindings: Env }>();

// Push delta/full backup to D1
syncRouter.post('/push', async (c) => {
  try {
    const { syncKey, backup } = await c.req.json();
    if (!syncKey || !backup || !backup.tables) {
      return c.json({ error: 'Invalid payload' }, 400);
    }

    const db = c.env.DB;
    if (!db) {
      return c.json({
        success: true,
        syncedAt: Date.now(),
        message: 'D1 not bound on Cloudflare; running in client-only local storage mode.',
      });
    }

    const now = Date.now();

    // Upsert sync client key
    await db
      .prepare(
        'INSERT INTO sync_clients (key, created_at, last_synced_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET last_synced_at = ?'
      )
      .bind(syncKey, now, now, now)
      .run();

    const tables = backup.tables;

    // Batch upsert tasks
    if (Array.isArray(tables.tasks)) {
      for (const t of tables.tasks) {
        await db
          .prepare(
            `INSERT INTO tasks (id, sync_key, title, notes, is_boulder, status, scheduled_date, reminder_time, active_order, created_at, updated_at, deleted_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               title = excluded.title,
               notes = excluded.notes,
               is_boulder = excluded.is_boulder,
               status = excluded.status,
               scheduled_date = excluded.scheduled_date,
               reminder_time = excluded.reminder_time,
               active_order = excluded.active_order,
               updated_at = excluded.updated_at,
               deleted_at = excluded.deleted_at`
          )
          .bind(
            t.id,
            syncKey,
            t.title,
            t.notes || null,
            t.is_boulder ? 1 : 0,
            t.status,
            t.scheduled_date || null,
            t.reminder_time || null,
            t.active_order || 0,
            t.created_at,
            t.updated_at,
            t.deleted_at || null
          )
          .run();
      }
    }

    // Batch upsert habits
    if (Array.isArray(tables.habits)) {
      for (const h of tables.habits) {
        await db
          .prepare(
            `INSERT INTO habits (id, sync_key, title, cue, created, frequency, recovery_count, is_bad, bad_cost, replacement, reminder_minutes, sort, created_at, updated_at, deleted_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               title = excluded.title,
               cue = excluded.cue,
               frequency = excluded.frequency,
               recovery_count = excluded.recovery_count,
               is_bad = excluded.is_bad,
               bad_cost = excluded.bad_cost,
               replacement = excluded.replacement,
               reminder_minutes = excluded.reminder_minutes,
               sort = excluded.sort,
               updated_at = excluded.updated_at,
               deleted_at = excluded.deleted_at`
          )
          .bind(
            h.id,
            syncKey,
            h.title,
            h.cue,
            h.created,
            h.frequency || 'daily',
            h.recovery_count || 0,
            h.is_bad ? 1 : 0,
            h.bad_cost || '',
            h.replacement || '',
            h.reminder_minutes || null,
            h.sort || 0,
            h.created_at,
            h.updated_at,
            h.deleted_at || null
          )
          .run();
      }
    }

    return c.json({ success: true, syncedAt: now });
  } catch (err: any) {
    return c.json({ error: err.message || 'Sync failed' }, 500);
  }
});

// Pull full state or delta for sync key
syncRouter.get('/pull', async (c) => {
  try {
    const syncKey = c.req.query('syncKey');
    if (!syncKey) {
      return c.json({ error: 'syncKey required' }, 400);
    }

    const db = c.env.DB;
    if (!db) {
      return c.json({
        success: true,
        tables: { tasks: [], habits: [], days: [], thoughts: [] },
      });
    }

    const tasks = await db.prepare('SELECT * FROM tasks WHERE sync_key = ?').bind(syncKey).all();
    const habits = await db.prepare('SELECT * FROM habits WHERE sync_key = ?').bind(syncKey).all();
    const days = await db.prepare('SELECT * FROM days WHERE sync_key = ?').bind(syncKey).all();
    const thoughts = await db.prepare('SELECT * FROM thoughts WHERE sync_key = ?').bind(syncKey).all();

    return c.json({
      success: true,
      tables: {
        tasks: tasks.results || [],
        habits: habits.results || [],
        days: days.results || [],
        thoughts: thoughts.results || [],
      },
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Pull failed' }, 500);
  }
});
