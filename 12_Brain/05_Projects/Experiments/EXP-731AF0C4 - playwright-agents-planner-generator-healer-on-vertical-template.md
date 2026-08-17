---
note_type: project
project_kind: experiment
experiment_id: EXP-731AF0C4
status: proposed
experiment_stage: intake
created: 2026-07-31
updated: 2026-07-31
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for Playwright Agents planner-generator-healer on vertical template without weakening safety or existing capability."
next_action: "Planner produces scenarios from prompt; generator emits passing tests on clean template; healer auto-fixes one injected selector/DOM break; suite runtime and flake rate within 1.5× classic baseline"
review_on: 2026-07-31
verification_status: unverified
risk: medium
source_refs:
  - "https://playwright.dev/docs/test-agents"
  - "https://bug0.com/blog/playwright-test-agents"
tags:
  - brain
  - project
  - experiment
  - automation
---

# Playwright Agents planner-generator-healer on vertical template

## Why this may matter

Official agents + default MCP provide explore/generate/heal loop for regression after fast generation

## Expected benefit

Lower maintenance cost for visual/functional/a11y gates across 25-site factory

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Manual execution of healed suite + separate visual diff tool
- **Acceptance test:** Planner produces scenarios from prompt; generator emits passing tests on clean template; healer auto-fixes one injected selector/DOM break; suite runtime and flake rate within 1.5× classic baseline
- **Rollback:** Disable agent flags; retain previously committed classic Playwright tests
- **Human gate:** Approve generated scenarios and first healed run
- **Overlap:** Existing Playwright usage; extends rather than duplicates

## Evidence

- https://playwright.dev/docs/test-agents
- https://bug0.com/blog/playwright-test-agents

## Run history

- 2026-07-31: Added from Grok intelligence intake. No software installed or account authorized.
