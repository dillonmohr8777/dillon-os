---
note_type: review
status: done
created: 2026-07-30
updated: 2026-07-30
owner: Dillon Mohr
verification_status: verified
source_refs:
  - "_os/automation/fixtures/sites/aeo-healthy"
tags:
  - brain
  - review
  - aeo
  - website-qa
---

# AEO and trust gate

**Verdict: PASS**

- Site: `_os/automation/fixtures/sites/aeo-healthy`
- Profile: `_os/automation/profiles/site-factory-default.json`
- Critical failures: none
- Warnings: none

| Result | Check | Severity | Evidence |
|---|---|---|---|
| PASS | html-lang | critical | Language is en. |
| PASS | title | critical | Title length is 51. |
| PASS | meta-description | critical | Meta description should be specific and at least 70 characters. |
| PASS | canonical | critical | Canonical link is required. |
| PASS | viewport | critical | Viewport meta is required. |
| PASS | single-h1 | critical | Expected one H1; found 1. |
| PASS | direct-answer | critical | The first 300 words need a direct definition or answer block. |
| PASS | summary-structure | warning | Add a scannable summary, list, or section structure. |
| PASS | faq | critical | FAQ signals found: 2; FAQPage schema: true. |
| PASS | json-ld | critical | JSON-LD blocks: 1; types: HVACBusiness, FAQPage, Question, Answer; parse errors: 0. |
| PASS | real-images | critical | Real image candidates: 1. |
| PASS | image-alt | warning | 1/1 real images have useful alt text. |
| PASS | contact-signal | critical | A visible contact or conversion path is required. |
| PASS | nap-parity | critical | Expected business identity is present. |
| PASS | robots-ai-access | critical | No required AI bot is explicitly blocked. |
| PASS | internal-links | critical | Internal links: 2; broken: none. |
| PASS | placeholder-copy | critical | Placeholder copy must be removed. |

## Deployment contract

A failing result blocks deployment. A passing result is necessary but does not
replace visual review, functional QA, maker/checker separation, or the mapped
Netlify target verification.
