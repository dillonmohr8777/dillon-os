---
tags: [handoff, marketing-chief, verification]
created: 2026-07-24
mode: verify-only — no deploy, merge, publish, or canonical queue writes
source_pr: https://github.com/dillonmohr8777/dillon-os/pull/208
---

# Marketing Chief Operator Studio — Cursor verification

## Confirmed

Cursor cloud agent checked out PR [#208](https://github.com/dillonmohr8777/dillon-os/pull/208) branch `codex/marketing-chief-dashboard-access-2026-07-24` and can **read + run** the studio snapshot at `_os/marketing-chief-operator-studio`.

Collaboration contract accepted:
- `_os/marketing-chief-operator-studio/CURSOR_ACCESS.md`
- `handoffs/marketing-chief-dashboard-cursor-access-2026-07-24.md`

## Local verification (this host)

From `_os/marketing-chief-operator-studio` (Node v22.14.0):

| Command | Result |
|---|---|
| `npm ci` | ok (0 vulnerabilities at install) |
| `npm run lint` | ok |
| `npm test` | build ok + **4/4** rendered HTML tests passed |
| `npm audit` | **0** vulnerabilities |

Provenance matches contract: Sites v14, canonical commit `72df5db1fc71398bcfb983586564bbd856079371`. Seed present at `data/seed-snapshot.json` (redacted 21-client snapshot per README/PRODUCT).

## Boundaries still in force

- Live ChatGPT Site + Sites source repo remain canonical.
- No bypass token / OpenAI session used or stored.
- No deploy, merge, publish, spend, credential rotation, or canonical queue writes without Dillon’s separate approval.
- Weekend/open-loops artifact remains [PR #206](https://github.com/dillonmohr8777/dillon-os/pull/206).

## Working posture going forward

Inspect / test / propose changes via branch + PR against this snapshot. Treat Windows Marketing Chief as sole canonical queue writer.
---
