---
note_type: concept
status: active
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - "[[12_Brain/09_Ops/Web Escalation Architecture]]"
  - "[[12_Brain/01_Captures/research/2026-08-18 - Firecrawl web capability receipt]]"
  - "[[12_Brain/01_Captures/research/2026-08-18 - isolated Playwright MCP receipt]]"
  - "[[12_Brain/01_Captures/research/2026-08-18 - isolated Chrome browser access receipt]]"
tags:
  - concept
  - web
  - agents
---

# Web Escalation Ladder

**Summary:** pick the best live engine for the job; isolated Playwright MCP for JS interact; isolated Chrome on 9223 as dump-dom fallback; camofox for volume stealth.

`node _os/automation/bin/browser-access.js probe` is the source of live flags. Cloudflare without interaction stays on Firecrawl BATCH_SCRAPE stealth. Logged-in Ads/Gmail/GBP stays Claude in Chrome. Never port 9222. Never Playwright `--extension`.

## Links

- [[12_Brain/09_Ops/Web Escalation Architecture|Web Escalation Architecture]]
- [[12_Brain/02_Entities/Firecrawl|Firecrawl]]
- [[12_Brain/02_Entities/Camofox Browser|Camofox Browser]]
