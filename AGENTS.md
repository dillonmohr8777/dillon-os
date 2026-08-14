# AGENTS.md

## Vault map (start here)

This repo is **Dillon OS** — Dillon Mohr's Obsidian vault + agentic OS.

- **Canonical second-brain layer:** `12_Brain/` (front door: `12_Brain/INDEX.md`)
- **Do not create `1Z_Brain/`** or any competing brain tree.
- **GitHub is PUBLIC.** Sensitive notes → `12_Brain/private/` (gitignored). See `12_Brain/private/README.md`.
- Working folders (`00_Inbox` … `11_Agents`) stay outside `12_Brain/`; link, don't duplicate clients.
- Root `CLAUDE.md` has writing/reading rules. Ops loops: `12_Brain/System/Second Brain Ops.md`.
- Health automation status: `System/routine-health.md` (linked from `12_Brain/System/Health Automation.md`).

## Cursor Cloud specific instructions

There is **no root `package.json` for the vault itself**, no Docker. Node 22,
npm, and Python 3 are on the image. The Cloud Agent environment is
**dashboard-managed** (no committed `.cursor/environment.json` — a repo file
would override the personal config). Canonical install:

```
bash _os/dev/bin/cloud-agent-install.sh
```

That script `npm ci`s `immohrtal-site`, `01_Clients/Shadow HVAC/website`, and
`_os/radar-engine` when lockfiles exist. It must terminate.
HUD start belongs in the dashboard `start` field as `node _os/server.js`
(detached; logs under `/tmp/cursor/start-user/`). Do not start Mohr Media and
Philly 25 together — both bind port 8080.

### Services / products and how to run them (dev mode)

| Product | Location | Dev command | URL | Notes |
|---|---|---|---|---|
| D.I.L.L.O.N. OS (HUD) — flagship | `_os/` | `node _os/server.js` | http://127.0.0.1:4242 | Reads the vault + `12_Brain` live. `GET /api/state` includes `brain` vitals. |
| IMMOHRTAL site | `immohrtal-site/` | `npm run dev` | http://localhost:5173 | Vite 6 + React 19. Append `?forcegl` in headless/VM browsers. |
| Shadow HVAC site | `01_Clients/Shadow HVAC/website/` | `npm run dev` | http://localhost:3000 | Next.js 15. First route compile is slow. |
| Mohr Media site | `mohr-media-site/` | `python3 -m http.server 8080` | http://localhost:8080 | Static HTML/JS/WebGL. |
| Philly 25 gallery | `philly-sites/` | `python3 -m http.server 8080` | http://localhost:8080 | Static HTML. |
| Client report builder (CLI) | `_os/reporting/` | `node _os/reporting/build-report.js <data.json>` | — | Writes HTML into `Daily-Briefs/reports/`. |

### MCP servers

Cloud Agents already have Gmail, Slack, Calendar, Drive, and X when those
servers report `ready`. **Draft-first:** never send, publish, or spend from
research or MCP output. See `12_Brain/concepts/Draft-First Operating Rules.md`.

`.cursor/mcp.json` and `.mcp.json` register one *project* server, `landingfolio`.
It reads `LANDINGFOLIO_TOKEN` and **is inert until that variable is set** — no
token lives in this repo. Unset degrades to harvest-only design. Status:
`12_Brain/entities/LandingFolio MCP.md`. Still **sandbox-only** until an
operator runs `node _os/automation/bin/landingfolio-verify.js`. Any new MCP
goes through `_os/automation/bin/mcp-gate.js` first. Cloud boot notes:
`12_Brain/entities/Cursor Cloud Environment.md`.

### Tests / lint

```
node --test _os/test/brain-hud.test.js _os/test/public-safety.test.js _os/test/cloud-agent-env.test.js
```

- Deterministic tests cover `12_Brain` structure, HUD brain vitals, skill path wiring, and public-safety scanning.
- `01_Clients/Shadow HVAC/website` declares `npm run lint` (`next lint`) but has no ESLint config — interactive only; do not run non-interactively.
- `immohrtal-site` has no lint script.

### Non-obvious caveats

- **D.I.L.L.O.N. OS Command Deck needs the `claude` CLI on PATH** for skill buttons. The dashboard (vitals/directives/brain counts) works without it.
- **HUD polls `/api/state` every 15s.** Vault edits (including under `12_Brain/`) show up without a server restart.
- **Git is source of truth for agent writes.** Obsidian Sync may be used by the human operator on a signed-in desktop; do not race Sync + an agent rewriting the same files. Live Sync verification (desktop vault matching this Git tree) remains an **operator gate after merge**.
- IMMOHRTAL list signup posts to a hosted Netlify form backend; locally the UI renders but submission won't persist.
