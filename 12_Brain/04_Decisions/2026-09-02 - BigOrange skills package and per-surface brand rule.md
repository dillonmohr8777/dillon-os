---
note_type: decision
status: active
created: 2026-09-02
updated: 2026-09-02
owner: Dillon Mohr
decision: "Package BigOrange work as portable skills in claude-skills-repo (brand system, deck engine, client radar, four vertical playbooks). Decks and PDFs use the logo orange #FF7C00 with Montserrat; anything shipped into bigorange.marketing uses the live theme's #F68326, Raleway and Open Sans. Client discovery uses WordPress and the public site only, read-only, with kickoff decks drafted as sampleData until a human approves."
verification_status: verified
review_on: 2026-12-01
source_refs:
  - "user://2026-09-02/bigorange-skills-package-plan"
  - "[[01_Clients/BigOrange Marketing/overview]]"
  - "claude-skills-repo/skills/bigorange-brand-system/references/brand-research-2026-09.md"
  - "claude-skills-repo/skills/bigorange-brand-system/references/tokens.md"
  - "claude-skills-repo/skills/bigorange-client-radar/SKILL.md"
  - "client-operations-canonical/clients/bigorange-marketing/deliverables/2026-09-02-wordpress-growth-package-redesign/README.md"
tags:
  - brain
  - decision
  - bigorange
  - brand
  - skills
  - automation
---

# BigOrange skills package and per-surface brand rule

## Decision

1. BigOrange production work lives in six portable skills under
   `claude-skills-repo/skills/bigorange-*`, mirroring the Align HCM brand
   system: `bigorange-brand-system` (tokens, exact logo, deck kit, doc kit,
   linter, validator), `bigorange-client-decks` (four recipes: industry pitch,
   client kickoff, monthly performance, leadership review),
   `bigorange-client-radar` (roster discovery and new-client events), and
   `bigorange-vertical-{home-builders,msp,manufacturing,landscaping}`.
2. Per-surface brand rule. Decks, PDFs and social use the orange sampled from
   the logo (`#FF7C00`) with Montserrat display type. Web pages and blog HTML
   shipped into bigorange.marketing use the live Beaver Builder theme
   (`#F68326`, `#D66509`, `#428BCA`, Raleway, Open Sans). The linter enforces
   the split; nobody "fixes" one surface to match the other.
3. Client discovery reads only the public site and, once granted, a role-based
   read-only WordPress Application Password. It never sends, publishes or
   changes WordPress. A high-confidence new client yields a kickoff deck draft
   with the draft banner on and one approval-queue line.

## Options considered

- Keep everything in the vault's `.claude/skills` (rejected: not portable to Codex or the shared marketplace, and Align already set the precedent).
- Use the site's theme orange everywhere (rejected: the logo PNG is `#FF7C00`; decks should match the artwork they carry).
- Discover clients from Gmail and Slack too (deferred: more approval surface; the public site already lists case studies and testimonials).

## Consequences

- `12_Brain/registry/automations.json` gains `bigorange-client-radar` (daily, no external actions).
- The Connector Map records the WordPress Application Password route and the Abency brand alternative.
- Research files in the skills carry `expires: 2026-12-01`; re-verify before reuse after that date.

## Evidence

- Brand research: `claude-skills-repo/skills/bigorange-brand-system/references/brand-research-2026-09.md`
- Rendered decks and PDFs: `client-operations-canonical/clients/bigorange-marketing/deliverables/2026-09-02-*`
