# Vault Clean Report — 2026-09-03

**Hygiene grade: B−.** Structure and sourcing are sound. Two real problems:
40 dead wikilinks concentrated in 5 missing targets, and 3 live ad playbooks
that expired a month ago.

| Metric | Count |
|---|---|
| Files moved | 1 |
| Files reported, not moved | 8 |
| Broken wikilinks (real) | 40 |
| Expired pages | 10 |
| Stale inbox items (>14d) | 0 |

## Moves performed

- `GROK-HANDOFF-DILLON-OS.md` → `12_Brain/01_Captures/`

A dated third-party handoff document is source material, so it belongs in the
immutable capture layer. Nothing linked to it by path, and Obsidian resolves the
one inbound reference in `10_Maps/Generated/09 Other Connected Notes.md` by
basename, so the move breaks no links.

## Reported, not moved

Six empty `Untitled` scratch files sit at the vault root: `Untitled 1.base` and
`Untitled 2.canvas` through `Untitled 6.canvas`.

These were deliberately left in place. `12_Brain/queue/` is defined as pending
ingest payloads, which empty scratch stubs are not, so no destination is
unambiguous. `09_Ops/Health.md` also carries an open `empty_scratch_base`
warning asking a human to either name `Untitled 1.base` and give it a view or
remove it after review. Relocating the file would have silently closed that
question. Vault-clean never deletes, so these need a human call.

`2026-06-04.md` at the root is empty. It needs archiving or deletion, which is
also a human call.

`AGENTS.md` at the root is correct where it is. It is the agent instruction
contract, referenced by name from the Grok handoff, and is not stray.

## Broken wikilinks

40 real broken links across `12_Brain/`, out of 1667 checked. They collapse into
five missing targets, so five files would fix nearly all of them.

| Missing target | Inbound links |
|---|---|
| `12_Brain/01_Captures/2026-06-26 - intel-core-7-master-operating-transfer` | 16 |
| `12_Brain/01_Captures/2026-07-04 - full-autonomy-directive` | 6 |
| `12_Brain/03_Concepts/Second Brain Architecture` | 6 |
| `02_Campaigns/Ads Ops/Ads Ops Hub` | 3 |
| `12_Brain/01_Captures/2026-07-04 - lost-clients-confirmation-2` | 2 |

The remaining stragglers are single references to `Prospect Radar`,
`Blissful Zen Spa`, `12_Brain/registry/automations`, and a Slack capture at
`2026-09-01 - jason-fallon-snap-fitness-pa-request`.

Two further hits are false positives, not defects. The capture
`2026-07-04 - obsidian-second-brain-article.md` uses `[[wikilinks]]` and
`[[link]]` as prose examples inside an article about Obsidian.

Three of the missing targets are cited in `source_refs`, which means pages
currently claim evidence that is not in the vault. That is the most serious
finding here, because it weakens the sourcing guarantee rather than just
the navigation.

## Expired knowledge

10 of the 18 pages carrying an `expires:` date are past it. Three are live
operating knowledge rather than archive:

| Page | Expired |
|---|---|
| `03_Concepts/Meta Lead Ads Optimization 2026.md` | 2026-08-04 |
| `03_Concepts/Conversion Tracking Setup 2026.md` | 2026-08-04 |
| `03_Concepts/Google Ads Conversion Optimization 2026.md` | 2026-08-04 |

These are the playbooks behind active Google Ads and Meta Ads client work, and
they have been stale for a month. Refreshing them is the highest-value item in
this report.

The other seven are `06_Research/` Grok daily intelligence notes from 2026-07-30
through 2026-08-05. Dated daily research aging out is expected behaviour, not
rot.

## Stale inbox

No item in `00_Inbox/` is older than 14 days.

## Method note

An earlier version of this report was wrong and has been replaced. The first
scanner split filenames on spaces and treated the alias in `[[path|display]]`
as part of the path, which produced fabricated broken links and a false claim
that source attribution was incomplete. The corrected scan resolves aliases and
anchors and handles spaces. Every count above comes from the corrected run.
