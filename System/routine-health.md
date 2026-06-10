---
last_checked: 2026-06-10
tags: [system, routines]
---

# Routine Health Monitor

## Active automation (umbrella)

| Automation | Schedule | Status |
|------------|----------|--------|
| **competitive-task-orchestrator** | `0 13 * * *` (1:00 PM ET daily) | **ACTIVE** — replaces all legacy crons |

Prompt: `System/competitive-task-orchestrator-prompt.md`
Definition: `System/competitive-task-definition.md`
Daily output: `Daily-Briefs/competitive-task-today.md`
Agents: `.cursor/agents/` (6 parallel + 1 consolidator)

## Legacy crons — DEPRECATED

Do not schedule these separately. All absorbed by orchestrator:

| Legacy cron | Absorbed by |
|-------------|-------------|
| `nightly-client-pulse` | `vault-pulse` |
| `gmail-to-vault-digest` | `gmail-intel` → `memory-consolidator` |
| `vault-integrity-sync` | `memory-consolidator` |
| `chat-to-vault-sync` | `codex-session-sync` |
| `bok-law-social-content` | `content-routines` (Sunday) |
| `linkedin-growth-engine` | `content-routines` (Sunday) |
| `book-site-seo-sweep` | `domain-ads-seo` (Thursday) |

## Health checks

- [ ] Gmail MCP connected on automation runs
- [ ] Slack MCP connected on automation runs
- [ ] Client `last_touched` updated within 7 days
- [ ] `Daily-Briefs/competitive-task-today.md` fresh (<24h)
- [ ] Campaign queues populated from client intel

## Notes

Vault seeded with frontmatter fields routines expect (`client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`).
Orchestrator consolidated 2026-06-10 on branch `cursor/competitive-task-consolidation-5b6b`.
