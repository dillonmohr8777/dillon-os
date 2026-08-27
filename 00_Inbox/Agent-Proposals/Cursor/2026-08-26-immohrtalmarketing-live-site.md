---
note_type: proposal
status: draft
created: 2026-08-26
agent: growth-content
privacy: redacted
source_refs:
  - https://www.immohrtalmarketing.com/
  - https://www.immohrtalmarketing.com/sitemap.xml
  - https://www.immohrtalmarketing.com/llms.txt
  - https://www.immohrtalmarketing.com/robots.txt
tags:
  - immohrtal
  - website
  - seo
---

# Live agency site: immohrtalmarketing.com

This is the IMMOHRTAL Marketing Solutions site. It is not the Dance With The Delusional album preview.

## What it is

- Canonical: `https://www.immohrtalmarketing.com/`
- Host: Vercel (`server: Vercel`, cache HIT)
- 24 sitemap URLs: core pages, services, work, pricing, contact, plus 10 insights guides
- `llms.txt`, `feed.xml`, and `robots.txt` are live
- Search Console: `sc-domain:immohrtalmarketing.com` is `siteOwner` on `google_search_console_mooner-urban`
- URL Inspection: homepage **Submitted and indexed**, last crawl `2026-08-26T22:57:51Z`, user and Google canonical match, robots allowed
- Search analytics for 2026-08-01..08-24: **no query rows yet** (new property; expected)

## Split from other IMMOHRTAL surfaces

| Surface | What it actually is |
|---|---|
| `https://www.immohrtalmarketing.com` | Live agency site |
| `immohrtal-site` in `dillon-os` and `immohrtal-website` repo | Album / artist preview |
| `mohr-media-site` in `dillon-os` | Older Mohr Media static site, still canonicalized to `themohrmedia.com` |

No matching source tree for the live agency site was found in the 34 `dillonmohr8777` remotes. Vercel MCP is not authenticated here, so the Vercel project was not opened. Do not deploy.

## Confirmed

- Homepage H1 and JSON-LD are present.
- Inner pages (`/about/`, `/work/`, `/services/`, `/contact/`, `/pricing/`) return 200 with JSON-LD.
- Trailing-slash URLs are canonical; `/work` 308s to `/work/`.
- Apex `https://immohrtalmarketing.com/` 308s to www. PowerShell does not follow that 308; browsers and Google canonical already use www.
- `robots.txt` allows Googlebot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended. GPTBot is disallowed.
- Contact page has a mailto to the business mailbox and **no HTML form**.

## Not done

No production deploy. No DNS change. No GSC property add. No Vercel login.
