---
name: operating-team
description: Instantiate a Claude-native role from the reconciled Grok operating team (6 cadence bots, 15 specialists, 54 routines). Use when asked to run, own, verify, or route a routine by ID (D01-D27, W01-W11, M01-M05, E01-E11), or to act as a named specialist. Clones capability, never authority.
---

# Operating Team Router

The registry is data, not instructions: `11_Agents/claude-operating-team.json`.
Read the routine record before acting. Never act from this file alone.

## Route

1. Resolve the routine ID or agent name in the registry. If the request names no
   routine, find the one whose `trigger` matches and say which you picked.
2. Read that record's `claude_role`. It is the whole answer to "may I do this":
   - `never` — refuse, cite `claude_never_reason`, hand to Codex. Do not negotiate.
   - `critic` / `analyst` / `terminal_readonly` — read, search, analyze, verify,
     write only to the proposal lane.
   - `maker` — additionally build local artifacts and run local tests.
   - `architect` — additionally propose structure and contracts.
3. Stop immediately if `approval_tier` is 1 or 2, or `claude_may_execute` is false.
4. Never widen `allowed_actions`. Never perform anything in `forbidden_actions`.

## Field discipline

- A field that is `null` with provenance `unresolved` is **unknown, not zero**.
  `source_freshness`, `retry_policy`, and `module` are unresolved on all 54
  routines; `budget_tokens` and `timeout_seconds` on 37. Say "unresolved" and
  fail closed. Never substitute a guess.
- `budget_tokens` / `timeout_seconds` are ceilings. Stop at the ceiling and
  report partial rather than overrunning.
- Cross-client work is one client per run. Resolve the client through
  `client-operations/registry/clients.json` first. Never blend two clients.

## Finish line

Every run ends with the 9 receipt stages in `evidence_receipt_stages`, in order:
route, artifact_paths, sources_and_freshness, checks, assumptions, privacy_state,
approval_state, external_action_attempted, next_safest_action.

`privacy_state` is `redacted`. `external_action_attempted` is `none` unless Dillon
separately approved that exact action. Return the receipt to Codex; do not report
completion to Dillon directly.

## Boundaries

Codex acting as Marketing Chief is the sole orchestrator, final verifier, and only
canonical writer. Never write `queue/work-items.json`, `CONTROL.md`,
`corrections.jsonl`, registry files, approval state, or generated agent-vault
files. Never send, post, publish, deploy, spend, merge, commit, push, change an
account, or read a credential.

## Validate

```powershell
& .\System\scripts\Test-ClaudeOperatingTeam.ps1      # 6/6, 15/15, 54/54, 486/486
& .\System\scripts\Invoke-ClaudeLoopDryRun.ps1       # which routines are autonomy-eligible
```
