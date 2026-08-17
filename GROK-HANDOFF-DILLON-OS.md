# Grok handoff: Dillon OS

Snapshot: 2026-08-06 (America/New_York)  
Repository: `dillonmohr8777/dillon-os`  
Reviewed default branch: `main` at `d08faf3f60845038a67ad1a2c3e99544fb2857ef`

## What Dillon OS is now

Dillon OS is a public Git-backed Obsidian vault plus a local agentic operating system. It is not one conventional web application. The repository combines Dillon's working knowledge base, the canonical `12_Brain/` second-brain layer, a dependency-light Node HUD, automation and reporting CLIs, client and campaign workspaces, reusable skills, and several embedded web products.

The operating model is:

1. Git is the source of truth for agent-written public-safe state.
2. Obsidian is the human editing surface.
3. `12_Brain/` is the only canonical brain tree. Do not create `1Z_Brain/` or another parallel knowledge graph.
4. `_os/server.js` renders the local D.I.L.L.O.N. OS HUD at `http://127.0.0.1:4242` and reads the vault live.
5. `.claude/skills/` provides the command-deck actions.
6. Private or identifying content belongs under gitignored `12_Brain/private/`, not in this public repository.

Read `AGENTS.md`, `CLAUDE.md`, `12_Brain/INDEX.md`, and `12_Brain/System/Second Brain Ops.md` before changing structure or writing durable knowledge.

## Major modules and current status

| Area | Purpose | Current status |
| --- | --- | --- |
| `12_Brain/` | Canonical entities, concepts, projects, decisions, research, reviews, memory, ops, maps, and Bases | Shipped on `main`; structural and public-safety tests exist. Treat as authoritative. |
| `_os/` | Node HUD, automation CLIs, reporting, tests, and local system services | HUD is dependency-light and loopback-only. Command Deck additionally requires the `claude` CLI on `PATH`. |
| `.claude/skills/` | Vault-native daily and brain skills | Loaded dynamically by the HUD. Prefer extending existing skills over creating duplicate orchestration systems. |
| `00_Inbox` through `11_Agents` | Working notes, clients, campaigns, content, SOPs, offers, prospects, sessions, and agent definitions | Working layer, not a competing brain. Link into `12_Brain`; do not duplicate canonical entities. |
| `immohrtal-site/` | React 19, Vite 6, TypeScript, Tailwind, WebGL artist site | Buildable product; production forms require the hosted Netlify backend. Use `?forcegl` in software-rendered test environments. |
| `01_Clients/Shadow HVAC/website/` | Next.js 15 static-export HVAC site | Buildable embedded site. Its lint script is interactive because no ESLint config is committed. |
| `mohr-media-site/` | Static HTML/JS/WebGL portfolio site | Dependency-light static product. |
| `philly-sites/` | Weekly 25-site outreach gallery/factory output | Main contains the shipped batch. Preserve site identity checks, first-party logo provenance, `noindex,nofollow`, and maker-checker QA. |
| `_os/reporting/` | Client-report CLI | Writes report HTML into `Daily-Briefs/reports/`. Keep client data and attribution definitions separated. |
| `.mcp.json` / LandingFolio | Optional design-reference MCP | Requires `LANDINGFOLIO_TOKEN`; no token is stored in Git. It remains sandbox-only until the Inspector verification command passes. |

## GitHub backlog truth

The prompt's “76 open issues” is a labeling error. Live GitHub state on 2026-08-06 is **0 open issues and 76 open pull requests**. Seventy-four are drafts; PRs `#205` and `#208` are the only non-drafts. Many old PRs are duplicate daily-orchestrator runs and should not be merged one by one.

### Urgent: decide or close first

- `#205` secure Vercel AI model gateway: non-draft, security-sensitive, and should receive a focused authentication/billing/deployment review before merge.
- `#208` Cursor access to the private Marketing Chief dashboard source: non-draft and permission-sensitive. Confirm the present access model before merge.
- `#240`, `#245`, and `#247`: merge state is dirty and the work affects vault lint, browser control, or Semrush integration. Rebase only if the capability is still wanted.
- `#214`: unstable checks on the Align animated intro.
- Automation duplicates (`#171`, `#173`, `#175`, `#179`, `#180`, `#183`-`#185`, `#187`-`#188`, `#191`, `#196`, `#201`, `#206`, `#211`-`#212`, `#215`, `#220`, `#223`, `#230`, `#244`, `#253`-`#255`, `#259`-`#260`): choose the newest validated umbrella implementation, preserve any unique evidence, then close the superseded runs.

### High-value current work

- `#260`: newest competitive-task orchestrator consolidation.
- `#252`: Marketing Chief week operations, EOM board, automations, and HUD tunnel.
- `#251`: client-scoped Grok marketing intelligence pipeline.
- `#250`: authenticated webhook gateway.
- `#249` and `#248`: newest Align Customer Agent document/question-set work.
- `#246` and `#243`: Align reporting and Netlify handoff.
- `#242`: 25 distinct Philly batch-2 homepage systems.
- `#258` and `#176`: current BOK social/PDF production branches.
- `#257`: Ironic Ineptocracy design-language rebuild.
- `#256`: Need Momentum signal-field v2.

### Older product/content work

PRs `#174`-`#239` contain valuable Align videos, customer-agent packages, Hope Wellness creative, Momentum/Need Momentum pages, Pro Fence & Deck research, the PAPERBOUND prototype, reporting systems, and client audits. They are not all additive. Review by deliverable family, keep only the newest verified artifact, and close superseded drafts.

## Known debt and broken or incomplete flows

- The open-PR queue is the largest operational debt. Do not add another daily umbrella PR until the duplicate queue is collapsed.
- The LandingFolio MCP is optional and sandbox-only until its deterministic Inspector check passes.
- Obsidian Sync equivalence with the Git tree is a human/operator gate after merge. Never assume a Git push proves desktop-vault sync.
- The HUD works without Claude, but its skill buttons do not.
- IMMOHRTAL local form submission does not persist without the hosted Netlify backend.
- Shadow's `next lint` path is not safe for unattended execution until an ESLint configuration is committed.
- This public repo must pass its identifying-data/credential-shape scan before any vault material is pushed.

## Local-only state that is not represented by `main`

The persistent clone at `C:\Users\dillo\repos\dillon-os` is on `cursor-mobile-sync-2026-07-12`, not `main`, and currently reports 623 working-tree entries (434 untracked). It contains later brain, automation, client-overlay, daily-capture, and report-ingest material mixed with deletions from the old branch. It was intentionally **not bulk-pushed into this public repository** because that would mix stale branch deletions with potentially identifying client/intake data.

Treat that worktree as a recovery source, not as merge-ready state. Grok's safe procedure is to inventory it against current `origin/main`, extract only public-safe and still-unique changes into a new branch, run the public-safety tests, and open a narrow PR. Do not run `git add -A` there.

## Enforced stack and conventions

- Node 18+ for the HUD and automation.
- React + TypeScript for embedded apps; existing framework wins.
- Next.js for the Shadow site; Vite for IMMOHRTAL.
- Tailwind and accessible semantic HTML; purposeful motion only.
- Framer Motion/Three.js where already present; reduced-motion and non-WebGL fallbacks are required.
- Static HTML/CSS/JS is preferred where a dependency-light Netlify artifact is sufficient.
- Keep content/data in structured objects and preserve client identity boundaries.
- Never commit tokens, cookies, raw communications, private paths, or direct identifiers to this public repo.

## Environment and verification

No secrets are required for the base HUD. Optional environment/runtime details:

- `OS_PORT` and `OS_HOST` override `127.0.0.1:4242`.
- `LANDINGFOLIO_TOKEN` enables the optional design-reference MCP.
- `claude` on `PATH` enables Command Deck skill buttons.
- Hosted Netlify configuration is required for IMMOHRTAL form persistence.

Minimum deterministic check:

```powershell
node --test _os/test/brain-hud.test.js _os/test/public-safety.test.js
```

For an embedded site, also run its production build and inspect desktop/mobile, keyboard focus, reduced motion, overflow, asset loading, and the browser console.

## Grok: next 48 hours

1. Triage all 76 PRs into `merge candidate`, `superseded`, `blocked`, or `archive`; start with `#205`, `#208`, `#240`, `#245`, `#247`, and `#214`.
2. Select one canonical competitive-task orchestrator (begin with `#260`), harvest unique evidence from older runs, and close the duplicates.
3. Review `#251` as Grok's native operating lane. Keep it client-scoped, redacted, and subordinate to the canonical Client Operations queue.
4. Run the Dillon OS deterministic tests on `main`, then validate the HUD at `127.0.0.1:4242`.
5. Reconcile the local-only persistent worktree through narrow public-safe PRs; never bulk-publish the mixed 623-entry worktree.
6. Review current website/product candidates by family (`#242`, `#256`, `#257`, `#246`, `#243`) and preserve only the latest verified implementation for each.

Completion means fewer open PRs, one canonical orchestrator, a green public-safety gate, a verified HUD, and no private client material added to this public repository.
