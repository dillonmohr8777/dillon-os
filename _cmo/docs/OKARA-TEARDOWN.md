# okara.ai — reverse-engineering teardown

**Compiled** 2026-08-18 · **Method** indirect only · **Status** research artifact, expires 2026-11-18

---

## How this was compiled, and what that means for trust

`okara.ai` is **blocked by this environment's egress policy** — every request returns 403 at the
CONNECT layer. So is nearly every stack-detection service (urlscan, crt.sh, BuiltWith, W3Techs,
SimilarWeb, publicwww), the Wayback Machine, and most third-party review sites. Nothing below comes
from fetching okara.ai. The policy denial was reported rather than routed around.

What did work, and carried the whole teardown:

| Channel | What it gave up |
|---|---|
| Search-index snippets | okara's own page copy, indexed — pricing, agent pages, docs, blog |
| **okara's own public CI** | `askOkara/okara-crypto/.github/workflows/main.yml` names their private monorepo |
| **First-party vendor case studies** | Vercel and Upstash both published architecture write-ups with direct quotes from okara's engineers |
| **Google API Discovery documents** | authoritative endpoint paths and scope strings for the connector work |
| **Live unauthenticated probing** | a `401` proves a route exists; a `404` proves it does not |
| `raw.githubusercontent.com` | vendor doc source and actual `LICENSE` files |

**A caveat that matters more than the findings.** The okara "review" corpus is overwhelmingly
*synthetic* — thatmarketingbuddy, aiagentsquare, hypertools, tribechat, crewclaw, makerstack,
getaitopia, efficienist are programmatic AI-review, affiliate, or competitor-SEO sites, and two of
them are direct competitors ranking on okara's brand. Their "complaints" are plausible
reconstructions of complaints, not user testimony. **Trustpilot shows two reviews, both 1-star.**
That is the entire verifiable first-party user-voice corpus. Treat every quoted complaint as
directional.

Confidence tags used below: **[C]** confirmed from a first-party source · **[L]** likely, from
consistent indirect evidence · **[3P]** third-party claim only · **[?]** unverified.

---

## 1. What okara actually is

Two products sharing one codebase.

**Okara Chat** (beta Dec 2025) — privacy-first multi-model chat. 20+ open-source models
(DeepSeek V3, Qwen 3, Kimi K2, Llama 4, Mistral 3, GLM), Stable Diffusion 3.5 Large and Qwen Image
for images, client-side E2EE, built-in Web/Reddit/X/YouTube search. **[C]**

**Okara AI CMO** (Mar 2026) — the headline product. You give it a URL; it crawls the site, maps
external perception, analyses 10–15 competitors, writes a set of strategy documents, audits SEO, and
then runs a roster of per-channel agents daily, each drafting work for you to approve. **[C]**

The lineage is the useful detail: **BuildThatIdea** (Feb 2025, no-code GPT-wrapper builder) →
**Okara Chat** (Dec 2025) → **Okara AI CMO** (Mar 2026). The private monorepo is still called
`buildthatidea/bti-chat`, and the E2EE key-derivation strings are literally `bti-e2ee-salt` /
`bti-e2ee-key` / `bti-e2ee-message`. **One app, three product skins.** **[C]**

Scale, first-party as of mid-2026: **four engineers**, **120,000+ businesses**, **4 billion tokens
per day**, 6–7 production deploys per day. Singapore-based, founder Fatima Rizwan, previously
founder of TechJuice. Funding undisclosed; the listed "round" is a founding-user program. **[C]**

The March 2026 launch tweet did **10M+ views in hours and took their infrastructure down** — they
said so publicly. **[3P]**

---

## 2. The stack

| Layer | Technology | Confidence | Evidence |
|---|---|---|---|
| Hosting / CDN | **Vercel** | **[C]** | Vercel's own case study; apex `okara.ai` → `216.150.1.1`, Vercel's recommended apex A record |
| Framework | **Next.js**, TypeScript, React Server Components | **[C]** | `import 'server-only'` in their public `server-e2ee.ts` — an RSC idiom; version unknown |
| LLM access | **Vercel AI Gateway** — one endpoint, 8+ providers, retry/fallback/provider-health at the gateway, zero-data-retention routing | **[C]** | Vercel case study, direct engineer quotes |
| Agent code execution | **Vercel Sandbox** | **[C]** | Vercel case study |
| Queue / orchestration | **Upstash QStash**, including **Flow Control** for third-party rate limits | **[C]** | Upstash case study |
| Hot state | **Upstash Redis** — session, auth, subscription state | **[C]** | Upstash case study |
| Content dedup | **Upstash Vector** | **[C]** | Upstash case study |
| Second backend | **Google Cloud** — `api.okara.ai` → `34.117.12.156`, PTR `…bc.googleusercontent.com` (GCP HTTPS LB) | **[C]** | DNS + PTR |
| Onboarding research | **TinyFish Search & Fetch** — custom Chromium fleet, stealth handling, p50 <0.5s | **[C]** | TinyFish case study; they migrated off a provider that had them running ~500 searches per website |
| CI/CD | GitHub Actions → `repository_dispatch` into private `buildthatidea/bti-chat`; env `production` → `https://okara.ai` | **[C]** | their own public workflow file |
| Client crypto | X25519 ECDH + Argon2id (128 MB, 4 iterations) + AES-256-GCM + HKDF-SHA512 + PBKDF2-SHA256 | **[C]** | `askOkara/okara-crypto` |
| DNS | **wildcard `*.okara.ai`** → Vercel anycast pool | **[C]** | 152 of 152 probed labels resolved, including nonsense ones |
| Payments | Stripe | **[L]** | multiple review sites; "subscription state in Redis" is the classic Stripe-webhook-to-cache shape |
| Auth | rolled sessions in Redis + Google OAuth | **[L]** | Redis holding "authentication data" argues *against* Clerk/WorkOS, which own their own sessions |
| **Primary OLTP database** | **UNKNOWN** | **[?]** | the largest gap. Redis and Vector are caches/indexes, not a system of record |
| ORM, object storage, analytics, error tracking, email | **UNKNOWN** | **[?]** | would be settled by one read of `/privacy` (subprocessor list) |

### The mechanically interesting part

Their SEO→code loop is genuinely clever and worth naming: **the SEO agent finds a technical issue →
spins up a Vercel Sandbox → runs analysis in isolation → hands findings to the Coding Agent → the
Coding Agent opens a pull request against the customer's repo** with file diffs and explanations
inline. New PRs open automatically as new issues are detected. Fixes needing structural change
(content rewrites, layout, speed) are flagged manual rather than attempted. **[C]**

That is a real product capability, and it is the single thing okara does that most competitors
cannot.

### Two published analyses of okara are both wrong

- One filed okara as a **"cron + prompt templates, Level 0"** system — "task-specific prompt
  templates marketed as agents". Too dismissive: Level 0 means no workflow knows about any other,
  which cannot describe a system that needs QStash retries, Flow Control, and shared Redis state.
- Another claimed a **"multi-agent swarm with a task-routing brain and unified memory pool"** and
  ~40 models, asserting it was "confirmed" while citing no artifacts.

The accurate label, from the first-party evidence: **a queue-driven worker fleet with shared KV
state and a vector-backed dedup filter, plus sandboxed code execution and a human-in-the-loop PR
gate.** No evidence of LangChain, LangGraph, Mastra, CrewAI, Inngest, Trigger.dev, or Temporal —
QStash *is* their orchestrator.

---

## 3. The agent roster

Eleven confirmed surfaces. All daily unless noted.

| Agent | What it does | Publishes? |
|---|---|---|
| **Reddit** | monitors keywords + subreddits, surfaces high-intent threads, tracks brand/competitor mentions, summarises each subreddit's rules, drafts an on-brand reply per thread | **No** — you post manually, by design |
| **SEO** | daily full technical audit, keyword gaps, position tracking; emits **exactly 2 high-impact fixes per day** with copy-paste snippets | via Fix button / Coding Agent |
| **GEO** | tracks how ChatGPT, Perplexity, Gemini and Claude describe the brand; GEO score, sentiment, per-platform presence map, daily recommendations | No |
| **X** | daily post and thread drafts in brand voice | Yes, click-to-publish + queue |
| **LinkedIn** | founder-style posts and article drafts | Yes, company or personal page |
| **Writer / Articles** | one long-form SEO post per day, with target keyword, secondary keywords, difficulty, suggested approach | Yes → WordPress, Webflow, Framer, Wix, Sanity |
| **Hacker News** | Show HN / Ask HN drafts including the title *and* the "I built this because" first comment | No |
| **UGC Video** | brief → short vertical video; 9:16/16:9/1:1, credit cost shown up front. The most expensive agent | TikTok (marked "soon") |
| **Coding** | reads the repo, opens PRs with JSON-LD, canonicals, meta descriptions, sitemaps, `llms.txt`, FAQ schema | Yes, as a PR |
| **Influencer** | finds creators, does outreach, manages campaign, handles payments. Priced flat + **10% of campaign spend** | Yes |
| **Talk to AI CMO** | chat wired to the product context and dashboard | n/a |

**The autopilot gap.** The marketing says "puts marketing on autopilot". The docs say you click
publish on every post, Reddit never auto-posts, and HN never auto-posts. Every reviewer who paid
lands on *co-pilot, not autopilot*. That divergence is the single most exploitable positioning seam
in the product.

Referenced but reportedly unshipped: a "Link Broker" agent, a YouTube agent. Email campaigns and ad
buying appear **only** in launch-hype press, never on okara's own agent pages — treat as
nonexistent. **[?]**

---

## 4. Pricing, and its instability

Four different headline prices are simultaneously indexed for the AI CMO. These are almost certainly
sequential increases, not tiers:

- **$99/mo** (2,000 credits/mo; annual ≈ $66/mo effective) — the most-documented tier
- **$129/mo** — the price on their own influencer agent page
- **$249/mo or $2,490/yr** — the price in their own docs' introduction
- **$20/mo "Pro"** — an earlier structure

Plus: free tier of **5 or 20 one-time credits** (reported inconsistently, so it has been re-cut);
credit top-ups at **860/$45, 2,000/$90, 4,600/$180**; Chat at **$15–20/mo Pro**, **$50/mo Max**,
**$15/seat** workspace; a **$500–$2,000 one-time founding-user lifetime deal**; and a 20% affiliate
program with a 60-day attribution window.

Agency SKU exists: first client site $99/mo sliding to **$59.40/mo per site from the fifth client**,
seats at $15/mo.

**$99 → $129 → $249 inside roughly a year**, on a product whose free tier already reads as a demo,
is the pricing history of a company still looking for its number.

---

## 5. Documented weaknesses

Ranked by how load-bearing they are.

1. **Credit opacity is the #1 recurring complaint.** No published per-action credit table. The paid
   plan is 2,000 credits and okara's own docs reportedly put a full-output month at ~1,700 — leaving
   ~300 of headroom. One user reported credits gone in 14 days. Verbatim: *"zero transparency on how
   many credits one CMO initialization actually burns"*; heavy agents *"eat through the free tier in
   seconds"*. Top-ups cost roughly as much as the subscription, so a heavy month is $150–$280, not
   $99.
2. **Zero composability.** *"No public API, no MCP server, and no Zapier or Make hooks, so you
   cannot orchestrate its agents from your own stack."* And no documented bulk export: *"leaving
   means walking away from the accumulated context, not exporting it."*
3. **Output quality is intake-limited, and the onboarding hides it.** *"Garbage in, slightly more
   organized garbage out."* Reviewers converge: invest hours in the brand brief and quality steps up
   sharply; rush the URL-only intake and you get generic output and conclude the product does not
   work. The one-field onboarding is a great demo and a weak foundation.
4. **Not actually agency-ready** despite the `/agency` page: no multi-client workspace management, no
   white-label output, thin collaboration, no meaningful client reporting. *(Sourced from a
   competitor, so discount — but it is consistent with the per-site subscription architecture.)*
5. **The community agents are the real liability.** *"AI-generated Reddit and HN comments are
   dangerous and need careful human review."* No confirmed ban incident exists in the index, so the
   risk is architectural rather than evidenced. **The scaling problem is the important part:** the
   approval gate is okara's stated safety mechanism *and* its ceiling. At one brand a human reads
   every reply. Across forty accounts they rubber-stamp, and then the gate is decorative.
6. **No run journal.** This is the deepest architectural gap and it is covered in §6.
7. **Support and refunds.** Trustpilot's two reviews report unanswered email and X DMs. The refund
   policy is explicitly no-refunds across all plans. That combination generates chargebacks.
8. **No enterprise compliance posture** — no visible SOC 2 Type II, ISO 27001, or HIPAA BAA.
9. **The privacy story does not extend to the CMO product.** The E2EE architecture is real and
   competently built, and their whitepaper honestly discloses that messages are plaintext during
   active processing. But the CMO agents must read the customer's site and hold write-scoped OAuth
   tokens for WordPress, GitHub, X and LinkedIn. Zero-access encryption is structurally impossible
   there.
10. **A `*.okara.ai` wildcard** means every unclaimed label serves application infrastructure —
    `billing.okara.ai` and `login.okara.ai` resolve today. That is a phishing and subdomain-takeover
    surface, and it defeats their own asset inventory.
11. **GEO is monitoring-weighted** — it scores and reports more than it fixes; execution hands off to
    the Coding Agent.

---

## 6. The architectural critique

Their stack is an excellent **velocity** architecture and a weak **accountability** architecture.
For four people serving 120,000 tenants, most of their choices are close to optimal: the AI Gateway
deleted eight SDK integrations and all retry/fallback code from a codebase two engineers maintain;
QStash instead of standing up Kafka is right; Upstash Vector instead of a Pinecone bill is right.
None of that should be "improved" by adding operational surface.

The gaps are where the product breaks as it moves upmarket.

**QStash gives at-least-once delivery, not durable execution. There is no run journal.**
A QStash retry re-runs a *step*; it does not resume a half-finished agent run with its intermediate
reasoning, retrieved documents, and partial tool results intact. So for a product whose core UX is
"agents queue up actions for you to approve", this question is currently unanswerable:

> *Which model, which prompt version, which retrieved page, and which human click produced this
> Reddit reply?*

At 120,000 tenants with agents drafting under customers' names, that is a brand-safety and legal
exposure, and it makes regression testing impossible.

**The other five, briefly.**

- **Serverless is the wrong shape for long agent runs.** Request-scoped execution forces agent work
  into artificial steps that re-hydrate context on each hop — which means re-sending the brand-voice
  doc and site profile to the model every time. That is a latency, correctness *and* cost problem at
  once.
- **No visible caching strategy at 4B tokens/day.** The per-run context is exactly the reusable kind.
  Provider prompt caching on that stable prefix is the single largest cost lever available.
- **Multi-tenant isolation lives in application code.** Subscription and auth state in Redis means
  isolation is a key-prefix convention; one prefix bug is a cross-tenant leak. And they hold
  write-scoped OAuth tokens for 120,000 sites — one vault compromise is a mass-defacement event.
- **Flow Control throttles globally, not per tenant.** It keeps *okara* under Reddit's limit; it does
  not stop one heavy tenant consuming the shared quota, and a shared app credential tripping abuse
  detection kills the flagship feature for everyone at once.
- **"New models the same day they ship" has no eval gate.** Their proudest capability is also their
  biggest quality risk: an unvetted model change becomes a brand incident before anyone notices.

### On what to build instead of Temporal

The obvious response to "no durable execution" is to adopt Temporal or Inngest. **That is the wrong
call here, for a specific reason:** this product has an independent requirement to produce a
per-run audit record — input snapshot, prompt hash, model, tokens, cost, tool calls, sources, output
diff. *That record already is a step journal.* Adopt a durable-execution framework and you build the
audit journal anyway, then maintain a second opaque vendor journal beside it.

Owning the journal gives replay, audit, cost accounting and the approval queue from one source of
truth, ships with one stateful dependency, and dodges Temporal's determinism constraints — the
largest source of durable-execution production incidents.

Licence traps worth knowing before shopping in this category: **Inngest's server is SSPL** (not
Apache 2.0, as several blog posts claim), **n8n's Sustainable Use Licence forbids hosting it as a
service to others** — which is the agency business model — and **Windmill is AGPLv3**.

---

## 7. What CMO OS does differently, and why

Each row is a decision traceable to a finding above.

| Finding | Response in this build |
|---|---|
| No run journal; "why did it say that" is unanswerable | **Step-level journal on every run** with input hashes, model, cost and sources. `cmo explain <runId>` prints it. `cmo replay <runId>` re-runs and reuses every unchanged step at zero cost |
| Single-brand architecture; agency SKU is a price list | **Workspaces are the primitive.** Every read and write is fenced to one workspace; there is no API that crosses workspaces without naming them |
| Credit opacity | **Dollars, not credits.** One price table; every figure derives from returned token counts. Per-workspace daily/monthly/per-run caps that degrade then stop |
| No paid media, no local/GBP | **Three lanes okara does not have**: paid (Google Ads, Meta, RSA copy), local (GBP, Places substitute), measurement (conversion reconciliation) |
| GEO reports single-run point estimates | **Wilson intervals, Kish effective sample size, a control cohort, a grounded-vs-parametric split, within-engine citation normalisation, and a refusal to report a delta that fails a significance test** |
| Approval gate does not scale past one brand | **Risk tiered by effect**, not by content. Low-risk internal work can auto-approve; anything externally visible cannot, at any setting. An agent can never be the checker |
| "Garbage in, organized garbage out" | **Intake quality is scored and stated.** A thin site produces a `thin`/`insufficient` grade that says so, instead of a confident generic profile |
| Community agents are the sharpest edge | **`community-watch` is read-only** and never drafts a reply to post. Listening scales; posting does not |
| No API, no export, lock-in | **Everything in the UI is in the CLI and the HTTP API.** `GET /api` lists every route. The store is plain JSON and JSONL on disk |
| Onboarding hangs, free tier delivers nothing | **Fixture mode is a first-class product mode.** `cmo demo` runs 14 agents with no key, no network and no credentials |
| Approvals depend on connectors that take weeks to approve | **Typed capability contract** — `live` / `substitute` / `fixture` / `unavailable` — and the mode travels with the data into the report. Places stands in for GBP while its quota request is pending |
| No eval gate on model changes | Deterministic fixtures plus the journal give a fixed corpus and a replayable baseline to score a prompt or model change against |

**Where okara is genuinely ahead, and this build is not:** it actually publishes to five CMS
platforms today, its sandbox→PR loop for technical SEO is a real capability, its client-side E2EE is
competently engineered, and it has 120,000 users. This build has publishing paths specified and
approval-gated but not implemented against live credentials, and it has one demo workspace.

---

## Sources

First-party: [Vercel case study](https://vercel.com/blog/how-okara-runs-cmo-agents-for-120000-companies-on-vercel) ·
[Upstash case study](https://github.com/upstash/upstash-web/blob/main/data/customer/okara.mdx) ·
[TinyFish case study](https://www.tinyfish.ai/blog/okara-ai-cmo-tinyfish-search-fetch) ·
[askOkara/okara-crypto](https://github.com/askOkara/okara-crypto) ·
okara.ai indexed pages: `/docs/introduction`, `/docs/features/seo-fixes`, `/pricing`, `/agency`,
`/refund-policy`, `/whitepaper`, `/affiliates`, `/agent/{cmo,reddit,seo,geo,twitter,linkedin,writer,hackernews,ugc-video,coding,influencer}`

Press: [MarTech Series](https://martechseries.com/content/okara-launches-the-worlds-first-ai-cmo-a-marketing-agent-that-automates-growth/) ·
[Storyboard18](https://www.storyboard18.com/digital/what-is-ai-cmo-okara-launches-ai-agents-to-handle-seo-content-and-growth-92373.htm) ·
[Quasa (launch outage)](https://quasa.io/media/agentic-marketing-revolution-okara-s-ai-cmo-agent-hits-10-million-views-and-takes-down-its-own-infrastructure) ·
[ProPakistani (Dec 2025 beta)](https://propakistani.pk/2025/12/10/okara-launches-beta-private-ai-platform-with-20-open-source-models/)

Reviews, all low-confidence and largely machine-written: [Trustpilot](https://www.trustpilot.com/review/okara.ai) ·
[MakerStack](https://makerstack.co/reviews/okara-review/) · [Hypertools](https://hypertools.so/tool/okara) ·
[thatmarketingbuddy](https://thatmarketingbuddy.com/software/okara) · [aiagentsquare](https://aiagentsquare.com/agents/okara-ai) ·
[Tribe Chat](https://tribechat.com/blog/okara-ai-cmo-review-2026-hype-or-paywall-real-test) ·
[Efficienist](https://efficienist.com/okara-launches-a-99-ai-cmo-that-will-absolutely-not-replace-human-marketers/)

Measurement methodology (for the GEO engine): [Ahrefs Brand Radar methodology](https://ahrefs.com/blog/brand-radar-methodology/) ·
[Ahrefs brand-visibility correlations](https://ahrefs.com/blog/ai-brand-visibility-correlations/) ·
[SEJ — AI visibility rankings are mostly statistical noise](https://www.searchenginejournal.com/ai-visibility-rankings-arent-stable-new-research-shows-its-mostly-statistical-noise/581905/) ·
[Princeton GEO paper (arXiv 2311.09735)](https://arxiv.org/abs/2311.09735) ·
[Vercel — AI crawlers do not render JavaScript](https://vercel.com/blog/the-rise-of-the-ai-crawler) ·
[Seer — content recency and AI visibility](https://www.seerinteractive.com/insights/study-content-recencys-impact-on-ai-visibility-in-2026) ·
[Google generative-AI performance reports](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) ·
[Cloudflare Content Signals Policy](https://blog.cloudflare.com/content-signals-policy/) ·
[OpenAI crawlers](https://developers.openai.com/api/docs/bots) · [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
