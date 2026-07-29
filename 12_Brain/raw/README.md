# 12_Brain/raw/ — ground truth

Everything captured lands here untouched: articles, transcripts, call notes,
competitor pages, session mining output. **Read-only history — the agent never
rewrites a file in this folder.**

Why: when the same agent reads and rewrites the same notes over and over,
details blur and errors compound. This folder is the ground truth the wiki is
compiled from; `12_Brain/entities/` and `12_Brain/concepts/` keep getting smarter on top of it.

## Conventions

- Filename: `YYYY-MM-DD - short-title.md`
- Add a one-line header saying what it is and where it came from (URL, call,
  session), then paste the material verbatim.
- Session mining output goes in `12_Brain/raw/sessions/`.
- Research receipts go in `12_Brain/raw/research/`.
- Compiled pages in `12_Brain/entities/` and `12_Brain/concepts/` link back here via `source:`.
