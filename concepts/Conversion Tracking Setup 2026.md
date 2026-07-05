---
tags: [concept, ads-research]
source: "[[raw/2026-07-04 - full-autonomy-directive]]"
updated: 2026-07-05
expires: 2026-08-04
---

# Conversion Tracking Setup — 2026 (Google + Meta)

One-line: enhanced conversions, GA4 double-counting, gclid/fbclid offline
stitching, verification order, and primary/secondary — verified July 2026.
Feeds every [[02_Campaigns/Ads Ops/Ads Ops Hub|Ads Ops]] conversion audit.

## Three 2026 deadlines
- **April 2026 (live):** Google unified user-provided data — tag + Data Manager
  + API can send hashed first-party data simultaneously; existing accounts
  auto-migrated. Re-audit any account untouched since March.
- **June 15 2026:** legacy offline-import API (`UploadClickConversions`)
  deprecated → **Data Manager API**. Custom offline uploads must migrate.
- **June 2026:** bid-strategy renames (see [[Google Ads Conversion Optimization 2026]]).

## Enhanced conversions (Google)
- SHA-256-hashed email/name/address/phone matched to signed-in Google accounts.
  Recovers ITP/cookie/iOS-lost attribution.
- Setup: gtag/GT- auto-detect or CSS selectors; GTM User-Provided Data variable
  (code-snippet method most reliable). If pre-hashing, use **hex-encoded SHA256**
  or match silently fails.
- Verify: Conversions → action → **Enhanced conversions diagnostics** (shows
  data received + match rate).

## GA4 ↔ Google Ads (avoid double-counting)
- **Never count the same action in both** GA4-imported AND native tag — halves
  reported CPA, poisons bidding.
- 2026 default: native Google Ads tag = **Primary** (bidding); GA4 key events =
  Secondary / analytics only. One source per action.

## Offline stitching
- **Google:** auto-tagging appends `gclid` → hidden form field → store on CRM
  lead → upload on close via **Data Manager**. Prefer **Enhanced Conversions
  for Leads** (hashed data + gclid dual keys) over gclid-only.
- **Meta:** standalone Offline Conversions API discontinued May 2025 — CRM
  events now via standard **CAPI** (`action_source: "system_generated"`).
  Capture `fbclid` → convert to `fbc` (`fb.1.[ts].[fbclid]`) → store → send on
  downstream events. Don't hash fbc/fbp; DO hash email/phone/name.

## Verification order
**Google:** (1) Tag Assistant on thank-you page — fires exactly once;
(2) conversion ID+label match settings; (3) Conversions → Diagnostics tab;
(4) EC diagnostics report; (5) end-to-end: click live ad → real conversion.
**Meta:** (1) Events Manager → Test Events (test_event_code); (2) trigger →
Browser + Server both appear; (3) dedup via matching event_name + event_id
within 48h; (4) check Event Match Quality.

## Primary vs Secondary (Google 2026)
- **Primary** → "Conversions" column + used by Smart Bidding. Keep 1-3 on
  high-value outcomes (purchase, qualified lead, booked call).
- **Secondary** → "All conversions", observation only, NOT bidding.
- **Exception:** a secondary action inside a *custom goal* IS used for bidding.
- Account (customer) goals apply to all campaigns; campaign-level goals override.

Sources: Google Ads Help + Google Ads API docs (primary), Farsiight/groas/
dataally (2026-02-22)/Adswerve/Measure Marketing Pro 2026.
