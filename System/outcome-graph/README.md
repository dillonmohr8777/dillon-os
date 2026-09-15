# Outcome Graph v1

Outcome Graph v1 is Dillon OS's bounded graph of independently verified loops. It is the missing runtime layer between the 54-routine operating contract, Marketing Chief routing, client-operations execution graphs, and the Obsidian evidence system.

It does not replace Marketing Chief, the canonical client queue, approval policy, or the client-operations execution graph. It supplies one stricter definition of completion across them:

> A run is complete only when a fresh, scoped, independently measured terminal predicate is true and every required artifact is evidenced by path, hash, and acceptance assertion.

## What the reference workflow gets right

The TikTok example moves through three levels:

1. A prompt gives one agent instructions.
2. A loop gives one agent a finish line, verifier, and stopping condition.
3. A graph coordinates multiple isolated loops, then merges and independently validates their work.

Dillon OS already has rich routing, permissions, budgets, retries, checkpoints, approval gates, and per-work-item execution graphs. The live gap is outcome truth. The legacy Claude loop can mark a routine complete after nine generic stages and a structural registry check even when the declared business artifact is not among the evidenced paths.

The practical mismatch is:

- The routine registry names an artifact and value signal, but does not encode an executable objective, terminal predicate, required artifact paths, or terminal verifier.
- The runtime's build stage often runs a generic health or status command instead of producing the routine's declared artifact.
- The runtime's verification proves stage choreography and registry integrity, not the routine-specific result.
- A loop receipt and checkpoint can satisfy artifact evidence even when the declared report, calendar, brief, website batch, or decision artifact is absent.
- Checker findings do not drive a bounded revision of the exact failed artifact.
- Learning emits a receipt but does not require a correction entry and drift fingerprint.
- A degraded completion can participate in deduplication and prevent the missing outcome from being repaired.
- client-operations has the stronger per-work-item execution graph, but the 54-routine scheduler, Obsidian graph, and that execution graph are not yet one observable graph of loops.

## Runtime shape

    fresh sources
        |
    planner
        |
    bounded fan-out by isolation key
        |
        +-- maker -> independent checker -> retry from findings --+
        +-- maker -> independent checker -> retry from findings --+  parallel
        +-- maker -> independent checker -> retry from findings --+
        |
    collision-safe reducer
        |
    independent terminal verifier
        |
        +-- false -> learn -> bounded graph retry
        |
        +-- true -> correction receipt -> approval gate if required -> complete

The implementation is adapter based. It coordinates bounded work but does not grant new capabilities. Client routing, canonical writes, connector access, publishing, sending, spend, deployment, and approval rules remain owned by their existing systems.

The durable runner wraps that graph in a noncanonical execution-state envelope:

    canonical locator + version + SHA-256
        |
    deterministic dedupe identity
        |
    one renewable lease
        |
    revisioned atomic checkpoint after each checked worker
        |
    crash -> re-plan -> compare signature -> rehash artifact -> resume
        |
    terminal truth -> reread canonical binding -> commit receipt

The checkpoint is execution truth, not a second queue. For client work, the
existing Marketing Chief graph and handoff path remain authoritative, and only
Marketing Chief may mutate `client-operations/queue/work-items.json`.

Canonical adoption uses the existing `client-operations` path, not a new
Outcome Graph writer. A terminally verified graph may assemble a redacted,
version-bound worker handoff. `Test-MarketingExecutionGraph.ps1` and
`Test-MarketingHandoff.ps1` must validate the exact graph, client, work item,
artifact locators, privacy state, approval gate, transition, and current item
version. Only `Accept-WorkerHandoff.ps1`, invoked as `marketing-chief`, may then
reconcile it. That reconciler rereads queue revision and item version under a
lock, rechecks the active client and approval/WIP state, creates backups,
atomically renders queue plus CONTROL state, and records a receipt. Its dry-run
and adversarial Marketing OS suite passed on August 24. Workers and Outcome
Graph never write the canonical queue directly.

## Required parameters

| Parameter group | Required truth |
|---|---|
| Objective | One observable outcome, not a list of activities |
| Value signal | The business evidence that makes the outcome worth completing |
| Constraints and upstream artifacts | Exact boundaries and source locators carried into every handoff |
| Scope | Exact root, isolation key, and data class |
| Source freshness | Timestamp, maximum age, and named evidence |
| Finish line | Executable predicate plus required artifact paths or patterns |
| Stopping | Graph iterations, worker attempts, timeout, concurrency, and budget |
| Planner | Produces unique items with input fingerprints and isolation keys |
| Maker | Returns an isolated workspace ID and declared artifact evidence |
| Checker | Different adapter from maker; returns pass or explicit findings |
| Reducer | Merges only checked artifacts and refuses collisions |
| Terminal verifier | Different from maker and reducer; runs acceptance assertions and hashes final artifacts |
| Approval | Remains separate from outcome truth; external actions require the existing human gate |
| Governance | Orchestrator, canonical state, dedupe key, checkpoint, rollback, escalation, allowed actions, and forbidden actions |
| Learning | Records corrections and a drift fingerprint from inputs, artifacts, and assertions |
| Canonical binding | Exact locator, version, SHA-256, and fingerprint captured before the run and reread before receipt commit |
| Durable state | Dedupe identity, renewable lease, revisioned checkpoint, event sequence, plan signature, verified-worker evidence, and immutable receipt hash |

## Non-negotiable completion gates

A runtime result must not be complete unless all of these are true:

1. Source evidence is inside its freshness window.
2. The plan contains at least one unique, fingerprinted work item.
3. Every maker attempt has a unique isolation ID.
4. Every maker returns at least one declared artifact.
5. A different checker passes every work item.
6. Failed checks route explicit findings into a bounded retry.
7. The reducer receives only passed work and merges without collisions.
8. The terminal verifier returns real acceptance assertions.
9. Every assertion passes.
10. Every required artifact pattern is present with a SHA-256 and byte count.
11. The learning adapter records the result and correction state.
12. Any required approval is satisfied after verification, never inferred from verification.
13. The contract names one canonical state, dedupe key, checkpoint, rollback, and escalation route.
14. A live dedupe lease prevents overlapping work for the same contract and canonical binding.
15. Every checkpoint write is atomic, revisioned, read back, and compare-and-swapped against the prior state hash.
16. A resumed plan matches the checkpointed plan signature.
17. A resumed worker is reused only when its input fingerprint and persisted artifact hash revalidate.
18. Canonical locator, version, and hash still match immediately before a terminal receipt is committed.
19. A duplicate trigger returns the prior verified receipt only while its final artifacts still revalidate.

Timeout, budget, stale source, missing evidence, exhausted retries, terminal failure, and adapter failure all block. None synthesize success.

## Weekly workflow migration map

The existing weekly estate contains eleven routines, including two twice-weekly paid-media passes. Each keeps its current owner and approval boundary.

| Routine | Outcome Graph finish line |
|---|---|
| W01 queue, calendars, deadlines | Every active client work item and committed deadline reconciles to the canonical queue and calendar with no unexplained mismatch. Marketing Chief remains the only queue writer. |
| W02 and W03 paid-media review | Each exact client and channel has fresh source evidence, tracking and conversion definitions are validated, recommendations are client-separated, and no spend or configuration write occurs. |
| W04 content and creative calendar | Every approved in-scope commitment has a dated, owned, editable production artifact and source locator; no publication is implied. |
| W05 Prospect Radar Next 20 | Every selected prospect is policy-eligible and isolated; every site artifact, responsive check, evidence recording, and adoption gate passes. Existing Netlify rules still govern deployment. |
| W06 client weekly reports | Every in-scope client has a separate report and source ledger; KPI math recomputes from named fields; inaccessible fields remain pending rather than estimated. |
| W07 outreach and follow-up drafts | Every intended recipient and thread is exactly routed; the full unsent draft and signature pass read-back; nothing sends without exact approval. |
| W08 CRO, SEO, AEO, GEO, offer, and outreach experiments | Every experiment has a hypothesis, current evidence, measured result, decision, owner, and next review date. |
| W09 automation reliability | Every claimed completion is matched to its declared artifact and terminal assertion; false completion, duplicate storms, stale checkpoints, and blocked connectors remain visible. |
| W10 executive weekly review | The review resolves current evidence into explicit decisions, owners, due dates, approval needs, and the next safest action without creating a second queue. |
| W11 knowledge graph health | Structural graph tests pass and the current operating changes are discoverable from the vault home, project, client, protocol, and evidence paths. |

Daily and event-driven work uses the same contract. Communications fan out by exact thread and client; reporting by client and date window; content by deliverable; web work by repository and surface; design by surface and approved authority; deployment by mapped site; CRM and paid media by exact portal, account, brand, channel, and attribution definition. Cross-client fan-in is prohibited unless Marketing Chief explicitly requests a cross-client view.

## Migration sequence

1. Keep the legacy scheduler unchanged and run the outcome graph in shadow mode.
2. Migrate W09 and W11 first because they are read-only verification routines.
3. Migrate W04, W06, W08, and W10 after three consecutive truthful canaries.
4. Migrate draft-only communications with exact thread and recipient isolation.
5. Migrate client web and reporting execution by handing bounded items to the existing client-operations execution graph.
6. Keep sending, posting, publishing, spend, account changes, and other consequential writes behind their existing approval gates.
7. Retire structural-only completion only after every executable routine has an objective, terminal predicate, required artifact contract, executable independent verifier, and stopping condition.

Crash-resumable checkpoints and canonical-state-bound dedupe are now implemented
for the reference runner, the W09/W11 shadow, and the W04/W06/W08/W10 weekly
tranche, W05, W01/W07 readiness, the W02/W03 paid-media passes, and the
D03/D07/E04/E10 reliability module. The fail-closed canary covers a
forced mid-run crash, valid-worker reuse, corrupt-worker rebuild, plan drift,
out-of-band checkpoint modification, canonical drift, expired and live leases,
duplicate triggers, and invalidated final artifacts.

This does not authorize live scheduler cutover. All 29 executable routines now
have real durable shadow evidence, which satisfies the evidence prerequisite
for a separate cutover review. Structural-only completion remains live until
Marketing Chief explicitly reviews and authorizes retirement.
Consequential client work must additionally end at a version-bound Marketing
Chief handoff and fresh canonical readback, never a direct Outcome Graph queue
write.

## Contract coverage and current cutover state

The August 24 contract catalog closes the definition and shadow-execution gaps
without broadening authority:

- all 29 executable routines now have an Outcome Graph v1 objective, freshness
  gate, required artifact roles, routine-specific terminal assertions,
  independent executable verifier, stopping limits, canonical-binding dedupe,
  isolated durable checkpoint, rollback, approval boundary, and correction
  fingerprint;
- W01, W02, W03, and W07 also have read-only governed-route contracts even
  though the worker registry correctly denies them execution authority;
- all 29 executable routines have revalidated durable shadow evidence;
- W01 and W07 have separate durable readiness evidence, but that readiness does
  not grant queue, message, list, or contact write authority;
- W02 and W03 now have account-bound durable read-only receipts. Their graph
  migrations are verified, but their business reviews remain correctly held:
  pass A found zero review-ready lanes and pass B found zero distinct later
  observations. Eligibility to collect evidence is not review readiness;
- `legacy_retirement_ready` now means only that the 29-of-29 evidence
  precondition is satisfied. `scheduler_cutover_authorized` remains false, and
  the live scheduler remains unchanged.

The generated catalog is
`System/outcome-graph/routine-contract-catalog-2026-08-24.json`. The shared
terminal verifier rehashes required artifacts, checks source freshness and the
canonical binding, requires every routine-specific measurement to bind to a
current source or artifact hash, enforces maker-checker separation and authority
boundaries, and requires a correction receipt plus drift fingerprint. Tests run
that verifier through all 29 executable contracts and the four governed weekly
routes, then deliberately falsify one terminal predicate for every route to
prove that completion is rejected.

## Closed-loop web design

Web design is the primary end-to-end proof case. A substantive UI run starts
only after resolving the exact repository, named surface, Persuade, Operate,
Read, or Experience mode, product truth, design authority, and implementation
scope. Each candidate is isolated and must pass authority, brief, build,
responsive, interaction, accessibility, performance, content-truth,
design-system, and independent-craft gates.

The checker operates on real desktop and mobile renders. Its exact findings
become the next maker input, repairs are bounded, and only checked artifacts may
reduce. The terminal verifier re-renders the final candidate from the same
source binding, rehashes the captures and files, and requires a closed defect
ledger. Graph readiness, production readiness, adoption, deployment, delivery,
and business outcome remain separate states.

The live browser canary first failed closed as
`OGD-20260825-0516D9AE0E9A` with 25 detector findings after three bounded
attempts. The implementation was repaired without weakening the detector.
Run `OGD-20260825-11747080BBC9` then reached `awaiting_approval` after two
maker attempts and one repair cycle with zero open defects, a 4.5 craft average,
desktop and mobile evidence, and seven terminally verified artifacts. It is a
verified nonproduction candidate because its reviewer was synthetic. No
deployment occurred.

The Impeccable preflight also produced two durable corrections: the Windows
PowerShell `$IsWindows` collision was removed, and YAML `status: seed` is now
recognized. D13 consequently passes the real preflight but still holds when a
surface brief and implementation do not exist.

### Production adoption decision

On August 24, Dillon approved `WEB-DESIGN-CLOSED-LOOP` as a manual-event
production overlay for one primary portfolio product and the existing 238-page
Momentum 360 prospect estate. This is 239 logical site records. Because the
portfolio emits separate HRchitect and general build variants, the estate can
produce 240 routes without pretending those variants are independently designed
sites.

The adoption does not add a 55th scheduled routine, retire the legacy scheduler,
or authorize batch deployment, sending, account changes, or a new public
destination. The portfolio is the first production-intent pilot. The prospect identity gate
is now closed: all 238 current rows reconcile to 236 businesses in the older
245-slug inventory, with 238 stable page IDs and one `retain`, `repair`, or
`exclude` disposition per row. The two-row difference is real versioning:
Johnny's Pizza and THR Insurance each have one cleared page and one held page.
The nine predecessor-only slugs remain outside the current projection.

That identity result does not promote the estate to production. The current
actions are 133 retain-and-validate records, 87 repair-and-validate records,
and 18 no-build, no-pitch exclusions. Each retained or repaired page still has
to pass the adopted rendered quality loop before deployment can be considered.
Every active record also receives a public-safe Mohr Media presentation binding:
the exact prospect logo must resolve through the portfolio particle system and
link to that business's concept page. The 133 retain records preserve their
existing layout and imagery when authority and rendered quality pass. The 87
repair records add a surface brief, brand-specific image direction, verified or
provenance-recorded generated imagery, and one isolated Impeccable layout repair.
Generic logo substitution and one-template-for-all replacement are prohibited.
At a 20-page ceiling, those actions form seven retain waves, five repair waves,
and one terminal exclusion wave. Concurrency is capped at three pages. The
portfolio pilot has now passed its terminal gate, scored 9.3 in fresh craft
review, deployed to its two exact existing Netlify sites under the standing
mapped-site publication rule, and passed live read-back. Active prospect waves
remain held at the next independent gate: exact-logo source authority.

The first candidate collection extracted 187 assets. Visual review rejected 35
wrong or generic assets and held 17 ambiguous assets for manual source matching;
135 only passed this initial visual screen, 32 records have no candidate, and one
page fetch remains held. No candidate is exact-logo verified or registry
eligible, so none may be bound to particles or promoted by inference.

The frozen decision and acceptance contract live at
`System/outcome-graph/web-design/production-adoption-2026-08-24.json`.
The two portfolio build variants are bound to their exact existing Netlify
site IDs in `System/outcome-graph/web-design/portfolio-deployment-targets-2026-08-24.json`;
no deployment was performed by that read-only mapping step.
The row-level source snapshot and deterministic reconciliation live at
`System/outcome-graph/source-snapshots/momentum-current-238-rows-2026-08-24.json`
and `System/outcome-graph/web-design/momentum-238-reconciled-manifest-2026-08-24.json`.
The checkpointed action plan is
`System/outcome-graph/web-design/momentum-238-wave-plan-2026-08-24.json`.
The deployed portfolio terminal receipt is
`System/outcome-graph/web-design/portfolio-terminal-receipt-2026-08-24.json`.
The fail-closed logo screen is
`System/outcome-graph/web-design/momentum-particle-logo-candidates-2026-08-24/review-findings.json`.

## Final governance loops

The final six routines use the same source-bound maker, checker, reducer,
terminal-verifier, and learner contract:

- M02 evaluates all 21 registered agents and keeps naming, contract, sample,
  and maker-checker risks visible without permission changes or deletion.
- M03 inventories ten scheduled routines and leaves unavailable billing costs
  pending validation rather than inventing zero.
- M04 checks 25 clients across route, asset, communication, metric, account,
  and access-metadata surfaces. Its 150 isolated checks either map to exactly
  one client or produce a hash-only quarantine proposal. The first run stopped
  at the 96-unit default budget; the corrected 384-unit contract completed in
  304 units without moving a record.
- M05 compares global, project, surface, and rendered design authority. It
  exposes the missing declared visual-direction asset as a proposal and does
  not overwrite canonical documentation or generated sidecars.
- E11 defines the unique `WEB-DESIGN-CLOSED-LOOP` feedback edge, proves a
  positive terminal canary and negative false-completion case, and leaves
  registry and scheduler adoption proposal-only.
- D26 creates one source-located Obsidian proposal for the existing High Craft
  Website Factory concept. It does not create a duplicate note or adopt the
  proposal canonically.

These routines intentionally preserved their own failed receipts while they
were being hardened: the M04 budget stop, E11 non-boolean terminal assertion,
and M05 namespaced-ID mismatch became regression cases rather than being
rewritten as success.

## What the current outreach lists reveal

The Google Drive screenshot is a good human interface but not yet a safe state
model. Live read-only inspection found two concrete projection failures:

- Momentum's current CALL LIST, HOLD, and DO NOT PITCH sheets contain 238 rows,
  while the guide declares 236 distinct businesses. None of the sheets carries
  a stable canonical row identity, so the two-record delta and cross-state
  exclusivity cannot be proven even though normalized names do not overlap.
- The franchise full source contains 720 rows and 720 unique emails but only
  719 nonempty Prospect IDs. Its separate 50-row Wave 1 projection shares all
  50 IDs with the full source but only 48 rows match exactly. One email and one
  other field differ. A current HOW TO USE document and an older, non-superseded
  README also declare incompatible totals.

The missing engineering pattern is one canonical identity-keyed table whose
rows move through explicit states. CALL LIST, HOLD, DO NOT PITCH, Wave 1, and
screen-share views should be generated projections, never independently edited
state stores. A row needs at least a stable ID, source fingerprint, state,
state reason, version, last verified time, and separate approval fields. A list
title or `cleared to show` flag must never imply contact or send approval.

Those six failures are now terminal W07 findings. The durable readiness run
`OGD-20260824-C071D3426A15` reconciled 62 isolated records, passed all five
graph-level assertions, reported W01 and W07 not ready, and returned the same
verified receipt on an immediate duplicate trigger.

The replacement model is implemented in
`_os/automation/lib/outcome-graph-outreach-state.js`. It enforces optimistic
version checks, opaque stable entity IDs, one canonical eligibility state,
separate presentation and outreach state, exact content-and-version-bound
approval, provider readback before `sent`, and generated-only projections.
Synthetic tests prove that `cleared_to_show` never becomes approval, stale
writers are rejected, a worker cannot self-approve, sent state cannot exist
without the immediately prior exact approval plus readback, and independently
edited projection rows fail verification. The privacy-safe migration plan at
`System/outcome-graph/outreach-list-state-migration-2026-08-24.json` retains all
six live holds and performs no Drive or contact mutation.

W05 now has the same negative-truth protection. Durable run
`OGD-20260824-23145989F598` found a fresh pool of only 6 eligible candidates
against the required 20, verified all eight gate reconstructions, classified
the business state as `held_source_pool`, detected the legacy false-completion
claim, and deduplicated on replay. A graph completing truthfully is not the same
as the website batch being complete.

W02 and W03 now enforce the same distinction for paid media. Durable pass-A run
`OGD-20260824-201320896830` proved that the legacy daily manifest's
`ready-for-read-only-review` state was only evidence-collection eligibility:
all 56 manifest checks were still pending. The live redacted shadow bound five
of seven provider accounts exactly, held Fresh Blends as unverified, held
Shadow Meta as ambiguous, retained all seven lanes as conversion-reporting
pending validation, classified one platform result count as a claim rather
than downstream truth, and observed one unpublished provider draft without
touching it. It therefore completed the graph with zero review-ready lanes.
Durable pass-B run `OGD-20260824-B4CE4BE41CCE` matched the exact pass-A artifact
hash and scope for all seven lanes, found zero later observations, and held all
seven trend decisions. Both runs returned the same verified receipt on an
immediate duplicate trigger. No provider, CRM, spend, delivery, communication,
or canonical queue mutation occurred.

The same source-bound durable harness now covers reliability. D03 run
`OGD-20260824-AB98BE6292F0` reconstructed eight automation surfaces and kept
seven degraded, blocked, or stale states visible. D07 run
`OGD-20260824-B630ED6F0337` reduced those findings to seven unique open
incidents with stable fingerprints and one bounded proposal each. E04 run
`OGD-20260824-5977C3E84A99` preserved six failed connector states and their
pre-run checkpoint hashes while claiming zero recoveries. E10 run
`OGD-20260824-1CA32B8705DA` verified the intended Hermes process but held the
runtime because stale heartbeat and log state plus missing inbound and reply
readback do not prove sustained behavior. Every run returned the same receipt
on replay. No restart, retry, connector substitution, checkpoint advance,
secret access, provider mutation, or competing command center was attempted.

That migration also corrected a false-green freshness defect in the connector
health probe. Provider evidence is now aged against the real evaluation time,
not the state file's modification time, and future-dated observations fail
closed. The current snapshot therefore reports zero usable connectors rather
than treating the six-day-old observations as fresh.

## Commands

    node _os/automation/bin/outcome-graph.js canary
    node _os/automation/bin/outcome-graph.js crash-canary --out System/outcome-graph/crash-replay-canary-receipt.json
    node _os/automation/bin/outcome-graph.js audit-legacy
    node _os/automation/bin/outcome-graph.js catalog-routines --generated-at ISO-DATE --out System/outcome-graph/routine-contract-catalog-YYYY-MM-DD.json
    node _os/automation/bin/outcome-graph.js plan-outreach-state --snapshot System/outcome-graph/source-snapshots/google-drive-list-state-YYYY-MM-DD.json --generated-at ISO-DATE --out System/outcome-graph/outreach-list-state-migration-YYYY-MM-DD.json
    node _os/automation/bin/outcome-graph.js shadow-weekly --output-dir System/outcome-graph/shadow-YYYY-MM-DD-run-N --out System/outcome-graph/shadow-YYYY-MM-DD-run-N/run-receipt.json
    node _os/automation/bin/outcome-graph.js shadow-weekly-durable --output-dir System/outcome-graph/shadow-YYYY-MM-DD-run-N-durable --out System/outcome-graph/shadow-YYYY-MM-DD-run-N-durable/run-receipt.json
    node _os/automation/bin/outcome-graph.js shadow-weekly-tranche-durable --output-dir System/outcome-graph/tranche-YYYY-MM-DD-run-N-durable --reference-date YYYY-MM-DD --out System/outcome-graph/tranche-YYYY-MM-DD-run-N-durable/run-receipt.json
    node _os/automation/bin/outcome-graph.js shadow-command-comms-durable --output-dir System/outcome-graph/readiness-YYYY-MM-DD-run-N-durable --reference-date YYYY-MM-DD --out System/outcome-graph/readiness-YYYY-MM-DD-run-N-durable/run-receipt.json
    node _os/automation/bin/outcome-graph.js shadow-paid-media-durable --routine W02 --review-date YYYY-MM-DD --evidence System/outcome-graph/source-snapshots/paid-media-live-YYYY-MM-DD.json --output-dir System/outcome-graph/routines/W02/YYYY-WwwA-live-shadow --out System/outcome-graph/routines/W02/YYYY-WwwA-live-shadow/run-receipt.json
    node _os/automation/bin/outcome-graph.js shadow-paid-media-durable --routine W03 --review-date YYYY-MM-DD --evidence System/outcome-graph/source-snapshots/paid-media-live-YYYY-MM-DD-pass-b.json --pass-a-artifact System/outcome-graph/routines/W02/YYYY-WwwA-live-shadow/paid-media-review-a.json --output-dir System/outcome-graph/routines/W03/YYYY-WwwB-live-shadow --out System/outcome-graph/routines/W03/YYYY-WwwB-live-shadow/run-receipt.json
    node _os/automation/bin/outcome-graph.js shadow-reliability-durable --routine D03 --reference-date YYYY-MM-DD --output-dir System/outcome-graph/routines/D03/YYYY-MM-DD-reliability-shadow --out System/outcome-graph/routines/D03/YYYY-MM-DD-reliability-shadow/run-receipt.json
    node _os/automation/bin/outcome-graph.js shadow-performance-durable --routine D17 --reference-date YYYY-MM-DD --output-dir System/outcome-graph/routines/D17/YYYY-MM-DD-performance-shadow --out System/outcome-graph/routines/D17/YYYY-MM-DD-performance-shadow/run-receipt.json
    node _os/automation/bin/outcome-graph.js shadow-foundation-durable --routine D13 --reference-date YYYY-MM-DD --output-dir System/outcome-graph/routines/D13/YYYY-MM-DD-foundation-shadow --out System/outcome-graph/routines/D13/YYYY-MM-DD-foundation-shadow/run-receipt.json
    node _os/automation/bin/outcome-graph.js shadow-governance-durable --routine M04 --reference-date YYYY-MM-DD --output-dir System/outcome-graph/routines/M04/YYYY-MM-DD-governance-shadow --out System/outcome-graph/routines/M04/YYYY-MM-DD-governance-shadow/run-receipt.json
    node _os/automation/bin/outcome-graph.js shadow-website-factory-durable --output-dir System/outcome-graph/factory-YYYY-MM-DD-run-N-durable --as-of ISO-DATE --out System/outcome-graph/factory-YYYY-MM-DD-run-N-durable/run-receipt.json
    node _os/automation/bin/outcome-graph.js web-design-canary-durable --output-dir System/outcome-graph/web-design/closed-loop-canary/YYYY-MM-DD-live --as-of ISO-DATE --out System/outcome-graph/web-design/closed-loop-canary/YYYY-MM-DD-live/run-receipt.json
    node _os/automation/bin/outcome-graph.js validate --graph System/outcome-graph/outcome-graph.example.json
    node --test _os/automation/tests/outcome-graph*.test.js

The canary deliberately makes one bad isolated artifact on its first attempt. The checker rejects it, the maker revises from the finding, the reducer merges only passed artifacts, and the independent terminal verifier proves exact source-to-test coverage with a real test command.

On August 24, 2026, five consecutive live W09 and W11 shadow runs also passed.
Each run re-collected the live registry, Claude loop receipts, scheduler tests,
second-brain structural checks, and graph measurement at planning, independent
checking, and terminal verification. No live queue or scheduler state was
changed.

The sixth live W09/W11 run used the durable layer. Run
`OGD-20260824-CC761B2EBA1E` completed against canonical binding
`ae4f7a7e7ab7557375ba9cc4350a97b68c0194b2be63cabd4372222648b1df4e`,
then an immediate duplicate trigger returned the same receipt without invoking
the planner or workers. Both final artifacts rehashed successfully; the dedupe
record and checkpoint were complete and revisioned; no lease remained.

The live W04/W06/W08/W10 tranche then ran as 38 independently checked workers
against a 67-file manifest. Run `OGD-20260824-6B0B68A4B5B4` passed all five
terminal assertions against canonical binding
`c43368d99375da442f76cdf5cd36be9294545af266f3df25a51f14b2947f07a6`.
Its six content-calendar sources were all held because no current canonical
production commitment supported scheduling; all 12 discovered report packages
passed source, render, math, language, and hash checks while delivery remained
separately gated; and all 20 experiments remained inconclusive because none had
a retained verified outcome receipt. W10 produced four ranked proposals without
writing the canonical queue or taking an external action. An immediate duplicate
trigger returned the same run and left every generated artifact unchanged.
