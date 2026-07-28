---
last_checked: 2026-07-28
last_orchestrator_run: 2026-07-28
tags: [system, routines]
---

# Routine Health Monitor

**Umbrella automation:** `competitive-task-orchestrator` — cron `0 13 * * *` (1:00 PM ET daily).

Legacy standalone crons are **retired** — merged into umbrella. Disable in Cursor UI if still active.

## Lane status (Run 35 — 2026-07-28)

| Lane | Agent | Status | Notes |
|------|-------|--------|-------|
| Gmail | gmail-intel | 🟡 fallback | MCP not connected; urgent-replies refreshed from vault |
| Slack | slack-intel | 🟡 fallback | MCP not connected; 7 actions from handoffs; connector reauth P0 |
| Vault | vault-pulse | 🟡 stale data | 13 overviews; all `last_touched` frozen since April 2026 |
| Sessions | codex-session-sync | 🟡 partial | 6 files; FB Ads stubs empty; Bridge post-Tori capture 15d overdue |
| Ads/SEO | domain-ads-seo | 🟡 drift | Google queue populated; Meta/testing/creative queues empty |
| Content | content-routines | ⚪ skipped | Tuesday — not Sunday/Thursday; Jul 28 drafts exist from Run 34 |
| Consolidation | memory-consolidator | 🟢 done | Brief + memory sync updated 2026-07-28 |

## Retired crons (disable in Cursor UI)

- `nightly-client-pulse` → vault-pulse
- `gmail-to-vault-digest` → gmail-intel
- `vault-integrity-sync` → memory-consolidator
- `chat-to-vault-sync` → codex-session-sync
- `bok-law-social-content` → content-routines (Sunday)
- `linkedin-growth-engine` → content-routines (Sunday)
- `book-site-seo-sweep` → content-routines (Thursday)

## Notes

- Run 35 on branch `cursor/competitive-task-consolidation-f2e5`.
- Gmail + Slack MCP reconnection is the highest-leverage infra fix.
- Vault frontmatter refresh needed when touching any client account.
- Next content-routines fire: Thursday 2026-07-31 (book SEO sweep + Jason/Sean EOM deadline).
