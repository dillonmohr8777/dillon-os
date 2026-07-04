---
last_checked: 2026-07-03
last_orchestrator_run: 2026-07-03
tags: [system, routines]
---

# Routine Health Monitor

**Umbrella automation:** `competitive-task-orchestrator` — cron `0 13 * * *` (1:00 PM ET daily).

Seven legacy crons are **retired** and merged into the orchestrator. Disable them in Cursor Automations UI if still active.

## Orchestrator lane status (run 10 — 2026-07-03)

| Lane | Agent | Status | Notes |
|------|-------|--------|-------|
| Email | `gmail-intel` | 🟡 fallback | Gmail MCP not connected; vault sources used |
| Slack | `slack-intel` | 🟡 fallback | Slack MCP not connected; vault sources used |
| Vault | `vault-pulse` | 🟢 ok | 13 overviews scanned; April freeze noted |
| Sessions | `codex-session-sync` | 🟡 partial | 5 files, 0 promotions; no Codex exports |
| Ads/SEO | `domain-ads-seo` | 🟢 ok | 5 P0s in campaign queues |
| Content | `content-routines` | ⚪ skipped | Friday — next Sunday 2026-07-06 |
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
- `10_Sessions/` templates empty; export Codex sessions to `10_Sessions/YYYY-MM-DD — topic.md`.
- Referenced content drafts (Bok Law, Align LinkedIn) missing from repo — memory-sync vs filesystem mismatch.
