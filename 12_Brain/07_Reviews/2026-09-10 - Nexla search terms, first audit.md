---
note_type: review
status: active
created: 2026-09-10
updated: 2026-09-10
owner: Dillon Mohr
client: "[[01_Clients/Nexla/overview]]"
priority: critical
verification_status: verified
observed_at: 2026-09-10
next_action: Stop crediting brand search as non-brand demand; audit the remaining 31,924 terms
tags: [review, nexla, google-ads, search-terms, wasted-spend, brand-vs-nonbrand]
source_refs:
  - "Google Ads account 791-780-2207, Search terms report, read live in-browser 2026-09-10"
  - "[[12_Brain/07_Reviews/2026-09-09 - Omega search terms, first audit]]"
  - "[[01_Clients/Nexla/2026-09-03 - Paid media plan draft]]"
---

# Nexla search terms, first audit

**Summary:** The search-terms report had never been run on this account either.
Run 2026-09-10. **$12,977.06 spent for 3.00 conversions — $4,325.69 each. Two of
those three came from people typing the brand name.**

**32,024 search terms** in the report. This is page 1 of 321.

## Account totals

| Metric | Value |
|---|---|
| Clicks | 2,546 |
| Impressions | 129,800 |
| CTR | 1.96% |
| Avg CPC | $5.10 |
| **Cost** | **$12,977.06** |
| Conversions | **3.00** |
| **Cost per conversion** | **$4,325.69** |

## The finding: brand search is carrying the account

| Search term | Match | Clicks | Cost | Conv |
|---|---|---|---|---|
| **`nexla`** | exact, **Added** | 614 | $1,072.93 | **2.00** |
| `a i` | broad | 50 | $235.87 | 1.00 |
| everything else on page 1 | — | ~1,882 | ~$11,668 | **0.00** |

`nexla` is the company's own name. Those are people who already knew Nexla and
typed it into Google. It converts at 25.49% CTR and $1.75 a click because it is
the cheapest possible traffic — **existing demand, not created demand.**

Strip it out and the picture is: **roughly $11,900 of non-brand spend produced
one conversion**, from the broad-match term `a i`.

This is the same shape as Omega, in a different costume. At Omega a competitor's
brand name produced 35% of conversions. Here the client's *own* brand name
produces 67% of them. In both cases the dashboard shows conversions and the
conversions are not the thing the campaign claims to be buying.

## Expensive non-brand terms returning nothing

| Search term | Clicks | Avg CPC | Cost | Conv |
|---|---|---|---|---|
| `model context protocol` | 49 | **$15.98** | $783.24 | 0 |
| `mcp` (broad) | 78 | $4.22 | $328.84 | 0 |
| `n8n` (broad) | 52 | $5.08 | $264.06 | 0 |
| `agentic ai` | 20 | **$8.09** | $161.84 | 0 |
| `artificial intelligence` (broad) | 34 | $4.72 | $160.54 | 0 |
| `unified data platforms` | 72 | $2.11 | $152.21 | 0 |
| `python` (broad) | 28 | $4.89 | $136.99 | 0 |
| `ai` (broad) | 47 | $2.49 | $117.02 | 0 |

`model context protocol` at **$15.98 a click** is three times the account average
and has produced nothing.

**`n8n` is a competing workflow-automation product.** Same pattern as Omega's
`timberline landscaping` — paying for a rival's name. Unlike Omega, someone has
already excluded it.

## Credit where due: negatives are being applied here

`n8n`, `ai`, `artificial intelligence`, `python` and `ai for customer insights`
all show **Excluded**. Somebody has been working this account. That is the
opposite of Omega, where the six competitor and supplier terms all showed
`Added/Excluded: None`.

The remaining exposure is broad match on generic single tokens — `mcp`, `a i`,
`agentic ai` — which is how `python` and `ai` got in.

## What this does to the reporting

The account's three conversions must never be presented as campaign-generated
demand without splitting brand from non-brand. Two of three are brand. A monthly
report that says "3 conversions at $4,325" is technically true and materially
misleading in the same way Omega's was.

Note the Nexla monthly draft `r2013811896562371890` is sitting unsent from
2026-08-31. **Check what it claims about conversions before it goes anywhere.**

## Related

- [[12_Brain/07_Reviews/2026-09-09 - Omega search terms, first audit]]
- [[12_Brain/07_Reviews/2026-09-09 - The work went inward and never outward]]

## Full API pull — 2026-09-10, and it is a structure problem

First complete pull, via the Google Ads API rather than the UI. Window
2026-06-01 to 2026-09-09, terms with at least one click. Raw data at
`_os/automation/google-ads-api/pulls/nexla-search-terms-2026-06-01-to-2026-09-09.json`.

**419 terms · 1,203 clicks · $5,677.77 · 3.00 conversions**

| | Terms | Cost | Conversions | Cost/conv |
|---|---:|---:|---:|---:|
| Brand (contains "nexla") | 6 | $819.75 | **2.00** | $410 |
| **Non-brand** | 413 | **$4,858.02** | **1.00** | **$4,858** |

**400 zero-conversion terms carry $4,555.54 — 80% of account spend bought
nothing.**

### The bleed is match type, not keyword choice

Seven terms took **$319.13 at an average $40.66 per click**, most on a single
click each:

| Term | Clicks | Cost/click |
|---|---:|---:|
| `etl platforms` | 1 | **$48.11** |
| `data observability platform` | 1 | **$47.84** |
| `data management platforms` | 1 | **$45.80** |
| `data integration tools` | 1 | **$40.18** |
| `etl tools` | 2 | $34.53 |
| `hermes agent os` | 1 | $35.23 |
| `agent memory` | 1 | $32.91 |

And a **340-term long tail at one click each, $2,080.92.** That cannot be
negated away term by term — 340 negatives is not a fix, it is a symptom. Broad
match is reaching for generic head terms the account cannot afford to win.

`hermes agent os` is worth noting on its own: that is the name of Dillon's own
manager account (`Dillon Mohr Hermes Agent`). Somebody searched an internal
project name and Nexla paid $35.23 for the click.

### What this implies for structure, beyond negatives

1. **Twenty-five negatives remove 49% of the waste ($2,216.94).** Worth doing,
   but it treats half the problem.
2. **The other half is match type.** The one-click-at-$40 pattern says broad
   match on generic data-infrastructure vocabulary. Phrase or exact on the terms
   that actually convert, and let the head terms go.
3. **Brand is subsidising the report.** Two of three conversions came from
   people typing the company name. Brand and non-brand must be reported
   separately or the account looks four times healthier than it is.
4. **34 of 36 campaigns are paused**, and the paused set includes an `aws`
   Performance Max at **$600/day** and a `Demand Gen` at **$150/day**. Anything
   that unpauses those spends real money in hours.

### The honest sentence for the client

Non-brand search bought one conversion for $4,858 over roughly a hundred days,
while brand search bought two for $820. The account is not underperforming at
the margins; the non-brand thesis has not been proven at all yet.
