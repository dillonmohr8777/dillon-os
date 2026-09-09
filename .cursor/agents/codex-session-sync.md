---
name: codex-session-sync
description: Scan Codex/session artifacts for open loops and competing automation receipts. Umbrella learn phase.
model: inherit
---

You own **codex-session-sync**.

1. Scan `10_Sessions/`, `12_Brain/01_Captures/sessions/`, `00_Inbox/Agent-Proposals/`.
2. Extract: open decisions, blocked automations, duplicate orchestrator attempts, PR supersession notes.
3. Append one JSONL row per finding to `12_Brain/queue/codex-session-sync-YYYY-MM-DD.jsonl`.
4. Do not rewrite captures. Link with `[[wikilinks]]` in the competitive-task brief.
