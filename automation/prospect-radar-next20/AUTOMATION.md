# Prospect Radar Next 20 daily builder

This lane produces exactly 20 untouched, mobile-first Prospect Radar sites per completed run and releases them only to the exact existing Radar hub after every local and live gate passes.

- Windows task: `Prospect Radar - Next 20 Daily Builder`
- Cadence: daily at 5:20 AM America/New_York
- Hidden launcher: `C:\Users\dillo\.codex\tools\Run-HiddenScheduledTask.vbs`
- Worker: `Run-ProspectRadarNext20Daily.ps1`
- Run receipts: `automation\prospect-radar-next20\runs\<timestamp>`
- Batches: `02_Campaigns\AI Site Builder Outreach Engine\batches\radar-next20-<timestamp>`
- Release boundary: exact existing Netlify site `3cf338d4-6813-4712-a6dc-d27e8778cae9` and canonical `JESSE CALL SHEET` only. `mail_ready=hold` always; no outreach, ads, new public sites, account changes, or Business Workshop writes.

The hidden PowerShell runner validates the canonical repository, the Align HCM Image Gen plugin skill, the Codex CLI, the exact Netlify target, and the current local production snapshot before starting. It then launches one bounded Codex production worker. The worker selects 20 untouched businesses from the current canonical Radar registry after global prior-build exclusion. Eligible prospects are processed by `first_seen` ascending, oldest tracked first; score and quality are same-date tie-breakers only, missing dates sort last, and vertical diversity never overrides chronology. It uses first-party sources and never guesses contact details, identity, claims, or marks.

Before build, the worker must use `align-hcm-image-gen` and image generation to create one unique 2x2 editorial board for each exact business. Every board depicts people doing recognizable work in that business's industry, uses the Align orange/navy/paper/cyan system, and carries visibly pronounced refined 35mm grain. Category boards, shared boards, glossy stock substitutes, and fake logos are prohibited. The build produces 12 unique 1200x900 derivatives per site, honest generated-image disclosure, self-hosted Plus Jakarta Sans and DM Sans, six-width top and full-page browser evidence, one Impeccable detector pass, strict acceptance QA, and a final audit.

Completion requires all of the following in `DAILY-RELEASE.json`: 20/20 `qa_ready`, 20 unique site-specific boards, 240 unique image hashes, 240 screenshots, verified deployment to the exact existing hub, 20 canonical sheet rows with readback, and `mail_ready=hold`. The call sheet preserves batch chronology and records the registry date in `Radar First Seen`; each appended batch is oldest first. `SHOW` requires an official-source-verified phone; unverified entries are `REVIEW` with blank contact fields. Missing plugin, image generation, source truth, exact target, production-base match, QA, live verification, or sheet readback fails closed.

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
