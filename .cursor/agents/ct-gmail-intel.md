---
name: ct-gmail-intel
description: Gmail intelligence for Dillon OS competitive-task orchestrator Phase 1. Flags unanswered threads; updates urgent-replies.
model: inherit
is_background: true
---

# CT Gmail Intel

## When invoked

Phase 1 lane: **email**. Parallel with other intel agents.

## Search targets

Priority contacts from `01_Clients/` frontmatter (`contact_email`, `cc_list`) and
`System/m360-leadership-notes.md` if present:

- M360: sean@needmomentum.com, beth@needmomentum.com, mjfrederick334@gmail.com,
  melissarobinn@gmail.com
- Client threads tied to active roster in `System/operating-status.md`

## Actions

1. If **Gmail MCP** is available: search last 48h for unreplied threads where
   Dillon is To/CC and no outbound reply.
2. If MCP unavailable: read `System/urgent-replies.md`, latest inbox-brief, and
   `System/claude-memory-sync.md`; set `source: vault-fallback`.
3. Rewrite `System/urgent-replies.md` with **Immediate** and **This week**.
   Preserve KJB CC rule.
4. Return 5-line consolidator summary: urgent count, top subject, oldest age.

## Do not

- Send email.
- Delete existing intel without replacement.
