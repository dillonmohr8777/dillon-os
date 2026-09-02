---
name: plan-today
description: Build today's plan from the Dashboard, the latest daily brief, and open client work — writes a time-blocked plan back to the vault.
---

# Plan Today

Build a realistic, time-blocked plan for today. Work only from this vault.

1. Read `Dashboard.md` `## Today`, the newest `Daily-Briefs/` file, and the
   `## Schedule` in `System/OS Config.md`.
2. Refresh or read `12_Brain/state/work-predictor/latest.json`. Prefer a fresh
   run of `node _os/automation/bin/predict-work.js --lookahead-days 35
   --history-days 90`; if canonical sources are unavailable, expose the stale
   date instead of silently reusing it.
3. Scan `01_Clients/` and `02_Campaigns/` for anything with a deadline or an
   obvious next action.
4. Rank by: hard commitments first, then client-facing, then internal.
   Predictions never outrank explicit commitments. Use the artifact's
   `plan_inputs` block mechanically rather than re-deriving the rules:
   `hard_commitments` are the only prediction-derived rows that may sit above
   client-facing work; `predicted_preparation` (already capped at two rows,
   45 minutes each, confidence 0.60 or higher, window inside seven days) may
   fill at most two blocks after hard commitments; `gated` rows go under
   **Deliberately not doing**, never into a work block. If the artifact's
   top-level `status` is `degraded`, `predicted_preparation` is empty by
   construction; do not substitute your own guesses.
5. Read the matching Chronos receipt only when its source fingerprint matches.
   Show the capacity band as context, but do not reorder the plan unless the
   receipt explicitly has `gates.planner_consumption: true`. Software never
   sets that gate; only a recorded human promotion does.

Write `Daily-Briefs/plan-YYYY-MM-DD.md` (today's date):

- **The one thing** — the single task that makes today a win
- **Blocks** — time-blocked list mapped onto the OS Config schedule
- **If time remains** — 2–3 overflow tasks
- **Deliberately not doing** — what got cut and why

For any prediction-derived preparation block, name the expected work-package
type, the first three required artifacts, and the first two `inputs` and
`templates` from the candidate's `preparation_contract` so the work begins
with the right brief, assets, data, repository, or template. Label it
`predicted preparation`, not `requested work`, and state the candidate's
`claim_type` and confidence in the block. Predicted preparation is the first
thing cut when the five-task limit binds.

Then update `Dashboard.md` `## Today` to match the plan (unchecked tasks,
keep anything already checked). Max 5 tasks — if there are more, cut.
