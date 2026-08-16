---
date: 2026-08-16
type: research-raw
topic: Haoqi craft words, two-word outcome lines
agent: cloud agent (haoqi-radar-craft)
---

# Raw: Haoqi craft words, two-word pass

Source of record: `12_Brain/state/radar/registry.json` updated 2026-08-15. Count: 1,042 prospects. No live re-fetch of the 1,042 sites. Lines are operator picks on vertical + name, not harvested homepage copy.

First pass (one word, HVAC skipped) stays in `12_Brain/raw/research/2026-08-16 - research - Haoqi Craft Words.md`. This file is the two-word recut. Do not rewrite the first raw.

## Method

`_os/automation/lib/haoqi-craft-words.js` scored every registry row.

A keep needs one or two lowercase Pacifico words in the `hello` cut. The line is the feeling after the visit. Service catalog phrases fail. Funeral, campus research, tax, IT, and inventory retail stay skips.

Score = line quality * 0.5 + opportunity * 0.35 + verdict bonus (rebuild 15, ads_seo 8, polish 4).

The published 100 uses quality >= 84 and per-line caps (16 smile more, 8 come hungry, 15 default).

## Counts on this run

- scanned: 1042
- eligible at quality 84+: 780
- skipped: 262
- top list: 100

Largest unlocks: come hungry, drive home, smile more, fresh cut, your side, come home, get well, grow wild.

HVAC unlocked: stay cool (AC), stay warm (heat-only), breathe easy (mixed). Jarman is stay cool.

Lawyers unlocked: your side. Roofing unlocked: stay dry.

## Demo mounts

- Andorra Family Dentistry → `smile more`
- Jarman Sales & Service → `stay cool`

## Skeptic

- Assignments are editorial. They are not proof the business uses that line on their site.
- `come hungry` is the widest restaurant net. Capped at 8 in the 100.
- `get well` is still generic for clinics. Campus `.edu` / translational rows stay skipped.
- `spa` as a substring matched `elkinspark` / `spark` on the first two-word draft. Fixed with word boundaries. Sprinkles Icecream is `one scoop`.
- Two words need the reserved slot width. Sizing must not cap to the width of `hello` or the line shrinks.
