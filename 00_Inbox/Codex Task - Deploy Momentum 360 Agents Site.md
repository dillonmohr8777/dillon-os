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

## Deploy instructions (UPDATED — now a full RAG build)

The site now has a live RAG backend (19 agents, playbook knowledge base, `/api/ask`
Netlify Function). It needs a **git-connected Netlify site + env vars**, not a drag-and-drop.

1. Link the Netlify site `momentum-360-agents` to repo `dillonmohr8777/dillon-os`,
   base directory `momentum-360-agents-site`, branch `main` (after PR #145 merges) or
   `claude/agentic-netlify-redesign-7y2s40` for preview. Build command/publish dir come
   from `netlify.toml`.
2. Set env var `OPENAI_API_KEY` (required — build fails loudly without it). Optional:
   `OPENAI_MODEL` (default gpt-5.5), `OPENAI_FALLBACK_MODEL` (default gpt-4o),
   `EMBED_MODEL` (default text-embedding-3-small), `LEAD_WEBHOOK_URL` (lead forwarding).
3. Deploy. CLI lane alternative:
   ```bash
   netlify link --name momentum-360-agents
   netlify env:set OPENAI_API_KEY sk-...
   netlify deploy --prod   # from momentum-360-agents-site/, builds via netlify.toml
   ```

Full details: `momentum-360-agents-site/README-DEPLOY.md`.

## Post-deploy checks

1. https://momentum-360-agents.netlify.app loads the new navy/gold landing page (title: "Momentum 360 Agents | Your Marketing Team, On Tap")
2. Logo renders in nav + footer; favicon is the round M mark
3. Ask a real question in the hero panel — a specialist name (e.g. "Review Manager • Win Customers") and a grounded answer should render in seconds
4. Same for the bottom "Ask The Agents Anything" card
5. Montserrat/Inter load from Google Fonts (they were proxied out in the build sandbox, so verify live)
