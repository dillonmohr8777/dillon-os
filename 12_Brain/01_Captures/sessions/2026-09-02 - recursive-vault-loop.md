---
note_type: capture
status: unprocessed
created: 2026-09-02
updated: 2026-09-02
source_refs: ["12_Brain/queue/claude-loop-2026-09-02.jsonl", "Daily-Briefs/vault-clean-2026-09-02.md", "Daily-Briefs/wiki-lint-2026-09-02.md"]
tags: [capture, session, agent-infrastructure, vault-hygiene]
---

# 2026-09-02 — Recursive vault loop implementation and hygiene pass (mined)

Commits `8bcbe31e` and `aabd493b` on `cursor/immohrtal-standing-canary-3c2e`. Nothing pushed.

## Decisions

- Decision: the Tier-0 dispatcher is `_os/automation/bin/claude-loop.js` (Node). `System/scripts/Invoke-ClaudeLoop.ps1` is a thin wrapper that keeps the scheduled task, driver, and test suite on the old parameter surface and returns one JSON string so `| ConvertFrom-Json` keeps working.
- Decision: `learn` is a required routine output. A failed stage, or a stage whose state changed since the last checkpoint, is a `lesson` with a stable key; an unchanged run is an explicit `no_finding` that names the comparison. The record lives in the receipt line, never in `earned-lessons.md`. Promotion (two-day recurrence) stays an agent step.
- Decision: `generated_at` is the one timestamp contract for routine and automation state (`12_Brain/schemas/automation-run.json`, required). Older names (`written_at`, `updated`, `updated_utc`, `last_cycle_utc`, `recorded_at_utc`) stay as aliases for existing readers. `queue-status.js` measures staleness from it.
- Decision: the routine lease is a machine-local lock file in the OS temp dir with a 30-minute stale takeover, not a named mutex. Nothing lands in the vault.
- Decision: `.agents/` (the Codex mirror of `.claude/skills/`) stays untracked and is excluded from the graph and link scans like the other tool-harness folders. Not deleted; not mine.
- Decision: 132 duplicate Hermes Gateway approval lines collapsed into one consolidated item (Architecture Proposal A2). Approval queue 200 lines to 69.
- Decision: pages that cite captures which never existed are labelled `verification_status: unverified` with the path kept as plain text. No source is ever invented to close a warning.
- Decision: expired concept notes get `status: expired` so they leave active views until revalidated.

## Mistakes caught

- Mistake: the 2026-08-18 cadence fix never worked. Dedupe keys were week- and month-scoped but the lookup read only today's receipt log, so W04, W09, W10, W11, M02, M03, M04 completed every day from 2026-08-29 and burned 7 of 26 daily slots. Fix: `loadPriorState` reads a 31-day window of receipt logs; breaker failures stay day-scoped. The craft brief's "cadence drift" list was the tell and nobody read it as a bug.
- Mistake: M05 and E05 failed at stage:build every day from 2026-08-27, opening the driver breaker daily. Root cause was not the routines: `Measure-SecondBrainGraph.ps1` threw on a `[[01_Clients/<Client>]]` placeholder link inside the untracked `.agents/` mirror created on 2026-08-26. Fix: guard `GetFileName` and exclude tool-harness folders. The same crash took down `Test-SecondBrain.ps1`.
- Mistake: a PowerShell test used `-notmatch 'ALLOWLIST'` on a file whose comment said "allowlist"; PowerShell matching is case-insensitive by default. Fix: `-cnotmatch`.
- Mistake (mine): a test asserted `'a'.repeat(64)` was "non-hex"; `a` is hex. Fixed to `z`.
- Mistake (mine, twice): a Node script piped through a bash heredoc lost a backslash in a regex and failed with a syntax error. Same trap as the 2026-08-19 earned lesson on layered escaping. Fix: avoid the escape or use the editor.
- Mistake (mine): the first vault-clean brief had no wikilinks and became the graph's only orphan. A report that lives in the vault must link into it.
- Mistake: the `.agents/` word-swap mirror points `operating-team/SKILL.md` at `11_Agents/Codex-operating-team.json`, which does not exist. Reported, not fixed.

## Patterns confirmed

- Pattern: fix the instruments before the content. Two loop bugs made nine routines look drifting and two look broken; the vault content was fine. Health went 38 warnings and 2 graph components to 4 warnings, 1 component, 0 orphans, 0 errors, and almost none of that was content editing.
- Pattern: a fixture execution in a throwaway vault (registry + AGENT_PROTOCOL + scripts + bin/lib copied to a temp dir) exercises all 9 stages, checkpoints, receipts, and dedupe on rerun in about 3 seconds without touching live state. Keep using it for dispatcher changes.
- Pattern: read the receipt log across days before believing a cadence claim. `grep` of completions per day exposed the dedupe leak in one command.
- Pattern: the `.canvas` files are link targets; the health check must index them or the front door warns forever.

## Facts learned

- Fact: the daily driver ran with the new wrapper at 15:38Z and its state now carries `generated_at`; no routine has executed through the Node dispatcher yet because today's budget was 26/26 and the breaker was open. First live evidence lands on 2026-09-03.
- Fact: 348 receipts predate the learn contract and show as "executions without a learn record"; they age out of the 14-day brief window.
- Fact: five state writers manage their own files (`intelligence.js`, `communications.js`, `reports.js`, `aeo-trust.js`, and the hand-written `connector-health.json`); all now set or read `generated_at`.
- Fact: client-truth conflicts exist and are unresolved: Replenish overview `paused` vs operating-status active; Fresh Blends and NKCDC overview `active` vs operating-status paused; operating-status dated 2026-07-19. Roster decision for Dillon (Architecture Proposal A4).
- Fact: six duplicate concept pairs are documented in `Daily-Briefs/wiki-lint-2026-09-02.md` for the synthesis pass; 15 concepts carry `review_on: 2026-09-01`.
- Fact: the Chrome extension was not connected this session; the vault's own screenshot rung (`browser-access.js screenshot`) and a one-shot headless Chrome with `--virtual-time-budget` both work for capturing the HUD.
