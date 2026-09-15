---
name: site-grade
description: Find prospect businesses in a market and grade their existing websites, so build slots only go to businesses whose sites are genuinely worth replacing. Routes strong-site prospects to ads/SEO instead. Use before any site-batch, or when asked to score/qualify prospect websites.
---

# Site Grade

Stage 1–2 of the outreach engine ([[02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec|Pipeline Spec]]): discover prospects, grade the website each one already has, and route them to the right offer.

Full rubric, thresholds, and calibration history: `02_Campaigns/AI Site Builder Outreach Engine/Site Grader.md`.

## Why this runs before every batch

The factory can build 25 sites a week, but a redesign pitch only lands on a business whose site is actually worse than what we'd ship. Mac's 2026-08-05 note on the completed 100 — *some of these already have really great websites* — is the failure this prevents. Graded against their own sites, only 9% of the completed 100 would qualify for a rebuild today; a freshly graded Philadelphia pull hits 17%.

A strong site is **not** a dead lead. It changes the offer: they already invest in marketing, which makes them an ads / local SEO / GBP prospect instead.

## Run it

```bash
# 1. Discover candidates (OpenStreetMap, chains and already-built domains filtered out)
node _os/automation/bin/discover-prospects.js --market PHL --target 500 \
  --mix "home-services:170,medical:150,legal:100,industrial:20,spa-wellness:35,auto:20,retail:5"

# 2. Grade them (Tier 0: one fetch each, no browser)
node _os/automation/bin/grade-sites.js \
  --from 12_Brain/state/candidates/phl-<date>.json --market PHL --tier 0 --concurrency 12

# 3. Render the undecided ones (needs Playwright; only the `verify` rows)
node _os/automation/bin/grade-sites.js \
  --from 12_Brain/state/candidates/phl-<date>.json --market PHL --max-tier 1 --notes
```

Markets: `PHL`, `PGH`, `ERI`, `ALN`, `HBG`, `LAN`, `RDG`, `SCR`, `YRK`, `SCE`. Add `--areas` or `--bbox` for anywhere else.

Outputs land in `12_Brain/state/grades/<market>/`: `grades-<date>.json`, a leaderboard `.csv`, and `report-<date>.md` (the one to read).

## The two numbers

| Number | Question it answers | High means |
|---|---|---|
| **Site Quality Score** 0–100 | How good is *their current site*? | Leave it alone |
| **Opportunity Score** 0–100 | Should we spend a build slot? | Build for them |

Keeping these separate is the whole design. A single blended score cannot express "great business, great site, wrong offer."

## Verdicts

| Verdict | Meaning | Next step |
|---|---|---|
| `rebuild` | Site is dated/decayed and the business can pay | Tier-A brief via `/mirror-and-improve` — **the only verdict that consumes a build slot** |
| `verify` | Tier 0 found no fault but never saw the design | Run `--max-tier 1` before deciding |
| `polish` | Decent site, specific gaps | Pitch one landing page, not a rebuild |
| `ads_seo` | Strong site, weak visibility | Google Ads / Meta / local SEO / GBP content |
| `nurture` | Strong site and healthy visibility | No cold pitch |
| `enrich` | Not enough evidence | Fix the URL or retry, then re-grade |
| `suppress` | Client, prior deal, or already mailed | Out of the pool |

## Rules that matter

- **Tier 0 can prove a site is bad; it cannot prove a site is good.** It reads source HTML, never pixels. Any unrendered grade that would otherwise read "strong" is reported as `unconfirmed` and routed to `verify`. Never skip a prospect on a Tier 0 grade alone.
- **Absent is not zero.** Unmeasured dimensions drop out of the weighted mean and lower `confidence`; they never score 0. Same for the opportunity model — a prospect with no review data is scored against the points available, not penalised for the gap.
- **Infrastructure failure is not their outage.** Only `ENOTFOUND` and `ECONNREFUSED` count as a dead domain, because only those require an answer from the other side. Proxy errors, timeouts, transient DNS, and routing failures like `EHOSTUNREACH` are retried once then routed to `enrich`. Never mail someone "your site is down" on a timeout.
- **`queued_build` needs a provable fault.** A `rebuild` verdict is promoted only when the audit found something markup can certify — a missing viewport, a dead domain, a table layout (`hard_faults`). A verdict built from soft score pressure stays `graded` until a render confirms it.
- **Nothing with an address or a phone number goes into Git.** This repo is public. `sanitizeForGit()` strips street, coordinates and phone from every tracked write; contact detail lives in Mac's sheet and `12_Brain/private/`.
- **Grade before you harvest.** If a `harvest.json` already exists, the grader reuses it as free Tier 1 evidence rather than re-fetching.
- Nothing here is outbound-ready. `rebuild` means eligible for a brief, and a human still approves every send.

## The daily version

`/site-grade` grades one market on demand. The standing loop is `_os/automation/bin/radar-refresh.js`, run every morning on Dillon's desktop via `radar-morning.ps1` — it discovers ~200 new Pennsylvania businesses (Philadelphia-weighted), enriches the top rows with Google review data, re-audits whatever went stale, and rewrites `Daily-Briefs/prospect-radar.html`.

Setup: `_os/automation/docs/RADAR-SETUP.md`. The radar keeps a persistent registry with grade history, so a site that gets redesigned drops out of the queue and one that rots drops in.

## Feeding the batch

The `rebuild` queue, best-first, is the input to `/site-batch`. Take the top 25 and hand the `ads_seo` list to outreach as a separate offer — it is not a discard pile.

After a drop, record outcomes in the batch `results.md` so thresholds can be re-tuned against what actually closed.
