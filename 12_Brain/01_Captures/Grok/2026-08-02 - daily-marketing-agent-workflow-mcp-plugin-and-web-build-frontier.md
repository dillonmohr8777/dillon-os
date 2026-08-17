---
note_type: capture
status: compiled
created: 2026-08-02
updated: 2026-08-02
observed_at: "2026-08-02T16:30:43.572Z"
source_type: grok_automation
automation: "Daily Marketing and Web-Build Frontier to Dillon OS"
run_title: "Daily marketing, agent workflow, MCP, plugin, and web-build frontier"
verification_status: partial
source_refs:
  - "https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/"
  - "https://github.com/addyosmani/agent-skills"
  - "https://x.com/0xAllSeeingNik/status/2083946683688239498"
  - "https://x.com/ServBayDev/status/2083371134473339252"
  - "https://support.servbay.com/getting-started/release-notes"
  - "https://x.com/0x_devofdev/status/2083953269211091082"
  - "https://x.com/DanKornas/status/2083943668688228430"
  - "https://x.com/grok/status/2083944611492368738"
  - "https://x.com/RobGuerra90/status/2083951343383785562"
  - "https://x.com/Takumixbt/status/2083953677069410558"
  - "https://x.com/pvncher/status/2083953541517869230"
  - "https://x.com/AnandButani/status/2083402375386046662"
  - "https://x.com/dip_ak/status/2083953494722015632"
  - "https://x.com/koki_okino/status/2083952213140111723"
  - "https://x.com/superdesiai/status/2083950998582649181"
  - "https://x.com/hakan_ertann/status/2083540738709541323"
  - "https://x.com/wagslane/status/2083608350110241184"
  - "https://x.com/distributionOS/status/2083953734778822924"
  - "https://x.com/irentdumpsters/status/2083952624949178625"
  - "https://x.com/rammcodes/status/2083498870353391788"
  - "https://addyosmani.com/blog/agent-skills/"
  - "https://www.servbay.com/"
  - "https://github.com/"
  - "https://github.com/Tekdey/claude-app-factory"
  - "https://github.com/ (BIAsia/c2d2c via npx)"
  - "AgentDeskAI/browser-tools-mcp references"
tags:
  - brain
  - capture
  - grok
  - x-research
---

# Daily marketing, agent workflow, MCP, plugin, and web-build frontier

> [!source] Immutable Grok run capture
> Automation: **Daily Marketing and Web-Build Frontier to Dillon OS**
> Run time: **2026-08-02T16:30:43.572Z**
> Coverage: **2026-08-01T10:30:43.572Z through 2026-08-02T16:30:43.572Z; 20 cited sources; 14 X searches; 7 web searches**

I'll collect intelligence for the specified window using X as the primary pulse, with tight web verification only where needed. Starting with targeted X keyword and semantic searches around frontier agent/MCP/coding tools, frontend craft, marketing/AEO, and related signals.

# Dillon OS Daily Intelligence: 2026-08-01T10:30:43.572Z — 2026-08-02T16:30:43.572Z

## 1. Executive pulse
Observed activity centered on production-grade agent skills/workflows (especially structured SDLC commands), MCP expansions for local stacks and browser/code-review, Copilot GA for skills+MCP in reviews, bidirectional Figma-code skills, and AEO/GEO emphasis on source primacy + consensus descriptions over classic SEO. Parallel/sub-agent patterns and long-running harnesses appear repeatedly. Design talk stresses craft fundamentals and unstructured input over pure AI aesthetics or chat-everything. Marketing signals favor buyer hypotheses, retention/value, and AI-answer visibility tools. Evidence is mostly maintainer/X posts + official changelogs; few independent benchmarks in-window. Uncertainty: adoption depth and exact Dillon stack fit untested; some repos pre-date window but circulated heavily now.[1](https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/)[2](https://github.com/addyosmani/agent-skills)

## 2. High-signal findings
**Evidence (observed):**
- GitHub Copilot code review: agent skills + MCP generally available (Pro/Pro+/Business/Enterprise) as of 2026-07-29. Skills via `.github/skills`/SKILL.md; MCP (read-only) for external context; GitHub + Playwright MCP on by default; attribution on comments. Prior preview in June.[1](https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/)
- addyosmani/agent-skills (MIT, active commits into late July): production skills + slash commands mapping DEFINE→PLAN→BUILD→VERIFY→REVIEW→SHIP (`/spec`, `/plan`, `/build`, `/test`, `/review`, `/webperf`, `/code-simplify`, `/ship`). Auto-activates domain skills (frontend-ui-engineering, etc.); `/build auto` for approved autonomous runs. Install via `npx skills add`, Claude marketplace, Cursor rules, Copilot, etc. Strong multi-tool packaging.[2](https://github.com/addyosmani/agent-skills)[3](https://x.com/0xAllSeeingNik/status/2083946683688239498)
- ServBay: built-in MCP server exposing ~39 tools for local stack control (services start/stop/logs, packages/versions, sites/domains/SSL, DBs, hosts, Ollama, metrics). Targeted at Claude Code/Cursor/Codex; one-click connect. Positioned as AI-agent local foundation (50+ services).[4](https://x.com/ServBayDev/status/2083371134473339252)[5](https://support.servbay.com/getting-started/release-notes)
- claude-app-factory (new OSS, MIT): Anthropic long-duration harness + GitHub spec-kit (spec→plan→tasks) + EARS notation; single-repo app+API+landing.[6](https://x.com/0x_devofdev/status/2083953269211091082)
- browser-tools-mcp (AgentDeskAI): browser automation/debug for AI tools.[7](https://x.com/DanKornas/status/2083943668688228430)
- c2d2c skill (BIAsia/c2d2c): Figma↔code loops (requires capable model); config via C2D2C.md (tokens, DS, gates).[8](https://x.com/grok/status/2083944611492368738)
- earningscalls.dev: low-cost API + MCP for earnings transcripts into workflows.[9](https://x.com/RobGuerra90/status/2083951343383785562)
- Parallel sub-agents (Claude Code) and Codex concurrency config.toml bumps noted in practice; headless tips (MCP error visibility, subagent forwarding, workflowSizeGuideline).[10](https://x.com/Takumixbt/status/2083953677069410558)[11](https://x.com/pvncher/status/2083953541517869230)[12](https://x.com/AnandButani/status/2083402375386046662)
- GEO/AEO/LLMO: optimize model belief/consensus (primary sources, original data, consistent positioning, trusted surfaces); tools emerging for AI-answer exposure/export; measure description text, not just rank.[13](https://x.com/dip_ak/status/2083953494722015632)[14](https://x.com/koki_okino/status/2083952213140111723)
- ChatGPT ad tests: click opens site-crawled agent (site as sales script, no classic LP).[15](https://x.com/superdesiai/status/2083950998582649181)
- Design craft lists (grid, spacing, type, motion, a11y, etc.) vs pure AI patterns; unstructured input favored over form-heavy or pure chat UIs.[16](https://x.com/hakan_ertann/status/2083540738709541323)[17](https://x.com/wagslane/status/2083608350110241184)

**Inference (separated):** These reduce context waste and shortcut-taking in agent loops; Playwright default + browser MCP aids deterministic QA; AEO shifts factory FAQs/trust gates toward citable originals. Conflicting: some report agent “mind virus”/rule invention on long runs (reset/split repos advised). No broad reproducible benchmarks in window.

## 3. Consumer taste and demographic signals
**Evidence:** Buyer hypotheses (role/situation/problem/trigger/outcome/objection + disconfirmable questions) preferred over static demographic personas.[18](https://x.com/distributionOS/status/2083953734778822924) Retention/value over cheapest product; happier customers drive reviews/referrals.[19](https://x.com/irentdumpsters/status/2083952624949178625) Interactive/educational 3D experiences (anatomy example via image→3D→Codex optimization) praised as high-craft use cases. Unstructured/streamlined input preferred. Local-service/creator signals thin in-window; marketing/PR percentage deals and creator outreach mentioned in games/media.

**Inference:** For local-service clients, prioritize clear value/retention language, original data/FAQs that AIs cite, hypothesis-driven offers over broad personas. Avoid generic AI-slop aesthetics; lean real imagery + craft fundamentals. Uncertainty: limited direct local-buyer language samples; signals more B2B/creator-adjacent.

## 4. Agent, MCP, skill, GitHub, and workflow opportunities
- **addyosmani/agent-skills**: Highest signal for planning/handoff, TDD gates, frontend skills, review, webperf. Compatible with Claude/Cursor/Codex/Copilot. Low monetary cost (OSS); context cost manageable via selective install. Overlap with any existing SDLC prompts—replace rather than stack.[2](https://github.com/addyosmani/agent-skills)
- **Copilot skills+MCP (GA)**: Direct code-review upgrade; Playwright default supports visual/a11y/functional gates. Read-only MCP reduces injection risk.[1](https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/)
- **ServBay MCP**: Local full-stack control for factory previews/CI-like agent loops. Assess secret handling (local vault claims) and permissions.[5](https://support.servbay.com/getting-started/release-notes)
- **claude-app-factory + parallel/sub-agent patterns**: Orchestration for multi-site or long factory runs; EARS/spec-kit for deterministic handoffs.
- **browser-tools-mcp + c2d2c**: Browser QA + Figma parity for design systems/tokens/responsive.
- **earningscalls MCP**: Niche; low priority unless client finance vertical.
- Collections of 20+ skills circulating; prefer curated (Osmani) over bulk to control context/prompt-injection surface.[20](https://x.com/rammcodes/status/2083498870353391788)
Assessments: Source quality high (official/maintainer); freshness good; maintenance active for top ones; prompt-injection/secret risks higher on unvetted MCPs (sandbox only); rollback via config removal/git. No install during research.

## 5. Website factory, design, AEO, and retention implications
- Factory: Inject `/spec`→`/plan`→`/build`→`/test`→`/review` gates + Playwright MCP for responsive/functional/a11y/visual regression; maker-checker via independent review skill or Copilot. Maps-to-site parity via local MCP domain/SSL tools. Source-ready FAQs as primary/citable content for AEO trust. Safe Netlify/preview via agent-controlled local first.
- Design/UI/UX: Enforce craft checklist (spacing, type, contrast, motion, real imagery) to avoid generic AI look; c2d2c or Storybook for token/component fidelity; unstructured onboarding/forms where fit. Figma-to-code bidirectional reduces handoff loss.
- AEO/GEO/SEO: Prioritize original data, consistent positioning statements, docs/forums presence; capture/export how AIs describe the business. Landing pages may evolve toward agent-crawlable scripts. CRO: AI critique of hero liabilities noted.
- Retention: Value/quality language; third-visit via interactive elements or clear next-actions. Local SEO/GBP parity still foundational.
Inference: 25-site velocity rises with reusable skills + deterministic gates; risk of context bloat or invented rules on long runs—use short scopes + resets.

## 6. Recommended experiments ranked by expected benefit, evidence strength, risk, deterministic acceptance test, independent checker, and rollback
1. **Sandbox-test addyosmani/agent-skills (selected: spec/plan/build/test/review/frontend-ui + webperf)**  
   Benefit: Structured handoff + quality gates for factory velocity/quality (high). Evidence: strong (popular maintained repo + multi-tool). Risk: low-medium (context, overlap). Acceptance: Run `/spec`→`/build`→`/test` on a sample vertical template; all tasks commit with passing tests + review checklist complete. Checker: Separate agent or human diffs against skill criteria. Rollback: Remove skills dir / uninstall plugin. Human gate: Yes (initial select).  

2. **Sandbox-test Copilot code review skills+MCP (with Playwright)**  
   Benefit: Automated review + browser gates for 25-site QA (high). Evidence: official GA. Risk: low (read-only). Acceptance: PR on sample site triggers review citing skill/MCP; Playwright checks pass on responsive/a11y. Checker: Manual spot-check of attributed comments. Rollback: Disable in settings.  

3. **Sandbox-test ServBay MCP (read-only subset first)**  
   Benefit: Agent-driven local previews/DBs/SSL for factory parity (medium-high). Evidence: maintainer posts + docs. Risk: medium (permissions, local secrets). Acceptance: Agent creates sample site + DB + SSL via MCP; verify running without manual CLI. Checker: Independent process list/logs. Rollback: Disconnect MCP config.  

4. **Save-to-library / light sandbox c2d2c + browser-tools-mcp**  
   Benefit: Design fidelity + visual QA (medium). Evidence: circulating skill + repo. Risk: medium (model reqs, browser exposure). Acceptance: Round-trip one component Figma↔code; browser MCP screenshots match.  

5. **Watch / document AEO capture process**  
   Benefit: Trust gates + FAQ quality (medium). Evidence: practitioner posts. Risk: low. Acceptance: Export AI descriptions for 3 sample clients; diff vs desired positioning.

No production, no credentials, no outreach.

## 7. Watchlist and rejected hype
**Watchlist:** claude-app-factory (orchestration maturity); earningscalls MCP (vertical fit); bulk skill packs (context cost); Gemini/ChatGPT surface changes (ads/agents); LLMO export tools; parallel sub-agent limit behaviors; unstructured UI patterns.
**Rejected hype / no-action:** Viral “one-shotted app” claims without process; unvetted credit resellers; generic “10 GitHub repos” lists without maintenance signals; pure demographic persona tools (prefer hypotheses); any MCP requiring broad secrets or write without sandbox; duplicated local-stack tools if ServBay covers; long unattended runs without visibility hooks (known quiet failures). Low-signal releases and crypto-adjacent noise ignored.

### What Dillon OS should change today
1. Prototype selective install of Osmani agent-skills (spec/build/test/review/frontend) in a sandbox repo for factory templates.  
2. Enable/evaluate Copilot code-review skills + default Playwright MCP on one internal PR flow.  
3. Document AEO checklist: primary-source FAQs, consistent positioning, AI-description capture.  
4. Add craft-fundamentals gate (spacing/type/contrast/real imagery) to visual critique step.  
5. Test short parallel/sub-agent scopes with explicit concurrency caps and error forwarding for multi-site runs.  

**No action:** Bulk skill installs, production MCP connects, purchases, postings, or unverified viral workflows.

```candidates_json
[
  {
    "name": "addyosmani/agent-skills (selective SDLC + frontend)",
    "decision": "sandbox-test",
    "why": "Production workflows and quality gates reduce agent shortcuts; multi-tool support; active maintenance",
    "expected_benefit": "Faster reliable planning/handoff/build/test/review for 25-site factory and client full-stack work",
    "source_urls": ["https://github.com/addyosmani/agent-skills", "https://addyosmani.com/blog/agent-skills/"],
    "acceptance_test": "On sample vertical template: /spec produces PRD; /plan atomic tasks; /build + /test yields green commits; /review five-axis checklist passes; frontend skill triggers on UI files",
    "independent_checker": "Second agent or human verifies commits match skill criteria and tests pass independently",
    "rollback": "npx skills remove or delete skills/ and plugin configs; git revert",
    "human_gate": "Yes — skill selection and first full cycle",
    "risk": "medium (context bloat, prompt overlap)",
    "overlap": "Existing planning/review prompts — replace, do not duplicate"
  },
  {
    "name": "GitHub Copilot code review agent skills + MCP (Playwright default)",
    "decision": "sandbox-test",
    "why": "Official GA; brings standards and browser context into reviews",
    "expected_benefit": "Deterministic code + visual/a11y gates in factory CI/PR flow",
    "source_urls": ["https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/"],
    "acceptance_test": "Sample PR receives attributed skill/MCP comments; Playwright responsive/a11y checks execute and pass or fail correctly",
    "independent_checker": "Human reviews comment attribution and re-runs Playwright locally",
    "rollback": "Disable skills/MCP in Copilot settings; remove .github/skills",
    "human_gate": "Yes — initial enablement",
    "risk": "low (read-only MCP)",
    "overlap": "Any existing Copilot review or Playwright setup"
  },
  {
    "name": "ServBay MCP (39 local tools, read-first)",
    "decision": "sandbox-test",
    "why": "Agent control of local stack (DB/site/SSL/services) for realistic previews",
    "expected_benefit": "Maps-to-site parity and agent-driven local factory environments without manual ops",
    "source_urls": ["https://www.servbay.com/", "https://support.servbay.com/getting-started/release-notes"],
    "acceptance_test": "Agent via MCP creates site + DB + issues SSL and starts services; verify accessible locally and logs clean",
    "independent_checker": "Manual inspection of running processes, hosts, and certs outside agent",
    "rollback": "One-click disconnect MCP config; stop services",
    "human_gate": "Yes — permissions and secret vault review",
    "risk": "medium (local permissions, secret exposure)",
    "overlap": "Docker/devcontainer or existing local stack tools"
  },
  {
    "name": "c2d2c skill + browser-tools-mcp",
    "decision": "sandbox-test",
    "why": "Bidirectional design-code and browser automation for craft and QA",
    "expected_benefit": "Higher Figma parity, visual regression, debug for client sites",
    "source_urls": ["https://github.com/ (BIAsia/c2d2c via npx)", "AgentDeskAI/browser-tools-mcp references"],
    "acceptance_test": "One component round-trips Figma↔code with tokens; browser MCP captures matching screenshots and basic a11y",
    "independent_checker": "Designer or second agent visual diff",
    "rollback": "Remove skill and MCP entry",
    "human_gate": "Yes",
    "risk": "medium (model requirements, browser surface)",
    "overlap": "Existing Storybook/Figma plugins or Playwright"
  },
  {
    "name": "claude-app-factory harness",
    "decision": "save-to-library",
    "why": "Long-running + spec-kit + EARS pattern useful reference; new OSS",
    "expected_benefit": "Future orchestration template for multi-site or complex apps",
    "source_urls": ["https://github.com/Tekdey/claude-app-factory"],
    "acceptance_test": "N/A (library)",
    "independent_checker": "N/A",
    "rollback": "N/A",
    "human_gate": "N/A",
    "risk": "low",
    "overlap": "Osmani skills and existing harnesses"
  },
  {
    "name": "Bulk unvetted skill packs / earningscalls MCP / pure persona generators",
    "decision": "reject",
    "why": "Context cost, injection surface, low vertical fit, or superseded by hypotheses",
    "expected_benefit": "none material",
    "source_urls": [],
    "acceptance_test": "N/A",
    "independent_checker": "N/A",
    "rollback": "N/A",
    "human_gate": "N/A",
    "risk": "high",
    "overlap": "high with curated alternatives"
  }
]
```

## Sources encountered

- https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/
- https://github.com/addyosmani/agent-skills
- https://x.com/0xAllSeeingNik/status/2083946683688239498
- https://x.com/ServBayDev/status/2083371134473339252
- https://support.servbay.com/getting-started/release-notes
- https://x.com/0x_devofdev/status/2083953269211091082
- https://x.com/DanKornas/status/2083943668688228430
- https://x.com/grok/status/2083944611492368738
- https://x.com/RobGuerra90/status/2083951343383785562
- https://x.com/Takumixbt/status/2083953677069410558
- https://x.com/pvncher/status/2083953541517869230
- https://x.com/AnandButani/status/2083402375386046662
- https://x.com/dip_ak/status/2083953494722015632
- https://x.com/koki_okino/status/2083952213140111723
- https://x.com/superdesiai/status/2083950998582649181
- https://x.com/hakan_ertann/status/2083540738709541323
- https://x.com/wagslane/status/2083608350110241184
- https://x.com/distributionOS/status/2083953734778822924
- https://x.com/irentdumpsters/status/2083952624949178625
- https://x.com/rammcodes/status/2083498870353391788

## Structured candidates

### addyosmani/agent-skills (selective SDLC + frontend)

- Decision: **sandbox-test**
- Why: Production workflows and quality gates reduce agent shortcuts; multi-tool support; active maintenance
- Expected benefit: Faster reliable planning/handoff/build/test/review for 25-site factory and client full-stack work
- Acceptance test: On sample vertical template: /spec produces PRD; /plan atomic tasks; /build + /test yields green commits; /review five-axis checklist passes; frontend skill triggers on UI files
- Independent checker: Second agent or human verifies commits match skill criteria and tests pass independently
- Rollback: npx skills remove or delete skills/ and plugin configs; git revert
- Human gate: Yes — skill selection and first full cycle
- Sources: https://github.com/addyosmani/agent-skills, https://addyosmani.com/blog/agent-skills/

### GitHub Copilot code review agent skills + MCP (Playwright default)

- Decision: **sandbox-test**
- Why: Official GA; brings standards and browser context into reviews
- Expected benefit: Deterministic code + visual/a11y gates in factory CI/PR flow
- Acceptance test: Sample PR receives attributed skill/MCP comments; Playwright responsive/a11y checks execute and pass or fail correctly
- Independent checker: Human reviews comment attribution and re-runs Playwright locally
- Rollback: Disable skills/MCP in Copilot settings; remove .github/skills
- Human gate: Yes — initial enablement
- Sources: https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/

### ServBay MCP (39 local tools, read-first)

- Decision: **sandbox-test**
- Why: Agent control of local stack (DB/site/SSL/services) for realistic previews
- Expected benefit: Maps-to-site parity and agent-driven local factory environments without manual ops
- Acceptance test: Agent via MCP creates site + DB + issues SSL and starts services; verify accessible locally and logs clean
- Independent checker: Manual inspection of running processes, hosts, and certs outside agent
- Rollback: One-click disconnect MCP config; stop services
- Human gate: Yes — permissions and secret vault review
- Sources: https://www.servbay.com/, https://support.servbay.com/getting-started/release-notes

### c2d2c skill + browser-tools-mcp

- Decision: **sandbox-test**
- Why: Bidirectional design-code and browser automation for craft and QA
- Expected benefit: Higher Figma parity, visual regression, debug for client sites
- Acceptance test: One component round-trips Figma↔code with tokens; browser MCP captures matching screenshots and basic a11y
- Independent checker: Designer or second agent visual diff
- Rollback: Remove skill and MCP entry
- Human gate: Yes
- Sources: https://github.com/ (BIAsia/c2d2c via npx), AgentDeskAI/browser-tools-mcp references

### claude-app-factory harness

- Decision: **save-to-library**
- Why: Long-running + spec-kit + EARS pattern useful reference; new OSS
- Expected benefit: Future orchestration template for multi-site or complex apps
- Acceptance test: N/A (library)
- Independent checker: N/A
- Rollback: N/A
- Human gate: N/A
- Sources: https://github.com/Tekdey/claude-app-factory

### Bulk unvetted skill packs / earningscalls MCP / pure persona generators

- Decision: **reject**
- Why: Context cost, injection surface, low vertical fit, or superseded by hypotheses
- Expected benefit: none material
- Acceptance test: N/A
- Independent checker: N/A
- Rollback: N/A
- Human gate: N/A
- Sources: not supplied

