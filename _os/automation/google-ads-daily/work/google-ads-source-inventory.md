# Google Ads source and exact-logo inventory

Prepared September 4, 2026 Eastern. Workflow `google-ads-deep-review`, step `source-inventory`. This is a bounded, read-only local evidence inventory, not a live account audit or canonical roster mutation. Chief owns browser and current-platform verification.

All paths below are relative to `C:/Users/dillo/Documents/Codex/projects/client-operations` unless explicitly absolute. Local files were read this run; historical observations remain historical. No raw communications, lead PII, account writes, sends, or publishing occurred.

## Eligibility and freshness

| Exact registry client | Google customer | Evidence position |
| --- | --- | --- |
| Kimberly James Bridal, `kimberly-james-bridal` | 814-550-6229 | Active canonical client and permitted by weekly reporting job. Latest local weekly report found covers Aug17–23, prepared Aug24. User's newer request permits current read audit, not automatic reactivation. Chief must reconcile the newer pause request before treating Google delivery as active. |
| Omega Landscaping and Concrete, `omega-landscaping` | 285-398-1364 | Active canonical client and permitted by weekly reporting job. Latest local weekly source found covers Aug17–23, prepared Aug24. Current enabled campaign/delivery state unverified here. |
| Onsite Concrete & Landscape, `onsite-concrete-landscape` | 103-371-5894 | Active canonical client and permitted by weekly reporting job. Latest local weekly source found covers Aug17–23, prepared Aug24. Detailed account audit is dated Aug12, not today. |
| Nexla, `nexla` | 791-780-2207 | Active registry client, but `accessMappingRequired: true`; registry explicitly distinguishes this from weekly automation's account scope. Sep2 local launch-readiness document says NO GO. Chief supplied newer Sep3 sent-launch/client-acknowledgment locators; reconcile them with current account state, not the obsolete Sep2 verdict. |

Sources: `registry/clients.json`; `registry/paid-media-roster.json` generated July30 with lane observations as old as July16; `C:/Users/dillo/.codex/automations/weekly-client-marketing-reports/automation.toml` expressly allows only KJB, Omega, and Onsite Google customers and forbids other account inspection **within that job**. Do not transplant that job's narrow roster into a claim that these are all of Dillon's currently active accounts. No roster changes were made.

## Conversion and campaign evidence to test live

### KJB

`clients/kimberly-james-bridal/deliverables/2026-08-24-weekly-report-2026-08-17-to-2026-08-23/source-data.json` preserves Google traffic separately from Meta lead totals and explicitly prioritizes appointment-outcome reconciliation before budget changes. The Sep4 daily lead intake package concerns historical Meta screenshot records, not fresh Google conversion proof. Do not infer appointment bookings or sales from a Meta form or a Google event.

Current gaps: live pause/delivery state, exact campaign goal, Primary versus Secondary event membership, appointment confirmation record and dedupe key, CallRail connected-call/quality evidence, recent source-attributed booking outcomes.

### Omega

`clients/omega-landscaping/deliverables/2026-08-24-weekly-report-2026-08-17-to-2026-08-23/source-data.json` historically records eligible High Intent Colorado Springs Search with bidding learning and says to reconcile calls/forms to project opportunities. Optimization score is not business-outcome proof.

Current local code finding: `clients/omega-landscaping/deliverables/2026-08-01-google-ads-landing-page/script.js:64` begins a submit listener. It emits `form_submit`, then an Ads conversion before any successful downstream receipt is checked. The same file emits `phone_call` on a phone-link click (line59). `thank-you/index.html:13` can independently fire the same Ads event on a new-session page visit, guarded only by a sessionStorage flag. The flag suppresses repeat browser-session firing; it does not prove receipt, lead uniqueness, qualified opportunity, connected call, or CRM outcome. This is verified local-code behavior, **not proof that current production or bidding still uses these events**.

Historical release record: `.../RELEASE.md` maps `https://omega-landscaping-landing-page.netlify.app`. Chief should compare current served JS, live GTM triggers, Ads goal membership, and accepted form records before diagnosing production impact.

### Onsite

`clients/onsite-concrete-landscape/deliverables/2026-08-12-call-volume-recovery/live-audit-and-change-plan.md` is a material historical hypothesis list: click-optimized Smart campaign; general-site destination instead of dedicated paid-search page; broad themes; only two negative themes; location-interest exposure; fourteen enabled conversion actions with duplicate Primary form/call/contact/click behavior; Enhanced Conversions not recording. The audit explicitly says campaign changes were not applied. None of these August observations can be asserted as current without Chief's readback.

`clients/onsite-concrete-landscape/deliverables/2026-08-24-weekly-report-2026-08-17-to-2026-08-23/source-data.json` describes platform Web Phone Call actions and leaves booked-job quality pending validation. The historical click mix is reason to inspect network/campaign/search-term quality, not evidence of fraud.

Current local code: `clients/onsite-concrete-landscape/deliverables/2026-08-01-google-ads-landing-page/script.js:62` emits `phone_call` on a phone click; line67 starts submit handling that emits `contact_form` without an accepted downstream receipt check. Click identifiers and UTMs are carried into fields and official-site links, but that alone does not establish attributed qualified leads. Historical release maps `https://onsite-gads-landing-page.netlify.app`.

### Nexla conflict requiring live reconciliation

`clients/nexla/deliverables/2026-09-02-google-ads-launch-readiness-and-call-research.md` identifies account791-780-2207, the MCP landing page, a proposed Brand Exact/MCP Search split, and gaps in published tracking, primary goal selection, saved Ads state, and business assets. Chief's newer source locators: Gmail thread `1a0219ad3ad53df0`, sent message `1a069adcb5513cd8`, client acknowledgment `1a06a593c00768f3`. Those newer messages were supplied by Chief, not independently reread by this worker. Communication evidence cannot substitute for current campaign/budget/goal readback. Do not re-send the obsolete Sep2 NO GO draft.

## Exact reusable logos

All three images were visually inspected this run. They are intact existing artwork, not generated substitutes. Original first-party download provenance was not independently recovered for every logo, so distinguish verified local continuity from fresh website authority.

| Client | Exact local asset | SHA256 and provenance |
| --- | --- | --- |
| KJB | `clients/kimberly-james-bridal/deliverables/2026-08-24-weekly-report-2026-08-17-to-2026-08-23/client-logo.png` | `5A7E22999B784FBECCC3730DF11BA339AB371EAA44BEA6AF87A9FFDC45EC697D`. Hash matches original July26 dashboard `assets/kimberly-james-bridal-byyg7hws.png`. Aug10 renderer explicitly uses that source. Navy Kimberly/Bridal with gold James script. Use light surface, preserve aspect ratio. Original first-party source URL not recovered. |
| Omega | `clients/omega-landscaping/content/google-business-profile/2026-08-17-to-2026-09-06-batch/assets/omega-logo-official.png` | `4FD68A52FF1C7D98C93344E431CF608358CD59A2C72C85AF1BF204331B151CA4`, exactly matches batch `manifest.json:11`. Existing official-logo artwork with blue mountain/Omega and pale concrete/landscaping ring. Preserve original transparency and check contrast. Original first-party URL not recovered. |
| Onsite | `clients/onsite-concrete-landscape/video-factory/references/logo-verified.png` | `E85AC3CD6BEEA35036D9DB3163D168BECDCA05BB16A9E95800357110AB52D9C5`. `reference-manifest.json:7` records previous comparison with client dashboard and official identity. Red/gray Onsite plus white Concrete & Landscape; needs dark backdrop for readable lower text. Original first-party logo URL absent from manifest; other service-image URLs do not establish logo provenance. |

## Existing report renderers

- `scripts/Build-WeeklyClientReports-2026-08-17-to-2026-08-23.mjs`: existing headless Chromium HTML/PDF pipeline, exact local-logo copies, source-data JSON, and screenshots. **Historical client arrays, dates, and metrics are hardcoded. Do not rerun as a new daily report.** It also falls back to a wordmark when logo is missing; disable that fallback for the user's exact-logo contract.
- `scripts/Build-WeeklyClientReports-2026-08-03-to-2026-08-09.mjs`: earlier report layout and explicit KJB logo chain; also historical hardcoded content.
- `scripts/Build-Nexla-WeeklyReport-2026-08-17-to-2026-08-23.mjs`: separate Nexla report, preserving enterprise-specific identity.

Reuse the proven renderer architecture, not historical metric values. Daily input must supply exact account/timezone, complete date window, pull time, source freshness, definition of each event, attribution window/lag, qualified lead and connected-call status, and null for unavailable results. Display counts as integers; do not confuse rounded attributed platform events with unique people. Pending wording: **Conversion reporting is pending validation**.

## Acceptance and limits

Completed: exact local client routing, historical-source inventory, local code observations, three visual logo inspections and hashes, renderer discovery. Pending: every current Google Ads read, current production JS comparison, real-call/form/CRM reconciliation, original web-logo provenance refresh, daily report production/scheduling. No fresh performance numbers were fabricated and no account was changed.

Reusable lesson proposal for Chief: a branded report's `prepared` date and `evidence_mode: read-only` are insufficient freshness proof when its renderer embeds older metrics. Require machine-readable source timestamps and current account read receipts before daily rendering. Evidence: hardcoded August weekly renderer above. Worker made no durable lesson or canonical writes.
