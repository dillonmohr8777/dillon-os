---
tags: [campaign, runbook, sop]
campaign: "[[AI Site Builder Outreach Engine]]"
cadence: weekly
target: 25 sites
---

# Batch Runbook

How to run one weekly batch of 25 prospect sites, start to finish. Skill version of this runbook: `.claude/skills/site-batch/SKILL.md`.

Companion notes: [[Pipeline Spec]] for stage ownership, [[Market Roster]] for what market and verticals are up, [[Slack Evidence Log]] for why any of this exists.

## Prerequisites (one time)

```bash
cd /workspace
npm i --no-save playwright && npx playwright install chromium --with-deps
```

Node 18+ is required. Nothing else; the generator has no dependencies.

## Step 0: Pick the market and pull the list

From [[Market Roster]], choose one market and one or two verticals. Build the prospect list of 25 to 30 candidates (over-pull, because some will be blocked).

Per prospect you need: business name, website URL, and any social profile URLs. Everything else comes from the harvest.

Exclusions to apply before anything else: current clients in `01_Clients/`, active pipeline deals, anyone previously mailed.

## Step 1: Scaffold the batch

```bash
BATCH=phl-2026-w31
mkdir -p "02_Campaigns/AI Site Builder Outreach Engine/batches/$BATCH/briefs"
```

Write `batches/$BATCH/batch.json`:

```json
{
  "id": "phl-2026-w31",
  "title": "Philadelphia Batch, Week 31",
  "market": "Philadelphia, PA",
  "week": "2026-07-27",
  "idPrefix": "PHL",
  "targetCount": 25,
  "deployBaseUrl": "https://phl-2026-w31.netlify.app",
  "note": "Home services and medical, Fishtown through Northern Liberties."
}
```

## Step 2: Harvest every target

Write `targets.json` (an array of `{slug, siteUrl, socials}`), then:

```bash
node _templates/site-factory/harvest.js --from targets.json
```

For each target this writes `_templates/site-factory/harvest/<slug>/` containing full-page desktop and phone screenshots of their site, screenshots of each social profile, their real high-resolution imagery, and `harvest.json` with their copy, brand palette, fonts, contact facts, and decay signals.

Login-walled socials are flagged `blocked: true`. Note it, don't invent around it.

**Gate:** any target whose harvest failed outright gets dropped from the batch. A demo built on invented facts is worse than no demo.

## Step 3: Mirror and improve, per prospect

Run the `mirror-and-improve` skill for each one. It chains the designated design skills:

| Skill | Job |
|---|---|
| `ui-design` | Palette from their real brand colors, type pairing, attitude tokens |
| `ux-audit` | Audit their current site's failures, then design the conversion flow |
| `motion-design` | Scroll reveals, hover states, one signature micro-interaction |
| `frontend-build` | Semantic markup, page-weight budget, image handling |

Output is one `briefs/<slug>.json` per prospect, hitting the canonical spec measured across the existing 25: **10 sections, 350 to 500 words, 12 to 13 images.**

Their lingo carries over verbatim: taglines, menu items, service names, neighborhood references, family history. The writing gets tighter, the voice stays theirs. `System/writing-rules.md` applies.

Copy their harvested imagery into `batches/$BATCH/sites/<slug>/assets/` as `image-1.webp` onward, hero first. Convert to webp.

## Step 4: Build and QA the whole batch

```bash
node _templates/site-factory/build-batch.js "02_Campaigns/AI Site Builder Outreach Engine/batches/$BATCH"
# Preview / fixture runs only:
# node _templates/site-factory/build-batch.js <batch-dir> --allow-partial
```

Production requires `briefs/*.json` count to equal `batch.targetCount` (default 25). A mismatch exits nonzero and holds every row unless `--allow-partial` is set for test/preview.

Static-only QA (Playwright missing or `--skip-qa`) is reported as `visual_qa=skipped` / `STATIC_ONLY` and does **not** set `qa_ready=ready`. Spec range misses block `qa_ready` too.

It writes:

| Output | Purpose |
|---|---|
| `sites/<slug>/` | The built sites |
| `index.html` | Review hub. **This is the one link Mac gets.** |
| `manifest.csv` | Sheet-ready rows with per-prospect UTM-tagged `qr_target_url` for the Zapier to QRTiger hop |
| `prospects.csv` | Mail merge. `qa_ready` reflects full QA + spec gates. **`mail_ready` is always `hold` in generated output**; only explicit human approval may flip it. |
| `batch-report.md` | Spec compliance table, blocked list, duplicates, next steps |

Exit code is non-zero if anything is blocked. Fix and rerun until the blocked list is empty or the blocked prospects are deliberately dropped.

## Step 5: Human taste pass

Automation can't judge taste. Open the hub and look at every site:

- Does it look expensive?
- Does it look like *that* business, or like the template with new colors?
- Is the palette dull, or does it come from their real brand?
- Would you be comfortable if the owner opened it cold?

Anything that fails goes back to step 3 for a design revision. Also spot-check `qa-shots/<slug>/phone.png` for cramped headlines.

## Step 6: Deploy

Netlify drop of the batch directory. Every preview stays `noindex`.

After deploying, confirm a sample of previews load and that `noindex` is still present. Deploying is Tier 2; if a token isn't configured, hand Dillon the command rather than guessing.

## Step 7: Approval package (Tier 2 gate)

Send Mac and Melissa:

1. The single hub URL
2. A five-minute Loom walking three or four of the strongest sites
3. `prospects.csv` for list approval
4. The mail piece proof

Mac's stated preference is one link plus a short Loom. Don't send a wall of text; park the detail in this vault.

**Nothing goes out until they approve the specific prospect list and the mail piece.**

## Step 8: Activate

On approval:

1. Push `prospects.csv` into the shared prospect sheet
2. The Zapier to QRTiger zap generates a QR per row from `qr_target_url`
3. Set the address column flag to `ready`, which triggers the mail zap (PostGrid or StackAdapt, vendor still undecided as of 2026-07-29)
4. Confirm a sample QR actually resolves to the right site before the drop

## Step 9: Record results

Fill in the Results section of `batches/$BATCH/batch-report.md`: pieces mailed, scans, calls booked, closes, revenue, sliced by vertical and design direction. Then update [[Pipeline Spec]] scoring if a pattern emerges.

Every batch is a hypothesis. Wins become patterns, losses become documented mistakes not to repeat.

## Weekly time budget

The batch build and QA is one command and runs in minutes. The real time goes into steps 2, 3, and 5: harvesting, research and brief authoring, and the taste pass. That's where to add parallel agents if 25 a week gets tight.
