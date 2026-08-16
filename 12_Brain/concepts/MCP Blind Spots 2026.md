---
tags: [concept, mcp, research]
source: "[[12_Brain/raw/research/2026-08-16 MCP Blind Spots Receipts]]"
updated: 2026-08-16
expires: 2026-11-14
---

# MCP Blind Spots — 2026

**Summary:** the 50-catalog and the web-design 25 skipped the MCPs sitting next to work this vault already does — Sheets, Docs, Microsoft Advertising, BuiltWith, Birdeye, Cal.com — not another layout library. Wired 2026-08-16 as sandbox-only except Twilio Docs.

This page does not authorize send, spend, or account change. Wiring a URL is not an ACCEPT verdict and is not permission to mutate. Every new server still goes through `_os/automation/bin/mcp-gate.js`. See [[12_Brain/concepts/MCP Stack Catalog 2026|MCP Stack Catalog 2026]] and [[12_Brain/concepts/Web Design MCP Catalog 2026|Web Design MCP Catalog 2026]]. Draft-first still wins: [[12_Brain/concepts/Draft-First Operating Rules|Draft-First Operating Rules]].

HubSpot, Notion, Linear, Stripe, PostHog, Cloudflare, Neon, and Exa are already in the 50. They are not blind spots. Gmail, Drive, and Calendar were in the 50 as session-present; they are vault-declared as of the 2026-08-16 Google ops batch.

## What you were not ranking

Vault judgment, not vendor proof. Gate one at a time, read-only first, only if the product is already in use.

| # | MCP | Why it was off-screen | Unique job vs the 50 | Risk |
|---|---|---|---|---|
| 1 | **Google Sheets** (`sheetsmcp.googleapis.com/mcp/v1`) | 50-catalog named it as an omitted extra, then never ranked it. Drive is a different server. | Grid/formula tools for the Growth Workshop tracker and franchise sheets. Drive opens the file; Sheets edits the grid. | **WRITE.** `update_values` / `insert_dimension`. |
| 2 | **Google Docs** (`docsmcp.googleapis.com/mcp/v1`) | Same omission. Vault already has [[12_Brain/concepts/Google Docs Sharding Pattern|Docs sharding]]. | Read/update native Docs the Drive MCP does not structure. | **WRITE.** `update_doc`. Prompt-injection on untrusted docs. |
| 3 | **Microsoft Advertising** (`partner.api.bingads.microsoft.com/ext/mcp/vnext`, OpenBeta) | Ads catalog thought Google + Meta. First-party Bing MCP shipped 2026-07-22. | Live Microsoft Ads account discovery. | **Beta** (`toolSetNames=OpenBeta`). AAD app registration. Not GA. |
| 4 | **BuiltWith** (`api.builtwith.com/mcp`) | Prospect Radar was framed as SERP/listings (DataForSEO). Tech fingerprinting is a different dataset. | "What stack is on this domain?" for site-grade / radar. | Credits on standard lookups. Not a SERP tool. |
| 5 | **Birdeye** (`mcp.birdeye.com/mcp`) | Local SEO catalog stopped at BrightLocal. Birdeye is reviews/listings/social if the client already lives there. | Live Birdeye account (reviews, listing accuracy). | Only if the product is paid. Not a GBP API. Not a BrightLocal clone. |
| 6 | **Cal.com** (`mcp.cal.com/mcp`) | Calendar MCP was treated as "the booking rail." Growth Workshop RSVP is Google; Cal.com is a different product (event types, bookings, routing). | Manage Cal.com bookings if that is how Dillon books. | **WRITE.** Create/cancel/reschedule. Docs say 34 tools; counted tables = 33. |
| 7 | **CallRail** (OAuth MCP; hostname from the account team) | Local call tracking never appeared in the 50. Official MCP exists; there is no public paste-URL. | Call/lead data if CallRail is already on the account. | Cannot catalog a static URL. Do not invent one. |
| 8 | **Intercom** (`mcp.intercom.com/mcp`) | First pass used a 404 docs URL and treated that as absence. | Inbox/contacts/articles if Intercom is the support rail. | **WRITE** on articles. US/EU only; AU unsupported. |
| 9 | **Klaviyo** (`mcp.klaviyo.com/mcp`) | Instantly was skipped for draft-first; Klaviyo (email/SMS CRM many clients already run) was never ranked. | Campaign/flow reads for Klaviyo clients. | Default **WRITE** (`create_campaign`). Owner/Admin/Manager. Use `read-only=true`. |
| 10 | **BigQuery** (`bigquery.googleapis.com/mcp`) | Cloud remotes were waved at, then ignored. | Query a warehouse if Ads/GA4 already land there. | `execute_sql` mutates. Prefer `execute_sql_readonly`. 3 min / 3,000 rows. |

Google Slides (`slidesmcp.googleapis.com/mcp/v1`) is the same omitted-Workspace class as Docs/Sheets. Rank it only when client decks are the job.

## Official but do not treat as a gap

| Server | Why it showed up | Why it is not a unique need |
|---|---|---|
| **Microsoft Clarity** (`npx @microsoft/clarity-mcp-server`) | Session/scroll vs GA4 counts. | Data Export API: 10 requests/day, 3 days, 3 dimensions. One-off UX probe, not a reporting rail. |
| **Parallel Search** (`search.parallel.ai/mcp`, free anonymous) | Omitted from the 50 table. | Same job class as Exa (already cataloged + session-present). |
| **Tavily** (`mcp.tavily.com/mcp/`) | Search/extract (map/crawl on GitHub). | Overlaps Exa / Firecrawl / Perplexity. |
| **Apify** (`mcp.apify.com`) | Actor store scrape. | Firecrawl is the harvest pick. Apify is a marketplace, not a second harvest MCP. |
| **Mixpanel** / **Amplitude** | Product analytics remotes. | Reporting stack is GA4 + Ads. PostHog already skip in the 50. WRITE on both. |
| **Resend** (`mcp.resend.com/mcp`) | Transactional/inbound email. | Send/broadcast tools vs draft-first. Gmail MCP is the draft rail. |
| **Supabase** (`mcp.supabase.com/mcp`) | Next backends. | Docs: not production. `read_only=true` exists. Neon already skip. |
| **Airtable** (`mcp.airtable.com/mcp`) | Ops bases. | Vault is Git/Obsidian. WRITE by default. |
| **ElevenLabs** (local GitHub MCP) | Voice for ads/UGC. | Local only. Higgsfield is video; this is audio. Credits. |
| **Twilio** (`mcp.twilio.com/docs`) | Looks like SMS ops. | Docs/OpenAPI search only. Does not send SMS or place calls. |

## Still missing as official MCPs

ServiceTitan, Housecall Pro, Jobber, Podium inbox. LinkedIn Ads, YouTube. Google Search Console, Google Business Profile, Obsidian. Do not fill those with community wrappers. GBP is API-only — [[12_Brain/concepts/Google Business Profile API 2026|Google Business Profile API 2026]].

Cloud infra remotes (AlloyDB, Cloud Storage, Cloud Run, Firestore, …) are also omitted from the 50. They are not this business. Do not add a data lake.

## Wiring (2026-08-16)

Operator asked to configure the batch. Declared in `.cursor/mcp.json` and `.mcp.json`. Secrets stay in the environment. **CallRail is not wired** (no public URL).

| Server | mcp.json key | Gate | Still needs |
|---|---|---|---|
| Google Docs | `google-docs` | sandbox-only | OAuth; do not call `update_doc` |
| Google Sheets | `google-sheets` | sandbox-only | OAuth; `get_values` only until a write is asked |
| Google Slides | `google-slides` | sandbox-only | OAuth; do not call `update_presentation` |
| BigQuery | `google-bigquery` | sandbox-only | Cloud OAuth; `execute_sql_readonly` only |
| Microsoft Advertising | `microsoft-advertising` | sandbox-only | Azure AD app + OAuth (OpenBeta) |
| BuiltWith | `builtwith` | sandbox-only | `BUILTWITH_API_KEY`; never `payment-purchase` |
| Birdeye | `birdeye` | sandbox-only | OAuth |
| Cal.com | `cal-com` | sandbox-only | OAuth; no booking writes |
| Intercom | `intercom` | sandbox-only | OAuth; no article writes |
| Klaviyo | `klaviyo` | sandbox-only | OAuth; URL already has `read-only=true` |
| Parallel Search | `parallel-search` | sandbox-only | None (anonymous). Overlaps Exa |
| Tavily | `tavily` | sandbox-only | OAuth or `TAVILY_API_KEY` |
| Apify | `apify` | sandbox-only | `APIFY_TOKEN`; do not run Actors |
| Mixpanel | `mixpanel` | sandbox-only | OAuth; no dashboard writes |
| Amplitude | `amplitude` | sandbox-only | OAuth; no creates |
| Resend | `resend` | sandbox-only | OAuth; **do not send** |
| Supabase | `supabase` | sandbox-only | OAuth; URL has `read_only=true`; never prod |
| Airtable | `airtable` | sandbox-only | OAuth; no record writes |
| Twilio Docs | `twilio-docs` | **ACCEPT** | None. Docs search only — not SMS |
| Microsoft Clarity | `microsoft-clarity` | sandbox-only | `CLARITY_API_TOKEN`; 10 req/day |
| ElevenLabs | `elevenlabs` | sandbox-only | `ELEVENLABS_API_KEY` + `uvx`; no TTS until asked |
| CallRail | — | skipped | Account-team URL. Do not invent a hostname |

Enable one server per job. Unset env vars and OAuth grants rollback the token-gated ones. Delete the matching block from both mcp.json files to roll back wiring.

Free need-list / design helpers wired the same evening (Context7, Firecrawl keyless, Google Design, Playwright, Brandfetch, Netlify, official GA4) are cataloged on [[12_Brain/concepts/MCP Stack Catalog 2026|MCP Stack Catalog 2026]] and [[12_Brain/concepts/Web Design MCP Catalog 2026|Web Design MCP Catalog 2026]]. They are not blind spots.

## What to ignore vs what to gate later

Operator action, not authorization.

- Do not treat Parallel, Tavily, Mixpanel, Amplitude, Apify, Resend, or Airtable as unique needs — they are wired sandbox-only because this configure pass asked for the whole batch.
- Sheets (read) is the only omitted server that already matches a live vault workflow (tracker in Drive). Write tools stay off.
- Microsoft Advertising only if a Bing account is real. OpenBeta.
- BuiltWith only as a Prospect Radar enricher, and only after DataForSEO/Ahrefs is the SERP pick — different job, do not swap.
- Birdeye / CallRail / Intercom / Klaviyo / Cal.com only if that product is already on the account.
- Clarity only as a per-session UX probe. Do not put it on the morning loop.
- Resend send/broadcast and Cal.com booking writes stay off under draft-first.

## Killed this sweep

- Official GSC / GBP / Obsidian MCP (still none).
- "No official Microsoft Ads / Birdeye / Intercom / CallRail MCP."
- Sheets = Drive. Cal.com = Google Calendar. Parallel = unique search. Clarity = daily GA4. Resend = missing Gmail. Twilio MCP = SMS sender.
- Treating Twilio Docs as an SMS sender.
- Treating Cloud injections as vault-owned.
- Inventing a CallRail hostname.
- Invoking send, spend, or mutate tools from a sandbox-only wiring.

## Links

- Receipts: [[12_Brain/raw/research/2026-08-16 MCP Blind Spots Receipts]]
- [[12_Brain/concepts/MCP Stack Catalog 2026|MCP Stack Catalog 2026]] · [[12_Brain/concepts/Web Design MCP Catalog 2026|Web Design MCP Catalog 2026]]
- [[12_Brain/concepts/Google Docs Sharding Pattern|Google Docs Sharding Pattern]] · [[02_Campaigns/Growth Workshop/Tracker Spec|Growth Workshop Tracker Spec]]
- [[12_Brain/projects/Prospect Radar V2|Prospect Radar V2]]
- [[12_Brain/entities/LandingFolio MCP|LandingFolio MCP]]
- [[12_Brain/concepts/Draft-First Operating Rules|Draft-First]]
