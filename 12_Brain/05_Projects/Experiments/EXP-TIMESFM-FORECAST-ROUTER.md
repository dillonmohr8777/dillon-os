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

## Baseline

- Agenda: `Get-NextActions.ps1` heuristics plus categorical learning.
- Automations: deterministic workflows with no series forecast stage.
- Predictors: accept/modify/defer/reject only.
- Numeric futures in briefs are currently LLM interpretation of readbacks.

## Intervention

1. Preflight RAM, disk, and GPU with the TimesFM 2.5 system checker before
   any weight download.
2. Load **TimesFM 2.5** on public or synthetic series only for the first
   pass.
3. Optionally load **TimesFM-3.0** only on synthetic or public non-client
   series, labeled `license_lane: research-only`.
4. Compare LLM-guessed continuation vs specialist bands on the same held-out
   window.
5. Write one forecast-run artifact that matches
   [[12_Brain/protocols/Forecast Specialist Protocol|the protocol]].

## Acceptance contract

1. No client Ads, HubSpot, Gmail, revenue, or roster series enter TimesFM-3.0.
2. 2.5 load succeeds or the run stops with a hardware/license receipt, not a
   fake forecast.
3. Output shapes match the documented contract (point plus quantiles, no
   NaNs).
4. Independent checker inspects license lane, input provenance, and that no
   automation registry entry was added.
5. Human gate required before any later promotion into paid-media review,
   HubSpot pulse, or `Get-NextActions` scoring.

## Stop conditions

- attempt to use 3.0 weights on client or production data
- unsigned or unexpected network egress beyond Hugging Face weight download
- forecast copied into a client email or report
- new scheduled automation created from this experiment
- canonical queue mutation

## Rollback

Uninstall the local package, delete cached weights if Dillon wants them gone,
and keep only the redacted evaluation record in this experiment note.
