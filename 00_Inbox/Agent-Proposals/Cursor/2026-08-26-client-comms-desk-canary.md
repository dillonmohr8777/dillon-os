---
note_type: proposal
status: complete
created: 2026-08-26
verified_at: 2026-08-27T03:34:00Z
agent: client-comms-desk
privacy: redacted
external_action_attempted: none
source_refs:
  - System/urgent-replies.md
  - System/approval-queue.md
  - 01_Clients/Kimberly James Bridal/overview.md
  - Daily-Briefs/plan-2026-08-26.md
---

# Client-comms desk — 2026-08-26 canary

## Verdict

**Draft-ready follow-up card produced locally. Not sent. Approval queue not mutated.**

## Source locators and freshness

| Source | Locator | Freshness |
|---|---|---|
| Urgent work list | `System/urgent-replies.md` Immediate: KJB | 2026-07-12 |
| Existing approval gate | `System/approval-queue.md` KJB FAQ publish row 2026-07-12 | last_scan 2026-08-17 |
| Board priority | `Daily-Briefs/plan-2026-08-26.md` paid-media + LP finish lines | 2026-08-26 |

## Findings

- Immediate KJB item: finish desktop FAQ image crop/responsive QA and reconcile appointment routing before any client update.
- Matching approval-queue row already exists for FAQ publish after QA — duplication risk if a new queue line were appended blindly.
- Raw Gmail/Slack routines (D04–D06, D20–D21) remain Codex-owned; this canary used vault summaries only.

## Draft card (not appended)

**Client:** Kimberly James Bridal  
**Channel:** client message (approval-gated)  
**Purpose:** Status update after FAQ desktop crop + responsive QA  
**Evidence needed before send:** appointment-source reconciliation pass  
**Approval state:** draft — matches existing queue row 2026-07-12 KJB FAQ  
**Risk:** low once QA evidence attached

## Blockers

- No live QA receipt in vault proving FAQ crop complete.
- Sending remains Tier 2 — Dillon only.

## Next safest action

Route to `web-product-builder` + `qa-critic` for FAQ QA evidence, then Marketing Chief merges one approval card for Dillon send/publish decision.
