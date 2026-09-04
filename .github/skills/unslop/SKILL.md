---
name: unslop
description: Rebuild prospect concept homepages so they look like the real business. Harvest facts and logos, compose industry-intent print collages, restyle with brand tokens, and QA the batch. Use when Dillon says /unslop, asks to unslop sites, or points at the Google fix-queue sheet.
---

# Unslop

Canonical copy also lives at `.claude/skills/unslop/SKILL.md` so Command Deck and Cursor slash commands resolve the same playbook.

Fix prospect concept homepages that still look like generic AI placeholders. Read this file, then `automation/prospect-unslop/README.md` and `automation/prospect-unslop/GRILL.md`. Do not invent a parallel factory.

## Outcome

Unique noindex concept sites in `02_Campaigns/AI Site Builder Outreach Engine/batches/radar-unslop-20260819/`. Each site keeps the real name, a first-party logo in HTML when harvest has a real mark, five unique 4:5 hero print collages plus five new body photographs spaced through the homepage, honest copy, and Align-style motion. Outreach stays with the sales manager.

## Prohibited

- Live index, mailing, spend, or invented phone/address/hours/menu/awards
- Overwriting a client Netlify site, or `momentum-prospect-radar-next20-2026-08-11`
- Baking logos or business names into photographs
- Redrawing a missing logo
- Swapping an official URL onto a neighbor host

A noindex hub deploy is allowed only when Dillon explicitly asks. Pin a new site named `radar-unslop-20260819` with `node automation/prospect-unslop/deploy.js`. Never run a Netlify CLI production deploy onto a linked client site.

## Skills to compose

Run `/grill-me` first and keep the contract in `automation/prospect-unslop/GRILL.md`. Then use `ui-design`, `ux-audit`, `frontend-build`, `motion-design`, `mirror-and-improve`, and `site-factory`. `/goal` and `/parallel-deep-research` are Cursor product skills, not files in this repo; skip them if they are not installed.

## Factory

```bash
node --test automation/prospect-unslop/test/*.js
node automation/prospect-unslop/run.js --only=<slug>
node automation/prospect-unslop/run.js --rerender
node automation/prospect-unslop/run.js --treat
node automation/prospect-unslop/run.js --body
node automation/prospect-unslop/deploy.js
node automation/prospect-unslop/qa-batch.js
```

`--fresh` recomposes collages from harvest. `--treat` maps existing collages onto each site's tokens and restyles the HTML grain overlay. Checker is `qa-batch.js` plus screenshots of a food page and a people page.

## Image contract

- Food sites: plate, pass, kitchen. People sites: humans doing the work.
- Hero swipe keeps collages 1-5. Body slots 6-10 are new crops, not a dump of the hero set.
- Print look: grain you can see, brand color blocks, topographic waves.
- Per-site tokens from the logo or harvest. Never one global orange.
- CSS grain overlay on photography frames only, never on logos.

## Sheet and PR

`Fixed?` on the Google Sheet is already YES for QA-green rows. Do not rewrite the sheet unless Dillon asks. Draft PR only. Do not merge.
