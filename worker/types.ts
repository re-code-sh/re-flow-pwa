import type { D1Database, Fetcher } from '@cloudflare/workers-types';

export interface Bindings {
  DB: D1Database;
  ENVIRONMENT?: string;
  ASSETS?: Fetcher;
}

export interface Variables {
  userId: string;
  syncKey: string;
}

export interface PairRequest {
  sync_key?: string;
  device_id?: string;
  device_name?: string;
}

export interface PairResponse {
  user_id: string;
  sync_key: string;
  status: 'created' | 'paired';
  device_id: string;
  server_time: number;
}

export interface SyncMutations {
  tasks?: Array<{
    id: string;
    title: string;
    notes?: string;
    is_boulder?: boolean | number;
    status?: string;
    scheduled_date?: string | null;
    reminder_time?: number | null;
    active_order?: number;
    created_at: number;
    updated_at: number;
    deleted_at?: number | null;
  }>;
  days?: Array<{
    day_key: string;
    planned?: boolean | number;
    boulder_id?: string | null;
    prediction?: number | null;
    closed_at?: number | null;
    outcome?: boolean | number | null;
    whys?: string[] | string;
    note?: string;
    created_at?: number;
    updated_at?: number;
    deleted_at?: number | null;
  }>;
  thoughts?: Array<{
    id: string;
    text: string;
    category: string;
    created_at: number;
    updated_at?: number;
    deleted_at?: number | null;
  }>;
  habits?: Array<{
    id: string;
    title: string;
    cue?: string;
    created: string;
    frequency?: string;
    recovery_count?: number;
    is_bad?: boolean | number;
    bad_cost?: string;
    replacement?: string;
    reminder_minutes?: number | null;
    sort?: number;
    created_at?: number;
    updated_at?: number;
    deleted_at?: number | null;
  }>;
  habit_logs?: Array<{
    habit_id: string;
    day_key: string;
    status: string;
    created_at?: number;
    updated_at?: number;
    deleted_at?: number | null;
  }>;
  leisure?: Array<{
    id: string;
    title: string;
    duration_minutes?: number;
    created_at: number;
    updated_at: number;
    deleted_at?: number | null;
  }>;
  focus_sessions?: Array<{
    id: string;
    task_id?: string | null;
    duration_seconds?: number;
    completed_at?: number | null;
    day_key: string;
    title: string;
    planned_min: number;
    started_at: number;
    ended_at?: number | null;
    completed?: boolean | number;
    interrupt_note?: string | null;
    interrupt_tag?: string | null;
    kind?: string;
    created_at?: number;
    updated_at?: number;
  }>;
  energy_checks?: Array<{
    id: string;
    day_key: string;
    hour: number;
    level: number;
    created_at?: number;
    updated_at?: number;
  }>;
  settings?: Array<{
    k: string;
    v: string;
    updated_at?: number;
  }>;
}

export interface SyncPushRequest {
  sync_key?: string;
  device_id?: string;
  mutations: SyncMutations;
}

export interface SyncPushResponse {
  success: boolean;
  server_time: number;
  applied: Record<string, number>;
}

export interface SyncPullResponse {
  server_time: number;
  changes: {
    tasks: unknown[];
    days: unknown[];
    thoughts: unknown[];
    habits: unknown[];
    habit_logs: unknown[];
    leisure: unknown[];
    focus_sessions: unknown[];
    energy_checks: unknown[];
    settings: unknown[];
  };
}
