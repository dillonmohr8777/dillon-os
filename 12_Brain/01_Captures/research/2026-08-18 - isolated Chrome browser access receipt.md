---
note_type: capture
status: compiled
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - https://example.com
  - System/browser-access.policy.json
tags:
  - capture
  - chrome
  - browser
  - research
---

# Isolated Chrome browser access receipt — 2026-08-18

Immutable receipt. Do not rewrite.

## What was tried

1. Cursor Playwright MCP `browser_navigate` to https://example.com — **failed** (`Extension connection timeout`). The Playwright MCP Bridge extension is not a live path in this cloud VM.
2. `google-chrome --dump-dom` using the default profile — **refused**. Wrapper injects `--remote-debugging-port=9222` and aborts on SingletonLock.
3. `/opt/google/chrome/chrome --headless=new` with `--user-data-dir` isolated and `--remote-debugging-port=9223`:
   - dump-dom HTML contained `<title>Example Domain</title>`
   - screenshot wrote a 1280x720 PNG (18963 bytes)

## Rule taken

Interactive browser access uses the real Chrome binary, an isolated profile, and evidence port 9223. Never 9222. Never the default profile. Camofox remains the volume-stealth engine when `:9377` is healthy.
