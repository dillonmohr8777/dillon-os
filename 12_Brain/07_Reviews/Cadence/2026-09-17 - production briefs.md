---
note_type: review
status: active
date: 2026-09-17
updated: 2026-09-17
cadence: daily
job: production-briefs
tags:
  - cadence
  - production
  - momentum
source_refs:
  - Slack #momentumsites C1CFQBC79 and #outbound C0B6UUBMW9M, 2026-09-10 to 2026-09-17
  - 02_Campaigns/ and 03_Content/ in this vault
---

# Production briefs - 2026-09-17

Twelve in-flight production items. Leading with the four that carry a promised count and have not met it.

Nothing below asks a question that has already been answered somewhere in the thread or the vault. Where an input exists, it is carried forward and marked **ANSWERED**.

---

# Promised count, unmet delivery

## 1. AI Site Builder prospect sites - 40 built, 0 shippable

- **ITEM** Weekly prospect-site batches from the AI Site Builder Outreach Engine. Self-set target, stated in every batch report.
- **ASKED FOR** 20 qa_ready sites per batch.
- **DELIVERED** **0 of 20 on 2026-09-16, 0 of 20 on 2026-09-17.** Both batches built all 20 sites to spec on every measurable axis - batch average 10 sections, 425 words, 13 images, 30 KB, against canonical targets of 9-11 sections, 350-500 words, 12-13 images. Every one still fails QA.
  - `02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next20-20260916-052001/` - 20 sites, `qa_ready_count: 0`
  - `02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next20-20260917-052001/` - 20 sites, `qa_ready_count: 0`
- **BLOCKER** **"Generator concept copy is still in the first viewport."** That exact string is the Notes value on all 20 rows of both batch reports, with no variation. It is one template defect in the generator's hero block, not forty site problems. Whoever owns the site generator's hero template holds this. No owner is named in either batch report - that is the second half of the blocker.

Three earlier batches in the same window produced **nothing at all**: `radar-next20-20260912-052002`, `-20260913-052002` and `-20260914-052002` each contain a single `LOGO-HOLDS.json` and no `sites/` directory, no `batch-report.md`, no manifest. Five scheduled batch days, two that produced sites, zero shippable output from any of them.

## 2. Main-nav industry pages - 3 outlined, 0 built, against a stated 1-per-day capacity

- **ITEM** Next crop of main-nav industry pages. Beth Kann, Slack #momentumsites 2026-09-14 14:24 and 14:47.
- **ASKED FOR** 3 named pages, with capacity explicitly stated as "Obaid/Ovais able to create (1) industry page per day".
- **DELIVERED** 0 built. Three Google Docs outlines exist and are linked: Medical & Healthcare, Spas & Wellness, Home Services.
- **BLOCKER** Beth and Melissa Silber must review the outlines before Beth can task the builds. Beth proposed a meeting - "Melissa Silber do you want to meet tomorrow at 3 to talk through?" (09-14 14:47). No answer to that question appears in the channel in the three days since. At the stated one-page-per-day rate, three days of unanswered meeting request is three pages not built.

## 3. Weekly SEO recommendations - 3 to 5 asked, 0 delivered

- **ITEM** Monday SEO review. Standing automated ask from the "Monday SEO Task List" bot, #momentumsites 2026-09-14 10:00.
- **ASKED FOR** "3-5 key SEO optimizations/improvements ... tag mac and Beth Kann with the list for the green light to proceed", every Monday.
- **DELIVERED** 0. No list from Felix appears in the channel on 2026-09-14 or since.
- **BLOCKER** Felix. Melissa Silber chased the same day - "any updates here Felix" (09-14 14:26) - and it is still unanswered on 09-17. **ANSWERED already, do not re-ask:** Mac supplied the tooling on 09-10 08:46 (UberSuggest via the team Gmail login) and the working instruction ("focus on biggest most important SEO first, a few updates per week"). The inputs are not missing; the output is.

## 4. Homepage - 2 of 2 drafts delivered, 0 of 1 chosen

- **ITEM** New needmomentum.com homepage. Mac Frederick, #momentumsites 2026-09-14 14:42.
- **ASKED FOR** 2 draft candidates; 1 selected as homepage, the other converted to the "Digital Marketing Services Philadelphia" service page.
- **DELIVERED** Both drafts, same day, both linked and reviewable (login required):
  - Option 1, Felix - `needmomentum.com/felix-test-page/`
  - Option 2, Obaid - `needmomentum.com/homepage-custom/`
- **BLOCKER** Mac Frederick has not picked. Posted `@channel` asking everyone to "Pick your Favorite"; 2 thread replies, no decision, 3 days. Production is complete and the conversion work cannot start. Full packet in today's `ops decision packets`, item 3.

---

# Everything else in flight

## 5. Instagram Marketing page

- **ASKED FOR** 7 specific feedback fixes (Beth Kann, 09-11 16:07) plus 2 open questions.
- **DELIVERED** All 7 fixes shipped by Ovais, 09-13 06:07, each individually check-marked: banner subhead, button copy, 4-section dropdowns with inverted Momentum-blue styling, the mobile headline overlap on "What's included", expandable dropdowns, GET IT NOW button targets, the "Real Brands, real results" mobile headline. Live at `needmomentum.com/?page_id=28796`. Listed as "Go Live this Week" on 09-14.
- **BLOCKER** Two items, both held by **Mac Frederick**, asked directly on 09-11 and unanswered: confirm the pricing section, and decide whether to link out to Momentum 360 more. A third, smaller one held by Beth Kann: the "Want to Learn More" section links to blogs Beth flagged as "quite old" and asked for newer ones - no replacements supplied.

## 6. AI Design Services page

- **ASKED FOR** 1 page.
- **DELIVERED** Built and marked Ready for Review by Ovais, 09-13 06:07. `needmomentum.com/?page_id=29138`.
- **BLOCKER** **Beth Kann owes images.** Ovais, 09-13: "i will be needing relevant images so i make spaces for them in sections, Please send it over to me". Image slots are cut into the layout and empty. Still carried as "Ready for Review" in Beth's 09-14 list, which hides that it is waiting on her.

## 7. ChatGPT Ads Management Services page

- **ASKED FOR** 1 page.
- **DELIVERED** Built and marked Ready for Review by Ovais, 09-13 06:07. `needmomentum.com/?page_id=29159`.
- **BLOCKER** Identical to item 6 - Beth Kann owes images, slots cut and empty.

## 8. Agency overview page, from the marketing deck

- **ITEM** Turn `Momentum-Digital-Agency-Overview-2026 revised.pdf` into an indexable page Mac can share as a public link in the sales process. Mac, 09-15 11:11.
- **ASKED FOR** 1 page.
- **DELIVERED** 0. Obaid accepted it at 12:51 - "Okay, I will work on this" - and confirmed at 13:41 he would include metadata and SEO.
- **BLOCKER** No draft link posted in the 2 days since acceptance. Obaid holds it. **Every input this build needs is ANSWERED and must not be re-asked:**
  - Purpose - "not meant for lead gen or as a home page, more as an informational overview page I can use as a shared link in sales process" (Mac, 12:51)
  - Build method - custom code approved, "it can look the exact same as the PDF" (Mac, 13:23)
  - Title - Momentum Digital - Marketing Agency Services
  - KW focus - Digital Marketing Agency Services Philadelphia
  - Meta title - Momentum Digital - Marketing Agency Services in Philadelphia (Mac, 14:01)
  - Meta description - supplied in full, same message
  - Source asset - the PDF, attached 09-15 11:11 (F0C1U8PRUE7)

## 9. Blog Writing service page

- **ITEM** Mac, 09-14 14:35: "lets get an actual service page for Blogging".
- **ASKED FOR** 1 page. Title = Blog Writing. KW Focus = Blog Writing Services. Both **ANSWERED** in the original ask.
- **DELIVERED** 0.
- **BLOCKER** **No owner was ever named.** It appears on Beth's 09-14 list as "Content -> Blogging -> Create Blog Writing service page" with no person attached, and nobody has claimed it in three days. This is the thin-brief failure in its purest form: the brief is complete, the assignment is missing.

## 10. Kinka YouTube-to-blog drafts

- **ITEM** Load YouTube-derived blog content into WordPress as drafts. Beth Kann, 09-14 14:47.
- **ASKED FOR** No count named. The process is defined: duplicate the formatting of Felix's "How to Transfer a Facebook Business Page to a New Owner" draft (post 28976), get **Mac's approval on the first draft** to fix formatting, then Felix approves the remainder.
- **DELIVERED** 0 drafts visible in the channel.
- **BLOCKER** The first Kinka draft has not been produced, so Mac's approval gate has never been reached and Felix's bulk approval cannot start. The whole pipeline is behind one artifact that does not exist yet. Owner: Kinka, unmentioned in the channel since the task was written.

## 11. Press release follow-up sends

- **ITEM** Beth Kann, #outbound 09-11 14:22: "Allison to check press release section for follow-up etc. to send out next week (use Mac's industry template)".
- **ASKED FOR** No count named. Window was 2026-09-14 to 09-18.
- **DELIVERED** 0.
- **BLOCKER** Allison Walden. Three direct asks from Melissa Silber unanswered - 09-11 09:29, 09-15 09:47, 09-16 13:19. Allison was active in the channel between each of them, so this is not absence. Full packet in today's `ops decision packets`, item 8.

## 12. Instagram outbound prompts

- **ITEM** Allison Walden, #outbound 09-15 16:52.
- **ASKED FOR** "curate Instagram messages with personable touch + CTA offer" (Beth, 09-11). No count named.
- **DELIVERED** 1 file - `Momentum Outreach (IG, Linkedin, Apollo email).xlsx`, Google Sheets link plus Slack attachment F0BUGV2S3R8. Beth reviewed 09-16 13:15 ("These are looking better") and supplied two 17hats conversion links to fold into the outreach, recommending the free-marketing-audit form as the primary CTA.
- **BLOCKER** Not blocked on Allison. Beth said "I'll review a bit closer for more feedback" and that closer review has not landed, so the prompts cannot be locked. **Flag:** the Slack file record for that attachment reads **0 Bytes**. The Google Sheets link is the live copy; anyone opening the Slack attachment gets nothing.

---

## Not enough evidence to score

- **Third batch of Meta creatives** - Alexandra Rojas, #ghl-leads-apollo 09-15 10:07: "I'm working on a third batch of creatives". No count promised, no delivery date, nothing posted since. Genuinely in progress rather than blocked, so it is recorded but not scored.
- **Case studies** - Melissa Silber, #momentumsites 09-14 14:25: "A few more case studies should be coming this week too". No count, no owner, no artifact. Too thin to score either way; will appear as a real row if a count or an owner is ever attached.

## What this job did not do

Nothing posted, nobody asked anything directly. Report only.
