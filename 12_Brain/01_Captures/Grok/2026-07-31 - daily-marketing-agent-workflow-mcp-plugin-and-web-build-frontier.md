---
note_type: capture
status: compiled
created: 2026-07-31
updated: 2026-07-31
observed_at: "2026-07-31T07:30:49.919Z"
source_type: grok_automation
automation: "Daily Marketing and Web-Build Frontier to Dillon OS"
run_title: "Daily marketing, agent workflow, MCP, plugin, and web-build frontier"
verification_status: partial
source_refs:
  - "https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/"
  - "https://blog.modelcontextprotocol.io/posts/2026-07-28/"
  - "https://x.com/conradlotz/status/2082822619737264595"
  - "https://x.com/lemhamza/status/2082843991125459448"
  - "https://x.com/zep_ai/status/2082945152956404137"
  - "https://help.getzep.com/docs-mcp-server"
  - "https://playwright.dev/docs/test-agents"
  - "https://x.com/geekyants/status/2082801156695458008"
  - "https://x.com/so_sthbryan/status/2082903553236988181"
  - "https://x.com/prompt_insider/status/2082917306645221656"
  - "https://x.com/SunailLocalSEO/status/2082773528810750454"
  - "https://x.com/marfinxx/status/2082800322678751728"
  - "https://x.com/kyronis_talks/status/2082821469583880568"
  - "https://x.com/uxdesigncc/status/2082779509002997860"
  - "https://x.com/LucasJosefiak/status/2082834493962907821"
  - "https://x.com/TAMPICTG87/status/2082670825975710026"
  - "https://x.com/Totalmedios_com/status/2082821055140315426"
  - "https://x.com/ATechAjay/status/2082860180073541859"
  - "https://docs.github.com/copilot/using-github-copilot/code-review/using-copilot-code-review"
  - "https://bug0.com/blog/playwright-test-agents"
  - "https://thepromptinsider.com/aeo/aeo-for-local-businesses-how-to-win-ai-search-in-your-city/"
  - "https://help.getzep.com/implement-zep-with-agents"
tags:
  - brain
  - capture
  - grok
  - x-research
---

# Daily marketing, agent workflow, MCP, plugin, and web-build frontier

> [!source] Immutable Grok run capture
> Automation: **Daily Marketing and Web-Build Frontier to Dillon OS**
> Run time: **2026-07-31T07:30:49.919Z**
> Coverage: **2026-07-30T01:30:49.919Z through 2026-07-31T07:30:49.919Z; 18 cited sources; 13 X searches; 4 web searches**

```html
<!-- Dillon OS Daily Intelligence | Window: 2026-07-30T01:30:49.919Z → 2026-07-31T07:30:49.919Z -->
```

# 1. Executive pulse
Observed activity concentrated on July 30 centered on production hardening of agent tooling (Copilot code review GA with skills/MCP, MCP 2026-07-28 spec rollout to Claude) and testing/automation loops (Playwright Agents). AEO/GEO discourse for local businesses intensified around entity data, schema, and reviews as AI answer engines gain share. Consumer signals emphasize cultural connection, authenticity, and co-creation over pure price or polish. No major greenfield design-system or 25-site-factory releases; strongest signals are composable skills, read-only MCP context, and verification gates that reduce regression risk after fast generation. Evidence quality is mixed: official changelogs and maintainer posts are high-confidence; many X posts are low-engagement announcements or promotional. Uncertainty: exact adoption timelines for MCP 2026-07-28 across all clients and real-world token/cost impact of new skills remain unbenchmarked in-window.[1](https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/)[2](https://blog.modelcontextprotocol.io/posts/2026-07-28/)

# 2. High-signal findings
**Observed (primary sources):**
- GitHub Copilot code review generally available with agent skills (SKILL.md in `.github/skills`) and MCP servers (GitHub + Playwright enabled by default; read-only). Attribution of skill/MCP context in comments. Applies to Pro/Pro+/Business/Enterprise.[1](https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/)[3](https://x.com/conradlotz/status/2082822619737264595)
- MCP specification 2026-07-28 released (stateless core, multi-round-trip requests, header routing, cacheable lists, hardened OAuth/OIDC, extensions framework for Apps/Tasks). Claude rolling out support.[2](https://blog.modelcontextprotocol.io/posts/2026-07-28/)[4](https://x.com/lemhamza/status/2082843991125459448)
- Zep shipped one plugin bundling docs MCP server + “building-with-zep” skill for Claude Code, Codex, and Cursor (architectural decisions, measurement of context completeness vs answer accuracy). Separate install for other clients.[5](https://x.com/zep_ai/status/2082945152956404137)[6](https://help.getzep.com/docs-mcp-server)
- Playwright Test Agents (Planner, Generator, Healer) actively discussed for plan → generate → heal loops that explore pages, verify selectors, and repair failures. Official docs exist; posts highlight integration with real apps vs generic codegen.[7](https://playwright.dev/docs/test-agents)[8](https://x.com/geekyants/status/2082801156695458008)
- Coding Tools MCP (v0.2.2) announced for safe edit + execution primitives usable by Claude/GPT agents on existing repos.[9](https://x.com/so_sthbryan/status/2082903553236988181)
- Local AEO emphasis: entity data, schema, service-area pages, reviews, consistent NAP, FAQ schema to be cited by ChatGPT/Perplexity/AI Overviews rather than just rank. Checklists and platform posts proliferated.[10](https://x.com/prompt_insider/status/2082917306645221656)[11](https://x.com/SunailLocalSEO/status/2082773528810750454)
- Context/loop engineering posts (Anthropic-inspired): harness pruning, ReAct with verification, multi-agent fan-out, persistent memory files between iterations, independent “assume broken” checker. Claims of large token/latency wins.[12](https://x.com/marfinxx/status/2082800322678751728)[13](https://x.com/kyronis_talks/status/2082821469583880568)
- Design/UI: Figma plugin for curated real-artist imagery (Stills); agentic Figma-to-code feedback loops and teams skipping Figma for design-system + Widgetbook preview iteration; free 1UI prompt-to-UI Figma export.[14](https://x.com/uxdesigncc/status/2082779509002997860)[15](https://x.com/LucasJosefiak/status/2082834493962907821)

**Inference (separated):** These lower the cost of customized, standards-aware review and verification for multi-site work, and raise the value of structured AEO assets (schema, entities, reviews) for local-service clients. Conflicting/low signal: many AEO posts are agency marketing with thin independent data; consumer “humanistic marketing” summary is one long promotional post with unverifiable claims.[16](https://x.com/TAMPICTG87/status/2082670825975710026)

# 3. Consumer taste and demographic signals
**Observed:**
- Cultural connection and authenticity prioritized over price; “humanistic” trends: users as co-creators, ordinary-person narratives, anti-refinement/local micro-insights, lifestyle curation, AI as emotional companion rather than tech demo. Chinese-market case collation (with methodological caveats) and broader “connection over price” notes.[17](https://x.com/Totalmedios_com/status/2082821055140315426)[16](https://x.com/TAMPICTG87/status/2082670825975710026)
- Local-service buyers: still driven by Google Business Profile hygiene + emerging AI citation (reviews velocity, entity consistency, service-area pages). “Best of” listicles and FAQ answers matter for GEO.[11](https://x.com/SunailLocalSEO/status/2082773528810750454)
- Creator/taste: preference for real imagery and culturally resonant assets over generic AI aesthetics; voice/personality in marketing; community and “living person” feel.[14](https://x.com/uxdesigncc/status/2082779509002997860)

**Inference:** For Dillon client work (likely local services + web), positioning should favor authentic local proof, co-creation language, real photos, and FAQ/entity content that AI engines can cite. Uncertainty: signals are skewed toward marketing accounts and one long Chinese-industry summary; Western demographic splits (age, income, mobile-first) not freshly quantified in-window. No strong conflicting evidence, but low sample size.

# 4. Agent, MCP, skill, GitHub, and workflow opportunities
- **Copilot skills + MCP for review**: High compatibility with existing GitHub workflows. Drop SKILL.md for Dillon standards (a11y, performance budgets, AEO schema, visual QA). Read-only MCP reduces secret exposure. Overlap with any existing Copilot use; low monetary cost if already licensed.[1](https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/)
- **MCP 2026-07-28**: Stateless core and better auth improve production agent reliability and multi-client support. Watch client rollouts (Claude already moving). Migration effort for existing servers; prompt-injection surface still requires careful tool design.[2](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- **Zep plugin/skill**: Memory/context for multi-turn coding or client-knowledge agents. Useful for long-running factory or research loops. Context cost vs benefit needs measurement; enterprise-scale positioning.[6](https://help.getzep.com/docs-mcp-server)
- **Playwright Agents + default MCP**: Direct fit for browser automation, visual/functional regression, a11y/performance gates, and healer loops after component generation. Deterministic acceptance via generated + healed tests.[7](https://playwright.dev/docs/test-agents)
- **Coding Tools MCP / voice (SKI) / loop patterns**: Sandbox candidates for edit-run-test and supervisory multi-agent (planner + independent verifier + persistent memory file). Parallel worktrees mentioned for collision avoidance.[9](https://x.com/so_sthbryan/status/2082903553236988181)[13](https://x.com/kyronis_talks/status/2082821469583880568)
- **Context engineering**: Prune harness tokens, sub-agent summaries, independent checker that assumes failure. High leverage for token cost and reliability in factory pipelines.

**Assessment notes (all candidates):** Prefer official docs/repos over directories. Check permissions (read-only preferred), secret handling (no prod creds in MCP), overlap with installed stack, context cost, rollback (feature flags or skill removal), and acceptance tests. No installation performed.

# 5. Website factory, design, AEO, and retention implications
- **Factory (25-site)**: Skills for vertical templates + maker-checker (Copilot review skill + independent Playwright healer). Maps-to-site NAP/schema parity as automated gate. Real imagery via curated Figma plugins or agent art-direction prompts to avoid generic AI look. Source-ready FAQs + LocalBusiness/Service/FAQPage schema as AEO trust gate. Safe Netlify previews already compatible; add visual critique loop (Widgetbook-style or Chromatic-like).[18](https://x.com/ATechAjay/status/2082860180073541859)
- **Design/UI/UX**: Design-system tokens + code-first iteration with preview feedback reduces Figma handoff friction. Emphasize responsive, a11y, micro-interactions, and real-image art direction. Storybook/Chromatic-style visual regression remains the verification layer after generation.[15](https://x.com/LucasJosefiak/status/2082834493962907821)
- **AEO/GEO/retention**: Prioritize entity consistency, review velocity, service-area pages, and citable FAQs so sites surface in AI Overviews/Mode/ChatGPT. Third-visit/ retention via authentic local proof and lifestyle content. CRO/landing: match buying language of cultural connection + clear local offers.[10](https://x.com/prompt_insider/status/2082917306645221656)
- **Ops**: Research → real imagery → vertical template → maker (agent) → checker (skill + Playwright) → independent visual critique → responsive/functional QA → AEO gates → approval → preview. Deterministic gates over vibes.

# 6. Recommended experiments ranked by expected benefit, evidence strength, risk, deterministic acceptance test, independent checker, and rollback
1. **Copilot code-review skill for Dillon standards (sandbox-test)**  
   Benefit: Higher-consistency PR/review on factory sites (a11y, schema, perf). Evidence: Official GA. Risk: Low (read-only MCP, skill-scoped). Acceptance: Skill triggers on sample PR; comments cite skill; human rates +2 quality vs baseline. Checker: Second human or separate agent. Rollback: Remove SKILL.md.  

2. **Playwright Agents planner-generator-healer loop on one vertical template (sandbox-test)**  
   Benefit: Faster reliable regression + visual/a11y gates after generation. Evidence: Official agents + maintainer posts. Risk: Medium (selector drift, flakiness). Acceptance: Generated suite passes on clean template; healer fixes injected break; coverage > baseline. Checker: Manual spot + independent run. Rollback: Disable agents, keep classic tests.  

3. **AEO entity/schema/FAQ pack + local checklist automation (save-to-library)**  
   Benefit: Better AI citation for local-service clients. Evidence: Multiple consistent practitioner posts + checklists. Risk: Low. Acceptance: Schema validates; NAP parity script passes; sample queries surface site in AI tools (manual). Checker: External AEO auditor prompt. Rollback: N/A (content).  

4. **Persistent memory file + independent “assume-broken” verifier in agent loop (sandbox-test)**  
   Benefit: Fewer repeated mistakes, better multi-iteration factory runs. Evidence: High-engagement engineering posts. Risk: Medium (context bloat). Acceptance: Same task solves in fewer iterations with memory vs without; verifier catches planted bug. Checker: Separate model. Rollback: Disable memory write.  

5. **Zep or equivalent memory skill for client-knowledge agents (watch → later sandbox)**  
   Benefit: Longer coherent research/handoff. Evidence: Official plugin. Risk: Medium (cost, privacy). Defer full test.  

(Max 5 actionable; prefer testable over exhaustive.)

# 7. Watchlist and rejected hype
**Watchlist:** Full MCP 2026-07-28 client ecosystem maturity and breaking changes; SKI voice coding; further Widgetbook/ agentic UI guides; GeoReady-style AEO monitoring platforms; any official Storybook/Chromatic AI agents; beehiiv or other vertical MCPs if relevant to content.  

**Rejected / no-action:** Low-engagement promotional AEO/GEO threads without reproducible data; unverified “humanistic marketing” mega-post claims; generic “AI ships a week in a day” without regression controls; any tool requiring broad write secrets or unclear permissions; duplicated directory-style MCP lists; hype around unmaintained or high-context-cost servers. No production install, outreach, or credential use.

## What Dillon OS should change today
1. Draft and sandbox one `.github/skills` SKILL.md encoding Dillon factory standards (schema/AEO, a11y, real-image preference, NAP parity) for Copilot review.  
2. Prototype Playwright Agents on a single vertical template with an independent healer + visual gate.  
3. Add AEO trust checklist (entity, FAQ schema, review signals, Maps parity) as a deterministic pre-preview gate.  
4. Instrument one agent loop with persistent learnings file + separate verifier agent.  
5. Prefer curated real imagery / cultural-resonance prompts over generic AI aesthetics in generation prompts.  

## No action
Hype MCP directories, unverified trend decks, tools with write access or poor secret hygiene, capabilities already covered by existing Copilot/Playwright stack, and any live deployment or purchasing.

```json
candidates_json
[
  {
    "name": "Copilot code-review SKILL.md for Dillon standards",
    "decision": "sandbox-test",
    "why": "GA support for skills + default read-only MCP enables standards-aware review without prompt stuffing",
    "expected_benefit": "More consistent factory PR quality and faster iteration on a11y/schema/perf",
    "source_urls": ["https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/", "https://docs.github.com/copilot/using-github-copilot/code-review/using-copilot-code-review"],
    "acceptance_test": "On a sample multi-file PR, skill is attributed in comments; human score of review usefulness improves ≥20% vs baseline; no secret leakage",
    "independent_checker": "Second human reviewer or separate non-Copilot agent scoring the same PR",
    "rollback": "Delete or rename .github/skills entry; reviews fall back to default",
    "human_gate": "Review skill content and first 3 attributed runs before any wider enablement",
    "risk": "low",
    "overlap": "Existing Copilot usage; complements rather than replaces manual review"
  },
  {
    "name": "Playwright Agents planner-generator-healer on vertical template",
    "decision": "sandbox-test",
    "why": "Official agents + default MCP provide explore/generate/heal loop for regression after fast generation",
    "expected_benefit": "Lower maintenance cost for visual/functional/a11y gates across 25-site factory",
    "source_urls": ["https://playwright.dev/docs/test-agents", "https://bug0.com/blog/playwright-test-agents"],
    "acceptance_test": "Planner produces scenarios from prompt; generator emits passing tests on clean template; healer auto-fixes one injected selector/DOM break; suite runtime and flake rate within 1.5× classic baseline",
    "independent_checker": "Manual execution of healed suite + separate visual diff tool",
    "rollback": "Disable agent flags; retain previously committed classic Playwright tests",
    "human_gate": "Approve generated scenarios and first healed run",
    "risk": "medium",
    "overlap": "Existing Playwright usage; extends rather than duplicates"
  },
  {
    "name": "AEO entity/schema/FAQ + local checklist pack",
    "decision": "save-to-library",
    "why": "Consistent practitioner evidence that entity, schema, NAP, reviews, service-area pages drive AI citations for local",
    "expected_benefit": "Higher probability of client sites being named/cited in AI Overviews and ChatGPT local answers",
    "source_urls": ["https://thepromptinsider.com/aeo/aeo-for-local-businesses-how-to-win-ai-search-in-your-city/"],
    "acceptance_test": "N/A (library); when applied, schema validates, NAP parity script green, FAQPage present",
    "independent_checker": "External schema validator + manual AI-query spot check",
    "rollback": "N/A (content assets)",
    "human_gate": "Editorial review of FAQ/entity copy for accuracy",
    "risk": "low",
    "overlap": "Standard SEO practices; extends to GEO/AEO"
  },
  {
    "name": "Persistent memory file + independent assume-broken verifier loop",
    "decision": "sandbox-test",
    "why": "Engineering reports show loops without cross-iteration memory repeat failures; independent checker counters self-praise",
    "expected_benefit": "Fewer wasted iterations and higher reliability on multi-step factory or refactor tasks",
    "source_urls": [],
    "acceptance_test": "Identical refactoring task: with memory file solves in ≤ half the iterations of no-memory baseline; verifier flags at least one planted defect that generator missed",
    "independent_checker": "Separate model instance or human scoring final PR",
    "rollback": "Disable memory write path and verifier agent; single-loop mode",
    "human_gate": "Inspect memory file contents and verifier prompts for injection risk",
    "risk": "medium",
    "overlap": "General agent orchestration; pairs with Copilot/Playwright"
  },
  {
    "name": "Zep Build-with-Zep plugin/skill + docs MCP",
    "decision": "watch",
    "why": "Official multi-client plugin encodes architecture decisions and measurement; useful for memory-heavy agents but cost/privacy untested in Dillon stack",
    "expected_benefit": "Better long-horizon context for research or client-knowledge agents",
    "source_urls": ["https://help.getzep.com/implement-zep-with-agents", "https://help.getzep.com/docs-mcp-server"],
    "acceptance_test": "N/A while watching",
    "independent_checker": "N/A",
    "rollback": "N/A",
    "human_gate": "N/A",
    "risk": "medium",
    "overlap": "Any existing memory or RAG tools"
  },
  {
    "name": "Generic viral MCP directories and unverified AEO mega-threads",
    "decision": "reject",
    "why": "Low signal, promotional, or duplicated; fail source-quality and maintenance checks",
    "expected_benefit": "none",
    "source_urls": [],
    "acceptance_test": "N/A",
    "independent_checker": "N/A",
    "rollback": "N/A",
    "human_gate": "N/A",
    "risk": "high",
    "overlap": "high with better official sources"
  }
]
```

## Sources encountered

- https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/
- https://blog.modelcontextprotocol.io/posts/2026-07-28/
- https://x.com/conradlotz/status/2082822619737264595
- https://x.com/lemhamza/status/2082843991125459448
- https://x.com/zep_ai/status/2082945152956404137
- https://help.getzep.com/docs-mcp-server
- https://playwright.dev/docs/test-agents
- https://x.com/geekyants/status/2082801156695458008
- https://x.com/so_sthbryan/status/2082903553236988181
- https://x.com/prompt_insider/status/2082917306645221656
- https://x.com/SunailLocalSEO/status/2082773528810750454
- https://x.com/marfinxx/status/2082800322678751728
- https://x.com/kyronis_talks/status/2082821469583880568
- https://x.com/uxdesigncc/status/2082779509002997860
- https://x.com/LucasJosefiak/status/2082834493962907821
- https://x.com/TAMPICTG87/status/2082670825975710026
- https://x.com/Totalmedios_com/status/2082821055140315426
- https://x.com/ATechAjay/status/2082860180073541859

## Structured candidates

### Copilot code-review SKILL.md for Dillon standards

- Decision: **sandbox-test**
- Why: GA support for skills + default read-only MCP enables standards-aware review without prompt stuffing
- Expected benefit: More consistent factory PR quality and faster iteration on a11y/schema/perf
- Acceptance test: On a sample multi-file PR, skill is attributed in comments; human score of review usefulness improves ≥20% vs baseline; no secret leakage
- Independent checker: Second human reviewer or separate non-Copilot agent scoring the same PR
- Rollback: Delete or rename .github/skills entry; reviews fall back to default
- Human gate: Review skill content and first 3 attributed runs before any wider enablement
- Sources: https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/, https://docs.github.com/copilot/using-github-copilot/code-review/using-copilot-code-review

### Playwright Agents planner-generator-healer on vertical template

- Decision: **sandbox-test**
- Why: Official agents + default MCP provide explore/generate/heal loop for regression after fast generation
- Expected benefit: Lower maintenance cost for visual/functional/a11y gates across 25-site factory
- Acceptance test: Planner produces scenarios from prompt; generator emits passing tests on clean template; healer auto-fixes one injected selector/DOM break; suite runtime and flake rate within 1.5× classic baseline
- Independent checker: Manual execution of healed suite + separate visual diff tool
- Rollback: Disable agent flags; retain previously committed classic Playwright tests
- Human gate: Approve generated scenarios and first healed run
- Sources: https://playwright.dev/docs/test-agents, https://bug0.com/blog/playwright-test-agents

### AEO entity/schema/FAQ + local checklist pack

- Decision: **save-to-library**
- Why: Consistent practitioner evidence that entity, schema, NAP, reviews, service-area pages drive AI citations for local
- Expected benefit: Higher probability of client sites being named/cited in AI Overviews and ChatGPT local answers
- Acceptance test: N/A (library); when applied, schema validates, NAP parity script green, FAQPage present
- Independent checker: External schema validator + manual AI-query spot check
- Rollback: N/A (content assets)
- Human gate: Editorial review of FAQ/entity copy for accuracy
- Sources: https://thepromptinsider.com/aeo/aeo-for-local-businesses-how-to-win-ai-search-in-your-city/

### Persistent memory file + independent assume-broken verifier loop

- Decision: **sandbox-test**
- Why: Engineering reports show loops without cross-iteration memory repeat failures; independent checker counters self-praise
- Expected benefit: Fewer wasted iterations and higher reliability on multi-step factory or refactor tasks
- Acceptance test: Identical refactoring task: with memory file solves in ≤ half the iterations of no-memory baseline; verifier flags at least one planted defect that generator missed
- Independent checker: Separate model instance or human scoring final PR
- Rollback: Disable memory write path and verifier agent; single-loop mode
- Human gate: Inspect memory file contents and verifier prompts for injection risk
- Sources: not supplied

### Zep Build-with-Zep plugin/skill + docs MCP

- Decision: **watch**
- Why: Official multi-client plugin encodes architecture decisions and measurement; useful for memory-heavy agents but cost/privacy untested in Dillon stack
- Expected benefit: Better long-horizon context for research or client-knowledge agents
- Acceptance test: N/A while watching
- Independent checker: N/A
- Rollback: N/A
- Human gate: N/A
- Sources: https://help.getzep.com/implement-zep-with-agents, https://help.getzep.com/docs-mcp-server

### Generic viral MCP directories and unverified AEO mega-threads

- Decision: **reject**
- Why: Low signal, promotional, or duplicated; fail source-quality and maintenance checks
- Expected benefit: none
- Acceptance test: N/A
- Independent checker: N/A
- Rollback: N/A
- Human gate: N/A
- Sources: not supplied

