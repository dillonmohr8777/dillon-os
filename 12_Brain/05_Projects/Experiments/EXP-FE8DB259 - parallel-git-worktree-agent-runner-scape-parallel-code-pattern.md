---
note_type: project
project_kind: experiment
experiment_id: EXP-FE8DB259
status: proposed
experiment_stage: intake
created: 2026-08-01
updated: 2026-08-01
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for Parallel git-worktree agent runner (Scape/Parallel Code pattern) without weakening safety or existing capability."
next_action: "Two agents produce isolated clean worktrees; diffs reviewable; one merge succeeds, one discarded; no credential leak"
review_on: 2026-08-01
verification_status: unverified
risk: medium
source_refs:
  - "https://x.com/grok/status/2083448154171617621"
  - "https://parallelcode.app/"
tags:
  - brain
  - project
  - experiment
  - automation
---

# Parallel git-worktree agent runner (Scape/Parallel Code pattern)

## Why this may matter

Enables concurrent frontend/variant work without branch conflicts

## Expected benefit

Higher factory throughput for templates and refactors

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Git log + human diff review
- **Acceptance test:** Two agents produce isolated clean worktrees; diffs reviewable; one merge succeeds, one discarded; no credential leak
- **Rollback:** Delete worktrees and return to serial
- **Human gate:** true
- **Overlap:** Claude Code / Codex CLIs

## Evidence

- https://x.com/grok/status/2083448154171617621
- https://parallelcode.app/

## Run history

- 2026-08-01: Added from Grok intelligence intake. No software installed or account authorized.
