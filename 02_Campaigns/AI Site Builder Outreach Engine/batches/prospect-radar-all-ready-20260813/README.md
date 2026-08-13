# Prospect Radar all ready release

Date: 2026-08-13 ET
Client: `momentum-360`
Program: `AI Tech News` / `AI Site Builder Outreach Engine`
Purpose: one private, callable business inventory for Jesse's individual call workflow

## Organized inventory

- 245 total saved routes
- 238 canonical callable businesses
- 5 duplicate aliases redirected to canonical sites
- 2 invalid or closed prospects excluded from the call list
- 238 phone records with a source or verification statement
- 34 of 34 previously challenge-blocked contact sources corroborated against current indexed evidence
- WJA Landscaping corrected to the current official phone, `(267) 278-9754`
- 238 rows in the shared `JESSE CALL SHEET` tab
- `mailReady` remains `hold`; no prospect outreach was sent or automated

Aliases:

- `frederick-oster-fine-violins` to `oster-fine-violins`
- `jarman-sales-service` to `jarman-hvac`
- `l-a-verruni-landscaping` to `verruni-landscaping`
- `maclaren-kitchen-bath` to `maclaren-kitchen-and-bath`
- `pipe-xpress-inc` to `pipe-xpress`

Exclusions:

- `pier-6`: the saved identity resolves to a federal Ready Reserve Force page, not a callable individual business
- `the-little-gym`: the saved Doylestown and Warrington location route is stale and the location is closed

## Delivery

- Production review hub: <https://momentum-prospect-radar-next20-2026-08-11.netlify.app>
- Exact existing Netlify site ID: `3cf338d4-6813-4712-a6dc-d27e8778cae9`
- Production deploy ID: `6a7ddc8298c6f14bc5c46f26`
- Jesse's existing shared spreadsheet: <https://docs.google.com/spreadsheets/d/1U6qB7EWRL7DRXMK46W7-KLhDYoVXV4Q-9rpC14qMTlo/edit>
- Added tab: `JESSE CALL SHEET`
- Mac reply draft: existing draft `r4813270720691927472`, same Gmail thread `19f53ea1e09a2443`, current message `19ffba986ba99ca1`, updated and unsent

## QA evidence

- Local Playwright: 238 of 238 callable routes passed
- Responsive renders: 714 of 714 passed at 390 by 844, 850 by 1000, and 1440 by 1000
- Hub renders: 3 of 3 passed
- Alias and exclusion redirects: 7 of 7 passed
- Production page readback: 238 of 238 passed
- Production local assets: 2,131 of 2,131 passed
- Production hub: passed
- Contact source adjudication: 34 of 34 passed, 0 unresolved
- Representative desktop and mobile screenshots: 26
- Full local report: `C:\Users\dillo\Documents\Codex\work\prospect-radar-all-245-20260813\FULL-QA.json`
- Full production report: `C:\Users\dillo\Documents\Codex\work\prospect-radar-all-245-20260813\LIVE-READBACK.json`
- Contact source report: `C:\Users\dillo\Documents\Codex\work\prospect-radar-all-245-20260813\CONTACT-SOURCE-VALIDATION.json`
- Evidence manifest: 33 files, SHA256 `857ddf374191cbd7aa130e154668d13a5c731a6215ecada6435113a08fb77c18`

This evidence establishes private sales call readiness. It does not assert that 238 independent client sites are approved final production designs. The site factory's independent different-identity review gate was not invoked in this run, so any business that wants to adopt a concept still receives its own final brand, accessibility, content, form, analytics, and client approval review before production transfer.

## Regeneration

1. Assemble the consolidated source release with `_os/automation/bin/assemble-all-sites-release.ps1`.
2. Build the `next10` and `trio` source packages under `.release-build`.
3. Run `prepare-all-sites-ready.mjs` to apply the contact policy, rebuild shared assets, generate redirects, and create the call inventory.
4. Run `full-qa.mjs` for the three-viewport browser gate.
5. Deploy only to the exact mapped existing Netlify site.
6. Run `live-readback.mjs` against the production URL.
7. Read back the shared call sheet and the Gmail draft after each write.
