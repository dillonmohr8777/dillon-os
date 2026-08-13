---
tags: [handoff, automation, slack]
updated: 2026-08-13
supersedes: three-step morning loop (slack-intake + am-report + client-pulse)
canonical: .claude/skills/dillon-command/SKILL.md
---

# Morning Loop: Dillon Command Center (Unified)

**One automation replaces the old 3-step morning loop.** The Dillon Command Center
runs eight parallel lane agents under one commander, then opens a single PR with
the approval board and morning briefing.

Concept: [[12_Brain/concepts/Dillon Command Center|Dillon Command Center]]
Contract: `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`

## One-time setup (Dillon, ~3 minutes)

1. Go to [cursor.com/agents](https://cursor.com/agents) and confirm the Slack integration is connected.
2. Create **one** scheduled agent on the `dillon-os` repo, weekdays at **6:45 AM ET**.
3. Paste the prompt below.
4. **Disable** any older separate crons for slack-intake, am-report, or client-pulse.

## The prompt to paste

```
Read AGENTS.md at the repo root first. Then follow
.claude/skills/dillon-command/SKILL.md exactly — this is the umbrella workflow.

Initialize:
  node _os/automation/bin/dillon-command.js --init

Phase 1 — spawn eight parallel lane subagents (Tier 0, read/draft only):
  comms: /slack-intake + /inbox-brief
  clients: /client-pulse
  intelligence: /research-sweep (only if research stale >7d)
  websites: node _os/automation/bin/site-health.js --dry-run
  outreach: node _os/automation/bin/queue-status.js + outreach status brief
  ads: /metrics-pull
  reporting: /client-report (when JSON data exists)
  (command lane waits for scouts)

Phase 2 — commander synthesis:
  /am-report then /plan-today
  node _os/automation/bin/dillon-command.js --board
  node _os/automation/bin/dillon-command.js --finalize
  Update Dashboard.md ## Today with top 3 priorities

Commit to cursor/dillon-command-YYYY-MM-DD and open one PR:
  "Dillon Command YYYY-MM-DD"

Hard rules: never send Slack or email, never deploy, never delete vault notes.
One PR per cycle. KJB CC rule per System/writing-rules.md.
```

## What lands in the vault each morning

- `automation-runs/dillon-command/YYYY-MM-DD/run-state.json` — lane statuses
- `automation-runs/dillon-command/YYYY-MM-DD/approval-board.md` — ranked board
- `00_Inbox/slack/` — classified boss/client requests
- `Daily-Briefs/am-report-YYYY-MM-DD.md` — morning briefing
- `Daily-Briefs/plan-YYYY-MM-DD.md` — time-blocked plan
- `Daily-Briefs/pulse-today.md` — client pulse
- `Daily-Briefs/site-health-report.md` — property checks
- Updated `## Today` in `Dashboard.md`

## Extending the loop

- Website asks classified as `website-build` feed `/site-factory`. Reply "build it" on the PR.
- Add MCPs (Gmail, Google Ads, GA4) in Cursor Dashboard → Integrations to widen scout visibility.
- On the 64GB Codex machine, same contract — push is a phone notification instead of a PR.

## What this replaces

| Old | New |
| --- | --- |
| 3-step morning cron | One `dillon-command` cron |
| 30+ daily-orchestrator PRs | One PR per cycle |
| Separate skill invocations | Eight parallel lanes under one commander |
