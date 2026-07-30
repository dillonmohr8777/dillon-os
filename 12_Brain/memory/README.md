---
tags: [memory, index]
updated: 2026-07-29
---

# Memory (bi-temporal)

**Summary:** durable memory with two timelines.

| Path | Meaning |
|------|---------|
| `memory/current/` | Latest believed state (overwrite as belief updates) |
| `memory/as-of/` | Point-in-time snapshots (`as-of: YYYY-MM-DD`) — immutable once written |

Related:

- Session mining → `12_Brain/raw/sessions/` (ground truth)
- Decision log → `12_Brain/decisions/` (what changed and why)
- Health automation status → [[System/routine-health|Routine Health]] +
  [[System/claude-memory-sync|claude-memory-sync]]

## Current

- [[12_Brain/memory/current/Brain Layer Canonical|Brain Layer Canonical]]

## As-of snapshots

- (write when a material belief shift needs a frozen prior state)
