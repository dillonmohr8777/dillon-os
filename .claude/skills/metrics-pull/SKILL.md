---
name: metrics-pull
description: Compute vault-wide metrics — notes, tasks, client activity, content pipeline, session cadence — and log a dated snapshot.
---

# Metrics Pull

Compute the vault's vital signs. Work only from this vault.

Count and report:

- Total notes, and notes created/modified in the last 7 days
- Open `- [ ]` vs completed `- [x]` tasks across the vault
- Clients in `01_Clients/` by state (touched <48h / <7d / stalled)
- Content pieces in `03_Content/` and how many look ship-ready
- Sessions logged in `10_Sessions/` in the last 7 days
- Inbox depth in `00_Inbox/`
- Progress on the `goal_current` / `goal_target` in `System/OS Config.md`

Then run
`node _os/automation/bin/predict-work.js --lookahead-days 35 --history-days 90`
to refresh the contiguous workload-arrival series and work-package
classification snapshot. This is a read-only projection of canonical
`client-operations` evidence; it may write only Dillon OS brief/state artifacts.
Do not run Chronos from the daily metrics pull. The weekly forecast evaluator
owns model execution.

Write `Daily-Briefs/metrics-YYYY-MM-DD.md` (today's date) with a compact table
of metric → value → 7-day delta (compare against the previous `metrics-*.md`
snapshot if one exists; say "first snapshot" if not), then 3 bullet
observations — what's trending well, what's decaying, one concrete fix.

Add a compact **Workload mix** block with:

- dated packages observed in the 90-day window;
- counts by work-package type;
- classifier coverage and excluded stale queue rows;
- hindcast calibration per evidence tier (judged, hit, hit rate, applied or
  sample under three);
- the latest matching Chronos receipt decision and gates, if one exists, with
  the rolling-origin aggregate (wins versus the best deterministic baseline,
  origins rejected, mean coverage) when the receipt is schema version 2.

Chronos output is shadow evidence only. If its fingerprint is stale or its
planner-consumption gate is false, say so and do not convert its band into a
commitment, staffing claim, or plan priority.

If `goal_current` in `System/OS Config.md` is out of date versus what the vault
shows, say so explicitly and state the corrected number (do not edit OS Config).
