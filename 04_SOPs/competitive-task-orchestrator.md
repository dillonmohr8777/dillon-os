---
note_type: sop
status: active
created: 2026-08-09
updated: 2026-08-09
owner: Dillon Mohr
area: automation
tags: [sop, orchestrator, competitive-task]
---

# Competitive Task Orchestrator

## Purpose

One daily automation with parallel agents replaces seven fragmented crons. Dillon
gets one brief and one PR instead of scattered outputs.

## Operator checklist

1. Confirm Cursor Automation `competitive-task-orchestrator` is scheduled `0 13 * * *`.
2. Disable legacy crons listed in `System/competitive-task-orchestrator-prompt.md`
   after three consecutive green runs.
3. Review the morning PR on your phone; approve Tier-1 batch on the 64GB machine if needed.

## Manual run

```bash
node _os/automation/bin/command-loop.js plan
# spawn lane agents per skill
node _os/automation/bin/command-loop.js board
node _os/automation/bin/command-loop.js finalize --status ok
```

## Artifacts

| Path | What |
|------|------|
| `Daily-Briefs/competitive-task-today.md` | The one daily brief |
| `automation-runs/competitive-task-orchestrator/YYYY-MM-DD/` | Run plan, board, lane JSON |
| `12_Brain/state/competitive-task-orchestrator.json` | Last run state |

## Escalation

- Gmail/Slack MCP down → vault fallback; note gap in brief
- P0 billing/at_risk → surface first on board
- Tier 2 action needed → queue in `tier2-queue.md`, never auto-execute

## Links

- [[System/competitive-task-definition|Competitive Task Definition]]
- [[11_Agents/Master Agent|Master Agent]]
- [[12_Brain/concepts/Competitive Task|Competitive Task concept]]
