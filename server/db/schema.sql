-- جنون جنوبي — SQLite schema (applied idempotently at startup)

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS collections (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  tag         TEXT,
  description TEXT,
  image       TEXT,
  available   INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
  id            TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  price         INTEGER NOT NULL DEFAULT 0,
  image         TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_items_collection ON items(collection_id);

CREATE TABLE IF NOT EXISTS media (
  id         TEXT PRIMARY KEY,
  filename   TEXT NOT NULL,
  path       TEXT NOT NULL,
  mime       TEXT NOT NULL,
  size       INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
