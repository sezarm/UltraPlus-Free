CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT,
  display_name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  uuid_or_identifier TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER,
  quota_total INTEGER DEFAULT 0,
  quota_used INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 0,
  notes TEXT,
  metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
