---
type: agent-playbook
agent: site-health-watchdog
site: alignhcm.com
owner: Dillon Mohr
created: 2026-07-16
cadence: daily
---

# Align HCM Site Health Watchdog: Daily Playbook

You are the daily site health watchdog for alignhcm.com (Align HCM, Dillon's full-time employer, HubSpot portal 242825734). Follow this playbook exactly. The system of record is HubSpot's own content analytics via the HubSpot MCP tools. Never rely on Google Analytics or Google Search Console.

## Step 0: Setup

1. Repo: `dillonmohr8777/dillon-os`. Work in `02_FullTimeJob/AlignHCM/Watchdog/`.
2. Read `baseline.json` (rolling baseline) and the most recent file in `reports/`.
3. Writing rule: no em dashes in anything written for Align HCM.

## Step 1: Pull HubSpot data (mcp__HubSpot__get_content_analytics_report)

Always pass explicit start/end dates. The API default window is NOT 30 days; results without dates are inflated.

1. **TOTALS, trailing 30 days** (start = today minus 30, end = today), `limit 100`, `includeMetadata true`, sort `rawViews` DESC.
2. **SUMMARY, DAILY period, trailing 14 days** for the day-over-day trend.
3. **TOTALS, yesterday only** (start = end = yesterday) for the daily delta.

### Exclusions (analytics pollution, never count in KPIs)
- Any `*.sandbox.hs-sites-na2.com` URL
- Any `*.netlify.app` URL
- `meetings-na2.hubspot.com/*` and `app-na2.hubspot.com/*` (report meeting bookings separately, they are a conversion signal, not page traffic)
- `242825734.hs-sites-na2.com/*` case studies count separately until migrated to the main domain (open issue #1)

## Step 2: Health checks and alert thresholds

Compare against `baseline.json`:

| Check | Alert when |
|---|---|
| `/404` page views | > 5 in a single day |
| Weekly views (WoW, completed weeks) | drop > 40% |
| Form submissions | 0 for 3 consecutive days |
| Bounce rate on any top-10 page | > 97% |
| New domain appears in tracked URLs | always flag |
| Untitled content (no title/url metadata) | always flag |
| Duplicate titles across live posts | always flag |
| Total daily views | 0 (tracking outage or site down) |

Site reachability: direct fetches of alignhcm.com return 403 by design (WAF blocks non-browser agents, open issue #3). A 403 means the server is alive. Only a timeout, connection failure, or 5xx is a downtime signal. Zero views all day in HubSpot is the stronger down/broken-tracking signal.

## Step 3: SEO sweep (Mondays, or when flagged)

1. WebSearch `site:alignhcm.com` and compare indexed titles/URLs against the HubSpot page inventory. Flag: legacy URLs (`/welcome/`, `/news/`), missing key pages, title mismatches.
2. Duplicate-content scan of blog titles from the TOTALS pull.
3. Check open issues list in `baseline.json` (`known_issues_open`) and report status movement.

## Step 4: Write the report

Create `reports/YYYY-MM-DD.md` with frontmatter (`type: watchdog-report`). Sections:
1. **Verdict**: one paragraph, plain language. Lead with anything alarming, otherwise "steady".
2. **Daily numbers**: yesterday's views, submissions, contacts vs 7-day average.
3. **Alerts fired** (or "none").
4. **Open issues**: status of each item in `known_issues_open`, note any fixed (remove from baseline) or new (add).
5. **One suggestion**: a single highest-leverage ranking action for today, concrete and small.

## Step 5: Update baseline and commit

1. Update `baseline.json`: refresh `aggregates_30d`, append the completed week to `weekly_series` when a week closes, keep `top_pages_30d` current, sync `known_issues_open`.
2. Commit both files to the branch this session designates and push. Keep the commit message `watchdog: daily report YYYY-MM-DD`.

## Step 6: Escalation

If any alert fired, say so clearly at the top of the session summary so it reaches Dillon's inbox/brief. Do not silently log critical alerts. If nothing fired, keep the summary to two sentences.

## Standing context

- Company: Align HCM, HCM implementation and post-go-live support (SmartCare). Key platforms: Workday, UKG, Dayforce, Paylocity, HiBob, ADP.
- Conversion pages that matter: /contact, /partners/brokers, meeting scheduler pages.
- Traffic engine: blog buyer's guide series.
- Live dashboard artifact: "Align HCM Live Site Analytics" at https://claude.ai/code/artifact/d915fe04-6e26-483d-a932-df4fe4562f3a (pulls HubSpot data in real time via connector; no daily update needed).
- Initial audit with full issue detail: `reports/2026-07-16.md`.
