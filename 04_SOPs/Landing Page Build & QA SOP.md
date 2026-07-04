---
tags: [sop, web-design, landing-pages]
source: "[[raw/2026-06-26 - intel-core-7-master-operating-transfer]]"
updated: 2026-07-04
---

# Landing Page Build & QA SOP

**Summary:** clone the approved shell, wire tracking before traffic, QA against
the checklist, deploy pinned — proven on the 7-Eleven location-page family.

## Build
1. **Never design from scratch when a shell is approved.** Clone the approved
   production page (7-Eleven precedent: the Pompano shell; the `-review`
   variant was NOT the approved source — confirm which URL is canonical).
2. One page per location/offer; keep brands distinct (7-Eleven/Replenish ≠
   Fresh Blends ≠ Kwik Trip). Shared assets from the approved set only.
3. Verify every hard fact on the page (address, phone, hours) against a live
   source — an inferred address under paid traffic is a burned budget
   ([[concepts/Evidence Boundaries in Reporting|evidence rule]]).

## Tracking (before any traffic)
- Google tag installed; UTM parsing; paid-visit event fires when
  `utm_campaign` present; CTA click events (calls, directions, forms) via
  gtag/dataLayer; hidden Netlify form as a backup conversion record.
- If offline conversions matter, capture `gclid` in the payload from day one —
  retrofitting it later loses the history (7-Eleven gap).

## QA checklist (every page, every revision)
- [ ] HTTP 200 on the live URL (static fetch — don't browser-open conversion
      redirects: [[concepts/Netlify Deploy Safety|deploy safety]])
- [ ] Expected location/offer text present
- [ ] Tag present and firing
- [ ] All tracked CTAs work (7-Eleven standard: five per page)
- [ ] All images return 200
- [ ] No horizontal overflow at 390px and 1366px
- [ ] Deploy manifest not publicly readable

## Deploy
- Pin the Netlify site explicitly (`--site <id>` or `--disable-linking`);
  deploy only on approval; the live URL fetch is the done-signal, not the CLI
  output.
