---
name: to-spec
description: Turn the current conversation into a spec and save it as a vault project note. No interview, just synthesis of what you have already discussed.
disable-model-invocation: true
command_deck: false
---

# To spec

Take the current conversation and codebase understanding and produce a spec. Do **not** interview Dillon. Synthesize what you already know. If the idea is still foggy, stop and say to run `grill-with-docs` first.

Do not create GitHub issues. Publishing issues is an external action. The spec lives in `12_Brain/05_Projects/YYYY-MM-DD - <title>.md` using `_templates/Brain Project.md`.

## Process

1. Explore the repo if you have not already. Use glossary vocabulary. Respect decisions in the area you are touching.
2. Sketch the seams at which the feature will be tested. Prefer existing seams. The fewer seams, the better. Confirm the seams.
3. Write the spec with the sections below, then save the project note. Set `status: proposed` until Dillon accepts it.

## Spec body

### Problem Statement

The problem from Dillon's perspective.

### Solution

The solution from Dillon's perspective.

### User Stories

A numbered list of user stories: "As a <role>, I want <capability>, so that <outcome>." Cover the feature, including failure and empty states.

### Implementation Decisions

Modules, interfaces, architectural choices, schema or API contracts. Do not include specific file paths or code snippets unless a prototype produced a decision-rich fragment.

### Testing Decisions

What a good test is here, which modules are tested, and prior art in the repo.

### Out of Scope

Named exclusions.

### Approval boundary

What remains gated (send, publish, deploy, spend, merge, account change).

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Tracker is the vault project note, not GitHub issues.
