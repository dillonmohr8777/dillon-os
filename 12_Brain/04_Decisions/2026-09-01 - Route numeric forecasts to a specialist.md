---
note_type: decision
status: active
created: 2026-09-01
updated: 2026-09-01
owner: Dillon Mohr
decision: "Adopt a provider-neutral specialist forecast router. Benchmark Chronos-2 first; keep TimesFM-3.0 weights research-only until a commercial license path exists."
verification_status: verified
review_on: 2026-10-01
source_refs:
  - "[[12_Brain/01_Captures/X/2026-08-31 - analogalok-timesfm3-agent-forecast-router]]"
  - "[[12_Brain/06_Research/2026-09-01 - TimesFM-3 multivariate forecast specialist]]"
  - "[[12_Brain/03_Concepts/Specialist Forecast Router]]"
  - "[[12_Brain/04_Decisions/2026-07-30 - Adopt gated intelligence stack]]"
  - "https://github.com/google-research/timesfm"
  - "https://huggingface.co/amazon/chronos-2"
  - "https://github.com/DataDog/toto"
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
4. **Chronos-2 is the leading license-permissive canary** because it natively
   supports the complete target, past-covariate, known-future-covariate, and
   quantile contract. TimesFM 2.5 remains an independent-univariate/XReg
   baseline. Toto 2.0 remains a multivariate no-covariate challenger.
   Production promotion still happens only after
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

The 2026-09-01 open-source audit found one genuine MLX implementation and
several thin wrappers, notebooks, and services. Every TimesFM-3 implementation
still uses the same restricted checkpoint. Chronos-2 is therefore the first
commercially permissible model to evaluate, not an automatic production
selection.

## Options considered

- Ignore the post. Rejected: the routing rule is cheap and prevents a class
  of invented forecasts.
- Install TimesFM-3.0 into automations this weekend. Rejected: license and
  no local load evidence.
- Declare Chronos-2 the production default immediately. Rejected: no
  leakage-safe backtest, calibration, or measured local latency yet.
- Replace `Get-NextActions.ps1` with TimesFM. Rejected: that script predicts
  discrete operator actions, not numeric series.

## Reversal

Disable any model route that fails its experiment, retain the provider-neutral
routing rule, and leave the categorical prediction ledger unchanged. Research
captures stay as history.
