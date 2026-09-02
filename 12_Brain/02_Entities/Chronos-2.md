---
note_type: entity
status: active
created: 2026-09-01
updated: 2026-09-02
owner: Dillon Mohr
review_on: 2026-10-01
verification_status: verified
source_refs:
  - "[[12_Brain/06_Research/2026-09-01 - TimesFM-3 multivariate forecast specialist]]"
  - "[[12_Brain/04_Decisions/2026-09-02 - Separate deliverable prediction from workload forecasting]]"
  - "12_Brain/state/work-predictor/chronos-2026-09-02-total-v1/workload-forecast-receipt.json"
  - "https://huggingface.co/amazon/chronos-2"
  - "https://github.com/amazon-science/chronos-forecasting"
tags:
  - brain
  - entity
  - tool
  - forecasting
  - amazon-science
---

# Chronos-2

Amazon's 120M-parameter time-series foundation model is the closest
commercially usable functional match for Dillon OS's forecast-specialist
contract. Its code and weights are Apache-2.0. It natively supports
univariate and multivariate targets, past-only covariates, known-future
covariates, cross-learning, and configurable quantile forecasts.

## Dillon OS lane

`amazon/chronos-2` is the **leading sandbox canary**, not a production
default. The provider-neutral router permits public or synthetic research,
the one exact registered and fingerprint-bound Momentum aggregate pilot, and
the de-identified Dillon OS portfolio-workload experiment. Every route remains
evidence-only and records:

```yaml
provider_id: amazon-science
runtime_id: chronos-forecasting==2.3.1;torch==2.6.0+cpu
license_lane: apache-2.0
capabilities:
  multivariate_targets: true
  past_covariates: true
  past_future_covariates: true
  covariate_mode: native
```

Promotion requires leakage-safe walk-forward results against persistence and
seasonal-naive baselines, p10-p90 calibration, measured latency on the exact
runtime, independent review, and Dillon's human gate. Cross-learning must be
tested both on and off because related-series batching can improve or hurt a
particular dataset.

## Runtime status

Amazon documents CPU and GPU inference, an 8,192-step maximum context, and a
1,024-step maximum prediction length. On 2026-09-01, the first isolated `uv`
attempt was blocked when Windows Smart App Control rejected a pandas native
DLL. The working route now uses the trusted Codex Python 3.12 runtime and pins
`chronos-forecasting==2.3.1` with `torch==2.6.0+cpu`; Smart App Control remains
enabled. The official `amazon/chronos-2` checkpoint loaded on CPU and completed
a synthetic 32-step-context, four-step forecast with past and known-future
covariates plus p10-p90 bands. Model load took 24.4923 seconds and inference
took 0.2927 seconds. A second canary jointly forecast two targets with both
covariate classes and cross-learning enabled; its warm-cache inference took
0.2251 seconds. These runs verify the local runtime and output contract, not
forecast quality or production readiness.

On 2026-09-02, the first Dillon workload attempt correctly failed closed when
sparse per-package series produced crossed quantiles. Those categories are now
withheld until each has at least 24 nonzero days and 32 observed packages. A
second run forecast only the contiguous portfolio total. On a 14-day holdout,
Chronos posted 93.57% WAPE versus 100% persistence and 85.71% for the
trailing-seven-day mean, with 57.1% p10-p90 coverage. It failed both the
best-baseline and calibration gates, so the deterministic work planner remains
primary. This is a successful safety result, not a model-quality promotion.

See [[12_Brain/05_Projects/Experiments/EXP-TIMESFM-FORECAST-ROUTER|the forecast-router experiment]]
and [[12_Brain/03_Concepts/Specialist Forecast Router|Specialist Forecast Router]],
plus [[12_Brain/03_Concepts/Predictive Work Planner|Predictive Work Planner]]
for the operational split between deliverable identity and workload volume.
