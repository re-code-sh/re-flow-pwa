import Dexie, { type Table } from 'dexie';
import type {
  TaskRecord,
  DayRecord,
  ThoughtRecord,
  HabitRecord,
  HabitLogRecord,
  LeisureRecord,
  FocusSessionRecord,
  EnergyCheckRecord,
  SettingRecord,
} from './schema';

export class ReFlowDB extends Dexie {
  tasks!: Table<TaskRecord, string>;
  days!: Table<DayRecord, string>;
  thoughts!: Table<ThoughtRecord, string>;
  habits!: Table<HabitRecord, string>;
  habit_logs!: Table<HabitLogRecord, string>;
  leisure!: Table<LeisureRecord, string>;
  focus_sessions!: Table<FocusSessionRecord, string>;
  energy_checks!: Table<EnergyCheckRecord, string>;
  settings!: Table<SettingRecord, string>;

  constructor() {
    super('re_flow_db');

    this.version(1).stores({
      tasks: 'id, status, scheduled_date, is_boulder, active_order, created_at, updated_at, deleted_at',
      days: 'day_key, planned, closed_at, created_at, updated_at, deleted_at',
      thoughts: 'id, category, created_at, updated_at, deleted_at',
      habits: 'id, created, sort, is_bad, created_at, updated_at, deleted_at',
      habit_logs: 'id, habit_id, day_key, status, created_at, updated_at, deleted_at, [habit_id+day_key]',
      leisure: 'id, created_at, updated_at, deleted_at',
      focus_sessions: 'id, task_id, day_key, kind, started_at, ended_at, created_at',
      energy_checks: 'id, day_key, hour, created_at',
      settings: 'k, updated_at',
    });
  }
}

export const db = new ReFlowDB();

/**
 * Seeds initial demo data if database is completely empty.
 */
export async function seedInitialDataIfNeeded() {
  const taskCount = await db.tasks.count();
  if (taskCount === 0) {
    const now = Date.now();

    // Seed default leisure
    const leisureCount = await db.leisure.count();
    if (leisureCount === 0) {
      await db.leisure.add({
        id: 'seed-leisure-1',
        title: 'تفریح بدون عذاب وجدان',
        duration_minutes: 30,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      });
    }

    // Seed default morning/evening reminder settings
    await db.settings.bulkPut([
      { k: 'morning_reminder', v: `${8 * 60 + 30}`, updated_at: now },
      { k: 'evening_reminder', v: `${21 * 60 + 30}`, updated_at: now },
    ]);
  }
}
