---
name: dillon-command
description: One umbrella daily commander — fans out 8 parallel lane agents (comms, clients, intelligence, websites, outreach, ads, reporting, command) and synthesizes a single approval board. Replaces separate morning-loop crons.
---

# Dillon Command Center

One commander. Eight parallel lanes. One push to Dillon.

This is the umbrella workflow that replaces scheduling separate agents for `/slack-intake`, `/am-report`, and `/client-pulse`. It implements the portable half of `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md` and maps Codex lanes A–H from `11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md`.

## When to run

- **Daily cron (weekdays ~6:45 AM ET)** — primary scheduled automation for this repo
- **On demand** — when Dillon drops directives and wants a fresh board
- **After major inbox/Slack activity** — re-run command + comms lanes only if needed

## Bootstrap (deterministic)

```bash
node _os/automation/bin/dillon-command.js
node _os/automation/bin/dillon-command.js --agent-mode --json
```

Writes `automation-runs/dillon-command/YYYY-MM-DD/`:

- `run-state.json` — lane statuses and P0 counts
- `approval-board.md` — ranked one-approval surface
- `tier2-queue.md` — outbound/deploy/spend items (never auto-run)
- `agent-manifest.json` — parallel lane contract for sub-agents

Profile: `_os/automation/profiles/dillon-command.json`

## Commander protocol (L0)

You are the commander. Sub-agents are lane workers. Depth ≤ 3. ≤ 8 concurrent agents.

### Step 0 — Intake

1. Read `AGENTS.md`, `11_Agents/Master Agent.md`, and `System/OS Config.md`.
2. Run the bootstrap CLI above (or read today's existing run folder if already present).
3. Read `Dashboard.md` and any `00_Inbox/slack/` notes with `status: new`.

### Step 1 — Fan out scouts (parallel, Tier 0)

Spawn one worker per lane **in parallel**. Each worker is read-only first.

| Lane | Skills | Scout focus |
|------|--------|-------------|
| **command** | (this skill) | Directives, board, run-state |
| **comms** | `/slack-intake`, `/inbox-brief` | Slack channels (24h), Gmail digest fallback, `00_Inbox/slack/` |
| **clients** | `/client-pulse` | `01_Clients/` movement, due dates, frontmatter gaps |
| **intelligence** | `/research-sweep` | Grok captures, experiment queue, stale research |
| **websites** | `/site-grade`, `/site-factory` prep | Site health, `website-build` Slack asks |
| **outreach** | `/site-batch` prep | Qualify queue, `08_Prospects/` |
| **ads** | `/metrics-pull` | Optimization ledgers, ad-task Slack asks (vault scouts in cloud) |
| **reporting** | `/am-report`, `/client-report` | Daily brief, report due dates |

If Slack MCP is unavailable, comms lane uses vault digest + `00_Inbox/slack/` only — never fabricate messages.

### Step 2 — Synthesize

Merge lane outputs into **one** `approval-board.md`:

- P0 stack using tie-break: launch blocked > billing risk > ad disapprovals > calendar
- Lane status table with evidence paths
- Tier-1 batch candidates (reversible tweaks only)
- Tier-2 queue pointer (never auto-execute)

### Step 3 — Deliver (one push)

**Cloud:** commit to `cursor/dillon-command-YYYY-MM-DD`, open one PR titled `Dillon Command Center YYYY-MM-DD` containing:

- `automation-runs/dillon-command/YYYY-MM-DD/approval-board.md`
- `Daily-Briefs/am-report-YYYY-MM-DD.md` (reporting lane)
- `Daily-Briefs/pulse-today.md` (clients lane)
- `Daily-Briefs/slack-intake-YYYY-MM-DD.md` when comms lane ran
- Updated `Dashboard.md` ## Today (top 3 from board)

**Local 64GB machine:** same artifacts; push becomes phone notification deep-linked to the board.

## Tier rules

- **Tier 0:** read, analyze, draft, build vault files — unattended
- **Tier 1:** reversible platform tweaks — one approval executes the batch for all clients
- **Tier 2:** Gmail send, Slack post, deploy, spend, credentials — prepared only; Dillon executes live

## Hard rules

- Never post to Slack, send email, deploy, or change ad spend without explicit Tier-2 approval per item.
- KJB emails: CC mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com (flag in comms notes).
- Align HCM routes to full-time-job lane, never Momentum 360 revenue.
- One worker per client per lane; never two writers on the same ads account.
- Expired auth → mark `needs-reauth`, keep other lanes running.

## Competitive tasks this subsumes

From vault + Codex session intelligence (compiled, not exhaustive):

| Source | Task cluster | Lane |
|--------|--------------|------|
| Slack open loops (Jason/Sean bots, Melissa training, CallRail, Jenny brand) | Boss/client follow-up | comms |
| Mac site-factory pipeline | Prospect sites + QR/mail activate | outreach + websites |
| Stalled clients (NKCDC, Hardwood, Shadow, Omega) | Revival sweep | clients + comms |
| Book site dead `/api/dossier-leads` | Site health + launch blocker | websites |
| Growth Workshop Aug 27 | Campaign + franchise email engine | outreach + reporting |
| Align SmartCare + SEO blogs | Full-time delivery | command (route Align) |
| 28 Codex automations (Gmail triage, money run, vault dump) | Ported into lanes | all |
| Report factory (Align + ~8 M360) | Monthly HTML reports | reporting |
| Ads ops (Replenish billing, disapprovals, ledger) | Paid media scouts | ads |

## Supersedes

Do **not** schedule these as separate crons anymore:

- `handoffs/Morning Loop Scheduled Agent Setup.md` (3-step morning loop)
- Per-skill daily agents without a commander
- Duplicate daily-orchestrator PR family (see `GROK-HANDOFF-DILLON-OS.md`)

Use `handoffs/Dillon Command Center Scheduled Agent Setup.md` for the single cron prompt.

## References

- Spec: `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`
- Codex lanes: `11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md`
- Concept: `12_Brain/concepts/Dillon Command Center.md`
- Registry: `12_Brain/registry/automations.json` → `dillon-command`
