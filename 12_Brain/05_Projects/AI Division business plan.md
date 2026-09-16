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

## The product architecture, and why it is Claude Code's

Dillon, 2026-09-16: a real mobile app clients log into to see their agents, where
the actual work runs on a machine that holds the real connections, their CRM,
their email, everything. Prompting from the phone, execution on the box.

That is the correct shape, and it is worth naming why: **it is the same split
Claude Code itself uses.** A thin client for viewing and prompting, a heavy
runtime on a real machine with credentials and filesystem access, a session
protocol between them, and approval gates surfaced back to the client. Reverse
engineering it is a reasonable strategy because the design is already proven
against exactly this problem.

### What already exists, as of today

More of it is built than it feels like:

| Layer | Claude Code's version | What Momentum has today |
|---|---|---|
| Thin client | the mobile and desktop app | Momentum Agent Console, live at momentum-console.dillonmohr8777.workers.dev |
| Always on view | cloud session state | Cloudflare Worker plus D1 mirror, survives the runtime being off |
| Runtime | the local CLI process | the cadence driver on the desktop, holding every real credential |
| State model | sessions and transcripts | the roster in automations.json joined to runs.jsonl |
| Approval gate | permission prompts | System/approval-queue.md, every external action stops there |
| Identity | account auth | shared secret token, timing safe, rate limited |

That is a working single tenant version of the product. It is crude, but the
pieces are the right pieces and they are wired to each other.

### The two genuinely hard parts

Everything else is work. These two are the product.

**1. Tenancy, and it is simpler than it first looked.** Corrected 2026-09-16
after Dillon clarified the model: Momentum monitors and manages every client's
agents, and a client is INVITED into their own environment which lives inside
Momentum's. That is the DataStrike shape, and it removes most of the difficulty.

The isolation that matters is **client from client**, not client from operator.
A client is not trying to hide their data from Momentum, they are paying
Momentum to hold it. So there is no per tenant credential vault, no self serve
signup, no per tenant runtime, no billing system. There is one operator who sees
everything and a set of viewers who each see exactly one slice.

Built 2026-09-16, and none of it needed the Mac mini:
- a `tenants` table in D1: id, display name, token hash, operator flag, status
- `tenant` columns on `agents` and `runs`, defaulting to `momentum`
- `momentum` seeded as the operator tenant, is_operator=1, sees all rows
- `_os/automation/bin/tenant-invite.js` to create, rotate and revoke a client
  invite. The token prints once to the operator's terminal; D1 stores only its
  sha256, so reading the database never yields a client token.

The one place this can still go wrong: a client editing their own cookie to
claim another tenant's id. The cookie therefore has to be signed, not merely
set. That is the whole security boundary of the managed model, and it is the
single thing to get right.

**2. The command channel.** The cloud console is currently read only by design,
because a mirror cannot safely write back to a runtime it does not control.
Prompting from the phone means a real channel: phone to cloud to runtime, with
the runtime authenticating the request, executing under its own approval gates,
and streaming results back. Claude Code solves this with its own session
protocol. The honest version here is a queue: the phone writes an intent, the
runtime polls, executes, and writes back a receipt. Slower than a socket, far
easier to reason about, and it fails safe when the runtime is offline.

### The runtime should move to the Mac mini

Not a preference, an infrastructure fix. The current runtime is a Windows
desktop with a diagnosed, unrepaired power supply fault: fourteen unclean power
offs in thirty days
([[12_Brain/07_Reviews/2026-09-09 - Machine power fault diagnosis]]). Every
agent, every credential and every scheduled job sits on it. A Mac mini as the
runtime host is the single highest value infrastructure change available, and it
should happen before any client depends on this, not after.

### App, or web

A PWA gets ninety percent of this with none of the app store overhead: one
codebase, installable to the home screen, push notifications, and the same
Worker already serving it. Native is a later decision driven by whether push
reliability or background execution actually becomes a constraint. Do not start
with a native app.

### Sequencing, honestly

This is the product, not a feature, and it is a year of work to do properly. But
it does not need to be finished to be sold. The order that keeps it honest:

1. Move the runtime to the Mac mini. Nothing else matters if the host dies.
2. Build the command channel single tenant, for Momentum only. Prove prompting
   from the phone against a real runtime.
3. Add the second tenant. The first client is where multi tenancy stops being
   theoretical, and it should be a client who knows they are first.
4. Only then a PWA polished enough to put in front of a stranger.

Each step is independently useful to Momentum even if the product never ships,
which is the property that makes it safe to start.

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
