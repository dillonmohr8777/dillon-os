---
last_checked: 2026-09-04
last_orchestrator_run: 2026-09-04
tags: [system, routines]
---

# Routine Health Monitor

Canonical daily operator cycle: **competitive-task-orchestrator** (cron `0 13 * * *` America/New_York).

Legacy standalone crons listed below are **retired** — use the umbrella only.

## Umbrella lanes (2026-09-04)

| Lane | Status |
|------|--------|
| gmail-intel | yellow |
| slack-intel | yellow |
| vault-pulse | yellow |
| codex-session-sync | green |
| domain-ads-seo | yellow |
| content-routines | green |
| memory-consolidator | green |

## Retired (merged into umbrella)

- `nightly-client-pulse` → vault-pulse lane
- `gmail-to-vault-digest` → gmail-intel lane
- `vault-integrity-sync` → memory-consolidator lane
- `chat-to-vault-sync` → codex-session-sync lane
- `bok-law-social-content` / `linkedin-growth-engine` / `book-site-seo-sweep` → content-routines lane (day-gated)
- `daily-morning-orchestrator-dry-board` (Codex) → superseded; see [[04_SOPs/competitive-task-orchestrator]]

## Still separate (not merged)

- `daily-communications-brain` — canonical comms → vault ingest (07:00 ET)
- `weekly-client-marketing-reports` + `report-brain-reconciliation`
- `marketing-chief-twice-daily-brief` — infra health only
- `daily-grok-dillon-os-intelligence`, `obsidian-guard-dog`, Prospect Radar

## Brain layer

- [[12_Brain/03_Concepts/Competitive Task]]
- [[12_Brain/System/Health Automation]]
