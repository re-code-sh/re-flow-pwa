import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';
import type { SyncMutations, SyncPullResponse } from '../types';

const SYNC_KEY_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/** Generates a 6-character clean pairing code (e.g. 7K9M2P) */
export function generateSyncKey(): string {
  let key = '';
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * SYNC_KEY_CHARS.length);
    key += SYNC_KEY_CHARS[idx];
  }
  return key;
}

/** Resolves or verifies a user by sync key */
export async function resolveUserBySyncKey(
  db: D1Database,
  syncKey: string
): Promise<{ userId: string; createdAt: number } | null> {
  const normalizedKey = syncKey.trim().toUpperCase();
  const row = await db
    .prepare('SELECT id, created_at FROM users WHERE sync_key = ?')
    .bind(normalizedKey)
    .first<{ id: string; created_at: number }>();

  if (!row) return null;

  // Update last active
  await db
    .prepare('UPDATE users SET last_active_at = ? WHERE id = ?')
    .bind(Date.now(), row.id)
    .run();

  return { userId: row.id, createdAt: row.created_at };
}

/** Last-Write-Wins (LWW) Batch Mutation Engine */
export async function applyLwwMutations(
  db: D1Database,
  userId: string,
  mutations: SyncMutations
): Promise<Record<string, number>> {
  const statements: D1PreparedStatement[] = [];
  const appliedCounts: Record<string, number> = {
    tasks: 0,
    days: 0,
    thoughts: 0,
    habits: 0,
    habit_logs: 0,
    leisure: 0,
    focus_sessions: 0,
    energy_checks: 0,
    settings: 0,
  };

  // 1. Tasks
  if (mutations.tasks && mutations.tasks.length > 0) {
    for (const t of mutations.tasks) {
      statements.push(
        db
          .prepare(
            `INSERT INTO tasks (
              user_id, id, title, notes, is_boulder, status, scheduled_date,
              reminder_time, active_order, created_at, updated_at, deleted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (user_id, id) DO UPDATE SET
              title = excluded.title,
              notes = excluded.notes,
              is_boulder = excluded.is_boulder,
              status = excluded.status,
              scheduled_date = excluded.scheduled_date,
              reminder_time = excluded.reminder_time,
              active_order = excluded.active_order,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at
            WHERE excluded.updated_at >= tasks.updated_at`
          )
          .bind(
            userId,
            t.id,
            t.title,
            t.notes ?? '',
            t.is_boulder ? 1 : 0,
            t.status ?? 'pending',
            t.scheduled_date ?? null,
            t.reminder_time ?? null,
            t.active_order ?? 0,
            t.created_at,
            t.updated_at,
            t.deleted_at ?? null
          )
      );
      appliedCounts.tasks++;
    }
  }

  // 2. Days
  if (mutations.days && mutations.days.length > 0) {
    for (const d of mutations.days) {
      const whysStr = typeof d.whys === 'string' ? d.whys : JSON.stringify(d.whys ?? []);
      statements.push(
        db
          .prepare(
            `INSERT INTO days (
              user_id, day_key, planned, boulder_id, prediction, closed_at,
              outcome, whys, note, created_at, updated_at, deleted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (user_id, day_key) DO UPDATE SET
              planned = excluded.planned,
              boulder_id = excluded.boulder_id,
              prediction = excluded.prediction,
              closed_at = excluded.closed_at,
              outcome = excluded.outcome,
              whys = excluded.whys,
              note = excluded.note,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at
            WHERE excluded.updated_at >= days.updated_at`
          )
          .bind(
            userId,
            d.day_key,
            d.planned ? 1 : 0,
            d.boulder_id ?? null,
            d.prediction ?? null,
            d.closed_at ?? null,
            d.outcome === null || d.outcome === undefined ? null : d.outcome ? 1 : 0,
            whysStr,
            d.note ?? '',
            d.created_at ?? 0,
            d.updated_at ?? 0,
            d.deleted_at ?? null
          )
      );
      appliedCounts.days++;
    }
  }

  // 3. Thoughts
  if (mutations.thoughts && mutations.thoughts.length > 0) {
    for (const th of mutations.thoughts) {
      statements.push(
        db
          .prepare(
            `INSERT INTO thoughts (
              user_id, id, text, category, created_at, updated_at, deleted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (user_id, id) DO UPDATE SET
              text = excluded.text,
              category = excluded.category,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at
            WHERE excluded.updated_at >= thoughts.updated_at`
          )
          .bind(
            userId,
            th.id,
            th.text,
            th.category,
            th.created_at,
            th.updated_at ?? th.created_at,
            th.deleted_at ?? null
          )
      );
      appliedCounts.thoughts++;
    }
  }

  // 4. Habits
  if (mutations.habits && mutations.habits.length > 0) {
    for (const h of mutations.habits) {
      statements.push(
        db
          .prepare(
            `INSERT INTO habits (
              user_id, id, title, cue, created, frequency, recovery_count,
              is_bad, bad_cost, replacement, reminder_minutes, sort,
              created_at, updated_at, deleted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (user_id, id) DO UPDATE SET
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
              deleted_at = excluded.deleted_at
            WHERE excluded.updated_at >= habits.updated_at`
          )
          .bind(
            userId,
            h.id,
            h.title,
            h.cue ?? '',
            h.created,
            h.frequency ?? 'daily',
            h.recovery_count ?? 0,
            h.is_bad ? 1 : 0,
            h.bad_cost ?? '',
            h.replacement ?? '',
            h.reminder_minutes ?? null,
            h.sort ?? 0,
            h.created_at ?? 0,
            h.updated_at ?? 0,
            h.deleted_at ?? null
          )
      );
      appliedCounts.habits++;
    }
  }

  // 5. Habit Logs
  if (mutations.habit_logs && mutations.habit_logs.length > 0) {
    for (const hl of mutations.habit_logs) {
      statements.push(
        db
          .prepare(
            `INSERT INTO habit_logs (
              user_id, habit_id, day_key, status, created_at, updated_at, deleted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (user_id, habit_id, day_key) DO UPDATE SET
              status = excluded.status,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at
            WHERE excluded.updated_at >= habit_logs.updated_at`
          )
          .bind(
            userId,
            hl.habit_id,
            hl.day_key,
            hl.status,
            hl.created_at ?? 0,
            hl.updated_at ?? 0,
            hl.deleted_at ?? null
          )
      );
      appliedCounts.habit_logs++;
    }
  }

  // 6. Leisure
  if (mutations.leisure && mutations.leisure.length > 0) {
    for (const l of mutations.leisure) {
      statements.push(
        db
          .prepare(
            `INSERT INTO leisure (
              user_id, id, title, duration_minutes, created_at, updated_at, deleted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (user_id, id) DO UPDATE SET
              title = excluded.title,
              duration_minutes = excluded.duration_minutes,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at
            WHERE excluded.updated_at >= leisure.updated_at`
          )
          .bind(
            userId,
            l.id,
            l.title,
            l.duration_minutes ?? 30,
            l.created_at,
            l.updated_at,
            l.deleted_at ?? null
          )
      );
      appliedCounts.leisure++;
    }
  }

  // 7. Focus Sessions
  if (mutations.focus_sessions && mutations.focus_sessions.length > 0) {
    for (const fs of mutations.focus_sessions) {
      statements.push(
        db
          .prepare(
            `INSERT INTO focus_sessions (
              user_id, id, task_id, duration_seconds, completed_at, day_key,
              title, planned_min, started_at, ended_at, completed,
              interrupt_note, interrupt_tag, kind, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (user_id, id) DO UPDATE SET
              task_id = excluded.task_id,
              duration_seconds = excluded.duration_seconds,
              completed_at = excluded.completed_at,
              title = excluded.title,
              planned_min = excluded.planned_min,
              started_at = excluded.started_at,
              ended_at = excluded.ended_at,
              completed = excluded.completed,
              interrupt_note = excluded.interrupt_note,
              interrupt_tag = excluded.interrupt_tag,
              kind = excluded.kind,
              updated_at = excluded.updated_at
            WHERE excluded.updated_at >= focus_sessions.updated_at`
          )
          .bind(
            userId,
            fs.id,
            fs.task_id ?? null,
            fs.duration_seconds ?? 0,
            fs.completed_at ?? null,
            fs.day_key,
            fs.title,
            fs.planned_min,
            fs.started_at,
            fs.ended_at ?? null,
            fs.completed ? 1 : 0,
            fs.interrupt_note ?? null,
            fs.interrupt_tag ?? null,
            fs.kind ?? 'task',
            fs.created_at ?? 0,
            fs.updated_at ?? 0
          )
      );
      appliedCounts.focus_sessions++;
    }
  }

  // 8. Settings
  if (mutations.settings && mutations.settings.length > 0) {
    for (const s of mutations.settings) {
      statements.push(
        db
          .prepare(
            `INSERT INTO settings (user_id, k, v, updated_at) VALUES (?, ?, ?, ?)
            ON CONFLICT (user_id, k) DO UPDATE SET
              v = excluded.v,
              updated_at = excluded.updated_at
            WHERE excluded.updated_at >= settings.updated_at`
          )
          .bind(userId, s.k, s.v, s.updated_at ?? Date.now())
      );
      appliedCounts.settings++;
    }
  }

  // Execute in batches (Cloudflare D1 allows batch execution)
  if (statements.length > 0) {
    await db.batch(statements);
  }

  return appliedCounts;
}

/** Pulls all records mutated after the since timestamp */
export async function pullChangesSince(
  db: D1Database,
  userId: string,
  since: number
): Promise<SyncPullResponse['changes']> {
  const [
    tasksRes,
    daysRes,
    thoughtsRes,
    habitsRes,
    habitLogsRes,
    leisureRes,
    focusSessionsRes,
    energyChecksRes,
    settingsRes,
  ] = await Promise.all([
    db
      .prepare('SELECT * FROM tasks WHERE user_id = ? AND updated_at > ? ORDER BY updated_at ASC')
      .bind(userId, since)
      .all(),
    db
      .prepare('SELECT * FROM days WHERE user_id = ? AND updated_at > ? ORDER BY updated_at ASC')
      .bind(userId, since)
      .all(),
    db
      .prepare('SELECT * FROM thoughts WHERE user_id = ? AND updated_at > ? ORDER BY updated_at ASC')
      .bind(userId, since)
      .all(),
    db
      .prepare('SELECT * FROM habits WHERE user_id = ? AND updated_at > ? ORDER BY updated_at ASC')
      .bind(userId, since)
      .all(),
    db
      .prepare('SELECT * FROM habit_logs WHERE user_id = ? AND updated_at > ? ORDER BY updated_at ASC')
      .bind(userId, since)
      .all(),
    db
      .prepare('SELECT * FROM leisure WHERE user_id = ? AND updated_at > ? ORDER BY updated_at ASC')
      .bind(userId, since)
      .all(),
    db
      .prepare('SELECT * FROM focus_sessions WHERE user_id = ? AND updated_at > ? ORDER BY updated_at ASC')
      .bind(userId, since)
      .all(),
    db
      .prepare('SELECT * FROM energy_checks WHERE user_id = ? AND updated_at > ? ORDER BY updated_at ASC')
      .bind(userId, since)
      .all(),
    db
      .prepare('SELECT * FROM settings WHERE user_id = ? AND updated_at > ? ORDER BY updated_at ASC')
      .bind(userId, since)
      .all(),
  ]);

  return {
    tasks: tasksRes.results ?? [],
    days: daysRes.results ?? [],
    thoughts: thoughtsRes.results ?? [],
    habits: habitsRes.results ?? [],
    habit_logs: habitLogsRes.results ?? [],
    leisure: leisureRes.results ?? [],
    focus_sessions: focusSessionsRes.results ?? [],
    energy_checks: energyChecksRes.results ?? [],
    settings: settingsRes.results ?? [],
  };
}
