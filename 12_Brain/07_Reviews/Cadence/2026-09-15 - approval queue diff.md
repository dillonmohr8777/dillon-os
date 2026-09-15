---
note_type: review
status: active
date: 2026-09-15
updated: 2026-09-15
cadence: daily
job: approval-queue-diff
source: System/approval-queue.md
tags:
  - review
  - approvals
  - cadence
---

# Approval queue diff — 2026-09-15

Compared against the previous run, `2026-09-14 - approval queue diff.md`, using
the committed state of `System/approval-queue.md` at that run (`ea79f0a2`) as the
baseline. `approval-queue.md` was **not** modified by this job.

## Totals

| | Baseline 2026-09-14 12:07 | Now |
| --- | --- | --- |
| Open (unchecked) | 89 | **114** |
| Closed (checked, still in file) | 8 | 0 |
| Total items in file | 97 | 114 |

**Net +25 open in one day.** The queue grew faster than it drained.

> Count caveat: yesterday's report stated 110 open / 8 closed / 118 total against
> the *working tree*; the committed file at that moment held 89 open / 97 total.
> Today's comparison uses the committed baseline, which is the only version that
> can be reproduced. The direction of travel is the same either way.

## Added since the previous run — 32

Dated 2026-09-12 (3), 2026-09-13 (1), 2026-09-14 (28). Highlights, by the label
the item gave itself:

- **ROTATE, LIVE SECRET IN A SYNCED TRANSCRIPT** — Anthropic API key with prefix
  `sk-ant-api03` pasted into a Claude Code session 2026-09-14.
- **FIFTH PLAINTEXT CREDENTIAL IN SLACK** — Deborah Mara WordPress admin password
  posted in channel, not counted in the earlier exposure tally.
- **NAME A BACKUP DESTINATION** — 575 films have no copy anywhere; 735 unique
  films, 7.36 GB of 19.52 GB raw.
- **BEFORE THE MAC ARRIVES** — three repositories exist on exactly one disk and
  need private GitHub remotes.
- **REPORTED CONVERSIONS WERE INFLATED** — Omega conversion fired before the form
  was accepted; expect reported numbers to fall.
- **WORSE THAN THE OMEGA DEFECT** — Onsite Concrete account 103-371-5894 carries
  twelve conversion actions, at least nine of them primary.
- **CLIENT WAS TOLD SOMETHING THE EVIDENCE CONTRADICTS** — Revive Systems
  background check did not pass, contrary to what Mike Over was emailed 2026-09-10.
- **FACTUAL ERROR ALREADY IN A CLIENT INBOX** — Bar Crawl USA report sent to Andy
  2026-09-10 credits Semrush for a figure it did not produce.
- **THE UNLOCK FOR EVERY MATCH-BACK PROMISE** — Zapier lead notifications carry a
  link instead of the lead.
- **ANNOUNCING AN UNANNOUNCED RULE CHANGE** — `System/MASTER-ORCHESTRATOR.md` was
  rewritten over the weekend.
- **10 DRAFTS STAGED, DO NOT SEND YET** — weekly client report emails for
  Sep 7–13; no reports for that week exist.
- **USER CORRECTION vs REGISTRY** — NKCDC stated by Dillon not to be a client;
  `registry/clients.json` still lists it.

Plus decisions on: the 23-film Momentum AI slate (none accepted or rejected), the
Need Momentum birds 30s master, kie.ai account ownership, hosted-agent spend
ledgering in dollars, the `weekly-immohrtal-seo-analytics` standing deploy
authority, four dead-weight automations, the agent swarm, the migration kit
remote, Deborah Mara ChatGPT Ads spend, the Codex MCP stack leak, the paused
weekly report generator, three empty Gmail labels, Replenish serving status, and
a bad citation inside this file.

## Closed since the previous run — 0 marked `[x]` in place

**Nothing in the queue was checked off.** 15 items left the file entirely: 8 that
were already `[x]` (Fagan Painting ×3, the two 2026-09-09 repo-push items, the
design-system drift correction, Bridge PR #17, the Netlify URL resolution) and 7
that were still **open** —

- Cursor/MCP — authenticate Composio, Slack and WordPress connectors
- Align HCM — SmartCare assessment and ROI calculator deployment
- Align HCM — publish 10 drafted SEO blogs
- Hermes Gateway — consolidated 132 storm/restart approval lines
- Omega — access request to Wix / Google Ads / GoHighLevel
- Momentum AI Division — skill provenance move
- Omega — do not report the 17 conversions as-is

These were relocated by yesterday's hand-run `approval-queue-closing-pass` into
`System/approval-queue-archive.md`. **Seven open decisions moved out of the queue
without being decided.** Archiving is not closing; flagging it so they are not
silently lost.

## Rotting — open, dated more than 14 days ago

Cutoff 2026-08-31. **51 of 114 open items (45%) are rotting.** Oldest first.

| Date | Days | Item |
| --- | --- | --- |
| 2026-07-12 | 65 | 2026-07-12 - Bar Crawl USA - Approve publish after current-event hub and Boos & Booze SEO QA; do not alter ticketing or source data - Risk: medium |
| 2026-07-12 | 65 | 2026-07-12 - Book funnel - Configure and test lead-capture delivery before production deployment - Risk: high |
| 2026-07-12 | 65 | 2026-07-12 - Bridge Software Development - Approve client-facing milestone after Phase 1 ownership board and compliance review - Risk: medium |
| 2026-07-12 | 65 | 2026-07-12 - Capsule & Tonic - Approve optimization only after platform conversions reconcile to real leads - Risk: high |
| 2026-07-12 | 65 | 2026-07-12 - Everyday Life Insurance - Approve launch changes after 404 and site QA; approve links before acquisition - Risk: medium |
| 2026-07-12 | 65 | 2026-07-12 - Hope Wellness Center - Approve external response and any added graphic-design scope after request analysis - Risk: low |
| 2026-07-12 | 65 | 2026-07-12 - Kimberly James Bridal - Approve completion update after FAQ desktop image crop and responsive QA; verify appointment-source reconciliatio |
| 2026-07-12 | 65 | 2026-07-12 - Omega Landscaping & Concrete - Approve account changes only after Google/Meta call, form, and lead-quality attribution is verified - Risk |
| 2026-07-12 | 65 | 2026-07-12 - On-Site Concrete & Landscape - Approve technical or campaign changes after allowlisted crawl and conversion-action audit - Risk: medium |
| 2026-07-12 | 65 | 2026-07-12 - Pro Fence & Deck - Approve future LSA work separately; current lane is SEO only - Risk: medium |
| 2026-07-12 | 65 | 2026-07-12 - Replenish - Confirm recurring fifth dashboard slot; approve any new location, budget, or campaign change - Risk: high |
| 2026-07-12 | 65 | 2026-07-12 - Revenue - Verify current invoices or contracts for all 14 active clients before publishing MRR - Risk: low |
| 2026-07-12 | 65 | 2026-07-12 - Revive Systems - Approve paid-media option and any publish action after the 48-hour recovery brief - Risk: high |
| 2026-07-12 | 65 | 2026-07-12 - Shadow Heating & Cooling - Approve site deployment and any spend change after Meta access and current lead delivery are verified - Risk:  |
| 2026-07-12 | 65 | 2026-07-12 - VA Claims - Approve client review after VACE design reconciliation; backend and DNS changes remain gated - Risk: medium |
| 2026-07-12 | 65 | 2026-07-12 -- [Bar Crawl USA] -- Approve clearance of 2 disapproved ads (Halloween/Fall Cocktail) and audit PMax for Presence Only + tCPA guardrail; a |
| 2026-07-12 | 65 | 2026-07-12 -- [Book / Guest Posts] -- Approve and send guest-post pitches to CrimeReads, Spybrary, Independent Book Review -- Source: 00_Inbox/Top 15  |
| 2026-07-12 | 65 | 2026-07-12 -- [Book Funnel / ironicineptocracy.com] -- Approve GA4 + Meta Pixel install and launch Meta ads to lead-magnet; spend change -- Source: 00 |
| 2026-07-12 | 65 | 2026-07-12 -- [Bridge Software Development / Tori] -- Approve NDA-safe discovery prototype walkthrough for Tori meeting; publishing/client message --  |
| 2026-07-12 | 65 | 2026-07-12 -- [Ironic Ineptocracy Book / ironicineptocracy.com] -- Approve publish of dispatches 02-04, press kit fix, and per-character social graphi |
| 2026-07-12 | 65 | 2026-07-12 -- [Ironic Ineptocracy Book / ironicineptocracy.com] -- Fix broken /api/dossier-leads endpoint with Vercel serverless function and verify l |
| 2026-07-12 | 65 | 2026-07-12 -- [Shadow HVAC] -- Approve catch-up report to Mike after LSA verification post-Evident reset; client message -- Source: 01_Clients/Shadow  |
| 2026-07-13 | 64 | 2026-07-13 -- [Bar Crawl USA] -- Approve auto-publish of 20 city pages via WordPress publisher cloning Elementor ID 15281; verify Presence Only + tick |
| 2026-07-13 | 64 | 2026-07-13 -- [Bar Crawl USA] -- Approve delivery of June 2026 HTML report after replacing sample figures with live account numbers; publishing/client |
| 2026-07-13 | 64 | 2026-07-13 -- [Kimberly James Bridal] -- Approve publish of Wedding Dress Timeline (approved 2026-04-13) and Plus-Size page; Squarespace SEO publish - |
| 2026-07-13 | 64 | 2026-07-13 -- [Kimberly James Bridal] -- Approve publish of Wedding Timeline LP from creative-factory (_os/creative-factory/landing-pages/kjb-wedding- |
| 2026-07-13 | 64 | 2026-07-13 -- [Omega Landscaping & Concrete] -- Approve publish of Outdoor Living LP (_os/creative-factory/landing-pages/omega-outdoor-living.html); d |
| 2026-07-13 | 64 | 2026-07-13 -- [Revive Systems] -- Approve external delivery of 48-hour lead-recovery brief (GBP, AEO/GEO, conversion paths, 3-in-30 plan); client mess |
| 2026-07-13 | 64 | 2026-07-13 -- [Shadow HVAC] -- Approve publish of Summer AC landing page + reel (_os/creative-factory/landing-pages/shadow-hvac-summer-ac.html); deplo |
| 2026-07-13 | 64 | 2026-07-13 -- [VA Claims] -- Approve internal review 2026-07-23 and client demo 2026-07-25 for Phase 2 portal; backend/DNS remain gated -- Source: 01_ |
| 2026-07-16 | 61 | 2026-07-16 -- [Bar Crawl USA / City Event LP Template] -- Approve build of compliance-safe city event LP template (no alcohol language, Presence Only) |
| 2026-07-16 | 61 | 2026-07-16 -- [Onsite Concrete / Divi Repair] -- Approve publish of Divi hero repair LP after allowlisted QA; deployment gated -- Source: 02_Campaigns |
| 2026-07-16 | 61 | 2026-07-16 -- [Replenish / 7-Eleven Kiosk Finder] -- Approve build and publish of Kiosk finder LP for 5 South Florida 7-Eleven locations; verify store |
| 2026-07-19 | 58 | 2026-07-19 -- [Align HCM / Coinbase Repo Separation] -- Approve migration of Coinbase paper platform to a dedicated private repo, verify history/tests |
| 2026-07-19 | 58 | 2026-07-19 -- [Bridge / Fresh Blends Calendar] -- Approve sending the prepared conflict-resolution message to Ruben and moving Fresh Blends/AI sync fr |
| 2026-07-19 | 58 | 2026-07-19 -- [Netlify Capacity] -- Approve read-only usage audit followed by scoped pause/reduction of non-client workloads only; no purchase, plan u |
| 2026-08-13 | 33 | 2026-08-13 -- [Agent Infrastructure / Credential Security] -- Approve credential rotation only after Codex confirms the reported exposure against a li |
| 2026-08-13 | 33 | 2026-08-13 -- [BigOrange Marketing] -- Approve sending Emelia the SEMrush report request and scheduling the Janice interview for the overdue pillar re |
| 2026-08-13 | 33 | 2026-08-13 -- [Momentum Customer Agent / Jason and Sean] -- Approve Slack status reply after the committed bot and case-status corrections are verifie |
| 2026-08-13 | 33 | 2026-08-13 -- [Momentum Guidelines Training / Melissa] -- Approve status reply and scheduling of the requested guidelines prompt, Loom, and meeting -- |
| 2026-08-13 | 33 | 2026-08-13 -- [Replenish] -- Approve account-owner billing follow-up with Mia, then verify ad delivery after the payment requirement clears; no budget |
| 2026-08-14 | 32 | 2026-08-14 -- [Momentum 360 / CallRail] -- Approve evidence-backed status reply to Sean after latest CallRail logs and the surrounding thread verify a |
| 2026-08-14 | 32 | 2026-08-14 -- [Momentum 360 / NeedMomentum] -- Approve brand-direction reply to Jenny and a realistic update timeline after Mac and Sean confirm the d |
| 2026-08-18 | 28 | 2026-08-18 -- [Prospect Radar / generated-stock boards] -- Approve a generated-stock category board for 4 verticals so their sites can carry imagery:  |
| 2026-08-20 | 26 | 2026-08-20 -- [Prospect Radar / Direct Mail] -- Approve selecting PostGrid or StackAdapt and activating the Zapier physical-mail path; vendor spend re |
| 2026-08-20 | 26 | 2026-08-20 -- [Prospect Radar / Site Factory] -- Approve storing the Netlify deploy token in Cloud secrets and deploying approved batches to private p |
| 2026-08-23 | 23 | 2026-08-23 -- [Agent Infrastructure / Daily Driver] -- Approve enabling Frontier synthesis with -EnableFrontier; model invocation and associated spend |
| 2026-08-26 | 20 | 2026-08-26 -- [Replenish / Google Ads Access] -- Approve accepting the unread Google Ads user invite for customer 627-501-4654 after verifying the int |
| 2026-08-27 | 19 | 2026-08-27 -- [IMMOHRTAL Outreach / Held Prospects] -- Approve exact-recipient email outreach for Affordable Dentures, Reading Hospital at Muhlenberg, |
| 2026-08-27 | 19 | 2026-08-27 -- [Kimberly James Bridal / Wedding Timeline LP] -- Approve Squarespace publish after final production review; local CTA defect is cleared  |
| 2026-08-27 | 19 | 2026-08-27 -- [Shadow HVAC / Omega Landscaping] -- Approve production publish of the QA-cleared Summer AC and Outdoor Living landing pages after final |
The rotting cohort is unchanged in shape from yesterday: 30 of the 51 are the
original 2026-07-12 / 07-13 batch, now 64–65 days old. Nothing in that batch was
decided in the last 24 hours.
