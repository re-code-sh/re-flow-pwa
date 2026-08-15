import Dexie, { type EntityTable } from 'dexie';
import type {
  Task,
  DayPlan,
  Thought,
  FocusSession,
  Habit,
  HabitLog,
  Leisure,
  EnergyCheck,
  Setting,
  SyncMeta,
} from './schema';

export class ReFlowDatabase extends Dexie {
  tasks!: EntityTable<Task, 'id'>;
  days!: EntityTable<DayPlan, 'day_key'>;
  thoughts!: EntityTable<Thought, 'id'>;
  focus_sessions!: EntityTable<FocusSession, 'id'>;
  habits!: EntityTable<Habit, 'id'>;
  habit_logs!: EntityTable<HabitLog, 'habit_id'>;
  leisure!: EntityTable<Leisure, 'id'>;
  energy_checks!: EntityTable<EnergyCheck, 'id'>;
  settings!: EntityTable<Setting, 'k'>;
  sync_meta!: EntityTable<SyncMeta, 'key'>;

  constructor() {
    super('taknoghte_db');
    this.version(1).stores({
      tasks: '&id, scheduled_date, status, is_boulder, active_order, created_at, updated_at, deleted_at, [scheduled_date+deleted_at], [status+deleted_at]',
      days: '&day_key, planned, closed_at, created_at, updated_at, deleted_at',
      thoughts: '&id, category, created_at, updated_at, deleted_at',
      focus_sessions: '&id, task_id, day_key, completed_at, kind, started_at, created_at, updated_at',
      habits: '&id, frequency, sort, created_at, updated_at, deleted_at',
      habit_logs: '&[habit_id+day_key], habit_id, day_key, status, created_at, updated_at, deleted_at',
      leisure: '&id, created_at, updated_at, deleted_at',
      energy_checks: '&id, day_key, hour, created_at, updated_at',
      settings: '&k, updated_at',
      sync_meta: '&key',
    });
  }
}

export const db = new ReFlowDatabase();
