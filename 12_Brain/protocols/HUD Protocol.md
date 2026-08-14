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
5. Loopback HUD writes via `/api/inbox`, `/api/directive`, `/api/today`, and
   `/api/queue-skill`. Claude jobs still only start from `/api/run` on loopback.
6. Phone HUD (https://dillon-os-hud.netlify.app) is an operator: capture to
   `00_Inbox/phone/`, tap Today checkboxes, open the Jesse sheet / live sites,
   queue skills. Claude Command Deck jobs still do not run on that origin.
   Hosted writes use a phone-stored GitHub token (Contents: read/write).
