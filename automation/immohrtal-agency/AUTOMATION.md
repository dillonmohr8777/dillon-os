# Automation contract

## Entrypoint

`Run-ImmohrtalAgencyDaily.ps1` is compatible with the existing hidden-task launcher pattern. It is intentionally **not installed or registered** by this change.

The PowerShell entrypoint:

1. Resolves explicit local input and suppression files.
2. Acquires the named `Global\ImmohrtalAgencyDaily` mutex without waiting.
3. Calls the Node orchestrator with a stable run ID and timestamp.
4. Relies on a second exclusive file lock for cross-entrypoint protection.
5. Reuses a verified completed receipt when the same run ID and input hash are supplied.
6. Both entrypoint layers write a redacted blocked receipt and exit nonzero on ambiguity, overlap, unsafe configuration, malformed input, model failure, or runtime failure.

## State machine

`DISCOVERED -> SCOUT_REVIEWED -> ATLAS_REVIEWED -> FORGE_DRAFTED -> RELAY_DRAFTED -> PROOF_PASSED -> AWAITING_APPROVAL`

Terminal policy branches are `SUPPRESSED`, `DUPLICATE`, and `BLOCKED`. No terminal delivery state exists.

## Agent contracts

| Agent | Kind | Bounded job |
|---|---|---|
| Scout | Maker | Normalize supplied website intelligence and mark unknowns. No browsing. |
| Atlas | Maker | Draft AEO and GEO hypotheses. No rank or AI Overview claims. |
| Forge | Maker | Draft a website, search visibility, and agent-integration scope. No build or publish. |
| Relay | Maker | Package one email draft and queue record. No Gmail or CRM access. |
| Proof | Checker | Validate maker outputs, policy markers, claims language, and closed approval. Never rewrites drafts. |

## Optional literal model lane

`-UseModel` invokes `codex exec` once per eligible prospect, capped at three per run. It is off by default. The invocation is ephemeral, uses the `read-only` sandbox, supplies a strict JSON schema, and explicitly marks the prospect record as untrusted data. Any CLI, authentication, timeout, JSON schema, identity, unexpected tool activity, or deterministic Proof failure blocks the run. The returned analysis augments the four maker stages; it cannot deliver anything and does not replace Proof.

Each accepted model result records the requested model, duration, sandbox, ephemeral mode, output hash, event-log hash, and zero-tool-activity assertion in `run-receipt.json`. The raw final JSON remains local under `model-traces/` for inspection.

## Approval boundary

The gate requires human approval of the exact prospect, recipient, subject, body, and channel. `adapter_handoff_enabled` is hardcoded false in the safe configuration and the application contains no sender. A future approval record must be immutable, fingerprint-bound, and single-use before any delivery adapter is designed.

## Suppression and dedupe

- Per-record `opt_out` and `do_not_contact` flags stop the state machine before any agent runs.
- A suppression file supports exact domain, email, and company matches.
- The active run deduplicates by normalized domain, then email, then company.
- `state/prospect-index.json` retains the normalized keys of locally queued prospects, so later runs stop repeated packages before maker work. The index contains no message bodies or embedded source rows.

## Failure and resume behavior

- Unsafe delivery settings fail before prospect processing.
- A local input must say `requalified_for_immohrtal: true` and cannot carry a Momentum 360 source label.
- Google Drive metadata is discovery-only and cannot be used as row input.
- A completed matching run resumes from its receipt. Partial prospect-level checkpoint resume is not implemented; a blocked partial run must be inspected and restarted with a new run ID.
- The Node lock is removed in `finally`. A machine crash can leave a stale lock; this version fails closed and requires an operator to inspect it before removal. It never auto-deletes a potentially live lock.

## Proposed schedule after review

Use the existing `Run-HiddenScheduledTask.vbs` manifest pattern, once per weekday morning, with the PowerShell file as the only task action. Registration is deliberately left to the parent operator after code review and a decision on the real requalified input location.
