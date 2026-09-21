---
name: "momentum-client-context"
description: "Load the canonical client record for a named Momentum Digital / Momentum 360 client before producing any client-specific deliverable. Use this whenever a request names an active client (Nexla, Puttery, Bridge, VA Claims, Capsule and Tonic, Everyday Life Insurance, Kimberly James Bridal, Green Slate Masonry, Hope Wellness, Pro Fence & Deck, Omega Landscape, Fresh Blends, Bar Crawl USA, Fagan Painting, NKCDC, Pritzker Law, Revive Systems, Deborah Mara, Onsite Construction) or says things like \"for Omega\", \"the Puttery deck\", \"Fresh Blends' report\", \"pull up KJB\". This is the spine other Momentum skills sit on — run it first so brand, service lines and open items come from the record instead of from memory. Do not use for cold prospects who are not yet clients."
---

# Momentum Client Context

Resolve a named Momentum client to their canonical record before building anything for them. The whole point is that nobody should have to re-explain a client, and you should never guess at a fact that already exists in a file.

## Why this exists

Momentum runs about twenty active client relationships across a wide service surface. Every deliverable — a deck, a monthly report, a proposal, a page of copy — leans on the same handful of facts: who the client is, what they actually bought, what their brand looks like, which Slack channel the work lives in, and what is currently open or promised. When those get re-derived from memory each time, deliverables drift, and drift is how a client ends up with a report listing a service line they never purchased.

An audit found five clients with live Slack channels and **no vault record at all**, Nexla among them. So assume the record may be missing. A missing record is a finding to surface, not a license to improvise.

## Step 1: Find the operations repo

The canonical client data lives in the `client-operations-canonical` repo. Look for it in this order:

1. Any connected folder named `client-operations-canonical`
2. `C:\Users\dillo\Claude\worktrees\repo-analysis-1bien2\client-operations-canonical`
3. Ask Dillon where it is, and request access to that folder

That second path is a git worktree, so two things follow. It may not exist anymore — worktrees get pruned. And another session may hold a lock on it. If you hit a lock, read around it: read files directly rather than running git commands, and do not try to break or delete a lock file. If you need to write and cannot, write your output somewhere else and tell Dillon the repo was locked.

## Step 2: Resolve the name

Client names in conversation are casual and abbreviated. Map loosely, then confirm if genuinely ambiguous:

| Said as | Client |
|---|---|
| KJB, Kimberly James | Kimberly James Bridal |
| Omega | Omega Landscape |
| Pro Fence, PF&D | Pro Fence & Deck |
| NKCDC | New Kensington CDC |
| Bar Crawl | Bar Crawl USA |

Full active roster: Nexla, Puttery, Bridge, VA Claims, Capsule and Tonic, Everyday Life Insurance, Kimberly James Bridal, Green Slate Masonry, Hope Wellness, Pro Fence & Deck, Omega Landscape, Fresh Blends, Bar Crawl USA, Fagan Painting, NKCDC, Pritzker Law, Revive Systems, Deborah Mara, Onsite Construction.

If a name is not on this list, it is probably a prospect rather than a client. Say so rather than inventing a record — prospect work has its own path.

## Step 3: Read the record and report what you have

A complete client record should give you:

- **Identity** — legal name, trading name, location, primary contact and role
- **Engagement** — service lines purchased, monthly spend, start date, contract shape
- **Brand** — logo files, palette, typefaces, voice notes, existing site
- **Channels** — Slack channel, shared drive folder, ad accounts, analytics and Search Console properties
- **Open items** — anything promised and not yet delivered
- **History** — prior deliverables, so a new one does not contradict an old one

Before you start building, state in one short block what you loaded and what is missing. This is not ceremony — it is the moment where a wrong assumption is cheapest to catch. Something like:

> Omega Landscape — record found. Services: local SEO + Google Ads, $1,400/mo, started Mar 2026. Brand assets present. Slack #omega-landscape linked. Open: conversion-to-named-lead match-back, promised 9 times, still unresolved.

## When the record is missing or thin

Do not fill the gap with plausible-sounding detail. A fabricated service line in a client deck is worse than a blank one, because nobody catches it until the client does.

Instead: say which fields are missing, use what genuinely exists, and mark the gaps in the deliverable itself so they are visible rather than silently guessed. If the client has a Slack channel but no vault record, that is the known leak — say so and offer to run the client intake pass to create the record properly.

## Facts about the agency that do not change

These are stable and you can rely on them without re-checking:

**Momentum Digital** — Philadelphia marketing agency. 1635 Market St #1601, Philadelphia PA 19103. 215-876-2954, hi@needmomentum.com. Founder and CEO Mac Frederick, formerly a Google Small Business Consultant.

**Momentum 360** — the virtual tours and property marketing division, at momentumvirtualtours.com.

**Credentials** — Google Partner, Meta Business Partner, HubSpot, Inc. 5000 Regionals, ThreeBestRated, RankWatch, Clutch (16 reviews).

**Service lines** — SEO (local, technical, ecommerce, by industry, by city, audits, Google Business Profile); Social (Facebook, Instagram, TikTok, Pinterest, LinkedIn); PPC (Google, Facebook, Instagram, Microsoft, Amazon); Design (web, WordPress, Shopify, UI/UX, logo, graphic, brochures, conversion design); AI Marketing; Content (virtual tours, HD photography, drone video, blogging, email); Fractional CMO.

**Coverage** — roughly twenty industry verticals including cannabis, with a Dutchie ecommerce partnership. Thirteen published case studies at needmomentum.com/marketing-case-studies/. Public pricing at needmomentum.com/marketing-prices/.

Do not extend this list from memory. If a deliverable needs a service or a claim that is not here, check the live site or ask.

## Handing off

Once context is loaded, the actual build belongs to whichever skill fits the deliverable — reporting, proposal, spec homepage, brand system, voice. Load context once and carry it; do not make the next step re-resolve the client.

