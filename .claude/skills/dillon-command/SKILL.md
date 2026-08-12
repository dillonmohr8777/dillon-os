---
name: dillon-command
description: Run the unified Dillon Command Center — one umbrella workflow with parallel lane scouts (comms, clients, intelligence, websites, outreach, ads, reporting) and a single approval board. Replaces separate morning-loop automations.
---

# Dillon Command Center

One commander, parallel scouts, one push. This is the canonical umbrella workflow
for Dillon OS. It subsumes the separate morning loop, individual lane crons, and
duplicate daily-orchestrator PRs into a single contract.

**Contract:** `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`  
**Profile:** `_os/automation/profiles/dillon-command.json`  
**Codex handoff:** `11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md`

## When to use

- Scheduled daily run (cloud cron or 64GB Task Scheduler)
- After a heavy Codex session when you need one ranked board instead of five briefs
- Any time Dillon says "run everything" or "morning loop"

## Phase 0 — Deterministic scaffold (parallel, unattended)

From the vault root:

```bash
node _os/automation/bin/dillon-command.js --agent-mode
```

This runs Tier-0 CLI scouts in parallel (`frontmatter-validate`, `site-health --dry-run`,
`queue-status`), scans vault signals, and writes:

- `automation-runs/dillon-command/YYYY-MM-DD/run-state.json`
- `automation-runs/dillon-command/YYYY-MM-DD/approval-board.md`
- `automation-runs/dillon-command/YYYY-MM-DD/agent-manifest.json`
- `automation-runs/dillon-command/YYYY-MM-DD/evidence-log.md`

## Phase 1 — Parallel lane scouts (Tier 0, fan out)

Read `agent-manifest.json` and spawn one worker per `parallel_lanes` entry. Run these
**in parallel** — they do not share write targets:

| Lane | Agent | Skills | Source |
|------|-------|--------|--------|
| comms | comms-scout | `/slack-intake`, `/inbox-brief` | Slack + Gmail via MCP |
| clients | client-scout | `/client-pulse` | `01_Clients/` |
| intelligence | intel-scout | `/research-sweep` (if triggered) | Grok/xAI registry |
| websites | web-scout | `/site-grade`, `/ux-audit` (on demand) | site factory |
| outreach | outreach-scout | `/site-factory`, `/site-batch` (if queued) | Mac pipeline |
| ads | ads-scout | `/metrics-pull` | `11_Agents/Google Ads Agent.md` |
| reporting | report-scout | `/client-report` | `11_Agents/Reporting Agent.md` |

If Slack MCP is unavailable, comms lane logs `needs-mcp:slack` and continues — do not fabricate messages.

Each worker returns only the worker JSON from the Codex handoff:

```json
{
  "lane": "",
  "client_or_project": "",
  "sources_checked": [],
  "verified_facts": [],
  "artifacts_created": [],
  "draft_or_publish_state": "",
  "blockers": [],
  "approval_required": [],
  "qa_status": "",
  "recommended_next_action": ""
}
```

## Phase 2 — Command synthesis (sequential, after scouts)

The commander lane runs last:

1. `/am-report` — single morning briefing with Boss requests section
2. `/plan-today` — time-blocked plan from Dashboard + brief
3. Merge scout outputs into `approval-board.md` (update ranks, add blockers)
4. Update `Dashboard.md` `## Today` with top 3 priorities

## Phase 3 — One push (cloud)

Commit all artifacts to `cursor/dillon-command-YYYY-MM-DD` and open **one PR**:

> Dillon Command YYYY-MM-DD

Dillon reviews the approval board from his phone. Tier-1 batch executes on one approval.
Tier-2 items stay in `tier2-queue.md` — never auto-executed.

## Parallelism rules (from Codex handoff)

**Safe to parallelize:** read-only scouts, vault scans, draft generation, separate clients,
separate CLI lanes, report extraction from files.

**Single-threaded:** real Chrome UI writes, ads account edits, Gmail draft in same thread,
Slack posting, Netlify production deploys, credential flows.

**Ceilings:** depth 3, ≤8 concurrent lane agents, ≤60 agents/run. `STOP` flag in run folder halts all.

## What this replaces

Do not schedule these as separate daily automations anymore:

- Morning Loop cron that only runs slack-intake + am-report + client-pulse separately
- Duplicate `daily-orchestrator` PR branches
- Per-lane cron without a synthesis step

Keep these as **on-demand** or **machine-local** (not daily umbrella):

- `radar-morning.ps1` — needs real Chromium on Ops Box; outputs feed outreach lane
- `grok-ingest` / `xai-research` — run when envelope exists; intel lane checks state
- `site-factory` batch builds — triggered by approved outreach queue, not every morning

## Hard rules

- Tier 0: read, analyze, draft, QA, build vault artifacts — no gate
- Tier 1: reversible tweaks — one batch approval on the push
- Tier 2: send, post, deploy, spend, credentials — prepared only, Dillon executes live
- Never infer permission from research output
- Align HCM routes to full-time-job lane, never under Momentum 360
