---
last_checked: 2026-06-21
tags: [system, routines]
---

# Routine Health Monitor

All routines consolidated under one umbrella orchestrator. Seven legacy crons are **deprecated** as of 2026-06-14.

## Umbrella orchestrator

| Field | Value |
|-------|-------|
| Automation ID | `competitive-task-orchestrator` |
| Cron | `0 13 * * *` (daily 1:00 PM UTC) |
| Prompt | `System/competitive-task-orchestrator-prompt.md` |
| Definition | `System/competitive-task-definition.md` |
| Daily read | `Daily-Briefs/competitive-task-today.md` |
| Last run | 2026-06-21 |

## Parallel agents (last_run)

| Agent | Last run | Status | Output |
|-------|----------|--------|--------|
| gmail-intel | 2026-06-21 | fallback | `System/urgent-replies.md` |
| slack-intel | 2026-06-21 | unavailable | `System/slack-intel.md` |
| vault-pulse | 2026-06-21 | ok | `Daily-Briefs/pulse-today.md` |
| codex-session-sync | 2026-06-21 | ok | `System/session-handoff.md` |
| content-routines | 2026-06-21 | ok | BOK + Align calendars assessed |
| domain-ads-seo | 2026-06-21 | ok | `System/ads-seo-pulse.md` |
| memory-consolidator | 2026-06-21 | ok | `Daily-Briefs/competitive-task-today.md` |

## Legacy crons (deprecated — do not re-enable)

| Legacy routine | Absorbed by | Status |
|----------------|-------------|--------|
| `nightly-client-pulse` | `vault-pulse` | deprecated |
| `gmail-to-vault-digest` | `gmail-intel` | deprecated |
| `vault-integrity-sync` | `memory-consolidator` | deprecated |
| `chat-to-vault-sync` | `codex-session-sync` | deprecated |
| `bok-law-social-content` | `content-routines` | deprecated |
| `linkedin-growth-engine` | `content-routines` | deprecated |
| `book-site-seo-sweep` | `domain-ads-seo` | deprecated |

## Known gaps

• Gmail MCP unavailable — vault email intel frozen at 2026-04-15
• Slack MCP unavailable — no vault mirror for Slack history
• `02_Campaigns/` queue files are empty templates
• `10_Sessions/` and `Agent Memory.md` files empty
• June 16–22 content calendars claimed in prior runs but absent from vault calendar files
• ~25 stale `cursor/competitive-task-consolidation-*` branches on origin

## Notes

- Vault is seeded with frontmatter fields the routines expect (`client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`).
- Connect Gmail + Slack MCP to enable live intel on future runs.
- Sunday 2026-06-22: `content-routines` will generate BOK Law + Align HCM week of June 23–29.
