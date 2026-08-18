---
note_type: system
status: active
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - "[[12_Brain/06_Research/2026-08-18 - Variant.com template harvest]]"
  - "[[12_Brain/02_Entities/Variant]]"
  - "[[12_Brain/02_Entities/Website Factory]]"
tags:
  - templates
  - variant
  - review
---

# Variant review pack

Local factory candidates for the Variant stack decision. These are original
Momentum-profile sites, not Variant exports. `noindex` stays on. Do not
deploy.

## Why this folder exists

Variant.com custom generation is account-gated. This pack translates six
visual attitudes into factory HTML so Dillon can judge stack fit without
creating a Variant account.

## Build

```bash
node _templates/variant-review/build-pack.js
```

Then open `_templates/variant-review/index.html`.

## Candidates

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

## Later Variant pass

If a free account is approved, prompt Variant for the same six verticals,
screenshot the cards, and compare density and CTA placement to these pages.
Keep Variant output as untrusted layout reference. Rebuild any keeper in the
factory.
