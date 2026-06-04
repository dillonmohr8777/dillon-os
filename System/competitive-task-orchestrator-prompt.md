---
aliases: [competitive-task, dillon-os-daily]
tags: [system, automation, prompt]
---

# Competitive Task Orchestrator — Automation Prompt

Paste this into your Cursor automation prompt field (cron `0 13 * * *` UTC):

```
Run the dillon-os-orchestrator skill end-to-end.

Phase 0: Read System/claude-memory-sync.md, System/urgent-replies.md, Daily-Briefs/pulse-today.md, 01_Clients/Client Index.md.

Phase 1: Launch parallel Task sub-agents using prompts in .cursor/agents/:
- comms-agent.md (always)
- pulse-agent.md (always)
- vault-agent.md (always)
- ops-agent.md (always)
- content-agent.md (only if Sunday or Thursday, or client due today)

Phase 2: Merge into Daily-Briefs/pulse-today.md, update System/urgent-replies.md and System/claude-memory-sync.md, log to 10_Sessions/Automation Debug Log.md.

Phase 3: Git commit: "Dillon OS orchestrator: daily run YYYY-MM-DD"

P0 tie-break: launch blocked > billing at-risk > ad disapprovals > hard calendar.
Follow System/writing-rules.md. Enable Gmail and Slack MCP when available.
```

Full spec: [[System/dillon-os-orchestrator]]
