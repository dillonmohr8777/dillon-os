---
note_type: review
status: active
date: 2026-09-21
updated: 2026-09-21
cadence: daily
job: ops-decision-packets
source_refs:
  - System/approval-queue.md (137 open, working tree 2026-09-21)
  - "Slack #momentumsites C1CFQBC79, #outbound C0B6UUBMW9M, #ghl-leads-apollo C09CU4AM8HJ, 2026-09-18 to 2026-09-21"
tags: [review, cadence, decisions]
---

# Ops decision packets, 2026-09-21

Ordered by cost of delay, highest first. Previous run 2026-09-17; the cadence did
not fire 09-18, 09-19 or 09-20.

Slack was thin across the window: two messages in #momentumsites, one in
#outbound, and eleven Zapier lead posts in #ghl-leads-apollo with no human reply.
Most of what is blocked is blocked in the approval queue, not in conversation.

---

## 1. Nexla Smart Bidding is still training on spam

- **DECISION** Publish the 2026-09-09 conversion fix on Nexla, a specific
  conversion event plus captcha on the form. Yes or no.
- **EVIDENCE** `System/approval-queue.md`, item dated 2026-09-16, high risk,
  still open and unchanged 5 days later. Diagnosed 2026-09-09. $365.95 spent in
  the diagnosis week with zero real conversions. Supporting artifact exists and
  is still untracked: `client-operations/clients/nexla/deliverables/2026-09-16-spend-and-conversion-integrity/README.md`.
- **RESPONSIBLE** Dillon Mohr approves the publish; the client holds the site.
- **DEADLINE** No deadline stated.
- **IF IT SLIPS** Roughly $52 a day, and unlike every other item here the asset
  actively degrades while you wait. Smart Bidding keeps learning from junk
  submissions, so each day of delay makes the model buy worse traffic than the
  day before. Twelve days of compounding as of today.

---

## 2. Two live credentials are sitting in phone-synced transcripts

- **DECISION** Rotate both now, or accept the exposure. Yes or no, one action
  each.
- **EVIDENCE** `System/approval-queue.md`, two high-risk items: a GoDaddy
  `gd_pat_` key pasted 2026-09-16, and the `momentumlocalseo@gmail.com` password
  pasted 2026-09-17. Both records state the value was not used and not written to
  disk, and both state it is permanently in a transcript that syncs to Dillon's
  phone. Both still open, 5 and 4 days later.
- **RESPONSIBLE** Dillon Mohr. Nobody else can do either one.
- **DEADLINE** No deadline stated. There should be one.
- **IF IT SLIPS** Unbounded. Every other item on this page is money or schedule;
  this is the only one where the downside is somebody else's access to a domain
  registrar and a Google account. Cost of acting is about ten minutes.

---

## 3. The Google Ads probe cannot authenticate, so nothing reconciles

- **DECISION** Run the probe's `authorize.py` under its own venv and click
  through Google consent. Yes or no.
- **EVIDENCE** `System/approval-queue.md` 2026-09-21. `omega_terms_full.py`
  aborts on `google.auth.exceptions.RefreshError: invalid_grant` refreshing
  `google-ads.yaml`, the only credential in the local `GoogleAdsProbe` folder
  under `%LOCALAPPDATA%/Dillon/`. Measured in this week's cadence:
  `omega-search-terms` fell back to 09-16 on-disk evidence, and
  `12_Brain/07_Reviews/Cadence/2026-09-21 - revenue exceptions.md` records **zero
  of 26 clients reconciling** with no SPEND source at all. The `google-ads` MCP
  server is also down this session (`EUNKNOWN: uv_spawn`), so there is no second
  route.
- **RESPONSIBLE** Dillon Mohr. It needs a browser and a human click; no automated
  run is permitted to fix it.
- **DEADLINE** No deadline stated. Effectively next Monday's weekly run.
- **IF IT SLIPS** Every weekly reconciliation from here reports "pending
  validation" for all 26 clients and proves nothing. Client reporting continues
  to go out on numbers nobody verified, which is the exact failure the
  reconciliation job exists to prevent.

---

## 4. Bar Crawl USA asked about pausing and has not been answered

- **DECISION** Approve the exact reply to Andy on his request to consider pausing
  work. Send or hold.
- **EVIDENCE** `System/approval-queue.md` 2026-09-19, sourced to
  `Daily-Briefs/2026-09-19.md`: "The September 17 pulse identifies an unanswered
  client request to consider pausing work as the clearest churn signal." The
  queue entry also holds the reply behind verifying a retained
  report-attribution dispute.
- **RESPONSIBLE** Dillon Mohr owns the reply. The attribution verification is the
  dependency.
- **DEADLINE** No deadline stated.
- **IF IT SLIPS** A retained client who raised pausing gets silence for a fourth
  day. Silence after that question reads as confirmation. This is the only item
  here that can end a revenue line rather than cost a number.

---

## 5. Two named requests in #momentumsites with no reply

- **DECISION** Assign an owner and a date to each, or say they are not being
  done. A or B.
- **EVIDENCE** #momentumsites, both unanswered at read time:
  - Melissa Silber to Felix, 2026-09-18 11:52 EDT: case studies missing from
    `needmomentum.com/marketing-case-studies`, asked to add them. **3 days.**
  - mac to Obaid, 2026-09-20 11:21 EDT: look into plugins and updates. **1 day.**
- **RESPONSIBLE** Named in the messages, Felix and Obaid respectively. Neither
  has acknowledged.
- **DEADLINE** Neither request stated one.
- **IF IT SLIPS** Melissa's standing complaint is that press and website items
  stall with no owner. This is that, verbatim, on the company's own marketing
  site. The plugin request is a security-update item, which gets more expensive
  the longer it waits rather than staying flat.

---

## 6. Eleven leads landed in #ghl-leads-apollo with no human touch

- **DECISION** Name the one person who works this channel's leads. A single
  name.
- **EVIDENCE** #ghl-leads-apollo, 2026-09-19 to 2026-09-21. Eight distinct leads
  with full name, email, phone and business: Brad Orenstein (The Gourmet Vendor),
  Jason Hamilton (Earthwise Energy), Randolph Neil (1Heart Caregiver Services),
  Bonnie Alsup (TeenyPups), John Mosca (Waverly Cabinets), Dallas Wayne Thompson
  (StoreExpress / BestRvTravel), John Morgenstern (Morgenstern Chiropractic).
  **Zero human messages in the channel in the window.** Four of the eight
  double-fired within seconds, the same Zap overlap this cadence has now recorded
  on 09-16, 09-17 and 09-21.
- **RESPONSIBLE** **No single decider identified.** That is the finding. Beth
  Kann reports outbound activity in #outbound, Allison runs Apollo sends, Ian is
  waiting on Mac, and nobody is named against the inbound sheet.
- **DEADLINE** No deadline stated.
- **IF IT SLIPS** Qualified inbound with working phone numbers ages out. A
  three-day-old website-design lead is a materially worse call than a same-day
  one, and there is no evidence any of the eight has been called at all.

---

## 7. Apollo and LinkedIn collaboration is parked on one meeting

- **DECISION** Does the Ian and Mac LinkedIn conversation happen Tuesday
  2026-09-23, yes or no.
- **EVIDENCE** #outbound, Beth Kann, 2026-09-18 14:09 EDT: "Ian Updates: LinkedIn
  plan shared with Mac to discuss on Tues" and "Allison and Ian met on Monday to
  discuss Apollo, once he connects with Mac Tues. they'll collaborate." The same
  update records Apollo outreach running at "10/20 per day", half the stated
  rate.
- **RESPONSIBLE** Mac Frederick. He is the single blocker for both threads.
- **DEADLINE** **Tuesday 2026-09-23.** The only real date in this report.
- **IF IT SLIPS** Two people's outbound work stays uncoordinated for another week
  and Apollo continues at half rate. Sean Boyle's named Apollo credits blocker is
  not visible in this window, so credits are not currently the constraint; the
  meeting is.

---

## 8. Five clients still have no registry route

- **DECISION** Create registry records for look-alive, capsule-and-tonic,
  everyday-life-insurance, green-slate-masonry. Yes or no.
- **EVIDENCE** `System/approval-queue.md` 2026-09-16, medium risk, unchanged.
  Two of these, Capsule & Tonic and Everyday Life Insurance, also sit in the
  2026-07-12 block as unanswered client-status questions, now 71 days old.
  look-alive is a live Puttery pivot from the 2026-09-15 regroup, not a stranger.
- **RESPONSIBLE** Marketing Chief owns the canonical registry; Dillon confirms
  which of these are clients.
- **DEADLINE** No deadline stated.
- **IF IT SLIPS** Every report that resolves client ids keeps failing those rows
  or omitting them silently. Today's delivery-milestones job cannot route them.

---

## The shape of it

Eight packets. **Six of the eight are blocked on Dillon Mohr personally**, and of
those, three are under fifteen minutes of work: rotate two credentials, click
through one OAuth consent. Doing those three today unblocks the weekly
reconciliation, closes the only two items with an open security clock, and leaves
five packets that genuinely need a decision rather than an action.

Packet 6 has **no single decider**, which is itself the finding and the thing
most worth fixing this week.

## What this job did not do

Nothing decided, nothing sent, nobody messaged. Packets only.
