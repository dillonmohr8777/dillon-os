---
note_type: public-source-expansion
status: manifest_ready_research_only_activation_held
created: 2026-08-25
updated: 2026-08-25
owner: IMMOHRTAL Demand Intelligence Lead
workflow: IMMOHRTAL-DAILY-20260825
step: LEADS-PUBLIC-SOURCE-EXPANSION
source_refs:
  - "[[12_Brain/05_Projects/2026-08-24 - IMMOHRTAL Marketing Solutions]]"
  - "[[06_Revenue/IMMOHRTAL/EVIDENCE-AND-SOURCE-RULES]]"
  - "[[05_Offers/IMMOHRTAL/QUALIFICATION]]"
  - "[[06_Revenue/IMMOHRTAL/lead-intelligence/SOURCE-AUDIT-2026-08-25]]"
  - "https://search.certifications.sba.gov/"
  - "https://www.sec.gov/search-filings/edgar-application-programming-interfaces"
  - "https://www.sec.gov/search-filings/edgar-search-assistance/accessing-edgar-data"
  - "https://api.usaspending.gov/"
  - "https://api.usaspending.gov/docs/endpoints"
  - "automation/immohrtal-agency/config/public-source-policy.json"
  - "automation/immohrtal-agency/src/public-company-allowlist.mjs"
  - "automation/immohrtal-agency/test/public-company-allowlist.test.mjs"
tags:
  - immohrtal
  - revenue
  - lead-intelligence
  - public-sources
  - governance
---

# IMMOHRTAL public-source expansion lane

**As of:** 2026-08-25 17:29 ET
**Truth state:** current source manifest, research only
**Commercial state:** zero company records added, zero qualified leads, zero contacts, zero outreach-ready sources, zero external actions

Related: [[06_Revenue/IMMOHRTAL/lead-intelligence/SOURCE-AUDIT-2026-08-25]];
[[06_Revenue/IMMOHRTAL/EVIDENCE-AND-SOURCE-RULES]];
[[06_Revenue/IMMOHRTAL/PIPELINE-LIFECYCLE]].

## Outcome

A governed company-research lane can expand beyond the authorized 47-row Sheet,
but it is not a contact or outreach source. Four current paths are available:
bounded Exa company discovery, first-party company sites, the SEC EDGAR public
company APIs, and the USAspending public recipient API. The SBA Small Business
Search is also publicly reachable, but recurring automated ingestion is held
until its export or API terms are proven.

No new company or person record was retained in this source-design pass. Public
access does not prove outreach permission, buyer intent, need, decision authority,
suppression clearance, or commercial fit.

## Current capability evidence

The callable Exa `category:company` probe succeeded and returned five
company-level results with homepage locators. Its raw payload also exposed
prohibited person, contact, and postal fields. The safe conclusion is narrow:
Exa may be used as an ephemeral locator, but raw-result persistence must remain
disabled. A pure-local allowlist adapter now exists and passed 10 of 10
adversarial tests. It accepts only normalized company identity fields after an
upstream in-memory projection, rejects unknown and contact-bearing fields, and
has no network, filesystem, console, or raw-payload serialization path. It is
not yet connected to a recurring fetch, dedupe, conflict, or suppression flow.

The Exa public fetch tool also read five official source pages successfully:
the SBA Small Business Search landing page, two SEC EDGAR documentation pages,
and two USAspending documentation pages. No prospect company page or contact
record was retained.

## Source manifest

| Source | Current evidence | Internal authorization | Normal use | Current capacity |
|---|---|---|---|---:|
| Exa `category:company` | Callable on 2026-08-25; local allowlist tested | Ephemeral locator only | Resolve homepage candidates, project only allowed company fields in memory, then discard raw payload | 0 automatic; up to 8 manually filtered accounts within the shared cap |
| First-party company website | Available per selected candidate | Read-only company research | Confirm identity and one reproducible public observation | Up to 8 verified accounts within the shared cap |
| SBA Small Business Search | Public official page fetched on 2026-08-25 | Manual locator only | Optional company discovery for federal-contracting businesses | 8 manual; 0 automatic |
| SEC EDGAR APIs | Official no-auth API docs fetched on 2026-08-25 | Company identity research only | Current public-filer identity and filing recency | Up to 8 reviewed accounts within the shared cap |
| USAspending API | Official no-auth API docs fetched on 2026-08-25 | Recipient company locator only | Bounded recipient discovery followed by first-party verification | Up to 8 reviewed accounts within the shared cap |

### Exa company locator

- Use only `category:company`.
- View no more than 10 ephemeral results per query.
- Persist only a company name after first-party confirmation, canonical domain,
  public company-page locator, query fingerprint, and retrieval time.
- Never persist raw output, people results, personal profiles, contact fields,
  addresses, enrichment estimates, or named employees.
- If the adapter cannot prove redaction before the file write, retain zero
  accounts and stop the batch.

### First-party company website

This remains the highest-priority source for identity and observable public
conditions. A retained account must include the canonical domain, exact evidence
URL, observed date, 14-day refresh date, one reproducible company-level
observation, confidence, and explicit unknowns.

Do not store person names, roles, contact channels, postal details, raw HTML,
form content, login-only material, or inferred private business impact. A public
site symptom does not prove lost leads, traffic, rankings, revenue, budget, or
buyer intent.

### SBA Small Business Search

The public SBA page describes a search surface for businesses seeking federal
contracts. It can supply company locators for a manual, bounded review. No
public API or bulk export authority was proven in this pass, so automated
ingestion remains disabled. Retain nothing until the identity is reproduced on
the company's first-party website and government-contractor, vendor, partner,
and existing-client conflicts are clear.

### SEC EDGAR

The SEC documentation says the EDGAR JSON APIs do not require authentication
and are updated throughout the day. The current fair-access page publishes a
maximum request rate of 10 per second and requires efficient, declared-user-agent
access. IMMOHRTAL should operate far below that ceiling and review no more than
eight company records per run.

Allowed fields are current company name, CIK, ticker, exchange, latest filing
date, source locator, and retrieval time. Exclude addresses, people, officer or
owner records, individual filers, free-form filing bodies, and contact fields.
EDGAR is a narrow public-company lane and will often be outside the target small
service-business profile.

### USAspending

The official API is public, uses V2, and its current endpoint index says no
authorization is required. Recipient names and company identifiers may be used
only as locators for a bounded business-category query. Any retained identity
must then be verified on its current first-party site.

Government-award history alone does not prove service fit, a marketing need,
buyer intent, budget, or decision authority. Government entities, individuals,
clients, partners, vendors, employers, and separate ventures must be excluded.

## Sources held outside the recurring lane

| Source class | State | Reason |
|---|---|---|
| Exa people search | Blocked | Contact discovery and personal records are outside current authority |
| Personal LinkedIn profiles or private LinkedIn paths | Blocked | No direct connector or authenticated research authority is proven |
| Commercial maps, review, or business directories | Blocked for recurring ingestion | Public visibility does not prove bulk extraction, storage, or reuse rights |
| State or local registries without exact source review | Blocked | Terms, fields, access, and business-purpose limits vary by jurisdiction |
| Search snippets, model output, or generated company lists | Locator only | They cannot independently prove identity, fit, need, authority, or current status |

## Dedupe contract

Use `domain:<registrable-first-party-domain>` as the primary account key.
Exact SEC CIK, USAspending UEI, or a canonical public company-page slug may be a
secondary key. A normalized company name plus country is a review signal only
and may never drive an automatic merge.

Compare every candidate against:

1. The authorized 47-row Sheet.
2. `06_Revenue/IMMOHRTAL/pipeline-import.json`.
3. Every retained requalification batch.
4. The private outbound ledger without copying contact fields.
5. `client-operations/registry/clients.json`.
6. `client-operations/queue/work-items.json`.

An exact existing account may receive a new source reference only after the
canonical owner approves the merge. A name-only possible match stays separate
and held at `P00_ACCOUNT_RESEARCH`. A confirmed cross-client or cross-venture
match is excluded or routed to the exact canonical owner.

## Conflict and suppression contract

Before any `P10` entry, check the client registry, work queue, prior IMMOHRTAL
records, private outbound ledger, employer and job-search boundaries, partner
and vendor boundaries, platform representatives, separate ventures, franchise
and webinar exclusions, staffing and agency exclusions, and business-category
acceptance.

This lane has no contact records, so contact-level suppression is not applicable.
Account-level suppression is still mandatory. Check do-not-pursue state, prior
opt-out or complaint linked to the company, disputed identity, and protected
client, partner, or vendor relationships. Missing canonical clearance means
`pending_fail_closed`. No account may cross `P20`, and no contact discovery may
start, until an authorized suppression source proves clear.

## Safe daily batch

The existing eight-account daily cap remains shared across the Sheet lane and
every public-source lane. This manifest does not create an additive quota.

1. Choose one approved discovery source and one explicit company-level ICP
   query. Record the source-rights state and a query fingerprint.
2. Retrieve no more than 10 ephemeral locators. Never use Exa
   `category:people`.
3. Apply an in-memory field allowlist before any file write. Discard every
   person, contact, address, enrichment, and raw payload field.
4. Resolve a stable account identity and canonical first-party domain.
5. Dedupe and complete relationship, business-category, and source-rights
   checks.
6. Read the current first-party site and record one reproducible company-level
   observation plus explicit unknowns and a 14-day refresh date.
7. Leave suppression pending until an authorized canonical source proves clear.
   Leave the 0 to 16 qualification score null until every dimension is evidenced.
8. Persist no more than eight privacy-safe `RESEARCH_ONLY / P00` records, run
   JSON and zero-PII validation, and require independent QA before any
   commercial boundary.

If redaction, identity, source rights, dedupe, conflict, suppression, freshness,
or evidence is uncertain, persist zero for the affected record and hold the
batch or record at `P00`.

## Required provenance

Every retained public-source account needs:

- source lane, source type, exact locator, query fingerprint, and observation
  time;
- canonical first-party domain and exact evidence URLs;
- observed date, refresh due date, truth state, and confidence;
- source-rights, source-integrity, identity, duplicate, relationship-conflict,
  and suppression states;
- explicit unknowns, lifecycle, stage, and external-action count.

## Fail-closed stage contract

Every new account starts as:

- lifecycle `RESEARCH_ONLY`;
- stage `P00_ACCOUNT_RESEARCH`;
- commercial status `uncontacted`;
- qualification score `null`;
- forecast category `excluded`;
- amount and probability `null`.

`P10` requires a stable identity, current first-party source, one reproducible
public observation, dated freshness, a service-lane hypothesis, explicit
unknowns, and no confirmed hard disqualifier.

`P20` additionally requires the complete score, hard-disqualifier clearance,
duplicate clearance, relationship and client-conflict clearance, canonical
suppression clearance, decision-ownership evidence, capacity, the smallest
sufficient offer, and independent QA.

Research alone cannot prove buyer intent, budget, authority, lost revenue,
reply, meeting, proposal, customer, or revenue. It cannot authorize outreach,
connection requests, calendar changes, booking, or provider CRM writes.

## Activation gate

The source lane remains held for recurring automation until all are true:

1. **Complete:** the pure-local allowlist and its 10 adversarial tests prove
   that the adapter itself cannot fetch, log, serialize, or write raw Exa or
   directory payloads. This does not prove an upstream collector is safe.
2. **Pending:** the approved source lane and shared cap are added to canonical automation
   configuration.
3. **Pending:** one explicit ICP query and accepted business categories are recorded.
4. **Pending:** terms, robots, and rate controls are proven for each recurring source.
5. **Pending:** canonical dedupe, relationship-conflict, and account-level suppression reads
   are live.
6. **Pending:** every retained batch has a zero-PII validation and independent QA receipt.

**External actions:** `0`
