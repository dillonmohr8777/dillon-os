# Grill: Align print pass (2026-08-19)

Outcome: 136 unique prospect homepages whose photography reads as editorial grain print, mapped to each business's tokens, with `/unslop` and `/grill-me` skill files installed so those slash commands resolve.

Repository: `dillon-os`. Batch: `02_Campaigns/AI Site Builder Outreach Engine/batches/radar-unslop-20260819/`.

Prohibited: Netlify deploy, live index, invented phone/address/hours/menu, logos redrawn into photographs, mailing.

Sources: existing collages plus per-site `briefs/<slug>.json` tokens. First-party logos stay in HTML, never baked into pixels.

Skills on this pass: `grill-me` (this contract), `unslop`, `ui-design`, `ux-audit`, `frontend-build`, `motion-design`, `mirror-and-improve`, `site-factory`. `/goal` and `/parallel-deep-research` are not in this repo.

Acceptance: `node --test automation/prospect-unslop/test/`, `node automation/prospect-unslop/qa-batch.js` (136 ready, 0 collisions), screenshots of a food hero and a people hero after the print pass, skill files present at `.claude/skills/unslop/SKILL.md` and `.claude/skills/grill-me/SKILL.md`.

Maker: `treat.py` + `run.js --treat`. Checker: `qa-batch.js` plus visual screenshots. Rollback: git revert the treat commit.

Stop if a fact cannot be verified: leave the field empty.
