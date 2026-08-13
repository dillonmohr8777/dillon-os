---
tags: [project]
status: active
updated: 2026-08-13
source: "[[12_Brain/decisions/2026-08-13 - Prospect Radar V2 audit engine]]"
---

# Prospect Radar V2

**Summary:** Evidence-backed free SEO, AI/AEO, and marketing audit engine for
Momentum 360, wrapping the existing radar instead of replacing it.

Engine: `_os/radar-engine/`. Setup: `_os/radar-engine/README.md`. Decision:
[[12_Brain/decisions/2026-08-13 - Prospect Radar V2 audit engine]].

Durable private state is PostgreSQL when `DATABASE_URL` is set. Jobs claim with
`FOR UPDATE SKIP LOCKED`. Outbound adapters stay dry-run. Human QA is mandatory.

Existing radar (preserve): `_os/automation/lib/radar.js`, `site-audit.js`,
`site-grader.js`, `opportunity.js`, `places.js`, `contacts.js`,
`contact-store.js`.
