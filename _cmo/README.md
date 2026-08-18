# CMO OS

**The auditable AI CMO.** Multi-client, paid + organic, every claim carries a receipt.

Built by reverse-engineering [okara.ai](docs/OKARA-TEARDOWN.md) — a $99–249/mo "AI CMO" running ~10
organic agents for 120,000 businesses — and then fixing what its architecture cannot do.

Zero build step. One runtime dependency. Runs with no API key, no network, and no credentials.

```bash
cd _cmo
npm install          # the Anthropic SDK; nothing else
node bin/cmo.js demo # 14 agents, 18 artifacts, full audit trail, offline
node bin/cmo.js serve # http://127.0.0.1:4343
```

---

## What it is

A marketing operations runtime for someone who runs **many client accounts**, where every generated
artifact is traceable to its sources, every external action is approval-gated, and every dollar of
model spend is attributed to a client and an agent.

Sixteen agents across five lanes:

| Lane | Agents | okara equivalent |
|---|---|---|
| **organic** | site-intel, seo-technical, geo-visibility, content-brief, article-writer, social-writer, community-watch | yes (10 agents) |
| **paid** | paid-search-analyst, paid-social-analyst, ad-copy-lab | **none** |
| **local** | local-seo, gbp-post-writer | **none** |
| **measurement** | attribution-reconciler, report-composer, competitor-watch | **none** |
| **ops** | aeo-engineer | partial (their Coding Agent) |

okara's own comparison content concedes it is "a poor fit if you need brand strategy, investor
narrative, or **paid media management**". Local SEO and Google Business Profile appear nowhere in its
roster, or in any GEO tool.

---

## The five things that make it different

### 1. A run journal, so "why did it say that" is answerable

okara runs on Upstash QStash, which gives at-least-once delivery — a retry re-runs a *step*, it does
not resume a half-finished run. There is no record of which model, which prompt version, and which
retrieved page produced a given draft.

Here every step of every run is journaled with its input hash, model, cost, and sources:

```bash
cmo explain run_0msz6gp0l_fe87 --ws acme-hvac
#  #  STEP                             SRC   MODEL   COST     INPUT
#  0  connector:googleAds.performance  live          $0.0000  b9b129b8
#  1  connector:googleAds.searchTerms  live          $0.0000  ef5d80c4
#  2  model:critique                   live  opus-5  $0.0082  254f50fb

cmo replay run_0msz6gp0l_fe87 --ws acme-hvac
#  reused 3 step(s), saving $0.0082 vs the original run
```

Change one prompt and only that step and the steps after it re-execute. Fixing a prompt costs one
step, not a whole crawl.

### 2. Statistically honest GEO measurement

The GEO tool category reports single-run point estimates as fact — "you are #4, up two spots, 17%
visibility". LLM outputs are non-deterministic by construction, and independent testing of shipped
tools found roughly two-thirds accuracy with wrong-brand attributions among the errors.

This engine, instead:

- **Wilson score intervals**, never a normal approximation — at 3–10 replicates the normal
  approximation produces intervals outside [0,1]
- **Kish effective sample size** reported on every aggregate, so skewed prompt weights cannot
  masquerade as precision
- **A control cohort** of prompts the client cannot influence. When controls move, the *engine*
  changed — every client delta is reported net of the control delta
- **A grounded-vs-parametric split**, which tells a client whether their problem is retrieval
  eligibility (movable in weeks) or brand-mention volume (movable in quarters). Nothing else does this
- **Citation share normalised within engine** — one engine cites ~15 sources per answer and another
  ~3, so raw cross-engine citation share is arithmetically meaningless
- **Share of voice with a mandatory `other` bucket** that sums to 1, and a warning when the declared
  competitor set does not describe the market
- **A versioned, SHA-256-hashed prompt manifest.** Change the instrument and you get a marked
  discontinuity, not a trend
- **No delta without a two-proportion test.** A 3pp move on 100 runs is reported as noise

`0` presence across 54 runs reports `[0 – 6.6%]`, not `[0 – 0]`.

### 3. Dollars, not credits

The #1 complaint about the incumbent is credit opacity: *"zero transparency on how many credits one
CMO initialization actually burns"*, on a 2,000-credit plan where a full month reportedly consumes
~1,700.

```bash
cmo cost --ws acme-hvac
#  today       $0.3959 / $5 cap   ████░░░░░░░░ 8%
#  by model    opus-5 $0.3959
#  by agent    geo-visibility $0.3152  social-writer $0.0083 …
```

One price table. Every figure derives from the token counts the API returned. Per-workspace daily,
monthly and per-run caps that **downshift** the model tier before they hard-stop — and never downshift
a claim-verification step, because a cheaper checker produces false confidence nobody catches.

### 4. Approval gates that survive forty accounts

Risk is a property of the **effect**, not the content. An unrecognised effect defaults to high risk,
so adding a publisher cannot accidentally inherit auto-approval.

- An `agent:*` actor is refused as a checker outright
- The maker cannot be the checker
- An artifact with a blocking guardrail cannot be approved at all
- Anything that spends money, touches a live account, or is externally visible is high risk and can
  never be auto-approved at any setting
- Pending items expire rather than being held silently

### 5. Proof-carrying output

**A factual claim without a source is blocking**, not a warning. Every number, superlative, guarantee
and regulated claim in generated copy either points at a capture in the evidence store or the artifact
cannot be approved.

```
[blocking] unsourced-claim: 5 factual claim(s) with no evidence attached.
  statistic   "2,400+ customers"  needs: a source_ref pointing at the capture this number came from
  superlative "We are the best HVAC company in Philadelphia"
```

Plus banned phrases, required disclosures on external copy, placeholder detection, stock-AI-phrase
detection, and a reading-grade tripwire.

---

## Degraded mode is the product, not a fallback

Google Ads needs a developer-token approval. Google Business Profile ships with **zero default quota**
and needs an access request. Meta needs App Review. Those are calendar time, and a product that shows
an empty dashboard until they clear gets cancelled in week one.

Every connector declares one of four modes, and **the mode travels with the data into the client
report**:

| Mode | Meaning |
|---|---|
| `live` | real credentials, real API |
| `substitute` | a different real source standing in — Places public-profile data instead of authenticated GBP |
| `fixture` | committed sample data, labelled everywhere it appears |
| `unavailable` | no data path |

A report footnote reading "Meta Ads unavailable 12–14 Aug, figures exclude paid social" is a
credibility gain over a chart that silently drops three days.

```bash
cmo doctor
#  ID          LANE         MODE        WHY
#  gbp         local        substitute  standing in via places (no credentials for the primary source)
#  googleAds   paid         fixture     no credentials; serving committed fixture data
#
#  Start these today - they are calendar time, not engineering time
#  gbp          ZERO DEFAULT QUOTA. An access request is required before any call succeeds…
#  googleAds    DEVELOPER TOKEN REQUIRED. Basic access is granted after review…
```

---

## Architecture

```
bin/cmo.js          the CLI - every capability, nothing UI-only
bin/serve.js        zero-dependency node:http server + JSON API (GET /api lists every route)
public/             the dashboard: hand-written CSS, no build step, no external requests
lib/
  core/             clock, ids, hashing, errors, structured logging, crash-safe file I/O
  store/            workspace-fenced document store; fs and memory drivers
  runtime/          journal (record/replay), approval, budget, breaker, retry, idempotency, engine
  llm/              price table, task-class router, cache, schema validation, providers
  geo/              stats, prompt-set builder, extraction, aggregation, crawler registry
  brand/            guardrails
  connectors/       capability contract, crawler + AEO analyser, fixtures
  agents/           the roster
tests/              105 tests, node:test, no framework
docs/               the okara teardown
```

**One runtime dependency** (`@anthropic-ai/sdk`). Everything else is Node's standard library. The
store is plain JSON documents and append-only JSONL — readable with `cat`, greppable with `jq`, and
`migrations/001_init.sql` carries the Postgres schema for when one workspace becomes forty.

### Why the journal instead of Temporal

This product independently needs a per-run audit record — input snapshot, prompt hash, model, tokens,
cost, tool calls, sources. *That record already is a step journal.* Adopting Temporal or Inngest means
building the audit journal anyway and then maintaining a second opaque vendor journal beside it. One
table set gives replay, audit, cost accounting and the approval queue from a single source of truth,
with Postgres as the only stateful dependency — and it dodges Temporal's determinism constraints, the
largest source of durable-execution production incidents.

---

## Commands

```
cmo demo                            seed a demo workspace and run 14 agents offline
cmo doctor                          provider, connectors, budgets, approvals needed
cmo workspaces                      every client workspace
cmo seed --ws <id> --url <url>      create a workspace and crawl its site
cmo agents [--lane organic|paid|local|measurement|ops]
cmo run <agentId> --ws <id> [--dry] [--param.key value]
cmo cycle --ws <id> [--cadence daily|weekly|monthly]
cmo runs --ws <id>
cmo explain <runId> --ws <id>       every step, model, source and dollar
cmo replay <runId> --ws <id>        re-run reusing unchanged steps
cmo approvals --ws <id>
cmo approve <id> --ws <id> --by <name> [--note "..."]
cmo reject  <id> --ws <id> --by <name> [--note "..."]
cmo cost --ws <id>
cmo geo --ws <id> [--replicates 5] [--engines chatgpt,gemini]
cmo robots --ws <id> [--audit] [--stance retrieval-friendly|open|closed]
cmo serve
```

## Configuration

Nothing is required. Everything is optional.

| Variable | Effect |
|---|---|
| `ANTHROPIC_API_KEY` | live model calls. Unset ⇒ the deterministic offline provider |
| `CMO_ROUTING_PROFILE` | `quality` (default, premium tier everywhere), `balanced`, `economy` |
| `CMO_BUDGET_DAILY_USD` / `_MONTHLY_USD` / `_PER_RUN_USD` | spend caps per workspace |
| `CMO_DATA_DIR` | where the store lives (default `./data`) |
| `CMO_PORT` / `CMO_HOST` | server bind (default `127.0.0.1:4343`) |
| `CMO_GOOGLE_OAUTH_JSON`, `CMO_GOOGLE_ADS_DEVELOPER_TOKEN`, `CMO_META_ACCESS_TOKEN`, `CMO_GBP_ACCOUNT_ID`, `CMO_PLACES_API_KEY`, `CMO_SERP_API_KEY`, `CMO_PSI_API_KEY`, `CMO_WP_URL` + `CMO_WP_APP_PASSWORD`, `CMO_SLACK_WEBHOOK` | promote a connector from fixture to live |

Credentials are read once, in `lib/app.js`, and never logged, stored, or placed in an artifact.

---

## Status: what is verified and what is not

Honest accounting, because a README that overstates is the thing this product exists to argue against.

**Verified working, end to end**
- 105/105 tests pass (`npm test`)
- `cmo demo` runs 14 agents → 18 artifacts → 18 approvals → full journal, offline, no credentials
- Journal replay reuses unchanged steps at zero cost and reproduces the artifact
- Guardrails block unsourced claims, banned phrases, missing disclosures, placeholders, empty output
- Approval gate refuses agent self-approval, maker-as-checker, and blocked artifacts
- Budget caps downshift then hard-stop; per-run caps are independent of daily caps
- The GEO engine produces intervals, effective sample sizes, control cohorts and significance tests
- The crawler's SSRF guard blocks private ranges, metadata endpoints, and DNS rebinding
- HTTP API and dashboard serve; path traversal is blocked

**Written but not live-verified**
- **The Anthropic provider.** No API key exists in the environment this was built in. Request
  construction and error mapping are verified against an injected fake client, and the request shape
  matches the documented Messages API — adaptive thinking, `output_config.effort`, strict tool use
  with a forced `tool_choice`, `cache_control` on the system prefix. It has not made a real call.
- **Every credentialed connector.** The endpoints, scopes and quotas in `lib/connectors/registry.js`
  were verified against Google's API Discovery documents and by probing live hosts for 401-vs-404 —
  but the request bodies are specified, not executed. Only the crawler talks to a real network.
- **Publishing.** WordPress, GBP and social publishing are specified, risk-tiered and
  idempotency-keyed. No publisher is implemented. Nothing can post.

**Deliberately not built**
- Automated Reddit or Hacker News posting. `community-watch` is read-only and always will be.
- Live ad-account mutation. Reads only; every mutate is a high-risk approval-gated effect.

**Known limits**
- `ssrCoverage` estimates the render-time denominator by static analysis of the hydration payload
  rather than running a browser. It is reliable on the case that matters — an empty shell — and errs
  toward reporting good coverage.
- The GEO scan probes model APIs. That is an `api_proxy` channel measurement, labelled as such, and
  it is a different system from a consumer chat UI. The two are never averaged.
- One demo workspace. Multi-tenancy is enforced in the store and tested, but has not been run at
  forty accounts.
