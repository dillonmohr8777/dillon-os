---
note_type: decision
status: active
created: 2026-08-19
updated: 2026-08-19
owner: Dillon Mohr
decision_date: 2026-08-19
review_on: 2026-09-19
verification_status: verified
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - Operator asked to decide lineage PRs and boards]]"
  - "[[12_Brain/11_Craft/2026-08-18 - operating brief]]"
  - "[[.claude/agents/reliability-scout]]"
tags:
  - brain
  - decision
  - agents
  - reliability
---

# Reliability scout owns the loop

**Decision:** Do not spawn a general-purpose agent to re-run the craft brief
against W11 / D03 / D16 / W04. `reliability-scout` owns the loop health
question. Those four routines failing at `stage:build` is one investigation.

Ownership:

- `reliability-scout`: `W11`, `D03` (and `W09`, `D07`).
- `growth-content`: `D16`, `W04`. If the build command is the shared
  `Test-SecondBrain.ps1` / allowlist failure, reliability-scout still leads
  because it is infrastructure, not a content bug.

**Why:** The 2026-08-18 craft brief already counted the failures. A second
agent repeating the brief is coordination work. `G6_dedupe` looking "idle"
while `G8` is open is the failure mode `reliability-scout` exists to catch.

**Implications:**

- Next action is read today's `12_Brain/queue/claude-loop-*.jsonl` for
  `failed` / `stage:build`, then fix the allowlisted build command once.
- Restarting a chat does not change ownership. The generated
  `.claude/agents/reliability-scout.md` is the route.
- Send / publish / deploy / spend gates stay on.
