---
tags: [client, video, in-progress]
client: Pro Fence Deck
status: v1-delivered
created: 2026-07-27
---

# Pro Fence Deck — Video Brief

**Deliverable:** ~3–4 minute video. Client-supplied project photos + licensed stock footage.
**Status:** **v1 cut delivered 7/28** — 3:40, 1080p30 MP4, built from 77 photos pulled off
profencedeck.com. Silent. See [[video/README|video/README]] for how it's built and how to re-cut it.

The 30 client photos in `pro-fence-deck-claude-handoff` were never reachable from the
cloud session — `add_repo` stayed permission-gated there even after approval was granted
on the desktop. Swapping them in is a small edit (`SEL` in `build_assets.py` plus the key
lists at the bottom of `template.html`) and a re-render.

## Working Assumptions (confirm or override)
- **Length:** 3:00–4:00
- **Aspect:** 16:9 primary (YouTube / website hero / GBP). Ask if 9:16 cutdowns are needed for Reels/Shorts.
- **Audio:** Licensed music bed, no VO unless Sergei records one. If there's no VO, on-screen text has to carry the whole story.
- **Palette:** Navy `#25386C`, white, warm neutral. Matches their logo and reads well over green-and-blue backyard footage.
- **Type:** Poppins (headlines) / Lato (body) — same as the site, so the video matches the landing pages it'll live on.
- **End card:** Logo, profencedeck.com, (215) 789-6252, "Free Estimates · Licensed & Insured · Bucks & Montgomery County, PA"

## Story Spine
The strongest available angle is **the owner-run craftsman**, not the service list. Every review says the same thing: Serge shows up, Serge answers, Serge sweats the details nobody else would. That's the differentiator against the big regional fence outfits.

Proposed arc:
1. **Cold open (0:00–0:20)** — the finished result. Best hero photo, slow push-in. One line: *"Bucks County's outdoor spaces, built to last."*
2. **The problem (0:20–0:45)** — the tired deck, the leaning fence, the unprotected pool. Stock + any client "before" photos.
3. **Who you're hiring (0:45–1:20)** — the owner-run story. Fast callbacks, honest quotes, one person accountable start to finish. Pull a review quote as an on-screen card.
4. **The work (1:20–2:40)** — service blocks, each 15–25s: **Decks → Fences → Railings → Gates → Pool Safety → Backyard Structures.** Client photos carry this section; stock footage bridges the gaps.
5. **Proof (2:40–3:15)** — review quotes over B-roll. Warranty and materials badges: AZEK · TimberTech · Trex · Jerith · LiftMaster · 50-Year Warranty · Lifetime Pool Fence Warranty.
6. **Close (3:15–3:40)** — CTA, contact card, service area.

## Photo Sorting Plan (for when the pictures land)
I'll sort everything into these buckets so we know what stock has to cover:
- `decks/` — PVC & composite, railings visible, multi-level, lighting
- `fences/` — vinyl, aluminum, chain-link, wood, privacy
- `railings/` — cable, ornamental aluminum/steel, vinyl
- `gates/` — swing, sliding, driveway, openers/hardware
- `pool/` — mesh safety fence, nets, covers
- `structures/` — sheds, garages, gazebos, kennels
- `before-after/` — pairs, if any exist
- `crew/` — Sergei, team, trucks, install-in-progress (highest value, most likely missing)

Also flagging: resolution, orientation, and whether any are duplicates or already on the website.

## Stock Footage Shot List
Needed to fill gaps, especially anything with people or motion. Search terms by beat:

**Openers / atmosphere**
- Aerial pull-back over suburban Northeast homes with backyards, late afternoon
- Golden-hour backyard, no people, shallow depth of field
- Autumn/summer Pennsylvania tree line, wind in leaves

**Problem beat**
- Weathered gray wood deck, splintered boards, peeling stain
- Leaning or broken fence panel
- Unfenced pool, empty backyard (safety tension — no children in shot)

**Craft / process**
- Hands measuring lumber, chalk line snap, tape measure
- Circular saw / miter saw cutting, sawdust in backlight
- Impact driver driving a deck screw, macro
- Post-hole digger, setting a post, level bubble
- Welding sparks / powder-coated metal (matches their in-house fabrication)
- Blueprint or tablet sketch on a tailgate

**Lifestyle payoff**
- Family eating dinner on a deck at dusk, string lights
- Dog running in a fenced yard
- Kids at a pool with a mesh safety fence visible in frame
- Coffee on a railing at sunrise
- Driveway gate opening smoothly (this one is hard to find — may need to shoot or rely on client photos)

**Motion for stills**
Client photos will need Ken Burns / 2.5D parallax to feel like video. Plan on ~4–6s per photo with movement, so a 3:30 video ≈ 35–45 photos plus 15–20 stock clips.

## Open Questions for Dillon
1. Voiceover, on-screen text only, or both?
2. Is this for YouTube/website, paid social, or GBP? Changes pacing hard.
3. Do we have any footage or photos of Sergei and the crew, or is it all finished-work shots?
4. Which stock library are we pulling from (budget + license type)?
5. Which phone number and which "years in business" claim is the approved one?

## Reference
Full company research: [[Pro Fence Deck]]
