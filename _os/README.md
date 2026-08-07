# D.I.L.L.O.N. OS

A visual agentic OS: Claude Code wrapped in a clickable HUD, wired to this
Obsidian vault — including the canonical **`12_Brain/`** second-brain layer.
Zero dependencies — plain Node.

```
node _os/server.js
# → http://127.0.0.1:4242
```

Requires Node 18+ and the `claude` CLI on PATH (only needed for the Command
Deck buttons; the dashboard itself works without it).

## What's on screen

| Region | Source |
|---|---|
| **System Vitals** | live counts from the vault: notes, open/done tasks, inbox depth, clients/content/agents, plus **12_Brain** wiki counts (entities/concepts/decisions/…) and a 14-day activity sparkline |
| **Directives** | `## Today` checkboxes in `Dashboard.md`, topped up from the latest daily brief's priority stack |
| **Documents** | most recently modified notes |
| **Core + hero number** | `System/OS Config.md` frontmatter — `primary_directive`, `goal_current`, `goal_target` |
| **Command Deck** | one button per skill in `.claude/skills/` — daily ops plus brain loops (`session-mine`, `vault-compile`, `wiki-lint`, `synthesize`, `research-sweep`) |
| **Schedule** | the `## Schedule` list in `System/OS Config.md` |
| **AI Wire** | recent vault activity when idle; live Claude output while a skill runs |

`GET /api/state` returns `vitals` plus a structured `brain` object for the
`12_Brain/` layer. Do not create a competing `1Z_Brain/` tree.

## The one-click skills

Defined in `.claude/skills/`, all vault-native (they read the vault and write
results back into `Daily-Briefs/` or `12_Brain/`):

Daily: `am-report` · `inbox-brief` · `plan-today` · `client-pulse` · `metrics-pull`
· `content-scan` · `week-review` · `vault-clean`

Brain: `session-mine` · `vault-compile` · `wiki-lint` · `synthesize` · `research-sweep`

They also work straight from a terminal: `claude "/am-report"`.

## Tests

```
node --test _os/test/brain-hud.test.js _os/test/public-safety.test.js _os/test/webhook-gateway.test.js
```

Deterministic checks for `12_Brain` structure, no `1Z_Brain` rival, skill path
rewrites, HUD `buildState()` brain vitals, authenticated webhook handling, and
public-safety scanning (no emails, phones, credential shapes, locators, or private
absolute paths in tracked brain files).

## Customizing

- Edit `System/OS Config.md` **in Obsidian** — callsign, directive, goal,
  schedule. The HUD picks it up on the next sync (every 15s).
- Edit the brain layer under `12_Brain/` — see `12_Brain/INDEX.md` and
  `12_Brain/System/Second Brain Ops.md`.
- Drop a new folder with a `SKILL.md` into `.claude/skills/` and it appears on
  the Command Deck automatically.
- `OS_PORT` / `OS_HOST` env vars override the default `127.0.0.1:4242`.
  The server binds loopback only and only runs skills that exist in
  `.claude/skills/` — nothing arbitrary is executable from the browser.
