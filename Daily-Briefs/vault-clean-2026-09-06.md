---
date: 2026-09-06
---

# Vault Clean Report — 2026-09-06

**Hygiene grade: B.** Root and inbox are clean — no stray files, no stale
inbox, only two zero-byte scratch notes. Real rot is concentrated in wiki
links: 5 missing-target clusters (3 already known and unaddressed since the
2026-09-03 pass, 1 new since then) plus 3 live ad-platform playbooks still
33 days past `expires:`.

A stub version of this report already existed at this path (timestamp
2026-09-06 02:14 UTC, claiming "no broken links, no issues, grade A"). That
claim was false — the checks below found real defects. This version replaces
it with a verified scan; see Method note.

| Metric | Count |
|---|---|
| Files moved | 0 |
| Files reported, not moved | 6 |
| Broken wikilinks (real, vault-wide) | 25 |
| Broken wikilinks (doc-example false positives) | 16 |
| Expired live-knowledge pages | 3 |
| Stale inbox items (>14d) | 0 (see note) |
| Empty notes (0 lines) | 2 |

## Moves performed

None. Nothing at vault root or in `00_Inbox/` had an unambiguous destination.

## Root sweep

Root file inventory: `.gitattributes`, `.gitignore`, `.mcp.json`, `AGENTS.md`,
`CLAUDE.md`, `Dashboard.md`, `INDEX.md` — all seven are system/contract files
or the two named exceptions. No stray loose notes, `Untitled*` files, or zip
archives at root. (The 2026-09-03 report's root `Untitled 1.base`,
`Untitled 2.canvas`–`6.canvas`, and `2026-06-04.md` are gone — resolved
between then and now, outside this session.)

Top-level project directories (`immohrtal-site`, `immohrtal-marketing-site`,
`mohr-media-site`, `philly-sites`, `videos`, `automation`, `handoffs`, `SEO`)
are pre-existing, git-tracked working repos, not stray files — `git status`
is clean against them. Out of scope for a file-level sweep; flagging only
that they sit outside the numbered-folder taxonomy documented in `CLAUDE.md`
is a structural question for Dillon, not a hygiene defect.

## Reported, not moved

- `00_Inbox/Dryer Vent John.md` — 0 bytes, no frontmatter, no title. No
  destination is inferable from the filename alone. Needs a human call:
  delete, or fill in what it was meant to capture.
- `00_Inbox/2026-04-09.md` — 0 bytes. Same call as above; the date suggests a
  daily note that was never written.
- `00_Inbox/Untitled.base`, `00_Inbox/Untitled.canvas`,
  `00_Inbox/Untitled 1.canvas` — 2–39 bytes, scratch Base/Canvas stubs from
  the same 2026-08-17 batch commit as the rest of `00_Inbox/`. Same pattern
  `09_Ops/Health.md` already flags for the (now-resolved) root `Untitled
  1.base`. Left in place; vault-clean never deletes.
- `00_Inbox/Top 15 Opportunities 2026-07-02.md` and
  `00_Inbox/Automation Deep Analysis 2026-07-29.md` — technically stale by
  the 14-day inbox rule (last touched 2026-08-17, content dated July), but
  both are still actively cited as evidence in `System/approval-queue.md`,
  `11_Agents/Master Agent.md`, and inbox briefs through 2026-09-04. They are
  live working documents, not abandoned capture — promoting them to a
  permanent home (05_Projects or 06_Research) is a judgment call, not an
  unambiguous move, since many inbound references would need to be checked
  first.

## Broken wikilinks

Full-vault scan (744 markdown files, `.git`/`node_modules` excluded): 41 raw
`[[...]]` targets don't resolve. 16 are documentation examples, not real
links (`[[wikilinks]]`, `[[link]]`, `[[path]]`, `[[wikilink]]`,
`[[01_Clients/<Client>]]` inside `.claude/skills/*/SKILL.md`, `CLAUDE.md`,
and prior dated reports — prose about linking, not links).

The 25 real broken targets:

| Missing/wrong target | Citing files |
|---|---|
| `12_Brain/01_Captures/2026-06-26 - intel-core-7-master-operating-transfer` | 8 (Hermes, King Agent OS, Access Verification Discipline, Draft-First Operating Rules, Evidence Boundaries in Reporting, Google Docs Sharding Pattern, Netlify Deploy Safety, Truth Hierarchy) |
| `12_Brain/01_Captures/2026-07-04 - full-autonomy-directive` | 3 (Conversion Tracking Setup 2026, Google Ads Conversion Optimization 2026, Meta Lead Ads Optimization 2026) |
| `12_Brain/01_Captures/2026-07-04 - lost-clients-confirmation-2` | 1 (Leading Indicators) |
| `02_Campaigns/Ads Ops/Ads Ops Hub` (folder never created) | 3 (same 3 ad-platform concept pages) |
| `12_Brain/01_Captures/Slack/2026-09-01 - jason-fallon-snap-fitness-pa-request` | 2 (Vibe Prospecting; this report's 09-03 predecessor) |
| `Blissful Zen Spa` (no entity page exists) | 1 (Access Verification Discipline) |
| `12_Brain/03_Concepts/Second Brain Architecture` (file lives at `12_Brain/09_Ops/Architecture.md` since commit 113f58e) | 2 remaining, outside wiki-lint's scoped dirs: `12_Brain/System/Second Brain Ops.md`, `12_Brain/protocols/Compiler Protocol.md` — the 6 instances inside `02_Entities/03_Concepts/INDEX.md` were fixed in this session's wiki-lint pass |
| `[[2026-06-04]]` in `12_Brain/10_Maps/Generated/06 Work Sessions and Reviews.md` | 1 — dangling because the root `2026-06-04.md` this map pointed to was deleted since 2026-09-03; this is a generated map, needs regeneration not a hand-edit |
| `.claude/skills/{site-grade,motion-design,frontend-build,site-factory,mirror-and-improve}` referenced as bare `[[skill-name]]` instead of `[[.claude/skills/skill-name/SKILL]]` | 5, in `franchise-list/SKILL.md` and `scroll-hero/SKILL.md` — same fixable pattern as `Vibe Prospecting.md` (already corrected there), but outside `02_Entities`/`03_Concepts`/`INDEX.md` so left for a skills-doc pass |

The first four rows (three known-missing captures plus the Ads Ops Hub
folder) match the 2026-09-03 report almost exactly and are unresolved 3+
days later — see `CLAUDE.md`'s own acknowledgment that three captures are
missing and 24 notes cite them. `Blissful Zen Spa` and the jason-fallon
capture are also carryovers. Nothing new is broken except the dangling
`[[2026-06-04]]` reference, which is a side effect of a cleanup done
elsewhere between 09-03 and today.

## Expired knowledge (informational; full detail in wiki-lint report)

`03_Concepts/Conversion Tracking Setup 2026.md`,
`Google Ads Conversion Optimization 2026.md`, and
`Meta Lead Ads Optimization 2026.md` all expired 2026-08-04 — 33 days ago —
and are the playbooks behind live Google/Meta ads client work. Flagged with
an inline warning callout in this session (see wiki-lint report); content
refresh itself needs a research pass, not a lint pass.

## Stale inbox

No item is older than 14 days by the strict rule if you use each file's
*content* date — but every file in `00_Inbox/` shares one git-committed date
(2026-08-17, 20 days old), which is older than 14 days. Treating that as the
operative "last touched" date, all 8 inbox items are technically stale. Two
are empty stubs (reported above), two are `Untitled` scratch files (reported
above), one is the evergreen `Start Here.md` (not stale by nature), and two
(`Top 15 Opportunities`, `Automation Deep Analysis`) are stale-by-clock but
still actively cited — see Reported-not-moved section.

## Method note

Broken-link resolution used a purpose-built Node scanner
(`/tmp/.../scratchpad/find-broken-links.js`, not checked into the vault) that
resolves `[[target]]`, `[[target|alias]]`, and `[[target#heading]]` against
full relative path, path without extension, directory-relative path, and
Obsidian's shortest-basename-match fallback (with and without a target-side
extension). It scans the whole repository except `.git` and `node_modules`
so links into `.claude/`, `_os/`, and `System/` resolve correctly instead of
producing false positives. First run (scoped only to `12_Brain/`) produced 4
false positives from files outside that scope; the corrected full-tree run
above is what the counts reflect.
