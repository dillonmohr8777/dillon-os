---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a CONTEXT.md, or recording a hard-to-reverse decision.
command_deck: false
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This skill is for when you are changing the model, not just consuming it. Reading a glossary for vocabulary is a one-line habit any skill can do.

## Where files live in Dillon OS

Do not create a competing docs tree at the vault root.

| Need | Location |
|---|---|
| Product glossary | `CONTEXT.md` in that product tree (`_os/`, `immohrtal-site/`, `01_Clients/<name>/website/`, `mohr-media-site/`) |
| Vault-wide engineering glossary | `12_Brain/09_Ops/engineering-glossary.md` |
| Hard-to-reverse decision | `12_Brain/04_Decisions/YYYY-MM-DD - <title>.md` with the vault decision schema |
| Product-local ADR (only inside a product folder) | `<product>/docs/adr/NNNN-slug.md` |

Create files lazily. If no glossary exists, create one when the first term is resolved.

Format for glossaries: [CONTEXT-FORMAT.md](CONTEXT-FORMAT.md). Format for product ADRs: [ADR-FORMAT.md](ADR-FORMAT.md). Vault decisions use `_templates/Brain Decision.md`.

## During the session

- When Dillon uses a term that conflicts with the glossary, call it out immediately.
- When language is vague or overloaded, propose one canonical term.
- Stress-test domain relationships with concrete edge-case scenarios.
- When Dillon states how something works, check whether the code or vault agrees. Surface contradictions.
- Update the glossary inline when a term is resolved. No implementation details in a glossary. It is a glossary and nothing else.

## Offer a decision note sparingly

Only offer to create a `12_Brain/04_Decisions/` note (or a product ADR) when all three are true:

1. Hard to reverse.
2. Surprising without context.
3. The result of a real trade-off.

If any of the three is missing, skip it.

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). File locations are Dillon OS specific.
