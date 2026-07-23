---
last_checked: 2026-07-23
last_orchestrator_run: 2026-07-23
tags: [system, routines]
---

# Routine Health Monitor

**Umbrella automation:** `competitive-task-orchestrator` — cron `0 13 * * *` (1:00 PM ET daily).  
Replaces 7 legacy crons (see [[System/competitive-task-definition#Retired standalone crons]]).

## Lane status (run 30 — 2026-07-23)

| Lane | Status | Notes |
|------|--------|-------|
| gmail-intel | 🟡 fallback | Gmail MCP not connected; vault + urgent-replies |
| slack-intel | 🟡 fallback | Slack MCP not connected; handoffs merged |
| vault-pulse | 🟡 stale | 145 files; all `last_touched` frozen April 2026 |
| codex-session-sync | 🟡 partial | 24 sessions; Facebook Ads stubs empty |
| domain-ads-seo | 🟢 ok | 7 items in Google Ads queue (3H/2M/2L) |
| content-routines | 🟢 done | Thursday book SEO sweep → `05_Book/seo-sweep-2026-07-23.md` |
| memory-consolidator | 🟢 ok | Brief + sync + routine-health updated |

## Legacy crons (disable in Cursor UI)

- [ ] `nightly-client-pulse`
- [ ] `gmail-to-vault-digest`
- [ ] `vault-integrity-sync`
- [ ] `chat-to-vault-sync`
- [ ] `bok-law-social-content`
- [ ] `linkedin-growth-engine`
- [ ] `book-site-seo-sweep`

## Operator action

Connect Gmail + Slack MCP on the orchestrator automation to turn yellow lanes green.
