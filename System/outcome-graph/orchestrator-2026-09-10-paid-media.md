# Orchestrator — paid media — 2026-09-10

Read-only analyst pass. **No campaign mutations. No spend changes.** Search-terms first.

**Working clock:** America/New_York (ET). Fresh API pulls ~15:40 ET 2026-09-10. Morning bulk pulls ~10:16–10:18 ET 2026-09-10 under `_os/automation/google-ads-api/pulls/`. Long-window Nexla search terms pulled ~09:43 ET 2026-09-10.

**Auth:** GoogleAdsProbe at `C:\Users\dillo\AppData\Local\Dillon\GoogleAdsProbe\` — direct customer queries only, no `login-customer-id`. Never queried `7214914099`. Shared CID `6275014654` reported campaign-separated only.

**Client-ops paid-media roster (from `System/operating-status.md` + live Ads):** KJB, Replenish, Fresh Blends (paused unless live), Omega, Onsite. Meta Shadow off / not in this Google pull. Nexla is live Ads spend outside that short roster note but is P3 in CONTINUE-HERE.

---

## 1. Nexla `7917802207` — SEARCH TERMS FIRST

### Long window (clicks>0) 2026-06-01 → 2026-09-09
- **Source:** `_os/automation/google-ads-api/pulls/nexla-search-terms-2026-06-01-to-2026-09-09.json` (also `GoogleAdsProbe\nexla-terms.json`) — API pull timestamp ~09:43 ET 2026-09-10.
- **419 terms · 1,203 clicks · $5,677.77 · 3.00 conversions.**
- **Brand** (term contains `nexla`): $819.75 / **2.00** conv (~$410 CPA).
- **Non-brand:** $4,858.02 / **1.00** conv (~$4,858 CPA). Only winner: `a i` ($13.85 / 1.00).
- **Waste:** 400 zero-conv, not-EXCLUDED terms = **$4,555.54** (80% of that pull’s spend).
- **Top non-brand waste:** `model context protocol` $779.67; `etl` $241.24; `mcp` $154.29; `unified data platforms` $152.21; `agentic ai` $141.14; `etl tools` $69.06; `model context protocol mcp` $67.94; `ai integration` $60.24; `mcp server` $53.80.
- **Six MCP/agentic thesis terms (exact):** $1,169.81 @ **0.00** conv — leave live per CONTINUE-HERE; **narrow match type**, do not delete.
- **Microsoft-cert bleed** (sql / windows server / certification / exam / mcse substring hits): 20 terms, **$118.07**, all 0 conv — negatives still needed.
- Audit narrative: `12_Brain/07_Reviews/2026-09-10 - Nexla search terms, first audit.md`.

### Recent 7d (2026-09-03 → 2026-09-09) + yesterday delivery
- **Source:** `pulls/Nexla_search_terms_2026-09-03_to_2026-09-09.json`, `pulls/Nexla_campaign_delivery_2026-09-09.json` — fresh API ~15:40 ET.
- **7d:** 34 terms · 68 clicks · **$241.55 · 0.00 conv.** Brand ~$46.58 / 23 clk / 0c; non-brand **$194.97 / 45 clk / 0c**.
- **7d non-brand waste leaders:** `mcp server` $13.11; `mcp protocol` $10.21; `free mcp servers` $9.17; `mcp inspector` $8.59; `mcp infrastructure` $7.04; plus Claude/WordPress/Playwright MCP developer queries.
- **Yesterday 2026-09-09:** `G_US_S_NB_MCP-Agentic` ENABLED $40.75/d → **11 clk · $61.44 · 0c**; `G_US_S_Brand_Exact` ENABLED $25/d → **9 clk · $15.18 · 0c**. Live spend is still almost entirely MCP developer bleed + brand.

### Live structure (read ~15:40 ET)
- Only **2 ENABLED** campaigns: Brand Exact $25/d + MCP-Agentic $40.75/d. `aws` and `Demand Gen` paused at **$1/d** (disarmed). Live status: `pulls/Nexla_campaigns_live_2026-09-10.json`. Morning snapshot: `pulls/Nexla_campaigns_all_status.json` (~10:16 ET).

### Conversion goals (read ~15:40 ET)
- Enabled actions: `pulls/Nexla_enabled_conversion_actions_2026-09-10.json`.
- `HubSpot-Demo Request` (WEBSITE / SUBMIT_LEAD_FORM): **primaryForGoal=true** but **`includeInConversionsMetric=false`**.
- YouTube follow-on views + channel subscriptions: **includeInConversionsMetric=true** (still in the conversions metric).
- Customer/campaign conversion goals: **SUBMIT_LEAD_FORM / WEBSITE `biddable` not True** (API returns null/false); only account-level YouTube categories showed `biddable=true` on customer_conversion_goal. Files: `pulls/Nexla_customer_conversion_goals_2026-09-10.json`.
- Do **not** reuse dead label `lf1HCMiSo_4ZEKXNrbko`.

### Nexla staged actions — ready for Dillon approval (NOT applied this pass)
1. **Match-type narrowing** on the six thesis terms ($1,169.81 @ 0c): move off broad → exact `[model context protocol]` plus commercial phrase modifiers (`"mcp enterprise"`, `"agentic ai platform"`, `"enterprise model context protocol"`, `"agentic data integration"`). Spec: `12_Brain/07_Reviews/2026-09-10 - Nexla technical corrections.md` §3. Unapplied.
2. **Add phrase negatives** for Microsoft-cert confusion: `sql`, `windows server`, `certification`, `exam`, `mcse` (on non-brand / MCP campaign). Evidence: $118.07 long-window bleed in search-terms pull.
3. **Make SUBMIT_LEAD_FORM / WEBSITE biddable** for live campaigns; ensure HubSpot-Demo Request (or a **new** WEBSITE lead action) is what Smart Bidding optimizes — and flip `includeInConversionsMetric` so YouTube engagement is not the conversions metric. Create a **new** conversion action if needed; **never** revive `lf1HCMiSo_4ZEKXNrbko`.
4. Already done earlier today (do not re-do): 22 off-thesis negatives on campaign `23705317332` + budget disarm of paused high-day budgets (`12_Brain/07_Reviews/2026-09-10 - Nexla Ads configuration.md`).

---

## 2. Omega `2853981364`

### Search terms
- **Prior audit (UI, 2026-04-01→2026-09-08):** `12_Brain/07_Reviews/2026-09-09 - Omega search terms, first audit.md` — `timberline landscaping` 6/17 conversions; concrete terms ~$1,113.75 @ 0c; **nine** competitor/supplier negatives still approval-gated in `System/approval-queue.md`.
- **Fresh 7d 2026-09-03→09:** `pulls/Omega_search_terms_2026-09-03_to_2026-09-09.json` — 7 terms · 8 clicks · **$62.21 · 0c**. All through `Search | High Intent | Colorado Springs | 2026-07-30`. Notable: `cutting edge landscape services`, `all do landscape` look like **other businesses** (same competitor pattern); still not negated in this window.
- **Winners (7d):** none.
- **Yesterday:** ENABLED High Intent Search $50/d → **4 clk · $30.87 · 0c** (`pulls/Omega_campaign_delivery_2026-09-09.json`). PMax still PAUSED $50/d.

### Live (~15:40 ET)
- Only High Intent Search ENABLED. Paused armed: Momentum Call $95.11/d, Search_Services_Standard $70/d, PMax $50/d, snow/hardscape $50/d. `pulls/Omega_campaigns_live_2026-09-10.json`.

---

## 3. Onsite `1033715894`

- **7d search terms:** zero clicked terms (`pulls/Onsite_search_terms_2026-09-03_to_2026-09-09.json`).
- **Yesterday delivery:** $0 across all campaigns (`pulls/Onsite_campaign_delivery_2026-09-09.json`).
- **ON FIRE / status flip:** morning `Onsite_campaigns_all_status.json` (~10:16 ET) showed LSA + Solano Search **ENABLED**; live re-read ~15:40 ET shows **ALL PAUSED** including `Search | High Intent | Solano County | 2026-07-30`, LSA, and new `Onsite | Search | Concrete | Vacaville | 2026-09-10` ($15/d). File: `pulls/Onsite_campaigns_live_2026-09-10.json`. No mutations by this analyst — flag for Dillon: who paused, and is Vacaville meant to stay draft?

---

## 4. KJB `8145506229`

- Both campaigns **PAUSED** (PMax Campaign #1 $20/d; Search Local Bridal Philadelphia $20/d).
- 7d search terms: **0**. Yesterday: **0**. Live: `pulls/KJB_campaigns_live_2026-09-10.json`. Keyword metrics YTD file exists (`KimberlyJames_keyword_metrics_2026.json`, ~10:18 ET) but account is not delivering now.

---

## 5. Replenish / Fresh Blends shared `6275014654` — campaign-separated only

**Never account-totaled.** Classification per `GoogleAdsProbe/ACCOUNT-RULES.md`.

| Brand | Live status (~15:40 ET) | Yesterday 2026-09-09 | 7d search terms |
|---|---|---|---|
| **Fresh Blends** | All 4 Ice Box PMax **PAUSED** | $0 | none |
| **Replenish** | 9 PMax **ENABLED** @ $16.67/d each (incl. Pampano, Howard, Boca, Coral Springs, Miami 56, Carmel Mountain, Solana Beach, Torrey Del Mar, Miramar) | **$0 / 0 clk** despite ENABLED | none |
| **unknown** | none observed in live list | — | — |

Sources: `pulls/Replenish_FreshBlends_campaign_delivery_2026-09-09.json`, `pulls/Replenish_FreshBlends_search_terms_2026-09-03_to_2026-09-09.json`, `pulls/Shared_campaigns_live_2026-09-10.json`, morning `Replenish_FreshBlends_campaigns_all_status.json`.

**Note:** Replenish ENABLED-but-silent matches historical billing/payment block pattern in approval-queue — not re-diagnosed here beyond $0 delivery. Campaign-name allowlist for Pampano/Howard still contested per approval-queue 2026-09-09 item; this pass treated both as Replenish per ACCOUNT-RULES tokens.

---

## 6. Anything on fire (priority)

1. **Nexla MCP-Agentic** still spending (~$61 yesterday, ~$195 non-brand / 7d) into developer MCP queries @ **0 conversions** while match-type narrowing + cert negatives sit **unapplied**.
2. **Nexla conversion metric / biddable goals:** HubSpot-Demo Request excluded from conversions metric; YouTube included; SUBMIT_LEAD_FORM/WEBSITE not biddable=True — Smart Bidding story is still wrong.
3. **Onsite fully paused** this afternoon after morning ENABLED snapshot — delivery dark; confirm intent.
4. **Omega competitor negatives** (9 terms) still unapproved; 7d still shows other-business queries.
5. **Replenish ENABLED / $0** — silent live campaigns need billing/serving check (no mutation).

---

## 7. Paths index (cite)

| Artifact | Path | Timestamp (ET) |
|---|---|---|
| CONTINUE-HERE | `System/CONTINUE-HERE-2026-09-10.md` | 14:06 |
| Nexla long search terms | `pulls/nexla-search-terms-2026-06-01-to-2026-09-09.json` | 09:43 |
| Nexla/Omega/Onsite/KJB/Shared 7d terms | `pulls/*_search_terms_2026-09-03_to_2026-09-09.json` | ~15:40 |
| Yday campaign delivery | `pulls/*_campaign_delivery_2026-09-09.json` | ~15:40 |
| Live campaign status | `pulls/*_campaigns_live_2026-09-10.json` | ~15:40 |
| Morning bulk pulls | `pulls/*_campaigns_all_status.json`, keyword/geo/etc. | 10:16–10:18 |
| Nexla conv actions/goals | `pulls/Nexla_enabled_conversion_actions_2026-09-10.json`, `Nexla_customer_conversion_goals_2026-09-10.json` | ~15:40 |
| Nexla audits | `12_Brain/07_Reviews/2026-09-10 - Nexla search terms, first audit.md`, `... technical corrections.md`, `... Ads configuration.md` | 09:xx–11:xx |
| Omega audit | `12_Brain/07_Reviews/2026-09-09 - Omega search terms, first audit.md` | 09-09 |
| Approval queue (Omega negs etc.) | `System/approval-queue.md` | various |

Analysis scratch (local probe, not vault canon): `C:\Users\dillo\AppData\Local\Dillon\GoogleAdsProbe\_analysis_scratch\`.

---

**End.** No mutations performed. Nexla staged items above await explicit Dillon approval before any GoogleAdsProbe `--apply`.
