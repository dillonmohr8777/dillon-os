---
note_type: source-audit
status: verified_current
created: 2026-08-25
updated: 2026-08-25
owner: IMMOHRTAL Demand Intelligence Lead
workflow: IMMOHRTAL-DAY1
step: LEADS-01
source_refs:
  - "[[12_Brain/05_Projects/2026-08-24 - IMMOHRTAL Marketing Solutions]]"
  - "[[06_Revenue/IMMOHRTAL/EVIDENCE-AND-SOURCE-RULES]]"
  - "[[05_Offers/IMMOHRTAL/QUALIFICATION]]"
  - "google-drive-file:1S1jX-LSuK0pmNg8orJFsqNzhJu5nCzjQsPnoMq4jBXU"
  - "gmail-thread:1a034b2a4a2214bc"
tags:
  - immohrtal
  - revenue
  - lead-intelligence
  - source-audit
---

# IMMOHRTAL Lead Intelligence Source Audit

**As of:** 2026-08-25 16:15 ET
**Truth state:** verified current for connector availability and the named source reads
**Audit collection state:** read only; no connection request, calendar event, sheet update, or booking was created. A later, separately governed step created five unsent Gmail drafts and sent nothing.

## Outcome

The connected Gmail and Google Drive tools were live on the same Google account. The Drive pass enumerated 2,467 accessible document metadata rows, including 264 native Google Sheets and 33 stored spreadsheet-like files. Fifty-nine spreadsheet files matched contact, lead, prospect, email, CRM, client, call-list, business, or related title signals.

Only one source has canonical permission for IMMOHRTAL discovery: a vendor-generated 2023 B2B Sheet created for Dillon. It contains 47 populated company rows and 47 conservative unique company entities. It does not contain a person name, title, email address, consent flag, or opt-out field. It is a discovery seed only, not an outreach list.

The prioritized Gmail pass inspected 15 exact threads after broad owner, brand, service, proposal, and contract searches. Zero independently reusable business-owner contacts survived the client, partner, job-search, vendor, platform-rep, and active-conversation boundaries.

## Connector and source availability

| Surface | Current state | Evidence |
|---|---|---|
| Gmail | Verified live | Profile read succeeded; same authenticated account as Drive |
| Google Drive | Verified live | Profile, search, folder listing, metadata, Sheet metadata, and bounded range reads succeeded |
| Google Sheets | Verified live | Exact Sheet metadata and `Sheet1!A1:I1048` read succeeded |
| Direct LinkedIn connector | Unavailable | Current callable tool catalog contains no LinkedIn-specific action |
| Exa company and people search | Verified live | A public IMMOHRTAL capability probe succeeded and returned four LinkedIn URLs; identity match quality was not asserted |
| LinkedIn browser session | Unverified | No live session read was performed and Access Broker has no LinkedIn entry |
| Mohr media Drive folder | Verified empty | `google-drive-folder:1ZIpQTvH-TjZgCKk5cVNlsjwgXyvKN10Z` returned zero direct children |
| IMMOHRTAL-titled Drive item | Not found | Exact-title search returned zero matching item titles |

## Drive and spreadsheet inventory

The 59 candidate spreadsheet files classify as follows:

| Classification | Count | Use for IMMOHRTAL |
|---|---:|---|
| Authorized discovery-only source | 1 | Yes, after current public requalification |
| Client, employer, or consumer-list source | 40 | No |
| Franchise or webinar list | 6 | No |
| Job-search source | 2 | No |
| Separate-venture source | 2 | No |
| Not actually a prospect source | 1 | No |
| Ownership or consent unresolved | 7 | No, until canonical authority is proved |

The machine-readable companion file enumerates every exact Drive locator and classification without copying titles or contact data.

### Authorized 2023 B2B source

- Locator: `google-drive-file:1S1jX-LSuK0pmNg8orJFsqNzhJu5nCzjQsPnoMq4jBXU`
- Created: 2023-10-12T19:41:04.945Z
- Last modified: 2023-10-12T19:55:46.513Z
- Tab: `Sheet1`, sheetId `0`
- Grid allocation: 1,048 rows by 26 columns
- Actual populated data: 47 rows across columns A through I
- Permission risk: Drive reports an anyone-with-link writer permission with discovery disabled. This weakens integrity even though the file has not changed since 2023.

| Field | Present | Missing |
|---|---:|---:|
| Company name | 47 | 0 |
| LinkedIn profile | 46 | 1 |
| Website | 46 | 1 |
| Address | 46 | 1 |
| Country | 46 | 1 |
| Phone | 45 | 2 |
| Description | 42 | 5 |
| Estimated revenue | 37 | 10 |
| Employee count | 46 | 1 |

All 46 LinkedIn values are company-page URLs. None is a personal profile. The schema has zero confirmed owner records, zero work-email fields, zero person-name fields, zero role/title fields, zero consent fields, and zero opt-out fields. Forty-five rows identify the United States, one identifies Canada, and one lacks country data.

### Dedupe math

The audit normalized company names, canonicalized LinkedIn URLs, reduced website URLs to hostnames, and reduced phone values to digits. Stable-key components were joined only on a matching LinkedIn URL, website host, or normalized phone. Company-name matches were measured separately and were not allowed to over-merge records.

- Exact duplicate rows: 0
- Normalized company duplicate groups: 0
- LinkedIn duplicate groups: 0
- Website-host duplicate groups: 0
- Phone duplicate groups: 0
- Conservative unique companies in the Sheet: 47
- Current local outreach batch: 5 rows and 5 unique recipients
- Overlap between the Sheet and the local batch by normalized company or website domain: 0
- Conservative unique company total across those two sources: 52

The local first-batch CSV and outreach ledger each contain five rows and describe the same five recipients. A later governed draft-creation step produced five exact HTML Gmail drafts, and immutable message readback confirmed `DRAFT` present and `SENT` absent for all five. Three older `[HOLD]` drafts remain separate and are excluded from the 52-company count until source, duplication, and suppression evidence is reconciled.

No private normalized contact file was created. The only newly read list is company-level, stale, and link-writable, and copying its raw address and phone fields would increase exposure without producing an owner-qualified target.

## Gmail audit

Broad searches produced overlapping hit sets, so the counts below are evidence of coverage, not additive mailbox totals.

| Search class | Messages | Unique threads |
|---|---:|---:|
| Recent owner, founder, CEO, or president terms | 38 | 32 |
| Recent Mohr Media or IMMOHRTAL terms | 58 | 57 |
| Recent sent marketing-services terms | 31 | 27 |
| Recent proposal, quote, contract, or kickoff terms | 55 | 44 |

The 15 priority threads were read in full and classified by exact opaque locator:

| Classification | Exact Gmail thread locators | Result |
|---|---|---|
| Client or partner owned | `19fc984427a5981b`, `1a034b2a4a2214bc`, `19dd41a1f6fb731d`, `19db263c19c1d6f9`, `1a01139d526c1a19`, `19ff2d7e7e49525b`, `1a039812fb857bd4`, `19e890b2df4eb09f` | Excluded from IMMOHRTAL |
| Job search | `1a039be3ff268a4f`, `1a03518b55549b4a`, `1a02317af6ad25b0`, `1a038beae1859d54`, `1a02333962480ad4` | Excluded from IMMOHRTAL |
| Vendor support | `19e65dc853c6c9bb` | Excluded |
| Platform account representative | `1a035bfc1fa0257f` | Excluded |

No raw body, recipient, sender, phone, meeting URL, or private identifier is persisted here. The result is zero independently reusable owner contacts among the inspected priority threads.

## LinkedIn-capable path

The current safe research path is:

1. Start from an authorized company source and current public company domain.
2. Use Exa `category:company` for company-level discovery.
3. Use Exa `category:people` only after the company identity is resolved.
4. Treat a LinkedIn result as a locator, not proof of role, employment, authority, consent, or current status.
5. Reproduce role and company evidence from a current public page before scoring.
6. Do not infer a private email, connect, message, post, or broaden permissions.

A direct LinkedIn plugin action is not currently callable. An installed browser skill would not prove an authenticated LinkedIn account, and no browser session was opened for this audit.

## Qualification scoring schema

Use the existing IMMOHRTAL 0 to 16 scorecard in `05_Offers/IMMOHRTAL/QUALIFICATION.md`. Score each dimension from 0 to 2 only after all evidence exists:

1. Problem evidence
2. Service fit
3. Decision ownership
4. Scope readiness
5. Inputs and access
6. Budget fit
7. Timing and capacity
8. Evidence culture

Interpretation:

- 13 to 16: qualified, subject to every hard gate
- 9 to 12: conditional; resolve the named defect or route to a bounded paid diagnostic
- 0 to 8: disqualify or nurture

Hard disqualifiers override the numeric total. Suppression, duplicate, client conflict, unresolved source rights, invalid identity, missing decision owner, unsafe access, or opt-out state blocks advancement. The 2023 B2B rows must remain `RESEARCH_ONLY` with a null score until current identity, public evidence, conflict, suppression, decision-owner, budget, timing, and capacity checks are complete.

## Target-list shape

A permissioned target record should contain:

- stable `record_id`, `account_id`, and `opportunity_id`
- public company display name, canonical website, category, and resolved identity state
- exact source locator, source kind, observed date, refresh due date, current observation, evidence URL, and explicit unknowns
- company LinkedIn locator and, only when separately verified, a decision-owner locator
- source ownership, purpose, consent basis, suppression state, retention date, and contact-channel permission
- normalized duplicate keys for domain, LinkedIn, work email, and phone in the permissioned contact table only
- client-conflict, partner-conflict, prior-touch, duplicate, and suppression checks
- service lane, smallest sufficient offer, 0 to 16 qualification dimensions, score, and hard-disqualifier result
- pipeline stage, commercial status, next internal action, owner, due date, and exit receipt
- approval fingerprint, outreach state, meeting state, and exact delivery receipt when they later exist
- governance flags that keep contact and external writes disabled until separately approved

The public CRM should continue storing company-level facts only. Named people, email addresses, phones, message subjects, and bodies belong only in a separately permissioned and retention-controlled contact table.

## Blockers and next safe actions

1. Repair the 2023 Sheet sharing state so an anonymous link cannot write. This audit did not change the file.
2. Requalify all 47 companies against current public websites and current company pages before any owner research.
3. Resolve ownership and consent for the seven ambiguous legacy Sheets or keep them permanently excluded.
4. Keep the five verified current drafts separate from the three older hold drafts and rerun suppression and duplicate checks before requesting any send approval.
5. Keep the LinkedIn lane on Exa company and people discovery until an exact LinkedIn account and read-only connector or browser session is live-verified.
6. Keep sending and booking disabled. Draft preparation does not authorize delivery, and no search result, score, reply, or calendar availability authorizes contact or a meeting.

The next safe production step is a company-level requalification pass on the 47 authorized discovery rows, producing only public evidence packets and conflict checks. Contact discovery begins later, after an account passes identity, freshness, source-rights, duplicate, suppression, and client-conflict gates.

## Verification receipt

- Companion JSON parsed successfully with 53 native-Sheet candidates, 6 stored-spreadsheet candidates, and 15 inspected Gmail threads.
- Targeted email and phone-pattern scans returned no matches in this directory.
- `node --test _os/test/public-safety.test.js` passed 9 of 9 tests.
- `System/scripts/Test-SecondBrain.ps1` completed but the vault-wide result remained `fail` on the existing graph-fragmentation threshold: 117 components and 85.3 percent largest-component coverage. This scoped launch did not rewrite the atlas or unrelated graph notes.
