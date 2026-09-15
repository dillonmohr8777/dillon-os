# Client-conversion lane — 2026-09-10 (~15:45 ET)

Lane: client-conversion. Machine: `feeac9f6-8347-4372-8943-e8ab69a3adf0` (DESKTOP-4AHKEC4).
Vault branch context: `cursor/immohrtal-standing-canary-3c2e`.
Hard rules obeyed this pass: **no live campaign mutations**; **never accept Customer Data Terms**; stages/specs only; paths cited.

Priority order (operating plan): **Nexla → Omega → Puttery → Deborah Mara**.

Sources read:
- `System/CONTINUE-HERE-2026-09-10.md` (P3 Nexla)
- `System/MASTER-ORCHESTRATOR.md` Parts V–VII
- `11_Agents/OPERATING-PLAN-2026-09-09.md`
- `System/approval-queue.md` (Nexla / Omega / Puttery rows)
- `01_Clients/Nexla/*`, `01_Clients/Omega Landscaping/*`, `01_Clients/Puttery NYC/*`
- `_os/automation/google-ads-api/pulls/Nexla_*`, `Omega_*` (incl. conversion_actions_config + search-terms)
- `C:\Users\dillo\AppData\Local\Dillon\GoogleAdsProbe\` (`nexla_fix.py`, `nexla_negs.py`, `_analysis_scratch/nexla_terms_summary.txt`)
- `12_Brain/07_Reviews/2026-09-10 - Nexla *.md`, `2026-09-09 - Omega search terms, first audit.md`
- client-operations: `clients/nexla/deliverables/2026-09-10-ads-config/`, `2026-09-09-valid-lead-criteria-and-conversion-config.md`, `2026-09-09-search-campaign-build/`
- client-operations: `clients/omega-landscaping/paid-media/launch-authority.json`
- client-operations: `clients/puttery-nyc/deliverables/2026-09-01-tock-reservation-webhook/PRODUCTION_READINESS_2026-09-01.md`
- client-operations: `clients/deborah-mara/deliverables/*` (**no** `01_Clients/Deborah Mara` vault folder)

---

## Ranked conversion actions needing Dillon yes/no **today**

| # | Client | Ask (yes/no) | Why today | Live mutate if yes? | Cite |
|---|---|---|---|---|---|
| **1** | **Nexla** | **Apply MCP match-type narrowing** (keep thesis terms; switch core MCP/agentic keywords to **exact** + commercial phrase modifiers; do **not** delete the six terms carrying ~$1,169.81 @ 0 conv) | Non-brand CPA ~$4,858; bleed is broad match, not keyword choice | **Yes** (GoogleAdsProbe) | CONTINUE-HERE P3; `12_Brain/07_Reviews/2026-09-10 - Nexla technical corrections.md`; `nexla_terms_summary.txt` |
| **2** | **Nexla** | **Apply Microsoft-Certified-Professional negatives** on non-brand: `sql`, `windows server`, `certification`, `exam`, `mcse` | Account is buying the wrong "MCP" | **Yes** | CONTINUE-HERE P3; MASTER-ORCHESTRATOR staged table |
| **3** | **Omega** | **Apply nine competitor/supplier negatives** on `2853981364` (PMax): timberline landscaping, landscape endeavors, rocky top resources, pioneer sand and gravel, green belt turf farm, all purpose landscaping pueblo west, bear claw landscaping, c and c sand, c&c sand and stone locations | 7/17 "conversions" from people searching other businesses; $388.14 + poison signal | **Yes** — but `launch-authority.json` is still `status:draft`, `approvedBy:null` | `System/approval-queue.md` 2026-09-09 Omega rows; `12_Brain/07_Reviews/2026-09-09 - Omega search terms, first audit.md` |
| **4** | **Omega** | **Ban reporting the raw 17 conversions to David** until reclassified (competitor vs own demand) | Presenting Timberline demand as Omega demand repeats the match-back failure | No Ads mutate; **reporting gate** | approval-queue "do not report the 17 conversions as-is" |
| **5** | **Nexla** | **Create a NEW primary website demo conversion action** (do **not** reuse dead label `lf1HCMiSo_4ZEKXNrbko`); make true `SUBMIT_LEAD_FORM/WEBSITE` biddable only after scoped GTM fires | Custom goal already pointed at `HubSpot-Demo Request` (`7534625037`) on 2026-09-10, but scoped `hubspot-form-success` is **not** live (GTM ws 73 unpublished); old label called dead | **Yes** (new action) + GTM publish gated separately | CONTINUE-HERE; `2026-09-10-ads-config/README.md`; `2026-09-09-valid-lead-criteria-and-conversion-config.md` |
| **6** | **Nexla** | **Hand Jayashree/Dana Enhanced Conversions acceptance** (Goals › Conversions › Settings) — Dillon/agency must **not** click Accept | Customer Data Terms bind the advertiser; standing hard rule | No agent click | `2026-09-10 - Nexla technical corrections.md` §2; CONTINUE-HERE standing rules |
| **7** | **Puttery** | **Approve next production gate** (commercial + credential rotate + durable host + webhook register + one NYC payload) — conversion delivery still blocked | Zero of seven attribution gates cleared; receiver is local-only | No Ads mutate | `01_Clients/Puttery NYC/Client Intelligence Overlay.md`; PRODUCTION_READINESS |
| **8** | **Deborah Mara** | **Send or kill** staged plan email (`STAGING.json` `draft_unsent`; Gmail draft `r6871027211630546402`) and confirm To: `marasurrealestate@` vs `mararealestate@` | ChatGPT ads cannot convert until answer-first pages + form/phone exist; email is the client gate | Email only if named | `clients/deborah-mara/deliverables/2026-09-10-plan-email/STAGING.json` |

**Not a today Ads yes/no (blocked / prepare-only):** GTM workspace 73 publish (consent + **two known defects** in staged work); HubSpot portal `3222786` (never granted — browser was Momentum `50612503` / Jason Fallon); end-to-end form proof (needs business-domain mailbox; form rejects gmail.com); Omega Zapier match-back body parse (approval-queue 2026-09-07); Omega access request still unsent since 2026-07-30.

---

## 1. Nexla (`7917802207`)

### Current conversion diagnosis
- API window **2026-06-01 → 2026-09-09** (`_os/automation/google-ads-api/pulls/nexla-search-terms-2026-06-01-to-2026-09-09.json` + `_analysis_scratch/nexla_terms_summary.txt`): **419 terms · $5,677.77 · 3.00 conv**. Brand (contains "nexla") **$819.75 / 2 conv**; non-brand **$4,858.02 / 1 conv**. **400 zero-conv terms = $4,555.54**.
- UI first-page audit (broader window) in `12_Brain/07_Reviews/2026-09-10 - Nexla search terms, first audit.md`: same shape — brand subsidises the report.
- Core MCP/agentic waste left on purpose (not negated 2026-09-10): e.g. `model context protocol` ~$779.67, `mcp` ~$154, `agentic ai` ~$141, etc. (~$1,169.81+ bundle) — **wrong audience (developers) on broad match**, not a missing negative.
- Conversion actions pull (`Nexla_conversion_actions_config.json`): many REMOVED HubSpot/Salesforce webpage actions; live ENABLED includes `Lead form - Submit`, `HubSpot-Demo Request` (`7534625037`, was Secondary pre-fix), YouTube actions, CRM lifecycle uploads. **Spam training risk** documented: generic `form_submit` + captcha-off historically taught Smart Bidding junk (`2026-09-09-valid-lead-criteria-and-conversion-config.md`).
- **Already applied 2026-09-10** (not staged anymore): 22 off-thesis negatives via probe; custom goal `6458843017` → only `HubSpot-Demo Request`; CRM lifecycle demoted Secondary; 31 paused budgets disarmed to $1/day (`clients/nexla/deliverables/2026-09-10-ads-config/README.md`). Live spend still Brand Exact $25/day + MCP Search $40.75/day.

### Staged-but-unapplied
| Item | State on disk | Ready-to-run mutate script? |
|---|---|---|
| Match-type narrowing (exact + commercial modifiers) | Specified in CONTINUE-HERE / technical corrections / search-campaign-build README ("phrase and exact only") | **No dedicated apply pack found** in GoogleAdsProbe (only diagnosis + `nexla_fix.py` which deliberately **excludes** MCP core terms). Needs a staged mutate script before apply. |
| Microsoft MCP negatives (5 terms) | Specified | Not in `nexla_fix.py` NEGS list — needs pack |
| New conversion action (not `lf1HCMiSo_4ZEKXNrbko`) | Spec conflict: valid-lead doc named that label; CONTINUE-HERE says **do not reuse** it | Create-new; do not revive dead label |
| GTM workspace 73 | Unpublished; 2 defects; consent pending | Publish blocked |
| 3-ad-group MCP RSA rebuild | Draft assets in `2026-09-09-search-campaign-build/` | Hold until GTM + business-email proof |
| Offline MQL/SQL import | Spec obsolete for ConversionUploadService (closed new adopters 2026-06-15) → rewrite to **Data Manager API** | Blocked + rewrite |

### Blockers needing Dillon approval
1. Yes/no on match-type narrowing apply (after script staged).
2. Yes/no on 5 Microsoft-MCP negatives.
3. Yes/no on creating new demo conversion action (new label).
4. Client must accept Enhanced Conversions / Customer Data Terms — **agency must not**.
5. GTM consent + defect fix before any publish approval.
6. Business-domain test mailbox for e2e proof.

### Prepare locally today (no live mutation)
- Write `GoogleAdsProbe` validate-only scripts: (a) keyword match-type updates for MCP/agentic set; (b) 5 Microsoft negatives; (c) conversionAction create payload with **new** label.
- Brand vs non-brand conversion split table for any future client report (do not send without approval).
- Rewrite offline-import plan against Data Manager API (doc only).
- Do **not** publish GTM; do **not** run `nexla_fix.py --apply` again without a new approved list.

---

## 2. Omega Landscaping (`2853981364`)

### Current conversion diagnosis
- Search-terms audit 2026-04-01 → 2026-09-08: **$3,261.67 · 17 conv · $191.86 CPA** — but **`timberline landscaping` alone = 6.00 conv (35%)**; with other competitor/supplier terms, **~7/17 conv are other businesses**.
- Concrete Search terms burned **~$1,113** at $39–54 CPC for **0** conv; low QS penalty.
- Conversion actions pull (`Omega_conversion_actions_config.json`): Contact Us, Calls from ads, Form Submission, Calls from Website, Lead form Submit, plus upload actions `Omega Qualified Lead` / `Omega Won Contract` — **platform counts exist; named-lead match-back does not** (pipeline_state: blocked in overlay).
- Overlay thesis: reconcile Google-counted event → named call/form/CRM before budget/Search changes (`01_Clients/Omega Landscaping/Client Intelligence Overlay.md`).

### Staged-but-unapplied
| Item | State |
|---|---|
| Nine competitor/supplier phrase negatives | In `System/approval-queue.md`; **not applied** (all showed Added/Excluded: None as of audit). No probe apply script found this pass. |
| `launch-authority.json` | `status: "draft"`, `approvedBy: null` — `clients/omega-landscaping/paid-media/launch-authority.json` |
| Outdoor Living LP publish | Approval-queue (preview ready; hold) |
| Zapier notification body parse (named lead) | Approval-queue 2026-09-07; Fagan was only closed loop and is inactive |
| Access request email | Draft unsent since ~2026-07-30 |

### Blockers needing Dillon approval
1. Yes/no apply nine negatives (campaign change under draft launch-authority).
2. Explicit ban on client-facing "17 conversions" until reclass.
3. Access-request send (Wix / Ads / GHL roles verified first).
4. Zapier match-back change — one account at a time, after negatives.

### Prepare locally today (no live mutation)
- Stage validate-only GoogleAdsProbe negative pack for the nine terms (PMax account `2853981364`).
- Build conversion reclass sheet: competitor-brand / supplier / own-brand / unknown from search-terms evidence.
- Pull remaining search-terms pages via API (audit was page 1 of ~22) into `_os/automation/google-ads-api/pulls/Omega_*` — **read-only**.
- Do **not** re-enable `Search_Services_Standard` on current QS.

---

## 3. Puttery NYC

### Current conversion diagnosis
- Engagement is **reservation attribution**, not lead-gen Search. Receiver verified locally (13/13 tests; Windows E2E). **No live booking stream; no verified ad spend source mapped.**
- `business.id = 37824` (group `28086`) is the venue filter. Overlay `pipeline_state: blocked`; paid media blocked until account mapping.

### Staged-but-unapplied
- Production readiness package under `clients/puttery-nyc/deliverables/2026-09-01-tock-reservation-webhook/`.
- Follow-ups to Joe Pedevillano / Laura (Resy) in approval-queue (correct Lauren→Laura).
- Tock credential rotation / revocation still outstanding (security queue; plaintext email exposure).

### Blockers needing Dillon approval (ordered gates)
1. Signed agreement + payment form  
2. Rotate vendor role credential (protected route only)  
3. Approve durable HTTPS host + backup/rollback  
4. Register Reservation Webhook + secure header  
5. One controlled NYC payload (`37824`)  
6. Measurement contract (grain, value, consent, retention)  
7. Map exact GA4 / GTM / Google Ads / Meta / CMS **before** any conversion delivery claim  

### Prepare locally today (no live mutation)
- Diff PRODUCTION_READINESS vs any newer `2026-09-08-tock-integration` notes; refresh gate checklist in vault overlay if stale.
- Draft (do not send) Joe/Laura follow-ups into approval-queue only.
- **Do not** claim ad-platform conversions or live attribution.

---

## 4. Deborah Mara

### Current conversion diagnosis
- **No** `01_Clients/Deborah Mara` folder in the vault. Operating picture + client-operations only.
- Scope: organic/social/GBP + new WordPress site; expanded 2026-08-18 to Meta lead ads, Google Search, **ChatGPT ads testing**. Website **missed 2026-09-01 go-live**.
- Staging site audit: **no lead form, no tappable phone, no email link, ~449 words** — blocker for every paid channel including ChatGPT Ads (`2026-09-09-staging-site-audit.md` addendum: WPForms already installed → placement not build; title still "WordPress Blog").
- ChatGPT ads plan is **build spec only** — no account created, no spend (`2026-09-09-chatgpt-ads-conversion-plan.md`). Spine: four answer-first pages + capture, then context hints.

### Staged-but-unapplied
| Artifact | Status |
|---|---|
| Plan email HTML/TXT + `STAGING.json` | `draft_unsent`, `sent: false`; Gmail draft id present |
| ChatGPT conversion plan | Spec only |
| Staging site fixes (title, form, tel:) | Needs proper WP app-password access (do not use shared Slack creds) |

### Blockers needing Dillon approval
1. Name exact To address and **send** (or discard) plan email.
2. WP Administrator user / app password route via Beth or Muhammad (rotate 2026-07-30 shared GoDaddy/WP creds).
3. Site go-live before ChatGPT/Google/Meta spend.
4. MLS / IDX, Meta+Google Ads access, Chris Mara GBP, CRM attribution — still waiting on client per Slack picture.

### Prepare locally today (no live mutation)
- Keep email staged; do not send.
- Outline four answer-first page briefs from the ChatGPT plan (local markdown only).
- Checklist: Settings→General title fix, WPForms placement, `tel:917.747.5055`, noindex until ready.
- Do **not** create ChatGPT ads account or spend.

---

## Existing pulls inventory (relevant)

Under `_os/automation/google-ads-api/pulls/`:
- **Nexla_*** : campaigns, change_events_25d, conversion_actions_config, device/geo/hist/hour, keywords, LPs, lost IS, QS, ads_strength, plus `nexla-search-terms-2026-06-01-to-2026-09-09.json`
- **Omega_*** : same standard set (no dedicated Omega search-terms JSON filename found alongside Nexla's dedicated pull — UI audit is the cited source)

GoogleAdsProbe live scripts present: `nexla_fix.py` (off-thesis negs; dry unless `--apply`), `nexla_all.py` (budget disarm + keyword ideas; Planner may 403 Explorer), `nexla_negs.py` / `nexla_terms.py` (analysis).

---

## Lane posture

- **Conversions > raw leads** for Nexla/Omega: fix what the algorithm optimises and what gets reported.
- Everything above that mutates Ads stays **validate-only / staged** until Dillon answers the ranked yes/no table.
- Customer Data Terms: **never accept**.
