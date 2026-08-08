# Agent Runtime Contract v1

Status: implementation candidate on `codex/agent-runtime-contract-v1`

## Purpose

Give every nontrivial agent run one portable, runtime-neutral execution receipt without creating another queue, approval system, client registry, or brain writer.

The first production adapter is `site-batch`. The contract is plain JSON and Node.js, with no LangChain dependency.

## Authority

- `client-operations` remains authoritative for client identity, work items, approvals, corrections, and canonical mutations.
- Dillon OS owns the portable runtime helper, production skill implementation, fixtures, acceptance registry, and redacted run evidence.
- `agent-run.json` is execution evidence only. It cannot authorize deployment, outreach, publication, spend, or a canonical queue transition.
- Codex remains the final orchestration and verification authority.

## Runtime behavior

The schema is `12_Brain/schemas/agent-runtime-contract-v1.json`. The implementation is `_os/automation/lib/agent-runtime.js`.

Each run:

1. Binds a portable maker `agentId` and separate `verifierAgentId`, then validates the exact trigger identity, client and work-item route, safe source locators, budget, retry limit, and stable item set.
2. Writes the manifest before the first item starts.
3. Writes every update through a validated temporary file and atomic rename while preserving the previous valid manifest revision.
4. Records item attempts, immutable input hashes, status, checkpoints, SHA-256 artifact evidence, verification results, and retryability.
5. Resets an item left `running` by interruption to `pending` on resume.
6. Never reruns `completed`, `blocked`, or `skipped` items.
7. Fails closed if identity, route, source locators, retry policy, item set, or completed input hashes drift during resume.

## `site-batch` adapter

Each batch requires a `runtime` object in `batch.json`. The adapter produces `agent-run.json` next to the existing batch outputs and preserves all current noindex, full visual QA, `qa_ready`, and human `mail_ready` gates.

The interruption fixture kills a two-item batch after item one checkpoints. On resume, item one remains at one attempt, item two resumes at attempt two, and the material site, hub, CSV, and report hashes match an uninterrupted run.

## Production skill acceptance

The registry is `_os/acceptance/registry.json`; run it with:

```powershell
node _os/acceptance/run.js
```

The first registered skills are:

- `site-batch`
- `site-factory`
- `vault-compile`
- `am-report`
- `client-report`

Every record declares fixtures, executable commands, expected files, structural requirements, forbidden patterns, independent review, timeout, and retry limit. `brain-compile` remains deliberately unregistered because it exists in the live brain layout but not the current remote-main layout; registering it before reconciliation would encode the source-of-truth fork.

## Follow-on boundaries

- Reconcile the live `vault-live-2026-08-07` brain layout with remote `main` before porting durable brain notes or PR #268 research.
- Add `brain-compile` to the acceptance registry only after its winning path and behavior are chosen.
- Build the correction compiler in a separate change. It may read normalized corrections through the canonical client-operations script and emit one-way redacted captures, but it may never write the correction ledger or Canonical Queue.
- Retire the older Claude Slack intake in another separate change after the runtime foundation is reviewed.
