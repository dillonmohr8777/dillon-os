---
note_type: research
status: active
date: 2026-09-16
updated: 2026-09-16
expires: 2026-10-16
tags:
  - momentum
  - slack
  - agents
source_refs:
  - slack_list_user_channels (45 joined: 38 active, 7 archived; live call 2026-09-16)
  - slack_search_channels query=360 (16 channels found, 5 unjoined but readable)
  - "#general C066HKJ2E"
  - "#news-and-resources C0B744NQ7"
  - "#momentumsites C1CFQBC79"
  - "#design-social-email C1DEJDQ7Q"
  - "#skool-gbp-course CNYCM0GAZ"
  - "#content-media C01SPGA9C1F"
  - "#accountmanagement C0223RR7R6D"
  - "#360ops C0245CEKF16"
  - "#ai-tech-news C04HXSVN2CS"
  - "#capsule-and-tonic C04MB3ZQ7FT"
  - "#everyday-life-insurance C051QQL8UNS"
  - "#kimberly-james-bridal C0530MVK371"
  - "#deborah-mara C05UM2X3FQS"
  - "#360marketing C06CL0R09A4"
  - "#new-hire-training C077U1344E6"
  - "#onsite-construction C087GM7SEJF"
  - "#gmbs-reinstatement C08PB4N3L6L"
  - "#green-slate-masonry C08UWCW6PCH"
  - "#hope-wellness-center C092MVBN8SV"
  - "#pro-fence-deck C09DEEBMW0J"
  - "#fresh-blends C0A8XE76XGR"
  - "#bar-crawl-usa C0AEGE1V5KR"
  - "#nkcdc C0AQB2TF1AB"
  - "#va-claims C0AU6GMGY73"
  - "#outbound C0B6UUBMW9M"
  - "#revive-systems C0B9V5QDGJH"
  - "#pritzker-law-group C0BB04ZFZ26"
  - "#bridge-software-development C0BGWRK03B2"
  - "#nexla C0BRY1H1L9W"
  - "#puttery C0BT1P1PGJF"
  - "#gt-clinic C0C0RR57B25"
  - "#comcast-partnership C0C1YNSHBQV"
  - "#momentum-help C0C2VSTBQ9W"
  - "#360leads C05R2B1ULF6 (not joined, read via search)"
  - "#360boilerroom C04KMRT3CAE (not joined, read via search)"
  - "#360newprojects C05QTMMKKF0 (not joined, read via search)"
  - "#360photographers C01FSP9HYNT (not joined, read via search)"
  - "#360brokerage C04RE7MARPD (not joined, read via search)"
  - C:\Users\dillo\Documents\Codex\projects\client-operations\registry\clients.json
  - C:\Users\dillo\repos\dillon-os\12_Brain\06_Research\2026-09-16 - Momentum team bottlenecks and Workmate health.md
---

## Channel count

45 joined channels (38 active, 7 archived) via slack_list_user_channels. Search reaches further: the single query "360" surfaced 16 channels, 5 not joined but readable without joining (#360leads, #360newprojects, #360boilerroom, #360photographers, #360brokerage). The true reachable set is larger than 45; not fully enumerated here.

Of the 38 active: 20 are client channels, 1 is a referral partner (#comcast-partnership), 17 internal. Dead (silent 14+ days): #content-media (last 2026-08-17), #news-and-resources (last real content 2026-06-25), all 7 archived, plus unjoined #360boilerroom (last 2026-08-31), #360photographers and #360brokerage (dead since 2022 to 2023). Most active same day (2026-09-16): #360leads, #360newprojects, #360ops, #design-social-email, #accountmanagement, #onsite-construction, #pro-fence-deck, #va-claims, #comcast-partnership, #capsule-and-tonic, #gt-clinic, #momentum360xplg, #360marketing.

## Findings the 2026-09-12 pass missed

It read #360leads, #momentumsites, #outbound, #ghl-leads-apollo. This pass read the rest.

**1. Nexla, money at risk.** #nexla C0BRY1H1L9W. Affects the whole ad account. Smart Bidding is training on spam: GTM fires a generic form_submit conversion instead of the real HubSpot success event, the demo form has captcha off, and 7 of 11 late-August form fills were fake but carried a paid click id (diagnosis 2026-09-09 21:05). Every day the fix stays unpublished, more spend teaches the model to buy more fake leads; still unresolved and blocked on the client per the 2026-09-14 17:15 report ($365.95 spent that week, zero real conversions). Agent: a tracking-integrity check that catches a generic conversion event and a captcha-off form at setup, not three weeks into spend.

**2. Capsule and Tonic, recurring unconfirmed discrepancy.** #capsule-and-tonic C04MB3ZQ7FT, no entry in clients.json at all (same gap class as gt-clinic). Affects Beth Kann and client trust in lead counts. 7 September lead forms tracked by ads do not appear on the client-facing sheet. Contractor taj answered "It's working fine" (2026-09-14 10:30) then "I'll recheck the Google Ads tracking workflow today and let you know" (2026-09-14 11:31); no recheck result appears through the next channel activity (2026-09-16 16:10, unrelated topic). Recurs at least twice in September per Beth's count (Sept 2 and Sept 13 batches). Agent: daily reconciliation between ad-platform lead counts and the destination sheet, alerting same day.

**3. Registry to Slack mismatch (inference: gap, not confirmed intentional).** Nine active clients.json entries have an empty slackChannels array despite a live named channel: kimberly-james-bridal (active 2026-09-15), omega-landscaping (#omega-landscape, active 2026-09-16), onsite-concrete-landscape (#onsite-construction, active 2026-09-16), hope-wellness-center, fresh-blends-kwik-trip, bar-crawl-usa, fagan-painting, pro-fence-deck, va-claims-edge. Two more client channels have no clients.json entry at all: #everyday-life-insurance C051QQL8UNS (active 2026-09-14) and #green-slate-masonry C08UWCW6PCH (last 2026-09-04), joining Capsule and Tonic. Agent: nightly diff of joined client-named channels against clients.json, ticket on any mismatch.

**4. GMBS reinstatement, lead attribution gap.** #gmbs-reinstatement C08PB4N3L6L. Affects contractor Nick Groh running the Google Business Profile suspension-recovery ad product. "The Pmax campaign Mac had brought in 2 leads over the weekend, but not sure who these are or where they are (if theyre spam) so i need to track them down" (2026-09-14 12:51); admin access friction from 2026-09-07 15:22 was still being worked around a week later. Recurs weekly per his own reports. Agent: attach originating campaign and contact identity to every lead at intake so the contractor is not reverse-engineering it.
