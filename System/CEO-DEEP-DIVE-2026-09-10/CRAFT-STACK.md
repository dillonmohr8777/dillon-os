# Craft Stack — Hyperframes + GPT Image 2.5 + Claude Design

**Scan addendum:** 2026-09-10 ~18:48–18:55 ET  
**Preference:** Hyperframes over Higgsfield for new motion. Claude Design (not Quad/Fable) for interactive/static design flush. GPT Image 2.5 for still plates when generating.

Hard floor unchanged: local draft only; no publish/spend/send unless exact approval.

---

## Preferred stack (CEO routing)

| Layer | Prefer | Deprioritize / legacy |
|---|---|---|
| Motion / HTML→MP4 | **Hyperframes** (`npx hyperframes@0.8.33`, skills under `.claude\skills\hyperframes*`) | Higgsfield credit burns for new pieces; reuse existing HF plates only as texture sources |
| Still generation | **GPT Image 2.5** (API model id `gpt-image-2` via impeccable `generate-image.mjs`) | Unnamed image APIs; do not invent model names |
| Interactive / ebook / collateral design | **Claude Design** + Claude Code (Sonnet 5 default per MODELS.md) | **Fable / Mythos / Quad** — MODELS.md says skip Fable for Design flush |
| Style lock for paper-craft films | `paper-craft-video\STYLE-CONTRACT.md` + receipt JSON | Re-deriving palette from reference PNGs every session |

---

## 1. Hyperframes

### Install / runtime
| Path | Role |
|---|---|
| `C:\Users\dillo\repos\hyperframes` | Upstream monorepo (HeyGen open source); packages core/engine/cli/studio |
| `C:\Users\dillo\.hyperframes\config.json` | Local CLI state: latest **0.8.33**, `renderSuccessCount=50`, skills healthy, last skills check 2026-09-10 03:05Z |
| `C:\Users\dillo\.hyperframes\cache\` | CLI cache |
| `.claude\skills\hyperframes` (+ `hyperframes-animation|audio|cli|core|creative|keyframes|registry`) | **Mandatory entry skill** for any video/motion ask |
| `.codex\skills\hyperframes*` | Parallel Codex skill copies |

Agent contract (`.claude\agents\content-producer.md`): video/animation/motion **must** start at `hyperframes`; do not hand-roll a renderer. Claude Design MCP auth failure is a one-line blocker, not a stop — route through Hyperframes or local build.

### Live house pipeline (Hyperframes-native)
**`C:\Users\dillo\repos\dillon-os\_os\automation\paper-craft-video\`**

- `build.mjs` pins `hyperframes@0.8.33`; receipt → check → render → ffprobe → `verification.json` → optional `--deliver`
- `STYLE-CONTRACT.md` — measured paper-craft palette (accent core `#1F3E55`, Momentum blue family)
- `receipts\` — five dated films (Built Not Templated; Anatomy of a Lead + rebuild + vertical; Anatomy of a Search Term)
- `build\` — generated Hyperframes projects per film (gitignored regenerable)
- Never uploads/posts/spends

### Hyperframes project already in client-ops
`...\momentum-360\deliverables\2026-09-09-ai-division-launch-ads\`  
Contains `hyperframes.json`, `compositions\`, `renders\`, `snapshots\`, `IMAGE-PROMPTS.md`, `AGENTS.md`, `CLAUDE.md`.

### Recent renders (from `.hyperframes\config.json`)
Five successful renders early 2026-09-10 UTC (~02:37–02:53 ET) — matches paper-craft Anatomy rebuild window.

---

## 2. GPT Image 2.5

### Explicit naming on disk
- `...\2026-09-09-ai-division-launch-ads\IMAGE-PROMPTS.md` line 3: **"For GPT Image 2.5 (or any image model)."** Paper-craft / scrapbook style block + negatives (no purple/neon/glassmorphism/text/logos).
- Generator implementation uses API model id **`gpt-image-2`**:
  - `C:\Users\dillo\.claude\skills\impeccable\scripts\generate-image.mjs`
  - Mirror: `C:\Users\dillo\.grok\skills\impeccable\scripts\generate-image.mjs`
  - Bills to user's OpenAI key; scripts warn before first render
- Marketplace note: `.claude\plugins\marketplaces\open-design\README.md` lists Images → `gpt-image-2`

### Related still pipelines (not GPT Image 2.5)
- `...\2026-09-07-google-aistudio-batch\` — Google AI Studio batch (stills/clips/composites/reel); separate lane
- Downloads `hf_*.mp4/png` — **Higgsfield** exports (legacy plate library), not Hyperframes

**CEO rule:** when generating new stills for Momentum paper-craft / launch ads, prefer IMAGE-PROMPTS + GPT Image 2.5 / `gpt-image-2`. Freeze outputs locally before Hyperframes composites.

---

## 3. Claude Design outputs (CLAUDE, not Quad)

### Authoritative brief
`...\deliverables\2026-09-07-ai-division-claude-design\`

| File | Role |
|---|---|
| `CLAUDE-DESIGN.md` | Build order for Friday Command Center + ebook flush; Prompt 00 brand lock |
| `MODELS.md` | **Sonnet 5** default for Design; Sonnet 4.6 fallback; one Opus 5 pass optional; **skip Fable 5 / Mythos** |
| `COLLATERAL.md`, `POSITIONING.md`, `VIDEO-PLAN.md`, `MARKETING-PLAN.md` | Division packaging |
| `interactive\`, `pdfs\` | Seeds / leave-behinds |

### Heavy Claude Design export trees
| Path | Scale / note |
|---|---|
| `...\2026-09-08-claude-design-exports\` | **Huge** (~13.5k PNGs, 67 MP4s, zips, receipts). Status: `ALL-TODAY-CLAUDE-DESIGN-STATUS.md`, Gmail asset index (delivery receipts — do not re-send) |
| `...\2026-09-08-claude-design-ebooks\` | Canvas + PDFs + HTML collateral |
| Vault `01_Clients\Momentum 360\AI Division Library\` | Catalog: **39 Claude Design MP4s** in snapshot; links to claude.ai/design projects |

Claude Design MCP on this machine: **`FIRST_PARTY_AUTH_REJECTED`** (seen 2026-09-09). Work continues via exported files + Hyperframes/local; do not claim design is impossible.

### Explicit non-targets
- **Fable / Quad:** MODELS.md excludes Fable for this flush; do not route Design work to Fable/Mythos.
- Archaeology only: old Align `claude-designed-deliverables` under dated Codex session folders (Jul/Aug) — not the live Momentum craft stack.

---

## 4. Higgsfield (legacy — prefer Hyperframes)

Still present and useful as **source plates**, not the default new-render path:

- AI Division Library `source--*-higgsfield-*.MP4` (+ GitHub release assets)
- Downloads `hf_20260829`–`hf_20260907` mp4/png (~141 MB video + ~48 MB png)
- Plans (`proud-kindling-pie.md`): **Track D — video batch, zero new Higgsfield credits**; lint-passed Hyperframes sources waiting on render
- Older approval memory: Higgsfield approved for Momentum AI collateral historically — superseded for *new* motion by Hyperframes preference

Logo rule (unchanged across stacks): generative tools make plates; composite verified mark locally.

---

## 5. Deliverable map (non-3D masters this week)

| Piece | Source of truth | Staged copy |
|---|---|---|
| Built Not Templated | paper-craft receipt + deliverables `2026-09-09-paper-craft-brand-film` | Downloads `Claude-videos-2026-09-09\` |
| Anatomy of a Lead (+ rebuild, vertical) | paper-craft receipts + `2026-09-10-paper-craft-*` | Downloads `Claude-videos-2026-09-10\` |
| Anatomy of a Search Term | same | same |
| AI division launch ads | `2026-09-09-ai-division-launch-ads` Hyperframes project | Downloads `...\ai-division-launch-ads\` |
| Claude Design films/ebooks | `2026-09-08-claude-design-*` | AI Division Library + Downloads zips |

---

## Open questions (craft-specific)

1. Is Claude Design MCP still `FIRST_PARTY_AUTH_REJECTED` today, or re-authed since Sep 9?
2. Should Downloads `hf_*` and claude-design-exports PNGs (~4.5 GB class) be archived off primary disk given power-loss risk?
3. Confirm OpenAI key path for `gpt-image-2` impeccable script without unlocking Bitwarden (env vs Access Broker).
4. Are launch-ads Hyperframes compositions fully rendered, or still snapshot-only for some spots?
5. Align VIDEO-PLAN Higgsfield credit language with "prefer Hyperframes" so agents stop proposing HF spend by default.


---

## Daily craft health — 2026-09-11 ~9:31 AM ET

**Overall: DEGRADED (not broken).** No Higgsfield burn. No social post. Keys present. Notify Dillon: **no** (pipeline not fully down; box fallback green).

| Layer | Status | Evidence |
|---|---|---|
| Hyperframes CLI / repo | OK | `repos\hyperframes` present; `.hyperframes\config.json` latest **0.8.34**, skills healthy, `renderSuccessCount=50`, last 5 recentRenders ok (2026-09-10 ~02:37–02:53 ET); 8 `.claude\skills\hyperframes*` |
| Hyperframes PC agent render | DEGRADED | MAI01 `render-log.txt`: Chrome cannot start (`chrome-headless-shell` `--version UNKNOWN`). Draft mp4 may exist from earlier path; agent Shell render blocked until browser binary fixed |
| Hyperframes box fallback | OK | `npx hyperframes@0.8.33` → `0.8.33`; Chrome `/usr/bin/google-chrome-stable`; Storyboard20 MAI01–MAI06 DRAFT-FONT mp4s rendered under `/workspace/ai-division/production/2026-09-11-storyboard20/` |
| paper-craft-video | OK (receipts) / note | Pipeline root + `STYLE-CONTRACT.md` + `build.mjs` present; **5 receipts** (Built Not Templated 9/9; Anatomy Lead + rebuild + vertical; Search Term 9/10). `build\` exists (5 entries); no `verification.json` found on this scan |
| GPT Image 2.5 / `gpt-image-2` | OK | `IMAGE-PROMPTS.md` names GPT Image 2.5; impeccable `generate-image.mjs` model `'gpt-image-2'`; `OPENAI_API_KEY` set in PC env (value not logged) |
| Claude Design exports | OK | `2026-09-07-ai-division-claude-design` (23 files); `2026-09-08-claude-design-exports` (~14820 files); `2026-09-08-claude-design-ebooks` (115 files) |
| Higgsfield | HOLD | No new credit use this run |

**Content Craft policy note (2026-09-11 lock):** MAI soft-clay/cream geometric plates + Remotion/GSAP free stack preferred for new Content Craft pilots; Hyperframes scrapboard kits deprioritized. House paper-craft Hyperframes pipeline remains the verified receipt path for prior brand films. Prefer Hyperframes over Higgsfield when HTML→MP4 is required.

**Open follow-ups (agents, not Dillon ping):** fix PC `HYPERFRAMES_BROWSER_PATH` / `hyperframes browser ensure`; decide whether to regenerate paper-craft `verification.json` artifacts; archive oversized claude-design-exports when disk pressure bites.

