---
tags: [handoff, automation, umbrella]
status: active
supersedes: handoffs/Morning Loop Scheduled Agent Setup.md
---

# Dillon Command Center — Scheduled Agent Setup

**One automation replaces the old three-step morning loop.** A single scheduled
cloud agent runs eight parallel lanes and opens one PR with the approval board,
AM report, and client pulse.

## One-time setup (~3 minutes)

1. Open [cursor.com/agents](https://cursor.com/agents) → Automations.
2. **Disable** any separate scheduled agents for:
   - Morning loop (slack-intake + am-report + client-pulse)
   - Duplicate midday triage crons that overlap this workflow
3. Create **one** scheduled agent on `dillon-os`:
   - **Cadence:** weekdays 6:45 AM America/New_York (adjust as needed)
   - **Repo:** `dillonmohr8777/dillon-os`
4. Paste the prompt below.

## The prompt to paste

```
Read AGENTS.md and .claude/skills/dillon-command/SKILL.md first.

Run the Dillon Command Center umbrella workflow:

1. Execute: node _os/automation/bin/dillon-command.js run --agent-mode --print-board
2. If Slack MCP is available, enrich the comms lane with /slack-intake steps
   (read-only; never post). De-dupe against 00_Inbox/slack/.
3. Update Dashboard.md ## Today with the top 3 P0 items from the approval board
   (max 5 unchecked tasks; keep anything already checked).
4. Commit to branch cursor/dillon-command-YYYY-MM-DD and open a PR titled
   "Dillon Command Center YYYY-MM-DD".

Hard rules: never send Slack or email, never deploy, never spend, never change
client accounts. Drafts and approval boards only.
```

## What lands each cycle

| Artifact | Path |
|---|---|
| Approval board | `automation-runs/dillon-command/YYYY-MM-DD/approval-board.md` |
| Lane receipts | `automation-runs/dillon-command/YYYY-MM-DD/lane-*.json` |
| AM report | `Daily-Briefs/am-report-YYYY-MM-DD.md` |
| Client pulse | `Daily-Briefs/pulse-today.md` |
| Run state | `12_Brain/state/dillon-command.json` |

## Local Windows companion (optional)

The 15-minute Claude daily driver stays on the Windows box for routine
micro-execution:

```
System/scripts/Invoke-ClaudeDailyDriver.ps1
```

It feeds receipts into the vault; the umbrella workflow reads that evidence
during the command lane synthesis. Do not merge the daily driver into this cron.

## Extending lanes

Add MCP connectors in Cursor Dashboard → Integrations to enrich lanes:

| MCP | Lane enriched |
|---|---|
| Slack | comms |
| Gmail | comms |
| Google Ads / Meta | ads |
| Vercel | websites |

Secrets belong in Dashboard → Cloud Agents → Secrets, never in the vault.

## Superseded doc

[[handoffs/Morning Loop Scheduled Agent Setup]] — keep for rollback reference only.
