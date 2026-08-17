---
note_type: capture
status: compiled
created: 2026-08-04
updated: 2026-08-04
observed_at: "2026-08-04T13:51:46.756Z"
source_type: grok_automation
automation: "Daily Marketing and Web-Build Frontier to Dillon OS"
run_title: "Daily marketing, agent workflow, MCP, plugin, and web-build frontier"
verification_status: partial
source_refs:
  - "https://www.aikido.dev/blog/keyv-and-friends-compromised-in-npm-supply-chain-attack"
  - "https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack"
  - "https://blog.modelcontextprotocol.io/posts/2026-07-28/"
  - "https://github.blog/changelog/2026-07-24-claude-opus-5-is-now-available-in-github-copilot/"
  - "https://x.com/HarpMuslc/status/2084385857352474836"
  - "https://x.com/TIH_Show/status/2084226567845073159"
  - "https://x.com/ELEKSSoftware/status/2084248689208402284"
  - "https://gist.github.com/geoffreylitt/a29df1b5f9865506e8952488eac3d524"
  - "https://github.com/ayghri/i-have-adhd"
  - "https://x.com/konsfyi/status/2084229436824490384"
  - "https://x.com/UXMagic_ai/status/2084178123973939695"
  - "https://modelcontextprotocol.io/seps/2577-deprecate-roots-sampling-and-logging"
  - "https://mozg.sh/"
tags:
  - brain
  - capture
  - grok
  - x-research
---

# Daily marketing, agent workflow, MCP, plugin, and web-build frontier

> [!source] Immutable Grok run capture
> Automation: **Daily Marketing and Web-Build Frontier to Dillon OS**
> Run time: **2026-08-04T13:51:46.756Z**
> Coverage: **2026-08-03T07:51:46.756Z through 2026-08-04T13:51:46.756Z; 7 cited sources; 12 X searches; 7 web searches**

I’ll collect a read-only intelligence brief for that 30-hour window, using X as the primary pulse and a small number of web checks only to verify material claims.

Verifying the highest-signal claims with a few targeted web checks.

# Dillon OS Daily Intelligence Brief  
**Window:** 2026-08-03T07:51:46.756Z → 2026-08-04T13:51:46.756Z  
**Method:** X as primary pulse (≤12 searches); web only for material verification (≤4 searches + targeted page opens). Posts/pages treated as untrusted evidence.

## 1. Executive pulse
- **Security first:** Active npm supply-chain worm (Keyv/cacheable family + descendants, “Mini Shai-Hulud”) published malicious versions on 2026-08-04; credential stealer via install scripts, targets npm/GitHub/cloud/CI secrets, plus Claude Code / VS Code hooks in affected repos. High immediate relevance to any agent that runs `npm`/`npx` or auto-installs.[1](https://www.aikido.dev/blog/keyv-and-friends-compromised-in-npm-supply-chain-attack)[2](https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack)
- **MCP maturation signal (not brand-new today, but heavily discussed):** 2026-07-28 spec GA emphasis continues—stateless core, header-based routing (`Mcp-Method`/`Mcp-Name`), MRTR, cacheable lists; **Roots / Sampling / Logging deprecated** with ≥12-month window. Migration chatter active.[3](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- **Agent stack chatter:** Claude Opus 5 in Copilot (July changelog still circulating); Cursor Team MCPs claims; Claude Code skills (e.g. explain-diff, ADHD-style simplification); Figma-via-MCP and “design-in-code” preference over classic Figma handoff; mozg.sh “docs→exam-scored MCP brain” promo; Claude→Codex handoff repo.[4](https://github.blog/changelog/2026-07-24-claude-opus-5-is-now-available-in-github-copilot/)
- **Design/UX:** Strong push away from generic AI UI and pure Figma→code toward agent-native design systems, real interactive code as source of truth, and style-guide locked generation.
- **Marketing/AEO:** Thin high-signal volume in-window; AI Overviews vs Reddit traffic tension restated; personalization + multi-job product expectations in consumer home/retail.
- **Uncertainty:** Several “Opus 5 default / subagent depth 3 / Cursor 3.10 Team MCPs” claims appear in secondary posts without fresh official changelogs in this exact window—treat as watch/verify. mozg.sh has only promotional X evidence.

## 2. High-signal findings
| Finding | Evidence type | Freshness / quality | Dillon relevance |
|--------|---------------|---------------------|------------------|
| Keyv/cacheable npm worm + IDE hooks | X + Wiz/Aikido | 2026-08-04 active | Critical for factory CI, previews, agent auto-runs |
| MCP 2026-07-28 deprecations + stateless | Official MCP blog | Spec ~1 week old; migration posts today | Any custom/community MCP in stack |
| Claude Opus 5 in GitHub Copilot | GitHub changelog | Jul 24; still referenced | Multi-model coding paths |
| Design-in-code / Figma MCP / cancel-Figma anecdotes | X practitioners | In-window | 25-site factory craft & handoff |
| Claude Code skills (explain-diff-html, i-have-adhd) | X + gists/GitHub | In-window | Review & planning loops |
| AI Overviews pressure on referral platforms | X commentary | In-window | AEO/content strategy |
| Consumer: post-COVID habits fading; multi-function + personalization | X + trade posts | In-window | Local-service positioning |

**Observed vs inference:** Worm and MCP deprecation = observed from primary/secondary security & official sources. “Install mozg.sh tomorrow” or “Opus 5 is default everywhere” = inference from incomplete posts; conflicting pricing/throughput anecdotes exist.

## 3. Consumer taste and demographic signals
- **Return-to-physical:** Anecdotal signal that COVID-era defaults (online-only shopping, streaming-only, delivery-only) are easing; more in-person again.[5](https://x.com/HarpMuslc/status/2084385857352474836)  
  *Inference for local-service buyers:* Site + GBP must emphasize easy visit, parking, same-day, “see it / meet us,” not only e-comm UX.
- **Home/housewares mindset (S/S 2026-27 index chatter):** Products expected to save time, reduce effort, maximize space, *and* signal responsible consumption in one purchase.[6](https://x.com/TIH_Show/status/2084226567845073159)  
  *Inference:* Service pages should bundle outcomes (“fast + tidy + low-hassle + trustworthy”) rather than feature lists.
- **Personalization gap:** ~71% expect personalized experiences; high frustration when missed (vendor whitepaper promo).[7](https://x.com/ELEKSSoftware/status/2084248689208402284)  
  *Inference:* Vertical templates need light personalization hooks (geo, service line, proof) without creepy overclaim.
- **Buying language / creator:** Limited clean demographic data in-window; strong builder discourse favors “real interactive” over polished mockups—mirrors client distaste for generic AI aesthetics.

**Uncertainty:** Retail/home signals are category-specific; local home-services transfer is plausible but not proven here.

## 4. Agent, MCP, skill, GitHub, and workflow opportunities
**Classify only (no install/connect):**

| Candidate | Source quality | Decision | Notes |
|-----------|----------------|----------|-------|
| **npm allowlist / freeze + Keyv audit gate** | Wiz, Aikido, THN | **sandbox-test** (process) | Highest ROI; worm hits agent-heavy envs |
| **MCP 2026-07-28 migration checklist** (drop Roots/Sampling/Logging; headers; discover) | Official MCP blog | **save-to-library** | 12-mo window; reduces future breakage |
| **Claude Code skills:** `explain-diff-html`, `i-have-adhd` | GitHub/gist + X | **sandbox-test** | Review/planning efficiency; low blast radius |
| **Figma MCP / design-in-code rules** | Practitioner X | **sandbox-test** | Factory visual consistency |
| **mozg.sh** (docs→scored MCP brain) | X promo only | **watch** | No independent maintainer/benchmark proof in run |
| **model-complier** (Claude plan → Codex implement) | GitHub link on X | **watch** | Handoff pattern interesting; verify license/sec |
| **Cursor Team MCPs / Copilot Opus 5 / agent skills+MCP GA** | Mixed changelog + secondary | **watch** | Copilot Opus 5 confirmed earlier; Team MCPs claim weaker |
| Crypto/phone-call/enterprise MCP promos | Vendor X | **reject** (for core) | Vertical noise, secret/permission risk |
| Random “1100+ servers” hype lists | Aggregator X | **reject** | Overlap + injection surface |

**Compatibility / risk lens (generic):** Prefer read-only or human-gated tools; no new secret-bearing MCPs; measure context tokens; require deterministic acceptance tests; assume prompt-injection via tool results.

## 5. Website factory, design, AEO, and retention implications
- **Factory / QA:** Treat every `npm install` in preview/CI as hostile until audited. Maker-checker should include dependency provenance + lockfile diff. Independent visual critique still needed—agents increasingly restricted on unrestricted Playwright crawling (anecdotal).  
- **Design systems:** Lock tokens + components in code; use agents against that SSOT. Figma becomes optional refinement, not handoff source. Avoid generic AI aesthetics via vertical real-image + constrained component sets.  
- **AEO/GEO:** Thin new tactics today; reinforce trust gates (source-ready FAQs, Maps-to-site parity, clear entity/NAP, third-visit content depth). AI Overviews continue to mediate discovery—structure for extractable answers + brand proof.  
- **Retention / third visit:** Personalization + multi-outcome messaging; local proof and easy re-contact paths for service buyers returning after quote shopping.  
- **Preview/Netlify:** Keep human approval gates; no auto-promote from agent branches while worm active.

## 6. Recommended experiments  
Ranked by expected benefit × evidence × inverse risk. **No production install, outreach, or purchase.**

1. **Dependency freeze & Keyv/Shai-Hulud audit gate (factory CI)**  
   - Benefit: Prevent credential loss / poisoned previews. Evidence: strong. Risk: low (process).  
   - **Acceptance test:** Clean lockfile scan finds zero listed malicious versions; install in sandbox with scripts disabled succeeds; with scripts enabled on known-bad version is blocked.  
   - **Independent checker:** Second agent or human reviews `npm ls` / lockfile against Wiz IOC list.  
   - **Rollback:** Revert lockfile; rebuild from known-good cache. Human gate: yes.

2. **Claude Code skill pack for review loops** (`explain-diff-html` + simplification skill)  
   - Benefit: Faster, more accurate code review & handoff notes. Evidence: medium. Risk: low.  
   - **Acceptance test:** On a fixed PR fixture, skill produces diff summary + quiz/checklist that a second model grades ≥4/5 factual; no secret leakage.  
   - **Checker:** Separate model without skill. Rollback: disable skill folder.

3. **Design-system-in-code + constrained generation rules (one vertical template)**  
   - Benefit: Less AI slop, faster consistent pages. Evidence: medium (practitioner). Risk: low-medium.  
   - **Acceptance test:** Generate 3 page variants; token/component compliance 100% by static check; Lighthouse a11y ≥95; visual diff vs baseline < threshold; human ranks “non-generic” ≥4/5.  
   - **Checker:** Independent visual critique agent + human. Rollback: template flag off.

4. **MCP deprecation inventory (read-only)**  
   - Benefit: Avoid dead features; plan stateless/header support. Evidence: high (official). Risk: low.  
   - **Acceptance test:** Inventory lists every installed MCP’s use of Roots/Sampling/Logging; migration notes attached; no runtime change.  
   - **Checker:** Second pass on repo. Rollback: N/A (doc only).

5. **AEO trust-gate checklist on one pilot site (FAQ + NAP + FAQ schema + third-visit block)**  
   - Benefit: Extractability + local trust. Evidence: medium/indirect. Risk: low.  
   - **Acceptance test:** Rich-result test pass; Maps-to-site field parity 100%; FAQ answers cite observable sources; no new claims.  
   - **Checker:** Separate SEO/AEO rubric agent. Rollback: revert content PR.

## 7. Watchlist and rejected hype
**Watchlist**
- mozg.sh and similar “auto-brain from docs” MCP products (need maintainer, scoring method, isolation model).  
- Claude↔Codex supervisory handoff patterns (`model-complier` and peers).  
- Cursor Team MCPs admin config claims; Copilot agent skills + MCP GA adoption metrics.  
- Figma AI full design-system fidelity improvements.  
- Further Shai-Hulud variants and IDE-hook payloads.  
- DeepSeek/other cheap coding model price war impact on factory unit economics (anecdotal).

**Rejected / no action**
- Viral “ultimate Claude Code resource bible” link dumps (duplicative, unaudited).  
- Crypto market-data MCPs, phone-dialer agent MCPs, random enterprise platform MCPs for core OS.  
- Unverified “Opus 5 default everywhere / subagent nesting depth 3” as install triggers without primary notes.  
- Any tool requiring broad secret access or unrestricted install scripts while worm is active.  
- Hype that bigger context alone beats stack-specific skills/brains.

---

### What Dillon OS should change today
(≤5 evidence-backed; process/knowledge only)

1. **Impose human-gated dependency policy:** freeze installs; scan for Keyv/cacheable malicious versions; prefer disabled lifecycle scripts in agent/CI sandboxes until clear.  
2. **Add MCP 2026-07-28 deprecation + header/stateless notes to internal runbooks** (no forced upgrades today).  
3. **Sandbox two Claude Code review skills** on non-prod diffs only.  
4. **Pilot one vertical template with code-owned tokens/components** and an independent visual checker (no Figma-required path).  
5. **Encode Maps-to-site parity + source-ready FAQ as hard AEO trust gates** on the next factory pilot (content PR only).

### No action
- Installing new MCP servers, mozg.sh, model-complier, or Team MCP admin features.  
- Production Copilot/Cursor model flips based on secondary posts.  
- Purchasing courses, books, or vendor “ecosystem maps.”  
- Posting, outreach, or client communication from this brief.  
- Weakening preview approval gates.

```json
candidates_json
[
  {
    "name": "Keyv/Shai-Hulud dependency audit and install freeze gate",
    "decision": "sandbox-test",
    "why": "Active 2026-08-04 npm worm steals CI/cloud/GitHub/AI secrets and plants Claude/VS Code hooks; factory agents routinely install packages.",
    "expected_benefit": "Prevent credential compromise and poisoned previews; protect 25-site pipeline integrity.",
    "source_urls": [
      "https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack",
      "https://www.aikido.dev/blog/keyv-and-friends-compromised-in-npm-supply-chain-attack"
    ],
    "acceptance_test": "Sandbox CI on fixture repo: lockfile/IOC scan reports zero malicious versions from published list; npm ci with ignore-scripts succeeds; attempt to resolve known-bad keyv@6.0.0 is blocked or fails closed; no network exfil artifacts in dry-run.",
    "independent_checker": "Second agent or human compares npm ls/lockfile against Wiz IOC CSV and confirms no lifecycle scripts executed.",
    "rollback": "Restore previous lockfile and known-good cache; rebuild containers from clean base.",
    "human_gate": true,
    "risk": "low",
    "overlap": "Extends existing CI/preview safety; may overlap simple npm audit but adds worm-specific IOCs and script policy."
  },
  {
    "name": "Claude Code review skills (explain-diff-html + simplification)",
    "decision": "sandbox-test",
    "why": "In-window practitioner reports skills fix over-verbose Opus output and turn diffs into quizzable explanations for better handoff.",
    "expected_benefit": "Faster, higher-signal code review and planner→implementer notes with lower context waste.",
    "source_urls": [
      "https://gist.github.com/geoffreylitt/a29df1b5f9865506e8952488eac3d524",
      "https://github.com/ayghri/i-have-adhd"
    ],
    "acceptance_test": "On fixed PR fixture, skill outputs (1) accurate diff summary, (2) quiz/checklist; second model scores factual accuracy ≥4/5 and no secrets from env/.env examples appear.",
    "independent_checker": "Model or human without the skill grades the same fixture outputs blind.",
    "rollback": "Remove or disable SKILL.md entries; revert to default review prompt.",
    "human_gate": true,
    "risk": "low",
    "overlap": "Partial overlap with built-in review; skills are prompt packs not new runtimes."
  },
  {
    "name": "Code-owned design tokens + constrained page generation (one vertical)",
    "decision": "sandbox-test",
    "why": "Practitioners report design-in-code and style-guide-locked generation beat Figma handoff for consistency and anti-slop.",
    "expected_benefit": "More distinctive, system-true sites with less manual cleanup in the factory.",
    "source_urls": [
      "https://x.com/konsfyi/status/2084229436824490384",
      "https://x.com/UXMagic_ai/status/2084178123973939695"
    ],
    "acceptance_test": "Generate 3 pages from vertical template: static check 100% token/component compliance; a11y score ≥95; visual regression vs golden < set threshold; blind human 'non-generic AI' rating ≥4/5.",
    "independent_checker": "Separate visual-critique agent + human rater not involved in generation.",
    "rollback": "Feature-flag off; fall back to prior template.",
    "human_gate": true,
    "risk": "medium",
    "overlap": "Overlaps existing component libraries; does not require new MCP if rules live in repo."
  },
  {
    "name": "MCP 2026-07-28 deprecation and capability inventory",
    "decision": "save-to-library",
    "why": "Official deprecation of Roots, Sampling, Logging with 12-month window; stateless/header changes affect scalable MCP use.",
    "expected_benefit": "Avoid building on dying APIs; prepare load-balanced MCP later without emergency rewrites.",
    "source_urls": [
      "https://blog.modelcontextprotocol.io/posts/2026-07-28/",
      "https://modelcontextprotocol.io/seps/2577-deprecate-roots-sampling-and-logging"
    ],
    "acceptance_test": "N/A for save-to-library — document completeness checklist: inventory template includes feature usage, transport, auth, and migration owner fields.",
    "independent_checker": "N/A",
    "rollback": "N/A",
    "human_gate": false,
    "risk": "low",
    "overlap": "Documentation only; no runtime overlap until migration experiments."
  },
  {
    "name": "mozg.sh docs-to-MCP brain",
    "decision": "watch",
    "why": "Promising stack-specific agent memory via MCP, but only promotional X evidence; unknown security, scoring validity, cost, and injection surface.",
    "expected_benefit": "Potentially better repo/stack grounding than raw context dumps.",
    "source_urls": [
      "https://mozg.sh/"
    ],
    "acceptance_test": "N/A until watch criteria met (open method, isolation model, independent benchmark).",
    "independent_checker": "N/A",
    "rollback": "N/A",
    "human_gate": true,
    "risk": "high",
    "overlap": "Overlaps existing docs RAG / MCP resource patterns."
  },
  {
    "name": "Vendor ecosystem MCP dumps and crypto/phone agent MCPs",
    "decision": "reject",
    "why": "Low signal, high permission and prompt-injection exposure, duplicated capability, weak relevance to web factory core.",
    "expected_benefit": "None material vs risk.",
    "source_urls": [],
    "acceptance_test": "N/A",
    "independent_checker": "N/A",
    "rollback": "N/A",
    "human_gate": true,
    "risk": "high",
    "overlap": "High overlap with browser/deploy/db MCPs already considered elsewhere."
  }
]
```

## Sources encountered

- https://www.aikido.dev/blog/keyv-and-friends-compromised-in-npm-supply-chain-attack
- https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack
- https://blog.modelcontextprotocol.io/posts/2026-07-28/
- https://github.blog/changelog/2026-07-24-claude-opus-5-is-now-available-in-github-copilot/
- https://x.com/HarpMuslc/status/2084385857352474836
- https://x.com/TIH_Show/status/2084226567845073159
- https://x.com/ELEKSSoftware/status/2084248689208402284

## Structured candidates

### Keyv/Shai-Hulud dependency audit and install freeze gate

- Decision: **sandbox-test**
- Why: Active 2026-08-04 npm worm steals CI/cloud/GitHub/AI secrets and plants Claude/VS Code hooks; factory agents routinely install packages.
- Expected benefit: Prevent credential compromise and poisoned previews; protect 25-site pipeline integrity.
- Acceptance test: Sandbox CI on fixture repo: lockfile/IOC scan reports zero malicious versions from published list; npm ci with ignore-scripts succeeds; attempt to resolve known-bad keyv@6.0.0 is blocked or fails closed; no network exfil artifacts in dry-run.
- Independent checker: Second agent or human compares npm ls/lockfile against Wiz IOC CSV and confirms no lifecycle scripts executed.
- Rollback: Restore previous lockfile and known-good cache; rebuild containers from clean base.
- Human gate: true
- Sources: https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack, https://www.aikido.dev/blog/keyv-and-friends-compromised-in-npm-supply-chain-attack

### Claude Code review skills (explain-diff-html + simplification)

- Decision: **sandbox-test**
- Why: In-window practitioner reports skills fix over-verbose Opus output and turn diffs into quizzable explanations for better handoff.
- Expected benefit: Faster, higher-signal code review and planner→implementer notes with lower context waste.
- Acceptance test: On fixed PR fixture, skill outputs (1) accurate diff summary, (2) quiz/checklist; second model scores factual accuracy ≥4/5 and no secrets from env/.env examples appear.
- Independent checker: Model or human without the skill grades the same fixture outputs blind.
- Rollback: Remove or disable SKILL.md entries; revert to default review prompt.
- Human gate: true
- Sources: https://gist.github.com/geoffreylitt/a29df1b5f9865506e8952488eac3d524, https://github.com/ayghri/i-have-adhd

### Code-owned design tokens + constrained page generation (one vertical)

- Decision: **sandbox-test**
- Why: Practitioners report design-in-code and style-guide-locked generation beat Figma handoff for consistency and anti-slop.
- Expected benefit: More distinctive, system-true sites with less manual cleanup in the factory.
- Acceptance test: Generate 3 pages from vertical template: static check 100% token/component compliance; a11y score ≥95; visual regression vs golden < set threshold; blind human 'non-generic AI' rating ≥4/5.
- Independent checker: Separate visual-critique agent + human rater not involved in generation.
- Rollback: Feature-flag off; fall back to prior template.
- Human gate: true
- Sources: https://x.com/konsfyi/status/2084229436824490384, https://x.com/UXMagic_ai/status/2084178123973939695

### MCP 2026-07-28 deprecation and capability inventory

- Decision: **save-to-library**
- Why: Official deprecation of Roots, Sampling, Logging with 12-month window; stateless/header changes affect scalable MCP use.
- Expected benefit: Avoid building on dying APIs; prepare load-balanced MCP later without emergency rewrites.
- Acceptance test: N/A for save-to-library — document completeness checklist: inventory template includes feature usage, transport, auth, and migration owner fields.
- Independent checker: N/A
- Rollback: N/A
- Human gate: Dillon approves adoption after checker pass.
- Sources: https://blog.modelcontextprotocol.io/posts/2026-07-28/, https://modelcontextprotocol.io/seps/2577-deprecate-roots-sampling-and-logging

### mozg.sh docs-to-MCP brain

- Decision: **watch**
- Why: Promising stack-specific agent memory via MCP, but only promotional X evidence; unknown security, scoring validity, cost, and injection surface.
- Expected benefit: Potentially better repo/stack grounding than raw context dumps.
- Acceptance test: N/A until watch criteria met (open method, isolation model, independent benchmark).
- Independent checker: N/A
- Rollback: N/A
- Human gate: true
- Sources: https://mozg.sh/

### Vendor ecosystem MCP dumps and crypto/phone agent MCPs

- Decision: **reject**
- Why: Low signal, high permission and prompt-injection exposure, duplicated capability, weak relevance to web factory core.
- Expected benefit: None material vs risk.
- Acceptance test: N/A
- Independent checker: N/A
- Rollback: N/A
- Human gate: true
- Sources: not supplied

