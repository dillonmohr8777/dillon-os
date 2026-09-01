---
name: implement
description: Build the work described by a spec or project note, driving tdd at pre-agreed seams and closing with code-review. Use when Dillon is ready to implement a grilled, specced change.
disable-model-invocation: true
command_deck: false
---

# Implement

Build the work described by a spec or `12_Brain/05_Projects/` note.

1. Read the spec, the glossary, and the relevant decisions.
2. Confirm seams. If they were never agreed, stop and return to `to-spec` or `grill-with-docs`.
3. Call `tdd`. One red-green slice at a time.
4. When the slices covering the spec are green, call `code-review` against the branch base. If you were the maker, you cannot be the passing checker. Hand to `qa-critic` or another identity.
5. Stop at a reviewable local artifact. Commit and push only when Dillon already asked to ship a branch. Never merge, deploy, send, publish, or change an account.

Website work still follows `frontend-build`, `ui-design`, and the site-factory pipeline. This skill does not replace those.

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Approval gates are Dillon OS specific.
