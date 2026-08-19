# Grill: homepage quality pass (2026-08-19)

Outcome: 136 unique prospect homepages that look like the business, carry honest copy, keep first-party logos in HTML, and beat a thin four-section template on UI/UX.

Repository: `dillon-os`. Batch: `02_Campaigns/AI Site Builder Outreach Engine/batches/radar-unslop-20260819/`.

Prohibited: Netlify deploy, live index, invented phone/address/hours/menu, logos redrawn into photographs, mailing.

Sources: official harvest (voice, facts, logo files), existing collages, Netlify `assets/logo.*` when it is their mark.

Skills on this pass: `dillon-plan-grill` (this contract), `ui-design`, `ux-audit`, `frontend-build`, `motion-design`, `mirror-and-improve`, `site-factory`. There is no `unslop` skill file. Loop work is a factory `--rerender` cycle, not a separate skill.

Acceptance: `node --test automation/prospect-unslop/test/`, `node automation/prospect-unslop/qa-batch.js`, screenshots of food and people pages, logo count reported honestly (wordmark fallback when no first-party mark exists).

Maker: this factory pass. Checker: `qa-batch.js` plus visual screenshots. Rollback: git revert the render commit.

Stop if a fact cannot be verified: leave the field empty.
