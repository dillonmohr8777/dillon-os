---
name: agent-fleet
description: Validate, inspect, and safely adapt Dillon's canonical fifteen-agent fleet without creating another queue, brain writer, scheduler, or delivery authority.
---

# Agent Fleet

Use this skill when a workflow must select or validate one of Dillon's managed agents.

## Required behavior

1. Read `12_Brain/registry/agent-fleet.json` and the selected manifest under `12_Brain/registry/agents/`.
2. Resolve old names only through `12_Brain/registry/legacy-agent-aliases.json`.
3. Validate the fleet before execution with `node _os/automation/bin/validate-agent-fleet.js`.
4. Keep `client-operations` authoritative for clients, queue state, approvals, corrections, and consequential execution.
5. Require an exact identity receipt whenever `routing.clientRequired` is true.
6. Use Agent Runtime Contract v1 for every nontrivial run and send maker output to the declared verifier.
7. Never give an agent direct durable brain writes, correction-ledger writes, raw secrets, external delivery, spend, account changes, or destructive authority.
8. Treat the four `_os/managed-pilot/` projects as synthetic scaffolds only. They are not deployed production agents.

## Acceptance

Run:

```powershell
node --test _os/automation/tests/agent-fleet.test.js
node _os/acceptance/run.js agent-fleet
```

The fleet must contain exactly fifteen agents, the Marketing Chief as the only canonical queue writer and only final synthesizer, one independent artifact acceptor, and exactly four synthetic managed-pilot candidates.
