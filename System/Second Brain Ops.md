---
tags: [system, runbook]
source: "[[raw/2026-07-04 - obsidian-second-brain-article]]"
updated: 2026-07-04
---

# Second Brain Ops

**Summary:** the operating schedule that keeps the brain alive — a brain that
only grows when you remember to feed it is dead in three weeks.

## The loops

| When | What | Model tier | How |
|------|------|-----------|-----|
| Session end | Log line lands in `raw/sessions/session-log.md` (automatic hook); run `/session-mine` if the session made decisions | cheap | `.claude/settings.json` SessionEnd hook + skill |
| Nightly | `/vault-compile` — read new `raw/` material, update `entities/` + `concepts/`, refresh `INDEX.md` | **cheap** | schedule it (below) |
| Weekly | `/wiki-lint` — contradictions, duplicates, dead links, missing sources | cheap | schedule it |
| Weekly | `/synthesize` — read across the vault: what changed, what's drifting, what deserves attention | **premium** (the only pass that earns it) | schedule it |
| Weekly | `/research-sweep <niche question>` — fan out, skeptic attacks, survivors land as dated pages | mixed | run when needed |

Scheduling options, pick one:
- Claude Code on the web / remote: create triggers ("run /vault-compile", cron `0 2 * * *`; `/wiki-lint` + `/synthesize` weekly, e.g. Fri 15:00).
- Local: `claude -p "/vault-compile" --model haiku` from cron/launchd inside the vault repo.
- Manual fallback: `/loop` or just run them — the skills are idempotent.

## The backfill (run once, then as needed)

Feed `raw/` first: old chat transcripts, bookmarked threads, notes exports,
client folders, past research. Then run `/goal` with a finish line the judge
can verify from the conversation alone:

> Compile every file in `raw/` into the wiki. Done means: (1) every raw file is
> reflected in at least one `entities/` or `concepts/` page with a `source:`
> link back to it, (2) every new page is listed in `INDEX.md` with a one-line
> description, (3) you have pasted the final `INDEX.md` and a `git diff --stat`
> into the conversation as proof. Ship every change as a diff, never a claim.
> Flag (don't trust) any page without a source. Stop after 3 passes over raw/
> even if imperfect, and list what's left.

## Honesty rules

- Every change ships as a diff — if the agent says it updated a page, the diff proves it.
- A page without a `source:` link back to `raw/` (or a vault note) gets flagged, not trusted.
- Research pages carry `updated:` and `expires:` dates.

## Sync

Git is the only sync/checkpoint layer for this vault. No iCloud/Drive/Obsidian
Sync writing the same files while agents work — conflicted copies kill vaults.

## Links

- [[concepts/Second Brain Architecture|Second Brain Architecture]] · [[concepts/Context Economy|Context Economy]] · [[concepts/Research Verification Loop|Research Verification Loop]]
