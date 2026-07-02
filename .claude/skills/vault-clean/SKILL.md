---
name: vault-clean
description: Vault hygiene sweep — stray root files, broken wiki-links, empty notes, and stale inbox items. Reports first, only moves what's unambiguous.
---

# Vault Clean

Hygiene sweep of the vault. Be conservative — report loudly, move rarely.

1. **Stray files** — anything sitting at the vault root that isn't `Dashboard.md`
   or a system file (e.g., loose daily notes, `Untitled*` files, zip archives).
   Propose a destination for each.
2. **Broken links** — scan `[[wiki-links]]` across all notes and list targets
   that don't resolve to a file.
3. **Empty / near-empty notes** — under 3 lines of content.
4. **Stale inbox** — `00_Inbox/` items older than 14 days.

Actions:
- MOVE only files whose destination is unambiguous (e.g., a dated daily note
  into the daily notes area). Log every move.
- NEVER delete anything. NEVER touch `.obsidian/`, `_os/`, `.claude/`, or zips.

Write `Daily-Briefs/vault-clean-YYYY-MM-DD.md` (today's date) with: moves
performed, proposed moves awaiting a human call, broken links, empties, and a
one-line hygiene grade.
