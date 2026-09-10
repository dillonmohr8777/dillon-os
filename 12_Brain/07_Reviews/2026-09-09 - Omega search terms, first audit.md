---
note_type: review
status: active
created: 2026-09-09
updated: 2026-09-09
owner: Dillon Mohr
client: "[[01_Clients/Omega Landscaping/overview]]"
priority: critical
verification_status: verified
observed_at: 2026-09-09
next_action: Add competitor and supplier brand negatives, then re-examine the 17 conversions
tags: [review, omega, google-ads, search-terms, wasted-spend, lead-quality, match-back]
source_refs:
  - "Google Ads account 285-398-1364, Search terms report, read live in-browser 2026-09-09, range 2026-04-01 to 2026-09-08"
  - "Google Ads account 285-398-1364, Search keywords report, same session and range"
  - "[[12_Brain/03_Concepts/2026-09-07 - Conversion match-back is the differentiator]]"
---

# Omega search terms, first audit

**Summary:** The search-terms report had never been run on this account. It was
run on 2026-09-09 and it answers David's complaint directly: **the single
biggest search term driving Omega's ads is a competitor's brand name, and it
produced 35% of all recorded conversions.**

Range 2026-04-01 to 2026-09-08. 2,112 search terms; this is page 1 of 22.

## Account totals for the range

| Metric | Value |
|---|---|
| Clicks | 278 |
| Impressions | 7,092 |
| CTR | 3.92% |
| Avg CPC | $11.73 |
| **Cost** | **$3,261.67** |
| Conversions | 17.00 |
| **Cost per conversion** | **$191.86** |

## The finding: Performance Max was buying other companies' names

The top search term by clicks is **`timberline landscaping`** — a competing
Colorado Springs landscaping company. 20 clicks, $161.22, and **6.00
conversions**, which is **35% of every conversion in the range**, at $26.87
each. It looks like the best-performing term in the account.

It is not. It is people looking for a different company.

Every competitor and supplier term below ran through
`Omega Landscaping & Concrete | Colorado Springs | PMax`, and every one shows
`Added/Excluded: None` — **no negative has ever been applied to any of them.**

| Search term | What it is | Clicks | Cost | Conv |
|---|---|---|---|---|
| `timberline landscaping` | competitor | 20 | $161.22 | **6.00** |
| `rocky top resources` | material supplier | 7 | $34.81 | 0 |
| `landscape endeavors` | competitor | 6 | $74.88 | 1.00 |
| `pioneer sand and gravel` | material supplier | 5 | $23.61 | 0 |
| `green belt turf farm` | turf supplier | 3 | $43.36 | 0 |
| `all purpose landscaping pueblo west` | competitor | 2 | $9.85 | 0 |
| `omega landscaping` | own brand | 7 | $17.46 | 0 |
| `omega designs landscaping` | own brand | 3 | $12.73 | 1.00 |

**This is the mechanism behind the lead-quality complaint.** The vault already
records David saying most of the calls reaching him "are still from people who
believe Omega is another company or a material supplier." That was treated as a
messaging problem. It is not. It is a targeting problem with a receipt: the ads
were literally served to people searching for Timberline, Rocky Top, Pioneer
Sand and Gravel, and Green Belt Turf Farm.

Seven of the eight of the 17 conversions with a named source are attributable
to somebody looking for a different business.

## The second finding: concrete clicks cost $40 to $54 each and converted zero

| Search term | Clicks | Avg CPC | Cost | Conv |
|---|---|---|---|---|
| `concrete colorado springs` | 11 | **$53.62** | $589.86 | 0 |
| `concrete contractors colorado springs` | 10 | **$40.58** | $405.76 | 0 |
| `concrete companies colorado springs` | 3 | **$39.38** | $118.13 | 0 |

**$1,113.75 across three terms, at four to five times the account's $11.73
average CPC, for zero conversions.** All three ran through
`Search_Services_Standard`, whose matching keywords are flagged
`Rarely shown (low Quality Score)`. Low Quality Score is exactly what makes
Google charge more per click — the account was paying a quality penalty on its
most expensive terms.

## Supporting evidence from the keywords report, same session

- `[concrete contractor colorado springs]`, exact match, `Not eligible —
  Rarely shown (low Quality Score), Campaign is paused`: 826 impressions, 51
  clicks, **$2,356.11 spent**, 1.00 conversion. **Avg CPC $46.20. Cost per
  conversion $2,356.11.**
- `"landscape design build"`, phrase: 1,993 impressions, 84 clicks, $619.79,
  3.00 conversions at $206.60 each — the highest-volume keyword in the account.
- Every other keyword on page 1 of 235: **0.00 conversions.**

## What to do, in order

1. **Add the competitor and supplier brand negatives.** `timberline
   landscaping`, `rocky top resources`, `pioneer sand and gravel`, `green belt
   turf farm`, `landscape endeavors`, `all purpose landscaping pueblo west`.
   This is a campaign change and stays approval-gated —
   `launch-authority.json` is `status: draft`, `approvedBy: null`.
2. **Re-examine the 17 conversions before reporting any of them.** Six came
   from a competitor search. They should not be presented to David as demand
   for Omega.
3. **Work the remaining 21 pages.** 2,112 terms; this is the first 100.
4. **Do not re-enable `Search_Services_Standard` on its current Quality
   Scores.** Its terms cost four to five times the account average and returned
   nothing.

## What this changes about the match-back promise

The nine promises were about connecting conversions to named leads. This audit
says something harder: **some of those conversions should never have been
counted as Omega demand in the first place.** Fixing the Zap would have
faithfully delivered the names of people who were looking for Timberline.

Negatives come first. Then match-back means something.

## Related

- [[12_Brain/03_Concepts/2026-09-07 - Conversion match-back is the differentiator]]
- [[System/approval-queue]]
