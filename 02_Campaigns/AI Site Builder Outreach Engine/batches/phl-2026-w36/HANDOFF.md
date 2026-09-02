---
tags: [campaign, batch, handoff]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: phl-2026-w36
status: staged
updated: 2026-09-01
---

# phl-2026-w36 handoff: Wave 4 redesigns, call sheet rows 101 to 143

One line: the 25 briefs are written and compiled, 16 of 25 image sets are on disk, the remaining 9 sets plus 10 retries are generated and waiting for pickup, and nothing is built, deployed, or sent. Finish with the run order below.

## What this batch is

Jesse's 238-business call sheet (`Momentum 360 - 238 Call-Ready Businesses - 2026-08-13`, tab 1) still had 43 rows marked `FIX | later batch` after the 2026-09-01 Best 75 verification. 25 of those 43 were not on the Best 75 sheet. Those 25 are this batch, in sheet order. Source rows and facts: `state/targets-raw.json`.

Substitution and identity fixes (tell Jesse):

| Row | Sheet name | What changed | Why |
|---|---|---|---|
| 131 | BPM Fitness | Replaced by Ooka Sushi & Hibachi, Willow Grove (HOLD list, score 40) | Yelp lists BPM as closed as of June 2026; radar registry has it `excluded` |
| 120 | Pro Nails | Built as Pro-Nails Nailery, Willow Grove Park Mall, (215) 657-6245 | The sheet phone belongs to the mall salon; `gopronails.com` is a different multi-state chain in Royersford |
| 141 | Jarman Sales & Service | Built on `jarmansalesandservice.com` | `jarmanairconditioning.com` returns 404 everywhere |
| 140 | HaverCrown Dental | No official site link on the page | `havercrowndental.com` returns 404; facts from Healthgrades, Birdeye, ADA |
| 126 | Always Dental Care | Facebook page used as the site link | `alwaysdentalcare.com` is in a www to non-www redirect loop |
| 125 | WJA Landscaping | Page shows (610) 831-3819 | That is the number on the official contact page; the sheet has (267) 278-9754 and Yelp has (610) 490-8889. Confirm on the call |
| 121 | Salter's Fireplace | Eagleville showroom is the primary address | Sheet phone (610) 631-9372 is the Eagleville line; Hatfield is (215) 362-2443 |

## Where things live

| Path | What |
|---|---|
| `specs/chunk-1..5.json` | 25 compact creative specs (facts, palette, fonts, attitude, copy, 13 image scenes) |
| `specs/overrides.json` | Copy trims that bring pages inside the 350 to 500 word gate |
| `tools/compile-briefs.js` | Expands specs plus overrides into `briefs/<slug>.json` and `prompts.json` |
| `tools/fetch-images.js` | Downloads Higgsfield results into `sites/<slug>/assets/image-N.webp` |
| `briefs/` | Compiled briefs, ready for `build-batch.js` |
| `sites/<slug>/assets/` | Downloaded imagery (16 complete sets, see below) |
| `state/higgsfield-jobs/` | Job IDs per site, index = image number |
| `state/higgsfield-urls/` | Result URLs already known, per site |
| `state/*.json` | Target facts, digests of the old demos and of reachable official pages |

Generator changes made for this batch (in `_templates/site-factory/`): `build-site.js` now takes `imageDisclosure: true` and prints the illustrative-imagery disclosure line the HOLD sheet requires; the one em dash in `base.css` was removed.

## Imagery status

Every image is Higgsfield illustrative (nano_banana_pro, 2 credits each, about 640 credits spent). Real photography could not be harvested from this sandbox: most official sites sit behind bot walls that reset the egress proxy. Each page carries the disclosure line.

Complete on disk (12 of 12): dutton-road-veterinary-clinic, eastern-dragon, go2tech, home-furnishings-consignment, philadelphia-garage, pro-nails, salters-fireplace, thr-insurance.

On disk, missing slots (retry already generated, see `state/higgsfield-jobs/resubmit-*.json`):

| Site | Missing | Retry job |
|---|---|---|
| johnnys-pizza | 12 | resubmit-1 `johnnys-pizza:12` |
| southampton-hot-tub | 1, 3 | resubmit-1 |
| wja-landscaping | 6, 9 | resubmit-1 |
| always-dental-care | 8 | resubmit-1 |
| barnes-financial-group | 9 | resubmit-2 |
| be-balanced-hormone | 2 | resubmit-2 |
| county-line-veterinary-hospital | 12 | resubmit-2 |
| dreammaker-bath-kitchen | 7 to 12 | URLs known: `state/higgsfield-urls/dreammaker-bath-kitchen.json` (download was interrupted) |
| easy-auto-tag-insurance | all | URLs known: `state/higgsfield-urls/easy-auto-tag-insurance.json` |
| eisenberg-rothweiler | all, and 4 failed | URLs known for 11; regenerate slot 4 from `prompts.json` |

Generated, not yet downloaded (poll the job IDs with `jobs_wait`, then run the fetcher): fillman-and-sons-floors, glen-eagle-pediatric-dentistry, havercrown-dental, jarman-hvac, verruni-landscaping, live-urgent-care, ooka-hibachi-and-sushi.

If the Higgsfield MCP is not available to the routine, regenerate any missing slot from `prompts.json` with any image tool; every slot must be a unique file (the batch runner rejects duplicate hashes).

## Run order for tomorrow

```bash
cd "02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w36"

# 1. Briefs (idempotent)
node tools/compile-briefs.js

# 2. Images: for each URL file, download; for pending jobs, jobs_wait first, write a URL file, then download
node tools/fetch-images.js <slug> state/higgsfield-urls/<slug>.json
#    every sites/<slug>/assets must end with image-1.webp .. image-12.webp

# 3. Build + QA (Playwright pinned to the preinstalled Chromium: npm i --no-save playwright@1.56.1 sharp)
cd /home/user/dillon-os
node _templates/site-factory/build-batch.js "02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w36"
#    fix every FAIL, rerun until the blocked list is empty

# 4. Taste pass on index.html and qa-shots/<slug>/phone.png, record the walkthrough, independent checker verdict
# 5. Deploy noindex previews to a NEW Netlify site (deployBaseUrl in batch.json), verify 200 + noindex on samples
# 6. Sheet: add the 25 rows to the Best 75 sheet pattern with Local QA / Deploy QA / Phone Match columns
# 7. Slack: DM Jesse the hub link (draft below). Approval-gated; see System/approval-queue.md
```

Word gate after the trim pass: all 25 pages measure between 398 and 499 words with the current overrides. Re-check johnnys-pizza, dutton-road-veterinary-clinic, and eastern-dragon after step 3; they sit closest to the ceiling.

## Facts Jesse should confirm on the call

- Eastern Dragon: Friday and Saturday hours were not on the official page.
- Johnny's Pizza: Sunday hours were not listed.
- Live Urgent Care KOP: street number not published on the location page; the page says Town Center Road via DeKalb Road.
- BeBalanced: the 15 to 21 pounds in 30 days figure is BeBalanced's own claim and is attributed as such on the page.
- Southampton Hot Tub and Philadelphia Garage: no published hours found.

## Slack draft for Jesse (unsent)

> Wave 4 is up: the 25 rows from your call sheet still marked FIX after yesterday's 75 are rebuilt and QA'd. One link: {hub URL}. Two things to know before you screenshare: BPM Fitness is closed (Yelp, June 2026) so Ooka in Willow Grove took the slot, and the Pro Nails row is the mall salon at Willow Grove Park, not the gopronails.com chain. Jarman's old domain is dead; the page points at their current site. Every page has the illustrative-imagery line. Sheet rows with local, deploy, and phone checks: {sheet URL}. No calls or outreach sent.
