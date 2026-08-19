---
note_type: decision
status: active
created: 2026-08-19
updated: 2026-08-19
owner: Dillon Mohr
decision_date: 2026-08-19
review_on: 2026-09-19
verification_status: verified
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - Operator asked to decide lineage PRs and boards]]"
  - "[[12_Brain/04_Decisions/2026-08-13 - Prospect Radar V2 audit engine]]"
  - "[[_templates/site-factory/README]]"
  - "[[automation/prospect-radar-next20/PRODUCT]]"
tags:
  - brain
  - decision
  - site-factory
  - radar
---

# Site factory lineages

**Decision:** There are two factories and one grader. They do not merge.

- **Grader / selection:** `_os/automation/lib/radar.js` plus Site Quality
  Score, wrapped by `_os/radar-engine/` (Prospect Radar V2). This is not a
  builder.
- **Daily private prospect concepts:** `automation/prospect-radar-next20/`
  wins. Next 15 stays disabled. `mail_ready` stays `hold`.
- **Weekly 25-site outreach/mail batch:** `_templates/site-factory/` plus
  `/site-batch` wins. Design contract is `philly-sites/DESIGN-SYSTEM.md`.
- **Cloud homepage variant PRs** (phl-w33 / w34 / w35, Align-motion skins,
  Haoqi packs, Jessie-sheet rebuilds) are batch evidence. They are not a
  third factory and do not replace either winner.

**Why:** Next 20 is cinematic, mobile-first, exact-logo, scheduled, and
local-only. Site-factory is the Philly-25 10-section mail/QR engine. Mixing
them produces sameness or broken mail sheets. Radar V2 wrapping the grader
was already decided on 2026-08-13.

**Implications:**

- New prospect-concept work goes through Next 20, not a new homepage PR.
- New outreach-batch work goes through `_templates/site-factory/`.
- Variant.com harvest and similar research may inform tokens; they do not
  fork the factory.
- PR `#279` (Netlify hub for 25 sites) does not ship. Prospect previews stay
  noindex and unmapped until an exact site ID is pinned.

## Options considered

1. One factory to rule them all — rejected; jobs and craft floors differ.
2. Cloud weekly homepage PRs become the factory — rejected; they fight the
   scheduled Next 20 lane and Netlify capacity.
