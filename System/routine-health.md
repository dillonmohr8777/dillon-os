---
last_checked: 2026-07-30
last_orchestrator_run: 2026-07-30
tags: [system, routines]
---

# Routine Health Monitor

**Umbrella automation:** `competitive-task-orchestrator` — cron `0 13 * * *` (1:00 PM ET daily).

Legacy standalone crons are **retired** — merged into umbrella. Disable in Cursor UI if still active.

## Lane status (Run 37 — 2026-07-30)

| Lane | Agent | Status | Notes |
|------|-------|--------|-------|
| Gmail | gmail-intel | 🟡 fallback | MCP not connected; urgent-replies refreshed from vault |
| Slack | slack-intel | 🟡 fallback | MCP not connected; 7 actions from handoffs; connector reauth P0 (8d open) |
| Vault | vault-pulse | 🟡 stale data | 13 overviews; all `last_touched` frozen since April 2026 except Bridge |
| Sessions | codex-session-sync | 🟡 partial | 9 files; FB Ads stubs empty; Bridge post-Tori capture 17d overdue |
| Ads/SEO | domain-ads-seo | 🟡 drift | Google queue populated (7 open); Meta/testing/creative queues empty |
| Content | content-routines | ⚪ skipped | Wednesday — not Sunday/Thursday; **BOK Wisdom + Align SmartCare due TODAY** |
| Consolidation | memory-consolidator | 🟢 done | Brief + memory sync updated 2026-07-30 |

## Retired crons (disable in Cursor UI)

- `nightly-client-pulse` → vault-pulse
- `gmail-to-vault-digest` → gmail-intel
- `vault-integrity-sync` → memory-consolidator
- `chat-to-vault-sync` → codex-session-sync
- `bok-law-social-content` → content-routines (Sunday)
- `linkedin-growth-engine` → content-routines (Sunday)
- `book-site-seo-sweep` → content-routines (Thursday)

## Notes

- Run 37 on branch `cursor/competitive-task-consolidation-d2df`.
- Gmail + Slack MCP reconnection is the highest-leverage infra fix.
- Vault frontmatter refresh needed when touching any client account.
- **Next content-routines fire: Thursday 2026-07-31** (book SEO sweep + Jason/Sean EOM deadline + BOK Turn the Page).
