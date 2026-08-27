---
note_type: proposal
status: draft
created: 2026-08-26
agent: qa-critic
privacy: redacted
source_refs:
  - 02_Campaigns/Landing Page Build Queue.md
  - _os/creative-factory/landing-pages/shadow-hvac-summer-ac.html
  - _os/creative-factory/landing-pages/kjb-wedding-timeline.html
  - _os/creative-factory/landing-pages/omega-outdoor-living.html
  - https://onsiteconcretelandscape.com/
---

# QA critic — preview landing pages

Independent review. This file does not edit the artifacts.

## Verdict

**Fail for publish.** Preview-ready as local drafts only.

## Confirmed defects

1. **Omega** — copy says "Project photos from real jobs" and the services copy promises photos; the HTML has no `<img>` and no project gallery. Locator: `_os/creative-factory/landing-pages/omega-outdoor-living.html`.
2. **KJB** — both CTAs go to `https://kimberlyjamesbridal.com` (homepage), not an appointment path. Locator: `kjb-wedding-timeline.html` hero and concierge buttons.
3. **Onsite production** — live homepage H1 is a lowercase sentence, not a campaign hero. There is no Onsite GitHub repo to patch. Locator: `https://onsiteconcretelandscape.com/`.

## Recommendations (not defects)

- Shadow HouseCallPro URL returned empty static HTML; needs a logged-in browser check before calling it dead.
- Shadow "Beat the Heat" copy is late-August seasonal risk.
- Omega `tel:7197612840` is present and usable after the local mobile-grid fix.

## Maker follow-up

web-product-builder added a mobile breakpoint to Omega `.services`. Photos and KJB appointment URL remain open. Do not publish.
