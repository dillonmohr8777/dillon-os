---
tags: [handoff, automation]
supersedes: "[[handoffs/Morning Loop Scheduled Agent Setup]]"
---

# Dillon Command Center: Scheduled Agent Setup

**One cron. One commander. Eight parallel lane agents.**

This replaces the three-step morning loop (`slack-intake` → `am-report` → `client-pulse` as separate scheduled agents). Schedule **only** this automation.

## One-time setup (~3 minutes)

1. Go to [cursor.com/agents](https://cursor.com/agents) and confirm Slack integration is connected (optional — vault digest fallback works without it).
2. Create **one** scheduled agent on the `dillon-os` repo, weekdays at **6:45 AM ET**.
3. Paste the prompt below.
4. **Disable** any older morning-loop or per-skill daily crons pointing at the old three-step prompt.

## The prompt to paste

```
Read AGENTS.md at the repo root first. You are the Dillon Command Center commander (L0).

Follow .claude/skills/dillon-command/SKILL.md exactly:

1. Run: node _os/automation/bin/dillon-command.js
2. Read automation-runs/dillon-command/YYYY-MM-DD/agent-manifest.json
3. Fan out ONE sub-agent per lane IN PARALLEL (8 lanes: command, comms,
   clients, intelligence, websites, outreach, ads, reporting). Each lane
   follows its skill(s) from the manifest — Tier 0 read-only scouts first.
4. Synthesize approval-board.md with ranked P0 items.
5. Reporting lane writes Daily-Briefs/am-report-YYYY-MM-DD.md
6. Clients lane writes Daily-Briefs/pulse-today.md
7. Comms lane runs /slack-intake steps (read-only; never post to Slack)
8. Update Dashboard.md ## Today with top 3 from the board
9. Commit to cursor/dillon-command-YYYY-MM-DD and open ONE PR titled
   "Dillon Command Center YYYY-MM-DD"

Hard rules: never send Slack or email, never deploy, never change ad spend.
Drafts stay in the vault for Dillon's Tier-2 approval.
```

## What lands each morning

- `automation-runs/dillon-command/YYYY-MM-DD/approval-board.md` — one approval surface
- `automation-runs/dillon-command/YYYY-MM-DD/run-state.json` — lane vitals
- `automation-runs/dillon-command/YYYY-MM-DD/tier2-queue.md` — outbound items (never auto-run)
- `Daily-Briefs/am-report-YYYY-MM-DD.md`
- `Daily-Briefs/pulse-today.md`
- `Daily-Briefs/slack-intake-YYYY-MM-DD.md` (when comms lane runs)
- `00_Inbox/slack/` — new classified boss/client asks
- Updated `Dashboard.md` ## Today

## Extending

- Website asks (`type: website-build`) are ready for `/site-factory` — reply on the PR with "build it".
- Add MCPs (Gmail, Google Ads, GA4) in Cursor Dashboard → Integrations; ads/reporting lanes use them when present but still fail safe without.

## Superseded

- `handoffs/Morning Loop Scheduled Agent Setup.md` — do not schedule separately
