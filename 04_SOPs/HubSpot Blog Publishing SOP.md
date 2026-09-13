---
employer: Align HCM
type: sop
tags: [sop, align-hcm, hubspot, blog, api]
last_verified: 2026-07-14
---

# HubSpot Blog Publishing SOP (Align HCM)

How any agent session publishes or edits Align HCM blog posts directly through the HubSpot API. Verified working end to end on 2026-07-14 (post 368916427507 published, cleaned, and re-verified live).

## Auth

* Token comes from the `HUBSPOT_TOKEN` env var, set in the Claude Code environment settings (Dillon's side). It is a HubSpot private app token. **Never commit it to this repo: GitHub push protection rejects the push.**
* Header: `Authorization: Bearer $HUBSPOT_TOKEN`
* Current private app scopes: `content`, `files`. **Missing: `social-access`** (LinkedIn scheduling returns 403 until Dillon adds it in HubSpot > Settings > Integrations > Private Apps).
* If `HUBSPOT_TOKEN` isn't set in a session, ask Dillon for it. The token in circulation as of 2026-07-14 was exposed in chat transcripts and is due for rotation.

## Portal constants

* Portal ID: `242825734`
* Blog (contentGroupId): `238216692432`
* Authors: Maher El-Abdallah `316873681616` (has LinkedIn + bio), Dillon Mohr `238213180141`
* Tags: Payroll Implementation `277222808289`. List others via `GET /cms/v3/blogs/tags`.
* Live posts of note: "6 Things I Tell Businesses Before Payroll Implementation" `368916427507` at /blog/6-things-before-payroll-implementation

## Endpoints (base https://api.hubapi.com)

* Find posts: `GET /cms/v3/blogs/posts?slug__icontains=...` or `name__icontains=...` (add `&properties=id,name,slug,currentState,url` to trim payload)
* Create draft: `POST /cms/v3/blogs/posts` with `{name, slug, contentGroupId, blogAuthorId, tagIds, htmlTitle, metaDescription, postBody, headHtml, featuredImage, featuredImageAltText, useFeaturedImage: true, state: "DRAFT"}`
* Edit (updates live content if post is published): `PATCH /cms/v3/blogs/posts/{id}`
* Publish a draft: `POST /cms/v3/blogs/posts/{id}/draft/push-live` (draft edits go to `PATCH /cms/v3/blogs/posts/{id}/draft`)
* Upload featured image: `POST /files/v3/files` (multipart: `file`, `folderPath=Align HCM/Blog Images`, `options={"access":"PUBLIC_INDEXABLE"}`). Use the returned URL in `featuredImage` and in the JSON-LD `image` field.
* Authors: `GET|PATCH /cms/v3/blogs/authors/{id}`

## Gotchas (all hit in production, all real)

* **Never lead postBody with an HTML comment.** HubSpot strips it partially and renders the remainder as visible text on the live page. Body must start with the first real element.
* **Always set `publishDate`** (ISO 8601). Posts created via API can land with epoch zero (1970-01-01), which buries them in the blog listing and feeds garbage dates to search engines.
* `authorName` on the post object is a stale display field. Trust `blogAuthorId`, not `authorName`.
* JSON-LD schema goes in `headHtml` on the post, not in the body.
* After any publish or edit, verify the live URL: HTTP 200, no stray text above the byline, FAQ/schema present, correct meta title.

## Standard content package

Every blog ships from a repo folder under `02_FullTimeJob/AlignHCM/blogs/<slug>/` containing `blog-post.md`, `hubspot-publish.html`, `featured-image.png`, and `publish-checklist.md`. AEO/GEO requirements per post: answer-first summary box, direct-answer section openers, self-contained FAQ (40 to 60 words per answer), BlogPosting + FAQPage JSON-LD with Maher as author entity, cited statistics, internal link cluster, brand rules (no em dashes, contractions, bullet characters).
