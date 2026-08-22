---
note_type: decision
status: accepted
owner: Dillon Mohr
created: 2026-08-22
updated: 2026-08-22
decided_at: 2026-08-22
review_on: 2026-09-22
source_refs:
  - "[[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]]"
  - "[[handoffs/Morning Loop Scheduled Agent Setup.md]]"
  - "[[12_Brain/03_Concepts/Dillon Command Center]]"
  - "[[.claude/skills/dillon-command/SKILL.md]]"
tags:
  - decision
  - automation
  - orchestration
  - command-center
---

# Unify automation under Dillon Command Center

## Decision

Replace separate morning-loop scheduled agents (slack-intake → am-report →
client-pulse) with **one** umbrella automation: **Dillon Command Center**
(`dillon-command`). It fans out eight parallel agent lanes, synthesizes one
approval board, and writes one AM report per cycle.

## Rationale

- Vault, Codex sessions, Gmail, and Slack all surface **competitive tasks** —
  billing blocks, boss requests, disapproved ads, publish-ready LPs, 207+
  prospect rebuilds, and 180+ approval items — with no single ranked view.
- The 64GB Morning Orchestrator spec already defined the contract: parallel
  scouts → one board → one push → Tier 1 batch on approval.
- Multiple crons caused duplicate briefs, stale Slack intake, and fragmented
  Dashboard updates.

## Implementation

| Artifact | Path |
|----------|------|
| CLI | `_os/automation/bin/dillon-command.js` |
| Library | `_os/automation/lib/dillon-command.js` |
| Profile | `_os/automation/profiles/dillon-command.json` |
| Skill | `.claude/skills/dillon-command/SKILL.md` |
| Registry | `12_Brain/registry/automations.json` id `dillon-command` |
| Cron handoff | `handoffs/Dillon Command Center Scheduled Agent Setup.md` |

## Supersedes

- `handoffs/Morning Loop Scheduled Agent Setup.md` — mark superseded, keep for history
- Rockbot `daily-morning-orchestrator-dry-board` as separate cron (folded into dillon-command)

## Retained separate

1. Claude-Autonomous-Daily-Driver (15m routine gate)
2. Prospect Radar Next 20 (05:20 batch builder)
3. Codex-AgentMemory-VaultSync (hourly)

## Approval boundary unchanged

Tier 0 auto. Tier 1 one morning batch. Tier 2 live only. No send, publish,
deploy, spend, or credential change from the command center without explicit
approval.

## Success criteria

- One `approval-board.md` and `am-report-YYYY-MM-DD.md` per run
- Eight lane results in `lane-results.json`
- Dashboard `## Today` shows top 3 competitive tasks
- Tests pass: `_os/automation/tests/dillon-command.test.js`
