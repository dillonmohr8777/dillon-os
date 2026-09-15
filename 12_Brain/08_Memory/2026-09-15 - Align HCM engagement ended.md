---
note_type: memory
memory_type: operating-fact
status: active
created: 2026-09-15
updated: 2026-09-15
subject: Align HCM
valid_from: 2026-09-02
valid_to:
observed_at: 2026-09-15T04:10:00Z
confidence: 0.9
review_on: 2026-09-22
verification_status: verified
source_refs:
  - "[[12_Brain/01_Captures/2026-09-14 - Align Search Console and GA4 direct snapshot, gap table, and the Google access answer]]"
  - "System/google-access-expansion/ACCESS-LEDGER-2026-09-14.md"
supersedes: "01_Clients/Align HCM.md status: active"
tags:
  - brain
  - memory
  - operating-fact
  - align-hcm
  - roster
---

# Align HCM engagement ended 2026-09-02

**Align HCM is a former employer as of 2026-09-02. Three tracked files still describe
it as current, and nothing has corrected them.**

## What is true

The 2026-09-14 capture states it plainly: Align HCM "is the **former employer**
(ended 2026-09-02)" and "Nothing is owed to Align." The capture's
`verification_status` is `verified`; it was written by a local session that held live
Search Console and GA4 reads on the property and had no reason to soften the date.

The same capture records a second change of operating context: Dillon is interviewing
for a marketing role at **Empeon**, a healthcare HCM/payroll vendor, with Jonathan
Nack (VP Sales) as next contact. Align appears in that work only as the evidence
source behind an addendum's appendix — job-pursuit collateral, not client work.

## What still says otherwise

| File | What it says | Evidence |
|---|---|---|
| `01_Clients/Align HCM.md` | `status: active`, `rate: Full-time`, `last_touched: 2026-07-29` | frontmatter on `main` at `7581e75` |
| `System/operating-status.md` | "Full-time, excluded from client count: Align HCM" (line 20) | same |
| `CLAUDE.md` | "Full-time at Align HCM" | same |
| client-operations registry | marks Align `active` | reported by the capture; not reachable from the cloud to confirm |

The capture author saw this and chose not to fix it: *"`01_Clients/Align HCM.md` and
the client-operations registry still mark Align `active` against the 2026-09-02 end;
left untouched, flagged."* That was the correct call for a capture — captures are
immutable and the roster is Dillon's — but the flag has had no reader since.

## Why it matters more than a stale field

`System/operating-status.md` and `CLAUDE.md` are the first files every agent reads.
Every planning routine inherits "full-time at Align HCM" as a fact about how Dillon's
week is shaped, and inherits ROAD TO 100 CLIENTS as the sole directive, while the
operator is in fact between roles and interviewing. `Daily-Briefs/plan-2026-09-14.md`
picks "the one thing" from client work only; a job-search lane exists in the estate
(PR #391, `claude/job-search-automation-c4qi5t`, open since 2026-09-09) and no
scheduled routine reads it.

This is a roster and employment decision, so the correction is **proposed, not
applied** — see [[12_Brain/11_Craft/2026-09-15 - daily learning review]].

## Unverified

- Whether Align should move to `_archive/01_Clients/` (the 2026-09-05 precedent for
  Fagan Painting and Shadow HVAC) or stay in place as a former employer with
  `status: inactive`. The 2026-09-05 reconciliation used `inactive` plus
  `retentionPolicy: preserve-history-do-not-promote-or-rank` for retired clients.
- Whether the Align appendix leaves the building with the Empeon addendum. The
  capture records this as Dillon's open decision; nothing here changes it.
- The client-operations registry state. Not reachable from the cloud; the mirror at
  `~/client-operations-canonical` has no commit since 2026-09-03 (`faee50b`).
