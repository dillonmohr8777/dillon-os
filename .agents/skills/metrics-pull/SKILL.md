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

Write `Daily-Briefs/metrics-YYYY-MM-DD.md` (today's date) with a compact table
of metric → value → 7-day delta (compare against the previous `metrics-*.md`
snapshot if one exists; say "first snapshot" if not), then 3 bullet
observations — what's trending well, what's decaying, one concrete fix.

If `goal_current` in `System/OS Config.md` is out of date versus what the vault
shows, say so explicitly and state the corrected number (do not edit OS Config).
