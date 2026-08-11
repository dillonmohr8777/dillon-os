---
tags: [system, intelligence, registry]
source: "[[12_Brain/raw/research/2026-08-10 - skill-scout - ecosystem sweep]]"
canonical: 12_Brain
updated: 2026-08-10
expires: 2026-09-10
---

# Skill Registry

**Summary:** every skill this OS runs, wants, or rejected — with provenance,
vet results, and the standing rules that keep malware out. Maintained by
`/skill-scout`; nothing installs without Dillon's yes.

## Installed — vault skills (`.claude/skills/`)

| Skill | Lane | Provenance |
|---|---|---|
| am-report, client-pulse, client-report, content-scan, inbox-brief, metrics-pull, plan-today, research-sweep, session-mine, synthesize, vault-clean, vault-compile, week-review, wiki-lint | daily ops + brain | built in-house (Jul 2026) |
| automation-ops, frontend-build, mirror-and-improve, motion-design, site-batch, site-factory, site-grade, slack-intake, ui-design, ux-audit | outreach engine + build lanes | built in-house (Jul–Aug 2026) |
| model-scout, skill-scout, stack-sync | intelligence plane | built in-house 2026-08-10 |

## Decision queue — vetted candidates awaiting Dillon's yes

Top of the ecosystem, screened for fit; **stage → vet → install** per the
protocol below. Full receipts in the source capture.

| Candidate | Why | Install | Risk note |
|---|---|---|---|
| **claude-ads** (AgriciDaniel, 7.9k★, MIT — **already forked to dillonmohr8777/claude-ads**) | 250+ audit checks across 12 ad platforms, draft-only changes, client-ready reports — plugs into the recurring client ad-audit lane | install from the fork (pin SHA) | vet scripts before first run; no ad-account credentials in the trial session |
| **superpowers** (obra, 270k★, MIT) | the discipline layer (brainstorm→plan→TDD→review) + canonical skill-writing method; ships to Codex CLI too — one methodology across both harnesses | `/plugin marketplace add obra/superpowers-marketplace` | most-audited repo in the ecosystem; still read hooks |
| **security-guidance** (Anthropic official, free) | flags 25 vulnerable patterns in real time; baseline immune system | `/plugin install` from claude-plugins-official | none known |
| **mcp-scan** (Snyk, skills mode) | the ToxicSkills scanner — becomes the automated step in `/skill-scout` vetting; complements `_os/automation/bin/mcp-gate.js` | per Snyk docs | none known |
| **obsidian-second-brain** (eugeniughelbur, 4.0k★) | 46 vault commands, semantic search, scheduled maintenance agents; native Claude Code + Codex support | marketplace / build script | overlaps existing brain loops — trial in a vault copy first |
| **claude-seo** (AgriciDaniel) | 25 SEO sub-skills incl. GEO module | `/plugin marketplace add AgriciDaniel/claude-seo` | same vet as claude-ads |
| **ECC cherry-picks** (affaan-m, 239k★, MIT) | `continuous-learning` v2 (session mining → instincts w/ confidence scores) + `AgentShield` (102-rule `.claude/` audit) | select pieces only | sprawling repo — cherry-pick, never bulk-install 285 skills |
| **Deep-Research-skills** (Weizhena) | two-phase research with human approval gates — matches draft-first rules exactly | see repo | small project; read fully |
| **email-marketing-bible** (CosmoBlk) | lifecycle/welcome/nurture frameworks — book-launch list + client email lanes | see repo | content-only skill, low risk |

## Watchlist

- **wshobson/agents** (38.7k★) — 16 orchestrators, composable; raw material for porting [[12_Brain/entities/King Agent OS|King Agent OS]] patterns
- **llm-router** — local cheapest-capable-model router under Claude Code + Codex; the automated endgame for the Model Roster (adopt only after a security read — it sits in the request path)
- **Hivemind** (activeloopai) — traces → reusable skills; measured caveat: +23% tokens on short documented tasks
- **roampal-core** — outcome-based memory (good advice promoted, bad demoted)
- **Callimachus** — one searchable index across Claude Code + Codex + Cursor session history
- **claude-reflect-system** (210★) — `/reflect` corrections-miner
- **mcp-google-ads** (cohnen) — live Google Ads data into audits; pairs with claude-ads
- **ruflo** (64k★) — swarm orchestrator; WATCH only, 250k-LOC complexity tax
- **SkillSpector** (NVIDIA) / **Schliff** / **agnix** — scanner, SKILL.md quality scorer, config linter — candidates for the vet toolchain

## Rejected / banned

- **ClawHub registry** — site of the ClawHavoc campaign (1,184 confirmed malicious skills, OWASP count). Standing ban.
- **Unvetted mega-registries as install sources** (skills.sh ~670k listings, skillsmp, claudemarketplaces) — Snyk found 36.8% of scanned skills flawed, 13.4% critical. Use for *discovery only*; install from the source repo after vetting.

## Standing rules (the immune system)

1. Tier your sources: Anthropic official/Verified > big curated repos you've read > unreviewed registries = untrusted by default.
2. Read every file before install; red flags per `/skill-scout` §4 (obfuscated blobs, `curl | bash`, unexplained network calls, credential reads, instruction-injection, permission-bypass flags anywhere).
3. Scan on install AND on every update — update drift (OWASP AST07) means a clean install can turn malicious on `git pull`. Pin commit SHAs or fork-and-freeze (the claude-ads fork is the model).
4. Sandbox the first run: throwaway session, no client credentials mounted.
5. This registry is the inventory: source URL, pinned SHA, license, vet date, result. Quarterly re-audit.
6. **Fewer, better** (Vercel eval, Jan 2026: 56% of installed skills never fire; big libraries can score below baseline). Every install must beat the cost of its context weight; prune before adding. See [[12_Brain/concepts/Agent Stack Patterns|Agent Stack Patterns]] §4.

## Links

[[12_Brain/System/Intelligence Ops|Intelligence Ops]] · [[12_Brain/System/Model Roster|Model Roster]] · [[12_Brain/System/Upgrade Log|Upgrade Log]] · [[12_Brain/concepts/Research Verification Loop|Research Verification Loop]]
