---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-07-09T19:10:51
session_last: 2026-07-09T19:10:51
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-07-09\import-json-os-urllib-request-key"
open_flags: [auth-expired]
tags: [codex-recovery, session, 202607]
---

# Documents\Codex\2026-07-09\import-json-os-urllib-request-key

**1 session(s)** · 2026-07-09 19:10 → 2026-07-09 19:10 · 4m agent-time (summed; sessions may overlap) · 0 MB transcript · 5/5 turns completed

> **Open flags:** `auth-expired`

## 1. 2026-07-09 19:10 · 4m · 0.4 MB

`019f484a-38c5-73c2-85f5-91a4dc09a51d` · turns 5/5 · flags: auth-expired

**Asked:**

> import json, os, urllib.request
> KEY=os.environ["COMPOSIO_KEY"]; EP="https://connect.composio.dev/mcp"; SID=None
> def post(payload):
>     r=urllib.request.Request(EP,data=json.dumps(payload).encode(),method="POST")
>     r.add_header("Content-Type","application/json")
>     r.add_header("Accept","application/json, text/event-stream")
>     r.add_header("X-CONSUMER-API-KEY",KEY)
>     if SID: r.add_header("Mcp-Session-Id",SID)
>     resp=urllib.request.urlopen(r,timeout=120); body=resp.read().decode()
>     for line in body.splitlines():
>         if line.strip().startswith("data:"): return json.loads(line.strip()[5:]), dict(resp.headers)
>     return (json.loads(body) if body.strip() else {}), dict(resp.headers)
> # 1) init
> res,h=post({"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"gpt","version":"1"}}})
> SID=h.get("mcp-session-id"

> I need you to do it

> You can run it

**Outcome reported:**

> A compact, safer version:
> 
> ```python
> import json
> import os
> import urllib.request
> import urllib.error
> 
> EP = "https://connect.composio.dev/mcp"
> KEY = os.getenv("COMPOSIO_KEY")
> if not KEY:
>     raise RuntimeError("Set COMPOSIO_KEY in environment")
> 
> session_id = None
> 
> 
> def post(payload):
>     global session_id
> 
>     req = urllib.request.Request(
>         EP,
>         data=json.dumps(payload).encode("utf-8"),
>         method="POST",
>         headers={
>             "Content-Type": "application/json",
>             "Accept": "application/json, text/event-stream",
>             "X-CONSUMER-API-KEY": KEY,
>         },
>     )
>     if session_id:
>         req.add_header("Mcp-Session-Id", session_id)
> 
>     try:
>         with urllib.request.urlopen(req, timeout=120) as resp:
>             raw = resp.read().decode("utf-8")
>             headers = dict(resp.headers)
>     except urllib.error.HTTPError as e:
>         err = e.read().decode("utf-8", errors="ignore")
>         raise RuntimeError(f"HTTP {e.code}: {err}") from e
> 
>     session_id = headers.get("mcp-session-id", session_id)
> 
>     for line in raw.splitlines():
>         line = line.strip()
>         if line.startswith("data:"):
>             data = line[len("data:"):].strip()
>             if data:
>                 return json.loads(data), headers
> 
>     return (json.loads(raw) if raw.strip() else {}), headers
> 
> 
> # 1) initialize
> res, h = post({
>     "jsonrpc": "2.0",
>     "id": 1,
>     "method": "initialize",
>     "params": {
>         "protocolVersion": "2024-11-05",
>         "capabilities": {},
>         "clientInfo": {"name": "gpt", "version": "1"},
>     },
> })
> print("initialize:", res)
> 
> post({"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}})
> print("tools:", post({"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}})[0])
> print("call:", post({
>     "jsonrpc": "2.0",
>     "id": 3,
>     "method": "tools/call",
>     "params": {
>         "name": "COMPOSIO_MULTI_EXECUTE_TOOL",
>         "arguments": {
>             "tools": [
>                 {"tool_slug": "GMAIL_FETCH_EMAILS", "arguments": {"max_results": 3}}
>             ]
>         },
>     },
> })[0])
> ```
> 
> If you want, I can also make it support `mcp-session-id` extraction from both lower/upper header variants explicitly and retry once on 401/403.

> Done — I added the working script here:
> 
> - [composio_client.py](/C:/Users/dillo/Documents/Codex/2026-07-09/import-json-os-urllib-request-key/composio_client.py)
> 
> It uses your same `urllib` approach, adds:
> - required `COMPOSIO_KEY` guard,
> - session-id extraction/propagation (`Mcp-Session-Id` / lowercase variant),
> - basic HTTP error reporting with body,
> - SSE `data:` parsing fallback to raw JSON.
> 
> Run it with:
> 
> 1. set `COMPOSIO_KEY` in env
> 2. `python composio_client.py`
> 
> If you want, I can add a retry on transient failures (timeouts/5xx/401-403) and return structured error output instead of raising.

> Ran it.
> 
> Result: it failed early with:
> - `RuntimeError: Set COMPOSIO_KEY in environment`
> 
> So the script works, but your shell environment in this run doesn’t have `COMPOSIO_KEY` set.
> 
> Run it with:
> - PowerShell:  
>   `$env:COMPOSIO_KEY="your_key_here"; python composio_client.py`
> 
> If you want, I can add a `--api-key` CLI flag so you can pass it without exporting env each time.

> Done — it ran successfully with the key you provided.
> 
> - `initialize` succeeded.
> - `tools/list` returned the Composio MCP tool catalog.
> - `tools/call` with `COMPOSIO_MULTI_EXECUTE_TOOL` + `GMAIL_FETCH_EMAILS` (max 3) succeeded.
> 
> Top 3 fetched message subjects:
> - `Delivery Status Notification (Failure)`
> - `Congrats on your FICO® Score progress`
> - `Form Submission - 10% Off QR Sign-Up Form`
> 
> If you want, I can add a small parser so it prints only headers (subject/from/date) instead of full raw payload.

> Here’s what your current key gives access to.
> 
> 1. MCP control tools exposed by the server (7)
> - `COMPOSIO_MANAGE_CONNECTIONS`
> - `COMPOSIO_MULTI_EXECUTE_TOOL`
> - `COMPOSIO_REMOTE_BASH_TOOL`
> - `COMPOSIO_REMOTE_WORKBENCH`
> - `COMPOSIO_SEARCH_TOOLS`
> - `COMPOSIO_WAIT_FOR_CONNECTIONS`
> - `COMPOSIO_GET_TOOL_SCHEMAS`
> 
> 2. Tool slugs discoverable right now via `COMPOSIO_SEARCH_TOOLS` for your common use cases (51)
> - Gmail: `GMAIL_FETCH_EMAILS`, `GMAIL_CREATE_EMAIL_DRAFT`, `GMAIL_SEND_DRAFT`, `GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID`, `GMAIL_GET_ATTACHMENT`, `GMAIL_BATCH_MODIFY_MESSAGES`, `GMAIL_LIST_THREADS`, `GMAIL_SEND_EMAIL`
> - Slack: `SLACK_SEARCH_MESSAGES`, `SLACK_FIND_CHANNELS`, `SLACK_FETCH_CONVERSATION_HISTORY`, `SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION`, `SLACK_SEARCH_ALL`, `SLACK_LIST_ALL_CHANNELS`, `SLACK_RETRIEVE_MESSAGE_PERMALINK_URL`
> - GitHub: `GITHUB_GET_A_REPOSITORY`, `GITHUB_GET_REPOSITORY_CONTENT`, `GITHUB_LIST_REPOSITORY_ISSUES`, `GITHUB_FIND_PULL_REQUESTS`, `GITHUB_SEARCH_CODE`, `GITHUB_LIST_COMMITS`, `GITHUB_GET_A_TREE`, `GITHUB_GET_A_PULL_REQUEST`, `GITHUB_LIST_PULL_REQUESTS_FILES`, `GITHUB_GET_RAW_REPOSITORY_CONTENT`, `GITHUB_FIND_REPOSITORIES`
> - Notion: `NOTION_SEARCH_NOTION_PAGE`, `NOTION_FETCH_ALL_BLOCK_CONTENTS`, `NOTION_GET_PAGE_MARKDOWN`
> - Google Sheets: `GOOGLESHEETS_GET_SPREADSHEET_INFO`, `GOOGLESHEETS_BATCH_GET`, `GOOGLESHEETS_VALUES_GET`, `GOOGLESHEETS_GET_SHEET_NAMES`, `GOOGLESHEETS_SEARCH_SPREADSHEETS`
> - Google Drive: `GOOGLEDRIVE_FIND_FILE`, `GOOGLEDRIVE_DOWNLOAD_FILE`, `GOOGLEDRIVE_CREATE_FILE_FROM_TEXT`, `GOOGLEDRIVE_GET_FILE_METADATA`, `GOOGLEDRIVE_CREATE_FOLDER`, `GOOGLEDRIVE_DOWNLOAD_FILE_OPERATION`, `GOOGLEDRIVE_EXPORT_GOOGLE_WORKSPACE_FILE`, `GOOGLEDRIVE_EDIT_FILE`, `GOOGLEDRIVE_UPLOAD_UPDATE_FILE`, `GOOGLEDRIVE_LIST_SHARED_DRIVES`
> - Google Calendar: `GOOGLECALENDAR_EVENTS_LIST_ALL_CALENDARS`, `GOOGLECALENDAR_SETTINGS_LIST`, `GOOGLECALENDAR_LIST_CALENDARS`, `GOOGLECALENDAR_EVENTS_LIST`, `GOOGLECALENDAR_EVENTS_GET`, `GOOGLECALENDAR_GET_CURRENT_DATE_TIME`, `GOOGLECALENDAR_FIND_EVENT`
> 
> 3. Connection state found in this session
> - Active: `gmail`, `github`, `googledrive`, `googlesheets`, `googlecalendar`
> - Not active: `slack`, `notion` (must be connected before their tools can run)
> 
> If you want, I can now run a single “full map” routine that outputs this into a clean JSON file with only the names, descriptions, and required arguments for each tool.

**Files written (1):**

- `composio_client.py`

<sub>rollout: `C:\Users\dillo\.codex\archived_sessions\rollout-2026-07-09T15-10-51-019f484a-38c5-73c2-85f5-91a4dc09a51d.jsonl`</sub>
