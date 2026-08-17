---
tags: [system, runbook]
source: "[[12_Brain/raw/2026-07-04 - obsidian-second-brain-article]]"
updated: 2026-07-29
canonical: 12_Brain
---

# Second Brain Ops

**Summary:** the operating schedule that keeps the brain alive — a brain that
only grows when you remember to feed it is dead in three weeks.

## The loops

| When | What | Model tier | How |
|------|------|-----------|-----|
| Session end | Log line lands in `12_Brain/raw/sessions/session-log.md` (automatic hook); run `/session-mine` if the session made decisions | cheap | `.claude/settings.json` SessionEnd hook + skill |
| Nightly | `/vault-compile` — read new `12_Brain/raw/` material, update `12_Brain/entities/` + `12_Brain/concepts/`, refresh `12_Brain/INDEX.md` | **cheap** | schedule it (below) |
| Weekly | `/wiki-lint` — contradictions, duplicates, dead links, missing sources | cheap | schedule it |
| Weekly | `/synthesize` — read across the vault: what changed, what's drifting, what deserves attention | **premium** (the only pass that earns it) | schedule it |
| Weekly | `/research-sweep <niche question>` — fan out, skeptic attacks, survivors land as dated pages | mixed | run when needed |

Scheduling options, pick one:
- Claude Code on the web / remote: create triggers ("run /vault-compile", cron `0 2 * * *`; `/wiki-lint` + `/synthesize` weekly, e.g. Fri 15:00).
- Local: `claude -p "/vault-compile" --model haiku` from cron/launchd inside the vault repo.
- Manual fallback: `/loop` or just run them — the skills are idempotent.

## The backfill (run once, then as needed)

Feed `12_Brain/raw/` first: old chat transcripts, bookmarked threads, notes exports,
client folders, past research. Then run `/goal` with a finish line the judge
can verify from the conversation alone:

> Compile every file in `12_Brain/raw/` into the wiki. Done means: (1) every raw file is
> reflected in at least one `12_Brain/entities/` or `12_Brain/concepts/` page with a `source:`
> link back to it, (2) every new page is listed in `12_Brain/INDEX.md` with a one-line
> description, (3) you have pasted the final `12_Brain/INDEX.md` and a `git diff --stat`
> into the conversation as proof. Ship every change as a diff, never a claim.
> Flag (don't trust) any page without a source. Stop after 3 passes over raw/
> even if imperfect, and list what's left.

## Honesty rules

- Every change ships as a diff — if the agent says it updated a page, the diff proves it.
- A page without a `source:` link back to `12_Brain/raw/` (or a vault note) gets flagged, not trusted.
- Research pages carry `updated:` and `expires:` dates.

## Sync & public boundary

- **This GitHub repository is PUBLIC.** Never commit emails, phones, credentials,
  Bitwarden locators, account inventories, or machine-specific absolute paths.
- Sensitive notes belong in `12_Brain/private/` (gitignored) or stay only on the
  operator machine / Obsidian Sync.
- **Git is the source of truth** for agent writes to tracked files.
- Do not race Obsidian Sync + an agent rewriting the same tracked files.
- Live Sync verification (desktop vault matching this Git tree) remains an
  operator gate after merge.

## Links

- [[12_Brain/concepts/Second Brain Architecture|Second Brain Architecture]] · [[12_Brain/concepts/Context Economy|Context Economy]] · [[12_Brain/concepts/Research Verification Loop|Research Verification Loop]]
