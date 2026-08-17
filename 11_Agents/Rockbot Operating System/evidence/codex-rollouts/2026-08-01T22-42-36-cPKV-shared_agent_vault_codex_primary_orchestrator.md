thread_id: 019fbf7e-5854-7a80-9e8f-9877a86740b9
updated_at: 2026-08-02T00:31:34+00:00
rollout_path: C:\Users\dillo\.codex\sessions\2026\08\01\rollout-2026-08-01T18-42-36-019fbf7e-5854-7a80-9e8f-9877a86740b9.jsonl
cwd: \\?\C:\Users\dillo\Documents\Codex\2026-08-01\do-it-then-coverage-report-verified

# Built and corrected a shared agent-vault workflow

Rollout context: The user said “Do it” after a research radar, authorizing three low-risk local experiments and later asked to turn the architecture sketch into an actual shared vault. Work occurred primarily in `C:\Users\dillo\Documents\Codex\projects\agent-vault` and `...\hermes-control`, with the original workspace used for the experiments.

## Task 1: Execute and verify local experiments

Outcome: success

Key steps:
- Created a 72-hour three-file continuity layer: `hot_context.md`, `daily_note.md`, and `waiting_on_me.md`.
- Installed the pinned `agent-browser` skill from `fcakyon/claude-codex-settings` into a project-local sandbox only; no global activation, hooks, browser runtime, profile, or account changes.
- Built an official MCP TypeScript SDK v2 dual-era test proving legacy initialization and modern `2026-07-28` discovery/negotiation across two round-robin backends without session headers.
- Fixed an aggregate PowerShell verifier bug where harmless npm stderr notices were treated as failures despite exit code 0.
- Final experiment gates passed; npm audit reported zero vulnerabilities.

Reusable knowledge:
- MCP `2026-07-28` removes `initialize`/`Mcp-Session-Id`; use `server/discover`, per-request metadata, and dual-era SDK support.
- Windows PowerShell native stderr can become terminating errors under `$ErrorActionPreference='Stop'`; judge npm by its actual `$LASTEXITCODE`.

## Task 2: Create shared cross-agent vault

Outcome: success

Key steps:
- Created `C:\Users\dillo\Documents\Codex\projects\agent-vault` with global voice, visual identity, preferred stack, model routing, Align HCM project projections, workflow JSON, sync script, and verification script.
- Vault sync projected 15 Align HCM calendar entries, one open canonical work item, queue revision 335, 11 source hashes, and 13 curated skills.
- Verification passed required-file, source-freshness, credential-scan, workflow DAG, budgets, approval gates, and deterministic sync checks.
- Repaired the stale Align brand skill path to verified vault and shipped design sources.
- Registered the vault and Hermes-control workspace in the Codex project index; committed both repositories locally.

## Task 3: Correct orchestration authority

Outcome: success

Preference signals:
- The user challenged the initial hierarchy: “Aren’t you primary orchestrator you’re the end all be all” -> future workflows must treat Codex/Marketing Chief as the primary orchestrator, sole user-facing command center, final synthesis/verification authority, and canonical queue writer.
- The implementation was updated so Hermes is subordinate local runtime infrastructure for execution, continuity, scheduled work, and evidence collection; Claude, Grok, Cursor, and other models are bounded specialists returning evidence to Codex.

Verification:
- Vault and Hermes-control regression suites passed after the authority correction.
- Codex global rules, vault rules, workflow JSON, Hermes-control rules, and shared contract all encode the corrected hierarchy.

References:
- Vault commits: `75b4244` initial baseline, `ef29981` authority correction.
- Hermes-control commits: `be34e51` shared context, `905eab1` subordinate-runtime correction.
- Verification commands: `scripts\\Sync-AgentVault.ps1`, `scripts\\Test-AgentVault.ps1`, `scripts\\Test-ControlPlane.ps1`.
