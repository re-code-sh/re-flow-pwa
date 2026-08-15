// ReFlow TypeScript Data Models mirroring Flutter models.dart & database.dart

export type TaskStatus = 'pending' | 'completed';
export type ThoughtCategoryType = 'idea' | 'worry' | 'side_task';
export type InterruptTagType = 'phone' | 'people' | 'tired' | 'thought' | 'other';
export type HabitLogStatus = 'done' | 'slip' | 'resisted';

export interface Task {
  id: string;
  title: string;
  notes: string;
  is_boulder: boolean;
  status: TaskStatus;
  scheduled_date: string | null; // dayKey e.g. '2026-08-16' or null (backlog)
  reminder_time: number | null; // minutes since midnight
  active_order: number;
  created_at: number; // ms timestamp
  updated_at: number; // ms timestamp
  deleted_at: number | null; // ms timestamp or null
}

export interface DayPlan {
  day_key: string; // primary key
  planned: boolean;
  boulder_id: string | null;
  prediction: number | null; // 0..100 %
  closed_at: number | null;
  outcome: boolean | null;
  whys: string[]; // 3-level why root causes
  note: string; // one-line night note
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface Thought {
  id: string;
  text: string;
  category: ThoughtCategoryType;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface FocusSession {
  id: string;
  task_id: string | null;
  duration_seconds: number;
  completed_at: number | null;
  day_key: string;
  title: string;
  planned_min: number;
  started_at: number;
  ended_at: number | null;
  completed: boolean;
  interrupt_note: string | null;
  interrupt_tag: InterruptTagType | null;
  kind: 'task' | 'fun';
  created_at: number;
  updated_at: number;
}

export interface Habit {
  id: string;
  title: string;
  cue: string; // Anchor cue
  created: string; // dayKey
  frequency: string; // 'daily'
  recovery_count: number;
  is_bad: boolean;
  bad_cost: string;
  replacement: string;
  reminder_minutes: number | null;
  sort: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface HabitLog {
  habit_id: string;
  day_key: string;
  status: HabitLogStatus;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface Leisure {
  id: string;
  title: string;
  duration_minutes: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface EnergyCheck {
  id: string;
  day_key: string;
  hour: number;
  level: number;
  created_at: number;
  updated_at: number;
}

export interface Setting {
  k: string; // key
  v: string; // json or string
  updated_at: number;
}

export interface SyncMeta {
  key: string; // 'last_synced_at' | 'sync_key' | 'device_id' | etc.
  value: string;
}
