export type AppLanguage = 'fa' | 'en';

export type AppAccentCode = 'ember' | 'pine' | 'indigo' | 'mulberry' | 'slate' | 'iris';

export interface AppAccent {
  code: AppAccentCode;
  color: string;
  nameEn: string;
  nameFa: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  is_boulder: boolean;
  status: 'pending' | 'completed';
  scheduled_date: string | null; // dayKey 'YYYY-MM-DD'
  reminder_time: number | null;  // minutes since midnight
  active_order: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface BacklogItem {
  id: string;
  title: string;
  notes?: string;
  created_at?: number;
  updated_at?: number;
  deleted_at?: number | null;
}

export interface DayTask {
  taskId: string;
  title: string;
  done: boolean;
  sort: number;
  notes?: string;
  isBoulder: boolean;
  reminderTime: number | null;
  createdAt?: number;
  updatedAt?: number;
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
  boulder: DayTask | null;
  others: DayTask[];
  boulderDone: boolean;
  createdAt?: number;
  updatedAt?: number;
  deletedAt?: number | null;
}

export type ThoughtCategory = 'idea' | 'worry' | 'side_task';

export interface Thought {
  id: string;
  text: string;
  category: ThoughtCategory;
  created_at: number;
  updated_at?: number;
  deleted_at?: number | null;
}

export interface Habit {
  id: string;
  title: string;
  cue: string;
  created: string; // dayKey
  frequency: string;
  recovery_count: number;
  is_bad: boolean;
  bad_cost: string;
  replacement: string;
  reminder_minutes: number | null;
  sort: number;
  logs?: Record<string, string>; // dayKey -> 'done' | 'slip' | 'resisted'
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface HabitLog {
  id?: string;
  habit_id: string;
  day_key: string;
  status: 'done' | 'slip' | 'resisted';
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

export interface FunConfig {
  title: string;
  minutes: number;
}

export type InterruptTag = 'phone' | 'people' | 'tired' | 'thought' | 'other';

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
  interrupt_tag: InterruptTag | null;
  kind: 'task' | 'fun';
  created_at: number;
  updated_at: number;
}

export interface ActiveFocus {
  sessionId: string;
  taskId: string | null;
  title: string;
  kind: 'task' | 'fun';
  totalSec: number;
  endAtMs: number;
  paused: boolean;
  pausedLeftSec: number;
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
  interruptCounts: Partial<Record<InterruptTag, number>>;
  goldenHour: number | null;
  reviewDue: boolean;
  focusMinutesWeek: number;
  optimismReliable: boolean;
}

export interface EnergyCheck {
  id: string;
  day_key: string;
  hour: number;
  level: number;
  created_at: number;
  updated_at: number;
}
