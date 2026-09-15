---
tags: [campaign, prospect, website, partner]
status: active
created: 2026-09-01
updated: 2026-09-01
owner: Dillon Mohr
contact: Jack Lesser (jack@withnotfor.ai)
source_refs:
  - "gmail://thread/1a034b2a4a2214bc"
  - "gmail://thread/1a010b88c361cd17"
  - "https://with-not-for-ai-human-led-preview.netlify.app"
---

# With Not For (Jack Lesser)

**Summary:** AI consulting business run by Jack Lesser with a med-tech partner.
Momentum Digital met them 2026-08-11 and 2026-08-17; Dillon built a preview
homepage with Codex and sent it as portfolio on 2026-08-27. A rebuilt homepage
was produced 2026-09-01 and lives in `site/`.

## Status

- 2026-08-24: Dillon checked in; Jack proposed Wednesday 10 am. Next call to confirm.
- 2026-08-27: preview URL shared with Ben at getaiso.com as portfolio.
- 2026-09-01: rebuild done (`site/index.template.html`, build with
  `node scripts/build.mjs`). Deployable `index.html` is regenerated, not stored.
- Repo creation (`with-not-for-site`) was refused for the remote session token.
  Create it from the Windows box and move `site/` there.

## What the rebuild fixed

Visible hero at load, 6.9 MB PNG to ~150 KB WebP, 28k px page to 7k px,
IntersectionObserver reveals, sticky adoption stepper, reduced-motion support.
See `site/README.md`.

## Open

- Confirm the Wednesday call and send Jack the rebuild as the demo.
- Decide whether this is a Momentum client, a direct client, or a partner.
