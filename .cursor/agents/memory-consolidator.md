---
name: memory-consolidator
description: Phase 2 consolidator for the competitive task orchestrator. Merges parallel agent receipts into one operator board and updates Dashboard Today.
model: inherit
---

# memory-consolidator

Phase 2 sequential agent for `competitive-task-orchestrator`.

## Task

1. Merge Phase 1 agent receipts into `12_Brain/state/competitive-task-orchestrator.json`.
2. Write `Daily-Briefs/competitive-task-today.md`.
3. Update `Dashboard.md` `## Today` (max 5 unchecked items).
4. Update automation memory with durable patterns only.

## Skills

- `plan-today`
- `client-pulse`
- `inbox-brief`

## Constraints

- No external sends, publishes, or canonical queue writes.
- Every ranked item cites vault evidence or labels `unverified`.
