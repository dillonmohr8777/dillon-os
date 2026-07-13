---
last_checked: 2026-07-13
last_orchestrator_run: 2026-07-13
tags: [system, routines]
---

# Routine Health Monitor

All legacy standalone crons are **retired** and merged into `competitive-task-orchestrator` (cron `0 13 * * *`).

## Umbrella orchestrator

| Lane | Status | Last run | Notes |
|------|--------|----------|-------|
| gmail-intel | 🟡 fallback | 2026-07-13 | MCP not connected; using `System/urgent-replies.md` |
| slack-intel | 🟡 fallback | 2026-07-13 | MCP not connected; using `System/slack-action-queue.md` |
| vault-pulse | 🟢 ok | 2026-07-13 | 13 overviews scanned; frontmatter frozen April 2026 |
| codex-session-sync | 🟢 ok | 2026-07-13 | No new exports; runs 12–20 indexed |
| domain-ads-seo | 🟢 ok | 2026-07-13 | 3 High / 2 Medium / 2 Low in Google Ads queue |
| content-routines | ⚪ skipped | 2026-07-13 | Monday — not Sun/Thu; Jul 14 drafts from run 19 |
| memory-consolidator | 🟢 ok | 2026-07-13 | Brief + claude-memory-sync updated |

## Retired crons (disable in Cursor UI if still active)

- `nightly-client-pulse` → vault-pulse lane
- `gmail-to-vault-digest` → gmail-intel lane
- `vault-integrity-sync` → memory-consolidator lane
- `chat-to-vault-sync` → memory-consolidator lane
- `bok-law-social-content` → content-routines (Sunday)
- `linkedin-growth-engine` → content-routines (Sunday)
- `book-site-seo-sweep` → content-routines (Thursday)

## Operator action

Open `Daily-Briefs/competitive-task-today.md` after 1 PM ET. Execute P0 stack top to bottom.

## Known gaps

- Gmail + Slack MCP not connected on cloud runner — both lanes use vault fallback
- Vault `last_touched` frozen at April 2026 on most M360 clients; update when you touch a note
- Codex session export path absent on cloud runner; handoff refs Windows paths on 64GB machine
