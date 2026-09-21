---
note_type: review
status: active
created: 2026-09-09
updated: 2026-09-09
tags: [review, version-control, philadelphia-game, risk, momentum-360]
verification_status: verified
observed_at: 2026-09-09
source_refs:
  - 'C:\Users\dillo\Documents\Codex\philly-game\COORDINATION.md'
  - 'C:\Users\dillo\Documents\Codex\philly-game (git log, 3 commits, HEAD 905c25d)'
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\work\philadelphia-service-world (git log, 20 commits, HEAD 7b9f78a)'
  - 'C:\Users\dillo\Documents\Codex\2026-07-27\do-you-see-a-game-for\grand-theft-bureaucracy (git, HEAD 487c5b8, pushed to origin/main)'
  - 'C:\Users\dillo\Documents\Codex\projects\client-operations\.gitignore line 8'
  - '[[System/daily-orchestrator]]'
---

# Game tree version control audit

**Summary:** The unversioned-game-tree emergency is over — every tree that holds
game source is now under git, with a baseline commit taken before agent lanes
wrote to it. But the audit that declared it safe checked the wrong copy of one
repo, and the two most valuable trees have no remote. The risk changed shape
rather than disappearing.

Verified directly on 2026-09-09 by reading git state in each tree, not by
trusting the prior audit.

## Measured state

| Tree | Git | Commits | Remote | Working tree |
|---|---|---|---|---|
| `Codex\philly-game` | yes | 3 | **none** | clean |
| `client-operations\...\work\philadelphia-service-world` | yes | 20 | **none** | clean |
| `Codex\2026-07-27\...\grand-theft-bureaucracy` | yes | 206 files | `origin` — fully pushed | clean |

`philly-game` HEAD `905c25d`, branch `lane/philly-unify-runtime`, 20 files
tracked including all four character `.glb` files at 14 MB total.

`philadelphia-service-world` HEAD `7b9f78a`, branch `lane/m360-game-hardening`,
302 files tracked, 7.0 GB on disk. Baseline commit `72cbee7`, "philadelphia-service-world
as found, before any agent lane edits it," confirms git was established before
lane writes — the thing that needed to be true is true.

`grand-theft-bureaucracy` HEAD `487c5b8`, fully pushed to
`github.com/dillonmohr8777/grand-theft-bureaucracy`. 61 `.blend` files and
3.4 GB of assets are gitignored deliberately; the 53 `tools/build_*.py`
generators that produce them are tracked.

## The audit checked the wrong copy

`COORDINATION.md`, written 2026-09-07 by the unify lane, concluded: "`work/` is
gitignored in `client-operations-canonical`. That repo has no `work/` directory
and no game source, so the ignore rule excludes nothing that exists. The alarm
does not map to a tree that holds game code."

That is true of the worktree it checked at
`C:\Users\dillo\Claude\worktrees\repo-analysis-1bien2\client-operations-canonical`.
It is false of the working repo at
`C:\Users\dillo\Documents\Codex\projects\client-operations`, whose `.gitignore`
line 8 is `work/` and which contains
`clients\momentum-360\work\philadelphia-service-world` — 7.0 GB, 20 commits of
game work, nested inside the ignored path.

The alarm mapped to a real tree. It was defused anyway, by a different lane
(`lane/m360-game-hardening`) that established git there independently. The
conclusion was wrong; the outcome was lucky.

## Agency Wars is the game; the book is not the build

Confirmed by Dillon 2026-09-09: **Agency Wars is the game.** It is the
`?mode=agency` build inside `philadelphia-service-world` — Momentum's sales
floor, with Mac and Sean. The Ironic Ineptocracy / Grand Theft Bureaucracy
material is the book, a separate property, not this build.

That matters because the two Philadelphia trees are not two attempts at the
same thing. One is the game. The other is a prototype built around four
*book* characters.

## Two runtimes exist, not one

The unify lane's stated job was unification. It produced a second runtime
instead.

- `philly-game` — vanilla three.js, two source files (`src/city.js`,
  `src/main.js`), 3 commits, an OSM bake of Center City and four walkable
  characters.
- `philadelphia-service-world` — React/TypeScript, 20 commits, missions M01
  through M09 under `?mode=agency`, story mode under `?mode=story`, controller
  support, `netlify.toml`, and its own `DESIGN.md`, `PRODUCT.md`,
  `BUILD-PLAN.md` and `FABLE-REVIEW-BRIEF.md`.

The more advanced tree is the one the unify lane's audit misclassified as
holding no game code — and it is the actual game. `philly-game` is a
three-commit spike that proves a book character can be walked around an OSM
bake of Center City. Useful as a technical proof; not the product.

## What is actually exposed now

Not history — history exists. Two things:

1. **No remote on either Philadelphia tree.** Twenty-three commits of game work
   live on one disk. `grand-theft-bureaucracy` is the only game tree with an
   off-device copy.
2. **Hand-corrected binaries.** `COORDINATION.md` records that the generators
   are non-deterministic in places and that Alec's and Javon's likeness heads
   were hand-corrected after generation. A regenerated asset is equivalent, not
   identical. Those bytes exist in one place.

The correct fix for (1) is a private remote per tree, not adding gigabytes to
git — the existing ignore rules are right. Destination is Dillon's call.

## Related

- [[System/approval-queue]] — carries the off-device backup decision.
- [[12_Brain/05_Projects/2026-09-07 - Momentum AI division launch]] — the
  service-world tree is Momentum's sales floor.
