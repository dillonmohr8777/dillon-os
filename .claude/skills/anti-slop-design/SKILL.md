---
name: anti-slop-design
description: Factory anti-slop gates for Need Momentum site rebuilds. Harvest palettes, honest copy, structural variety. Use before generating or reviewing a client or prospect site. Complements Hallmark (npx skills add nutlope/hallmark) without vendoring that 65KB file.
---

# Anti-slop design (factory adapter)

One-line: Need Momentum sites must look harvested from the live brand, not generated from the same purple-Inter template.

## Upstream (optional, install locally)

```bash
npx skills add nutlope/hallmark
```

Hallmark lives at `skills/hallmark/SKILL.md` in [nutlope/hallmark](https://github.com/nutlope/hallmark) (MIT). Don't copy that file into this vault. Run it when a designer wants the full critique. The adapter here is the **factory gate** that always runs.

License: MIT for Hallmark. The adapter is vault SOP, not a fork claiming Dillon authorship of Hallmark.

## Always

- Harvest color, type, and voice from the **live site** (or GBP photos if the site is dead). Lock tokens before writing HTML.
- Vary structure across a batch. Twenty-five recolors of one layout fail the batch.
- Honest copy only. No invented metrics, awards, years, or "trusted by 500+".
- Headers stay roman. No italic H1–H3 as a style crutch.
- Motion is CSS-first. No decorative WebGL on a plumber site.
- Contrast: body text on the actual background, not on a mockup that never ships.
- Need Momentum public pages use Need Momentum tokens (`#2A80C2`, `#FFC63B`, navy). Prospect rebuilds use the **prospect's** tokens.

## Never

- Inter + purple gradient + fake 99.9% uptime.
- Stock "AI-powered" hero on a local HVAC rebuild unless the live brand already says it.
- Presenting Radar **fixtures** (Cedar Ridge HVAC) as real clients.
- Shipping a batch that shares one hero pattern.

## After generate

Read [ui-design](../ui-design/SKILL.md) and [site-grade](../site-grade/SKILL.md). If Hallmark is installed, run it on the output and fix every HIGH finding before the human QA gate.
