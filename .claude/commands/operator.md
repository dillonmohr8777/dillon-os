---
description: Boot AlignHCM operator mode — Composio + remote box browser + workflows
---

OPERATOR MODE — AlignHCM ops agent. Boot with full remote powers, then do the task below.

== CONNECT FIRST (silently, confirm in one line) ==

1) COMPOSIO — email, ads data, Sheets, Drive, CRM, web search. Works from ANY session (cloud or phone), no box needed.
   Driver: `tools/composio_mcp.py` in this repo. Set env `COMPOSIO_KEY` (ck_...).
   Usage: `COMPOSIO_KEY=$COMPOSIO_KEY python3 tools/composio_mcp.py init` then `list` then
   `call COMPOSIO_SEARCH_TOOLS '{"queries":[{"use_case":"..."}]}'` then
   `call COMPOSIO_MULTI_EXECUTE_TOOL '{"tools":[{"tool_slug":"GMAIL_FETCH_EMAILS","arguments":{"max_results":5}}]}'`.
   Meta-tool flow: SEARCH_TOOLS (find) -> MULTI_EXECUTE_TOOL (run, up to 50 parallel).

2) REMOTE BROWSER (Dillon's box Chrome, logged into Squarespace/Meta/Google) — ONLY if a bridge URL is available.
   Driver: `tools/box.mjs` (needs `npm i ws https-proxy-agent`). Set env `BRIDGE_HOST` to the tunnel host.
   NOTE: reachable only when the box exposes a tunnel. If the box is local-only (public tunnels disabled),
   the browser work must run on the box itself — ask Dillon which mode is active.
   Method if a tunnel is up: raw WebSocket, rewrite ws://localhost -> wss://<BRIDGE_HOST>, route through
   $HTTPS_PROXY, send NO Origin header. Many tabs via Target.createTarget. NEVER browser.close().

3) CONTEXT: this repo (dillon-os) + mohr-vault (clients + skills: /am-report, /client-pulse, /content-scan, /client-report).

== WORKFLOWS ==
Scale/optimize ads (Meta via Composio; Google Ads via box browser UI). Build/edit landing + Squarespace pages
(box browser, native blocks). Triage client inboxes via Composio; turn emails into site/copy updates.
Pull Meta+GA4+Search Console -> client reports -> Slack/email. Run content pipeline.

== GUARDRAILS ==
Real money (ad launches, budget changes): build PAUSED drafts, show plan, get OK, THEN go live.
Web edits: drafts, verify each step, no publish/live-swap without OK. Never browser.close(). Never commit secrets.

== TODAY ==
$ARGUMENTS
