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

1. **Scope.** Pick one market and one or two verticals from `02_Campaigns/AI Site Builder Outreach Engine/Market Roster.md`. Over-pull **60 to 100** candidates, not 25 to 30 — the grader in step 1b is what narrows them, and it typically holds back a third or more. Exclude current clients in `01_Clients/`, active deals, and anyone previously mailed.

1b. **Grade the list. This gate is not optional.**

   ```bash
   node _os/automation/bin/grade-list.js --from <roster.json> --take 25
   ```

   Only prospects in the `build`, `rebuild`, or `refresh` lanes may proceed to a
   brief. Read the do-not-pitch list before anything else and confirm nobody on it
   reaches outreach. Rows in `manual` need a human to open the site; rows in
   `enrich` need review data added, then re-run.

   Skipping this step is how the 2026-08-05 batch shipped 38 sites to businesses
   that already had good websites. Full rules: `.claude/skills/site-grade/SKILL.md`
   and `12_Brain/protocols/prospect-grading-gate.md`.

2. **Scaffold.** Create `02_Campaigns/AI Site Builder Outreach Engine/batches/<batch-id>/` with `batch.json` (`id`, `title`, `market`, `week`, `idPrefix`, `targetCount: 25`, `deployBaseUrl`) and an empty `briefs/` folder. Batch IDs look like `phl-2026-w31`.

3. **Harvest.** Build `targets.json` as an array of `{slug, siteUrl, socials}` then run:
   `node _templates/site-factory/harvest.js --from targets.json`
   Drop any target whose harvest failed. Never build on invented facts.

4. **Mirror each prospect.** Follow `.claude/skills/mirror-and-improve/SKILL.md` per target, which applies `ui-design`, `ux-audit`, `motion-design`, and `frontend-build`. Produce one `briefs/<slug>.json` per prospect hitting the canonical spec: **10 sections, 350 to 500 words, 12 to 13 images**. Keep their exact lingo; improve the writing and everything else. Set a distinct `attitude` (`glass` | `editorial` | `brutal` | `warm` | `industrial` | `neon`) so the batch does not look like 25 recolors. Copy harvested imagery with `node _templates/site-factory/apply-harvest-images.js <slug> <site-dir>`; if harvest is thin, generate lookalike atmosphere images and label them generated.

5. **Build and QA the batch.**
   `node _templates/site-factory/build-batch.js <batch-dir>`
   This builds every site, runs the QA gate on each (static + visual), checks spec compliance, and fails any site sharing a duplicate image with another in the batch. Brief count must equal `targetCount` unless `--allow-partial` (test/preview only). Non-zero exit means something is held. Fix and rerun.

6. **Taste pass.** Open the generated `index.html` hub and judge every site by eye: does it look expensive, does it look like that specific business, is the palette dull. Check `_templates/site-factory/qa-shots/<slug>/phone.png` for cramped mobile headlines. Send failures back to step 4.

7. **Package for approval.** One hub URL, a five-minute Loom on the strongest three or four, `prospects.csv`, and the mail piece proof. Mac wants one link and a short Loom, not a long document. Generated `mail_ready` is always `hold`.

8. **Log.** Commit the batch, then update the Results section of the generated `batch-report.md` once the drop happens.

## Hard rules

- **No prospect enters a batch without a current grade in an eligible lane.** A
  business whose site scores 80+ never gets a website pitch, however good a prospect
  they look otherwise.
- Every prospect demo stays `noindex`. No exceptions.
- Deploying, mailing, and sending are Tier 2. Stage everything, hand Dillon the command, let a human approve the list and the mail piece.
- `mail_ready` in generated `prospects.csv` is always `hold`. Only an explicit human approval may flip it. `qa_ready` is the automation signal for review eligibility.
- Facts come from the harvest or verified research. Unverifiable fields stay empty.
- Never reuse a photo within a site or across the batch; the runner enforces this by content hash.
- Slugs must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Harvest URLs must be public http(s).
