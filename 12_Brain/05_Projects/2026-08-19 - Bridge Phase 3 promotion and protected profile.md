---
note_type: project
status: active
created: 2026-08-19
updated: 2026-08-19
owner: Dillon Mohr
client: Bridge Software Development
area: product
priority: high
outcome: Create and My Profile run the Phase 3 Promotion + protected-profile slice against a typed adapter, with contract tests green.
next_action: Review the prototype branch, then approve or reject a noindex Netlify update of the unified review URL.
due: 2026-08-22
review_on: 2026-08-22
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge Phase 3 is the current product lane]]"
  - "[[12_Brain/04_Decisions/2026-08-19 - Bridge Phase 3 slice is open]]"
  - "[[01_Clients/Bridge Software Development/overview]]"
tags:
  - brain
  - project
  - bridge-software
---

# Bridge Phase 3 promotion and protected profile

## Finish line

`/create` publishes a targeted Promotion through claims, upload intent, and audience rules. `/my-profile` loads public vs protected projections and records 90-day contact confirmation. Contract tests, typecheck, lint, and production build pass.

## Why now

The five-route Phase 2 frontend is live. The backlog already named this slice as Phase 3. The team was told to move forward.

## Current state

Implemented locally in `dillonmohr8777/bridge-discovery-prototype` on branch `cursor/phase-three-vertical-slice-acda`. Direct push from this cloud agent was denied (`cursor[bot]` has no write on that repo). Apply `01_Clients/Bridge Software Development/phase3-vertical-slice.patch` or `/opt/cursor/artifacts/bridge_phase3_vertical_slice.patch` on a machine with write access.

- Typed contract in `lib/phase3/`
- In-memory adapter by default
- HTTP client behind `NEXT_PUBLIC_BRIDGE_API_BASE`
- Create and My Profile journeys wired to the adapter
- `npm run test:phase3` — 8 passed
- typecheck, lint, and `next build` passed

Live API bind and Netlify update are not done.

## Next actions

- [x] Open the Phase 3 slice in the canonical frontend repo
- [ ] Push or apply `phase3-vertical-slice.patch` to `dillonmohr8777/bridge-discovery-prototype`
- [ ] Review the prototype PR
- [ ] Approve or reject the unified noindex Netlify update
- [ ] Bind `NEXT_PUBLIC_BRIDGE_API_BASE` only after Miraj's staging origin is inspectable

## Decisions

- [[12_Brain/04_Decisions/2026-08-19 - Bridge Phase 3 slice is open]]

## Evidence and artifacts

- https://github.com/dillonmohr8777/bridge-discovery-prototype
- https://bridge-connected-signal.netlify.app
- `/opt/cursor/artifacts/bridge_phase3_verification.log`

## Closeout

- Result: frontend Phase 3 slice implemented; deploy still gated
- Verification: 8 contract tests, typecheck, lint, production build
- Durable lesson: current Slack plus the repo backlog outrank stale Phase 1 close language in the vault
