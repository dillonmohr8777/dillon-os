---
date: 2026-08-19
project: Bridge Software Development
type: session
status: completed-original-suite-maps-loader
tags: [session, bridge-software, nextjs, phase3, netlify]
---

# Bridge Software Development — 2026-08-19

## Session outcome

Restored the original Connected Industry Prototype Suite (dark plum, 3D theater) to the unified review URL after Dillon rejected the Next.js Modern Network restyle. Maps loader is a live 302 function; Explore is flagged for live Google 3D. Browser QA still shows Google's generic Maps error overlay.

Live: https://bridge-connected-signal.netlify.app title `Bridge | Connected Industry Prototype Suite`. Source: kimi-design `latest-signal-app/site` SHA `39e06db`. Slack, email to Tori/Melissa/Mac/Miraj, live API bind, and merge to `main` remain held. Phase 2 payment promised 2026-08-19, not receipted as of 21:17Z.

## Evidence used

- Operator restore: the old purple with Tori-instituted Phase 1/2 integrations
- Operator hold: [[../../12_Brain/01_Captures/2026-08-19 - Bridge Phase 3 hold on Slack and client send]]
- Operator publish: [[../../12_Brain/01_Captures/2026-08-19 - Bridge full approval to publish Connected purple]]
- Gmail thread `1a010a5e42734ccc` (Melissa 2026-08-17 review send; Tori 2026-08-18 payment-tomorrow reply)
- Slack `#bridge-software-development` (`C0BGWRK03B2`) through 2026-08-17; PDFs F0BQPLVC8G4, F0BQMNXCS65, F0BP4F0L4N7, F0BNLD447EX, F0BNUJ7RK4H
- Live repo `dillonmohr8777/bridge-discovery-prototype` draft PR #6 (not the unified visual)

## What changed

- Unified review URL is the original dark-plum 3D suite at site root, not Modern Network and not Trusted Current
- Maps loader function returns 302; Explore HTML has `data-live-map="enabled"`
- Compatibility redirects: `/create` → `/studio`, `/my-profile` → `/business`, `/explore` → `/signal`
- Phase 3 Create / My Profile frontend lock stays in draft PR #6 only
- `NEXT_PUBLIC_BRIDGE_API_BASE` remains unset
- One-shot restore workflow removed after the successful Maps restores so later vault commits do not republish

## Verification

- Live 200: `/` `/community/` `/studio/` `/business/` `/signal/`; compatibility paths resolve to Studio / Business / Signal
- Live title on `/`: `Bridge | Connected Industry Prototype Suite`
- `GET /.netlify/functions/google-maps-loader` 302 with Location present (not logged)
- `/signal/` includes `data-live-map="enabled"`
- GHA 32301424038 (loader) and 32302080731 (live-map flag)
- Restore unit tests in `_os/test/bridge-connected-suite-restore.test.js`
- Gmail/Slack re-read 2026-08-19 21:17Z: no payment receipt; no Tori/Melissa mail after 2026-08-18 14:16Z; Slack last message 2026-08-17 11:20 EDT

## Not done

- No Slack post
- No client email or walkthrough send
- No live `/api/v1` bind
- Prototype PR #6 not merged
- Google Maps JS overlay still errors in the browser; operator console must allow this host on the existing browser key if live 3D tiles are required
- Phase 2 payment not receipted
- Tori route-by-route accept boxes still pending
