---
last_checked: 2026-06-08
tags: [system, routines]
---

# Routine Health Monitor

## Umbrella automation (active)

**One cron replaces seven legacy routines.**

| Setting | Value |
| --- | --- |
| Automation | `competitive-task-orchestrator` |
| Schedule | `0 13 * * *` (daily 1:00 PM UTC / 9:00 AM ET) |
| Prompt | `System/competitive-task-orchestrator-prompt.md` |
| Daily read | `Daily-Briefs/competitive-task-today.md` |
| Run reports | `Daily-Briefs/runs/YYYY-MM-DD/` |

### Phase 1 — parallel agents
- `gmail-intel` — replaces `gmail-to-vault-digest`
- `slack-intel` — new channel coverage
- `vault-pulse` — replaces `nightly-client-pulse`
- `codex-session-sync` — replaces `chat-to-vault-sync`
- `content-routines` — replaces `bok-law-social-content` + `linkedin-growth-engine` (Sunday branch)
- `domain-ads-seo` — replaces `book-site-seo-sweep` (Thursday branch) + daily ad blockers

### Phase 2 — sequential
- `memory-consolidator` — replaces `vault-integrity-sync`

## Last run (2026-06-08)

- All 6 parallel agents + consolidator executed
- Gmail MCP: unavailable (vault fallback)
- Slack MCP: unavailable
- Vault drift: 54 days since last client touch
- Output: `Daily-Briefs/competitive-task-today.md`

## Legacy crons — **retired**

Do not schedule these separately:

- ~~`nightly-client-pulse`~~
- ~~`gmail-to-vault-digest`~~
- ~~`vault-integrity-sync`~~
- ~~`chat-to-vault-sync`~~
- ~~`bok-law-social-content`~~
- ~~`linkedin-growth-engine`~~
- ~~`book-site-seo-sweep`~~

## Known gaps

- Connect Gmail + Slack MCP to automation for live intel
- Client `last_touched` frontmatter stale — refresh from June activity
- `10_Sessions/` capture empty until harness writes session notes
