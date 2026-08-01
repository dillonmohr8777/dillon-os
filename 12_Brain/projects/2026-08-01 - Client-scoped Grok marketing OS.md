---
note_type: project
status: active
created: 2026-08-01
updated: 2026-08-01
owner: Dillon Mohr
area: marketing-automation
priority: high
outcome: "Fresh X evidence becomes client-separated, verified draft assets without authorizing external actions."
next_action: "Run one approved xAI profile, review its packet, and record baseline KPIs."
review_on: 2026-08-08
verification_status: verified
source: "[[12_Brain/research/2026-08-01 - Grok marketing OS verification]]"
tags: [project, grok, x-search, aeo, creative, automation]
---

# Client-scoped Grok marketing OS

The OS now turns bounded X research into verified client drafts and hash-locked creative manifests while failing closed on client bleed and external actions.

## Delivered control path

1. Exact client notes carry opaque `automation_client_id` values.
2. Three watchlists cover HCM, local HVAC, and family law/mediation.
3. `marketing-os.js watchlist` validates the client-note match and compiles a bounded xAI profile.
4. `xai-research.js` uses native X Search plus bounded web verification, rejects returned tool-call counts over the profile budget, and rejects malformed client packets. The post-run check prevents ingestion, not provider-side credit consumption.
5. `marketing-os.js packet` requires the exact canonical client reference, rejects known foreign client scopes, missing evidence, unsupported verified labels, structured action fields, and common direct-action language. Natural-language and entity detection are defense-in-depth, not authorization boundaries: every string remains untrusted, `external_actions` must be false, and no executor exists for sends, CRM writes, spend, authentication, or deployment.
6. The rendered draft includes ranked claims, brief, FAQ set, comparison skeleton, conditional schema suggestions, sales bullets, and a client-alert draft.
7. `marketing-os.js creative` hash-locks the canonical logo, approved references, and first frame; separates style runs; and permanently leaves manifest approval pending. Approval is recorded only by the separate workflow gate.
8. The existing [[12_Brain/04_Decisions/2026-07-30 - Adopt gated intelligence stack|maker/checker]], AEO, and human gates remain authoritative.

## Ranked automation map

The canonical executable registry is `12_Brain/registry/automations.json`.

| Rank | Automation | State | KPI |
|---:|---|---|---|
| 1 | Client X watchlist | implemented | actioned alerts per week |
| 2 | Verified packet → brief + FAQ | implemented | drafts with at least three usable citations |
| 3 | Logo + references → comic manifest | implemented | approved manifests per month |
| 4 | Panel → image-to-video | operator-gated | delivered video assets |
| 5 | FAQ → HubSpot KB draft | draft implemented; write gated | approved KB drafts |
| 6 | Local entity + answer audit | implemented through AEO gate | passing test pages |
| 7 | HCM ROI evidence packet | implemented | sales enablement reuse |
| 8 | Competitor comparison skeleton | implemented | proposal reuse |
| 9 | Freshness review queue | implemented as experiment | reviewed pages and citation delta |
| 10 | Verified client alert | draft implemented; send gated | alerts that trigger action |
| 11 | Conditional schema suggestion | implemented | validated deployments |
| 12 | Client-separated comic substyles | implemented | approved style variants |

## Watchlists

- HCM: `_os/automation/profiles/client-watchlists/align-hcm.json`
- Local home services: `_os/automation/profiles/client-watchlists/shadow-hvac.json`
- Law/wellness priority lane: `_os/automation/profiles/client-watchlists/bok-law.json`

Handles are proposed research scope, not an endorsed or complete competitor set. Review them before using paid xAI credits.

## 30-day experiment queue

### Test 1 — X research loop

- **Status:** ready for operator credential use.
- Compile each watchlist, inspect the dry-run request, then run one highest-priority profile.
- **Pass:** valid packet, no cross-client data, source URLs preserved, and at least one claim survives authoritative checking.
- **KPI:** usable claims divided by claims reviewed; actioned alerts per run; xAI cost per usable claim.

### Test 2 — AEO/GEO loop

- **Status:** implementation ready; five page URLs and baseline query set require operator selection.
- Apply direct-answer structure, one authoritative statistic where support exists, visible dates, entity consistency, and crawler access.
- Do not change dates without material edits and do not add schema unless extractability exists.
- **Pass:** AEO gate passes and surface-specific citation checks are recorded before and after.
- **KPI:** citation change by AI surface, not pooled “AI mentions.”

### Test 3 — HubSpot/customer-agent loop

- **Status:** local FAQ draft ready; HubSpot write remains Tier 2.
- Test retrieval with a simulated customer question before any approved KB write.
- **Pass:** the response cites the intended approved FAQ and does not retrieve another client’s content.
- **KPI:** correct retrieval rate and unsupported-answer rate.

### Test 4 — Branded comic-video loop

- **Status:** manifest gate ready; canonical logo, approved references, Imagine access, and human review are operator inputs.
- Run classic American, pop-art, noir, and manga styles separately; select one approved panel as the image-to-video first frame.
- **Pass:** independent visual comparison finds no brand mix, logo remains recognizable, and approval is explicit.
- **KPI:** approved assets per run, rejected-logo-drift rate, and cost per approved asset.

### Test 5 — Cross-loop synthesis

- **Status:** starts after Test 1 produces a passing packet.
- Use the same verified claims for one AEO brief and one comic-enabled sales draft.
- **Pass:** both assets preserve claim IDs and source URLs, with no new unsupported assertion.
- **KPI:** time and cost to an approved usable asset versus the recorded manual baseline.

## Hard gates

- No publish, email, Slack, HubSpot write, spend, deploy, or client delivery without exact approval.
- No creative run without a canonical logo and approved references.
- No `verified` claim without an authoritative source and confirmed authoritative check.
- No packet with a missing or mismatched client ID.
- No adoption without distinct maker and checker identities.

## Known operating limits

- X overrepresents vocal, English-speaking, engagement-optimized users.
- Engagement is a ranking input, not evidence strength.
- Local and quiet B2B categories may produce thin or partial packets.
- Subscription OAuth reliability, model availability, rate limits, rollout geography, and pricing must be checked at execution time.
- A valid local draft does not prove that an external platform accepted or published it.
