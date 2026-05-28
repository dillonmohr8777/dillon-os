---
tags: [system, automation]
last_updated: 2026-05-28
---

# Automation Manifest

## Active (keep exactly one)

| Automation | Schedule | Prompt |
|------------|----------|--------|
| `competitive-task-orchestrator` | `0 13 * * *` | [[System/competitive-task-orchestrator-prompt]] |

## Deprecated — disable in Cursor Automations UI

These routines are **merged** into the umbrella orchestrator. Do not schedule separately.

| Legacy name | Former job | Absorbed by subagent |
|-------------|------------|----------------------|
| `nightly-client-pulse` | `Daily-Briefs/pulse-today.md` | `vault-pulse` + consolidator |
| `gmail-to-vault-digest` | `System/urgent-replies.md` | `gmail-intel` + consolidator |
| `vault-integrity-sync` | `System/claude-memory-sync.md` | `vault-pulse` + consolidator |
| `chat-to-vault-sync` | conversation → vault | `codex-session-sync` + consolidator |
| `bok-law-social-content` | BOK weekly social | `content-routines` |
| `linkedin-growth-engine` | Align LinkedIn calendar | `content-routines` |
| `book-site-seo-sweep` | book SEO | `content-routines` |

## Subagent registry

All live under `.cursor/agents/` in this repo:

• `gmail-intel.md`
• `slack-intel.md`
• `vault-pulse.md`
• `codex-session-sync.md`
• `content-routines.md`
• `domain-ads-seo.md`
• `memory-consolidator.md` (Phase 2 only, not parallel)

## Operator checklist after merge

- [ ] Disable seven legacy automations in Cursor
- [ ] Confirm Gmail + Slack MCP on the orchestrator automation
- [ ] Point cron automation at [[System/competitive-task-orchestrator-prompt]]
- [ ] Pin [[Daily-Briefs/competitive-task-today]] on [[Dashboard]]
