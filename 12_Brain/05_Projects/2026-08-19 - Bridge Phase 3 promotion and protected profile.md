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
next_action: Hold Slack and client email. Unified review URL is the original 3D suite with a live Maps loader (Google JS overlay still errors). Draft PR #6 can be reviewed internally. Phase 2 payment is promised, not receipted. Do not bind a live API origin until Miraj staging is inspectable.
due: 2026-08-22
review_on: 2026-08-22
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge Phase 3 is the current product lane]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge Phase 3 hold on Slack and client send]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge restore Connected purple on Phase 1-2 product]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge live URL must be the original 3D suite]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge Phase 2 payment promised not receipted]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge Google Maps loader is live on the unified URL]]"
  - "[[12_Brain/04_Decisions/2026-08-19 - Bridge Phase 3 slice is open]]"
  - "[[12_Brain/04_Decisions/2026-08-19 - Bridge unified review is the original 3D suite]]"
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

Draft PR is on GitHub: https://github.com/dillonmohr8777/bridge-discovery-prototype/pull/6 (`cursor/phase-three-vertical-slice-acda`). That Next.js lock is not the unified review visual. Dillon rejected the Modern Network restyle on the live URL. Slack and client send remain held.

- Live `https://bridge-connected-signal.netlify.app` is the original Connected Industry Prototype Suite (kimi-design SHA `39e06db`)
- Routes: `/` `/community/` `/studio/` `/business/` `/signal/` plus compatibility redirects from `/create` `/my-profile` `/explore`
- Five-view illustrative 3D theater verified on Explore; Maps loader 302 and `data-live-map="enabled"`; Google JS still shows its generic error overlay in browser QA
- July 23 39:17 transcript prototype items are in the live HTML. Formal Tori accept boxes still pending.
- Phase 2 payment: Tori promised 2026-08-19; no receipt as of 2026-08-19 21:17Z
- Typed Phase 3 contract remains in draft PR #6 only

Live API bind is not done. Slack / client send is still held.

## Next actions

- [ ] Review the prototype PR internally
- [ ] Hold Slack and client email until Dillon asks
- [x] Restore https://bridge-connected-signal.netlify.app to the original 3D Connected Industry Prototype Suite
- [ ] Bind `NEXT_PUBLIC_BRIDGE_API_BASE` only after Miraj's staging origin is inspectable

## Decisions

- [[12_Brain/04_Decisions/2026-08-19 - Bridge Phase 3 slice is open]]
- [[12_Brain/04_Decisions/2026-08-19 - Bridge unified review is the original 3D suite]]

## Evidence and artifacts

- https://github.com/dillonmohr8777/bridge-discovery-prototype/pull/6
- [[12_Brain/01_Captures/2026-08-19 - Bridge Phase 3 hold on Slack and client send]]
- [[12_Brain/01_Captures/2026-08-19 - Bridge restore Connected purple on Phase 1-2 product]]
- [[12_Brain/01_Captures/2026-08-19 - Bridge full approval to publish Connected purple]]
- https://bridge-connected-signal.netlify.app (live original 3D suite, 2026-08-19)
- `/opt/cursor/artifacts/restored_purple_3d_suite_live_walkthrough.mp4`

## Closeout

- Result: original Connected Industry Prototype Suite restored to the unified review URL with a live Maps loader; Phase 3 Next.js lock remains in draft PR #6
- Verification: restore guards, GHA 32301424038 (loader 302) and 32302080731 (live-map flag), live HTML title `Bridge | Connected Industry Prototype Suite`, five original routes, transcript items in HTML, Maps error overlay in browser QA
- Durable lesson: "Connected purple" on this account means the dark-plum 3D suite in `latest-signal-app/site`, not a token restyle of the Next.js app. The repo name kimi-design is a trap; the folder is the Tori review package. Zip-root deploys and `index.js` function zips will take the live URL down or 502 the loader.
- Slack, client send, live API bind, and prototype merge remain gated. Phase 2 payment is unverified.
