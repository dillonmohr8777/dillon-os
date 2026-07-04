---
tags: [ads-ops, action-packet]
date: 2026-07-04
cycle-status: FAIL-CLOSED — zero verified actions reached this packet
---

# Ads Ops Action Packet — 2026-07-04

**One-liner:** the adversarial-verify stage received ZERO proposed actions for
all 8 accounts — the verify prompt in `.claude/workflows/ads-ops-big-run.js`
(line 107) said "Below are proposed actions" but never embedded the audit
JSON. Every account fail-closed. **Nothing in this packet authorizes account
changes**; the one apply item below is the spec-standing, read-only NKCDC LP
check. Workflow bug fixed in this commit — re-run audit→verify before the next
apply session.

## Apply list

**Global: DO NOT apply anything from this cycle's raw audit outputs.** They
are UNVERIFIED, not approved. The empty per-client lists below mean
"verification did not run", NOT "all actions killed on merit."

### NKCDC — LP live check (the only cleared item; spec-standing, verification-only)

- **Change:** in the local Chrome session, load the exact intake URL from the
  spec — `businesstaxprep.fshtechnologies.org/intake/free-tax-prep?ref=…` with
  the **`ref=` param preserved verbatim** — and record whether it serves.
  Evidence this cycle says it now does (see Research notes). Source of
  authority: [[02_Campaigns/Ads Ops/NKCDC Ads Spec|NKCDC Ads Spec]] cycle
  action #1 ("Check LP status each cycle… the moment it's live → launch
  checklist"). Lane: conversions. Impact: high.
- **Verify:** page returns 200 with the intake form rendered and `ref=`
  intact in the address bar. If live, proceed to the spec's pre-launch
  checklist (bind conversion action to intake submit or `ref=` arrival,
  verify tag) — but do **not** enable paused campaigns until the re-run
  audit→verify chain clears it. If not live, chase via Mac per spec.

### All other accounts

- Bar Crawl USA, KJB, Replenish, Shadow HVAC, Fagan Painting, Omega,
  Onsite: **no verified actions this cycle.** Re-run required (see Flags).

## Flags

### Global — pipeline failure (root cause of the empty cycle)

- Verify-stage input missing for all 8 accounts: the prompt template at
  `.claude/workflows/ads-ops-big-run.js:107` interpolated `audit.client` but
  never the audit's actions/flags/blocked JSON. Unverifiable = killed
  (fail-closed). Treat this cycle as "verification did not run."
- The script's `.then(v => v || audit)` fallback only guards a null verify
  result — these non-empty empty-list results replaced the audits, which is
  the correct fail-closed outcome: unverified actions stayed out of the packet.
- Same class of bug hit the packet stage: research survivors were never
  interpolated into the composer prompt (line 124 passes only `audited`), and
  the skeptic's VERDICTS schema dropped each claim's source URL — survivors
  were unlandable as sourced pages even if delivered.
- **Fixed in this commit** (`.claude/workflows/ads-ops-big-run.js`): verify
  prompt now appends `JSON.stringify(audit)`; skeptic verdicts carry
  source/date through; packet prompt now includes survivors. Re-run the
  audit→verify chain for all accounts before the next apply session.
- Cache interaction: the concept page landed this cycle is tagged
  `ads-research` with `expires: 2026-08-03`, so next run's research-cache
  check will read FRESH and skip the research wave. This cycle's web-research
  survivors were lost — if you want them regenerated, run `/research-sweep`
  manually or expire that page early.

### Bar Crawl USA

- Google Ads **435-710-2897** is a confirmed ID (verify-live-first applies to
  KJB, not Bar Crawl). Re-run order: audit "Alcohol information" /
  "Destination not working" disapprovals first; destination URLs must match
  the tracker sheet (Crawl Maps has its own URL); budget moves >20% in one
  step get flagged, not applied.
- No fallback packet existed (this is the first file in `Daily-Briefs/ads-ops/`),
  so the original audit flags/blocked could not be preserved — never delivered.

### KJB (Kimberly James Bridal)

- Spec state confirmed fresh 2026-07-04: live account = **814-550-6229**;
  721-491-4099 is Cancelled (source:
  [[raw/2026-07-04 - preflight-readback]], line 23). Resubmitted actions
  targeting 814-550-6229 do not need a verify-live-first step this cycle.
- Standing checks for resubmitted actions: (1) Disney-style rejected Meta ads
  verified dead every cycle until confirmed; (2) public reports/client comms
  aggregate-only, no lead PII, CC Mac/Sean/Melissa; (3) budget steps ≤20%
  (account is $300/mo — flag anything > ~$60/mo equivalent in one step);
  (4) every number sourced — only $8.56 CPL / 8 verified leads are currently
  sourced baselines.

### Replenish / 7-Eleven — Google Ads 627-501-4654

- The $500-cap dollar check is **PENDING** (cost column would not render in
  the preflight export) — any action citing current spend/cost fails the
  "number without a source" criterion until the local session re-exports.
- #573/#633 "Ended" is UNCONFIRMED and Kwik Trip #1161 is paused/holding —
  any action enabling, ending, or reallocating from these campaigns needs
  live verification as step one.
- Brand law (Mia): "Replenish" never "Fresh Blends"; no phone-call
  conversions; banned language: calories, "3 ingredients", IQF, "no staff no
  mess"; keep Replenish / Fresh Blends / Kwik Trip identities separate.

### Shadow HVAC

- Scope lock is **META ONLY** — any Google Ads 314-136-4176 or LSA action
  violates the spec and dies on sight.
- The Meta BM/page holding the instant form is an unknown to find in the
  Chrome session — any instant-form edit must live-verify BM/page/form first.
- No Meta budget figures documented in the vault — any budget change or
  numeric claim without a source dies.

### Fagan Painting

- Real ad account is **892789268275012** (878824100200277 is an empty shell;
  23849136117580444 was a misread) — any action touching a different account
  ID dies; still confirm edits land in 892789268275012.
- WEBSITE LEADS supersedes the instant-form plan — kill any
  instant-form/lead-form action. Keep only the draft "PRIMARY FIRST OPTIMIZED
  LEAD CAMPAIGN"; discard the other draft + unrelated pending changes. Pixel
  must be installed on Fagan's WP site with Lead event verified via Pixel
  Helper BEFORE any publish. Ad set: Pittsburgh radius, English-only,
  Advantage+ overrides locked. Lead delivery: WP form notification to Dillon
  first, then client.
- NO budget on file ("budget + qualified-lead value" still intake) — any
  action asserting a budget number has no source and dies; >20% single-step
  changes die regardless.

### NKCDC

- DO NOT APPLY the raw `audit:nkcdc` output — UNVERIFIED. Re-run verify
  before anything ships to **100-209-6937**.
- Spec context for the re-run: Search campaign launched ~6/30 has NOT SPENT;
  Dillon gave full approval for keyword cleanup and a fresh rebuild if still
  dead 48h after fixes. Those approved items were likely in the killed audit
  set — recover them via the re-run; do not reconstruct without verify steps.
- LP evidence: see Research notes + [[concepts/NKCDC Intake LP Serving (2026-07-04)|concept page]].

### Omega Landscaping

- Re-run guardrails (spec updated 2026-07-04): Google Ads **285-398-1364**,
  live active PMax at $50/day Limited-by-budget — budget changes capped at
  ≤20% per step (max $60/day); Meta account ID unconfirmed, so any Meta
  action needs discovery/verification as step one; copy uses the "3,000
  homeowners" angle, not "15 years experience"; confirm canonical domain
  (omegalandscapecorp.com vs omegalandscapingandconcrete.com) before pointing
  ads.

### Onsite Concrete & Landscape

- Re-verify any 103-371-5894 action against: (1) spec body still says "no
  ads currently running / ads-readiness audit lane" while the 2026-07-04
  update says "in daily ads scope; audit conversions first" (source:
  [[raw/2026-07-04 - account-inventory-sweep]]) — conversion-audit actions
  precede any publish/optimize; (2) the spec's own cycle order puts "check
  account state" before any changes.
- Brand rules are a placeholder ("needs re-confirmation in the next weekly
  call") — creative/copy actions can't clear brand review until confirmed
  (Thursday 1:00 PM ET M360 call, Grace Slagle).

## Blocked

- **All accounts:** cycle actions blocked pending re-run of the audit→verify
  chain with the actions payload actually passed to the verifier (fixed in
  this commit — just re-run).
- **Bar Crawl USA:** resend the proposed-actions list (same schema) and
  re-run the adversarial check.
- **Replenish:** Boca store address must be confirmed with Mia before any
  action drives more paid traffic there (address inferred once, never
  confirmed). Cost data blocked on local re-export ($500-cap check pending).
- **Fagan Painting:** no candidate actions received; also gated on pixel +
  Lead event verified on the WP site before any publish.
- **NKCDC:** launch blocked since ~2026-04-15 on the client LP
  (`businesstaxprep.fshtechnologies.org/intake/free-tax-prep?ref=…`). This
  cycle's snapshot suggests the block may have LIFTED — requires live
  verification of the exact `ref=` URL before enabling paused campaigns; if
  verification fails, chase via Mac per the spec.
- **Omega:** Meta-side actions blocked regardless of re-run — Meta account ID
  unconfirmed; discover and record it first.
- **Shadow HVAC:** blocked on the same re-run; instant-form work additionally
  blocked on identifying the BM/page in the Chrome session.
- **Onsite:** verify pass blocked (same bug); packet holds Onsite audit
  output out of the apply list as UNVERIFIED.

## Research notes

- **Landed (1 page):** [[concepts/NKCDC Intake LP Serving (2026-07-04)|NKCDC
  Intake LP Serving (2026-07-04)]] — the FSH Technologies intake page is
  serving (Next.js `/intake/[programSlug]` route, title "Philadelphia
  Business Services", free-tax-prep copy). Evidence: LP snapshot fetched
  2026-07-04 23:30 (session scratchpad `nkcdc-lp.html`; snapshot details
  preserved in the concept page since the scratchpad is ephemeral). Tagged
  `ads-research`, expires 2026-08-03.
- **Lost:** the web-research wave's skeptic-passed survivors never reached
  this composer (line 124 interpolated only the audit data) and their source
  URLs were dropped by the VERDICTS schema. Per the no-source-no-page rule
  they cannot be reconstructed here. Both gaps fixed in this commit; the
  next research wave will land normally — but see the cache-interaction flag
  above.

## Last cycle scorecard

- **No prior cycle to grade.** This is the first packet in
  `Daily-Briefs/ads-ops/` (directory created this cycle); auditors were asked
  to grade prior items but there was no prior packet, and their outputs were
  lost to the interpolation bug anyway.
- This cycle's own score, for next cycle's grader: 8/8 accounts audited,
  0/8 verified (pipeline bug), 1 spec-standing item cleared to apply
  (NKCDC LP check), 1 research page landed, 1 workflow bug fixed
  (3 edits: verify payload, verdict sources, survivor hand-off).

## Applied log (local session fills in)

- [ ] NKCDC LP live check — result:
