# Watchdog PDF reporting

Branded, boss-ready PDF reports rendered from the same first-party HubSpot data the watchdog
already writes. No network calls, no Google dependency, no PowerShell.

## What it produces
- **Daily PDF** -> `reports/pdf/daily/YYYY-MM-DD.pdf` — the day's watchdog report: verdict, alerts,
  yesterday's numbers, itemized submissions (clean vs raw), all-year KPIs, leading indicators, SEO
  sweep, open issues, one action.
- **Weekly PDF** -> `reports/pdf/weekly/YYYY-Www.pdf` (3 pages) — views for the week, conversions &
  leads, revenue & pipeline, SEO + site health (incl. AI crawler / llms.txt status), CRM hygiene &
  alerts, AEO referral trend, contact source mix.

## How it works
`generate_report.py` reads `baseline.json` + `site-analytics-dashboard/data.json` (and parses the
day's `reports/*.md` for authored prose and the itemized submission table), builds a print HTML from
`brand.css` + `charts.py` (inline SVG / CSS bars, data baked in — no runtime `fetch`), then prints it
with headless Chromium.

## Usage
```bash
cd 02_FullTimeJob/AlignHCM/Watchdog/reporting
python3 generate_report.py --kind daily            # today
python3 generate_report.py --kind daily  --date 2026-07-23 --png   # + PNG preview of page 1
python3 generate_report.py --kind weekly --date 2026-07-23         # 7 days ending yesterday
```

## Requirements (already present in the web session)
- `python3` 3.11 (stdlib only — no weasyprint/reportlab needed).
- Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (auto-detected via glob fallback).

## Data dependency
The weekly views chart needs a daily time series, which lives in `baseline.json` under
`daily_series.days` (`{date, views, submissions, submissionsClean, contacts}`). The watchdog appends
yesterday's completed day each run and trims to ~45 days. `submissionsClean` strips QA-test and
spam-bot fills per the PLAYBOOK pollution exclusions.
