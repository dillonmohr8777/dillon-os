---
tags: [handoff, automation, slack]
updated: 2026-08-15
---

# Morning Loop → Dillon Command Center

**Superseded:** the old three-step morning loop. Use the unified
[[12_Brain/concepts/Dillon Command Center|Dillon Command Center]] instead —
one scheduled agent, eight parallel lanes, one PR per cycle.

## One-time setup (Dillon, ~3 minutes)

1. Go to [cursor.com/agents](https://cursor.com/agents) and confirm the Slack integration is connected.
2. Create **one** scheduled agent on the `dillon-os` repo, weekdays at 6:45 AM ET.
3. Paste the prompt below.
4. **Retire** any separate crons for slack-intake, am-report, or client-pulse — they are lanes inside this workflow now.

## The prompt to paste

```
Read AGENTS.md at the repo root first. Then run the Dillon Command Center:

Follow .claude/skills/dillon-command/SKILL.md exactly.

1. node _os/automation/bin/dillon-command.js --init
2. Fan out all eight lanes IN PARALLEL (spawn subagents or parallel workers):
   comms, clients, intelligence, websites, outreach, ads, reporting, command
3. node _os/automation/bin/dillon-command.js --synthesize
4. Commit to cursor/dillon-command-YYYY-MM-DD and open ONE PR titled
   "Dillon Command YYYY-MM-DD" so I can review from my phone.

Hard rules: never send Slack messages or emails, never deploy anything,
never delete vault notes. Drafts stay in the vault for my approval.
One PR per cycle — do not open parallel umbrella PRs.
```

## What lands in the vault each morning

- `automation-runs/dillon-command/YYYY-MM-DD/approval-board.md` — ranked P0/P1/P2
- `00_Inbox/slack/` — new boss/client requests (comms lane)
- `Daily-Briefs/slack-intake-YYYY-MM-DD.md` — intake summary
- `Daily-Briefs/inbox-brief-YYYY-MM-DD.md` — inbox verdicts
- `Daily-Briefs/am-report-YYYY-MM-DD.md` — morning briefing
- `Daily-Briefs/pulse-today.md` — client pulse
- `Daily-Briefs/plan-YYYY-MM-DD.md` — time-blocked plan
- Updated `## Today` in `Dashboard.md`

## Eight lanes (parallel)

| Lane | What it does |
|---|---|
| comms | Slack intake + inbox brief |
| clients | Frontmatter validate + client pulse |
| intelligence | Radar + research sweep |
| websites | Site health sentinel (dry-run) |
| outreach | Queue status + site grader context |
| ads | Metrics pull (skipped without Ads MCP) |
| reporting | Client report drafts (skipped without MCP) |
| command | AM report + plan today + board synthesis |

## Extending the loop

- Website asks classified as `website-build` feed `/site-factory`. Reply to the PR with "build it".
- Add MCPs (Gmail, Google Ads, GA4, Vercel) in Cursor Dashboard → Integrations to unblock ads/reporting lanes.
