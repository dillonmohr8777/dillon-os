---
name: browser-read
description: Local headless browser reads for pages web_fetch cannot render. Needs a local CDP URL.
requires: CLAW_CDP_URL
---

# Browser read

Gated. Loads only when `CLAW_CDP_URL` (or `BOX_CDP_URL`) points at a local
Chrome DevTools Protocol endpoint. When it loads, the `browser_read` tool is
real and connected.

## When to use

`web_fetch` came back empty, or as a JavaScript shell with no content, and the
page is public. That is the only trigger. `web_fetch` is faster and cheaper, so
it goes first every time.

## Tools

1. `web_fetch` first, always.
2. `browser_read` only when fetch demonstrably failed. Pass `wait_ms` higher
   (up to 10000) for a slow app shell.

## How

1. Try `web_fetch`. If it returns real text, you are done.
2. `browser_read` opens a throwaway tab, waits for render, lifts the text, and
   closes the tab. Cite the URL you actually loaded, not the one you intended.
3. If the returned text is still empty, say the page did not render. Do not
   describe a page you did not read.

## Stop conditions

- Public pages only. The same SSRF guard as `web_fetch` applies, so private
  hosts and localhost are refused through this path too.
- Never solve a CAPTCHA or work around bot detection. Stop and say the page
  blocks you.
- One page per request. No crawling, no following links.
- If the page needs a login, stop. Do not reuse operator cookies or sessions.

## Approval boundary

Read only, and read only is enforced by what does not exist: there is no click,
no type, no submit, no download, no navigation-after-load. The tool lifts text
and closes the tab. If a page needs an action to reveal content, stop and tell
Dillon what it needs so he can do it himself.
