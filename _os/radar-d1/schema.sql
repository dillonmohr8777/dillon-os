-- Prospect Radar D1 schema
-- Read-only backend for the Worker at worker.js. Applied via wrangler d1 execute
-- or via the Cloudflare MCP d1_database_query tool.

CREATE TABLE IF NOT EXISTS prospects (
  slug          TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  vertical      TEXT NOT NULL,
  city          TEXT,
  url           TEXT,
  score         INTEGER NOT NULL DEFAULT 0,
  worst_fault   TEXT,
  tracked_since TEXT,
  last_audit    TEXT
);

CREATE INDEX IF NOT EXISTS idx_prospects_vertical ON prospects (vertical);
CREATE INDEX IF NOT EXISTS idx_prospects_score ON prospects (score);

CREATE TABLE IF NOT EXISTS audits (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL REFERENCES prospects(slug),
  audited_at  TEXT NOT NULL,
  score       INTEGER NOT NULL,
  faults_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_audits_slug ON audits (slug);

CREATE TABLE IF NOT EXISTS builds (
  slug         TEXT PRIMARY KEY REFERENCES prospects(slug),
  status       TEXT NOT NULL DEFAULT 'queued',
  preview_url  TEXT,
  deployed_at  TEXT
);
