# 64GB Morning Orchestrator Spec

Date: 2026-07-08
Companion to: `11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md`
Status: operational spec for the daily order-shooter. No credentials included.

This turns the 8-lane handoff into a concrete daily loop: one morning push, one approval, every client
optimized in parallel across remote Chrome tabs. It is the same system implemented as portable skills so
it runs on the 64GB machine (authenticated Chrome) and in cloud sessions (analysis/reports) alike.

Skills (shared repo `claude-skills-repo`, runs local + cloud):
- `skills/morning-orchestrator/` — the order-shooter (this spec's runtime)
- `skills/campaign-intel/` — per-client ads learning engine + optimization ledger

Vault agents (`mohr-vault/vault/11_Agents/`): Master, Google Ads, Web, Reporting, SEO, **Morning
Orchestrator**, **Web Design Lane**. The orchestrator drives the existing agents as parallel scouts.

## Orchestration Ownership (who runs what)

- **GPT-5.6 / Codex = the commander (L0).** It is the persistent orchestrator on the 64GB machine: owns
  routing, the run-state, the approval board, the swarm, the kill switch, and the one push to Dillon. It
  runs the daily loop and spawns the parallel sub-agent swarm.
- **Claude Code desktop = occasional local specialist.** Dillon runs it now and then. Codex may delegate
  a bounded lane to it as an L1/L2 worker (e.g. code changes, vault reasoning, report build, QA/verify)
  by shelling out to the `claude` CLI with a worker contract and reading back the structured return.
  Claude is a worker in the swarm, not a second commander — one brain stays in charge.
- **The contract is model-agnostic.** `orchestrator.config.json`, `references/agent-protocol.md`, and
  `references/autonomy-policy.md` (in `claude-skills-repo/skills/morning-orchestrator/`) are plain
  JSON + markdown. Codex reads them as its execution spec; Claude reads the same files when run locally.
  No behavior is locked inside a Claude-only skill format — the SKILL.md files are a convenience wrapper
  for when Claude is the one running, and they point at the same contract.

### How Codex consumes this
1. Read this spec + `orchestrator.config.json` for topology, tiers, budgets, concurrency.
2. Read `agent-protocol.md` (worker contract, self-verification, ceilings) and `autonomy-policy.md` (what's unattended vs gated).
3. Ensure `claude-skills-repo` is present locally so the reference files resolve; if not, this spec plus the config JSON are sufficient to run.
4. Run the daily loop below as the commander. Spawn workers per the protocol. Delegate to `claude` only for lanes where it's the better tool; keep the commander single-threaded.

## Daily Loop
1. **Wake** — scheduled, no human (Task Scheduler, `-WakeToRun`, ~06:30).
2. **Pre-flight** per client: authorization valid? tracking tags/versions current (GTM published, GA4, conv tag, Meta pixel+CAPI)? real conversion intent behind the ads (conversion goal set, intent-bearing keywords, not vanity traffic)?
3. **Fan out scouts** — parallel, read-only, Tier 0, all clients at once (ads, web, reporting, SEO, comms).
4. **Synthesize** — one ranked approval board.
5. **Push** — one notification to Dillon's phone, deep-linked to the board.
6. **Execute** — on one approval, run the Tier-1 batch across parallel Chrome tabs (start 3, up to 6).
7. **Readback + ledger** — log every change as a hypothesis; label win/loss on review date.
8. **Deliver** — draft recaps; sends stay gated.

Steps 1–5 run unattended. Dillon touches it once, at step 6.

## Approval Tiers (the unblock)
- **Tier 0 auto:** read/analyze/find-mistakes/draft/QA/build. No gate.
- **Tier 1 morning batch:** reversible tweaks — negatives, pause a wasteful keyword, fix a broken CTA/link, tighten schedule, swap a QA'd creative. One approval on the push executes them for all clients.
- **Tier 2 live only:** budget/bid up, new campaigns, changing conversion goals, Gmail send, Slack post, publish/deploy, billing, credentials/2FA.

If Dillon can undo it in 30s → Tier 1. Irreversible or outbound → Tier 2.

## Parallel Execution Contract
- One tab = one client = one CDP context. Never two writers on the same ads account.
- Attach over CDP (`127.0.0.1:9222`), fresh page per client, **disconnect** when done — never close Dillon's browser.
- Screenshot before/after; read back from the platform before marking done.
- Expired session in one tab → mark `needs-reauth`, other tabs continue. Never auto-login/2FA.
- Concurrency: 3–6 client tabs. Limiter is API rate + platform stability, not RAM (each Chrome ctx ≈ 0.5–0.7 GB on 64GB).
- Tier-2 never executes here.

## The Learning Loop
Every applied change → `01_Clients/<Client>/Optimization Ledger.md` as a hypothesis (expected outcome +
review date). On review, `campaign-intel` pulls the real result and labels it win/loss. Losses become
documented mistakes-not-to-repeat; wins become patterns. The account gets smarter every cycle.

## Autonomous Swarm

These run as self-driving agents, not scripts. Each morning the commander spawns a bounded parallel
swarm — depth capped at 3: commander → lane leads (ads/web/reporting/seo/comms) → per-client workers →
analyst facets. Full protocol in `claude-skills-repo/skills/morning-orchestrator/references/`
(`agent-protocol.md`, `autonomy-policy.md`) and `orchestrator.config.json`.

- **Fully autonomous, no human:** read, pre-flight, analyze, draft, self-verify, QA, build artifacts, append vault + ledger hypotheses, assemble board, push.
- **Autonomous after one approval:** the Tier-1 batch across parallel Chrome tabs.
- **Never autonomous:** Tier 2 (prepared decision-ready, executed only live).
- **Self-verification:** nothing reaches the board or a report until a separate verifier agent tries to refute it and fails (default reject-if-uncertain; ties escalate to gated).
- **Ceilings:** depth 3, ≤8 concurrent agents, ≤60 agents/run, per-run token cap; failures isolate to one node; idempotent by `node_id` (resume-safe); `STOP` flag halts at any phase.

## Runtime Split
- **Local (64GB machine):** pre-flight auth pulls, Tier-1 execution across Chrome tabs, live readback. Needs the logged-in Chrome via Chrome Plugin or CDP.
- **Cloud-safe:** scouts against vault/Drive/public pages, board synthesis, report artifacts, ledger read/write.
- Same skills both places; only the authenticated-Chrome half is pinned local.

## Startup (per the handoff, adapted)
1. Read memory summary, MEMORY.md, AGENTS.md, PROJECTS.md.
2. Confirm connectors + Chrome Plugin/CDP + Netlify login.
3. Confirm current Google Ads / Meta client map (verify, don't trust old lists).
4. Create the run folder; build the board with ≤8 active client cards.
5. Start read-only scouts. Ask for approval only when the Tier-1 batch is ready.

## Run Artifacts
`automation-runs/morning-orchestrator/YYYY-MM-DD/`: `run-state.json`, `approval-board.md`,
`tier1-batch.json`, `tier2-queue.md`, `evidence-log.md`, `ledger-updates.jsonl`.
