---
note_type: research
status: verified
created: 2026-08-01
updated: 2026-08-01
owner: Dillon Mohr
question: What do current primary platform sources actually require or expose for AI search discovery, citations, crawl control, and measurement?
verification_status: verified
confidence: 0.95
expires: 2026-11-01
review_on: 2026-09-01
source_refs:
  - https://developers.google.com/search/docs/appearance/ai-features
  - https://developers.google.com/search/docs/appearance/structured-data/sd-policies
  - https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
  - https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
  - https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c
  - https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a
  - https://docs.perplexity.ai/docs/resources/perplexity-crawlers
  - https://www.indexnow.org/documentation
  - https://support.google.com/webmasters/answer/17011259
  - https://support.google.com/trends/answer/4365533
  - https://support.google.com/google-ads/answer/7337243
  - https://support.google.com/google-ads/answer/2472708
tags:
  - brain
  - research
  - aeo
  - geo
  - ai-search
  - primary-sources
---

# Official AEO, GEO, and AI search guidance

## Conclusion

The durable strategy is not a separate set of magic AI tags. Current primary
platform guidance converges on crawl and index eligibility, clear and useful
text, accurate visible facts, internal discovery, truthful structured data,
fresh entity information, and measurement that separates citations from
traffic and outcomes.

## Google Search AI features

Google's site-owner guidance says that standard SEO practices remain relevant
for AI Overviews and AI Mode. There are no additional technical requirements or
special AI schema required. To be eligible as a supporting link, a page must be
indexed and eligible to appear in Search with a snippet.

Google highlights:

- allow crawling through robots, CDN, and infrastructure;
- make content discoverable through internal links;
- provide a good page experience;
- keep important content in textual form;
- support text with useful images and video;
- keep structured data aligned with visible content; and
- keep Business Profile and Merchant Center information current.

Google explicitly says a new machine-readable file or AI text file is not
required for its AI features. An `llms.txt` file can be used as optional
documentation for other tools, but it is not a Google AI Overview or AI Mode
requirement.

Google reports AI-feature search activity inside the general Search Console
Web performance view rather than as a separate ranking report. Site owners
should combine Search Console with analytics and downstream conversion data.

## Structured data

Google recommends JSON-LD as a practical format but requires the markup to
represent visible, relevant, current page content. Correct syntax does not
guarantee a rich result, citation, or ranking.

Operational implications:

- use the most specific appropriate type;
- complete required properties before optional expansion;
- keep images relevant and crawlable;
- do not mark up hidden, misleading, fabricated, or unrelated content; and
- validate both syntax and semantic accuracy.

## OpenAI search discovery

OpenAI's publisher guidance distinguishes search discovery from potential
training:

- `OAI-SearchBot` controls inclusion of content in summaries and snippets for
  ChatGPT search;
- `GPTBot` is the separate user agent publishers can disallow for potential
  model training; and
- a `noindex` meta tag is the stronger control when a publisher does not want a
  discovered URL surfaced as a link and title.

The crawler must be allowed to access the page in order to read page-level meta
controls. WAFs, CDNs, bot mitigation, authentication, and JavaScript challenges
can block access even when robots rules appear correct.

## Bing and Microsoft AI measurement

Bing Webmaster Tools exposes a distinct AI Performance report for supported
Copilot, Bing AI summaries, and selected partner experiences. It includes:

- total citations;
- cited pages;
- grounding queries;
- page-query mapping;
- time trends;
- intent and topic groupings;
- citation share and period comparison in preview features; and
- CSV/Excel exports.

Bing cautions that these are aggregated and sampled citation observations. They
do not represent clicks, rankings, authority, importance, or proof that one
content change caused the movement.

Bing's webmaster guidance states that the same crawl, index, consolidation,
quality, and clarity foundations support traditional Search and AI grounding.

## Perplexity

Perplexity documents `PerplexityBot` as its search-result crawler rather than a
foundation-model training crawler. Sites seeking Perplexity discovery should
verify robots access and published crawler identity/IP guidance instead of
assuming a user-agent string alone passes the WAF.

## Freshness and IndexNow

IndexNow is a change-notification protocol, not an indexing guarantee. Sites
can notify participating search engines when URLs are added, updated, or
deleted. A successful response confirms receipt, not crawling, indexing,
ranking, or citation.

Use sitemaps for complete URL coverage and IndexNow for timely changes when the
stack supports it.

## Keyword and demand data limits

Primary Google guidance also clarifies the source boundaries used by the
Dillon OS keyword method:

- Search Console query data shows queries that led to the site but omits
  anonymized queries and truncates rows.
- Google Trends is sampled, normalized, and scaled relative interest rather
  than absolute volume; low-volume data can be noisy.
- Keyword Planner provides ideas, search estimates, cost estimates, and
  forecasts, not guaranteed traffic or outcomes.
- The Google Ads search terms report shows significant actual queries that
  triggered ads and is distinct from the keyword target list.

## Operating recommendation

Use one combined program:

1. repair crawl, index, canonical, and page-experience eligibility;
2. organize content around real audience intent and entities;
3. make answers, evidence, relationships, and dates easy to understand;
4. keep business and product data consistent across relevant surfaces;
5. earn original proof and third-party corroboration;
6. control search and training crawlers deliberately by user agent and page;
7. measure organic queries, Bing citations, fixed prompts, referrals, and
   qualified outcomes separately; and
8. review platform guidance at least quarterly.

## Connected concepts

- [[12_Brain/03_Concepts/AEO GEO and AI Discovery]]
- [[12_Brain/03_Concepts/Entity Authority and Citation Readiness]]
- [[12_Brain/03_Concepts/AI Visibility Measurement]]
- [[12_Brain/03_Concepts/Keyword Research and Search Demand]]

