/**
 * Database Schema and Domain Interfaces
 * Strict 1:1 mapping with Flutter SQLite Database Schema & Models
 */

export interface TaskRecord {
  id: string;
  title: string;
  notes: string;
  is_boulder: number; // 0 | 1
  status: 'pending' | 'completed';
  scheduled_date: string | null; // 'YYYY-MM-DD'
  reminder_time: number | null; // minutes since midnight
  active_order: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface DayRecord {
  day_key: string; // 'YYYY-MM-DD' primary key
  planned: number; // 0 | 1
  boulder_id: string | null;
  prediction: number | null; // percentage 0-100
  closed_at: number | null;
  outcome: number | null; // 0 | 1
  whys: string; // JSON string array of reasons
  note: string;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export type ThoughtCategoryType = 'idea' | 'worry' | 'side_task';

export interface ThoughtRecord {
  id: string;
  text: string;
  category: ThoughtCategoryType;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface HabitRecord {
  id: string;
  title: string;
  cue: string;
  created: string; // day_key
  frequency: string; // 'daily'
  recovery_count: number;
  is_bad: number; // 0 | 1
  bad_cost: string;
  replacement: string;
  reminder_minutes: number | null;
  sort: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface HabitLogRecord {
  id: string; // `${habit_id}#${day_key}`
  habit_id: string;
  day_key: string;
  status: 'done' | 'slip' | 'resisted';
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface LeisureRecord {
  id: string;
  title: string;
  duration_minutes: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export type InterruptTagType = 'phone' | 'people' | 'tired' | 'thought' | 'other';

export interface FocusSessionRecord {
  id: string;
  task_id: string | null;
  duration_seconds: number;
  completed_at: number | null;
  day_key: string;
  title: string;
  planned_min: number;
  started_at: number;
  ended_at: number | null;
  completed: number; // 0 | 1
  interrupt_note: string | null;
  interrupt_tag: InterruptTagType | string | null;
  kind: 'task' | 'fun';
  created_at: number;
  updated_at: number;
}

export interface EnergyCheckRecord {
  id: string;
  day_key: string;
  hour: number;
  level: number;
  created_at: number;
  updated_at: number;
}

export interface SettingRecord {
  k: string;
  v: string;
  updated_at: number;
}

// Domain Model Types for UI consumption
export interface BacklogItem {
  id: string;
  title: string;
  notes: string;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface DayTask {
  taskId: string;
  title: string;
  done: boolean;
  sort: number;
  notes: string;
  isBoulder: boolean;
  reminderTime: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface DayPlan {
  dayKey: string;
  planned: boolean;
  boulderId: string | null;
  prediction: number | null;
  tasks: DayTask[];
  closed: boolean;
  outcome: boolean | null;
  whys: string[];
  note: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  boulder: DayTask | null;
  others: DayTask[];
  boulderDone: boolean;
}

export interface HabitWithLogs extends HabitRecord {
  logs: Record<string, string>; // dayKey -> 'done' | 'slip' | 'resisted'
}

export interface FunConfig {
  title: string;
  minutes: number;
}

export interface NightRow {
  dayKey: string;
  prediction: number;
  outcome: boolean;
}

export interface StatsData {
  closedCount: number;
  winRate: number | null;
  avgPrediction: number | null;
  gap: number | null;
  recoveryRate: number | null;
  lastNights: NightRow[];
  focusMinutesLast7: number[];
  recentInterrupts: string[];
  interruptCounts: Record<string, number>;
  goldenHour: number | null;
  reviewDue: boolean;
  focusMinutesWeek: number;
  optimismReliable: boolean;
}
