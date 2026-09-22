---
note_type: review
status: active
date: 2026-09-22
updated: 2026-09-22
cadence: daily
job: production-briefs
source: "Slack #momentumsites, #outbound (2026-09-15 to 2026-09-22); 02_Campaigns/; 03_Content/"
tags: [review, cadence, production, briefs]
---

# Production briefs, 2026-09-22

Seven days of `#momentumsites` (C1CFQBC79) and `#outbound` (C0B6UUBMW9M), plus
`02_Campaigns/` and `03_Content/` in this vault.

Items with a **promised count and an unmet delivery** come first. Nothing below
uses "in progress" or "TBD" as a blocker.

---

# Promised count, not met

## 1. AI Site Builder — 20 prospect sites a week, 0 passing QA

**ITEM** Weekly 20-site prospect batch. `02_Campaigns/AI Site Builder Outreach
Engine/batches/`.

**ASKED FOR** 20 `qa_ready` sites per week. Stated in each batch report: "Weekly
target is 20."

**DELIVERED** **0.** Three batches built since 09-15 —
`radar-next20-20260916-052001`, `radar-next20-20260917-052001`,
`radar-next20-20260918-052002` — each `"status": "built-with-holds"`,
`"selected": 20`, **`"qaReady": 0`**. That is 60 sites built, 60 failing, zero
releasable. Every site is on disk and renders; the HTML, 13 images and ~425 words
are all there.

**BLOCKER** One check, failing identically on all 60 rows:
`Generator concept copy is still in the first viewport`. The site generator's
hero-copy substitution does not replace placeholder concept text, so visual QA
returns FAIL and `qa_ready`/`mail_ready` stay `hold` on every row. This is a
single defect in the generator template, not 60 separate content problems — fix
it once and 60 sites become releasable. Held by whoever owns
`_templates/site-factory` (Mac Frederick's pipeline, PR #226 lane).

**ALSO** No batch has been generated since **2026-09-18**. Four days, no run, no
failure recorded. The batch directory listing goes 09-16, 09-17, 09-18, then
stops.

## 2. Apollo outreach — 20 a day promised, 10 delivered

**ITEM** Apollo email outreach to the HVAC industry. Allison Walden.

**ASKED FOR** 20 per day.

**DELIVERED** 10 per day. Beth Kann's `#outbound` update, 2026-09-18 14:09:34:
"Apollo Outreach - 10/20 per day to HVAC industry."

**BLOCKER** The update states the rate without stating why it is half. Allison
and Ian met on Monday 09-14 to discuss Apollo, and the note says "once he
connects with Mac Tues. they'll collaborate" — that Tuesday is **today**. Until
that conversation happens the daily rate has no owner. Named holder: Mac
Frederick, who has the Tuesday slot.

## 3. Felix — 2 pages to review, deadline missed by 4 days

**ITEM** Review two drafted service pages for content, images and CTA buttons.

**ASKED FOR** 2, by Beth Kann in `#momentumsites` 2026-09-17 13:18:40, with an
explicit deadline: "think you could have any edits/feedback by sometime tomorrow
(Friday)?" — Friday was **2026-09-18**.

**DELIVERED** **0 of 2.**
- `needmomentum.com/?page_id=29159` — ChatGPT Ads Management Services
- `needmomentum.com/?page_id=29138` — AI Design Services in Philadelphia

Beth's own weekly summary four days later (09-21 13:42:37) still lists both under
In Progress: "Final review of the ChatGPT Ads and AI Design Services pages.
(Felix)."

**BLOCKER** Felix has not returned the review. Nothing in seven days of channel
history shows him blocked on an input — he shipped the AEO & GEO page in the same
window and Beth thanked him for it. The pages are drafted and reachable; the
review itself is what is missing. Held by Felix.

## 4. Kinka — 3 service pages drafting, 0 published

**ITEM** Draft three service pages, assigned by Beth Kann 2026-09-17 13:33:18.

**ASKED FOR** 3:
- **Pinterest Marketing** — `needmomentum.com/pinterest-marketing-agency/` exists;
  needs more content and a design match to the other social pages.
- **TikTok Marketing** — `needmomentum.com/tiktok-marketing-agency/` exists; same
  treatment.
- **Blog Writing** — does not exist at all. Per the brief, Content → Blogging
  currently points at the blog itself, not a service page.

**DELIVERED** 0 published. Still "Drafting Pinterest, TikTok and Blog Writing
service pages. (Kinka)" in the 09-21 summary.

**BLOCKER** Two of the three are content-expansion on live pages and need a
design-team pass to match the social page template; that design assignment is not
named anywhere in the thread. The Blog Writing page needs a URL decision (replace
the Content → Blogging link or add beside it), which nobody has made. Held by
Beth Kann for the design assignment, Mac Frederick for the menu link.

## 5. Beth — 2 pages in final review

**ITEM** Final review of Instagram Marketing and YouTube Marketing pages.

**ASKED FOR** 2. Self-assigned in the 09-21 summary: "Final review of *Instagram
Marketing* page + *YouTube Marketing* page. (Beth)."

**DELIVERED** 0 of 2.

**BLOCKER** None visible in the channel. Beth holds both and is the same person
holding the industry-pages release (below) and Kinka's design assignment. Her
queue is the bottleneck, not a missing input. Held by Beth Kann.

## 6. Industry service pages — assigned, input withheld

**ITEM** New industry service pages, Ovais to build under Obaid.

**ASKED FOR** No count named; a sheet of pages exists.

**DELIVERED** 0. Obaid asked for the sheet 2026-09-21 14:22:40 so he could put
Ovais on it.

**BLOCKER** Beth Kann held the sheet at 14:24:21 pending a 2:30 meeting with Mel:
"hang tight just a bit and we'll update with any revisions or next steps first."
No message since resolves it, 18 hours later. Held by Beth Kann. This is the same
item as packet 4 in today's ops decision packets.

---

# Promised, delivered

Recorded so nobody re-asks for them.

| item | asked by / when | delivered |
| --- | --- | --- |
| AEO & GEO Services page | Beth → mac for review, 09-17 13:15 | **Published**, `needmomentum.com/aeo-geo-services-philadelphia/`, metadata updated by mac, added to the AI Marketing menu |
| LinkedIn Marketing services page | — | **Published**, added to the Social Media menu |
| Missing case studies on the main page | Melissa → Felix, 09-18 11:52:34 | **Added** to `needmomentum.com/marketing-case-studies/` |
| Marketing deck as a public page | mac → Melissa, 09-15 11:11:57 | **Published**, `needmomentum.com/marketing-agency-services-philadelphia/`, Obaid, 09-21 18:14:56 |
| Plugins and updates review | mac → Obaid, 09-20 11:21:05 | **Reviewed** per the 09-21 summary |
| IG outreach prompt set with CTAs | mac → Allison | **Delivered** 09-15 16:52:02, `Momentum Outreach (IG, Linkedin, Apollo email).xlsx` |
| Press release sequence | Melissa asked twice, 09-15 09:47 and 09-16 13:19 | **Set up**, sends went out 09-18 per Beth's update |

---

# ANSWERED — inputs that already exist in the thread

Carried forward rather than re-asked, per the standing instruction.

- **Landing page meta title and description.** Obaid asked 2026-09-15 13:42:33.
  Mac supplied both at 14:01:42: title "Momentum Digital - Marketing Agency
  Services in Philadelphia", and a full description naming SEO, Google Ads, web
  design, social media, local marketing and lead generation. **ANSWERED — do not
  ask again.**
- **Landing page build constraints.** Obaid asked 12:59:29 whether it had to be
  Elementor. Mac at 13:23:28: custom code is fine, must look like the PDF, must
  carry metadata and SEO for indexing; title and keyword focus supplied.
  **ANSWERED.**
- **Landing page purpose.** Obaid asked 12:48:37 whether it was a landing page.
  Melissa 12:49:33: yes, for potential leads. Mac 12:51:59 refined it: not for
  lead gen or a homepage, an informational overview to share as a link in the
  sales process. **ANSWERED.**
- **Landing page slug.** Obaid asked 14:14:21. Mac: `marketing-agency-services-philadelphia`.
  **ANSWERED.**
- **WP Rocket fatal error cause.** Obaid reported a critical error 09-15
  13:58:43. Felix supplied the likely cause and the fix doc the same day at
  14:24:53: WP Rocket fatal error on WordPress 7.1. **ANSWERED — the fix has not
  been applied**, and "Fix the WP Rocket issue" is still on the 09-21 Next Steps
  list six days later. The blocker is application, not diagnosis.
- **Homepage direction.** Two full reviews already exist and agree.
  Beth 09-17 08:47:00: "I'd say use /homepage-custom as the homepage but
  integrate some of the transitions, Momentum blue vs. the black sections, update
  fonts across". Melissa 09-17 14:37:40: `/homepage-custom` is her favourite,
  "maybe we can combine those elements into Obi's version". **ANSWERED by both
  reviewers, in the same direction.** What is missing is not feedback — it is
  Mac saying yes. "Confirm the new homepage direction" sits in the 09-21 Next
  Steps with **no name on it**.

---

# Two structural notes

**`03_Content/` is not being used for production.** Seven files, all last
modified between 2026-07-09 and 2026-08-01: `Blog Opportunities.md`, `Content
Index.md`, `SEO Keyword Targets.md` and four ad-copy idea stubs. None of the
seven pieces of live page production above is tracked there. The channel is the
system of record and the vault folder is stale.

**`02_Campaigns/` is one active pipeline.** Of four campaign folders — AI Site
Builder Outreach Engine, Growth Workshop, IMMOHRTAL, With Not For — only the site
builder has produced anything in the last seven days, and it produced 60 held
sites.

## What this job did not do

Nothing posted. Nobody asked anything directly. Report only.
