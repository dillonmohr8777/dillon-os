# Weekly image generation

Replaces the deleted `bok-facebook-weekly-pdf-scheduler` automation's use of
`System/scripts/Invoke-OpenAIImage.ps1`. Calls
`POST https://api.openai.com/v1/images/generations` directly (stdlib
`urllib`, no CLI wrapper, no SDK), with augmentation left on and a real
per-destination size instead of a forced 1024x1024 square.

## This lane generates only

**Nothing here posts, schedules, uploads to a client account, or touches
Meta.** `generate.py` writes PNG files to `out/<client>/<week>/<slot>.png`
and appends one ledger row per image. Dillon reviews the PNGs and posts them
himself, the same as any other creative-foundry deliverable.

## Run it

```
cd C:\Users\dillo\repos\dillon-os\_os\automation\weekly-images
python generate.py --brief briefs/bok-law-firm.json
```

- `--week 2026-W38` — override the ISO week (default: current week).
- `--slot monday` — generate only one slot.
- `--dry-run` — print what would be generated, no API call, no cost.

The key is read from `[Environment]::GetEnvironmentVariable('OPENAI_API_KEY','User')`
into the one Python process at call time. It is never written to a file or
printed. Example (Git Bash):

```
export OPENAI_API_KEY="$(powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('OPENAI_API_KEY','User')")"
python generate.py --brief briefs/bok-law-firm.json
unset OPENAI_API_KEY
```

## Idempotency

Re-running never regenerates an image. A `(client, week, slot)` that already
has a `ledger.jsonl` row whose `path` still exists on disk is skipped. Before
adding a new brief or slot, check `ledger.jsonl` for an existing title/sha256
first — this is the same asset-ledger discipline as the rest of
creative-foundry, just scoped to this one client folder for now.

## Sizes

Facebook wants 1200x630 for link posts and ~1080x1080 for square posts, but
the live API requires width and height both divisible by 16 (confirmed by
two independent real HTTP 400s on 2026-09-14 against 1200x630 and 1080x1080:
`Width and height must both be divisible by 16`). Nearest valid sizes are
used, same aspect ratio to within Facebook's tolerance. `generate.py`
asserts divisibility-by-16 before every call (`validate_size`) so a bad size
in a brief fails immediately with the nearest valid size named, instead of
silently burning a weekly run:

| format | requested | actual |
|---|---|---|
| `feed_square` | 1080x1080 | 1088x1088 |
| `feed_link` | 1200x630 | 1216x640 |
| `feed_portrait` | 1080x1350 (4:5) | 1088x1360 |

`feed_portrait` was added 2026-09-14 for the scrapbook-infographic direction:
portrait gives an infographic room to breathe and is Facebook's
best-performing feed ratio, so it replaced `feed_square`/`feed_link` for all
three `bok-law-firm` slots in that revision.

## Logo compositing

The image model cannot draw a client's real logo accurately — it will
approximate BOK's circular brush emblem and get it wrong. So the brief
prompt instead reserves a clean, uncluttered patch (roughly the lower-right
20% of the image width, no torn paper/tape/doodles/shadow crossing it), and
`generate.py` composites the real frozen logo file onto that patch itself,
in-process, before the PNG is ever written to disk. This runs automatically
on every generation for any client listed in `generate.py`'s `LOGO_PATHS`
dict — nothing extra to run.

- `LOGO_PATHS["bok-law-firm"]` points at
  `C:\Users\dillo\Documents\Codex\projects\client-operations\clients\bok-law-firm\deliverables\2026-07-28-august-september-social-content\assets\bok-law-logo.png`
  (1511x1468, RGBA, alpha already present).
- `composite_logo()` scales the logo to ~18% of the output image's width
  (preserving aspect ratio, so it never distorts), then pastes it
  bottom-right with a ~3% margin using true alpha compositing (Pillow's
  `alpha_composite`, not a flat paste), so it needs no separate knockout.
- **Hard failure, not a silent skip**: `composite_logo()` raises
  `AssertionError` if the logo file is missing, or if it has no alpha
  channel (`"A" not in logo.getbands()`). A client with no entry in
  `LOGO_PATHS` at all just gets no logo composited (unconfigured, which is
  different from missing).
- The ledger row's `sha256`/`bytes` are computed from the **final,
  logo-composited** PNG bytes, never the pre-composite render — dedup and
  the ledger both reflect what's actually on disk. `logo_composited` and
  `logo_path` are recorded per row.
- Self-check: `test_generate.py` asserts both failure modes (missing file,
  no-alpha file) actually raise, plus the `feed_portrait` size mapping.

### Flare vs Sunburst

Both `gpt-image-2.5-flare` and `gpt-image-2.5-sunburst` were released
2026-09-08 on this key; `chatgpt-image-latest` is a trap despite its name —
it dates to 2025-12-16, nine months older, and is not used here.
`System/IMAGE-API-INTEGRATION.md` (installed 2026-09-12) already documents
the split and this brief follows it rather than spending an image to
rediscover it: **Flare** is for routine artwork and fast iteration; use it
for repeat/lower-stakes weekly slots. **Sunburst** is the slower, higher-
precision tier for premium client artwork and precision edits — that is
what this brief uses for all three BOK slots. If a future client wants
faster/cheaper iteration over top-end finish, switch that brief's `model`
to `gpt-image-2.5-flare`.

## Cost

Measured on the original square test generation (2026-09-14, `bok-law-firm` /
`2026-W38` / `monday`, 1088x1088, quality `high`, model
`gpt-image-2.5-sunburst`): **$0.056225**, from the API's own reported usage
(241 text-input tokens, 1834 image-output tokens) at gpt-image-2.5-sunburst's
published per-token rates ($5/1M text-input, $30/1M image-output). `cost_usd`
is computed and stored per row in `ledger.jsonl` the same way, from that
row's real `usage` object — never a guess.

At the larger `feed_portrait` size (1088x1360), measured on the three real
scrapbook-infographic generations (2026-09-14, `bok-law-firm` /
`2026-W38-scrapbook`): **$0.04963** (monday), **$0.049675** (wednesday),
**$0.049395** (friday) — averaging **~$0.0496/image**, slightly *below* the
square size despite more pixels, because output-token count tracks the
model's own usage report, not raw pixel count, and these three used fewer
output tokens per image than the square test. A full weekly run of 3
`feed_portrait` images at `high` quality is about **$0.15**.

## Test image verdicts

Two real images were inspected at the corrected settings (augmentation on,
non-square, high quality), from two separate generations — no third image
was spent:

- **`out/bok-law-firm/2026-W38/monday.png`** (this run, 1088x1088, $0.056225
  measured): clean, on-brand (cream/teal/aqua/brass matches
  `2026-09-12-sunburst-social`), headline and supporting copy render sharp
  and legible, `boklawfirm.com` reads clean, bottom-right logo-reservation
  corner is clear. One deviation: the model invented three folder labels
  ("PERSONAL", "FAMILY", "FINANCES") that were not in the prompt — legible,
  correctly spelled, thematically coherent, not gibberish, but the prompt
  did ask for no extra invented text. Verdict: shippable as-is; tighten the
  prompt with an explicit "no labels on the folders" clause if that
  invented-text tendency recurs.
- **`C:\Users\dillo\Documents\Codex\weekend-review\bok-test-1216x640.png`**
  (coordinator-provided, 1216x640, reused rather than re-spent): technically
  clean — sharp photorealistic kitchen scene, no artifacts, no garbled text,
  confirms 1216x640 with divisible-by-16 sizing renders without the API
  erroring or degrading quality. But it fails the brand gate: no BOK cream
  #F6F0E5 / teal #0A3139 / aqua #8FD3D8 / brass #C88B3A palette, no headline
  or supporting copy, no `boklawfirm.com` line, no reserved logo corner —
  it reads as a generic lifestyle stock photo, not a BOK Law Firm post.
  Verdict: do not ship this exact file; it was generated from a prompt that
  did not carry the brand instructions this brief's prompts do. The size/
  quality mechanics are proven fine by both images; the brand miss is a
  prompt-content problem, not an API-settings problem.

Combined conclusion: the corrected settings (real per-slot size, quality
`high`, augmentation on) do fix the quality problem. Ship this pipeline for
prompts that carry the brand instructions the way `briefs/bok-law-firm.json`
does.

### Scrapbook infographic revision (2026-09-14)

Dillon reviewed the clean-editorial-photography `monday.png` above and asked
for a different direction: scrapbook style (torn paper, washi tape, photo
corners, stitched edges, hand-drawn doodles/arrows), a real informative
infographic (numbered steps/checklist, not a single-line message post), and
portrait `feed_portrait` (1088x1360) instead of square. `briefs/bok-law-firm.json`
was rewritten with three new slots under this direction and generated to
`out/bok-law-firm/2026-W38-scrapbook/` (a distinct week label from
`2026-W38`, so the original square renders stay on disk for comparison
rather than being silently orphaned by the idempotency check). All three
real logo composites, per-image verdicts:

- **`out/bok-law-firm/2026-W38-scrapbook/monday.png`** ("Three papers to
  grab before Monday", $0.04963): every line of on-image text renders sharp
  and correctly spelled — label, headline, all three numbered card labels,
  URL, and disclaimer all match the prompt exactly, no invented extra text.
  The scrapbook elements (washi tape, torn cream cards, brass doodle
  arrows, numbered circles, dried florals) read as a deliberate, tasteful
  layout with a clear top-to-bottom reading order, not clutter. The real
  BOK logo sits cleanly in the reserved blank patch, correct aspect ratio,
  no overlap with any card. **Shippable.**
- **`out/bok-law-firm/2026-W38-scrapbook/wednesday.png`** ("Build one
  shared calendar in four steps", $0.049675): same result — all four step
  labels and icons render legibly and in the right order, connected by
  clean hand-drawn arrows, brass/olive washi tape and dark photo corners
  read as an intentional planner-page aesthetic rather than busy. Logo is
  clean and undistorted in the reserved corner, close to but not
  overlapping the fourth card. **Shippable.**
- **`out/bok-law-firm/2026-W38-scrapbook/friday.png`** ("Pack for an easy
  weekend", $0.049395): checklist renders correctly (one checked item,
  three open), all four line items spelled correctly, washi tape and
  photo-corner styling consistent with the other two. Logo clean and
  undistorted bottom-right. **Shippable.**

All three passed the keep-worthy gate: real family-organization content (not
generic agency filler), finished frames with no placeholder or off-center
logo, on-brand from the real logo file (never approximated by the model),
and each one is more than a transition — it's a genuinely useful checklist/
timeline a reader could act on. None was weak enough to hold back.

## Diagnosis of why the old images were poor

Confirmed, not re-derived: the deleted automation's `automation.toml` prompt
explicitly called `Invoke-OpenAIImage.ps1` with `Model sunburst, Quality
high, Size 1024x1024` (backup at
`_os/automation/codex-automations-backup-20260914/bok-facebook-weekly-pdf-scheduler/automation.toml`).
That script hardcodes `--no-augment` and a `ValidateSet` capping size to
three legacy presets. Quality was already at the real max (`high`) so that
was never the problem. The forced square crop and the disabled prompt
augmentation are what degraded output for anything meant to run wide
(1200x630 link posts) or benefit from the model's own elaboration of a
short scene description. This pipeline removes both: no `--no-augment`
equivalent (there is no such parameter on the direct API call — the CLI's
flag was a wrapper-only behavior), and per-slot sizing instead of a forced
square.

## Files

- `generate.py` — the generator. Stdlib plus Pillow (already installed,
  used only for the logo-compositing step).
- `test_generate.py` — self-check for the size mapping, idempotency logic,
  and the logo-compositing failure modes (`python test_generate.py`).
- `briefs/bok-law-firm.json` — BOK's three weekly slots (Monday Reset,
  Wednesday Wisdom, Family Friday), scrapbook-infographic direction
  (2026-09-14 revision), all `feed_portrait` (1088x1360). General family
  organization/planning content only; no personalized legal advice, no
  outcome promises, no invented law, no client stories. Palette keyed to
  the approved `2026-09-12-sunburst-social` deliverables under
  `C:\Users\dillo\Documents\Codex\projects\client-operations\clients\bok-law-firm\deliverables\2026-09-12-sunburst-social`.
- `ledger.jsonl` — one row per generated image (ts, client, week, slot,
  title, model, size, quality, prompt, path, sha256, bytes, usage,
  cost_usd).
- `out/<client>/<week>/<slot>.png` — the generated images. Not committed;
  add an off-device backup decision separately if a render needs to be kept
  long-term.

## Adding another client

Add a new `briefs/<client-id>.json` following the same shape
(`client`, `brand`, `model`, `quality`, `slots: [{slot, title, format,
prompt}]`). `format` must be a key in `generate.py`'s `FORMAT_SIZES`.
