---
last_checked: 2026-07-31
last_orchestrator_run: 2026-07-31
tags: [system, routines]
---

# Routine Health Monitor

**Umbrella automation:** `competitive-task-orchestrator` — cron `0 13 * * *` (1:00 PM ET daily).

Legacy standalone crons are **retired** — merged into umbrella. Disable in Cursor UI if still active.

## Lane status (Run 38 — 2026-07-31)

| Lane | Agent | Status | Notes |
|------|-------|--------|-------|
| Gmail | gmail-intel | 🟡 fallback | MCP not connected; urgent-replies refreshed from vault + source-intake-2026-07-30 |
| Slack | slack-intel | 🟡 fallback | MCP not connected; 7 actions from handoffs; connector reauth P0 (9d open) |
| Vault | vault-pulse | 🟡 stale data | 14 overviews; most `last_touched` frozen since April 2026 |
| Sessions | codex-session-sync | 🟡 partial | 11 files; FB Ads stubs empty; Bridge post-Tori capture 18d overdue |
| Ads/SEO | domain-ads-seo | 🟡 drift | Google queue empty; Replenish billing block from Jul 30 intake |
| Content | content-routines | ⚪ skipped | Friday — not Sunday/Thursday; **book SEO sweep missed yesterday** |
| Consolidation | memory-consolidator | 🟢 done | Brief + memory sync updated 2026-07-31 |

## Retired crons (disable in Cursor UI)

- `nightly-client-pulse` → vault-pulse
- `gmail-to-vault-digest` → gmail-intel
- `vault-integrity-sync` → memory-consolidator
- `chat-to-vault-sync` → codex-session-sync
- `bok-law-social-content` → content-routines (Sunday)
- `linkedin-growth-engine` → content-routines (Sunday)
- `book-site-seo-sweep` → content-routines (Thursday)

## Notes

- Run 38 on branch `cursor/competitive-task-consolidation-ab20`.
- Gmail + Slack MCP reconnection is the highest-leverage infra fix.
- Vault frontmatter refresh needed when touching any client account.
- **Next content-routines fire: Sunday 2026-08-02** (BOK social + Align LinkedIn).
