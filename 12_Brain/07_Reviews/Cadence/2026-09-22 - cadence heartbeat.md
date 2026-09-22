# Cadence heartbeat — 2026-09-22

Reporting on **Monday 2026-09-21**. Due that day: 8 daily jobs + 3 weekly jobs
(Monday). Monthly jobs were not due (not the 1st).

**Every due job ran, reported ok, and its named artifact exists on disk. Nothing
ABSENT, nothing failed.**

## ABSENT

None.

## Failed

None among manifest jobs.

## ok — daily (8/8)

| Job | Ledger | Artifact | On disk |
|---|---|---|---|
| heartbeat | ok | 12_Brain/07_Reviews/Cadence/2026-09-21 - cadence heartbeat.md | yes (2,973 B) |
| approval-queue-diff | ok | 12_Brain/07_Reviews/Cadence/2026-09-21 - approval queue diff.md | yes (5,219 B) |
| unfiled-sweep | ok | 12_Brain/07_Reviews/Cadence/2026-09-21 - unfiled sweep.md | yes (3,625 B) |
| leads-triage | ok | 12_Brain/07_Reviews/Cadence/2026-09-21 - lead triage.md | yes (3,346 B) |
| ops-decision-packets | ok | 12_Brain/07_Reviews/Cadence/2026-09-21 - ops decision packets.md | yes (9,086 B) |
| production-briefs | ok | 12_Brain/07_Reviews/Cadence/2026-09-21 - production briefs.md | yes (10,942 B) |
| delivery-milestones | ok | 12_Brain/07_Reviews/Cadence/2026-09-21 - delivery milestones.md | yes (9,926 B) |
| agent-verifier | ok | 12_Brain/07_Reviews/Cadence/2026-09-21 - verifier.md | yes (6,913 B) |

## ok — weekly (3/3, due Monday)

| Job | Ledger | Artifact | On disk |
|---|---|---|---|
| omega-search-terms | ok (two entries, pages 1-5 and 6-10) | client-operations/clients/omega-landscaping/deliverables/2026-09-21 - search terms pages 1-5.md and pages 6-10.md | yes (20,200 B / 17,125 B) |
| report-pairing-check | ok | 12_Brain/07_Reviews/Cadence/2026-09-21 - report pairing.md | yes (6,212 B) |
| revenue-exceptions | ok | 12_Brain/07_Reviews/Cadence/2026-09-21 - revenue exceptions.md | yes (12,014 B) |

## Skipped

None. All 11 manifest jobs due yesterday are `enabled: true` in
12_Brain/registry/automations.json.

## Two things the ledger shows that are not manifest jobs

Recorded here because they write to the same ledger and would otherwise read as
cadence noise.

1. **`weekly-client-reports`** wrote 11 ledger lines on 09-21: ten `degraded`,
   one `failed`. It is **not in weekly.yaml** — it is an external scheduled task
   sharing this ledger, so the driver never ran it and it is out of scope for
   this heartbeat's due list. Its failure note is real and still open:
   `bin/archive.py KeyError: 'pro-fence-deck'`, plus the Ads lane blocked on
   `invalid_grant` (the 2026-09-21 Google OAuth revocation). Tracked in the
   approval queue, not here.
2. **`daily-sweep`** writes an hourly `ok` row (24+ lines a day) with artifact
   `System/sweep-status.md`. Also not a cadence manifest job. Its own note has
   been reporting `cadence-absent=8` continuously — that counter disagrees with
   this heartbeat's finding of zero absent jobs, so one of the two is measuring
   something different. Worth a look; not a cadence failure.
