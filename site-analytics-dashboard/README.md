# Align HCM Site Analytics Dashboard (Netlify-ready)

Static dashboard for alignhcm.com marketing analytics and attribution. No build step, no server code, no API keys in the browser.

## How it works

- `index.html` renders everything from `data.json`.
- `data.json` is refreshed by the Align HCM Site Health Watchdog (see `02_FullTimeJob/AlignHCM/Watchdog/PLAYBOOK.md`) on every scheduled run. `Refresh-Dashboard.ps1 -Publish` validates portal `242825734`, recalculates verified owned-channel wins with conflict checks, refreshes contact/AEO counts, performs the full-site crawl, verifies crawler access, commits, and pushes.
- When the repo is connected to Netlify, every push triggers a redeploy, so the published dashboard updates automatically each time the watchdog fires.
- `Refresh-Dashboard.ps1` also refreshes live per-form conversion counts and reruns the production attribution, blog CTA, canonical, redirect, IndexNow, AI crawler, sitemap, internal-link, GA4, HubSpot tracking, and conversion-coverage checks on every run.
- HubSpot crawler assets are maintained without the HubSpot website by `02_FullTimeJob/AlignHCM/Watchdog/ai-crawler-unblock/Publish-FromTerminal.ps1`.

## Publishing to Netlify

Protected production dashboard: <https://align-hcm-site-health-dashboard.netlify.app>

- Netlify site: `align-hcm-site-health-dashboard`
- Deploy branch: `claude/site-health-watchdog-ubfzcb`
- Build command: none
- Publish directory: `site-analytics-dashboard`
- Data source: live HubSpot portal `242825734`; no submitted field values are written to `data.json`.
- Visitor password: Windows Credential Manager reference `windows-credential://Codex.Netlify.AlignHCM.SiteHealthDashboard.v1`

Subsequent pushes to the deploy branch redeploy automatically. Keep Netlify password protection enabled because the dashboard contains confidential revenue information.

Do not put the visitor password, HubSpot private access token, or any other secret in this repository.

## Data layers

- **Verified owned-channel origin** (`channelRevenue`): live closed-won amount for new-business deals created and closed in the reporting window where the deal-level source is Organic Search, Direct Traffic, or Organic Social and no partner, vendor, rep, meeting-link, renewal, existing-client, or change-request evidence contradicts it.
- **CRM-reported Website** (`channelRevenue.crmReportedWebsite`): manual Website lead-source revenue shown separately at medium confidence. It is never added to verified origin.
- **Excluded conflicts** (`channelRevenue.excludedConflicts`): owned-looking traffic-source labels contradicted by stronger CRM evidence. These are disclosed, not credited.
- **Touch attribution** (`touchAttribution`): HubSpot campaign attribution (LINEAR), measures marketing influence across touchpoints. Complementary, not the same measure.
- **Content analytics** (`kpis`, `monthly`, `blogs`, `topPages`): HubSpot first-party tracking, window fixed at 2026-01-26 to today.
- **AEO** (`aeo`, `sources`): AI-platform referrals from CRM contact data.
- **Site coverage** (`siteCoverage`): every sitemap URL plus discovered internal targets, with final status, redirects, GA4/HubSpot tracking, conversion paths, sandbox-link checks, and SmartCare form checks.

## Standing directives

- AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) must have full access to alignhcm.com. Never ship or recommend anything that blocks them. The watchdog verifies and raises a critical alert if blocked.
- Reporting window always starts 2026-01-26 so every refresh is comparable.
- A watchdog run is incomplete until `02_FullTimeJob/AlignHCM/Watchdog/Refresh-Dashboard.ps1 -Publish` succeeds and the Netlify production deploy reaches `ready`.
