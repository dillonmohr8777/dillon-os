---
note_type: project
status: active
created: 2026-08-19
updated: 2026-08-19
owner: Dillon Mohr
client: Bridge Software Development
area: product
priority: high
outcome: Create and My Profile run the Phase 3 Promotion + protected-profile slice against a typed adapter on the Connected purple Phase 1/2 five-route product, with contract tests green.
next_action: Review draft PR #6 internally. Republish the unified URL to Connected purple only when Dillon asks. Do not Slack, email the client, or bind a live API.
due: 2026-08-22
review_on: 2026-08-22
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge Phase 3 is the current product lane]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge Phase 3 hold on Slack and client send]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge restore Connected purple on Phase 1-2 product]]"
  - "[[12_Brain/04_Decisions/2026-08-19 - Bridge Phase 3 slice is open]]"
  - "[[12_Brain/04_Decisions/2026-08-19 - Bridge unified review stays Connected purple]]"
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

Draft PR is on GitHub: https://github.com/dillonmohr8777/bridge-discovery-prototype/pull/6 (`cursor/phase-three-vertical-slice-acda`). Visual default is Connected purple on the same five-route product. Dillon instructed not to Slack or send anything to the client. Live Netlify is still Trusted Current until he republishes.

- Typed contract in `lib/phase3/`
- In-memory adapter by default
- HTTP client behind `NEXT_PUBLIC_BRIDGE_API_BASE` (unset)
- Create and My Profile journeys wired to the adapter
- Host script forces `data-theme="network"` on `bridge-connected-signal.netlify.app`
- `npm run test:phase3` — 20 passed
- typecheck, lint, and production build passed

Live API bind is not done. Unified URL republish is queued, not performed.

## Next actions

- [x] Open the Phase 3 slice in the canonical frontend repo
- [x] Open draft PR https://github.com/dillonmohr8777/bridge-discovery-prototype/pull/6
- [ ] Review the prototype PR internally
- [ ] Hold Slack and client email until Dillon asks
- [ ] Republish https://bridge-connected-signal.netlify.app from PR #6 as Connected purple when Dillon asks
- [ ] Bind `NEXT_PUBLIC_BRIDGE_API_BASE` only after Miraj's staging origin is inspectable

## Decisions

- [[12_Brain/04_Decisions/2026-08-19 - Bridge Phase 3 slice is open]]
- [[12_Brain/04_Decisions/2026-08-19 - Bridge unified review stays Connected purple]]

## Evidence and artifacts

- https://github.com/dillonmohr8777/bridge-discovery-prototype/pull/6
- [[12_Brain/01_Captures/2026-08-19 - Bridge Phase 3 hold on Slack and client send]]
- [[12_Brain/01_Captures/2026-08-19 - Bridge restore Connected purple on Phase 1-2 product]]
- https://bridge-connected-signal.netlify.app (still teal until republish)
- `/opt/cursor/artifacts/localhost_connected_purple_home.png`

## Closeout

- Result: frontend Phase 3 slice implemented on Connected purple; live deploy still gated
- Verification: 20 contract tests, typecheck, lint, local five-route UI on `http://localhost:3001/`
- Durable lesson: unified review visual and Phase 1/2 product inventory are the same app; do not restore purple by switching repositories
