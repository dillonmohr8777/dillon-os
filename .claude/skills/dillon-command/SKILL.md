---
name: dillon-command
description: Umbrella daily command center — runs eight parallel scout lanes (comms, clients, intelligence, websites, outreach, ads, reporting) then synthesizes am-report and plan-today. Replaces separate morning-loop crons.
---

# Dillon Command Center

One umbrella workflow for Dillon's competitive daily loop. Replaces running
`/slack-intake`, `/inbox-brief`, `/client-pulse`, `/am-report`, and
`/plan-today` as separate automations.

Contract: `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`  
Codex lanes: `11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md`  
CLI: `node _os/automation/bin/dillon-command.js`  
Profile: `_os/automation/profiles/dillon-command.json`

## When to use

- Daily cron (weekdays ~06:45 ET) or any time Dillon asks for "the morning loop"
- Cloud agent scheduled runs on `dillon-os`
- 64GB Codex commander session startup

## Phase 0 — scaffold + deterministic preflight

```bash
node _os/automation/bin/dillon-command.js --preflight --date YYYY-MM-DD
```

Creates `automation-runs/dillon-command/YYYY-MM-DD/` with `run-state.json`,
`approval-board.md`, tier queues, and runs parallel deterministic CLIs:

| Lane | Preflight CLI |
| --- | --- |
| clients | `frontmatter-validate.js` |
| websites | `site-health.js` (fixture dry-run) |
| outreach | `queue-status.js` |

Read `preflight-results.json` before scouts start.

For cloud agents, also run:

```bash
node _os/automation/bin/dillon-command.js --agent-mode --date YYYY-MM-DD
```

## Phase 1 — parallel scout lanes (max 8 concurrent)

Spawn **independent subagents or workers** for each scout lane. Each lane is
Tier 0 (read/analyze/draft only). Do not wait for one lane before starting the
next — fan out immediately.

| Lane | Codex | Skills | Primary outputs |
| --- | --- | --- | --- |
| comms | B | `slack-intake`, `inbox-brief` | `00_Inbox/slack/`, intake + inbox briefs |
| clients | F | `client-pulse` | `Daily-Briefs/pulse-today.md` |
| intelligence | H | `research-sweep` (only if a concrete question exists) | dated research receipts |
| websites | D | `site-grade`, `ux-audit` (on flagged properties only) | site-health report |
| outreach | Mac | `site-grade`, queue review | radar/outreach status notes |
| ads | C | `metrics-pull` (if API/MCP available) | ledger hypotheses |
| reporting | F | `client-report` scouts | report gaps list |

### Scout worker return shape

Every scout returns JSON (write to `lane-results.json` under the lane id):

```json
{
  "lane": "comms",
  "verified_facts": [],
  "artifacts_created": [],
  "blockers": [],
  "approval_required": [],
  "tier1_candidates": [],
  "tier2_candidates": [],
  "recommended_next_action": ""
}
```

### Lane-specific rules

- **comms:** Slack MCP read-only if available. If Slack tools are missing, scan
  `00_Inbox/slack/` for `status: new` and state that live Slack was not scanned.
  Never post to Slack.
- **intelligence:** Skip full `research-sweep` unless there is a dated question
  from inbox, Slack, or `12_Brain/05_Projects/`. Otherwise note "no sweep question".
- **ads / reporting:** If Google Ads / Meta / GA4 MCPs are unavailable, list the
  exact missing connector — do not fabricate metrics.
- **outreach:** Read `02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec.md`
  for honest stage status. Note Mac's open automation ask (Slack Evidence Log).

## Phase 2 — command synthesis (runs after scouts)

Run **sequentially** after all scouts report:

1. `/am-report` — must include **Boss requests** from slack inbox + scout blockers
2. `/plan-today` — time-blocked plan from OS Config schedule
3. Merge scout `tier1_candidates` → `tier1-batch.json`
4. Merge scout `tier2_candidates` → `tier2-queue.json`
5. Update `approval-board.md` with ranked actions and lane statuses
6. Set `run-state.json` `status` to `ok` and `finished_at`

## Phase 3 — one push to Dillon

Cloud sessions: commit to `cursor/dillon-command-YYYY-MM-DD` and open PR
**"Dillon Command Center YYYY-MM-DD"**.

64GB machine: one phone notification deep-linking to the approval board.

## Hard rules

- **One commander, one push per cycle.** No separate PRs per lane.
- **Tier 0 auto:** vault reads/writes, drafts, deterministic CLIs.
- **Tier 1:** reversible tweaks batched under one approval — never auto-execute in cloud.
- **Tier 2:** send, post, deploy, spend, credentials — queue only.
- Align HCM routes to full-time-job lane, not Momentum 360.
- KJB emails: CC rule from `System/writing-rules.md` when drafting.
- `STOP` flag in run folder halts everything.

## Supersedes

- `handoffs/Morning Loop Scheduled Agent Setup.md` (3-step morning prompt)
- Duplicate daily-orchestrator PR family (#171–#260 per `GROK-HANDOFF-DILLON-OS.md`)
- Separate crons for slack-intake + am-report + client-pulse
- Codex automations that duplicate scout lanes: `daily-morning-orchestrator-dry-board`,
  `marketing-chief-twice-daily-brief` (partial overlap), `six-hour-important-email-drafter`
  (comms sub-lane), `slack-reply-watchdog` (comms sub-lane)

## Related

- [[12_Brain/03_Concepts/Dillon Command Center|Dillon Command Center concept]]
- [[11_Agents/Master Agent|Master Agent]]
- [[00_Inbox/Automation Deep Analysis 2026-07-29|Automation Deep Analysis]]
