# CONTEXT.md Format

## Structure

```md
# {Context Name}

{One or two sentence description of what this context is and why it exists.}

## Language

**Order**:
{A one or two sentence description of the term}
_Avoid_: Purchase, transaction
```

## Rules

- Be opinionated. When multiple words exist for the same concept, pick the best one and list the others under `_Avoid_`.
- Keep definitions tight. One or two sentences. Define what it is, not what it does.
- Only include terms specific to this context. General programming concepts do not belong.
- Group terms under subheadings when natural clusters emerge.

## Dillon OS placement

- Product trees get their own `CONTEXT.md`.
- Vault-wide engineering language lives in `12_Brain/09_Ops/engineering-glossary.md`.
- Do not add a root `CONTEXT.md` that restates `CLAUDE.md` or `AGENTS.md`.
