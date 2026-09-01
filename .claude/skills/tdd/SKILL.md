---
name: tdd
description: Test-driven development. Use when building features or fixing bugs test-first, mentioning red-green-refactor, or wanting tests at a public seam.
command_deck: false
---

# Test-Driven Development

TDD is the red → green loop. Consult this file before and during the loop, not after.

When exploring the codebase, read the nearest `CONTEXT.md` or `12_Brain/09_Ops/engineering-glossary.md` so names match the domain language.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. A good test reads like a specification and survives refactors.

See [tests.md](tests.md) and [mocking.md](mocking.md).

## Seams

A **seam** is the public boundary you test at. Tests live at seams, never against internals.

Before writing any test, write down the seams and confirm them. No test is written at an unconfirmed seam.

Ask: "What's the public interface, and which seams should we test?"

When the shape of that interface is itself in question, call `codebase-design` if present. Otherwise keep the seam at the highest public interface that already exists.

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests private methods, or verifies through a side channel.
- **Tautological** — the assertion recomputes the expected value the way the code does. Expected values must come from an independent source of truth.
- **Horizontal slicing** — all tests first, then all implementation. Work in vertical slices: one test, one implementation, repeat.

## Rules of the loop

- Red before green. Write the failing test first, then only enough code to pass it.
- One slice at a time. One seam, one test, one minimal implementation per cycle.
- Refactoring is not part of this loop. It belongs to `code-review`.

Dillon OS: do not weaken `public-safety`, maker/checker separation, or approval gates to make a test pass.

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
