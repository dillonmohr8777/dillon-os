---
last_checked: 2026-07-24
last_orchestrator_run: 2026-07-24
orchestrator_run: 31
tags: [system, routines]
---

# Routine Health Monitor

**Umbrella automation:** `competitive-task-orchestrator` — cron `0 13 * * *` (1:00 PM ET daily).

Seven legacy crons are **retired** and merged into the umbrella. Disable them in Cursor UI if still active (see [[System/competitive-task-definition#Retired standalone crons]]).

## Lane status (run 31 — 2026-07-24)

| Lane | Status | Notes |
|------|--------|-------|
| gmail-intel | 🟡 fallback | MCP not connected; urgent-replies refreshed from vault |
| slack-intel | 🟡 fallback | MCP not connected; slack-action-queue refreshed from vault + handoffs |
| vault-pulse | 🟡 stale data | 145 files scanned; `last_touched` frozen April 2026 on M360 accounts |
| codex-session-sync | 🟡 partial | 6 session files; Facebook Ads stubs empty; runs 12–30 on prior branch |
| domain-ads-seo | 🟢 ok | 7 items in Google Ads queue tracked |
| content-routines | ⚪ skipped | Friday — not Sun/Thu; next book SEO sweep 2026-07-30 |
| memory-consolidator | 🟢 ok | Brief + memory sync written |

## Retired standalone crons (disable in Cursor UI)

- `nightly-client-pulse`
- `gmail-to-vault-digest`
- `vault-integrity-sync`
- `chat-to-vault-sync`
- `bok-law-social-content`
- `linkedin-growth-engine`
- `book-site-seo-sweep`

## Daily operator checklist

1. Open `Daily-Briefs/competitive-task-today.md` after 1 PM ET.
2. Execute P0 stack top to bottom.
3. Check `System/urgent-replies.md` for email-specific wording.
4. Update client note frontmatter when you touch an account (`last_touched`, `next_action`).

## Unblock actions

- Connect **Gmail MCP** + **Slack MCP** on the orchestrator automation for live intel.
- Reauth Codex Slack connector per `handoffs/windows-6gb-slack-codex-reauth-2026-07-22.md`.
- Export Codex session logs to `10_Sessions/` on 64GB machine.
