---
tags: [client, fulltime]
status: active
industry: HCM/HR tech
start_date: 2026-01-25
rate: Full-time
last_touched: 2026-07-30
next_action: Decide HubSpot GA4 field (uncheck vs G-0Y6LQTTBRJ); Google sign-in for GA4/GSC; approve site form + duplicate gtag fixes
due: none
---

# Align HCM

## Overview
- **Contacts:** Maher El-Abdallah (CEO), Barbara Tonelli, Joann Scolaro, Allison
- **Website:** alignhcm.com
- **Industry:** HCM / HR Technology
- **Tier:** Full-time (managed under Buzz Bull Marketing Systems)
- **Brand Palette:** Navy / Orange
- **HubSpot portal:** 242825734 (Align HCM) — Dillon Mohr Super Admin verified 2026-07-30

## Services
- LinkedIn Content Calendar Production (4 authors: Maher, Barbara, Joann, Align page)
- CEO Thought Leadership Blog Posts
- LinkedIn Carousel Graphics (1080x1350 portrait)
- Case Studies and Sales Materials (Driscoll's, TPI Composites, Kimberly-Clark, UTA)
- Aligniversary Employee Recognition Graphics
- Interactive HTML Performance Reports (monthly, presented to full team)
- SEO Blog Content

## Content Calendars
- April 2026 (1-10): Maher April Fools "Misalign HCM" video, thought leadership, CHRO AI readiness
- April 2026 (13-30): Extended with Barbara, Joann, and company page content
- May 2026: Full month across all 4 authors — video, carousels, motion graphics, case studies

## Blog Posts
- "6 Things I Tell Every Client Before Their Payroll Implementation Starts"
- "Building a High-Performance Culture That Attracts and Retains Top Talent" (Barbara)
- Internal talent mobility as growth strategy
- HCM support model determining system ROI

## Case Studies / Sales Materials
- Driscoll's one-pager: Interactive HTML, navy/orange, UKG Pro branding, SVG icons
- TPI Composites: 17-slide sales proposal rebuilt in Canva
- UTA data migration sales sheet
- Kimberly-Clark case study LinkedIn adaptation

## Monthly Reporting
- Interactive HTML report: SEO blog metrics + LinkedIn engagement
- First-person presentation script for Dillon
- Presented to: Maher, Barbara, Tammi, Rich, Joann, Allison

## Reporting stack (Edge audit 2026-07-30)

Full table + buckets: [[handoffs/align-reporting-stack-edge-audit-2026-07-30|align-reporting-stack-edge-audit-2026-07-30]].

**Done this pass**
- Pipeline stages: Expressing Interest → 10% open (UKG / Dayforce / Paylocity); Channel "Referral Received" → 10%.
- HubSpot page-click / CTA collection ON; five Align attribution properties created; SEO rescan kicked off.
- Production GA4 **G-0Y6LQTTBRJ** confirmed collecting; HubSpot AI Referrals live (291 YTD sessions; 8% last-30d session→contact).

**Hard stop**
- Google stack (GA4 UI / GSC / Cloud) — no live session; account chooser shows only signed-out personal Gmail identities.

**Open decisions for Dillon**
1. HubSpot GA4 integration field holds invalid `G-320235048` — lean **uncheck** (do not add a third hit on G-0Y6LQTTBRJ).
2. Claude connector 16228553 re-auth — 17 scopes include write (CPQ / campaigns / emails); leave pending unless narrowed or explicitly approved.
3. Site code (dev): remove duplicate `align-attribution.min.js`; add `align_*` fields to footer CTA form `e733d928-…` (cause of ~0% attribution fill). Do not build attribution workflows until that lands.

**Also pending consent:** HubSpot GSC app install, X (@AlignHcm) reconnect, LinkedIn native XLSX export, GA4 `g/collect` 503 re-check after Google sign-in.

## Links
- [[Client Index]]
- [[handoffs/align-reporting-stack-edge-audit-2026-07-30|Edge audit handoff 2026-07-30]]
