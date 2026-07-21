# Align HCM Optimization Pack — Executive Summary
**Date:** July 21, 2026  
**Owner:** Dillon Mohr  
**Brand:** Align HCM only (not Momentum 360)

## What was done

A full HubSpot CMS edit pack was written to disk for paste-ready use. It covers:

• **Title and meta descriptions** for SmartCare (`/align-hcm-smartcare`), Insights (`/insights`), and Case Studies (`/case-studies`), with two options each (SEO-primary and AEO-primary)  
• **HubDB access request email** listing tables and fields needed to optimize case study titles, teasers, and service page embeds (priority clients: Troon, Peco Foods, Burnco/Hammerstone, Driscoll's, Kimberly-Clark, Resorts World Las Vegas)  
• **Conversion-path pack** for six high-traffic service surfaces: implementation, support, optimization, SmartCare landing, services overview, and data conversion. Includes hero, mid-page, and footer CTA copy plus case study embed mapping  
• **AI referral monitoring checklist** using placeholder HubSpot field names Dillon must confirm before building reports

**Primary deliverable:** `02_FullTimeJob/AlignHCM/optimization-packs/2026-07-21-hubspot-cms-edit-pack.md`

## What is blocked

• **HubSpot API token missing in this cloud environment.** No live portal reads, HubDB exports, or CMS publishes were attempted.  
• **HubDB field audit** cannot start until IT/web grants read access or sends a CSV export (email template is in the pack).  
• **AI referral reports** cannot be built until Dillon confirms exact property API names in HubSpot (placeholders listed in Section 4 of the pack).

## Homepage blog slider fix (separate pack)

The Splide initialization fix for the homepage blog slider is documented in:

`02_FullTimeJob/AlignHCM/optimization-packs/2026-07-21-blog-slider-fix.md`

• **Module:** Blog Slider `238216663800`  
• **Asset:** `module_Blog_Slider.min.js` in HubSpot Design Manager  
• **Root cause:** `DOMContentLoaded` fires before footer-injected module JS runs, so Splide never mounts  
• **Fix:** Replace module JS with the paste-ready IIFE in that file (immediate init + scoped selector)

## Publish status

**Nothing was published to edge, live HubSpot, or production.** All outputs are local markdown packs for manual review and paste into HubSpot when Dillon is ready.

## Recommended next steps

1. Paste SEO-primary title/meta (Option A) for SmartCare, Insights, and Case Studies in HubSpot page settings  
2. Send the HubDB access email from Section 2 of the edit pack  
3. Apply conversion CTAs starting with `/services/support` and `/align-hcm-smartcare`  
4. Paste the blog slider JS fix from the slider pack when a HubSpot session is available  
5. Confirm HubSpot attribution field names and stand up AI referral views from Section 4
