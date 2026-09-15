---
name: client-pulse
description: Sweep 01_Clients for movement, stalls, and due-soon work — writes the pulse report to Daily-Briefs/pulse-today.md.
---

# Client Pulse

Sweep the client roster for state changes. Work only from this vault.

1. Refresh the evidence-only predictive work artifact before scanning:
   `node _os/automation/bin/predict-work.js --lookahead-days 35 --history-days 90`.
   The command may read the canonical `client-operations` registry, queue, and
   dated deliverable history, but it never writes that repository. If the
   canonical source is unavailable, use the latest local artifact only when its
   `as_of` and source fingerprint are visible, and label it stale or partial.
2. For every client under `01_Clients/`: last-modified time, any `due` /
   `next_action` / `last_touched` frontmatter, and open `- [ ]` tasks inside.
3. Classify each client: **moving** (touched < 48h), **watch** (2–7 days),
   **stalled** (7+ days untouched).
4. Read `12_Brain/state/work-predictor/latest.json` and include upcoming work
   packages only with their exact evidence tier, confidence, predicted window,
   required artifact manifest, and gates. A prediction is not proof of a new
   request or deadline.
5. Read `12_Brain/state/work-predictor/latest-chronos.json` only when its source
   fingerprint matches the current prediction. Show the total-workload band as
   a shadow capacity warning. Do not use it to rank clients while
   `planner_consumption` is false.
6. Note anything due within 48 hours.

Overwrite `Daily-Briefs/pulse-today.md` with:

- **Coverage notes** — what was scanned and any blind spots
- **Moving** / **Watch** / **Stalled** — client, evidence, suggested next touch
- **Due in 48h** — hard list
- **Likely next work packages** — evidence tier, confidence, window, expected
  deliverable, and the first safe preparation step
- **Capacity shadow** — baseline decision, holdout result, total band, and
  whether the planner-consumption gate passed
- **Tomorrow's priority stack** — ranked 1–3 with one-line reasons

Match the tone of the existing pulse reports: blunt, evidence-based, and honest
about data gaps (e.g., missing frontmatter that prevents a section from populating).
Keep approval-bound and blocked predictions out of the priority stack; list them
as gates instead.
