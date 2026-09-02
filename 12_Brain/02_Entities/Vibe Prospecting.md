---
tags: [entity, tool]
source: "[[12_Brain/01_Captures/Slack/2026-09-01 - jason-fallon-snap-fitness-pa-request]]"
updated: 2026-09-01
note_type: entity
status: active
created: 2026-09-01
source_refs: ["[[12_Brain/01_Captures/Slack/2026-09-01 - jason-fallon-snap-fitness-pa-request]]"]
---

# Vibe Prospecting

**Summary:** a paid business/prospect-data MCP (companies, contacts, franchise
locations) — powers [[.claude/skills/franchise-list|franchise-list]] and future
lead-pull skills.

## What it is

A hosted MCP for finding businesses and prospects by filter (brand, industry,
location, size, job title, contact availability) and exporting matched rows to
CSV. `unverified`: exact per-row cost formula pending a spent `estimate-cost`
call; the smallest credit pack is Plus (900 credits, $29.90, 365-day expiry) —
no free tier surfaced in `show-pricing-plans`.

## Rules

- **No client names in queries.** Search by brand + geography only, never by
  the requester's or the client's name.
- **Read-only by default.** `show-pricing-plans`, `show-sample`, and
  `estimate-cost` cost nothing; `fetch-entities`, `enrich-*`, and
  `export-to-csv` spend credits.
- **Spend gate.** Never fetch/enrich/export past the cap set in the calling
  skill (default 200 credits or $20) without Dillon's sign-off in
  `System/approval-queue.md`.
- Consuming skill: `.claude/skills/franchise-list`.
