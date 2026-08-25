# Pipeline Lifecycle and Stage Rules

The pipeline tracks evidence-backed state, not optimism. A record may advance
only when the required receipt exists. Missing evidence means the record stays
put or rolls back.

## Account lifecycle

| State | Meaning | Entry rule | Exit rule |
|---|---|---|---|
| `RESEARCH_ONLY` | Candidate identity is being resolved. | A potential company is recorded without complete current evidence. | Identity and public source are verified, or the record is blocked/removed. |
| `EVIDENCE_READY` | Company identity and one current public observation are source-located. | Demand Intelligence supplies dated evidence, confidence, unknowns, and source URL. | Required conflict/suppression checks begin. |
| `QUALIFICATION_PENDING` | The qualification score and hard gates are incomplete. | Evidence is ready and no confirmed disqualifier exists. | Score and all hard gates resolve. |
| `QUALIFIED` | The universal floor passes and score is 13–16, or an explicitly documented conditional diagnostic route is approved. | Qualification artifact and capacity check exist. | A real commercial opportunity opens or the record moves to nurture. |
| `OPPORTUNITY_OPEN` | A bounded commercial evaluation is active. | Verifiable interaction or buyer-supplied facts establish an active evaluation. | Win, loss, nurture, or suppression receipt exists. |
| `CUSTOMER_ACTIVE` | Signed scope and required funding/authorization are verified. | Contract plus applicable payment/authorization receipt. | Delivery closes or relationship becomes inactive. |
| `INACTIVE` | No active commercial motion. | Closed-lost, closed work, or deliberate archive. | New current evidence supports requalification. |
| `SUPPRESSED` | Contact or pursuit is prohibited. | Opt-out, do-not-contact, conflict, invalid identity, or other hard disqualifier. | Only an authorized source explicitly clears suppression. |

## Opportunity stages

| Stage | Required entry receipt | Permitted next stages |
|---|---|---|
| `P00_ACCOUNT_RESEARCH` | Stable account ID plus source locator. | `P10`, `P95`, `P99` |
| `P10_QUALIFICATION_PENDING` | Current observation, source, service-lane fit hypothesis, explicit unknowns. | `P20`, `P90`, `P95`, `P99` |
| `P20_QUALIFIED` | Score, hard-disqualifier clearance, suppression/dedupe/conflict clearance, capacity check, smallest sufficient offer. | `P30`, `P95`, `P90`, `P99` |
| `P30_DISCOVERY_CONFIRMED` | Verified meeting or buyer-discovery receipt; research alone cannot enter this stage. | `P40`, `P95`, `P90`, `P99` |
| `P40_SOLUTION_SCOPED` | Buyer problem, decision owner, inputs, scope, exclusions, acceptance criteria, budget, and timing are source-backed. | `P50`, `P95`, `P90` |
| `P50_PROPOSAL_APPROVED_INTERNAL` | Internally reviewed proposal artifact and capacity/price approval. This is not sent. | `P60`, `P40`, `P90` |
| `P60_PROPOSAL_SENT` | External delivery receipt for the exact proposal. | `P70`, `P90`, `P95` |
| `P70_DECISION_PENDING` | Buyer receipt confirms proposal consideration or a decision date. | `P80`, `P90`, `P95` |
| `P80_CLOSED_WON` | Signed scope plus required payment/authorization receipt. Verbal interest is insufficient. | terminal; customer lifecycle begins |
| `P90_CLOSED_LOST` | Explicit decline, disqualification, or expired decision with reason. | `P00` only on new evidence |
| `P95_NURTURE` | Fit exists but timing, budget, ownership, or capacity is not ready. | `P10` or `P20` on current evidence |
| `P99_SUPPRESSED` | Suppression or hard-conflict receipt. | `P00` only after authorized clearance |

## Non-negotiable stage controls

- A concept URL is proof of internal preparation, not buyer interest.
- An internal artifact is never a sent proposal.
- Research is never a reply; a suggested time is never a booked meeting.
- `amount_usd`, `probability_percent`, and forecast category stay null/excluded
  until a source-backed commercial scope exists.
- Stage changes require `updated_at`, `last_stage_changed_at`, owner, next action,
  due date, and entry receipt.
- The Revenue Pipeline Manager performs daily hygiene; Demand Intelligence may
  correct evidence but may not inflate a commercial stage.
- The independent auditor must check every transition into `P20`, `P30`, `P50`,
  `P60`, `P80`, or `P99`.
- Records without a next action or with an overdue evidence review are blocked
  from advancement.

## Daily reconciliation

Report exact counts for each stage, overdue next actions, stale evidence,
suppressed records, and verified outcomes. Do not calculate pipeline value,
coverage, velocity, conversion rate, CAC, or forecast accuracy while amounts or
commercial receipts are absent.
