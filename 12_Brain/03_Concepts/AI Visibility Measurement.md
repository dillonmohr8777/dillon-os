---
note_type: concept
status: active
created: 2026-08-01
updated: 2026-08-19
domain: ai visibility measurement
maturity: operational
summary: AI visibility is measured with fixed prompts, platform-native citation data, referral analytics, and downstream outcomes while preserving engine and date variance.
review_on: 2026-09-01
verification_status: verified
source_refs:
  - "[[12_Brain/03_Concepts/AEO GEO and AI Discovery]]"
  - "[[12_Brain/01_Captures/Grok/2026-07-30 - forward-thinking-aeo-geo-seo-and-ai-discovery-leadership-pulse]]"
  - "[[12_Brain/05_Projects/2026-07-30 - Dillon OS five-goal operating plan]]"
  - "[[12_Brain/03_Concepts/CMO Lane Cost Discipline]]"
  - https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c
  - https://developers.google.com/search/docs/appearance/ai-features
  - https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
tags:
  - brain
  - concept
  - ai-visibility
  - citations
  - measurement
  - analytics
---

# AI Visibility Measurement

AI answers vary by engine, model, location, account, time, and query wording.
Measurement must be repeatable enough to reveal patterns without pretending
there is one permanent ranking.

## Measurement layers

| Layer | Question | Metrics |
|---|---|---|
| Eligibility | Can the system access and use the content? | crawl status, index status, snippet eligibility, bot access, canonical status |
| Presence | Is the entity mentioned? | mention rate, accurate-name rate, answer inclusion |
| Recommendation | Is it presented as a relevant choice? | recommendation rate, fit accuracy, position or prominence label where observable |
| Citation | Which sources support the answer? | owned citation rate, third-party citation rate, cited pages, grounding queries, citation share where available |
| Referral | Does a person reach the owned property? | sessions, landing pages, engagement, return rate |
| Pipeline | Does discovery create business value? | qualified opportunities, appointments, bookings, revenue, subscribers, assisted outcomes |

Never collapse these layers into one "AI visibility score" without retaining
the underlying measures. A simulated GEO engine is not a measurement layer;
it is a demo until a real SERP provider is connected.
See [[12_Brain/03_Concepts/CMO Lane Cost Discipline]].

## Golden prompt set

Create 7 to 25 fixed prompts per entity or client, divided by intent:

- definition: What is the category or solution?
- problem: How do I solve the user's core problem?
- local: Who provides the service in the market?
- comparison: What are the alternatives and tradeoffs?
- commercial: Which provider fits a defined use case?
- proof: What examples, research, or results exist?
- reputation: What is known about the organization or product?
- process: What does implementation, cost, timing, or eligibility involve?

Prompts should sound like real questions, include required geography or
audience, avoid leading the engine toward the brand, and remain versioned.

## Run protocol

For each run, record:

```yaml
prompt_id: ""
prompt_version: 1
engine: ""
surface: ""
run_at: 2026-08-01T12:00:00-04:00
location_or_market: ""
account_state: anonymous_or_signed_in
brand_mentioned: false
recommended: false
description_accurate: false
owned_citations: []
third_party_citations: []
competitors_mentioned: []
answer_notes: ""
reviewer: ""
```

Use the same prompt version and operating conditions for comparisons. A fresh
independent checker should review material conclusions or rerun a sample.

## Platform-native evidence

Prefer native data when available:

- Bing AI Performance: citations, cited pages, grounding queries, intent/topic
  groupings, citation share, and period comparisons.
- Search Console: overall Web performance for Google Search, including AI
  features in aggregate rather than a separate AI ranking report.
- Analytics: referrals from ChatGPT and other identifiable AI systems,
  engagement, conversions, and assisted outcomes.
- CRM: qualified and won results by source and landing path.

Bing explicitly notes that citation data is aggregated, sampled, and
observational. A change in citations does not prove that one content change
caused it.

## Source pattern analysis

For each prompt cluster, classify citations:

- owned brand page;
- official or primary institution;
- publisher or review site;
- community or forum;
- directory or marketplace;
- social or video platform;
- competitor; and
- unknown or low-quality source.

This reveals whether the strategy needs better owned content, stronger proof,
third-party inclusion, local parity, community presence, or technical access.

## Baseline and cadence

### Baseline

- Run every approved prompt across the selected engines in a narrow time
  window.
- Export Bing AI Performance and relevant Search Console data.
- Tag identifiable AI referrals in analytics.
- Record current content, entity, and crawler state.

### Weekly

- Sample the highest-value prompts.
- Review new citations, missing mentions, and inaccuracies.
- Inspect AI referrals and qualified outcomes.

### Monthly

- Run the full prompt set.
- Compare by intent, engine, source type, and page.
- Review citation share and grounding topics where available.
- Decide which content, proof, or distribution experiment to test.

### Quarterly

- Revalidate the prompt set against current customer language and offers.
- Retire stale prompts and version changed ones.

## Interpretation rules

- One response is an observation, not a rank.
- Mention without accuracy can be harmful.
- Citation without referral may still create awareness but is not traffic.
- Referral without qualified outcomes may be low-value discovery.
- Organic and AI visibility may share foundations but should not be attributed
  to each other without evidence.
- Changes in engine behavior, demand, freshness, competitors, and retrieval can
  move results independently of a site change.

## Experiment design

Test one coherent change at a time where possible:

- direct-answer and source structure;
- entity or Maps parity;
- original evidence or case study;
- updated freshness and dates;
- internal linking and canonical consolidation;
- third-party distribution; or
- crawler and indexing repair.

Record the pre-period, change date, post-period, competing changes, and the
business metric. Treat results as directional unless the design supports a
causal conclusion.

## Failure modes

- Calling an answer position a stable rank.
- Mixing engines or surfaces into one unlabeled result.
- Using leading prompts that name the brand.
- Ignoring personalization, geography, and run time.
- Celebrating citations while descriptions are inaccurate.
- Reporting traffic without lead quality.
- Claiming causality from a before/after screenshot.
- Allowing an automated model to judge its own brand prominence without a
  reproducible record.

