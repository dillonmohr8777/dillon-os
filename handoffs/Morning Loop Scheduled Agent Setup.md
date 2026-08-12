---
tags: [handoff, automation, slack]
updated: 2026-08-12
superseded_by: ".claude/skills/dillon-command/SKILL.md"
---

# Morning Loop: Scheduled Agent Setup

> **Superseded.** Use the unified **Dillon Command Center** (`/dillon-command`) instead of
> scheduling slack-intake, am-report, and client-pulse as three separate steps. This handoff
> remains as setup reference for the single cron prompt below.

This wires the daily loop: every morning a cloud agent runs one umbrella workflow with
parallel lane scouts, then writes a single approval board + morning brief. Dillon does
this once; it runs forever after.

## One-time setup (Dillon, ~3 minutes)

1. Go to [cursor.com/agents](https://cursor.com/agents) and confirm the Slack integration is connected (it already works from cloud agents on this repo).
2. Create a scheduled agent (Dashboard → Cloud Agents → schedule, or via an Automation) on the `dillon-os` repo, weekdays at 6:45 AM ET.
3. Paste the prompt below.

## The prompt to paste

```
Read AGENTS.md and .claude/skills/dillon-command/SKILL.md at the repo root. Run the
unified Dillon Command Center for today:

1. Phase 0: node _os/automation/bin/dillon-command.js --agent-mode
2. Phase 1: spawn parallel lane scouts per agent-manifest.json (comms, clients,
   intelligence, websites, outreach, ads, reporting). Each scout runs its skills
   Tier 0 only. If Slack MCP is missing, log needs-mcp:slack and continue.
3. Phase 2: commander lane runs /am-report and /plan-today; merge scout outputs
   into the approval board.
4. Commit to cursor/dillon-command-YYYY-MM-DD and open ONE PR titled
   "Dillon Command YYYY-MM-DD".

Hard rules: never send Slack messages or emails, never deploy anything, never delete
vault notes. Tier 1 batches wait for approval. Tier 2 stays gated.
```

## What lands in the vault each morning

- `automation-runs/dillon-command/YYYY-MM-DD/` — run-state, approval board, agent manifest, evidence log
- `00_Inbox/slack/` — one note per boss/client request (comms lane)
- `Daily-Briefs/slack-intake-YYYY-MM-DD.md` — intake summary
- `Daily-Briefs/am-report-YYYY-MM-DD.md` — the briefing, with a **Boss requests** section
- `Daily-Briefs/plan-YYYY-MM-DD.md` — time-blocked plan
- `Daily-Briefs/pulse-today.md` — client pulse
- Updated `## Today` in `Dashboard.md`

## Extending the loop

- Website asks classified as `website-build` are ready-made briefs for `/site-factory` (see `_templates/site-factory/README.md`). Reply to the morning PR with "build it" and an agent can generate the site the same day.
- Add more MCPs (Gmail, Google Ads, GA4, Vercel) in Cursor Dashboard → Integrations to widen what the loop can see. Secrets go in Dashboard → Cloud Agents → Secrets.
- Local Ops Box: keep `radar-morning.ps1` on the machine with Chromium; its output feeds the outreach lane but is not part of the cloud cron.
