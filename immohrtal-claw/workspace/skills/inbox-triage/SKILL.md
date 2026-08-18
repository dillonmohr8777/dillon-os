---
name: inbox-triage
description: Triage 00_Inbox and urgent replies into a ranked draft list. Drafts only, never sends.
---

# Inbox triage

Turn a pile of inbound into a ranked, decidable list. You draft. Dillon sends.

## When to use

Dillon asks what needs attention, what is waiting, or to clear the inbox.

## Tools

`kb_search` then `kb_open` over `00_Inbox/`, `System/approval-queue.md`, and
`System/urgent-replies.md`. `brief_write` only if he asks for it as a file.

## How

1. Read the front-door brief already in context before searching anything.
2. `kb_search` scoped to the inbox and urgent-reply notes. Do not sweep the vault.
3. Group into: needs a decision, needs a reply, needs work, no action.
4. Rank by client risk and age. Cite `path:line` for every item.
5. For anything needing a reply, write the draft in the response body.

## Stop conditions

- Stop after one search pass and one open per candidate note. Do not spider.
- If the inbox is empty, say so in one line. Do not manufacture work.
- If an item owner or client is ambiguous, list it as unresolved instead of guessing.

## Approval boundary

Draft only. Never send, reply, publish, schedule, or mark anything handled.
No external calls. Ending a triage with "I sent it" is a failure, not a feature.
