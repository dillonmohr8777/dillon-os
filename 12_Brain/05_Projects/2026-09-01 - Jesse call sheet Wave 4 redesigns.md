---
note_type: project
status: active
created: 2026-09-01
updated: 2026-09-01
source_refs:
  - "02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w36/HANDOFF.md"
  - "02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w36/state/targets-raw.json"
  - "https://docs.google.com/spreadsheets/d/1U6qB7EWRL7DRXMK46W7-KLhDYoVXV4Q-9rpC14qMTlo/edit"
  - "https://docs.google.com/spreadsheets/d/1all9mAQTmrwc5cFbXwJrTykszD76_62gG2N1wouj3fs/edit"
  - "Slack DM Dillon Mohr to Jesse DiLaura, 2026-09-01 13:09 EDT"
tags:
  - brain
  - project
  - website-factory
  - philadelphia
  - prospects
  - momentum-360
owner: Dillon Mohr
area: high-craft website factory
outcome: "Move Jesse's verified call-ready sheet from 75 to 100 by redesigning, QA-ing, and deploying the 25 call-sheet rows (101 to 143) still marked FIX, as private noindex previews."
next_action: "Run the batch build from HANDOFF.md: pick up the pending Higgsfield image sets, run build-batch.js, taste pass, independent checker, deploy to a new Netlify site, then DM Jesse the one link (approval-gated)."
review_on: 2026-09-03
priority: high
observed_at: 2026-09-01
confidence: 0.9
verification_status: partial
outreach_status: hold
public_deploy: none
---

# Jesse call sheet Wave 4 redesigns (phl-2026-w36)

## Goal

The verified call-ready sheet reached 75 prospects on 2026-09-01. This project takes it to 100 by rebuilding the 25 rows on Jesse's 238-business call sheet that were still marked `FIX | later batch` and not on the Best 75: rows 105, 106, 111 to 113, 118, 120 to 122, 124 to 126, 128, 129, 131, 134 to 143. Each becomes a redesigned, QA-passed, noindex preview with the illustrative-imagery disclosure line Jesse's HOLD sheet requires.

Done means: 25 pages pass the factory gate (9 to 11 sections, 350 to 500 words, 12 to 13 unique images, static and visual QA), an independent checker signs the walkthrough, previews return 200 with noindex from a new Netlify site, and Jesse has one hub link plus sheet rows with local, deploy, and phone checks.

## State on 2026-09-01

- Facts verified for all 25 from official pages where reachable and from directories elsewhere; conflicts are listed in the handoff.
- 25 briefs compiled from compact specs; 21 of 25 inside the word gate after one trim pass, the other four within a few words of it.
- Imagery is Higgsfield illustrative for every site (about 640 credits); 8 sites complete on disk, 8 partial, 9 generated and awaiting download.
- One substitution: BPM Fitness (closed per Yelp, June 2026; excluded in the radar registry) replaced by Ooka Sushi & Hibachi, Willow Grove, from the HOLD list.
- Nothing built, deployed, or sent. Deploy and the Slack DM are queued in [[System/approval-queue|the approval queue]].

## Lessons captured

- The sandbox egress proxy cannot harvest most small-business sites (bot walls reset the tunnel); WebSearch plus directory listings and the prior demo digests are the reliable fact base. Real photography must come from a machine with a residential connection or from the business.
- The factory word gate counts chrome (marquee twice, contact cards, footer disclosure). Copy per page must stay near 200 words in the spec to land under 500 rendered.
- Keep `overrides.json` out of the specs glob; the compiler now excludes it.

## Links

- [[02_Campaigns/AI Site Builder Outreach Engine/AI Site Builder Outreach Engine|AI Site Builder Outreach Engine]]
- [[02_Campaigns/AI Site Builder Outreach Engine/Batch Runbook|Batch Runbook]]
- [[12_Brain/05_Projects/2026-08-04 - Philadelphia 25 Site Factory Batch 4|Batch 4]] (previous cohort)
