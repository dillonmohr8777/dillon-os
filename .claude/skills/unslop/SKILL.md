---
name: unslop
description: Rebuild prospect concept homepages so they look like the real business. Harvest facts and logos, compose industry-intent print collages, restyle with brand tokens, and QA the batch. Use when Dillon says /unslop, asks to unslop sites, or points at the Google fix-queue sheet.
---

# Unslop

Fix prospect concept homepages that still look like generic AI placeholders. Read this file, then `automation/prospect-unslop/README.md` and `automation/prospect-unslop/GRILL.md`. Do not invent a parallel factory.

## Outcome

Unique noindex concept sites in `02_Campaigns/AI Site Builder Outreach Engine/batches/radar-unslop-20260819/`. Each site keeps the real name, a first-party logo in HTML when harvest has a real mark, five unique 4:5 print collages, honest copy, and Align-style motion. Outreach stays with the sales manager.

## Prohibited

- Netlify deploy, live index, mailing, spend, or invented phone/address/hours/menu/awards
- Baking logos or business names into photographs
- Redrawing a missing logo
- Swapping an official URL onto a neighbor host

## Skills to compose

Run `/grill-me` first and keep the contract in `automation/prospect-unslop/GRILL.md`. Then use `ui-design`, `ux-audit`, `frontend-build`, `motion-design`, `mirror-and-improve`, and `site-factory`. `/goal` and `/parallel-deep-research` are Cursor product skills, not files in this repo; skip them if they are not installed.

## Factory

```bash
node --test automation/prospect-unslop/test/*.js
node automation/prospect-unslop/run.js --only=<slug>
node automation/prospect-unslop/run.js --rerender   # keep collages, rewrite HTML/copy
node automation/prospect-unslop/run.js --treat      # Align grain print pass on existing collages
node automation/prospect-unslop/qa-batch.js
```

`--fresh` recomposes collages from harvest. `--treat` maps existing collages onto each site's tokens (duotone, color blocks, waves, halftone, heavy grain) and restyles the HTML grain overlay. Checker is `qa-batch.js` plus screenshots of a food page and a people page. Maker is this factory; do not sign off on your own visual pass without those shots.

## Image contract

- Food sites: plate, pass, kitchen. People sites: humans doing the work.
- Print look: grain you can see, brand color blocks, topographic waves. Not plastic stock.
- Per-site tokens from the logo or harvest. Never one global orange.
- CSS grain overlay on photography frames only, never on `.brand-logo` or the closing mark.

## Sheet and PR

`Fixed?` on the Google Sheet is already YES for QA-green rows. Do not rewrite the sheet unless Dillon asks. Draft PR only. Do not merge.
