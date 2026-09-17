---
note_type: review
status: active
date: 2026-09-17
updated: 2026-09-17
cadence: daily
job: ops-decision-packets
tags:
  - cadence
  - operations
  - decisions
source_refs:
  - System/approval-queue.md (136 open, working tree 2026-09-17)
  - Slack #momentumsites C1CFQBC79, #outbound C0B6UUBMW9M, #ghl-leads-apollo C09CU4AM8HJ, 2026-09-10 to 2026-09-17
---

# Ops decision packets - 2026-09-17

Thirteen blocked items. Each is one decision. Ordered by cost of delay, highest first.

Three of them have no single decider, and that is itself the finding - called out where it applies.

---

## 1. Nexla conversion fix - publish or keep holding

- **DECISION** Publish the 2026-09-09 conversion fix on Nexla (specific conversion event, captcha on the form) - yes or no.
- **EVIDENCE** `System/approval-queue.md`, item dated 2026-09-16, sourced to `12_Brain/06_Research/2026-09-16 - Slack deep dive, what the earlier pass missed.md` and #nexla (C0BRY1H1L9W). Diagnosed 2026-09-09. Still unpublished and marked blocked on the client as of the 2026-09-14 report. $365.95 spent in that week with zero real conversions. Untracked evidence written yesterday: `client-operations/clients/nexla/deliverables/2026-09-16-spend-and-conversion-integrity/README.md`.
- **RESPONSIBLE** Dillon Mohr, to approve the publish; the client holds the site.
- **DEADLINE** No deadline stated.
- **IF IT SLIPS** Money burns at roughly $52 a day AND the damage compounds - Smart Bidding keeps learning from junk submissions, so the model gets worse the longer the bad signal runs. This is the only item on the list where waiting actively degrades the asset.

## 2. GoDaddy API key - rotate

- **DECISION** Rotate the `gd_pat_` key at developer.godaddy.com/keys and set the replacement as a Windows user env var - do it or accept the exposure.
- **EVIDENCE** `System/approval-queue.md`, 2026-09-16. Key pasted into a Claude Code chat session during a needmomentum.com NS record change. Never used in a call, never written to disk or settings. It now sits permanently in a transcript that syncs to Dillon's phone.
- **RESPONSIBLE** Dillon Mohr. Human-only; a browser session at the GoDaddy developer console.
- **DEADLINE** No deadline stated. Live credential exposure normally carries a same-day one.
- **IF IT SLIPS** A live DNS-capable credential stays valid in a synced transcript. DNS control over needmomentum.com is control of Momentum's own mail and site.

## 3. Momentum homepage - pick one of two

- **DECISION** Which draft becomes the new needmomentum.com homepage: Felix's `/felix-test-page/` (Option 1) or Obaid's `/homepage-custom/` (Option 2). The loser is optimized as the "Digital Marketing Services Philadelphia" service page.
- **EVIDENCE** Slack #momentumsites, Mac Frederick 2026-09-14 14:42 and 14:46, posted `@channel` with both links and "please Pick your Favorite AND what you like about each". Thread carries 2 replies and one eyes reaction. No decision posted in the three days since.
- **RESPONSIBLE** Mac Frederick. He asked the channel, but he set the terms and only he can call it. **The `@channel` framing is the problem** - a vote with no named decider does not converge, and it has not.
- **DEADLINE** No deadline stated.
- **IF IT SLIPS** Two developers' finished homepage builds sit unshipped, and the service page that was supposed to come out of the losing draft cannot start. Mac also named page speed as Obaid's "BIG Focus this week and next" (09-15 13:24) - work that cannot be aimed while the homepage is undecided.

## 4. Apollo credits - expand or cap

- **DECISION** Expand the Apollo credit allowance to cover CSV imports, or cap outbound at what current credits allow - A or B.
- **EVIDENCE** Slack #outbound, Beth Kann 2026-09-11 14:22:08, meeting notes: "Issue: Apollo credits - importing CSV takes many credits ie. 800+ list of franchises (**Allison to confirm with Sean** if we want to expand credits)". Six days on, no confirmation appears in the channel.
- **RESPONSIBLE** Sean Boyle decides; Allison Walden was tasked to ask him.
- **DEADLINE** No deadline stated.
- **IF IT SLIPS** The 800+ franchise list cannot be imported, so the multi-channel sequence design agreed the same day (Ian and Allison, Apollo email plus LinkedIn plus Instagram) runs on a smaller list than it was built for. This is the named blocker from 2026-09-16 and it is unchanged.

## 5. needmomentum.com WP Rocket - re-enable with the fix, or ship without caching

- **DECISION** Re-enable WP Rocket applying the documented WordPress 7.1 fatal-error fix, or leave it disabled and hit the page-speed target another way.
- **EVIDENCE** Slack #momentumsites: Felix 2026-09-15 13:44 "I see that the wprocket plugin has been disabled. Was that intended?"; Obaid 13:58 "It was throwing critical error when I checked last time"; Felix 14:24 points at `docs.wp-rocket.me/article/1927-fatal-error-on-wordpress-7-1`. Thread has 3 replies, latest 16:03, no resolution stated. Mac 09-15 13:24 made page speed the top priority and posted a failing PageSpeed run for the mobile homepage.
- **RESPONSIBLE** Obaid (holds the site), with Felix's fix. **No named decider between the two** - each is waiting for the other to act.
- **DEADLINE** Mac's "this week and next" on page speed implies 2026-09-26.
- **IF IT SLIPS** The caching layer stays off during the exact two weeks page speed was made the priority, so the measurement Mac is judging the work by is taken against an artificially slow site.

## 6. Meta video campaign - kill it or refresh it

- **DECISION** Turn off the Meta video campaign, or keep it running on new creative from Mac.
- **EVIDENCE** Slack #ghl-leads-apollo: Mac 2026-09-16 09:56 "leads have slowed down past few days ... any current campaigns yall suggest we pause or update"; Melissa Silber 12:39 "we can turn off that video campaign unless there are new videos we can add, it's gone a bit stale"; Mac 12:55 "okay ill lower that one for now until I make new creative / if you see any YT videos of mine that would be ideal let me know". Lowered, not decided.
- **RESPONSIBLE** Mac Frederick - he is both the decider and the creative bottleneck.
- **DEADLINE** No deadline stated.
- **IF IT SLIPS** A campaign Melissa has already called stale keeps spending at a reduced rate against a $40/day account whose CPL is $38 (Alexandra Rojas, 09-15 10:07, 15 leads in 14 days). Every dollar in the stale campaign is a dollar out of the two Melissa is actively improving.

## 7. GT Clinic access request - send or hold

- **DECISION** Send the corrected access request to Ghazala Farooqui MD, exact recipient and exact body - yes or no.
- **EVIDENCE** `System/approval-queue.md` 2026-09-16, sourced to `client-operations/clients/gt-clinic/deliverables/2026-09-10-plan/ACCESS-REQUEST-CORRECTED-2026-09-16.md`, commit 1807c62. Asks for exactly three things: SiteGround/WordPress admin, domain/DNS, Search Console owner plus GA4. Deliberately does not re-ask for GBP (owner already granted) and does not reopen Ads billing (settled by accepted quote brgoeLawllWB).
- **RESPONSIBLE** Dillon Mohr. External send, approval-gated.
- **DEADLINE** No deadline stated.
- **IF IT SLIPS** No source-level inspection of thegtclinic.com has ever succeeded from outside - the 2026-09-12 audit returned HTTP 202 SiteGround captcha on all 14 URLs plus robots.txt and every sitemap. Without these grants nothing measurable can be done for this client at all. The engagement is parked, not slow.

## 8. Press release follow-up - who owns the next send

- **DECISION** Does Allison Walden own the press release follow-up sends, or does it move to someone else.
- **EVIDENCE** Slack #outbound, three unanswered asks from Melissa Silber to Allison Walden: 2026-09-11 09:29 "checking in on press release outreach, any updates"; 2026-09-15 09:47 "any updates on press release follow up/next sends?"; 2026-09-16 13:19 "any luck on press release?". Allison posted Instagram outbound prompts in between (09-15 16:52) and replied "Perfect thank you!" to Beth on 09-16, so she is present in the channel and answering other threads.
- **RESPONSIBLE** Melissa Silber to decide reassignment; Allison Walden currently holds it.
- **DEADLINE** No deadline stated. Beth's 09-11 notes said "send out next week", which was 2026-09-14 to 09-18.
- **IF IT SLIPS** This is Melissa's named standing problem - press items stall with no owner. Three asks over six days with no answer is the pattern itself, not an instance of it.

## 9. Momentum Agent Console - go public

- **DECISION** Run `cloudflared tunnel login`, create the tunnel and DNS route, and put a Cloudflare Access policy restricting it to dillonmohr8777@gmail.com in front of the hostname before it goes live - proceed or keep the console desk-local.
- **EVIDENCE** `System/approval-queue.md` 2026-09-16. `System/tunnel/cloudflared-config.yml` exists; the hostname is still a placeholder needing a real domain. The console already requires `MOMENTUM_HUD_TOKEN`, verified end to end (no cookie 401, wrong token 401, right token 200).
- **RESPONSIBLE** Dillon Mohr. `cloudflared tunnel login` is human-only browser auth.
- **DEADLINE** No deadline stated.
- **IF IT SLIPS** The roster HUD stays visible only from this desk. Tolerable, and the safe default - a public hostname without Access in front is worse than no hostname.

## 10. Lead reporting fields - Jesse's system or the Sept sheet

- **DECISION** Does Jesse DiLaura connect his system to the September sheet with quotable (yes/no), proposal link and quote value, or does someone else populate those columns.
- **EVIDENCE** Slack #ghl-leads-apollo, Melissa Silber 2026-09-15 09:19, cc Mac. No reply from Jesse in the channel. Jesse is active there - he posted "called, LVM texted both" on 09-16 14:24.
- **RESPONSIBLE** Jesse DiLaura to accept or decline; Melissa Silber to reassign if he declines.
- **DEADLINE** Melissa offered "earlier this week" and flagged a Friday conflict, so effectively 2026-09-18.
- **IF IT SLIPS** Lead reporting cannot tie a lead to a quote value, so no channel can be judged on revenue rather than volume. That is the measurement the Meta spend decisions above are currently being made without.

## 11. Client registry - five clients with no route

- **DECISION** Approve adding registry records for look-alive, capsule-and-tonic, everyday-life-insurance and green-slate-masonry, and populating `slackChannels` for the nine active clients whose arrays are empty.
- **EVIDENCE** `System/approval-queue.md` 2026-09-16, sourced to `12_Brain/06_Research/2026-09-16 - Slack deep dive`. Nine named live channels exist for clients whose registry records carry empty `slackChannels`: kimberly-james-bridal, omega-landscaping, onsite-concrete-landscape, hope-wellness-center, fresh-blends-kwik-trip, bar-crawl-usa, fagan-painting, pro-fence-deck, va-claims-edge.
- **RESPONSIBLE** Dillon Mohr. The registry is single-writer.
- **DEADLINE** No deadline stated.
- **IF IT SLIPS** A client with no route is invisible to every automation, which is how gt-clinic went unseen until 2026-09-16. Today's `delivery-milestones` job hits the same wall.

## 12. Images for two finished service pages

- **DECISION** Does Beth Kann supply the images for the AI Design Services and ChatGPT Ads Management pages, or do the pages ship with the placeholder spaces.
- **EVIDENCE** Slack #momentumsites, Ovais 2026-09-13 06:07: both pages marked Ready for Review, "In above pages i will be needing relevant images so i make spaces for them in sections, Please send it over to me". Beth 2026-09-11 16:07 had already said "I will help here" and "I'll help with some visuals next week" on the Instagram page. Both pages still sat in Beth's 2026-09-14 14:24 Ready for Review list.
- **RESPONSIBLE** Beth Kann.
- **DEADLINE** No deadline stated.
- **IF IT SLIPS** Two completed pages hold at 95% behind an asset request. They are counted as Ready for Review in the weekly status, which hides that they are actually blocked.

## 13. Instagram Marketing page - pricing and 360 linking

- **DECISION** Confirm the pricing section on the Instagram Marketing page, and decide whether it should link out to Momentum 360 more.
- **EVIDENCE** Slack #momentumsites, Beth Kann 2026-09-11 16:07, addressed to Mac directly: "Mac, can you take a quick look and confirm the pricing section? Do we want to link out to 360 more on this page?". Ovais shipped every other item from that feedback list by 09-13 with check marks. These two are the only unresolved lines on the page.
- **RESPONSIBLE** Mac Frederick.
- **DEADLINE** No deadline stated. The page was in Beth's "Go Live this Week" list on 2026-09-14, so 2026-09-18.
- **IF IT SLIPS** A page scheduled to go live this week goes live with unconfirmed pricing, or does not go live. Neither is a decision anyone made.

---

## Not a packet, but it should not wait for one

Slack #outbound, Mac Frederick 2026-09-11 14:26 posted **plaintext account credentials for two social accounts** into the channel, in response to Beth's "Need Twitter, Pinterest logins" line. Values are deliberately not reproduced here. This is the same class of exposure as packet 2 and arrived five days earlier, in a channel with a wider audience than a chat transcript. It is not a decision, so it is not a packet - it is a rotation.

## Items named in the manifest that did not appear in this window

- **Thin production briefs** - not visible as a discrete blocker in these three channels this week. The closest live instance is packet 12 (a finished page waiting on an asset request). Today's `production-briefs` job covers the fuller picture.
- **Deborah Mara client confusion** - no traffic in #momentumsites, #outbound or #ghl-leads-apollo in the last 7 days. #deborah-mara (C05UM2X3FQS) is out of this job's scope.

## What this job did not do

Nothing decided, nobody messaged, nothing posted to Slack. Packets only.
