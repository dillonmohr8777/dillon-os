---
last_checked: 2026-06-05
tags: [system, routines]
---

# Routine Health Monitor

## Umbrella orchestrator (ACTIVE)

**One automation replaces seven legacy crons.**

| Field | Value |
|-------|-------|
| Automation | `competitive-task-orchestrator` |
| Schedule | `0 13 * * *` (daily, 1:00 PM UTC / 8:00 AM ET) |
| Master prompt | `System/competitive-task-orchestrator-prompt.md` |
| Daily output | `Daily-Briefs/competitive-task-today.md` |
| Architecture | `System/competitive-task-orchestrator.md` |
| Last run | 2026-06-05 |

### Parallel agents (Phase 1)

| Agent | Definition | Absorbs |
|-------|-----------|---------|
| gmail-intel | `.cursor/agents/gmail-intel.md` | gmail-to-vault-digest |
| slack-intel | `.cursor/agents/slack-intel.md` | *(new)* |
| vault-pulse | `.cursor/agents/vault-pulse.md` | nightly-client-pulse |
| codex-session-sync | `.cursor/agents/codex-session-sync.md` | chat-to-vault-sync |
| content-routines | `.cursor/agents/content-routines.md` | bok-law-social-content + linkedin-growth-engine |
| domain-ads-seo | `.cursor/agents/domain-ads-seo.md` | book-site-seo-sweep + ads queues |

### Sequential agent (Phase 2)

| Agent | Definition | Absorbs |
|-------|-----------|---------|
| memory-consolidator | `.cursor/agents/memory-consolidator.md` | vault-integrity-sync |

## Last run status (2026-06-05)

| Agent | Status | Notes |
|-------|--------|-------|
| gmail-intel | partial | Gmail MCP unavailable — used vault last-known |
| slack-intel | skipped | Slack MCP unavailable |
| vault-pulse | ok | 12/12 clients scanned, all stale since April |
| codex-session-sync | ok | 10_Sessions/ template-only, no loops |
| content-routines | ok | BOK due today, Align June calendar missing |
| domain-ads-seo | ok | Thursday book sweep missed, ads from overviews |
| memory-consolidator | ok | Brief + memory sync updated |

## Legacy crons — DEPRECATED

Do not recreate as separate automations:

- ~~`nightly-client-pulse`~~ → vault-pulse
- ~~`gmail-to-vault-digest`~~ → gmail-intel
- ~~`vault-integrity-sync`~~ → memory-consolidator
- ~~`chat-to-vault-sync`~~ → codex-session-sync
- ~~`bok-law-social-content`~~ → content-routines (Sunday gate)
- ~~`linkedin-growth-engine`~~ → content-routines (Sunday gate)
- ~~`book-site-seo-sweep`~~ → domain-ads-seo (Thursday gate)

## Known gaps

• Vault `last_touched` frozen without Gmail MCP on automation runs
• Slack intel requires Slack connector for full coverage
• Campaign queues and Agent Memory files are empty — populate or remove
