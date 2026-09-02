---
note_type: concept
status: active
created: 2026-09-02
updated: 2026-09-02
domain: operations
maturity: implemented-shadow
summary: Predict the likely work package, its required artifacts, and numeric workload separately. Use an evidence router for deliverables and a gated forecast evaluator for volume.
review_on: 2026-09-16
verification_status: verified
source_refs:
  - "[[12_Brain/04_Decisions/2026-09-02 - Separate deliverable prediction from workload forecasting]]"
  - "[[12_Brain/03_Concepts/Specialist Forecast Router]]"
  - "Daily-Briefs/predicted-work-2026-09-02.md"
  - "_os/automation/config/work-package-profiles.json"
  - "12_Brain/schemas/predicted-work.json"
  - "_os/automation/lib/workload-evaluator.js"
  - "12_Brain/state/work-predictor/chronos-2026-09-02-rolling-v2/workload-forecast-receipt.json"
tags:
  - brain
  - concept
  - workflow
  - planning
  - prediction
  - forecasting
---

# Predictive Work Planner

The planner anticipates what Dillon is likely to need next without pretending
that a pattern is a request. It uses a router plus evaluator pattern.

```text
canonical queue + dated deliverables + verified recurrences
                        |
                        v
             work-package evidence router
                        |
              +---------+---------+
              |                   |
              v                   v
   deliverable contract      contiguous daily counts
   and safe prep steps               |
              |                      v
              |             Chronos shadow challenger
              |                      |
              +----------+-----------+
                         v
                baseline/calibration gate
                         |
                         v
        client-pulse and plan-today, with authority intact
```

## Evidence tiers

1. **Owner-verified recurrence** — an explicit recurring workflow with a named
   client, cadence, source, and package contract.
2. **Canonical queue** — a current work item whose state still governs whether
   execution is ready, approval-bound, blocked, or deferred.
3. **Historical cadence** — repeated dated packages with a stable weekly,
   biweekly, or monthly interval. This is a preparation watch, not a deadline.

Every candidate exposes its source references, confidence, window, required
artifacts, safe preparation steps, human gates, and a bounded handoff contract.
Every candidate also carries `claim_type: prediction`. Only a canonical queue
row is a `confirmed_request`, and only its recorded `dueAt` makes
`confirmed_deadline` true; the brief prints this as a Kind column so a pattern
can never read as a request or a deadline.

## Source provenance and degraded mode

The predictor reads whichever `client-operations` checkout it is pointed at
and records that checkout's branch, head, dirty-file count, and distance from
`origin/main` in `sources.client_operations_checkout`. A dirty or non-main
checkout is still evidence, but the brief says so in its first paragraph. When
the checkout or the canonical queue is unavailable, the artifact's top-level
`status` becomes `degraded`, the brief carries a banner, and
`plan_inputs.predicted_preparation` is empty by construction.

## Calibration

Confidence for the two pattern tiers is calibrated by hindcast: the
deterministic predictors are re-run from 7, 14, 21, and 28 days before the
as-of date with a 14-day lookahead, and each closed window is judged against
the dated packages that actually landed within ±2 days. Per-tier hit rates
become a multiplier of `0.6 + 0.4 × hit rate`, floored at 0.75 for
owner-verified recurrences and 0.60 for historical cadence, and applied only
once a tier has three judged predictions. Each calibrated candidate keeps its
raw confidence, the sample, the hit rate, and the multiplier, so the number on
the page is traceable to the misses that produced it.

## Preparation contracts

Six profiles carry a structured `preparation_contract` beside their prose
manifest: exact inputs, templates, asset/data/repository readiness, output
formats, QA, and gates. BOK names the weekly packet PDF, the three draft
records, the current packet generators, and the western-Pennsylvania and
three-image checks. Websites name the design system, the site-factory brief
and builder, and the page-weight budget. Branded reports name the report data
shape and renderer and the whole-integer rule. Prototypes, data-source
integrations, and repository or environment setup name their reference
contracts and verification receipts. The contract travels inside the handoff.

## Package router

The version-one catalog covers:

- website, landing-page, and frontend builds;
- branded client reports and performance presentations;
- BOK's weekly three-topic designed content kit;
- prototypes and wireframes;
- data-source, tracking, webhook, and API integrations;
- repository, environment, connector, and deployment configuration;
- SEO, AEO, GEO, blog, and authority-content packages;
- image, social, animation, audio, and video packages;
- workflow, automation, agent, and operating-system builds;
- prospect, franchise, outreach, and sales campaigns;
- paid-media and lead-performance packages;
- client communication, meeting, approval, and final handoffs; and
- research, audit, scorecard, and decision briefs.

The catalog is an explicit operating contract, not a model-generated label
list. New types require a profile, signals, artifact manifest, safe preparation
steps, gates, and tests.

## Numeric shadow

Chronos receives only the contiguous daily portfolio total while category
series remain sparse. The first single-holdout run failed its baseline and
calibration gates, so `plan-today` may display the band but cannot use it for
ranking.

The evaluator now runs repeated rolling-origin holdouts (four origins, seven
days each by default) and scores every origin against persistence, trailing
seven- and 28-day means, zero, seasonal-naive-7, day-of-week mean, and
Croston-SBA for intermittent counts, reporting MAE, WAPE, MASE, p10-p90
coverage, and the coverage of a free same-weekday empirical band. Invalid or
crossed-quantile output is kept as a rejected origin rather than repaired.
`repeated_holdouts` passes only when every origin is valid, Chronos beats the
best baseline on two-thirds of at least three origins, and mean coverage sits
between 70 and 90 percent. Software never sets `planner_consumption`; a human
promotion is recorded separately. Promotion is dataset-specific; success on
HubSpot contacts would not promote the workload series, and success on total
workload would not promote per-type forecasts.

## Morning behavior

`client-pulse` refreshes the artifact, shows likely packages with their Kind,
required prep, and provenance line, and takes its gate list from
`plan_inputs.gated`. `metrics-pull` refreshes the daily series and reports
calibration but does not run the model. `plan-today` consumes `plan_inputs`
mechanically: hard commitments first, then at most two 45-minute
predicted-preparation blocks for candidates at confidence 0.60 or higher whose
window starts within seven days, gated rows under Deliberately not doing, and
nothing predicted at all when `status` is `degraded`. Predicted preparation is
the first thing cut when the five-task limit binds.

## Failure modes

- Treating a repeated folder date as a confirmed client deadline.
- Using Chronos to classify a deliverable or invent its asset manifest.
- Letting stale blocked queue items crowd out current work.
- Forecasting sparse categories and repairing crossed quantiles cosmetically.
- Turning a p50 count into a staffing, revenue, delivery, or conversion claim.
- Allowing a prediction to send, publish, spend, change an account, or become a
  second canonical queue.
