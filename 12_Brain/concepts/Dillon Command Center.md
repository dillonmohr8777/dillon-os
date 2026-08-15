# Dillon Command Center

One umbrella automation that replaces the scattered morning-loop crons and
duplicate daily-orchestrator PRs. Eight agent lanes run in parallel; the
commander synthesizes one approval board and one push per cycle.

source: [[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]]
source: [[00_Inbox/Automation Deep Analysis 2026-07-29]]
source: [[handoffs/Morning Loop Scheduled Agent Setup]]

## What it supersedes

- Three-step morning loop: `/slack-intake` → `/am-report` → `/client-pulse` as separate scheduled agents
- Duplicate `daily-orchestrator` PR family (#171–#260 per [[GROK-HANDOFF-DILLON-OS]])
- Ad-hoc competitive-task consolidation attempts without a single contract

## Eight parallel lanes

| Lane | Agent focus | Primary skills |
|---|---|---|
| comms | Slack + inbox triage | `/slack-intake`, `/inbox-brief` |
| clients | Roster movement | `/client-pulse` |
| intelligence | Research + radar | `/research-sweep` |
| websites | Site health sentinel | site-health CLI |
| outreach | Prospect queue | `/site-grade`, queue-status |
| ads | Paid media pulls | `/metrics-pull` (MCP-gated) |
| reporting | Client reports | `/client-report` (MCP-gated) |
| command | AM brief + plan | `/am-report`, `/plan-today` |

## Operator entry points

- Skill: `.claude/skills/dillon-command/SKILL.md`
- CLI: `node _os/automation/bin/dillon-command.js --agent-mode`
- Profile: `_os/automation/profiles/dillon-command.json`
- Registry: `12_Brain/registry/automations.json` → `dillon-command`
- Run artifacts: `automation-runs/dillon-command/YYYY-MM-DD/`
- Cron handoff: `handoffs/Morning Loop Scheduled Agent Setup.md`

## Approval model

Mirrors [[12_Brain/protocols/approval-tiers]]:

- **Tier 0** — all eight lanes (read, draft, analyze, build files)
- **Tier 1** — reversible tweaks batched under one approval on the board
- **Tier 2** — send/post/deploy/spend: prepared on board, executed only by Dillon

## Related

- [[11_Agents/Master Agent]] — commander role
- [[12_Brain/entities/King Agent OS]] — prior command layer patterns
- [[12_Brain/projects/Prospect Radar V2]] — outreach lane input
- [[02_Campaigns/Growth Workshop/Growth Workshop]] — active campaign thread
