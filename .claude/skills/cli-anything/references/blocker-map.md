# CLI-Anything blocker map

Dated snapshot of MCP/API blockers this vault has actually hit, and whether
CLI-Anything or an official CLI clears them. Source:
`12_Brain/raw/research/2026-08-17 CLI-Anything Skill Receipts.md`.
Refresh with `node _os/automation/bin/cli-first.js`.

| ID | What happened | CLI-Anything / official CLI | Verdict |
|---|---|---|---|
| `github-mcp-auth` | GitHub MCP auth failed; `gh` still works | Official `gh` | **fixed** |
| `mcp-context-bloat` | Heavy MCP tool lists eat context | Call one CLI on demand | **reduced** |
| `exa-mcp-rate-limit` | Shared Exa MCP hit free-tier limit (franchise research 2026-08-14; repeated 2026-08-17) | `cli-anything-exa` / `cli-hub install exa` | **partial** — same API, needs `EXA_API_KEY` |
| `mohr-vault-obsidian-mcp` | mohr-vault MCP pointed at a missing folder + placeholder key | Git + filesystem already replace it; `cli-anything-obsidian` needs Local REST API + running Obsidian | **already-unblocked** in agents; desktop harness optional |
| `landingfolio-inspector` | Token-gated MCP; Inspector pending | No catalog CLI | **not-fixed** |
| `slack-oauth` | Codex Slack `oauth_refresh_token_rejected`; Composio blocked writes | No Slack row in CLI-Hub; official Slack CLI still needs OAuth | **not-fixed** |
| `ads-platform-mcps` | Google Ads / GA4 / Meta / Search Console MCPs never connected | No catalog CLIs | **not-fixed** |
| `google-calendar-token` | Calendar invite path needs `GOOGLE_CALENDAR_ACCESS_TOKEN` | No catalog CLI | **not-fixed** |
| `x-mcp-discovery` | X MCP failed live tool discovery | VE Twini is GraphQL/browser automation — do not install | **not-fixed** |
