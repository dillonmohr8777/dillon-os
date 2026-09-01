---
note_type: entity
status: active
created: 2026-09-01
updated: 2026-09-01
owner: Dillon Mohr
review_on: 2026-10-01
verification_status: verified
source_refs:
  - "[[12_Brain/06_Research/2026-09-01 - TimesFM-3 multivariate forecast specialist]]"
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
default. The provider-neutral router currently permits only public or
synthetic research use and records:

```yaml
provider_id: amazon-science
runtime_id: chronos-forecasting>=2.0
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
1,024-step maximum prediction length. On 2026-09-01, a bounded local CPU smoke
attempt resolved the Python dependencies in an isolated `uv` cache, but
Windows Application Control blocked a pandas native DLL during import. No
checkpoint loaded and no forecast ran. Local performance is therefore
**unverified**, not failed.

See [[12_Brain/05_Projects/Experiments/EXP-TIMESFM-FORECAST-ROUTER|the forecast-router experiment]]
and [[12_Brain/03_Concepts/Specialist Forecast Router|Specialist Forecast Router]].
