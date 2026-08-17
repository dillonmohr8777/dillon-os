---
note_type: project
project_kind: experiment
experiment_id: EXP-D2C92739
status: proposed
experiment_stage: intake
created: 2026-08-03
updated: 2026-08-03
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for SkillOpt on Dillon core skills without weakening safety or existing capability."
next_action: "Train on seed skills with held-out site set; val score improves vs seed; artifact ≤2000 tokens; runs successfully in Claude Code and Codex harnesses without weight changes."
review_on: 2026-08-03
verification_status: unverified
risk: medium
source_refs:
  - "https://github.com/microsoft/SkillOpt"
  - "https://www.microsoft.com/en-us/research/blog/skillopt-agent-skills-as-trainable-parameters/"
  - "https://arxiv.org/abs/2605.23904"
tags:
  - brain
  - project
  - experiment
  - automation
---

# SkillOpt on Dillon core skills

## Why this may matter

Validation-gated text-space optimizer with reported large gains and native Claude Code/Codex plugins; can harden site-gen, AEO, and QA skills.

## Expected benefit

Higher task success and lower tokens on frozen models; transferable compact best_skill.md.

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Separate frozen eval harness (not the optimizer loop) scores before/after on new sites.
- **Acceptance test:** Train on seed skills with held-out site set; val score improves vs seed; artifact ≤2000 tokens; runs successfully in Claude Code and Codex harnesses without weight changes.
- **Rollback:** Revert to seed skill files; discard optimizer checkpoints.
- **Human gate:** Approve val-set composition and any API spend caps before training run.
- **Overlap:** Optimizes skills that skill-recorder or humans produce; plugins already target same harnesses.

## Evidence

- https://github.com/microsoft/SkillOpt
- https://www.microsoft.com/en-us/research/blog/skillopt-agent-skills-as-trainable-parameters/
- https://arxiv.org/abs/2605.23904

## Run history

- 2026-08-03: Added from Grok intelligence intake. No software installed or account authorized.
