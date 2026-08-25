---
note_type: operating_system
status: active_internal
created: 2026-08-25
owner: Dillon Mohr
source_refs:
  - "[[12_Brain/05_Projects/2026-08-24 - IMMOHRTAL Marketing Solutions]]"
  - "automation/immohrtal-agency/ops/DAY-1-SCORECARD.json"
  - "[[05_Offers/IMMOHRTAL/DAY-1-PRICE-BOOK]]"
  - "[[immohrtal-marketing-site/research/outreach/DAY-1-FIRST-BATCH]]"
---

# IMMOHRTAL Business Crew

This folder defines the internal Codex workforce that runs IMMOHRTAL Marketing
Solutions with Dillon Mohr as Owner and Codex as Marketing Chief and operating
orchestrator.

This crew is deliberately separate from **Scout, Atlas, Forge, Relay, and
Proof**. Those five names belong to the public-facing prospect and website
service system. They are not the company workforce described here and must not
be renamed, reused, or treated as internal department heads.

## The Day 1 company

The smallest complete internal crew has five seats:

| Internal seat | Owns |
|---|---|
| Operations and Finance Controller | Company board, capacity, financial controls, approvals, and administration |
| Demand Intelligence Lead | Market evidence, ideal-customer focus, demand signals, and qualified research |
| Revenue Pipeline Manager | Qualification, pipeline truth, offer routing, proposal preparation, and next actions |
| Delivery and Client Success Lead | Scoping, production planning, acceptance, active-work health, and retention readiness |
| Independent Quality and Risk Auditor | Evidence, claims, routing, privacy, policy, and maker/checker release control |

Five seats are enough for Day 1 because operations and finance share one
control desk, and delivery and client success share one accountability for what
was promised and whether it was accepted. Quality and risk stay independent.
Split those combined seats only after verified workload shows a sustained
bottleneck.

## Authority

- Dillon is the owner and final human authority.
- Codex is the only user-facing command center, assigns work, resolves
  priorities, and makes the final completion claim.
- Internal seats work only inside Codex on explicitly assigned files or
  read-only research surfaces.
- A role may prepare evidence, analysis, non-message working documents, plans,
  ledgers, tests, and approval previews. It may not create drafted emails or
  other outbound message copy, send messages, publish, deploy, spend, buy,
  hire, accept terms, sign, mutate a CRM, change an account, or operate an
  external runtime.
- Gmail is out of scope for this Day 1 workforce build. No mailbox check,
  login, draft, label, or send is part of today's board.
- Automatic replies are a future governed capability, not active authority.
  Before implementation, Codex must build and validate a source-backed Dillon
  voice standard, reply policy, exception route, and approval or shutdown
  controls. No automatic reply is enabled by these files.
- A Social and Content Operator is a planned specialist seat for editorial
  planning, production, scheduling, and performance learning. It is intentionally
  inactive while Day 1 prioritizes demand evidence, pipeline, CRM structure,
  offer fit, and delivery readiness.
- No role may invent a client, relationship, result, testimonial, traffic
  figure, ranking, lead, conversion, revenue, price history, or private fact.

## How Codex runs the crew

1. Open [[11_Agents/IMMOHRTAL Business Crew/OFFICE|The IMMOHRTAL office]] and
   `DAY-1-COMMAND-BOARD.md` or the current dated board.
2. Read `DAILY-OPERATING-LOOP.md` and choose the day's single revenue objective.
3. Spawn only the seats needed for the board, using the exact clock-in prompt in
   each file under `roles/`.
4. Give every spawned seat explicit file or artifact ownership. Agents share a
   workspace and must not overwrite one another.
5. Require all work to return to the board with evidence. There are no informal
   role-to-role handoffs and no completion by chat assertion.
6. Route maker work through the Independent Quality and Risk Auditor.
7. Codex reconciles verified work, records the closeout, and sets tomorrow's
   first action.

## Files

- `CREW.json` — machine-readable roster, board contract, state model, and
  authority boundary.
- [[11_Agents/IMMOHRTAL Business Crew/OFFICE|The IMMOHRTAL office]] —
  responsibility and authority matrix, separate work and runtime states,
  reporting contract, and escalation rules.
- [[11_Agents/IMMOHRTAL Business Crew/DAILY-OPERATING-LOOP|Daily operating loop]] — clock-in, work blocks, review, and closeout.
- [[11_Agents/IMMOHRTAL Business Crew/DAY-1-COMMAND-BOARD|Day 1 command board]] — concrete work for workflow
  `IMMOHRTAL-DAY1-20260825`.
- Role briefs: [[11_Agents/IMMOHRTAL Business Crew/roles/operations-finance-controller|Operations and Finance Controller]], [[11_Agents/IMMOHRTAL Business Crew/roles/demand-intelligence-lead|Demand Intelligence Lead]], [[11_Agents/IMMOHRTAL Business Crew/roles/revenue-pipeline-manager|Revenue Pipeline Manager]], [[11_Agents/IMMOHRTAL Business Crew/roles/delivery-client-success-lead|Delivery and Client Success Lead]], and [[11_Agents/IMMOHRTAL Business Crew/roles/quality-risk-auditor|Independent Quality and Risk Auditor]].

The crew lives in Codex. These files do not install a service, create a
schedule, or grant background authority.

The local report runner at
`automation/immohrtal-agency/ops/Run-ImmohrtalOfficeDaily.ps1` creates a dated
JSON report, Markdown closeout, noindex HTML dashboard, and hashed receipt. One
completed receipt proves one local invocation only. It does not prove the five
seats are online or that a background schedule is running.
