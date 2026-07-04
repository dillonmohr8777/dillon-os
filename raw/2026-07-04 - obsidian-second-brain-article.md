# Capture: Obsidian second-brain system for Fable 5

Source: article/thread shared 2026-07-04 (weeklyaiops.com author). Captured
verbatim as the blueprint this vault's brain layer was built from. Raw — do not edit.

---

I'm going to show you, step by step, how to turn Fable 5 into a machine that knows your business inside out... and ships outputs that look nothing like what everyone else is getting. The tool is a second brain built in Obsidian.

The smartest model on the market ships average work all day for one reason: it knows nothing about you — no context on your business, your audience, your past decisions — so it guesses, and guesses read generic. Plug it into your own knowledge base and the same model becomes a different machine. This holds for any workflow: coding, marketing, content, sales, research. Every file the brain gains makes every future run smarter.

## Same model, different league

- Accounting: a model without the client's history lands ~70% accuracy; with transaction history it starts at 85% and climbs past 90%. Nothing about the model changed, the knowledge did.
- Writing: a mid-tier model with a well-built voice profile produces more recognizable output than Fable 5 with no profile.
- Anthropic's own testing had Fable play a full deck-building game with file-based memory and it improved three times more than the previous flagship (one vendor-run test, unreplicated — but the move it points at costs a folder of markdown).

The model doesn't magically find everything in your notes. It acts on knowledge that lives outside the conversation and cites where every piece came from. The memory is yours, on disk, plain text.

## What Obsidian is

A free app on top of a folder of markdown files. No database, no cloud lock-in. Two features matter: [[wikilinks]] (double brackets connect notes) and the graph view (notes as dots, links as lines). Because the vault is just a folder, Fable works on it directly through Claude Code — the agent reads/writes markdown, Obsidian shows what changed.

## The structure: four pieces, nothing else

From Karpathy's llm-wiki idea: treat the knowledge base like a codebase. Obsidian is the editor, the model is the programmer, the wiki is the code.

- **raw/** — everything captured, untouched: articles, transcripts, call notes, competitor pages. Read-only history; the agent never rewrites it.
- **entities/** — one page per concrete thing: a client, a competitor, a tool, a person.
- **concepts/** — one page per idea: a strategy, a pattern, a lesson.
- **INDEX.md** — the front door: every page listed with a one-line description.

The agent's job is compiling: read new material in raw/, update entity and concept pages, linking as it goes.

Writing rules: one lesson per file with a one-line summary at top; update the existing page instead of duplicating; delete notes that turn out wrong; keep raw sources and compiled pages separate, always.

Why raw/ stays untouched: when the same agent reads and rewrites the same notes repeatedly, details blur and errors compound. Raw is ground truth; the wiki gets smarter on top of it.

## Knowledge graphs: better as it grows

Every [[link]] is an edge. Search-based knowledge bases get noisier as they grow; a linked wiki gets stronger, because every new page connects into the web. The agent walks the links — client page → campaign concept → competitor page — the way you'd follow your own memory. Karpathy's vault: ~100 articles, 400k words, all compiled by the model.

## Populate it with goals

First move is a backfill via /goal in Claude Code: write one finish line, the model works on its own while a smaller judge model confirms when the line is crossed. The judge only sees the conversation, so the goal must demand proof it can read (pasted diffs, pasted INDEX). Feed raw/ first with what you already own: chat transcripts, bookmarks, notes exports, client folders. Two rules keep it honest: every change ships as a diff, never a claim; a page without a source link back to raw/ gets flagged, not trusted.

## Keep it alive with loops

- After every session: a hook mines what happened — decisions, mistakes, patterns — into dated notes.
- Every night: a compile pass on a cheap model reads the day's raw material and updates wiki pages.
- Every week: a lint pass hunts contradictions, duplicate pages, dead links (unmaintained wikis rot).
- Every week: one synthesis pass on the big model reads across the vault and writes what changed, what's drifting, what deserves attention. Only this pass earns the premium model; everything else runs cheap.

## The research workflow that feeds it

Default AI research is one prompt, answer dies in scrollback, built on stale knowledge. The machine instead: one question splits into 3–5 sub-questions; parallel agents fan out across different surfaces (socials for the practitioner layer, web for docs/pricing, scrapers for full text); every finding becomes a receipt (claim + source link + date); a skeptic agent attacks every claim — single-source hype labeled, contradictions surfaced, only survivors pass; verified findings land in the vault as dated, linked pages carrying an expiry date.

Stack mentioned: last30days skill via ScrapeCreators (reddit/X/youtube/IG/tiktok, last 30 days), official X MCP (api.x.com/mcp), yt-dlp for youtube transcripts, Perplexity deep research, Firecrawl for clean-markdown page pulls. Fresh-context checkers outperform a model reviewing its own work — the attack always comes from an agent that didn't do the research.

## Read it without burning money

The context window is an expensive room; everything entering is paid in tokens.
- CLAUDE.md loads every session — the always-paid tax. Keep under 200 lines pointing at the vault, never containing it.
- Everything else is pay-per-read: check INDEX.md, follow links, grep, open only pages the trail points at. Full-folder sweeps never happen.
- Big questions: send a subagent to read fifty pages in its own context and return one paragraph.

## Wire it into everything you build

Three lines in any project's CLAUDE.md:

    ## knowledge
    - before starting, read the relevant pages from ~/vault/entities/ and ~/vault/concepts/
    - ground every claim about our business, clients or audience in a vault page

Outputs change immediately: marketing briefs grounded in real audience pages; content citing your own research and voice profile; coding agents keeping living architecture notes; client deliverables opening with relationship history. Then the vault becomes product: research pages → articles, concept pages → courses, client pages → case studies.

Warning: sync is where vaults die. Run a single sync system — git as the checkpoint layer. If the agent writes files while iCloud syncs them, you get conflicted copies.

## The card

1. Create the vault: raw/, entities/, concepts/, INDEX.md
2. Write the four rules into CLAUDE.md
3. Dump everything you own into raw/
4. Run the /goal backfill with pasted proof and a stop clause
5. Schedule the loops: session hook, nightly compile (cheap tier), weekly lint, one premium synthesis pass
6. Run the weekly research sweep: fan out, skeptic attacks, survivors land as dated pages
7. Add the three knowledge lines to every project's CLAUDE.md

The model in the driver's seat will change again... the vault survives every swap. The smallest version takes an hour: one folder, ten files about your business, and an agent told to read them first.
