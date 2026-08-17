---
note_type: concept
status: active
created: 2026-08-01
updated: 2026-08-01
domain: entity authority
maturity: operational
summary: Entity authority comes from consistent identity, explicit relationships, original evidence, and corroboration across owned and trusted third-party sources.
review_on: 2026-09-01
verification_status: verified
source_refs:
  - "[[12_Brain/03_Concepts/AEO GEO and AI Discovery]]"
  - "[[02_Campaigns/IMMOHRTAL/Entity Pack]]"
  - "[[02_Campaigns/IMMOHRTAL/AEO-SEO-Strategy]]"
  - "[[Daily-Briefs/aeo-trust-report]]"
  - https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
  - https://developers.google.com/search/docs/appearance/structured-data/sd-policies
tags:
  - brain
  - concept
  - entities
  - citations
  - structured-data
  - trust
---

# Entity Authority and Citation Readiness

An entity is a specific person, organization, place, product, service, event,
work, or concept that systems can distinguish from similarly named things.
Authority is the web of credible evidence supporting what that entity is,
does, and can prove.

## The entity record

Maintain one canonical statement for each important entity:

```yaml
canonical_name: ""
entity_type: organization
description: "plain factual definition"
primary_url: ""
parent_or_owner: ""
brands: []
services_or_works: []
locations_or_service_areas: []
people: []
same_as: []
proof_sources: []
last_verified: 2026-08-01
```

Client truth remains in `01_Clients/`. The concept layer explains the reusable
method and links to canonical client records rather than duplicating them.

## Authority stack

### First-party identity

- canonical website and about/contact pages;
- visible business facts and ownership;
- author or expert profiles;
- product, service, work, event, and location pages;
- current policies, dates, and availability; and
- structured data that matches visible content.

### First-party proof

- original research and data;
- case studies with defined methods and limits;
- real project, team, product, or event imagery;
- demonstrations, calculators, tools, and templates;
- documented process and methodology; and
- current customer outcomes that are approved and supportable.

### Third-party corroboration

- business profiles and industry directories;
- editorial coverage and podcasts;
- citations by trusted experts or organizations;
- genuine reviews;
- relevant community discussions;
- platform profiles for creators, products, music, video, software, or events;
  and
- partner or customer pages that accurately name the relationship.

The goal is agreement, not artificial repetition. Exact wording may vary while
the underlying identity and facts remain consistent.

## Relationship model

Use explicit relationships such as:

- organization **offers** service;
- person **works for** or **founded** organization;
- service **available in** market;
- article **authored by** person;
- case study **about** client and service;
- event **organized by** organization;
- product **belongs to** brand;
- page **is part of** topic cluster; and
- profile **same as** the canonical entity.

Schema.org and JSON-LD can encode some of these relationships. Use stable `@id`
values and `sameAs` only for genuine representations of the same entity.

## Citation readiness

A source is citation-ready when another publisher or answer engine can quickly
understand:

- the exact claim;
- who made or owns it;
- when it was true;
- the evidence and method;
- the applicable population, geography, or product;
- limitations or uncertainty; and
- a stable canonical URL.

Put evidence close to claims. Use descriptive tables, definitions, examples,
and dates. Avoid unqualified superlatives and anonymous statistics.

## Brand source vs referee source

Some questions naturally cite the brand: official product specifications,
policies, pricing, store details, and first-party research. Other questions
prefer independent referees: comparisons, rankings, safety, finance, medical,
legal, or reputation topics.

For each important topic, map:

1. sources engines currently cite;
2. whether they are brands, publishers, communities, directories, or primary
   institutions;
3. what evidence earns inclusion;
4. which owned source should be authoritative; and
5. which third-party relationships or contributions are legitimate to pursue.

Do not manufacture reviews, Wikipedia coverage, community threads, or links.

## Entity consistency audit

Check:

- names, abbreviations, and spelling;
- entity type and category;
- website, logo, and primary image;
- parent, brand, and ownership relationships;
- people and author profiles;
- address or service area, phone, hours, and contact routes;
- products, services, works, and events;
- `sameAs` links;
- duplicate or stale profiles;
- schema-visible content parity; and
- contradictions across high-authority sources.

Record contradictions rather than silently choosing the preferred version.

## Structured data rules

- Use the most specific appropriate type supported by the page and platform.
- Mark up visible, current, relevant content.
- Include required fields before optional abundance.
- Prefer accurate, complete, maintainable markup to a giant graph.
- Keep images crawlable and relevant.
- Validate syntax and then manually validate meaning.
- Remember that valid markup enables eligibility; it does not guarantee a
  search feature or citation.

## Scorecard

- entity description accuracy across core surfaces;
- percentage of critical relationships explicitly represented;
- NAP or profile parity where relevant;
- number and quality of original proof assets;
- third-party corroboration by source type;
- owned vs referee citation pattern;
- contradictions and time to resolution;
- pages cited and grounding queries; and
- qualified referrals and outcomes tied to entity discovery.

## Failure modes

- Adding every possible schema property without maintaining it.
- Using `sameAs` for related but non-identical entities.
- Treating schema as proof.
- Publishing invented awards, statistics, reviews, locations, or associations.
- Inconsistent rebrands, logos, categories, or profiles.
- Creating fake authority surfaces instead of original evidence.
- Ignoring the independent sources that dominate a category.

