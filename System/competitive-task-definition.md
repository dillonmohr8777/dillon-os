# Competitive task definition

**One line:** Operator throughput across M360/direct accounts, Align HCM, and Mohr Media — not competitor research.

## What "competitive task" means

Dillon's operating surface has **competing daily priorities** (client delivery, inbox loops, canonical queue items, growth factory, infra health) and **competing automations** that each try to own the same morning without closing each other:

| Source | Schedule | Problem |
| --- | --- | --- |
| Cursor competitive-task consolidation | `0 13 * * *` UTC | Opened a draft PR almost daily; none merged |
| Claude daily learning loop | `0 4 * * *` | Stacked rolling PRs; proposals lost |
| Claude nightly vault hygiene | `0 6 * * *` | Duplicate hygiene PRs |
| Claude morning brief | `0 11 * * 1-5` | Missing client-ops env vars → degraded predict-work |
| Claude-Autonomous-Daily-Driver | every 15 min (local) | Correct bounded loop; stays separate |

The **competitive task** is closing the loop on real work: overdue deliverables, stale Slack asks, canonical queue gates, and prospect radar — with **one orchestrator** and **parallel lanes**, not four schedulers fighting for GitHub.

## Canonical umbrella

| Piece | Path |
| --- | --- |
| Workflow registry | `12_Brain/registry/umbrella-workflow.json` |
| Runner CLI | `node _os/automation/bin/competitive-task-run.js` |
| Cursor prompt | `System/competitive-task-orchestrator-prompt.md` |
| Daily brief | `Daily-Briefs/competitive-task-today.md` |
| Machine receipt | `12_Brain/state/competitive-task-orchestrator.json` |
| Parallel agents | `.cursor/agents/*.md` |

## Retire (owner action)

1. **Disable** the old Cursor automation that only opens draft PRs.
2. **Paste** updated prompts from `11_Agents/Cloud Routine Prompts 2026-09-05.md` into the three Claude Routines (or disable morning/learning/hygiene Routines and let the umbrella absorb them).
3. Keep **Claude-Autonomous-Daily-Driver** on the Windows box — it is the 15-minute gate loop, not a duplicate morning brief.

## Evidence

- [[12_Brain/01_Captures/sessions/2026-09-05 - pr-sweep-and-client-archive]]
- [[12_Brain/09_Ops/Repository Access Map]]
- [[11_Agents/Cloud Routine Prompts 2026-09-05]]
