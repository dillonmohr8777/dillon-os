---
name: session-mine
description: Mine the session that just happened for decisions, mistakes, and confirmed patterns — write them into raw/sessions/ as a dated note so work already done becomes memory. Run at the end of any session that decided something.
---

# Session Mine

Turn this session's work into memory without Dillon filing anything.

1. Review the conversation (and, if pointed at one, a transcript file) for:
   - **Decisions made** — what was chosen and why.
   - **Mistakes caught** — what went wrong and the fix.
   - **Patterns confirmed** — approaches that worked and should repeat.
   - **Facts learned** — new info about clients, tools, people, numbers.
2. Write `raw/sessions/YYYY-MM-DD - <short-topic>.md` (append a counter if it
   exists). Bullet points, each self-contained, no narrative padding. This is
   a raw capture: once written it is read-only history.
3. Append one line to `raw/sessions/session-log.md`:
   `- YYYY-MM-DD — <topic> (mined)`.
4. Do **not** compile into entities/concepts here — that's `/vault-compile`'s
   job on the nightly pass. One exception: if the session proved an existing
   wiki page factually wrong, fix that page now and cite the session note as
   source.
5. If the session made no decisions worth keeping, say so and write nothing.
