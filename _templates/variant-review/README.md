---
note_type: system
status: active
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - "[[12_Brain/04_Decisions/2026-08-18 - Factory starter templates]]"
  - "[[12_Brain/02_Entities/Website Factory]]"
  - "[[_templates/site-factory/starters/README]]"
tags:
  - templates
  - website-factory
---

# Factory starter visual pack

Built HTML for the six main factory templates. Canonical briefs live in
`_templates/site-factory/starters/`. These pages are original Momentum-profile
sites, not Variant exports. `noindex` stays on. Do not deploy.

## Build

```bash
node _templates/variant-review/build-pack.js
```

Then open `_templates/variant-review/index.html`.

## Templates

| Slug | Attitude | Use |
|---|---|---|
| kiln-heating | industrial | HVAC emergency and service |
| lot-line-landscape | warm | landscaping and concrete |
| atelier-ninth-bridal | editorial | bridal fittings |
| two-coats-painting | brutal | painting |
| harbor-light-spa | glass | wellness booking |
| signal-street-ads | neon | local Google and Meta ads |

Facts are fictional demo data. Phone numbers are 555-range placeholders.
Images are generated color fields labeled as placeholders, not client photos.

Pick a starter:

```bash
node _templates/site-factory/pick-starter.js hvac
```
