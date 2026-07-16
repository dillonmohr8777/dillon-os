# Align HCM Site Analytics Dashboard (Netlify-ready)

Static dashboard for alignhcm.com marketing analytics and attribution. No build step, no server code, no API keys in the browser.

## How it works

- `index.html` renders everything from `data.json`.
- `data.json` is refreshed by the Align HCM Site Health Watchdog (see `02_FullTimeJob/AlignHCM/Watchdog/PLAYBOOK.md`) on every scheduled run. Each run pulls fresh HubSpot data, rewrites this file, commits, and pushes.
- When the repo is connected to Netlify, every push triggers a redeploy, so the published dashboard updates automatically each time the watchdog fires.
- HubSpot crawler assets are maintained without the HubSpot website by `02_FullTimeJob/AlignHCM/Watchdog/ai-crawler-unblock/Publish-FromTerminal.ps1`.

## Publishing to Netlify

1. In Netlify: Add new site > Import from Git > pick this repo and branch.
2. Build command: none. Publish directory: `site-analytics-dashboard`.
3. Deploy. Done. Subsequent watchdog pushes redeploy automatically.

Heads up: a public Netlify URL makes this data readable by anyone with the link. The RevOps section mirrors an internal, confidential briefing. Use Netlify's password protection or a private/obscured URL if that matters.

## Data layers

- **RevOps verified** (`revops`): canonical won-deal attribution from the Revenue Operations reconciliation export (currently as of Jul 15, 2026: $162K won, 8 engagements). The watchdog does NOT overwrite this with naive pipeline sums; it updates only when a new reconciliation export is provided.
- **Touch attribution** (`touchAttribution`): HubSpot campaign attribution (LINEAR), measures marketing influence across touchpoints. Complementary, not the same measure.
- **Content analytics** (`kpis`, `monthly`, `blogs`, `topPages`): HubSpot first-party tracking, window fixed at 2026-01-26 to today.
- **AEO** (`aeo`, `sources`): AI-platform referrals from CRM contact data.

## Standing directives

- AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) must have full access to alignhcm.com. Never ship or recommend anything that blocks them. The watchdog verifies and raises a critical alert if blocked.
- Reporting window always starts 2026-01-26 so every refresh is comparable.
