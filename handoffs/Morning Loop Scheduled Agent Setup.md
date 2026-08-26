---
tags: [handoff, automation, slack]
updated: 2026-08-26
superseded_by: ".claude/skills/dillon-command/SKILL.md"
---

# Morning Loop: Scheduled Agent Setup

> **Superseded.** Use the umbrella **Dillon Command Center** workflow instead of
> the three-step prompt below. See `.claude/skills/dillon-command/SKILL.md` and
> `node _os/automation/bin/dillon-command.js --agent-mode --date YYYY-MM-DD`.

This wires the daily loop: every morning a cloud agent reads Slack, files boss requests into the vault, and writes the morning brief. Dillon does this once; it runs forever after.

## One-time setup (Dillon, ~3 minutes)

1. Go to [cursor.com/agents](https://cursor.com/agents) and confirm the Slack integration is connected (it already works from cloud agents on this repo).
2. Create a scheduled agent (Dashboard → Cloud Agents → schedule, or via an Automation) on the `dillon-os` repo, weekdays at 6:45 AM ET.
3. Paste the **dillon-command** prompt below (replaces the legacy 3-step loop).

## The prompt to paste (umbrella workflow)

```
Read AGENTS.md and .claude/skills/dillon-command/SKILL.md first.

Run the Dillon Command Center umbrella workflow for today:

node _os/automation/bin/dillon-command.js --preflight --agent-mode --date YYYY-MM-DD

Execute all scout lanes in parallel (max 8 concurrent subagents): comms,
clients, intelligence, websites, outreach, ads, reporting. Then run the command
lane (am-report + plan-today) and merge into the approval board.

Commit automation-runs/dillon-command/, Daily-Briefs/, Dashboard.md, and inbox
updates. Open one PR titled "Dillon Command Center YYYY-MM-DD".

Hard rules: never send Slack messages or emails, never deploy, never spend.
Tier 2 items queue only.
```

## Legacy prompt (do not use)

The old 3-step slack-intake → am-report → client-pulse sequence is folded into
the umbrella scouts above.

## What lands in the vault each morning

- `automation-runs/dillon-command/YYYY-MM-DD/` — run state, approval board, tier queues, lane results
- `00_Inbox/slack/` — one note per boss/client request, classified and linked to the client
- `Daily-Briefs/slack-intake-YYYY-MM-DD.md` — intake summary
- `Daily-Briefs/am-report-YYYY-MM-DD.md` — the briefing, with a **Boss requests** section
- `Daily-Briefs/plan-YYYY-MM-DD.md` — time-blocked plan
- `Daily-Briefs/pulse-today.md` — client pulse
- Updated `## Today` in `Dashboard.md`

## Extending the loop

- Website asks classified as `website-build` are ready-made briefs for `/site-factory` (see `_templates/site-factory/README.md`). Reply to the morning PR with "build it" and an agent can generate the site the same day.
- Add more MCPs (Gmail, Google Ads, GA4, Vercel) in Cursor Dashboard → Integrations to widen what the loop can see. Secrets go in Dashboard → Cloud Agents → Secrets.
