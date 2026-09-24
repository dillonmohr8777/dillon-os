---
note_type: reference
status: draft
updated: 2026-09-19
client_id: momentum-360
source_refs:
  - "01_Clients/Momentum 360/AI Division Library/asset-manifest.json"
  - "C:/Users/dillo/Documents/Codex/2026-09-19/update-me-on-eveyrthint-all-muse/overnight-muse-spark-audit-2026-09-19.md"
---

# AI Division asset manifest supplement - 2026-09-19

Status: draft provenance supplement. This file does not modify the canonical asset-manifest.json, does not claim full media QA, and does not approve publication.

## Base manifest

- Canonical manifest: C:\Users\dillo\repos\dillon-os\01_Clients\Momentum 360\AI Division Library\asset-manifest.json
- Base snapshot: 2026-09-08; 168 payload files; SENT_AND_VERIFIED private delivery.
- AI01 stronger-opening derivatives require separate reconciliation. AI04's earlier open-replacement status is superseded by the recovered completion receipt and exact hash matches below.

## New dated source locators

| Source ID | Local source | Artifact | SHA-256 | Provenance / status |
|---|---|---|---|---|
| 3D-ANATOMY-2026-09-18 | C:\Users\dillo\Documents\Codex\2026-09-18\create-this-exact-thing-goal-c\index.html | Single-file Three.js anatomy source | 0B9FA2A80B8DA4EA43969E5BB69461EBCB711A4A6681FF5BC5D37D9BD7DC1B3D | Muse turn artifact; local file exists; desktop/live claim exists in rollout; mobile QA open; draft incorporation only |
| 3D-ANATOMY-2026-09-19 | C:\Users\dillo\Documents\Codex\2026-09-19\live-and-fleshed-out-no-16\index.html | Reference-human/expanded anatomy source | 90D5B192A87A34EBEA2733724C22F89950AC7965D8D504AA33A5833A63900EB3 | Local file exists; treat as a distinct derivative until visual and license/provenance review |
| VIDEO-MAI01 | C:\Users\dillo\Documents\ai-division-production\2026-09-10\MAI01\MAI01-F01-DRAFT-FONT.mp4 | Draft video | 19959602AE78A30CFE0A39E343D6BDB55BAFD846C9FD0555DA838CC49FE81D0F | Local draft; Hyperframes logs nearby; no publication approval |
| VIDEO-MAI06 | C:\Users\dillo\Documents\ai-division-production\2026-09-10\MAI06\MAI06-F02-DRAFT-FONT.mp4 | Draft video | 174546830AC8F09A0EAA98CF1DE3325248D04CE26C754C4689BA204AE8F8A7B5 | Local draft; no publication approval |
| VIDEO-MAI11 | C:\Users\dillo\Documents\ai-division-production\2026-09-10\MAI11\MAI11-F03-DRAFT-FONT.mp4 | Draft video | 5147D0C1B5076F412808EEB44D191C5C26739918C600991CC4A9F211D180E7C0 | Local draft; no publication approval |
| VIDEO-MAI16 | C:\Users\dillo\Documents\ai-division-production\2026-09-10\MAI16\MAI16-F04-DRAFT-FONT.mp4 | Draft video | 103213D7D5A35FDE5115AA0DB1CC0B6650CC90B331A2AEC150CE6AD5DDB8817E | Local draft; no publication approval |
| VIDEO-MAI21 | C:\Users\dillo\Documents\ai-division-production\2026-09-10\MAI21\MAI21-F05-DRAFT-FONT.mp4 | Draft video | C2D3FBE65252E59B4C80A49206F3D4E59112B2B36356F07CC39CC6075CA824EF | Local draft; no publication approval |
| HIGGSFIELD-2026-09-01 | C:\Users\dillo\repos\dillon-os-films\12_Brain\07_Reviews\MCP\2026-09-01 - higgsfield.md plus .json | Higgsfield MCP/source review | N/A (knowledge record) | Provenance locator only; generated media not identified in a fresh manifest |
| GROK-INDEXED | C:\Users\dillo\repos\dillon-os-films\_os\automation\incoming\grok\ and 12_Brain\01_Captures\Grok\ | Grok ingest/capture records | N/A (mixed records) | Latest indexed files found Aug 5 or earlier; freshness unverified |
| 3D-LIVE-READBACK | https://momentum-ai-agent-anatomy.netlify.app | Deployed 3D page | N/A | September 19 parent GET returned HTTP 200, 21,752 bytes, title Anatomy of an AI Agent; interaction/mobile QA and exact source-to-release match remain unverified |

## Dedupe and approval scheme

### Recovered existing work, September 19 continuation

- Existing Muse hub: `C:/Users/dillo/Documents/Codex/projects/muse-asset-hub/LATEST-WORKFLOW-EVIDENCE.md`. Its numbered folders are junctions to existing projects, not independent asset copies. Use resolved targets when deduplicating.
- AI Marketing pages: `muse-asset-hub/ai-marketing-service-pages-2026-09-17/deliverables/` contains the hub, AI Design, ChatGPT Ads, and AEO/GEO HTML files. ZIP SHA-256 `85E33330C8D623A8BA2265DF747B7D8ED52BBA7CC9245771EAE84A7446914EFE`. Gmail `1a0b0531cd080782` verifies September 17 self-delivery and explicitly says local draft, not WordPress publication. No need to rebuild these.
- AI04: `client-operations/clients/momentum-360/deliverables/2026-09-08-claude-design-exports/AI04-REPAIR-COMPLETION-RECEIPT.md` marks COMPLETE FOR LOCAL REVIEW. Both MP4s were hashed September 19 and match the receipt: landscape `aa6a5fe731dec288e1d324a8ff3f3118dbe857b03e896ed619b980e04ad9a08a`; portrait `26e1a6d16b1a97118351f33010860d8d2e506f45aa83e92d4567817cafced6d3`. Their location is `ai04-repair-completion/opaque-review-mp4/`. Preserve these accepted replacements; do not regenerate from the stale base-manifest todo.
- Momo: `muse-asset-hub/MOMO-VIDEO-FINISH-2026-09-17.md` provides batch receipts and explicitly documents its earlier sandbox coverage limits. It points to three Higgsfield source uploads under `original-five-completion/review`, rather than a complete new Higgsfield production inventory. File count is not concept count.
- Actual game: `muse-asset-hub/AGENCY-WARS-3D-STORYLINE-FINISH-2026-09-18.md` points to `client-operations/clients/momentum-360/work/philadelphia-service-world/.claude/worktrees/codex-resume-mobile-fps`. The September 18 city-campaign JSON and screenshots exist under the parent project's `evidence/agency-wars/`. The dated checkpoint reports city tests 12/12 and old-flow tests 8/33 while a port was in progress. These are historical tests, not a current green release. This is separate from Anatomy and from the hub's `11-philly-game` junction to `C:/Users/dillo/repos/philly-game`.

1. Dedupe key is source_id + SHA-256; identical hashes collapse to one payload while preserving every source alias and session ID.
2. A changed hash creates a new revision row; never overwrite the prior source locator. Record supersedes, session ID, timestamp, and exact local path.
3. Provenance fields required for incorporation: producing session ID, model/provider turn evidence, local source path, SHA-256, creation timestamp, tool/export receipt, and any external URL or Drive/GitHub locator.
4. Approval state is one of draft, review_required, approved_private, published, or rejected. These entries are draft or review_required only.
5. Media QA is separate from existence: file presence and hash do not establish visual quality, rights, mobile behavior, audio sync, or publication approval.
6. Incorporate into the canonical manifest only after dedupe, provenance, media QA, and explicit private/public approval gates pass.

## Pending revision queue

- AI01: two stronger-opening Chain Reaction derivatives pending.
- AI04: replacement exports complete for local review with current hash verification; final external approval/publication remains separate.
- 3D anatomy: mobile QA and local release receipt pending.
- Higgsfield/Grok: fresh generated-asset manifests pending.
