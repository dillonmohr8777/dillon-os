---
note_type: decision
status: active
created: 2026-09-07
updated: 2026-09-07
tags: [decision, align-hcm, registry, roster, supersession]
source_refs:
  - '[[System/operating-status]]'
  - 'C:\Users\dillo\repos\dillon-os\CLAUDE.md (line 16)'
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\registry\clients.json'
  - 'Dillon Mohr, direct confirmation 2026-09-02'
---

# Align HCM registry record is superseded

**Decision:** Align HCM is **not** an active client or employer. The
`client-operations` registry record listing it active with six open deliverables
is stale and is superseded by the vault as of 2026-09-07.

## What each source says

| Source | State | Date |
|---|---|---|
| `CLAUDE.md` line 16 | "**No longer at Align HCM (ended, confirmed 2026-09-02).**" | 2026-09-02 |
| `System/operating-status.md` | "Align HCM: **ended.** No longer Dillon's employer. Excluded from the roster and from income assumptions." | 2026-09-02 |
| Dillon, direct | Confirmed the engagement ended | 2026-09-02 |
| `client-operations` registry | **Active**, six deliverables, including Dayforce exhibitor artwork with a rush fee | stale |

Three sources agree, one disagrees, and the one that disagrees is a generated
routing record rather than a statement of fact. **The vault and Dillon's direct
confirmation win.**

## Why this had to be decided rather than left

The registry is the routing authority the AI division plan depends on — the plan's
"operating system and model roles" section names it explicitly, and its "initial
customer and qualification" section selects founding accounts from it. A stale
active record with an open rush-fee deliverable is not a cosmetic error:

- It can surface Align HCM in a client selection pass.
- A rush-fee deliverable implies a live commercial obligation that does not exist.
- It contradicts the operating status the same agents read two steps earlier,
  which is exactly the kind of contradiction that makes an agent split the
  difference instead of stopping.

## What this supersedes

- Any registry-derived statement that Align HCM is an active client.
- Any income assumption including Align HCM. Momentum 360 plus direct and 1099
  clients are the income base.
- The six open deliverables as **live** work. They remain historical record.

`02_FullTimeJob/AlignHCM/overview.md` is retained as historical record only, as
already stated in `System/operating-status.md`.

## What is *not* decided here

- The exact end date and whether a return remains open are **not established**.
  Dillon's 2026-08-28 Slack message describes a role ending "bc of the market /
  labor conditions in Canada" without naming the employer. The termination is
  confirmed; the details are not. Do not fill them in.
- The registry file itself is **not edited by this decision**. The registry lives
  in `client-operations`, outside this vault, and is held by other sessions.
  Correcting it is a separate, tracked action — queued, not performed.
- The unrelated open Coinbase draft PR #8 in `align-hcm-august-2026-content`
  remains approval-gated and untouched.

## Review

Review if Dillon reports a return to Align HCM, or if a registry sync
re-introduces the active record. Otherwise this stands.

Feeds [[12_Brain/05_Projects/2026-09-07 - Momentum AI division launch]] and
[[12_Brain/07_Reviews/2026-09-07 - AI division evidence pass]].
