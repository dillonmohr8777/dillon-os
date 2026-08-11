---
tags: [raw, research, skill-scout]
captured: 2026-08-10
method: "background research agent (Claude Fable 5), 19 web queries/fetches, GitHub pages verified directly 2026-08-10"
---

# Raw capture — skills ecosystem sweep (2026-08-10)

Full receipts from the first `/skill-scout`-style sweep, run during the
Intelligence Plane build session. Compiled into
[[12_Brain/System/Skill Registry]]. Untouched after capture.

---

## PART 1 — ECOSYSTEM TABLE

### Tier 1: Official (Anthropic)

| Collection | URL | Contains | Scale | Stars | Activity | Install | Quality | License |
|---|---|---|---|---|---|---|---|---|
| **anthropics/skills** | github.com/anthropics/skills | Skills only: document-skills (pdf/docx/pptx/xlsx), example skills (skill-creator, mcp-builder, webapp-testing, canvas-design, brand-guidelines), spec + template | ~30 skills, 4 categories | 167.5k ★, 20.0k forks | Active (310 open issues, 761 PRs) | `/plugin marketplace add anthropics/skills` → `/plugin install document-skills@anthropic-agent-skills` | Highly curated; the canonical reference | Apache-2.0 (doc skills source-available) |
| **anthropics/claude-plugins-official** | github.com/anthropics/claude-plugins-official | Full plugins (skills + agents + commands + MCP config) | 55+ Anthropic-maintained plugins (incl. marketing, design, operations, engineering, productivity) | 33.4k ★, 3.8k forks | Very active (3,083 commits) | Auto-added on first run; `/plugin install {name}@claude-plugins-official` | Curated; "Anthropic Verified" badge tier | Apache-2.0 (per-plugin varies) |
| **anthropics/claude-plugins-community** | github.com/anthropics/claude-plugins-community | Community plugins passing automated safety screening | 70+ plugins | not found | Active; submit via clau.de/plugin-directory-submission | `/plugin` > Discover | Screened but "may install unverified third-party software" | varies |

Directory shipped May 22, 2026; Anthropic added enterprise skill/plugin security scanning in August 2026.

### Tier 2: Mega-frameworks (the 2026 giants)

| Collection | URL | Contains | Scale | Stars | Activity | Install | Quality | License |
|---|---|---|---|---|---|---|---|---|
| **obra/superpowers** | github.com/obra/superpowers | Skills + hooks (methodology: brainstorm → plan → TDD → review) | ~20 core skills | 270.2k ★, 24.2k forks | Very active (v5.0.x Mar–May 2026) | `/plugin marketplace add obra/superpowers-marketplace` → `/plugin install superpowers@superpowers-marketplace` | Extremely curated — opinionated discipline layer | MIT |
| **affaan-m/everything-claude-code (ECC)** | github.com/affaan-m/everything-claude-code | Agents + skills + commands + hooks + memory | 67 agents, 285 skills, 94 commands; Continuous Learning v2, AgentShield (102 security rules), Unified Memory Vault | 239k ★, 36.3k forks | Very active (2,372 commits, v2.1) | `npx ecc-universal setup` or native plugin | Production-grade but sprawling — cherry-pick | MIT |
| **wshobson/agents** | github.com/wshobson/agents | Plugin marketplace: agents + skills + commands + orchestrators | 94 plugins, 203 agents, 175 skills, 109 commands, 16 orchestrators | 38.7k ★, 4.1k forks | Active (530 commits) | `/plugin marketplace add wshobson/agents` | Curated, composable | MIT |
| **ruvnet/ruflo** (ex-claude-flow) | github.com/ruvnet/ruflo | Multi-agent swarm orchestrator (hive-mind queen/worker, 87 MCP tools) | 250k+ LOC platform | ~64.4k ★ | v3.5 stable Feb 27, 2026 | npm (`claude-flow` package name retained) | Powerful but heavyweight; complexity tax | not found |

Multi-harness note: superpowers, ECC, and wshobson/agents all ship to Codex CLI, Cursor, Gemini CLI, Copilot, OpenCode from one markdown source.

### Tier 3: Curated lists & template hubs

| Collection | URL | Contains | Scale | Stars | Install | Quality |
|---|---|---|---|---|---|---|
| **hesreallyhim/awesome-claude-code** | github.com/hesreallyhim/awesome-claude-code | Link list: skills, workflows, tooling, plugins, statuslines | Hundreds of links | 52.1k ★, 4.5k forks; submissions active thru Aug 2026 | n/a (directory) | Hand-picked, validation pipeline |
| **davila7/claude-code-templates** (aitmpl.com) | github.com/davila7/claude-code-templates | Agents, commands, settings, hooks, MCPs, skills + analytics | 1,000+ components | 30.2k ★, 3.4k forks | `npx claude-code-templates@latest` | Sprawl — huge and variable |
| **VoltAgent/awesome-claude-code-subagents** | github.com/VoltAgent/awesome-claude-code-subagents | Subagents only | 154+ agents, 10 categories | 24.2k ★, 2.8k forks | marketplace or copy `.md` | Broad, explicit "we do not audit" |

### Tier 4: Registries & directories

| Registry | URL | What | Scale | Review gate? |
|---|---|---|---|---|
| **skills.sh** (vercel-labs/skills) | skills.sh | Vercel's open registry, "npm for agent skills," launched Jan 20, 2026; 20+ agents | ~669,670 skills listed (Jun 2026); top skill 2.0M installs | **None** — treat untrusted-by-default (Snyk scanned it) |
| **skillsmp.com** | skillsmp.com | Searchable GitHub skill index | ~30k–"900k+" (conflicting reports) | No |
| **claudemarketplaces.com** | claudemarketplaces.com | Aggregator | claims 23,600+ skills (self-reported) | No |
| **ClawHub** | (OpenClaw registry) | Skill registry for OpenClaw | site of the ClawHavoc malware campaign | **Do not install from here** |

### Tier 5: Marketing-vertical collections (2026 wave)

| Collection | URL | Contains | Stars |
|---|---|---|---|
| **coreyhaines31/marketingskills** | github.com/coreyhaines31/marketingskills | 65 marketing skills (CRO, copy, SEO, ads, analytics, pricing, revops) | 43.8k ★, MIT |
| **AgriciDaniel/claude-ads** | github.com/AgriciDaniel/claude-ads | Ad audits: 190–250+ checks across 12 platforms; JSON→MD/HTML/PDF reports; draft-only changes by default | 7.9k ★, MIT |
| AgriciDaniel/claude-seo, /claude-blog, /claude-obsidian | github.com/AgriciDaniel/… | 25 SEO sub-skills; 30 blog sub-skills; 15 PKM skills | not found |
| OpenClaudia/openclaudia-skills | github.com/OpenClaudia/openclaudia-skills | 34 open-source marketing skills | not found |
| zubair-trabzada/ai-marketing-claude | github.com/zubair-trabzada/ai-marketing-claude | 15 skills + subagents; client PDF reports | not found |
| cognyai/claude-code-marketing-skills | github.com/cognyai/claude-code-marketing-skills | SEO/ads skills; free tier + $9/mo live Search Console/Bing/LinkedIn data | not found |
| Also | thatrebeccarae/claude-marketing · TheCraigHewitt/seomachine · aaron-he-zhu/seo-geo-claude-skills · indranilbanerjee/digital-marketing-pro (118+ commands/25 agents) · BrianRWagner (24 B2B skills) · cohnen/mcp-google-ads | — | not found |

### PKM / memory / meta highlights (from awesome-claude-code in-browser pass, same day)

- **eugeniughelbur/obsidian-second-brain** — 4.0k★, 46 commands, hybrid semantic search, self-rewriting notes, scheduled vault-maintenance agents; supports Claude Code AND Codex CLI (+5 more)
- **Hivemind** (activeloopai) — turns agent traces into reusable skills across agents
- **roampal-core** — outcome-based persistent memory: good advice promoted, bad demoted
- **Callimachus** — one searchable index across Claude Code / Codex / Cursor / Gemini history
- **llm-router** (Yali Pollak) — local-first router under Claude Code + Codex/Gemini, cheapest-capable-model dispatch, RouterArena placement, 1,900+ tests
- **haddock-development/claude-reflect-system** — 210★, `/reflect` corrections-miner, "correct once, never again"
- **SkillSpector** (NVIDIA) — security scanner for agent skills; **Schliff** — deterministic SKILL.md quality scorer; **agnix** — linter/LSP for CLAUDE.md/AGENTS.md/SKILL.md

## PART 3 — SECURITY & HYGIENE (2026 state)

Known incidents (all 2026):
- **ClawHavoc** (Feb 2026): 341 malicious skills found on ClawHub first wave; OWASP later counted **1,184 confirmed malicious skills**. Attackers pivoted to skill-page comments after SKILL.md scanning improved.
- **Snyk ToxicSkills** (Feb 5, 2026): scanned 3,984 skills on ClawHub + skills.sh — **36.82% had ≥1 security flaw, 13.4% critical, 76 confirmed malicious payloads, 91% of malicious skills used prompt injection**. Techniques: password-protected archive downloads, base64/Unicode-obfuscated exfil, instructions telling the agent to disable its own safety.
- **Cato Networks** (2026): weaponized Claude skill delivering MedusaLocker ransomware.
- **SentinelOne** (Jan 2026): malicious marketplace plugin silently redirecting dependency installs to attacker-controlled sources.
- **Reversec "Skill Issues"** (May 2026): practical compromise walkthroughs via malicious skills/agents.
- Standards response: OWASP **Agentic Skills Top 10** (v1.0 targeted Q4 2026): AST01 malicious registry skills, AST02 supply chain, AST03 over-privilege, AST05 untrusted external instructions, AST07 update drift. Anthropic: automated screening + Verified badge (May 2026), enterprise scanning (Aug 2026).

Security tooling: Snyk **mcp-scan** (skills mode, the ToxicSkills engine) · Anthropic **security-guidance** plugin (free, ~May 2026, flags 25 vulnerable patterns) · **AgentShield** (inside ECC — audits the whole `.claude/` surface, 102 rules) · **vet-skill** workflow gist (eva-mishor).

## SOURCES (accessed 2026-08-10)

Direct GitHub verification: anthropics/skills · anthropics/claude-plugins-official · obra/superpowers · wshobson/agents · hesreallyhim/awesome-claude-code · davila7/claude-code-templates · VoltAgent/awesome-claude-code-subagents · affaan-m/everything-claude-code · coreyhaines31/marketingskills · AgriciDaniel/claude-ads · eugeniughelbur/obsidian-second-brain · haddock-development/claude-reflect-system

2026-dated articles: Snyk ToxicSkills (snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/, Feb 5 2026) · OWASP Agentic Skills Top 10 (owasp.org/www-project-agentic-skills-top-10/) · ClawHavoc analysis (agensi.io, 2026) · Cato Networks MedusaLocker (catonetworks.com, 2026) · Reversec Skill Issues (labs.reversec.com, May 2026) · Composio Top 29 Marketing Skills (composio.dev, May 28 2026) · Vercel skills.sh launch (vercel.com/changelog, Jan 20 2026) · Anthropic security-guidance coverage (helpnetsecurity.com, May 27 2026) · Ruflo v3.5 rebrand (dev.to, Feb 2026) · vet-skill gist (gist.github.com/eva-mishor/839810fe18d1e8e66cf4a9496ea307e8)

Caveats: superpowers/ECC star counts from live GitHub pages; registry scale claims (skills.sh ~670k, skillsmp "900k+") are self-reported/article-reported and conflict — indicative, not exact.
