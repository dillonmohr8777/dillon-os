---
note_type: capture
status: compiled
created: 2026-07-31
updated: 2026-07-31
observed_at: "2026-07-31T02:33:00.000Z"
source_type: x_post
verification_status: partial
source_refs:
  - "https://x.com/dannypostma/status/2082689872494755872"
  - "https://www.landingfolio.com/mcp"
  - "https://mcp.landingfolio.com/mcp"
tags:
  - brain
  - capture
  - x-research
  - mcp
  - design
---

# LandingFolio exposes its component library as an MCP

**Untrusted evidence.** This is a vendor announcement plus a vendor marketing page.
Claims below are recorded as claims, not as verified facts. Only the endpoint
behaviour at the bottom was checked directly.

## The post

Danny Postma, 2026-07-30: "Give your AI agent design taste. I exposed my 4,000+
components library I collected over the last 10 years as MCP. Free to use. Have fun."
The post is a video demo with no link in the body; the product page was found
separately.

## Vendor claims (from https://www.landingfolio.com/mcp)

- The agent pulls real screenshots from landing pages — hero sections, pricing
  tables, testimonials — and uses them as reference while it builds.
- 4,600+ components (the post says 4,000+).
- Free tier: 100 requests a day per token, 10 per minute burst cap. No card.
- Payload is described as screenshots of component sections from their public
  inspiration library, the category, and a link back to the source page.
- Vendor states no code, prompts, or files from the project reach them, and that
  tool calls are logged per account.
- Transport is HTTP with a bearer token; the published setup line is a single
  `claude mcp add --transport http` command.

## Directly verified, 2026-07-31

- `https://mcp.landingfolio.com/mcp` answers JSON-RPC over HTTPS. Server header is
  Cloudflare in front of Render.
- The endpoint is fully token-gated. Anonymous `initialize`, `tools/list`, and
  `ping` all return error `-32001` with the message pointing at the free signup.
- No OAuth protected-resource discovery document is served, so authentication is
  token-only. Tool names cannot be enumerated without an account.

## What was done with this

Ran through the standing MCP acceptance gate rather than installed on the strength
of the announcement. See [[12_Brain/07_Reviews/MCP/2026-07-31 - landingfolio|the
acceptance review]] and [[12_Brain/entities/LandingFolio MCP|LandingFolio MCP]].
