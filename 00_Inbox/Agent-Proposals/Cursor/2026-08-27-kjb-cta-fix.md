---
note_type: proposal
status: complete
created: 2026-08-27
verified_at: 2026-08-27T06:05:00Z
agent: web-product-builder
privacy: redacted
external_action_attempted: none
mail_ready: hold
source_refs:
  - _os/creative-factory/landing-pages/kjb-wedding-timeline.html
  - https://www.kimberlyjamesbridal.com/scheduling
---

# web-product-builder - KJB CTA fix (tick CREW-20260827-020136943)

## Change

Local preview LP CTAs now point at the live scheduling page, not the homepage.

- From: `https://kimberlyjamesbridal.com`
- To: `https://www.kimberlyjamesbridal.com/scheduling`
- Live readback: HTTP 200 on that URL at 2026-08-27T06:04Z

No Squarespace publish. No production deploy.

## Hand-off

qa-critic must re-score. Maker does not self-approve.
