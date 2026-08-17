import { Hono } from 'hono';

export interface Env {
  DB?: D1Database;
  ASSETS?: Fetcher;
}

export const syncRouter = new Hono<{ Bindings: Env }>();

// Push full backup / delta to Cloudflare D1
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

    // 1. Tasks
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

    // 2. Days
    if (Array.isArray(tables.days)) {
      for (const d of tables.days) {
        await db
          .prepare(
            `INSERT INTO days (day_key, sync_key, planned, boulder_id, prediction, closed_at, outcome, whys, note, created_at, updated_at, deleted_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(day_key, sync_key) DO UPDATE SET
               planned = excluded.planned,
               boulder_id = excluded.boulder_id,
               prediction = excluded.prediction,
               closed_at = excluded.closed_at,
               outcome = excluded.outcome,
               whys = excluded.whys,
               note = excluded.note,
               updated_at = excluded.updated_at,
               deleted_at = excluded.deleted_at`
          )
          .bind(
            d.day_key,
            syncKey,
            d.planned ? 1 : 0,
            d.boulder_id || null,
            d.prediction || null,
            d.closed_at || null,
            d.outcome || null,
            d.whys || '[]',
            d.note || '',
            d.created_at,
            d.updated_at,
            d.deleted_at || null
          )
          .run();
      }
    }

    // 3. Thoughts
    if (Array.isArray(tables.thoughts)) {
      for (const th of tables.thoughts) {
        await db
          .prepare(
            `INSERT INTO thoughts (id, sync_key, text, category, created_at, updated_at, deleted_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               text = excluded.text,
               category = excluded.category,
               updated_at = excluded.updated_at,
               deleted_at = excluded.deleted_at`
          )
          .bind(
            th.id,
            syncKey,
            th.text,
            th.category,
            th.created_at,
            th.updated_at,
            th.deleted_at || null
          )
          .run();
      }
    }

    // 4. Habits
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

    // 5. Habit Logs
    if (Array.isArray(tables.habit_logs)) {
      for (const hl of tables.habit_logs) {
        await db
          .prepare(
            `INSERT INTO habit_logs (habit_id, day_key, sync_key, status, created_at, updated_at, deleted_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(habit_id, day_key, sync_key) DO UPDATE SET
               status = excluded.status,
               updated_at = excluded.updated_at,
               deleted_at = excluded.deleted_at`
          )
          .bind(
            hl.habit_id,
            hl.day_key,
            syncKey,
            hl.status,
            hl.created_at,
            hl.updated_at,
            hl.deleted_at || null
          )
          .run();
      }
    }

    // 6. Leisure
    if (Array.isArray(tables.leisure)) {
      for (const l of tables.leisure) {
        await db
          .prepare(
            `INSERT INTO leisure (id, sync_key, title, duration_minutes, created_at, updated_at, deleted_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               title = excluded.title,
               duration_minutes = excluded.duration_minutes,
               updated_at = excluded.updated_at,
               deleted_at = excluded.deleted_at`
          )
          .bind(
            l.id,
            syncKey,
            l.title,
            l.duration_minutes || 30,
            l.created_at,
            l.updated_at,
            l.deleted_at || null
          )
          .run();
      }
    }

    // 7. Focus Sessions
    if (Array.isArray(tables.focus_sessions)) {
      for (const fs of tables.focus_sessions) {
        await db
          .prepare(
            `INSERT INTO focus_sessions (id, sync_key, task_id, duration_seconds, completed_at, day_key, title, planned_min, started_at, ended_at, completed, interrupt_note, interrupt_tag, kind, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               task_id = excluded.task_id,
               duration_seconds = excluded.duration_seconds,
               completed_at = excluded.completed_at,
               day_key = excluded.day_key,
               title = excluded.title,
               planned_min = excluded.planned_min,
               started_at = excluded.started_at,
               ended_at = excluded.ended_at,
               completed = excluded.completed,
               interrupt_note = excluded.interrupt_note,
               interrupt_tag = excluded.interrupt_tag,
               kind = excluded.kind,
               updated_at = excluded.updated_at`
          )
          .bind(
            fs.id,
            syncKey,
            fs.task_id || null,
            fs.duration_seconds || 0,
            fs.completed_at || null,
            fs.day_key,
            fs.title,
            fs.planned_min || 25,
            fs.started_at,
            fs.ended_at || null,
            fs.completed ? 1 : 0,
            fs.interrupt_note || null,
            fs.interrupt_tag || null,
            fs.kind || 'task',
            fs.created_at,
            fs.updated_at
          )
          .run();
      }
    }

    // 8. Energy Checks
    if (Array.isArray(tables.energy_checks)) {
      for (const ec of tables.energy_checks) {
        await db
          .prepare(
            `INSERT INTO energy_checks (id, sync_key, day_key, hour, level, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               day_key = excluded.day_key,
               hour = excluded.hour,
               level = excluded.level,
               updated_at = excluded.updated_at`
          )
          .bind(
            ec.id,
            syncKey,
            ec.day_key,
            ec.hour,
            ec.level,
            ec.created_at,
            ec.updated_at
          )
          .run();
      }
    }

    // 9. Settings
    if (Array.isArray(tables.settings)) {
      for (const s of tables.settings) {
        await db
          .prepare(
            `INSERT INTO settings (k, sync_key, v, updated_at)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(k, sync_key) DO UPDATE SET
               v = excluded.v,
               updated_at = excluded.updated_at`
          )
          .bind(s.k, syncKey, s.v, s.updated_at)
          .run();
      }
    }

    return c.json({ success: true, syncedAt: now });
  } catch (err: any) {
    return c.json({ error: err.message || 'Sync failed' }, 500);
  }
});

// Pull full state from D1
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
        tables: {
          tasks: [],
          habits: [],
          days: [],
          thoughts: [],
          habit_logs: [],
          leisure: [],
          focus_sessions: [],
          energy_checks: [],
          settings: [],
        },
      });
    }

    const tasks = await db.prepare('SELECT * FROM tasks WHERE sync_key = ?').bind(syncKey).all();
    const habits = await db.prepare('SELECT * FROM habits WHERE sync_key = ?').bind(syncKey).all();
    const days = await db.prepare('SELECT * FROM days WHERE sync_key = ?').bind(syncKey).all();
    const thoughts = await db.prepare('SELECT * FROM thoughts WHERE sync_key = ?').bind(syncKey).all();
    const habit_logs = await db.prepare('SELECT * FROM habit_logs WHERE sync_key = ?').bind(syncKey).all();
    const leisure = await db.prepare('SELECT * FROM leisure WHERE sync_key = ?').bind(syncKey).all();
    const focus_sessions = await db.prepare('SELECT * FROM focus_sessions WHERE sync_key = ?').bind(syncKey).all();
    const energy_checks = await db.prepare('SELECT * FROM energy_checks WHERE sync_key = ?').bind(syncKey).all();
    const settings = await db.prepare('SELECT * FROM settings WHERE sync_key = ?').bind(syncKey).all();

    return c.json({
      success: true,
      tables: {
        tasks: tasks.results || [],
        habits: habits.results || [],
        days: days.results || [],
        thoughts: thoughts.results || [],
        habit_logs: habit_logs.results || [],
        leisure: leisure.results || [],
        focus_sessions: focus_sessions.results || [],
        energy_checks: energy_checks.results || [],
        settings: settings.results || [],
      },
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Pull failed' }, 500);
  }
});
