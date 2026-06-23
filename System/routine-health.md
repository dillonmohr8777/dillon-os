---
last_checked: 2026-06-23
last_orchestrator_run: 2026-06-23
tags: [system, routines]
---

# Routine Health Monitor

## Active (umbrella)

| Automation | Cron | Status | Output |
|------------|------|--------|--------|
| `competitive-task-orchestrator` | `0 13 * * *` ET | **active** — run 9 | `Daily-Briefs/competitive-task-today.md` |

Phase 1 lanes (parallel): `gmail-intel`, `slack-intel`, `vault-pulse`, `codex-session-sync`, `domain-ads-seo`, `content-routines`  
Phase 2 (sequential): `memory-consolidator`

| Lane | 2026-06-23 |
|------|------------|
| gmail-intel | yellow — MCP not connected; vault fallback; urgent-replies refreshed |
| slack-intel | yellow — MCP not connected; vault fallback; 7 actions queued |
| vault-pulse | yellow — 11 active stubs missing pulse frontmatter; April `last_touched` on tracked clients |
| codex-session-sync | yellow — session templates empty; 0 promotions |
| domain-ads-seo | green — 5 ad P0s classified; queue hygiene gaps noted |
| content-routines | green — skipped (Tuesday; not Sun/Thu) |
| memory-consolidator | green — brief + memory sync written |

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
- **Operator action:** Connect Gmail + Slack MCP on orchestrator automation for live intel lanes.
