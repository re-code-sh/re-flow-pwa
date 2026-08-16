-- Cloudflare D1 SQLite Schema for Re-Flow / Taknoghte

CREATE TABLE IF NOT EXISTS sync_clients (
  key TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  last_synced_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  sync_key TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  is_boulder INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_date TEXT,
  reminder_time INTEGER,
  active_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE TABLE IF NOT EXISTS days (
  day_key TEXT NOT NULL,
  sync_key TEXT NOT NULL,
  planned INTEGER NOT NULL DEFAULT 0,
  boulder_id TEXT,
  prediction INTEGER,
  closed_at INTEGER,
  outcome INTEGER,
  whys TEXT,
  note TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  PRIMARY KEY (day_key, sync_key)
);

CREATE TABLE IF NOT EXISTS thoughts (
  id TEXT PRIMARY KEY,
  sync_key TEXT NOT NULL,
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY,
  sync_key TEXT NOT NULL,
  task_id TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at INTEGER,
  day_key TEXT NOT NULL,
  title TEXT NOT NULL,
  planned_min INTEGER NOT NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  completed INTEGER NOT NULL DEFAULT 0,
  interrupt_note TEXT,
  interrupt_tag TEXT,
  kind TEXT NOT NULL DEFAULT 'task',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  sync_key TEXT NOT NULL,
  title TEXT NOT NULL,
  cue TEXT NOT NULL,
  created TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily',
  recovery_count INTEGER NOT NULL DEFAULT 0,
  is_bad INTEGER NOT NULL DEFAULT 0,
  bad_cost TEXT,
  replacement TEXT,
  reminder_minutes INTEGER,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE TABLE IF NOT EXISTS habit_logs (
  habit_id TEXT NOT NULL,
  day_key TEXT NOT NULL,
  sync_key TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  PRIMARY KEY (habit_id, day_key, sync_key)
);

CREATE TABLE IF NOT EXISTS leisure (
  id TEXT PRIMARY KEY,
  sync_key TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE TABLE IF NOT EXISTS energy_checks (
  id TEXT PRIMARY KEY,
  sync_key TEXT NOT NULL,
  day_key TEXT NOT NULL,
  hour INTEGER NOT NULL,
  level INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  k TEXT NOT NULL,
  sync_key TEXT NOT NULL,
  v TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (k, sync_key)
);
