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
  - "[[12_Brain/01_Captures/2026-08-18 - Factory starters are the main templates]]"
  - "[[_templates/site-factory/starters/README]]"
  - "[[12_Brain/03_Concepts/High Craft Website Factory]]"
  - "[[12_Brain/06_Research/2026-08-18 - Variant.com template harvest]]"
tags:
  - decision
  - website-factory
  - templates
---

# Factory starter templates

**Decision:** The six factory briefs in `_templates/site-factory/starters/` are the main website templates. New site builds copy the matching vertical or attitude starter, then replace every fictional fact. Variant.com stays outside the factory.

## Context

The Practicaly AI clip resolved to Variant.com. Custom Variant generation is account-gated, so six original factory-native demos were staged for a keep-or-skip review. Dillon confirmed those six are the templates we use.

## Options considered

1. Keep the six pages as a Variant review pack and wait on an account plus HTML export.
2. Promote the six briefs into the factory as the starter library and leave Variant gated.
3. Treat Variant's public app-widget cards as the template set.

## Decision

Option 2.

| Slug | Attitude | Vertical |
|---|---|---|
| kiln-heating | industrial | HVAC |
| lot-line-landscape | warm | landscaping and concrete |
| atelier-ninth-bridal | editorial | bridal fittings |
| two-coats-painting | brutal | painting |
| harbor-light-spa | glass | wellness |
| signal-street-ads | neon | local Google and Meta ads |

`example-brief.json` remains the schema fallback when no starter matches.

## Rationale

- The six briefs already cover the attitudes the factory ships and the verticals we actually build.
- They are factory HTML, not Variant cards, so they already pass the design-system contract.
- Variant still has no live-verified HTML export without an account.

## Consequences

- Agents copy from `starters/` via `pick-starter.js`.
- Variant signup is not required to adopt a template set.
- The six demos stay `noindex` and must not be deployed or treated as client sites.

## Reversal trigger

A later review proves a seventh vertical needs its own starter, or a Dillon-approved Variant export beats a starter against `philly-sites/DESIGN-SYSTEM.md` after a factory rebuild.

## Evidence

- [[12_Brain/01_Captures/2026-08-18 - Factory starters are the main templates]]
- `_templates/site-factory/starters/`
