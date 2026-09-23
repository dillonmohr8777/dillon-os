---
note_type: review
status: active
date: 2026-09-23
updated: 2026-09-23
cadence: daily
job: production-briefs
source: "Slack #momentumsites (C1CFQBC79), #outbound (C0B6UUBMW9M), window 2026-09-16 08:09 to 2026-09-23 08:09 EDT (oldest=1789560548, latest=1790165348); 02_Campaigns/; 03_Content/"
previous: "[[2026-09-22 - production briefs]]"
tags: [review, cadence, production, briefs]
---

# Production briefs, 2026-09-23

Slack read live this run with both `oldest` and `latest` set; newest message in
window is 2026-09-22 18:18:57 EDT, oldest 2026-09-16 13:15:17 EDT, so the page is
current, not the stale one. Batch JSON under `02_Campaigns/` re-read this run.
Items with a promised count and an unmet delivery come first. No blocker below is
"in progress" or "TBD".

## What changed since yesterday

- **Felix delivered both review pages** (09-22 18:18:57). Item moves from "Felix
  holds it" to "Beth holds the check". Was 0 of 2, now 2 of 2 returned.
- **Kinka delivered 1 of 3** (09-22 14:32:55): Pinterest Marketing draft as a
  Google Doc. Beth replied "Will review this week"; mac thanked her.
- **New item found:** Melissa asked Obaid (09-21 16:49:35) to use her lead sheet
  for the leads/sources to quotable reporting update. Missed yesterday.
- **New item found:** Monday SEO Task List reminder (09-21 10:00:05) asks Felix
  for 3 to 5 GSC based optimizations each Monday. Missed yesterday.
- **Landing page speed question ANSWERED** in thread (see ANSWERED section).
- **Still no site builder batch.** Last one 2026-09-18. Now 5 days with no run.
- **Industry pages sheet still held.** Now about 42 hours since Beth's 2:30
  meeting note with no follow up in channel.
- Nothing new in `02_Campaigns/` or `03_Content/` since 2026-09-21 (file scan).

---

# Promised count, not met

## 1. AI Site Builder: 20 prospect sites a week, 0 passing QA

**ITEM** Weekly 20 site prospect batch. `02_Campaigns/AI Site Builder Outreach Engine/batches/`.

**ASKED FOR** 20 `qa_ready` sites per week ("Weekly target is 20" in each batch report).

**DELIVERED** **0 releasable.** Re-verified today: `radar-next20-20260916-052001`,
`radar-next20-20260917-052001`, `radar-next20-20260918-052002` each show
`"status": "built-with-holds"`, `"selected": 20`, `"qaReady": 0`, and 20 of 20
rows `"qaReady": "hold"`. 60 built, 0 releasable. No batch this week at all
(week of 09-21: 0 of 20 even attempted).

**BLOCKER** One generator defect failing all 60 rows: `Generator concept copy is
still in the first viewport`. Fix the hero copy substitution in the site factory
template once and 60 sites re-run QA. Holder: owner of `_templates/site-factory`
(Mac Frederick's pipeline, PR #226 lane). Second, separate blocker: the scheduled
batch job has produced no directory since 2026-09-18 05:32 with no failure
recorded in the batches folder; holder is the scheduler owner (Dillon's
automation estate), who needs to check why the 05:20 run stopped.

## 2. Apollo outreach: 20 a day promised, 10 delivered

**ITEM** Apollo email outreach to HVAC. Allison Walden.

**ASKED FOR** 20 per day.

**DELIVERED** 10 per day, per Beth's #outbound update 09-18 14:09:34. No newer
rate reported in the window.

**BLOCKER** Why the rate is half is not stated anywhere. The note said Ian would
connect with Mac on Tuesday (09-22) and then collaborate with Allison; no message
in #outbound since 09-21 17:15 records that conversation. mac's 09-21 17:15
message reassigned Allison to local networking and Ian to partnerships, and did
not mention Apollo. Holder: Mac Frederick, to state whether 20/day still stands.

## 3. Kinka: 3 service pages, 1 drafted, 0 published

**ITEM** Pinterest, TikTok, Blog Writing service pages. Assigned by Beth 09-17 13:33:18.

**ASKED FOR** 3.

**DELIVERED** 1 draft:
- Pinterest Marketing: [Pinterest Marketing Service Page.docx](https://docs.google.com/document/d/1s7sAJ28SIwmY-bEBCOhHJzGBzYNIHPZS/edit) (09-22 14:32:55). Live page to replace: `needmomentum.com/pinterest-marketing-agency/`.
- TikTok Marketing: no draft. Live page `needmomentum.com/tiktok-marketing-agency/`.
- Blog Writing: no draft, no page.

**BLOCKER**
- Pinterest: Beth's review ("Will review this week", 09-22), then a design pass
  to match the social page template. That design assignee is still not named in
  channel. Holder: Beth Kann.
- TikTok: Kinka's draft. Nothing says she is waiting on anything. Holder: Kinka.
- Blog Writing: Kinka's draft, plus the menu decision (replace Content > Blogging
  link or add beside it). Holder: Kinka for copy, Mac Frederick for menu.

## 4. Beth: 4 pages waiting on her check (was 2)

**ITEM** Final review and publish of ChatGPT Ads, AI Design Services, Instagram
Marketing, YouTube Marketing pages.

**ASKED FOR** 4. Two self assigned in the 09-21 summary; two handed back by Felix
09-22 18:18:57 "done and ready for checking" with meta tags, optimized images,
internal links and CTA buttons added.

**DELIVERED** 0 of 4 published. Review links for the two that exist as drafts:
- ChatGPT Ads Management Services: `needmomentum.com/?page_id=29159`
- AI Design Services in Philadelphia: `needmomentum.com/?page_id=29138`
- Instagram Marketing, YouTube Marketing: no URL posted in window.

**BLOCKER** Beth Kann's check and publish. No input is missing on any of the four.
She also holds the Pinterest review (item 3) and the industry sheet (item 6); her
queue is the single bottleneck across three items.

## 5. Felix: Monday SEO task list, 3 to 5 items, none posted

**ITEM** Weekly GSC review with 3 to 5 SEO optimizations, tagged to mac and Beth
for a green light. Recurring reminder, 09-21 10:00:05.

**ASKED FOR** 3 to 5, every Monday.

**DELIVERED** 0 visible in #momentumsites for Monday 09-21. Felix's only post
since is the page handback (item 4).

**BLOCKER** Felix's list. It may have gone to DM; nothing in channel shows it.
Holder: Felix. Next due Monday 09-28.

## 6. Industry service pages: assigned, input withheld

**ITEM** New industry service pages, Ovais to build under Obaid.

**ASKED FOR** No count named; the list lives on the
[Momentum Site - Service Pages](https://docs.google.com/spreadsheets/d/1WJ2lev44KvB75sQuoy8abOaDbB9EgmkRHM7xXOj3Fbk/edit) tab.

**DELIVERED** 0. The sheet link itself was shared 09-21 14:24:21, but with "hang
tight" pending the Mel and Beth 2:30 meeting.

**BLOCKER** The go signal after that meeting. The 09-21 summary says "Mel + Beth
reviewing content docs first, Mel will task Felix with some page design, Beth will
task Obaid/Ovais". Neither tasking message exists in channel as of 09-23 08:09.
Holder: Beth Kann (Obaid/Ovais tasking) and Melissa Silber (Felix design tasking).

---

# No count named, not delivered

| item | asked by / when | status | blocker |
| --- | --- | --- | --- |
| Leads/sources to quotable reporting update using Melissa's lead sheet ([sheet](https://docs.google.com/spreadsheets/d/1wDObtqVqs3mtmly5NQ_T-FvgOHGAC_w6a4wKt2sps7g/edit)) | Melissa to Obaid, cc mac, 09-21 16:49:35 | One +1 reaction, no reply, no report posted | Obaid's build of the report. Input is supplied (the sheet). |
| Homepage rebuild | Beth and Melissa reviews 09-17 | No revised homepage posted | Mac Frederick's yes on the direction both reviewers already gave (see ANSWERED) |
| WP Rocket fix | Obaid reported 09-15 | Still on 09-21 Next Steps | Application of Felix's documented fix. Holder: Obaid (site maintenance lane). |

---

# Promised, delivered

Recorded so nobody re-asks for them.

| item | asked by / when | delivered |
| --- | --- | --- |
| ChatGPT Ads + AI Design Services edits | Beth to Felix, 09-17 13:18 | **Returned** 09-22 18:18:57 (4 days past the Friday ask). Now waiting on Beth, item 4 |
| Pinterest Marketing draft | Beth to Kinka, 09-17 13:33 | **Delivered** 09-22 14:32:55, docx link above |
| Marketing deck as a public page | mac to Melissa, 09-15 | **Published** `needmomentum.com/marketing-agency-services-philadelphia/`, Obaid 09-21 18:14:56 |
| AEO & GEO Services page | Beth to mac, 09-17 13:15 | **Published** `needmomentum.com/aeo-geo-services-philadelphia/`, in AI Marketing menu |
| LinkedIn Marketing services page | | **Published**, in Social Media menu |
| Missing case studies | Melissa to Felix, 09-18 11:52 | **Added** to `needmomentum.com/marketing-case-studies/` |
| Plugins and updates review | mac to Obaid, 09-20 11:21 | **Reviewed** per 09-21 summary |
| IG outreach prompt set with CTAs | mac to Allison | **Delivered** 09-15 |
| Press release sequence | Melissa asked 09-15 and 09-16 13:19 | **Set up**, sends out 09-18 per Beth's update |

---

# ANSWERED: inputs that already exist, do not ask again

- **Landing page load speed and metadata.** mac 09-21 thread: "its loading slow
  for me, did you add metadata". Obaid in the same thread: PageSpeed scores are
  good and metadata was added. **ANSWERED.**
- **Landing page meta title, description, purpose, build constraints, slug.** All
  answered 09-15 and 09-21 (slug `marketing-agency-services-philadelphia`, mac
  09-21 14:15:29). Page is live. **ANSWERED.**
- **Outreach conversion links.** Beth 09-16 13:15:17 supplied the free quote and
  free audit 17hats links, and said to use the audit link more often. **ANSWERED.**
- **Outreach targeting.** mac 09-21 17:15:39: Allison stops LinkedIn freelancer
  messages and focuses on local business networking; Ian takes partnerships,
  agencies, referrals, big clients. **ANSWERED.**
- **WP Rocket cause.** Felix 09-15: WP Rocket fatal error on WordPress 7.1, fix
  doc supplied. **ANSWERED; the fix is unapplied.**
- **Homepage direction.** Beth 09-17 08:47: use `/homepage-custom`, bring in
  Felix page transitions, Momentum blue vs black sections, font update. Melissa
  09-17 14:37: `/homepage-custom` is her favourite, combine Felix page hook, hero
  copy, scrolling bar, animations and selected work into it, move AI section up.
  **ANSWERED by both reviewers in the same direction.** Only Mac's confirmation is
  missing.

## Genuinely missing inputs

1. Mac Frederick: does Apollo stay at 20/day, and who owns the gap (item 2).
2. Beth Kann and Melissa Silber: the post meeting go on industry pages (item 6).
3. Beth Kann: design assignee for Pinterest and TikTok page matching (item 3).
4. Mac Frederick: Blog Writing menu placement (item 3).
5. Mac Frederick: yes on the homepage direction already given.
6. Site factory owner: the concept copy fix; scheduler owner: why batches stopped 09-18 (item 1).

## Structural notes (unchanged)

`03_Content/` still holds seven files last touched July/August; none of the live
page production is tracked there. `02_Campaigns/` has one active pipeline (site
builder) and it has not run since 09-18.

Nothing posted. Nobody asked anything directly. Report only.
