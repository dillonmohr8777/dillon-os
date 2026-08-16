---
name: meta-ads
description: Meta Lead Ads and Advantage+ audit for local lead-gen — Higher Intent forms, CAPI, creative fatigue, geo hold. Use when Meta CPL is junk, forms are cheap but unqualified, or Advantage+ is leaking out of market.
---

# Meta Ads

Audit Meta for one local lead-gen client. Do not invent spend or lead counts.
Do not email the client. Do not publish ads.

## Input

Client name from arguments.

## 1. Gather

1. `01_Clients/<Client>.md` and folder
2. [[12_Brain/concepts/Meta Lead Ads Optimization 2026]]
3. Latest weekly recap / dashboard numbers that name Meta
4. Any Events Manager notes already in the vault

## 2. Quality levers

- **Form** — if quality complaints exist, the Higher Intent form (review step
  + qualifying questions) is the first lever, not a bigger budget.
- **Optimization** — Maximize Leads until the account clears ~200 leads /
  month and a CRM stage converts 1–40% inside 28 days. Then Conversion Leads.
- **Advantage+** — location and min age are the hard constraints. Verify geo
  actually held. Audience inputs are suggestions.
- **CAPI** — pixel-only is a fail. `Lead` must fire browser + server with a
  shared `event_id`.
- **Creative** — 10–20 assets, four angles (problem / solution / proof /
  compare), 9:16 + 1:1. Static still carries most local conversions. Refresh
  when frequency is high and CTR is falling.
- **Learning** — lead-gen still wants ~50 conversions / week / ad set.
  Consolidate. Do not fragment $20/day ad sets.
- **Rejections** — IP/copyright, undisclosed AI, before/after, personal
  attributes ("are you a homeowner struggling…").

## 3. Write the brief

Write `Daily-Briefs/meta-ads-YYYY-MM-DD-<slug>.md`:

- **Evidence** — dates, sources, gaps
- **Lead quality** — form type, qualifying questions, CRM reconcile if any
- **Tracking** — pixel, CAPI, EMQ, which event bidding uses
- **Geo / Advantage+** — held or leaking
- **Creative** — fatigue, missing ratios, rejection risk
- **Tier 1 drafts** — form questions, exclusions, pause fatigued ads
- **Tier 2 holds** — budget up, new campaigns, Conversion Leads switch

Append draft hypotheses to `01_Clients/<Client>/Optimization Ledger.md`.

## Hard rules

- Local single-location accounts almost never clear Conversion Leads gates.
  Do not recommend that switch without the volume proof.
- No new Meta MCP. No live spend changes in a cloud session.
