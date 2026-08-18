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

### Direct xAI X Search collector

The production collector uses xAI's Responses API with `x_search` and optional
`web_search`, then feeds the same immutable ingestion path:

```powershell
& _os/automation/bin/xai-research.ps1 `
  -Profile _os/automation/profiles/daily-x-research.json `
  -Out _os/automation/incoming/grok/daily-x-research.json `
  -Ingest
```

The wrapper decrypts the current-user DPAPI secret only into the child process
environment and removes `XAI_API_KEY` afterward. The repository stores only the
non-secret Access Broker locator
`dpapi-bootstrap://xai/dillon-os/daily-x-search`. The key is chat-only, rate
limited, and rotated on its expiry date.

Use `-DryRun` to inspect the request without using credits or requiring a key.
The collector records citations, tool-call types, response ID, token usage, and
exact USD cost without logging the credential. The default profile asks the
model to stay within 12 X searches, 4 web searches, and 4,500 output tokens.

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

For every `workflow_type=website_factory` manifest:

- `demo_recording_path` is required and must be one of the hashed artifact paths
- the maker must provide a complete screen-recorded desktop and mobile walkthrough
- the independent checker must confirm `demo_reviewed=true`
- `visual_review.verdict`, `visual_review.summary`, and at least two reviewed viewports
  are required
- an overall pass is impossible when the visual review fails

## Dillon development environment prototype

```powershell
& _os/dev/bin/dillon-dev.ps1 doctor
& _os/dev/bin/dillon-dev.ps1 verify
```

The prototype uses an isolated fixture workspace, an explicit command allowlist, three
repo-local skills, and a fail-closed doctor. `verify` runs only declared commands without
shell expansion. It never installs, deploys, opens a browser, or reads a secret.

## MCP acceptance

```powershell
node _os/automation/bin/mcp-gate.js --from <candidate.json>
node _os/automation/bin/mcp-gate.js --from <candidate.json> --inspect
```

The second command invokes a pinned MCP Inspector package for a read-only
`tools/list` probe. Candidate records must not contain credentials or request
headers. The five required checks are source review, Inspector, permission review,
prompt-injection handling, and overlap review.

### LandingFolio design reference

`https://mcp.landingfolio.com/mcp` refuses every anonymous call, so the generic
`--inspect` flag cannot probe it and the candidate sits at **sandbox-only** with the
Inspector check pending. To finish the gate, mint a free token at
`https://www.landingfolio.com/mcp`, put it in the environment, and run:

```powershell
$env:LANDINGFOLIO_TOKEN = '<token>'
node _os/automation/bin/landingfolio-verify.js
```

The wrapper resolves the token into a short-lived Inspector config outside the
repository, deletes it in a `finally`, and refuses to leave the review in place if
the artifacts contain the token or trip the public-safety scanner. Minting and
supplying the token is a Tier 2 operator action; no agent may do it.

The same variable drives the committed wiring in `.cursor/mcp.json` and `.mcp.json`.
Both are inert until the variable is set, and the design skills treat the tools as
optional, so an unset variable degrades to harvest-only design rather than failing.

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

## System heartbeat

```powershell
node _os/automation/bin/heartbeat.js
node _os/automation/bin/heartbeat.js --as-of 2026-08-17 --no-write --json
node _os/automation/bin/heartbeat.js --definitions <dir-or-toml> --no-write
```

One command that fails the run when a power is ungoverned. Exit `0` on clean or
advisory-only, `2` on unresolved critical, `1` on crash. It does not send,
deploy, or enqueue. Generated `12_Brain/state/heartbeat.json` and
`Daily-Briefs/heartbeat-manifest.md` are gitignored.

### Honest degradation

A skipped check must never render as a pass. If the scheduler source is missing,
`missing-registration` and `shadow-duplicate` do not run, the manifest Coverage
section marks `scheduler: absent`, and the headline says so — it will not say
"No ungoverned power." Absence of evidence is not evidence of health.

### Scheduler source (`automation.toml`)

Those two checks read the Windows scheduler, whose truth is `automation.toml`
(not a directory of `.md`/`.json` files). `--definitions` accepts a directory or
a `.toml` file. When the flag is omitted, the heartbeat searches:

- `automation.toml`
- `_os/automation/automation.toml`
- `_os/scheduler/automation.toml`
- `12_Brain/registry/automation.toml`

The reader is a zero-dependency subset: tables, array-of-tables, dotted keys,
strings, booleans, numbers. ACTIVE unregistered routines are critical; PAUSED
are not. Sibling directories named `<id>-<12 hex chars>` are shadow copies —
advisory, not extra criticals.

Until that file is visible, this checkout can only govern the vault half
(registry, bins, GitHub workflows). Point `--definitions` at the ops-box
scheduler directory to see the rest.

### Registry `tier` is a declaration, not a control

Nothing in `_os/` reads `automations.json` `tier` as a runtime gate. Registering
an entry at `tier: 2` adds visibility, not a permission check.
`radar-morning.ps1` still pushes daily with nothing in the path asking. Radar's
`--max-tier` / site-grader `tier` are audit depth (cheap HTTP vs Playwright
render) and are a different word. Visibility before enforcement is the right
sequence; do not read `tier: 2` as a block.

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
