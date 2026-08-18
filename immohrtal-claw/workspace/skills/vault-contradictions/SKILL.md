---
name: vault-contradictions
description: Find vault notes that disagree with each other and surface them for a decision. Never auto-resolves.
---

# Vault contradictions

The vault supersedes rather than deletes, so two notes can both look current.
This finds those pairs and hands them to Dillon.

## When to use

A number or status looks wrong, two answers conflict, or he asks what in the
vault is stale.

## Tools

`kb_search` across the topic, then `kb_open` on each candidate with the same
question so the excerpts are comparable.

## How

1. Search the topic broadly, then open the top notes with an identical query.
2. Compare `updated:` frontmatter. Newer usually wins, but say so rather than
   assuming: a generated rollup can be newer than the truth it summarizes.
3. Report each conflict as: claim A `path:line` (updated X), claim B
   `path:line` (updated Y), and which one the evidence favours.
4. Recommend which should be corrected. Do not correct it.

## Stop conditions

- Different scopes are not a contradiction. A client-level number and a
  roster-level number can both be right; check before flagging.
- Generated maps restate other notes. Exclude them unless the conflict is
  actually inside the map itself.
- If the vault agrees with itself on the topic, say so and stop.

## Approval boundary

Read and report only. Never edit `12_Brain/`, `01_Clients/`, or `System/` to
resolve a conflict. Deciding which version is true is the operator job; your
job is making the disagreement visible.
