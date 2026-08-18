---
note_type: system
status: active
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - "[[12_Brain/04_Decisions/2026-08-18 - Keep the existing factory as the template system]]"
  - "[[12_Brain/06_Research/2026-08-18 - Variant.com template harvest]]"
  - "[[12_Brain/02_Entities/Website Factory]]"
tags:
  - templates
  - variant
  - review
---

# Variant harvest evidence pack

Six original Momentum-profile demos built during the Variant harvest. They
show the factory we already use, not a new template set. `noindex` stays on.
Do not deploy. Do not copy these into production as starters.

## Why this folder exists

Variant.com custom generation is account-gated. This pack translated six
attitudes into factory HTML so the clip could be judged without an account.
Dillon's correction: the factory already creates templates like that.

Canonical production path remains `_templates/site-factory/`
(`example-brief.json` plus attitude skins).

## Build

```bash
node _templates/variant-review/build-pack.js
```

Then open `_templates/variant-review/index.html`.

## Pages in the pack

| Slug | Attitude | Use |
|---|---|---|
| kiln-heating | industrial | HVAC emergency and service |
| lot-line-landscape | warm | landscaping and concrete |
| atelier-ninth-bridal | editorial | bridal fitting appointments |
| two-coats-painting | brutal | interior and exterior paint |
| harbor-light-spa | glass | wellness booking |
| signal-street-ads | neon | local Google and Meta ads |

Facts are fictional demo data. Phone numbers are 555-range placeholders.
Images are generated color fields labeled as placeholders, not client photos.
