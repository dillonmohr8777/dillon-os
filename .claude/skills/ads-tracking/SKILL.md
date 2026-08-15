---
name: ads-tracking
description: Conversion-tracking preflight for Google Ads and Meta — primary vs secondary, enhanced conversions, GA4 double-count, CAPI. Use when Smart Bidding looks broken, events are pending validation, or before any bid-strategy change.
---

# Ads Tracking

Preflight tracking before anyone touches bidding. Broken tracking is a stop,
not an optimization. Do not invent fire counts. Do not email the client.

## Input

Client name from arguments.

## 1. Read the contract

1. `01_Clients/<Client>.md` and the client folder
2. [[12_Brain/concepts/Conversion Tracking Setup 2026]]
3. [[12_Brain/concepts/Google Ads Conversion Optimization 2026]]
4. [[12_Brain/concepts/Meta Lead Ads Optimization 2026]]

Then inspect whatever live surface works this session (tag screenshots in the
vault, Gmail diagnostics, Events Manager notes, Composio). If nothing live is
readable, audit from vault evidence and mark every gap.

## 2. Google checklist

- One **primary** action for bidding (booked call, qualified form, purchase).
  Keep 1–3 primaries. Everything else is **secondary**.
- Native Google Ads tag = primary. GA4 key events = secondary. Never count
  the same action in both.
- Enhanced conversions: Customer Data Terms accepted, diagnostics show data
  received, hash format is hex SHA-256 if pre-hashed.
- Auto-tagging on. `gclid` stored on the lead if offline upload is in play.
- Tag Assistant / thank-you: the conversion fires **once**.
- **Pending validation is not a conversion.** Do not feed Smart Bidding a
  pending event and call it signal.

Bid rule once tracking is real: under ~30 conversions / 30 days per campaign
→ Maximize Conversions. tCPA waits for volume.

## 3. Meta checklist

- `Lead` on both pixel and CAPI, same `event_id`.
- Events Manager Test Events: browser + server merge into one row.
- Event Match Quality: email, phone, fbp, fbc.
- Instant form vs website lead: say which one bidding uses.
- Conversion Leads optimization only if the account clears ~200 leads / month
  and the stage converts 1–40% inside 28 days. Local accounts usually stay on
  Maximize Leads + Higher Intent form.

## 4. Write the brief

Write `Daily-Briefs/ads-tracking-YYYY-MM-DD-<slug>.md`:

- **Stop / go** — can Smart Bidding run, or is tracking the blocker
- **Primary action** — what it is, or "missing"
- **Double-count risk** — GA4 vs native, form vs call
- **Fixes** — ranked, Tier 1 vs operator-only (terms accept, GTM publish)
- **Do not do** — switch to tCPA, raise budget, or launch PMax on a dead tag

If tracking is broken, the ads-audit for that client stops at this page.

## Hard rules

- Changing conversion goals is Tier 2 (Dillon live only).
- No CIDs or emails in `12_Brain/`.
- Cloud sessions draft the fix list. They do not publish GTM or accept
  customer-data terms.
