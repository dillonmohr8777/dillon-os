---
last_checked: 2026-06-18
tags: [system, routines]
---

# Routine Health Monitor

All routines consolidated under **one umbrella cron**: `competitive-task-orchestrator` at `0 13 * * *` (1:00 PM UTC daily).

Seven legacy crons are **deprecated** (see `System/competitive-task-definition.md`).

## Last run — 2026-06-18

| Subagent | Status | Last run | Output |
|----------|--------|----------|--------|
| gmail-intel | fallback | 2026-06-18 | `System/urgent-replies.md` |
| slack-intel | unavailable | 2026-06-18 | `System/slack-intel.md` |
| vault-pulse | ok | 2026-06-18 | `Daily-Briefs/pulse-today.md` |
| codex-session-sync | ok | 2026-06-18 | `System/session-handoff.md` |
| content-routines | ok | 2026-06-18 | BOK + Align calendars; book SEO swept |
| domain-ads-seo | ok | 2026-06-18 | `System/ads-seo-pulse.md` |
| memory-consolidator | ok | 2026-06-18 | `Daily-Briefs/competitive-task-today.md` |

**Orchestrator:** `competitive-task-orchestrator` — 2026-06-18T13:02Z on branch `cursor/competitive-task-consolidation-4ead`

## Legacy crons (retired)

| Legacy routine | Absorbed by | Status |
|----------------|-------------|--------|
| `nightly-client-pulse` | `vault-pulse` | deprecated |
| `gmail-to-vault-digest` | `gmail-intel` | deprecated |
| `vault-integrity-sync` | `memory-consolidator` | deprecated |
| `chat-to-vault-sync` | `codex-session-sync` | deprecated |
| `bok-law-social-content` | `content-routines` | deprecated |
| `linkedin-growth-engine` | `content-routines` | deprecated |
| `book-site-seo-sweep` | `domain-ads-seo` / `content-routines` | deprecated |

## Notes

- Connect Gmail + Slack MCP to upgrade gmail-intel and slack-intel from fallback to live scan.
- Dillon reads only `Daily-Briefs/competitive-task-today.md` each morning.
