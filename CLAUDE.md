# D.I.L.L.O.N. OS — Vault Instructions

This repo is Dillon Mohr's Obsidian vault and second brain. You (the agent) read
and write the same markdown files Obsidian displays. Treat the vault like a
codebase: the wiki is the code, you are the compiler.

## Canonical brain layer

The second-brain layer lives under **`12_Brain/`**.

- Front door: `12_Brain/INDEX.md`
- Ops runbook: `12_Brain/System/Second Brain Ops.md`
- **Do not create `1Z_Brain/`** or any competing brain tree.

## Who this vault serves

- Dillon Mohr — marketing operator. Full-time at Align HCM, account manager at
  [[12_Brain/entities/Momentum 360|Momentum 360]], plus direct/1099 clients.
- Services: Google Ads, Meta Ads, local SEO, GBP content, web design, landing
  page design, WordPress.
- Primary directive: ROAD TO 100 CLIENTS (see `System/OS Config.md`).
- Style: direct, execution-focused. Lead with the action, skip the fluff.

## Vault map

| Path | What it is |
|------|------------|
| `12_Brain/INDEX.md` | Front door. Every wiki page + folder index, one line each. Start here. |
| `12_Brain/raw/` | Ground truth. Captures, transcripts, session notes, research receipts. **Read-only history — never rewrite.** |
| `12_Brain/entities/` | One page per concrete thing: org, person, tool, competitor. (Clients live in `01_Clients/` — link, don't duplicate.) |
| `12_Brain/concepts/` | One page per idea: strategy, pattern, lesson. |
| `12_Brain/projects/` | Active delivery threads and goals. |
| `12_Brain/decisions/` | Bi-temporal decision log (what was chosen, when, why, what it supersedes). |
| `12_Brain/research/` | Compiled research landing (raw receipts in `12_Brain/raw/research/`). |
| `12_Brain/memory/` | Bi-temporal memory: `current/` believed state, `as-of/` point-in-time snapshots. |
| `12_Brain/protocols/` | Agent protocols distilled from `11_Agents/` + King Agent OS patterns. |
| `12_Brain/bases/` | Native Obsidian Bases (Clients, Projects, Decisions). |
| `12_Brain/templates/` | Brain-specific note templates. |
| `00_Inbox` → `07_DBA` | Working folders: clients, campaigns, content, SOPs, offers, personal. |
| `10_Sessions`, `11_Agents` | Build logs and agent definitions. |
| `System/` | OS config + health automation (`System/routine-health.md`). |
| `Daily-Briefs/` | Output of the daily skills (am-report, inbox-brief, pulse). |
| `_os/` | D.I.L.L.O.N. OS HUD — reads this vault live (`node _os/server.js`). |

## Writing rules (the four rules)

1. **One lesson per file**, with a one-line summary at the top.
2. **Update the existing page instead of creating a duplicate.** Search
   `12_Brain/INDEX.md` and grep before creating anything new.
3. **Delete notes that turn out to be wrong.** A wrong page is worse than no page.
4. **Never touch `12_Brain/raw/`.** Compile from it into entities/concepts; the
   raw file stays exactly as captured.

Plus:

- Every compiled page carries a `source:` link back to the `12_Brain/raw/` file
  (or vault note) it came from. A page without a source gets flagged, not trusted.
- Connect pages with `[[wikilinks]]` as you write — the links are the graph.
- Ship changes as diffs, not claims.
- New or removed pages ⇒ update `12_Brain/INDEX.md` in the same commit.
- Research findings carry a date and an `expires:` date so stale knowledge
  announces itself.

## Reading rules (the context economy)

1. Start at `12_Brain/INDEX.md`, then **walk the links**. Never sweep whole folders.
2. Grep for keywords to find pages; open only the pages the trail points at.
3. For big cross-vault questions, **send a subagent**.
4. This file stays under 200 lines. It points at the vault; it never contains it.

## Sync warning

- **Git is the source of truth** for this repository and for agent writes.
- Obsidian Sync may be used by the human operator on a signed-in desktop for
  reading/light edits, but do not race Sync + an agent rewriting the same files.
- Live Sync verification (desktop vault matching this Git tree) is an operator
  gate after merge.

## Loops

See `12_Brain/System/Second Brain Ops.md`:

- After every session: `/session-mine` (SessionEnd hook logs a reminder).
- Nightly: `/vault-compile` on a cheap model.
- Weekly: `/wiki-lint` and one `/synthesize` pass on the big model.
- Weekly: `/research-sweep` to feed verified, dated intelligence into the vault.
