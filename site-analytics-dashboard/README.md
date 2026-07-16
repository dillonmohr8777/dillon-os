# Align HCM Site Analytics Dashboard (Netlify-ready)

Static dashboard for alignhcm.com marketing analytics and attribution. No build step, no server code, no API keys in the browser.

## How it works

- `index.html` renders everything from `data.json`.
- `data.json` is refreshed by the Align HCM Site Health Watchdog (see `02_FullTimeJob/AlignHCM/Watchdog/PLAYBOOK.md`) on every scheduled run. `Refresh-Dashboard.ps1 -Publish` validates portal `242825734`, recalculates the selected-channel wins, refreshes contact/AEO counts, verifies crawler access, commits, and pushes.
- When the repo is connected to Netlify, every push triggers a redeploy, so the published dashboard updates automatically each time the watchdog fires.
- HubSpot crawler assets are maintained without the HubSpot website by `02_FullTimeJob/AlignHCM/Watchdog/ai-crawler-unblock/Publish-FromTerminal.ps1`.

## Publishing to Netlify

Protected production dashboard: <https://align-hcm-site-health-dashboard.netlify.app>

- Netlify site: `align-hcm-site-health-dashboard`
- Deploy branch: `claude/site-health-watchdog-ubfzcb`
- Build command: none
- Publish directory: `site-analytics-dashboard`
- Visitor password: Windows Credential Manager reference `windows-credential://Codex.Netlify.AlignHCM.SiteHealthDashboard.v1`

Subsequent pushes to the deploy branch redeploy automatically. Keep Netlify password protection enabled because the dashboard contains confidential revenue information.

Do not put the visitor password, HubSpot private access token, or any other secret in this repository.

## Data layers

- **Strict channel origin** (`channelRevenue`): live closed-won deal amount where the deal-level Original Traffic Source is Organic Search, Direct Traffic, or Organic Social. Associated-contact-only matches and assisted touch credit are excluded.
- **Touch attribution** (`touchAttribution`): HubSpot campaign attribution (LINEAR), measures marketing influence across touchpoints. Complementary, not the same measure.
- **Content analytics** (`kpis`, `monthly`, `blogs`, `topPages`): HubSpot first-party tracking, window fixed at 2026-01-26 to today.
- **AEO** (`aeo`, `sources`): AI-platform referrals from CRM contact data.

## Standing directives

- AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) must have full access to alignhcm.com. Never ship or recommend anything that blocks them. The watchdog verifies and raises a critical alert if blocked.
- Reporting window always starts 2026-01-26 so every refresh is comparable.
- A watchdog run is incomplete until `02_FullTimeJob/AlignHCM/Watchdog/Refresh-Dashboard.ps1 -Publish` succeeds and the Netlify production deploy reaches `ready`.
