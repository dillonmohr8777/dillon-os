---
last_checked: 2026-07-20
last_orchestrator_run: 2026-07-20
tags: [system, routines]
---

# Routine Health Monitor

All legacy standalone crons are **retired** and merged into `competitive-task-orchestrator` (cron `0 13 * * *`).

## Umbrella orchestrator

| Lane | Status | Last run | Notes |
|------|--------|----------|-------|
| gmail-intel | 🟡 fallback | 2026-07-20 | MCP not connected; using `System/urgent-replies.md` |
| slack-intel | 🟡 fallback | 2026-07-20 | MCP not connected; using `System/slack-action-queue.md` |
| vault-pulse | 🟢 ok | 2026-07-20 | 143 files scanned; frontmatter frozen April 2026 |
| codex-session-sync | 🟢 ok | 2026-07-20 | 21 sessions; run 27 on 9c21 branch |
| domain-ads-seo | 🟢 ok | 2026-07-20 | 3 High / 2 Medium / 2 Low in Google Ads queue |
| content-routines | 🟢 ok | 2026-07-20 | Sunday — verified Jul 21 BOK + Align drafts on disk |
| memory-consolidator | 🟢 ok | 2026-07-20 | Brief + claude-memory-sync updated (run 27) |

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
- Facebook Ads session stubs empty — populate from Codex export on 64GB machine
- Bridge Tori meeting outcome not captured post-2026-07-13 (7 days overdue)
- Book site email capture endpoint dead — blocks subscriber growth
- `05_Book/seo-sweep-2026-07-16.md` referenced but missing from vault
