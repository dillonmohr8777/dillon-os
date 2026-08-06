---
tags: [raw, session, outreach, grader]
date: 2026-08-06
captured_by: agent
---

# 2026-08-06 — PA website grader session

Raw capture. Compiled into [[12_Brain/concepts/Website SIGNAL Score|Website SIGNAL Score]],
[[12_Brain/protocols/prospect-grading-gate|prospect-grading-gate]], and
[[12_Brain/decisions/2026-08-06 - Grade before build, and never pitch a good site|the decision note]].

## The trigger

Slack DM, "Jesse DiLaura, mac", 2026-08-05, after the 100-site Philly deliverable
went out.

**mac, 2:51 PM:**

> also I see the sheet and checked a few of these sites @Dillon Mohr
> a lot of these businesses already have good websites
> I think were moving too fast already
> we need the List > Grader
> meaning it funnels a large list into outreach prospects based on the grader
> so we dont contact businesses that dont need a website or social content
> Example = Suraya = surayaphilly.com
> I dont know the solution to the grader unless we can just scrape GPBs WITHOUT websites
> the other example grader thing I mentioned was that Loom video based on code/grading criteria
> Also I'd like to either use #ai-tech-news for these convos or a DM with Mel + Sean
> otherwise we could fall behind on our input/feedback

**Jesse DiLaura, 3:20 PM:**

> GMB without websites is a big move @Dillon Mohr if we can swing it, I had an
> automation built out if you want to use mine. but it needs some polish.

**Dillon Mohr, 3:37 PM:**

> You got it! Thanks for being thorough @mac that's a great system I agree I'll
> institute it I had it assign scores strictly on the design elements + outdated
> transitions but I think a deeper integration / QA process is totally warranted

**mac, 4:46 PM:**

> thanks guys great stuff here I love the excitement and skills

## Source data

`Momentum 360 — 100 Completed Prospect Websites + Verified Contacts (2026-08-05)`,
PDF, four batches of 25:

| Batch | Focus | Live hub |
|---|---|---|
| B1 | Philadelphia food, culture & retail | philly-site-builder-hub-0711 |
| B2 | Medical, chiropractic & home services | philly-25-homepage-concepts-batch-2 |
| B3 | Plumbing, painting & construction | philly-25-homepage-concepts-batch-3 |
| B4 | Electrical, HVAC & fabrication | philly-25-redesigns-batch-4 |

Sheet coverage as published: 100 businesses, 100 finished homepages, 100 with a
contact route, 108 public emails, 72 businesses with email, 28 phone/form only.

The roster was reconstructed from the PDF's link annotations by
`_os/automation/bin/extract-pdf-roster.js` into `08_Prospects/philly-100/roster.json`.
Contact emails and phone numbers were deliberately **not** carried into the repo:
this GitHub repo is public and the sheet is the system of record for contact data.

## What the first live grade found

Graded 2026-08-06 with weights 1.0.0, static pass only.

| Lane | Count | Pitch a website? |
|---|---|---|
| Enrich (site side says go, ability to pay unknown) | 53 | pending |
| Adjacent offer (site is fine, sell something else) | 19 | no |
| Hands off (site is excellent) | 19 | no |
| Manual review (could not read the page) | 9 | unknown |

**38 of the 100 sites we already built went to businesses that should never have
received a website pitch.** Mac spot-checked a few and was right; the real number
is more than a third.

Per batch:

| Batch | Genuine targets | Adjacent | Hands off | Manual | No site at all | Median SIGNAL |
|---|---|---|---|---|---|---|
| B1 | 5 | 10 | 5 | 5 | 1 | 76 |
| B2 | 11 | 6 | 6 | 2 | 2 | 68 |
| B3 | 25 | 0 | 0 | 0 | **25** | n/a |
| B4 | 12 | 3 | 8 | 2 | 0 | 64 |

Two findings that were not obvious from the Slack thread:

1. **It is not just the restaurants.** B4 (electrical, HVAC, fabrication) had
   8 hands-off and only 12 genuine targets. Several trade contractors are on
   professionally built, schema-complete, 1,500-word sites. Bill Frusco Plumbing
   scored 93 on 12,102 words and Plumber schema. Momentum has been rebuilding
   sites for businesses whose sites are better than most agencies ship.
2. **B3 is the whole answer to Jesse's point.** All 25 of the plumbing, painting
   and construction batch have no website of their own — only trade-directory
   listings (dc21.org contractor lists, psaphcc member lists, city license
   lookups) and a phone number. This is the "GMB without websites" pool, it was
   already in hand, and it is the only batch where the demo is the entire pitch.

## Mistakes the build surfaced

Kept here because they are the reason the grader has the guards it has.

1. **HTTP 202 is not success.** SiteGround answers bots with `202` plus an
   `sg-captcha: challenge` header and a 169-byte body. The first version graded
   that as a real page and scored MOM's Organic Market at 25, Franklin Fountain at
   28, Waste Gas at 28 — all of which have working sites. A confident low score on
   a page we never read is the worst possible failure: it puts a business with a
   good site into the mail queue.
2. **`Number(null)` is `0`.** Missing review data was read as "zero reviews",
   which marked rows as enriched and parked 58 of 100 prospects as
   unable-to-pay. Missing is not zero.
3. **A fast site is not a good site.** A 2011 table-layout page with a marquee
   scored 27 partly *because* it loads fast — it is fast for the same reason it is
   worthless. Hence the obsolescence ceiling.
4. **Thin does not mean unreadable.** The first client-rendered detector flagged
   any framework page under 500 words, which caught Suraya (323 words of real
   server-rendered content plus 45 images) and sent it to manual review. Genuinely
   thin sites are our best prospects, so word count alone must never decide;
   framework markers are the discriminator.

## Environment note

The render pass (Pass 2) drives real Chromium and is verified against a loopback
fixture in `_os/automation/tests/grader.test.js`. In the Claude Code web sandbox it
cannot reach public sites: Chromium does not trust the egress proxy's CA, so
navigation fails with `ERR_CONNECTION_RESET`. Run `--render` from a machine with
direct egress to close the 9 manual-review rows.
