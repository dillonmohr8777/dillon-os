---
note_type: capture
status: compiled
created: 2026-08-03
updated: 2026-08-03
observed_at: "2026-08-03T07:32:20.681Z"
source_type: grok_automation
automation: "Daily Marketing and Web-Build Frontier to Dillon OS"
run_title: "Daily marketing, agent workflow, MCP, plugin, and web-build frontier"
verification_status: partial
source_refs:
  - "https://github.com/microsoft/skill-recorder"
  - "https://github.com/microsoft/skillopt"
  - "https://github.com/microsoft/SkillOpt"
  - "https://x.com/about_hiroppy/status/2084065718942019918"
  - "https://x.com/frankhe_ai/status/2084058345963651565"
  - "https://x.com/grepben/status/2084052336746319988"
  - "https://x.com/denisezhelev/status/2084176264395415992"
  - "https://x.com/KineticTraffic/status/2084176191129280869"
  - "https://x.com/Ikebuilds/status/2084064215053275393"
  - "https://x.com/peardotno/status/2084063630778155112"
  - "https://www.microsoft.com/en-us/research/blog/skillopt-agent-skills-as-trainable-parameters/"
  - "https://github.com/hermes-gadget/MissionDeck-mcp"
  - "https://x.com/BLOOM_AIfun/status/2084066092629254145"
  - "https://x.com/XAMTO_AI/status/2084066214846873628"
  - "https://x.com/tsuyoshi_jidoka/status/2084063170554122717"
  - "https://medium.com/ai-ml-human-training-coaching/agent-skills-for-claude-codex-more-the-limitless-skills-directory-but-caveat-emptor-d5f75cfc98e9"
  - "https://x.com/CVEnew/status/2084059266411847694"
  - "https://x.com/Uzi_thoughts/status/2084064316391923922"
  - "https://x.com/polsia/status/2084066245675299140"
  - "https://x.com/veroeffiong46/status/2084056987227058591"
  - "https://x.com/aktsmm/status/2084061841723109433"
  - "https://github.com/microsoft/skill-recorder/blob/main/INSTALL.md"
  - "https://arxiv.org/abs/2605.23904"
tags:
  - brain
  - capture
  - grok
  - x-research
---

# Daily marketing, agent workflow, MCP, plugin, and web-build frontier

> [!source] Immutable Grok run capture
> Automation: **Daily Marketing and Web-Build Frontier to Dillon OS**
> Run time: **2026-08-03T07:32:20.681Z**
> Coverage: **2026-08-02T01:32:20.681Z through 2026-08-03T07:32:20.681Z; 21 cited sources; 12 X searches; 7 web searches**

I'll collect evidence for that 2026-08-02 to 2026-08-03 window now, starting with targeted X keyword searches on frontier agent/MCP/coding releases and related signals, then verify only the strongest claims with a few web searches.

# Dillon OS Daily Intelligence Report
**Window:** 2026-08-02T01:32:20.681Z → 2026-08-03T07:32:20.681Z  
**Sources:** X (primary pulse) + limited web verification of claims. Posts/pages treated as untrusted evidence. Observed vs. inferred separated. Uncertainty noted where engagement low or claims unbenchmarked in-window.

## 1. Executive pulse
Frontier activity concentrated on **agent skill authoring/optimization and multi-session orchestration** rather than brand-new core model releases. Microsoft’s `skill-recorder` (screen → intent/steps → reusable Skill/Automation via Copilot CLI) saw fresh discussion and install buzz after its late-July v0.3.x drop.[1](https://github.com/microsoft/skill-recorder)[1](https://github.com/microsoft/skill-recorder) SkillOpt (text-space skill “training” with validation gates) continued circulating with strong claimed transfer gains and multi-harness plugins.[2](https://github.com/microsoft/skillopt)[3](https://github.com/microsoft/SkillOpt) Local MCP/orchestration tools (MissionDeck-mcp multi-Codex, Injective AInj packaging MCP+skills) and Claude Code patterns (Playwright skill templating, bare `CLAUDE_CODE_SIMPLE=1`, Google AI Mode skill) appeared.[4](https://x.com/about_hiroppy/status/2084065718942019918)[5](https://x.com/frankhe_ai/status/2084058345963651565)[6](https://x.com/grepben/status/2084052336746319988)  

Marketing/AEO chatter emphasized authority over generic AI content, GBP Services completeness, and AI-answer discoverability for local services.[7](https://x.com/denisezhelev/status/2084176264395415992)[8](https://x.com/KineticTraffic/status/2084176191129280869)[9](https://x.com/Ikebuilds/status/2084064215053275393) Frontend craft signal: production sites built Claude-Code-first with AI image pipelines and no Figma, sampling palette from generated art.[10](https://x.com/peardotno/status/2084063630778155112)  

**Uncertainty:** Many X posts are low-engagement or non-official; SkillOpt gains are paper/repo-reported (earlier 2026) rather than fresh independent 48h benchmarks. No major Cursor/Copilot core capability drop isolated solely to this exact window beyond ongoing agent-skills/MCP support.

## 2. High-signal findings
**Observed evidence**
- `microsoft/skill-recorder`: Desktop app records local screen/activity (clicks, windows, optional narration); Analyze sends timeline/images to Copilot CLI to emit intent + ordered steps → SKILL.md or Automation. Prefers native tools/CLI/API over pure UI replay. v0.3.1 ~2026-07-30; macOS primary, Windows supported; source-build install; explicit secret warnings (Analyze is cloud).[1](https://github.com/microsoft/skill-recorder)[4](https://x.com/about_hiroppy/status/2084065718942019918)
- `microsoft/SkillOpt`: Treats compact `best_skill.md` as trainable state (epochs, batches, LR, val-gate edits). Claimed best/tied on 52 cells; large lifts (e.g. +19–25 pts on GPT-5.5 / Claude Code / Codex). PyPI + plugins/MCP shells for Claude Code, Codex, Copilot; ~15.5k stars; SkillOpt-Sleep offline evolution.[3](https://github.com/microsoft/SkillOpt)[11](https://www.microsoft.com/en-us/research/blog/skillopt-agent-skills-as-trainable-parameters/)
- MissionDeck-mcp update: local-first dashboard + MCP to spawn/monitor multiple persistent Codex sessions/worktrees; ownership controls, quota admission, loopback default, password/session hardening.[6](https://x.com/grepben/status/2084052336746319988)[12](https://github.com/hermes-gadget/MissionDeck-mcp)
- Claude Code patterns: custom Playwright “verification archetype” taught to skill → higher precision; `CLAUDE_CODE_SIMPLE=1` strips auto-context for speed/focus/lower tokens; google-ai-mode-skill claims aggregated AI Mode results + citations, no API key.[13](https://x.com/BLOOM_AIfun/status/2084066092629254145)[5](https://x.com/frankhe_ai/status/2084058345963651565)[14](https://x.com/XAMTO_AI/status/2084066214846873628)
- skills.sh (Vercel ecosystem directory) referenced as ranking/source of shareable skills.[15](https://x.com/tsuyoshi_jidoka/status/2084063170554122717)[16](https://medium.com/ai-ml-human-training-coaching/agent-skills-for-claude-codex-more-the-limitless-skills-directory-but-caveat-emptor-d5f75cfc98e9)
- Security: CVE-2026-67357 ArcadeDB MCP `get_server_settings` info disclosure (clusterToken).[17](https://x.com/CVEnew/status/2084059266411847694)
- AEO/GEO: References to Google’s AI optimization guidance; push for real authority vs. generic AI content; GBP Services as keyword-rich surface.[7](https://x.com/denisezhelev/status/2084176264395415992)[8](https://x.com/KineticTraffic/status/2084176191129280869)[18](https://x.com/Uzi_thoughts/status/2084064316391923922)
- Local-service AI discovery: posts on plumbers/welders/pressure-cleaners needing machine-readable credentials/presence for “who near me” AI answers; nascent AI GBP/audit tools.[9](https://x.com/Ikebuilds/status/2084064215053275393)[19](https://x.com/polsia/status/2084066245675299140)
- Design production: agency site rebuilt with GPT-Image stills → motion → Claude Code (Fable) direct to prod, palette sampled from paintings, no Figma.[10](https://x.com/peardotno/status/2084063630778155112)

**Inference (low-medium confidence)**  
Skill authoring is shifting from hand-written prompts → demonstration or optimizer loops. Parallel Codex/Claude sessions + bare-mode + validated skills are the near-term efficiency levers for multi-site factories. Local AEO will reward structured trust signals (NAP parity, FAQs, credentials, fresh dates) more than volume content.

**Conflicting/low-signal**  
Injective AInj “one-install CLI+MCP+skills” is vendor-promotional.[20](https://x.com/veroeffiong46/status/2084056987227058591) Many “new MCP” mentions are incremental or enterprise demos (HPE storage). Viral “Claude killed the agency” claims coexist with agencies shipping differentiated work using the same stack.

## 3. Consumer taste and demographic signals
- **Local-service buyers** increasingly route via AI (“good plumber near me”, mobile welder, pressure cleaner). Presence that is only human-web or phone-book style is invisible; verified, structured, AI-parseable credentials matter.[9](https://x.com/Ikebuilds/status/2084064215053275393)
- **Creative direction:** Rejection of generic AI gloss in favor of art-directed real/gen imagery whose palette and texture drive the whole site (gold/cerulean sampled from paintings). Motion from stills. Implies Dillon templates should support strong art-direction handoff and avoid default “AI slop” component kits.[10](https://x.com/peardotno/status/2084063630778155112)
- **Onboarding/UX friction** still surfaces in fintech/web3 flows (verification loops, missing airdrops); seamless first-transaction paths remain a conversion differentiator (indirect taste signal for simple, trustworthy local-service funnels).
- Demographic language sparse in-window; strongest buying language is practical/local (“near me”, verified, one system). Authority and recency beat polished generic copy for AI answers.[8](https://x.com/KineticTraffic/status/2084176191129280869)

**Uncertainty:** Sample skewed tech/creator; limited pure consumer panels.

## 4. Agent, MCP, skill, GitHub, and workflow opportunities
| Candidate | Source quality / freshness | Stack fit / risks | Decision |
|-----------|---------------------------|-------------------|----------|
| skill-recorder | Official MS GitHub, active, docs, secret warnings | High for capturing factory QA/review/deploy rituals → skills; Copilot dependency; cloud Analyze; secret exposure if misused | sandbox-test |
| SkillOpt + Sleep | MS Research + OSS, high stars, multi-harness, paper | Optimize existing Dillon skills (site gen, AEO FAQ, Playwright gates); compute cost for training; val-set required | sandbox-test |
| MissionDeck-mcp | Public repo, security-conscious defaults | Parallel Codex for 25-site factory; local-only; Node 22+; ownership model good | sandbox-test |
| CLAUDE_CODE_SIMPLE=1 + custom Playwright archetype | Practitioner posts | Immediate, zero-install flag + skill pattern; lower tokens, more deterministic QA | save-to-library |
| google-ai-mode-skill / skills.sh | X + secondary writeups | Research/AEO gathering; prompt-injection & supply-chain risk on third-party skills; no-key claim unverified here | watch |
| Random new MCP (ArcadeDB etc.) | CVE active | Reject unvetted MCPs; info-disclosure pattern | reject |
| Injective AInj bundle | Promotional | Vertical crypto; low overlap | watch / reject for core |

Overlap notes: skill-recorder and SkillOpt both produce SKILL.md artifacts usable by Claude Code/Codex/Copilot. MissionDeck adds orchestration, not generation. Prefer demonstration → skill → optimize loop over adding more MCP surface area (injection + secret risk).

## 5. Website factory, design, AEO, and retention implications
- **Factory / 25-site:** Capture maker-checker, Maps-to-site parity, visual critique, Netlify/preview, and acceptance-gate flows once with skill-recorder; optimize the resulting skills with SkillOpt against a held-out site set. Parallel Codex sessions (MissionDeck) for vertical template batches. Playwright skill with human-authored archetype improves deterministic visual/a11y/functional gates.[13](https://x.com/BLOOM_AIfun/status/2084066092629254145)
- **Design/UI:** Support Figma-optional path: real or art-directed gen imagery → token extraction (color/type) → component gen. Avoid generic AI aesthetics by enforcing image-derived constraints and independent visual critique step. Storybook/HTML-slide skills exist for handoff decks but secondary.[21](https://x.com/aktsmm/status/2084061841723109433)
- **AEO/GEO/SEO:** Prioritize source-ready FAQs, freshness dates, comparison/price/review structures, GBP Services completeness + keyword descriptions, and third-party authority. Google AI optimization guidance cited as canonical. Generic AI content flagged as trust liability.[7](https://x.com/denisezhelev/status/2084176264395415992)[8](https://x.com/KineticTraffic/status/2084176191129280869)
- **Retention/CRO/local:** Machine-readable trust (credentials, NAP parity, reviews responses) for repeat/AI-referred local buyers. Preview deployments + acceptance gates remain the safety layer before any client-facing push (no prod deploys from this research).
- **Ops:** Real imagery pipelines + vertical templates + independent checker (human or second-model visual pass) directly supported by observed craft patterns.

## 6. Recommended experiments ranked
Ranked by expected benefit × evidence × (1/risk). All are research/sandbox only.

1. **Sandbox skill-recorder on one factory ritual** (e.g., “Maps parity + FAQ AEO pack + Playwright smoke”)  
   - Benefit: Turn tribal process into reusable SKILL.md; faster onboarding of new verticals.  
   - Evidence: Official MS repo + active discussion.  
   - Risk: Medium (cloud Analyze, secret leakage if careless).  
   - Acceptance test: Record → Analyze → Skill runs end-to-end on a throwaway repo producing identical checklist artifacts; no secrets in output; rollback = delete skill + uninstall app.  
   - Independent checker: Second human or bare Claude Code run of skill vs. manual baseline.  
   - Human gate: before any Analyze with real client data.

2. **Sandbox SkillOpt on 2–3 existing Dillon skills** (component gen, a11y gate, AEO FAQ) with held-out sites  
   - Benefit: Measurable accuracy/token lift without weight changes; transferable artifacts.  
   - Evidence: Paper + repo metrics + plugins.  
   - Risk: Medium (training compute, overfit if weak val).  
   - Acceptance: Val score improves ≥X pts on held-out; skill ≤2k tokens; runs on Claude Code + Codex; rollback = revert to seed skill.  
   - Checker: Frozen eval harness separate from optimizer.

3. **Library pattern: CLAUDE_CODE_SIMPLE=1 + human Playwright archetype skill**  
   - Benefit: Lower context cost, higher QA determinism for factory gates.  
   - Evidence: Direct practitioner reports.  
   - Risk: Low.  
   - Acceptance: Same test suite pass rate ≥ baseline with ≤70% tokens/time; rollback = unset env.  
   - Checker: CI log comparison.

4. **Sandbox MissionDeck-mcp for dual Codex worktree batch** (two vertical templates in parallel)  
   - Benefit: Throughput on 25-site pipeline.  
   - Evidence: Repo + update post.  
   - Risk: Medium (local process mgmt, quota).  
   - Acceptance: Two isolated sessions complete without cross-talk; ownership enforced; loopback only; rollback = stop services + rm data dir.  
   - Checker: Manual session audit.

(Reserve capacity; do not expand MCP surface.)

## 7. Watchlist and rejected hype
**Watchlist**
- skills.sh / third-party skill registries (supply chain, ranking quality).
- google-ai-mode-skill and similar research skills (citation fidelity, injection).
- Google AI optimization guide updates and AI Mode/Overviews ranking factors.
- GBP-centric AI audit/response tools for local clients.
- Further Copilot/Claude agent-skills + MCP sandboxing improvements.
- Art-directed gen-image → code pipelines (palette/token extraction quality).

**Rejected / no-action hype**
- Unvetted MCP servers (ArcadeDB-style CVEs; any cleartext secret tools).
- “One install kills agencies” promotional bundles without reproducible local evals.
- Generic viral skill packs without source review or acceptance tests.
- Duplicate capabilities already covered by installed Claude/Cursor/Copilot + Playwright.
- Any tool requiring production credentials, always-on public endpoints, or irreversible install during research.
- Paid courses / Quark links / low-signal SEO spam.

## What Dillon OS should change today
1. Add `CLAUDE_CODE_SIMPLE=1` (and equivalent bare flags) to default coding-efficiency profiles for focused generation/QA tasks; measure token/latency.  
2. Author one canonical Playwright verification archetype and teach it into the existing skill rather than free-form agent QA.  
3. Queue sandbox evaluation of skill-recorder solely on internal non-client factory rituals (no secrets).  
4. Draft held-out eval set (5–10 prior sites) for any future SkillOpt run on AEO-FAQ and component skills.  
5. Update AEO checklist: GBP Services completeness, freshness signals, authority citations, Maps-NAP parity as hard gates before preview.

## No action
No posting, outreach, purchases, installs into production Dillon OS, credential connection, or live client deployments. No new MCP servers attached. Hype items and insecure/unmaintained releases stay rejected.

```json
candidates_json
[
  {
    "name": "skill-recorder factory ritual capture",
    "decision": "sandbox-test",
    "why": "Official Microsoft tool turns one demonstration of Maps-parity/FAQ/Playwright/deploy gates into reusable SKILL.md/Automation; matches 25-site factory need for repeatable handoff.",
    "expected_benefit": "Faster vertical onboarding and deterministic process skills; reduces prompt drift.",
    "source_urls": ["https://github.com/microsoft/skill-recorder", "https://github.com/microsoft/skill-recorder/blob/main/INSTALL.md"],
    "acceptance_test": "Record non-secret internal ritual on throwaway repo; Analyze produces editable intent+steps; generated skill re-runs to identical artifact checklist; no secrets in timeline or skill; skill prefers CLI over pure UI.",
    "independent_checker": "Second operator or bare Claude Code executes skill against baseline manual run; diff artifacts and time.",
    "rollback": "Delete generated skills; uninstall Skill Recorder app and remove local recordings.",
    "human_gate": "Required before any Analyze step and before using recordings that could contain client-like data.",
    "risk": "medium",
    "overlap": "Produces SKILL.md consumable by Claude Code/Codex/Copilot; complements rather than replaces existing skills."
  },
  {
    "name": "SkillOpt on Dillon core skills",
    "decision": "sandbox-test",
    "why": "Validation-gated text-space optimizer with reported large gains and native Claude Code/Codex plugins; can harden site-gen, AEO, and QA skills.",
    "expected_benefit": "Higher task success and lower tokens on frozen models; transferable compact best_skill.md.",
    "source_urls": ["https://github.com/microsoft/SkillOpt", "https://www.microsoft.com/en-us/research/blog/skillopt-agent-skills-as-trainable-parameters/", "https://arxiv.org/abs/2605.23904"],
    "acceptance_test": "Train on seed skills with held-out site set; val score improves vs seed; artifact ≤2000 tokens; runs successfully in Claude Code and Codex harnesses without weight changes.",
    "independent_checker": "Separate frozen eval harness (not the optimizer loop) scores before/after on new sites.",
    "rollback": "Revert to seed skill files; discard optimizer checkpoints.",
    "human_gate": "Approve val-set composition and any API spend caps before training run.",
    "risk": "medium",
    "overlap": "Optimizes skills that skill-recorder or humans produce; plugins already target same harnesses."
  },
  {
    "name": "MissionDeck-mcp parallel Codex",
    "decision": "sandbox-test",
    "why": "Local MCP + dashboard for multiple persistent Codex sessions/worktrees with ownership and quota controls; direct throughput lever for batch site work.",
    "expected_benefit": "Higher parallel factory throughput with session isolation.",
    "source_urls": ["https://github.com/hermes-gadget/MissionDeck-mcp"],
    "acceptance_test": "Spawn two worktree sessions via MCP; each completes independent template task; no cross-session mutation by non-owner; loopback-only; clean stop leaves no leaked tokens.",
    "independent_checker": "Manual audit of session logs and file diffs; confirm ownership enforcement.",
    "rollback": "systemctl/user stop services; remove .data directory; revert MCP config.",
    "human_gate": "Confirm loopback and password before first start; no LAN expose.",
    "risk": "medium",
    "overlap": "Orchestrates Codex; does not replace skill content or Claude Code paths."
  },
  {
    "name": "CLAUDE_CODE_SIMPLE + Playwright archetype",
    "decision": "save-to-library",
    "why": "Zero-install flag plus human-authored verification pattern reported to cut noise and raise QA precision; immediate factory fit.",
    "expected_benefit": "Lower token/latency and more deterministic acceptance gates.",
    "source_urls": [],
    "acceptance_test": "N/A (library pattern); when used, same gate suite pass-rate ≥ baseline at reduced context.",
    "independent_checker": "CI comparison of token and pass metrics.",
    "rollback": "Unset env var; revert skill to free-form.",
    "human_gate": "None for library save.",
    "risk": "low",
    "overlap": "Enhances existing Playwright skill usage; no new server."
  },
  {
    "name": "Third-party skills.sh / google-ai-mode-skill",
    "decision": "watch",
    "why": "Convenient research aggregation and skill discovery, but supply-chain and injection exposure; claims (no-key, citation quality) not fully verified in-window.",
    "expected_benefit": "Faster AEO/research gathering if hardened.",
    "source_urls": [],
    "acceptance_test": "N/A",
    "independent_checker": "N/A",
    "rollback": "N/A",
    "human_gate": "N/A",
    "risk": "high",
    "overlap": "Overlaps web/browser tools already available; higher prompt-injection surface."
  },
  {
    "name": "Unvetted MCP servers (e.g. ArcadeDB pattern)",
    "decision": "reject",
    "why": "Active CVE class (info disclosure of tokens); expands attack surface without factory-specific gain.",
    "expected_benefit": "None material.",
    "source_urls": [],
    "acceptance_test": "N/A",
    "independent_checker": "N/A",
    "rollback": "N/A",
    "human_gate": "N/A",
    "risk": "high",
    "overlap": "Duplicates safer scoped data access patterns."
  }
]
```

## Sources encountered

- https://github.com/microsoft/skill-recorder
- https://github.com/microsoft/skillopt
- https://github.com/microsoft/SkillOpt
- https://x.com/about_hiroppy/status/2084065718942019918
- https://x.com/frankhe_ai/status/2084058345963651565
- https://x.com/grepben/status/2084052336746319988
- https://x.com/denisezhelev/status/2084176264395415992
- https://x.com/KineticTraffic/status/2084176191129280869
- https://x.com/Ikebuilds/status/2084064215053275393
- https://x.com/peardotno/status/2084063630778155112
- https://www.microsoft.com/en-us/research/blog/skillopt-agent-skills-as-trainable-parameters/
- https://github.com/hermes-gadget/MissionDeck-mcp
- https://x.com/BLOOM_AIfun/status/2084066092629254145
- https://x.com/XAMTO_AI/status/2084066214846873628
- https://x.com/tsuyoshi_jidoka/status/2084063170554122717
- https://medium.com/ai-ml-human-training-coaching/agent-skills-for-claude-codex-more-the-limitless-skills-directory-but-caveat-emptor-d5f75cfc98e9
- https://x.com/CVEnew/status/2084059266411847694
- https://x.com/Uzi_thoughts/status/2084064316391923922
- https://x.com/polsia/status/2084066245675299140
- https://x.com/veroeffiong46/status/2084056987227058591
- https://x.com/aktsmm/status/2084061841723109433

## Structured candidates

### skill-recorder factory ritual capture

- Decision: **sandbox-test**
- Why: Official Microsoft tool turns one demonstration of Maps-parity/FAQ/Playwright/deploy gates into reusable SKILL.md/Automation; matches 25-site factory need for repeatable handoff.
- Expected benefit: Faster vertical onboarding and deterministic process skills; reduces prompt drift.
- Acceptance test: Record non-secret internal ritual on throwaway repo; Analyze produces editable intent+steps; generated skill re-runs to identical artifact checklist; no secrets in timeline or skill; skill prefers CLI over pure UI.
- Independent checker: Second operator or bare Claude Code executes skill against baseline manual run; diff artifacts and time.
- Rollback: Delete generated skills; uninstall Skill Recorder app and remove local recordings.
- Human gate: Required before any Analyze step and before using recordings that could contain client-like data.
- Sources: https://github.com/microsoft/skill-recorder, https://github.com/microsoft/skill-recorder/blob/main/INSTALL.md

### SkillOpt on Dillon core skills

- Decision: **sandbox-test**
- Why: Validation-gated text-space optimizer with reported large gains and native Claude Code/Codex plugins; can harden site-gen, AEO, and QA skills.
- Expected benefit: Higher task success and lower tokens on frozen models; transferable compact best_skill.md.
- Acceptance test: Train on seed skills with held-out site set; val score improves vs seed; artifact ≤2000 tokens; runs successfully in Claude Code and Codex harnesses without weight changes.
- Independent checker: Separate frozen eval harness (not the optimizer loop) scores before/after on new sites.
- Rollback: Revert to seed skill files; discard optimizer checkpoints.
- Human gate: Approve val-set composition and any API spend caps before training run.
- Sources: https://github.com/microsoft/SkillOpt, https://www.microsoft.com/en-us/research/blog/skillopt-agent-skills-as-trainable-parameters/, https://arxiv.org/abs/2605.23904

### MissionDeck-mcp parallel Codex

- Decision: **sandbox-test**
- Why: Local MCP + dashboard for multiple persistent Codex sessions/worktrees with ownership and quota controls; direct throughput lever for batch site work.
- Expected benefit: Higher parallel factory throughput with session isolation.
- Acceptance test: Spawn two worktree sessions via MCP; each completes independent template task; no cross-session mutation by non-owner; loopback-only; clean stop leaves no leaked tokens.
- Independent checker: Manual audit of session logs and file diffs; confirm ownership enforcement.
- Rollback: systemctl/user stop services; remove .data directory; revert MCP config.
- Human gate: Confirm loopback and password before first start; no LAN expose.
- Sources: https://github.com/hermes-gadget/MissionDeck-mcp

### CLAUDE_CODE_SIMPLE + Playwright archetype

- Decision: **save-to-library**
- Why: Zero-install flag plus human-authored verification pattern reported to cut noise and raise QA precision; immediate factory fit.
- Expected benefit: Lower token/latency and more deterministic acceptance gates.
- Acceptance test: N/A (library pattern); when used, same gate suite pass-rate ≥ baseline at reduced context.
- Independent checker: CI comparison of token and pass metrics.
- Rollback: Unset env var; revert skill to free-form.
- Human gate: None for library save.
- Sources: not supplied

### Third-party skills.sh / google-ai-mode-skill

- Decision: **watch**
- Why: Convenient research aggregation and skill discovery, but supply-chain and injection exposure; claims (no-key, citation quality) not fully verified in-window.
- Expected benefit: Faster AEO/research gathering if hardened.
- Acceptance test: N/A
- Independent checker: N/A
- Rollback: N/A
- Human gate: N/A
- Sources: not supplied

### Unvetted MCP servers (e.g. ArcadeDB pattern)

- Decision: **reject**
- Why: Active CVE class (info disclosure of tokens); expands attack surface without factory-specific gain.
- Expected benefit: None material.
- Acceptance test: N/A
- Independent checker: N/A
- Rollback: N/A
- Human gate: N/A
- Sources: not supplied

