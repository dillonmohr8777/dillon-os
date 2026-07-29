---
name: site-batch
description: Run a weekly outreach batch of 25 prospect sites end to end: harvest targets, mirror and improve each one, build, QA, and produce the review hub plus the QR and mail-merge sheets. Use for the weekly website batch.
---

# Site Batch

The weekly 25-site outreach batch. Full narrative version with copy-paste commands: `02_Campaigns/AI Site Builder Outreach Engine/Batch Runbook.md`. Read that plus `philly-sites/DESIGN-SYSTEM.md` before starting.

## Prerequisite

Playwright is needed for harvesting and visual QA:

```bash
cd /workspace && npm i --no-save playwright && npx playwright install chromium --with-deps
```

## Steps

1. **Scope.** Pick one market and one or two verticals from `02_Campaigns/AI Site Builder Outreach Engine/Market Roster.md`. Over-pull 25 to 30 candidates. Exclude current clients in `01_Clients/`, active deals, and anyone previously mailed.

2. **Scaffold.** Create `02_Campaigns/AI Site Builder Outreach Engine/batches/<batch-id>/` with `batch.json` (`id`, `title`, `market`, `week`, `idPrefix`, `targetCount: 25`, `deployBaseUrl`) and an empty `briefs/` folder. Batch IDs look like `phl-2026-w31`.

3. **Harvest.** Build `targets.json` as an array of `{slug, siteUrl, socials}` then run:
   `node _templates/site-factory/harvest.js --from targets.json`
   Drop any target whose harvest failed. Never build on invented facts.

4. **Mirror each prospect.** Follow `.claude/skills/mirror-and-improve/SKILL.md` per target, which applies `ui-design`, `ux-audit`, `motion-design`, and `frontend-build`. Produce one `briefs/<slug>.json` per prospect hitting the canonical spec: **10 sections, 350 to 500 words, 12 to 13 images**. Keep their exact lingo; improve the writing and everything else. Copy harvested imagery into `sites/<slug>/assets/` as `image-1.webp` onward, hero first.

5. **Build and QA the batch.**
   `node _templates/site-factory/build-batch.js <batch-dir>`
   This builds every site, runs the QA gate on each (static + visual), checks spec compliance, and fails any site sharing a duplicate image with another in the batch. Brief count must equal `targetCount` unless `--allow-partial` (test/preview only). Non-zero exit means something is held. Fix and rerun.

6. **Taste pass.** Open the generated `index.html` hub and judge every site by eye: does it look expensive, does it look like that specific business, is the palette dull. Check `_templates/site-factory/qa-shots/<slug>/phone.png` for cramped mobile headlines. Send failures back to step 4.

7. **Package for approval.** One hub URL, a five-minute Loom on the strongest three or four, `prospects.csv`, and the mail piece proof. Mac wants one link and a short Loom, not a long document. Generated `mail_ready` is always `hold`.

8. **Log.** Commit the batch, then update the Results section of the generated `batch-report.md` once the drop happens.

## Hard rules

- Every prospect demo stays `noindex`. No exceptions.
- Deploying, mailing, and sending are Tier 2. Stage everything, hand Dillon the command, let a human approve the list and the mail piece.
- `mail_ready` in generated `prospects.csv` is always `hold`. Only an explicit human approval may flip it. `qa_ready` is the automation signal for review eligibility.
- Facts come from the harvest or verified research. Unverifiable fields stay empty.
- Never reuse a photo within a site or across the batch; the runner enforces this by content hash.
- Slugs must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Harvest URLs must be public http(s).
