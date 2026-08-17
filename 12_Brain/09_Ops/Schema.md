---
note_type: schema
status: active
updated: 2026-07-29
tags:
  - brain
  - schema
  - system
---

# Canonical Properties

Use only the properties a note needs. Property names are lowercase snake case.

## Required on compiled brain notes

| Property | Meaning |
|---|---|
| `note_type` | `capture`, `entity`, `concept`, `decision`, `project`, `research`, `review`, `memory`, `dashboard`, or `system` |
| `status` | Lifecycle state appropriate to the note type |
| `created` | First creation date |
| `updated` | Most recent meaningful update date |
| `source_refs` | Wikilinks or URLs supporting the note |
| `tags` | Small classification list |

## Execution properties

| Property | Meaning |
|---|---|
| `owner` | One accountable owner |
| `client` | Link or exact canonical client name |
| `area` | Stable responsibility area |
| `outcome` | Binary finish line |
| `next_action` | One concrete next move |
| `due` | Date commitment |
| `review_on` | Next scheduled review |
| `priority` | `critical`, `high`, `normal`, or `low` |

## Evidence and time

| Property | Meaning |
|---|---|
| `observed_at` | When the vault learned the fact |
| `valid_from` | When the fact became true |
| `valid_to` | When it stopped being true; blank while current |
| `confidence` | Number from 0 to 1 |
| `expires` | Date after which research must be revalidated |
| `supersedes` | Link to a corrected or replaced note |
| `verification_status` | `verified`, `partial`, `unverified`, or `disputed` |

## Status vocabulary

- Projects: `proposed`, `active`, `blocked`, `waiting`, `done`, `cancelled`.
- Decisions: `proposed`, `active`, `superseded`, `reversed`.
- Research: `draft`, `verified`, `partial`, `expired`.
- Memory: `active`, `superseded`, `retired`.
- Captures: `unprocessed`, `compiled`, `archived`.

## Rules

- One owner per outcome.
- One canonical note per entity, concept, project, or decision.
- Lists stay lists; dates use `YYYY-MM-DD`.
- Never add a raw password, token, cookie, code, payment detail, or personal
  address.
