---
tags: [automation, competitive-task, cursor]
schedule: "0 13 * * *"
replaces:
  - morning-loop
  - slack-intake-cron
  - client-pulse-cron
  - am-report-cron
  - plan-today-cron
  - comm-intel-ingest
  - content-routines-cron
---

# Competitive Task Orchestrator

**One cron. Six parallel agents. One ranked board.**

## Registration

| Field | Value |
|-------|-------|
| Automation ID | `competitive-task-orchestrator` |
| Schedule | `0 13 * * *` (daily, 1:00 PM UTC / 9:00 AM ET) |
| Repo | `dillon-os` |
| Branch | `cursor/competitive-task-consolidation-2e9a` |
| Skill | `.claude/skills/competitive-task-orchestrator/SKILL.md` |
| Prompt | `System/competitive-task-orchestrator-prompt.md` |
| Definition | `System/competitive-task-definition.md` |
| Runbook | `04_SOPs/competitive-task-orchestrator.md` |

## Parallel agent topology

```
                    ┌─────────────────┐
                    │   Orchestrator   │
                    │  (commander)     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │         │          │          │         │
   gmail-intel slack-intel vault-pulse codex-sync domain-ads content
        │         │          │          │         │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │ memory-consolidator │
                    └────────┬────────┘
                             │
              competitive-task-today.md
                    Dashboard.md ## Today
```

## Legacy crons to disable

After verifying two successful runs, disable these in Cursor Dashboard → Automations:

1. Morning loop (`handoffs/Morning Loop Scheduled Agent Setup.md`)
2. Standalone slack-intake
3. Standalone client-pulse
4. Standalone am-report
5. Standalone plan-today
6. Communication intelligence daily ingest
7. Sunday content-routines

## Outputs per run

- `Daily-Briefs/competitive-task-today.md`
- `Daily-Briefs/lanes/YYYY-MM-DD-*.md` (6 files)
- `12_Brain/state/competitive-task-orchestrator.json`
- Updated `Dashboard.md`

## MCP dependencies (optional)

| MCP | Lane | Fallback |
|-----|------|----------|
| Gmail | gmail-intel | vault captures |
| Slack | slack-intel | `00_Inbox/slack/` |

Runs succeed without MCP — blind spots are flagged, never fabricated.
