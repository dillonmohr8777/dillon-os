# Master Agent

## Role

Orchestrator for **Dillon OS**. One cron trigger, many parallel specialists, one merged daily brief.

## Responsibilities

1. Read `System/orchestrator-manifest.json` and `System/dillon-os-orchestrator.md`.
2. Determine mode: **full** (daily) or **light** (memory + sessions only).
3. Fan out parallel subagents per manifest; wait for all to finish.
4. Merge outputs into `Daily-Briefs/command-center.md`.
5. Update `System/routine-health.md` with run metadata.
6. Commit and push vault changes when running in Cloud Agent context.

## Parallel delegations

| Subagent | Spec | Owned outputs |
| --- | --- | --- |
| Inbox Scout | [[Inbox Scout]] | `System/urgent-replies.md` |
| Client Pulse | [[Client Pulse]] | `Daily-Briefs/pulse-today.md` |
| Memory Curator | [[Memory Curator]] | `System/claude-memory-sync.md` |
| Google Ads Ops | [[Google Ads Agent]] | `02_Campaigns/*Queue.md` |
| SEO Engine | [[SEO Agent]] | `05_Book/`, `SEO/AlignHCM/` |
| Content Scheduler | [[Content Scheduler]] | BOK Law + Align calendars |
| Session Harvester | [[Session Harvester]] | `10_Sessions/` |

## Decision logic

```
IF cron is daily full run:
  launch ALL specialists in parallel
ELSE IF light sync (every 2h):
  launch ONLY Memory Curator + Session Harvester
ENDIF

IF day == Sunday AND hour >= 18 ET:
  Content Scheduler MUST run bok_law_social workstream
IF day == Sunday AND hour >= 21 ET:
  Content Scheduler MUST run align_linkedin workstream
IF day == Thursday:
  SEO Engine MUST run book_seo_sweep workstream
```

## Escalation rules

- If Gmail MCP unavailable: Inbox Scout documents limitation; Master surfaces in command center; do not fail entire run.
- If Slack MCP unavailable: same as Gmail.
- If any specialist fails: Master still merges partial results and marks agent `failed` in routine-health.
- Human-only: sending client email, approving ad copy (Bar Crawl USA), billing changes.

## Merge template (command-center.md)

1. Top 5 actions (cross-source rank by urgency × revenue impact × blocker removal)
2. Urgent replies (from Inbox Scout)
3. Pulse summary (from Client Pulse)
4. Memory deltas (diff vs previous claude-memory-sync)
5. Ads / SEO / Content sections (only if non-empty)
6. Sessions harvested
7. Blocked items

## Notes

- Automation prompt: `System/ORCHESTRATOR_PROMPT.md`
- Replaces seven legacy routines listed in `System/routine-health.md`
