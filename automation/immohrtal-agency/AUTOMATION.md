# Automation contract

## Entrypoint

`Run-ImmohrtalAgencyDaily.ps1` remains registered through the hidden-task launcher pattern as `IMMOHRTAL Agency Daily`, but the Windows task was disabled on 2026-08-25 after the current source audit classified its allowlist as `franchise_webinar_excluded`. The active 08:30 Codex heartbeat is the canonical daily IMMOHRTAL loop while company requalification uses the separately governed 47-company source.

The PowerShell entrypoint:

1. Resolves the latest local snapshot only after the source-isolation gate proves it matches the authorized company-requalification Sheet.
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
| Scout | Maker | Fetch the referenced concept, record HTTP/title/H1 evidence, and mark unknowns. |
| Atlas | Maker | Draft AEO and GEO hypotheses. No rank or AI Overview claims. |
| Forge | Maker | Draft a website, search visibility, and agent-integration scope. No build or publish. |
| Relay | Maker | Package one email draft and queue record. No Gmail or CRM access. |
| Proof | Checker | Validate maker outputs, policy markers, claims language, and closed approval. Never rewrites drafts. |

## Optional literal model lane

`-UseModel` invokes `codex exec` once per eligible prospect, capped at three per run. It is off by default. The invocation is ephemeral, uses the `read-only` sandbox, supplies a strict JSON schema, and explicitly marks the prospect record as untrusted data. Any CLI, authentication, timeout, JSON schema, identity, unexpected tool activity, or deterministic Proof failure blocks the run. The returned analysis augments the four maker stages; it cannot deliver anything and does not replace Proof.

Each accepted model result records the requested model, duration, sandbox, ephemeral mode, output hash, event-log hash, and zero-tool-activity assertion in `run-receipt.json`. The raw final JSON remains local under `model-traces/` for inspection.

## Approval boundary

The gate requires human approval of the exact prospect, recipient, subject, body, and channel. `adapter_handoff_enabled` is hardcoded false and the application contains no sender. The Gmail manifest is fingerprint-bound but cannot create or send a message.

## Suppression and dedupe

- Per-record `opt_out` and `do_not_contact` flags stop the state machine before any agent runs.
- A suppression file supports exact domain, email, and company matches.
- The active run deduplicates by normalized domain, then email, then company.
- `state/prospect-index.json` retains the normalized keys of locally queued prospects, so later runs stop repeated packages before maker work. The index contains no message bodies or embedded source rows.

## Failure and resume behavior

- Unsafe delivery settings fail before prospect processing.
- A local input must say `requalified_for_immohrtal: true` and cannot carry a Momentum 360 source label.
- The exact Drive allowlist snapshot is valid for 14 days. Older snapshots block the run until Codex refreshes them through the connected Drive account.
- A completed matching run resumes from its receipt. Partial prospect-level checkpoint resume is not implemented; a blocked partial run must be inspected and restarted with a new run ID.
- The Node lock is removed in `finally`. A machine crash can leave a stale lock; this version fails closed and requires an operator to inspect it before removal. It never auto-deletes a potentially live lock.

## Schedule

The disabled Windows task still points through `Run-HiddenScheduledTask.vbs`, preserving a reversible hidden-launcher route. It must not be re-enabled until the source metadata, live snapshot, suppression contract, and a dry-run receipt all prove the authorized IMMOHRTAL source. The active 08:30 Codex heartbeat creates company-level evidence only and does not send or book.
