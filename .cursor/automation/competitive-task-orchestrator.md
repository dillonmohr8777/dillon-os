---
# Register in Cursor → Automations → Scheduled. Source of truth for the umbrella workflow.
automation_name: competitive-task-orchestrator
cron: "0 13 * * *"
timezone: America/New_York
repository: dillon-os
branch: main
replaces:
  - nightly-client-pulse
  - gmail-to-vault-digest
  - vault-integrity-sync
  - chat-to-vault-sync
  - bok-law-social-content
  - linkedin-growth-engine
  - book-site-seo-sweep
  - morning-loop-cloud-automation
prompt_source: System/competitive-task-orchestrator-prompt.md
agents_dir: .cursor/agents/
parallel_phase1:
  - ct-inbox-intel
  - ct-gmail-intel
  - ct-slack-intel
  - ct-vault-pulse
  - ct-session-sync
  - ct-ads-seo
  - ct-automation-health
  - ct-content-routines
phase2:
  - ct-consolidator
daily_brief: Daily-Briefs/competitive-task-today.md
---

# competitive-task-orchestrator

See [[04_SOPs/competitive-task-orchestrator]] for the full runbook.

**Instructions:** copy from `System/competitive-task-orchestrator-prompt.md` (below `---`).

**Phase 1 (parallel):** eight `ct-*` subagents in `.cursor/agents/`.

**Phase 2:** `ct-consolidator` merges lane summaries into one operator brief.
