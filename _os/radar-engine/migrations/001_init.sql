-- Prospect Radar V2 schema. Private durable state. No PII in Git.
-- Apply with: node --experimental-strip-types _os/radar-engine/bin/radar-v2.js migrate

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  geography JSONB NOT NULL DEFAULT '{}'::jsonb,
  included_verticals TEXT[] NOT NULL DEFAULT '{}',
  excluded_verticals TEXT[] NOT NULL DEFAULT '{}',
  allowed_offers TEXT[] NOT NULL DEFAULT '{}',
  daily_discovery_budget INTEGER NOT NULL DEFAULT 0,
  daily_render_budget INTEGER NOT NULL DEFAULT 0,
  daily_enrichment_budget INTEGER NOT NULL DEFAULT 0,
  daily_report_budget INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 0,
  suppression_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
  report_template TEXT NOT NULL DEFAULT 'momentum-audit-v1',
  booking_owner TEXT,
  booking_link TEXT,
  crm_destination TEXT,
  outreach_channels TEXT[] NOT NULL DEFAULT '{}',
  human_qa_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  report_delivery_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  outreach_handoff_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  auto_approve_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS prospects (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  campaign_id TEXT REFERENCES campaigns(id),
  lifecycle TEXT NOT NULL DEFAULT 'discovered',
  business_name TEXT,
  website TEXT,
  domain TEXT,
  city TEXT,
  state TEXT,
  service_area TEXT,
  vertical TEXT,
  places_id TEXT,
  closed BOOLEAN NOT NULL DEFAULT FALSE,
  chain BOOLEAN NOT NULL DEFAULT FALSE,
  selected_offer TEXT,
  score_version TEXT,
  public_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  private_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  suppression_reason TEXT,
  correlation_id TEXT
);

CREATE INDEX IF NOT EXISTS prospects_domain_idx ON prospects (domain);
CREATE INDEX IF NOT EXISTS prospects_campaign_idx ON prospects (campaign_id);
CREATE INDEX IF NOT EXISTS prospects_lifecycle_idx ON prospects (lifecycle);

CREATE TABLE IF NOT EXISTS prospect_sources (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  prospect_id TEXT NOT NULL REFERENCES prospects(id),
  source TEXT NOT NULL,
  source_record_id TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS prospect_identities (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  prospect_id TEXT NOT NULL REFERENCES prospects(id),
  kind TEXT NOT NULL,
  value_normalized TEXT NOT NULL,
  value_display TEXT,
  confidence NUMERIC,
  UNIQUE (kind, value_normalized)
);

CREATE TABLE IF NOT EXISTS suppressions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  kind TEXT NOT NULL,
  value_normalized TEXT NOT NULL,
  reason TEXT NOT NULL,
  channel TEXT,
  source TEXT,
  expires_at TIMESTAMPTZ,
  UNIQUE (kind, value_normalized, channel)
);

CREATE TABLE IF NOT EXISTS intake_submissions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  campaign_id TEXT REFERENCES campaigns(id),
  prospect_id TEXT REFERENCES prospects(id),
  status_token TEXT NOT NULL UNIQUE,
  ip_hash TEXT,
  -- Sensitive: requester identity. Never copy into sanitized exports.
  requester_name TEXT,
  requester_role TEXT,
  requester_email TEXT,
  requester_phone TEXT,
  business_name TEXT,
  website TEXT,
  city_state TEXT,
  primary_services TEXT,
  business_description TEXT,
  growth_goals TEXT,
  current_channels TEXT,
  notes TEXT,
  consent_analyze BOOLEAN NOT NULL DEFAULT FALSE,
  consent_review_call BOOLEAN NOT NULL DEFAULT FALSE,
  consent_marketing BOOLEAN NOT NULL DEFAULT FALSE,
  email_verification TEXT NOT NULL DEFAULT 'unverified',
  captcha_state TEXT NOT NULL DEFAULT 'skipped',
  duplicate_of TEXT
);

CREATE TABLE IF NOT EXISTS audit_runs (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  prospect_id TEXT NOT NULL REFERENCES prospects(id),
  scanner_version TEXT NOT NULL,
  score_version TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  fixture BOOLEAN NOT NULL DEFAULT FALSE,
  error TEXT,
  raw_audit JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS evidence_items (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  audit_run_id TEXT NOT NULL REFERENCES audit_runs(id),
  source TEXT NOT NULL,
  url TEXT,
  provider_record_id TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metric TEXT,
  excerpt TEXT,
  classification TEXT NOT NULL,
  confidence NUMERIC NOT NULL DEFAULT 0,
  freshness_expires_at TIMESTAMPTZ,
  artifact_ref TEXT
);

CREATE TABLE IF NOT EXISTS score_snapshots (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  prospect_id TEXT NOT NULL REFERENCES prospects(id),
  audit_run_id TEXT REFERENCES audit_runs(id),
  score_version TEXT NOT NULL,
  immutable BOOLEAN NOT NULL DEFAULT TRUE,
  site_quality_score NUMERIC,
  opportunity_score NUMERIC,
  rebuild_opportunity NUMERIC,
  seo_aeo_opportunity NUMERIC,
  local_opportunity NUMERIC,
  paid_opportunity NUMERIC,
  conversion_opportunity NUMERIC,
  market_fit_score NUMERIC,
  contactability_score NUMERIC,
  audit_confidence NUMERIC,
  priority_score NUMERIC,
  components JSONB NOT NULL DEFAULT '{}'::jsonb,
  explanations JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_offer TEXT,
  routing_reasons TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  prospect_id TEXT NOT NULL REFERENCES prospects(id),
  audit_run_id TEXT REFERENCES audit_runs(id),
  score_snapshot_id TEXT REFERENCES score_snapshots(id),
  access_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  current_version_id TEXT,
  booking_variant TEXT NOT NULL DEFAULT 'default'
);

CREATE TABLE IF NOT EXISTS report_versions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  report_id TEXT NOT NULL REFERENCES reports(id),
  version INTEGER NOT NULL,
  manifest JSONB NOT NULL,
  html_ref TEXT,
  pdf_ref TEXT,
  check_results JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (report_id, version)
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  prospect_id TEXT NOT NULL REFERENCES prospects(id),
  -- Sensitive.
  value TEXT NOT NULL,
  type TEXT NOT NULL,
  person_name TEXT,
  person_title TEXT,
  source TEXT NOT NULL,
  source_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  verification_result TEXT NOT NULL DEFAULT 'unverified',
  confidence NUMERIC NOT NULL DEFAULT 0,
  own_domain BOOLEAN NOT NULL DEFAULT FALSE,
  suppressed BOOLEAN NOT NULL DEFAULT FALSE,
  opt_out BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS contact_sources (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact_id TEXT NOT NULL REFERENCES contacts(id),
  source TEXT NOT NULL,
  url TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_excerpt TEXT
);

CREATE TABLE IF NOT EXISTS outreach_drafts (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  prospect_id TEXT NOT NULL REFERENCES prospects(id),
  report_id TEXT REFERENCES reports(id),
  channel TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  findings_cited TEXT[] NOT NULL DEFAULT '{}',
  follow_up_at TIMESTAMPTZ,
  social_research_task TEXT,
  sent BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  prospect_id TEXT NOT NULL REFERENCES prospects(id),
  kind TEXT NOT NULL,
  decision TEXT NOT NULL,
  actor TEXT NOT NULL,
  reason TEXT,
  immutable BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS crm_handoffs (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  prospect_id TEXT NOT NULL REFERENCES prospects(id),
  destination TEXT,
  dry_run BOOLEAN NOT NULL DEFAULT TRUE,
  payload_preview JSONB NOT NULL DEFAULT '{}'::jsonb,
  live_write BOOLEAN NOT NULL DEFAULT FALSE,
  approval_id TEXT REFERENCES approvals(id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  prospect_id TEXT NOT NULL REFERENCES prospects(id),
  report_id TEXT REFERENCES reports(id),
  campaign_id TEXT REFERENCES campaigns(id),
  variant TEXT,
  status TEXT NOT NULL DEFAULT 'started',
  provider TEXT,
  provider_event_id TEXT,
  held_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sales_outcomes (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  prospect_id TEXT NOT NULL REFERENCES prospects(id),
  stage TEXT NOT NULL,
  revenue NUMERIC,
  expected_revenue NUMERIC,
  close_reason TEXT,
  calibration_proposal JSONB
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor TEXT NOT NULL,
  reason TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  correlation_id TEXT,
  prospect_id TEXT,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS events_prospect_idx ON events (prospect_id);
CREATE INDEX IF NOT EXISTS events_type_idx ON events (type);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued',
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 5,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  last_error TEXT,
  dead_letter BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs (status, next_attempt_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE (key, window_start)
);
