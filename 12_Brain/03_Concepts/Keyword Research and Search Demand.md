---
note_type: concept
status: active
created: 2026-08-01
updated: 2026-08-01
domain: keyword research
maturity: operational
summary: Keyword research is a source-labeled demand model that joins real queries, customer language, intent, economics, pages, and downstream outcomes.
review_on: 2026-09-01
verification_status: verified
source_refs:
  - "[[02_Campaigns/IMMOHRTAL/AEO-SEO-Strategy]]"
  - "[[12_Brain/05_Projects/2026-07-30 - Qualified pipeline recovery]]"
  - "[[03_Content/SEO Keyword Targets]]"
  - "[[02_Campaigns/Search Terms Review Queue]]"
  - https://support.google.com/webmasters/answer/17011259
  - https://support.google.com/trends/answer/4365533
  - https://support.google.com/google-ads/answer/7337243
  - https://support.google.com/google-ads/answer/2472708
tags:
  - brain
  - concept
  - keyword-research
  - search-demand
  - seo
  - paid-search
---

# Keyword Research and Search Demand

Keyword research is the process of turning observable market language into a
prioritized demand model. A keyword list is only an intermediate artifact.

## What a keyword can and cannot prove

| Source | Strong use | Important limit |
|---|---|---|
| Search Console query data | Existing visibility, clicks, CTR, page-query relationships, branded vs non-branded growth | It omits anonymized and low-volume rows and is truncated in the interface |
| Google Ads search terms | Queries that actually triggered ads, cost, match behavior, negatives, and paid intent | It shows only significant terms and reflects the account's targeting choices |
| CRM, calls, and forms | Language tied to service fit, appointment, estimate, sale, and value | Requires clean disposition and source linkage |
| Keyword Planner | Keyword expansion, estimated monthly searches, forecasted cost and campaign planning | Estimates are not guaranteed traffic or conversions |
| Google Trends | Relative direction, seasonality, geography, and topic comparison | Normalized 0-100 interest is not absolute volume; low-volume data can be noisy |
| Autocomplete and related questions | Current phrasing, modifiers, questions, and adjacent concepts | A suggestion is not a volume estimate or proof of commercial value |
| Reviews, forums, sales notes, support | Customer vocabulary, objections, trust needs, and jobs to be done | Qualitative and subject to sampling bias |
| Competitor pages and citations | Content formats and sources the market currently rewards | Copying a competitor does not create differentiation or authority |

Always store the source and observation date with the query. Do not merge
estimated demand, actual traffic, paid triggers, and CRM outcomes into one
unlabeled number.

## The research sequence

### 1. Start with business reality

Record:

- offer or service;
- ideal and excluded customer;
- geography;
- profitable outcome;
- sales objections;
- operational capacity;
- conversion path; and
- claims the business can prove.

This prevents high-volume but irrelevant research from steering the plan.

### 2. Mine first-party evidence

Pull the last useful period of:

- Search Console queries and pages;
- Google Ads search terms and match types;
- call transcripts or disposition summaries;
- form fields and lead notes;
- CRM stages and won/lost reasons;
- site search, chat, FAQ, and support questions; and
- content that already earns qualified traffic or citations.

Look for both expected demand and surprises: wrong-company traffic, employment
queries, supplier intent, DIY intent, competitor confusion, location mismatch,
or missing service language.

### 3. Expand the language

Use multiple expansion lenses:

- service and product nouns;
- problem and symptom;
- desired outcome;
- cost, price, timeline, and process;
- comparison, alternative, versus, and best-fit;
- local modifiers and service areas;
- audience, industry, and use case;
- questions: what, why, how, when, who, can, should;
- proof: reviews, examples, case studies, results;
- objections and risk; and
- branded, competitor, and wrong-company variants.

Autocomplete expansion can reveal phrasing quickly. Treat it as language
discovery until it is corroborated by another source.

### 4. Normalize without destroying meaning

Preserve the raw query, then add normalized fields. Do not reduce distinct
intents to the same stem merely because words overlap.

Recommended keyword object:

```yaml
query: "exact observed or proposed phrase"
source: search_console
observed_at: 2026-08-01
market: "Philadelphia, PA"
audience: "service-business owner"
cluster: "google ads lead quality"
intent: diagnostic
funnel_stage: problem-aware
entity: "Google Ads"
page_type: guide
business_fit: high
evidence_strength: high
current_url: ""
target_url: ""
conversion_path: audit_request
status: proposed
notes: ""
```

### 5. Cluster by meaning

Create clusters around a shared job, entity, and decision. Synonyms may belong
together; identical words with different jobs may not.

Useful cluster axes:

- **problem:** why leads are poor quality;
- **solution:** offline conversion tracking;
- **service:** Google Ads management;
- **comparison:** agency vs in-house;
- **local:** concrete contractor in Solano County;
- **entity:** a company, product, person, or category;
- **process:** implementation timeline or checklist;
- **proof:** results, examples, reviews, or case studies; and
- **brand:** navigational and reputation queries.

See [[12_Brain/03_Concepts/Search Intent and Topic Architecture|Search Intent and Topic Architecture]].

## Opportunity scoring

Score the cluster, not merely the phrase.

| Factor | Weight | Question |
|---|---:|---|
| Business fit | 25 | Can this demand become the intended outcome? |
| Intent strength | 20 | How close is the searcher to a meaningful decision? |
| Evidence strength | 15 | Is this based on observed first-party behavior or only a suggestion? |
| Winnability | 15 | Can the brand offer a more useful or differentiated answer? |
| Existing authority | 10 | Does the site already have relevant proof, links, entities, or performance? |
| Reuse | 10 | Can the asset support ads, sales, social, email, and AI answers? |
| Freshness or timing | 5 | Is the opportunity seasonal, urgent, or newly emerging? |

Apply a risk penalty of up to 20 points for compliance exposure, factual gaps,
weak delivery capacity, wrong geography, reputation risk, or unverifiable claims.

## Turn research into a page system

Every accepted cluster needs a page decision:

- update an existing page;
- create a new canonical page;
- add a supporting article or FAQ;
- create a paid-search ad group or negative set;
- add a comparison, calculator, glossary, case study, or local page; or
- reject the cluster because it does not serve the business.

One primary URL owns one primary intent. Supporting pages answer narrower jobs
and link back with descriptive context.

## Paid and organic learning loop

Paid search is a fast language laboratory when tracking is trustworthy:

1. Start with bounded phrase and exact high-intent terms.
2. Review actual search terms.
3. Classify service fit, wrong-company, employment, DIY, supplier, research,
   competitor, and location intent.
4. Add negatives from verified bad intent.
5. Promote qualified language into organic pages and sales copy.
6. Import qualified and won outcomes when privacy, permission, and data quality
   are verified.
7. Expand only after query-to-outcome reconciliation is stable.

Do not optimize toward raw form fills or calls when the account cannot show
which ones became qualified opportunities.

## Scorecard

Measure at cluster and page level:

- number of source-backed queries;
- branded vs non-branded impressions and clicks;
- query coverage by intent and geography;
- high-impression/low-CTR opportunities;
- paid search terms accepted, negated, and unresolved;
- content pages mapped, missing, decaying, or competing;
- citations and grounding queries where available;
- qualified opportunities, estimates, appointments, wins, and revenue; and
- time from new signal to tested asset.

## Failure modes

- Treating search volume as revenue.
- Using autocomplete scores as exact demand.
- Creating one page per keyword variation.
- Letting broad match or Performance Max define the market before outcomes are
  trustworthy.
- Writing content for a phrase the business cannot serve.
- Mixing branded, informational, local, and transactional intent.
- Ignoring negative demand and wrong-company traffic.
- Declaring success from rankings while qualified pipeline is unknown.

## Template

Use [[_templates/Keyword Research Brief|Keyword Research Brief]].

