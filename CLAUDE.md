# D.I.L.L.O.N. OS — Vault Instructions

This repo is Dillon Mohr's Obsidian vault and second brain. You (the agent) read
and write the same markdown files Obsidian displays. Treat the vault like a
codebase: the wiki is the code, you are the compiler.

## Who this vault serves

- Dillon Mohr — marketing operator. Full-time at Align HCM, account manager at
  [[Momentum 360]], plus direct/1099 clients.
- Services: Google Ads, Meta Ads, local SEO, GBP content, landing pages, WordPress.
- Primary directive: ROAD TO 100 CLIENTS (see `System/OS Config.md`).
- Style: direct, execution-focused. Lead with the action, skip the fluff.

## Vault map

| Path | What it is |
|------|------------|
| `INDEX.md` | Front door. Every wiki page + folder index, one line each. Start here. |
| `raw/` | Ground truth. Captures, transcripts, session notes. **Read-only history — never rewrite.** |
| `entities/` | One page per concrete thing: org, person, tool, competitor. (Clients live in `01_Clients/` — link, don't duplicate.) |
| `concepts/` | One page per idea: strategy, pattern, lesson. |
| `00_Inbox` → `07_DBA` | Working folders: clients, campaigns, content, SOPs, offers, personal. Each has its own `* Index.md`. |
| `10_Sessions`, `11_Agents` | Build logs and agent definitions. |
| `System/` | OS config, ops runbooks (see `System/Second Brain Ops.md`). |
| `Daily-Briefs/` | Output of the daily skills (am-report, inbox-brief, pulse). |

## Writing rules (the four rules)

1. **One lesson per file**, with a one-line summary at the top.
2. **Update the existing page instead of creating a duplicate.** Search `INDEX.md`
   and grep before creating anything new.
3. **Delete notes that turn out to be wrong.** A wrong page is worse than no page.
4. **Never touch `raw/`.** Compile from it into `entities/` and `concepts/`; the
   raw file stays exactly as captured.

Plus:

- Every compiled page carries a `source:` link back to the `raw/` file (or vault
  note) it came from. A page without a source gets flagged, not trusted.
- Connect pages with `[[wikilinks]]` as you write — the links are the graph.
- Ship changes as diffs, not claims. If you say you updated a page, the diff proves it.
- New or removed pages ⇒ update `INDEX.md` in the same commit.
- Research findings carry a date and an `expires:` date so stale knowledge
  announces itself.

## Reading rules (the context economy)

The context window is an expensive room. Reading the vault:

1. Start at `INDEX.md`, then **walk the links** — client page → campaign concept
   → competitor page. Never sweep whole folders.
2. Grep for keywords to find pages; open only the pages the trail points at.
3. For big cross-vault questions, **send a subagent**: it reads the fifty pages in
   its own context and returns one paragraph of conclusions here.
4. This file stays under 200 lines. It points at the vault; it never contains it.

## Sync warning

One sync system only: **git**. Do not let a second sync layer (iCloud, Drive,
Obsidian Sync) write these files while the agent works — that is how vaults die
in conflicted copies. Commit checkpoints deliberately.

## Loops

Maintenance runs on schedules, not memory — see `System/Second Brain Ops.md`:

- After every session: `/session-mine` (the SessionEnd hook logs a reminder).
- Nightly: `/vault-compile` on a cheap model.
- Weekly: `/wiki-lint` (graph hygiene) and one `/synthesize` pass on the big model.
- Weekly: `/research-sweep` to feed verified, dated intelligence into the vault.
