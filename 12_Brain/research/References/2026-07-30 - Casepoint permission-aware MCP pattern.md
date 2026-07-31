---
note_type: research
status: reference
created: 2026-07-30
updated: 2026-07-30
owner: Dillon Mohr
verification_status: partial
expires: 2026-10-28
source_refs:
  - "https://www.prnewswire.com/news-releases/casepoint-launches-mcp-server-to-enable-customer-choice-ai-across-legal-and-government-workflows-302838623.html"
tags:
  - brain
  - research
  - mcp
  - permissions
  - reference
---

# Casepoint permission-aware MCP pattern

Casepoint's MCP announcement is saved as an architecture reference, not an integration.

## Pattern worth reusing

- Authenticate as the existing user rather than creating a more powerful agent identity.
- Enforce the source application's RBAC on every tool invocation.
- Begin with narrow read-only status and metrics tools.
- Keep source, tenant, and permission boundaries explicit in tool descriptions.
- Require auditability and fail closed when identity or authorization is ambiguous.
- Add write capabilities only after separate source, Inspector, permission, injection,
  overlap, and human-approval gates.

## Dillon OS application

Use this pattern for future CRM, analytics, GBP, Slack, Gmail, and client-system MCPs.
An MCP may expose only the exact capabilities already authorized for the selected user
and client. It may never infer cross-client access or approval for publishing, sending,
spending, deployment, or account changes.
