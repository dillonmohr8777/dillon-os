---
note_type: index
status: active
created: 2026-08-18
updated: 2026-09-05
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
| `01_Clients/Fagan Painting` | 2 | 2026-08-01 | Retired client, owner decision 2026-09-05 (`System/client-roster-reconciliation-2026-09-05.md`) |
| `01_Clients/Shadow HVAC` | 60 | 2026-07-12 | Retired client, owner decision 2026-09-05; includes the Next.js site and the creative-factory LP, reel, and hero image |
| `01_Clients/Jeff Hozias.md` | 1 | 2026-07-29 | Retired client, owner decision 2026-09-05 |

`10_Sessions` was deliberately kept — `session-mine` reads it.

No automation depended on any of these. The only code reference was
`System/scripts/Update-SecondBrainMaps.ps1`, which classifies folders by regex,
so an absent folder simply stops matching.

Clients retired 2026-09-05 keep `status: former` (the `Clients.base` "Former" value)
plus `retired:` and `retired_reason:` in frontmatter, so nothing under `_archive/` reads
as active even if a scan reaches it. Recovery: `git mv` the folder back under
`01_Clients/` and set `status: active`.
