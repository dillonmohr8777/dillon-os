---
note_type: entity
status: active
created: 2026-08-18
updated: 2026-08-18
expires: 2026-11-18
source_refs:
  - https://github.com/dillonmohr8777/camofox-browser
  - "[[12_Brain/09_Ops/Web Escalation Architecture]]"
  - System/scripts/Clone-CamofoxBrowser.py
tags:
  - entity
  - tool
  - camofox
  - browser
---

# Camofox Browser

**Summary:** Dillon's Camoufox fork is the volume-stealth browser; isolated Chrome on 9223 is the live interactive default until `:9377/health` is up.

- Repo: `dillonmohr8777/camofox-browser` (Camoufox C++ spoof, REST on localhost:9377).
- Clone: `python System/scripts/Clone-CamofoxBrowser.py`. Never vendor into this vault.
- Best access for camofox: loopback REST, persistence plugin, isolated profiles. Cookie import stays gated (`CAMOFOX_API_KEY` is a credential change).
- When camofox is not running, `browser-access.js` uses isolated Chrome (port 9223) for fetch/screenshot. Playwright MCP is not a fallback until the desktop extension answers.
- Never attach camofox or evidence Chrome to port 9222 or Dillon's default profile.

## Links

- [[12_Brain/02_Entities/Firecrawl|Firecrawl]] · [[12_Brain/02_Entities/Claude in Chrome|Claude in Chrome]] · [[12_Brain/03_Concepts/Web Escalation Ladder|Web Escalation Ladder]]
