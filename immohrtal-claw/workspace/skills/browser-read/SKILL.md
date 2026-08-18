---
name: browser-read
description: Local headless browser reads for pages web_fetch cannot render. Needs a local CDP URL.
requires: CLAW_CDP_URL
---

# Browser read

Gated. This skill only loads when `CLAW_CDP_URL` points at a local Chrome
DevTools Protocol endpoint.

## Status

The gate exists. A CDP transport is not wired into CLAW yet. Until it is, use
`web_fetch` and say when a page could not be read because it needs JavaScript.
Do not describe a page you did not actually load.

## When to use

A page `web_fetch` returns empty or as a JS shell, and it is a public page.

## Tools

`web_fetch` first, always. CDP only when fetch demonstrably fails.

## Stop conditions

- Public pages only. No logged-in sessions, no dashboards behind operator auth,
  no cookie or credential reuse.
- Never solve a CAPTCHA or work around bot detection. Stop and say the page blocks you.
- One page per request. No crawling.

## Approval boundary

Read only. No clicking through checkout, no form submission, no posting, no
account changes, no downloads. If a page needs an action to reveal content,
stop and tell Dillon what it needs.
