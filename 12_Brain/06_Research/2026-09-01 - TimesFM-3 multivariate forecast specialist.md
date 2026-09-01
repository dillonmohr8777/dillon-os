---
note_type: research
status: verified
created: 2026-09-01
updated: 2026-09-01
owner: Dillon Mohr
question: What is the exact TimesFM-3 agent blueprint, and can it improve Dillon OS agenda, automations, and predictors without violating license or approval gates?
verification_status: verified
confidence: 0.93
expires: 2026-12-01
review_on: 2026-10-01
source_refs:
  - "[[12_Brain/01_Captures/X/2026-08-31 - analogalok-timesfm3-agent-forecast-router]]"
  - "https://research.google/blog/timesfm-3-a-zero-shot-foundation-model-for-multivariate-forecasting/"
  - "https://github.com/google-research/timesfm"
  - "https://huggingface.co/google/timesfm-3.0-pytorch"
  - "https://huggingface.co/google/timesfm-3.0-pytorch/blob/main/LICENSE"
tags:
  - brain
  - research
  - timesfm
  - forecasting
  - agents
  - predictors
---

# TimesFM-3 multivariate forecast specialist

TimesFM-3 is Google Research's 330M-parameter time-series foundation model.
The useful operating idea is not "give the LLM a crystal ball." It is: **route
numeric timelines to a specialist that already knows how to forecast, then let
the LLM interpret the bands.**

## Verified findings

| Claim | Operating value | Evidence |
|---|---|---|
| Native multivariate, zero-shot | Jointly forecast related series without per-client training | Google Research blog, 2026-08-31 |
| Three input classes | Targets, past-only covariates, past-future covariates | Google blog; GitHub README examples |
| Single forward pass | Full horizon via contiguous patch masking, no patch-by-patch loop | Google blog |
| Quantiles | Point forecast plus nine quantiles, 10th through 90th | Google blog; GitHub `predict_batch(..., return_quantiles=True)` |
| 330M parameters | Small enough to evaluate beside a local LLM, subject to hardware and license gates | Google blog; HF model card |
| 32-step context patches; 64-step forecast patches | Prevents the user blueprint's "32-step patches" shorthand from hiding the distinct output patch size | HF model card; official GitHub code |
| Ranked #1 vs Chronos-2 and Toto 2.0 on Gift-Eval, FEV-Bench, and TIME among pretrained foundation models | Useful as a research prior, not as a Dillon OS scoreboard | Google blog. Not independently reproduced here. |
| Inference code Apache-2.0; 3.0 weights non-commercial / non-production | Blocks client, spend, and production automation use of the 3.0 checkpoint | GitHub license notice; HF `timesfm-non-commercial-license-v1.0` |
| TimesFM 2.5 remains Apache-2.0 | License-permissive local univariate + XReg candidate until a commercial 3.0 route exists | GitHub README |
| BigQuery `AI.FORECAST` for 3.0 "coming weeks" | Possible future commercial path; not live as of this note | Google blog |

## Exact blueprint

```text
LLM (browse, code, write, decide language)
        |
        |  only when the question is a numeric future
        v
Forecast specialist
  inputs:
    targets              = past values of the series to predict
    past covariates      = history-only helpers (traffic, replies, impressions)
    past-future covars   = known future (promos, holidays, budgets, webinars)
  inference:
    context patch length 32; forecast patch length 64
    lookahead tokens for known-future covariates
    alternating causal temporal attention + full variate attention
    contiguous patch masking fills the whole horizon in one pass
  outputs:
    point forecast per target per step
    9 quantiles (p10-p90) per target per step
        |
        v
LLM interprets uncertainty into one next action
Human gate still owns send, spend, publish, and account changes
```

Official TimesFM 3.0 call shape from `google-research/timesfm` README:

```python
from timesfm3 import TimesFM3Evaluator, ModelConfig

config = ModelConfig(
    checkpoint_path="google/timesfm-3.0-pytorch",
    per_core_batch_size=16,
    device="cuda",
)
forecaster = TimesFM3Evaluator(config)

outputs = list(
    forecaster.predict_batch(
        contexts=[target],                    # (num_variates, context_len)
        horizon=horizon,
        past_only_covariates=[past_only_cov], # (n_past_cov, context_len)
        past_future_covariates=[past_future], # (n_dyn_cov, context_len + horizon)
        return_quantiles=True,
        use_symmetric_averaging=False,
    )
)
# outputs[0].forecast.shape   -> (num_variates, horizon)
# outputs[0].quantiles.shape  -> (num_variates, horizon, 9)
```

Install path recorded by Google: `pip install timesfm[torch]` or
`pip install git+https://github.com/google-research/timesfm.git`. First-party
agent skill at `timesfm-forecasting/SKILL.md` is still written for TimesFM 2.5.

## Architecture (Google)

- Decoder-only transformer, 20 layers, model dim 1280, 16 heads.
- Group 32 contiguous context steps into an input patch. The forecast output
  patch length is 64. Per-series normalization follows the TimesFM family.
- Target and past-covariate tokens come from one patch. Past-future covariate
  tokens concatenate the current patch with future patches (lookahead).
- Horizontal attention is causal inside a series. Vertical attention is full
  across series at the same time step.
- Horizon patches for unknown series are masked; known-future covariates stay
  visible. The stack fills every masked patch at once.
- The launch post and model card do not publish a general TimesFM-3 maximum
  context guarantee. Official benchmark code truncates examples to 15,360,
  so Dillon OS must treat context length as a tested runtime setting rather
  than carry the 2.5 "16k" claim forward.

## What this should change in Dillon OS

| Surface | Current behavior | Forecast-router role |
|---|---|---|
| Agenda / `Get-NextActions.ps1` | Heuristic rank plus accept/modify/defer/reject priors | Keep the discrete decision loop. Add numeric risk features only after a legal, source-backed forecast exists. |
| Automations | Deterministic workflows with evidence and gates | Automations may emit series and consume forecast artifacts. They may not treat a forecast as send, spend, or publish authority. |
| Predictors | `state/prediction-outcomes.jsonl` is categorical | Keep that ledger. Numeric forecasts are a second evidence class, stored as quantile bands with source locators. |
| Paid media review | Platform readback plus LLM interpretation | Joint series: spend, clicks, leads, with budget and promo covariates. |
| HubSpot / workshop pulses | Snapshots | Stage counts and booked-event series, never invented conversion claims. |
| Leading indicators | Rule-based churn and growth signals | Keep the validated rules. Use a specialist only to score numeric drought/overpace, not to replace silence-as-churn. |

## Contradictions and limits

- Analogalok's weekend-build framing collides with the 3.0 weight license.
  Dillon OS work is commercial. **TimesFM-3.0 checkpoints stay research-only
  on synthetic or public non-client series until Google ships a commercial
  route or Dillon obtains an explicit license.**
- TimesFM 2.5 is univariate plus XReg covariates. Its Apache-2.0 weights make
  it the current license-permissive local candidate, not an automatically
  approved production dependency. It is not the native multivariate 3.0 model.
- A forecast is model output. In the signal hierarchy it is weaker than CRM,
  ads, and analytics readbacks. It never authorizes spend.
- Client-facing copy still forbids "zero conversions" language. Quantile
  bands are not a conversion result.
- A 2026-09-01 local inventory found 63.8 GB RAM, Python 3.11, 446.9 GB free
  disk, and no NVIDIA GPU. Neither checkpoint was downloaded or loaded. CPU
  feasibility and latency remain unverified until the sandbox experiment.

## Operating conclusion

Adopt the **router**, not the 3.0 weights, as durable knowledge. See
[[12_Brain/04_Decisions/2026-09-01 - Route numeric forecasts to a specialist|the decision]]
and [[12_Brain/03_Concepts/Specialist Forecast Router|Specialist Forecast Router]].
