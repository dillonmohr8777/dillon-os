# QWEN38 Ingest Evidence Plan — 2026-09-17 (Muse loop executor)

**Run:** `muse-prompt-20260917-200101` / handoff `20260917-200050-qwen38-max-ingest-evidence-pack`
**Executor:** Muse Spark 1.3 Contributor, loop mode. Qwen Desktop untouched. No second Muse spawned.
**Sources ingested (all 6, in order):**
1. `Documents\qwen\QWEN38-MAX-ORCHESTRATOR-EVIDENCE-AND-MODEL-SWARM-2026-09-17.md`
2. `Documents\qwen\QWEN38-MAX-JEV-SWARM-ORCHESTRATOR-BRIEF-2026-09-17.md`
3. `Documents\Codex\projects\muse-asset-hub\UNION-ALPHA-EVIDENCE-DAILY-OPS-JULY1-2026-09-17.md` (§1–33 + sibling seeds)
4. `Documents\Codex\projects\muse-asset-hub\CODEX-SESSIONS-THIS-WEEK-2026-09-17.md` (256 rollouts)
5. `Documents\Codex\projects\muse-asset-hub\SLACK-THIS-WEEK-HARVEST-PARTIAL-2026-09-17.md`
6. `Documents\qwen\JEV-FLURRY-OPERATING-LAW-2026-09-17.md`
   Plus: `JEV-OPTIONS-CONTRACT.md`, `20260917-194500-openrouter-vs-muse-cost-intel.md`.

**Dillon status carried in:** Telegram phone ping DONE. Local Control phone DEFER (not on Wi-Fi). Vercel team budget $25 DONE.

---

## Top 10 tasks from evidence (ranked)

| # | Task | Evidence anchor | Gate |
|---|---|---|---|
| 1 | HubSpot→Jason deliverability: get REAL numbers, then one Slack to Jason | UNION §16/§26-U2; handoff item A; Slack Jason GDM "yessir ill work on it" | BLOCKED until HubSpot read auth / PC CRM token. No invented metrics. Draft-only. |
| 2 | Philly / PM5-3D FINISH via existing Muse YOLO (Blender MCP) | UNION §8/§26-U1; orchestrator "tonight #1" | One Muse only. No Higgsfield. Nudge existing session, do not spawn. |
| 3 | Telegram FINISH: `qwen channel status` on PC, verify live | UNION §16/§26-U3; orchestrator "tonight #3" | Do not kill Qwen Desktop. Status/pairing only. |
| 4 | ChatGPT Ads login with momentumlocalseo@gmail.com | Handoff item B | CEO/Muse investigating. If MFA/login wall: write `BLOCKED-chatgpt-ads-<stamp>.md` + `.READY`, tell Dillon exact URL. |
| 5 | AI Marketing Service pages help (Mac's AEO/upsell ask) | UNION §26-U5; Slack #momentumsites 9/17 | Draft-only. No send. |
| 6 | Nexla GTM: publish HubSpot-success tag, fix conversion hygiene | UNION §4-nexla / §26-U8 | Needs GTM publish access. Code-heavy lane. |
| 7 | Fagan estimates form: verify fixed in prod | UNION §26-U6; Slack #fagan-painting fire drill | Explore/verify only; Phil owns web fix. |
| 8 | LC $25 / spend facts: confirm without inventing | UNION §26-U4; orchestrator "tonight #4" | Vercel $25 DONE per Dillon; confirm LC billing on PC only. |
| 9 | Slack paginate toward ~58 + nightly evidence append | UNION §21 (next cursor PAGE:7); orchestrator "tonight #5" | Read-only. Append delta, don't rewrite history. |
| 10 | Bar Crawl Sept execution + Puttery Ads/GA4 invite chase | UNION §26-U7/U9 | Draft-only until Andy approval / client IT grants. |

**Explicitly DEFERRED (not tonight):** paid founder films M01/S01/MS01 (needs Dillon credit budget, handoff C); Local Control phone (needs Dillon on Wi-Fi, handoff D); Empeon interview follow-ups (calendar-bound, U10).

---

## Closed option sets for Jev (5 files to emit)

Schema: `handoff/JEV-OPTIONS-CONTRACT.md` (`jev-options.v1`, ≤255 options). Jev picks; Jev never crafts.

### 1. `philly-3d.jev-options.json`
```json
{
  "schema": "jev-options.v1",
  "prompt": "Route Philly/PM5-3D FINISH (Blender MCP craft on PC)",
  "options": [
    {"id": "muse-execute", "label": "Nudge existing Muse YOLO to finish PM5-3D"},
    {"id": "draft-only", "label": "Stage storyboard/assets only, no render"},
    {"id": "defer", "label": "Defer to next session"},
    {"id": "block", "label": "Needs Dillon (Blender access/decision)"}
  ],
  "max_options": 255
}
```
Recommended lean: `muse-execute` (existing session only).

### 2. `hubspot-jason.jev-options.json`
```json
{
  "schema": "jev-options.v1",
  "prompt": "Route HubSpot→Jason deliverability (must include block-no-numbers)",
  "options": [
    {"id": "block-no-numbers", "label": "Withhold Slack: no real HubSpot numbers yet"},
    {"id": "explore-luna", "label": "Luna digests HubSpot/portal docs only, no send"},
    {"id": "code-flash", "label": "Flash lane probes HubSpot read auth path"},
    {"id": "muse-execute", "label": "Muse pulls portal numbers on PC (if token exists)"},
    {"id": "draft-only", "label": "Draft Jason reply, do not send"}
  ],
  "max_options": 255
}
```
Recommended lean: `block-no-numbers` until auth exists; else `draft-only`.

### 3. `telegram-status.jev-options.json`
```json
{
  "schema": "jev-options.v1",
  "prompt": "Route Telegram FINISH verification",
  "options": [
    {"id": "qwen-only", "label": "Run qwen channel status / check-tg.ps1 on PC"},
    {"id": "muse-execute", "label": "Muse runs status probe, no restart"},
    {"id": "defer", "label": "Defer; phone ping already DONE"},
    {"id": "block", "label": "Needs Dillon (pairing/QR)"}
  ],
  "max_options": 255
}
```
Recommended lean: `qwen-only`.

### 4. `ai-service-pages-mac-ask.jev-options.json`
```json
{
  "schema": "jev-options.v1",
  "prompt": "Route Mac AI Marketing Service pages help",
  "options": [
    {"id": "draft-only", "label": "Draft pages, no send"},
    {"id": "code-flash", "label": "Flash lane scaffolds page drafts"},
    {"id": "muse-execute", "label": "Muse crafts designed HTML/PDF"},
    {"id": "defer", "label": "Defer on bandwidth"}
  ],
  "max_options": 255
}
```
Recommended lean: `draft-only`.

### 5. `slack-paginate-to-58.jev-options.json`
```json
{
  "schema": "jev-options.v1",
  "prompt": "Route Slack pagination + nightly evidence append",
  "options": [
    {"id": "explore-luna", "label": "Luna paginates from cursor PAGE:7, read-only"},
    {"id": "qwen-only", "label": "Qwen paginates + appends nightly delta"},
    {"id": "defer", "label": "Defer to nightly cron"}
  ],
  "max_options": 255
}
```
Recommended lean: `explore-luna` or `qwen-only`.

---

## Ownership: Muse vs Gateway video vs Luna (+ rest of swarm)

| Lane | Owns tonight | Does NOT own |
|---|---|---|
| **Muse Spark 1.3 Contributor YOLO** (one session) | PC craft: PM5-3D/Blender nudge, FINISH packs, local file ops, ChatGPT Ads login probe, HubSpot pull IF token exists | Second sessions, Qwen settings, Slack/email sends, spend |
| **Gateway video** (Veo/Kling/Wan/Seedance/Grok Imagine/MiniMax) | NOTHING tonight — no storyboard + no Dillon budget gate | Any render/spend. No Higgsfield ever. |
| **Luna** (cheap explore) | Slack pagination read-only, Gmail/session digests, cost-intel summaries, draft-only reconciliations | Sends, code writes beyond digest scripts |
| Astra | Review/critique of Luna digests + GPT-6 Astra guide alignment | Execution |
| Sol / DeepSeek flash / Qwen flash | Small probes: HubSpot auth path, GTM tag check, Fagan prod verify | Long jobs |
| Terra / Devin (capped ≤3) | Heavy coding overflow only if flash fails | First pick |
| 311 Plus / Union Alpha | Coding paste bursts if Terra/Muse capped | Daily boss role |
| Jev | Picks from the 5 option sets above | Writing code/NL, films, Blender |

**Cost routing (from cost intel):** daily/agent work stays on `meta/muse-spark-1.3-contributor` (or Gateway ladder); full Muse/frontier only when needed; never dump mega-sessions on Pareto ($2.50/$7.50, 29× Contributor).

---

## Hard gates restated
No invented metrics. No Slack/email sends unless Dillon names recipient+body. One Muse YOLO. No Higgsfield. Keep Qwen Desktop alive. Draft/stage default. Append nightly deltas; don't rewrite history.
