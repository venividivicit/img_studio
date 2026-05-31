CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  original_filename TEXT NOT NULL,
  original_mime TEXT NOT NULL,
  original_bytes INTEGER NOT NULL,
  original_r2_key TEXT,
  processed_r2_key TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_jobs_session_created
  ON jobs(session_id, created_at DESC);