---
workflow_id: IMMOHRTAL-DAY1-20260825
step_id: INTERNAL-WORKFORCE
date: 2026-08-25
status: active_internal
owner: Dillon Mohr
orchestrator: Codex Marketing Chief
gmail_in_scope: false
external_actions_authorized: false
source_refs:
  - "[[11_Agents/IMMOHRTAL Business Crew/README]]"
  - "[[12_Brain/05_Projects/2026-08-24 - IMMOHRTAL Marketing Solutions]]"
  - "automation/immohrtal-agency/ops/DAY-1-SCORECARD.json"
  - "[[immohrtal-marketing-site/research/outreach/DAY-1-FIRST-BATCH]]"
  - "[[05_Offers/IMMOHRTAL/DAY-1-PRICE-BOOK]]"
---

# Day 1 command board

## Clock-in truth

- The canonical website is live at `https://www.immohrtalmarketing.com`; the
  recorded production launch covers 23 routes and passed the documented live QA
  set.
- The old 25-record preparation run used a Sheet now classified
  `franchise_webinar_excluded`. Its 08:10 Windows task is disabled, its runner
  fails closed, and those records contribute zero active pipeline accounts.
- Batch 01 reviewed eight rows from the authorized 47-company discovery source.
  Seven identities are current, one is blocked, and all eight remain
  `RESEARCH_ONLY / P00` with null scores and zero external actions.
- The current priority outreach CSV contains five rows, all labeled
  `DRAFT_ONLY_DO_NOT_SEND`.
- The seven-item monthly service menu is approved and live on the canonical
  pricing page. It is not evidence of historical customers or revenue.
- Five Gmail drafts were directly read back as `DRAFT`, with zero exact-subject
  sent copies and zero matching calendar events. Messages sent, replies,
  meetings, proposals, closed-won deals, active clients, verified new revenue,
  and new hires or purchases remain **0**.
- Scout, Atlas, Forge, Relay, and Proof remain the public-facing prospect and
  website characters. None owns this board.

## Day 1 objective

Stand up a real, repeatable company operating system inside Codex and convert
the website launch, 25-candidate preparation queue, five-row priority batch,
and offer system into one truthful revenue-ready internal pipeline without any
external action.

## Work board

Every item below implements all 13 required fields in `CREW.json`.

### OPS-001

- `item_id`: `OPS-001`
- `objective`: Validate the canonical five-seat roster, authority matrix, board contract, and zero-baseline rules.
- `owner_role_id`: `operations_finance_controller`
- `due_at`: `2026-08-25T10:00:00-04:00`
- `status`: `VERIFIED`
- `inputs`: `11_Agents/IMMOHRTAL Business Crew/CREW.json`; all five role briefs.
- `exact_output`: Parsed roster and authority receipt with five unique subordinate role IDs.
- `evidence_required`: JSON parse; exact role-title comparison; public-character separation; external-authority check.
- `artifact_locator`: `11_Agents/IMMOHRTAL Business Crew/CREW.json`
- `checker_role_id`: `quality_risk_auditor`
- `blocker`: None for the internal roster contract.
- `next_action`: `operations_finance_controller` uses the verified contract at the next clock-in.
- `updated_at`: `2026-08-25T19:05:00-04:00`

### OPS-002

- `item_id`: `OPS-002`
- `objective`: Establish the Day 1 control snapshot for capacity, cash facts, commitments, and unresolved company foundation.
- `owner_role_id`: `operations_finance_controller`
- `due_at`: `2026-08-25T12:00:00-04:00`
- `status`: `READY_FOR_REVIEW`
- `inputs`: `05_Offers/IMMOHRTAL/DAY-1-PRICE-BOOK.md`; `BUSINESS-FOUNDATION-CHECKLIST.md`; `DAY-1-FINANCE-LEDGER.csv`.
- `exact_output`: Zero-baseline ledger, 33-control foundation checklist, and capacity assumptions by offer.
- `evidence_required`: CSV parse; zero-value check; explicit source and truth state for every financial fact.
- `artifact_locator`: `05_Offers/IMMOHRTAL/DAY-1-FINANCE-LEDGER.csv`
- `checker_role_id`: `quality_risk_auditor`
- `blocker`: Legal seller, registrations, banking, payments, bookkeeping, contract, privacy, and insurance controls remain unresolved.
- `next_action`: `operations_finance_controller` assigns an owner and evidence requirement to every unresolved control without opening accounts or spending.
- `updated_at`: `2026-08-25T17:10:00-04:00`

### DEM-001

- `item_id`: `DEM-001`
- `objective`: Isolate the excluded 25-record legacy run and reconcile the authorized company source without converting research into pipeline performance.
- `owner_role_id`: `demand_intelligence_lead`
- `due_at`: `2026-08-25T11:30:00-04:00`
- `status`: `VERIFIED`
- `inputs`: `automation/immohrtal-agency/config/requalification-source.json`; `automation/immohrtal-agency/ops/LEGACY-SOURCE-ISOLATION-2026-08-25.md`; `06_Revenue/IMMOHRTAL/lead-intelligence/requalification/2026-08-25-batch-01.json`.
- `exact_output`: Source-isolation receipt plus separate counts for 25 excluded legacy records, eight authorized research records, and five held Gmail drafts.
- `evidence_required`: JSON parse; task-state readback; source-ID match; company-count checks; no contact data; zero external actions; no commercial-outcome inference.
- `artifact_locator`: `automation/immohrtal-agency/ops/LEGACY-SOURCE-ISOLATION-2026-08-25.md`
- `checker_role_id`: `quality_risk_auditor`
- `blocker`: None for source isolation. Advancement remains blocked by weak source integrity, relationship reconciliation, suppression, decision ownership, and incomplete qualification evidence.
- `next_action`: `demand_intelligence_lead` continues with the next unreviewed authorized rows and keeps every record at P00 until all hard gates pass.
- `updated_at`: `2026-08-25T17:20:00-04:00`

### DEM-002

- `item_id`: `DEM-002`
- `objective`: Requalify up to eight authorized companies and select one market wedge only from current, independently reviewable problem evidence.
- `owner_role_id`: `demand_intelligence_lead`
- `due_at`: `2026-08-26 EOD ET`
- `status`: `IN_PROGRESS`
- `inputs`: `automation/immohrtal-agency/config/requalification-source.json`; current public company sites; callable Exa company and people research; `immohrtal-marketing-site/research/outreach/segment-offer-matrix.md`.
- `exact_output`: Up to eight public-safe company evidence packets, exact holds or disqualifications, and one wedge brief only when the evidence supports it.
- `evidence_required`: Current URL, observed fact, captured date, unknowns, disqualifiers, and relevant service route for each record.
- `artifact_locator`: `06_Revenue/IMMOHRTAL/lead-intelligence/requalification/2026-08-25-batch-01.json`
- `checker_role_id`: `quality_risk_auditor`
- `blocker`: Batch 01 produced seven current identities and one identity block, but zero records have full relationship, suppression, decision-owner, or qualification clearance. A wedge is not yet proven.
- `next_action`: `demand_intelligence_lead` reproduces the strongest public conditions and completes the remaining governance checks. No contact discovery or outreach is included.
- `updated_at`: `2026-08-25T17:20:00-04:00`

### REV-001

- `item_id`: `REV-001`
- `objective`: Reconcile the qualification standard, offer ladder, capacity, and internal launch economics.
- `owner_role_id`: `revenue_pipeline_manager`
- `due_at`: `2026-08-25T13:30:00-04:00`
- `status`: `READY_FOR_REVIEW`
- `inputs`: `05_Offers/IMMOHRTAL/QUALIFICATION.md`; `DAY-1-PRICE-BOOK.md`; `OFFER-CARDS.json`; `UNIT-ECONOMICS.md`.
- `exact_output`: Five internally consistent offer definitions with a smallest valid front-door offer and capacity rule.
- `evidence_required`: JSON parse; price and scope consistency; assumption labels; no public-pricing or historical-sales claim.
- `artifact_locator`: `05_Offers/IMMOHRTAL/OFFER-CARDS.json`
- `checker_role_id`: `quality_risk_auditor`
- `blocker`: Market-wedge selection remains pending, so no offer is yet recommended to a specific account.
- `next_action`: `revenue_pipeline_manager` maps the verified DEM-002 wedge to the smallest valid offer after that packet passes QA.
- `updated_at`: `2026-08-25T17:10:00-04:00`

### REV-002

- `item_id`: `REV-002`
- `objective`: Create internal opportunity records only from independently verified DEM-002 demand evidence.
- `owner_role_id`: `revenue_pipeline_manager`
- `due_at`: `2026-08-26 EOD ET`
- `status`: `BLOCKED`
- `inputs`: QA-passed DEM-002 records and the current IMMOHRTAL offer files.
- `exact_output`: One internal record per accepted company with stage, problem, offer, next action, exit rule, and source.
- `evidence_required`: Company identity, evidence freshness, qualification decision, offer fit, and zero external-action receipt.
- `artifact_locator`: `pending — no opportunity record exists`
- `checker_role_id`: `quality_risk_auditor`
- `blocker`: DEM-002 has not produced a QA-passed wedge packet.
- `next_action`: `revenue_pipeline_manager` waits for DEM-002 verification and does not create messages, provider drafts, or CRM records.
- `updated_at`: `2026-08-25T17:10:00-04:00`

### REV-003

- `item_id`: `REV-003`
- `objective`: Establish a local, machine-readable CRM and pipeline control plane for evidence, qualification, stage, offer fit, next action, and audit state.
- `owner_role_id`: `revenue_pipeline_manager`
- `due_at`: `2026-08-25T18:15:00-04:00`
- `status`: `VERIFIED`
- `inputs`: `DAY-1-FIRST-BATCH.csv`; canonical offer files; `CREW.json`; qualification policy.
- `exact_output`: CRM schema, field dictionary, lifecycle rules, source rules, and five evidence-ready account records in JSON and CSV.
- `evidence_required`: JSON and CSV parse; 5/5 record parity; controlled stage values; zero amounts and probabilities; no contact identifiers, email drafts, message copy, external writes, or execution authority.
- `artifact_locator`: `06_Revenue/IMMOHRTAL/`
- `checker_role_id`: `quality_risk_auditor`
- `blocker`: Suppression, duplicate, client-conflict, decision-owner, budget, and timing checks remain pending; records cannot advance beyond qualification pending.
- `next_action`: `revenue_pipeline_manager` reconciles the five records daily while `demand_intelligence_lead` completes current evidence and governance checks.
- `updated_at`: `2026-08-25T19:05:00-04:00`

### DEL-001

- `item_id`: `DEL-001`
- `objective`: Record the verified website launch as a bounded proof asset without inventing business outcomes.
- `owner_role_id`: `delivery_client_success_lead`
- `due_at`: `2026-08-25T12:30:00-04:00`
- `status`: `READY_FOR_REVIEW`
- `inputs`: `12_Brain/05_Projects/2026-08-24 - IMMOHRTAL Marketing Solutions.md`; canonical live URL; production receipt cited there.
- `exact_output`: Proof statement limited to the recorded launch scope, routes, editorial assets, and QA checks.
- `evidence_required`: Live URL and production receipt; explicit exclusion of traffic, ranking, lead, customer, and revenue claims.
- `artifact_locator`: `12_Brain/05_Projects/2026-08-24 - IMMOHRTAL Marketing Solutions.md`
- `checker_role_id`: `quality_risk_auditor`
- `blocker`: None for internal use; any public claim requires a current live recheck.
- `next_action`: `delivery_client_success_lead` reuses only the bounded proof statement in future internal opportunity packets.
- `updated_at`: `2026-08-25T17:10:00-04:00`

### DEL-002

- `item_id`: `DEL-002`
- `objective`: Establish fulfillment readiness and active-work ceilings for the five launch offers.
- `owner_role_id`: `delivery_client_success_lead`
- `due_at`: `2026-08-25T14:30:00-04:00`
- `status`: `READY_FOR_REVIEW`
- `inputs`: `05_Offers/IMMOHRTAL/DAY-1-PRICE-BOOK.md`; `OFFER-CARDS.json`; `04_SOPs/IMMOHRTAL Client Delivery SOP.md`.
- `exact_output`: Owner, hours, active-work ceiling, inputs, acceptance gate, QA gate, and scheduling assumptions by offer.
- `evidence_required`: Cross-file consistency and explicit assumption labels; no sale treated as active delivery before acceptance.
- `artifact_locator`: `05_Offers/IMMOHRTAL/DAY-1-PRICE-BOOK.md`
- `checker_role_id`: `quality_risk_auditor`
- `blocker`: Real booked capacity is zero and no customer has passed the delivery gate.
- `next_action`: `delivery_client_success_lead` maintains the zero-active-engagement view until a verified signed, funded, intake-ready project exists.
- `updated_at`: `2026-08-25T17:10:00-04:00`

### DEL-003

- `item_id`: `DEL-003`
- `objective`: Establish a truthful daily view of active IMMOHRTAL client obligations and delivery risks.
- `owner_role_id`: `delivery_client_success_lead`
- `due_at`: `2026-08-25T16:00:00-04:00`
- `status`: `BLOCKED`
- `inputs`: Canonical client registry and current project records only.
- `exact_output`: Active engagement count, state, milestone, input, risk, capacity, QA gate, and payment state.
- `evidence_required`: Current signed scope or canonical client record; no portfolio-mark or historical-relationship inference.
- `artifact_locator`: `pending — no verified active IMMOHRTAL engagement identified`
- `checker_role_id`: `quality_risk_auditor`
- `blocker`: No verified active IMMOHRTAL customer obligation is recorded in the sources reviewed today.
- `next_action`: `delivery_client_success_lead` leaves active engagements at zero until a canonical current record exists.
- `updated_at`: `2026-08-25T17:10:00-04:00`

### QA-001

- `item_id`: `QA-001`
- `objective`: Audit DEM-002 and REV-002 outputs for evidence, identity, isolation, claims, and state truth.
- `owner_role_id`: `quality_risk_auditor`
- `due_at`: `2026-08-26 EOD ET`
- `status`: `BLOCKED`
- `inputs`: Immutable DEM-002 and REV-002 maker artifacts with their source locators.
- `exact_output`: PASS or FAIL receipt for every submitted demand and opportunity record.
- `evidence_required`: Source freshness, identity, disqualifiers, claims, offer fit, one-company isolation, and zero external action.
- `artifact_locator`: `pending — maker artifacts do not yet exist`
- `checker_role_id`: `none`
- `blocker`: DEM-002 and REV-002 are not ready for review; auditor independence means no self-checker is assigned.
- `next_action`: `quality_risk_auditor` waits for immutable maker artifacts and does not rewrite them.
- `updated_at`: `2026-08-25T17:10:00-04:00`

### QA-002

- `item_id`: `QA-002`
- `objective`: Audit the crew, Day 1 board, SOP, role separation, email exclusion, and external-action boundaries.
- `owner_role_id`: `quality_risk_auditor`
- `due_at`: `2026-08-25T17:30:00-04:00`
- `status`: `DONE`
- `inputs`: All internal crew files; `04_SOPs/IMMOHRTAL Client Delivery SOP.md`; Day 1 OS and scorecard.
- `exact_output`: Independent SHIP or BLOCK receipt with exact file-and-line evidence.
- `evidence_required`: Five-seat match; JSON/CSV parses; all 13 board fields; canonical role IDs; public-character separation; no email dependency; tests; no invented performance.
- `artifact_locator`: `Codex independent-review receipt dated 2026-08-25; verdict SHIP`
- `checker_role_id`: `none`
- `blocker`: None; the recheck passed the crew, board, SOP, CRM, tests, and diff checks.
- `next_action`: `quality_risk_auditor` audits the next immutable revenue packet before any stage advancement.
- `updated_at`: `2026-08-25T19:05:00-04:00`

### CHIEF-001

- `item_id`: `CHIEF-001`
- `objective`: Issue a truthful Day 1 company closeout and establish the next operating day's first actions.
- `owner_role_id`: `codex_marketing_chief`
- `due_at`: `2026-08-25T18:00:00-04:00`
- `status`: `DONE`
- `inputs`: Complete board, independent audit receipt, scorecard, offer files, foundation checklist, ledger, SOP, and test receipts.
- `exact_output`: Dated internal closeout with verified outputs, zero commercial facts, blockers, and next actions.
- `evidence_required`: Independent SHIP verdict; passing parses and tests; exact artifact locators; automation scheduler truth state.
- `artifact_locator`: `11_Agents/IMMOHRTAL Business Crew/daily/2026-08-25.md`
- `checker_role_id`: `quality_risk_auditor`
- `blocker`: The 08:30 Codex heartbeat is active. The duplicate office schedule manifest remains uninstalled, and the legacy 08:10 Windows task remains disabled by source isolation.
- `next_action`: `codex_marketing_chief` verifies the next heartbeat receipt, keeps the 08:10 path disabled, and closes the next authorized eight-company research batch.
- `updated_at`: `2026-08-25T17:20:00-04:00`

## Required Day 1 closeout counts

Report each separately, even when zero:

| Commercial fact | Baseline |
|---|---:|
| Active prepared records from the legacy automation run | 0 |
| Legacy prepared records excluded from canonical intake | 25 |
| Authorized company rows researched today | 8 |
| Current identities confirmed | 7 |
| Qualified accounts from today's batch | 0 |
| Priority outreach rows currently staged | 5 |
| External messages sent | 0 |
| Replies | 0 |
| Meetings booked | 0 |
| Proposals sent | 0 |
| Closed won | 0 |
| Active IMMOHRTAL clients | 0 |
| Verified new revenue from this workflow | $0 |
| New hires, contractors, software, data, domains, or mailboxes purchased | 0 |

The five priority rows remain draft-only. The 25-record run is historical
evidence from an excluded source and is not a preparation queue. The eight
authorized research records remain held at P00 and are not qualified accounts.

## Day 1 source map

| Source | What it can prove |
|---|---|
| `12_Brain/05_Projects/2026-08-24 - IMMOHRTAL Marketing Solutions.md` | Recorded launch scope, canonical domain, and launch receipt |
| `automation/immohrtal-agency/ops/DAY-1-SCORECARD.json` | Recorded automation-run preparation counts and machine states |
| `immohrtal-marketing-site/research/outreach/DAY-1-FIRST-BATCH.csv` | Five current draft-only priority rows and their supplied public-evidence fields |
| `immohrtal-marketing-site/research/outreach/pre-outreach-readiness.md` | Readiness questions and unresolved external-action gates |
| `05_Offers/IMMOHRTAL/QUALIFICATION.md` | Qualification and disqualification rules |
| `05_Offers/IMMOHRTAL/DAY-1-PRICE-BOOK.md` | Internal recommended launch pricing, scope, capacity, and economics assumptions |
| `05_Offers/IMMOHRTAL/OFFER-CARDS.json` | Machine-readable internal offer definitions |

## Decisions explicitly not made today

- No Gmail or other mailbox setup.
- No message creation, sending, posting, or form submission.
- No CRM write.
- No public pricing publication or proposal delivery.
- No purchase, hiring, contracting, spend, or external runtime.
- No claim that the 25 prepared records are 25 qualified opportunities.
