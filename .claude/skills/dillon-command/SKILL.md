---
name: dillon-command
description: Dillon Command Center — one umbrella workflow with eight parallel agent lanes (comms, clients, intelligence, websites, outreach, ads, reporting, command). Replaces separate morning-loop crons.
---

# Dillon Command Center

One major automation. Eight agents in parallel. One approval board. One morning push.

## When to use

- Scheduled morning run (cron / cloud agent at 13:00 UTC or 06:45 ET)
- Dillon asks to "run command center", "morning loop", or "unify my automations"
- Replacing separate `slack-intake` + `am-report` + `client-pulse` crons

## CLI

```bash
node _os/automation/bin/dillon-command.js run --print-board
node _os/automation/bin/dillon-command.js plan
node _os/automation/bin/dillon-command.js board --date YYYY-MM-DD --print-board
```

Profile: `_os/automation/profiles/dillon-command.json`

## Agent mode (cloud / Cursor automation)

1. Read `AGENTS.md`, `System/operating-status.md`, `System/approval-queue.md`.
2. Run `node _os/automation/bin/dillon-command.js run --print-board`.
3. For lanes that need live reads and MCP is authenticated:
   - **comms** → `slack-intake` skill (read-only, file to `00_Inbox/slack/`)
   - **ads** → `metrics-pull` (read-only)
   - **clients** → `client-pulse`
4. Re-run dillon-command after any new intake files land.
5. Commit artifacts on branch `cursor/dillon-command-YYYY-MM-DD`.
6. One push: approval board + AM report PR. Never send, publish, deploy, or spend.

## Eight parallel lanes

| Lane | Agent | Owns |
|------|-------|------|
| comms | chief-of-staff | Slack/Gmail intake, boss requests |
| clients | marketing-chief | Roster movement, stalled clients |
| intelligence | brain-curator | Research, radar, Grok ingest |
| websites | web-product-builder | LP queue, site health, publish-ready |
| outreach | growth-content | Prospect radar, sell-traffic-not-rebuild |
| ads | paid-media-analyst | Billing blocks, disapprovals, attribution |
| reporting | paid-media-analyst | Draft reports, report gaps |
| command | marketing-chief | Approval board, top 3, today directives |

## Priority tie-break

1. Launch blocked
2. Billing risk
3. Ad disapprovals
4. Calendar commitments
5. Boss requests (Slack `status: new`)
6. Client deliverables
7. Website ready-to-publish
8. Outreach queue
9. Reporting gaps
10. Intelligence signals

## Outputs (every run)

- `automation-runs/dillon-command/YYYY-MM-DD/run-state.json`
- `automation-runs/dillon-command/YYYY-MM-DD/approval-board.md`
- `automation-runs/dillon-command/YYYY-MM-DD/lane-results.json`
- `Daily-Briefs/am-report-YYYY-MM-DD.md`
- `Daily-Briefs/command-board-YYYY-MM-DD.md`
- Updated `Dashboard.md` ## Today (top 3)

## Supersedes

- `handoffs/Morning Loop Scheduled Agent Setup.md` (three-step morning cron)
- Separate am-report / client-pulse / slack-intake scheduled agents

## Retained separate

- Claude daily driver (15m micro-loop)
- Prospect Radar Next 20 (05:20 batch build)
- Agent-memory vault sync (hourly)

## Hard rules

- Tier 0: read, analyze, draft, QA — no gate
- Tier 1: reversible tweaks — one morning batch approval
- Tier 2: send, publish, deploy, spend, billing — live approval only
- KJB emails MUST CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com
- Align HCM is full-time, not M360 client revenue
