# Factory starter templates

These six briefs are the main templates the website factory uses. One vertical
per attitude. Copy the match, then replace every fictional fact.

| Slug | Attitude | Use |
|---|---|---|
| kiln-heating | industrial | HVAC emergency and service |
| lot-line-landscape | warm | landscaping and concrete |
| atelier-ninth-bridal | editorial | bridal fittings |
| two-coats-painting | brutal | interior and exterior paint |
| harbor-light-spa | glass | wellness booking |
| signal-street-ads | neon | local Google and Meta ads |

```bash
# Print the starter path for a vertical or attitude
node _templates/site-factory/pick-starter.js hvac
node _templates/site-factory/pick-starter.js editorial

# Copy, then fill with verified facts
cp "$(node _templates/site-factory/pick-starter.js bridal)" 01_Clients/some-client/brief.json
```

`example-brief.json` is the schema fallback when no starter matches. Do not
ship a starter's 555 phone, demo address, or placeholder images as if they
belong to a real business. Keep `noindex: true` on prospect demos.

Visual pack of the built pages: `_templates/variant-review/`.
