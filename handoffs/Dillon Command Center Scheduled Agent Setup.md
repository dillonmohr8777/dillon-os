---
tags: [handoff, automation, command-center]
status: active
supersedes: handoffs/Morning Loop Scheduled Agent Setup.md
---

# Dillon Command Center — Scheduled Agent Setup

One umbrella automation replaces the old three-step morning loop. Eight agents run
in parallel; you get one approval board and one AM report.

## One-time setup (~3 minutes)

1. Confirm this repo's Cursor automation is scheduled at **13:00 UTC** (08:00 ET)
   weekdays, or adjust to your preferred morning slot.
2. The automation prompt should invoke the `dillon-command` skill (see below).
3. Disable any separate morning-loop crons for slack-intake, am-report, and
   client-pulse — they are superseded.

## The prompt (paste into Cursor automation)

```
Read AGENTS.md first. Follow .claude/skills/dillon-command/SKILL.md exactly.

1. Run: node _os/automation/bin/dillon-command.js run --print-board
2. If Slack MCP is authenticated and no intake file exists for today, run
   slack-intake (read-only) then re-run dillon-command.
3. Commit to branch cursor/dillon-command-YYYY-MM-DD.
4. Open PR titled "Dillon Command Center YYYY-MM-DD".

Hard rules: never send Slack or email, never deploy, never spend, never delete
vault notes. Drafts and boards stay in the vault for approval.
```

## What lands each run

| Output | Path |
|--------|------|
| Run state | `automation-runs/dillon-command/YYYY-MM-DD/run-state.json` |
| Approval board | `automation-runs/dillon-command/YYYY-MM-DD/approval-board.md` |
| Lane results | `automation-runs/dillon-command/YYYY-MM-DD/lane-results.json` |
| AM report | `Daily-Briefs/am-report-YYYY-MM-DD.md` |
| Board copy | `Daily-Briefs/command-board-YYYY-MM-DD.md` |
| Dashboard | `Dashboard.md` ## Today updated with top 3 |

## Eight parallel lanes

`comms` · `clients` · `intelligence` · `websites` · `outreach` · `ads` · `reporting` · `command`

## Priority order

Launch blocked → billing risk → ad disapprovals → calendar → boss Slack requests → client deliverables → website queue → outreach → reporting.

## Still separate (do not merge)

- **Claude daily driver** — 15m routine gate on Windows
- **Prospect Radar Next 20** — 05:20 site batch builder
- **Agent-memory sync** — hourly

## Extending

Add MCPs (Gmail, Google Ads, Slack live read) in Cursor Dashboard → Integrations.
Re-run dillon-command after connectors authenticate; ads lane upgrades from
vault-only to live metrics when MCP is available.
