# Codex Task: Push Momentum 360 Agents Site Live

**From:** Claude (dillon-os session, 2026-07-04)
**Priority:** Ship today
**Target:** https://momentum-360-agents.netlify.app

## What this is

The Momentum 360 Agents site was rebuilt as a static landing page in the exact design of momentum-360-landing.netlify.app, using Dillon's exact logo. It's done, verified in headless Chromium (desktop + mobile, forms, menu, counters), and sitting in the repo waiting to deploy.

- **Repo:** dillonmohr8777/dillon-os
- **Branch:** `claude/agentic-netlify-redesign-7y2s40` (PR #145)
- **Folder:** `momentum-360-agents-site/`
- **Contents:** `index.html` (fully self-contained — inline CSS, base64 logo), `momentum-360-logo.png`, `assets/badges/` (5 images), `README-DEPLOY.md`

## Deploy instructions

Use the existing Netlify deploy lane. No build step — it's pure static.

```bash
git clone --branch claude/agentic-netlify-redesign-7y2s40 https://github.com/dillonmohr8777/dillon-os.git
cd dillon-os/momentum-360-agents-site
netlify deploy --prod --dir . --site momentum-360-agents
```

This replaces the current Next.js chat-tile app on momentum-360-agents.netlify.app with the new landing page. If the site ID lookup fails, find it with `netlify sites:list` (site name: momentum-360-agents).

## Post-deploy checks

1. https://momentum-360-agents.netlify.app loads the new navy/gold landing page (title: "Momentum 360 Agents | Your Marketing Team, On Tap")
2. Logo renders in nav + footer; favicon is the round M mark
3. Both forms ("Ask Your First Question" hero panel, "Ask The Agents Anything" bottom) show their success state on submit
4. Montserrat/Inter load from Google Fonts (they were proxied out in the build sandbox, so verify live)

## Known follow-up (not blocking)

The two forms log payloads to console and show a success message but don't POST anywhere yet. Search `index.html` for `TODO: POST` to wire HubSpot/CRM later.
