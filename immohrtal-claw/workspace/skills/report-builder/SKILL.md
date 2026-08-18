---
name: report-builder
description: Build a sourced report and write it into the vault Daily-Briefs folder locally.
---

# Report builder

The one skill that writes into the vault, and only into `Daily-Briefs/`.

## When to use

Dillon wants a brief, a rollup, or a status report kept as a file.

## Tools

`kb_search` then `kb_open` to gather, `second_opinion` for consequential calls,
then `brief_write`.

## How

1. Gather first, write second. Do not draft against memory alone.
2. Name the file `YYYY-MM-DD - <subject>.md`.
3. Open with frontmatter: `note_type: report`, `status: draft`,
   `updated: <today>`, and `source_refs:`.
4. Structure: what changed, evidence with `path:line`, open risks, next action.
5. Mark every unverified claim `UNVERIFIED`. A report that hides its gaps is
   worse than a short one.
6. Run `second_opinion` before writing if the report recommends spend, a client
   change, or anything outward-facing. Include contradictions the checker raised.

## Stop conditions

- `brief_write` refuses to overwrite by default. Do not pass `overwrite` unless
  Dillon asked to replace that exact file.
- If sources are thin, write the short honest version and say what is missing.
- Never write outside `Daily-Briefs/`. There is no tool for it and that is deliberate.

## Approval boundary

Local file write only. Writing a brief is not delivering it. No send, no publish,
no deploy, no spend. Dillon reads it and decides.
