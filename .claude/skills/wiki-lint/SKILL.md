---
name: wiki-lint
description: Weekly graph hygiene for the wiki layer — contradictions, duplicate pages, dead wikilinks, missing source links, stale expiry dates. Unmaintained wikis rot; this is the loop that keeps the graph clean.
---

# Wiki Lint

Lint the brain layer: `12_Brain/02_Entities/`, `12_Brain/03_Concepts/`, `12_Brain/INDEX.md`. (File-level vault
hygiene — stray files, empty notes — belongs to `/vault-clean`; don't repeat it.)

**Count checks 1 and 2 before you write a word about them:**

```
node _os/automation/bin/wiki-lint-check.js
```

Report its numbers, not your own. It is read-only and takes about a second. On
2026-09-16 this pass hand-counted instead and reported 220+ empty stubs in a
file containing zero, and 53 orphans when the real number was five — a FAILING
grade nobody could act on. A count you did not run is not a finding.

Checks:

1. **Dead links** — every `[[wikilink]]` in `12_Brain/02_Entities/`, `12_Brain/03_Concepts/` and
   `12_Brain/INDEX.md` resolves to a real note. `wiki-lint-check.js` lists these as
   `unresolved links`; a link to a `.base`, `.canvas` or folder is resolved, not broken.
2. **Orphans** — wiki pages not listed in `12_Brain/INDEX.md`, and INDEX entries whose
   page is gone. `wiki-lint-check.js` reports these as `orphan pages`, checked against
   both `INDEX.md` and `12_Brain/INDEX.md`.
3. **Duplicates** — two pages covering the same entity/lesson (grep titles and
   summary lines for overlap). Propose which absorbs which.
4. **Missing sources** — any wiki page without a `source:` line. Flag it as
   untrusted; do not invent a source.
5. **Contradictions** — pages making conflicting claims about the same client,
   tool, or number (compare against `01_Clients/` pages too). Surface both
   statements with links.
6. **Expired knowledge** — pages whose `expires:` date has passed.

Fix mechanically-safe items directly (dead links to renamed notes, INDEX
sync, expired-date flags). For duplicates and contradictions, report — merging
meaning is a judgment call for Dillon or the synthesis pass.

Write the report to `Daily-Briefs/wiki-lint-YYYY-MM-DD.md` and end with
`git diff --stat` for anything you changed.
