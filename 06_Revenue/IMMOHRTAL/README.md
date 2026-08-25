# IMMOHRTAL Local Revenue Control Plane

**Status:** active internal foundation
**Workflow:** `IMMOHRTAL-DAY1-20260825`
**External systems:** disabled
**Commercial baseline:** no verified contact, reply, meeting, proposal, win, or new revenue event

This folder is the local source of truth for IMMOHRTAL account research,
qualification, and pipeline hygiene. It is deliberately not connected to a
mailbox, provider-side CRM, scheduler, social platform, or automatic-reply
runtime.

## Ownership

- **Demand Intelligence Lead** owns company identity, public-source evidence,
  observation freshness, confidence, unknowns, duplicate evidence, and
  suppression/client-conflict research.
- **Revenue Pipeline Manager** owns record completeness, lifecycle stage,
  qualification status, offer routing, next action, exit rule, aging, and
  pipeline reconciliation.
- **Independent Quality and Risk Auditor** checks stage receipts, evidence,
  privacy, suppression, and unsupported commercial claims.
- **Codex Marketing Chief** is the only canonical internal orchestrator and
  final verifier.

## Files

- `CRM-SCHEMA.json` — machine-enforceable record contract and controlled enums.
- `PIPELINE-LIFECYCLE.md` — stage entry, exit, rollback, and receipt rules.
- `FIELD-DICTIONARY.md` — semantic definitions, owners, and null policy.
- `EVIDENCE-AND-SOURCE-RULES.md` — source, freshness, privacy, and truth-state
  contract.
- `pipeline-import.json` — canonical five-record local import with structured
  evidence and qualification gaps.
- `pipeline-import.csv` — flattened five-record import for tabular inspection.
- `CAPABILITY-PLACEHOLDERS.json` — disabled future automatic-reply and
  social/content capabilities, without execution authority.
- `../../05_Offers/IMMOHRTAL/PUBLIC-MONTHLY-SERVICE-MENU.json` — exact
  Dillon-approved monthly fees that may be routed into a public offer fit.
- `../../05_Offers/IMMOHRTAL/OUTREACH-AND-BOOKING-STANDARD.md` — source,
  writing, approval, and booking controls for any future commercial motion.

## Operating rule

The current five rows are `EVIDENCE_READY` accounts in
`P10_QUALIFICATION_PENDING`. They are not qualified opportunities merely
because a public observation and a concept exist. Decision ownership, budget,
timing, capacity, suppression, prior-touch, and client-conflict checks remain
unresolved. No message copy or contact identifier is stored here.

## Daily loop

1. Demand Intelligence refreshes identity and evidence due for review.
2. Demand Intelligence completes duplicate, suppression, prior-touch, and
   client-conflict checks against authorized canonical sources.
3. Revenue Pipeline Manager validates every required field and next action.
4. Revenue Pipeline Manager advances only records whose stage entry receipt is
   attached; otherwise the stage stays or rolls back.
5. The independent auditor checks 100% of records that would cross a commercial
   boundary.
6. Codex closes the day with exact counts by stage, overdue next actions,
   blocked records, and verified commercial outcomes.

No email body, email subject, mailbox action, provider CRM write, social
scheduling, automatic reply, or external contact is authorized by this folder.
