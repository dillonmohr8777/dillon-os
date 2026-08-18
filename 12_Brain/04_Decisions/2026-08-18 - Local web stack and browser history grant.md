---
note_type: decision
status: active
owner: Dillon Mohr
created: 2026-08-18
updated: 2026-08-18
decided_at: 2026-08-18
review_on: 2026-09-01
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - Firecrawl web capability receipt]]"
  - "[[12_Brain/09_Ops/Web Escalation Architecture]]"
  - System/scripts/Build-ClaudeAgents.py
tags:
  - decision
  - web
  - approval
  - camofox
  - browser-history
---

# Local web stack and browser history grant

**Decision:** Agents may build and operate the local web stack: rungs 0-4, sibling clone of camofox-browser, and sanitized ingest of Dillon's own Chrome/Edge history into `12_Brain/private/browser-history/`.

**Why:** Dillon asked for the full stack architecture, camofox in place, browser history granted, and Claude able to create that architecture. Firecrawl was proven live before the grant (4 URLs, 2 credits). Camofox is Dillon's own public fork, not a third-party install.

**Granted**

- Local architecture, generators, tests, and vault notes
- Read-only web rungs 1-4 (WebFetch, WebSearch, Firecrawl, BATCH_SCRAPE stealth)
- Clone `dillonmohr8777/camofox-browser` as a sibling / `.vendor` checkout
- Export Dillon's own browser history into the gitignored private layer
- Recursion contract writing into `earned-lessons.md`

**Still gated**

- send, post, publish, schedule, deploy, merge, spend, purchase
- account change, credential read, rotate, delete
- accept terms, submit forms
- Bright Data (no key)
- camofox cookie import (`CAMOFOX_API_KEY` is a credential change)
- anyone else's browser history

**Implications**

- "Full approval" in this session means the local stack, not outbound agency.
- Maker/checker and client isolation still hold.
- Next live test is invoking `growth-content` or `marketing-chief` on real work so the research→lesson→promotion cycle runs once.
