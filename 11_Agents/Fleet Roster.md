---
tags: [agents, fleet, moc]
updated: 2026-08-12
source: "[[12_Brain/registry/agent-fleet.json]]"
---

# Fleet Roster

**Summary:** the 15-agent link chain plus nine surface agents, mapped onto 54 proven routines and 22 readable codebases.

Supervisor pattern. Master routes. Orchestrator runs the daily loop. Lane agents do the work. Surface agents cover W2, book, artist, product, CRM, intelligence, compliance, brain, and comms. Agents orchestrate skills — they do not replace them.

## Link chain (15 managed agents)

Vault lanes (7) plus Mohr Media roster (8). Ari and Remy are named aliases; operational rules live on Google Ads and Reporting.

| # | Callsign | Agent | Lane | Notes |
|---|----------|-------|------|-------|
| 01 | `master` | [[11_Agents/Master Agent|Master Agent]] | command | Commander. Routes work, keeps run state, assembles one approval board. |
| 02 | `orchestrator` | [[11_Agents/Morning Orchestrator|Morning Orchestrator]] | command | Daily order-shooter. Runs the morning loop through the approval push. |
| 03 | `ads` | [[11_Agents/Google Ads Agent|Google Ads Agent]] | ads | Paid ads lane. Analyzes campaigns, drafts optimizations, maintains the ledger. |
| 04 | `ari` | [[11_Agents/Ari Ads|Ari Ads]] | ads | alias of `ads` |
| 05 | `seo` | [[11_Agents/SEO Agent|SEO Agent]] | seo | SEO and AEO lane. Content pipeline, on-page, answer-engine work. |
| 06 | `cora` | [[11_Agents/Cora Copy|Cora Copy]] | content | Copy lane. Ad copy, site copy, social drafts, voice enforcement. |
| 07 | `reporting` | [[11_Agents/Reporting Agent|Reporting Agent]] | reporting | Reporting lane. Client HTML reports, pulse, metrics, week review. |
| 08 | `remy` | [[11_Agents/Remy Reports|Remy Reports]] | reporting | alias of `reporting` |
| 09 | `web` | [[11_Agents/Web Agent|Web Agent]] | web | Web build lane. Site factory, client rebuilds, QA before review. |
| 10 | `design` | [[11_Agents/Web Design Lane|Web Design Lane]] | design | Design-system and taste lane. Tokens, QA checklist, human taste pass. |
| 11 | `mira` | [[11_Agents/Mira Motion|Mira Motion]] | design | Motion and asset studio. GBP cards, cinematic surfaces, motion drafts. |
| 12 | `leo` | [[11_Agents/Leo Leadwell|Leo Leadwell]] | outreach | Lead scout. Qualify scoring, prospect notes, Mac pipeline stages 1-2. |
| 13 | `piper` | [[11_Agents/Piper Pipeline|Piper Pipeline]] | pipeline | Pipeline driver. CRM follow-up drafts, stalled-client chase, HubSpot handoffs. |
| 14 | `calvin` | [[11_Agents/Calvin Convert|Calvin Convert]] | cro | Conversion engineer. Landing-page CRO, offer framing, form paths. |
| 15 | `sage` | [[11_Agents/Sage Signals|Sage Signals]] | analytics | Analytics sage. Attribution, tracking pre-flight, leading indicators. |

Invoke with `[INVOKE:callsign|question]`. Protocol: [[12_Brain/protocols/Agent Fleet Protocol|Agent Fleet Protocol]].

## Surface agents (repo + routine coverage the chain does not own)

| Callsign | Agent | Lane | Notes |
|----------|-------|------|-------|
| `align` | [[11_Agents/Align HCM Agent|Align HCM Agent]] | w2 | Full-time W2 lane. Align brand, LinkedIn cadence, SmartCare. Never under Momentum 360. |
| `book` | [[11_Agents/Book Agent|Book Agent]] | book | Ironic Ineptocracy book site, dispatch calendar, subscriber funnel drafts. |
| `immohrtal` | [[11_Agents/IMMOHRTAL Agent|IMMOHRTAL Agent]] | artist | IMMOHRTAL artist site and isolated redesign previews. |
| `bridge` | [[11_Agents/Bridge Agent|Bridge Agent]] | product | Bridge discovery prototype and Kimi design preview. |
| `hubspot` | [[11_Agents/HubSpot Agent|HubSpot Agent]] | crm | Portal-guarded HubSpot work for Jason Fallon / Momentum 360. |
| `intel` | [[11_Agents/Intelligence Agent|Intelligence Agent]] | intelligence | Grok/X ingest, research-sweep, experiment queue. Untrusted until sourced. |
| `guardrail` | [[11_Agents/Guardrail Agent|Guardrail Agent]] | compliance | Pre-flight compliance. Banned terms, public-safety, draft-first, AEO/trust. |
| `brain` | [[11_Agents/Brain Agent|Brain Agent]] | brain | Second-brain compiler. vault-compile, wiki-lint, synthesize, session-mine. |
| `comms` | [[11_Agents/Comms Agent|Comms Agent]] | comms | Inbox and Slack triage. Drafts only. Gmail digest, slack-intake, inbox-brief. |

## Maps

- [[11_Agents/Routine Map|Routine Map]] — 54 proven routines → owner callsign
- [[11_Agents/Repo Map|Repo Map]] — 16 GitHub repos + 6 in-vault codebases
- Machine-readable: `12_Brain/registry/agent-fleet.json`
- Cursor invocables: `.cursor/agents/`

## Hard rules (every agent)

1. Draft-first. Send / post / deploy / spend / billing / credentials = Tier 2.
2. Public Git. No PII, credentials, locators, or private absolute paths.
3. Align HCM is W2, never a freelance client, never under Momentum 360.
4. Start at `12_Brain/INDEX.md`. Walk links. Do not sweep.
5. Max invoke depth 2. No self-invoke. No circular calls.
6. Skills first. Build-from-scratch is the fallback.

## What this is not

- Not 54 one-file agents. Routines stay skills/automations; agents own them.
- Not a copy of the generic `cs-*` library in claude-skills-repo. Those are portable templates. This fleet is Dillon's operating graph.
- Not permission to send, publish, install, connect, or spend.
