---
last_checked: 2026-06-17
tags: [system, routines]
---

# Routine Health Monitor

Updated by `memory-consolidator` inside `competitive-task-orchestrator`.

## Umbrella orchestrator

| Routine | Schedule | Last run | Status |
|---------|----------|----------|--------|
| `competitive-task-orchestrator` | `0 13 * * *` (daily 1 PM UTC) | 2026-06-17 | ok |

## Parallel agents (last run: 2026-06-17)

| Agent | Last run | Status | Notes |
|-------|----------|--------|-------|
| gmail-intel | 2026-06-17 | fallback | Gmail MCP unavailable; used vault baseline |
| slack-intel | 2026-06-17 | unavailable | Slack MCP not connected |
| vault-pulse | 2026-06-17 | ok | 13 stalled tracked + 10 untracked clients; June calendars active |
| codex-session-sync | 2026-06-17 | ok | 24 cursor/* branches flagged; session templates empty |
| content-routines | 2026-06-17 | ok | June 16–22 calendars current; BOK dates corrected |
| domain-ads-seo | 2026-06-17 | ok | 3 P0 items; queues empty; 10 Align HCM blogs ready |
| memory-consolidator | 2026-06-17 | ok | Wrote competitive-task-today.md |

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
• Merge consolidation PR on `e3cc` and retire ~24 stale origin branches.
• Refresh client `last_touched` dates (vault frozen at April 2026).
• Populate `02_Campaigns/` queues from client active-campaigns notes.
