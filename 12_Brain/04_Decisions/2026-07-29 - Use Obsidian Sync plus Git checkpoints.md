---
note_type: decision
status: active
created: 2026-07-29
updated: 2026-07-29
owner: Dillon Mohr
decision_date: 2026-07-29
review_on: 2026-08-29
verification_status: verified
source_refs:
  - https://obsidian.md/help/sync/security
  - "[[12_Brain/09_Ops/Runbook]]"
supersedes:
tags:
  - brain
  - decision
  - sync
  - git
---

# Use Obsidian Sync plus Git checkpoints

## Context

Dillon needs the same vault on desktop and mobile while agents need diff,
checkpoint, and rollback evidence.

## Decision

Use Obsidian Sync as the device-sync layer and Git as the agent checkpoint and
review layer.

## Rationale

Sync provides encrypted device continuity and version history. Git provides
reviewable diffs and controlled checkpoints. Neither replaces the other.

## Consequences

- Agent writes use a bounded lease after Sync is current.
- Large changes are verified before Sync and Git checkpointing.
- Conflicts preserve both versions until meaning is reconciled.
- Secrets remain outside both systems.

## Reversal trigger

Revisit if concurrent editors create repeated conflicts or if the vault moves
to an official headless-sync deployment with equivalent review controls.
