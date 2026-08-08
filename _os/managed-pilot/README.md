# Managed Deep Agents synthetic pilot scaffolds

These four projects compile the approved pilot subset of `12_Brain/registry/agent-fleet.json` into the current Managed Deep Agents single-entry Python layout.

They are intentionally **not deployed**. They contain no `.env`, credentials, durable memory, channels, schedules, custom tools, client data, or external-action capability. `identity.py` defines service authentication but contains no key.

Before any deployment:

1. Reconcile and land Agent Runtime Contract v1.
2. Pin and lock reviewed dependency versions.
3. Add only synthetic tool and sandbox adapters.
4. Compile acceptance-registry cases into Harbor tasks.
5. Pass interruption, resume, duplicate, identity, budget, permission, prompt-injection, and verifier-separation trials.
6. Record the exact approved LangSmith workspace and deployment target.

Run the local static gate:

```powershell
node _os/automation/bin/validate-agent-fleet.js
```
