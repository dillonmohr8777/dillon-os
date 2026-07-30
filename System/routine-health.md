---
last_checked: 2026-07-26
last_orchestrator_run: 2026-07-26
tags: [system, routines]
---

# Routine Health Monitor

All legacy standalone crons are **retired** — replaced by `competitive-task-orchestrator` (cron `0 13 * * *`).

## Orchestrator lane status (run 33 — 2026-07-26)

| Lane | Status | Notes |
|------|--------|-------|
| gmail-intel | yellow | vault-fallback; MCP not connected |
| slack-intel | yellow | vault-fallback; MCP not connected; Codex OAuth rejected |
| vault-pulse | yellow | 13 overviews tracked; 0 moved in 48h |
| codex-session-sync | yellow | 16 sessions; no exports since Jul 15 |
| domain-ads-seo | green | 7 queue items; counts refreshed |
| content-routines | skipped | Saturday — not Sun/Thu |
| memory-consolidator | green | brief + sync written |

## Retired crons (disable in Cursor UI if still active)

- `nightly-client-pulse`
- `gmail-to-vault-digest`
- `vault-integrity-sync`
- `chat-to-vault-sync`
- `bok-law-social-content`
- `linkedin-growth-engine`
- `book-site-seo-sweep`

## Notes

- Next content-routine day: **Sunday 2026-07-27** (BOK + Align generation).
- Next book SEO sweep: **Thursday 2026-07-31**.
- Connect Gmail + Slack MCP on orchestrator automation for live intel.
