---
note_type: review
status: active
created: 2026-09-10
updated: 2026-09-10
owner: Dillon Mohr
client: "[[01_Clients/Nexla/overview]]"
priority: high
verification_status: partial
observed_at: 2026-09-10
tags: [nexla, google-ads, gtm, corrections, offline-conversions, enhanced-conversions]
source_refs:
  - "External research pass, 2026-09-10, current Google documentation"
  - "[[12_Brain/07_Reviews/2026-09-10 - Nexla search terms, first audit]]"
---

# Nexla technical corrections — 2026-09-10

Three corrections from an external documentation pass. Two overturn plans that
were already written down. **These are second-hand and should be confirmed
against Google's own docs before being acted on**, but each is specific enough
to check quickly.

## 1. Offline conversion import — the plan as written is dead

`ConversionUploadService` was **closed to new adopters on 2026-06-15**. A Cloud
project without a verified prior history of offline uploads returns
`CUSTOMER_NOT_ALLOWLISTED_FOR_THIS_FEATURE`. Project `150963436905` was approved
2026-09-09, so it will hit that block.

**New integrations must use the Google Ads Data Manager API instead.** Every
plan in this estate that says "upload GCLIDs back through
ConversionUploadService" — including the 2026-09-09 Nexla spec — needs
rewriting against Data Manager.

Other constraints worth keeping: GCLID match window is **90 days**; wait **4–6
hours** after the click before uploading or you get `CLICK_TOO_RECENT`; and
omitting the timezone offset in `conversionDateTime` causes
`CONVERSION_PRECEDES_CLICK`. The most common real-world breakage is a redirect
stripping the `gclid` before it reaches the form's hidden field.

## 2. Enhanced conversions — Nexla must accept, not Momentum

Activating enhanced conversions requires accepting the **Google Ads Customer
Data Terms**, and the acceptance dialog states the accepter *"represents and
warrants that you are authorized to act on behalf of, and bind"* the advertiser.

**Nexla is the data controller; Google is the processor.** If an agency operator
clicks Accept without written authority, the agency has warranted it can bind
the client to Google's data indemnification clauses — and Nexla's privacy policy
must already disclose sharing hashed customer data with third parties for
measurement.

**So: hand Jayashree or Dana the exact path — Goals › Conversions › Settings ›
Enhanced conversions — and have them accept it.** Do not click it for them.
This confirms the instinct already recorded: never accept terms on a client's
behalf.

Consent Mode v2 is **not** required for US-only traffic; it is mandated for
EEA/UK/Switzerland. It becomes required the moment targeting expands
internationally.

## 3. The MCP judgment call — I was half right, and the better answer is match type

On 2026-09-10 twenty-two off-thesis negatives were applied to campaign
`23705317332`, and six core terms were deliberately left alone because negating
a campaign's own thesis turns it off rather than tunes it.

**That reasoning holds. The execution was incomplete.** Leaving them was right;
leaving them on **broad match** was the error.

The intent argument is the part worth keeping: `model context protocol` and
`mcp server` are overwhelmingly **developer** queries — people looking for
GitHub repos, SDKs and local client setup. Nexla sells a high-ACV enterprise
data platform. An engineer looking for a Python MCP wrapper is not evaluating a
five-figure contract. That is why $779.67 on `model context protocol` bought
nothing: not bad targeting, **wrong audience entirely**.

**The fix is to narrow, not to delete:** exact match `[model context protocol]`,
plus commercially-modified phrases — `"mcp enterprise"`, `"agentic ai
platform"`, `"enterprise model context protocol"`, `"agentic data
integration"`. That preserves the strategic position while cutting the
developer traffic.

And it needs a landing page that explains how Nexla **operationalises** MCP
across enterprise data silos. A generic demo form will keep converting near
zero regardless of match type.

## 4. Bidding floors, with numbers to defend

At $65.75/day and ~$3.54 CPC — ~555 clicks/month, and 1.5–3.0% is realistic for
enterprise B2B — expect **8–16 conversions/month**.

| Strategy | Documented floor | Nexla | Verdict |
|---|---|---|---|
| Maximize Conversions | 15 conv / 30 days | 8–16 | **borderline** |
| Target CPA | 30–50 conv / 30 days | 8–16 | **far below** |

**Do not put tCPA on this account.** At roughly one conversion every 2–4 days
the algorithm suffers data sparsity, and a 48-hour dry spell makes it suppress
bids across segments and drop impression volume off a cliff.

Staging: Max Clicks with a CPC cap now → Maximize Conversions at 15+/30 days →
tCPA only at 30+ sustained.

## What still needs first-party confirmation

Every claim above is second-hand. The three worth verifying before acting:
the `ConversionUploadService` cutoff date, who Google requires to accept the
Customer Data Terms, and the documented Smart Bidding floors.
