# Align HCM — Plan to Get Cited by AI Answer Engines (GEO)
**Date:** 2026-07-09 · Goal: be the *cited source* in ChatGPT, Perplexity, Google AI Overviews, Gemini — not just a blue link.

Grounded in a live scan of alignhcm.com. AI citation is a different game from classic SEO: it rewards **crawlability + entity authority + extractable answers + off-site presence**, in that order.

---

## Where we stand (live findings)
| Signal | Status |
|---|---|
| AI crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended) | ✅ **Not blocked** — robots.txt only disallows HubSpot preview paths |
| FAQPage + BlogPosting schema on posts | ✅ **Done today** — 9 posts, validated |
| Organization schema + `sameAs` + address | ✅ Present on homepage |
| `WebSite` schema (entity + search action) | ❌ Missing |
| `llms.txt` (AI content map) | ❌ 404 — not present |
| `Sitemap:` line in robots.txt | ❌ Missing (sitemap.xml itself is live, HTTP 200) |
| Topic pillars / clusters | ❌ None — posts are standalone |
| Comparison / "vs" content + original data | ❌ Thin — the biggest citation gap |
| Off-site presence (G2, Clutch, Reddit, directories) | ❓ To audit — AI cites these heavily |

**Takeaway:** the plumbing is mostly good (crawlable, schema started). The real gaps are **entity completeness, extractable comparison content, topic authority, and off-site citations.**

---

## The plan (ranked by leverage)

### 1. Entity + crawlability quick wins — *this week, mostly automatable*
These make AI engines trust and correctly attribute "Align HCM."
- Add **`WebSite` schema** + expand **Organization `sameAs`** (LinkedIn, Crunchbase, G2, Clutch, YouTube) to the global head → entity disambiguation for knowledge graph + AI.
- Publish **`llms.txt`** at root — a curated map pointing AI tools to your best guides/pages.
- Add the **`Sitemap:` line** to robots.txt (sitemap exists, just isn't advertised).
- Confirm robots explicitly **welcomes** the AI agents (they're allowed today; make it intentional).

### 2. Answer-shaped, citable content — *ongoing (guides next week)*
AI quotes specific, liftable facts.
- **Direct answer up top** (40–60 words) on every key page — the snippet AI grabs.
- **Original, quotable data/frameworks** ("Across Align implementations, X…") — citation bait AI can attribute to you.
- **Definitions + stat callouts** for the terms buyers ask about.

### 3. Comparison / "vs" content — *highest citation demand*
AI answers a flood of "UKG vs Workday," "best HCM for public sector," "how much does an HCM implementation cost" queries. Own them:
- Comparison tables (the Buyer's-Guide P2 work → next week).
- Head-to-head and "best X for Y" pages built to be extracted.

### 4. Topic clusters / pillars — *topical authority*
- Build 2–3 pillar hubs: **"How to Choose an HCM Platform," "HCM Implementation," "Public Sector HCM"** — each linking the guides + related posts, and back. AI recognizes clustered authority.

### 5. Off-site citation surface — *needs Dillon; compounding*
AI engines cite third parties constantly. Get Align onto them:
- **Review/directory listings:** G2, Clutch, Capterra, plus UKG/Dayforce/Workday partner directories.
- **Community presence:** genuine expert answers on Reddit (r/humanresources, r/UKG), Quora, LinkedIn.
- **Digital PR / guest posts** for brand mentions + backlinks (still the #1 authority lever).

### 6. Measure it — *prove it's working*
- Monthly check: run target queries in Perplexity/ChatGPT/AI Overviews, log whether Align is cited.
- Watch branded search + referral traffic from AI sources (chat.openai.com, perplexity.ai) in analytics.
- Can be automated as a Routine.

---

## Execute split
- **I can do now:** WebSite + expanded sameAs schema, llms.txt, robots Sitemap line, pillar pages, comparison content, direct-answer restructuring, a monthly AI-citation-check Routine.
- **Needs Dillon:** confirm social/profile URLs for sameAs; off-site listings/reviews; PR outreach.

## Recommended sequence
1. **This week:** entity quick wins (#1) — fast, foundational, mostly me.
2. **Next week:** Buyer's-Guide tables + comparison content (#2/#3).
3. **Then:** pillars (#4), off-site push (#5), and stand up the citation-tracking Routine (#6).
