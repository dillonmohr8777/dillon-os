# Align HCM reporting stack — computer-use audit 2026-07-30

**Summary:** Cloud computer-use hit login walls on HubSpot, GA4, GSC, LinkedIn, and GCP; no Align-authenticated session was available, so no in-account settings were changed.

Portal / property targets (identity not yet verified in-session):
- HubSpot portal **242825734** only (never Momentum **50612503**)
- GA4 web stream **G-0Y6LQTTBRJ**
- Website **alignhcm.com**

Runtime used: Chrome CDP `:9222` (Microsoft Edge binary absent; Playwright MCP Bridge extension not attached; empty cloud Chrome profile). Screenshots under `/opt/cursor/artifacts/align-reporting/`.

## Hard stop (operator gate)

Authenticate Align-only accounts in the shared computer-use browser (or attach desktop Edge with Playwright MCP Bridge to already-logged-in tabs). Complete MFA / passkey / push yourself. Do not paste passwords, tokens, cookies, or recovery codes into chat.

After login, re-run: `node /tmp/align-post-auth-configure.mjs` (script committed beside this handoff as `handoffs/align-reporting-post-auth-configure.mjs`).

## Audit table

| Platform | Exact account/property | Setting or permission | Previous state | Final state | Evidence | Remaining blocker | Exact access Dillon must grant |
|---|---|---|---|---|---|---|---|
| HubSpot | portalId target 242825734 | Session / portal identity | No cloud session | BLOCKED — login wall | `01-hubspot-login.png`; URL `app.hubspot.com/login?loginPortalId=242825734` | No Align HubSpot session | Log in as Align user; complete MFA |
| GA4 | G-0Y6LQTTBRJ / alignhcm.com | Property Admin + reporting | No cloud session | BLOCKED — Google sign-in | `02-ga4-login.png` | No Google session | Sign in to Align Google Analytics account + MFA |
| Search Console | alignhcm.com | Property + HubSpot link check | No cloud session | BLOCKED — Google sign-in | `03-gsc-login.png` | No Google session | Sign in to Align Search Console owner/user + MFA |
| LinkedIn | Align HCM Company Page | Page admin + HubSpot Social analytics | No cloud session | BLOCKED — LinkedIn login | `04-linkedin-login.png` | No LinkedIn session | Sign in with Company Page admin + MFA |
| Google Cloud | Align analytics project (TBD) | GA4 Data API / GSC API / BigQuery | No cloud session | BLOCKED — Google sign-in | `05-gcp-login.png` | No GCP session | Sign in to Align GCP; stop at billing screen if upgrade required |
| Computer-use runtime | Cursor Cloud | Edge + reuse sessions | Requested | Edge missing; Chrome CDP empty profile | `which microsoft-edge` empty; MCP `--extension` timeout | Cannot reuse desktop Edge sessions here | (A) MFA logins in CDP Chrome, or (B) next pass on Align Edge + MCP Bridge |
| HubSpot | connector 16228553 | Claude OAuth reauth (LEAD / MARKETING_EMAIL / campaign+event writes) | REQUIRES_REAUTHORIZATION (2026-07-30 note) | Unverified this session | PR #236 completion handoff | Needs live HubSpot + Claude OAuth | Reconnect from Claude connector side after HubSpot login |
| HubSpot | 242825734 | Private app “Align Codex Attribution Reader” | Not created | Not created (credential boundary) | Prior handoff; no downloadable creds this run | Admin + secure token store | Create private app; store token only in secure store as `ALIGN_HUBSPOT_PRIVATE_APP_TOKEN` |
| LinkedIn via HubSpot | Maher personal profile | Personal-profile organic analytics | Likely unavailable | Platform limitation documented | HubSpot Social product boundary | Cannot solve via HubSpot Company Page connect | Native LinkedIn export: Profile → Analytics (content/followers) CSV for Maher |
| HubSpot | 242825734 | Mass fix ~2,175 historical Offline sources | Offline = record-entry category often | Intentionally not mass-reclassified | Operator instruction | None (policy) | None — backfill only with deterministic evidence |

## Result buckets

### 1. Successfully activated
- None this session (auth hard stop before any setting write).

### 2. Already configured and verified
- Policy preserved: do not mass-reclassify ~2,175 historical Offline records without deterministic evidence.
- Account boundary locked for next pass: HubSpot **242825734** only; never Momentum **50612503**.

### 3. Requires Dillon for MFA or consent
- HubSpot Align login + MFA
- Google (GA4 + Search Console + Cloud) Align login + MFA
- LinkedIn Company Page admin login + MFA
- Attach authenticated Edge/Chrome sessions (desktop Bridge) **or** complete logins in cloud CDP Chrome
- Claude HubSpot connector **16228553** OAuth reconnect
- Codex private app creation + secure token storage (no chat paste)

### 4. Requires a higher HubSpot subscription or administrator permission
- Unknown until login — evaluate Traffic analytics, Social, Attribution, Custom events, Workflows after portal identity proof.
- Prior note: content analytics already worked on Pro/Enterprise; LEAD object read blocked on connector reauth (permission/OAuth, not necessarily plan).

### 5. Requires billing approval
- Unknown until GCP/BigQuery link screen — stop at billing and report exact approval text if shown.

### 6. Platform limitation that cannot be solved through HubSpot
- Maher LinkedIn **personal-profile** reporting: use native LinkedIn Analytics export; HubSpot Social covers Company Page metrics (impressions, clicks, engagement, followers, post performance) when connected.

## Safe next-pass checklist (after auth)

1. Prove HubSpot portal id **242825734** in Settings / account menu before any change.
2. Integrations: GSC property = alignhcm.com; LinkedIn Company Page connected; enable available read-only social analytics; do not post/schedule.
3. Deals pipeline: confirm “Expressing Interest” is open (not closed/lost); fix stage metadata only if it does not rewrite historical stage membership.
4. Attribution: inventory existing custom properties; reuse — no duplicates; never overwrite native Original Source history.
5. Workflows: deterministic populate/associate/confidence only; leave unresolved when evidence insufficient.
6. GA4 stream **G-0Y6LQTTBRJ**: live traffic, enhanced measurement, internal traffic, unwanted referrals, retention 14 months, GSC link, seven attribution dimensions (document names before any rename), `generate_lead` observe-before-key-event.
7. GCP: enable GA4 Data API + Search Console API if existing project and no billing wall; BigQuery link only if no new paid commitment.
8. Verify each connection with a live report/query, not config screens alone.
9. Refresh this audit table with Previous → Final evidence rows.

## Links
- Prior completion context: PR #236 `handoffs/align-guide-attribution-completion-2026-07-30.md`
- Client stub: `01_Clients/Align HCM.md`
- Machine-readable: `/opt/cursor/artifacts/align-reporting/AUDIT.json`
