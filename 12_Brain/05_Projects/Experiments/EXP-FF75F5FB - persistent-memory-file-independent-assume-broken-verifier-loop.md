---
note_type: project
project_kind: experiment
experiment_id: EXP-FF75F5FB
status: proposed
experiment_stage: intake
created: 2026-07-31
updated: 2026-07-31
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for Persistent memory file + independent assume-broken verifier loop without weakening safety or existing capability."
next_action: "Identical refactoring task: with memory file solves in ≤ half the iterations of no-memory baseline; verifier flags at least one planted defect that generator missed"
review_on: 2026-07-31
verification_status: unverified
risk: medium
source_refs:[]
tags:
  - brain
  - project
  - experiment
  - automation
---

# Persistent memory file + independent assume-broken verifier loop

## Why this may matter

Engineering reports show loops without cross-iteration memory repeat failures; independent checker counters self-praise

## Expected benefit

Fewer wasted iterations and higher reliability on multi-step factory or refactor tasks

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Separate model instance or human scoring final PR
- **Acceptance test:** Identical refactoring task: with memory file solves in ≤ half the iterations of no-memory baseline; verifier flags at least one planted defect that generator missed
- **Rollback:** Disable memory write path and verifier agent; single-loop mode
- **Human gate:** Inspect memory file contents and verifier prompts for injection risk
- **Overlap:** General agent orchestration; pairs with Copilot/Playwright

## Evidence

- Source URL unavailable; keep unverified.

## Run history

- 2026-07-31: Added from Grok intelligence intake. No software installed or account authorized.
