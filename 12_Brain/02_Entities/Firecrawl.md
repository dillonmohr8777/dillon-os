---
note_type: entity
status: active
created: 2026-08-18
updated: 2026-08-18
expires: 2026-11-18
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - Firecrawl web capability receipt]]"
  - "[[12_Brain/09_Ops/Web Escalation Architecture]]"
tags:
  - entity
  - tool
  - firecrawl
---

# Firecrawl

**Summary:** Composio-connected crawl/search tool, live with 1,013 plan credits on 2026-08-18; stealth proxy exists only on batch scrape.

- Toolkit: Composio `firecrawl`, connection active.
- Cheap path: `FIRECRAWL_SEARCH` (this probe: 4 results, 2 credits).
- Clean page: `FIRECRAWL_SCRAPE` / `FIRECRAWL_EXTRACT`.
- Cloudflare / bot detection: `FIRECRAWL_BATCH_SCRAPE` with `proxy: "stealth"` (enum `basic` | `stealth` | `auto`). Do not assume SEARCH or SCRAPE accept `proxy`.
- Bright Data is not a substitute; it is inert until its key exists.

## Links

- [[12_Brain/02_Entities/Camofox Browser|Camofox Browser]] · [[12_Brain/03_Concepts/Web Escalation Ladder|Web Escalation Ladder]]
