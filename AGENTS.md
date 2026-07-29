# AGENTS.md

## Cursor Cloud specific instructions

This repo is **Dillon OS** — an Obsidian markdown vault ("second brain") that also
contains several independent, runnable web/CLI products. There is **no root
`package.json`, no test runner, no CI, and no Docker**. Each product is run on its
own. Node (v18+), npm, and Python 3 are already available in the environment; the
startup update script runs `npm install` for the two npm-based sites below.

### Services / products and how to run them (dev mode)

| Product | Location | Dev command | URL | Notes |
|---|---|---|---|---|
| D.I.L.L.O.N. OS (HUD) — flagship | `_os/` | `node _os/server.js` | http://127.0.0.1:4242 | Zero-dependency Node server; reads the vault live. Binds loopback only. `OS_PORT`/`OS_HOST` override the default. |
| IMMOHRTAL site | `immohrtal-site/` | `npm run dev` | http://localhost:5173 | Vite 6 + React 19. In a headless/VM browser, append `?forcegl` to the URL to force WebGL. |
| Shadow HVAC site | `01_Clients/Shadow HVAC/website/` | `npm run dev` | http://localhost:3000 | Next.js 15 (App Router). Routes compile on first request (first load is slow). |
| Mohr Media site | `mohr-media-site/` | `python3 -m http.server 8080` | http://localhost:8080 | Static HTML/JS/WebGL, no build step. |
| Philly 25 gallery | `philly-sites/` | `python3 -m http.server 8080` | http://localhost:8080 | Static HTML. |
| Client report builder (CLI) | `_os/reporting/` | `node _os/reporting/build-report.js <data.json>` | — | Writes HTML into `Daily-Briefs/reports/`. |

### Non-obvious caveats

- **D.I.L.L.O.N. OS Command Deck needs the `claude` CLI on PATH**, which is NOT
  installed here. The dashboard itself (vitals, directives, documents) works fully
  without it; only the skill-launch buttons require `claude`.
- **The HUD reads the vault live and the browser polls `/api/state` every 15s.**
  To verify vault→HUD wiring, add/edit a markdown note and the vitals/documents
  update within ~15s (no server restart needed). Data endpoint: `GET /api/state`.
- **Lint is effectively unconfigured.** `01_Clients/Shadow HVAC/website` declares
  `npm run lint` (`next lint`) but has no ESLint config, so it drops into an
  interactive setup prompt — do not run it non-interactively. `immohrtal-site` has
  no lint script. There is no repo-wide linter.
- **No automated tests exist** anywhere in the repo. Verify changes by running the
  relevant service and exercising it manually.
- The IMMOHRTAL and Shadow HVAC apps keep `node_modules` gitignored; run their dev
  servers from their own directories (or `npm --prefix <dir> run dev`).
- IMMOHRTAL contact/list signup posts to a hosted Netlify form backend and only
  works on a Netlify origin; locally the form UI renders but submission won't
  persist.
