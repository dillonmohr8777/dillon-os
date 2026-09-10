---
note_type: project
status: active
created: 2026-09-07
updated: 2026-09-07
horizon: 2026-12-07
tags: [project, momentum-360, ai-division, goal]
source_refs:
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-04-ai-division-plan\PLAN.md'
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-04-ai-division-plan\BUSINESS-EVIDENCE.md'
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-05-momentum-design-system\AUDIT.md'
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-05-momentum-design-system\audit\contrast.json'
  - '[[01_Clients/Omega Landscaping/Agent Memory]]'
  - '[[System/operating-status]]'
---

# Momentum AI division launch

**Summary:** The division is not a service line to describe. It is the delivery
machinery that got built the week of 2026-09-01, and the proof is measurable. The
canonical plan lives outside the vault; this note is its vault record, its
evidence trail, and its open-decision list.

## Where the plan lives

The plan is **not** duplicated here. Canonical document:

`C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-04-ai-division-plan\PLAN.md`

Prepared 2026-09-04 for Dillon and Mac Frederick. Corrected 2026-09-07 against
`QWEN27-REVIEW.md` (five defects). **Extended 2026-09-07** with the section
"Extension — 2026-09-07: the division already has a machine", which is the work
this note records.

Siblings in the same folder: `BUSINESS-EVIDENCE.md`, `LAUNCH-EXECUTION-PACK.md`,
`OPERATING-RUNBOOK.md`, `ONBOARDING-CHECKLISTS.md`, `PILOT-ACCEPTANCE-SUBSET.md`,
`MEETING-AGENDA.md`, `economics.py` / `.csv` / `.json`, `QWEN27-REVIEW.md`.

## The thesis, tested

Dillon to Mac in `#ai-tech-news`: organizational skills inside Claude, told who
the client is, that assemble the pre-existing Momentum assets — an overview deck,
for example — automatically, with brand continuity that never fails the design
test.

Tested against the filesystem on 2026-09-07, **the thesis holds**, with one
provenance failure:

| Part of the claim | State |
|---|---|
| Per-client context switch | Holds. `momentum-client-context` resolves the named client; the registry and `Resolve-Client.ps1` already route identity. |
| Reusable organizational skills | Holds in substance. Five Momentum skills resolve: `momentum-client-context`, `momentum-brand-system`, `momentum-client-intake`, `momentum-client-report`, `momentum-spec-homepage`. |
| Skills are auditable and portable | **Fails.** No `SKILL.md` exists under any `momentum-*` path anywhere in `C:\Users\dillo\.claude`. They resolve at the account layer. |
| "Never fails the design test" | Holds for the new system: 31 contrast pairs, 0 failures, and `build.py` refuses to render if any pair fails. Does **not** describe the existing estate — 37 of 120 measured pairs across ten live builds fail AA. |

The reusable lesson is at
[[12_Brain/03_Concepts/2026-09-07 - The delivery machinery is the product]].

## The evidence this plan now rests on

- **Design proof and the drift underneath it** —
  [[12_Brain/03_Concepts/2026-09-07 - One token cannot do two jobs]]
- **The differentiator, and the defect that produced it** —
  [[12_Brain/03_Concepts/2026-09-07 - Conversion match-back is the differentiator]]
- **Market position, dated and expiring** —
  [[12_Brain/06_Research/2026-09-07 - AI search retainer pricing and Philadelphia position]]
- **Operating truths found in the same pass** —
  [[12_Brain/07_Reviews/2026-09-07 - AI division evidence pass]]
- **Corrections to earlier claims** —
  [[12_Brain/08_Memory/2026-09-07 - Corrections from the AI division evidence pass]]
- **Roster supersession** —
  [[12_Brain/04_Decisions/2026-09-07 - Align HCM registry record is superseded]]

## The Google route — live-verified 2026-09-07

The machinery now includes a working Google AI Studio path on Dillon's key, which
turns "we can generate on demand" from a claim into a measured route:

- Stills: `gemini-2.5-flash-image`, $0.039 each, aspect ratio honoured.
- Analysis: `gemini-3.5-flash` — the five Higgsfield references were watched and
  transcribed shot by shot. `gemini-2.5-flash/pro` are **404 for this key**
  (`System/api-keys-setup.md` § Model entitlement).
- Video: Veo 3.1 Lite image-to-video confirmed — 4s/720p, $0.20, 30s render,
  mascot proportions held. Loop and reference-image behaviours are Fast-tier only.

Batch, prompts, reference analyses and cost routes:
`client-operations/clients/momentum-360/deliverables/2026-09-07-google-aistudio-batch/`
(`PRODUCTION-BATCH.md`, `batch-images.json`, `refs/`). Recommended route for
five workstreams is **$5.58**; four of the five references are motion-graphics
work that Remotion does at zero credits, and only the fireworks and the
origami macro earn generative video. No Higgsfield per-piece baseline exists in
the repo, so no "cheaper than Higgsfield" claim is made.

## The launch spot exists — 2026-09-07, evening

A :30 TV-format spot, a :15 cutdown and a :06 bumper were cut the same day the
thesis was written, from assets generated on Dillon's Gemini key and assembled in
the existing Remotion project. Total Google spend ≈ $12 against a $25 cap Dillon
set after the first charge; the cap is enforced by the runners, not by intent.

- Master: `client-operations/clients/momentum-360/deliverables/2026-09-07-google-aistudio-batch/spot/momentum_ai_launch_30s_v2.mp4`
- Script: `SPOT-SCRIPT.md` (Option A, silent-first; tagline **Built, not prompted.**)
- Copy rules: `research/copy-skills-scan.md` — twelve GitHub skills read; the
  reveal-timing and end-card rules were applied to v2.
- Delivery sheet: `DELIVERY.md`.
- Gallery (noindex): https://momentum-ai-launch-batch.netlify.app
- Launch collateral canvas (Claude Design): https://claude.ai/code/artifact/e9ce7032-81b1-4970-9aca-4d39a23eafc0
  — landing hero, Letter one-pager, five ebook covers, four-slide carousel; prices
  bracketed pending Mac; titles pending the AEO/GEO research pass.
- Ebook and blog programme in flight: `research/aeo-geo-topic-research.md`
  (keyword and topic scout) and `research/evidence-bank.md` (sourced results only —
  no invented figures, named clients only after case-study permission).

Two things the spot deliberately does not say: named-lead match-back (not yet true on
all four accounts — see [[12_Brain/03_Concepts/2026-09-07 - Conversion match-back is the differentiator]])
and any number, client name or guarantee. Mascot and founder-likeness pieces remain
internal until Mac's and Sean's written acceptance.

This is the thesis made watchable: told who the client is, the machine assembled
the assets, held the brand, and cut a spot — in a day, for twelve dollars.

## The finish line

From the canonical plan, unchanged by the extension: three signed paid pilots in
month one, at most one completed and referenceable implementation by day 30,
measured delivery economics by day 30. A pilot counts as signed only after
proposal acceptance, access approval, collected deposit or first invoice, and a
named operator. Discovery calls and qualified demos do not count.

Capacity binds hard: 15 hours/week proposed, 10 of them delivery. Three setups
need roughly four weeks of that allocation before any recurring service starts.
The internal fixes listed below consume the same hours and sit inside no client's
six-hour monthly budget.

## The evidence verdict — 2026-09-07 evening

An evidence pass over every client report and vault client folder
(`2026-09-07-google-aistudio-batch/research/evidence-bank.md`, ~150 sourced rows,
20 stories, 22 workflows) found **no verified business outcome for any active
paid-media client**: every Omega, Onsite, KJB, Replenish, Shadow and Nexla report says
"pending validation" for qualified leads, booked jobs and revenue. The only dollar
result in the tree is a client-reported $9,600 Fagan job (2026-08-20), unattributed.
No site launch has a measured before/after; every vault `Reporting Log.md` is an empty
template.

This generalises the match-back finding: the division's promise is "evidence of what
changed," and the agency does not yet hold that evidence for its own book. The launch
content was therefore built on what was **found and fixed** — the Zapier defect, 37 of
120 contrast pairs, the form that submitted before a name was typed, PMax conversions
attributed to a competitor's brand query, fourteen duplicate conversion actions, a
$115K account with a dead conversion tag — not on results. That is the honest book,
and it is the better one.

Consequence for the plan's day-30 gate: "measured delivery economics" requires a
reporting log that is actually filled in. Start with the founding cohort's own three.

## Open decisions

1. **Skill provenance.** The five Momentum skills have no source on this machine.
   If they are the product, their source belongs in a repo Dillon controls.
2. **Skill collision.** `client-report` (vault-local, at
   `dillon-os/.claude/skills/`, which holds 28 skills) and `momentum-client-report`
   (account layer) both trigger on "client report", "monthly report",
   "performance recap". **Nothing is deleted.** Which owns the phrase is a
   decision to write down, not to leave to dispatch order.
3. **AEO price positioning** — founding-cohort $1,500/month or standard
   $2,500/month. Mac's call. `needmomentum.com` has no AEO page today.
4. **Social Packages** have no scope and no acceptance contract. They should not
   appear on a deck until they do.
5. **Match-back must be fixed before it is sold.** True on one account of four.
6. **Nexla must become visible** to the control system before the division claims
   an evidence layer.

## Boundary

Nothing in this project has been sent, published, deployed or emailed. Every
external action — the AEO proposal, the match-back Zap change, the Tock
credential revocation, client outreach — is gated in
[[System/approval-queue|Approval Queue]].

## Asset archive, September 8, 2026

[[01_Clients/Momentum 360/AI Division Library/README|Momentum AI Division Library]] contains the private repository download catalog: 39 current Claude Design MP4s (36 new silent reviews of 18 segments plus three preserved refined earlier films), five interactive ebook editions and 174 PDF pages, ten unpublished article drafts, deck, planning sources, artwork and earlier launch assets. Rejected/incomplete versions and source footage are counted separately. Source: the linked library and its exact-file manifest. The requested Chain Reaction refinement is a pending derivative and is excluded from this snapshot.
