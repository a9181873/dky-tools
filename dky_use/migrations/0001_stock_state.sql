CREATE TABLE IF NOT EXISTS stock_state (
  state_key TEXT PRIMARY KEY,
  state_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL,
  checksum TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_state_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_key TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  checksum TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stock_state_events_state_created
ON stock_state_events (state_key, created_at);
