---
type: metrics-spec
agent: site-health-watchdog
site: alignhcm.com
created: 2026-07-19
window: 2026-01-01 to today (fixed start, extends daily)
---

# Leading-Indicator KPIs

These three close the biggest gaps in what Align HCM measures. All are first-party HubSpot, no Google. The watchdog recomputes them every run (Step 1c of the playbook) and writes them to `site-analytics-dashboard/data.json` under `leadingIndicators`.

Why these three: the site already tracks lagging outcomes (won revenue, contacts, submissions) but none of the leading signals that predict them or explain a miss. Each of these maps to a real problem surfaced in July 2026.

## 1. Visit-to-lead conversion rate

**Definition:** site form submissions / page views, per month and YTD. Both numbers come from the same HubSpot content-analytics pull, so the ratio is internally consistent.

**Why it matters:** views alone can't tell you whether a traffic dip is a problem. Conversion rate is the efficiency number that does. A drop here is a content/CTA problem; a drop in views with steady conversion is just a traffic problem.

**Current values (as of 2026-07-19):**

| Month | Views | Submissions | Conversion |
|---|---|---|---|
| Jan | 3,123 | 28 | 0.90% |
| Feb | 2,231 | 58 | 2.60% |
| Mar | 1,597 | 38 | 2.38% |
| Apr | 2,192 | 59 | 2.69% |
| May | 2,229 | 43 | 1.93% |
| Jun | 1,779 | 40 | 2.25% |
| Jul (partial) | 1,161 | 16 | 1.38% |
| **YTD** | **14,274** | **282** | **1.98%** |

**Alert:** monthly conversion rate falls below 1.2% on a completed month (roughly the Jan floor), or drops more than 40% versus the trailing 3-month average.

**Compute each run:** from the MONTHLY content-analytics SUMMARY already pulled in Step 1. `rate = submissions / rawViews` per bucket.

## 2. Marketing-influenced open pipeline

**Definition:** total amount of OPEN deals (not closed-won, not closed-lost) whose HubSpot original source is Organic Search, Direct Traffic, or Organic Social, created in the window.

**Why it matters:** won revenue ($54K verified) is months behind. Open influenced pipeline is the early signal of what marketing is feeding the funnel right now. This is the number to watch grow.

**Current value (as of 2026-07-19): $140,000 across 2 deals**, both Organic Search:
- Kaiser Permanente - PRO Optimization, $125,000, Expressing Interest, target Sep 30
- RPM / Bedrock - SmartCare Services, $15,000, Proposal/Quote

**Alert:** influenced open pipeline drops to $0 (nothing in flight from marketing), or falls more than 50% month over month.

**Compute each run:**
```sql
SELECT hs_analytics_source, dealstage, COUNT(*), SUM(amount_in_home_currency)
FROM DEAL
WHERE createdate BETWEEN '2026-01-01' AND '<today>'
  AND dealstage NOT IN ('closedwon','closedlost','2405262033','2405262034')
  AND hs_analytics_source IN ('ORGANIC_SEARCH','DIRECT_TRAFFIC','SOCIAL_MEDIA')
GROUP BY hs_analytics_source, dealstage
```

## 3. Lead follow-up gap (speed-to-lead proxy)

**Definition:** of contacts who submitted a form in the window (`num_conversion_events > 0`), how many have zero logged sales outreach (`num_contacted_notes` is null or 0). Reported as a count and a percentage.

**Why it matters:** this is the metric that would have caught the lost super-qualified leads (INDOCHINO, Therapeutic Associates, Wisq) in real time. A converted contact nobody has touched is marketing spend sitting idle.

**Note on precision:** HubSpot exposes "number of times contacted" and "last contacted date" but not a clean first-contact timestamp, so true response-time-in-hours is a v2 that needs a sequence-enrollment or first-touch timestamp. This follow-up-gap count is the actionable v1 and is computable today.

**Current value (as of 2026-07-19): 70 of 177 form-submitting contacts (40%) have zero logged outreach.** The curated buyer-qualified subset is tighter: 9 of 22 qualified inbound buyers without follow-up (see the qualified-lead audit).

**Alert:** the no-outreach share of converted contacts exceeds 35%, or any buyer-qualified (Hot, score 90+) lead sits with zero outreach for more than 3 business days.

**Compute each run:**
```sql
SELECT num_contacted_notes, COUNT(*)
FROM CONTACT
WHERE createdate BETWEEN '2026-01-01' AND '<today>' AND num_conversion_events > 0
GROUP BY num_contacted_notes
```
No-outreach = the null bucket plus the `0` bucket, divided by the total.
