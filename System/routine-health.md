---
last_checked: 2026-06-12
tags: [system, routines]
---

# Routine Health Monitor

## Active automation (umbrella)

| Automation | Schedule | Prompt / agents | Output |
|------------|----------|-----------------|--------|
| `competitive-task-orchestrator` | `0 13 * * *` (daily 1 PM) | `System/competitive-task-orchestrator-prompt.md` | `Daily-Briefs/competitive-task-today.md` |

**Parallel agents:** gmail-intel, slack-intel, vault-pulse, codex-session-sync, content-routines, domain-ads-seo → then memory-consolidator (sequential).

Agent definitions: `.cursor/agents/*.md`

## Retired crons (consolidated 2026-06-12)

These seven automations are **replaced** by the umbrella orchestrator. Disable them in Cursor Automations to avoid duplicate runs.

| Legacy cron | Former job | Now handled by |
|-------------|------------|----------------|
| `nightly-client-pulse` | `Daily-Briefs/pulse-today.md` | vault-pulse + memory-consolidator |
| `gmail-to-vault-digest` | `System/urgent-replies.md` | gmail-intel + memory-consolidator |
| `vault-integrity-sync` | `System/claude-memory-sync.md` | vault-pulse + memory-consolidator |
| `chat-to-vault-sync` | session → vault | codex-session-sync + memory-consolidator |
| `bok-law-social-content` | Sunday 6 PM BOK social | content-routines (Sunday branch) |
| `linkedin-growth-engine` | Sunday 9 PM Align LinkedIn | content-routines (Sunday branch) |
| `book-site-seo-sweep` | Thursday book SEO | content-routines (Thursday branch) |

## Last run notes (2026-06-12)

• Orchestrator scaffold deployed on branch `cursor/competitive-task-consolidation-97db`
• Gmail MCP: not connected — vault fallback used
• Slack MCP: not connected — coverage gap logged
• Vault client notes stale since 2026-04-15 — needs live sync
• Campaign queues still empty — consolidator flagged for manual population

## Expected vault fields

Client notes should carry: `client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`

## First full stack test

Umbrella orchestrator ready. Next run with Gmail + Slack MCP should refresh thread ages and close the April stale-data gap.
