---
note_type: project
project_kind: experiment
experiment_id: EXP-3320BFA5
status: proposed
experiment_stage: intake
created: 2026-07-31
updated: 2026-07-31
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for Copilot code-review SKILL.md for Dillon standards without weakening safety or existing capability."
next_action: "On a sample multi-file PR, skill is attributed in comments; human score of review usefulness improves ≥20% vs baseline; no secret leakage"
review_on: 2026-07-31
verification_status: unverified
risk: low
source_refs:
  - "https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/"
  - "https://docs.github.com/copilot/using-github-copilot/code-review/using-copilot-code-review"
tags:
  - brain
  - project
  - experiment
  - automation
---

# Copilot code-review SKILL.md for Dillon standards

## Why this may matter

GA support for skills + default read-only MCP enables standards-aware review without prompt stuffing

## Expected benefit

More consistent factory PR quality and faster iteration on a11y/schema/perf

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Second human reviewer or separate non-Copilot agent scoring the same PR
- **Acceptance test:** On a sample multi-file PR, skill is attributed in comments; human score of review usefulness improves ≥20% vs baseline; no secret leakage
- **Rollback:** Delete or rename .github/skills entry; reviews fall back to default
- **Human gate:** Review skill content and first 3 attributed runs before any wider enablement
- **Overlap:** Existing Copilot usage; complements rather than replaces manual review

## Evidence

- https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/
- https://docs.github.com/copilot/using-github-copilot/code-review/using-copilot-code-review

## Run history

- 2026-07-31: Added from Grok intelligence intake. No software installed or account authorized.
