---
tags: [entity, tool]
source: "[[12_Brain/raw/2026-06-26 - intel-core-7-master-operating-transfer]] · NousResearch Hermes Agent browser docs"
updated: 2026-07-31
---

# Hermes

Local worker agent — originally on the retired Intel Core 7 machine inside **Orgo** ("Hermes Agent Desktop"). That machine was Hermes' authoritative home for auth/provider state, so **legacy Orgo Hermes state is orphaned**.

**Current path (2026-07):** [NousResearch Hermes Agent](https://hermes-agent.nousresearch.com/docs/user-guide/features/browser) on Dillon's Mac with browser automation. Cloud Cursor agents reach browser work through **Composio Browser Tool** (see [[12_Brain/protocols/browser-control-routing|browser-control-routing]]).

## Browser backends (Hermes)

| Mode | Use |
|------|-----|
| `/browser connect` (CDP) | Attach to running Chrome/Brave/Edge — logged-in sessions, watch on TV |
| Browser Use / Browserbase / Firecrawl | Cloud execution inside Hermes |
| Local `agent-browser` | Headless Chromium when no cloud keys |

CDP attach (Mac):

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
# Hermes terminal only:
/browser connect
```

## Legacy Orgo state (2026-06 snapshot)

12 active cron jobs, 3 local webhook routes (localhost:8644), dashboard port 9119/9120. Slack auth broken; email/SMS/Discord never configured. Google Docs ingest prefix: `Dillon OS Hermes Orgo Vault -`.

## Local control lane — `hermes-local-control`

Take over the Mac Hermes desktop agent (TV-visible Chrome):

```bash
bash _os/tools/hermes-local-control.sh
hermes chat
/browser connect
```

Skill: `.claude/skills/hermes-local-control/` · Handoff: `handoffs/hermes-local-control.md`

## Cloud agent bridge

Cursor cloud agents cannot reach Mac localhost CDP. For shared control:

1. Dillon runs **hermes-local-control** for logged-in apply work on the TV.
2. Cloud agents use Composio `BROWSER_TOOL` when Enhanced Controls allow it.
3. Share Composio **liveUrl** from GetSession for a separate cloud browser stream.

If Composio returns `Tool execution denied by user`, set Browser Tool to Always allow in Enhanced Controls — or stay on hermes-local-control.

## Links

- [[12_Brain/protocols/browser-control-routing|browser-control-routing]]
- [[12_Brain/entities/Claude in Chrome|Claude in Chrome]]
- [[12_Brain/entities/Codex Workspace (Legacy)|Codex Workspace (Legacy)]]
- [[12_Brain/concepts/Google Docs Sharding Pattern|Google Docs Sharding Pattern]]
