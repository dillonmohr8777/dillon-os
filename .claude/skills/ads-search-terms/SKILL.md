---
name: ads-search-terms
description: Mine search terms and PMax queries for waste, then draft themed negative lists. Use when asked to cut wasted spend, add negatives, or review search terms.
---

# Ads Search Terms

Find query waste. Draft negatives. Do not apply them until Dillon approves
the batch. Do not invent queries.

## Input

Client name from arguments. Window: last 30 days if a search-terms export
exists, else whatever the vault or a connected Ads read actually returns.

## 1. Collect queries

Sources, in order:

1. Any search-terms export or screenshot already in `01_Clients/<Client>/`
2. Latest weekly/monthly recap in `Daily-Briefs/` or `Daily-Briefs/reports/`
3. Composio Google Ads search-term / campaign query read, if it works this
   session
4. Operator-pasted terms in the current chat

If none of those exist, stop and ask for a 30-day search terms export. Do not
guess the query graph.

## 2. Guardrail, then theme

A zero-conversion term is not automatically waste. Classify every flagged
row **before** theming (Optmyzr waste-finder contract):

| Status | Meaning | Goes on the negative list? |
|---|---|---|
| **Waste** | Off-topic / jobs / DIY / geo-miss in a non-brand, non-conquest campaign | Yes |
| **Review — competitor** | Rival brand in a Competitors / Conquest campaign | Human only |
| **Protected — brand** | Own name or misspelling, or a Brand campaign | Never |

Default filter when the export has dollars: lookback ≥ 7 days, cost above a
stated threshold (Optmyzr default $20), conversions = 0. Use the operator's
numbers if they give different ones. Projected savings count **Waste only**.

Then group **Waste** into themes. Local-service defaults:

- **Jobs** — hiring, salary, indeed, career
- **DIY / free** — how to, diy, cheap, free, template
- **Wrong trade** — adjacent services this client does not sell
- **Competitors** — rival brand names (flag; do not add as negatives unless
  Dillon wants conquest off)
- **Geo miss** — cities or states outside the service area
- **Informational** — wiki, meaning, vs, examples

For each theme record: example queries, impressions, clicks, cost, conversions
(only validated conversions). Pending-validation events do not count.

PMax: campaign-level negatives are allowed in 2026. Brand exclusions belong
on PMax when a branded Search campaign is also live.

## 3. Draft the list

Write `Daily-Briefs/ads-search-terms-YYYY-MM-DD-<slug>.md`:

- **Coverage** — where the terms came from, how complete
- **Waste table** — term, theme, campaign, spend, status
  (`Waste` / `Review — competitor` / `Protected — brand`)
- **Draft negatives** — `Waste` only; exact per term, phrase per theme;
  campaign vs account; Tier 1. Paste-ready block = negatives only, no
  comments inside the fence.
- **Do not add** — `Protected — brand`, `Review — competitor` until Dillon
  says so, high-intent close variants, anything without spend
- **PMax / Search Partners** — separate yes/no calls

Append the same draft list to `01_Clients/<Client>/Optimization Ledger.md`
as a hypothesis: "adding these negatives cuts wasted clicks without cutting
booked jobs." Review date = 14 days.

## Hard rules

- Negatives are Tier 1: one approval, then apply as a batch.
- Never broad-match a huge kill list. Prefer exact/phrase on proven waste.
- No live apply in a cloud session unless Dillon already approved that list.
