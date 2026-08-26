# Prospect Radar Next 20 daily builder

This lane produces exactly 20 untouched, mobile-first Prospect Radar sites per completed run and releases them only to the exact existing Radar hub after every local and live gate passes.

- Windows task: `Prospect Radar - Next 20 Daily Builder`
- Cadence: daily at 5:20 AM America/New_York
- Hidden launcher: `C:\Users\dillo\.codex\tools\Run-HiddenScheduledTask.vbs`
- Worker: `Run-ProspectRadarNext20Daily.ps1`
- Run receipts: `automation\prospect-radar-next20\runs\<timestamp>`
- Batches: `02_Campaigns\AI Site Builder Outreach Engine\batches\radar-next20-<timestamp>`
- Release boundary: exact existing Netlify site `3cf338d4-6813-4712-a6dc-d27e8778cae9` and canonical `JESSE CALL SHEET` only. `mail_ready=hold` always; no outreach, ads, new public sites, account changes, or Business Workshop writes.

The hidden PowerShell runner validates the canonical repository, the Align HCM Image Gen plugin skill, the Codex CLI, the exact Netlify target, and the current local production snapshot before starting. It then launches one bounded Codex production worker. The worker selects 20 untouched businesses from the current canonical Radar registry after global prior-build exclusion. It uses first-party sources and never guesses contact details, identity, claims, or marks.

Before build, the worker must use `align-hcm-image-gen` and image generation to create one unique 2x2 editorial board for each exact business. Every board depicts people doing recognizable work in that business's industry, uses the Align orange/navy/paper/cyan system, and carries visibly pronounced refined 35mm grain. Category boards, shared boards, glossy stock substitutes, and fake logos are prohibited. The build produces 12 unique 1200x900 derivatives per site, honest generated-image disclosure, self-hosted Plus Jakarta Sans and DM Sans, six-width top and full-page browser evidence, one Impeccable detector pass, strict acceptance QA, and a final audit.

Completion requires all of the following in `DAILY-RELEASE.json`: 20/20 `qa_ready`, 20 unique site-specific boards, 240 unique image hashes, 240 screenshots, verified deployment to the exact existing hub, 20 canonical sheet rows with readback, and `mail_ready=hold`. `SHOW` requires an official-source-verified phone; unverified entries are `REVIEW` with blank contact fields. Missing plugin, image generation, source truth, exact target, production-base match, QA, live verification, or sheet readback fails closed.

The previous six-hour `Prospect Radar - Next 15 Builder` task is retired when this daily task is installed so the two selectors cannot race or consume one another's candidates.
