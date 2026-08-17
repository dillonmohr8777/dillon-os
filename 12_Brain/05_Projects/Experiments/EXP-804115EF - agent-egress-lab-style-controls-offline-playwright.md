---
note_type: project
project_kind: experiment
experiment_id: EXP-804115EF
status: proposed
experiment_stage: intake
created: 2026-08-01
updated: 2026-08-01
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for Agent Egress Lab style controls + offline Playwright without weakening safety or existing capability."
next_action: "External URL call blocked by default; allow-listed internal Playwright suite passes; no secrets or unexpected network in capture"
review_on: 2026-08-01
verification_status: unverified
risk: medium
source_refs:
  - "https://x.com/hAru_mAki_ch/status/2083443937394712807"
tags:
  - brain
  - project
  - experiment
  - automation
---

# Agent Egress Lab style controls + offline Playwright

## Why this may matter

Concrete default-deny egress and isolated E2E for safer browser/a11y/visual gates

## Expected benefit

Reduced prompt-injection blast radius and deterministic QA in 25-site factory

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Human or second agent network/pcap review + test report
- **Acceptance test:** External URL call blocked by default; allow-listed internal Playwright suite passes; no secrets or unexpected network in capture
- **Rollback:** Disable proxy and revert to prior runner
- **Human gate:** true
- **Overlap:** existing Playwright usage

## Evidence

- https://x.com/hAru_mAki_ch/status/2083443937394712807

## Run history

- 2026-08-01: Added from Grok intelligence intake. No software installed or account authorized.
