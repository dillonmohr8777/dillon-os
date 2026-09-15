---
note_type: capture
status: compiled
created: 2026-09-03
updated: 2026-09-09
captured_at: "2026-09-03T00:00:00-04:00"
source_type: Claude local agent session output
source_url: "file:///c/Users/dillo/AppData/Roaming/Claude/local-agent-mode-sessions/b0f0f864-e564-4653-bfde-c2d7e9ebfcef/08988047-1bb6-44cd-91f8-e75a3a573577/local_61f84efc-d69a-4b22-ad15-bbc3b9defcd9/outputs/nexla-paid-media-plan.md"
source_author: Claude local agent session
verification_status: verified
observed_at: 2026-09-09
tags: [nexla, paid-media, google-ads, draft, approval-gated]
source_refs:
  - "/c/Users/dillo/AppData/Roaming/Claude/local-agent-mode-sessions/b0f0f864-e564-4653-bfde-c2d7e9ebfcef/08988047-1bb6-44cd-91f8-e75a3a573577/local_61f84efc-d69a-4b22-ad15-bbc3b9defcd9/outputs/nexla-paid-media-plan.md"
---

# Nexla paid media plan (draft, not launched)

> Filed into the vault 2026-09-09 by the daily orchestrator. The original
> lived only under `AppData/Roaming/Claude/local-agent-mode-sessions/`, an
> application cache with no backup and no version control. Body below is
> verbatim.

---

# Nexla — Paid Media Campaign Plan (PROPOSAL — NOTHING LIVE)

**Prepared for:** Dillon Mohr, Momentum 360
**Date:** September 3, 2026
**Status:** 🔴 Draft for review. No campaign has been created, launched, or funded. No ad account has been connected.

---

## 0. Read this first

**Nothing was launched.** I did not create, enable, or fund anything. Three independent reasons:

1. Launching commits your (or your client's) real money and needs your explicit per-campaign approval with the budget stated plainly.
2. The AdWhispr connector has **zero connected ad accounts**, no saved brand, and no Nexla brand record. Campaign launching there is a paid feature. Nothing could have gone live through that path regardless.
3. **You already have a live Nexla Google Ads account with 36 campaigns running.** Adding campaigns to a mature account without reading its existing structure risks budget contention and search-term cannibalization. That review has not happened yet (see §9, Blocker 1).

**Cannabis check: clears.** Nexla is enterprise data-integration / AI-agent infrastructure — nothing like Bridge. No restricted-vertical policy issue on Google, Meta, or TikTok. This plan is not constrained by ad-platform vertical bans.

---

## 1. What "Nexla" resolved to

Nexla is **not** in any of your connected client or brand records. I found it two ways:

| Source | Finding |
|---|---|
| Your screen | Google Ads account titled **"Nexla"**, 36 campaigns, live spend |
| nexla.com (fetched) | Enterprise data platform for AI agents — ETL/ELT/reverse-ETL, MCP servers, 1000+ connectors |
| AdWhispr brand search | No "Nexla" record. Nearest match was two unrelated "Nexa Solutions" FB pages — **not** the same company |
| Your client/brand records | Only "Dillon's Organization". No Nexla entry |

**Confirm before I go further:** is Nexla a new Momentum client, an account you've been given access to, or something else? It isn't in your CRM-side records, so I don't know the engagement shape, who approves spend, or whether you own the account or are a delegated manager.

### Observed account state (from your screen, filtered view)

- **36 campaigns**, 2 filters applied
- **Last 7 days:** 155 clicks · 14.7K impressions · **$1.61 avg CPC** · ~1.05% CTR
- Implied spend ≈ **$250/week (~$36/day)** — but this is a *filtered* view, so it is **not** verified total account spend
- Naming convention in use: `G_US_S_NB_ETL-Pipeline` → `Google_US_Search_NonBrand_Theme`
- Account diagnostics flagging: **"Ad strength is poor"** on at least one recent campaign, plus a second campaign issue

---

## 2. Objective

**Primary conversion:** Demo request (`nexla.com/demo/`)
**Secondary:** Express.dev free-trial signup (self-serve, lower friction, faster feedback loop)

**Recommended campaign objective:** Google Ads → *Leads*, optimizing to a single primary conversion action.

**Rationale:** Nexla sells an enterprise platform with a real sales motion (site cites 1–2 week simple deployments, 4–8 weeks complex enterprise). That is a sales-led purchase, not a self-serve checkout. Optimizing to demo requests matches the actual revenue path. Express.dev free trial is the useful secondary because it generates volume fast enough to give smart bidding a signal while demo volume is still thin.

⚠️ **Do not set both as primary.** Two primary conversions with wildly different values will corrupt bidding. Pick demo as primary; mark trial as secondary/observation.

---

## 3. Platform recommendation

### ✅ Google Search — yes, primary. Put the money here.

The buyer for a data-integration platform searches with explicit intent ("fivetran alternative", "informatica replacement", "cdc pipeline tool"). That intent is capturable and already proven in the account.

**The specific opportunity: competitor conquest.** Nexla has already built and published comparison landing pages for:

- `nexla.com/nexla-vs-fivetran`
- `nexla.com/compare/nexla-vs-informatica/`
- `nexla.com/compare/nexla-vs-airbyte/`
- `nexla.com/compare/nexla-vs-composio/`
- `nexla.com/compare/nexla-vs-glean/`

This is the highest-leverage finding in this document. **The landing pages already exist**, so competitor-conquest campaigns have near-zero content lift — the usual blocker on this play is already cleared. Message match is exact: someone searching "nexla vs fivetran" lands on the page built for that query.

### ⚠️ LinkedIn — strong fit, but out of scope here

Best-in-class B2B targeting for this ICP (Head of Data Engineering, Data Platform Lead, CDO). Nexla's own case studies name exactly these titles. **But** there is no LinkedIn Ads connector in this session, so I cannot configure or verify it. Flagging as a recommendation only.

### ❌ Meta — not recommended

No policy block (this isn't cannabis). It's a targeting-efficiency problem: enterprise data-infrastructure buyers are a tiny, title-specific audience, and Meta's interest targeting can't isolate "person who owns the data pipeline budget at a 2,000-person insurer." Money is better spent on Search intent.

### ❌ TikTok — not recommended

Wrong audience entirely for enterprise data infrastructure. No serious case for it.

---

## 4. Audience & targeting

**ICP (grounded in Nexla's own published case studies and industry pages):**

| Dimension | Detail |
|---|---|
| Titles | Data Engineering Manager, Director of Data Engineering, Head of Data Management, CTO, CIO, VP Product, BI Manager, FP&A Lead |
| Company size | Mid-market → enterprise (named customers: Instacart, Glovo, Poshmark, Bloomreach, Marchex, Kargo, Arcadia) |
| Industries | Financial services, insurance, healthcare/life sciences, government, retail/ecommerce, asset management |
| Trigger | Replacing brittle custom ETL; onboarding B2B partners; making data agent-ready for AI initiatives |

**On Google Search, targeting is the keyword.** Audience signals are secondary. Recommended layering:

- **Observation (not targeting) audiences first:** in-market for Data & Analytics Software, customer-match list from CRM closed-won, site visitors. Observe for 30 days, then bid-adjust on evidence.
- **Exclude:** job seekers (add negatives — see below), students, existing customers (upload suppression list).

⚠️ **Critical negative keyword list** — the keyword tooling showed this space is dense with career/education intent that will burn budget:

```
jobs, salary, career, certification, course, tutorial, free,
resume, interview questions, training, what is, meaning,
open source, github, download, reddit
```

---

## 5. Geography

**Recommended:** United States only for the new campaigns.

Reasons: existing account convention is already `G_US_*`; Nexla's compliance positioning (SOC 2 Type II, HIPAA) is US-enterprise-oriented; and adding geos before the US structure proves out just dilutes the learning signal.

**Setting:** Target *Presence* ("people in or regularly in your targeted locations") — **not** "presence or interest." The default catches people merely searching about the US and wastes spend.

**Later expansion candidates** (post-proof, not now): UK, Canada, DACH, Australia.

---

## 6. Budget

⚠️ **The CPC assumption below is unverified.** The keyword research tools in this session returned off-target results for this vertical (see §10) — I could not retrieve real CPC or volume for enterprise data-integration terms. The $12 figure is a placeholder based on adjacent B2B SaaS norms, **not retrieved data**. The observed $1.61 account CPC is a *blended, filtered* number that almost certainly includes cheap brand traffic, so it is not a safe planning input for non-brand competitor terms.

**Pull real numbers from Keyword Planner inside the account before approving any budget.**

### Scenario math (assumptions labeled)

| Input | Value | Source |
|---|---|---|
| Non-brand/competitor CPC | ~$12 | ❌ **Assumption** — must verify |
| Landing page → demo CVR | 3% | ❌ **Assumption** — B2B paid search typical range 2–4% |
| Implied CPA | ~$400/demo | Derived |

| Tier | Daily | Monthly | Est. demos/mo | Assessment |
|---|---|---|---|---|
| Light test | $150 | ~$4,500 | ~11 | Below smart-bidding threshold. Use Manual CPC or Maximize Clicks |
| **Recommended** | **$400** | **~$12,000** | **~30** | Hits the ~30 conv/mo smart bidding needs to learn |
| Aggressive | $750 | ~$22,500 | ~56 | Only after the $400 tier proves CPA |

### 💰 My recommendation

**$400/day ($12,000/month) split across the competitor-conquest campaigns, run for a 60-day initial flight (~$24,000 total commitment).**

Why $400: Google's smart bidding needs roughly 30 conversions per month to exit the learning phase and bid competently. Below that it is guessing with your money. $150/day at these assumptions produces ~11 demos/month — you'd pay for traffic *and* get bad bidding. If $12,000/month isn't available, **run the light tier on Manual CPC instead**, and don't expect smart bidding to work.

**This is a recommendation, not an authorization.** I have not committed a cent. Tell me the real number you're willing to spend and I'll rebuild the math around it.

---

## 7. Bid strategy

**Phase 1 (weeks 1–4): Maximize Clicks with a CPC ceiling.**
No conversion history exists on these new campaigns. tCPA with no data will either underspend to zero or overspend wildly. Cap the CPC so you can't get surprised.

**Phase 2 (weeks 5–8): Maximize Conversions**, once 15–30 conversions have accumulated.

**Phase 3 (week 9+): Target CPA**, set at the *actual* observed CPA from phase 2 — not at a hoped-for number. Setting tCPA below what the auction really costs is the single most common way these campaigns quietly stop serving.

---

## 8. Campaign structure, creative & landing pages

Naming follows the existing account convention (`G_US_S_NB_ETL-Pipeline`).

### Campaign A — `G_US_S_COMP_Conquest` (priority)

Ad groups, each mapped to its existing comparison page:

| Ad group | Landing page |
|---|---|
| `Fivetran` | nexla.com/nexla-vs-fivetran |
| `Informatica` | nexla.com/compare/nexla-vs-informatica/ |
| `Airbyte` | nexla.com/compare/nexla-vs-airbyte/ |
| `Composio` | nexla.com/compare/nexla-vs-composio/ |
| `Glean` | nexla.com/compare/nexla-vs-glean/ |

Keyword pattern per ad group: `[brand alternative]`, `[brand vs nexla]`, `[brand competitors]`, `"brand pricing"` — phrase and exact only, no broad match at launch.

⚠️ **Trademark rule:** you may bid on competitor names, but you may **not** use them in ad text. Google will disapprove it and the competitor can file a complaint. Headlines below avoid competitor names in copy.

### Campaign B — `G_US_S_NB_AI-Data-Layer`

Nexla's current positioning is "Data Layer for Enterprise AI" / "Enterprise-grade Data Platform For Agents." Themes: agent data pipelines, MCP servers, RAG data prep, context layer.
**Landing page:** nexla.com/generative-ai/ or nexla.com/mcp-studio/

⚠️ Check for overlap with the existing 36 campaigns before building this one.

### Draft RSA copy (character counts verified)

**Headlines (≤30 chars):**

- More Than ELT Pipelines (23)
- 1000+ Enterprise Connectors (27)
- Beyond Batch Analytics (22)
- Deploy in Days, Not Months (26)
- SOC 2 Type II Compliant (23)
- Gartner-Recognized Platform (27)
- Any Source. Any Destination. (28)
- ETL, ELT and Reverse ETL (24)
- Book a 30-Minute Demo (21)
- Rated 4.9/5 on Gartner PI (25)

**Descriptions (≤90 chars):**

- Any data, any source, any destination. ETL, ELT and reverse ETL on one platform. (79)
- Purpose-built for AI agents, not just dashboards. Book a 30-minute technical demo. (81)
- 1000+ connectors, real-time context and enterprise governance. SOC 2 Type II. (76)
- Glovo cut partner integration from 6 months to 3-5 days with Nexla. See how. (75)

**Sitelinks:** Pricing · Demo Center · Connectors Directory · Customer Case Studies
**Callouts:** SOC 2 Type II · HIPAA & GDPR · 1000+ Connectors · Gartner Recognized

⚠️ **All copy needs client sign-off before it runs.** See Blocker 4 — there is a factual inconsistency on Nexla's own site about the connector count.

---

## 9. 🚧 Blockers — must be cleared before anything launches

| # | Blocker | Why it blocks | Owner |
|---|---|---|---|
| **1** | **Existing 36 campaigns not audited** | New campaigns may compete with existing ones in the same auction, bidding your own budget up. I could not read the account (page read timed out) and won't click around a live spending account without your go-ahead. | Dillon / me with approval |
| **2** | **Confirm the Nexla relationship** | Not in your client records. Need to know who owns the account, who approves spend, and whether Momentum has management rights. | Dillon |
| **3** | **Conversion tracking unverified** | GTM container `GTM-K7B389B` is live on nexla.com, but I have **not** verified a demo-request conversion action exists, fires correctly, and is imported into Google Ads. **Optimizing to a broken conversion wastes 100% of spend.** Verify before any budget moves. | Dillon |
| **4** | **Connector count claim conflicts** | nexla.com says **1000+ connectors** in stats/nav but **700+** in the FAQ and Microsoft partnership copy. Ad copy must not state a number the client can't stand behind. Get the approved figure. | Client |
| **5** | **No budget authorized** | §6 is a recommendation. Nothing is approved. Needs explicit sign-off with a stated number. | Dillon |
| **6** | **No ad account connected** | AdWhispr has zero connected accounts and launching is a paid feature. Connecting requires your explicit approval — I have not done it. | Dillon |
| **7** | **Competitor CPC/volume unverified** | Research tools failed for this vertical (§10). Budget math rests on assumptions. Pull Keyword Planner data from inside the account. | Dillon / me with access |
| **8** | **"Ad strength: poor" flagged** | The account is already flagging creative quality on existing campaigns. Worth fixing before adding more — it suppresses impression share. | Dillon |

---

## 10. Where the research fell short — read this before trusting §6

I want to be straight about what is and isn't grounded here.

**What is grounded:** everything about Nexla's positioning, products, comparison landing pages, customer proof points, compliance certifications, industries, and conversion paths — all retrieved from nexla.com. The account performance figures are read directly off your screen. The competitor-conquest recommendation rests on landing pages I verified exist.

**What is not grounded:**

- **Keyword volumes and CPCs — no usable data.** The keyword tools returned nonsense for this vertical. Seed "etl tool" returned *"tpms tool," "metabo tools," "tft tools," "autel tpms tool"* — automotive and gaming hardware. Seed "data integration platform" returned *"data analyst jobs," "data science python," "google data analytics certification"* — careers and education. The tools are doing fuzzy string matching, not understanding the B2B data-infrastructure space. **I did not use any of it**, and no number in this plan comes from it.
- **Competitor ad creative — not retrieved.** The competitor-research call was declined in session. Competitor angles here are inferred from Nexla's own comparison pages, not from anyone's actual running ads.
- **Existing campaign structure — not read.** The browser page read timed out.
- **All budget figures in §6 are scenario math on labeled assumptions**, not retrieved benchmarks.

The strategy (Search-primary, competitor conquest, demo as primary conversion) is sound on the grounded evidence. **The numbers are not yet trustworthy** and shouldn't be approved as-is.

---

## 11. Recommended next steps, in order

1. Confirm what Nexla is to you and who approves spend (Blocker 2)
2. Audit the existing 36 campaigns for keyword and budget overlap (Blocker 1)
3. Verify the demo conversion action fires and imports correctly (Blocker 3)
4. Pull real Keyword Planner CPC/volume from inside the account (Blocker 7)
5. Rebuild §6 budget math on real numbers
6. Get client sign-off on ad copy and the connector-count claim (Blocker 4)
7. **Then** — and only then — decide on launch, with a stated budget

---

*No campaigns created. No spend committed. No ad accounts connected.*
