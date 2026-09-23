# Vault Clean — 2026-09-23

**Hygiene Grade: C — inbox backlog is the real defect; structure is otherwise sound.**

## Summary
- 1 stray file at root (`tmp-control-rg.txt`, unmoved — no unambiguous destination)
- 1 move performed: `00_Inbox/2026-04-09.md` → `07_Daily_Notes/2026-04-09.md` (empty file, matches the folder's `YYYY-MM-DD.md` daily-note convention, no collision)
- **73 stale inbox items** (>14 days old, cutoff 2026-09-09) — see breakdown below
- **12 empty/near-empty notes** (under 3 lines of content) vault-wide
- **40 broken `[[wikilinks]]`** vault-wide (see companion `wiki-lint-2026-09-23.md` for the 12_Brain-scoped subset and fixes)

### Correction to the prior pass
`vault-clean-2026-09-22.md` reported "0 stale inbox items" and "0 broken links
detected." Both were undercounts. This checkout's filesystem mtimes are all
`Sep 18` (the clone date) — mtime cannot answer "how old is this," only git
history, filename dates, or `created:` frontmatter can. Today's numbers below
come from content date, not mtime. Treat mtime as unreliable for this vault
until proven otherwise; this is going in `earned-lessons.md`.

## Moves performed
- `00_Inbox/2026-04-09.md` → `07_Daily_Notes/2026-04-09.md`. Empty file (0
  bytes), git-added 2026-09-07 by the `morning-brief` automation. Also
  repaired the one link that pointed at the old path:
  `12_Brain/10_Maps/Generated/06 Work Sessions and Reviews.md` line 29.
  Checked all other `00_Inbox/2026-04-09` references before moving — the
  remaining 19 hits are all inside dated historical `Daily-Briefs/*.md`
  reports, which are point-in-time records and were left untouched.

## Proposed moves (not performed — destination ambiguous)
- `tmp-control-rg.txt` (root, 53 KB) — a redirected PowerShell command dump
  (recursive-grep / `Get-ChildItem` output over `client-operations/backups/`
  and a queue check), not vault content. No clean destination inside the
  taxonomy; propose either `_archive/stray/tmp-control-rg.txt` or deletion.
  Deletion is Dillon's call, not mine — flagging only.

## Stray files at root
- `tmp-control-rg.txt` — see above. Everything else at root
  (`.gitattributes`, `.gitignore`, `.mcp.json`, `AGENTS.md`, `CLAUDE.md`,
  `Dashboard.md`, `INDEX.md`) is an allowed system or index file.

## Empty / near-empty notes (vault-wide, under 3 lines of content)
- `00_Inbox/Dryer Vent John.md` — 0 bytes, git-added 2026-09-07 (16 days,
  also stale by the inbox rule)
- `07_Daily_Notes/2026-04-09.md` — 0 bytes (moved here this pass, still empty)
- `07_Daily_Notes/2026-06-04.md` — 0 bytes, pre-existing, not touched this pass
- `01_Clients/Capsule & Tonic/overview.md` — 2 content lines
- `01_Clients/Omega Landscaping/content-calendar.md` — 2 content lines
- `01_Clients/Onsite Concrete/active-campaigns.md` — 2 content lines
- `01_Clients/Onsite Concrete/brand-guidelines.md` — 2 content lines
- `01_Clients/Onsite Concrete/content-calendar.md` — 2 content lines
- `01_Clients/Tags 2 Go/content-calendar.md` — 2 content lines
- `_archive/01_Clients/Shadow HVAC/content-calendar.md` — 2 content lines (archived, low priority)
- `ai-division/craft/need-momentum-birds/assets/prompts/README.md` — 1 content line
- `ai-division/craft/need-momentum-birds/compositions/COMPOSITIONS.md` — 2 content lines

Not deleted or filled in — reporting only, per the never-delete rule and
"report nearby problems, don't fix unasked."

Also found and **not treated as broken**: `00_Inbox/Untitled.base`,
`00_Inbox/Untitled.canvas`, `00_Inbox/Untitled 1.canvas` — empty Obsidian
Bases/Canvas files (2–39 bytes), git-added 2026-09-07. Not markdown notes, so
outside the 3-line check, but functionally empty and unused for 16 days.
Flagging alongside the empties above since they're inbox clutter of the same
shape.

## Broken wikilinks (vault-wide, 40 total)
Full list is mechanical and long; grouped by cause. The 12_Brain-scoped subset
and what was fixed there is in `wiki-lint-2026-09-23.md` — this list is not
duplicated in full here to avoid drift between the two reports.

- **Illustrative examples, not real links (~14):** `[[wikilinks]]`, `[[link]]`,
  `[[path]]`, `[[Page Name]]`, `[[wiki-links]]` used as syntax examples inside
  `CLAUDE.md`, past `vault-clean-*`/`wiki-lint-*` reports, `11_Agents/Daily
  Learning Loop (Local).md`, `12_Brain/03_Concepts/Second Brain
  Architecture.md`, `12_Brain/03_Concepts/Context Economy.md`, and one
  captured article (`12_Brain/01_Captures/2026-07-04 -
  obsidian-second-brain-article.md`, immutable, left as captured). No action —
  these are prose about link syntax, not dead links.
- **Literal placeholder, not a real link (1):** `12_Brain/01_Captures/sessions/2026-09-02
  - recursive-vault-loop.md` → `[[01_Clients/<Client>]]` — a template
  placeholder inside a capture. Immutable, left as-is.
- **Known, already-labeled missing captures (3 citations, matches CLAUDE.md's
  documented "three missing captures"):** `12_Brain/03_Concepts/Leading
  Indicators.md` → `2026-07-04 - lost-clients-confirmation-2` (appears twice).
  Already correctly annotated `(capture never landed; unverified)` in the
  plain-text `source`/`source_refs` fields in the same frontmatter block — the
  bracketed `[[...]]` variant just doesn't resolve as a link, which is
  expected for a capture that was never written. No new problem, no fix
  needed.
- **A fourth, previously-flagged but still-unresolved missing capture (1):**
  `12_Brain/02_Entities/Vibe Prospecting.md` → `12_Brain/01_Captures/Slack/2026-09-01
  - jason-fallon-snap-fitness-pa-request` (source + source_refs). Confirmed
  by a vault-wide search: this capture does not exist anywhere. This exact
  gap was already flagged in `wiki-lint-2026-09-10.md` thirteen days ago and
  is still open. Not fabricating a replacement citation — flagging again,
  louder, since it is now a repeat finding.
- **Structural / path issues worth a human decision (remainder, ~21):** case
  mismatch (`12_Brain/00_Home.md` embeds `bases/Experiment Queue.base`,
  actual folder is `Bases/`), a generated-map link into `_os/` that doesn't
  exist, a folder-style client link with no matching note
  (`01_Clients/Kimberly James Bridal` referenced without `/overview.md`),
  two notes in `11_Agents/OPERATING-PLAN-2026-09-09.md` that were never
  created (`dillon-real-priorities`, `client-roster-drift-20260909`), and a
  handful of cross-file references (`machine-power-fault`,
  `agents-api-curl-path`, `Prospect Radar`, a Slack open-loop sweep capture)
  where the likely real target exists under a different name/date. Full
  per-file detail is in `wiki-lint-2026-09-23.md` for the ones inside
  `12_Brain/02_Entities`, `03_Concepts`, and `INDEX.md`; the rest are outside
  this pass's fix authority and are reported, not touched.

## Stale inbox items (00_Inbox/, older than 14 days — cutoff 2026-09-09)

**73 of 91 dated inbox files are stale.** Staleness computed from filename
date / `created:` frontmatter, not mtime (see correction note above).

By source, all stale (no items in these ranges have been triaged):
- `Agent-Proposals/Claude/*-daily-driver-approval-package.md`: 2026-08-12
  through 2026-09-08 (28 files). 2026-09-09 through 2026-09-15 (7 files) are
  fresh and not counted as stale.
- `Agent-Proposals/Claude/2026-08-13-frontier-synthesis.md`,
  `2026-09-01-puttery-wnf-reply-drafts.md`: stale.
- `Agent-Proposals/Codex/2026-08-24-outcome-graph-knowledge-proposal.md`: stale.
- `Agent-Proposals/Cursor/*` 2026-08-26 canary batch (8 files), 2026-08-27
  batch (12 files including `immohrtal-outreach-hold-2026-08-27.md`), and
  `immohrtal-crew-*` 2026-08-28 through 2026-09-08 (11 files): all stale.
  `immohrtal-crew-*` 2026-09-09 through 2026-09-15 (7 files) are fresh.
- `Agent-Proposals/Grok/2026-08-12-active-vault-access-canary.md`,
  `2026-08-26-developer-cursor-access-canary.md`: stale.
- `Automation Deep Analysis 2026-07-29.md` (56 days old): stale. Not moved —
  destination is ambiguous (strategy doc, not a daily note) and it's cited as
  a source in `System/approval-queue.md`'s Netlify-capacity item; moving it
  would orphan that citation.
- `Top 15 Opportunities 2026-07-02.md` (83 days old): stale. Same reasoning —
  **actively cited** by five open items in `System/approval-queue.md`. Not
  moved.
- `slack/2026-07-30-*.md` (4 files) and `slack/2026-09-02-mac-kjb-conversion-check.md`: stale.

Not counted as stale: `Start Here.md` (evergreen inbox guide, no content
date, not a capture). `Dryer Vent John.md` and the three empty
canvas/base files have no date at all but are 16 days untouched by git
history — see the empties section above.

**The pattern, not just the count:** the daily-driver approval packages and
immohrtal-crew notes are an automated daily drop with nothing downstream that
triages or archives them. 39 of the 73 stale files are exactly one of these
two series. This is a process gap, not a one-off mess — worth a routine
(weekly digest-and-archive) rather than a manual sweep every time.

## Grade rationale
Structure is clean: only one stray root file, only one unambiguous move
available and it was made, no `.obsidian`/`_os`/`.claude` violations, no
deletions. The inbox backlog (73 stale, unprocessed for up to 83 days) and
the unresolved 40 broken links are why this isn't an A. **C.**
