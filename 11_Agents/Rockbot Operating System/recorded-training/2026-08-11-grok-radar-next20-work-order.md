# Grok work order: Prospect Radar Next 20

Status: authorized for bounded local execution
Workflow ID: `grok-radar-next20-20260811`
Step ID: `build-01`
Agent: `Web and Product Builder`
Client: internal Momentum 360 prospecting lane
Human authority: Dillon Mohr
Orchestrator and final verifier: Codex acting as Marketing Chief

## Task

Execute one new 20-site run through the existing Hermes Prospect Radar factory.
Refresh the live Radar through the factory's bounded discovery route, select
exactly 20 globally untouched rebuild candidates, and build their private,
mobile-first concepts using the established batch language. Do not manually
substitute candidates or redesign the accepted factory.

## Canonical route

`C:\Users\dillo\Documents\Codex\projects\dillon-os`

Worker:

`automation\prospect-radar-next20\Run-ProspectRadarNext20Daily.ps1`

Launch from the canonical route with:

`powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File .\automation\prospect-radar-next20\Run-ProspectRadarNext20Daily.ps1`

## Required startup and source locators

- Read the nearest `AGENTS.md` and preserve the dirty worktree.
- Read `automation\prospect-radar-next20\PRODUCT.md`.
- Read `automation\prospect-radar-next20\DESIGN.md`.
- Read `automation\prospect-radar-next20\.impeccable\surfaces\mobile-prospect-homepages.md`.
- Treat `12_Brain\state\radar\registry.json` as the current candidate source.
- Treat `radar-next20-20260810-132149` as the most recent accepted batch baseline.
- Use the selector's global prior-artifact scan. New means absent by both domain
  and slug across all prior Radar, prospect-site, Hermes, and site-factory
  evidence available on this machine.

Codex already repaired the runner's stdout/stderr logging collision. Do not
rewrite the runner or factory unless a new deterministic blocker is found;
return that blocker with evidence instead.

## Constraints

- Append only the expected new run, batch, Radar state, and generated evidence.
- Never discard, reset, overwrite, commit, push, merge, deploy, publish, send,
  create a public destination, mutate CRM, or write canonical queue state.
- Keep every concept private and noindex with `mail_ready=hold`.
- Preserve exact first-party logos and source provenance. Never synthesize or
  redraw a business logo, claim, testimonial, price, outcome, or operating fact.
- Unreachable sources, ambiguous identity, duplicate targets, missing imagery,
  browser errors, accessibility failures, or detector failures must fail closed.
- Use the existing factory's highest approved build effort. Do not change
  subscriptions, billing, provider defaults, credentials, or account settings.

## Acceptance checks

- Exactly 20 selected candidates and zero globally repeated domains or slugs.
- Exactly 20 built private sites and 20 `qa_ready` rows.
- Exactly 80 category-relevant generated editorial assets, four per site, with
  provenance and illustrative disclosure.
- Exact-logo hashes pass for header and closing reveal.
- Browser QA passes at 320, 375, 390, 768, 1024, and 1440 pixels with no
  horizontal overflow, page errors, or console errors.
- Keyboard focus, reduced motion, asset integrity, and noindex checks pass.
- The single required Impeccable detector pass exits cleanly.
- Final state is `complete`; otherwise return `blocked` or `partial` honestly.

## Evidence paths

- `automation\prospect-radar-next20\latest-daily-state.json`
- `automation\prospect-radar-next20\runs\<run-id>\daily-run.log`
- `automation\prospect-radar-next20\runs\<run-id>\SELECTION-EVIDENCE.json`
- `automation\prospect-radar-next20\runs\<run-id>\BUILD-RECEIPT.json`
- `automation\prospect-radar-next20\runs\<run-id>\GENERATED-STOCK-RECEIPT.json`
- `automation\prospect-radar-next20\runs\<run-id>\IMPECCABLE-DETECTOR.json`
- `02_Campaigns\AI Site Builder Outreach Engine\batches\radar-next20-<run-id>`

## Return contract

Return outcome (`complete`, `partial`, or `blocked`), run ID, work performed,
the 20 selected names/domains, exact artifact paths, exact check results,
assumptions and unresolved risks, recommended next owner, approval state, and
`external action attempted = none`.

Budget: 20,000 tokens. Timeout: 2,700 seconds. Independent QA follows in a
separate agent step; Codex owns final acceptance.
