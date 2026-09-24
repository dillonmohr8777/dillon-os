---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-07-15T15:04:57
session_last: 2026-07-15T15:04:57
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-07-15\cross-reference-the-thing-i-think"
tags: [codex-recovery, session, 202607]
---

# Documents\Codex\2026-07-15\cross-reference-the-thing-i-think

**1 session(s)** · 2026-07-15 15:04 → 2026-07-15 15:04 · 3.4h agent-time (summed; sessions may overlap) · 6 MB transcript · 10/10 turns completed

## 1. 2026-07-15 15:04 · 3.4h · 5.7 MB

`019f664f-204b-7e10-b9f8-d91f2b1605cc` · turns 10/10

**Asked:**

> for Codex:
> 
> Cross-reference the thing. I think you built it yesterday or the day before. It was pretty dope. Um, I dunno. Finisher the document here.

> finish dont send anything only send to my email

> create the thing rthe dashboard insittue

**Outcome reported:**

> Understood. I’ll always format links as clickable links.
> 
> [Open the Momentum 360 dashboard](https://momentum-360-reporting-os.netlify.app/)

> Finished and redeployed: [Open the Momentum 360 Reporting OS](https://momentum-360-reporting-os.netlify.app/)
> 
> It now includes:
> 
> - All 18 clients from the canonical registry
> - Current July 1–15, 2026 reporting period
> - Full Momentum 360 logo without the visible rectangular background
> - Persistent Netlify-backed source and document records
> - Working source add, manage, remove, open, and embed controls
> - Persistent document approvals, edit requests, and comments
> - Integration library for Ads, CRM, calls, forms, Drive, Slack, and Looker
> - No recycled May data or invented performance metrics
> 
> Production persistence and the complete source/document create, update, and delete lifecycle were verified successfully. External metrics remain pending until each client’s actual provider is connected.

> Fixed: [open the updated dashboard](https://momentum-360-reporting-os.netlify.app/).
> 
> It now shows only 13 active client accounts. Removed:
> 
> - BOK and Align
> - Momentum itself as a client
> - Blissful/Zen Spa
> - Revive, since it was not confirmed current
> - Every Penn reference
> 
> “Penn dashboard” was an old reference build used for its reporting/review workflow—not an actual client. It should not have appeared here. The interface now uses neutral client-reporting language while retaining the real logo.

> [Download the 11-page data-source setup PDF](</C:/Users/dillo/Documents/Codex/2026-07-15/cross-reference-the-thing-i-think/momentum-client-data-source-setup-playbook.pdf>).
> 
> It includes the exact copy/paste master prompt, per-client connection prompt, database structure, connector requirements, refresh schedules, reconciliation tests, security rules, and definition of “Verified.”
> 
> Why data wasn’t connected: I built a persistent configuration backend, not a live ingestion backend. The audit found:
> 
> - 13 current clients
> - Three “Available” source records, all for Fagan Painting
> - Zero scheduled metric-ingestion jobs
> - No verified per-client account mappings for the remaining clients
> 
> A source link opening successfully is not a live connection. I should have made that distinction explicit instead of allowing “backend works” to imply real-time reporting. The PDF now requires successful scheduled syncs, stored records, freshness timestamps, and reconciled provider totals before anything can be called connected or verified.

> Found it. Melissa was asking you to adapt the prospecting workflow so it starts with Google Maps—not Instagram links.
> 
> What she wants:
> 
> - Search Google Maps for local businesses in a target niche and area, such as Philly or New Jersey.
> - Capture each business’s name, website, phone, Maps listing, category, rating, and review count.
> - Review the websites and identify opportunities: new website, website improvements, local SEO/Maps optimization, SEO, or advertising.
> - Export an outreach-ready lead list.
> - Prove the businesses were sourced from Google Maps, then keep Melissa updated on the prototype.
> 
> After you agreed it was a good idea, she replied, “cool keep me posted.” [Open the Slack thread](https://momentum3d.slack.com/archives/C04HXSVN2CS/p1784037513343399).
> 
> I found no later message showing that you completed it or updated her, so it appears to still be open. The clean next step is a small proof of concept using one niche and one location, ideally through an approved Google Maps/Places data source.
> 
> This was not the one-star Google review request—Melissa explicitly said that wasn’t assigned to you. It also wasn’t the older Squarespace Google-tag setup.

> Done. I instituted Maps-first prospecting as a reusable workflow for anything Melissa requests—not a one-off list.
> 
> It now includes:
> 
> - Persistent niche, geography, requester, and service-opportunity intake
> - Seeded Melissa request for Philadelphia and New Jersey businesses
> - Real server-side Google Places connector
> - Clickable Maps, website, and result-sheet links
> - Saved results, CSV export, and status tracking
> - A reusable prompt and verification checklist
> 
> The connector follows Google’s current [Places Text Search API](https://developers.google.com/maps/documentation/places/web-service/text-search).
> 
> Files:
> 
> - [Dashboard workflow](C:/Users/dillo/Documents/Codex/2026-07-15/cross-reference-the-thing-i-think/dashboard/app/page.tsx)
> - [Operating standard](C:/Users/dillo/Documents/Codex/2026-07-15/cross-reference-the-thing-i-think/dashboard/docs/maps-first-prospecting.md)
> - [Places connector](C:/Users/dillo/Documents/Codex/2026-07-15/cross-reference-the-thing-i-think/dashboard/netlify/functions/places.mts)
> 
> Build, lint, and tests pass. The only remaining connection step is adding `GOOGLE_MAPS_API_KEY` to Netlify; until then, it correctly displays “Needs setup.” I did not deploy, send, or notify Melissa.
> 

**Files written (1):**

- `momentum-am-dashboard-cross-reference.md`

<sub>rollout: `C:\Users\dillo\.codex\archived_sessions\rollout-2026-07-15T11-04-57-019f664f-204b-7e10-b9f8-d91f2b1605cc.jsonl`</sub>
