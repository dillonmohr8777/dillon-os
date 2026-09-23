---
note_type: review
status: active
date: 2026-09-23
updated: 2026-09-23
cadence: daily
job: ops-decision-packets
source: "System/approval-queue.md (read 2026-09-23 08:1x EDT, last_scan 2026-09-23T11:11Z); Slack #momentumsites, #outbound, #ghl-leads-apollo, window 2026-09-20 08:09 to 2026-09-23 08:09 EDT"
previous: "[[2026-09-22 - ops decision packets]]"
tags: [review, cadence, decisions, blocked]
---

# Ops decision packets, 2026-09-23

Seventeen packets, ordered by cost of delay, highest first. Sources:
`System/approval-queue.md` (152 open checkbox items, 190 lines, file mtime
2026-09-23 07:13) and three days of Slack in `#momentumsites` (C1CFQBC79),
`#outbound` (C0B6UUBMW9M) and `#ghl-leads-apollo` (C09CU4AM8HJ). Slack was
read with both `oldest` and `latest` set; every returned message falls between
2026-09-20 11:21 and 2026-09-22 23:43 EDT, so the pages are current, not stale.

Slack messages are cited by channel id plus the timestamp Slack returned (EDT).
Queue items are cited by line number in `System/approval-queue.md` as read today.

## What changed since 2026-09-22

- **Two high-cost queue items that yesterday's packets missed are added**:
  Nexla Smart Bidding training on spam (queue line 164) and the Revive Systems
  record correction (line 144). Both carry money or client-trust cost now, so
  both rank near the top.
- **New queue item**: line 189 (2026-09-22), the scheduling email to Mac
  Frederick for the D01/D04/D07/D10/D18 decision call. Added as packet 8.
- **New Slack**: Felix finished the ChatGPT Ads and AI Design Services pages and
  asked Beth to check them (2026-09-22 18:18:57). Added as packet 15. Kinka filed
  the Pinterest page draft (14:32:55). Obaid published the approved landing page
  at `/marketing-agency-services-philadelphia/` (2026-09-21 18:14:56). That
  item is closed, not blocked.
- **Still unanswered in Slack after another day**: Obaid's request for the
  industry pages sheet (now about 42 hours), Mac's three-campaign brief (about
  40 hours), Melissa's lead sheet question (about 39 hours). No message in any of
  the three channels answers any of them.
- **The power fault eased**: the System log shows no Kernel-Power 41 event after
  2026-09-21 09:57:45, so two clean days. Packet 17 moves from 8th to last.
- **Unchanged**: Capsule and Tonic still absent from `registry/clients.json`
  (28 records, file rewritten 2026-09-22 12:04, still no such id). Both
  2026-09-18 client drafts are still untracked (`git status` returns `??` for
  both). The credential count is still eleven, none marked rotated.
- **Apollo credits** (Sean Boyle's 2026-09-16 shape): still absent from three
  days of `#ghl-leads-apollo`. The channel carries 11 Meta lead notifications
  and one campaign brief, and no complaint about credits.

---

## 1. Rotate the exposed credentials

**DECISION** Authorise one rotation pass covering all eleven exposed credentials
today, yes or no.

**EVIDENCE** Eight open queue items, eleven credentials, none rotated as of
today's read: four plaintext sets in Slack (line 77, "oldest exposed 24 days"
on 2026-09-07, so now 40); the Deborah Mara WordPress admin password in
`#deborah-mara` since 2026-09-11 (line 106); the Tock credential mailed to four
recipients 2026-08-31 (line 76); an `sk-ant-api03` Anthropic key (line 109); a
`gd_pat_` GoDaddy key (line 162); the `momentumlocalseo@gmail.com` password
(line 167); an OpenRouter key and a DeerFlow account password (line 181). The
OpenRouter key has $16.73 spent on it, so at least one is proven live. Values
are not reproduced here.

**RESPONSIBLE** Dillon Mohr. Every credential is his account or his machine.

**DEADLINE** No deadline stated on any of the eight items.

**IF IT SLIPS** Each day adds exposure on secrets already in a Slack channel and
in phone-synced transcripts for up to 40 days. It is the only item here with an
attacker on the other side.

---

## 2. Publish the Nexla conversion fix

**DECISION** Publish the conversion fix diagnosed 2026-09-09, yes or no.

**EVIDENCE** Queue line 164, dated 2026-09-16, marked "URGENT, live budget
burn". A generic conversion event plus a form with no captcha means every junk
submission trains Smart Bidding toward worse traffic. $365.95 was spent the week
of the 2026-09-14 report with zero real conversions. The fix is still
unpublished and recorded as "blocked on the client". Source:
`12_Brain/06_Research/2026-09-16 - Slack deep dive, what the earlier pass missed.md`,
`#nexla` C0BRY1H1L9W. Not re-measured today. The Ads token is dead (packet 4),
so no current spend figure is readable.

**RESPONSIBLE** No single decider is recorded, and that is the finding. The
queue asks Dillon to approve, but also says the item is blocked on the client,
and names no client contact. Dillon owns the approval; the unnamed Nexla
contact owns the unblock.

**DEADLINE** No deadline stated.

**IF IT SLIPS** About $366 a week of spend keeps training the bid model on
spam. The damage compounds because every week of bad signal is more learning
to undo after the fix goes in.

---

## 3. Correct the record with Mike at Revive Systems

**DECISION** Approve a correction to Mike Over, yes or no.

**EVIDENCE** Queue line 144. On 2026-09-10 Mike was told the LSA background
check had passed and that his insurance and licence had failed. The live Google
portal captured the same evening, and recaptured 09-11, shows the opposite:
the background check is still in progress, there is a Policy Manager violation,
there are 0 leads, and no insurance or licence card appears anywhere. The Ads API
read on 09-14 shows customer 6486345529 LSA ENABLED with 0 impressions. Mike has
since asked in writing whether to buy insurance and where to upload his licence.
Disk records disagree on what was sent: `DRAFT-REPLY-MIKE.md` says "not sent",
`SENT-mike-lsa-update-2026-09-10.txt` records Gmail id 1a08dbb960cdfeec.
Source: `client-operations/clients/revive-systems/deliverables/2026-09-10-lsa-tonight/`.

**RESPONSIBLE** Dillon Mohr. Client-facing send, gated.

**DEADLINE** No deadline stated. The error has been in Mike's inbox 13 days.

**IF IT SLIPS** The client may spend money on insurance the portal does not ask
for, based on a statement Momentum made. Every day the correction waits, it
becomes harder to explain.

---

## 4. Re-consent Google Ads

**DECISION** Do the browser consent click before Monday, or accept a second
week with no ads data.

**EVIDENCE** Queue line 172. The probe at `%LOCALAPPDATA%/Dillon/GoogleAdsProbe/`
fails with `invalid_grant`. `omega-search-terms` fell back to 09-16 evidence and
`revenue-exceptions` had no SPEND source for any of 26 clients. The `google-ads`
MCP server also failed to connect this session (`CONNECT_TIMEOUT`), so there is
still no second route. No queue update since 09-21 marks it fixed.

**RESPONSIBLE** Dillon Mohr. Human-only browser consent.

**DEADLINE** Before the next weekly cadence, Monday 2026-09-29.

**IF IT SLIPS** A second consecutive week of client reports ships with no paid
spend figures. Packets 2 and 11 also stay unmeasurable.

---

## 5. Answer Andy at Bar Crawl USA

**DECISION** Approve the exact reply to Andy on his request to pause work.

**EVIDENCE** Queue line 168, dated 2026-09-19, now 4 days unanswered. Line 145:
the report emailed 2026-09-10 19:25:36Z credited Semrush with a +160.3% organic
lift that came from Search Console alone. On 2026-09-13 Andy also said four
reported items are not happening. Those four are not written down anywhere on
disk and have to be recovered from Gmail thread 1a0592c581c51729 first.

**RESPONSIBLE** Dillon Mohr. Client-facing send, gated.

**DEADLINE** No deadline stated. Andy asked 4 days ago.

**IF IT SLIPS** A named churn signal sits unanswered while a known factual error
is in the client's inbox. This is the item on the list most likely to cost a
retainer.

---

## 6. Is Capsule and Tonic a client

**DECISION** Yes or no.

**EVIDENCE** Re-checked today: `registry/clients.json` holds 28 records and no
`capsule-and-tonic` id, although the file was rewritten 2026-09-22 12:04. A
finished weekly report still sits at
`clients/capsule-and-tonic/deliverables/2026-09-21-weekly-report-2026-09-14-to-2026-09-20/`
(mtime 2026-09-21 19:34). The question has been open since 2026-07-12 (queue
line 13) and again at line 165, with a live `#capsule-and-tonic` channel.

**RESPONSIBLE** Dillon Mohr, as registry owner.

**DEADLINE** No deadline stated. The next report is due to build Monday
2026-09-28.

**IF IT SLIPS** A second unroutable report gets built next Monday. There is
nothing to send, bill, or reconcile against.

---

## 7. Release the industry pages sheet to Obaid

**DECISION** Hand Obaid the industry pages sheet now, or keep holding until Mel
and Beth publish their revisions.

**EVIDENCE** `#momentumsites` C1CFQBC79. Obaid, 2026-09-21 14:22:40: "Please
share the Industry pages sheet with me so I can put @Ovais on it." Beth,
14:24:21: "Mel and I are meeting here at 2:30 to discuss so hang tight just a
bit". A channel meeting ran at 15:00. **After that, 42 hours of the channel
contain no revision, next step or share.** In the meantime Felix and Kinka both
posted finished work, so the channel is active. Only this thread is stuck.

**RESPONSIBLE** Beth Kann. She put the hold on.

**DEADLINE** No deadline stated. "Just a bit" is now about 42 hours.

**IF IT SLIPS** Ovais stays idle on a workstream already assigned in Beth's own
summary. This matches Sean's "thin production briefs" shape: the work is
assigned but the input is held back.

---

## 8. Send the decision-call request to Mac

**DECISION** Approve sending the scheduling email for a 30-minute D01, D04, D07,
D10 and D18 call, yes or no.

**EVIDENCE** Queue line 189, new 2026-09-22, source
`00_Inbox/WORKFLOW-RETHINK-DECISION-BRIEF-2026-09-18.md`. Line 94: all 20 AI
division decisions read `state: open`. The gate meeting of 2026-09-11 did not
happen, and no new date exists. D01 and D10 block all outbound. D18 blocks
client-facing paid generation.

**RESPONSIBLE** Dillon Mohr for sending the email. The D-items themselves need
Dillon and Mac Frederick together.

**DEADLINE** No deadline stated. The brief said "today" on 2026-09-18.

**IF IT SLIPS** All AI division outbound stays frozen. That has been true since
2026-09-05, which is 18 days.

---

## 9. Confirm the new homepage direction

**DECISION** Approve direction A or B for the needmomentum.com homepage.

**EVIDENCE** Beth's weekly summary, `#momentumsites` 2026-09-21 13:42:37, lists
"New homepage direction and revisions" under In Progress and "Confirm the new
homepage direction" under Next Steps. **No name is attached to either line.**
Nothing in the channel since then touches the homepage.

**RESPONSIBLE** Mac Frederick by precedent: he approved the landing page, and
Obaid published it 2026-09-21 18:14:56. **No one is named, and that is the
finding.**

**DEADLINE** No deadline stated.

**IF IT SLIPS** Every new service page links back to a homepage whose direction
nobody has confirmed. Revisions made before that are at risk of being redone.

---

## 10. Assign a builder to the three new campaigns

**DECISION** Name who builds Mac's three campaigns, and whether they launch this
week.

**EVIDENCE** `#ghl-leads-apollo` C09CU4AM8HJ, mac, 2026-09-21 16:25:35:
Google PMax Lead Gen to `/ai-seo-marketing/`, YouTube retargeting for a free
audit, and a new Meta Lead Gen for a free AI consultation with @Jesse DiLaura.
**Nobody has replied in about 40 hours.** Every one of the 16 later messages
is a Zapier lead notification.

**RESPONSIBLE** Mac Frederick. He wrote the brief, so he assigns the builder.

**DEADLINE** No deadline stated.

**IF IT SLIPS** The existing Meta campaigns keep delivering. Eleven leads
arrived in this window, so nothing is broken. The new spend just does not start.

---

## 11. Authorise the HubSpot connector

**DECISION** Complete the HubSpot OAuth in an interactive session, yes or no.

**EVIDENCE** Queue line 174. The CRM field reads "pending validation" for all 26
clients. It was confirmed again at this session's start: `hubspot` is in the
list of servers that need authentication.

**RESPONSIBLE** Dillon Mohr.

**DEADLINE** Before the next `revenue-exceptions` run, Monday 2026-09-29.

**IF IT SLIPS** Together with packet 4, three of the four reconciliation sources
stay unreadable. The weekly revenue check then proves nothing for a third week.

---

## 12. Can the lead sheet drive the quotable reporting update

**DECISION** Yes or no on using Melissa's lead sheet as the source for leads and
sources in the reporting update.

**EVIDENCE** `#momentumsites`, Melissa Silber, 2026-09-21 16:49:35 to @Obaid cc
@mac: "can we use this for the reporting update with leads/sources to
quotable?" The link followed at 16:49:45. **There is still no reply.** The same
sheet id (`1wDObtqV…`) is the destination on all 11 Meta lead notifications in
`#ghl-leads-apollo` this window, the most recent at 2026-09-22 23:43:03. So it
is already the live lead sheet.

**RESPONSIBLE** Mac Frederick. He was cc'd and owns the reporting call.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Leads keep landing in a sheet that reporting does not read. A
direct question from Melissa goes unanswered for a third day.

---

## 13. Deborah Mara and GT Clinic drafts are five days old

**DECISION** Send, revise, or kill the two drafted emails.

**EVIDENCE** Re-checked today with `git status` in client-operations. Both
`clients/gt-clinic/deliverables/2026-09-18-access-request-email/` and
`clients/deborah-mara/deliverables/2026-09-18-lead-status-email/` are still
untracked (`??`). The GT Clinic send is queue line 159, open since 2026-09-16.
Deborah Mara is the client Sean named for confusion on 09-16. Her channel also
holds the plaintext password in packet 1.

**RESPONSIBLE** Dillon Mohr for the send. The Deborah Mara account question
belongs to Sean Boyle.

**DEADLINE** No deadline stated.

**IF IT SLIPS** GT Clinic access stays unrequested, and line 159 notes that
every outside inspection of thegtclinic.com has failed without it. That makes a
week with no source access for a client Momentum is supposed to be working on.

---

## 14. Two small DeerFlow unblocks

**DECISION** Approve both: top up OpenRouter to at least $25, and turn on Docker
Desktop start-at-login.

**EVIDENCE** Queue lines 176 and 182, both unchanged since 2026-09-21. There is
$0.02 of OpenRouter credit available, so the Luna and Spark tiers cannot fire.
Docker `"AutoStart": false` cost about 40 minutes on 09-21.

**RESPONSIBLE** Dillon Mohr. The top-up is spend and stays gated.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Two thirds of the block tiers stay dead. The next power loss
takes the stack down until someone is at the desk. Lower today than yesterday
because the power fault has been quiet for two days (packet 17).

---

## 15. Check Felix's ChatGPT Ads and AI Design pages

**DECISION** Approve the two pages for publish, or return them with changes.

**EVIDENCE** `#momentumsites`, Felix, 2026-09-22 18:18:57, to @Beth Kann: final
review of the ChatGPT Ads and AI Design Services pages "is done and ready for
checking". He added meta tags, optimised images, internal links and CTA
buttons. There is no reply yet, about 14 hours on.

**RESPONSIBLE** Beth Kann. Felix tagged her, and she owns final review in her
own summary.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Two finished pages sit unpublished. The cost is low while the
wait is under a day. It becomes packet 7 again if it runs as long.

---

## 16. Approve or reject tunnel endpoints P4/P9

**DECISION** Approve or reject. Either answer closes it.

**EVIDENCE** The same item has been filed three times, at queue lines 69, 91 and
169 (2026-09-04, 09-12, 09-20). Line 161 adds the console go-public request,
and its hostname is still a placeholder. The canary reads NOT-READY.

**RESPONSIBLE** Dillon Mohr.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Browser-evidence work stays disabled. A fourth copy lands on
about 2026-09-28, following the eight-day refile pattern.

---

## 17. The machine keeps losing power

**DECISION** Treat the unclean shutdowns as a hardware fault to be diagnosed or
replaced, or accept them and design around them.

**EVIDENCE** Queue lines 86 and 183. There were six unclean shutdowns from 09-17
to 09-21. **Measured today: there is no Kernel-Power 41 event since 2026-09-21
09:57:45.** That is two clean days, not a fix, because line 86 found no software
cause and there were 14 events in 30 days.

**RESPONSIBLE** Dillon Mohr.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Every long run on this machine still has a real chance of dying
mid-run. The two clean days lower today's cost but not the underlying risk.

---

## Things that are not packets

**Two registry corrections are made but not written.** `nkcdc` and `align-hcm`
both still read `status: active` in `registry/clients.json` today. Dillon
already decided NKCDC is not a client (line 107), and Align ended 2026-09-02
(line 79). The decisions exist. The block is the single-writer registry, so this
is a write waiting on Marketing Chief, not a decision.

**Queue line 158 is partly stale.** `Cadence-daily` last ran 2026-09-22 09:05
with result 0, and `Cadence-weekly` ran 2026-09-21 09:20 with result 0. Only
`Cadence-monthly` still shows never run (`267011`, 11/30/1999). The item should
be narrowed to the monthly task by whoever next writes the queue.

**The Zapier-to-Slack path already carries lead fields.** Every
`#ghl-leads-apollo` notification includes name, email, phone and business.
Queue line 110 says the Gmail notifications carry only a Zap-run link. So the
match-back defect is specific to the email template, not to Zapier. That is
evidence for whoever takes line 110, not a new decision.

**Freelancer outreach pause** (`#outbound`, mac, 2026-09-21 17:15:39). This is a
decision already made. Its resume condition, "until I catch up", is still
something only Mac can observe.

**`pro-fence-deck` archive KeyError** from yesterday is a code fix in
`weekly-reports/bin/archive.py`, not a decision.

## What this job did not do

It decided nothing and messaged no one. It did not edit the approval queue or
the registry, and did not commit or stage anything. Packets only.
