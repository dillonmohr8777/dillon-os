---
note_type: project
project_kind: experiment
experiment_id: EXP-6CFE2386
status: proposed
experiment_stage: intake
created: 2026-08-05
updated: 2026-08-05
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for Frontend Craft skill/plugin without weakening safety or existing capability."
next_action: "Generate 3 distinct vertical LPs from same skill; pass shared design-token check, complete critical-user-path coverage, axe a11y=0 critical, Lighthouse perf/a11y >90, visual regression vs. human baseline, no purple-slop fonts/colors."
review_on: 2026-08-05
verification_status: unverified
risk: low
source_refs:
  - "https://x.com/nik1t7n/status/2084509696552214885"
  - "https://github.com/SkyWalker2506/ccplugin-frontend-craft"
tags:
  - brain
  - project
  - experiment
  - automation
---

# Frontend Craft skill/plugin

## Why this may matter

Structured pipeline reduces agent frontend inconsistencies, edge-case gaps, and generic AI aesthetics; compact + on-demand depth fits factory.

## Expected benefit

Higher first-pass UI quality and consistency across 25-site verticals; less rework on flows/state/visual system.

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Human designer rubric (intent, consistency, craft) + automated Playwright + Lighthouse CI.
- **Acceptance test:** Generate 3 distinct vertical LPs from same skill; pass shared design-token check, complete critical-user-path coverage, axe a11y=0 critical, Lighthouse perf/a11y >90, visual regression vs. human baseline, no purple-slop fonts/colors.
- **Rollback:** Unload skill/plugin; revert to baseline prompts.
- **Human gate:** true
- **Overlap:** Partial with existing frontend prompts/design-system rules; adds explicit verification stage.

## Evidence

- https://x.com/nik1t7n/status/2084509696552214885
- https://github.com/SkyWalker2506/ccplugin-frontend-craft

## Run history

- 2026-08-05: Added from Grok intelligence intake. No software installed or account authorized.
