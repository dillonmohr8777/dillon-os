-- radar-studio durable state. Single-writer: only the orchestrator process
-- opens this database; stage children emit JSON on stdout.

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS runs (
  run_id TEXT PRIMARY KEY,          -- e.g. 2026-08-11
  run_date TEXT NOT NULL,
  phase TEXT NOT NULL DEFAULT 'research',   -- research|awaiting_approval|building|composed|published|reported
  status TEXT NOT NULL DEFAULT 'active',    -- active|finished|abandoned
  repo_sha TEXT,
  engine_version TEXT,
  started_at INTEGER,
  finished_at INTEGER,
  notes TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_runs_active_date ON runs(run_date) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS prospects (
  run_id TEXT NOT NULL,
  prospect_id TEXT NOT NULL,        -- stable radar id or slug
  slug TEXT NOT NULL,
  business_name TEXT NOT NULL,
  city TEXT,
  vertical TEXT,
  radar_priority REAL,
  site_quality_score REAL,
  identity_status TEXT NOT NULL DEFAULT 'unresolved',  -- unresolved|resolved|ambiguous
  quarantine_reason TEXT,
  PRIMARY KEY (run_id, prospect_id)
);

CREATE TABLE IF NOT EXISTS stage_executions (
  id INTEGER PRIMARY KEY,
  run_id TEXT NOT NULL,
  prospect_id TEXT NOT NULL,        -- '' for run-level stages (hub, publish, report)
  stage TEXT NOT NULL,
  attempt INTEGER NOT NULL,
  input_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN
    ('PENDING','READY','RUNNING','SUCCEEDED','FAILED','CANCELLED','EXHAUSTED','QUARANTINED')),
  lease_id TEXT,
  heartbeat_at INTEGER,
  output_hash TEXT,
  output_manifest TEXT,             -- JSON [{path,sha256,bytes}]
  verifier TEXT,
  verifier_version TEXT,
  cache_hit INTEGER NOT NULL DEFAULT 0,
  failure_reason TEXT,
  cost_json TEXT,                   -- {tokens_in,tokens_out,usd,ms,images}
  started_at INTEGER,
  finished_at INTEGER,
  UNIQUE (run_id, prospect_id, stage, attempt)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_stage_memo
  ON stage_executions(prospect_id, stage, input_hash) WHERE status = 'SUCCEEDED';
CREATE INDEX IF NOT EXISTS ix_stage_run ON stage_executions(run_id, status);

CREATE TABLE IF NOT EXISTS llm_calls (
  cache_key TEXT PRIMARY KEY,
  request_manifest TEXT NOT NULL,   -- JSON {template_sha,inputs_hash,model,allowed_tools}
  response_artifact TEXT,           -- CAS path of raw response JSON
  cost_usd REAL,
  duration_ms INTEGER,
  session_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS budgets (
  run_id TEXT NOT NULL,
  resource TEXT NOT NULL,           -- llm_usd|images_count|wallclock_min
  cap REAL NOT NULL,
  spent REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (run_id, resource)
);

CREATE TABLE IF NOT EXISTS built_sites (
  prospect_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  deployed_url TEXT,
  built_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS repairs (
  id INTEGER PRIMARY KEY,
  run_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  attempt INTEGER NOT NULL,
  target_stage TEXT NOT NULL,
  patch_artifact TEXT NOT NULL,     -- CAS path
  rationale TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE (run_id, slug, attempt)
);

CREATE TABLE IF NOT EXISTS evidence (
  id INTEGER PRIMARY KEY,
  prospect_id TEXT NOT NULL,
  fact_key TEXT NOT NULL,
  fact_value TEXT NOT NULL,
  source_url TEXT NOT NULL,
  locator TEXT,
  retrieved_at INTEGER NOT NULL,
  content_sha TEXT,
  confidence REAL NOT NULL,
  public_copy_ok INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ix_evidence_prospect ON evidence(prospect_id, fact_key);

CREATE TABLE IF NOT EXISTS logos (
  prospect_id TEXT PRIMARY KEY,
  source_url TEXT,
  source_tier TEXT,                 -- A header-svg|B schema|C og|D social|E fallback-text
  file_path TEXT,
  sha256 TEXT,
  official INTEGER NOT NULL DEFAULT 0,
  sanitized INTEGER NOT NULL DEFAULT 0,
  confidence REAL,
  retrieved_at INTEGER
);

CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY,
  prospect_id TEXT NOT NULL,
  role TEXT NOT NULL,               -- hero16x11|hero9x16|macro|material|environment|logo
  prompt_hash TEXT,
  prompt TEXT,
  model TEXT,
  file_path TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  synthetic INTEGER NOT NULL DEFAULT 1,
  approved INTEGER NOT NULL DEFAULT 0,
  generated_at INTEGER NOT NULL,
  UNIQUE (prospect_id, role, prompt_hash)
);

CREATE TABLE IF NOT EXISTS fonts (
  site_slug TEXT NOT NULL,
  role TEXT NOT NULL,               -- display|text
  family TEXT NOT NULL,
  source_url TEXT,
  license TEXT,
  subset_sha TEXT,
  ledger_note TEXT,
  PRIMARY KEY (site_slug, role)
);

CREATE TABLE IF NOT EXISTS design_signatures (
  run_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  architecture_family TEXT,
  palette_bucket TEXT,
  font_pair TEXT,
  camera_preset TEXT,
  motion_verb TEXT,
  metaphor_keys TEXT,
  cta_text_hash TEXT,
  section_order_hash TEXT,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (run_id, slug)
);

CREATE TABLE IF NOT EXISTS scores (
  run_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  research15 REAL, typography15 REAL, distinctiveness15 REAL, realism15 REAL,
  imagery10 REAL, content10 REAL, motion10 REAL, a11y5 REAL, perf5 REAL,
  total REAL,
  criticals_json TEXT,
  verdict TEXT,                     -- pass|fail
  scored_at INTEGER NOT NULL,
  PRIMARY KEY (run_id, slug)
);

CREATE TABLE IF NOT EXISTS deploys (
  id INTEGER PRIMARY KEY,
  run_id TEXT NOT NULL,
  site_name TEXT NOT NULL,
  site_id TEXT,
  deploy_id TEXT,
  prior_deploy_id TEXT,
  state TEXT NOT NULL CHECK (state IN ('staged','uploaded','live_verified','rolled_back','aborted')),
  url TEXT,
  verified_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS approvals (
  id INTEGER PRIMARY KEY,
  run_id TEXT NOT NULL,
  kind TEXT NOT NULL,               -- batch_shape|publish
  approver TEXT NOT NULL,
  note TEXT,
  doc_sha256 TEXT NOT NULL,
  payload TEXT NOT NULL,            -- the approval JSON as recorded
  created_at INTEGER NOT NULL
);
