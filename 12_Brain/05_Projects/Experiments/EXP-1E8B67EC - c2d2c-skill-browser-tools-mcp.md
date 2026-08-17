---
note_type: project
project_kind: experiment
experiment_id: EXP-1E8B67EC
status: proposed
experiment_stage: intake
created: 2026-08-02
updated: 2026-08-02
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for c2d2c skill + browser-tools-mcp without weakening safety or existing capability."
next_action: "One component round-trips Figma↔code with tokens; browser MCP captures matching screenshots and basic a11y"
review_on: 2026-08-02
verification_status: unverified
risk: medium
source_refs:
  - "https://github.com/ (BIAsia/c2d2c via npx)"
  - "AgentDeskAI/browser-tools-mcp references"
tags:
  - brain
  - project
  - experiment
  - automation
---

# c2d2c skill + browser-tools-mcp

## Why this may matter

Bidirectional design-code and browser automation for craft and QA

## Expected benefit

Higher Figma parity, visual regression, debug for client sites

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Designer or second agent visual diff
- **Acceptance test:** One component round-trips Figma↔code with tokens; browser MCP captures matching screenshots and basic a11y
- **Rollback:** Remove skill and MCP entry
- **Human gate:** Yes
- **Overlap:** Existing Storybook/Figma plugins or Playwright

## Evidence

- https://github.com/ (BIAsia/c2d2c via npx)
- AgentDeskAI/browser-tools-mcp references

## Run history

- 2026-08-02: Added from Grok intelligence intake. No software installed or account authorized.
