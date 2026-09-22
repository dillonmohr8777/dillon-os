---
note_type: review
status: active
date: 2026-09-22
updated: 2026-09-22
cadence: daily
job: ops-decision-packets
source: "System/approval-queue.md; Slack #momentumsites, #outbound, #ghl-leads-apollo (2026-09-19 to 2026-09-22)"
tags: [review, cadence, decisions, blocked]
---

# Ops decision packets, 2026-09-22

Thirteen packets, ordered by cost of delay. Sources: `System/approval-queue.md`
(152 open items) and three days of Slack in `#momentumsites` (C1CFQBC79),
`#outbound` (C0B6UUBMW9M) and `#ghl-leads-apollo` (C09CU4AM8HJ).

Sean Boyle's 2026-09-16 blockers were Apollo credits, thin production briefs and
Deborah Mara client confusion. Apollo credits did not appear in three days of
`#ghl-leads-apollo` — the channel is carrying live Meta lead flow, not a credit
complaint. The other two shapes are still present and are packets 4 and 12.

---

## 1. Rotate the exposed credentials

**DECISION** Authorise one rotation pass covering all eleven exposed credentials
today, yes or no.

**EVIDENCE** Eight open queue items cover eleven distinct credentials, none
rotated: four plaintext sets found in Slack (`System/approval-queue.md:77`, dated
2026-09-07, "oldest exposed 24 days" — now 39); a Deborah Mara WordPress admin
password posted in `#deborah-mara` 2026-09-11 (line 106); the Tock credential
mailed to four recipients 2026-08-31 (line 76); an `sk-ant-api03` Anthropic key
(line 109); a `gd_pat_` GoDaddy key (line 162); the
`momentumlocalseo@gmail.com` password (line 167); and an OpenRouter key plus a
DeerFlow account password (line 181). The OpenRouter key has **$16.73 already
spent on it**, which is proof at least one of the eleven is live and reachable.

**RESPONSIBLE** Dillon Mohr. Every one of these is his account or his machine; no
one else can rotate them.

**DEADLINE** No deadline stated on any of the eight items.

**IF IT SLIPS** Exposure compounds daily on credentials that have already been in
synced transcripts and a Slack channel for up to 39 days. This is the only item
on the list with an attacker on the other side of it.

---

## 2. Re-consent Google Ads

**DECISION** Do the browser consent click today, or accept a second week with no
ads data.

**EVIDENCE** `approval-queue.md:172`. The local probe at
`%LOCALAPPDATA%/Dillon/GoogleAdsProbe/` fails `invalid_grant` on refresh.
Measured consequences already recorded: `omega-search-terms` fell back to 09-16
on-disk evidence; `revenue-exceptions` had **no SPEND source for any of 26
clients**; and the 09-21 `weekly-client-reports` run logged
`RefreshError: invalid_grant` on its ads lane across ten `degraded` entries. The
`google-ads` MCP server is also down this session (`EUNKNOWN: uv_spawn`), so
there is no second route.

**RESPONSIBLE** Dillon Mohr. The recovery is a human-only browser consent; no
automated run can do it.

**DEADLINE** Before the next weekly cadence, Monday 2026-09-29.

**IF IT SLIPS** A second consecutive week of client reports ships with no paid
spend figures, for every client that has any.

---

## 3. Is Capsule and Tonic a client

**DECISION** Yes or no.

**EVIDENCE** New today: a full weekly client report was **built** for
`capsule-and-tonic` on 2026-09-21 — a 438 KB PDF and an 11 KB `report.html` in
`clients/capsule-and-tonic/deliverables/2026-09-21-weekly-report-2026-09-14-to-2026-09-20/`.
The id does **not** resolve against the 28 records in
`client-operations/registry/clients.json`. The same question has been open since
2026-07-12 (`approval-queue.md:14`) and again at line 165, where
`01_Clients/Capsule & Tonic/overview.md` reads
`status: pending-registry-reconciliation`. There is also a live Slack channel,
`#capsule-and-tonic`.

**RESPONSIBLE** Dillon Mohr, as registry owner.

**DEADLINE** No deadline stated.

**IF IT SLIPS** A finished, client-facing report exists that nothing can route,
send, or bill against. Report generation will keep producing one every Monday.

---

## 4. Release the industry pages sheet to Obaid

**DECISION** Hand Obaid the Momentum Site industry-pages sheet now, or hold until
Mel and Beth finish the content review.

**EVIDENCE** `#momentumsites`, 2026-09-21. Obaid at 14:22:40: "Please share the
Industry pages sheet with me so I can put @Ovais on it." Beth Kann at 14:24:21
pointed him at the Service Pages tab and said "Mel and I are meeting here at 2:30
to discuss so hang tight just a bit and we'll update with any revisions or next
steps first." **No message after that in the channel resolves it.** Beth's own
weekly summary the same day lists industry service pages as In Progress with the
split already decided: "Mel will task Felix with some page design, Beth will task
Obaid/Ovais."

**RESPONSIBLE** Beth Kann. She issued the hold.

**DEADLINE** No deadline stated. The hold was "just a bit" and is now 18 hours
old.

**IF IT SLIPS** Ovais is idle on this workstream and the page count does not
move. This is exactly Sean's "thin production briefs" shape: the work is
assigned, the input is withheld.

---

## 5. Confirm the new homepage direction

**DECISION** Approve direction A or B for the needmomentum.com homepage.

**EVIDENCE** `#momentumsites`, Beth Kann's Momentum Sites Weekly Executive
Summary, 2026-09-21 13:42:37. "New homepage direction and revisions" sits under
In Progress and "Confirm the new homepage direction" under Next Steps —
**with no name attached to either line.** Every other line in that summary names
an owner (Felix, Beth, Kinka, Mel, Obaid).

**RESPONSIBLE** Mac Frederick by precedent — he approved the landing page the
same afternoon ("approved @Obaid please optimize for metadata, on page seo,
images -- then publish", 14:08:33). **But no one is named on the homepage line,
and that is itself the finding.**

**DEADLINE** No deadline stated.

**IF IT SLIPS** The homepage is the one page every published service page links
back to. Revisions continue against an unconfirmed direction and get redone.

---

## 6. Assign a builder to the three new campaigns

**DECISION** Name who builds the three campaigns Mac posted, and whether they
launch this week.

**EVIDENCE** `#ghl-leads-apollo`, mac, 2026-09-21 16:25:35: "3 New Campaigns" —
Google PMax Lead Gen pointed at the `ai-seo-marketing` landing page; YouTube
Retargeting to all traffic for a free audit; a new Meta Lead Gen campaign for AI
Marketing Services scheduling a consultation with @Jesse DiLaura. **Nobody
replied.** The next twelve messages in the channel are Zapier lead notifications.

**RESPONSIBLE** Mac Frederick — he wrote the brief, so he assigns it.

**DEADLINE** No deadline stated.

**IF IT SLIPS** A brief with three landing destinations and a named consultation
owner sits unbuilt while the existing Meta campaigns keep delivering leads into
the same sheet. Nothing is broken; the new spend just does not start.

---

## 7. Answer Andy at Bar Crawl USA

**DECISION** Approve the exact reply to Andy on his request to pause work.

**EVIDENCE** `approval-queue.md:168`, dated 2026-09-19, source
`Daily-Briefs/2026-09-19.md`. Three days unanswered. The item explicitly ties
the reply to an unresolved report-attribution dispute that must be verified
before any client-facing revision — line 145 records that the report emailed to
Andy on 2026-09-10 19:25:36Z **credited Semrush with a +160.3% organic lift
figure Semrush never produced**, because Composio Semrush was disconnected on
that run.

**RESPONSIBLE** Dillon Mohr. Client-facing send, currently gated.

**DEADLINE** No deadline stated. Andy asked 3 days ago.

**IF IT SLIPS** This is a churn signal going unanswered while a known factual
error sits in the client's inbox. Of everything on this list, it is the item most
likely to cost revenue.

---

## 8. The machine keeps losing power

**DECISION** Treat the unclean shutdowns as a hardware fault to be diagnosed or
replaced, or accept them and design around them.

**EVIDENCE** `approval-queue.md`, 2026-09-21: six unclean shutdowns since 09-17,
one each on the 17th, 18th, 19th, 20th and 21st. Event log Id 41/6008: "The
previous system shutdown at 8:59:53 AM on 9/21/2026 was unexpected." Each one
kills every running agent session; one cost roughly 40 minutes of DeerFlow
downtime and killed a Codex session. The queue item states plainly that no
software change fixes this.

**RESPONSIBLE** Dillon Mohr.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Every long-running block on this machine has a roughly daily
chance of dying mid-run. Work already lost to this is unrecoverable and
unmeasured.

---

## 9. Authorise the HubSpot connector

**DECISION** Complete the HubSpot OAuth in an interactive session, yes or no.

**EVIDENCE** Added 2026-09-21. Non-interactive runs cannot OAuth, so the CRM
field reads "pending validation" for all 26 clients and no revenue reconciliation
completes. Confirmed again this session: HubSpot is in the unauthorised-connector
list.

**RESPONSIBLE** Dillon Mohr.

**DEADLINE** Before the next `revenue-exceptions` run, Monday 2026-09-29.

**IF IT SLIPS** Revenue reconciliation stays blocked for a third consecutive
week, on top of the Ads gap in packet 2. Between them, no client's numbers can be
independently verified.

---

## 10. Approve or reject tunnel endpoints P4/P9

**DECISION** Approve or reject. Either answer closes it.

**EVIDENCE** `approval-queue.md` lines 69, 91 and 169 — the **same item, filed
three times**, on 2026-09-04, 2026-09-12 and 2026-09-20, each from that day's
daily-driver approval package. A fourth related item (line 161, 2026-09-16) asks
to make the agent console publicly reachable and notes the hostname in
`System/tunnel/cloudflared-config.yml` is still a placeholder. The canary reads
NOT-READY.

**RESPONSIBLE** Dillon Mohr.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Browser-evidence work stays disabled, and the daily driver files
a fresh copy of this item roughly every eight days. The queue is being used as a
retry loop for a question nobody has answered.

---

## 11. Two small DeerFlow unblocks

**DECISION** Approve both: top up OpenRouter to at least $25, and turn on Docker
Desktop start-at-login.

**EVIDENCE** Added 2026-09-21. OpenRouter credits read
`total=25 used=24.978688861 => available=0.02`; the $983 key cap is a cap, not
money, so the Luna and Spark tiers cannot fire. Docker Desktop
`settings-store.json` has `"AutoStart": false`, which cost about 40 minutes of
downtime on 09-21 09:57 to 10:37; containers are already
`restart=unless-stopped`, so AutoStart is the only remaining gap.

**RESPONSIBLE** Dillon Mohr. The top-up is spend and stays gated.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Two thirds of the block tiers cannot run, and the next unclean
shutdown (packet 8, roughly daily) takes the whole stack down until someone is at
the desk.

---

## 12. Deborah Mara and GT Clinic drafts are four days old

**DECISION** Send, revise, or kill the two drafted emails.

**EVIDENCE** From the 09-21 unfiled sweep, unchanged today:
`clients/gt-clinic/deliverables/2026-09-18-access-request-email/` is the drafted
access-request email to Ghazala Farooqui MD, matching a medium-risk queue item
open since 2026-09-16;
`clients/deborah-mara/deliverables/2026-09-18-lead-status-email/` is a lead-status
email. Both written 2026-09-18, both still untracked, both still unsent. Deborah
Mara is the client Sean named for confusion on 09-16, and line 106 records a
WordPress admin password posted in her channel in plaintext.

**RESPONSIBLE** Dillon Mohr for the send; the Deborah Mara account question
belongs with Sean Boyle.

**DEADLINE** No deadline stated.

**IF IT SLIPS** Two finished client emails keep aging. The GT Clinic one is the
evidence a queue item has been waiting on for six days.

---

## 13. Can the lead sheet drive the quotable reporting update

**DECISION** Yes or no on using Melissa's new lead sheet as the source for
leads and sources in the reporting update.

**EVIDENCE** `#momentumsites`, Melissa Silber, 2026-09-21 16:49:35, to @Obaid
cc @mac: "here's that lead sheet I mentioned with the sources + sales notes if
they received quote and link to quote. can we use this for the reporting update
with leads/sources to quotable?" followed at 16:49:45 by the sheet link. **No
reply.** The same sheet id appears in `#ghl-leads-apollo` as the destination for
every Meta lead notification, so it is already the live lead destination.

**RESPONSIBLE** Mac Frederick — he was cc'd and owns the reporting call.

**DEADLINE** No deadline stated.

**IF IT SLIPS** A direct question from Melissa goes unanswered, which is the
pattern she has already flagged. The sheet is live either way; only the reporting
decision is stuck.

---

## Two things that are not packets

**`pro-fence-deck` breaks the weekly archive step.** The 09-21 ledger records
`weekly-client-reports` `failed` on
`bin/archive.py line 78: folder = VAULT_FOLDER[cid], KeyError: 'pro-fence-deck'`.
Both the PDF and the HTML were written anyway. This is a one-line map fix in
`Documents/Codex/weekly-reports/bin/archive.py`, not a decision.

**Freelancer outreach is paused with no resume trigger.** `#outbound`, mac,
2026-09-21 17:15:39: Allison Walden stops messaging freelancers on LinkedIn
"until I catch up with those", already connected with one he might hire; Ian
Girelli moves to partnerships, agencies, referrals and big clients. That is a
decision already made, not a blocked one. It is only worth watching because the
resume condition is "until I catch up", which no one else can observe.

## What this job did not do

Nothing decided. No one messaged. Packets only.
