---
tags: [handoff, automation, slack]
---

# Morning Loop: Scheduled Agent Setup

> **Superseded** by the competitive-task orchestrator (`System/competitive-task-orchestrator-prompt.md`, schedule `0 13 * * *`). Disable this cron once the umbrella is verified. Kept for reference.

This wires the daily loop: every morning a cloud agent reads Slack, files boss requests into the vault, and writes the morning brief. Dillon does this once; it runs forever after.

## One-time setup (Dillon, ~3 minutes)

1. Go to [cursor.com/agents](https://cursor.com/agents) and confirm the Slack integration is connected (it already works from cloud agents on this repo).
2. Create a scheduled agent (Dashboard → Cloud Agents → schedule, or via an Automation) on the `dillon-os` repo, weekdays at 6:45 AM ET.
3. Paste the prompt below.

## The prompt to paste

```
Read AGENTS.md at the repo root first. Then run the morning loop:

1. Follow .claude/skills/slack-intake/SKILL.md exactly: scan the priority
   Slack channels for the last 24h, classify requests, and file task notes
   into 00_Inbox/slack/. Read and draft only, never post to Slack.
2. Follow .claude/skills/am-report/SKILL.md to write today's briefing to
   Daily-Briefs/ and update the ## Today section of Dashboard.md.
3. Follow .claude/skills/client-pulse/SKILL.md and write the pulse file.
4. Commit everything to a branch named cursor/morning-loop-YYYY-MM-DD and
   open a PR titled "Morning loop YYYY-MM-DD" so I can review from my phone.

Hard rules: never send Slack messages or emails, never deploy anything,
never delete vault notes. Drafts stay in the vault for my approval.
```

## What lands in the vault each morning

- `00_Inbox/slack/` — one note per boss/client request, classified and linked to the client
- `Daily-Briefs/slack-intake-YYYY-MM-DD.md` — intake summary
- `Daily-Briefs/am-report-YYYY-MM-DD.md` — the briefing, with a **Boss requests** section
- `Daily-Briefs/pulse-today.md` — client pulse
- Updated `## Today` in `Dashboard.md`

## Extending the loop

- Website asks classified as `website-build` are ready-made briefs for `/site-factory` (see `_templates/site-factory/README.md`). Reply to the morning PR with "build it" and an agent can generate the site the same day.
- Add more MCPs (Gmail, Google Ads, GA4, Vercel) in Cursor Dashboard → Integrations to widen what the loop can see. Secrets go in Dashboard → Cloud Agents → Secrets.
