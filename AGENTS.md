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

There is **no root `package.json` for the vault itself**, no Docker. Node (v18+),
npm, and Python 3 are available; the startup update script runs `npm install`
for the two npm-based sites below.

### Services / products and how to run them (dev mode)

| Product | Location | Dev command | URL | Notes |
|---|---|---|---|---|
| D.I.L.L.O.N. OS (HUD) — flagship | `_os/` | `node _os/server.js` | http://127.0.0.1:4242 | Reads the vault + `12_Brain` live. `GET /api/state` includes `brain` vitals. |
| IMMOHRTAL site | `immohrtal-site/` | `npm run dev` | http://localhost:5173 | Vite 6 + React 19. Append `?forcegl` in headless/VM browsers. |
| Shadow HVAC site | `01_Clients/Shadow HVAC/website/` | `npm run dev` | http://localhost:3000 | Next.js 15. First route compile is slow. |
| Mohr Media site | `mohr-media-site/` | `python3 -m http.server 8080` | http://localhost:8080 | Static HTML/JS/WebGL. |
| Philly 25 gallery | `philly-sites/` | `python3 -m http.server 8080` | http://localhost:8080 | Static HTML. |
| Client report builder (CLI) | `_os/reporting/` | `node _os/reporting/build-report.js <data.json>` | — | Writes HTML into `Daily-Briefs/reports/`. |

### Tests / lint

```
node --test _os/test/*.test.js _os/automation/tests/*.test.js
node _os/automation/bin/wiki-lint.js --strict
```

- Deterministic tests cover `12_Brain` structure, HUD brain vitals, skill path wiring, public-safety scanning, the wiki lint rule engine, and the automation stack. CI runs both commands plus `_templates/site-factory/tests/` — see `.github/workflows/vault-checks.yml`.
- `wiki-lint` enforces the writing rules in `CLAUDE.md`: `source:`/`expires:` provenance, resolvable `[[wikilinks]]`, and reachability from `12_Brain/INDEX.md`. Policy lives in `12_Brain/registry/wiki-lint.json`. It is read-only and never edits notes; `--strict` exits 1 on any error.
- **Adding or moving a page under `12_Brain/` requires updating `12_Brain/INDEX.md` (or a folder index INDEX links) in the same change**, or `index-reachable` fails.
- `01_Clients/Shadow HVAC/website` declares `npm run lint` (`next lint`) but has no ESLint config — interactive only; do not run non-interactively.
- `immohrtal-site` has no lint script.

### Non-obvious caveats

- **D.I.L.L.O.N. OS Command Deck needs the `claude` CLI on PATH** for skill buttons. The dashboard (vitals/directives/brain counts) works without it.
- **HUD polls `/api/state` every 15s.** Vault edits (including under `12_Brain/`) show up without a server restart.
- **Git is source of truth for agent writes.** Obsidian Sync may be used by the human operator on a signed-in desktop; do not race Sync + an agent rewriting the same files. Live Sync verification (desktop vault matching this Git tree) remains an **operator gate after merge**.
- IMMOHRTAL list signup posts to a hosted Netlify form backend; locally the UI renders but submission won't persist.
