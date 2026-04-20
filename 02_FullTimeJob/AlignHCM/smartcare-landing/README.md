---
project: SmartCare Landing Page
owner: Dillon Mohr
status: Draft v2 · brand-matched
created: 2026-04-20
---

# SmartCare Landing Page · Design Prototype

Static HTML prototype of the three website changes in the SmartCare GTM Website Update brief. Brand tokens derived from alignhcm.com screenshots (April 2026).

## Files

| File | Purpose |
|---|---|
| `index.html` | Full SmartCare landing page rebuild. Open in a browser to preview. |
| `homepage-banner.html` | Drop-in module for the homepage, to sit between services grid and client satisfaction section. |
| `styles.css` | Shared brand tokens and component styles. |

## Brand tokens captured from live site

Pulled visually from screenshots of alignhcm.com. Update these values if the HubSpot theme exposes official variables.

| Token | Value | Usage |
|---|---|---|
| `--ink` | `#0B0F14` | Headlines on light |
| `--orange` | `#EE6B2F` | Primary CTA, accents, bullet arrows |
| `--orange-2` | `#F28A4C` | Hover |
| `--black` | `#000000` | Dark section background ("Talk to us") |
| `--cream` | `#F3EFE7` | Service and testimonial card background |
| `--paper` | `#FFFFFF` | Light section base |
| Font display | Plus Jakarta Sans | Headlines, eyebrows |
| Font body | DM Sans | Body copy, forms |

## Design patterns matched from live site

- Floating white pill nav with soft shadow
- Orange accent bar + uppercase tracked eyebrow labels
- Orange → arrows as bullet markers (never em dashes, never hyphens)
- Cream tonal cards with no border, no shadow
- Orange CTA pills with black text on light backgrounds, white text on dark backgrounds
- Dark contact section with orange gradient top border on form card
- Testimonial / case tags: uppercase tracked orange microlabel + bold navy title

## Structure

**index.html sections, in order:**

1. Floating nav with SmartCare mega menu
2. Hero (navy headline + orange accent, free Discovery CTA, trust stats)
3. Sound Familiar pain grid (6 items)
4. SmartCare Journey (4-stage progression bar, Stabilize active)
5. Transparent pricing (3 plans, 24mo featured, 90-day checkpoint)
6. Managed Services (Payroll, HRIS, WFM)
7. Case studies (Troon, Peco Foods, Burnco/Hammerstone)
8. Lead capture (Maturity Assessment teaser + live FTE ROI calculator)
9. Final CTA (Talk to Us dark section, replicates live site contact pattern)
10. Footer

## Interactive elements

- Mega menu opens on hover/focus
- FTE ROI calculator recalculates live on any input change. Formula: `FTEs × salary × (1 + burden) × 40% savings`
- Form simulates submission and swaps button label

## Writing rules followed

- No em dashes anywhere
- Contractions allowed
- Bullet character `→` (not `—`, not `-`)
- Professional consultative tone, no salesy fluff

## Open questions for Tammi / Maher

1. Are the tier names (Stabilize / Essentials / Accelerate / Transform) final, or still in flux?
2. Does the free Discovery include a written roadmap deliverable, or verbal recap?
3. Is the banner headline "Your HCM platform is live. Now what?" approved or still A/B candidate?
4. Do we have a locked 82% source citation, or does that stay unsourced for launch?

## HubSpot port checklist

- [ ] Confirm theme supports mega menu (or install mega menu module)
- [ ] Move each section into its own D&D module with editable fields
- [ ] Replace inline SVG logo mark with approved logo asset
- [ ] Wire forms to HubSpot form IDs
- [ ] Swap ROI calc to HubSpot-native calculated fields or embed as React component
- [ ] Set meta OG image and Twitter card
- [ ] Add schema.org `Service` markup for SEO
- [ ] Test mobile mega menu (accordion fallback under 960px)
- [ ] Lighthouse pass: target 90+ on all four scores
- [ ] WCAG AA contrast audit on orange buttons (current white-on-orange measures 3.8:1, may need darker orange variant for small text)

## Preview

```
open 02_FullTimeJob/AlignHCM/smartcare-landing/index.html
open 02_FullTimeJob/AlignHCM/smartcare-landing/homepage-banner.html
```
