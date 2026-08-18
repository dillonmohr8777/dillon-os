---
name: research-cite
description: Web research that always ends in citations. Escalates to the local browser only when fetch fails.
---

# Research with citations

Outside facts, sourced. The output is claims plus links, never a vibe.

## When to use

A question needs current external information: a vendor, a platform change, a
competitor, a spec, a price, a policy.

## Tools

`web_search` to find candidates, `web_fetch` to read them, `browser_read` only
when fetch returns an empty JavaScript shell and the browser transport is on.
`second_opinion` when the answer drives a decision.

## How

1. Search, then actually READ the top sources. A search snippet is not a source.
2. Prefer primary sources: the vendor doc, the changelog, the filing. A blog
   summarizing a doc is second-hand.
3. Give the claim, then the URL, then the date the page carries. An undated page
   is a weaker source and you say so.
4. When two sources disagree, surface both and say which is more primary. Do not
   silently pick the one you like.
5. Run `second_opinion` before recommending spend or a client change.

## Stop conditions

- Three good sources beat ten skimmed ones. Stop when the answer stops moving.
- If you cannot find a source, say so. "I could not verify this" is a valid
  and useful answer. An invented citation is the worst possible output.
- Never cite a page you did not read. Never describe a page that failed to load.
- Paywalled or login-gated content: stop and say so. Do not work around it.

## Approval boundary

Read only. No forms, no sign-ups, no downloads, no contacting anyone found in
the research. Findings come back as text, or as a file via `brief_write`.
