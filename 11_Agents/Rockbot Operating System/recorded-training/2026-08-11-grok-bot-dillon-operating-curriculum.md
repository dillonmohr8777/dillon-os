# Grok Bot curriculum: Dillon's marketing operating system

Status: redacted teaching proposal
Prepared: 2026-08-11
Owner: Dillon Mohr
Primary orchestrator: Codex acting as Marketing Chief

## What Dillon's work actually is

Dillon runs a client-separated marketing and delivery operation. The recurring
job is not merely to answer messages. It is to turn messy inbound evidence into
the right client route, the highest-value safe deliverable, independent proof,
and one decision-ready handoff without creating more coordination work for
Dillon.

The operating chain is:

`sense -> route -> prioritize -> build -> verify -> approve -> deliver -> read back -> learn`

Codex/Marketing Chief owns orchestration, canonical queue writes, final
verification, and the user-facing completion claim. Grok Bots are bounded
specialists and routine operators. They may build and verify local artifacts;
they do not independently send, post, publish, spend, change accounts, expose
secrets, or declare themselves final.

## Daily operating cadence

### 1. Morning systems and access check

- Sync and test the shared agent vault.
- Check active automations, schedulers, checkpoints, connector health, and
  overnight failures.
- Verify the exact account and client before using an authenticated service.
- Separate configuration, local health, and real external delivery evidence.
- Surface only actionable failures; do not create fake recovery or advance a
  checkpoint after a failed collector.

### 2. Communications and request intake

- Read bounded Gmail, Slack, meeting, and monitoring context.
- Extract the actual request, urgency, owner, audience, decision, promised
  deliverable, and safe source locator.
- Read the full thread before drafting.
- Convert clear requests into artifacts, not summaries.
- Keep all sends and posts behind an exact preview and approval.

### 3. Exact client, account, and repository routing

- Resolve the client through `client-operations/registry/clients.json`.
- Select one brand, account, portal, repository, worktree, environment, and
  owner.
- Read the nearest project rules and preserve dirty worktrees.
- Never blend client communications, metrics, assets, portals, or voice.
- Quarantine ambiguous identities instead of guessing.

### 4. Priority and queue reconciliation

- Deduplicate the request against current canonical work.
- Rank work by revenue impact, urgency, dependency readiness, evidence
  freshness, and approval state.
- Keep one current owner, status, next action, and finish line.
- Workers return proposals and evidence; only Marketing Chief writes the
  canonical queue.

### 5. Website, landing-page, and product delivery

- Load product truth, verified brand assets, current code, and the owning design
  system before editing.
- Use the exact repository and existing deployment mapping.
- Build responsive production-quality work with real content and sourced
  claims.
- Run desktop and mobile inspection, accessibility checks, focused tests,
  production build, console checks, and the Impeccable detector.
- Use a separate release critic before acceptance.
- Current recurring lane: Prospect Radar selection and batches of 20 private,
  noindex, mobile-first website concepts with exact logos, source evidence,
  relevant generated imagery, browser QA, and `mail_ready=hold`.

### 6. Content, creative, SEO, AEO, and GEO production

- Resolve audience, client voice, offer, search intent, proof, and measurable
  outcome.
- Build calendars, posts, pages, articles, ad concepts, and campaign assets from
  verified sources and approved identity.
- Keep sourced facts separate from strategy and generated concepts.
- Never invent testimonials, results, prices, integrations, or product claims.
- Use an independent brand and design check before delivery.

### 7. Paid-media and conversion review

- Start read-only and keep Google Ads, Meta Ads, brands, and clients separate.
- Verify account, dates, timezone, delivery, tracking, attribution window,
  conversion definition, CRM or booking outcomes, and lead quality.
- Reconcile outcomes twice weekly and before consequential recommendations.
- If conversion evidence is not defensible, write `Conversion reporting is
  pending validation` and never invent a result.
- Budget, bid, targeting, creative activation, and spend changes require exact
  current approval.

### 8. Reporting and executive synthesis

- Build dashboards, weekly reports, decks, PDFs, and operator summaries from
  current source evidence.
- Lead with business meaning, verified delivery and response, downstream
  evidence, limitations, and the next decision.
- Show metric definitions and source fields behind derived KPIs.
- Mark stale or inaccessible fields pending validation.
- Keep local completion, draft, staged, deployed, and sent states distinct.

### 9. Draft and approval desk

- Prepare Gmail drafts and Slack previews in Dillon's thoughtful, confident,
  warm, direct voice.
- Preserve Reply All semantics, exclude Dillon's own address, and use the exact
  signature for email.
- Show recipient or channel, exact proposed content, evidence freshness, and
  uncertainty.
- An approval applies only to the exact preview. After an authorized delivery,
  read back the live sent or published state.

### 10. Knowledge and continuity

- Capture immutable source evidence, decisions, projects, research, reviews,
  and durable preferences in Dillon OS.
- Update canonical pages rather than creating duplicates.
- Keep client truth under `01_Clients/`, SOPs under `04_SOPs/`, agent contracts
  under `11_Agents/`, and dated reviews under `12_Brain/07_Reviews/`.
- Proposals from Grok go only to `00_Inbox/Agent-Proposals/Grok` until Marketing
  Chief reconciles them.
- End the day with evidence, status, unresolved risks, next owner, and at most
  one real human gate.

## Weekly operating cadence

The cadence is outcome-based rather than tied to a weekday unless an exact
client calendar says otherwise.

1. Reconcile the client queue, calendars, deadlines, and highest-leverage
   outcomes.
2. Review paid-media delivery and downstream quality at least twice weekly.
3. Produce and QA active content, creative, website, and landing-page work.
4. Run or advance the Prospect Radar website factory without repeating prior
   domains or slugs.
5. Build client reports and dashboards from current platform and CRM evidence.
6. Prepare communications and approval packages for decisions and delivery.
7. Review experiments across conversion, SEO/AEO/GEO, offers, and outreach.
8. Audit automation reliability, stale access, failed collectors, retries,
   checkpoints, and external readback.
9. Run an executive weekly review: wins, verified outcomes, risks, blocked work,
   next bets, and what should stop.
10. Compile durable lessons into Dillon OS and test the knowledge graph.

Monthly, audit knowledge health, access continuity, agent performance, and
whether scheduled work is still worth its cost.

## Bot-native operating team

### Specialist Bots

- Client Context Router
- Grok Research Scout
- Communications Intake Analyst
- Paid Media Auditor
- Reporting and Analytics Analyst
- Web and Product Builder
- Design and Art Direction Critic
- Brand Voice and Content Studio
- SEO AEO GEO Strategist
- CRO Experiment Planner
- CRM and Revenue Ops Analyst
- Automation Reliability Scout
- Knowledge and Obsidian Curator
- Independent QA and Release Critic
- Delivery Evidence Auditor

### Routine Bots to add

- Morning Marketing Chief Operator: system check, intake, routing, priority
  packet, and one decision-ready daily brief.
- Prospect Radar Website Factory: select, build, asset-integrate, QA, and package
  each local-only batch of 20.
- Client Communications Draft Desk: bounded thread intake, deliverable inference,
  draft creation, and exact approval preview.
- Paid Media Twice-Weekly Review: account-separated read-only evidence,
  attribution validation, lead-quality review, and next-test proposal.
- Weekly Reporting Operator: source reconciliation, KPI math, dashboard or report
  build, limitation language, and executive summary.
- Weekly Executive Review: verified wins, risks, blockers, experiments, next
  priorities, and durable-learning proposals.

## Complete routine inventory

The machine-readable recording contract is
`2026-08-11-grok-bot-routine-recording-manifest.json`. It defines 54 currently
known routines across daily, twice-weekly, weekly, monthly, and event-triggered
cadences. The
companion `2026-08-11-grok-bot-recording-ledger.md` tracks recording and replay
verification. Routine `E11` captures any newly observed repeated workflow so
the curriculum stays open-ended instead of pretending today's list can never
change.

## Screen-teaching plan

Use Grok Bot's `Teach a task` recording only on sanitized, bounded walkthroughs.
Never record a password manager, login form, MFA code, payment data, raw private
email or Slack content, client secrets, browser cookies, tokens, or an unrelated
foreground tab.

Record the routines in bounded modules so each saved routine has one trigger
and one finish line. The complete inventory and order live in the manifest and
ledger. The first teaching modules are:

1. `Morning Marketing Chief Loop` using this curriculum, the generated agent
   vault, a synthetic intake item, and a redacted status packet.
2. `Route a Client Request` using a synthetic alias and the canonical registry.
3. `Build and Verify a Website Deliverable` using a local fixture and the real
   test, browser-QA, detector, and checker sequence.
4. `Prepare a Client Report` using synthetic metrics and the pending-validation
   conversion language.
5. `Prepare an Email Approval Preview` using synthetic recipients and content;
   stop before send.
6. `Run the Weekly Executive Review` using redacted artifacts and no external
   actions.

Every recording ends with the same receipt: exact route, artifacts, sources and
freshness, checks, assumptions, privacy=`redacted`, approval state, external
action attempted, and next safest action.

## First live demonstration

Use the current local Prospect Radar batch `20260811-201704` as the maker/checker
demo. Web and Product Builder owns the build evidence; Independent QA and
Release Critic receives only the finished batch and receipts, tries to falsify
the result, and returns pass, revise, or blocked. No send, publish, deploy, CRM,
queue, billing, or account change is authorized by this demonstration.

## Source locators

- `agent-vault/AGENTS.md`
- `agent-vault/global/brand-voice.md`
- `agent-vault/global/visual-identity.md`
- `agent-vault/global/model-routing.md`
- `agent-vault/notes/inbox/2026-08-11-grok-research-scout-operating-brief.md`
- `agent-vault/notes/inbox/2026-08-11-grok-delivery-design-reporting-playbook.md`
- `client-operations/registry/clients.json`
- `client-operations/queue/work-items.json`
- `dillon-os/INDEX.md`
- `dillon-os/12_Brain/09_Ops/AGENT_PROTOCOL.md`
