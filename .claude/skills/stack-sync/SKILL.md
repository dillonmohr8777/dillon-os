---
name: stack-sync
description: Propagate Model Roster decisions into the places models are actually chosen — vault workflows, codex config.toml, agent specs — as draft diffs Dillon approves file-by-file. The roster decides; this skill wires. Usage - /stack-sync.
---

# Stack Sync

The roster is law; configs follow it. No arguments — the roster drives everything.

## 1. Read the roster

`12_Brain/System/Model Roster.md` — the tier table + per-role rows. If
`expires:` has passed, stop and say "roster is stale — run /model-scout first."

## 2. Inventory the choice-points

Every place a model is named on this machine:

- `.claude/workflows/*.js` — `model:` params in agent() calls (map tier →
  concrete model per the roster)
- `.claude/settings.json` + `~/.claude/settings.json` — model defaults, if set
- `~/.codex/config.toml` — model / model_provider lines (+ note the
  openrouter-free / openrouter-priority variants)
- `11_Agents/*.md` — agent specs that pin a model
- Hermes config — only if/when rebuilt (see [[12_Brain/entities/Hermes]])

NEVER read or touch auth.json, .env, tokens, or anything under
`AppData\Local\hermes`.

## 3. Draft

For each mismatch between config and roster: produce the exact old → new edit.
Write the whole set to `12_Brain/private/proposals/stack-sync-YYYY-MM-DD.md`:
one section per file, a fenced diff block each, the roster line that justifies
it, and a rollback note.

## 4. Gate

Apply NOTHING in this pass. Present the proposal summary (file, change, why).
On Dillon's approval — file-by-file or all — apply each edit, verify it took
(re-read the line), and only then move on. [[12_Brain/concepts/Draft-First Operating Rules|Draft-First Operating Rules]].

## 5. Land it

- Upgrade Log line per applied file (date, file, old → new, roster version).
- Reply with: applied / skipped / pending table + `git diff --stat` for vault
  files (codex config changes are outside the repo — list them explicitly).
