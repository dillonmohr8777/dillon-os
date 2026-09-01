---
tags: [concept, ops-rule, web-design]
source: "[[12_Brain/01_Captures/2026-08-19 - Bridge full approval to publish Connected purple]]"
updated: 2026-08-19
note_type: concept
status: active
created: 2026-07-04
source_refs:
  - "[[12_Brain/01_Captures/2026-06-26 - intel-core-7-master-operating-transfer]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge full approval to publish Connected purple]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge Google Maps loader is live on the unified URL]]"
---


# Netlify Deploy Safety

**Summary:** pin the Netlify site on every deploy, purge Durable cache after replacing a Next.js runtime with static files, and never browser-open a page that could fire a real conversion.

- The CLI was once found linked to `omega-landscaping-landing-page` by default; a careless deploy would have overwritten a client site. Always `--disable-linking` for new sites or pass an explicit `--site` ID (KJB precedent: site ID pinned in the deploy command).
- Verify live URLs by **static fetch**, not by browser-opening — especially conversion-sensitive redirect pages, which can fire real conversion events when opened.
- After a production publish, fetch the **bare home URL** (`/`), not only a cache-busted query. A digest deploy of static files over a prior Next.js Netlify runtime can leave a Durable-cache copy of Trusted Current on `/` while `/community` and the deploy permalink already show the new theme. Purge the site CDN (`POST /api/v1/purge` with the pinned `site_id`) and wait until `/` matches.
- Pin Bridge's unified review to exact name `bridge-connected-signal` and host `bridge-connected-signal.netlify.app`. Never create a site from a publish script. Never deploy Trusted Current or the Next.js Modern Network restyle to that host; the live visual is the original Connected Industry Prototype Suite.
- A Netlify zip-archive of `site/` plus `netlify.toml` publishes the zip root and 404s `/`. Digest-deploy files at site root. Function zips use SHA256, `?runtime=js`, upload before files, and `{function-name}.js` at zip root. Probe the Maps loader without following redirects; never log Location.
- Deploy only on approval; a deploy manifest proves routing, not client delivery.
- Per-page QA checklist (7-Eleven standard): HTTP 200, expected content, tag present, tracked CTAs, images 200, no horizontal overflow at 390px/1366px.

## Links
- [[12_Brain/02_Entities/Website Factory|Website Factory]] · [[12_Brain/03_Concepts/Evidence Boundaries in Reporting|Evidence Boundaries in Reporting]]
