---
note_type: sop
status: active
created: 2026-08-25
updated: 2026-08-25
owner: Delivery and Client Success Lead (`delivery_client_success_lead`)
approver: Dillon Mohr
review_on: 2026-09-08
source_refs:
  - "[[../05_Offers/IMMOHRTAL/DAY-1-PRICE-BOOK]]"
  - "[[../05_Offers/IMMOHRTAL/QUALIFICATION]]"
  - "[[../12_Brain/05_Projects/2026-08-24 - IMMOHRTAL Marketing Solutions]]"
tags:
  - immohrtal
  - delivery
  - onboarding
  - qa
---

# IMMOHRTAL Client Delivery SOP

This is the internal delivery contract for every new IMMOHRTAL engagement. It
keeps sales, production, approval, launch, and evidence in one chain. A signed
project may narrow this SOP; it may not remove source verification, client
isolation, recovery planning, or independent QA.

## Required states

`QUALIFIED -> SCOPED -> CONTRACTED -> FUNDED -> INTAKE_READY -> IN_PRODUCTION -> CLIENT_REVIEW -> QA_PASSED -> RELEASE_APPROVED -> RELEASED -> VERIFIED_LIVE -> CLOSED`

Use `BLOCKED`, `CHANGE_REQUESTED`, `PAUSED`, or `CANCELED` when the evidence
supports those states. Never use `RELEASED` for a staging link or
`VERIFIED_LIVE` for a deployment receipt that has not been checked publicly.

## 1. Sales to delivery gate

Owner: Revenue Pipeline Manager (`revenue_pipeline_manager`). Checker:
Operations and Finance Controller (`operations_finance_controller`).

Before a project enters delivery, record:

- exact legal/customer name, primary domain, decision maker, billing contact,
  and the people permitted to approve scope and release;
- selected offer, signed scope, exclusions, page/template or workflow matrix,
  revision count, delivery window, support window, and change-control terms;
- acceptance checks that do not depend on a promised rank, lead count,
  revenue result, AI citation, or third-party platform decision;
- payment schedule, first-payment status, and any pass-through expenses;
- every repository, CMS, host, analytics property, CRM portal, and environment
  in scope, with the approved access route but no credentials in the project;
- conflicts, opt-outs, privacy constraints, accessibility expectations, and
  data-retention requirements.

Stop if the customer, domain, approver, payment state, or release destination
is ambiguous.

## 2. Client workspace and source pack

Owner: Delivery and Client Success Lead (`delivery_client_success_lead`).

Create one isolated client workspace. The source pack must contain or point to:

- signed agreement and current statement of work;
- approved logo, fonts, colors, photography, and asset-rights confirmation;
- factual services, locations, people, credentials, proof, policies, and
  approved claims;
- current site map, redirect needs, forms, analytics events, and integration
  owners;
- competitor or inspiration references labeled as references, never assets to
  copy;
- one decision log and one consolidated-feedback channel.

Missing facts stay marked `PENDING_CLIENT_SOURCE`. Production may continue only
where the missing input cannot cause rework, false claims, or the wrong release.

## 3. Kickoff and production plan

Owner: Delivery and Client Success Lead (`delivery_client_success_lead`).
Approver: Dillon.

The kickoff produces a dated production plan with:

- the business decision and primary customer path;
- one accountable owner per deliverable;
- milestones, dependencies, client review dates, and release window;
- the first recovery point before changing an existing system;
- the QA plan and independent checker;
- an explicit list of actions that remain human-approved.

No work begins merely because a calendar invite exists. `FUNDED` and
`INTAKE_READY` must both be true.

## 4. Build discipline

Owner: assigned canonical maker. Checker: Independent Quality and Risk Auditor
(`quality_risk_auditor`).

- Work in the exact client repository, account, and environment.
- Preserve unrelated client work and use a reversible branch, staging surface,
  backup, or export before consequential changes.
- Keep content and structured data aligned with the approved source pack.
- Record assumptions and turn unresolved assumptions into questions before
  they become public copy or product behavior.
- Run the project formatter, type checker, tests, production build, and the
  relevant design/accessibility checks.
- Log change requests separately from defects. Do not hide scope expansion in a
  revision round.

## 5. Client review

Owner: Delivery and Client Success Lead (`delivery_client_success_lead`).

Review packages contain:

- one staging or artifact link;
- what changed and what the client is deciding now;
- known limitations, unresolved inputs, and out-of-scope requests;
- one consolidated feedback deadline;
- the exact release target and release gate when relevant.

Feedback from people without approval authority is evidence, not a scope or
release decision. Conflicting feedback returns to the named decision maker.

## 6. Independent QA gate

Owner: Independent Quality and Risk Auditor (`quality_risk_auditor`), who must
not be the maker signing off their own work.

At minimum, verify the actual artifact or live candidate for:

- source and brand fidelity;
- desktop and mobile rendering, overflow, keyboard and focus behavior,
  reduced motion, media alternatives, forms, loading/error behavior, and
  console output where applicable;
- status codes, canonical destination, metadata, links, redirects, crawl
  controls, supported schema, analytics events, and integration routing in the
  agreed scope;
- secrets, private data, cross-client leakage, unsupported claims, and stale
  domains or brand names;
- the signed acceptance checks and every documented exclusion.

The checker returns `PASS`, `PASS_WITH_RECORDED_LIMITATION`, or `FAIL`. A maker
may fix a failure but may not rewrite the checker's receipt.

## 7. Release and live verification

Owner: Delivery and Client Success Lead (`delivery_client_success_lead`).
Release authority: Dillon or the exact approval defined by current policy.

Before release, confirm the exact domain, site/project, branch or build,
environment, rollback route, and approval evidence. After release:

1. inspect every changed public route or workflow outcome;
2. verify forms and downstream routing without creating unsafe production data;
3. verify redirects and canonical destinations independently of the host receipt;
4. capture deterministic test output or screenshots;
5. record the release identifier, live URL, time, checker, and limitations.

Only then set `VERIFIED_LIVE`.

## 8. Closeout and expansion

Owner: Delivery and Client Success Lead (`delivery_client_success_lead`).
Reviewer: Operations and Finance Controller (`operations_finance_controller`).

Closeout includes:

- final artifact and live receipt;
- approved credentials returned to the authorized manager or retained only in
  the approved vault;
- support-window dates and defect route;
- invoices and payment state;
- deferred backlog, training material, and ownership after launch;
- one measured next-step recommendation tied to observed evidence.

Expansion is a new qualified opportunity. It is not automatically approved by
a successful project or by access that remains available.

## Daily delivery review

Every business day the Delivery and Client Success Lead
(`delivery_client_success_lead`) reports:

| Field | Required value |
|---|---|
| Active engagements | Exact count and names |
| Current state | One state per engagement |
| Next milestone | Owner and due date |
| Client input due | Exact missing input or `none` |
| Delivery risk | Green, amber, or red with evidence |
| Capacity | Committed hours versus launch cap |
| QA/release gate | Current checker and approval state |
| Cash dependency | Invoice/payment state without account details |

The Operations and Finance Controller (`operations_finance_controller`)
resolves collisions and sets the next finite outcome. The daily report may
never blend IMMOHRTAL prospects or customers with Momentum 360,
Align HCM, or another client/brand merely because Dillon works across them.
