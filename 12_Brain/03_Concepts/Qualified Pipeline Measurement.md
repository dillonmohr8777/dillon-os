---
note_type: concept
status: active
created: 2026-08-01
updated: 2026-08-01
domain: revenue measurement
maturity: operational
summary: Marketing optimization should move from raw platform events to reconciled qualified opportunities, appointments, estimates, booked work, contracts, and value.
review_on: 2026-09-01
verification_status: verified
source_refs:
  - "[[12_Brain/05_Projects/2026-07-30 - Qualified pipeline recovery]]"
  - "[[12_Brain/05_Projects/2026-07-30 - Dillon OS five-goal operating plan]]"
  - "[[12_Brain/03_Concepts/Keyword Research and Search Demand]]"
  - "[[11_Agents/Google Ads Agent]]"
tags:
  - brain
  - concept
  - qualified-pipeline
  - attribution
  - paid-media
  - revenue
---

# Qualified Pipeline Measurement

Marketing systems should optimize toward the closest trustworthy business
outcome, not the easiest platform event to count.

## Outcome ladder

Define every stage explicitly for the client or venture.

```text
impression
-> engaged visit
-> response event (call, form, chat, scan)
-> valid lead
-> service-fit or qualified opportunity
-> estimate, consultation, or appointment
-> booked work or contract
-> collected revenue and retained value
```

Earlier stages diagnose volume and friction. Later stages determine value.

## Definition contract

For every event or stage, record:

```yaml
name: "Qualified opportunity"
business_definition: ""
inclusions: []
exclusions: []
source_system: ""
owner: ""
timestamp_field: ""
dedupe_rule: ""
attribution_window: ""
value_rule: ""
freshness_or_latency: ""
verification_method: ""
```

Never use a platform label such as "conversion" as the business definition.

## Source-of-truth hierarchy

1. Collected revenue or signed work.
2. Verified CRM opportunity and outcome stages.
3. Appointment, estimate, or booking systems.
4. Lead records with individual disposition.
5. Call, form, chat, and platform event logs.
6. Click and impression data.

If systems disagree, show the disagreement and reconcile the record. Do not
choose the most flattering number.

## Reconciliation loop

At least twice weekly for active acquisition:

1. Export recent ad interactions and search terms.
2. Match calls, forms, chats, and lead forms to individual records.
3. Classify duplicates, spam, wrong-company, job seekers, vendors, research,
   out-of-area, and service-fit leads.
4. Record owner, follow-up status, appointment or estimate, and final outcome.
5. Check delivery failures, routing, phone tracking, form destinations, and CRM
   creation.
6. Feed only verified qualified and won outcomes back to the ad platform when
   permission, policy, identifiers, and data quality are correct.
7. Update search negatives, landing pages, targeting, scripts, and content from
   the observed language.

Aggregate feedback cannot establish the disposition of a specific lead.

## Optimization stages

### Stage 0: Measurement unknown

Use constrained targeting and bidding. Audit the conversion path. Do not scale
or optimize toward polluted events.

### Stage 1: Response events reliable

Calls and forms are delivered and deduplicated, but qualification is not yet
connected. Use events for diagnostics and continue manual reconciliation.

### Stage 2: Qualified outcomes connected

Import or otherwise connect the verified service-fit stage. Optimize cautiously
when volume and latency are sufficient.

### Stage 3: Value connected

Use booked work, contract, margin, or revenue values when the business can
maintain accuracy. Separate recurring, project, and lifetime value.

## Attribution boundaries

Document:

- source and campaign identifiers;
- first-touch, last-touch, and assisted views;
- attribution windows;
- call duration or disposition rules;
- offline import latency;
- consent and customer-data policy;
- cross-device and unknown-source limits; and
- CRM ownership and stage-change discipline.

Attribution is a model of influence, not a perfect reconstruction of causality.

## Scoreboard

By client, brand, channel, campaign, service, and period:

- spend;
- response events;
- valid leads;
- qualified opportunities;
- appointments or estimates;
- booked work or contracts;
- revenue or verified value;
- response-to-qualified rate;
- qualified-to-booked rate;
- cost per qualified opportunity;
- cost per booked outcome;
- value-to-spend ratio where defensible;
- unresolved dispositions and measurement latency; and
- tracking health.

Counts should use their natural type. Lead and conversion-event counts are
whole numbers unless the source genuinely represents a modeled fractional
metric.

## Decision rules

- Scale only when the qualified outcome and capacity support it.
- Pause or constrain when wrong-company or unqualified intent dominates.
- Fix tracking before changing bidding to a broken goal.
- Preserve brand and channel separation.
- Mark unavailable downstream results as pending validation rather than
  estimating or declaring zero.
- Treat high click or form volume with poor qualification as a targeting,
  message, offer, or operations problem.

## Failure modes

- Optimizing toward page views, directions, form starts, or raw calls as if
  they were sales.
- Fractional lead counts in client reporting without an explained modeled
  source.
- Importing outcomes without consent, permission, or dedupe.
- Scaling Performance Max or broad match before qualified signals are stable.
- Mixing clients, brands, geographies, or service lines.
- Leaving individual lead dispositions unknown while reporting aggregate
  success.
- Blaming campaigns for leads that were never routed or followed up.

