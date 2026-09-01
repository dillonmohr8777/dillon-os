---
note_type: decision
status: active
created: 2026-09-01
updated: 2026-09-01
owner: Dillon Mohr
decision: "Adopt the specialist forecast router for agenda, automations, and predictors. Keep TimesFM-3.0 weights research-only until a commercial license path exists."
verification_status: verified
review_on: 2026-10-01
source_refs:
  - "[[12_Brain/01_Captures/X/2026-08-31 - analogalok-timesfm3-agent-forecast-router]]"
  - "[[12_Brain/06_Research/2026-09-01 - TimesFM-3 multivariate forecast specialist]]"
  - "[[12_Brain/03_Concepts/Specialist Forecast Router]]"
  - "[[12_Brain/04_Decisions/2026-07-30 - Adopt gated intelligence stack]]"
  - "https://github.com/google-research/timesfm"
tags:
  - brain
  - decision
  - forecasting
  - predictors
  - automation
  - license
---

# Route numeric forecasts to a specialist

## Decision

1. **Do not make an LLM guess business trends.** Numeric futures go to a
   dedicated forecast specialist. The LLM interprets bands and proposes one
   gated next action.
2. **Keep the existing Marketing Chief action predictor.** Accept / modify /
   defer / reject learning stays in `prediction-outcomes.jsonl`. Series
   forecasts are a second evidence class, not a replacement ranker.
3. **TimesFM-3.0 weights are research-only.** They are non-commercial and
   non-production. Do not load client Ads, HubSpot, Gmail, or revenue series
   into that checkpoint.
4. **TimesFM 2.5 is the license-permissive local candidate** for univariate
   series plus XReg covariates. Production promotion still happens only after
   [[12_Brain/05_Projects/Experiments/EXP-TIMESFM-FORECAST-ROUTER|the experiment]]
   passes and Dillon approves the exact use.
5. **A forecast never authorizes send, spend, publish, or account changes.**
   It is evidence, like a QA report.

## Why

Analogalok's 2026-08-31 blueprint matches a real gap: agenda ranking, paid
media review, HubSpot pulses, and morning automations all have numeric
history, and the LLM currently interpolates those histories in prose. Google
shipped a 330M specialist that consumes targets plus known-future covariates
and returns a full horizon with quantile bands in one pass. The license on
the 3.0 weights forbids treating that checkpoint as a client production
dependency. The router can still be adopted immediately.

## Options considered

- Ignore the post. Rejected: the routing rule is cheap and prevents a class
  of invented forecasts.
- Install TimesFM-3.0 into automations this weekend. Rejected: license and
  no local load evidence.
- Replace `Get-NextActions.ps1` with TimesFM. Rejected: that script predicts
  discrete operator actions, not numeric series.

## Reversal

Stop using any TimesFM checkpoint, keep the concept as a routing rule, and
leave the categorical prediction ledger unchanged. Research captures stay as
history.
