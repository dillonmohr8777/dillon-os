# Cadence heartbeat - 2026-09-16

Reporting on **yesterday, 2026-09-15 (Monday)**. Monday means the daily manifest
AND the weekly manifest were both due. Monthly was not due (not the 1st).

Due yesterday: 5 jobs. **2 ABSENT, 0 failed, 3 ok.**

## ABSENT - no ledger entry at all

Both weekly jobs. The driver never ran for the weekly cadence yesterday.

| job | manifest | why it matters |
|---|---|---|
| `omega-search-terms` | weekly.yaml | 21 of 22 search-term pages still unread. This is the money job - the 2026-09-09 audit found $1,113 burned on three zero-conversion terms at $39-54/click. Second Monday in a row it has not run. |
| `report-pairing-check` | weekly.yaml | The generated-versus-sent gap is unmeasured. Last known worst case was Omega at 34 days, last actual send 2026-08-11 - which is now 36 days ago. |

### Root cause, verified this run

`Get-ScheduledTaskInfo` on the three Windows tasks:

```
Cadence-daily    State=Ready  Last=11/30/1999  Result=267011  Next=2026-09-16 09:05
Cadence-weekly   State=Ready  Last=11/30/1999  Result=267011  Next=2026-09-21 09:20
Cadence-monthly  State=Ready  Last=11/30/1999  Result=267011  Next=2026-10-01 09:35
```

`11/30/1999` with result `267011` is Windows for **has never run once**. All three
cadence tasks are registered, enabled, and have never fired. This is the same
finding as the 2026-09-15 heartbeat, unchanged 24 hours later - so whatever was
meant to fix it did not happen.

The daily jobs are landing only because a separate Claude scheduled task is
invoking the driver directly. Nothing is invoking the weekly one, and nothing will
before 2026-09-21. `omega-search-terms` will be three Mondays unread by then.

**Open item, not actionable from inside this job:** repairing a scheduled task is
an access change, which this driver is forbidden from making. Appended to the
approval queue instead.

## failed

None.

## ok - artifact verified on disk

| job | artifact | size |
|---|---|---|
| `heartbeat` | `12_Brain/07_Reviews/Cadence/2026-09-15 - cadence heartbeat.md` | 2,738 B |
| `approval-queue-diff` | `12_Brain/07_Reviews/Cadence/2026-09-15 - approval queue diff.md` | 13,226 B |
| `unfiled-sweep` | `12_Brain/07_Reviews/Cadence/2026-09-15 - unfiled sweep.md` | 2,959 B |

Every path the ledger claims for 2026-09-15 exists and is non-empty. No lying
ledger lines this run.

## skipped

None. Every job in all three manifests is `enabled: true`.

## Two things the ledger shows that the due-list does not

1. **`morning-chief` ran yesterday and is in no manifest.** It has a 2026-09-15
   ledger entry with a real artifact (`2026-09-15 - morning chief.md`, 2,745 B),
   but `daily.yaml` was rewritten at 11:00 on 2026-09-15 and no longer contains
   it - nor `omega-search-terms` or `report-pairing-check` as daily jobs. So the
   ledger carries a job the manifest cannot account for. Not a failure; worth
   knowing before someone concludes the job was deleted silently.

2. **`daily-sweep` is writing 24 ledger lines a day.** `Cadence-sweep-heartbeat`
   fires hourly and appends one `ok` per fire, all pointing at the same artifact
   (`System/sweep-status.md`). That is 24 of the ~28 lines a day. It is not wrong,
   but it means the ledger is ~90% one job by volume, and a real failure is easy
   to miss by eye. Its last four fires report `stale=1` then `stale=0`.
