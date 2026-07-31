---
tags: [raw, research, semrush, mcp]
date: 2026-07-31
---

# Research receipts — Semrush MCP for Cursor + ChatGPT

Ground-truth captures for compiling [[12_Brain/concepts/Semrush MCP Integration|Semrush MCP Integration]]. Do not rewrite this file after compile.

## Question

What MCP/API access is required to connect Cursor and ChatGPT to Semrush, and is this account eligible?

## Sub-questions

1. Official endpoint + auth for Cursor / ChatGPT
2. Which Semrush plans include MCP / API units
3. What data surfaces (SEO vs Trends vs Projects)
4. Live account eligibility (units + API enablement)

## Receipts

### R1 — Official developer MCP page (prefer this)

- Claim: MCP endpoint is streamable HTTP only at `https://mcp.semrush.com/v2/mcp`. Auth: OAuth default, or `Authorization: Apikey YOUR_API_KEY`. Cursor config uses v2 URL. ChatGPT uses official Semrush app + Approve + `@Semrush`.
- Source: https://developer.semrush.com/api/v4/introduction/semrush-mcp/
- Date observed: 2026-07-31

### R2 — Plan eligibility (SEO Standard API)

- Claim: SEO MCP needs Semrush One Starter, Semrush One Pro+, SEO Classic Pro, or SEO Classic Guru (50,000 API units refresh on renewal). Or SEO Classic Business / Semrush One Advanced **plus** an API units package (2M / 5M / 10M / 20M). Trends data needs separate Trends API Basic or Premium.
- Source: https://developer.semrush.com/api/v4/introduction/semrush-mcp/ and https://www.semrush.com/kb/1618-mcp
- Date observed: 2026-07-31

### R3 — KB getting-started still shows v1 URL

- Claim: Knowledge base getting-started still documents `https://mcp.semrush.com/v1/mcp` for Cursor/VS Code/Claude Code. Conflicts with developer v4 docs (v2).
- Source: https://www.semrush.com/kb/1619-getting-started-with-mcp
- Date observed: 2026-07-31
- Skeptic note: Prefer developer.semrush.com v4 endpoint (v2). Treat KB v1 as stale unless Semrush confirms both.

### R4 — API unit balance check (free)

- Claim: Remaining Standard API units via `GET https://www.semrush.com/users/countapiunits.html?key=KEY` (free). UI: My Profile → Subscription info.
- Source: https://developer.semrush.com/api/v4/get-started/api-units-balance/
- Date observed: 2026-07-31

### R5 — Live account probe (2026-07-31)

- Claim: Standard API key authenticates; `domain_ranks` returns data; Standard units remaining **49990**. Trends summary call returns `ERROR 130 :: API DISABLED`.
- Source: direct HTTPS probes against Semrush Standard + Trends endpoints (operator-provided key; value not stored in this public raw file).
- Date observed: 2026-07-31
- Private locator: `12_Brain/private/access/semrush-api.md` (gitignored)

### R6 — MCP data surfaces

- Claim: MCP exposes All SEO API, All Trends API (if subscribed), and read-only Projects API v3 methods (no create/modify projects).
- Source: https://developer.semrush.com/api/v4/introduction/semrush-mcp/
- Date observed: 2026-07-31

## Skeptic gate

| Claim | Verdict | Why |
|-------|---------|-----|
| Use `v2` endpoint for Cursor | **Survivor** | Official developer docs; KB v1 labeled single-source/stale conflict |
| SEO MCP needs Pro+/Guru/One Starter+ or Business+units pack | **Survivor** | Same claim on developer + KB 1618 |
| Account eligible for SEO MCP today | **Survivor** | Live Standard API + ~50k units |
| Account eligible for Trends/traffic MCP today | **Killed for now** | Live `ERROR 130 :: API DISABLED` |
| ChatGPT connects via Apps → Semrush → Approve | **Survivor** | Developer + KB |
| Cursor OAuth after adding MCP URL | **Survivor** | Developer Cursor section |
| Connecting apps requires operator OAuth click | **Survivor** | Cannot complete login/Approve from agent session |

## Survivors (one line each)

1. Cursor: add MCP URL `https://mcp.semrush.com/v2/mcp`, complete Semrush OAuth Approve.
2. ChatGPT: Settings → Apps → Semrush → Connect → Approve; tag `@Semrush`.
3. This account: Standard/SEO MCP ready (~49990 units); Trends MCP blocked until Trends plan.
4. Prefer OAuth; API key header only as fallback — rotate key after chat exposure.
