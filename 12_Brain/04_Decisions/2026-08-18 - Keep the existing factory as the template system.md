---
note_type: decision
status: active
owner: Dillon Mohr
created: 2026-08-18
updated: 2026-08-18
decided: 2026-08-18
decided_at: 2026-08-18
review_on: 2026-09-18
verification_status: verified
source_refs:
  - "[[12_Brain/01_Captures/2026-08-18 - Factory already makes those templates]]"
  - "[[12_Brain/06_Research/2026-08-18 - Variant.com template harvest]]"
  - "[[_templates/site-factory/README]]"
tags:
  - decision
  - website-factory
  - templates
  - variant
---

# Keep the existing factory as the template system

**Decision:** Do not add a parallel starter library from the Variant harvest. The existing site factory (`example-brief.json` plus the six attitudes) is already the template system. Variant.com stays outside the stack.

## Context

The Practicaly AI clip resolved to Variant.com. Custom generation is account-gated, so six original factory-native demos were staged. An agent misread "These are the main templates we use" as an order to promote those demos into `_templates/site-factory/starters/`. Dillon corrected that: the factory already creates templates like that, and it is unclear that Variant adds anything.

## Options considered

1. Promote the six harvest demos as a new official starter catalog.
2. Keep the existing factory path and treat the six pages as harvest evidence only.
3. Create a Variant account to test HTML export.

## Decision

Option 2. Option 1 was reverted. Option 3 stays unapproved.

## Rationale

- The six demos were built with the current factory. They are not a new design system.
- Variant's public cards are app and media widgets, not local-service landing pages.
- Prompts, galleries, and export remain behind a sign-in wall.

## Consequences

- New site builds still copy `_templates/site-factory/example-brief.json` and set an attitude.
- `_templates/variant-review/` is harvest evidence, not production templates.
- No Variant signup, spend, MCP, or factory default change.

## Reversal trigger

Dillon later wants Variant export tested against `philly-sites/DESIGN-SYSTEM.md`, or names a vertical the current factory cannot cover.

## Evidence

- [[12_Brain/01_Captures/2026-08-18 - Factory already makes those templates]]
