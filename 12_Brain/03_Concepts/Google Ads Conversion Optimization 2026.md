---
tags: [concept, ads-research]
source: "[[12_Brain/01_Captures/2026-07-04 - full-autonomy-directive]]"
updated: 2026-09-04
expires: 2026-10-04
note_type: concept
status: active
created: 2026-07-05
source_refs: ["[[12_Brain/01_Captures/2026-07-04 - full-autonomy-directive]]", "https://support.google.com/google-ads/answer/17061251?hl=en", "https://support.google.com/google-ads/answer/17125145?hl=en"]
---


# Google Ads Conversion Optimization — 2026 tactics

One-line: how to bid, structure PMax, and diagnose no-spend for conversion-goal
Search + PMax accounts, verified July 2026, reviewed Sept 2026 — one material
bidding-behavior change landed (Aug 17 2026, see below), rest held up.
Feeds [[02_Campaigns/Ads Ops/Ads Ops Hub]].

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
- **Aug 17 2026 — target-based bidding ends "overperformance" (act on this):**
  Google changed how budget-limited Target CPA / Target ROAS campaigns (and
  Target CPC for Demand Gen) bid, across Search, Shopping, PMax, Demand Gen,
  Display, Hotel, Travel. Previously a "Limited by budget" campaign could
  quietly beat its stated target (e.g. $10 target actually delivering $5-6
  CPA). Now bidding pursues the literal number you typed, even across budget
  changes — so CPA/ROAS on any budget-capped target campaign can drift toward
  the stated target and look "worse" with no creative or targeting change
  behind it. Daily/monthly budget caps are still respected; this doesn't
  auto-increase spend. Only Target Impression Share, Manual CPC, and
  non-budget-limited campaigns are unaffected.
  **Do before reading a CPA/ROAS swing as real:** check the notification
  banner "Review your campaign targets" (or Campaign → Settings → Bidding →
  Review campaigns) for the **Bid Target Adjustment Tool** (live since July 6
  2026) and either (a) accept the shift, (b) reset the target to recent actual
  performance, (c) set a custom target reflecting the real goal, or
  (d) switch to Maximize Conversions/Conversion Value if you want volume back.
  Source: support.google.com/google-ads/answer/17061251 and /17125145.

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
- **April 2026 (live)**: web + leads unified; can send via tag + Data Manager +
  API simultaneously. **June 2026 (live)**: UI collapsed to a single switch.
  Existing accounts auto-migrated — confirm the single-toggle UI is what you
  see before assuming legacy per-method screens still apply.

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
- Aug 17 2026 target-bidding change: confirm whether each budget-limited
  tCPA/tROAS campaign got the Bid Target Adjustment Tool prompt and whether
  anyone has acted on it — don't diagnose a CPA rise as a targeting/creative
  problem until this is ruled out first.

Sources: Search Engine Land (EC unification 2026-04-10; PMax tips 2025-09-12),
Google Ads Help (tCPA, EC, primary/secondary), growthspree/groas/blackpropeller/
digitalapplied 2026 benchmarks. Sept 2026 review added: Google Ads Help
answer/17061251 and answer/17125145 (target-based bid strategy change,
2026-08-17, fetched directly), corroborated by Search Engine Journal and
Search Engine Land coverage of the same change.
