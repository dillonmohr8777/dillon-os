---
note_type: entity
status: active
created: 2026-09-01
updated: 2026-09-01
owner: Dillon Mohr
review_on: 2026-10-01
verification_status: verified
source_refs:
  - "[[12_Brain/01_Captures/X/2026-08-31 - analogalok-timesfm3-agent-forecast-router]]"
  - "[[12_Brain/06_Research/2026-09-01 - TimesFM-3 multivariate forecast specialist]]"
  - "https://github.com/google-research/timesfm"
  - "https://huggingface.co/google/timesfm-3.0-pytorch"
tags:
  - brain
  - entity
  - tool
  - forecasting
  - google-research
---

# TimesFM

Google Research's time-series foundation model family. Dillon OS uses it as a
**forecast specialist candidate**, not as an orchestrator and not as a client
reporting voice.

## Current checkpoints

| Version | Params | Native job | Weight license | Dillon OS lane |
|---|---|---|---|---|
| 2.5 | 200M | Univariate, up to 16k context, XReg covariates | Apache-2.0 | Allowed for local, non-external evaluation and later production-legal univariate forecasts |
| 3.0 | 330M | Multivariate + native past and past-future covariates, one-pass horizon | `timesfm-non-commercial-license-v1.0` | Research only. No client series. No production automations. |
| BigQuery `AI.FORECAST` | managed | Univariate today; 3.0 "coming weeks" as of 2026-08-31 | Google Cloud commercial | Blocked until the 3.0 integration is live and a scoped project is approved |

Code lives at `google-research/timesfm`. PyTorch 3.0 weights live at
`google/timesfm-3.0-pytorch`. First-party agent skill:
`timesfm-forecasting/SKILL.md` (still 2.5-centric).

## Status: not installed here

No checkpoint load, GPU probe, or client-series forecast was run for this
entity page. Installation remains behind
[[12_Brain/05_Projects/Experiments/EXP-TIMESFM-FORECAST-ROUTER|EXP-TIMESFM-FORECAST-ROUTER]].

## How agents must use it

- Marketing Chief remains the only user-facing orchestrator and the only
  canonical queue writer.
- TimesFM never sends, posts, publishes, spends, or mutates ads or CRM.
- Output is quantile bands plus source locators. It is not a conversion
  result and not an agenda command.
- See [[12_Brain/03_Concepts/Specialist Forecast Router|Specialist Forecast Router]]
  and [[12_Brain/protocols/Forecast Specialist Protocol|Forecast Specialist Protocol]].
