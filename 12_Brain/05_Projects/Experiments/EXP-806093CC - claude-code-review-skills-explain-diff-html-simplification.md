---
note_type: project
project_kind: experiment
experiment_id: EXP-806093CC
status: proposed
experiment_stage: intake
created: 2026-08-04
updated: 2026-08-04
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for Claude Code review skills (explain-diff-html + simplification) without weakening safety or existing capability."
next_action: "On fixed PR fixture, skill outputs (1) accurate diff summary, (2) quiz/checklist; second model scores factual accuracy ≥4/5 and no secrets from env/.env examples appear."
review_on: 2026-08-04
verification_status: unverified
risk: low
source_refs:
  - "https://gist.github.com/geoffreylitt/a29df1b5f9865506e8952488eac3d524"
  - "https://github.com/ayghri/i-have-adhd"
tags:
  - brain
  - project
  - experiment
  - automation
---

# Claude Code review skills (explain-diff-html + simplification)

## Why this may matter

In-window practitioner reports skills fix over-verbose Opus output and turn diffs into quizzable explanations for better handoff.

## Expected benefit

Faster, higher-signal code review and planner→implementer notes with lower context waste.

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Model or human without the skill grades the same fixture outputs blind.
- **Acceptance test:** On fixed PR fixture, skill outputs (1) accurate diff summary, (2) quiz/checklist; second model scores factual accuracy ≥4/5 and no secrets from env/.env examples appear.
- **Rollback:** Remove or disable SKILL.md entries; revert to default review prompt.
- **Human gate:** true
- **Overlap:** Partial overlap with built-in review; skills are prompt packs not new runtimes.

## Evidence

- https://gist.github.com/geoffreylitt/a29df1b5f9865506e8952488eac3d524
- https://github.com/ayghri/i-have-adhd

## Run history

- 2026-08-04: Added from Grok intelligence intake. No software installed or account authorized.
