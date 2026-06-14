---
last_checked: 2026-06-14
tags: [system, routines, orchestrator]
---

# Routine Health Monitor

## Umbrella orchestrator (active)

| Automation | Schedule | Status |
|------------|----------|--------|
| `competitive-task-orchestrator` | `0 13 * * *` (daily 1PM UTC) | **ACTIVE** — replaces all legacy crons below |

Prompt: `System/competitive-task-orchestrator-prompt.md`
Definition: `System/competitive-task-definition.md`
Daily output: `Daily-Briefs/competitive-task-today.md`

### Parallel subagents (`.cursor/agents/`)

| Agent | Legacy routine absorbed | Last run |
|-------|-------------------------|----------|
| `gmail-intel` | `gmail-to-vault-digest` | 2026-06-14 (fallback) |
| `slack-intel` | (new) | 2026-06-14 (mcp unavailable) |
| `vault-pulse` | `nightly-client-pulse` | 2026-06-14 |
| `codex-session-sync` | `chat-to-vault-sync` | 2026-06-14 |
| `content-routines` | `bok-law-social-content`, `linkedin-growth-engine` | 2026-06-14 (skipped) |
| `domain-ads-seo` | `book-site-seo-sweep` + ad queues | 2026-06-14 |
| `memory-consolidator` | `vault-integrity-sync` | 2026-06-14 |

## Legacy crons (deprecated — do not schedule separately)

These routines are **absorbed** by the umbrella orchestrator. Do not create separate automations for them.

- ~~`nightly-client-pulse`~~ → `vault-pulse`
- ~~`gmail-to-vault-digest`~~ → `gmail-intel`
- ~~`vault-integrity-sync`~~ → `memory-consolidator`
- ~~`chat-to-vault-sync`~~ → `codex-session-sync`
- ~~`bok-law-social-content`~~ → `content-routines`
- ~~`linkedin-growth-engine`~~ → `content-routines`
- ~~`book-site-seo-sweep`~~ → `domain-ads-seo`

## Known gaps

- Vault `last_touched` often stale without daily orchestrator runs writing back
- Slack has no vault mirror; `slack-intel` depends on Slack MCP at runtime
- Gmail intel depends on Gmail MCP at runtime; falls back to `urgent-replies.md` baseline
- Codex sessions have no external log directory; `codex-session-sync` scans vault + git branches

## Vault frontmatter expected

Routines expect these fields on client notes: `client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`.
