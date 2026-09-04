# Grill: body photographs through every homepage (2026-08-19)

Outcome: every unique prospect homepage keeps the five-image hero swipe, then adds five new treated photographs spaced through the page with reveal, vanish, and staggered two-up moments. Hero slots 1-5 stay. Body slots 6-10 are new crops from harvest, not a dump of the same five.

Repository: `dillon-os`. Batch: `02_Campaigns/AI Site Builder Outreach Engine/batches/radar-unslop-20260819/`.

Prohibited: live index, invented phone/address/hours/menu, logos redrawn into photographs, mailing, overwriting hero collages 1-5, double-treating 1-5, overwriting a client Netlify site.

A noindex hub deploy to `radar-unslop-20260819` is allowed only when Dillon asks.

Sources: harvest photos in `automation/prospect-unslop/harvest/<slug>/photos/`. Compose from those files with different crops and treat seeds than the hero set.

Skills on this pass: `grill-me` (this contract), `unslop`, `ui-design`, `ux-audit`, `frontend-build`, `motion-design`, `mirror-and-improve`, `site-factory`.

Acceptance:

- Hero swipe still uses `collage-1` through `collage-5` only
- Body uses `collage-6` (16:9 cinematic), `collage-7` (story), `collage-8` + `collage-9` (moments), `collage-10` (feature)
- Ten unique hashes per site; no hero file reused below the fold
- `node --test automation/prospect-unslop/test/`
- `node automation/prospect-unslop/qa-batch.js` (136 ready, 0 collisions, 0 missing body)
- Full-scroll screenshots of a food page and a people page

Maker: `collage.py` kind=body + `run.js --body`. Checker: `qa-batch.js` plus visual screenshots. Rollback: git revert the body commit.

Stop if a fact cannot be verified: leave the field empty.
