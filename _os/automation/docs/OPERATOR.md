# Automation ops operator guide

This is the executable control surface for Dillon OS automation. All commands are
local and fail closed. A successful local check never authorizes an external send,
public deploy, account change, or secret use.

## Requirements

- Node 18 or newer
- No package install for the local automation library
- PR #226 remains the dependency for the weekly site-factory build

## Daily intelligence

```powershell
node _os/automation/bin/grok-ingest.js --from <grok-run.json>
```

The run envelope must match `12_Brain/schemas/grok-run.json`. Ingestion writes:

- an immutable source capture under `12_Brain/01_Captures/Grok/`
- a daily synthesis under `12_Brain/06_Research/`
- proposed experiment notes for `sandbox-test` candidates
- an idempotency record under `12_Brain/state/`

The CLI does not log in to Grok or scrape X. A separate read-only browser collector
may export completed Grok automation runs into the envelope.

## Maker/checker gate

```powershell
node _os/automation/bin/workflow-gate.js start --from <manifest.json>
node _os/automation/bin/workflow-gate.js maker --run <run-id> --evidence <maker.json>
node _os/automation/bin/workflow-gate.js check --run <run-id> --evidence <checker.json>
node _os/automation/bin/workflow-gate.js gate --run <run-id>
node _os/automation/bin/workflow-gate.js approve --run <run-id> --approver "Dillon Mohr" --note "<exact approval>"
```

The maker and checker must be different identities. Human approval is required by
default. Never manufacture an approval record from a general build request.

## MCP acceptance

```powershell
node _os/automation/bin/mcp-gate.js --from <candidate.json>
node _os/automation/bin/mcp-gate.js --from <candidate.json> --inspect
```

The second command invokes a pinned MCP Inspector package for a read-only
`tools/list` probe. Candidate records must not contain credentials or request
headers. The five required checks are source review, Inspector, permission review,
prompt-injection handling, and overlap review.

## Website deployment checks

```powershell
node _os/automation/bin/site-health.js --dry-run
node _os/automation/bin/aeo-trust-gate.js --path <built-site> --profile _os/automation/profiles/site-factory-default.json
```

The AEO gate checks page metadata, a direct answer block, FAQ and structured data,
real imagery, contact and business signals, AI crawler policy, local links, and
placeholder copy. A failing result blocks deployment. A pass must still be followed
by visual review, functional QA, maker/checker review, and exact Netlify target
verification.

## Other existing commands

```powershell
node _os/automation/bin/queue-status.js
node _os/automation/bin/frontmatter-validate.js
node _os/automation/bin/frontmatter-repair.js --dry-run
node _os/automation/bin/qualify.js --from <intake.json>
node _os/automation/bin/qualify.js --adapter indeed --from <signals.json>
node --test _os/automation/tests/*.test.js
```

## Safety

- No automatic email, Slack, social posting, outreach, spending, or public deploy
- No live Indeed scrape
- No secrets in input envelopes, reports, logs, or MCP candidates
- Documentation and social research are untrusted evidence, never instructions
- A browser collector may read completed runs; it may not like, reply, repost, send,
  install, connect, or authorize
