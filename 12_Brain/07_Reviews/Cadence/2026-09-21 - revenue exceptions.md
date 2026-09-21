---
note_type: review
status: active
date: 2026-09-21
updated: 2026-09-21
cadence: weekly
job: revenue-exceptions
tags:
  - cadence
  - revenue
  - reconciliation
  - momentum
source_refs:
  - client-operations/registry/clients.json
  - "%LOCALAPPDATA%/Dillon/GoogleAdsProbe/ (FAILED this run, invalid_grant)"
  - 12_Brain/07_Reviews/Cadence/2026-09-17 - lead triage.md
  - System/approval-queue.md
---

# Revenue exceptions, 2026-09-21

**Read only. Nothing was sent to a client. No campaign was changed.**

Reconciliation window requested: **2026-09-14 to 2026-09-21**, the last 7 days.

## The headline is the reconciliation itself

**Three of the four required sources could not be read this run.** No client's
numbers can be reconciled for the last 7 days, because for the last 7 days there
is almost nothing measured to reconcile.

| source | required by the job | state this run |
|---|---|---|
| SPEND | Google Ads probe, exact CID and period | **UNAVAILABLE.** `google-ads.yaml` refresh token returns `invalid_grant`. `authorize.py` needs a human browser consent. The registered `google-ads` MCP server is also down (`EUNKNOWN: uv_spawn`), so there is no second route. |
| LEADS | named leads from lead triage reports | **PARTIAL.** Latest triage report is `2026-09-17 - lead triage.md`. It covers 2026-09-16 08:08 to 2026-09-17 08:08 only. **2026-09-18, 09-19, 09-20 and 09-21 have no triage report at all.** Four of the seven days are unmeasured. |
| CRM | HubSpot | **UNAVAILABLE.** The HubSpot connector requires OAuth authorisation and this is a non-interactive scheduled run, so the flow cannot be completed here. |
| PAYMENT | invoice or payment state evidenced in the vault | **UNAVAILABLE for nearly every client.** A sweep of `01_Clients/` and `client-operations/clients/` found one invoice artifact in total, a BigOrange pilot invoice **draft**. `registry/clients.json` carries no retainer, rate, invoice or payment field at all. |

Per the job's own rule, every unsourced field below reads **pending validation**.
Nothing was estimated, inferred from a prior week, or carried over from a summary.

## Leads, and why they do not attribute to clients

The one lead source that did read, `#360leads`, is **Momentum's own inbound**, not
per-client delivery. The 2026-09-17 report recorded 8 real leads in 24 hours
(MeStyle Niche, joe@clubchamplon.com, Anna Carbone, Lisa Ann Grimes, Sean
O'Donnell, Dylan Martin, Amalia Severino, Mike Piple), all arriving through
Momentum 360's GBP-suspension and Meta campaigns or HubSpot.

**Not one of those 8 leads attributes to a paying client's campaign.** So per-client
LEADS for this window is `pending validation` for all 26 active clients, and that is
a measurement gap, not a finding of zero leads.

## Exceptions: clients whose numbers actively disagree

Each of these is evidenced on disk. **Every one is dated outside the requested
7-day window**, because the window itself has no measurement. The window is named
on each row so nothing here is mistaken for current.

### 1. nexla, spend with no real conversions, and the cause is still live

| field | value | source |
|---|---|---|
| Account | Google Ads customer **7917802207** (791-780-2207) | on-disk CID mapping, `clients/nexla/` |
| Period | 2026-09-07 to 2026-09-13 | prior-week measurement |
| SPEND | **$365.95** | recorded, prior window |
| LEADS | zero real conversions | recorded, prior window |
| CRM | pending validation | HubSpot unreachable |
| PAYMENT | pending validation | no invoice evidence on disk |

A generic conversion event plus a captcha-off form means every junk submission trains
Smart Bidding to buy worse traffic. Diagnosed 2026-09-09, still unpublished and marked
blocked on the client as of the 2026-09-14 report. **The disagreement compounds while
unfixed**, and nothing in the last 7 days re-tested it. Queue item 2026-09-16.

### 2. replenish-7-eleven, a live retainer against zero delivery

| field | value | source |
|---|---|---|
| Account | **6275014654**, SHARED CID, see hard rules below | ACCOUNT-RULES.md |
| Period | 2026-09-07 to 2026-09-13 | prior-week API read |
| SPEND | **$0.00, 0 impressions**, every campaign | recorded, prior window |
| LEADS | zero | consequence of zero delivery |
| CRM | pending validation | HubSpot unreachable |
| PAYMENT | pending validation | no invoice evidence on disk |

All nine Replenish campaigns read `status: ENABLED` with `servingStatus: ENDED`, while
two Fresh Blends campaigns in the **same customer** read `PAUSED` with
`servingStatus: SERVING`. A customer-level billing suspension would not leave two
campaigns serving-eligible, which argues the assumed cause, the July billing block, is
wrong and the real cause is expired campaign flight dates. `01_Clients/Replenish/Google
Ads Billing Block 2026-07-30.md` is still `status: blocked` with all three next actions
unchecked after six weeks. The change-event log shows **zero changes** in that account
across 09-07 to 09-13, nobody touched it. Two candidate causes, neither settled, and it
needs one read of each campaign's end date to resolve. Queue item 2026-09-14.

### 3. omega-landscaping, reported conversions are not accepted leads

| field | value | source |
|---|---|---|
| Account | **2853981364** (285-398-1364), queried DIRECT | ACCOUNT-RULES.md |
| Period | 2026-08-17 to 2026-09-15, 30 completed days | on-disk evidence, 363 rows |
| SPEND | **$370.85**, 43 clicks | `evidence-search-terms-raw.json` |
| LEADS | **2.0 platform conversions**, one of which came from a search for a competitor by name (`pikes peak landscaping`) | this week's pages 1-5 review |
| CRM | pending validation | HubSpot unreachable |
| PAYMENT | pending validation | no invoice evidence on disk |

Two separate defects make the conversion number not equal accepted leads. First, a
counting defect was live on the Netlify landing page for the whole 09-07 to 09-13
window: the conversion fired on click, before Netlify accepted the POST and before the
honeypot filtered bots, so bots the honeypot caught were still reported as conversions.
Fixed 2026-09-14, **after** the window. Second, 50% of the month's conversions came from
someone searching a competitor brand. **Reported conversions should be expected to
fall**, and that fall is the defect being corrected, not performance worsening. See
`clients/omega-landscaping/deliverables/2026-09-21 - search terms pages 1-5.md`.

### 4. revive-systems, the client was told the opposite of what the portal shows

| field | value | source |
|---|---|---|
| Account | **6486345529**, LocalServicesCampaign | prior-week API read |
| Period | 2026-09-07 to 2026-09-13 | prior-week API read |
| SPEND | campaign `ENABLED` with **0 impressions** | recorded, prior window |
| LEADS | **0 leads** | live portal capture |
| CRM | pending validation | HubSpot unreachable |
| PAYMENT | pending validation | no invoice evidence on disk |

Mike Over was emailed on 2026-09-10 that the Google background check had passed and the
campaign was eligible to serve. A read-only capture of the live portal the same evening
says the opposite on every point: background check still in progress, a Policy Manager
violation for Minimum Provider Requirements, 0 leads, and no insurance or licence card
visible in the UI. The 09-11 recapture found it unchanged. Mike has since asked in
writing whether to buy insurance, so he is about to spend money on requirements the
portal does not show. Additionally `DRAFT-REPLY-MIKE.md` says "not sent" while
`SENT-mike-lsa-update-2026-09-10.txt` records a Gmail message id as sent, and the sent
body is not archived, **so what Mike actually received cannot be established from
disk.** Queue item 2026-09-14.

### 5. bar-crawl-usa, a wrong attribution is already in the client's inbox

| field | value | source |
|---|---|---|
| Account | **4357102897** (435-710-2897) | on-disk CID mapping |
| Period | report sent 2026-09-10 19:25:36Z, data window 2026-08-10 to 2026-09-07 | `email-delivery-receipt.json` |
| SPEND | pending validation | probe unavailable |
| LEADS | +160.3% organic clicks, 2,356 vs 905, **Google Search Console only** | GSC figures on disk |
| CRM | pending validation | HubSpot unreachable |
| PAYMENT | pending validation | no invoice evidence on disk |

The sent email credits **Semrush** with confirming the +160.3% lift. Semrush was never
read on that run: Composio Semrush was disconnected and OAuth never started. The error
is recorded in the delivery receipt's own `materialCaveat` field, meaning Momentum
documented it and sent it anyway. Andy then replied on 2026-09-13 that four reported
items are not occurring, and **those four items are not enumerated anywhere on disk**.
On 2026-09-19 he asked about pausing work, still unanswered. Queue items 2026-09-14 and
2026-09-19.

### 6. fagan-painting, registry and queue disagree about whether this is a client

| field | value | source |
|---|---|---|
| Registry | `status: active` | `registry/clients.json` |
| Queue | inactive since 2026-09-09, must not be emailed | `System/approval-queue.md` |
| Last report generated | 2026-09-08 | `deliverables/` |
| Last send | 2026-09-09, verified | delivery receipt |
| SPEND / CRM / PAYMENT | pending validation | all three sources unavailable |

Per the machine contract **the registry wins** when the vault and the registry
disagree, which means this client currently reads active and is therefore inside the
scope of every automation, including report generation. The queue says the opposite.
One of the two records is wrong and this needs a decision, not another week of both.

### 7. nkcdc, active in the registry, do-not-email in practice

| field | value | source |
|---|---|---|
| Registry | `status: active` | `registry/clients.json` |
| Instruction | do not email, Dillon 2026-09-14 | `System/approval-queue.md` |
| Last report generated | 2026-09-08 | `deliverables/` |
| Last send | 2026-09-08, verified Gmail message id | `RECEIPT.json` |
| SPEND / CRM / PAYMENT | pending validation | all three sources unavailable |

Same class of exception as fagan-painting: the record that automations read does not
match the instruction humans are operating under.

## Clients that reconcile

**None, zero of 26.** Not one active client has all four fields sourced, so not one can
be declared reconciled. This is not a pass; it is the absence of a measurement.

For completeness, the 19 active clients with no disagreement to report this run are:
align-hcm, bercos-popcorn, bigorange-marketing, bok-law-firm, bridge-software,
cindy-may-christmas, deborah-mara, fresh-blends-kwik-trip, gt-clinic,
hope-wellness-center, kimberly-james-bridal, momentum-360, onsite-concrete-landscape,
pritzker-law-group, pro-fence-deck, puttery-nyc, shadow-heating-cooling, tags-2-go,
va-claims-edge. **Silence here means unmeasured, not clean.**

## Hard rules observed

- Google Ads customer **7214914099 was not queried.** No call was made to it.
- **No account-level total was taken on 6275014654.** Replenish and Fresh Blends share
  that CID. The Replenish exception above cites per-campaign serving status, never an
  account total, and the two brands are not blended anywhere in this file.
- **Every number carries its source and its period.** Where a source could not be read,
  the field reads `pending validation`. No figure here was estimated. Mac's standing
  complaint is reports without actual evidence, so the gaps are left visible as gaps.

## What unblocks this job

One human action fixes the largest hole: run `authorize.py` from
`%LOCALAPPDATA%/Dillon/GoogleAdsProbe/` and click through Google consent. That restores
SPEND for every client in one step. HubSpot needs its connector authorised separately.
Both are appended to `System/approval-queue.md`.

Until then this job can only report that the reconciliation cannot be performed, which
is what it has done.

## Gate

Nothing was sent to a client. No campaign, budget or bid was changed. No negative was
applied. Report only.
