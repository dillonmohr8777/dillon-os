---
note_type: project
status: done
created: 2026-08-18
updated: 2026-08-18
owner: Dillon Mohr
priority: normal
outcome: No stack change. The existing site factory already covers this template class. Variant stays gated.
next_action: None. Use `_templates/site-factory/` as today. Do not create a Variant account unless Dillon reopens export testing.
review_on: 2026-09-18
source_refs:
  - "[[12_Brain/01_Captures/2026-08-18 - Factory already makes those templates]]"
  - "[[12_Brain/04_Decisions/2026-08-18 - Keep the existing factory as the template system]]"
  - "[[12_Brain/06_Research/2026-08-18 - Variant.com template harvest]]"
  - "[[12_Brain/02_Entities/Variant]]"
tags:
  - project
  - variant
  - website-factory
---

# Variant template stack evaluation

**Summary:** harvest Variant from the Practicaly AI clip, keep it gated, and
do not treat the six factory demos as a new template library.

## Goal

Decide whether Variant.com belongs in the website production stack.

## Done

- Resolved TikTok `ZP8WVwqPX` to Variant.
- Captured public homepage templates. Custom prompting is account-gated.
- Built six original `noindex` factory sites as harvest evidence.
- Dillon clarified those sites are the kind of template the factory already
  makes, and it is unclear that Variant adds anything.
- Reverted the mistaken starter-library promotion.

## Not done

- No Variant account.
- No HTML export from Variant.
- No factory default, client site, or deploy change.

## Next actions

- [x] Dillon reviews the six local candidates.
- [x] Keep or skip Variant as a factory input. Decision: skip. Existing factory
      remains the template system.
- [ ] Optional later: approve a free Variant signup only if live HTML export
      needs testing. Not required.

## Links

- Decision: [[12_Brain/04_Decisions/2026-08-18 - Keep the existing factory as the template system]]
- Research: [[12_Brain/06_Research/2026-08-18 - Variant.com template harvest]]
- Entity: [[12_Brain/02_Entities/Variant]]
- Factory: [[12_Brain/02_Entities/Website Factory]]
- Concept: [[12_Brain/03_Concepts/High Craft Website Factory]]
- Pack: `_templates/variant-review/` (evidence only)
