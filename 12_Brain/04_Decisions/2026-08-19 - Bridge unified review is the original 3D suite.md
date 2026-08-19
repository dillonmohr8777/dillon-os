---
note_type: decision
status: active
created: 2026-08-19
updated: 2026-08-19T21:12:00Z
owner: Dillon Mohr
client: Bridge Software Development
project: "[[12_Brain/05_Projects/2026-08-19 - Bridge Phase 3 promotion and protected profile]]"
decision_date: 2026-08-19
review_on: 2026-08-26
verification_status: verified
supersedes:
  - "[[12_Brain/04_Decisions/2026-08-19 - Bridge unified review stays Connected purple]]"
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge live URL must be the original 3D suite]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge Google Maps loader is live on the unified URL]]"
  - "https://bridge-connected-signal.netlify.app"
  - "https://github.com/dillonmohr8777/bridge-discovery-prototype-kimi-design"
tags:
  - brain
  - decision
  - bridge-software
  - brand
---

# Bridge unified review is the original 3D suite

The unified review URL serves the original Connected Industry Prototype Suite: dark plum, photography, icon nav, and the five-view illustrative 3D theater. It is not the Next.js Modern Network restyle and not Trusted Current.

## Context

A 2026-08-19 publish put draft PR #6's Next.js token restyle on `bridge-connected-signal.netlify.app`. Dillon said that was not even close and asked for the old purple 3D frontend. That frontend still lived in `latest-signal-app/site` (repo named kimi-design; the folder is the July 21 suite completed against Tori's July 23 39:17 feedback).

## Options considered

1. Keep the Next.js "Connected · Modern Network" restyle on the unified URL.
2. Restore `latest-signal-app/site` (Home, Community, Studio/Create, Business/My Profile, Signal/Explore, 3D theater) to the same host.
3. Leave the original only on the safety backup.

## Decision

Option 2. Live review is the original suite. The Next.js Phase 3 lock stays in draft PR #6 and is not the unified visual. Slack, email, live API bind, and merge stay gated.

## Rationale

Tori already called that prototype beautiful. Dillon's Phase 2 PDF names this package and the 3D theater as the reviewable product. A color-token restyle of a different app is not that product.

## Consequences

- Live `https://bridge-connected-signal.netlify.app` restored from kimi-design SHA `39e06db`
- Compatibility redirects: `/create` → `/studio`, `/my-profile` → `/business`, `/explore` → `/signal`
- Google Maps loader is a live function (`/.netlify/functions/google-maps-loader` 302). Explore is flagged `data-live-map="enabled"`. Browser QA still shows Google's generic Maps error overlay after the Live Google 3D discovery badge; webp theater remains the fallback. Do not log the 302 Location.
- Do not Slack or email Tori/Melissa/Mac/Miraj from this restore

## Reversal trigger

Dillon asks for a different app on the unified URL, or Tori writes a different default.

## Evidence

- [[12_Brain/01_Captures/2026-08-19 - Bridge live URL must be the original 3D suite]]
- [[12_Brain/01_Captures/2026-08-19 - Bridge Google Maps loader is live on the unified URL]]
- Live title `Bridge | Connected Industry Prototype Suite`; Maps loader 302; GHA 32301424038 and 32302080731
