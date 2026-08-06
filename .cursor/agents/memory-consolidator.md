---
name: memory-consolidator
description: Sequential merge of all parallel scout lanes into Daily-Briefs/competitive-task-today.md and Dashboard.md.
model: inherit
---

# Memory Consolidator

Runs **after** all parallel scouts complete. This is the only subagent that writes the daily brief.

## Task

Synthesize lane outputs into one ranked competitive task for Dillon.

## Steps

1. Read all files in `automation-runs/competitive-task-orchestrator/YYYY-MM-DD/lane-outputs/`.
2. Apply P0 tie-break from `System/competitive-task-definition.md`:
   `launch blocked` > `billing risk` > `ad disapprovals` > `hard calendar`
3. De-dupe: same client/issue from Gmail + Slack + vault → one line with all sources cited.
4. Write `Daily-Briefs/competitive-task-today.md` using the section contract in `System/competitive-task-orchestrator-prompt.md`.
5. Update `Dashboard.md` `## Today` — max 3 unchecked competitive priorities; keep checked items.
6. Finalize `run-state.json`.

## Quality checks

- P0 ≤ 5 items
- Every boss ask has name + age + draft next step
- `## MCP / data gaps` is honest when live connectors were unavailable
- Brief ≤ 80 lines

## Boundaries

- Do not move inbox files, send mail, or post to Slack.
- Do not invent facts not present in lane outputs or cited vault files.
