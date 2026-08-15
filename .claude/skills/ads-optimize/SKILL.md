---
name: ads-optimize
description: Draft Optmyzr-style IF/THEN Google Ads rules for one client — waste pause, bid-fit, budget starvation, PMax brand exclusions. Use when asked to optimize, write rules, cut waste, or fix Smart Bidding. Does not apply live changes.
---

# Ads Optimize

Draft rules. Do not invent metrics. Do not email the client. Do not change
live bids, budgets, or conversion goals.

This is the optimizer pass, not another health-score audit. For the weekly
scorecard use `/ads-audit`. For query lists use `/ads-search-terms`. For
broken tags use `/ads-tracking` first — dead tracking stops this skill.

## Input

Client name from arguments. Window: last 30 days if an export exists, else
whatever the vault or a connected Ads read actually returns. If nothing
quantified exists, write **Insufficient evidence** and list the missing
export. Do not guess spend.

## 1. Gather evidence

Read, in this order:

1. `01_Clients/<Client>.md` and `01_Clients/<Client>/`
2. Latest `Daily-Briefs/` files that name the client
3. [[12_Brain/concepts/Google Ads Conversion Optimization 2026]]
4. [[11_Agents/Google Ads Agent]]
5. Connected surfaces that work this session (Composio Google Ads, pasted
   CSVs). If a surface fails, say so.

Pending-validation events are not conversions.

## 2. Fire the rule catalog

Only emit a rule when the IF side has evidence. Skip the rest.

Each rule is one row:

`IF <condition> THEN <action> | Tier | Hold if`

### Waste (Tier 1)

- **IF** enabled search term or keyword, lookback ≥ 7 days, cost above a
  stated threshold (default $20 if the export uses dollars; otherwise use
  the account currency and say so), conversions = 0, and the campaign is
  **not** brand / conquest
  **THEN** draft an exact negative (or pause the keyword)
  **Hold if** status is `Protected — brand` or `Review — competitor`
  (same guardrail as `/ads-search-terms`).

- **IF** Search Partners or out-of-geo is spending with 0 validated
  conversions
  **THEN** draft pause / Presence-only / Partners off

### Bid fit (Tier 2 — Dillon live)

- **IF** campaign is on tCPA / tROAS and has under ~30 conversions / 30
  days
  **THEN** draft Maximize Conversions (no target) until volume exists
- **IF** campaign is in learning (bid/budget/target edited in the last
  7–14 days)
  **THEN** do nothing. Write a hold row, not a change.
- **IF** delivery collapsed (near-zero spend) on a target that is tighter
  than recent actual CPA/ROAS
  **THEN** draft loosen the target ≤ 20% (rescue only)

Never change a target more than ~15–20% in one draft except the rescue
case. Google's stated tCPA floor is 15 conv/30d; this vault uses ~30.

### Budget (Tier 2 — Dillon live)

- **IF** Search lost IS (budget) > 20% **and** CPA is at or below the
  stated target **and** tracking is real
  **THEN** draft +budget ≤ 20%
- **IF** actual CPA / target > 1.5 **and** conversions are falling
  **THEN** draft −30% or pause
- **IF** actual CPA / target is 0.8–1.2
  **THEN** hold

Do not move more than ~20–30% of a campaign budget in one draft.

### PMax / structure (Tier 1 unless it is a new campaign)

- **IF** PMax is live **and** a branded Search campaign is also live
  **and** brand exclusions are missing
  **THEN** draft PMax brand exclusions
- **IF** RSA Ad Strength is Poor **and** headlines are pinned
  **THEN** draft unpin + replace Low assets (keep Best/Good)
- **IF** an audience layer is losing money
  **THEN** ask Targeting vs Observation before drafting a pull.
  Observation losing money is not the audience's fault.

### Do not encode

- Cross-industry CPC/CPA medians as this client's target
- “QS 5→7 cuts CPC by X%” as a dollar promise. Low QS on high-spend
  keywords is a flag (LP / relevance / CTR), not a formula

## 3. Write the brief

Write `Daily-Briefs/ads-optimize-YYYY-MM-DD-<slug>.md`:

- **Evidence window** — dates, sources used, sources that failed
- **Rules that fired** — table: IF / THEN / proof / Tier / hold-if
- **Rules that did not fire** — one line, missing evidence
- **Apply batch (Tier 1)** — negatives, pauses, brand exclusions, RSA
- **Hold (Tier 2)** — budget, bid, new campaigns, goal changes

Append the fired rules to `01_Clients/<Client>/Optimization Ledger.md`
as hypotheses with a review date (14 days for Tier 1, 14–21 for bid/budget).

## Hard rules

- Cloud sessions analyze and draft. A human applies.
- No CIDs, emails, phones, or credentials in `12_Brain/`.
- Do not install Optmyzr MCP, AdKit, or Adspirer. See
  [[12_Brain/entities/Optmyzr Skills]].
- Do not vendor `optmyzr-skills/*` into this folder.
