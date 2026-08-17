---
note_type: project
project_kind: experiment
experiment_id: EXP-CCDE3257
status: proposed
experiment_stage: intake
created: 2026-08-02
updated: 2026-08-02
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for addyosmani/agent-skills (selective SDLC + frontend) without weakening safety or existing capability."
next_action: "On sample vertical template: /spec produces PRD; /plan atomic tasks; /build + /test yields green commits; /review five-axis checklist passes; frontend skill triggers on UI files"
review_on: 2026-08-02
verification_status: unverified
risk: medium
source_refs:
  - "https://github.com/addyosmani/agent-skills"
  - "https://addyosmani.com/blog/agent-skills/"
tags:
  - brain
  - project
  - experiment
  - automation
---

# addyosmani/agent-skills (selective SDLC + frontend)

## Why this may matter

Production workflows and quality gates reduce agent shortcuts; multi-tool support; active maintenance

## Expected benefit

Faster reliable planning/handoff/build/test/review for 25-site factory and client full-stack work

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Second agent or human verifies commits match skill criteria and tests pass independently
- **Acceptance test:** On sample vertical template: /spec produces PRD; /plan atomic tasks; /build + /test yields green commits; /review five-axis checklist passes; frontend skill triggers on UI files
- **Rollback:** npx skills remove or delete skills/ and plugin configs; git revert
- **Human gate:** Yes — skill selection and first full cycle
- **Overlap:** Existing planning/review prompts — replace, do not duplicate

## Evidence

- https://github.com/addyosmani/agent-skills
- https://addyosmani.com/blog/agent-skills/

## Run history

- 2026-08-02: Added from Grok intelligence intake. No software installed or account authorized.
