---
last_checked: 2026-07-27
last_orchestrator_run: 2026-07-27
tags: [system, routines]
---

# Routine Health Monitor

**Umbrella automation:** `competitive-task-orchestrator` — cron `0 13 * * *` (1:00 PM ET daily).

Legacy standalone crons are **retired** — merged into umbrella. Disable in Cursor UI if still active.

## Lane status (Run 34 — 2026-07-27)

| Lane | Agent | Status | Notes |
|------|-------|--------|-------|
| Gmail | gmail-intel | 🟡 fallback | MCP not connected; urgent-replies refreshed from vault |
| Slack | slack-intel | 🟡 fallback | MCP not connected; 7 actions from handoffs; connector reauth P0 |
| Vault | vault-pulse | 🟡 stale data | 13 overviews; all `last_touched` frozen since April 2026 |
| Sessions | codex-session-sync | 🟡 partial | 6 files; FB Ads stubs empty; Bridge post-Tori capture overdue |
| Ads/SEO | domain-ads-seo | 🟡 drift | Campaign queues empty; P0s in client overviews only |
| Content | content-routines | 🟢 done | Sunday — BOK + Align week of Jul 28 drafted |
| Consolidation | memory-consolidator | 🟢 done | Brief + memory sync updated 2026-07-27 |

## Retired crons (disable in Cursor UI)

- `nightly-client-pulse` → vault-pulse
- `gmail-to-vault-digest` → gmail-intel
- `vault-integrity-sync` → memory-consolidator
- `chat-to-vault-sync` → codex-session-sync
- `bok-law-social-content` → content-routines (Sunday)
- `linkedin-growth-engine` → content-routines (Sunday)
- `book-site-seo-sweep` → content-routines (Thursday)

## Notes

- First full umbrella run on branch `cursor/competitive-task-consolidation-ef65` (Run 34).
- Gmail + Slack MCP reconnection is the highest-leverage infra fix.
- Vault frontmatter refresh needed when touching any client account.
