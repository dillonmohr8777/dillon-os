---
last_checked: 2026-06-19
tags: [system, routines]
---

# Routine Health Monitor

**Umbrella orchestrator active.** Seven legacy crons are deprecated. One automation handles all parallel intel + consolidation.

## Umbrella

| Automation | Schedule | Status | Last run |
|------------|----------|--------|----------|
| `competitive-task-orchestrator` | `0 13 * * *` (daily 1:00 PM UTC) | active | 2026-06-19 |

## Parallel agents (inside orchestrator)

| Agent | Legacy cron absorbed | Last run | Status |
|-------|---------------------|----------|--------|
| gmail-intel | `gmail-to-vault-digest` | 2026-06-19 | fallback (Gmail MCP unavailable) |
| slack-intel | (new) | 2026-06-19 | unavailable (Slack MCP not connected) |
| vault-pulse | `nightly-client-pulse` | 2026-06-19 | ok |
| codex-session-sync | `chat-to-vault-sync` | 2026-06-19 | ok |
| content-routines | `bok-law-social-content`, `linkedin-growth-engine` | 2026-06-19 | ok (calendars current; book SEO skipped) |
| domain-ads-seo | `book-site-seo-sweep` (partial) | 2026-06-19 | ok |
| memory-consolidator | `vault-integrity-sync` | 2026-06-19 | ok |

## Deprecated legacy crons (do not re-enable)

- `nightly-client-pulse`
- `gmail-to-vault-digest`
- `vault-integrity-sync`
- `chat-to-vault-sync`
- `bok-law-social-content`
- `linkedin-growth-engine`
- `book-site-seo-sweep`

## Notes

- Vault client `overview.md` frontmatter frozen at April 2026. Connect Gmail + Slack MCP for live intel.
- `02_Campaigns/` queue files are empty templates.
- Definition: `System/competitive-task-definition.md`
- Orchestrator prompt: `System/competitive-task-orchestrator-prompt.md`
- Daily read: `Daily-Briefs/competitive-task-today.md`
