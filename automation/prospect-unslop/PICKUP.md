# Pickup — 138-site unslop

Body photographs: 2026-08-19

```bash
git checkout cursor/prospect-unslop-collages-56f2
node --test automation/prospect-unslop/test/*.js
node automation/prospect-unslop/qa-batch.js
```

QA: 136 ready, 0 needsGen, 2 dropped, 0 collisions, 0 untreated print markers, 0 missing body, 0 hero reuse below the fold, 0 mode mismatches, 0 thin layout, 0 thin copy.
Logos: 105 first-party, 31 wordmark. Hero swipe still uses collages 1-5. Body uses 6-10. Sheet `Fixed?` already YES. Sales manager owns outreach. Dillon approved the noindex hub. Mail stays hold.

```bash
node automation/prospect-unslop/run.js --body --only=<slug>
node automation/prospect-unslop/run.js --body
node automation/prospect-unslop/deploy.js --dry-run
node automation/prospect-unslop/deploy.js
```

Hub: `https://radar-unslop-20260819.netlify.app`

Slash skills: `.claude/skills/unslop/SKILL.md`, `.claude/skills/grill-me/SKILL.md`.
