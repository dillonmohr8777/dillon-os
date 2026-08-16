---
tags: [concept, gbp, google, research]
source: "[[12_Brain/raw/research/2026-08-16 Google GBP API Receipts]]"
updated: 2026-08-16
expires: 2026-11-14
---

# Google Business Profile API — 2026

**Summary:** GBP is a gated REST API, not an MCP. Do not invent a hostname. Maps and Merchant are different products. This vault does not need a data lake.

This page does not authorize an access request, OAuth grant, send, or listing edit. See [[12_Brain/concepts/Draft-First Operating Rules|draft-first]] and [[12_Brain/concepts/MCP Stack Catalog 2026|MCP Stack Catalog 2026]].

## What you asked for

Operator asked to use the official Google ops MCPs, whether a data lake is required, and for Google Business APIs.

Wired (vault-declared, still gated): official Ads (read-only `pipx`), Gmail, Drive, Calendar, Maps Grounding Lite, Developer Knowledge. Reviews in `12_Brain/07_Reviews/MCP/`. Developer Knowledge is **ACCEPT**. The others stay sandbox-only until OAuth/token and, for Gmail/Drive/Calendar/Maps, permission review.

GBP has **no official MCP** on the Cloud remotes table or the my-business docs. Listing ops stay API-only after Google approves the Cloud project.

## Do we need a data lake?

No. Vault judgment, not a Google requirement. Ads and GA4 reads are the reporting hole. [[12_Brain/07_Reviews/MCP/2026-08-16 - bigquery|BigQuery]] is already wired and only pays off if Ads/GA4 already export there. Do not add Cloud Storage, Bigtable, Spanner, or the rest of the Cloud infra remotes.

## GBP is API-only

Official hosts are REST/RPC (`mybusiness.googleapis.com`, `mybusinessbusinessinformation.googleapis.com`). Do not append `/mcp`. Do not install a community wrapper.

Access is gated ([prereqs](https://developers.google.com/my-business/content/prereqs)):

- Verified, active Business Profile for 60+ days (own office or a managed client).
- Website representing that listing.
- Cloud project + Organization account.
- Form: "Application for Basic API Access."
- Quota **0 QPM** = not approved. **300 QPM** = approved.

After approval, enable the eight APIs on [basic setup](https://developers.google.com/my-business/content/basic-setup): Google My Business API, Account Management, Lodging, Place Actions, Notifications, Verifications, Business Information, Q&A. Scope used in Google's Playground example: `https://www.googleapis.com/auth/business.manage`. No sandbox; use `validateOnly`. Workspace orgs with Business Profile turned off get `403`.

## Nearby MCPs that are not GBP

| Surface | Job | Not |
|---|---|---|
| [[12_Brain/07_Reviews/MCP/2026-08-16 - maps-grounding-lite|Maps Grounding Lite]] | Places / weather / routes. Billed. | Posts, reviews, listing edits. |
| Merchant API MCP (`merchantapi.googleapis.com/mcp`, Alpha) | Merchant Center products / feeds / reports. | Local GBP listings. Not wired. |
| [[12_Brain/07_Reviews/MCP/2026-08-16 - birdeye|Birdeye]] / BrightLocal | Vendor datasets if already paid. | First-party GBP API. |

Overview: listing management (photos, posts, reviews) is Business Profile APIs; public local-info / location awareness is Maps Platform.

## Operator gate (Tier 2)

Do not mint tokens or submit the GBP form from an agent session.

1. Ads developer token + OAuth or ADC.
2. Workspace OAuth for Gmail / Drive / Calendar. Gmail: `create_draft` / `list_drafts` / read only. No send tool on the 2026-08-16 official `tools/list`.
3. Enable Maps Grounding Lite before live calls (key or OAuth). URL is wired without a header so an empty key cannot break `tools/list`.
4. Request GBP API access only if the 60-day + website rule is already true.

## Links

- Receipts: [[12_Brain/raw/research/2026-08-16 Google GBP API Receipts]]
- [[12_Brain/concepts/MCP Stack Catalog 2026|MCP Stack Catalog 2026]] · [[12_Brain/concepts/MCP Blind Spots 2026|MCP Blind Spots 2026]]
- [[12_Brain/07_Reviews/MCP/2026-08-16 - google-ads|Google Ads review]] · [[12_Brain/07_Reviews/MCP/2026-08-16 - gmail|Gmail review]] · [[12_Brain/07_Reviews/MCP/2026-08-16 - developer-knowledge|Developer Knowledge ACCEPT]]
