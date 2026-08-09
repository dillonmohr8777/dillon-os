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
9. Distinguish static fleet validation, deterministic contract simulation, and real model-role execution. Passing either of the first two does not prove open-ended agent capability.

## Synthetic Fleet Contract Simulation

Use the local muster before any hosted or client-data pilot:

1. Use only a fixture marked `synthetic: true` and keep every artifact under the explicit muster output directory.
2. Run the dependency waves with no more than three concurrent roles and no delegation deeper than one level.
3. Create one Agent Runtime Contract v1 receipt per registered agent and pass the exact synthetic identity receipt to every client-routed role.
4. Require each role to detect or safely contain its assigned seeded traps and record source locators, artifact hashes, configured budgets, approval state, and acceptance results.
5. Have the Independent Verifier read back maker artifacts without editing them. Have Runtime Watchtower observe receipts without restarting work or advancing state.
6. Let Marketing Chief synthesize only independently accepted artifacts. Do not write the synthetic result into the canonical queue, brain, correction ledger, or client systems.
7. Treat token limits as configured-only until the runtime can measure actual model consumption.

## Acceptance

Run:

```powershell
node --test _os/automation/tests/agent-fleet.test.js
node --test _os/automation/tests/fleet-muster.test.js
node _os/acceptance/run.js agent-fleet
node _os/acceptance/run.js fleet-muster
```

The fleet must contain exactly fifteen agents, the Marketing Chief as the only canonical queue writer and only final synthesizer, one independent artifact acceptor, and exactly four synthetic managed-pilot candidates. The deterministic simulation must cover all fifteen roles, detect every seeded trap, preserve the hard authority boundaries, recompute artifact evidence, and produce a clearly labeled contract scorecard. Real role execution requires separate model outputs and independent readback.
