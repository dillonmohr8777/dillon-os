---
note_type: project
project_kind: experiment
experiment_id: EXP-B99F6727
status: proposed
experiment_stage: intake
created: 2026-08-05
updated: 2026-08-05
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for opc-skills (SEO + requesthunt subsets) without weakening safety or existing capability."
next_action: "Run requesthunt + SEO skill on 2 local service verticals; output must include real-user-language FAQs, schema markup, and checklist score ≥80% vs. AEO best-practice rubric; no hallucinated citations."
review_on: 2026-08-05
verification_status: unverified
risk: medium
source_refs:
  - "https://github.com/ReScienceLab/opc-skills"
  - "https://opc.dev/"
  - "https://x.com/tom_doerr/status/2084690622930206817"
tags:
  - brain
  - project
  - experiment
  - automation
---

# opc-skills (SEO + requesthunt subsets)

## Why this may matter

Ready solopreneur skills for demand research and SEO/AEO that map to prospect discovery and site content gates.

## Expected benefit

Faster vertical research + source-ready FAQs/schema; better AI-overview citation potential.

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Manual cross-check against live SERP/AI overviews + second agent critique.
- **Acceptance test:** Run requesthunt + SEO skill on 2 local service verticals; output must include real-user-language FAQs, schema markup, and checklist score ≥80% vs. AEO best-practice rubric; no hallucinated citations.
- **Rollback:** npx remove or delete skill folder.
- **Human gate:** true
- **Overlap:** Some with internal research prompts; adds packaged automation.

## Evidence

- https://github.com/ReScienceLab/opc-skills
- https://opc.dev/
- https://x.com/tom_doerr/status/2084690622930206817

## Run history

- 2026-08-05: Added from Grok intelligence intake. No software installed or account authorized.
