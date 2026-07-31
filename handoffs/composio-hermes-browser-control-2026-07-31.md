# Hermes + Composio browser control — enable now

Updated: 2026-07-31

## Goal

Let Cursor cloud agents control a browser Dillon can watch (TV monitor), using Composio Browser Tool instead of unreachable Mac localhost CDP.

## Blocker right now

This cloud run has **no `COMPOSIO_API_KEY`**. Playwright MCP also failed (Playwright MCP Bridge extension not connected).

## Finish setup (5 minutes)

### 1. Composio API key

1. Open https://app.composio.dev → Settings → API Keys
2. In **Cursor Desktop** → Settings → MCP → Secrets, add:
   - `COMPOSIO_API_KEY` = your key
   - `COMPOSIO_USER_ID` = `dillon-os` (optional)

### 2. Bootstrap MCP server

On Mac terminal:

```bash
pip install composio-core
export COMPOSIO_API_KEY=your_key_here
python3 ~/.cursor/plugins/local/composio-browser/mcp/bootstrap-composio-browser.py
```

Paste the printed JSON into Cursor Settings → MCP.

### 3. Hermes local (optional — for logged-in Chrome)

If you want Hermes driving your Mac Chrome (what's on the TV now):

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

In Hermes terminal: `/browser connect`

### 4. Restart cloud agent

Re-run this agent after MCP is wired. First command to agent:

> "Open example.com with Composio browser and give me the live watch URL."

## What the agent will do once wired

1. `BROWSER_TOOL_CREATE_TASK` with your instructions
2. `BROWSER_TOOL_GET_SESSION` → share liveUrl for TV
3. `BROWSER_TOOL_WATCH_TASK` → return results/screenshots

## Routing reference

See `12_Brain/protocols/browser-control-routing.md`.
