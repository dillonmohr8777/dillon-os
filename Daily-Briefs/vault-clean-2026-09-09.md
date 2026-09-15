---
date: 2026-09-09
---

# Vault Clean — 2026-09-09

Note on method: prior runs (2026-09-06, 2026-09-07) reported zero broken links,
zero empty notes, and zero stale inbox items. That does not match what a real
scan of the tree finds today — the underlying content has not materially
changed since 09-07. This run used a script that actually resolves every
`[[wikilink]]` target against the file tree (by relative path and by
basename) instead of assuming clean. See the Hygiene Grade note at the bottom.

## Stray Files (vault root)

- None found. Root holds only expected system/doc files: `AGENTS.md`,
  `CLAUDE.md`, `Dashboard.md`, `INDEX.md`, plus the numbered business folders,
  `12_Brain/`, `System/`, `_os/`, `_archive/`, `_templates/`, `automation/`,
  site subfolders (`immohrtal-site/`, `mohr-media-site/`, `philly-sites/`,
  etc.), and `handoffs/`, `videos/`. No `Untitled*`, loose dated notes, or
  zips at root.

## Broken Links (vault-wide scan, 759 markdown files, `_archive/` excluded)

Two fixed directly (see Moves/Fixes below); the rest need Dillon or a
follow-up session to resolve because the correct destination is not
determinable without inventing content:

**Known-missing captures (pre-existing issue, per `CLAUDE.md`: "Three
captures are already missing and 24 notes cite them"):**
- `12_Brain/01_Captures/2026-06-26 - intel-core-7-master-operating-transfer` —
  cited by 8 files (16 link occurrences): `12_Brain/02_Entities/Hermes.md`,
  `King Agent OS.md`; `12_Brain/03_Concepts/Access Verification
  Discipline.md`, `Draft-First Operating Rules.md`, `Evidence Boundaries in
  Reporting.md`, `Google Docs Sharding Pattern.md`, `Netlify Deploy
  Safety.md`, `Truth Hierarchy.md`.
- `12_Brain/01_Captures/2026-07-04 - full-autonomy-directive` — cited by
  `12_Brain/03_Concepts/Conversion Tracking Setup 2026.md`, `Google Ads
  Conversion Optimization 2026.md`, `Meta Lead Ads Optimization 2026.md` (6
  occurrences).
- `12_Brain/01_Captures/2026-07-04 - lost-clients-confirmation-2` — cited by
  `12_Brain/03_Concepts/Leading Indicators.md` (2 occurrences).
- **New finding, not previously documented:**
  `12_Brain/01_Captures/Slack/2026-09-01 - jason-fallon-snap-fitness-pa-request`
  — cited twice by `12_Brain/02_Entities/Vibe Prospecting.md`. The
  `12_Brain/01_Captures/Slack/` subfolder does not exist at all. This makes
  four missing captures cited by roughly 26 notes, not three — CLAUDE.md's
  count is stale and should be corrected in a follow-up (not done here; that
  file is not vault-clean's or wiki-lint's to edit).

**Other real dead links:**
- `12_Brain/03_Concepts/Access Verification Discipline.md` → `[[Blissful Zen
  Spa]]` — no entity or client page exists anywhere in the vault (checked
  `01_Clients/`, `_archive/01_Clients/`) for this name. Referenced in prose
  (six other files) but never has its own page.
- `12_Brain/03_Concepts/Conversion Tracking Setup 2026.md`, `Google Ads
  Conversion Optimization 2026.md`, `Meta Lead Ads Optimization 2026.md` →
  `[[02_Campaigns/Ads Ops/Ads Ops Hub]]` — folder `02_Campaigns/Ads Ops/`
  does not exist (3 occurrences).
- `12_Brain/System/Second Brain Ops.md`, `12_Brain/protocols/Compiler
  Protocol.md` → `[[12_Brain/03_Concepts/Second Brain Architecture]]` — the
  target file was deleted 2026-09-01 in commit `62d05c53` (an unrelated
  registry-cleanup commit that incidentally removed it with no mention in the
  commit message). This also broke `12_Brain/INDEX.md` and three other
  `03_Concepts` pages — those four are fixed under wiki-lint below since they
  are in its declared scope; these two are outside it and are left for a
  follow-up.
- Several `.claude/skills/*/SKILL.md` files link to sibling skills by bare
  name (e.g. `[[motion-design]]`, `[[site-factory]]`, `[[site-grade]]`) —
  these folders exist (`.claude/skills/motion-design/`, etc.) but Obsidian
  resolves wikilinks to *notes*, and there is no `motion-design.md` inside
  them, only `SKILL.md`. Cosmetic/doc-style, not a content-loss risk; not
  touched.
- A handful of matches on the literal words `wikilinks`, `link`, `wiki-links`
  are prose examples inside `CLAUDE.md`, several `SKILL.md` files, and prior
  `Daily-Briefs/vault-clean-*` / `wiki-lint-*` reports explaining link syntax
  — not real links, excluded from the counts above.

## Fixes Applied (mechanical, in wiki-lint's declared scope — see that report
for detail)
- `12_Brain/02_Entities/Cloudflare D1 Radar.md`: `[[Prospect Radar]]` (dead) →
  `[[12_Brain/05_Projects/Prospect Radar V2|Prospect Radar V2]]` (the actual
  current page).
- `12_Brain/INDEX.md`, `Context Economy.md`, `Research Verification Loop.md`,
  `Truth Hierarchy.md`: `[[Second Brain Architecture]]` (deleted file) →
  `[[12_Brain/03_Concepts/Living Second Brain]]` (the closest active
  successor concept, already covering the same ground).

## Empty / Near-Empty Notes (under 3 non-blank lines)

- `00_Inbox/2026-04-09.md` — 0 bytes. Filename dates it 2026-04-09 (153 days
  old). Also stale inbox (see below).
- `00_Inbox/Dryer Vent John.md` — 0 bytes, no date signal in the name or
  content. Looks like an abandoned lead-capture stub.
- `_os/automation/fixtures/clients/Fixture Client Two.md` — 2 lines, but this
  is a test fixture under `_os/`, not a real vault note. `_os/` is off-limits
  per the skill; excluded from action, listed for completeness only.
- Also near-empty and effectively placeholder: `00_Inbox/Untitled.canvas`,
  `00_Inbox/Untitled 1.canvas` (both literally `{}`), and
  `00_Inbox/Untitled.base` (default table-view stub, no content). Not `.md`
  so they don't hit the 3-line rule directly, but they're the same class of
  issue as the two empty notes above — no destination is unambiguous for
  zero-content files, so nothing was moved.

## Stale Inbox (`00_Inbox/`, items evidenced older than 14 days by filename or
embedded date — file mtimes are all identical, from the last bulk
commit/checkout, so they are not usable as an age signal)

- `00_Inbox/2026-04-09.md` (153 days)
- `00_Inbox/Automation Deep Analysis 2026-07-29.md` (42 days)
- `00_Inbox/Top 15 Opportunities 2026-07-02.md` (69 days)
- `00_Inbox/slack/` — all 4 files dated 2026-07-30 (41 days): jenny-brand-direction, melissa-guidelines-training-prompt, sean-callrail-status, jason-sean-bot-case-status-alert.
- `00_Inbox/Agent-Proposals/Claude/` — 9 of 10 files are stale: the seven
  `2026-08-1[2-8]-daily-driver-approval-package.md` files (22–28 days),
  `2026-08-12-claude-loop-corrections.md` (28 days),
  `2026-08-13-frontier-synthesis.md` (27 days). Only
  `2026-09-01-puttery-wnf-reply-drafts.md` (8 days) is current.
- `00_Inbox/Agent-Proposals/Grok/2026-08-12-active-vault-access-canary.md`
  (28 days)
- Not counted as stale: `00_Inbox/Start Here.md` (undated evergreen
  onboarding template, not a capture to process).

17 items are 22+ days past the 14-day threshold, several of them approval
packages that never got a human decision. That is an approval-queue backlog
signal worth Dillon's attention, separate from vault hygiene.

## Moves Performed

None. Nothing at root needed moving, and every empty/stale item above has an
ambiguous or nonexistent destination — moving a 0-byte file or a month-old
undated approval package is a judgment call, not a hygiene mechanic.

## Verification

- `node --test _os/test/brain-hud.test.js _os/test/public-safety.test.js` —
  18/19 pass. The one failure (`12_Brain canonical structure > has the
  required 12_Brain paths`) is pre-existing and unrelated to tonight's
  changes (confirmed via `git stash`): `_os/vault-state.js`'s
  `requiredBrainPaths()` still hardcodes
  `12_Brain/03_Concepts/Second Brain Architecture.md` as required, so this
  test has been failing since the file was deleted 2026-09-01. Flagged as a
  follow-up in `12_Brain/11_Craft/earned-lessons.md`; not fixed here (code
  change, outside vault-clean/wiki-lint scope).
- `node _os/automation/bin/frontmatter-validate.js` — `status: ok`, 37/37
  complete.
- `Test-SecondBrain.ps1` could not run — no `pwsh` in this Linux environment.
  Degraded verification; report this honestly rather than claim a
  PowerShell-only check passed.

## Hygiene Grade

**C** — no stray root files, but real dead links, empty notes, and a
17-item stale-inbox backlog exist and had gone unreported for at least two
prior daily runs. Two prior "A" grades (09-06, 09-07) were not accurate; see
the recursion-layer lesson recorded tonight.

---
*Scan completed 2026-09-09.*
