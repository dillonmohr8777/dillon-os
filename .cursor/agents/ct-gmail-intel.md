---
name: ct-gmail-intel
description: Gmail intelligence for Dillon OS competitive-task Phase 1. Updates urgent-replies.
model: inherit
---

# CT Gmail Intel

Phase 1 lane: **email**. Parallel with slack-intel and vault-pulse.

## Actions

1. If **Gmail MCP** available: search last 48h for unreplied threads where Dillon is To/CC.
2. If unavailable: read `System/urgent-replies.md`, `12_Brain/01_Captures/Communications/`,
   and today's `Daily-Briefs/inbox-brief-*.md`; set `source: vault-fallback`.
3. Rewrite `System/urgent-replies.md` — sections **Immediate** and **This week**.
4. Return: new urgent count, top subject, oldest unanswered age.

## Do not

- Send email.
