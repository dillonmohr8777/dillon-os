# dillon-os

## Remote Browser Bridge (Dillon's 64GB HP box)

Dillon's HP EliteDesk (i7-8700, 64GB) runs dedicated automation Chromes that Claude sessions can
drive over CDP. This replaced the old Orgo VM. **Two separate agent stacks live on the box — do not
cross the streams:**

| Agent  | Port | Profile          | Launcher                | Scope |
|--------|------|------------------|-------------------------|-------|
| Codex  | 9222 | `zen-chrome`     | `start-box-bridge.ps1`  | Zen Spa Squarespace build — **DO NOT TOUCH** |
| Claude | 9223 | `claude-chrome`  | `claude-bridge.ps1`     | General-purpose: ads, landing pages, everything else |

Claude's bridge is self-healing on the box: `ClaudeBridge` scheduled task relaunches it, and
`powercfg` is set to never-sleep.

### Current access mode: LOCAL-ONLY (security policy)
The box is a company machine (`@alignhcm.com`) and a policy is on record:
`public_cdp_tunnel_allowed: false`. A public CDP tunnel = full remote control of a logged-in
browser and all its cookies/sessions, so **do NOT stand up a public tunnel** until Dillon
confirms the policy is lifted (and that it's his call, not IT's). Until then, browser work must
run ON the box itself (the box has its own Claude Code session).

Known blockers to off-box access, for the record:
- ngrok: quarantined by Windows Defender as a Trojan; non-admin, so no exclusion possible.
- cloudflared named tunnel: needs a Cloudflare account + domain (none configured yet).
- If/when approved, the plan is a named Cloudflare tunnel + Cloudflare Access policy locked to
  `dillon.mohr@alignhcm.com` (Google SSO — NOT basic-auth), and the `claude-chrome` profile
  scoped to work logins only.

### How to connect when a tunnel IS up (works from cloud sessions through the egress proxy)
The tunnel gives an HTTPS base URL (the **BRIDGE_URL**). Chrome's own `/json` responses report
`ws://localhost/...` — you MUST rewrite the host. Connect with a **raw WebSocket client through the
egress proxy, sending NO `Origin` header** (that sidesteps Chrome's `--remote-allow-origins` check):

1. `GET <BRIDGE_URL>/json/version` and `/json/list` (plain HTTPS — the proxy allows the tunnel).
2. Take a target's `webSocketDebuggerUrl` and rewrite `ws://localhost` → `wss://<BRIDGE_HOST>`.
3. Open it with `ws` + `https-proxy-agent` (HTTPS_PROXY), no Origin header. CDP JSON-RPC works.
4. Many tabs: connect to the browser ws, `Target.createTarget {url}` per tab (parallel via
   `Promise.all`), then drive each page at `wss://<BRIDGE_HOST>/devtools/page/<targetId>`.
5. NEVER call `browser.close()` — it closes Dillon's logged-in Chrome.

A working driver is committed at `tools/box.mjs` (needs `npm i ws https-proxy-agent`; set
`BRIDGE_HOST`). playwright-core's connectOverCDP does NOT work through the tunnel (it uses the
raw `ws://localhost` URL) — use the raw-ws approach.

### Getting the current BRIDGE_URL
Free `trycloudflare` URLs **change every tunnel restart**, so none is committed here (a bridge URL
grants full control of a logged-in browser — treat it like a password). Get the current URL from
Dillon at session start, or from the `BRIDGE_URL` env secret if set.

### Squarespace editor lessons (hard-won — follow these)
- NEVER press the `Delete` key inside a block editor: it deletes the whole block. Replace text
  with `ctrl+a` + type instead.
- Edit accordion/list items ONE per call and verify the item editor is open before filling —
  blind cross-item batches overwrite the wrong item.
- Screenshots over the tunnel: JPEG quality ~55, generous timeouts; PNGs time out.

## Composio (works from ANY session, no box needed)
Driver: `tools/composio_mcp.py`. Set env `COMPOSIO_KEY` (ck_..., never commit it).
Flow: `init` → `list` → `COMPOSIO_SEARCH_TOOLS` to find slugs → `COMPOSIO_MULTI_EXECUTE_TOOL`
(up to 50 parallel). Covers Gmail, Meta Ads, Sheets, Drive, CRM, web search.
Google Ads API is dev-token-walled (`DEVELOPER_TOKEN_PROHIBITED`) — Google Ads work must go
through the box browser UI, not Composio.
