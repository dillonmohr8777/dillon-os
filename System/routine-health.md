---
last_checked: 2026-06-13
tags: [system, routines]
---

# Routine Health Monitor

## Active automation (umbrella)

**`competitive-task-orchestrator`** — daily at 1:00 PM ET (`0 13 * * *`)

- Prompt: `System/competitive-task-orchestrator-prompt.md`
- Definition: `System/competitive-task-definition.md`
- Daily read: `Daily-Briefs/competitive-task-today.md`
- Subagents: `.cursor/agents/` (6 parallel + 1 sequential consolidator)

### Phase 1 — parallel intel
| Subagent | Replaces |
|----------|----------|
| `gmail-intel` | `gmail-to-vault-digest` |
| `slack-intel` | (new — no legacy cron) |
| `vault-pulse` | `nightly-client-pulse` |
| `codex-session-sync` | `chat-to-vault-sync` |
| `content-routines` | `bok-law-social-content`, `linkedin-growth-engine`, `book-site-seo-sweep` |
| `domain-ads-seo` | partial `book-site-seo-sweep` + campaign queue monitoring |

### Phase 2 — sequential
| Subagent | Replaces |
|----------|----------|
| `memory-consolidator` | `vault-integrity-sync` |

## Legacy crons — DEPRECATED

Do not schedule these separately. They are absorbed by the orchestrator:

- ~~`nightly-client-pulse`~~
- ~~`gmail-to-vault-digest`~~
- ~~`vault-integrity-sync`~~
- ~~`chat-to-vault-sync`~~
- ~~`bok-law-social-content`~~
- ~~`linkedin-growth-engine`~~
- ~~`book-site-seo-sweep`~~

## Last orchestrator run

- **Date:** 2026-06-13 (infrastructure build — first consolidated workflow deployed)
- **Status:** Subagent definitions and prompt written. Live Gmail/Slack MCP integration pending on next cron trigger.
- **Known gap:** Vault `last_touched` fields stale without daily orchestrator runs writing back.

## Vault frontmatter expected

Client notes should carry: `client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`.
