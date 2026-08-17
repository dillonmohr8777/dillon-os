---
note_type: project
project_kind: experiment
experiment_id: EXP-D65EF7ED
status: proposed
experiment_stage: intake
created: 2026-08-02
updated: 2026-08-02
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for GitHub Copilot code review agent skills + MCP (Playwright default) without weakening safety or existing capability."
next_action: "Sample PR receives attributed skill/MCP comments; Playwright responsive/a11y checks execute and pass or fail correctly"
review_on: 2026-08-02
verification_status: unverified
risk: medium
source_refs:
  - "https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/"
tags:
  - brain
  - project
  - experiment
  - automation
---

# GitHub Copilot code review agent skills + MCP (Playwright default)

## Why this may matter

Official GA; brings standards and browser context into reviews

## Expected benefit

Deterministic code + visual/a11y gates in factory CI/PR flow

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Human reviews comment attribution and re-runs Playwright locally
- **Acceptance test:** Sample PR receives attributed skill/MCP comments; Playwright responsive/a11y checks execute and pass or fail correctly
- **Rollback:** Disable skills/MCP in Copilot settings; remove .github/skills
- **Human gate:** Yes — initial enablement
- **Overlap:** Any existing Copilot review or Playwright setup

## Evidence

- https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/

## Run history

- 2026-08-02: Added from Grok intelligence intake. No software installed or account authorized.
