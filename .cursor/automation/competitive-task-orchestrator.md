---
# Documentation only — register this automation in Cursor UI (Automations → Scheduled).
# Config-as-code for automations is not yet official; this file is the source of truth.
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
  - morning-loop
prompt_source: System/competitive-task-orchestrator-prompt.md
agents_dir: .cursor/agents/
daily_brief: Daily-Briefs/competitive-task-today.md
---

# competitive-task-orchestrator

See [[04_SOPs/competitive-task-orchestrator]] for full runbook.

**Instructions:** Copy from `System/competitive-task-orchestrator-prompt.md` (section after `---`).

**Phase 1 (parallel):** `ct-inbox-intel`, `ct-gmail-intel`, `ct-slack-intel`, `ct-vault-pulse`, `ct-session-sync`, `ct-ads-seo`, `ct-automation-health`, `ct-content-routines`.

**Phase 2 (sequential):** `ct-consolidator`.

**Windows feeders (keep):** daily-communications-brain (7 AM), Claude daily driver (15m), Prospect Radar (5:20 AM), obsidian-guard-dog (8:30 AM).
