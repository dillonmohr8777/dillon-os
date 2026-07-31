# Semrush MCP bridge

Cursor’s remote MCP client discovers Semrush OAuth and often ignores
`Authorization` headers. This stdio bridge forwards MCP to
`https://mcp.semrush.com/v2/mcp` with `Authorization: Apikey …`.

## Setup

1. Keep the API key in `12_Brain/private/access/semrush-api.md` (gitignored)
   **or** export `SEMRUSH_API_KEY`.
2. Project MCP config: `.cursor/mcp.json` (committed — no secrets).
3. Reload Cursor MCP / restart agent window.
4. Confirm Semrush tools appear (keyword_research, domain_overview, etc.).

## Smoke test

```bash
SEMRUSH_API_KEY=your_key node <<'NODE'
// or rely on private note when cwd is vault root
const { spawn } = require('child_process');
const child = spawn('node', ['_os/mcp/semrush-bridge.js'], { stdio: ['pipe','pipe','inherit'] });
const body = Buffer.from(JSON.stringify({
  jsonrpc: '2.0', id: 1, method: 'initialize',
  params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 't', version: '0' } }
}));
child.stdin.write(`Content-Length: ${body.length}\r\n\r\n`);
child.stdin.write(body);
child.stdout.on('data', d => process.stdout.write(d));
setTimeout(() => child.kill(), 3000);
NODE
```

Prefer rotating any key that was pasted into chat before long-term use.
