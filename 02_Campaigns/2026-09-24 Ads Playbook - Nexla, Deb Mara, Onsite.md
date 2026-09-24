---
note_type: plan
status: active
created: 2026-09-24
updated: 2026-09-24
clients: [nexla, deborah-mara, onsite-concrete-landscape]
source_refs:
  - "x.com/lifemaximised/status/2102802935558103146 (the 10-stage Google Ads playbook)"
  - "slack:D0A8UQQ27D1 (Dillon <> Mac Frederick, 2026-09-23)"
  - "slack:#onsite-construction C087GM7SEJF (Gracie, 2026-09-21..23)"
  - "google-ads UI, live read 2026-09-24 ~10:15 ET (Onsite 103-371-5894, Nexla 791-780-2207)"
  - "client-operations/clients/nexla/deliverables/2026-09-16-spend-and-conversion-integrity"
  - "client-operations/clients/deborah-mara/deliverables/2026-09-09-chatgpt-ads-conversion-plan.md"
tags: [campaigns, google-ads, chatgpt-ads, nexla, deborah-mara, onsite, playbook]
---

# Ads playbook → Nexla, Deb Mara, Onsite — 2026-09-24

Today's three priority clients, run through the 10-stage playbook from the X post.
**Nexla gets the Google Ads playbook. Deb Mara and Onsite get ChatGPT Ads.**
Merchant Center (stage 6) is skipped for all three — none of them sell a product feed.

Everything below was read live today unless it says otherwise. **No account was changed.**

---

## Where things stand this morning

**What Codex already did with the playbook.** Nothing client-facing. On 2026-09-23
it applied the post to *Philly Console* (the Philadelphia prospect tool): a
"Prepare search strategy brief" button that runs stages 1–3 as a copyable prompt.
It stated plainly that no ads account data was touched. So this doc is the first
time the playbook meets a real account.

**What Mac said (DM, 2026-09-23).** He approved the Google sign-in so the Momentum
SEO team login (`momentumlocalseo@gmail.com`) got into **OpenAI Ads Manager**.
That login sees two advertisers — Momentum Digital and Florida Wildlife Management —
and **no Deb Mara or Onsite account**. Mac's answer on how to fix that:

> "You can either create their ad accounts within your master Gmail or from their own new accounts."

**Onsite Google Ads — verified off.** `Leads-Performance Max-1` ($5/day) is **Paused**.
Last spend $10.00 on 2026-09-22; nothing since. What you told Gracie on 09-23 is true.
Sep 17–22 total: $32.62, 3 conversions. Some asset groups show disapproved (moot while paused).

**Nexla Google Ads — last 7 days (Sep 17–23):** $209, 71 clicks, 2.19K impressions, $2.94 CPC.

| Campaign | Cost | Clicks | CTR | Note |
|---|---|---|---|---|
| G_US_S_NB_MCP-Agentic | $137.89 | 33 | 1.62% | Down 54% vs prior week. Maximize Clicks as of 09-16 |
| G_US_S_Brand_Exact | $70.97 | 38 | 25.85% | Eligible (Limited). **Ad strength poor** |
| G_US_S_NB_Enterprise-AI-Data_POC | — | — | — | **Draft, never launched** |

---

## Nexla — Google Ads playbook, applied

Nexla sells an enterprise data-integration platform; the live campaign sells
**Nexla MCP Studio** (secure MCP servers for AI agents). That is a B2B demo-request
funnel, so the playbook's e-commerce stages (ROAS, feeds, Shopping) don't apply.
The rest maps cleanly.

### Fix before scaling anything (playbook stages 4 and 9)

The playbook's own rule is *don't scale without a consistent signal*. Nexla has no
trustworthy signal yet. These come first, in order:

1. **Conversion goals.** As of 09-16, four actions were *primary*, including
   **YouTube follow-on views** and **channel subscriptions** — neither is a lead —
   plus a miscategorised Content Download. Primary should be **Lead form submit** and
   **HubSpot demo request** only; everything else secondary. *Re-verify first — this
   may have been fixed since 09-16.*
2. **Negative keywords — the waste is visible today.** The non-brand campaign is
   buying people who are *learning about* MCP, not *buying a platform*. From today's
   search terms:
   - Tutorial / how-to: `how to build a mcp server`, `how to create mcp server`,
     `mcp tutorial`, `mcp server examples`, `build mcp server from scratch`, `how to host an mcp server`
   - Definitional: `what are mcp servers`, `ai mcp meaning`, `mcp server explained`, `what's an mcp server in ai`
   - Free / open source: `free mcp`, `open source mcp servers`, `public mcp servers for testing`
   - Other products' MCPs (developer hobbyists, not buyers): `autocad`, `houdini`,
     `figma`, `playwright`, `blender`-style tool names, `claude code`, `codex`, `vercel`, `github`
   - Typos with no intent: `mpc server`, `mcp ia`

   **Keep** anything that names a use case Nexla sells: `enterprise mcp platform`,
   `mcp server platform`, `mcp data integration`, `mcp connector`, `governed`/`secure` variants.
   Competitor-platform terms (`databricks mcp`, `snowflake mcp`) go to a *separate*
   competitor ad group, not a negative — that is stage 2's validated-angle test.
3. **Bidding.** Google is recommending Maximize Conversions (+7.4%). **Don't accept it
   until step 1 is done** — it would optimise toward YouTube views. After goals are
   clean and there are ~15–30 real lead conversions, move MCP-Agentic to Maximize
   Conversions, then tCPA.
4. **Brand ad strength "poor."** Rewrite the Brand_Exact RSA (stage 5). Brand CTR is
   26% — cheap wins protected by better copy.

### Then build (stages 1–5)

| Stage | For Nexla | Output |
|---|---|---|
| 0 Brain | Already exists — `clients/nexla/` has 271 files. Condense into one brand-brain page: ICP (data/platform engineering leads, AI platform teams), buying triggers, objections (security, governance, lock-in) | `nexla/context/brand-brain.md` |
| 1 Language | Mine Reddit (r/dataengineering, r/LocalLLaMA), HN, GitHub issues, G2 for how buyers describe *governed data for AI agents* | Quote / pain / outcome / angle table |
| 2 Competitors | Ads Transparency Center + landing pages for the MCP-platform and data-integration players. **Competitor list to be built from evidence, not assumed** | 5 validated + 5 white-space angles |
| 3 Keywords | Split into brand / competitor / high-intent platform / problem-aware / comparison / **negatives** (seeded above) | 30-day launch list vs phase 2 |
| 4 Structure | Brand exact · Non-brand MCP platform · **Enterprise-AI-Data (the unlaunched draft)** · Competitor · Remarketing. Each with one KPI that decides scale/hold/cut | Account map |
| 5 RSA copy | 15 headlines / 4 descriptions per ad group, headline 1 matching intent | Staged ads |
| 7 Landing pages | One intent-specific page per ad group instead of `/mcp/servers` for everything | Page briefs |
| 9–10 Audit | Daily 7-vs-7 audit + weekly 7/14/30 scaling plan — needs the API fixed (below) | Recurring report |

**Draft to decide on:** `G_US_S_NB_Enterprise-AI-Data_POC` is sitting unlaunched.
Stage 3/4 should decide whether it launches or gets merged — it is the natural home
for high-intent enterprise terms.

---

## Deb Mara — ChatGPT Ads

A plan already exists: `clients/deborah-mara/deliverables/2026-09-09-chatgpt-ads-conversion-plan.md`.
It is good and should be used, not rewritten. The playbook adds structure around it:

| Stage | Applied |
|---|---|
| 0 Brain | Her credibility facts from the 09-09 plan ($145M+ closed since 2013, RE/MAX), towns (Monmouth, Ocean, Mercer) |
| 1 Language | Real buyer/seller questions about central NJ moves — the questions ChatGPT users actually ask |
| 5 Copy | = the 09-09 plan's **chat card creative** (phase 3) |
| 7 Pages | = the 09-09 plan's **four answer-first pages** (phase 1) |
| 9 Audit | = **cost per genuine conversation**, not cost per click (phase 4) |

**Budget per the 09-09 plan:** $20–30/day, US only, one ad group for 14 days.
(CPC range cited there — $2.50–$8.00 — is from early-advertiser reports, not our data.)
**Fair Housing is non-negotiable** for every ad and targeting choice.

**Blocked on:** the advertiser account doesn't exist (see *Decisions* below).

---

## Onsite — ChatGPT Ads

Gracie has been asking since 09-21, and on 09-23 you told her you hoped to have it
"by tomorrow" — i.e. **today**. She has the 09-22 competitor audit + ChatGPT Ads
outline PDF (six cities, named competitors, CSLB licensing checkpoint).

**The honest blocker is measurement, not the ad account.** The 09-22 audit found
**nine conversion actions all set primary** and **no measurement tag on the ad
landing page** — form submissions never reach any ad platform. A ChatGPT campaign
launched onto that page would be exactly as unmeasurable as the Google one was.

Order: (1) client picks the one primary conversion, (2) landing page access → tag it,
(3) create the advertiser account, (4) launch one ad group, small budget, 14 days.

---

## The tool stack — what we can actually use (checked today)

| Need | Tool | Status today |
|---|---|---|
| Read Google Ads | **In-app browser** (signed in as dillonmohr8777, sees 17 accounts incl. both) | ✅ Works — used for every number above |
| Google Ads API (daily audit, stage 9) | `google-ads` MCP | ❌ `invalid_grant` — refresh token expired; needs re-auth |
| | Composio `googleads` | ❌ 403 `USER_PERMISSION_DENIED` — needs the **manager (login-customer-id)** header the tool doesn't expose |
| | Direct API | ⚠️ The 09-16 Nexla report ran "direct per ACCOUNT-RULES.md"; that file wasn't found today. Your dev token exists — the missing piece is the working refresh token + manager ID. `AppData\Local\Dillon\GoogleAdsProbe\google-ads.yaml` has client/refresh creds but **no developer token or login_customer_id** |
| OpenAI / ChatGPT Ads | Ads Manager **via browser** only | ⚠️ No API confirmed. Treat as a browser-operated platform |
| Slack | Composio `slack` | ✅ Works |
| Gmail, Sheets, Docs, GSC | Composio | ✅ Connected |
| GA4 | `google-analytics` MCP | ✅ Reconnected this session |
| Research (stages 1–2) | Exa, Firecrawl, Tavily (Composio), web search; Ads Transparency Center + Meta Ad Library via browser | ✅ |
| Creative (stage 8) | Higgsfield MCP | ❌ Needs auth. fal.ai / Veo via Composio available |
| Lead quality (Nexla demo → deal) | HubSpot MCP | ❌ Needs auth |

**One fix unlocks stages 9–10 for every Google client:** re-auth the `google-ads` MCP
with the manager ID set. Until then, the daily audit runs through the browser.

---

## Decisions only you can make

1. **ChatGPT Ads account ownership for Deb and Onsite.** Mac's two options:
   - **Under Momentum's master login** — one place to manage, approve and access both
     (the "managed approvals and access" you want). Billing card is a separate question.
   - **Client-owned accounts** — cleaner if either client leaves; more access juggling.

   I'd recommend **master login, client billing**, if OpenAI Ads Manager supports it.
   **You or Mac create the accounts** — I won't create accounts on your behalf; I'll
   prep everything that goes into them.
2. **Nexla negatives + conversion-goal fix** — staged above; say go and I'll prepare
   them as an exact change list for you to apply (or approve applying).
3. **Onsite primary conversion** — the client's call, but it gates everything.

## Draft reply for Gracie (not sent)

> Hi Gracie — quick status. Google Ads are confirmed paused, no spend since the 22nd.
> For ChatGPT Ads we're setting up the account under our managed login now. Before we
> put money behind it, we need the one fix from the audit: choose which conversion counts
> as a lead, and landing page access so we can tag it — otherwise we'd be spending
> without being able to see results. Can you confirm which one should count (form
> submit or call)? Once that's in, we launch a small two-week test.
