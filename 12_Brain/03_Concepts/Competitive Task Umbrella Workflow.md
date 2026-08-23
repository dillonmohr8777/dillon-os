---
note_type: concept
status: active
created: 2026-08-23
updated: 2026-08-23
source_refs:
  - "[[System/competitive-task-definition]]"
  - "[[04_SOPs/competitive-task-orchestrator]]"
  - "[[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]]"
tags: [brain, automation, orchestration]
---

# Competitive Task Umbrella Workflow

One scheduled Cursor automation runs parallel intel agents at 1 PM ET, then one
consolidator writes the operator brief. Dillon opens a single file instead of
checking seven crons.

## Architecture

```mermaid
flowchart TB
  subgraph phase1 [Phase 1 Parallel]
    G[gmail-intel]
    S[slack-intel]
    V[vault-pulse]
    C[codex-session-sync]
    A[domain-ads-seo]
    R[content-routines]
  end
  subgraph phase2 [Phase 2 Sequential]
    M[memory-consolidator]
  end
  subgraph outputs [Operator outputs]
    B[competitive-task-today.md]
    U[urgent-replies.md]
    Q[slack-action-queue.md]
    H[routine-health.md]
  end
  G --> M
  S --> M
  V --> M
  C --> M
  A --> M
  R --> M
  M --> B
  M --> U
  M --> Q
  M --> H
```

## What it replaces

Seven operator-facing crons merged into `competitive-task-orchestrator`. See
[[System/competitive-task-definition#Retired standalone crons]].

## What stays separate

- **Claude daily driver** — 54 bounded routines every 15 min; receipts, not operator UI.
- **Prospect radar** — daily factory output; separate `radar-*.md` brief.
- **64GB morning orchestrator** — local Chrome-tab execution; approval board when on machine.

Codex/Marketing Chief remains sole canonical writer; this workflow is read/analyze/draft only until approval.
