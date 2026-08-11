---
tags: [concept, ads-research]
source: "[[12_Brain/private/raw/2026-07-04 - full-autonomy-directive]]"
updated: 2026-07-05
expires: 2026-08-04
---

# Google Ads Conversion Optimization — 2026 tactics

One-line: how to bid, structure PMax, and diagnose no-spend for conversion-goal
Search + PMax accounts, verified July 2026. Feeds [[02_Campaigns/Ads Ops/Ads Ops Hub]].

## Bid strategy by conversion volume
- **Conversion-starved line ≈ 30 conv / 30 days per campaign.** Below that,
  tCPA/tROAS underperform because the model lacks signal (Google's *stated*
  floor is 15 — operator consensus target is 30-50).
- **New / <30 conv/mo → Maximize Conversions**, not tCPA (accumulates the data
  tCPA later needs). Highest raw volume, volatile CPA.
- **≥30 conv/mo → switch to Target CPA** (lower CPA at higher volume), best when
  enhanced/offline conversions also feed in.
- **Maximize Clicks** = fallback only when tracking/volume is ~zero and you just
  need traffic to build data. Temporary.
- **Learning phase: stop tweaking.** Any bid/target/budget change resets the
  clock; set-and-leave ~1-2 weeks.
- **June 2026 renames:** "Max conv w/ tCPA" → **"Target CPA"**; "Max conv value
  w/ tROAS" → **"Target ROAS"**. Same mechanics, new labels.

## PMax
- Fill every asset slot: 10-15 headlines, all 3 image ratios, both logo ratios,
  ≥1 real video/group (else Google auto-makes an ugly one).
- Theme each asset group (matched creative + audience signal + LP).
- **Cannibalization is real** — Search converts better than PMax on the same
  query. Use **Brand Exclusions** (Campaign Settings) if running a branded
  Search campaign alongside. Audit weekly: did Search CPCs rise post-PMax?
- Audience signals = suggestions, not targeting; stack customer-match +
  in-market + custom-intent to speed learning.
- Use 2026 controls: URL exclusions to kill blog/informational spend,
  higher negative-keyword limits, asset-level performance data.

## Enhanced conversions
- Sends SHA-256-hashed first-party data (email/phone) → higher match rate →
  better Smart Bidding signal. Foundation now cookies are dead.
- **Requires accepting Customer Data Terms** (Goals → Settings → Customer data
  use) — the toggle does nothing until terms accepted.
- **April 2026**: web + leads unified; can send via tag + Data Manager + API
  simultaneously. **June 2026**: UI collapses to a single switch. Existing
  accounts auto-migrated.

## NO-SPEND diagnostic order (cheapest/most common first)
1. **Ads disapproved / under review** — can't serve. Check first.
2. **Limited by budget / starvation** — too many campaigns splitting too little.
3. **Bids too low / poor Ad Rank** — #1 cause on Manual CPC.
4. **Learning phase** — new/edited Smart Bidding ramping; stop editing.
5. **Targeting too narrow** — tiny geo, over-layered audiences, low-volume kw.
6. **Conversion tracking broken** — Smart Bidding with no signal throttles.

## Caveats to verify in-account
- 30-conv floor is operator consensus, not official (Google says 15).
- Confirm the EC single-toggle rollout is actually live in each account before
  assuming the new UI.

Sources: Search Engine Land (EC unification 2026-04-10; PMax tips 2025-09-12),
Google Ads Help (tCPA, EC, primary/secondary), growthspree/groas/blackpropeller/
digitalapplied 2026 benchmarks.
