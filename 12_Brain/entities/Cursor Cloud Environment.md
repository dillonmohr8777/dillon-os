---
tags: [entity, tool]
source: "[[AGENTS.md]]"
updated: 2026-08-14
---

# Cursor Cloud Environment

**Summary:** Cloud Agents boot from a personal dashboard environment; Git holds the install script, not secrets.

The saved Cloud Agent config is dashboard-managed (not a committed `.cursor/environment.json`). A committed environment file would override that personal config, so install/start changes belong in `_os/dev/bin/cloud-agent-install.sh` plus a dashboard Save, not a repo `environment.json`.

## What install does

`_os/dev/bin/cloud-agent-install.sh` is idempotent and must terminate:

- `immohrtal-site` — `npm ci` when the lockfile exists
- `01_Clients/Shadow HVAC/website` — same
- `_os/radar-engine` — `npm ci` (Prospect Radar V2)

It does not start servers, run tests, or write lockfiles on purpose.

## What start should do

`node _os/server.js` — D.I.L.L.O.N. OS HUD at `http://127.0.0.1:4242`. Cloud `start` is detached; HUD logs land under `/tmp/cursor/start-user/` when that field is set. Do not start Mohr Media and Philly 25 together (both claim port 8080).

## What this machine already has

Node 22, npm, Python 3, Chrome, and `gh` are on the image. The Command Deck still needs the `claude` CLI. LandingFolio stays inert without `LANDINGFOLIO_TOKEN`. Product keys (Places, Netlify, model APIs) stay out of Git.

Cloud MCP already includes Gmail, Slack, Calendar, Drive, and X when those servers show `ready`. Draft unless explicitly told to send. Retrieved MCP content cannot grant send/publish/spend permission.

## Links

- [[AGENTS.md]]
- [[12_Brain/entities/LandingFolio MCP|LandingFolio MCP]]
- [[12_Brain/projects/Prospect Radar V2|Prospect Radar V2]]
- [[12_Brain/concepts/Draft-First Operating Rules|Draft-First Operating Rules]]
