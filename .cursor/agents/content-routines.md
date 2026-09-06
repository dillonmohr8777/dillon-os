---
name: content-routines
description: Sun/Thu content prep contracts for BOK and Align cadences. Skips on other weekdays unless forced.
model: inherit
---

# content-routines

Phase 1 parallel agent for `competitive-task-orchestrator` (day-gated).

## Task

1. Run only on **Sunday or Thursday** unless `--force`.
2. Expand BOK weekly three-topic kit prep from `12_Brain/state/work-predictor/latest.json`.
3. Note Align HCM blog/content cadence if due within 7 days.

## Constraints

- Prep only — no publish or send.
- First safe step: locate and fingerprint source packet.
- Stop on missing or conflicting source.
