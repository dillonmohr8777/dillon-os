---
note_type: review
status: active
date: 2026-09-16
updated: 2026-09-16
tags:
  - cadence
  - operations
  - momentum
source_refs:
  - C:/Users/dillo/repos/dillon-os/_os/automation/cadence/daily.yaml
  - C:/Users/dillo/repos/dillon-os/_os/automation/cadence/driver.md
  - C:/Users/dillo/repos/dillon-os/System/approval-queue.md
  - "Slack #momentumsites (C1CFQBC79)"
  - "Slack #outbound (C0B6UUBMW9M)"
  - "Slack #ghl-leads-apollo (C09CU4AM8HJ)"
  - "Slack #deborah-mara (C05UM2X3FQS)"
---

# Ops decision packets for 2026-09-16

Scope, System/approval-queue.md in full, plus the last three days (2026-09-13
through 2026-09-16) of #momentumsites, #outbound and #ghl-leads-apollo. Eight
items met the bar for blocked, waiting on a decision, a credit, a credential,
a scope answer or another person, each reduced to one packet. Ordered by cost
of delay, highest first.

## 1. Omega Landscaping, nine negative keywords still not applied

DECISION: Approve adding the nine competitor and supplier negative keywords
to Omega Landscaping's live Google Ads account, yes or no.

EVIDENCE: Nine terms, including timberline landscaping, rocky top resources,
pioneer sand and gravel and green belt turf farm, all show an Added and
Excluded status of None, meaning none has ever been applied. Together they
account for 49 clicks and $388.14, with 7 of the account's 17 conversions
attributable to someone searching for a different business entirely.
launch-authority.json still reads status draft, approvedBy null. Source,
System/approval-queue.md, the 2026-09-09 Omega search terms entry, restated
2026-09-14.

RESPONSIBLE: Dillon Mohr (approvedBy on launch-authority.json).

DEADLINE: No deadline stated.

IF IT SLIPS: Omega's daily paid budget keeps paying for clicks from people
looking for a competitor or a supplier instead of Omega, on a live paying
account already flagged high risk, and the roughly 2,000 remaining terms
behind this one keep compounding the same problem.

## 2. AI Division launch, D01, D10 and D18 still open

DECISION: Set a new date with Mac Frederick to close D01 (charter), D10
(outbound) and D18 (spend authority) from the AI division decision register,
or decide explicitly to leave the division unlaunched for now.

EVIDENCE: The 2026-09-11 gate meeting did not happen, confirmed by Dillon on
2026-09-14 as a birthday conflict rather than a completed review. All 20
decisions in pending-decisions.json still read state open, file untouched
since 2026-09-05. D01 and D10 block all outbound for the division, and D18
blocks client facing paid generation, a line the BOK Sunburst images already
crossed before this gate closed. Source, System/approval-queue.md, entry
dated 2026-09-14, citing 2026-09-11/cursor-orchestrator/REPORT.md and
pending-decisions.json.

RESPONSIBLE: No single decider. The substance of D01, D10 and D18 is Dillon
Mohr's call, but closing the gate also needs Mac Frederick's calendar, and
nobody currently owns getting that date on the books. That gap is itself the
finding.

DEADLINE: No deadline stated.

IF IT SLIPS: A service line that has been "about to start" since 2026-09-05
keeps stalling another day, while paid generation and outbound keep
happening ahead of the gate meant to authorize them.

## 3. MASTER-ORCHESTRATOR rewrite, keep or revert

DECISION: Keep the weekend rewrite of System/MASTER-ORCHESTRATOR.md as the
live operating contract, or revert to the last committed version.

EVIDENCE: The working copy measures 79 lines added and 498 removed against
git HEAD, and it is uncommitted, so every new session already loads the
rewritten version, not the committed one. Material additions include a model
routing ladder, a video ownership exception for one worker, a three worker
cap, and a rule to keep browser work backgrounded. Source,
System/approval-queue.md, entry dated 2026-09-14, sharpened the same day.

RESPONSIBLE: Dillon Mohr.

DEADLINE: No deadline stated.

IF IT SLIPS: Every session run in the meantime keeps operating under a
contract nobody with authority has approved, and any work done under the new
routing ladder or the ownership exception would need to be reconsidered if
the rewrite is later reverted.

## 4. No backup location outside this machine

DECISION: Name one location outside this machine for the unprotected media
and code estate, or state plainly that none will be provided yet.

EVIDENCE: About 95 GB of working material has no dependable copy off this
machine, including 575 unique films with no tracked copy anywhere and 56
separate Git roots with no remote at all. The estate grew about 9 GB in the
24 hours to 2026-09-15. This machine also has 14 unclean shutdowns logged in
the last 30 days with zero matching crash dumps, so the risk is not
hypothetical. Source, System/approval-queue.md, entries dated 2026-09-14 and
re-measured 2026-09-15.

RESPONSIBLE: Dillon Mohr.

DEADLINE: No deadline stated.

IF IT SLIPS: Every additional day adds more irreplaceable film and client
deliverable work to the pile a single hardware failure could take with it,
on a machine that is already losing power unexplained.

## 5. Cadence scheduled tasks have never fired

DECISION: Approve repairing or reregistering the three Windows scheduled
tasks, Cadence daily, Cadence weekly and Cadence monthly, yes or no.

EVIDENCE: A live check this morning shows all three at State Ready,
LastRunTime 11/30/1999, LastTaskResult 267011, meaning none has ever run.
The daily jobs only land because a separate Claude scheduled task calls the
driver directly, but nothing calls the weekly one, so omega search terms
(the very sweep behind packet 1) and report pairing check have now been
absent two Mondays running and will not run again before 2026-09-21. Source,
System/approval-queue.md, entry dated 2026-09-16, citing
12_Brain/07_Reviews/Cadence/2026-09-16 - cadence heartbeat.md.

RESPONSIBLE: Dillon Mohr. Task registration is an access change this driver
is not allowed to make itself.

DEADLINE: 2026-09-21, the next Monday run and a third consecutive miss.

IF IT SLIPS: The weekly checks this cadence exists to guarantee keep
silently not running, with nobody notified, which is the exact failure mode
this whole system was built to catch.

## 6. Apollo credit expansion for outbound

DECISION: Approve expanding the Apollo credit allowance so outbound can
import the held franchise list, or tell the team to work within the current
limit.

EVIDENCE: Beth Kann's outbound recap in #outbound on 2026-09-11 records it
as an open issue: importing an 800 plus name franchise list uses many
credits, and Allison was to confirm with Sean whether to expand them. No
confirmation or answer appears anywhere in the channel since, including the
three most recent days read for this packet. Source, Slack #outbound,
https://momentum3d.slack.com/archives/C0B6UUBMW9M/p1789150928741509.

RESPONSIBLE: Sean Boyle.

DEADLINE: No deadline stated.

IF IT SLIPS: The franchise list stays unimported, capping the volume of the
whole Apollo, LinkedIn and Instagram outbound push that Melissa, Ian and
Allison run week to week.

## 7. Deborah Mara WordPress admin password exposed in Slack

DECISION: Approve rotating the WordPress admin password for
deborah.azldigital.com and deleting the plaintext Slack message that exposed
it.

EVIDENCE: Muhammad U posted the admin password in plaintext in
#deborah-mara on 2026-09-11 at 03:46 EDT, paired with
dillonmohr8777@gmail.com and the admin login URL. It has been readable by
everyone in that channel for five days as of today, and it is the fifth
plaintext credential this queue has found in Slack. Value not reproduced
here. Source, System/approval-queue.md, entry dated 2026-09-14, and Slack
#deborah-mara.

RESPONSIBLE: Dillon Mohr.

DEADLINE: No deadline stated.

IF IT SLIPS: Dillon's own admin login for that site stays readable by the
whole channel another day, and doing only one half of the fix, a rotation
without a deletion or a deletion without a rotation, leaves the exposure
pattern in place either way.

## 8. Momentumsites homepage, Option 1 or Option 2

DECISION: Choose Option 1 (Felix's draft) or Option 2 (Obaid's draft) as the
new needmomentum.com homepage.

EVIDENCE: Mac Frederick posted both draft links in #momentumsites on
2026-09-14 at 14:46 EDT, asked the channel to vote, and set the deadline
himself as end of week, calling it not urgent but final. The thread shows
two replies, both from Mac inviting comment, and no channel member had
posted an actual pick as of this reading. Source, Slack #momentumsites,
https://momentum3d.slack.com/archives/C1CFQBC79/p1789411602805669.

RESPONSIBLE: Mac Frederick.

DEADLINE: 2026-09-18 (end of week, per Mac's own message).

IF IT SLIPS: Felix and Obaid keep two competing homepage builds live in
draft, and the service page and industry page work already queued behind
whichever one loses stays sequenced behind a choice that was due this week.
