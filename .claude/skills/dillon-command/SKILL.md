---
name: dillon-command
description: Umbrella command center — one cycle, eight parallel lane agents, one approval board. Replaces separate morning-loop crons. Run daily at 06:45 ET weekdays.
---

# Dillon Command Center

One commander, eight parallel scouts, one push to Dillon. This skill **supersedes**
running `/slack-intake`, `/am-report`, and `/client-pulse` as separate automations.

Contract: `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`
Profile: `_os/automation/profiles/dillon-command.json`
CLI: `node _os/automation/bin/dillon-command.js`

## When to run

- **Daily weekdays ~06:45 ET** — scheduled cloud agent (cron)
- **On demand** — Dillon says `/dillon-command` or "run command center"
- **64GB Codex machine** — same contract; push is phone notification instead of PR

## Targets (every cycle)

1. ROAD TO 100 CLIENTS (12/100)
2. $40K Mohr Media in 5 months
3. 2,000 book subscribers in 4 months

## Phase 0 — Initialize

```bash
node _os/automation/bin/dillon-command.js --init
```

Read `11_Agents/Master Agent.md`. You are the commander.

## Phase 1 — Parallel scouts (Tier 0)

Spawn **one subagent per lane** simultaneously. Each subagent follows only its
lane skill(s). Read and draft only — never send, deploy, or spend.

| Lane | Agent | Skills | Codex lane |
| --- | --- | --- | --- |
| comms | Comms Scout | `/slack-intake`, `/inbox-brief` | B |
| clients | Client Pulse | `/client-pulse` | F |
| intelligence | Intel Scout | `/research-sweep` (if stale >7d) | A |
| websites | Site Health | `node _os/automation/bin/site-health.js --dry-run` | D |
| outreach | Outreach Scout | `node _os/automation/bin/queue-status.js` + pipeline check | E |
| ads | Ads Scout | `/metrics-pull` | C |
| reporting | Reporting Scout | `/client-report` (when JSON data exists) | F |
| command | Commander | `/am-report`, `/plan-today` | H |

**Intelligence lane:** skip unless `12_Brain/research/` has no page newer than 7 days
or a research trigger fired (platform surprise, new vertical, repeated ledger loss).

**Outreach lane:** write `Daily-Briefs/outreach-status-YYYY-MM-DD.md` summarizing
qualify queue, site-factory batch status, and activate gates from
`12_Brain/registry/automations.json`.

After each lane completes, mark its status in
`automation-runs/dillon-command/YYYY-MM-DD/run-state.json`.

## Phase 2 — Commander synthesis

When all parallel lanes return:

1. Run `/am-report` — must include **Boss requests** from `00_Inbox/slack/`
2. Run `/plan-today` — time-blocked plan mapped to `System/OS Config.md`
3. Build the approval board:

```bash
node _os/automation/bin/dillon-command.js --board
```

4. Edit `approval-board.md` with:
   - ≤8 active client cards ranked by P0 tie-break
   - Tier 1 batch (reversible tweaks ready for one approval)
   - Tier 2 queue (outbound — prepared only)
5. Update `Dashboard.md` `## Today` with top 3 priorities
6. Finalize:

```bash
node _os/automation/bin/dillon-command.js --finalize
```

## Approval tiers

- **Tier 0:** read/analyze/draft/build — runs unattended (all scouts)
- **Tier 1:** reversible tweaks — one approval executes the batch
- **Tier 2:** sends, deploys, spend, credentials — never autonomous

P0 tie-break: launch blocked > billing risk > ad disapprovals > calendar.

## Hard rules

- Never send Slack messages or emails
- Never deploy, publish, or change ad spend
- Never delete vault notes
- **One PR per cycle** — approval board + AM report
- KJB emails CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com
- Align HCM is full-time — never route under Momentum 360

## Artifacts

`automation-runs/dillon-command/YYYY-MM-DD/`:

- `run-state.json` — lane statuses and counts
- `approval-board.md` — ranked board for Dillon's one touch
- `Daily-Briefs/am-report-YYYY-MM-DD.md` — morning briefing
- `Daily-Briefs/plan-YYYY-MM-DD.md` — time-blocked plan
- `Daily-Briefs/pulse-today.md` — client pulse

## Cloud deliverable

Commit to `cursor/dillon-command-YYYY-MM-DD` and open one PR titled
**Dillon Command YYYY-MM-DD**.

## What this supersedes

- `handoffs/Morning Loop Scheduled Agent Setup.md` (3-step morning loop)
- Duplicate daily-orchestrator PRs (#171–#260 family)
- Separate crons for slack-intake, am-report, client-pulse

Individual lane skills remain — this skill orchestrates them.
