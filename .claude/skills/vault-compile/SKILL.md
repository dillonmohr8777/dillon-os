---
name: vault-compile
description: Nightly compile pass — read new 12_Brain/raw/ material and today's changes, update 12_Brain/entities/ and 12_Brain/concepts/ pages with source links, refresh 12_Brain/INDEX.md. Routine work; run on a cheap model.
---

# Vault Compile

You are the compiler: `12_Brain/raw/` is source, `12_Brain/entities/` and `12_Brain/concepts/` are the
build output. Work only inside this vault. **Never edit anything in `12_Brain/raw/`.**

1. Find uncompiled material: `git log --since=yesterday --name-only -- 12_Brain/raw/`
   plus any `12_Brain/raw/` file not yet referenced by a `source:` line
   (`grep -rL` the raw filenames against `12_Brain/entities/ 12_Brain/concepts/`). Also check
   `12_Brain/raw/sessions/` for mined session notes.
2. For each new raw file, extract what matters — decisions, facts about
   clients/tools/people, lessons — and compile it:
   - Concrete thing → `12_Brain/entities/` (clients stay in `01_Clients/`; update the
     client page there instead).
   - Idea/lesson/pattern → `12_Brain/concepts/`, one lesson per file, one-line summary
     at top.
   - **Update the existing page instead of creating a duplicate** — check
     `12_Brain/INDEX.md` and grep for the topic first.
   - Every touched page gets/keeps a `source:` link back to the raw file and a
     fresh `updated:` date. Add `[[wikilinks]]` to related pages.
3. Delete or correct pages the new material proves wrong (note the correction
   and its source on the page).
4. Update `12_Brain/INDEX.md`: add new pages with one-line descriptions, remove deleted ones.
5. Report as diffs, not claims: end with `git diff --stat` and a short list of
   pages touched. If nothing new to compile, say so in one line.
