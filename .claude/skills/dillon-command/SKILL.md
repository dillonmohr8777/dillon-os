---
name: dillon-command
description: Unified Dillon Command Center — one cron, eight parallel agent lanes, one approval board and one PR per cycle. Replaces separate morning-loop automations.
---

# Dillon Command Center

One umbrella workflow for Dillon's competitive daily ops. Replaces the old
three-step morning loop (slack-intake → am-report → client-pulse) and the
scattered daily-orchestrator PRs. Eight lanes run in parallel; the commander
synthesizes one approval board and one push.

Contract: `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`
Profile: `_os/automation/profiles/dillon-command.json`
CLI: `node _os/automation/bin/dillon-command.js`

## When to use

- Scheduled weekday morning cron (replaces `handoffs/Morning Loop Scheduled Agent Setup.md`)
- Any time Dillon asks to "run the command center" or consolidate competitive tasks
- Cloud sessions: output is one PR, not a phone push

## The eight parallel lanes

| Lane | Skills | Deterministic preflight |
|---|---|---|
| **comms** | `/slack-intake`, `/inbox-brief` | — |
| **clients** | `/client-pulse` | `frontmatter-validate.js` |
| **intelligence** | `/research-sweep` | read `Daily-Briefs/radar-{date}.md` |
| **websites** | — | `site-health.js --dry-run` |
| **outreach** | `/site-grade` | `queue-status.js` |
| **ads** | `/metrics-pull` | blocked without Ads/Meta/GA4 MCP |
| **reporting** | `/client-report` | blocked without Ads MCP |
| **command** | `/am-report`, `/plan-today` | synthesize after other lanes |

## Steps (commander)

1. Read `AGENTS.md`, `11_Agents/Master Agent.md`, and `12_Brain/protocols/approval-tiers.md`.
2. Initialize the run:
   `node _os/automation/bin/dillon-command.js --init`
3. **Fan out all eight lanes in parallel.** Spawn subagents or parallel tool calls —
   one lane per worker. Each worker follows only its lane skills. Tier 0 only.
4. For lanes with deterministic commands, workers may run:
   `node _os/automation/bin/dillon-command.js --lane <id>`
   before executing skills.
5. When every lane finishes, synthesize:
   `node _os/automation/bin/dillon-command.js --synthesize`
6. The **command** lane writes:
   - `Daily-Briefs/am-report-YYYY-MM-DD.md`
   - `Daily-Briefs/plan-YYYY-MM-DD.md`
   - updates `Dashboard.md` `## Today` (max 5 tasks)
7. Commit to `cursor/dillon-command-YYYY-MM-DD` and open **one** PR titled
   `Dillon Command YYYY-MM-DD`.

## Lane worker contracts

### comms
- Run `/slack-intake` if Slack MCP is available; otherwise process existing
  `00_Inbox/slack/` notes with `status: new` and write today's intake summary.
- Run `/inbox-brief` on `00_Inbox/`.

### clients
- Run `node _os/automation/bin/dillon-command.js --lane clients`
- Run `/client-pulse` and overwrite `Daily-Briefs/pulse-today.md`.

### intelligence
- Read today's radar brief and any Grok captures in `12_Brain/01_Captures/Grok/`.
- Run `/research-sweep` only if the window has new untrusted evidence to verify.

### websites
- Run `node _os/automation/bin/dillon-command.js --lane websites`
- Surface site-health failures on the board; do not deploy.

### outreach
- Run `node _os/automation/bin/dillon-command.js --lane outreach`
- Note rebuild queue size from `Daily-Briefs/radar-{date}.md`.

### ads
- Run `/metrics-pull` only when Google Ads / Meta / GA4 MCPs are connected.
- If blocked, mark lane `skipped` with a note — do not fabricate metrics.

### reporting
- Run `/client-report` only when data sources are available.
- If blocked, mark lane `skipped`.

### command
- Wait for comms + clients + websites + outreach lanes.
- Run `/am-report` then `/plan-today`.
- Ensure `automation-runs/dillon-command/YYYY-MM-DD/approval-board.md` exists.

## Hard rules

- Never send Slack messages, emails, or deploy anything.
- Never delete vault notes.
- Never auto-execute Tier 1 or Tier 2 actions — board only.
- One PR per cycle. Do not open parallel umbrella PRs.
- P0 tie-break: launch blocked > billing risk > ad disapprovals > calendar.
- KJB emails must CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com.
- Align HCM routes to the full-time lane, never under Momentum 360 revenue.

## Artifacts

`automation-runs/dillon-command/YYYY-MM-DD/`:
- `run-state.json` — lane statuses
- `lane-manifest.md` — parallel worker brief
- `approval-board.md` — ranked P0/P1/P2 for Dillon's one approval

State row: `12_Brain/state/dillon-command.json`
