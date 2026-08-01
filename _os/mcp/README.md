# Semrush MCP bridge + agent CLI

Cursor’s remote MCP client discovers Semrush OAuth and often ignores
`Authorization` headers. This stdio bridge forwards MCP to
`https://mcp.semrush.com/v2/mcp` with `Authorization: Apikey …`.

## Agent access (preferred)

```bash
node _os/mcp/semrush-call.js units
node _os/mcp/semrush-call.js tools
node _os/mcp/semrush-call.js report phrase_this '{"database":"us","phrase":"ukg implementation partner"}'
node _os/mcp/semrush-call.js call keyword_research '{}'
```

Auth: `SEMRUSH_API_KEY` or `12_Brain/private/access/semrush-api.md`.

If units are `0`, Semrush blocks report data until top-up:
https://www.semrush.com/mcp-access

## Cursor desktop setup

1. Key in private note (gitignored) or `SEMRUSH_API_KEY`
2. `.cursor/mcp.json` runs `node _os/mcp/semrush-bridge.js`
3. Reload MCP / restart agent window

Cloud agents should use `semrush-call.js` even when Semrush does not appear in the MCP tool picker.
