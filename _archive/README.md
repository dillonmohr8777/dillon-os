---
note_type: index
status: active
created: 2026-08-18
updated: 2026-08-18
source_refs: []
tags: [archive, index]
---

# Archive

Sections retired 2026-08-18 because the vault's job is work, automations, and
agents — and these were none of those. Nothing is deleted; full history is in
git, and any folder can be moved back with a single `git mv`.

| Section | Files | Last touched | Why retired |
|---|---|---|---|
| `05_Book` | 5 | 2026-08-01 | Ironic Ineptocracy book project — a venture, not operating work |
| `05_Offers` | 2 | 2026-07-09 | Mohr Media business plan and offer index — superseded, untouched since July |
| `06_Personal` | 1 | 2026-07-09 | A lone index stub |
| `07_DBA` | 3 | 2026-07-09 | Coursework tracker — never referenced by any automation |
| `09_Transcripts` | 1 | 2026-07-29 | Index only; the transcripts themselves were never tracked |

`10_Sessions` was deliberately kept — `session-mine` reads it.

No automation depended on any of these. The only code reference was
`System/scripts/Update-SecondBrainMaps.ps1`, which classifies folders by regex,
so an absent folder simply stops matching.
