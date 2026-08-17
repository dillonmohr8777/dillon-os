---
tags: [decision]
decided: 2026-08-13
status: active
supersedes: ""
source: "[[_os/automation/docs/RADAR-SETUP]]"
updated: 2026-08-13
expires: 2026-11-13
note_type: decision
created: 2026-08-13
source_refs: ["[[_os/automation/docs/RADAR-SETUP]]"]
---


# Prospect Radar V2 is an adapter layer, not a rebuild

**Decision:** Extend the existing Prospect Radar with an isolated TypeScript
engine at `_os/radar-engine/`. Keep OSM discovery, Places enrichment, Tier 0/1
audits, Site Quality Score, Opportunity Score, hard-fault rebuild protection,
and private/public separation. Add PostgreSQL state, a validated lifecycle,
intake, AuditManifest reports, human QA, dry-run handoff, and funnel
measurement around those modules.

**Why:** The current radar already grades and routes. The gap is the rest of
the funnel: durable private state, evidence-backed reports, mandatory QA, and
measurement. Rebuilding scanners would fork the calibrated SQS/opportunity
model. Wrapping them preserves verdict protections.

**Implications:**

- UI is an isolated Node 22 TypeScript app (server-rendered HTML). The vault
  has no shared radar web framework; HUD and client reports are vanilla Node.
  Shadow HVAC Next.js and IMMOHRTAL Vite stay client-site stacks.
- Durable submissions, contacts, approvals, and bookings live in PostgreSQL
  via `DATABASE_URL`. Tests may use an in-memory store. No committed SQLite
  or JSON for those entities.
- Jobs are Postgres-backed (or the in-memory equivalent in tests): idempotency
  keys, retries, backoff, dead-letter, row locking. No Redis in v1.
- All outbound adapters default to dry-run. Kill switches keep report
  delivery, CRM writes, and outreach off.
- Score version `radar-v2.0.0` is immutable. Outcome feedback may propose
  calibration; it must not mutate production weights.
- Human QA is mandatory for the first 25 reports. Auto-approval stays off.
- Public report URLs are unguessable, revocable, expiring, and noindex.
- Customer-facing report copy follows the no-em-dash house rule.

**Not chosen:** a greenfield Next.js/React app, Redis, live CRM writes, guessed
emails, autonomous social DMs, cold SMS, or AI voice.
