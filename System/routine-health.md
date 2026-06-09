---
last_checked: 2026-06-09
tags: [system, routines]
---

# Routine Health Monitor

## Active orchestrator

**`competitive-task-orchestrator`** — cron `0 13 * * *` (1:00 PM ET daily)

Replaces all legacy routines below. One automation, parallel agents, one daily brief.

| Subagent | Replaces | Last run |
|----------|----------|----------|
| gmail-intel | gmail-to-vault-digest | 2026-06-09 (vault-fallback) |
| slack-intel | (new) | 2026-06-09 (no data) |
| vault-pulse | nightly-client-pulse | 2026-06-09 |
| codex-session-sync | chat-to-vault-sync | 2026-06-09 |
| content-routines | bok-law + linkedin + book SEO | 2026-06-09 (overdue flagged) |
| domain-ads-seo | (new) | 2026-06-09 |
| memory-consolidator | vault-integrity-sync | 2026-06-09 |

**Daily read:** `Daily-Briefs/competitive-task-today.md`
**Prompt:** `System/competitive-task-orchestrator-prompt.md`
**Agents:** `.cursor/agents/`

## Retired routines (disable separate crons)

- ~~`nightly-client-pulse`~~ → vault-pulse subagent
- ~~`gmail-to-vault-digest`~~ → gmail-intel subagent
- ~~`vault-integrity-sync`~~ → memory-consolidator subagent
- ~~`chat-to-vault-sync`~~ → codex-session-sync subagent
- ~~`bok-law-social-content`~~ → content-routines subagent (Sunday)
- ~~`linkedin-growth-engine`~~ → content-routines subagent (Sunday)
- ~~`book-site-seo-sweep`~~ → content-routines subagent (Thursday)

## Known gaps (2026-06-09)

- Gmail MCP not available on automation VM — intel frozen at 2026-04-15
- Slack MCP not connected — no Slack intel in vault
- Vault `last_touched` fields stale across all clients (55+ days)
- Campaign optimization queues empty — need live ad account pull
- Agent Memory files under `01_Clients/` are blank templates

## Run log

| Date | Status | Notes |
|------|--------|-------|
| 2026-06-09 | OK (vault-fallback) | Umbrella orchestrator built. 7 agents created. Legacy crons retired. |
