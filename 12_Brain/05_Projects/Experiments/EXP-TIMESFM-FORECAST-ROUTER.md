---
note_type: experiment
status: proposed
created: 2026-09-01
updated: 2026-09-01
owner: Dillon Mohr
experiment_id: EXP-TIMESFM-FORECAST-ROUTER
decision: sandbox-test
verification_status: partial
human_gate: required
risk: medium
source_refs:
  - "[[12_Brain/04_Decisions/2026-09-01 - Route numeric forecasts to a specialist]]"
  - "[[12_Brain/06_Research/2026-09-01 - TimesFM-3 multivariate forecast specialist]]"
  - "[[12_Brain/02_Entities/TimesFM]]"
  - "https://github.com/google-research/timesfm"
tags:
  - brain
  - experiment
  - forecasting
  - timesfm
  - predictors
---

# TimesFM forecast-router sandbox

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
   return `sandbox-eligible` without model execution or network access.
2. Preflight RAM, disk, and GPU with the TimesFM 2.5 system checker before
   any weight download.
3. Load **TimesFM 2.5** on public or synthetic series only for the first
   pass.
4. Optionally load **TimesFM-3.0** only on synthetic or public non-client
   series, labeled `license_lane: research-only`.
5. Compare LLM-guessed continuation vs specialist bands on the same held-out
   window.
6. Compare against persistence and seasonal-naive baselines with rolling-origin
   backtests. Record point error plus empirical p10-p90 coverage.
7. Write one forecast-run artifact that matches
   [[12_Brain/protocols/Forecast Specialist Protocol|the protocol]].

## Implementation status

- Complete: source research, router contract, strict request and run schemas,
  synthetic fixture, and fail-closed regression tests.
- Complete: baseline machine inventory (63.8 GB RAM, 446.9 GB free disk,
  Python 3.11, no NVIDIA GPU).
- Blocked by data readiness: fewer than 32 contiguous daily observations in
  both the tracked branch and active runtime history.
- Pending: official TimesFM 2.5 preflight, checkpoint download, inference,
  held-out scoring, and independent result review.
- Not authorized: client data, agenda scoring, scheduled automation, or any
  TimesFM-3.0 commercial decision support.

## Acceptance contract

1. No client Ads, HubSpot, Gmail, revenue, or roster series enter TimesFM-3.0.
2. 2.5 load succeeds or the run stops with a hardware/license receipt, not a
   fake forecast.
3. Output shapes match the documented contract (point plus quantiles, no
   NaNs).
4. Router rejects client use of TimesFM-3.0, license mismatches, incomplete
   past-future covariates, and the not-yet-live managed route.
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

Uninstall the local package, delete cached weights if Dillon wants them gone,
and keep only the redacted evaluation record in this experiment note.
