#!/usr/bin/env python3
"""Direct Composio MCP HTTP client (same pattern as orgo.py).
Speaks MCP Streamable-HTTP straight to connect.composio.dev/mcp using the
X-CONSUMER-API-KEY, so we can use Composio from THIS session without registering
it as a Claude MCP server.

Key is read from env COMPOSIO_KEY (preferred) so it never lands in a file.

Usage:
  COMPOSIO_KEY=ck_... composio_mcp.py init
  COMPOSIO_KEY=ck_... composio_mcp.py list
  COMPOSIO_KEY=ck_... composio_mcp.py call <TOOL> '<json-args>'
"""
import json, os, sys, urllib.request, urllib.error

ENDPOINT = "https://connect.composio.dev/mcp"
KEY = os.environ.get("COMPOSIO_KEY", "")
SESS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".composio_session")


def _post(payload, session_id=None, want_headers=False):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(ENDPOINT, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json, text/event-stream")
    req.add_header("X-CONSUMER-API-KEY", KEY)
    if session_id:
        req.add_header("Mcp-Session-Id", session_id)
    try:
        resp = urllib.request.urlopen(req, timeout=120)
        body = resp.read().decode()
        hdrs = dict(resp.headers)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:2000]); sys.exit(1)
    parsed = None
    for line in body.splitlines():
        line = line.strip()
        if line.startswith("data:"):
            parsed = json.loads(line[5:].strip()); break
    if parsed is None and body.strip():
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = {"raw": body}
    return (parsed, hdrs) if want_headers else parsed


def init():
    payload = {"jsonrpc": "2.0", "id": 1, "method": "initialize",
               "params": {"protocolVersion": "2024-11-05", "capabilities": {},
                          "clientInfo": {"name": "claude-code", "version": "1.0"}}}
    res, hdrs = _post(payload, want_headers=True)
    sid = hdrs.get("mcp-session-id") or hdrs.get("Mcp-Session-Id")
    with open(SESS_FILE, "w") as f:
        f.write(sid or "")
    _post({"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}}, session_id=sid)
    print("session:", sid)
    print(json.dumps(res.get("result", res), indent=2)[:1500])


def _sid():
    try:
        with open(SESS_FILE) as f:
            return f.read().strip()
    except FileNotFoundError:
        return None


def list_tools():
    res = _post({"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}, session_id=_sid())
    tools = res.get("result", {}).get("tools", [])
    print("== %d tools ==" % len(tools))
    for t in tools:
        print("-", t["name"], "::", (t.get("description", "") or "").split("\n")[0][:90])


def call(tool, args_json):
    args = json.loads(args_json) if args_json else {}
    res = _post({"jsonrpc": "2.0", "id": 3, "method": "tools/call",
                 "params": {"name": tool, "arguments": args}}, session_id=_sid())
    print(json.dumps(res.get("result", res)))


if __name__ == "__main__":
    if not KEY:
        print("Set COMPOSIO_KEY env var first."); sys.exit(1)
    cmd = sys.argv[1] if len(sys.argv) > 1 else "init"
    if cmd == "init":
        init()
    elif cmd == "list":
        list_tools()
    elif cmd == "call":
        call(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "{}")
    else:
        print("unknown cmd"); sys.exit(1)
