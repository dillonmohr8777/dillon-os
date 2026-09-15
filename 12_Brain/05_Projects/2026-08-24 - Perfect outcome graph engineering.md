---
note_type: project
status: active
created: 2026-08-24
updated: 2026-08-24
owner: Dillon Mohr
area: company operating system
priority: high
outcome: Every recurring Dillon OS workflow runs as a bounded graph of isolated loops and can claim completion only when its real business finish line is independently proven from fresh evidence.
next_action: Finish the primary portfolio production pilot, then process the reconciled Momentum estate as 133 retain-and-validate records, 87 repair-and-validate records, and 18 no-build exclusions.
due: none
review_on: 2026-08-31
source_refs:
  - "https://www.tiktok.com/@codenameposhan/video/7670379431621365023"
  - "[[System/outcome-graph/README]]"
  - "System/outcome-graph/legacy-audit-2026-08-24.json"
  - "System/outcome-graph/source-snapshots/momentum-current-238-rows-2026-08-24.json"
  - "System/outcome-graph/web-design/momentum-238-reconciled-manifest-2026-08-24.json"
  - "System/outcome-graph/web-design/momentum-238-wave-plan-2026-08-24.json"
  - "System/outcome-graph/web-design/portfolio-deployment-targets-2026-08-24.json"
  - "System/outcome-graph/canary-receipt-2026-08-24.json"
  - "System/outcome-graph/shadow-2026-08-24-run-1/run-receipt.json"
  - "System/outcome-graph/shadow-2026-08-24-run-2/run-receipt.json"
  - "System/outcome-graph/shadow-2026-08-24-run-3/run-receipt.json"
  - "System/outcome-graph/shadow-2026-08-24-run-4/run-receipt.json"
  - "System/outcome-graph/shadow-2026-08-24-run-5/run-receipt.json"
  - "System/outcome-graph/crash-replay-canary-receipt.json"
  - "System/outcome-graph/shadow-2026-08-24-run-6-durable/run-receipt.json"
  - "System/outcome-graph/tranche-2026-08-24-run-2-durable/run-receipt.json"
  - "System/outcome-graph/readiness-2026-08-24-run-2-durable/run-receipt.json"
  - "System/outcome-graph/factory-2026-08-24-run-1-durable/run-receipt.json"
  - "System/outcome-graph/routines/W02/2026-W35A-live-shadow/run-receipt.json"
  - "System/outcome-graph/routines/W03/2026-W35B-live-shadow/run-receipt.json"
  - "System/outcome-graph/routines/D03/2026-08-24-reliability-shadow/run-receipt.json"
  - "System/outcome-graph/routines/D07/2026-08-24-reliability-shadow/run-receipt.json"
  - "System/outcome-graph/routines/E04/2026-08-24-reliability-shadow/run-receipt.json"
  - "System/outcome-graph/routines/E10/2026-08-24-reliability-shadow/run-receipt.json"
  - "System/outcome-graph/web-design/closed-loop-canary/2026-08-24-live/web-design-loop-receipt.json"
  - "System/outcome-graph/web-design/closed-loop-canary/2026-08-24-live/design-defect-ledger.json"
  - "System/outcome-graph/routines/E11/2026-08-24-governance-shadow/run-receipt.json"
  - "System/outcome-graph/routines/M04/2026-08-24-governance-shadow/run-receipt.json"
  - "System/outcome-graph/routines/D26/2026-08-24-governance-shadow/run-receipt.json"
  - "System/outcome-graph/routine-contract-catalog-2026-08-24.json"
  - "System/outcome-graph/source-snapshots/google-drive-list-state-2026-08-24.json"
  - "System/outcome-graph/outreach-list-state-migration-2026-08-24.json"
  - "System/outcome-graph/web-design/production-adoption-2026-08-24.json"
  - "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-08-12-ai-tech-news-batch-registry/site-inventory.csv"
  - "[[12_Brain/09_Ops/AGENT_PROTOCOL]]"
  - "[[12_Brain/03_Concepts/Automation and Workflow Engineering]]"
tags:
  - brain
  - project
  - automation
  - agents
  - outcome-graph
---

# Perfect outcome graph engineering

## Goal

Turn Marketing Chief, Dillon OS, client-operations, and the Obsidian evidence
system into one observable organization of bounded loops without creating a
second command center.

The graph must continuously discover in-scope work, route it by exact client
and system boundary, execute in isolated workspaces, independently check each
artifact, merge only passed work, prove the business outcome from fresh
evidence, respect every approval gate, and record drift and corrections.

## Why this goal exists

The August 24 live audit found:

- 54 registered routines, including 29 executable routines.
- All 29 executable routines lack an explicit executable objective, terminal
  predicate, required artifact path contract, executable terminal verifier,
  and stopping-condition object.
- All 24 completed receipts in the inspected August 24 loop log evidence only
  the loop log and the routine checkpoint.
- All 24 independent-verification claims in that snapshot are structural stage
  and gate checks, not routine-specific artifact or value-signal checks.
- The legacy system can therefore prove that orchestration ran while the
  declared report, calendar, brief, site batch, or decision artifact remains
  unproven.

This is a false-completion problem, not primarily a prompting problem.

## Finish line

- [x] Every one of the 29 executable routines has one observable objective.
- [x] Every executable routine has a source-freshness gate.
- [x] Every executable routine has required artifact paths or patterns.
- [x] Every executable routine has an independent executable terminal verifier.
- [x] Every executable routine has graph iteration, worker retry, timeout,
  concurrency, and budget limits.
- [x] Every executable routine binds its dedupe key and checkpoint to canonical
  state and can resume safely after a mid-run crash.
- [x] The reference runtime and W09/W11 shadow bind dedupe to canonical state,
  checkpoint verified workers atomically, and resume safely after a forced
  mid-run crash.
- [x] Every executable routine has a tested rollback contract.
- [x] Makers and checkers are separate, and checker findings drive the next
  bounded attempt.
- [x] Parallel work is isolated by client, account, thread, deliverable,
  repository, or other exact ownership key.
- [x] Reducers merge only checked artifacts and refuse collisions or cross-client
  blending.
- [x] Completion requires passing acceptance assertions plus artifact paths,
  SHA-256 values, and byte counts.
- [x] Approval remains a separate state after outcome verification.
- [x] Learning writes a correction receipt and drift fingerprint.
- [x] Three consecutive shadow canaries pass for W09 and W11.
- [x] W04, W06, W08, and W10 pass their real outcome contracts in shadow mode.
- [x] W05 truthfully holds at its real source-pool gate and deduplicates on
  replay instead of accepting structural completion.
- [x] W01 and W07 reconcile the canonical queue, 45 Gmail drafts, and two live
  Drive list workflows without queue, message, list, or contact mutation.
- [x] All 29 executable contracts plus four governed weekly-route contracts pass
  a positive canary and reject a deliberately false terminal predicate.
- [x] Deep durable shadow migration reaches 29 of 29 executable routines.
- [x] W02 and W03 have exact-account durable read-only receipts. Both graphs
  truthfully completed with the paid-media business state held rather than
  promoting evidence-collection eligibility into review readiness.
- [x] Dillon approved `WEB-DESIGN-CLOSED-LOOP` as a manual-event production
  overlay for the primary portfolio plus the existing 238-page Momentum estate.
  This did not authorize scheduler cutover or deployment.
- [ ] The primary portfolio passes one production-intent maker-checker-repair
  run and terminal desktop/mobile re-render.
- [x] The 245-slug predecessor inventory reconciles exactly to the current 238
  page rows and 236 businesses, with 238 stable page IDs, 236 stable business
  IDs, and explicit retain, repair, or exclude dispositions.
- [ ] The legacy structural-only completion path is retired only after a
  separate Marketing Chief cutover review. The 29-of-29 evidence precondition
  is met; the scheduler and live execution authority remain unchanged.

## Web design centerpiece

The primary proof case is substantive web design, not paid media. The reusable
loop now requires one exact repository and named surface, a resolved Persuade,
Operate, Read, or Experience mode, hash-bound product and design authority, an
isolated candidate, rendered desktop and mobile evidence, deterministic gates,
independent craft review, exact checker findings fed into the next maker
attempt, a bounded repair budget, a closed defect ledger, and a terminal
re-render from the same source binding. Adoption, production review, deployment,
and delivery remain separate states.

The prospect experience deliberately combines two design worlds. The primary
portfolio and Mohr Media surface supply the memorable personalization layer:
IMMOHRTAL particle matter resolves into the exact named prospect logo. The
Momentum estate supplies the repeatable Impeccable layer: business-specific
art direction, verified or provenance-recorded generated imagery, responsive
layout craft, rendered checks, one bounded repair, and terminal verification.
Active estate records therefore require an exact-logo particle presentation
binding as well as a linked concept page. The 133 retain records are protected
from speculative redesign; the 87 repair records receive an isolated
brand-specific image and layout pass. The 18 exclusions receive neither. Past
Align HCM work may remain as clearly labeled public website evidence, but it is
not current-employer framing and its portfolio phrases are not copied.

The live browser-backed canary first stopped as
`OGD-20260825-0516D9AE0E9A`: its weak draft retained 25 detector findings and
could not claim completion. The page itself was repaired rather than weakening
the detector. Run `OGD-20260825-11747080BBC9` then completed the graph at
`awaiting_approval` after two maker attempts, one repair cycle, zero open
defects, a 4.5 craft average, desktop and mobile captures, and seven hash-bound
artifacts. It remains a verified nonproduction candidate because the reviewer
was synthetic, and no deployment was attempted.

That distinction is the core operating rule: graph-ready is not the same as
production-ready, adopted, deployed, delivered, or business-complete.

On August 24, Dillon separately approved production adoption for 239 logical
site records: one primary portfolio product plus 238 existing Momentum 360
prospect concept pages. The portfolio has HRchitect and general build variants,
so those 239 logical sites can emit 240 routes. The prospect number is a
remediation estate, not permission to generate 238 unsupported replacements.
Current evidence separates 133 cleared-to-show rows, 87 holds, and 18 do-not-
pitch rows. The 238 pages now reconcile to 236 businesses: Johnny's Pizza and
THR Insurance each have one cleared page plus one held replacement page. The
deterministic manifest resolves 219 rows by concept URL slug, 12 by exact
normalized name, and seven by bounded brand-and-location alias decisions. Nine
older slugs are not in the current projection. Identity is therefore closed,
while repair, rendered QA, deployment, delivery, and business outcome remain
separate downstream states. The 238 records are now partitioned into seven
retain waves, five repair waves, and one terminal exclusion wave, each capped
at 20 records and three concurrent workers. All waves remain held until the
primary portfolio closes its terminal production gate.

## Current implementation

Outcome Graph v1 now provides:

- a strict contract and JSON schema;
- a bounded adapter-based graph runner;
- fresh-source, timeout, retry, concurrency, budget, isolation, approval, and
  learning gates;
- parallel maker-checker loops with explicit correction handoff;
- collision-safe reduction;
- independent terminal assertions and artifact hashing;
- a legacy-runtime false-completion audit;
- a synthetic canary in which one worker fails on attempt one, is corrected from
  checker findings, passes on attempt two, and only then reaches merge and
  terminal completion;
- deterministic tests that prove false completion is blocked.
- five consecutive live W09 and W11 shadow runs whose planning, isolated
  artifacts, independent checks, reduction, terminal verification, correction
  receipts, and drift fingerprints all passed.
- a noncanonical durable state store with canonical locator, version, and hash
  binding; deterministic dedupe identity; renewable leases; atomic revisioned
  checkpoint compare-and-swap; plan signatures; verified-worker artifact
  revalidation; and final receipt readback;
- an adversarial crash/replay canary proving same-run recovery, no redo of a
  valid checked worker, corrupt-artifact rebuild, plan-drift rejection,
  out-of-band checkpoint rejection, canonical-drift rejection, stale-lease
  recovery, live-lease refusal, duplicate suppression, and final-artifact
  invalidation;
- one live durable W09/W11 run plus a duplicate-trigger readback. Run
  `OGD-20260824-CC761B2EBA1E` completed, and the repeated trigger returned its
  existing verified receipt without rerunning graph adapters;
- one live durable W04/W06/W08/W10 tranche with 38 isolated workers and five
  passing terminal assertions. Run `OGD-20260824-6B0B68A4B5B4` held all six
  content sources rather than inventing commitments, passed all 12 discovered
  report packages while retaining their delivery gates, kept all 20 experiments
  inconclusive without outcome receipts, and produced a proposal-only W10. Its
  duplicate trigger returned the same run and changed no generated artifact.
- a generated contract overlay for all 29 executable routines. Each contract
  has routine-specific artifacts and assertions, an executable terminal
  verifier, freshness and canonical binding, stopping limits, isolated durable
  checkpoint, rollback, approval isolation, and learning fingerprints;
- four additional governed weekly-route contracts for W01, W02, W03, and W07.
  These remain read-only shadow routes and carry no worker execution authority;
- a shared verifier canary across all 33 contracts. It rehashes real fixture
  artifacts and accepts the complete evidence packet, then rejects each route
  when one routine-specific terminal measurement is changed to false;
- durable W01/W07 run `OGD-20260824-C071D3426A15`, with 62 isolated records,
  five passing graph-level assertions, truthful negative readiness, and an
  identical deduplicated replay;
- durable W05 run `OGD-20260824-23145989F598`, which found only 6 of the required
  20 source-ready prospects, classified `held_source_pool`, detected the legacy
  false-completion claim, and returned the same receipt on replay;
- durable W02 pass-A run `OGD-20260824-201320896830`, which reconciled all seven
  canonical paid-media lanes, exposed 56 pending manifest checks behind the
  legacy ready label, bound five provider accounts exactly, held one account
  unverified and one ambiguous, kept all conversion reporting pending
  validation, and produced zero review-ready recommendations;
- durable W03 pass-B run `OGD-20260824-B4CE4BE41CCE`, which revalidated the
  exact pass-A artifact hash and lane scope for all seven lanes, found no later
  observation, asserted no trend, and returned the same receipt on replay;
- one reusable source-bound runtime for routine-specific planning, isolated
  maker-checker reconstruction, exact reduction, frozen evaluation clocks,
  privacy checks, terminal source rehash, durable replay, and explicit
  negative business states;
- durable D03 run `OGD-20260824-AB98BE6292F0`, which reconstructed all eight
  named reliability surfaces, separated inventory from delivery and process
  presence from behavior, and retained seven actionable degraded, blocked, or
  stale states;
- durable D07 run `OGD-20260824-B630ED6F0337`, which reduced those failures to
  seven unique source-bound incident fingerprints with bounded reversible
  proposals;
- durable E04 run `OGD-20260824-5977C3E84A99`, which held six failed connector
  states, preserved every checkpoint hash, and claimed no recovery, retry,
  substitution, or checkpoint advance;
- durable E10 run `OGD-20260824-1CA32B8705DA`, which verified the intended
  Hermes process but held runtime recovery because stale heartbeat and log
  evidence plus missing inbound and reply readback cannot prove sustained
  behavior. All four reliability runs deduplicated on replay;
- a corrected connector freshness gate that evaluates provider observations
  against the real current clock. A freshly rewritten state file can no longer
  make six-day-old provider evidence usable, and future-dated observations fail
  closed;
- a reusable browser-backed web-design runtime with authority, brief, build,
  responsive, interaction, accessibility, performance, content-truth,
  design-system, and independent-craft gates; exact checker defects become the
  next maker input and terminal replay re-renders the final candidate;
- a repaired Windows Impeccable preflight. The PowerShell `$IsWindows`
  collision no longer breaks the tool, YAML `status: seed` is recognized, and
  D13 now truthfully passes preflight while holding at the missing surface brief
  and implementation gate;
- six final governance shadows: M02 evaluated all 21 agents without permission
  changes; M03 inventoried ten schedules while leaving every unavailable cost
  pending rather than zero; M04 checked 150 client-separated route, asset,
  communication, metric, account, and access-metadata surfaces; M05 exposed one
  missing declared visual-authority asset without overwriting documentation;
  E11 proposed the unique checker-to-maker design feedback routine without
  changing the registry or scheduler; and D26 routes one deduplicated Obsidian
  knowledge proposal to the existing High Craft concept rather than creating a
  competing note;
- a privacy-safe live Drive snapshot proving six W07 structural holds: Momentum
  lacks stable row identity, cannot reconcile 238 state rows to 236 declared
  businesses, and cannot prove cross-state exclusivity; the franchise source
  has 719 Prospect IDs for 720 rows, its Wave 1 projection matches only 48 of 50
  shared-ID rows exactly, and its current instruction precedence is ambiguous.
- an executable identity-keyed outreach state machine. It separates eligibility,
  presentation, outreach, approval, and delivery; uses optimistic entity
  versions; binds approval to exact content and version; requires provider
  readback for sent state; and treats CALL LIST, HOLD, DO NOT PITCH, Wave 1, and
  draft-ready as generated projections. Stale writers, worker self-approval,
  and independent projection edits all fail closed in tests.
- the canonical adoption leg remains the existing Marketing Chief handoff path,
  not an Outcome Graph queue writer. The current client-operations test suite
  passed its redacted handoff validation, exact client and work-item binding,
  optimistic queue and item versions, approval and WIP gates, dry-run
  reconciliation, locking, backup, rollback, and atomic queue plus CONTROL
  render path.

The live Claude scheduler has not been changed. Outcome Graph v1 remains in
shadow mode even though all 29 executable routines now have real durable shadow
evidence.
The durable runner now proves mid-run recovery and canonical-state-bound dedupe
for the reference, W09/W11, W04/W06/W08/W10, W05, and W02/W03 paths. W01/W07
have the same durable mechanism as governed read-only readiness routes. D03,
D07, E04, and E10 now use the reusable source-bound durable harness. All four
governed weekly routes are now deep-shadow verified. The evidence prerequisite
for a cutover review is complete; no cutover, scheduler mutation, production
adoption, deployment, send, spend, or canonical queue write was inferred from
that fact.

## Web-design production adoption

The separately approved web-design leg is now a real production path, not a
Google Ads workflow and not a scheduler cutover:

- the primary Experience portfolio passed both production builds, desktop and
  mobile inspection, keyboard and reduced-motion checks, zero-violation Axe,
  exact prospect-route QA, WebGL/image/lazy-chunk failure QA, and a fresh
  read-only craft review at 9.3 average with no material findings;
- its deterministic alpha-aware particle engine now resolves the exact
  IMMOHRTAL mark, then a registry-bound prospect mark or the intentional YOU
  wordmark, without generated-logo substitution;
- the exact existing `dillon-mohr-portfolio` and `dillon-mohr-for-you` Netlify
  sites were deployed and live-read back. Titles, canonicals, built asset
  names, robots, sitemaps, the Sability route, mobile layout, resources,
  accessibility, and live particle chunks passed;
- the Momentum estate remains exactly 238 page records for 236 businesses:
  133 retain, 87 repair, 18 exclude, 13 bounded waves, and at most three
  parallel lanes;
- the first fail-closed logo pass extracted 187 candidate assets. Visual review
  rejected 35 wrong, generic, vendor, badge, banner, or blank assets and held
  17 ambiguous marks for manual source matching. The other 135 only passed the
  first visual screen; 32 records have no candidate and one page fetch remains
  held. Zero logos are exact-source verified or registry eligible yet;
- active Momentum waves therefore remain held at exact-logo source authority.
  The portfolio gate is closed, but no prospect page may receive a particle
  binding or production promotion until its logo bytes and authoritative source
  are matched and independently rechecked;
- Align HCM appears only as selected past public website work. Nothing in the
  portfolio implies current employment or affiliation, and the flagship story
  is independent web design plus the Momentum production system.

This production adoption does not authorize a new public destination, batch
deployment, external send, scheduler mutation, or canonical queue write.

## Weekly migration order

1. W09 automation reliability and W11 knowledge graph health.
2. W04 content calendar, W06 client reports, W08 experiments, and W10 executive
   review.
3. W01 queue reconciliation and W07 outreach drafts under Marketing Chief's
   canonical-write and exact-approval rules. Completed as read-only readiness
   shadows; source state remains not ready.
4. W02 and W03 paid-media reviews with exact client, account, channel,
   attribution, and tracking isolation. Completed as truthful read-only
   shadows; the live review state remains held pending current D17 and D18
   evidence plus a distinct pass-B observation.
5. W05 website factory through the existing local factory evidence path and
   deployment policy. Contract and truthful hold shadow completed; the actual
   20-site batch remains blocked at 6 source-ready prospects.
6. Migrate foundation, performance, governance, and knowledge routines in
   source-bound module batches. Completed with truthful negative states and
   29-of-29 durable shadow coverage.
7. Review scheduler cutover, routine adoption, and production design review as
   separate decisions. No decision is implied by shadow completion.

## Stop conditions

Stop and report blocked when sources are stale, client or account routing is
ambiguous, an adapter exceeds its authority, artifacts collide, any checker or
terminal assertion remains false after its bounded attempts, a budget or
timeout is reached, a human-only gate appears, or an external action lacks the
exact required approval.

Do not convert those states into degraded completion.

## Evidence

- [[System/outcome-graph/README|Outcome Graph v1 contract and migration map]]
- [W09 and W11 shadow receipt 1](../../System/outcome-graph/shadow-2026-08-24-run-1/run-receipt.json)
- [W09 and W11 shadow receipt 2](../../System/outcome-graph/shadow-2026-08-24-run-2/run-receipt.json)
- [W09 and W11 shadow receipt 3](../../System/outcome-graph/shadow-2026-08-24-run-3/run-receipt.json)
- [W09 and W11 shadow receipt 4](../../System/outcome-graph/shadow-2026-08-24-run-4/run-receipt.json)
- [W09 and W11 shadow receipt 5](../../System/outcome-graph/shadow-2026-08-24-run-5/run-receipt.json)
- [Crash and replay canary receipt](../../System/outcome-graph/crash-replay-canary-receipt.json)
- [Durable W09 and W11 shadow receipt](../../System/outcome-graph/shadow-2026-08-24-run-6-durable/run-receipt.json)
- [Durable W04, W06, W08, and W10 shadow receipt](../../System/outcome-graph/tranche-2026-08-24-run-2-durable/run-receipt.json)
- [Durable W01 and W07 readiness receipt](../../System/outcome-graph/readiness-2026-08-24-run-2-durable/run-receipt.json)
- [Durable W05 factory readiness receipt](../../System/outcome-graph/factory-2026-08-24-run-1-durable/run-receipt.json)
- [Durable W02 paid-media pass-A receipt](../../System/outcome-graph/routines/W02/2026-W35A-live-shadow/run-receipt.json)
- [Durable W03 paid-media pass-B receipt](../../System/outcome-graph/routines/W03/2026-W35B-live-shadow/run-receipt.json)
- [Durable D03 automation-health receipt](../../System/outcome-graph/routines/D03/2026-08-24-reliability-shadow/run-receipt.json)
- [Durable D07 incident-triage receipt](../../System/outcome-graph/routines/D07/2026-08-24-reliability-shadow/run-receipt.json)
- [Durable E04 connector-recovery receipt](../../System/outcome-graph/routines/E04/2026-08-24-reliability-shadow/run-receipt.json)
- [Durable E10 runtime-recovery receipt](../../System/outcome-graph/routines/E10/2026-08-24-reliability-shadow/run-receipt.json)
- [Closed-loop web-design receipt](../../System/outcome-graph/web-design/closed-loop-canary/2026-08-24-live/web-design-loop-receipt.json)
- [Closed-loop design defect ledger](../../System/outcome-graph/web-design/closed-loop-canary/2026-08-24-live/design-defect-ledger.json)
- [Web-design routine proposal receipt](../../System/outcome-graph/routines/E11/2026-08-24-governance-shadow/run-receipt.json)
- [Client-separation governance receipt](../../System/outcome-graph/routines/M04/2026-08-24-governance-shadow/run-receipt.json)
- [Obsidian knowledge-proposal receipt](../../System/outcome-graph/routines/D26/2026-08-24-governance-shadow/run-receipt.json)
- [All-routine contract catalog](../../System/outcome-graph/routine-contract-catalog-2026-08-24.json)
- [Privacy-safe Google Drive list snapshot](../../System/outcome-graph/source-snapshots/google-drive-list-state-2026-08-24.json)
- [Outreach state migration plan](../../System/outcome-graph/outreach-list-state-migration-2026-08-24.json)
- [Manual production adoption contract](../../System/outcome-graph/web-design/production-adoption-2026-08-24.json)
- [Portfolio terminal and live-deployment receipt](../../System/outcome-graph/web-design/portfolio-terminal-receipt-2026-08-24.json)
- [Momentum particle-logo review findings](../../System/outcome-graph/web-design/momentum-particle-logo-candidates-2026-08-24/review-findings.json)
- [[12_Brain/09_Ops/AGENT_PROTOCOL|Agent protocol]]
- [[12_Brain/03_Concepts/Automation and Workflow Engineering|Automation and workflow engineering]]
