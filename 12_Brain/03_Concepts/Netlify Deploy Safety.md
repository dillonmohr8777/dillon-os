---
tags: [concept, ops-rule, web-design]
source: "12_Brain/01_Captures/2026-06-26 - intel-core-7-master-operating-transfer (capture never landed; unverified)"
updated: 2026-09-02
note_type: concept
status: active
verification_status: unverified
created: 2026-07-04
source_refs: ["12_Brain/01_Captures/2026-06-26 - intel-core-7-master-operating-transfer (capture never landed; unverified)"]
---


# Netlify Deploy Safety

**Summary:** the Netlify CLI can be silently linked to the wrong site — pin the site explicitly on every deploy, and never browser-open a page that could fire a real conversion.

- The CLI was once found linked to `omega-landscaping-landing-page` by default; a careless deploy would have overwritten a client site. Always `--disable-linking` for new sites or pass an explicit `--site` ID (KJB precedent: site ID pinned in the deploy command).
- Verify live URLs by **static fetch**, not by browser-opening — especially conversion-sensitive redirect pages, which can fire real conversion events when opened.
- Deploy only on approval; a deploy manifest proves routing, not client delivery.
- Per-page QA checklist (7-Eleven standard): HTTP 200, expected content, tag present, tracked CTAs, images 200, no horizontal overflow at 390px/1366px.

## Links
- [[12_Brain/02_Entities/Website Factory|Website Factory]] · [[12_Brain/03_Concepts/Evidence Boundaries in Reporting|Evidence Boundaries in Reporting]]
