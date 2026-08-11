---
name: stack-sync
description: Compare an explicitly approved routing proposal with live choice points, draft reversible diffs, and apply only in a separate approval turn. Usage - /stack-sync.
---

# Stack Sync

The public vault is evidence, not machine authority. This skill reconciles an
explicitly approved proposal with live configuration while preserving the
Codex/Marketing Chief authority boundary.

## 1. Preconditions

Read `AGENTS.md`, `12_Brain/System/Intelligence Ops.md`, the current Model
Roster, and the exact proposal Dillon approved. If the approval is absent,
ambiguous, stale, or for a different file set, stop after inventory.

Validate the intended account, route availability, provider health, billing
mode, and current file contents. Never read auth files, tokens, cookies, `.env`,
browser profiles, or password-vault contents.

## 2. Inventory read-only choice points

Inspect only the authorized files named by the proposal, such as project
workflows, agent specs, or non-secret model defaults. Global Codex, Claude,
Hermes, Grok, or provider configuration changes always require exact file-level
approval and must not be inferred from the roster.

## 3. Draft reversible diffs

Write one old-to-new diff and rollback note per file under
`12_Brain/private/proposals/stack-sync-<run-id>.md`. Include the evidence,
health check, billing mode, and acceptance command. Apply nothing in this turn.

## 4. Separate apply turn

Only a new explicit approval for the displayed files authorizes application.
Apply one file at a time, reread the exact line, run its acceptance check, and
stop on drift or failure. Pushing a repository branch, changing a provider,
creating a schedule, or changing paid routing needs its own explicit scope.

Append an Upgrade Log entry only after a change has actually been applied and
verified. Return applied, skipped, failed, and still-pending files separately.
