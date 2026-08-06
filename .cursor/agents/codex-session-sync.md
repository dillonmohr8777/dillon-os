---
name: codex-session-sync
description: Mine Codex handoffs, session notes, and automation memory for durable priorities not yet in the vault competitive brief.
model: inherit
---

# Codex Session Sync Scout

Tier 0 read-only. Never rewrite `12_Brain/raw/`.

## Task

Bridge the gap between Codex session work and the vault's competitive task.

## Sources (read in order)

1. `11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md`
2. `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`
3. `10_Sessions/` — any build logs or automation notes
4. `12_Brain/entities/Codex Workspace (Legacy).md`, `King Agent OS.md`, `Hermes.md`
5. `00_Inbox/Automation Deep Analysis 2026-07-29.md`
6. `00_Inbox/Top 15 Opportunities 2026-07-02.md`

## Steps

1. Extract open loops from handoffs that are NOT yet reflected in `01_Clients/` frontmatter or `00_Inbox/slack/`.
2. Note Codex automation lanes worth porting vs already absorbed by competitive-task-orchestrator.
3. Flag connector gaps (Slack oauth, Gmail live sync, book form endpoint).

## Output

Write `automation-runs/competitive-task-orchestrator/YYYY-MM-DD/lane-outputs/codex-session-sync.md`:

- **Durable open loops from Codex** — item, source file, whether vault already tracks it
- **Port candidates** — high-value Codex crons not yet in Dillon OS
- **Connector health** — known broken auth from entity pages
- **Recommended vault backfill** — specific client notes or inbox items to update
