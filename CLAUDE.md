# dillon-os

## Remote Browser Bridge (Dillon's 64GB HP box)

Dillon runs a dedicated automation Chrome on his home box, exposed via a tunnel, so **any Claude
session can drive a real logged-in Chrome with unlimited parallel tabs**. This is the permanent
replacement for the old Orgo VM.

### How to connect (works from cloud sessions through the egress proxy)
The tunnel gives an HTTPS base URL (the **BRIDGE_URL**). Chrome's own `/json` responses report
`ws://localhost/...` — you MUST rewrite the host. Connect with a **raw WebSocket client through the
egress proxy, sending NO `Origin` header** (that sidesteps Chrome's `--remote-allow-origins` check):

1. `GET <BRIDGE_URL>/json/version` and `/json/list` (plain HTTPS — the proxy allows the tunnel).
2. Take a target's `webSocketDebuggerUrl` and rewrite `ws://localhost` → `wss://<BRIDGE_HOST>`.
3. Open it with `ws` + `https-proxy-agent` (HTTPS_PROXY), no Origin header. CDP JSON-RPC works.
4. Many tabs: connect to the browser ws, `Target.createTarget {url}` per tab (parallel via
   `Promise.all`), then drive each page at `wss://<BRIDGE_HOST>/devtools/page/<targetId>`.
5. NEVER call `browser.close()` — it closes Dillon's logged-in Chrome.

A working driver lives in the session scratchpad as `cdp-test/multitab.mjs` / `rawcdp.mjs`
(playwright-core failed because it used the raw `ws://localhost` URL — use the raw-ws approach).

### Getting the current BRIDGE_URL
The free `trycloudflare` URL **changes every tunnel restart**, so it is NOT committed here (also it
grants full control of a browser logged into Squarespace/Meta/Google — treat it like a password).
Get the current URL from Dillon at session start, or from the `BRIDGE_URL` env secret if set.

**For true "every session auto-connects" permanence:** upgrade the box to a STABLE URL —
a named Cloudflare tunnel (`browser.<domain>`) or ngrok with a reserved domain + basic-auth — then
the stable host can be recorded here and auth stored as an env secret.

### The box's Chrome stays logged into
Squarespace (zenspatropicana), Meta Ads, Google Ads. Launch script: `start-box-bridge.ps1` on the box.
