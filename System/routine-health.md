---
last_checked: 2026-08-23
last_orchestrator_run: 2026-08-23
tags: [system, routines]
source_refs:
  - "[[System/competitive-task-definition]]"
  - "[[04_SOPs/competitive-task-orchestrator]]"
---

# Routine Health Monitor

## Umbrella orchestrator (operator-facing)

| Routine | Status | Notes |
|---------|--------|-------|
| `competitive-task-orchestrator` | **green** | Run 2026-08-23; brief + sync updated |

## Intel lanes (Phase 1)

| Lane | Status | Notes |
|------|--------|-------|
| gmail-intel | **yellow** | MCP unavailable; vault-fallback from urgent-replies + approval queue |
| slack-intel | **yellow** | MCP unavailable; COMMS connector failed since 2026-08-17 |
| vault-pulse | **yellow** | Most client `last_touched` stale or missing; NKCDC/Replenish touched Aug 1 |
| codex-session-sync | **green** | Rockbot codex-rollouts indexed; Session Index updated |
| domain-ads-seo | **yellow** | Campaign queues empty; P0s live in client notes + approval queue |
| content-routines | **green** | Sunday run — BOK + Align week drafts created |

## Retired crons (disable in Cursor UI if still scheduled)

- `nightly-client-pulse` → replaced by vault-pulse lane
- `gmail-to-vault-digest` → replaced by gmail-intel lane
- `vault-integrity-sync` → replaced by memory-consolidator
- `chat-to-vault-sync` → replaced by codex-session-sync lane
- `bok-law-social-content` → replaced by content-routines (Sunday)
- `linkedin-growth-engine` → replaced by content-routines (Sunday)
- `book-site-seo-sweep` → replaced by content-routines (Thursday)

## Background automation (not replaced — runs underneath)

- `Invoke-ClaudeDailyDriver.ps1` — every 15 min, 54 routines, proposal lane only
- Prospect Radar daily sweep — `Daily-Briefs/radar-*.md`
- Grok intelligence ingest — `12_Brain/06_Research/`

## Brain layer

- Canonical: [[12_Brain/README|12_Brain]] · [[12_Brain/System/Health Automation|Health Automation]]
