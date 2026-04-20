---
employer: Align HCM
tags: [smartcare, website, wireframe, hubspot]
---

# SmartCare Landing Page Prototype

Static HTML/CSS prototype for the three website changes outlined in the SmartCare GTM strategy (April 2026). Built for hand off to HubSpot CMS. No build step, no dependencies.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Full SmartCare landing page rebuild (Change 2) and the SmartCare mega menu (Change 3). Open in any browser. |
| `styles.css` | Brand tokens and all page styles. |
| `homepage-banner.html` | Drop in module for the alignhcm.com homepage (Change 1). Self contained styles. |

## Brand tokens used

* Navy `#0A1628` / `#2D3748`
* Orange `#E8832A` / `#F05A28`
* Teal `#2BB5A0`
* Fonts Plus Jakarta Sans (display), DM Sans (body)

## Sections in `index.html`

1. Hero with dual CTA (Discovery + Assessment) and journey preview card
2. Sound familiar pain points
3. SmartCare Journey track (Stabilize, Essentials, Accelerate, Transform)
4. Platform strip (UKG, Dayforce, Paylocity, Workday, ADP)
5. Pricing tiers (12, 24, 36 months, 24 month highlighted)
6. Managed Services (Payroll, HRIS, WFM) with FTE math
7. Case studies (Troon, Peco Foods, Burnco)
8. Lead capture tools (Maturity Assessment + live FTE ROI calculator)
9. Final CTA (free Month 1 Discovery)
10. Footer

## HubSpot port

* Break each `<section>` into its own HubSpot CMS module. The classes are scoped by section so they can move independently.
* Swap the `<form class="calc">` for a HubSpot form with calculated fields, or keep the inline JS and gate the result behind a HubSpot form before downloading the PDF.
* The mega menu in `.nav` is a hover/focus CSS menu. If the current HubSpot theme only supports simple dropdowns, promote it to a custom menu module.
* The `homepage-banner.html` file is a single drop in. Paste into a Raw HTML module on the homepage between the services grid and the client satisfaction section.
* All external dependencies are Google Fonts only. Load them globally in the HubSpot theme head rather than per module to avoid duplicate requests.

## Open questions (from Tammi's review)

* Tier naming. The current document uses Stabilize / Essentials / Accelerate / Transform. Tammi proposed simplifying to Stabilize / Optimize / Thrive. Decide before final copy.
* Free Discovery scope. Tammi flagged that a full system and process review can't fit into a half day session. Align the Discovery deliverable before publishing.
* Homepage banner copy. Tammi suggested "Your HCM platform is just the beginning, SmartCare takes you further" or "Wherever you are in your HCM journey, SmartCare helps you stabilize, optimize, and thrive." Current banner uses the document's version. Easy swap.

## Not yet built

* Maturity Assessment question set and scoring logic
* Full case study pages (Troon, Peco, Burnco)
* Mobile nav drawer animation polish
