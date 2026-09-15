---
note_type: experiment
status: active
created: 2026-09-01
updated: 2026-09-02
owner: Dillon Mohr
experiment_id: EXP-TIMESFM-FORECAST-ROUTER
decision: retain-shadow
verification_status: partial
human_gate: required
pilot_human_gate: satisfied-for-exact-momentum-aggregate
risk: medium
source_refs:
  - "[[12_Brain/04_Decisions/2026-09-01 - Route numeric forecasts to a specialist]]"
  - "[[12_Brain/06_Research/2026-09-01 - TimesFM-3 multivariate forecast specialist]]"
  - "[[12_Brain/02_Entities/TimesFM]]"
  - "https://github.com/google-research/timesfm"
  - "https://huggingface.co/amazon/chronos-2"
  - "https://github.com/amazon-science/chronos-forecasting"
  - "https://github.com/DataDog/toto"
  - "client-operations://clients/momentum-360/deliverables/2026-09-01-hubspot-chronos-forecast-pilot/momentum-360-hubspot-chronos-forecast-pilot-report.md"
  - "[[12_Brain/04_Decisions/2026-09-02 - Separate deliverable prediction from workload forecasting]]"
  - "12_Brain/state/work-predictor/chronos-2026-09-02-total-v1/workload-forecast-receipt.json"
tags:
  - brain
  - experiment
  - forecasting
  - timesfm
  - predictors
---

# Forecast-router sandbox

Evaluate a local forecast specialist beside the LLM stack. Nothing is
installed into production automations, the canonical queue, or client
reporting from this experiment.

## Hypothesis

A dedicated zero-shot forecaster, given source-backed series and known-future
covariates, will produce more honest numeric ranges than an LLM guessing from
prose, and those ranges can later become agenda features without bypassing
approval gates.

## First canary: automation reliability and capacity

This is the first useful, client-safe series once enough regular history
exists:

- targets: completed, degraded, failed, blocked, and total elapsed time by day;
- past covariates: source freshness, stage failures, connector state, and
  routine mix;
- past-future covariates: scheduled routine count, known maintenance windows,
  and planned workload;
- output: next-day and next-week point plus p10-p90 bands, interpreted only as
  a warning or review prompt.

The tracked experiment branch currently contains 8 Claude-loop JSONL files.
The active working checkout has 21 daily files through 2026-09-01, but those
include untracked runtime evidence and remain sparse or irregular. Both are
below the Dillon OS minimum of 32 contiguous observations, so the real-data
canary must abstain today. `System/routine-health.md` and
`System/operating-status.md` are also stale and are not valid forecast inputs.

## Baseline

- Agenda: `Get-NextActions.ps1` heuristics plus categorical learning.
- Automations: deterministic workflows with no series forecast stage.
- Predictors: accept/modify/defer/reject only.
- Numeric futures in briefs are currently LLM interpretation of readbacks.

## Intervention

1. Run the Dillon OS request router against the synthetic fixture. It must
   return `sandbox-eligible` for
   `_os/automation/fixtures/forecast/synthetic-chronos2-request.json` without
   model execution or network access.
2. Preflight RAM, disk, Python, native-library policy, and available compute
   before any weight download.
3. Load **Chronos-2** on public or synthetic series for the first functional
   pass because it natively supports both covariate classes and multivariate
   targets under Apache-2.0.
4. Compare **TimesFM 2.5** as an independent-univariate/XReg baseline and
   **Toto 2.0 22M** as a no-covariate multivariate challenger.
5. Optionally load **TimesFM-3.0** only on synthetic or public non-client
   series, labeled `license_lane: research-only`.
6. Compare LLM-guessed continuation vs specialist bands on the same held-out
   window.
7. Compare against persistence and seasonal-naive baselines with rolling-origin
   backtests. Record point error plus empirical p10-p90 coverage.
8. Run Chronos-2 cross-learning both enabled and disabled. Retain it only when
   the measured dataset benefits.
9. Write one forecast-run artifact that matches
   [[12_Brain/protocols/Forecast Specialist Protocol|the protocol]].

## Implementation status

- Complete: source research, router contract, strict request and run schemas,
  synthetic fixture, and fail-closed regression tests.
- Complete: baseline machine inventory (63.8 GB RAM, 446.9 GB free disk,
  Python 3.11, no NVIDIA GPU).
- Complete: GitHub/license/capability audit. Chronos-2 is the first legal
  canary; TimesFM 2.5 and Toto 2.0 have explicit capability limits.
- Complete: the first isolated `uv` route was abandoned after Windows Smart
  App Control blocked a pandas native DLL. A persistent trusted runtime based
  on Codex Python 3.12.13 now pins `chronos-forecasting==2.3.1` and
  `torch==2.6.0+cpu`; Smart App Control and Defender remain enabled.
- Complete: the official `amazon/chronos-2` checkpoint loaded on CPU and ran a
  synthetic 32-step-context, four-step forecast with past and known-future
  covariates and all p10-p90 bands. Model load was 24.4923 seconds and forecast
  execution was 0.2927 seconds with cross-learning disabled.
- Complete: a second synthetic canary jointly forecast two targets with both
  covariate classes and cross-learning enabled. It returned point plus all nine
  quantiles for both targets in 0.2251 seconds after warm-cache model loading.
- Complete: `_os/automation/bin/forecast-chronos2.ps1` routes the request first,
  then delegates only eligible work to the pinned machine launcher. The
  launcher performs an exact-version preflight and runs from the local model
  cache without routine network egress.
- Complete: Dillon explicitly approved one read-only Momentum 360 HubSpot
  pilot. The client series route is bound to the exact client, model, target,
  request, horizon, approval reference, and input fingerprint. It does not
  broadly promote client data.
- Complete: the Jason-only portal `50612503` produced 44 complete weekly
  contact-created observations with no missing weeks or invalid timestamps.
  Two likely import/backfill weeks contain 73.39% of the records, so the raw
  target carries a material data-quality warning.
- Complete: Chronos-2 ran one 32-week-context, 12-week-held-out forecast. It
  returned all nine quantiles but posted 25.75% WAPE versus 25.11% for
  persistence. P10-p90 coverage was 58.33%, below the nominal 80% band.
- Complete: the predictive-work router produced a contiguous 90-day portfolio
  count series from 118 dated work-package folders while keeping client names,
  content, revenue, messages, and queue mutations outside the model request.
- Complete: sparse package-type targets were rejected after crossed quantiles
  and are now withheld until each has at least 24 nonzero days and 32 packages.
- Complete: the portfolio-total workload canary ran a 14-day holdout. Chronos
  posted 93.57% WAPE versus 100% persistence and 85.71% for the trailing-seven
  mean; p10-p90 coverage was 57.1%. It failed the best-baseline and calibration
  gates, so the deterministic planner remains primary.
- Blocked by data readiness: the original automation-reliability canary still
  has fewer than 32 contiguous daily observations.
- Pending: rolling-origin scoring, import/backfill reconciliation, intermittent
  count baselines, quantile calibration, cross-learning comparison, and
  independent result review.
- Authorized: one weekly evidence-only rerun of the registered canaries. It may
  refresh receipts but may not promote a model or alter the agenda.
- Not authorized: agenda scoring, automatic plan reordering, client-facing
  forecast claims, or any TimesFM-3.0 client or commercial decision support.

## Acceptance contract

1. No client Ads, HubSpot, Gmail, revenue, or roster series enter TimesFM-3.0.
2. The selected legal checkpoint loads or the run stops with a
   hardware/runtime/license receipt, not a fake forecast.
3. Output shapes match the documented contract (point plus quantiles, no
   NaNs).
4. Router rejects client use of every unpromoted route except an exact
   registered, sanitized-aggregate, fingerprint-bound research experiment. It
   still rejects TimesFM-3.0 client data, license mismatches, incomplete
   past-future covariates, unsupported model capabilities, and the
   not-yet-live managed route.
5. Independent checker inspects license lane, input provenance, and that no
   automation registry entry was added.
6. Rolling-origin point error beats persistence or seasonal-naive, empirical
   p10-p90 coverage is reported, and failures abstain rather than invent a
   forecast.
7. Human gate required before any later promotion into paid-media review,
   HubSpot pulse, or `Get-NextActions` scoring.

## Stop conditions

- attempt to use 3.0 weights on client or production data
- unsigned or unexpected network egress beyond Hugging Face weight download
- forecast copied into a client email or report
- new scheduled automation created from this experiment
- canonical queue mutation
- fewer than 32 contiguous observations, unresolved frequency, stale source,
  mixed client routes, or unresolved future leakage

## Rollback

Remove the isolated runtime and cached weights if Dillon wants them gone,
disable the model route, and keep only the redacted evaluation record in this
experiment note.
