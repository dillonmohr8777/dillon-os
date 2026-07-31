# Hermes + Composio browser control — enable now

Updated: 2026-07-31

## Goal

Let Cursor agents control a browser Dillon can watch (TV monitor), using Composio instead of unreachable Mac localhost CDP.

## Official path (from Composio dashboard + Cursor plugin)

### 1. Add Composio in Cursor

In Cursor chat or command palette:

```
/add-plugin composio
```

Or install from https://cursor.com — plugin includes `composio-mcp` skill and MCP wiring.

### 2. Install Composio CLI (Mac terminal)

```bash
curl -fsSL https://composio.dev/install | bash
exec $SHELL
composio login
```

Complete OAuth in the browser when prompted. This links your Composio account to the Hermes agent profile on dashboard.composio.dev.

### 3. Wire MCP in Cursor

Add the Composio Connect MCP server:

| Field | Value |
|-------|-------|
| **URL** | `https://connect.composio.dev/mcp` |
| **Auth** | Uses your `composio login` session / API key |

In Cursor → Settings → MCP → Add server → paste URL above. If the plugin auto-registers it, confirm it appears under MCP servers.

### 4. Hermes local Chrome (optional — logged-in sessions)

For Ads/GBP work with your existing cookies on the TV:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

In Hermes terminal: `/browser connect`

### 5. Restart agent and test

Tell the agent:

> "Use Composio browser to open example.com and give me the live watch URL."

Expected tool flow:
1. `BROWSER_TOOL_CREATE_TASK`
2. `BROWSER_TOOL_GET_SESSION` → **liveUrl** for TV
3. `BROWSER_TOOL_WATCH_TASK` → results

## Fallback bootstrap (if plugin MCP URL differs)

If the plugin does not auto-configure MCP, generate a session-specific config:

```bash
export COMPOSIO_API_KEY=your_key_here
python3 _os/tools/bootstrap-composio-browser.py
```

Paste output into Cursor Settings → MCP.

## Blocker on cloud agents until step 2–3 complete

Cloud runs cannot reach Mac `127.0.0.1:9222`. Composio MCP + login is required for remote browser control.

## Routing reference

See `12_Brain/protocols/browser-control-routing.md`.
