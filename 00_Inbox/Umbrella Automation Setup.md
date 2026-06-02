---
tags: [inbox, automation]
created: 2026-05-27
---

# Umbrella automation setup (one-time)

Your competitive task is **operator throughput**: ~25 M360/direct clients + Mohr Media, one vault, parallel AI lanes.

## What changed

Seven separate Cursor automations are now **one**:

| Old cron | New |
| -------- | --- |
| Various times | **Daily 1 PM ET** — `dillon-os-operator` |

## Cursor setup

1. Keep **one** automation pointing at `.cursor/automation/dillon-os-operator.md` (this is your only cron — disable the seven legacy automations after 3 green runs).
2. Schedule: `0 13 * * *` (America/New_York). Matches automation `bc523644-815a-43a9-b434-fd2967c1be2c`.
3. Connect **Gmail** and **Slack** MCP to the automation environment.
4. After 3 successful runs, **disable** the seven legacy automations listed in `System/routine-health.md`.

## Where to look each day

- [[Daily-Briefs/pulse-today|Today's Pulse]]
- [[System/urgent-replies|Urgent Replies]]
- [[System/dillon-os-operator|Operator Spec]]

## Parallel lanes (automatic)

**Every day:** gmail, slack, vault pulse, memory sync, codex sessions.

**Sunday:** BOK Law social + Align LinkedIn drafts.

**Thursday:** Book SEO sweep.
