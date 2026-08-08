---
lane: content-routines
run: competitive-task-orchestrator
date: 2026-08-08
scout: content-routines
source_mode: vault-primary
sources:
  - 03_Content/
  - 02_Campaigns/
  - SEO/AlignHCM/Blogs/
  - 01_Clients/*/overview.md (Jeff Hozias, Bar Crawl USA, Kimberly James Bridal, Shadow HVAC, Omega Landscaping, Hardwood Artisan)
  - 01_Clients/*/content-calendar.md
  - automation-runs/competitive-task-orchestrator/2026-08-08/lane-outputs/vault-pulse.md
thursday_align_sweep: false
---

# Content Routines — Run 3 · 2026-08-08

Tier 0 read-only scout. Implements `/content-scan` logic for the orchestrator.

**Thursday note:** Today is Saturday 2026-08-08 — **no Align HCM blog publish sweep flag**. Ten Align drafts remain `ready-to-publish` for the next weekday block.

**Vault staleness:** 12 of 14 M360 clients have `last_touched` predating 2026-05-01. Cadence gaps below use vault dates; live SocialBee / GBP dashboards may be ahead.

---

## Ship this week (max 5)

Ranked by evidence strength and competitive exposure. Single edit = the one blocker before publish.

| Rank | Piece | Client / lane | Single edit needed |
|------|-------|---------------|-------------------|
| 1 | **Wedding Dress Timeline** landing page | Kimberly James Bridal | Squarespace publish (Kim approved 2026-04-13) + GA4/GSC index check for Mac — **116d overdue** |
| 2 | **Meta seller campaign** — "Not a Zestimate. Not a guess." Home Valuation angle | Jeff Hozias | Push approved seller copy live in Meta Ads Manager; confirm pixel + lead form — **116d overdue** |
| 3 | **`what-is-hcm-software-blog.md`** (SEO 9.2) | Align HCM (full-time) | CMS publish on next weekday blog block — zero content edits; operator/CMS access only |
| 4 | **Plus-Size Wedding Dresses in Philadelphia** landing page | Kimberly James Bridal | One final QA pass on Squarespace build, then publish + indexing check (venues page pattern) |
| 5 | **Custom Home Builder pillar audit + Janice interview** | BigOrange Marketing | Draft audit doc and interview questions for **2026-08-10** team review — **due in 2 days** |

**Just below the cut:** Bar Crawl USA disapproved-ad remediation (Halloween / Fall Cocktail Crawl copy indexed into policy review) — not a new creative ship; needs disapproval clearance in Ads UI, then no new copy. Jeff **buyer-side** Meta variants are mentioned in overview but seller side is the only copy with explicit approval in vault intel.

---

## Cadence gaps

Contracted cadence vs vault `last_touched` (days computed to 2026-08-08).

| Client | Channel | Days since last vault touch | Contracted cadence | Gap signal |
|--------|---------|----------------------------|--------------------|------------|
| **Shadow HVAC** | GBP | **159** (2026-03-02) | 4 posts/week | Gmail quiet since LSA background-check reset; GBP cadence **unverified**; no April–August report in vault |
| **Hardwood Artisan** | GBP | **123** (2026-04-07) | 4 posts/week | `status: at_risk` — Sean card-update push; engagement may be **paused** if billing lapsed; Edmond/Stillwater visibility still weak |
| **Jeff Hozias** | GBP (SocialBee pipeline) | **116** (2026-04-14) | 3 long-form posts/week | March report flagged **GBP post rejections** without clear reason; rejections root cause never closed in vault |
| **Jeff Hozias** | Meta Ads | **116** | Seller + buyer campaigns | Approved seller copy still not launched; LSA abandoned per 2026-03-20 strategy call |
| **Omega Landscaping** | GBP | **116** (2026-04-14) | 4 posts/week + GMB blog updates | March report confirmed **12 posts** (2026-03-09–end of March); **no vault confirmation** for April–August cadence |
| **Omega Landscaping** | Meta / drone creative | **126+** (drone chase 2026-04-02) | John Belaska paid lane | Drone footage for Facebook ads still outstanding — blocks paid creative, not GBP text |

**Not GBP/social cadence clients in today's read set:** Kimberly James Bridal runs **SEO landing pages** (no recurring GBP/social in scope). Bar Crawl USA is **paid search/PMax only** — ad compliance gap, not content cadence.

---

## Best raw ideas (3)

1. **Shadow HVAC cooling-season GBP catch-up batch** — Generate and queue 12–16 hyper-local AC-prep / emergency-cooling posts. Largest contractual gap (159d) and peak-season competitive exposure while LSA live status remains uncertain.
2. **Align HCM 10-blog publish runway** — All drafts in `SEO/AlignHCM/Blogs/` are `ready-to-publish`. One per weekday = ~2.5 months of pipeline with no editing cost; prioritize high-intent keywords (`adp alternatives`, `switching from adp`, `ukg vs adp`) after the explainer ships.
3. **KJB "bridal appointment prep" editorial** — Next candidate on KJB content calendar. Reuse the **KJB Styling Tip** device from the Venues page: tie appointment checklist items to gown silhouettes and designers. Natural fourth landing page after Plus-Size ships.

---

## Kill list

Stale or empty scaffolding that pollutes the content pipeline scan — archive, populate, or delete.

| Item | Why kill |
|------|----------|
| `03_Content/Content Index.md`, `Blog Opportunities.md`, `SEO Keyword Targets.md` | Empty MOC shells — scan noise; real targets live in client folders and `SEO/AlignHCM/` |
| `03_Content/Facebook Ads Hook Library.md`, `Conversion Ad Copy Ideas.md`, `Lead Form Ad Copy Ideas.md`, `Retargeting Ad Ideas.md` | Zero entries — false signal of an active idea pipeline |
| `02_Campaigns/Facebook Ads Creative Requests.md` | Empty pending queue while real requests live in client `active-campaigns.md` and Gmail intel |
| `01_Clients/*/content-calendar.md` with `month: 2026-04` | April thematic guidance (spring AC prep, spring hardscape) is **4 months stale** — update to August or archive month field |
| `01_Clients/Jeff Hozias/Facebook Ads Strategy.md`, `Creative Angles.md`, `Facebook Ads Testing Roadmap.md` | Empty stubs; approved copy and strategy decisions exist only in `overview.md` Gmail intel — consolidate or delete duplicates |

---

## Pipeline scan notes

### `03_Content/`
Eight files total. **No ship-ready drafts** — all are empty templates or hook-library shells. Cross-reference value is nil until populated.

### `02_Campaigns/` (active)
- **AI Site Builder Outreach Engine** — site-grader content, not client publish pipeline.
- **IMMOHRTAL/Social/** — four-week posting schedule with final captions and asset paths (`Posting Schedule.md`, `posting-schedule.csv`). Ship-ready for personal brand but gated on Dillon approval per `Weekly Capture Handoff.md`; not M360 client delivery.
- **Ad optimization queues** (`Google Ads Optimization Queue`, `Facebook Ads Optimization Queue`, `Landing Page Build Queue`) — **empty**.

### `SEO/AlignHCM/Blogs/` vs `03_Content/SEO Keyword Targets.md`
Ten Align blogs ready; vault keyword-target file is empty. **All SEO ship-ready inventory is in `SEO/AlignHCM/Blogs/`**, not `03_Content/`.

### Client overviews read today
- **Jeff Hozias** — GBP rejections + Meta pivot; seller copy cleared, launch blocked.
- **Bar Crawl USA** — alcohol-compliance ad crisis; pre-approved library is source of truth.
- **Kimberly James Bridal** — Timeline approved; Plus-Size near final; Mac indexing discipline on every publish.
- **Shadow HVAC** — LSA reset done 2026-03-02; GBP cadence check never resumed in vault.
- **Omega Landscaping** — Strong March GBP batch; David asset handoffs unreliable; John Belaska owns Meta side.
- **Hardwood Artisan** — Billing at risk; visibility gaps in Edmond/Stillwater/Enid unchanged since March.

---

*Generated by content-routines scout — Run 3, 2026-08-08*
