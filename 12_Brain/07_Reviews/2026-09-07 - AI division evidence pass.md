---
note_type: review
status: active
created: 2026-09-07
updated: 2026-09-07
tags: [review, ai-division, momentum-360, operating-truth, control-system]
source_refs:
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-04-ai-division-plan\PLAN.md'
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\registry\clients.json'
  - '[[System/operating-status]]'
  - '[[System/approval-queue]]'
  - '[[01_Clients/Puttery NYC/Client Intelligence Overlay]]'
  - '[[01_Clients/Bridge Software Development/overview]]'
---

# AI division evidence pass

**Summary:** Operating truths found while testing the AI division thesis on
2026-09-07. These are launch dependencies, not housekeeping: the division sells
"evidence of what changed," and several parts of Momentum's own control system are
not currently observable.

Everything here feeds
[[12_Brain/05_Projects/2026-09-07 - Momentum AI division launch]].

## 1. The control system has blind spots

- **Five clients have live Slack channels and no vault record. Nexla is one of
  them** — and Nexla is the only client with **live ad spend invisible to the
  control system**. A spending account outside the evidence layer is the single
  worst fact in this list for a division whose pitch is measured delivery.
- **Vault folders diverge from Slack channels.** `Omega Landscaping` vs
  `#omega-landscape`. `Onsite Concrete` vs `#onsite-construction`. Name
  divergence is how a routing layer silently fails to join two records.
- **A `Shadow HVAC` folder holds a complete Next.js build with no Slack channel
  at all.** Delivered work with no communication lane attached.
- **`slackChannels` is populated for 5 of 24 registry records.** The registry is
  the routing authority the AI division plan names explicitly.

**Independent corroboration, found while verifying this pass:**
`node _os/automation/bin/frontmatter-validate.js` reports 40 of 42 client notes
complete. The two incomplete ones are **`01_Clients/Nexla/overview.md`** and
**`01_Clients/Puttery NYC/overview.md`**, both missing `last_touched`,
`next_action` and `due`. The two accounts flagged in this review as least visible
are the same two the validator cannot see either. That was not a search for
confirmation — it fell out of the health check.

## 2. The inbox is not a triage system

State on **2026-09-04**:

| Metric | Count |
|---|---|
| Messages | 104,403 |
| Unread | 93,334 |
| Drafts | 181 |
| **Unsent replies to paying clients** | **57** |
| Oldest such draft | 38 days |

The `Client Triage`, `Client Triage/Drafted` and `KJB Daily Leads` labels are all
**empty** — so the filters either never fired or stopped firing. The 57 drafts are
the visible symptom; the empty labels are the cause, and they are the thing to
fix.

Fifty-seven unsent replies to paying clients is the same failure mode as
[[12_Brain/03_Concepts/2026-09-07 - Conversion match-back is the differentiator]]:
a shared upstream mechanism broke, and the downstream instances were counted as
individual backlog items.

## 3. Roster truth

Align HCM is stale in the registry — active, six deliverables, one carrying a rush
fee — against three sources saying it ended, confirmed 2026-09-02. Closed out at
[[12_Brain/04_Decisions/2026-09-07 - Align HCM registry record is superseded]].
The registry file itself is outside this vault and was not edited.

## 4. Puttery — access, not commercial, is the blocker

- **Zero of seven access gates cleared** as of 2026-09-04.
- **Vendor eligibility IS confirmed** — Business Group **28086**, Business
  **37824**. This is the part that is usually the hard one, and it is done.
- **Joe Pedevillano asked on 2026-08-25** to confirm click-to-reservation
  matching. **No reply.**
- Momentum side: **Mac Frederick, Melissa Silber, Jesse DiLaura.**
- **"Lauren" is Laura at Resy**, `api-integration@resy.com`. Four items
  outstanding. Correct the name wherever it appears — a wrong name on a vendor
  contact is a real delay.

Reading: this confirms the AI division plan's judgment that Puttery is an
engineering proof opportunity, not the simplest first rollout. It also means the
gating work is chasing replies, not negotiating terms.

## 5. Bridge — the correction matters more than the status

**Status:** zero dated client acceptances against three paid milestones. Milestone
3 is complete but sits in an **unmerged PR**.

**Correction, recorded explicitly:** an earlier analysis attributed missed reviews
on **18 August, 23 August and 1 September** to Dillon. **That was wrong.** Those
were the client's slips, and the **1 September slot was declined by Tori**.

**Momentum is the fastest-moving party on Bridge.**

This is not a bookkeeping nicety. Bridge is one of the four registry-affiliated
accounts named in the AI division plan's founding-cohort selection. A false record
of Momentum lateness would have argued against using it — the correction changes a
plan input, not just a note.

## 6. Skills: more of them than believed, and in two places

- `dillon-os/.claude/skills/` holds **28 skills**, not the eight previously
  believed. The eight named (`client-pulse`, `client-report`, `content-scan`,
  `inbox-brief`, `metrics-pull`, `plan-today`, `vault-clean`, `week-review`) are a
  subset.
- The five Momentum skills resolve at the **account layer** and have **no
  `SKILL.md` anywhere under `C:\Users\dillo\.claude`**.
- **`client-report` and `momentum-client-report` collide.** Both trigger on
  "client report", "monthly report", "performance recap". The vault one renders
  branded HTML into `Daily-Briefs/reports/`; the Momentum one leads with named-lead
  match-back. They are complementary in intent and ambiguous in dispatch.

**Nothing was deleted.** This is recorded as an open item. The likely resolution —
vault skill renders, Momentum skill supplies the match-back spine — needs writing
down rather than leaving to dispatch order.

## 7. Security — exposure state, locators only

**No credential values appear in this note or anywhere in this pass.**

- A live Tock credential sat in plaintext in **Gmail thread `1a049e62f063f279`**,
  sent **2026-08-31** to **four recipients**. A revocation was **drafted
  2026-09-02 and never sent.**
- **Four further sets of plaintext credentials found in Slack**; oldest exposed
  **24 days**.
- `_os/test/public-safety.test.js` must continue to pass on every vault change.

Rotation and the revocation send are approval-gated and queued in
[[System/approval-queue|Approval Queue]]. Nothing was rotated, sent, or executed.

A division whose pitch is "we connect your systems and verify the result" should
not carry an unrotated credential exposure into its first client conversation.

## What was not done

No external send, publish, deploy or spend. No registry edit. No Zap change. No
credential rotation. No commit — the vault working tree carries in-flight changes
from another session, and committing would have swept them up. Files written and
`INDEX.md` updated; the commit is left to Dillon or to the session holding the
directory.
