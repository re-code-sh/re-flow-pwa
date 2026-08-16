import Dexie, { type EntityTable } from 'dexie';
import {
  Task,
  DayPlan,
  Thought,
  FocusSession,
  Habit,
  HabitLog,
  Leisure,
  EnergyCheck
} from '../core/types';

export interface DbDay {
  day_key: string;
  planned: number;
  boulder_id: string | null;
  prediction: number | null;
  closed_at: number | null;
  outcome: number | null;
  whys: string; // JSON array string
  note: string;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface DbSetting {
  k: string;
  v: string;
  updated_at: number;
}

export class AppDatabase extends Dexie {
  tasks!: EntityTable<Task, 'id'>;
  days!: EntityTable<DbDay, 'day_key'>;
  thoughts!: EntityTable<Thought, 'id'>;
  focus_sessions!: EntityTable<FocusSession, 'id'>;
  habits!: EntityTable<Habit, 'id'>;
  habit_logs!: EntityTable<HabitLog, 'id'>;
  leisure!: EntityTable<Leisure, 'id'>;
  energy_checks!: EntityTable<EnergyCheck, 'id'>;
  settings!: EntityTable<DbSetting, 'k'>;

  constructor() {
    super('taknoghte_db');
    this.version(1).stores({
      tasks: 'id, scheduled_date, status, is_boulder, active_order, created_at, updated_at, deleted_at',
      days: 'day_key, planned, boulder_id, closed_at, outcome, created_at, updated_at, deleted_at',
      thoughts: 'id, category, created_at, updated_at, deleted_at',
      focus_sessions: 'id, task_id, day_key, started_at, ended_at, completed, kind, created_at, updated_at',
      habits: 'id, created, is_bad, sort, created_at, updated_at, deleted_at',
      habit_logs: 'id, habit_id, day_key, status, created_at, updated_at, deleted_at',
      leisure: 'id, created_at, updated_at, deleted_at',
      energy_checks: 'id, day_key, hour, created_at, updated_at',
      settings: 'k, updated_at',
    });
  }
}

export const db = new AppDatabase();
