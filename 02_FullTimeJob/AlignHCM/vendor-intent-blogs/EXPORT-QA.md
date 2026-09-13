# Export QA Notes: Vendor-Intent Blog PDFs (VIB01 to VIB10)

Date: 2026-07-17 · Renderer: Chromium (Playwright print pipeline) · Format: A4 portrait

## Design system used (documented per brief)

One system across all ten PDFs: **Plus Jakarta Sans** (display, weights 400/600/700/800) plus **DM Sans** (body, 400/500/700). Both faces are embedded in each editable HTML source as base64 woff2, so there is no font substitution in render or handoff. Brand tokens follow the Align editorial system: deep navy `#0A1628` fields, orange `#F05A28` to `#FF6B35` gradient emphasis, warm paper `#FBF9F6`, teal `#2BB5A0` positive accents. The Align logo (white variant) appears on each cover masthead; platform names are text-only labels per the brand-permission rule.

## Structure per PDF

1. Cover masthead: platform, intent label, exact article H1, Align HCM, draft ID, primary keyword, schema.
2. Editorial brief panel: primary keyword, secondary keywords, persona, funnel stage, intent, slug, title tag, meta description, schema.
3. Article: full draft copy verbatim, heading order preserved, direct answer styled as the labeled opening callout, all tables, numbered processes, checklists, links, and FAQs intact.
4. Conversion CTA band using each draft's front-matter CTA.
5. Publication notes and Sources as annex panels. Source names are kept as links and each destination URL is printed visibly beneath the name.

## QA checks performed

- **Fonts:** embedded; verified render of both faces on all spot-checked pages; no fallback substitution observed.
- **Links:** internal and external links preserved as live hyperlinks with visible styling; every Sources entry shows name plus printed destination URL.
- **Page breaks:** headings keep with their content; tables, FAQ cards, callouts, CTA, and annexes are break-protected; no orphaned CTA pages; no accidental blank pages (page counts: 6 to 7 per article, 65 pages total).
- **Tables:** all tables render inside the page width with navy header rows and zebra striping; legible at 100 percent zoom and in print (checked on VIB01, VIB02, VIB06, VIB10, which contain the widest tables in the batch).
- **Missing assets:** none; no stock screenshots used; no platform logos used.

## Content rule compliance

- Ten separate PDFs; nothing merged.
- Direct answers, quick summaries, comparison tables, numbered processes, and FAQs all retained.
- Primary keywords unchanged in titles and H1s (verified against MANIFEST.json).
- No invented volumes, prices, timelines, results, or features; copy is the approved draft text verbatim.
- No Paylocity content. Nothing published or scheduled.

## Change log

No copy was shortened or altered for layout in any of the ten articles. The only additions are design labels ("Direct answer", "Editorial brief", "Conversion CTA", section annex titles) and printed source URLs, which sit outside the article copy.
