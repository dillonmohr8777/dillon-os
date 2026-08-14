---
tags: [handoff, automation, slack]
updated: 2026-08-14
---

# Morning Loop: Scheduled Agent Setup

This wires the daily loop: every morning a cloud agent runs the **Dillon Command
Center** umbrella workflow — eight parallel scout lanes, one synthesis, one PR.

## One-time setup (Dillon, ~3 minutes)

1. Go to [cursor.com/agents](https://cursor.com/agents) and confirm the Slack integration is connected (it already works from cloud agents on this repo).
2. Create **one** scheduled automation on the `dillon-os` repo, weekdays at 6:45 AM ET (or use the existing cron).
3. Paste the prompt below.

## The prompt to paste

```
Read AGENTS.md at the repo root first. Then run the Dillon Command Center umbrella:

1. Follow .claude/skills/dillon-command/SKILL.md exactly.
2. Scaffold + preflight: node _os/automation/bin/dillon-command.js --preflight --date YYYY-MM-DD
3. Fan out scout lanes in parallel (max 8): comms, clients, intelligence, websites, outreach, ads, reporting.
   - comms: slack-intake + inbox-brief skills (read Slack if MCP available; never post)
   - clients: client-pulse + frontmatter scan
   - intelligence: research-sweep only if a concrete question exists
   - websites: site-health preflight results + flagged property notes
   - outreach: queue-status + Pipeline Spec honest status
   - ads: metrics-pull if API/MCP available; else list missing connector
   - reporting: client-report gap scan
4. Command lane LAST: am-report then plan-today; merge scouts into approval-board.md
5. Commit to cursor/dillon-command-YYYY-MM-DD and open PR "Dillon Command Center YYYY-MM-DD"

Hard rules: never send Slack messages or emails, never deploy anything,
never delete vault notes. Drafts stay in the vault for my approval.
```

## What lands in the vault each morning

- `automation-runs/dillon-command/YYYY-MM-DD/` — run-state, approval board, tier queues, lane results
- `00_Inbox/slack/` — one note per boss/client request (when Slack MCP available)
- `Daily-Briefs/slack-intake-YYYY-MM-DD.md` — intake summary (if comms lane ran)
- `Daily-Briefs/inbox-brief-YYYY-MM-DD.md` — inbox triage
- `Daily-Briefs/am-report-YYYY-MM-DD.md` — the briefing, with **Boss requests**
- `Daily-Briefs/pulse-today.md` — client pulse
- `Daily-Briefs/plan-YYYY-MM-DD.md` — time-blocked plan
- Updated `## Today` in `Dashboard.md`

## Extending the loop

- Website asks classified as `website-build` are ready-made briefs for `/site-factory`.
- Reply to the morning PR with "build it" and an agent can generate the site the same day.
- Add MCPs (Gmail, Google Ads, GA4, Vercel) in Cursor Dashboard → Integrations to widen scout lanes.

## Supersedes

The old 3-step prompt (slack-intake → am-report → client-pulse as separate steps).
One umbrella workflow replaces multiple crons. See [[12_Brain/concepts/Dillon Command Center|Dillon Command Center]].
