---
tags: [system, automation, competitive-task]
schedule: "0 13 * * *"
branch: cursor/competitive-task-consolidation-2e9a
---

# Competitive Task Orchestrator — Automation Prompt

Paste this into the Cursor Automation cron (`0 13 * * *` daily, 1:00 PM UTC / 9:00 AM ET).

```
Read AGENTS.md and System/competitive-task-definition.md first.
Then follow .claude/skills/competitive-task-orchestrator/SKILL.md exactly.

You are the umbrella commander. Do NOT run the legacy skills separately —
one orchestrated pass replaces slack-intake, am-report, client-pulse,
plan-today, and inbox-brief.

## Parallel swarm (launch ALL six at once via Task tool)

1. gmail-intel     → .cursor/agents/gmail-intel.md
2. slack-intel     → .cursor/agents/slack-intel.md
3. vault-pulse     → .cursor/agents/vault-pulse.md
4. codex-session-sync → .cursor/agents/codex-session-sync.md
5. domain-ads-seo  → .cursor/agents/domain-ads-seo.md
6. content-routines → .cursor/agents/content-routines.md

Each agent writes its lane artifact to Daily-Briefs/lanes/YYYY-MM-DD-<lane>.md.

## Sequential (after all six complete)

7. memory-consolidator → .cursor/agents/memory-consolidator.md
   Reads all lane artifacts + competitive-task-definition.md P0 tie-break.
   Writes Daily-Briefs/competitive-task-today.md and updates Dashboard.md ## Today.

## Finish

- Write 12_Brain/state/competitive-task-orchestrator.json with run metadata.
- Commit to cursor/competitive-task-consolidation-2e9a (or dated branch).
- Open PR titled "Competitive task YYYY-MM-DD" if code/vault changed.

Hard rules: never send Slack or email, never deploy, never delete vault notes.
Drafts stay in the vault for Dillon's approval.
```
