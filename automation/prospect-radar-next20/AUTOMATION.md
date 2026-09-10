# Prospect Radar Next 20 daily builder

This lane produces exactly 20 private, untouched, mobile-first Prospect Radar concepts per completed run.

- Windows task: `Prospect Radar - Next 20 Daily Builder`
- Cadence: daily at 5:20 AM America/New_York
- Hidden launcher: `C:\Users\dillo\.codex\tools\Run-HiddenScheduledTask.vbs`
- Worker: `Run-ProspectRadarNext20Daily.ps1`
- Run receipts: `automation\prospect-radar-next20\runs\<timestamp>`
- Batches: `02_Campaigns\AI Site Builder Outreach Engine\batches\radar-next20-<timestamp>`
- Delivery boundary: local only, `mail_ready=hold`, no CRM, queue, send, publish, deployment, or account changes. `qa_ready` becomes ready only after the full browser/spec gate passes.

Each run can expand up to four Pennsylvania Radar areas, alternating the home-services/medical/legal lane with industrial/wellness/auto/retail/food. It scans prior build artifacts across the machine, requires a reachable first-party source and exact first-party logo artwork, then records selection before building. A flat logo background may be removed only when all four border samples agree; source and output hashes plus the deterministic FFmpeg transformation are retained. Ambiguous marks are rejected.

The build emits 20 private noindex sites, four category-relevant generated editorial assets distributed through each site, self-hosted expressive font pairs, exact header and ink-finale logos, per-asset provenance, six-width browser QA, and one Impeccable detector pass. Generated imagery is visibly disclosed as illustrative and never represented as the business, its people, customers, or completed work. The board selector uses the verified Radar category and fails closed on an unfamiliar category instead of substituting generic imagery. A source, identity, imagery, spec, browser, detector, or duplicate failure creates a blocked receipt instead of a partial completion claim.

## Logo verification is the supply line

Selection requires `logo_eligibility.status == verified` on every one of the 20
rows. That evidence is minted by the radar sweep's imagery stage, not by this
task, so the sweep is a hard dependency rather than a neighbour.

Two faults broke that supply and stalled the lane from 2026-09-06:

1. `lib/imagery.js` returned `status: 'pending'` for every logo it ever fetched,
   so the only route to `verified` was a hand review. One ran on 2026-09-05,
   produced exactly 20 rows, and that same day's build consumed all 20. From the
   next morning the active pool was 0, four discovery attempts could not find 20
   eligible candidates, and the task threw and exited 1 — daily. The sweep was
   healthy throughout: 60 logos fetched a day, `logo_verified: 0` every time.
2. This script passed `--imagery 0`, so rows it discovered itself arrived with
   `logo_provenance_missing` and were ineligible on arrival.

`lib/logo-audit.js` now measures transparency in pure Node — no ffmpeg, so it
behaves the same in GitHub Actions, on Windows, and in a Linux container — and
cuts a flat background off an opaque mark with a border-seeded flood fill, which
preserves plate-coloured pixels inside the mark that a global colour key would
punch out. A row reaching `verified` this way is stamped
`validation_method: automated_pixel_audit` and must carry the measurements it
claims, so the audit trail still distinguishes it from a human review.

Ordering matters as much as the audit. The sweep sorted logo work by
`priority_score` alone, which re-selected the same head every morning: on
2026-09-09 all 60 audited rows carried `logo_checked: 2026-09-09` while 1,303
rows had never been checked once. Work is now ordered never-checked first, then
oldest-checked, with a 10-day cooldown, so an unverifiable row cannot starve the
registry. `tests/logo-queue-order.test.js` locks that in.

The previous six-hour `Prospect Radar - Next 15 Builder` task is retired when this daily task is installed so the two selectors cannot race or consume one another's candidates.
