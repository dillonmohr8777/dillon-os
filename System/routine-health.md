---
last_checked: 2026-07-09
tags: [system, routines]
---

# Routine Health Monitor

**Umbrella automation:** `competitive-task-orchestrator` — cron `0 13 * * *` (1:00 PM America/New_York).

Legacy crons below are **retired** — disable in Cursor UI if still active.

## Last orchestrator run

- **Date:** 2026-07-09 (run 16)
- **Branch:** `cursor/competitive-task-consolidation-0f4e`
- **Brief:** [[Daily-Briefs/competitive-task-today]]

## Lane status

| Lane | Agent | Status | Notes |
|------|-------|--------|-------|
| Gmail | gmail-intel | yellow | MCP not connected — vault-fallback |
| Slack | slack-intel | yellow | MCP not connected — vault-fallback |
| Vault pulse | vault-pulse | yellow | 12 overviews; all `last_touched` frozen April 2026 |
| Sessions | codex-session-sync | green | 9 files scanned; runs 12–15 indexed |
| Ads/SEO | domain-ads-seo | yellow | 5 P0s backfilled into Google Ads queue |
| Content | content-routines | green | Thursday book SEO sweep done |
| Consolidation | memory-consolidator | green | brief + memory sync written |

## Retired crons (merged into umbrella)

- `nightly-client-pulse`
- `gmail-to-vault-digest`
- `vault-integrity-sync`
- `chat-to-vault-sync`
- `bok-law-social-content`
- `linkedin-growth-engine`
- `book-site-seo-sweep`

## Action items

- [ ] Connect Gmail + Slack MCP on orchestrator automation
- [ ] Disable 7 legacy crons in Cursor UI if still active
- [ ] Operator: update `last_touched` on client notes when touched
- [ ] Operator: ship BOK + Align content drafts (overdue)
