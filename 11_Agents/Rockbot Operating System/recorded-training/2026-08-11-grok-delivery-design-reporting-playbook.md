# Grok delivery, design, reporting, and communication playbook

Status: redacted cross-agent teaching packet
Prepared: 2026-08-11
Owner: Dillon Mohr
Primary orchestrator: Codex acting as Marketing Chief
Specialist: Grok Research Scout

## Purpose

This packet teaches the repeatable way Dillon's stack turns an ambiguous request
into a useful, verified deliverable. It expands the operating brief; it does not
replace the authority hierarchy or grant autonomous external-action authority.

Grok may inspect task-relevant repositories, skills, artifacts, and redacted
workflow context. Codex/Marketing Chief still owns exact routing, canonical queue
writes, final verification, and the user-facing completion claim.

## The deliverable contract

When Dillon asks for a result, build the result. A research summary is not a
substitute for a requested page, report, draft, dashboard, plan, design,
implementation, or tested artifact.

Before starting, resolve:

1. the exact client, brand, account, project, repository, branch, environment,
   owner, and audience;
2. the requested artifact and its required format, location, and finish line;
3. the current source of truth and how fresh it is;
4. what may be changed, what must remain untouched, and what needs approval;
5. the validation that would prove the artifact works; and
6. the one live outcome that would prove an authorized external action landed.

Every handoff distinguishes `complete`, `partial`, `blocked`, `drafted`,
`staged`, `deployed`, and `sent`. Never collapse those states into "done."

## Repository workflow

### 1. Route to one canonical repository

- Refresh the project index when discovery matters.
- Resolve a named client through
  `client-operations/registry/clients.json` before touching client work.
- Prefer canonical roots under `C:\Users\dillo\Documents\Codex\projects` and
  `C:\Users\dillo\repos` over dated clones, historical worktrees, or exports.
- Read the nearest `AGENTS.md` completely and follow more-specific project rules.
- Inspect the current branch, remote, status, and recent history before deciding
  what is current.
- Preserve dirty worktrees and unrelated changes. Never discard, reset, or
  overwrite work merely to make the task easier.

### 2. Bound the change

- Search with `rg` and open the smallest relevant set of files.
- Follow source links and existing conventions before adding abstractions or
  dependencies.
- Treat generated bundles, `node_modules`, build output, caches, secrets, and
  raw communications as out of context unless the task specifically requires a
  safe inspection.
- Use a dedicated worktree or branch for material implementation when the
  canonical checkout is busy or dirty.
- Do not commit, push, open or merge a pull request, publish, or deploy unless
  that action is in scope and authorized. A local implementation can still be
  complete as an artifact while external delivery remains pending.

### 3. Implement the full requested outcome

- Preserve the existing architecture and project conventions when they work.
- Prefer the smallest coherent change that fully satisfies the ask.
- Do not silently change product facts, client claims, brand identity, analytics
  meaning, security boundaries, or public behavior.
- Add tests or deterministic verification at the level of risk introduced.
- Keep logs, fixtures, screenshots, and examples free of secrets and unnecessary
  personal data.

### 4. Verify before claiming completion

- Run the project's formatter, type checker, focused tests, broader tests when
  proportionate, and production build.
- Inspect the actual changed behavior, not only command exit codes.
- For UI, inspect desktop and mobile together; check keyboard, focus, reduced
  motion, overflow, loading and error states, assets, analytics, and console
  output.
- For services and automations, reconcile persisted state, exact inputs and
  outputs, checkpoints, retries, idempotency, and live readback.
- Use a fresh checker for material work. The checker attempts to falsify the
  result rather than endorse the maker's story.
- A healthy loopback, task start, configuration file, or successful local test
  is not production proof.

## Website and app design workflow

Impeccable v4.0.4 is the current project-precedence design workflow. Use it as a
context and enforcement system, not as a house aesthetic.

### 1. Name the surface and mode

Choose the mode from the surface's actual job:

- `Persuade`: landing pages, marketing, campaigns, and pricing; earn attention
  and action.
- `Operate`: apps, dashboards, editors, settings, and tools; help the user
  complete a task.
- `Read`: documentation, articles, guides, and help; optimize comprehension and
  wayfinding.
- `Experience`: portfolios, galleries, and showcases; let the work lead.

Do not apply marketing-page expression to operational task UI, or task-UI
restraint to a persuasion or experience surface.

### 2. Load real product and visual authority

- Run `Test-ImpeccableDesignSystem.ps1 -ProjectPath <project-root> -Json` at the
  start of substantive UI work.
- Run the installed Impeccable `context.mjs` once from the exact project, with
  `--target <path>` when a route or file is named.
- Read `PRODUCT.md`, `DESIGN.md`, the matching surface brief, and at least one
  real source of visual truth: tokens, theme, global CSS, representative
  component, page, or approved asset.
- Read the one Impeccable command playbook that owns the request. Load the craft
  floor immediately before editing UI.
- A missing `DESIGN.md` does not make an established codebase greenfield. If a
  coherent visual language exists, document and preserve it.
- For brand-new work, capture product truth before inventing visuals. Do not
  fabricate a mature design system for an empty scaffold.

### 3. Decide preserve, expand, or replace

- A narrow refinement preserves incumbent identity, content, behavior, and
  everything outside scope.
- A new surface inside an established world inherits that world.
- A redesign preserves product truth, content, function, constraints, and
  explicit brand commitments while replacing the discarded visual world.
- Verified client identity and approved references outrank generic taste.
- Name a product-native thesis and commit it through palette, type, materials,
  imagery, layout grammar, components, motion, and responsive behavior.
- Reject category defaults and obvious AI scaffolds. The result should be
  recognizably for this product and audience, not a generic template.

### 4. Build production reality

- Use the existing stack and components first. For greenfield premium web work,
  prefer Next.js/React/TypeScript, Tailwind, accessible shadcn/ui primitives,
  and purposeful Framer Motion when those choices fit.
- Use semantic HTML and accessible primitives before custom interaction code.
- Use real verified assets and representative content. Never replace needed
  photography, product imagery, or proof with decorative gradients or empty
  cards.
- Keep factual and commercial claims sourced. Synthetic demonstration data must
  be labeled where a viewer could mistake it for real data.
- Motion must explain state or narrative, leave content visible by default, and
  provide a complete reduced-motion alternative.
- Preserve the project's tokens. New fonts, colors, radii, or type scales must
  be an intentional system decision or a narrow documented exception.

### 5. Apply the craft floor

- Establish hierarchy, composition, typography, contrast, and reading order
  before animation.
- Body text contrast is at least 4.5:1; large text is at least 3:1.
- Keep body copy readable, headings balanced, and layout rhythm intentional.
- Avoid reflexive card grids, nested cards, excessive pills, decorative
  dashboards, generic AI gradients, gradient text, default glassmorphism,
  colored side stripes, arbitrary z-index values, and oversized corner radii.
- Do not reconstruct client logos or generate client creative without a verified
  logo and at least one approved client/product/style reference.
- Build a memorable first viewport that demonstrates what only this product can
  prove and makes the primary action legible.

### 6. Finish in bounded passes

1. Build the full coherent surface.
2. Inspect desktop and mobile in one bounded screenshot pass.
3. Batch-fix all material findings.
4. Use at most one confirmation pass.
5. Run the manual detector on changed UI targets on Windows:
   `npx impeccable detect --json <changed-targets>`.
6. Treat detector exit code `2` as a completion blocker until findings are fixed
   or a narrow exception is documented.
7. Hand screenshots and the direction contract to an independent finish
   reviewer for material work.
8. Record durable visual decisions in `DESIGN.md` and its generated sidecar when
   the shipped system changed.

Do not burn time and money in open-ended polish loops. Two visual inspection
rounds are the normal ceiling; material unresolved findings remain explicit.

## Skill routing

Skills are task-specific instruction packages, not decorative context.

1. Identify the smallest set of installed skills that directly owns the ask.
2. Read each selected `SKILL.md` completely before acting.
3. Resolve linked references relative to that skill and read only those required
   by its routing instructions.
4. Prefer provided scripts, templates, and assets over retyping or recreating.
5. Follow project-specific rules and Dillon's current request over a generic
   skill default.
6. Do not load hundreds of skills or dump the entire skill tree into context.
7. Tell Marketing Chief which skills materially influenced the work.

High-frequency routes include:

- `impeccable` for UI, web, dashboard, app, landing-page, and design-system work;
- `a11y-audit` for accessibility verification;
- `browser-automation` for bounded UI testing and authenticated workflows;
- `code-reviewer`, `api-design-reviewer`, `dependency-auditor`, and `coverage`
  for engineering checks;
- `git-worktree-manager` for isolated implementation;
- `analytics`, `analytics-tracking`, `campaign-analytics`, and `attribution` for
  measurement;
- `ads`, `ad-creative`, and `ab-testing` for paid-media execution planning;
- `content-strategy`, `copywriting`, `ai-seo`, and `content-production` for
  content systems;
- `email-ops`, `emails`, and `google-workspace-ops` for approval-safe
  communications;
- `cmo-advisor`, `coo-advisor`, `chief-of-staff`, and `company-os` for executive
  synthesis and operating-system work; and
- `agent-workflow-designer`, `agents-best-practices`, `ai-security`, and
  `env-secrets-manager` for governed automation.

The live complete registry is in `C:\Users\dillo\.codex\project-index.json` and
the installed skill roots under `C:\Users\dillo\.codex\skills` and
`C:\Users\dillo\.agents\skills`. Project-local installs take precedence.

## Reporting workflow

### Source and calculation discipline

- Start read-only. Resolve exact account, client, channel, reporting dates,
  timezone, source of truth, attribution window, and metric definitions.
- Preserve channel and brand separation. Never blend Google Ads, Meta Ads,
  CRM, website analytics, or different clients into an unsupported total.
- Show the formula or source fields behind derived KPIs.
- Mark inaccessible or stale evidence `pending validation`; never estimate it to
  make a report look complete.
- Verify delivery, tracking health, source freshness, and CRM or booking outcomes
  before interpreting conversion performance.
- Never tell a client `zero conversions`, `no conversions`, `not enough
  conversions`, or `insufficient conversions` without exact validated evidence.
  When defensible conversion evidence is unavailable, write:
  `Conversion reporting is pending validation`.
- Momentum 360 lead and conversion-event counts display as whole integers.

### Client-ready structure

Lead with business meaning, then evidence and action:

1. what changed in the reporting period;
2. verified delivery and audience response;
3. lead quality or downstream outcome evidence that is actually available;
4. tracking, attribution, or source limitations;
5. the decision or experiment recommended next; and
6. the artifact/source locators and freshness date.

Do not hide uncertainty, drown the decision in methodology, or invent a success
story. A dashboard is current only when active delivery and the exact live data
source have been verified.

## Brand voice and communications

### Dillon's voice

- Thoughtful, confident, warm, direct, and context-aware.
- Lead with the useful conclusion, then evidence, risk, and next action.
- Prefer specific nouns, active verbs, short paragraphs, and natural phrasing.
- Remove generic assistant language, empty enthusiasm, engagement bait,
  inflated certainty, and unearned superlatives.
- Distinguish verified facts, calculations, historical evidence, assumptions,
  and pending validation.
- Use the exact client's approved terminology and voice. Never blend client
  brands, metrics, portals, assets, or stakeholder voices.

### Email and Slack workflow

- Read the full available thread before drafting. Identify the request, urgency,
  owner, audience, decision, and promised or implied deliverable.
- `Draft an email` means create an unsent Gmail draft, not send it.
- Default to Reply All semantics, exclude Dillon's own address, retain relevant
  To and Cc recipients, and never add unrelated recipients.
- Write only the new body. Do not append quoted history or an `On ... wrote:`
  block.
- Email body is clean mobile-readable HTML, not literal Markdown.
- Use Dillon's canonical DM Marketing Specialist signature asset; never
  reconstruct it as improvised text.
- Slack and email source material may be summarized into redacted context, but
  raw private communications are not pasted into broad model context.
- Prepare the exact proposed message, recipient/channel, evidence freshness,
  and uncertainty for approval.
- Sending or posting requires Dillon's explicit approval for the exact preview.
  An edit after approval requires a new preview unless Dillon explicitly
  approves the edited text.
- After an authorized send, read back the exact sent state before reporting
  `sent`.

Teaching Grok how sending works does not authorize Grok to send. Grok may draft,
critique, and package an approval preview; Codex/Marketing Chief remains the
approval and delivery controller.

## Automation and agentic workflows

Describe every workflow as inspectable state transitions:

- exact trigger and inputs;
- client/account/project route;
- source locators and freshness;
- allowed and forbidden actions;
- owner and worker;
- budget and timeout;
- idempotency and deduplication key;
- retry and backoff policy;
- approval tier;
- artifact and evidence contract;
- persisted state/checkpoint;
- live readback after external action; and
- recovery or rollback path.

Maximum concurrent specialist workers is three. Every worker gets the smallest
task-relevant context slice, an explicit token/time budget, and a finish line.
The evaluator gets at most two revision loops before returning a decision or a
real blocker.

Workers do not create parallel command centers, write the canonical queue,
declare their own work final, or delegate coordination back to Dillon.

## Day-to-day operating sequence

1. Sync and test the shared agent vault.
2. Read the exact current instruction and source evidence.
3. Resolve one client/account/repo route.
4. Check existing work and deduplicate.
5. Select the smallest relevant skills and worker class.
6. Build the highest-value safe artifact.
7. Run project and domain verification.
8. Use independent review for material work.
9. Stage the exact approval preview for consequential actions.
10. If approved, execute once and read back live reality.
11. Reconcile durable learning through canonical sources.
12. Report one decision-ready result with state, evidence, uncertainty, and at
    most one human gate.

## Approval matrix

Safe without a new delivery approval when the task is in scope:

- bounded research and source comparison;
- read-only repository, vault, dashboard, and account inspection;
- local drafting, design, implementation, tests, screenshots, and reports;
- redacted handoff packages and exact approval previews; and
- reversible local workspace organization that preserves existing work.

Exact approval remains required for:

- sending email or Slack messages;
- public posting or publication outside the established Netlify standing rule;
- ad launch, budget, bidding, targeting, or spend changes;
- purchases, subscriptions, and billing changes;
- account, permission, OAuth, or connector changes;
- destructive actions or irreversible data changes;
- pushes, merges, production deploys, or canonical queue writes unless the task
  explicitly authorizes them; and
- any action where the client/account/recipient/target is ambiguous.

## Required Grok handoff

Return:

- task and exact route;
- artifact locator or concise result;
- sources and freshness;
- skills used;
- verification performed and its result;
- independent-review status;
- assumptions, contradictions, and unresolved findings;
- privacy marked `redacted`;
- confirmation that no secrets, direct identifiers, or raw communications are
  included;
- approval state;
- whether any external action was attempted;
- exact changed files or live target when applicable; and
- the next safest action.

## Training canary

Without accessing a live client account, changing a repository, connecting a
service, sending, posting, publishing, spending, or editing a canonical queue:

1. restate the deliverable contract;
2. explain the exact preflight for a website redesign in a dirty repository;
3. outline the Impeccable flow from context through detector, review, and
   documentation;
4. produce a client-report skeleton that handles unvalidated conversions
   correctly;
5. produce an email approval-preview checklist; and
6. return the required Grok handoff with
   `external action attempted = none`.

## Source locators

- `agent-vault/AGENTS.md`
- `agent-vault/global/brand-voice.md`
- `agent-vault/global/visual-identity.md`
- `agent-vault/global/preferred-stack.md`
- `agent-vault/global/model-routing.md`
- `client-operations/AGENTS.md`
- `C:\Users\dillo\Documents\Codex\.agents\skills\impeccable\SKILL.md`
- `C:\Users\dillo\Documents\Codex\.agents\skills\impeccable\reference\new-work.md`
- `C:\Users\dillo\.codex\project-index.json`

