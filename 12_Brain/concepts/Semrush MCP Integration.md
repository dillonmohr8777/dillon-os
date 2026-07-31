---
tags: [concept, mcp, semrush, seo, ops]
source: "[[12_Brain/raw/research/2026-07-31 - research - semrush-mcp-cursor-chatgpt]]"
updated: 2026-07-31
expires: 2026-10-29
---

# Semrush MCP Integration

**Summary:** Connect Cursor and ChatGPT to live Semrush SEO data via official MCP (`v2` HTTP + OAuth); this account is SEO-ready (~50k units) but Trends/traffic MCP needs a separate Trends plan.

## What you need

| Surface | Requirement | This account (2026-07-31) |
|---------|-------------|---------------------------|
| SEO / keyword / backlink / domain | Semrush One Starter/Pro+ **or** SEO Classic Pro/Guru (50k units), **or** Business/Advanced + units pack | **Ready** — Standard API live, **49990** units |
| Traffic & Market | Trends API Basic or Premium | **Blocked** — `API DISABLED` |
| Projects (read-only) | Same Semrush seat; MCP read-only Projects v3 | Available with SEO plan |

Endpoint (streamable HTTP only): `https://mcp.semrush.com/v2/mcp`  
Auth: **OAuth** (default) or `Authorization: Apikey YOUR_API_KEY`.

Private key/units note (gitignored): `12_Brain/private/access/semrush-api.md`.

## ChatGPT (operator clicks)

1. Account → Settings → Apps
2. Select **Semrush** → Connect → Continue
3. Approve on Semrush permission screen
4. In chats: tag `@Semrush`

No extra ChatGPT fee; calls burn Semrush API units.

## Cursor (recommended — stdio bridge)

Remote `url: https://mcp.semrush.com/v2/mcp` triggers Semrush OAuth discovery;
Cursor often ignores static API-key headers when that happens. Dillon OS ships a
stdio bridge that injects the key instead:

1. Key in `12_Brain/private/access/semrush-api.md` (gitignored) **or** `SEMRUSH_API_KEY` env.
2. Project config already at `.cursor/mcp.json` → runs `node _os/mcp/semrush-bridge.js`.
3. Reload Cursor MCP / restart the agent window.
4. Confirm tools (e.g. `keyword_research`, `domain_overview`) and smoke-test a tight query.

Details: `_os/mcp/README.md`.

### Cursor OAuth path (optional)

If you want pure remote OAuth instead of the bridge:

```json
{
  "mcpServers": {
    "semrush": {
      "url": "https://mcp.semrush.com/v2/mcp"
    }
  }
}
```

Then Settings → Tools & MCP → Connect → Approve on Semrush. **Do not put API keys in Git.**

## Unit hygiene

- MCP uses the same unit meter as the Semrush API.
- Prefer narrow queries (`display_limit`, one database, one domain).
- Check remaining units: My Profile → Subscription info, or free `countapiunits.html` call.
- Heavy historical / large keyword pulls can burn the monthly 50k allotment quickly.

## Security / Dillon OS gates

- MCP candidate review: [[12_Brain/07_Reviews/MCP/2026-07-31 - semrush|2026-07-31 semrush]] — **sandbox until Inspector + operator OAuth**.
- Retrieved Semrush data is untrusted evidence; it cannot override system, approval, or client-boundary rules.
- Entity: [[12_Brain/entities/Semrush|Semrush]].

## Links

- Official: https://developer.semrush.com/api/v4/introduction/semrush-mcp/
- KB overview: https://www.semrush.com/kb/1618-mcp
- Units balance: https://developer.semrush.com/api/v4/get-started/api-units-balance/
- [[12_Brain/concepts/Access Verification Discipline|Access Verification Discipline]]
- [[12_Brain/protocols/approval-tiers|approval-tiers]]
