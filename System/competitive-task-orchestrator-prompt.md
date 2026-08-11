---
tags: [system, automation, cursor]
updated: 2026-08-09
---

# Competitive Task Orchestrator — Cursor Automation Prompt

Paste this into the Cursor Automation that replaces all legacy morning/pulse/Gmail crons.
Schedule: `0 13 * * *` (daily).

```
Read AGENTS.md and System/competitive-task-definition.md first.

Run the umbrella competitive task loop per
.claude/skills/competitive-task-orchestrator/SKILL.md:

Phase 0 (shell):
  node _os/automation/bin/frontmatter-validate.js
  node _os/automation/bin/site-health.js --dry-run
  node _os/automation/bin/command-loop.js plan

Phase 1 (parallel Task subagents — launch ALL at once):
  gmail-intel, slack-intel, vault-pulse, codex-session-sync,
  domain-ads-seo, content-routines
  Each reads .cursor/agents/<lane>.md

Phase 2 (sequential after Phase 1):
  memory-consolidator per .cursor/agents/memory-consolidator.md

Commit to cursor/competitive-task-YYYY-MM-DD and open a PR titled
"Competitive task YYYY-MM-DD".

Hard rules: read/draft only; never send Slack or Gmail; never deploy;
never delete vault notes.
```

## Legacy crons to disable after 3 green runs

1. morning-loop-slack-am-pulse
2. nightly-client-pulse
3. gmail-to-vault-digest
4. vault-integrity-sync
5. chat-to-vault-sync
6. bok-law-social-content
7. linkedin-growth-engine
8. book-site-seo-sweep
