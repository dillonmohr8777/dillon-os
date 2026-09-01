---
note_type: capture
status: unprocessed
created: 2026-08-19
updated: 2026-08-19
captured_at: 2026-08-19T21:12:00Z
source_type: operator_instruction
source_url: https://bridge-connected-signal.netlify.app
source_author: Dillon Mohr
related_entities:
  - Bridge Software Development
tags:
  - brain
  - capture
  - bridge-software
  - netlify
  - maps
source_refs:
  - "https://bridge-connected-signal.netlify.app"
  - "https://github.com/dillonmohr8777/dillon-os/actions/runs/32301424038"
  - "https://github.com/dillonmohr8777/dillon-os/actions/runs/32302080731"
  - "[[12_Brain/04_Decisions/2026-08-19 - Bridge unified review is the original 3D suite]]"
---

# 2026-08-19 - Bridge Google Maps loader is live on the unified URL

The unified review URL now serves the original suite at site root, a real `google-maps-loader` function, and `data-live-map="enabled"` on Explore. Google's in-page JS still shows the generic Maps error overlay.

## Why this matters

Dillon asked to put Google Maps on this URL and to institute the 39:17 transcript. A zip-archive deploy nested the suite under `/site/` and 404ed `/`. Digest + SHA256 + `runtime=js` plus a zip named `google-maps-loader.js` made the function return 302. The pinned suite had kept live Maps off (`data-live-map` missing) after a 2026-08-04 billing error.

## Source material

- Live `https://bridge-connected-signal.netlify.app`: `/` `/community/` `/studio/` `/business/` `/signal/` 200; `/create` `/my-profile` `/explore` 301; `/site/index.html` 404; `/.netlify/functions/google-maps-loader` 302 with a Location (do not log it).
- GHA 32301424038: function healthy 302, key already on the site, no GitHub secret needed.
- GHA 32302080731: Explore HTML includes `data-live-map="enabled"`.
- Browser QA: status badge reads Live Google 3D discovery; Google then paints "Oops! Something went wrong. This page didn't load Google Maps correctly." A server-side fetch of the Maps JS bootstrap with the live Referer (2026-08-19 21:17Z) contained no named MapError class; the overlay is a browser Maps JS failure after the callback. Likely key restriction, Maps 3D library, or billing — unverified. Do not print the key or the 302 Location.
- Transcript prototype items already in the suite HTML (Promotion, PNG/PDF, Adults 21+, Verified retailers, Industry professionals, Public vs B2B, sales/accounting 90-day confirm, Favorites, nationwide filters, MD/MA/NJ/VA theater). Formal Tori accept boxes still pending.

## Claims to verify

- Loader 302 means the function and env key are live.
- The Google error overlay is not a 404. It is a Maps JS failure after the callback ran.
- Webp 3D theater remains the designed fallback when live tiles fail.
- Slack / client send stay held.

## Compile targets

- Decision: [[12_Brain/04_Decisions/2026-08-19 - Bridge unified review is the original 3D suite]]
- Concept: [[12_Brain/03_Concepts/Netlify Deploy Safety]]
- Project: [[12_Brain/05_Projects/2026-08-19 - Bridge Phase 3 promotion and protected profile]]
- Client: [[01_Clients/Bridge Software Development/overview]]
