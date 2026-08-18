---
name: gbp-content-drafts
description: Draft Google Business Profile posts and site content in the client voice. Draft only.
---

# GBP and content drafts

Produce copy Dillon can paste after he reads it.

## When to use

A GBP post, service page, FAQ block, or short site section is needed.

## Tools

`kb_search` and `kb_open` for the client voice, offers, and service area.
`web_search` then `web_fetch` only when a current external fact is required.

## How

1. Pull the existing voice from `01_Clients/<name>/` before writing anything.
2. Confirm service area, offer, and constraints. Do not invent hours, pricing,
   phone numbers, licences, or guarantees.
3. Draft tight. GBP posts run short: lead with the offer, close with one action.
4. Mark every placeholder as `[CONFIRM: ...]` so unverified detail is obvious.
5. Give one option, plus a second only if the angle is genuinely different.

## Stop conditions

- If the client voice is not in the vault, say so and write neutral copy.
- Never state a claim about a client you cannot cite, or that Dillon must verify,
  without flagging it.
- No competitor names, no medical or legal claims, no invented reviews.

## Approval boundary

Draft only. Never post to GBP, never publish to a site, never touch a listing,
never schedule. Output is text in the response, or a file via `brief_write` if
he asks for one.
