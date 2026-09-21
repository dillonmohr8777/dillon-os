---
date: 2026-09-21
type: cadence-report
job: heartbeat
cadence: daily
---

# Cadence heartbeat, 2026-09-21

Reports on **yesterday, Saturday 2026-09-20**.

## Due yesterday

**Nothing.** Daily jobs are due every weekday; 2026-09-20 was a Saturday. Weekly
is due Monday, monthly on the 1st. Zero jobs were due, zero jobs are ABSENT for
that date, and the ledger correctly carries no row for it.

That would be the whole report, except the ledger shows a gap that a strict
"yesterday only" read would hide.

## ABSENT, the real finding: two full weekdays never ran

The last daily cadence pass was **2026-09-17**. There is no ledger row for any
daily job on **Thursday 2026-09-18** or **Friday 2026-09-19**, both weekdays,
both due.

| Job | Last ledger entry | Due 09-18 | Due 09-19 |
| --- | --- | --- | --- |
| heartbeat | 2026-09-17T08:10 ok | ABSENT | ABSENT |
| approval-queue-diff | 2026-09-17T08:11 ok | ABSENT | ABSENT |
| unfiled-sweep | 2026-09-17T08:15 ok | ABSENT | ABSENT |
| leads-triage | 2026-09-17T08:17 ok | ABSENT | ABSENT |
| ops-decision-packets | 2026-09-17T08:26 ok | ABSENT | ABSENT |
| production-briefs | 2026-09-17T08:31 ok | ABSENT | ABSENT |
| delivery-milestones | 2026-09-17T08:38 ok | ABSENT | ABSENT |
| agent-verifier | 2026-09-17T08:44 ok | ABSENT | ABSENT |

**16 absent job-days.** The driver never fired on either date. This is the exact
failure mode the heartbeat exists to catch: not a job that failed loudly, a
driver that went quiet and nobody noticed for four days.

Corroborating evidence, independent of the ledger: `12_Brain/07_Reviews/Cadence/`
contains dated reports for 09-14, 09-15, 09-16, 09-17 and 09-21, and nothing at
all for 09-18, 09-19 or 09-20. Absence on disk matches absence in the ledger, so
the ledger is honest here; the driver simply did not run.

The hourly `daily-sweep` watchdog also stopped: its last row before today is
`2026-09-18T00:00:01Z`, then silence until `2026-09-21T11:07Z`. Both the cadence
driver and the hourly sweep went dark across the same window, which points at the
host rather than at any one job. See the recorded machine power fault (14 unclean
power-offs in 30 days) as the standing candidate cause.

Today's sweep row carries `cadence-absent=2`, so the sweep independently counts
the same two missing days.

## Weekly, for context

Weekly was due Monday 2026-09-15 and did not run that day either; it ran late
this morning, 2026-09-21, and all three jobs are ok with artifacts on disk:

- `omega-search-terms` ok, `clients/omega-landscaping/deliverables/2026-09-21 - search terms pages 1-5.md`
- `report-pairing-check` ok, `12_Brain/07_Reviews/Cadence/2026-09-21 - report pairing.md`
- `revenue-exceptions` ok, `12_Brain/07_Reviews/Cadence/2026-09-21 - revenue exceptions.md`

## Ledger honesty check

Every `ok` row for the eight daily jobs names an artifact that **exists on disk**.
Checked all eight most recent entries against the filesystem; no ledger entry
claims a file that is not there. No lying rows found.
