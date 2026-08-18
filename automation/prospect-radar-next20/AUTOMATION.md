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

The previous six-hour `Prospect Radar - Next 15 Builder` task is retired when this daily task is installed so the two selectors cannot race or consume one another's candidates.
