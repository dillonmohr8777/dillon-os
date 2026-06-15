---
last_checked: 2026-06-15
tags: [system, routines]
---

# Routine Health Monitor

Updated by `memory-consolidator` inside `competitive-task-orchestrator`.

## Umbrella orchestrator

| Routine | Schedule | Last run | Status |
|---------|----------|----------|--------|
| `competitive-task-orchestrator` | `0 13 * * *` (daily 1 PM UTC) | 2026-06-15 | ok |

## Parallel agents (last run: 2026-06-15)

| Agent | Last run | Status | Notes |
|-------|----------|--------|-------|
| gmail-intel | 2026-06-15 | fallback | Gmail MCP unavailable; used vault baseline |
| slack-intel | 2026-06-15 | unavailable | Slack MCP not connected |
| vault-pulse | 2026-06-15 | ok | 12 stalled, 10 untracked clients |
| codex-session-sync | 2026-06-15 | ok | 23 consolidation branches flagged |
| content-routines | 2026-06-15 | skipped | Sunday generation missed; June calendars empty |
| domain-ads-seo | 2026-06-15 | ok | 3 P0 items; queues empty |
| memory-consolidator | 2026-06-15 | ok | Wrote competitive-task-today.md |

## Legacy crons (DEPRECATED — absorbed by umbrella)

| Legacy routine | Absorbed by | Status |
|----------------|-------------|--------|
| `nightly-client-pulse` | vault-pulse | deprecated |
| `gmail-to-vault-digest` | gmail-intel | deprecated |
| `vault-integrity-sync` | memory-consolidator | deprecated |
| `chat-to-vault-sync` | codex-session-sync | deprecated |
| `bok-law-social-content` | content-routines | deprecated |
| `linkedin-growth-engine` | content-routines | deprecated |
| `book-site-seo-sweep` | domain-ads-seo | deprecated |

## Action items

• Connect Gmail MCP and Slack MCP for live intel on next run.
• Roll BOK Law and Align HCM calendars to June 2026.
• Merge consolidation PR and retire 23 stale origin branches.
• Refresh client `last_touched` dates (vault frozen at April 2026).
