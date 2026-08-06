---
name: site-watchdog
description: Daily Align HCM site health run — crawl alignhcm.com, score it, diff against yesterday, pull HubSpot analytics + web leads, and file a prioritized brief to Daily-Briefs.
---

# Site Watchdog

Audit the Align HCM website and report only what changed and what matters.
Reference deep-dive: `SEO/AlignHCM/Watchdog/DEEP-DIVE-2026-07-17.md`.

## Steps

1. **Crawl.** Run `node _os/watchdog/watchdog.mjs` from the vault root (~60s,
   zero deps). It writes `SEO/AlignHCM/Watchdog/reports/YYYY-MM-DD.{json,md}`
   and updates `latest.json` + `history.jsonl`.

2. **Diff.** From the new report: overall score and per-category deltas vs the
   previous run, `newIssues`, `resolvedIssues`. New critical/high issues are
   the headline. If the score dropped ≥5 points, lead with why.

3. **HubSpot pulse** (skip gracefully if HubSpot MCP tools are unavailable in
   this session — say so in one line):
   - Content analytics TOTALS for the last 7 days (views, submissions, leads;
     compare to prior week).
   - Web leads: CONTACT records created in the last 7 days where
     `hs_analytics_source != OFFLINE` — list name, company, source, conversion.
   - Flag any day with zero submissions site-wide (possible form breakage).

4. **SSL + uptime.** Report `sslDaysLeft` from the report if under 21 days.

5. **Write the brief** to `Daily-Briefs/site-watchdog-YYYY-MM-DD.md`:
   - Score line: `NN/100 (Δ vs last run) · X new issues · Y resolved`
   - New issues with severity and one-line fixes (omit section if none)
   - Week's web leads table
   - One "next best action" — the highest-impact open item, drawn from the
     P0/P1/P2 plan in the deep-dive (keep pointing at the same item until it's
     done or superseded)

6. **Stay quiet when healthy.** If nothing new, no leads, and no score change,
   the brief is three lines. Never pad.

## Notes

- SERP position checks: Bing/DDG scraping is bot-blocked from cloud runners;
  use the WebSearch tool for spot checks of the money keywords (list in
  deep-dive §6) on Mondays only.
- If a SEMrush/Moz API key is configured in `_os/watchdog/config.json`
  (`semrushKey`/`mozToken`), include Authority Score and backlink deltas.
- The Netlify dashboard (align-hcm-site-health-dashboard.netlify.app) is the
  live-glance layer; this skill is the depth layer. Don't duplicate its charts.
