---
tags: [sop, automation]
last_updated: 2026-06-01
---

# SOP: Competitive Task Orchestrator

## Purpose

One daily automation that keeps Dillon ahead across Gmail, Slack, Obsidian vault, Codex sessions, ads/SEO queues, and scheduled content. Replaces seven separate Cursor crons.

## Schedule

- **Cron:** `0 13 * * *` (1:00 PM America/New_York)
- **Automation name:** `competitive-task-orchestrator`
- **Prompt file:** `.cursor/automation/competitive-task-orchestrator.md`

## Prerequisites

- Vault repo connected to Cursor Cloud Agent
- Gmail MCP + Slack MCP enabled on the automation (recommended)
- Legacy automations **disabled** after three successful runs

## Run steps (operator view)

1. Orchestrator reads `System/competitive-task-orchestrator-prompt.md`
2. **Phase 1:** Five subagents in parallel (Task tool)
3. **Phase 2:** Content routines if Sunday or Thursday
4. **Phase 3:** Memory consolidator writes daily brief + memory sync
5. Git commit + push to vault branch

## Outputs

| File | Purpose |
|------|---------|
| `Daily-Briefs/competitive-task-today.md` | Your single "what matters today" read |
| `System/urgent-replies.md` | Email urgent stack |
| `System/claude-memory-sync.md` | Cross-instance memory |
| `10_Sessions/Automation Debug Log.md` | Run audit trail |

## P0 tie-break

1. Launch blocked
2. Billing risk
3. Ad disapprovals
4. Calendar hard commitments

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Brief says `MCP_FALLBACK` | Connect Gmail/Slack MCP to automation; re-run |
| Stalled section empty | Add `last_touched`, `due`, `next_action` to client frontmatter |
| Duplicate work from old crons | Disable the seven retired routines in Cursor Automations |
| Content missing on Sunday | Confirm `dillon-content-routines` ran; check weekday TZ |

## Retired automations

Do not run alongside the umbrella:

- nightly-client-pulse
- gmail-to-vault-digest
- vault-integrity-sync
- chat-to-vault-sync
- bok-law-social-content
- linkedin-growth-engine
- book-site-seo-sweep

See `System/competitive-task-workflow.md` for architecture.
