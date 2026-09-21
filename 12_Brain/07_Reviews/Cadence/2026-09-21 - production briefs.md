---
note_type: review
status: active
date: 2026-09-21
updated: 2026-09-21
cadence: daily
job: production-briefs
source_refs:
  - "Slack #momentumsites C1CFQBC79, #outbound C0B6UUBMW9M, 2026-09-14 to 2026-09-21"
  - 02_Campaigns/
  - 03_Content/
tags: [review, cadence, production]
---

# Production briefs, 2026-09-21

Every in-flight production item, its requested count, what exists, and the exact
named blocker for what does not. Previous run 2026-09-17.

Leading with items that have a **promised count and an unmet delivery**.

---

## Items with a named count that is not met

### 1. Prospect site batches, 60 built, 0 shippable

- **ITEM** Daily `radar-next20` prospect site batch, AI Site Builder Outreach
  Engine.
- **ASKED FOR** `targetCount: 20` per day, three consecutive days: 09-16, 09-17,
  09-18.
- **DELIVERED** 20 briefs built each day, **60 sites total**. `qaReadyCount: 0`
  on all three.
  - `02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next20-20260916-052001/`
  - `02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next20-20260917-052001/`
  - `02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next20-20260918-052002/`
- **BLOCKER** Every one of the 60 fails QA on the **identical single string**:
  `"Generator concept copy is still in the first viewport"`. Not 60 problems, one
  generator defect reproduced 60 times. It is in the page generator's template,
  not in any prospect's data. Held by whoever owns `_templates/site-factory`;
  the registry records `site-factory-batch` as `status: external-dependency,
  enabled: false, blocked on pr-226`, so **no single person is currently named
  against the generator template**. That is the finding.
- Batches also **stopped after 09-18**. No 09-19, 09-20 or 09-21 batch exists,
  matching the cadence blackout.

### 2. Service page drafting list to Kinka, 3 requested, 0 evidenced

- **ITEM** Beth Kann to Kinka, #momentumsites 2026-09-17 13:33 EDT.
- **ASKED FOR** 3 pages added to the drafting list: **Pinterest Marketing**,
  **TikTok Marketing**, **Blog Writing**.
- **DELIVERED** 0. No acknowledgement from Kinka anywhere in the 7-day window,
  and no draft link posted.
- **BLOCKER** Kinka has not replied. The brief itself is complete; Beth supplied
  the existing Pinterest and TikTok URLs and stated the requirement, match the
  design of the other social service pages and add content. Nothing is missing on
  the input side.

### 3. Two AI service pages awaiting Felix's review, due Friday, 3 days overdue

- **ITEM** Beth Kann to Felix, #momentumsites 2026-09-17 13:18 EDT: review two
  drafted pages for content, images and CTA buttons.
- **ASKED FOR** 2 reviews, with an explicit date: *"think you could have any
  edits/feedback by sometime tomorrow (Friday)?"* Friday was **2026-09-18**.
- **DELIVERED** 0 of 2. Both pages exist as drafts:
  - ChatGPT Ads Management Services, `needmomentum.com/?page_id=29159`
  - AI Design Services in Philadelphia, `needmomentum.com/?page_id=29138`
- **BLOCKER** Felix has not responded to the request. **3 days past the date Beth
  named.** This is the only production item in the window that carried a real
  deadline.

### 4. Monday SEO optimisations, 3 to 5 per week, 0 delivered

- **ITEM** Standing request posted in #momentumsites 2026-09-14 10:00 EDT: each
  Monday Felix reviews GSC and posts **3 to 5 key SEO optimisations** tagging mac
  and Beth for a green light.
- **ASKED FOR** 3 to 5 per Monday.
- **DELIVERED** 0. No such list appears in the channel for Monday 2026-09-14, and
  today is Monday 2026-09-21.
- **BLOCKER** Felix. The routine was requested once and has not run once. Also
  the same person blocking items 3 and 6, which is worth seeing together.

### 5. Industry pages, 3 drafted, 0 tasked into a build

- **ITEM** Beth Kann, #momentumsites 2026-09-14 14:24 EDT, "Next Pages (Main Nav
  Industry Pages): Beth/Mel to review and Beth to task page builds".
- **ASKED FOR** 3: Medical & Healthcare, Spas & Wellness, Home Services. Google
  Docs drafts exist and are linked.
- **DELIVERED** Drafts exist; **0 builds tasked**. No build assignment appears in
  the channel in the 7 days since.
- **BLOCKER** Beth Kann owns the tasking, gated on her and Melissa reviewing
  first. Related capacity is already stated and **ANSWERED**: same message
  records "Obaid/Ovais able to create (1) industry page per day", so three pages
  is three days of capacity that is currently idle.

---

## Items delivered, with follow-up still open

### 6. AEO & GEO services page, PUBLISHED

- **ITEM** AI service page, requested 2026-09-14 in Beth's Ready for Review list.
- **DELIVERED** **Yes.** `needmomentum.com/aeo-geo-services-philadelphia/`,
  published by mac 2026-09-17 13:19 EDT, metadata updated by him.
- **BLOCKER on the remainder** mac's same message assigned Felix three follow-ups:
  double-check internal linking, image tags plus compression, and add the page
  under the AI MARKETING menu. **No acknowledgement from Felix.** The page is
  live with unverified internal linking and no menu entry, so it is published but
  not navigable from the nav.

### 7. Instagram Marketing page, "Go Live this Week"

- **ITEM** `needmomentum.com/?page_id=28796`, updates by Ovais, listed 09-14
  under "Page Updates (Go Live this Week)".
- **DELIVERED** Updates made by Ovais per Beth's own note. **No confirmation it
  went live.** The week it was promised for ended 09-19.
- **BLOCKER** No named owner for the publish step. Beth listed it, Ovais built
  it, nobody said it shipped.

### 8. YouTube Marketing page

- **ITEM** `needmomentum.com/?page_id=28817`, listed 09-14 as Ready for Review.
- **DELIVERED** Draft exists.
- **BLOCKER** Never mentioned again in 7 days. No reviewer named, unlike the
  ChatGPT Ads and AI Design pages which at least got assigned to Felix.

---

## Items where every input is answered and only the build is missing

### 9. Marketing deck as a web page, all inputs ANSWERED

Every question anyone asked on this thread has already been answered. Carrying
them forward rather than re-asking:

| input | status |
| --- | --- |
| Source material | **ANSWERED.** Melissa's new marketing deck, shared 2026-09-15 11:11. |
| Purpose | **ANSWERED.** mac, 12:51: informational overview page to share as a link in the sales process, not lead gen, not a homepage. |
| Elementor or custom code | **ANSWERED.** mac, 13:23: custom code is fine, can look exactly like the PDF. |
| Title | **ANSWERED.** "Momentum Digital - Marketing Agency Services". |
| Keyword focus | **ANSWERED.** "Digital Marketing Agency Services Philadelphia". |
| Meta title | **ANSWERED.** mac, 14:01: "Momentum Digital - Marketing Agency Services in Philadelphia". |
| Meta description | **ANSWERED.** mac, 14:01, full text supplied. |

- **DELIVERED** 0. No page URL posted.
- **BLOCKER** Obaid. He accepted the work at 12:51 on 09-15 and confirmed at
  13:41 he would build it with metadata and SEO. Six days, no link. Nothing is
  waiting on an input.

### 10. Homepage choice, feedback complete, decision missing

- **ITEM** mac, 2026-09-14 14:46, asked the channel to pick between two homepage
  builds and said the loser becomes a "Digital Marketing Services Philadelphia"
  service page.
- **ASKED FOR** One decision.
- **DELIVERED** Both builds exist: `needmomentum.com/felix-test-page/` (Felix)
  and `needmomentum.com/homepage-custom/` (Obaid). Two detailed written reviews
  exist, Beth 09-17 08:47 and Melissa 09-17 14:37, and **they agree**: use
  `/homepage-custom` as the base for content and structure, pull the hero copy,
  transitions and Momentum blue from `/felix-test-page`.
- **BLOCKER** mac. He asked for the input, got it from both reviewers four days
  ago, and has not called it. Two people's page builds are parked behind one
  answer. **Nothing further should be asked of Beth or Melissa on this; their
  answers are on record above.**

### 11. Case studies missing from the case studies page

- **ITEM** Melissa Silber to Felix, 2026-09-18 11:52 EDT, case studies missing
  from `needmomentum.com/marketing-case-studies`.
- **DELIVERED** 0. Unanswered 3 days.
- **BLOCKER** Felix. Related and **ANSWERED** upstream: Melissa said on 09-14
  "A few more case studies should be coming this week too", so supply is not the
  constraint, the page edit is.

### 12. Page speed and plugins

- **ITEM** mac to Obaid, 2026-09-15 13:24: "BIG Focus this week and next on Page
  Speed + Performance", with a PageSpeed Insights mobile report linked, and again
  2026-09-20 11:21: "can you please look into our plugins and updates".
- **DELIVERED** No measurement posted, before or after.
- **BLOCKER** Obaid. Also visible in the same thread: the WP Rocket plugin was
  disabled because it threw a critical error, and Felix pointed at the WordPress
  7.1 fatal-error doc on 09-15 14:24. **Nobody confirmed the fix, and WP Rocket
  is a caching plugin.** So the site is being asked to improve page speed with
  its caching layer switched off. That connection has not been made in the
  thread.

---

## Outbound production

### 13. Press release sequence

- **ITEM** Press release outreach.
- **DELIVERED** Beth's 09-18 roll-up records "Press Release Outreach - set up
  sequence and sends to go out today". That is the only delivery evidence.
- **BLOCKER on the answer** Melissa asked Allison Walden for a status on
  2026-09-15 09:47 and again on 2026-09-16 13:19. **Neither was answered
  directly.** The status eventually surfaced two days later inside Beth's team
  roll-up, not as a reply to Melissa.
- This is precisely Melissa's standing complaint, and it happened twice in one
  week.

### 14. Instagram and Apollo outreach prompts

- **ITEM** Allison Walden's outreach prompt sheet, shared 2026-09-15 16:52.
- **DELIVERED** Sheet exists. Beth reviewed 09-16 13:15, said "these are looking
  better", supplied two 17hats conversion links to include, and promised closer
  feedback.
- **BLOCKER** Beth Kann's promised closer review, not yet posted 5 days later.
  Allison asked directly on 09-15 16:53, "let me know if those look better or if
  there anything you would like me to change".

---

## The pattern

Fourteen items. **Not one of them is blocked on a missing input.** Every brief in
this window is complete; where a question was asked it was answered, usually
within the hour, and this report carries those answers forward rather than
re-asking them.

What is missing in all fourteen cases is somebody doing the next step.

Blockers by holder: **Felix 4** (items 3, 4, 6, 11), **Obaid 2** (9, 12),
**mac 1** (10), **Beth 2** (5, 14), **Kinka 1** (2), **Allison 1** (13),
**no named owner 3** (1, 7, 8).

The three with no owner are the expensive ones: 60 built sites nobody can ship,
and two finished pages nobody is assigned to publish or review.

## What this job did not do

Nothing posted, nobody asked anything directly. Report only.
