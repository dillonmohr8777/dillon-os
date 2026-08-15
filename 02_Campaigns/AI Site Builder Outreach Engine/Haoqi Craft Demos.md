---
tags: [campaign, website, radar]
source: "[[12_Brain/raw/research/2026-08-15 - research - High-Craft Front-End References]]"
updated: 2026-08-15
---

# Haoqi Craft Demos

**Summary:** two `noindex` prospect demos that apply the [[12_Brain/concepts/Haoqi Design Language|Haoqi Design Language]] to rebuild rows from [[Daily-Briefs/radar-2026-08-15|radar-2026-08-15]].

Nothing here is outbound-ready. A human approves every send.

## Why these two

The 2026-08-15 radar listed 172 rebuilds. Dead domains were skipped. The first two harvestable rows were:

| Radar row | Their live site | Demo |
|---|---|---|
| Jarman Sales & Service (hvac, opportunity 82) | Radar host `jarmanairconditioning.com` is IIS 404. Harvested `https://jarmansalesandservice.com/` | `haoqi-radar-sites/jarman-sales/` |
| Andorra Family Dentistry (dentist, opportunity 78) | `https://www.andorradental.com/` | `haoqi-radar-sites/andorra-family-dentistry/` |

Workflow: `/site-grade` queue from the radar, then `/mirror-and-improve` harvest, then a hand-built Haoqi skin instead of `build-site.js`. `/ui-design`, `/ux-audit`, `/motion-design`, and `/frontend-build` still apply (tokens from harvest, one primary action, scramble + glass as the signature motion, semantic `noindex` page).

## Fact sources

- Jarman: harvest.json from the GoDaddy site. Family-owned since 1951, Friedrich authorized dealer, window and wall units, 72 years in Philadelphia. Portrait uses their harvested truck photo. Extra AC still is generated atmosphere.
- Andorra: harvest.json from andorradental.com. Drs Shah, Emani, Bansal. Service list and membership line come from their homepage. Images are generated atmosphere (harvest returned zero photos) and are labeled on the page.

## Hard rules still on

Prospect demos stay `noindex`. Deploy is Tier 2. Generated imagery is never presented as their photography.
