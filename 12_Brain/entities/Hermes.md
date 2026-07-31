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

## Cloud agent bridge

Cursor cloud agents cannot reach Mac localhost CDP. For shared control:

1. Dillon runs Hermes locally for logged-in apply work.
2. Cloud agents use Composio `BROWSER_TOOL` MCP (`~/.cursor/plugins/local/composio-browser/`).
3. Share Composio **liveUrl** from GetSession so Dillon watches the cloud browser on the TV.

Requires `COMPOSIO_API_KEY` in Cursor MCP secrets.

## Links

- [[12_Brain/protocols/browser-control-routing|browser-control-routing]]
- [[12_Brain/entities/Claude in Chrome|Claude in Chrome]]
- [[12_Brain/entities/Codex Workspace (Legacy)|Codex Workspace (Legacy)]]
- [[12_Brain/concepts/Google Docs Sharding Pattern|Google Docs Sharding Pattern]]
