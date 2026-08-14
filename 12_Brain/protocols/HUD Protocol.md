---
tags: [protocol]
updated: 2026-08-14
source: "[[_os/README]]"
---

# HUD Protocol

**Summary:** D.I.L.L.O.N. OS (`_os/server.js`) reads this Git vault live.

1. Run `node _os/server.js` from the vault root → `http://127.0.0.1:4242`.
2. `GET /api/state` returns vitals including `12_Brain` counts (entities,
   concepts, projects, decisions, memory notes).
3. Browser polls every 15s — no restart needed after vault edits.
4. Command Deck skills include brain loops (`vault-compile`, `wiki-lint`,
   `synthesize`, `session-mine`, `research-sweep`) when the `claude` CLI is on PATH.
5. The HUD never writes the vault itself except via skill jobs.
6. Phone view is a **read-only snapshot** at https://dillon-os-hud.netlify.app
   (`node _os/bin/export-hud.js` then `node _os/bin/hud-deploy.js`). Add to
   Home Screen. Skills do not run on that origin. Loopback stays the only
   Command Deck.
