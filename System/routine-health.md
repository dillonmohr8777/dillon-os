---
last_orchestrator_run: 2026-08-27
last_checked: 2026-08-27
tags: [system, routines]
---

# Routine Health Monitor

**Canonical automation:** `company-os-umbrella` (replaces all legacy per-lane Cursor crons below).

Contract: [[System/competitive-task-definition]] · Spec: [[11_Agents/company-os-umbrella-spec]]

## Umbrella lane status (2026-08-27)

| Lane | Status | Last signal |
|------|--------|-------------|
| gmail-intel | yellow | vault-fallback (MCP not connected in cloud) |
| slack-intel | yellow | vault-fallback (`00_Inbox/slack/` captures through 2026-07-30) |
| vault-pulse | yellow | 5 stalled client overviews; frontmatter gaps |
| codex-session-sync | green | 6 session files; promotions written to daily brief |
| domain-ads-seo | red | Replenish billing, Fagan attribution, Shadow Meta |
| content-routines | skipped | Thursday book SEO — not executed this run |
| automation-health | yellow | duplicate branch debt; Hermes conflicts in queue |
| websites-scout | yellow | dossier-leads endpoint still open |
| outreach-scout | green | radar 2026-08-26 healthy |
| ads-scout | red | P0 stack populated |
| reporting-scout | yellow | sample report figures remain |
| memory-consolidator | green | `Daily-Briefs/competitive-task-today.md` written |

## Retired standalone crons (do not re-enable)

These are **superseded** by `company-os-umbrella`:

- `nightly-client-pulse`
- `gmail-to-vault-digest`
- `vault-integrity-sync`
- `chat-to-vault-sync`
- `bok-law-social-content`
- `linkedin-growth-engine`
- `book-site-seo-sweep`
- Separate `dillon-command` / `competitive-task-orchestrator` automations

## Local schedulers (surfaced, not replaced)

| Scheduler | Cadence | Check locally |
|-----------|---------|---------------|
| Claude-Autonomous-Daily-Driver | 15 min | `12_Brain/queue/claude-loop-<date>.jsonl` |
| Gmail/Slack bridges | ~15 min | `00_Inbox/` intake freshness |
| Prospect Radar Next 20 | Daily 5:20 AM ET | `Daily-Briefs/radar-*.md` |
| Codex crons | Various | `11_Agents/Rockbot Operating System/` estate |

## Notes

- First full umbrella run with unified 12-lane profile: 2026-08-27.
- Disable legacy Cursor automations after three consecutive green umbrella runs.
