# D.I.L.L.O.N. OS

A visual agentic OS: Claude Code wrapped in a clickable HUD, wired to this
Obsidian vault. Zero dependencies — plain Node.

```
node _os/server.js
# → http://127.0.0.1:4242
```

Requires Node 18+ and the `claude` CLI on PATH (only needed for the Command
Deck buttons; the dashboard itself works without it).

## What's on screen

| Region | Source |
|---|---|
| **System Vitals** | live counts from the vault: notes, open/done tasks, inbox depth, clients/content/agents, plus a 14-day activity sparkline from file mtimes |
| **Directives** | `## Today` checkboxes in `Dashboard.md`, topped up from the latest daily brief's priority stack |
| **Documents** | most recently modified notes |
| **Core + hero number** | `System/OS Config.md` frontmatter — `primary_directive`, `goal_current`, `goal_target` |
| **Command Deck** | one button per skill in `.claude/skills/` — click to run it headlessly (`claude -p "/skill" --permission-mode acceptEdits`) with live output streamed into the AI Wire panel |
| **Schedule** | the `## Schedule` list in `System/OS Config.md` |
| **AI Wire** | recent vault activity when idle; live Claude output while a skill runs |

## The one-click skills

Defined in `.claude/skills/`, all vault-native (they read the vault and write
results back into `Daily-Briefs/`):

`competitive-task-orchestrator` · `am-report` · `inbox-brief` · `plan-today` · `client-pulse` · `metrics-pull`
· `content-scan` · `week-review` · `vault-clean`

They also work straight from a terminal: `claude "/am-report"`.

## Customizing

- Edit `System/OS Config.md` **in Obsidian** — callsign, directive, goal,
  schedule. The HUD picks it up on the next sync (every 15s).
- Drop a new folder with a `SKILL.md` into `.claude/skills/` and it appears on
  the Command Deck automatically.
- `OS_PORT` / `OS_HOST` env vars override the default `127.0.0.1:4242`.
  The server binds loopback only and only runs skills that exist in
  `.claude/skills/` — nothing arbitrary is executable from the browser.
