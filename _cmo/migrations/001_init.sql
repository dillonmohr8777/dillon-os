-- CMO OS: the Postgres schema.
--
-- The filesystem store is the default and is sufficient for a single operator.
-- This is the same shape, for when one workspace becomes forty and two people
-- need to look at the queue at once.
--
-- Two design decisions carry the whole file:
--
--   1. TENANT ISOLATION IS ENFORCED BY THE DATABASE, not by `where workspace_id = $1`
--      discipline in application code. Row-level security means one forgotten
--      predicate is a failed query, not a cross-client data leak.
--
--   2. THE JOURNAL IS APPEND-ONLY, enforced by a trigger rather than convention.
--      An audit trail that application code can rewrite is not an audit trail.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Tenancy
-- ---------------------------------------------------------------------------

CREATE TABLE workspaces (
  id           text PRIMARY KEY,
  name         text NOT NULL,
  kind         text NOT NULL DEFAULT 'client',
  vertical     text,
  market       text,
  settings     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Singletons: profile, voice, guardrails, budget. One row per (workspace, name).
CREATE TABLE singletons (
  workspace_id text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         text NOT NULL,
  doc          jsonb NOT NULL,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, name)
);

-- ---------------------------------------------------------------------------
-- Runs and the journal
-- ---------------------------------------------------------------------------

CREATE TABLE runs (
  id            text PRIMARY KEY,
  workspace_id  text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  agent_id      text NOT NULL,
  lane          text,
  status        text NOT NULL CHECK (status IN ('running','ok','failed','skipped')),
  -- Hash of the profile, voice and params the agent could see. Two runs with the
  -- same context hash and agent version should produce the same work; when they
  -- do not, the journal shows which step diverged.
  context_hash  text,
  replay_of     text REFERENCES runs(id),
  started_at    timestamptz NOT NULL DEFAULT now(),
  ended_at      timestamptz,
  usd           numeric(12,6) NOT NULL DEFAULT 0,
  tokens_in     bigint NOT NULL DEFAULT 0,
  tokens_out    bigint NOT NULL DEFAULT 0,
  steps         int NOT NULL DEFAULT 0,
  live_steps    int NOT NULL DEFAULT 0,
  replayed_steps int NOT NULL DEFAULT 0,
  summary       text,
  skip_reason   text,
  error         jsonb,
  result        jsonb
);
CREATE INDEX runs_ws_started ON runs (workspace_id, started_at DESC);
CREATE INDEX runs_ws_agent ON runs (workspace_id, agent_id, started_at DESC);

-- The replay source. Exactly one row per (run, seq) - a replay writes under its
-- OWN run id, which is what keeps the recording clean across repeated replays.
CREATE TABLE journal (
  run_id        text NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  workspace_id  text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  seq           int,
  name          text NOT NULL,
  kind          text NOT NULL,
  source        text NOT NULL CHECK (source IN ('live','replay','note')),
  status        text NOT NULL,
  input_hash    text,
  output_hash   text,
  output        jsonb,
  truncated     boolean NOT NULL DEFAULT false,
  model         text,
  usd           numeric(12,6) NOT NULL DEFAULT 0,
  tokens_in     int NOT NULL DEFAULT 0,
  tokens_out    int NOT NULL DEFAULT 0,
  ms            int,
  sources       jsonb,
  notes         jsonb,
  error         jsonb,
  replay_of_run text,
  ts            timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX journal_run_seq ON journal (run_id, seq) WHERE seq IS NOT NULL;
CREATE INDEX journal_ws_ts ON journal (workspace_id, ts DESC);

-- An audit trail application code can rewrite is not an audit trail.
CREATE OR REPLACE FUNCTION journal_is_append_only() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'journal is append-only: % on journal is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_no_update BEFORE UPDATE ON journal
  FOR EACH ROW EXECUTE FUNCTION journal_is_append_only();
CREATE TRIGGER journal_no_delete BEFORE DELETE ON journal
  FOR EACH ROW EXECUTE FUNCTION journal_is_append_only();

-- ---------------------------------------------------------------------------
-- Artifacts, evidence, approvals
-- ---------------------------------------------------------------------------

CREATE TABLE artifacts (
  id            text PRIMARY KEY,
  workspace_id  text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  run_id        text REFERENCES runs(id) ON DELETE SET NULL,
  agent_id      text NOT NULL,
  kind          text NOT NULL,
  title         text,
  summary       text,
  body          text,
  data          jsonb,
  effect        text NOT NULL,
  risk          text NOT NULL CHECK (risk IN ('low','medium','high')),
  channel       text,
  target        text,
  status        text NOT NULL CHECK (status IN ('ready','blocked','superseded')),
  guardrails    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX artifacts_ws_updated ON artifacts (workspace_id, updated_at DESC);
CREATE INDEX artifacts_ws_status ON artifacts (workspace_id, status);

-- Immutable source receipts. This is what a claim points at.
CREATE TABLE evidence (
  id            bigserial PRIMARY KEY,
  workspace_id  text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  run_id        text,
  agent_id      text,
  ref           text NOT NULL,
  url           text,
  note          text,
  kind          text NOT NULL DEFAULT 'source',
  ts            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX evidence_ws_ts ON evidence (workspace_id, ts DESC);
CREATE INDEX evidence_ref ON evidence (workspace_id, ref);

CREATE TABLE approvals (
  id            text PRIMARY KEY,
  workspace_id  text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  artifact_id   text NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  run_id        text,
  effect        text NOT NULL,
  risk          text NOT NULL CHECK (risk IN ('low','medium','high')),
  title         text,
  summary       text,
  channel       text,
  target        text,
  payload       jsonb,
  evidence      jsonb,
  guardrails    jsonb,
  state         text NOT NULL CHECK (state IN ('draft','pending','approved','rejected','changes_requested','published','failed','expired')),
  created_by    text NOT NULL,
  decided_by    text,
  decided_at    timestamptz,
  decision_note text,
  published_at  timestamptz,
  receipt       jsonb,
  history       jsonb NOT NULL DEFAULT '[]'::jsonb,
  opened_at     timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  -- Separation of duties, in the schema rather than only in the service layer.
  -- An agent actor can never be the decider, and the maker can never be the
  -- checker. A bug in application code cannot bypass a CHECK constraint.
  CONSTRAINT checker_is_not_an_agent CHECK (decided_by IS NULL OR decided_by NOT LIKE 'agent:%'),
  CONSTRAINT maker_is_not_checker CHECK (decided_by IS NULL OR decided_by <> created_by)
);
CREATE INDEX approvals_ws_state ON approvals (workspace_id, state, opened_at);

-- ---------------------------------------------------------------------------
-- Cost ledger and idempotency
-- ---------------------------------------------------------------------------

CREATE TABLE ledger (
  id            bigserial PRIMARY KEY,
  workspace_id  text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  run_id        text,
  agent_id      text,
  task_class    text,
  model         text,
  tier          text,
  usd           numeric(12,6) NOT NULL,
  tokens_in     int NOT NULL DEFAULT 0,
  tokens_out    int NOT NULL DEFAULT 0,
  cache_read    int NOT NULL DEFAULT 0,
  cache_savings_usd numeric(12,6) NOT NULL DEFAULT 0,
  note          text,
  ts            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ledger_ws_ts ON ledger (workspace_id, ts DESC);
-- Daily and monthly rollups are derived, never stored: an append-only ledger
-- means the total is always recomputable and can never drift from its entries.

-- A retry must never publish twice. The unique key is the enforcement.
CREATE TABLE effects (
  workspace_id  text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  key           text NOT NULL,
  state         text NOT NULL CHECK (state IN ('inflight','done','failed')),
  channel       text,
  target        text,
  result        jsonb,
  error         jsonb,
  claimed_at    timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz,
  PRIMARY KEY (workspace_id, key)
);

-- ---------------------------------------------------------------------------
-- Measurement
-- ---------------------------------------------------------------------------

CREATE TABLE prompt_sets (
  workspace_id  text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  set_id        text NOT NULL,
  version       int NOT NULL,
  sha256        text NOT NULL,
  locale        text NOT NULL DEFAULT 'en-US',
  competitors   jsonb NOT NULL DEFAULT '[]'::jsonb,
  weighting     jsonb,
  prompts       jsonb NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, set_id, version)
);

CREATE TABLE scans (
  id            text PRIMARY KEY,
  workspace_id  text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  set_id        text NOT NULL,
  set_version   int NOT NULL,
  -- The instrument hash is stored on the scan so a trend across two different
  -- instruments can be REFUSED rather than silently plotted.
  set_sha256    text NOT NULL,
  replicates    int NOT NULL,
  result        jsonb NOT NULL,
  ts            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX scans_ws_ts ON scans (workspace_id, ts DESC);

CREATE TABLE scan_runs (
  id            bigserial PRIMARY KEY,
  scan_id       text NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  workspace_id  text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  prompt_id     text NOT NULL,
  canonical_id  text,
  variant_index int,
  engine        text NOT NULL,
  -- api_proxy | ui_scrape | clickstream | first_party. Never averaged across
  -- channels: they measure different systems.
  channel       text NOT NULL,
  engine_version text,
  replicate     int NOT NULL,
  grounded      boolean,
  present       boolean NOT NULL,
  ordinal       int,
  mention_count int NOT NULL DEFAULT 0,
  prominence    numeric(6,4),
  stance        text,
  owned_citations int NOT NULL DEFAULT 0,
  total_citations int NOT NULL DEFAULT 0,
  evidence_span text,
  ts            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX scan_runs_scan ON scan_runs (scan_id, engine, prompt_id);

CREATE TABLE events (
  id            bigserial PRIMARY KEY,
  workspace_id  text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type          text NOT NULL,
  payload       jsonb NOT NULL DEFAULT '{}'::jsonb,
  ts            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX events_ws_ts ON events (workspace_id, ts DESC);

CREATE TABLE deadletter (
  id            bigserial PRIMARY KEY,
  workspace_id  text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  run_id        text,
  agent_id      text,
  error         jsonb NOT NULL,
  params        jsonb,
  resolved_at   timestamptz,
  ts            timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
--
-- Three mistakes cause cross-tenant leaks, so they are called out here:
--
--   1. Forgetting FORCE ROW LEVEL SECURITY - the table owner bypasses RLS
--      without it, and the application often connects as the owner.
--   2. Using SET instead of SET LOCAL for the tenant variable. Under a
--      transaction-pooling proxy (PgBouncer), a plain SET leaks the setting to
--      whichever tenant next borrows that server connection. Always SET LOCAL,
--      always inside an explicit transaction.
--   3. Granting the application role BYPASSRLS "temporarily".
--
-- Per request:  BEGIN; SET LOCAL app.workspace_id = 'acme-hvac'; ... COMMIT;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'singletons','runs','journal','artifacts','evidence','approvals','ledger',
    'effects','prompt_sets','scans','scan_runs','events','deadletter'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (workspace_id = current_setting(''app.workspace_id'', true))
       WITH CHECK (workspace_id = current_setting(''app.workspace_id'', true))', t);
  END LOOP;
END $$;
