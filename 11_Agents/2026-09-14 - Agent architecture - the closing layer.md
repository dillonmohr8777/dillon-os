---
date: 2026-09-14
status: proposed
supersedes: OPERATING-PLAN-2026-09-09.md (agent roster section only)
---

# The closing layer

## The goal

> **Every number Momentum puts in front of a client is one Dillon can defend,
> and it gets there without him assembling it.**

Two halves, both measurable, both currently at zero.

| | Measure | Today |
|---|---|---|
| **Defensible** | Reported conversions that trace to an accepted lead | **0 of 26 clients** can do this |
| **Without him** | Deliverables carrying delivery evidence | **25 of 226 — 11%** |

Thirty-day target: Omega and Onsite reconcile end to end, and generated equals
delivered for every active client in the week it was generated.

**The anti-goal.** More agents producing more output nobody reads. The estate
already does that extremely well.

---

## The diagnosis

### 1. Every agent is an advisor, and the refusal is circular

Not one of the 17 Claude agents can send, post, publish or deploy. Twenty-three
of 28 Codex automations carry explicit `never send` / `drafts only` / `read-only`
text. That alone would be a bottleneck. What makes it a trap is the shape:

**Nine Claude agents refuse their own closing routines as `never - Codex-owned,
refuse`.** The Codex automations they defer to are themselves forbidden to send,
or paused. So every path runs:

```
agent -> "Codex owns closing" -> Codex automation -> "never send" -> approval queue -> Dillon
```

Every route terminates at one person. The approval queue is the drain everything
empties into and nothing empties out of: **110 open, 8 closed, 54 rotting past
14 days, oldest 64 days.** Seventeen items date to 2026-07-12 and name
deliverables that are finished and sitting on disk right now.

### 2. The generator is recurring and the closer is finite

`finish-twelve-weekly-report-sends` is the only component in the entire estate
with send authority. On 2026-09-08 it ran, sent 11 emails with verified message
IDs, persisted receipts, and **self-paused as designed**. It was never restarted.

`weekly-client-marketing-reports` is `ACTIVE` on `FREQ=WEEKLY;BYDAY=MO`. It has
fired six times since. It fired again **today at 10:00 and produced nothing** —
no report folder, no Gmail draft. Verified both on disk and in the mailbox.

That is the backlog in one sentence: **the generator repeats and the closer ran
out.**

The shape repeats elsewhere — `six-hour-important-email-drafter` has no sender,
`slack-reply-watchdog` has no poster, and `momentum-radar-daily-12` builds twelve
homepages a day with no `status` field at all, so it cannot even be scheduled.

### 3. The numbers underneath it were never real

Found and fixed today, verified against the live site before anything was touched.

Omega's Google Ads conversion fired **inside the form's submit handler** — on
click, before Netlify accepted the POST and before `netlify-honeypot="bot-field"`
filtered bots. Every bot the honeypot caught was reported to Google as a
conversion. Smart Bidding has been optimising toward button clicks.

**Correction, same day:** Onsite does *not* share that bug. Verified directly:
its landing page has no `gtag`, no `AW-` id, no GTM container and no thank-you
page, so it has **no conversion tracking on the page at all**. Its Ads account
instead carries **twelve conversion actions with nine marked primary**, including
`Local actions - Directions` and three separate clicks-to-call actions, plus four
overlapping form actions. Different defect, arguably worse: Omega counted one
thing wrongly, Onsite counts a directions tap as equal to a submitted lead. Fixed in commit `34c456c`, with `conversion-gate.test.js` covering
all six paths plus a regression guard.

And the reconciliation could not complete anyway. Zapier lead notifications carry
a link, not the lead. Match-back has been promised **13 times** across Omega, KJB
and Onsite and delivered zero times. Omega has no call tracking, and calls are
roughly a third of their signal. CallRail covers Momentum's own line, has never
completed a single run, and is disabled.

**"Google Ads is not converting" has been measured against a number that was
never real.** That is the finding under the finding.

---

## The reframe

The 17 agents are organised like an agency org chart — one per function: paid
media, content, email, CRM. That is how you organise **humans**, who each have
one skill and eight hours a day. Agents have neither constraint, and the
org-chart shape forces a handoff at every boundary with Dillon as the router.

**Organise by loop instead.** One agent owns one outcome end to end:

```
sense -> decide -> act -> verify -> file
```

No handoff. No router. No Dillon in the middle.

**The rule that makes it real** already exists in `_os/automation/cadence/driver.md`
and nothing else in the estate uses it:

> A job that produced nothing is `failed`, not `ok`.

Every agent below carries it. Produced nothing, filed nothing, or claimed an
artifact that is not on disk — all three are loud failures, never silence.

---

## The roster

Six loop-owners and two keepers. The others are **absorbed, not deleted** — their
accumulated prompt knowledge merges into whichever agent owns their loop.

| Agent | Owns, end to end | Model | Absorbs |
|---|---|---|---|
| **conversion-truth** | Instrumentation is correct -> spend, conversions and accepted leads reconcile -> the number is defensible | Opus 5 | paid-media-analyst, client-conversion |
| **report-courier** | Build -> deploy -> stage the draft -> record the receipt. **One agent, so there is no half to pause** | Opus 5 | revenue-ops-analyst (W06) |
| **closer** | Drains the approval queue. Anything internal: does it, commits it, checks it off | Opus 5 | new — this is the anti-bottleneck |
| **creative-foundry** | Video and design, every render indexed in an asset ledger | Opus 5 | content-producer, web-product-builder |
| **auditor** | Reads the run ledger; finds jobs that claimed `ok` and produced nothing | Sonnet 5, frequent | qa-critic, reliability-scout |
| **scout** | New business: find -> qualify -> build -> stage outreach | Sonnet 5 | prospect-intelligence-scout, email-outreach |

**Keep unchanged:** `brain-curator` and `job-search` — the only two lanes with no
duplicate, and `job-search` is the stated north star.

**Retire:** `cross-reference`, `hubspot-tracker` and `skill-selector` fold into
`auditor`. `marketing-chief`'s orchestration moves into the cadence manifest,
which is data rather than a prompt, so adding work becomes a YAML entry.

### The authority clause, replacing "staged only"

Every loop-owner gets this in place of the current refusal text:

> **Finish internal work.** Commit it, file it, index it, fix the config, update
> the tracker, check the item off the queue. Everything you do is a git commit
> and is reversible.
>
> **Stage external work, never perform it.** Email, Slack, publishing, deploys,
> spend, live campaign changes and account settings are staged as real drafts
> and stop there. A draft in Dillon's account is finished work; a file on disk
> is not.
>
> **Never widen your own access.** A job you cannot run under current permissions
> is a `failed` with a note, never a permissions edit.

This needs **no permissions change**. `defaultMode` is already
`bypassPermissions` — the agents are self-limiting by their own prompt text. The
authority change is an edit to markdown files.

---

## The shared state

One ledger, written by every loop, read by all of them.

```
12_Brain/state/business-ledger.jsonl
{"client","week","spend","platform_conversions","accepted_leads",
 "report_built","report_delivered","last_contact","blockers"}
```

This is the de-bottlenecking. That state currently lives scattered across
`approval-queue.md`, `intake/`, `12_Brain`, per-client deliverables, and **three
client registries that disagree** — 24 entries canonical, 7 in
`_os/reporting/client-registry.json`, 27 on the unmerged branch
`registry/add-nexla-puttery-mara-20260909`. Reports render from the ledger.
Workmate answers from the ledger. One write, many readers.

**First fix: one registry wins.** Nexla, Puttery and Deborah Mara — three of the
most active accounts — are invisible to the report generator because they exist
only on the unmerged branch.

---

## Getting lead data without waiting on the client

Correction recorded 2026-09-14: **David does not respond.** The Omega access
request drafted 2026-07-30 and re-drafted today is therefore not a path, and
nothing should be sequenced behind it. It stays staged in Gmail as a draft; it is
not the plan.

The path that needs nobody's permission but Dillon's:

1. **Fix the Zapier payload.** The Zaps are in Momentum's own Zapier account. The
   notification email currently carries a "view this Zap run" link instead of the
   lead fields. Putting the fields in the body makes every future lead a named,
   parseable record with no client access required. This one defect sits behind
   all 13 broken match-back promises.
2. **Parse the corrected notifications into the ledger.** Once the fields arrive
   in the mailbox, `conversion-truth` reads them directly — Gmail access already
   works.
3. **Label the call leg honestly** until call tracking exists. Roughly a third of
   Omega's signal is phone, currently measured as a click on a `tel:` link.
   Report it as not measurable rather than implying it is measured.

Fagan Painting is the proof this works — it is the one account where leads were
ever parsed out of the email body, and it needed no special client access.

---

## Build order

1. **Grant authority.** Rewrite the clause in the six loop-owners. No code.
2. **`closer`, pointed at the 110-item queue.** Immediate, visible, and it proves
   authority works before anything depends on it.
3. **`conversion-truth`, Omega first.** The instrumentation fix landed today.
   Next is the Zapier payload, then real reconciliation. Not the access request.
4. **`report-courier`.** Retire the generator/sender pair rather than restarting
   the sender — a finite closer will only run out again.
5. **`auditor`** once there is a ledger worth auditing.
6. **`creative-foundry`** and **`scout`**.

Schedule stays at three cadence routines reading manifests, so routine count
never grows with job count.

## Verification

- `closer` works when the approval queue is **shorter than yesterday**, two days
  running. It has never once gone down.
- `conversion-truth` works when one client's reported conversions reconcile to
  named accepted leads, with the gap stated as a number.
- `report-courier` works when generated equals delivered in the same week.
- `auditor` works when a **deliberately broken job produces a visible failure**.
  A monitor that cannot fail is not a monitor.

## Out of scope

Client sends stay staged as drafts, per Dillon's decision on 2026-09-14. Spend,
deploys, live campaign changes and account settings stay gated.
`launch-authority.json` remains `status: draft`, `approvedBy: null`.
