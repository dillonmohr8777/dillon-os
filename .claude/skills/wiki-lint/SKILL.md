---
name: wiki-lint
description: Weekly graph hygiene for the wiki layer — contradictions, duplicate pages, dead wikilinks, missing source links, stale expiry dates. Unmaintained wikis rot; this is the loop that keeps the graph clean.
---

# Wiki Lint

Lint the brain layer: `entities/`, `concepts/`, `INDEX.md`. (File-level vault
hygiene — stray files, empty notes — belongs to `/vault-clean`; don't repeat it.)

Checks:

1. **Dead links** — every `[[wikilink]]` in `entities/`, `concepts/` and
   `INDEX.md` resolves to a real note. List the broken ones with their file.
2. **Orphans** — wiki pages not listed in `INDEX.md`, and INDEX entries whose
   page is gone.
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
