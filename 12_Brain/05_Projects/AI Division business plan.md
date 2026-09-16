---
note_type: project
status: active
date: 2026-09-16
updated: 2026-09-16
tags:
  - momentum
  - ai-division
  - business-plan
  - agents
source_refs:
  - 12_Brain/06_Research/2026-09-16 - Momentum team bottlenecks and Workmate health.md
  - https://www.datastrike.com/about-us, /services-overview, /database-services, Snowflake page, Fabric blog, MiCORE PR, BI PR (read 2026-09-16)
  - https://brainforge.ai/services/ai/ (read 2026-09-16)
  - 12_Brain/registry/automations.json (53 records, 32 momentum audience)
  - https://github.com/dillonmohr8777/dillon-os/pull/406
---

# AI Division business plan

Momentum builds and runs agentic AI the way DataStrike runs data infrastructure and
Brainforge runs AI services: as a managed practice with a named operator, an SLA, and
a dashboard the client actually looks at. Client zero is Momentum itself. Nothing here
is sold until it has run inside Momentum for two clean weeks.

## The two references, combined

**DataStrike** (Dillon's employer, Nov 2023 to Sep 2025): "the largest data
infrastructure MSP for SMBs." Fractional monthly contracts, 24x7 onshore monitoring,
SLA backed, entry via a paid readiness engagement, client sees a BI dashboard and a
monthly outcome review, never raw logs. Their AI line pairs a Microsoft Fabric
readiness POC with ongoing "AI and Copilot oversight with guardrails," because AI
output is only as reliable as the data feeding it.

**Brainforge**: the service taxonomy. Workflow Automation, Knowledge Engineering,
Copilots & Agents, plus a MarTech line, delivered as "pick the wedge, build the
context layer, launch with controls," a 2-week sprint entry, and a trace-and-eval
loop as the deliverable. Stack: Claude, n8n, Langfuse, Postgres/pgvector. That stack
is already Momentum's stack.

**The synthesis**: DataStrike's delivery model (fractional, SLA, dashboard, POC
entry) wrapping Brainforge's taxonomy (four service lines), running on agents already
built for Momentum's own five-person team, not agents invented for a hypothetical
client.

## Four service lines

### 1. Workflow Automation
Agents that run inside a client's own Slack, CRM, inbox, on a schedule, doing the
work a person currently does by hand. Momentum's proof: the 8 cadence jobs and the
32 `audience: momentum` roster entries in `12_Brain/registry/automations.json`,
visible and toggled in the Momentum Agent Console. First concrete build: dedupe
Jason Fallon's duplicate `#360leads` Slack alerts against CRM identity, the
single largest named bottleneck in the 2026-09-16 team research.

### 2. Knowledge Engineering
Turning a business's documents, transcripts, and operating rules into a context
layer an agent can cite. Momentum's proof: `12_Brain/` itself, every claim carrying
`source_refs`, captures kept immutable. For a client this becomes their own private
vault: SOPs, call transcripts, pricing, service history, one search layer instead of
five disconnected drives.

### 3. Copilots & Agents
Agents that retrieve approved context, cite sources, and stop at a human gate before
anything external happens. Momentum's proof: `System/approval-queue.md`, the single
approval gate every automation in this vault already routes through, no exceptions,
demonstrated repeatedly this session (the Orca tunnel entry above is itself an
example). This is the sellable guardrail DataStrike calls "AI and Copilot oversight
with guardrails."

### 4. Migration & Modernization (the DataStrike core service, agent delivered)
Data platform migration and modernization, the actual center of DataStrike's
business, delivered by agentic AI engineers instead of onshore DBAs. Not a build
item yet, this session's roster has no agent for it. Named here as the fourth line
because it is what makes the offer DataStrike-shaped rather than only
Brainforge-shaped: assess a client's current stack (CRM, ad platforms, spreadsheets,
legacy site), propose the migration plan, execute it in agent-driven phases with a
human sign-off gate at each phase, then hand the client the same kind of managed
retainer the other three lines use. Candidate first target: a client's own reporting
data currently spread across Google Ads, GA4, GSC, and HubSpot with no single source
of truth, the same shape of problem `client-operations/registry/clients.json`
fragmentation already showed inside Momentum.

## MarTech, folded in rather than a fifth line

Brainforge lists MarTech (tracking, attribution, media measurement) as its own line.
Momentum already sells this as its core service (Google Ads, Meta Ads, GA4/GSC).
Keep it as the entry point, not a new line: most SMB prospects already trust Momentum
here, and it is the natural place to introduce the other three lines once a client is
already a paid media client.

## Delivery model, copied from DataStrike

1. **2-week paid readiness sprint** ("pick the wedge"): audit one workflow, propose
   the agent, quote the retainer. Paid, not a free consult, same as DataStrike's
   Fabric POC.
2. **Build**: the context layer plus the first agent, launched with controls
   (an approval gate scoped to that client, same pattern as Momentum's own).
3. **Managed retainer**: monthly fractional contract, flexible term, named operator,
   SLA on agent uptime and response.
4. **What the client sees**: a Langfuse-backed, per-client Grafana dashboard (Phase 4
   of the control plane build, PR #406) showing runs, failures, cost, and outcomes.
   Never logs, never a chat transcript. A monthly outcome review on top of it,
   same cadence as DataStrike's BI reviews.

## The six agents, and who each one serves

Built 2026-09-16 from MOMENTUM-ORG-PLAN.md, which specifies one mode per person
with a first outcome and a proof of success gate. Every agent below carries that
gate as its `accept` sentence, so it cannot report success without meeting it.

| P | Agent | Serves | Service line | First outcome |
|---|---|---|---|---|
| 1 | `leads-triage` | Jason Fallon | Workflow Automation | Real leads separated from duplicates and caller ID noise |
| 2 | `ops-decision-packets` | Sean Boyle | Copilots and Agents | Blocked work as one decision each, with a decider and a deadline |
| 3 | `revenue-exceptions` | Mac Frederick | MarTech | Only the clients where spend, leads, CRM and payment disagree |
| 4 | `production-briefs` | Melissa Silber | Knowledge Engineering | Every promised asset has a link or a named blocker |
| 5 | `delivery-milestones` | Melissa Rigby | Workflow Automation | Build, review, acceptance and delivery as four separate states |
| 6 | `agent-verifier` | shared | the trust layer | Whether the other five actually met their own gates |

This is the answer to "what do you actually sell." Not four abstract service
lines: six named agents that already run for a real five person company, each
one traceable to a person whose specific daily problem it removes. A prospect
gets shown this table with their own names in it.

The org plan also fixes the architecture, and it is the same split the roster
runner already uses: **deterministic code handles routing, deduplication, state
checks and receipt matching; a model handles synthesis and judgment only where
deterministic logic cannot finish.** That is why the free tier runs at no quota
cost and the model tier is metered.

## The proof loop, and why it is the product

The offer is not "we will build you agents." Every agency says that. The offer is
**we run agents in production, on a schedule, and we can show you the evidence
trail** — which is exactly DataStrike's 24x7 monitored, SLA backed shape applied
to agents instead of databases.

That loop now exists and is repeatable:

1. `node _os/automation/bin/run-roster.js` runs every free tier agent, records
   each into `_os/automation/runs.jsonl`, and reports every skip with a reason.
   Wired into the cadence driver, so it happens on every scheduled pass.
2. Each run lands in the roster (`12_Brain/registry/automations.json`) joined to
   its last run, visible in the local console and mirrored to the cloud console
   at `momentum-console.dillonmohr8777.workers.dev`.
3. Model backed agents and anything with external actions are excluded by
   design and reported as skipped, so the evidence never overstates what ran.

The 2026-09-16 first run: 6 agents ran, 0 failed, 2 reporting bad news, 48
skipped with reasons. That table is the artifact a client would be shown, one
level up, in their own colours.

**This is the demo.** A prospect does not need a pitch deck; they need to see a
dashboard of agents that ran today for somebody else, and the honest skip list
next to it. The skip list is the trust signal: an agency willing to show what it
did not run is one you can believe about what it did.

## Sequencing

Momentum runs Phases 0 to 4 of the control plane (PR #406) on itself first. The
five-person bottleneck list is the acceptance test: if the console cannot show Sean,
Mac, Jason, and both Melissas which agent is running for them and whether it worked
today, it is not ready to show a client. Price the offer only after that bar is met
and one paying client has run the same four phases for two clean weeks.

## Open, not decided here

- Exact pricing tiers. DataStrike does not publish a rate card either; price after
  the two-client proof, not before.
- Whether Migration & Modernization needs a human specialist in the loop at first,
  or is agent-only from day one. DataStrike's own AI line keeps a human on Copilot
  oversight; Momentum's version likely does too, at least initially.
- Which SMB vertical to target first. Not researched this session.
