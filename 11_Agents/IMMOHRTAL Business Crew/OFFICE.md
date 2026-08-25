---
note_type: operating_system
status: configured_internal
created: 2026-08-25
owner: Dillon Mohr
orchestrator: Codex Marketing Chief
source_refs:
  - "[[11_Agents/IMMOHRTAL Business Crew/README]]"
  - "11_Agents/IMMOHRTAL Business Crew/CREW.json"
  - "[[11_Agents/IMMOHRTAL Business Crew/DAY-1-COMMAND-BOARD]]"
  - "automation/immohrtal-agency/ops/DAY-1-SCORECARD.json"
  - "automation/immohrtal-agency/ops/office-daily.manifest.json"
---

# The IMMOHRTAL office

This is the reviewable internal office for IMMOHRTAL Marketing Solutions. It
connects five accountable Codex job seats to one command board, one evidence
contract, one independent checker, and one daily reporting loop.

The seats are called employees in the office view for ease of use. They are not
legal employees, contractors, officers, licensed professionals, or agents who
can bind the company. Dillon Mohr is the human owner. Codex Marketing Chief is
the sole user-facing orchestrator and final verifier.

## Current system truth

| Surface | Current state | What proves it |
|---|---|---|
| Office artifacts | `BUILT` | Roster, role briefs, command board, reporting contracts, runner, tests, and dashboard renderer exist locally |
| Office configuration | `CONFIGURED` | `CREW.json`, the command board, and the scorecard parse and pass the local invariants |
| Internal work | `CONFIGURED_WITH_RECORDED_BLOCKERS` | The command board contains exact assignment states and blockers |
| One report invocation | Proven only by a dated `run-receipt.json` | The receipt hashes the JSON, Markdown, and HTML dashboard it emitted |
| Employee runtime | `NOT_OBSERVED` unless a current process receipt exists | A board assignment is not a heartbeat and cannot be labeled online |
| Background loop | `NOT_VERIFIED_RUNNING` | No persistent process or scheduler receipt is supplied by the office runner |
| Scheduled tasks | `MANIFEST_ONLY_NOT_INSTALLED` | The local manifest is a proposal; this lane does not register or change tasks |

`Complete` on a report receipt means one local dry-run invocation completed and
wrote its artifacts. It does not mean the office is continuously running.

## Office map

```text
Dillon Mohr, Owner and final human authority
└── Codex Marketing Chief, command and final verification
    ├── Operations and Finance Controller
    ├── Demand Intelligence Lead
    ├── Revenue Pipeline Manager
    ├── Delivery and Client Success Lead
    └── Independent Quality and Risk Auditor
```

Scout, Atlas, Forge, Relay, and Proof remain the separate client-facing
specialist crew. They may return bounded service receipts when assigned. They
do not run the company board and are not the five internal office seats.

## Responsibility and authority matrix

| Employee seat | Accountable for | May do internally | Must not do | Release relationship |
|---|---|---|---|---|
| Operations and Finance Controller | Board integrity, capacity, finance facts and unknowns, approvals, administration, closeout packet | Reconcile local files, capacity, commitments, approval state, and verified financial artifacts | Open accounts, purchase, hire, sign, accept terms, or present unknown finances as zero | Maker; Quality and Risk audits release artifacts |
| Demand Intelligence Lead | One market wedge, current public evidence, qualification research, suppression and duplicate checks | Read approved local and public evidence; create source-located research packets | Contact a company, infer a relationship, bypass suppression, or turn preparation into an opportunity | Maker; Revenue consumes only QA-eligible evidence |
| Revenue Pipeline Manager | Pipeline truth, qualification, offer fit, stage, next action, exit rule, local proposal preparation | Update assigned local opportunity artifacts from verified demand evidence | Create provider-side drafts, send outreach, write a CRM, promise results, or advance an unverified account | Maker; Delivery checks capacity and Quality audits the packet |
| Delivery and Client Success Lead | Scope, capacity, inputs, exclusions, acceptance, milestones, active obligations, fulfillment readiness | Create local delivery plans and acceptance criteria for verified scopes | Treat speculative work as sold, publish, deploy, change client systems, or claim client acceptance | Maker; Quality audits claims and release evidence |
| Independent Quality and Risk Auditor | Evidence, identity, routing, privacy, suppression, claims, policy, and maker/checker separation | Inspect immutable maker artifacts and issue `PASS` or `FAIL` receipts | Repair the artifact it signs, waive authority, invent evidence, or approve an external action | Checker only; defects return to the original maker |
| Codex Marketing Chief | Single daily objective, assignments, priority, reconciliation, approvals, final completion claim | Assign exact ownership, accept verified internal work, stop risky work, and prepare an exact approval preview | Claim employee runtime without a receipt or broaden authority from urgency | Final internal verifier; Dillon retains consequential authority |

All seats may read in-scope local files, analyze, create bounded local artifacts,
test them, update their assigned board items, and prepare an approval preview.
None may send or post, create a provider-side message draft, book a calendar
event, publish, deploy, spend, purchase, hire, contract, accept terms, sign,
mutate a CRM or account, change authentication or DNS, or start a scheduled or
external runtime without separate exact authority.

## Work and runtime status model

Two different state systems are always shown.

### Board work state

Normal flow:

`INBOX -> TRIAGED -> ASSIGNED -> IN_PROGRESS -> READY_FOR_REVIEW -> VERIFIED -> DONE`

Exception states are `BLOCKED`, `WAITING_APPROVAL`, `FAILED_QA`, `DEFERRED`, and
`CANCELLED`. A derived employee work state such as `HAS_BLOCKED_WORK` or
`READY_FOR_REVIEW` summarizes that seat's board items. It does not describe a
live process.

### Runtime state

| Runtime label | Required evidence |
|---|---|
| `NOT_OBSERVED` | Default when no current process receipt or heartbeat was supplied |
| `STARTED_LOCAL_INVOCATION` | Process start time, command identity, run ID, and local PID or equivalent execution evidence |
| `COMPLETED_LOCAL_INVOCATION` | Dated receipt, exit status, source hashes, and output hashes |
| `BLOCKED_RUNTIME` | Exact error, failed prerequisite, and safe next action |
| `BACKGROUND_RUNNING_VERIFIED` | Current scheduler or service receipt plus a fresh successful child run; configuration alone is insufficient |

The dashboard deliberately displays `NOT_OBSERVED` for all five seats until
current runtime evidence exists. It contains no simulated motion, fake online
dots, fabricated activity feed, or decorative productivity metrics.

## Daily standup contract

At 08:30 ET, Codex Marketing Chief records and verifies:

1. One revenue objective for the day.
2. The exact offer and target segment, or `unknown`.
3. Current sources and observation times.
4. Work in progress, exact owners, and due times.
5. The oldest blocker and every approval waiting on Dillon.
6. Capacity available for the day.
7. Separate commercial truth for prepared records, sent messages, replies,
   meetings, proposals, wins, and verified new revenue.
8. Each employee's board work state and separate runtime evidence state.

Every employee returns `READY`, `BLOCKED`, or `IDLE_WITH_REASON` at assignment
time. A live `WORKING` claim is allowed only when the current execution surface
provides a process receipt.

## End-of-day report contract

At 17:00 ET, the Operations and Finance Controller prepares, and Codex verifies:

1. Count of items in every board state.
2. Exact completed or verified artifacts and their locators.
3. Quality passes, failures, defect owners, and retest conditions.
4. Commercial outcomes, including explicit zeros when verified.
5. Financial facts and unknowns kept separate.
6. Exact blockers, approvals, and the oldest aging item.
7. Tomorrow's first revenue action and owner.
8. One evidence-backed process correction, or an explicit statement that none
   was generated.
9. Source hashes, artifact hashes, privacy state, and zero external-action
   receipt for the reporting loop.

## Exception and escalation rules

| Trigger | Required state | Owner | Resume condition |
|---|---|---|---|
| Missing or stale source | `BLOCKED` | Current maker | Current source locator and observation time pass QA |
| Client, company, domain, or route ambiguity | `BLOCKED` | Codex Marketing Chief | Exact identity and canonical route are resolved |
| Suppression, opt-out, prior-touch, or privacy conflict | `BLOCKED` | Demand Intelligence Lead | Conflict is reconciled without bypass and audited |
| Unsupported claim or mismatched artifact | `FAILED_QA` | Original maker | Named correction is made and independently retested |
| Send, provider draft, calendar, CRM, publish, deploy, spend, purchase, hire, contract, terms, or account action | `WAITING_APPROVAL` | Codex Marketing Chief | Dillon approves the exact preview and separate executor proves the action |
| Secret, raw communication, or unnecessary contact data enters an office artifact | `BLOCKED` | Codex Marketing Chief | Artifact is redacted, source scope is corrected, and Quality passes it |
| Legal, finance, tax, insurance, or contract fact is missing | `BLOCKED` or `unknown` | Operations and Finance Controller | Qualified source or human authority supplies the fact |
| Runtime receipt is missing or stale | `NOT_OBSERVED` | Operations and Finance Controller | A current process or scheduler receipt is supplied |
| Same defect returns twice in one day | `DEFERRED` after the second repair loop | Codex Marketing Chief | Root cause and next-day owner are recorded |
| Same cause fails three times | Circuit breaker; `BLOCKED_RUNTIME` | Codex Marketing Chief | Human review clears the root cause and restart plan |

Urgency never expands authority. The auditor cannot silently repair what it
signs. Unknown stays unknown. A local build or draft is never a send, sale,
customer acceptance, or verified live outcome.

## Run the local office report

From the repository root:

```powershell
& .\automation\immohrtal-agency\ops\Run-ImmohrtalOfficeDaily.ps1 -DryRun -Mode both
```

The dated output directory contains:

- `run-receipt.json` for execution, source hashes, artifact hashes, privacy,
  schedule truth, and zero external actions;
- `office-report.json` for machine-readable status;
- `office-report.md` for the daily standup and closeout;
- `office-dashboard.html` for the private noindex visual office.

The runner consumes `CREW.json`, the current command board, the scorecard, and
the latest usable agency `run-receipt.json` when present. The agency receipt is
reported as prospect-preparation evidence only. It never proves that the five
internal employees are online.
