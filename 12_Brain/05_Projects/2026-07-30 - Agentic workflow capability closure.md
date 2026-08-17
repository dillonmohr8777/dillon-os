---
note_type: project
status: active
created: 2026-07-30
updated: 2026-07-30
owner: Dillon Mohr
finish_line: "All locally controllable workflow gaps are verified; external entitlements and consequential actions have exact gates."
next_action: "Obtain an approved Indeed Partner app and a PostGrid test account when Dillon is ready to activate those external services."
due: none
source_refs:
  - "12_Brain/registry/automations.json"
  - "12_Brain/state/frontmatter-validate.json"
  - "12_Brain/04_Decisions/2026-07-30 - Select PostGrid for direct mail test mode.md"
  - "_os/automation/docs/OPERATOR.md"
tags:
  - brain
  - project
  - automation
  - agentic-workflows
---

# Agentic workflow capability closure

## Verified locally

- Obsidian CLI is enabled and the `dillon-os` vault reports Sync status `synced`.
- The weekly 25-site factory from merged PR 226 is installed and its tests pass.
- All client notes pass the required frontmatter validator.
- Indeed signals have an official Partner API pipeline feeding the shared
  qualifier and queue; HTML scraping is prohibited. Live results without a
  website remain scored for approved enrichment rather than being forced into
  the site factory.
- PostGrid is selected for test-mode direct-mail preparation, with a local
  activation-plan command that never sends.

## External gates still intentional

- A live Indeed request requires approved Partner API entitlement and a secret
  locator.
- PostGrid test calls require an approved account and test-key locator.
- A live mailing requires an exact proof, recipients, unit cost, spend cap,
  independent review, and explicit batch approval.
- Public deployment requires a verified existing site target for that batch.
- Outreach, spend, publishing, and account changes remain approval-gated.
