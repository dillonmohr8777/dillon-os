---
tags: [protocol, browser, composio, hermes]
source: "[[12_Brain/entities/Hermes|Hermes]] · [[12_Brain/entities/Claude in Chrome|Claude in Chrome]] · Composio browser_tool docs"
updated: 2026-07-31
expires: 2026-10-31
---

# Browser control routing

**Summary:** pick the browser surface by auth needs and where the agent runs — Hermes CDP for logged-in local Chrome, Composio for cloud agents with live watch URLs, Claude in Chrome for local apply sessions.

## Surfaces

| Surface | Where it runs | Auth / cookies | Agent can reach from cloud? |
|---------|---------------|----------------|----------------------------|
| Hermes `/browser connect` (CDP) | Dillon's Mac Chrome/Brave/Edge | Full logged-in state | No — localhost only |
| Composio `BROWSER_TOOL` | Composio cloud browser | Per-session; optional `secrets` map | Yes — via MCP + API key |
| Claude in Chrome | Dillon's Chrome via extension | Full logged-in state | No — local CLI only |
| Playwright MCP bridge | Cursor-attached browser | Depends on extension | Desktop only (extension required) |
| Hermes cloud backends | Browserbase / Browser Use / Firecrawl | Provider-managed | Yes — via Hermes, not Cursor |

## Default routing

1. **`hermes-local-control`** (Mac) → CDP attach for TV-visible logged-in Chrome. Skill: `.claude/skills/hermes-local-control/`.
2. **Cloud Cursor agent** → Composio Browser Tool (if Enhanced Controls allow `BROWSER_TOOL_*`).
3. **Google Ads / GBP apply** → Claude in Chrome or Hermes CDP; cloud agents draft only.
4. **Slack read when API write blocked** → Slack MCP search first; Composio browser read-only lane second.

## Hermes local CDP (Mac) — `hermes-local-control`

```bash
bash _os/tools/hermes-local-control.sh
# then in Hermes terminal:
hermes chat
/browser connect
/browser status
```

Uses dedicated profile `~/.hermes/chrome-debug` so port 9222 actually opens when Chrome is already running.

Optional persistent config in `~/.hermes/config.yaml`:

```yaml
browser:
  cdp_url: http://127.0.0.1:9222
```

Handoff: `handoffs/hermes-local-control.md`

## Composio (cloud agents)

**Official path:** add the Composio Cursor plugin (`/add-plugin composio`), run `composio login`, wire MCP URL `https://connect.composio.dev/mcp`.

After CreateTask, always call GetSession and share the **liveUrl** so Dillon can watch on the TV.

Fallback bootstrap if MCP is not auto-registered:

```bash
export COMPOSIO_API_KEY=...
python3 _os/tools/bootstrap-composio-browser.py
```

## Gates

- [[12_Brain/protocols/approval-tiers|approval-tiers]] — Tier 0 read-only for ingestion; Tier 2+ for writes.
- Composio Enhanced Controls: do not disable; use approved read-only browser lane when direct execution is blocked.
- Never expose CDP on `0.0.0.0`; bind to `127.0.0.1` only.
- Disconnect CDP sessions; never close Dillon's live browser.

## Links

- [[12_Brain/entities/Hermes|Hermes]] · [[12_Brain/entities/Claude in Chrome|Claude in Chrome]]
- [[04_SOPs/Communication Intelligence Ingestion|Communication Intelligence Ingestion]]
- Plugin: `~/.cursor/plugins/local/composio-browser/`
