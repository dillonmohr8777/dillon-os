---
last_checked: 2026-08-25
last_orchestrator_run: pending
tags: [system, routines, orchestrator]
umbrella: competitive-task-orchestrator
cron: "0 13 * * * America/New_York"
---

# Routine Health Monitor

Umbrella workflow: **competitive-task-orchestrator** (1:00 PM ET daily).  
Legacy seven Cursor crons are retired — see `System/competitive-task-definition.md`.

## Umbrella lanes (Phase 1 parallel)

| Lane | Agent | Expected artifact | Status |
|------|-------|-------------------|--------|
| Gmail | gmail-intel | `System/urgent-replies.md` | pending |
| Slack | slack-intel | `System/slack-action-queue.md` | pending |
| Vault | vault-pulse | consolidator section | pending |
| Sessions | codex-session-sync | session promotions | pending |
| Ads/SEO | domain-ads-seo | queue P0 summary | pending |
| Content | content-routines | Sun/Thu drafts or skipped | pending |
| Automation | automation-health | lane health summary | pending |

Phase 2: `memory-consolidator` → `Daily-Briefs/competitive-task-today.md`

## Local schedulers (surfaced, not replaced)

| Scheduler | Cadence | Health signal |
|-----------|---------|---------------|
| Claude-Autonomous-Daily-Driver | Every 15 min | `12_Brain/queue/claude-loop-*.jsonl` |
| DillonAgentOS-GmailBridge | ~15 min | `00_Inbox/` Gmail captures |
| DillonAgentOS-SlackBridge | ~15 min | `00_Inbox/slack/` |
| Prospect Radar Next 20 | Daily 5:20 AM ET | `automation/prospect-radar-next20/` logs |
| Codex cron automations | Per `automation.toml` | ACTIVE vs PAUSED in workflow-estate |

## Brain layer

- Canonical: [[12_Brain/README|12_Brain]] · [[12_Brain/System/Health Automation|Health Automation]]
- Spec: [[11_Agents/competitive-task-orchestrator-spec]]
