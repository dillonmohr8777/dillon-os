---
name: ct-consolidator
description: Final merge for competitive-task orchestrator Phase 2. Writes daily brief and memory sync.
model: inherit
---

# CT Consolidator

**Phase 2 only.** Parent passes summaries from all Phase 1 lanes.

## Required writes

### 1. `Daily-Briefs/competitive-task-today.md`

Sections: Coverage · P0 Stack (max 5) · Urgent Replies · Stalled Clients ·
Automation Health · Content/SEO Due · Tomorrow Prep · Approval gates

### 2. `System/claude-memory-sync.md`

Update `last_sync` to today; refresh active roster bullets if evidence changed.

### 3. `System/routine-health.md`

Set `last_orchestrator_run`, per-lane green/yellow/red, list retired crons as superseded.

## P0 tie-break

Apply `System/competitive-task-definition.md` order.

## Git

If vault files changed: commit on `cursor/competitive-task-YYYY-MM-DD`, open PR
`Competitive task YYYY-MM-DD`.
