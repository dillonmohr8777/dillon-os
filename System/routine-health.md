---
last_checked: 2026-06-16
tags: [system, routines]
---

# Routine Health Monitor

Updated by `memory-consolidator` inside `competitive-task-orchestrator`.

## Umbrella orchestrator

| Routine | Schedule | Last run | Status |
|---------|----------|----------|--------|
| `competitive-task-orchestrator` | `0 13 * * *` (daily 1 PM UTC) | 2026-06-16 | ok |

## Parallel agents (last run: 2026-06-16)

| Agent | Last run | Status | Notes |
|-------|----------|--------|-------|
| gmail-intel | 2026-06-16 | fallback | Gmail MCP unavailable; used vault baseline |
| slack-intel | 2026-06-16 | unavailable | Slack MCP not connected |
| vault-pulse | 2026-06-16 | ok | 23 stalled/untracked clients; vault frozen at April 2026 |
| codex-session-sync | 2026-06-16 | ok | ~22 consolidation branches flagged |
| content-routines | 2026-06-16 | ok | Generated BOK Law + Align HCM June 16–22 calendars |
| domain-ads-seo | 2026-06-16 | ok | 3 P0 items; queues empty; 10 Align HCM blogs ready |
| memory-consolidator | 2026-06-16 | ok | Wrote competitive-task-today.md |

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
• Merge consolidation PR on `809c` and retire ~22 stale origin branches.
• Refresh client `last_touched` dates (vault frozen at April 2026).
• Populate `02_Campaigns/` queues from client active-campaigns notes.
