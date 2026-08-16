---
tags: [concept, mcp, security, research]
source: "[[12_Brain/raw/research/2026-08-16 MCP Stack Failure Modes Receipts]]"
updated: 2026-08-16
expires: 2026-11-14
---

# MCP Stack Failure Modes — 2026

**Summary:** piling on MCP servers fails through tool-result injection, secret sprawl, overlapping tools, and ungated writes — official guidance is trusted servers plus write gates, not a bigger directory haul.

No install recommendations. Research output does not authorize connect, send, spend, or account change. See [[12_Brain/protocols/approval-tiers|approval tiers]] and [[12_Brain/concepts/Draft-First Operating Rules|draft-first]].

## What official pages actually say

The spec does **not** say "prefer first-party MCPs." It says **trusted server**.

- Tool descriptions and annotations are untrusted unless they come from a trusted server. An untrusted server can lie with `readOnlyHint: true`.
- Clients **SHOULD** validate tool results before they reach the model. Results from server A are untrusted input to server B. Truncation is not a defense.
- There **SHOULD** be a human who can deny a tool call. Confirm sensitive operations.
- Token passthrough is **forbidden**. Each server keeps its own audience-bound token. The host holds credentials; generated code does not.

First-party is the strongest trust signal those pages give you. It is not a safety certificate. Official GitHub MCP still processed untrusted issue text. Official Meta ads MCP can write.

## Six failure modes (survivors only)

### 1. Prompt injection via tool results

The model cannot reliably tell your instructions from text inside a tool payload. A public GitHub issue, an inbound email, a screenshot caption, or a poisoned tool description is enough.

Invariant showed the official GitHub MCP leaking private-repo data into a public PR after a malicious issue — no compromised tool binary required. The same lab showed a second server shadowing `send_email` so mail went to an attacker. Willison's lethal trifecta is the stack-level version: private data + untrusted content + any exfil path (send, PR, HTTP, even a link). 2026-07-28 stateless MCP did not retire this. Google's own Gmail/Workspace MCP docs warn that unverified mail can hijack a session and tell you not to connect those servers to untrusted apps.

### 2. Secret sprawl

Each extra server is another token, refresh token, or developer token sitting where the agent can read it. Invariant's poisoning demo steals `mcp.json` for that reason. Official auth rules exist because passthrough and shared tokens turn one leak into every upstream API. GitHub now keeps Copilot review MCP tokens in repo secrets and added enterprise allowlists — and says `serverName` is not a security control because users can rename servers.

### 3. Overlap / tool confusion

Official client guidance: dump every connected server's tools into context and you waste tokens, add latency, and the model picks worse. The spec identifies a tool by `name` **on that server**. It does not require a cross-server namespace, so clients that flatten lists get collisions and shadowing (`search`, `create_issue`, `send_message`). Practitioner writeups in 2026 show last-loaded-wins with no warning. A "keep 3–4 servers" quota is vendor-blog, not spec. The real rule is zero overlapping capabilities and a review that names the overlap — the check already on [[12_Brain/entities/LandingFolio MCP|LandingFolio]] and the MCP acceptance gate.

### 4. Write-capable ads / email MCPs

Official first-party posture is split on purpose:

| Surface | Official write stance |
|---|---|
| Google Ads MCP | Read-only. GAQL / customers / metadata. No mutate tools. |
| Gmail MCP | `create_draft` only. No send tool. Human sends from Gmail. |
| GitHub Copilot code review MCP | Read-only by policy. |
| Meta ads MCP (`mcp.facebook.com/ads`) | Writes: create/edit campaigns, budgets, catalogs. Ads land **paused**. Portfolio admins can block create-campaign / edit-budget (including a max). Authorization through the agent is required. |

A community Gmail or ads server that adds `send` or `mutate` is a different product. Connecting it is a Tier-2 decision, not a directory click.

### 5. Unofficial Google Ads wrappers

Google's official Ads MCP is read-only. Community wrappers exist that flip writes on and take a developer token plus OAuth refresh token. Google Ads API policy is the constraint, not a blog ranking:

- You cannot let others automate Google Ads through **your** developer token or an API you wrap around it.
- Indirect token access can get **your** token revoked.
- Full-service third-party tools trigger Required Minimum Functionality.
- A tool must not look like a Google product.

"Ban-proof unofficial connector" is marketing. No install.

### 6. Directory quality

A registry row means someone listed a URL once.

- July 2026 official-registry census (n=10,716 remotes): about **one in four** advertised endpoints were unusable. The biggest hygiene miss was **404** (wrong URL), not downtime. Auth-gated (401/403) is alive, not dead — the viral "half of MCP is dead" line miscounts those.
- Separate July 2026 internet measurement (arXiv 2608.00150): 91.8% of dynamically audited live servers lacked OAuth; 41.6% of confirmed servers vanished within three days. Smithery / glama / PulseMCP were discovery sources, not reviewers.

Listing is not Inspector, permission, injection, or overlap review.

## What this means here

Dillon OS already matches the survivors: source + Inspector + permission + prompt-injection + overlap, sandbox-only until those pass, draft-first, no inferred send/spend. Keep it. Do not grow the stack from a directory. Prefer a first-party or otherwise trusted server; keep writes off until a human gate says otherwise.

## Links

- Receipts: [[12_Brain/raw/research/2026-08-16 MCP Stack Failure Modes Receipts]]
- [[12_Brain/entities/LandingFolio MCP|LandingFolio MCP]] · [[12_Brain/07_Reviews/MCP/2026-07-31 - landingfolio|LandingFolio review]] · [[12_Brain/07_Reviews/MCP/2026-07-30 - context7|Context7 review]]
- [[12_Brain/06_Research/References/2026-07-30 - Casepoint permission-aware MCP pattern|Casepoint permission-aware pattern]]
- [[12_Brain/concepts/Draft-First Operating Rules|Draft-First]] · [[12_Brain/protocols/approval-tiers|Approval tiers]] · [[12_Brain/concepts/Truth Hierarchy|Truth Hierarchy]]
- Decision: [[12_Brain/04_Decisions/2026-07-30 - Adopt gated intelligence stack]]
