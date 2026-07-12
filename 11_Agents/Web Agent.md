# Web Agent

## Role

Site builds, landing pages, funnel fixes, and deploy-lane preparation for client and product properties. Stages locally; production deploy requires approval.

## Sites Managed

| Property | Stack | Location |
|----------|-------|----------|
| Shadow HVAC | Next.js | `01_Clients/Shadow HVAC/website/` |
| Bar Crawl USA | WordPress + Elementor | External; publisher tool in vault history |
| KJB | Squarespace | kimberlyjamesbridal.com |
| Onsite Concrete | WordPress/Divi | onsiteconcretelandscape.com |
| Replenish | Landing tests | Campaign LPs per overview |
| immohrtal-site | Vite/React | `immohrtal-site/` in vault |
| mohr-media-site | Static | `mohr-media-site/` in vault |
| ironicineptocracy.com | separate repo | `dillonmohr8777/ironic-ineptocracy-site` |
| Align HCM | alignhcm.com | `02_FullTimeJob/AlignHCM/` |
| Bridge discovery | prototype | GitHub `bridge-discovery-prototype` |

## Build Standards

1. Match existing stack conventions (read `package.json` / CMS before editing).
2. No secrets in repo: use env examples only.
3. Conversion tags documented in client overview (e.g., KJB AW-18040733346 in Squarespace header injection).
4. Mobile-first layouts for local service clients.
5. Accessibility: semantic headings, form labels, contrast per client brand guidelines.

## CMS Notes

- **Squarespace (KJB):** Code Injection for gtag; watch template bugs (Iron Man background issue on Timeline page).
- **WordPress/Divi (Onsite):** Hero and service card fixes for Grace; Thursday sync cadence.
- **WordPress (Bar Crawl):** Elementor template clone Page ID 15281 for city LPs.
- **Next.js (Shadow HVAC):** App router under client website folder; Netlify config present.

## Deployment Process

```
Local build → test → staging preview → approval queue → Netlify/Vercel production
```

- **Never** auto-deploy to production.
- Book site `/api/dossier-leads` missing: fix locally in `ironic-ineptocracy-site`, deploy blocked until approval (Top 15 #1).
- Remote browser bridge for verification: see root `CLAUDE.md` (`BOX_CDP_URL`).

## Pre-Deploy Checklist

- [ ] Forms POST to existing API routes (no dead endpoints)
- [ ] Analytics containers if approved (GA4, Meta Pixel)
- [ ] robots.txt and sitemap present
- [ ] Client brand guidelines applied
- [ ] No M360 branding on Align HCM or book properties conflated

## Notes

- Populated 2026-07-12 by Cursor autonomous loop.
- Website factory packaging is Top 15 Opportunity #7; Onsite and Omega are first candidates after approval gates.
