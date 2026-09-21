---
date: 2026-09-21
type: cadence-report
job: heartbeat
cadence: daily
---

# Cadence heartbeat, 2026-09-21

Reports on **yesterday, Sunday 2026-09-20**.

## Due yesterday

**Nothing.** Daily jobs are due every weekday; 2026-09-20 was a Sunday. Weekly is
due Monday, monthly on the 1st. Zero jobs were due, zero are ABSENT for that
date, and the ledger correctly carries no row for it.

That would be the whole report, except the ledger shows a gap a strict
"yesterday only" read would hide.

## ABSENT: Friday 2026-09-18 never ran

The last daily cadence pass was **Thursday 2026-09-17**. There is no ledger row
for any daily job on **Friday 2026-09-18**, a weekday, all eight due.

| Job | Last ledger entry | Due Fri 09-18 |
| --- | --- | --- |
| heartbeat | 2026-09-17T08:10 ok | ABSENT |
| approval-queue-diff | 2026-09-17T08:11 ok | ABSENT |
| unfiled-sweep | 2026-09-17T08:15 ok | ABSENT |
| leads-triage | 2026-09-17T08:17 ok | ABSENT |
| ops-decision-packets | 2026-09-17T08:26 ok | ABSENT |
| production-briefs | 2026-09-17T08:31 ok | ABSENT |
| delivery-milestones | 2026-09-17T08:38 ok | ABSENT |
| agent-verifier | 2026-09-17T08:44 ok | ABSENT |

**8 absent job-days.** The driver did not fire on Friday. This is the failure the
heartbeat exists to catch: not a job that failed loudly, a driver that went quiet
into a weekend and stayed quiet for three days.

Corroborating evidence, independent of the ledger: `12_Brain/07_Reviews/Cadence/`
holds dated reports for 09-14, 09-15, 09-16, 09-17 and 09-21, and nothing for
09-18, 09-19 or 09-20. Absence on disk matches absence in the ledger, so the
ledger is honest here; the driver simply did not run.

The hourly `daily-sweep` watchdog stopped too. Its last row before today is
`2026-09-18T00:00:01Z`, then silence until `2026-09-21T11:07Z`. Both the cadence
driver and the hourly sweep went dark across the same window, which points at the
host rather than at any one job. The recorded machine power fault, 14 unclean
power-offs in 30 days, is the standing candidate cause.

Today's sweep row carries `cadence-absent=2`, so the sweep independently counts a
gap of its own.

## Weekly, due today, already ran

Monday 2026-09-21 is a weekly day. All three weekly jobs ran this morning ahead
of this pass and are ok with artifacts on disk:

- `omega-search-terms` ok, `clients/omega-landscaping/deliverables/2026-09-21 - search terms pages 1-5.md`
- `report-pairing-check` ok, `12_Brain/07_Reviews/Cadence/2026-09-21 - report pairing.md`
- `revenue-exceptions` ok, `12_Brain/07_Reviews/Cadence/2026-09-21 - revenue exceptions.md`

The prior weekly day, Monday 2026-09-14, has no weekly ledger rows at all, so
weekly was also ABSENT that week and this morning's pass was the first one to
land.

## Ledger honesty check

Every `ok` row for the eight daily jobs names an artifact that **exists on disk**.
All eight most recent entries checked against the filesystem. No ledger row
claims a file that is not there.
