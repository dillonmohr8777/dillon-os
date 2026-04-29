---
last_updated: 2026-04-29
tags: [job-search, indeed, marketing]
routine: indeed-marketing-job-scrape
---

# Target Roles — Indeed Daily Scrape

The `indeed-marketing-job-scrape` routine reads this file every morning at 6:00 AM ET and pulls 25 brand-new marketing job postings from Indeed matching these roles. Output is written to `02_FullTimeJob/job-search/indeed-today.md` (Markdown) and `02_FullTimeJob/job-search/indeed-today.csv` (CSV). The CSV is emailed to `dillonmohr8777@gmail.com` at 7:30 AM ET.

## Role list (marketing-focused)
- Freelance Account Manager
- Client Success Manager
- Retention Manager
- Marketing Project Manager
- Client Reporting Manager
- Client Onboarding Specialist
- Google Ads Manager
- Meta Ads Manager
- PPC Specialist
- SEO Specialist
- Local SEO Specialist
- Technical SEO Specialist
- Content Strategist
- Blog Writer
- Copywriter
- Email Marketing Specialist
- Marketing Automation Specialist
- CRM Manager
- HubSpot Specialist
- Social Media Manager (Organic)
- Community Manager
- Reputation Management Specialist
- Public Relations Specialist
- Brand Strategist
- UX Copywriter
- Marketing Analyst
- Data Analyst (Marketing)
- Reporting & Dashboard Specialist
- Web Analytics Specialist
- Landing Page Designer
- Funnel Builder
- Marketing Operations Specialist
- Lifecycle Marketing Specialist
- Customer Experience Specialist

## Scrape rules
- Pull **25** brand-new postings per run (posted within the last 24 hours).
- Marketing roles only — exclude non-marketing matches even if a title overlaps.
- Deduplicate against the prior 30 days of `indeed-today.md` snapshots.
- Capture per posting: title, company, location (or remote), salary if listed, posted-date, Indeed URL.

## CSV columns (in order)
`title, company, location, remote, salary, posted_date, source, url`

## Delivery
- 6:00 AM ET — scrape runs; writes `indeed-today.md` and `indeed-today.csv`.
- 7:30 AM ET — CSV is emailed as an attachment to `dillonmohr8777@gmail.com`.
  - Subject: `Indeed marketing jobs — {YYYY-MM-DD} (25 new)`
  - Body: top 5 postings inline + link to the full CSV in the vault.
