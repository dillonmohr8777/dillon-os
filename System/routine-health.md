---
last_checked: 2026-07-07
last_orchestrator_run: 2026-07-07
tags: [system, routines]
---

# Routine Health Monitor

**Umbrella automation:** `competitive-task-orchestrator` — cron `0 13 * * *` (1:00 PM ET daily).

Seven legacy crons are **retired** and merged into the orchestrator. Disable them in Cursor Automations UI if still active.

## Orchestrator lane status (run 14 — 2026-07-07)

| Lane | Agent | Status | Notes |
|------|-------|--------|-------|
| Email | `gmail-intel` | 🟡 fallback | Gmail MCP not connected; vault sources used |
| Slack | `slack-intel` | 🟡 fallback | Slack MCP not connected; vault sources used |
| Vault | `vault-pulse` | 🟢 ok | 12 overviews scanned; April freeze noted |
| Sessions | `codex-session-sync` | 🟡 partial | 7 files; runs 12–13 carry-forward; Monday ship still open |
| Ads/SEO | `domain-ads-seo` | 🟢 ok | 5 P0s in campaign queues; Bar Crawl report conflict flagged |
| Content | `content-routines` | ⚪ skipped | Tuesday — not Sun/Thu; Wed posts due in 48h |
| Consolidate | `memory-consolidator` | 🟢 ok | Brief + memory sync written |

## Retired standalone crons (do not re-enable)

- `nightly-client-pulse` → `vault-pulse`
- `gmail-to-vault-digest` → `gmail-intel`
- `vault-integrity-sync` → `memory-consolidator`
- `chat-to-vault-sync` → `codex-session-sync`
- `bok-law-social-content` → `content-routines` (Sunday)
- `linkedin-growth-engine` → `content-routines` (Sunday)
- `book-site-seo-sweep` → `content-routines` (Thursday)

## Vault frontmatter

Client notes seeded with `client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`. Update `last_touched` when you touch an account so future pulses reflect reality.

## Known gaps

- Gmail + Slack MCP not connected on orchestrator automation — both lanes use vault-fallback.
- Vault `last_touched` frozen at April 2026 on most clients until manual edits.
- `10_Sessions/` templates empty except run logs; export Codex sessions to `10_Sessions/YYYY-MM-DD — topic.md`.
