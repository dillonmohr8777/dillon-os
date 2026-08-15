---
name: ads-audit
description: Weekly Google + Meta ads audit for one client — evidence-only health check, bid-strategy fit, waste, and a draft ledger. Use when asked to audit ads, check account health, or optimize Onsite, Omega, KJB, or any paid account.
---

# Ads Audit

Audit one client account. Work from this vault first. Do not invent metrics.
Do not email the client. Do not change live bids, budgets, or conversion goals.

## Input

Parse the client name from the arguments. If missing, ask. Default window:
last 7 days, plus the last full month if a monthly recap exists.

## 1. Gather evidence

Read, in this order:

1. `01_Clients/<Client>.md` and `01_Clients/<Client>/`
2. Latest files in `Daily-Briefs/` that name the client
3. [[12_Brain/concepts/Google Ads Conversion Optimization 2026]]
4. [[12_Brain/concepts/Conversion Tracking Setup 2026]]
5. [[12_Brain/concepts/Meta Lead Ads Optimization 2026]]
6. [[11_Agents/Google Ads Agent]]

Then pull live numbers only from connected surfaces that actually return data
this session (Gmail reports, Slack, Netlify dashboards, Composio Google Ads).
If a surface fails or is quota-blocked, say so. Pending-validation events are
not conversions.

## 2. Score the account

Flag each item Critical / High / Medium / Working:

- **Tracking** — primary vs secondary, enhanced conversions, GA4 double-count,
  pixel + CAPI. Broken tracking stops the rest of the audit.
- **Bid fit** — under ~30 conversions / 30 days per campaign → Maximize
  Conversions, not tCPA. Learning-phase edits reset the clock.
- **Waste** — Search Partners, out-of-geo, job/DIY/competitor queries, PMax
  eating branded Search.
- **Structure** — too many campaigns splitting a thin budget; PMax vs Search
  overlap; asset groups empty.
- **Creative / LP** — ad promise vs landing page; disapproved assets; policy
  blocks (government documents, alcohol, personal attributes).
- **Meta** — Higher Intent form, Advantage+ geo actually held, Event Match
  Quality, form vs website leads.

Never invent a 0–100 health score without the evidence rows behind it. If the
data is thin, grade **Insufficient evidence** and list what is missing.

## 3. Write the brief

Write `Daily-Briefs/ads-audit-YYYY-MM-DD-<slug>.md`:

- **Evidence window** — dates, sources used, sources that failed
- **What is wrong** — ranked, one line each, with the proof
- **Quick wins (Tier 1)** — negatives, pause waste, fix links/CTAs; reversible
- **Hold (Tier 2)** — budget, bid, new campaigns, goal changes; Dillon only
- **Draft ledger rows** — hypothesis → expected outcome → review date

If `01_Clients/<Client>/Optimization Ledger.md` exists, append the draft rows
under a dated heading. If it does not exist, create it with those rows only.

## Hard rules

- Cloud sessions analyze and draft. Live account edits stay on the approval
  board unless Dillon already approved that exact batch.
- No CIDs, emails, phones, or credentials in `12_Brain/`.
- Do not install Adspirer, AdKit, or any new ads MCP. Existing Composio Google
  Ads is the only live Ads API this stack may call.
