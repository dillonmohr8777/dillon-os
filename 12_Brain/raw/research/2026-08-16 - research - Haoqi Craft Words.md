---
date: 2026-08-16
type: research-raw
topic: Haoqi craft words from the prospect radar
agent: cloud agent (haoqi-radar-craft)
---

# Raw: Haoqi craft words

Source of record: `12_Brain/state/radar/registry.json` updated 2026-08-15. Count: 1,042 prospects. No live re-fetch of the 1,042 sites. Words are operator picks on vertical + name, not harvested homepage copy.

## Method

`_os/automation/lib/haoqi-craft-words.js` scored every registry row.

A keep needs a 4–6 letter lowercase script word (the `hello` cut) that is what they do. Service phrases fail. Trades without an honest hook are a skip.

Score = word quality * 0.5 + opportunity * 0.35 + verdict bonus (rebuild 15, ads_seo 8, polish 4).

The published 100 uses quality >= 84 and per-word caps (18 smile, 8 taste, 12 default).

## Counts on this run

- scanned: 1042
- eligible at quality 84+: 583
- skipped: 459
- top list: 100

Largest unlocks: taste, smile, style, paws, heal, grow, strong, sight, glow, gloss.

## Verdicts in the registry

rebuild 177, polish 667, enrich 55, nurture 122, ads_seo 21.

## Skeptic

- Word assignments are editorial. They are not proof the business uses that word on their site.
- `taste` is the weakest keeper. A restaurant is a meal, not a single feeling. Capped at 8 in the 100.
- `heal` is generic for clinics. Kept only when the row is actually a doctor/clinic and not a campus research building.
- `glow` on a fireplace is a stretch of the spa word. Labeled as "the finish people come for."
- HVAC skip is an operator call from the Jarman demo, not a graded fault.
- `.edu` / translational research buildings are skipped even when OSM tagged them clinic.
- No phones, emails, or street addresses were written into compiled pages.

## Killed as craft words

hvac, insurance, lawyer, accountant, tax, funeral, roofing, flooring, sporting-goods inventory, apparel inventory, kitchen remodel phrases, alt-wellness defaults, campus research buildings.
