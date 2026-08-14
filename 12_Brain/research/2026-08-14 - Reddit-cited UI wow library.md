---
tags: [research, design]
updated: 2026-08-14
expires: 2026-11-14
source: "[[12_Brain/raw/research/2026-08-14 - reddit-cited-wow-ui-library]]"
---

# Reddit-cited UI wow library (2026-08-14)

**Summary:** 200 screenshotable homepages drawn from the galleries r/web_design
treats as the wow-site feed. Use them as composition references for outreach
demos. Never clone a reference brand onto a local business.

## What we actually captured

- Target: 200 successful JPEGs.
- Result: 200 ok in `wow-library.json` (217 attempted URLs; failures were
  NXDOMAIN, timeouts, or homepages that never painted).
- Reddit JSON itself was blocked. The source list is the set of galleries that
  subreddit names: Godly, Land-book, Siteinspire, One Page Love, CSS Design
  Awards, Muzli Picks April 2026, Graphic Design Junction 2026 awards.
- Shots stay gitignored under `12_Brain/private/design-references/shots/`.
- Public URL catalog:
  `02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w33/wow-library.json`.

## How the factory is allowed to use it

Each prospect brief carries one `composition_ref` URL. The factory maps that
host to a layout id in `_templates/site-factory/lib/layouts.js` and injects
matching chrome (search pill, dark stage, player dock, repo bar) plus hero
architecture. Harvest still owns palette, copy, phone, address, and
photography. Two sites in a batch may not share a reference or an image hash.

## First 25 mapped onto radar

Batch `phl-2026-w33` takes the latest unbuilt rebuild rows from
[Prospect Radar](https://momentum-prospect-radar.netlify.app/#sort=p:desc),
priority descending, preferring imagery-buildable then live sites. Demos stay
`noindex`. `mail_ready` stays hold. `govertical.com` was dropped: the live
domain is a South Carolina developer, not the Philly climbing gym the radar
still lists. Replacement slot: Colmar Dentistry For Kids (`colmarkids.com`),
next unused high-priority rebuild in `12_Brain/state/radar/build-queue.csv`.

Week 33 demos now carry each business's real logo and forward-facing copy.
The first 15 composition refs are the screenshots shown in review (Stripe,
Apple, Airbnb, Arc, Webflow, Cursor, Figma, Linear, Notion, Godly, Land-book,
Pentagram, Studio Freight, Awwwards architecture, Midjourney). Ten more fill
the rest of the batch. Demos stay noindex.

Remaining rebuilds on the radar (168 queued, 0 built at capture) are later
batches, not this PR.

## Links

- [[12_Brain/entities/Website Factory|Website Factory]]
- [[12_Brain/projects/Prospect Radar V2|Prospect Radar V2]]
- [[02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec|Pipeline Spec]]
