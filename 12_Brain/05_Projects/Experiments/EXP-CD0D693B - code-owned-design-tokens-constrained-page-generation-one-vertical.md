---
note_type: project
project_kind: experiment
experiment_id: EXP-CD0D693B
status: proposed
experiment_stage: intake
created: 2026-08-04
updated: 2026-08-04
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for Code-owned design tokens + constrained page generation (one vertical) without weakening safety or existing capability."
next_action: "Generate 3 pages from vertical template: static check 100% token/component compliance; a11y score ≥95; visual regression vs golden < set threshold; blind human 'non-generic AI' rating ≥4/5."
review_on: 2026-08-04
verification_status: unverified
risk: medium
source_refs:
  - "https://x.com/konsfyi/status/2084229436824490384"
  - "https://x.com/UXMagic_ai/status/2084178123973939695"
tags:
  - brain
  - project
  - experiment
  - automation
---

# Code-owned design tokens + constrained page generation (one vertical)

## Why this may matter

Practitioners report design-in-code and style-guide-locked generation beat Figma handoff for consistency and anti-slop.

## Expected benefit

More distinctive, system-true sites with less manual cleanup in the factory.

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Separate visual-critique agent + human rater not involved in generation.
- **Acceptance test:** Generate 3 pages from vertical template: static check 100% token/component compliance; a11y score ≥95; visual regression vs golden < set threshold; blind human 'non-generic AI' rating ≥4/5.
- **Rollback:** Feature-flag off; fall back to prior template.
- **Human gate:** true
- **Overlap:** Overlaps existing component libraries; does not require new MCP if rules live in repo.

## Evidence

- https://x.com/konsfyi/status/2084229436824490384
- https://x.com/UXMagic_ai/status/2084178123973939695

## Run history

- 2026-08-04: Added from Grok intelligence intake. No software installed or account authorized.
