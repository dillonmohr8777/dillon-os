---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, which also creates docs (decisions and glossary) as we go.
disable-model-invocation: true
command_deck: false
---

Call the Skill tool twice, for "grilling" and "domain-modeling".

This is the default grill inside Dillon OS. It runs the same interview as `grill-me`, and it leaves a paper trail:

- Glossary terms land in the product `CONTEXT.md` if you are in a product tree (`_os/`, `immohrtal-site/`, a client website), otherwise in `12_Brain/09_Ops/engineering-glossary.md`.
- Hard-to-reverse decisions land in `12_Brain/04_Decisions/` using the vault decision schema, not a parallel `docs/adr/` at the vault root.

Do not create GitHub issues, send mail, publish, or deploy from this skill. Stop at shared understanding plus the docs you actually wrote.
