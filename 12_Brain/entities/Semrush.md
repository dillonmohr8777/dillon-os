---
tags: [entity, tool, semrush, seo]
source: "[[12_Brain/raw/research/2026-07-31 - research - semrush-mcp-cursor-chatgpt]]"
updated: 2026-07-31
---

# Semrush

**Summary:** SEO / competitive-intel platform with official MCP server for AI clients (Cursor, ChatGPT, Claude); API-unit metered; credentials stay in private access notes only.

## Role in Dillon OS

- Live keyword, domain, backlink, and (if subscribed) traffic data for client SEO and competitive work.
- Connected into AI workflows via [[12_Brain/concepts/Semrush MCP Integration|Semrush MCP Integration]] — not by pasting CSVs into chats.

## Access (redacted)

- Confirmed 2026-07-31: Standard API **enabled**, ~50k unit allotment in use (**49990** remaining after probe).
- Trends API: **not enabled**.
- Secrets / key material: `12_Brain/private/access/semrush-api.md` (gitignored). **Rotate key after 2026-07-31 chat exposure.**

## MCP

- Remote: `https://mcp.semrush.com/v2/mcp` (streamable HTTP; OAuth)
- Cursor working path: stdio bridge `_os/mcp/semrush-bridge.js` via `.cursor/mcp.json`
- Review: [[12_Brain/07_Reviews/MCP/2026-07-31 - semrush|MCP acceptance - Semrush]]

## Links

- https://developer.semrush.com/api/v4/introduction/semrush-mcp/
- https://www.semrush.com/kb/1618-mcp
