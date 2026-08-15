-- Cloudflare D1 SQLite Database Schema for re.flow Sync Engine

-- 1. Users & Devices
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  sync_key TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL,
  last_active_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_sync_key ON users(sync_key);

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_name TEXT,
  last_seen_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_devices_user ON devices(user_id);

-- 2. Tasks Domain
CREATE TABLE IF NOT EXISTS tasks (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  is_boulder INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_date TEXT,
  reminder_time INTEGER,
  active_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_sync ON tasks(user_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled ON tasks(user_id, scheduled_date);

-- 3. Days Domain
CREATE TABLE IF NOT EXISTS days (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_key TEXT NOT NULL,
  planned INTEGER NOT NULL DEFAULT 0,
  boulder_id TEXT,
  prediction INTEGER,
  closed_at INTEGER,
  outcome INTEGER,
  whys TEXT NOT NULL DEFAULT '[]',
  note TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER,
  PRIMARY KEY (user_id, day_key)
);

CREATE INDEX IF NOT EXISTS idx_days_sync ON days(user_id, updated_at);

-- 4. Thoughts (Brain Vault)
CREATE TABLE IF NOT EXISTS thoughts (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER,
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_thoughts_sync ON thoughts(user_id, updated_at);

-- 5. Habits & Habit Logs
CREATE TABLE IF NOT EXISTS habits (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  title TEXT NOT NULL,
  cue TEXT NOT NULL DEFAULT '',
  created TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily',
  recovery_count INTEGER NOT NULL DEFAULT 0,
  is_bad INTEGER NOT NULL DEFAULT 0,
  bad_cost TEXT NOT NULL DEFAULT '',
  replacement TEXT NOT NULL DEFAULT '',
  reminder_minutes INTEGER,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER,
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_habits_sync ON habits(user_id, updated_at);

CREATE TABLE IF NOT EXISTS habit_logs (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  habit_id TEXT NOT NULL,
  day_key TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER,
  PRIMARY KEY (user_id, habit_id, day_key)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_sync ON habit_logs(user_id, updated_at);

-- 6. Leisure (Guilt-Free Play)
CREATE TABLE IF NOT EXISTS leisure (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_leisure_sync ON leisure(user_id, updated_at);

-- 7. Focus Sessions
CREATE TABLE IF NOT EXISTS focus_sessions (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
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
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_sync ON focus_sessions(user_id, updated_at);

-- 8. Energy Checks
CREATE TABLE IF NOT EXISTS energy_checks (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  day_key TEXT NOT NULL,
  hour INTEGER NOT NULL,
  level INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_energy_checks_sync ON energy_checks(user_id, updated_at);

-- 9. Settings
CREATE TABLE IF NOT EXISTS settings (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  k TEXT NOT NULL,
  v TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, k)
);

CREATE INDEX IF NOT EXISTS idx_settings_sync ON settings(user_id, updated_at);
