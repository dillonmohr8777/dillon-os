---
note_type: project
project_kind: experiment
experiment_id: EXP-940E4BF4
status: proposed
experiment_stage: intake
created: 2026-08-03
updated: 2026-08-03
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for skill-recorder factory ritual capture without weakening safety or existing capability."
next_action: "Record non-secret internal ritual on throwaway repo; Analyze produces editable intent+steps; generated skill re-runs to identical artifact checklist; no secrets in timeline or skill; skill prefers CLI over pure UI."
review_on: 2026-08-03
verification_status: unverified
risk: medium
source_refs:
  - "https://github.com/microsoft/skill-recorder"
  - "https://github.com/microsoft/skill-recorder/blob/main/INSTALL.md"
tags:
  - brain
  - project
  - experiment
  - automation
---

# skill-recorder factory ritual capture

## Why this may matter

Official Microsoft tool turns one demonstration of Maps-parity/FAQ/Playwright/deploy gates into reusable SKILL.md/Automation; matches 25-site factory need for repeatable handoff.

## Expected benefit

Faster vertical onboarding and deterministic process skills; reduces prompt drift.

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Second operator or bare Claude Code executes skill against baseline manual run; diff artifacts and time.
- **Acceptance test:** Record non-secret internal ritual on throwaway repo; Analyze produces editable intent+steps; generated skill re-runs to identical artifact checklist; no secrets in timeline or skill; skill prefers CLI over pure UI.
- **Rollback:** Delete generated skills; uninstall Skill Recorder app and remove local recordings.
- **Human gate:** Required before any Analyze step and before using recordings that could contain client-like data.
- **Overlap:** Produces SKILL.md consumable by Claude Code/Codex/Copilot; complements rather than replaces existing skills.

## Evidence

- https://github.com/microsoft/skill-recorder
- https://github.com/microsoft/skill-recorder/blob/main/INSTALL.md

## Run history

- 2026-08-03: Added from Grok intelligence intake. No software installed or account authorized.
