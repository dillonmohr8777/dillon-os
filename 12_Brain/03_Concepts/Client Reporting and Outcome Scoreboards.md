---
note_type: concept
status: active
created: 2026-08-01
updated: 2026-08-01
domain: reporting
maturity: operational
summary: A client report is a decision instrument that preserves definitions, sources, freshness, brand boundaries, qualified outcomes, uncertainty, and next actions.
review_on: 2026-09-01
verification_status: verified
source_refs:
  - "[[12_Brain/03_Concepts/Qualified Pipeline Measurement]]"
  - "[[11_Agents/Reporting Agent]]"
  - "[[_os/reporting/am-dashboard-build-prompt]]"
  - "[[10_Sessions/2026-07-29 Reporting Dashboard Training]]"
  - "[[12_Brain/05_Projects/2026-07-30 - Dillon OS five-goal operating plan]]"
tags:
  - brain
  - concept
  - reporting
  - scorecards
  - client-communication
---

# Client Reporting and Outcome Scoreboards

A report is complete when it helps someone understand what happened, why it
matters, what remains uncertain, and what decision or action follows.

## Data contract before design

Every metric needs:

```yaml
metric: "Qualified opportunities"
definition: ""
source: ""
client: ""
brand: ""
channel: ""
account_or_property: ""
period_start: ""
period_end: ""
timezone: ""
attribution_window: ""
freshness: ""
latency: ""
validation_status: ""
```

Do not build a polished visual around undefined or mixed-source numbers.

## Reporting layers

### 1. Executive outcome

Lead with the result the stakeholder values: qualified opportunities,
appointments, booked work, revenue, launch completion, organic growth, or an
important verified risk.

### 2. Delivery and demand

Show spend, reach, impressions, clicks, query themes, engagement, content
delivery, rankings, citations, calls, forms, or other diagnostic activity.

### 3. Pipeline quality

Show valid, qualified, appointment, estimate, booked, and won stages with
unresolved dispositions and latency.

### 4. Diagnosis

Explain material drivers: search intent, creative, geography, landing-page
friction, routing, tracking, seasonality, inventory, follow-up, or platform
change. Separate observed evidence from inference.

### 5. Decisions and next actions

Name the action, owner, expected result, review date, and approval needed.

## Portfolio and client boundaries

- One client and one exact account route at a time.
- Keep Replenish and Fresh Blends separate.
- Keep Google Ads, Meta, organic search, AI citations, and CRM outcomes
  distinct until a defensible cross-channel view is possible.
- Keep Align HCM full-time work outside client revenue.
- Exclude inactive or paused accounts from active-delivery claims.
- State period and timezone on every report.

## Writing rules

- Use plain language and exact definitions.
- Report confirmed facts before interpretation.
- Name data latency, access gaps, and tracking risk.
- Avoid unsupported causal claims.
- If the conversion definition, attribution, tracking, or CRM outcome is not
  defensible, write **Conversion reporting is pending validation** and focus on
  verified delivery, traffic, lead quality, and next actions.
- Do not use "zero conversions," "no conversions," "not enough conversions,"
  or "insufficient conversions" before the full definition and outcome chain
  are verified.
- Use whole integers for lead and conversion-event counts unless the metric is
  explicitly modeled and fractional.

## Report QA

### Source QA

- Exact client, brand, account, property, and date range.
- No sample figures or stale exports.
- Metric definitions and attribution windows recorded.
- Totals reconcile to source exports within explained limits.
- Inaccessible fields remain pending.

### Analytical QA

- Brand and channel separation preserved.
- Platform events are not called qualified outcomes.
- Search terms, queries, and pipeline stages are interpreted correctly.
- Material uncertainty and alternative explanations are visible.

### Presentation QA

- Mobile-readable hierarchy.
- Honest chart axes and labels.
- Whole-number event counts.
- No broken assets, overflow, or illegible contrast.
- Executive summary matches the detailed data.
- Links and downloads work.

### Delivery QA

- Correct recipients or channel.
- Exact approved artifact.
- No quoted history, raw PII, secrets, or mixed-client data.
- Draft or preview remains unsent until the required approval.

## Outcome scoreboard design

Use a small set of stable measures:

- one north-star outcome;
- three to five leading indicators;
- one quality or integrity measure;
- one capacity or risk measure;
- comparison period; and
- target or decision threshold.

Examples:

- Paid media: qualified opportunities, cost per qualified opportunity,
  qualified-to-booked rate, unresolved dispositions, tracking health.
- SEO/AEO: qualified organic sessions, priority-cluster coverage, citations,
  owned-audience conversion, pipeline impact.
- Website factory: sites passing first build, time per site, quality-gate pass,
  QR scans, calls booked, closes.
- Operating system: safe outcomes completed, human gates surfaced, verifier
  rejection rate, queue age, knowledge coverage.

Use [[_templates/Outcome Scoreboard|Outcome Scoreboard]].

## Failure modes

- A dashboard with many metrics and no decision.
- Reusing one client's data or narrative for another.
- Comparing periods with different lengths or attribution windows.
- Hiding unknowns to make the report look complete.
- Treating a platform recommendation as strategy.
- Sending a report before verifying links, recipients, and facts.
- Automating narrative generation before the data contract is stable.

