# Dillon Managed Agent Fleet v1

Status: local implementation candidate on `codex/agent-runtime-contract-v1`

## Authority

- The fleet contains exactly fifteen portable agent definitions.
- `marketing-chief` is the only canonical queue writer and final synthesis identity.
- `independent-verifier-release-gate` is the only artifact acceptance identity.
- No agent may directly write the canonical brain or correction ledger, deliver externally, spend, change an account, or access raw secrets.
- `client-operations` remains the canonical client, queue, approval, correction, and execution authority.
- Dillon OS contains runtime-neutral manifests, accepted skills, deterministic validators, and redacted execution evidence.

## Files

- Fleet registry: `12_Brain/registry/agent-fleet.json`
- Agent manifests: `12_Brain/registry/agents/*.json`
- Legacy aliases: `12_Brain/registry/legacy-agent-aliases.json`
- Definition schema: `12_Brain/schemas/agent-definition-v1.json`
- Validator: `_os/automation/bin/validate-agent-fleet.js`
- Tests: `_os/automation/tests/agent-fleet.test.js`

Run:

```powershell
node _os/automation/bin/validate-agent-fleet.js
node --test _os/automation/tests/agent-fleet.test.js
```

## Managed Deep Agents pilot

Four safe scaffolds live under `_os/managed-pilot/`:

- `evidence-market-intelligence`
- `web-product`
- `independent-verifier-release-gate`
- `runtime-watchtower-agent-sre`

They are definitions only. They have no credentials, managed durable memory, channels, schedules, external action tools, or deployment receipt. They accept synthetic or public-source data only and cannot claim deployment.

Every scaffold follows the current Managed Deep Agents single-entry Python layout with `agent.py`, `instructions.md`, `identity.py`, `pyproject.toml`, and local pilot metadata. A later deployment change must install and pin dependencies, add sandbox/tool adapters, run Harbor trials, and record an approved target environment.

## Legacy behavior

Legacy names resolve through `legacy-agent-aliases.json`. An alias is not another runtime identity and owns no run state. `buzz-growth-ops` is deliberately split across Client Success, Paid Media, and CRM. The old Claude Slack intake is a retired writer and routes to the prepare-only Communications Concierge.
