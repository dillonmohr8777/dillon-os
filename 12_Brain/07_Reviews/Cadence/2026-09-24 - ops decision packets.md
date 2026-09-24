---
note_type: review
status: active
date: 2026-09-24
updated: 2026-09-24
cadence: daily
job: ops-decision-packets
source: "System/approval-queue.md (read 2026-09-24 08:1x EDT, 154 open, mtime 2026-09-23 22:07); Slack #momentumsites, #outbound, #ghl-leads-apollo, window 2026-09-21 08:11 to 2026-09-24 08:11 EDT"
previous: "[[2026-09-23 - ops decision packets]]"
tags: [review, cadence, decisions, blocked]
---

# Ops decision packets, 2026-09-24

Nineteen packets, ordered by cost of delay, highest first. Sources:
`System/approval-queue.md` (154 open items) and three days of Slack in
`#momentumsites` (C1CFQBC79), `#outbound` (C0B6UUBMW9M) and `#ghl-leads-apollo`
(C09CU4AM8HJ), read with both `oldest` and `latest` set. Every returned message
falls between 2026-09-21 10:00 and 2026-09-23 23:07 EDT, so the pages are
current.

Slack is cited as channel id plus the EDT timestamp Slack returned. Queue items
are cited by line number in `System/approval-queue.md` as read today.

## What changed since 2026-09-23

- **New, near the top: the audit tool is about to be built twice.** Mac asked
  Obaid and Dillon on 09-23 to replace MySiteAuditor with an AI audit that saves
  the lead and emails the report. Obaid replied with a build plan. Dillon's own
  Aegis work, filed the same day under
  `client-operations/clients/momentum-360/deliverables/2026-09-23-aegis-plan/`,
  already has a six-field intake, delivery adapters and a verified Postgres
  intake rehearsal. Packet 6.
- **Two homepage directions now exist.** Beth's team lists "new homepage
  direction" as in progress; Aegis built a local Art Nouveau homepage prototype.
  Packet 10 absorbs this.
- **Google Ads is confirmed dead on both routes.** The `google-ads` MCP server
  connected this session but returns `invalid_grant`, the same revoked grant as
  the probe. Packet 4. Its deadline also corrects yesterday's typo: the next
  Monday is **2026-09-28**, not 09-29.
- **New queue items**: line 190 (Replenish Google Ads invite, 09-23, risk high)
  becomes packet 16. Line 191 (enable Frontier synthesis, 09-24) is packet 18.
- **Still unanswered**, a day older: Obaid's industry pages sheet (~66 h), Mac's
  three-campaign brief (~64 h), Felix's two finished pages (~38 h). Melissa's
  lead sheet question is now partly answered (packet 13).
- **Power fault**: still no Kernel-Power 41 event after 2026-09-21 09:57:45.
  Three clean days.
- **Unchanged**: Capsule and Tonic still absent from `registry/clients.json`
  (28 records, mtime 2026-09-22 12:04). Both 2026-09-18 client drafts still
  untracked. No credential marked rotated.

---

## 1. Rotate the exposed credentials

**DECISION** Authorise one rotation pass covering all eleven exposed credentials
today, yes or no.

**EVIDENCE** Queue lines 76, 77, 106, 109, 162, 167, 181 (and 46, 62 for the
older Tock and infrastructure asks). Four plaintext sets in Slack (line 77,
oldest now 41 days), the Deborah Mara WordPress admin password in
`#deborah-mara` (line 106), the Tock credential mailed to four recipients
(line 76), an Anthropic key (109), a GoDaddy key (162), the momentumlocalseo
password (167), an OpenRouter key and a DeerFlow password (181). None is marked
rotated in today's read. Values are not reproduced here.

**RESPONSIBLE** Dillon Mohr.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Exposure grows daily on secrets already sitting in Slack and in
synced transcripts. The only item here with an attacker on the other side.

---

## 2. Publish the Nexla conversion fix

**DECISION** Publish the conversion fix diagnosed 2026-09-09, yes or no.

**EVIDENCE** Queue line 164 (2026-09-16, "URGENT, live budget burn"): a generic
conversion event plus a form with no captcha trains Smart Bidding on junk.
$365.95 spent the week of the 09-14 report with zero real conversions. Not
re-measurable today: Google Ads auth is dead (packet 4).

**RESPONSIBLE** No single decider is recorded, and that is the finding. Dillon
owns the approval; the queue says the item is blocked on an unnamed Nexla
contact.

**DEADLINE** No deadline stated.

**IF IT SLIPS** About $366 a week keeps teaching the bid model to buy spam, and
every week is more learning to undo.

---

## 3. Correct the record with Mike at Revive Systems

**DECISION** Approve a correction to Mike Over, yes or no.

**EVIDENCE** Queue line 144. On 2026-09-10 Mike was told the LSA background
check passed and insurance and licence failed; the live portal (captured 09-10
and 09-11) shows the reverse, with 0 leads. Mike has since asked in writing
whether to buy insurance. Source:
`client-operations/clients/revive-systems/deliverables/2026-09-10-lsa-tonight/`.

**RESPONSIBLE** Dillon Mohr. Client-facing send, gated.

**DEADLINE** No deadline stated. The error has been in Mike's inbox 14 days.

**IF IT SLIPS** The client may buy insurance nobody asked for on Momentum's
word.

---

## 4. Re-consent Google Ads

**DECISION** Do the browser consent click before Monday 2026-09-28, or accept a
second week of client reports with no spend data.

**EVIDENCE** Queue lines 172 and 175. Re-tested today: the `google-ads` MCP
server, which failed to connect yesterday, now connects and returns
`503 ... invalid_grant: Bad Request` on `list_accessible_customers`. Both routes
sit on the one revoked grant. No queue update marks it fixed.

**RESPONSIBLE** Dillon Mohr. Human-only browser consent.

**DEADLINE** Monday 2026-09-28, the next weekly cadence. (Yesterday's packet
said 09-29; that date is a Tuesday.)

**IF IT SLIPS** Weekly reports ship without paid figures again, and packets 2
and 16 stay unmeasurable.

---

## 5. Answer Andy at Bar Crawl USA

**DECISION** Approve the exact reply to Andy on his request to pause work.

**EVIDENCE** Queue line 168 (2026-09-19), now 5 days unanswered. Line 145: the
09-10 report credited Semrush with a +160.3% organic lift that came from Search
Console alone. Andy's four "not happening" items must first be recovered from
Gmail thread 1a0592c581c51729.

**RESPONSIBLE** Dillon Mohr. Client-facing send, gated.

**DEADLINE** No deadline stated.

**IF IT SLIPS** A named churn signal stays unanswered next to a known factual
error. The item most likely to cost a retainer.

---

## 6. Build the AI audit once, not twice

**DECISION** Does Obaid build the new audit flow from scratch, or does Dillon
hand him the Aegis six-field intake that already exists? A or B.

**EVIDENCE** `#momentumsites` C1CFQBC79. Mac, 2026-09-23 12:12:22: replace the
paid MySiteAuditor with AI that scans, saves the lead to CRM and sends a fuller
audit so Jesse DiLaura can call. Fields named at 12:31:53: name, number, email,
website, business description, goals. Dillon, 12:31:56: "Lookin into it".
Obaid, 17:59:48: a four-step build plan, asking which CRM and which model, and
asking Dillon's opinion. Mac, 18:13:47: save to the leads sheet and Zapier it to
CRM and email; Claude is fine; brand it Momentum Digital with a final CTA page.
Meanwhile `2026-09-23-aegis-plan/CHECKPOINT.md` records a local six-field demo,
transactional intake fixes verified against a real Postgres restart, a
Turnstile adapter with 8/8 tests, and a `DELIVERY-ADAPTER-CONTRACT.md`; email,
CRM and HTTPS remain gates (`INTAKE-RELEASE-READINESS.md`). **Dillon has not
replied in-channel since 12:31**, so Obaid does not know this exists.

**RESPONSIBLE** Dillon Mohr. He owns the Aegis build and was asked directly.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Obaid starts a parallel build of the same six-field intake, and
the MySiteAuditor subscription keeps billing until one of them ships.

---

## 7. Is Capsule and Tonic a client

**DECISION** Yes or no.

**EVIDENCE** Re-checked today: `registry/clients.json` has 28 records and no
`capsule-and-tonic`. A finished weekly report sits at
`clients/capsule-and-tonic/deliverables/2026-09-21-weekly-report-2026-09-14-to-2026-09-20/`.
Open since 2026-07-12 (queue line 13).

**RESPONSIBLE** Dillon Mohr, as registry owner.

**DEADLINE** The next report builds Monday 2026-09-28.

**IF IT SLIPS** A second unroutable report is built with nothing to send, bill
or reconcile against.

---

## 8. Release the industry pages sheet to Obaid

**DECISION** Hand Obaid the industry pages sheet now, or keep holding for Mel
and Beth's revisions.

**EVIDENCE** `#momentumsites`, Obaid 2026-09-21 14:22:40 asked for it to put
Ovais on it; Beth 14:24:21 "hang tight just a bit". Nothing since, about 66
hours, while the channel carried 9 other messages.

**RESPONSIBLE** Beth Kann. She put the hold on.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Ovais stays idle on assigned work. Sean's "thin brief" shape.

---

## 9. Send the decision-call request to Mac

**DECISION** Approve sending the scheduling email for a 30-minute D01, D04, D07,
D10, D18 call, yes or no.

**EVIDENCE** Queue line 189 (2026-09-22). Line 94: all 20 AI division decisions
still `state: open`. D01 and D10 block all outbound.

**RESPONSIBLE** Dillon Mohr to send; the D-items need Dillon and Mac Frederick.

**DEADLINE** No deadline stated.

**IF IT SLIPS** AI division outbound stays frozen, 19 days now.

---

## 10. Pick one homepage direction

**DECISION** Which homepage direction goes forward: the one Beth's team is
revising, or the Aegis Art Nouveau prototype? A or B.

**EVIDENCE** Beth's summary, `#momentumsites` 2026-09-21 13:42:37: "New homepage
direction and revisions" in progress and "Confirm the new homepage direction"
as a next step, **with no name on either**. Separately, `CHECKPOINT.md` in the
Aegis folder records a "Nouveau homepage with exact logo, blue/orange Art
Nouveau and local six-field demo built and desktop/mobile checked", and
yesterday's unfiled sweep found its review pages under
`2026-08-03-need-momentum-homepage-concepts/`. Nothing in the channel mentions
the prototype.

**RESPONSIBLE** Mac Frederick by precedent (he approved the landing page).
**Nobody is named, and two directions now exist, which is the finding.**

**DEADLINE** No deadline stated.

**IF IT SLIPS** Two teams revise two homepages, and every new service page links
to one of them.

---

## 11. Assign a builder to the three new campaigns

**DECISION** Name who builds Mac's three campaigns and whether they launch this
week.

**EVIDENCE** `#ghl-leads-apollo`, mac 2026-09-21 16:25:35: PMax to
`/ai-seo-marketing/`, YouTube retargeting, new Meta lead gen for a free AI
consultation with Jesse DiLaura. About 64 hours, no reply; every later message
in the channel is a Zapier lead.

**RESPONSIBLE** Mac Frederick.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Existing Meta campaigns keep delivering (12 leads posted in the
window), so nothing breaks; the new spend just does not start.

---

## 12. Authorise the HubSpot connector

**DECISION** Complete the HubSpot OAuth in an interactive session, yes or no.

**EVIDENCE** Queue line 174. `hubspot` is again in this session's list of
servers needing authentication.

**RESPONSIBLE** Dillon Mohr.

**DEADLINE** Before `revenue-exceptions`, Monday 2026-09-28.

**IF IT SLIPS** With packet 4, three of four reconciliation sources stay dark
for a third week.

---

## 13. Can the lead sheet drive the reporting update

**DECISION** Yes or no on using Melissa's lead sheet as the source for leads and
sources in the Quotable reporting update.

**EVIDENCE** Melissa, `#momentumsites` 2026-09-21 16:49:35, to Obaid cc Mac. No
direct reply in ~63 hours. **Partly answered by implication**: Mac on 09-23
18:13:47 made "our leads sheet" the landing point for the new audit intake, and
all 12 `#ghl-leads-apollo` lead posts in the window target the same sheet id
(`1wDObtqV…`). The sheet is now the lead system of record in practice; whether
reporting reads it is still unanswered.

**RESPONSIBLE** Mac Frederick.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Leads land in a sheet reporting does not read, and Melissa's
question enters its fourth day.

---

## 14. Deborah Mara and GT Clinic drafts are six days old

**DECISION** Send, revise, or kill the two drafted emails.

**EVIDENCE** `git status` in client-operations today: both
`clients/gt-clinic/deliverables/2026-09-18-access-request-email/` and
`clients/deborah-mara/deliverables/2026-09-18-lead-status-email/` still `??`.
GT Clinic send is queue line 159.

**RESPONSIBLE** Dillon Mohr for the send; Sean Boyle for the Deborah Mara
account question.

**DEADLINE** No deadline stated.

**IF IT SLIPS** GT Clinic access stays unrequested, a second week with no source
access.

---

## 15. Check Felix's ChatGPT Ads and AI Design pages

**DECISION** Approve the two pages for publish, or return them with changes.

**EVIDENCE** `#momentumsites`, Felix 2026-09-22 18:18:57 to Beth: "done and
ready for checking". No reply, about 38 hours.

**RESPONSIBLE** Beth Kann.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Two finished pages sit unpublished; this is now on the path
packet 8 took.

---

## 16. Accept the Replenish Google Ads invite

**DECISION** Accept the pending user invite after verifying customer
627-501-4654 and the intended role, yes or no.

**EVIDENCE** Queue line 190 (2026-09-23, risk high), source
`Daily-Briefs/plan-2026-09-23.md`: "Replenish user-invite stays untouched." No
campaign, budget or billing change is part of the ask. Line 90 (09-09) still
requires a Replenish campaign allowlist on that shared customer before any
automated reporting.

**RESPONSIBLE** Dillon Mohr.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Replenish access stays pending; with packet 4 unresolved the
invite could not be exercised by automation anyway, so today's cost is low.

---

## 17. Two small DeerFlow unblocks

**DECISION** Approve both: top up OpenRouter to at least $25, and turn on Docker
Desktop start-at-login.

**EVIDENCE** Queue lines 176 and 182, unchanged since 2026-09-21. **Re-verify the
credit before approving**: the $0.02 figure is from 09-21, and the Aegis
`CHECKPOINT.md` (09-23) records Momentum Answers LIVE on OpenRouter after an
explicit launch approval with a verified Slack reply, which implies the balance
or routing changed.

**RESPONSIBLE** Dillon Mohr. The top-up is spend.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Block tiers may stay dead; the next power loss leaves Docker down
until someone is at the desk.

---

## 18. Enable Frontier synthesis on the daily driver

**DECISION** Turn on `-EnableFrontier`, yes or no. Model spend stays gated.

**EVIDENCE** Queue line 191 (2026-09-24), source
`00_Inbox/Agent-Proposals/Claude/2026-09-23-daily-driver-approval-package.md`:
"Frontier synthesis is ledgered but disabled in v1".

**RESPONSIBLE** Dillon Mohr.

**DEADLINE** No deadline stated.

**IF IT SLIPS** The driver keeps running v1 without synthesis. Nothing breaks.

---

## 19. Approve or reject tunnel endpoints P4/P9

**DECISION** Approve or reject. Either closes it.

**EVIDENCE** Filed three times: queue lines 69, 91, 169 (09-04, 09-12, 09-20).

**RESPONSIBLE** Dillon Mohr.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Browser-evidence work stays disabled; a fourth copy is due about
2026-09-28 on the eight-day refile pattern.

---

## The power fault is quiet

Queue lines 86 and 183. `Get-WinEvent` today: last Kernel-Power 41 event
2026-09-21 09:57:45, so three clean days after six unclean shutdowns 09-17 to
09-21. Not a packet today; still no software cause found (line 86), so the
hardware question stands whenever it recurs.

## Things that are not packets

- **Two registry corrections decided but not written**: `nkcdc` and `align-hcm`
  still read `status: active`. Waiting on the single writer (Marketing Chief),
  not a decision.
- **Queue line 158 is still partly stale**: `Cadence-daily` last ran 09-23 09:05
  result 0, `Cadence-weekly` 09-21 09:20 result 0; only `Cadence-monthly` shows
  never run (`267011`). `Cadence-sweep-heartbeat` last returned **2** at 08:00
  today, worth a look by whoever owns the sweep.
- **Mac introduced "Alfred" for LinkedIn outreach** (`#outbound` 2026-09-23
  16:12:42). A tool announcement, no ask attached. The 09-21 pause on freelancer
  outreach stands.
- **Jesse DiLaura joined `#momentumsites`** 2026-09-23 12:12:27 and is now the
  named caller for audit leads and AI consultations.

## What this job did not do

It decided nothing and messaged no one. It did not edit the approval queue or
the registry. Packets only.
