---
tags: [campaign, markets, roadmap]
campaign: "[[AI Site Builder Outreach Engine]]"
cadence: 25 sites per week
---

# Market Roster

The geography ladder for the outreach engine: Philadelphia, then Pennsylvania, then national. One batch per week, 25 sites per batch.

**Important framing:** Slack contains no explicit Philadelphia to PA to national directive from Mac or Melissa. What Slack asks for is automating the Philly engine and running continuous weekly batches into outreach (see [[Slack Evidence Log]]). This ladder is the expansion plan built on top of that ask. Confirm the sequencing with Mac before Wave 2 spend.

## Why this order

- **Philadelphia first** because we can shoot our own photography there (Sean's $200 pano shoots in `#360newprojects`), we can name local proof, and Momentum is a Philadelphia agency. Local credibility carries the cold open.
- **Pennsylvania second** because the pitch stays regional and referenceable, drive-time meetings are still possible, and the same local-SEO playbook applies.
- **National third** and organized by vertical rather than geography, because at that point the wedge is "we already build sites for HVAC companies" rather than "we're local."

## Verticals (fixed across all waves)

Mirrors the industry pages the website team is building on needmomentum.com in `#momentumsites`, so prospect sites and industry pages reinforce each other.

| Vertical | Industry page status | Notes for the factory |
|---|---|---|
| Home Services | Drafted | HVAC, roofing, plumbing, concrete, landscaping, dryer vent, janitorial. Best decay rates, clearest ROI story. |
| Medical & Healthcare | Drafted | Dental, derm, plastic surgery, chiropractic. Higher budgets, slower cycles. |
| Spas & Wellness | Drafted | Existing proof: Zen Spa at Tropicana. |
| Legal & Law Firms | Drafted | High value per client. Existing: Bok Law. |
| Restaurants & Food | Not a nav page | Strongest Philly batch performance so far (the 25 skew here). Lower budgets, high referral volume. |
| Industrial & Manufacturing | Drafted | Long sales cycle, very dated sites. |
| Cannabis & Restricted | Drafted | Ad restrictions make organic and web the whole offer. |
| Multi-Location & Franchise | Drafted | Highest ticket. Reserve Tier B bespoke builds here. |
| Professional Services | **Needed** | Accountants, insurance, consultants, real estate. |
| Ecommerce | **Needed** | Weakest fit for a static mirror homepage; deprioritize. |

## Wave 1: Philadelphia

Home market. Target 8 to 10 weekly batches.

**Shipped:** 25 prospect homepages (skewed restaurants, food retail, and culture), 3 Kimi bespoke pilots (Bicycle Therapy, Head House Books, Maleek Jackson), 3 deeper multipage pilots (Peter Mechanical, The Roof Doctor, Graveley Roofing).

**Coverage gap:** the shipped 25 are heavily food and culture. Home services, medical, and legal are barely touched in Philadelphia despite being the higher-value verticals. Next Philadelphia batches should invert that mix.

Neighborhood and submarket queue: Fishtown, Northern Liberties, South Philly, Passyunk, Manayunk, Roxborough, Chestnut Hill, Mount Airy, Germantown, Kensington, Port Richmond, Bella Vista, Queen Village, Graduate Hospital, University City, Rittenhouse, Old City, Northeast Philly, plus the Main Line, Delco, Montco, Bucks, and South Jersey collar.

## Wave 2: Pennsylvania

Same engine, new markets. One market per batch keeps the review hub coherent and the local proof honest.

| Market | Metro population scale | Notes |
|---|---|---|
| Pittsburgh | Largest PA market after Philadelphia | Distinct local identity; don't reuse Philly copy patterns |
| Erie | Home-town advantage | Dillon is from Erie; warmest cold market on the list. Strong first Wave 2 test. |
| Allentown / Bethlehem / Easton | Lehigh Valley | Growing, lots of dated home-services sites |
| Harrisburg | State capital | Professional services and government-adjacent |
| Lancaster | Tourism and trades | Strong small-business density |
| Reading | Industrial | Manufacturing vertical fit |
| Scranton / Wilkes-Barre | Northeast PA | Underserved by agencies |
| State College | College town | Seasonal, hospitality-heavy |
| York | Manufacturing and trades | Pairs with Reading |
| Bethlehem / Doylestown / West Chester | Affluent suburbs | Higher-ticket medical and legal |

## Wave 3: National, by vertical

Stop leading with geography. Lead with "we build sites for your industry" and target the metros where the vertical concentrates.

Sequencing by ROI, best first:

1. **Home Services** in Sun Belt metros (Phoenix, Dallas, Houston, Atlanta, Tampa, Charlotte, Las Vegas). Year-round demand, high ad spend, notoriously dated sites.
2. **Medical & Healthcare** in affluent suburbs nationally.
3. **Legal** in secondary metros where competition is thinner than in NYC or LA.
4. **Multi-Location & Franchise** anywhere; these justify Tier B bespoke builds and the largest retainers.
5. **Industrial & Manufacturing** across the Rust Belt, which overlaps Wave 2 relationships.

## Batch sizing and cadence

- **25 sites per batch, one batch per week.** That's the stated target and what `build-batch.js` enforces via `targetCount`.
- One market and ideally one or two verticals per batch, so the hub reads as a coherent pitch.
- Batch IDs: `<market-code>-<year>-w<week>`, for example `phl-2026-w31`, `pgh-2026-w34`, `eri-2026-w36`.
- Prospect ID prefixes: `PHL`, `PGH`, `ERI`, `ALN`, `HBG`, `LAN`, `RDG`, `SCR`, `SCE`, `YRK`.

## Selection criteria per batch

Pulled from the qualification stage in [[Pipeline Spec]]. Rank candidates by:

1. Site decay score (missing viewport, no mobile layout, stale copyright, thin homepage, no phone above the fold)
2. Evidence they can pay (review volume, price point, multiple locations, already running ads)
3. Vertical fit with an existing Momentum industry page and case study
4. Whether we can source real photography (their own site, socials, or our own shoot)

Hard exclusions every batch: current Momentum clients (cross-check `01_Clients/`), active pipeline deals, anyone previously mailed, and any business whose facts can't be verified.

## Tier assignment

- **Tier A (template batch)** for all 25 per week. Shared architecture, per-brand tokens, built by the factory.
- **Tier B (bespoke)** only after a prospect engages, following the Kimi pilot approach: its own architecture, typography, and motion language. Never spend Tier B effort on cold volume.
