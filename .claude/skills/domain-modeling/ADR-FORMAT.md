# ADR Format

Product-local ADRs live in `<product>/docs/adr/` and use sequential numbering: `0001-slug.md`.

Vault-level decisions do not use this folder. They use `12_Brain/04_Decisions/YYYY-MM-DD - <title>.md` and `_templates/Brain Decision.md`.

## Product ADR template

```md
# {Short title of the decision}

{1-3 sentences: context, decision, why.}
```

An ADR can be a single paragraph. Record that a decision was made and why.

## When to offer one

All three must be true: hard to reverse, surprising without context, real trade-off.

Create the directory lazily, only when the first ADR is needed.
