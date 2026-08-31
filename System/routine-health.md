---
last_checked: 2026-08-31
last_orchestrator_run: 2026-08-31
tags: [system, routines]
source_refs:
  - System/competitive-task-definition.md
  - 04_SOPs/competitive-task-orchestrator.md
---

# Routine Health Monitor

## Umbrella orchestrator

| Lane | Status | Notes |
| --- | --- | --- |
| gmail-intel | yellow | vault-fallback; no Gmail MCP |
| slack-intel | yellow | vault-fallback; Slack MCP needsAuth |
| vault-pulse | green | 39 clients scanned; 36 stalled |
| codex-session-sync | green | 6 sessions; 2 promotions |
| domain-ads-seo | green | 5 ad P0s surfaced |
| content-routines | green | skipped (Monday) |
| memory-consolidator | green | brief + sync written 2026-08-31 |

**Canonical automation:** `competitive-task-orchestrator` — cron `0 13 * * *` (1:00 PM America/New_York).

## Retired standalone crons (disable in Cursor UI)

- `nightly-client-pulse` → absorbed by `vault-pulse`
- `gmail-to-vault-digest` → absorbed by `gmail-intel`
- `vault-integrity-sync` → absorbed by `memory-consolidator`
- `chat-to-vault-sync` → absorbed by `codex-session-sync`
- `bok-law-social-content` → absorbed by `content-routines` (Sunday)
- `linkedin-growth-engine` → absorbed by `content-routines` (Sunday)
- `book-site-seo-sweep` → absorbed by `content-routines` (Thursday)

## Other scheduled work (not replaced)

- `Claude-Autonomous-Daily-Driver` — every 15 min on desktop; bounded Tier 0/1 routines
- `Prospect Radar - Next 20 Daily Builder` — 05:20 daily
- `radar-daily.yml` — GitHub Actions 06:10 UTC

## System gaps

- Slack intake plumbing reports false-green; comms brain checkpoint stuck ~2026-08-06.
- Approval queue noise: 180 open items; Hermes Gateway conflict repeats need consolidation.
- Campaign optimization queues empty while client notes carry P0 ad issues — queue hygiene debt.

## Brain layer

Canonical: [[12_Brain/README|12_Brain]] · [[12_Brain/System/Health Automation|Health Automation]]
