---
name: wiki-lint
description: Weekly graph hygiene for the wiki layer — contradictions, duplicate pages, dead wikilinks, missing source links, stale expiry dates. Unmaintained wikis rot; this is the loop that keeps the graph clean.
---

# Wiki Lint

Lint the brain layer. File-level vault hygiene — stray files, empty notes —
belongs to `/vault-clean`; don't repeat it.

## 1. Run the deterministic pass first

```bash
node _os/automation/bin/wiki-lint.js
```

It writes `Daily-Briefs/wiki-lint-YYYY-MM-DD.md` and
`12_Brain/state/wiki-lint.json`, and covers the mechanical checks so you don't
have to re-derive them:

| Rule | What it proves |
|---|---|
| `frontmatter-present` | every compiled page opens with a YAML fence |
| `source-present` | every compiled page carries `source:` or `source_refs:` |
| `expires-present` | research and review pages carry an `expires:` date |
| `expires-fresh` | which `expires:` dates have passed (warning) |
| `link-resolves` | every `[[wikilink]]` resolves, across `.md`/`.canvas`/`.base` |
| `index-reachable` | a trail from `12_Brain/INDEX.md` reaches every brain page |
| `no-rival-brain` | no competing `1Z_Brain/` tree |

Scopes and severities live in `12_Brain/registry/wiki-lint.json`. Retune the
policy there rather than working around a rule per-page.

Fix what it reports, then re-run until errors are zero. The mechanically safe
fixes are: adding a page to INDEX or a folder index, repointing a link at a
renamed note, and adding frontmatter. **Never invent a `source:`** — if the
capture is sensitive and lives outside Git, point at `12_Brain/private/raw/`; if
you genuinely don't know where a claim came from, say so in the report and leave
the page flagged.

An expired page is not fixed by moving its date. Re-verify the finding, or delete
the page — a wrong page is worse than no page.

## 2. Then do the judgment work the script can't

These need meaning compared, not paths resolved:

1. **Duplicates** — two pages covering the same entity or lesson. Grep titles and
   summary lines for overlap. Propose which absorbs which; don't merge unilaterally.
2. **Contradictions** — pages making conflicting claims about the same client,
   tool, or number. Compare against `01_Clients/` pages too. Surface both
   statements with links.
3. **Thin pages** — a page whose summary line is its only content, and which
   nothing links to, is a stub pretending to be knowledge. Propose absorbing it.
4. **Lane drift** — a capture or acceptance report edited into an evergreen lesson,
   or a compiled page accruing daily log entries. Also flag a *second home* opening
   up for a record type that already has one; that is the failure
   `12_Brain/decisions/2026-07-31 - One home per record type.md` exists to prevent.
5. **Re-verification backlog** — `expires-soon` findings are the queue for the next
   `/research-sweep`. Check each claim against a **primary** source, not the post
   that reported it, then extend `expires:` or delete the page.

Report these; merging meaning is a call for Dillon or the `/synthesize` pass.

## 3. Close out

Append your judgment findings to the generated
`Daily-Briefs/wiki-lint-YYYY-MM-DD.md` and end with `git diff --stat` for
anything you changed.
