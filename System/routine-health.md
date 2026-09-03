---
last_orchestrator_run: 2026-09-03
last_checked: 2026-09-03
tags: [system, routines]
source_refs:
  - System/competitive-task-definition.md
  - Daily-Briefs/competitive-task-today.md
---

# Routine Health Monitor

## Umbrella (active)

| Lane | Status | Notes |
|------|--------|-------|
| ct-inbox-intel | green | inbox-brief-2026-09-03 present |
| ct-gmail-intel | yellow | vault-fallback (MCP not connected) |
| ct-slack-intel | yellow | vault-fallback; slack-action-queue written |
| ct-vault-pulse | green | pulse-today + work-predictor fresh |
| ct-session-sync | yellow | Session Index sparse; 7 session files |
| ct-ads-seo | green | queue + predicted-work scanned |
| ct-automation-health | yellow | no today's claude-loop log in cloud checkout |
| ct-content-routines | yellow | Thursday book SEO — strategy file in `_archive/` |
| ct-consolidator | green | competitive-task-today written |

## Retired Cursor crons (disable in UI)

- `nightly-client-pulse` → absorbed by ct-vault-pulse + morning client-pulse
- `gmail-to-vault-digest` → ct-gmail-intel
- `vault-integrity-sync` → ct-consolidator + claude-memory-sync
- `chat-to-vault-sync` → ct-session-sync
- `bok-law-social-content` → ct-content-routines (Sunday)
- `linkedin-growth-engine` → ct-content-routines (Sunday)
- `book-site-seo-sweep` → ct-content-routines (Thursday)
- `morning-loop` → Windows feeders + morning skills

## Windows feeders (keep running)

| Task | Cadence | Consumed by umbrella |
|------|---------|----------------------|
| daily-communications-brain | 7:00 AM | inbox-brief |
| Claude-Autonomous-Daily-Driver | 15 min | claude-loop receipts |
| Prospect Radar Next 20 | 5:20 AM | radar brief |
| obsidian-guard-dog | 8:30 AM | vault integrity |
| am-report / plan-today / client-pulse | ~7 AM | plan, pulse, metrics |

## Brain layer

- Canonical: [[12_Brain/00_Home|Brain Home]] · [[04_SOPs/competitive-task-orchestrator]]
