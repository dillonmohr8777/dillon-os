# Craft Stack Map — GPT Image 2.5 + Hyperframes (Momentum social ads)

**Machine:** DESKTOP-4AHKEC4 (`feeac9f6-8347-4372-8943-e8ab69a3adf0`)  
**Scan:** 2026-09-10 ~18:47–19:05 ET (re-verified ~18:58–19:00 ET — Hyperframes 0.8.33 / 50 renders / 5 today; Codex AppX 26.903.9818.0; gpt-image-2 impeccable; Adobe NLE absent; App Builder skills on box)  
**Rules:** local disk READ only; no Slack/email send  
**Mirrors:** `C:\Users\dillo\repos\dillon-os\System\CEO-DEEP-DIVE-2026-09-10\` + `/workspace/ceo-deep-dive/`

---

## Executive answer

| Question | Answer |
|---|---|
| Is **GPT Image 2.5** runnable locally as a separate install? | **No.** No `.chatgpt`, no standalone GPT-Image app, no local `gpt-image` folders/plans under Desktop/Downloads/Documents/dillon-os. Images 2.5 is a **ChatGPT/Codex product + API** feature (released ~2026-09-08), not a desktop binary. |
| How do you open “ChatGPT” on this PC? | Shortcuts labeled ChatGPT launch **OpenAI Codex** (`OpenAI.Codex` AppX) whose main GUI binary is `ChatGPT.exe`. GPU-safe wrappers remapped those shortcuts to `Start-CodexNoGpu.ps1`. |
| Preferred motion stack? | **Hyperframes** — local clone + `.hyperframes` CLI home + Claude skills installed; **50** successful renders; **5** successful renders logged **today** (early AM ET). Prefer over Higgsfield (legacy only). |
| Best harness for Momentum social ads? | **Hyperframes CLI + Claude skills** for video/motion; **ChatGPT/Codex desktop (Images 2.5)** or **Images API** for stills; Claude Design guide for first drafts when MCP works. **Not** Agents API as primary craft path; **not** Higgsfield. |

---

## 1. GPT Image 2.5 / ChatGPT image generator — installs, shortcuts, folders

### Present

| Path / item | Role |
|---|---|
| `C:\Program Files\WindowsApps\OpenAI.Codex_26.903.9818.0_x64__2p2nqsd0c76g0\` | Installed **OpenAI.Codex** AppX (version 26.903.9818.0) |
| `...\app\ChatGPT.exe` | Codex desktop GUI binary (~4.6 MB) — process name agents watch |
| `...\app\Codex.exe` | Companion Codex binary |
| `C:\Users\dillo\AppData\Local\OpenAI\Codex\` | Local OpenAI/Codex support (`bin\`, `runtimes\`, chrome-native-hosts) — updated **2026-09-10 ~4:23 PM ET** |
| `C:\Users\dillo\.codex\` | Codex home / tools |
| `C:\Users\dillo\AppData\Local\Codex\` | Large local Codex ops estate (AccessBroker, Higgsfield folder, Reliability, etc.) |
| `C:\Users\dillo\Documents\Codex\` | Session/day folders + projects (includes `2026-09-10\`) |
| `C:\Users\dillo\OneDrive\Desktop\ChatGPT.lnk` | Shortcut display name ChatGPT → **Codex No-GPU starter** |
| `C:\Users\dillo\OneDrive\Desktop\ChatGPT Stable No GPU.lnk` | Same |
| `C:\Users\dillo\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\ChatGPT.lnk` | Same |
| `...\Programs\ChatGPT Stable No GPU.lnk` | Same |
| `C:\Users\dillo\AppData\Local\Codex\Reliability\chatgpt-start-preference.json` | Preference stamp **2026-09-10 22:51 UTC** (~6:51 PM ET): Store tile name “ChatGPT”; AppIDs `OpenAI.Codex_2p2nqsd0c76g0!App` and `Dillon.Codex.ChatGPTGpuOff`; relaunch → `Start-CodexNoGpu.ps1` |
| `C:\Users\dillo\.codex\tools\Start-CodexNoGpu.ps1` | Launcher that targets `ChatGPT.exe` / AppX `OpenAI.Codex` |

### Missing / not found

- `C:\Users\dillo\.chatgpt` — **missing**
- `AppData\Roaming\ChatGPT` / `AppData\Local\ChatGPT` — **missing**
- Dedicated “GPT Image 2.5” installer, plan folder, or shortcut under Desktop / Downloads / Documents / dillon-os — **none**
- Filename matches for `gpt-image` / `GPT Image` / `Image 2.5` under `.codex`, `Documents\Codex\2026-09-10`, `dillon-os\System` — **none**

### Product context (public, not local proof of plan tier)

OpenAI shipped **ChatGPT Images 2.5** ~2026-09-08 for ChatGPT / ChatGPT Work / **Codex** (desktop, mobile, web). API models: `gpt-image-2.5-flare`, `gpt-image-2.5-sunburst`. Local evidence shows Codex desktop is installed and branded as ChatGPT; **plan tier / quota is not stored as a local “plan file”** — verify in-app account settings if needed.

**Runnable locally?** Yes, **inside Codex/ChatGPT desktop** (and/or web). **Not** as a standalone local image-generator app or script found on disk.

---

## 2. Images generated today (2026-09-10) that look like GPT Image outputs

| Finding | Detail |
|---|---|
| PNG/JPG/WEBP modified today under Downloads (depth 2) | **None** found |
| Today’s creative media | **Video**, not stills — see Claude-videos folders |
| `C:\Users\dillo\Downloads\Claude-videos-2026-09-10\` | `momentum-360-anatomy-of-a-lead*.mp4`, `...search-term...mp4` (early AM ET) |
| `C:\Users\dillo\Downloads\Claude-videos-stage-2026-09-10\` | Same clips + `sep9-ai-division-launch-ads.zip`, `sep9-paper-craft-brand-film.zip` (~6:12 PM ET) |
| Hyperframes render log (not file paths) | `.hyperframes\config.json` `recentRenders`: 5× `ok:true` at **2026-09-10 06:37–06:53 UTC** (~2:37–2:53 AM ET) |

**Conclusion:** No clear GPT-Image stills dated today on the searched trees. Today’s craft output on disk is **Hyperframes/Claude video** work for Momentum 360, plus staged zip packages.

---

## 3. Hyperframes (preferred) vs Higgsfield (legacy)

### Hyperframes — live

| Path | Role |
|---|---|
| `C:\Users\dillo\repos\hyperframes\` | Local clone of `heygen-com/hyperframes` (also public under `dillonmohr8777/hyperframes`) |
| `...\skills\` | Upstream skills: `hyperframes`, `hyperframes-cli`, `hyperframes-media`, `hyperframes-registry`, adapters (gsap, animejs, three, …), `remotion-to-hyperframes`, `website-to-hyperframes` |
| `...\docs\guides\claude-design-hyperframes.md` | Claude Design → Hyperframes draft guide |
| `...\docs\guides\hyperframes-vs-remotion.mdx` | Comparison doc |
| `C:\Users\dillo\.hyperframes\` | CLI home: `config.json`, `install-state.json`, registry cache |
| `C:\Users\dillo\.hyperframes\config.json` | `latestVersion` **0.8.33**; `commandCount` **258**; `renderSuccessCount` **50**; skills check **2026-09-10**; recent renders today (see §2) |
| `C:\Users\dillo\.claude\skills\hyperframes*` | Installed Claude skills: `hyperframes`, `hyperframes-animation`, `hyperframes-audio`, `hyperframes-cli`, `hyperframes-core`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-registry` |
| Related Claude skills | `motion-graphics`, `general-video`, `media-use`, `video-analyze` under `.claude\skills\` |
| MCP baseline | `LOCAL-CAPABILITIES.md` (2026-09-05): **HyperFrames** connector connected |

Studio/dev entry from monorepo: `bun run studio` / `npx skills add heygen-com/hyperframes` (upstream README). Local renders in-repo are mostly **test fixtures** under `packages\producer\tests\` (Aug dates), not today’s campaign masters — today’s masters appear under Downloads Claude-videos / Hyperframes success IDs in config.

### Higgsfield — legacy (do not prefer)

| Path | Role |
|---|---|
| `C:\Users\dillo\Documents\Codex\Higgsfield\outputs\` | Last notable: `bridge-og-20260904\` (Sep 4) |
| `C:\Users\dillo\AppData\Local\Codex\Higgsfield\` | Local Higgsfield ops folder |
| `C:\Users\dillo\Downloads\hf_2026*.mp4/png` | Many `hf_` assets dated ~Sep 7 (download timestamps) |
| Box plugin | `/home/box/agent-data/plugins/cache/cursor-public/higgsfield/` |
| MCP | Higgsfield listed connected in Sep 5 baseline — still available, but **user preference is Hyperframes** |

---

## 4. Adobe-related skills on the box

### Adobe App Builder (found) — not Premiere/AE creative suite

Plugin: **Adobe App Builder** (`cursor-public/app-builder`).

Canonical skill paths (also under `/home/box/sand-data/...` = same tree as `agent-data`):

| Skill | Path |
|---|---|
| `appbuilder-action-scaffolder` | `/home/box/agent-data/plugins/cache/cursor-public/app-builder/253f56901e058800ccb97ffd5bf1e3329d5f2e00/skills/appbuilder-action-scaffolder/SKILL.md` |
| `appbuilder-cicd-pipeline` | `.../skills/appbuilder-cicd-pipeline/SKILL.md` |
| `appbuilder-e2e-testing` | `.../skills/appbuilder-e2e-testing/SKILL.md` |
| `appbuilder-project-init` | `.../skills/appbuilder-project-init/SKILL.md` |
| `appbuilder-testing` | `.../skills/appbuilder-testing/SKILL.md` |
| `appbuilder-ui-scaffolder` | `.../skills/appbuilder-ui-scaffolder/SKILL.md` |

### Not found

- No **Premiere / After Effects / Photoshop / Illustrator / Firefly** skill directories under `managed-skills`, `workflows`, or `.claude\skills`
- No Adobe Creative Cloud install: `C:\Program Files\Adobe` and `(x86)` **absent**; no Adobe entries in Uninstall registry scan
- `/home/box/agent-data/workflows` — ops workflows only (Protocol 54, Mohr Media, etc.); **no Adobe workflows**
- `/home/box/agent-data/managed-skills/skills` — Grok Bot platform skills (box-desktop, shopping, …); **no Adobe creative skills**

**Interpretation:** “Adobe skills” on this box = **App Builder / Experience Cloud scaffolding**, not NLE craft. Momentum ads craft should not assume Premiere/AE local toolchain.

---

## 5. Claude sessions this week — Hyperframes + design cleanup (paths/notes only)

### Paths that mention Hyperframes / design (this week estate)

| Path | Note |
|---|---|
| `C:\Users\dillo\.claude\agents\content-producer.md` | Video/motion: **mandatory start at `hyperframes` skill**; Claude Design MCP failing (`FIRST_PARTY_AUTH_REJECTED`, seen 2026-09-09) — route via Hyperframes/local build |
| `C:\Users\dillo\.claude\LOCAL-CAPABILITIES.md` | HyperFrames (+ Higgsfield) MCP connected as of 2026-09-05 baseline |
| `C:\Users\dillo\.claude\projects\C--Users-dillo--claude\memory\ai-division-launch-state.md` | **Claude Design** collateral canvas (8 artboards) + `deliverables\2026-09-07-ai-division-collateral-canvas\` |
| `C:\Users\dillo\.claude\agents\web-product-builder.md` / `skill-selector.md` | Hyperframes mentions |
| `C:\Users\dillo\repos\dillon-claude-config\agents\web-product-builder.md` | Mirror |
| `C:\Users\dillo\.claude\HANDOFF-2026-09-09.md` | Week handoff (agent roster / cleanup) |
| `C:\Users\dillo\.claude\.last-cleanup` | Stamp **2026-09-10 21:01 UTC** (~5:01 PM ET) |
| Plans (mtime ≥ Sep 3) mentioning Momentum/design/hyperframe keywords | `plans\cosmic-brewing-kahn.md`, `federated-cuddling-toast.md`, `proud-kindling-pie.md`, `quiet-wibbling-wilkes.md`, `wobbly-mapping-rossum.md` |
| Prior deep-dive | `/workspace/ceo-deep-dive/CLAUDE-WEEK-CLEANUP.md` — cleanup themes Sep 3–10 (roster, registry, worktrees); design-system drift called out as corrected |

---

## 6. Public GitHub — `dillonmohr8777`

`gh` works (logged in as **dillonmohr8777**).

| Metric | Value |
|---|---|
| Public repos visible via `gh repo list` | **26** (not 34 — count may include deleted/renamed, org repos, or a prior snapshot) |

### Video / Hyperframes / agents / ads–related public names

| Repo | Why relevant |
|---|---|
| `hyperframes` | “Write HTML. Render video. Built for agents.” |
| `Open-Generative-AI` | Self-hosted image/video studio fork |
| `Open-LLM-VTuber` | Local voice/Live2D video |
| `claude-ads` | Paid ads audit/creative skill pack |
| `nt-main-2-social-ad` | Social ad |
| `workflow-voiceover-claude-edit` | Voiceover edit handoff |
| `align-hcm-maher-brent-chatcut` | Chatcut / edit |
| `agentic-inbox` | Agent mail |
| `jason-fallon-hubspot-agent` | Momentum HubSpot agent |
| `rockbot` | Local operating-team console |
| `camofox-browser` | Agent browser |
| `claude-skills-repo` | Skills dump |
| `Google-Flash` | “for designing” |
| Design/site foreshadow | `bigorange-marketing-homepage`, `immohrtal-kimi-redesign`, `bridge-discovery-prototype-kimi-design`, `nkcdc-phase-two-growth-proposal` |

Local (may be private): `C:\Users\dillo\repos\dillon-os-films`, `claude-ads`, `hyperframes`, etc.

---

## Preferred craft stack for professional Momentum social ads

```
Stills / key art     →  Codex/ChatGPT desktop Images 2.5  (or Images API Flare/Sunburst)
                         [not a separate local GPT-Image binary]
Motion / social ads  →  Hyperframes (Claude skills + CLI + studio)
                         entry: .claude\skills\hyperframes* + repos\hyperframes
Design first draft   →  Claude Design guide (docs/guides/claude-design-hyperframes.md)
                         note: Design MCP auth broken as of 2026-09-09 — use file attach / Hyperframes
Polish / edit        →  Local video skills (motion-graphics, general-video); NOT Adobe NLE (not installed)
Avoid as default     →  Higgsfield (legacy outputs only)
```

### Best harness recommendation

| Option | Verdict for Momentum ads |
|---|---|
| **Hyperframes UI/CLI + Claude skills** | **BEST primary** — installed, skills current, renders succeeding today, content-producer mandates it |
| **Claude (local)** | **BEST for authoring** compositions + cleanup; use Design guide when MCP broken |
| **ChatGPT/Codex desktop Images 2.5** | **BEST for stills / reference frames** — already on desktop as `ChatGPT.exe` |
| **Local script / Images API** | Good for batch stills (`gpt-image-2.5-flare` volume, `sunburst` polish) once API key scoped — no local wrapper found ready-made |
| **OpenAI Agents API** | **Wrong primary** for craft — optional managed Codex coding/research harness (`/workspace/agents-api-integration/`); spend-gated; not the ad renderer |
| **Higgsfield UI** | **Deprecate** for new Momentum work per preference |

**Practical pipeline:** Claude (+ Hyperframes skills) author → `hyperframes` preview/render → optional GPT Image 2.5 stills into compositions → stage under Downloads / dillon-os-films → human approve before publish.

---

## Quick path index

```
ChatGPT/Codex GUI     C:\Program Files\WindowsApps\OpenAI.Codex_*\app\ChatGPT.exe
ChatGPT shortcuts     OneDrive\Desktop\ChatGPT*.lnk  +  Start Menu\Programs\ChatGPT*.lnk
Codex No-GPU start    C:\Users\dillo\.codex\tools\Start-CodexNoGpu.ps1
Hyperframes repo      C:\Users\dillo\repos\hyperframes
Hyperframes CLI home  C:\Users\dillo\.hyperframes
Claude HF skills      C:\Users\dillo\.claude\skills\hyperframes*
Today videos          C:\Users\dillo\Downloads\Claude-videos-2026-09-10\
Adobe App Builder     /home/box/agent-data/plugins/cache/cursor-public/app-builder/.../skills/
Agents API notes      /workspace/agents-api-integration/
This report           ...\CEO-DEEP-DIVE-2026-09-10\CRAFT-STACK-GPT-IMAGE-HYPERFRAMES.md
                      /workspace/ceo-deep-dive/CRAFT-STACK-GPT-IMAGE-HYPERFRAMES.md
```
