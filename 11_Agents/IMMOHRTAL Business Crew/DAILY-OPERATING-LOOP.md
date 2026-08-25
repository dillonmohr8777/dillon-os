---
note_type: operating_procedure
status: active_internal
created: 2026-08-25
owner: Codex Marketing Chief
source_refs:
  - "[[11_Agents/IMMOHRTAL Business Crew/README]]"
  - "11_Agents/IMMOHRTAL Business Crew/CREW.json"
---

# Daily operating loop

The crew starts from one shared command board and ends with a verified company
closeout. Codex is the orchestrator throughout. Agents do not pass work through
private messages or external systems; they place reviewable artifacts and
evidence on the shared board.

Crew contract: [[11_Agents/IMMOHRTAL Business Crew/README|IMMOHRTAL Business Crew]].

## 1. Clock in — 08:30 ET

Codex opens the dated board and records:

1. The single revenue objective for the day.
2. The exact offer and target segment, or `unknown` if not yet selected.
3. Current verified inputs and their observation times.
4. Work already in progress, oldest blocker, and approvals waiting on Dillon.
5. Capacity available today.
6. The zero-baseline commercial counts: sent, replies, meetings, proposals,
   wins, and verified new revenue.

Codex then assigns board items and explicit file ownership. Each role clocks in
as `READY`, `BLOCKED`, or `IDLE_WITH_REASON`. “Running” is not an acceptable
status.

## 2. Control desk — 08:40 ET

The Operations and Finance Controller reconciles:

- board schema and stale items;
- today's capacity and workload ceiling;
- verified new revenue, invoices, collections, expenses, and commitments for
  IMMOHRTAL only;
- approval-required decisions;
- missing legal, administrative, or account prerequisites.

Unknown financial values remain `unknown`; they are never converted to zero.
The Day 1 workflow-specific outcome counters begin at zero.

## 3. Demand block — 09:00 ET

The Demand Intelligence Lead works one approved market wedge at a time. It:

- reconciles source freshness, duplicates, suppression flags, company identity,
  and public evidence;
- separates the full candidate queue from the smaller priority batch;
- records observable problems and unknowns;
- maps evidence to one real IMMOHRTAL service route and one buyer question;
- returns weak or ambiguous records as blocked instead of filling gaps.

Demand output is research, not permission to contact anyone.

## 4. Revenue block — 11:00 ET

The Revenue Pipeline Manager consumes verified demand records and:

- applies the qualification floor;
- selects the smallest sufficient offer from the current internal price book;
- names the buyer role, problem, evidence, next action, and explicit exit rule;
- prepares local outreach or proposal artifacts only when requested;
- keeps messages sent, replies, meetings, proposals, and wins at their verified
  values.

Gmail is out of scope. A local outreach package remains `draft_only` and cannot
be labeled contacted, sent, delivered, or awaiting reply.

## 5. Delivery and success block — 13:00 ET

The Delivery and Client Success Lead protects fulfillment before more work is
sold. It:

- confirms that the proposed offer fits actual capacity;
- defines scope, inputs, exclusions, acceptance criteria, owner, timeline, and
  QA needs;
- checks active work for next milestone, source dependency, approval, risk, and
  client-facing commitment;
- distinguishes the completed internal website launch from new client revenue;
- prevents speculative opportunities from entering delivery as commitments.

## 6. Independent audit — 15:00 ET

The Independent Quality and Risk Auditor inspects maker outputs without editing
them. Every audited item receives:

- `PASS` or `FAIL`;
- claim and source checks;
- identity, client, domain, recipient, and scope checks where applicable;
- privacy, suppression, permission, and approval checks;
- test or live-verification evidence appropriate to the claim;
- exact defect ownership and required rework.

A failed item returns to `ASSIGNED` through `FAILED_QA`. The auditor never fixes
the artifact it signs.

## 7. Chief review — 16:15 ET

Codex reviews only board items carrying the required evidence and checker
receipt. Codex may:

- mark a verified internal deliverable `DONE`;
- return it to its maker;
- put a consequential action in `WAITING_APPROVAL` with an exact preview;
- defer it with a dated reason;
- stop it for risk or client ambiguity.

Urgency does not expand authority. An internal `DONE` state never means an
email was sent, content was published, money was spent, or a client accepted
work.

## 8. Close out — 17:00 ET

The Operations and Finance Controller prepares, and Codex verifies, a compact
closeout with:

- count of items at each board state;
- exact artifacts completed and their locators;
- QA passes and failures;
- verified commercial outcomes, including explicit zeros;
- financial facts and unknowns;
- blockers, required owner decisions, and oldest aging item;
- tomorrow's first revenue action;
- one process correction when evidence warrants it.

## 9. Emit the local daily receipt

After the board is current, run the internal report loop from the repository
root:

```powershell
& .\automation\immohrtal-agency\ops\Run-ImmohrtalOfficeDaily.ps1 -DryRun -Mode both
```

The runner parses the machine-readable roster, every current board item, the
Day 1 scorecard, and the latest usable agency run receipt. It emits a dated
`run-receipt.json`, `office-report.json`, `office-report.md`, and private
noindex `office-dashboard.html` under
`automation/immohrtal-agency/ops/receipts/`.

The receipt keeps these states separate:

- `BUILT`: the office artifacts exist;
- `CONFIGURED`: the current sources parse and pass the invariants;
- `COMPLETED_LOCAL_DRY_RUN`: one report invocation finished;
- `NOT_OBSERVED`: no current employee process receipt exists;
- `NOT_VERIFIED_RUNNING`: no persistent background runtime is proven;
- `BLOCKED`: an exact source, evidence, QA, identity, or authority gate stops
  advancement.

One report receipt never proves the employees are online. A manifest never
proves a task is installed. A task registration never proves its child run
succeeded.

The detailed office contract is in
[[11_Agents/IMMOHRTAL Business Crew/OFFICE|The IMMOHRTAL office]]. The runner
and schedule boundary are documented in
`automation/immohrtal-agency/ops/DAILY-REPORT-RUNBOOK.md`.

## Shared board item schema

Every item has these fields:

| Field | Meaning |
|---|---|
| `item_id` | Stable identifier, never recycled |
| `objective` | One result, not a broad department mission |
| `owner_role_id` | Exactly one maker accountable for the output |
| `due_at` | ISO date/time with timezone or `DATE EOD ET` |
| `status` | One allowed state from `CREW.json` |
| `inputs` | Exact source paths, URLs, or approved systems |
| `exact_output` | Named file, record, decision, or tested result |
| `evidence_required` | What proves the output and its truth state |
| `artifact_locator` | Where the current output lives |
| `checker_role_id` | Independent checker or `none` with reason |
| `blocker` | Exact missing fact, approval, access, or decision |
| `next_action` | One concrete action and owner |
| `updated_at` | ISO timestamp |

## State rules

Normal flow:

`INBOX -> TRIAGED -> ASSIGNED -> IN_PROGRESS -> READY_FOR_REVIEW -> VERIFIED -> DONE`

Exceptions:

- `BLOCKED`: an exact missing input or authority prevents progress.
- `WAITING_APPROVAL`: the precise decision or external action is presented to
  Dillon; no action has occurred.
- `FAILED_QA`: checker found a named defect; returns to the original maker.
- `DEFERRED`: intentionally postponed with an owner and review date.
- `CANCELLED`: no longer authorized or needed, with reason.

## Evidence contract

No item advances to `VERIFIED` without:

1. The exact claim being made.
2. A source locator and source kind.
3. The time the source was observed.
4. The output artifact locator.
5. The verification method and verifier.
6. One truth state: `confirmed_current`, `confirmed_historical`,
   `provisional`, `unknown`, `blocked`, `draft_only`, `verified_internal`, or
   `verified_live`.

An agent's prose is not a receipt. A draft is not sent. A passed build is not a
verified deployment. A site launch is not a sale. A price book is not approved
customer pricing. An unverified financial value is `unknown`, not zero.
