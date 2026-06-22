---
last_checked: 2026-06-22
last_orchestrator_run: 2026-06-22
tags: [system, routines]
---

# Routine Health Monitor

## Active (umbrella)

| Automation | Cron | Status | Output |
|------------|------|--------|--------|
| `competitive-task-orchestrator` | `0 13 * * *` ET | **active** — this run | `Daily-Briefs/competitive-task-today.md` |

Phase 1 lanes (parallel): `gmail-intel`, `slack-intel`, `vault-pulse`, `codex-session-sync`, `domain-ads-seo`, `content-routines`  
Phase 2 (sequential): `memory-consolidator`

| Lane | 2026-06-22 |
|------|------------|
| gmail-intel | yellow — MCP not connected; vault fallback |
| slack-intel | yellow — MCP not connected; vault fallback |
| vault-pulse | yellow — all client `last_touched` stale (April 2026) |
| codex-session-sync | yellow — session templates empty; no Codex exports in repo |
| domain-ads-seo | green — P0s queued from vault memory |
| content-routines | green — Sunday: Bok Law + Align LinkedIn drafted |
| memory-consolidator | green — brief written |

## Retired (disable in Cursor Automations UI)

- `nightly-client-pulse` → merged into `vault-pulse` + brief
- `gmail-to-vault-digest` → merged into `gmail-intel`
- `vault-integrity-sync` / `chat-to-vault-sync` → merged into `memory-consolidator` + `codex-session-sync`
- `bok-law-social-content` / `linkedin-growth-engine` → merged into `content-routines` (Sunday)
- `book-site-seo-sweep` → merged into `content-routines` (Thursday)

## Vault frontmatter expected

`client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`

## Notes

- Legacy `Daily-Briefs/pulse-today.md` kept for history; **open `competitive-task-today.md` daily**.
- After 3 green orchestrator runs with Gmail+Slack MCP, confirm legacy crons are disabled.
- **Next content gate:** Thursday 2026-06-26 — book SEO sweep.
