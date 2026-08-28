---
# Documentation only — register this automation in Cursor UI (Automations → Scheduled).
# Config-as-code for automations is not yet official; this file is the source of truth.
automation_name: competitive-task-orchestrator
cron: "0 13 * * *"
timezone: America/New_York
repository: dillon-os-vault
branch: main
replaces:
  - nightly-client-pulse
  - gmail-to-vault-digest
  - vault-integrity-sync
  - chat-to-vault-sync
  - bok-law-social-content
  - linkedin-growth-engine
  - book-site-seo-sweep
prompt_source: System/competitive-task-orchestrator-prompt.md
agents_dir: .cursor/agents/
daily_brief: Daily-Briefs/competitive-task-today.md
---

# competitive-task-orchestrator

See [[04_SOPs/competitive-task-orchestrator]] for full runbook.

**Instructions:** Copy from `System/competitive-task-orchestrator-prompt.md` (section after `---`).

**Subagents:** `gmail-intel`, `slack-intel`, `vault-pulse`, `codex-session-sync`, `domain-ads-seo`, `content-routines`, `memory-consolidator`.
