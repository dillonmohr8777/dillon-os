---
tags: [sop, web-design, websites]
source: "[[raw/2026-06-26 - intel-core-7-master-operating-transfer]]"
updated: 2026-07-04
---

# Website Build SOP

**Summary:** governance docs first, access verified second, build third, live
only after approval — the AMI order, generalized.

1. **Governance before pixels.** Per client: site mission, build blueprint,
   sitemap CSV, structure-and-design doc (AMI pattern:
   `site-mission.md`, `website-build-blueprint.md`, `sitemap-*.csv`).
2. **Verify access before promising timelines.** Hosting/CMS handoff
   (Bluehost/WordPress, Squarespace, GHL) confirmed by logging in — not by a
   credential string in an email
   ([[concepts/Access Verification Discipline|access discipline]]). Revive and
   AMI both stalled here; the access chase IS the critical path.
3. **Build in a preview lane** (Netlify preview / staging / locked local
   build). Never infer live progress from local prototypes — recheck the
   public site, staging, and backend separately.
4. **Full pipeline when starting fresh** ([[entities/Website Factory|Website
   Factory]]): intake → brand discovery → competitor teardown → design tokens →
   homepage copy → build → SEO pages → schema → sitemap → launch checklist →
   browser QA → weekly health report.
5. **Live only after client approval**, then verify the public URL actually
   changed (AMI lesson: local build done ≠ site delivered —
   [[concepts/Leading Indicators|leading indicator #4]]).
6. Preview links double as portfolio assets — keep them presentable
   (ami-commercial-cleaning-preview, zenspatropicana.com).
