---
tags: [concept, mcp, automation]
source: "[[12_Brain/research/2026-07-30 - Grok daily intelligence]]"
expires: 2026-10-29
updated: 2026-07-31
---

# Stateless MCP Server Design

**Summary:** as of spec revision `2026-07-28` MCP is a stateless request/response
protocol — no handshake, no session id — so an MCP server that still depends on
session affinity is built against a deprecated shape and should not pass the
acceptance gate.

Verified against the [2026-07-28 spec release](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
on 2026-07-31, not against the posts that reported it.

## What changed that actually binds us

- **No handshake.** `initialize`/`initialized` and the `Mcp-Session-Id` header are
  retired. Every request carries its own protocol version, client identity and
  capabilities in `_meta`. `server/discover` exists for clients that want
  capabilities up front, but it is optional.
- **Routing happens in headers.** `Mcp-Method` and `Mcp-Name` are required on
  Streamable HTTP, so a gateway can route, meter and authorize without parsing the
  JSON body.
- **Lists are cacheable.** `tools/list`, `prompts/list`, `resources/list` and
  `resources/read` return `ttlMs` and `cacheScope` in deterministic order, which is
  what keeps a tool catalogue — and the prompt cache above it — stable across
  reconnects.
- **Mid-call input uses MRTR.** Instead of a held-open stream, the server returns
  `resultType: "input_required"` and the client retries with `inputResponses`. This
  is how a tool asks for confirmation before a destructive or costly action.
- **Auth hardened.** Authorization servers return `iss` per RFC 9207 and clients
  must validate it before redeeming a code. Credentials are bound to the issuer that
  minted them. Dynamic Client Registration is formally deprecated in favour of
  client ID metadata documents (CIMD).
- **Deprecated but alive for ≥12 months:** Roots, Sampling, Logging, and the legacy
  HTTP+SSE transport. New work should not adopt them.

## Why statelessness is not the same as being stateless

Dropping the protocol-level session does not force the application to hold no
state. The spec's own guidance is to mint an explicit handle from a tool and have
the model pass it back as an argument — state the model can see and thread, rather
than state hidden in the transport. That is the same instinct as
[[Evidence Boundaries in Reporting]]: make the dependency visible instead of implicit.

## How this lands in Dillon OS

- **MCP acceptance gate.** A candidate that needs sticky sessions, or that leans on
  DCR, is building against a deprecated shape — treat that as a finding, not a
  detail. See [[12_Brain/07_Reviews/README|07_Reviews]] and `schemas/mcp-candidate.json`.
- **Tool-surface budget.** Read-only-by-default is now the norm in review contexts
  (GitHub ships Copilot code review with MCP calls restricted to read-only). Enable
  the narrowest toolset that answers the question; a heavy server with every toolset
  on burns context for nothing.
- **Approval still gates action.** Statelessness and MRTR make confirmation cheaper
  to implement, which strengthens rather than replaces
  [[12_Brain/protocols/approval-tiers|approval tiers]]: nothing sends, publishes,
  installs, or spends without a human.

Re-check when the next spec revision ships — the previous two landed in November and
July, so roughly a 90-day cadence.

## Links

- [[12_Brain/research/References/2026-07-30 - Casepoint permission-aware MCP pattern|Casepoint permission-aware MCP pattern]] — permission scoping on top of this shape.
- [[Research Verification Loop]] · [[Evidence Boundaries in Reporting]]
