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
series remain sparse. The first run failed its baseline and calibration gates,
so `plan-today` may display the band but cannot use it for ranking.

Future challengers should compare against persistence, trailing and seasonal
means, and a count-data method suited to intermittent demand. Promotion is
dataset-specific; success on HubSpot contacts would not promote the workload
series, and success on total workload would not promote per-type forecasts.

## Morning behavior

`client-pulse` refreshes the artifact, shows likely packages and required prep,
and keeps gate-bound rows out of the priority stack. `metrics-pull` refreshes
the daily series but does not run the model. `plan-today` may schedule one local
predicted-preparation step inside seven days, after hard commitments, while
labeling it clearly and preserving the five-task WIP limit.

## Failure modes

- Treating a repeated folder date as a confirmed client deadline.
- Using Chronos to classify a deliverable or invent its asset manifest.
- Letting stale blocked queue items crowd out current work.
- Forecasting sparse categories and repairing crossed quantiles cosmetically.
- Turning a p50 count into a staffing, revenue, delivery, or conversion claim.
- Allowing a prediction to send, publish, spend, change an account, or become a
  second canonical queue.
