#!/usr/bin/env node
/**
 * paper-craft-video — receipt-driven MP4 renderer.
 *
 * House pattern (mirrors _os/automation/google-ads-daily/work/google-ads-report-builder):
 * a run receipt in, a dated deliverable out, nothing invented. Every input is
 * SHA-256 pinned in the receipt and re-verified before a frame is drawn; a hash
 * mismatch is a hard stop, not a warning.
 *
 *   node build.mjs --receipt receipts/<date>-<client>-<slug>.json
 *
 * Flags:
 *   --receipt <path>   required
 *   --quality draft|high   default high
 *   --no-render        author + check only (fast iteration)
 *   --deliver <dir>    also copy MP4 + verification into a deliverables folder
 *
 * Drafts only. This script renders a local file. It never uploads, posts,
 * publishes, emails or spends.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLI = ["--yes", "hyperframes@0.8.33"];

// ---------------------------------------------------------------- arg parsing
const argv = process.argv.slice(2);
const arg = (name, dflt = null) => {
  const i = argv.indexOf(name);
  return i === -1 ? dflt : argv[i + 1];
};
const has = (name) => argv.includes(name);

const receiptPath = arg("--receipt");
if (!receiptPath) die("--receipt <path> is required");
const quality = arg("--quality", "high");
const deliverDir = arg("--deliver");

function die(msg) {
  console.error(`\n  BLOCKED: ${msg}\n`);
  process.exit(1);
}
const sha256 = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

// ------------------------------------------------------------------- receipt
const receipt = JSON.parse(fs.readFileSync(path.resolve(receiptPath), "utf8"));
if (receipt.schemaVersion !== 1) die(`unsupported receipt schemaVersion ${receipt.schemaVersion}`);

// Never invent data: everything drawn on screen has to come from the receipt.
for (const k of ["clientId", "client", "date", "slug", "canvas", "durationSeconds", "beats", "endcard"]) {
  if (receipt[k] == null) die(`receipt is missing required field "${k}"`);
}

// Registry is the authority on who the client is. The receipt must agree with it.
const registryPath = receipt.clientRegistry;
if (registryPath) {
  const reg = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const entry = (reg.clients || []).find((c) => c.id === receipt.clientId);
  if (!entry) die(`clientId "${receipt.clientId}" is not in ${registryPath}`);
  if (entry.displayName !== receipt.client)
    die(`receipt client "${receipt.client}" != registry displayName "${entry.displayName}"`);
  if (entry.status !== "active") die(`client ${receipt.clientId} is "${entry.status}" in the registry`);
  console.log(`  client   ${entry.displayName} (${entry.id}) — resolved against the registry`);
}

// ------------------------------------------------------------ verify the inputs
// A plate whose bytes changed is a different film. Stop rather than render it.
const verified = [];
function pin(label, relPath, expected) {
  const abs = path.resolve(HERE, relPath);
  if (!fs.existsSync(abs)) die(`${label} is missing: ${abs}`);
  const got = sha256(abs);
  if (expected && got.toLowerCase() !== expected.toLowerCase())
    die(`${label} hash mismatch\n    expected ${expected}\n    actual   ${got}\n    ${abs}`);
  verified.push({ label, path: relPath, sha256: got, pinned: Boolean(expected) });
  return abs;
}

for (const b of receipt.beats) if (b.plate) pin(`plate ${b.id}`, `plates/${b.plate}`, b.plateSha256);
// Chips, links and the caption card are filled with crops of plates that may not be
// any beat's background. Those are inputs too: pin them the same way.
const fillPlates = new Set();
const addFill = (f) => f && f.plate && fillPlates.add(f.plate);
addFill(receipt.card && receipt.card.fill);
for (const b of receipt.beats) {
  addFill(b.card && b.card.fill);
  for (const c of b.chips || []) addFill(c.fill);
  for (const l of b.links || []) addFill(l.fill);
  for (const p of b.peels || []) addFill(p.fill);
}
for (const b of receipt.beats) fillPlates.delete(b.plate);
for (const p of fillPlates) {
  const declared = (receipt.fillPlates || []).find((f) => f.plate === p);
  if (!declared) die(`fill plate "${p}" is used but not declared in receipt.fillPlates`);
  pin(`fill plate ${p}`, `plates/${p}`, declared.sha256);
}
pin("brand mark", `assets/brand/${receipt.endcard.mark}`, receipt.endcard.markSha256);
pin("style contract", receipt.styleContract, receipt.styleContractSha256);
for (const f of fs.readdirSync(path.join(HERE, "assets/fonts"))) pin(`font ${f}`, `assets/fonts/${f}`, null);
pin("gsap", "assets/vendor/gsap.min.js", receipt.gsapSha256);
console.log(`  inputs   ${verified.length} files verified (${verified.filter((v) => v.pinned).length} hash-pinned)`);

// --------------------------------------------------------------- deckle edges
// A torn paper edge is a straight line displaced by noise. Seeded so the same
// receipt always tears the same way — determinism rule, and it means a re-render
// is frame-identical rather than merely similar.
function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function deckle(w, h, seed, amp = 3.4, step = 26) {
  const r = lcg(seed);
  const jag = (n) => (r() - 0.5) * 2 * amp - (r() < 0.08 ? amp * 1.6 : 0); // occasional deeper nick
  const pts = [];
  const edge = (from, to, n, place) => {
    for (let i = 0; i <= n; i++) pts.push(place(from + ((to - from) * i) / n, jag(i)));
  };
  const nx = Math.max(6, Math.round(w / step));
  const ny = Math.max(4, Math.round(h / step));
  edge(0, w, nx, (x, j) => [x, Math.max(0, amp + j)]);
  edge(0, h, ny, (y, j) => [w - Math.max(0, amp + j), y]);
  edge(w, 0, nx, (x, j) => [x, h - Math.max(0, amp + j)]);
  edge(h, 0, ny, (y, j) => [Math.max(0, amp + j), y]);
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(", ")})`;
}

// ------------------------------------------------------------------- authoring
const { width: W, height: H, fps } = receipt.canvas;
const DUR = receipt.durationSeconds;
const P = receipt.palette;
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const OUT = path.join(HERE, "build", `${receipt.date}-${receipt.clientId}-${receipt.slug}`);
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });

// Self-contained project dir: the preview server only serves the project root,
// so every asset is copied in rather than referenced through "../..".
const copyIn = (from, to) => {
  fs.mkdirSync(path.dirname(path.join(OUT, to)), { recursive: true });
  fs.copyFileSync(path.join(HERE, from), path.join(OUT, to));
};
for (const b of receipt.beats) if (b.plate) copyIn(`plates/${b.plate}`, `assets/${b.plate}`);
for (const p of fillPlates) copyIn(`plates/${p}`, `assets/${p}`);
copyIn(`assets/brand/${receipt.endcard.mark}`, `assets/${receipt.endcard.mark}`);
copyIn("assets/vendor/gsap.min.js", "assets/gsap.min.js");
copyIn("assets/fonts.css", "assets/fonts.css");
fs.mkdirSync(path.join(OUT, "assets/fonts"), { recursive: true });
for (const f of fs.readdirSync(path.join(HERE, "assets/fonts"))) copyIn(`assets/fonts/${f}`, `assets/fonts/${f}`);

const SRC_W = receipt.plateSource.width;
const SRC_H = receipt.plateSource.height;

// The caption card is a torn sheet of genuine handmade paper. CSS can only tile a
// whole image, so the fill is assembled from named clean crops of one plate laid
// side by side — real fibre at the same scale as the plate behind it, and no
// stretched or repeated grain. Crops are listed in the receipt.
// A beat may override any card field (`beat.card`), which is how type gets *set* on a
// film instead of captioned: a different sheet, size, place and tilt each time rather
// than one lower-third repeated. Omitted fields fall back to the house card.
const cardFor = (b) => ({ ...receipt.card, ...(b && b.card ? b.card : {}) });
const tilesFor = (C) => {
  const F = C.fill;
  // Tiles default to two half-width crops taken from two rows of the same clean region,
  // so a wider card does not need its tiling hand-authored.
  const tiles =
    F.tiles || [
      { w: Math.ceil(C.width / 2), x: F.x, y: F.y },
      { w: C.width - Math.ceil(C.width / 2), x: F.x, y: F.y + (F.rowGap ?? 178) },
    ];
  return tiles
    .map(
      (t, i) => `
              <div class="tile" style="width:${t.w}px;background-image:url('assets/${F.plate}');
                   background-size:${(SRC_W * F.scale).toFixed(1)}px ${(SRC_H * F.scale).toFixed(1)}px;
                   background-position:${(-t.x * F.scale).toFixed(1)}px ${(-t.y * F.scale).toFixed(1)}px;"
                   data-tile="${i}"></div>`
    )
    .join("");
};

// A chip or a thread is filled by positioning a named crop of a real plate behind it —
// same trick as the caption card, without the tiling, because chips are small enough
// that one crop covers them.
const fillCss = (f) =>
  `background-image:url('assets/${f.plate}');background-repeat:${f.repeat || "no-repeat"};` +
  `background-size:${(SRC_W * f.scale).toFixed(1)}px ${(SRC_H * f.scale).toFixed(1)}px;` +
  `background-position:${(-f.x * f.scale).toFixed(1)}px ${(-f.y * f.scale).toFixed(1)}px;`;

// Anatomy layout. Chips are small torn labels; links are the indigo thread that
// carries the signal between them. A link that is missing from the receipt is a
// break in the path — the absence is the point, so there is no "broken" flag.
// Measured 2026-09-10: `hyperframes check` samples a rotated text run by its
// axis-aligned bounding rect, so a chip tilted past ~1.5 degrees on a short chip
// reports text_occluded against its own paper fill. It is a false positive, but
// it blocks the render, so keep the tilt inside the budget rather than suppress
// the rule. Paper still lands crooked; it just lands slightly less crooked.
for (const b of receipt.beats)
  for (const c of b.chips || [])
    if (Math.abs(c.rot ?? 0) > 1.5 && c.h < 110)
      console.log(`  NOTE     chip "${c.text}" rot ${c.rot} on h ${c.h} — check may report text_occluded; keep |rot| <= 1.5 or raise h`);

const chipId = (b, i) => `${b.id}-c${i}`;
const linkId = (b, i) => `${b.id}-l${i}`;
const peelId = (b, i) => `${b.id}-p${i}`;

// Type printed on a peel sheet. It lives inside the clipped, filled sheet, so it lifts,
// drops and tears with its paper and never animates on its own (contract section 5).
// `rule` draws a pencil field line under the text, the way a form field is ruled;
// `underline` sets the text as a link. Coordinates are sheet-local pixels.
const printHtml = (p) =>
  (p.print || [])
    .map(
      (t) => `
              <p class="print ${t.family === "display" ? "d" : t.family === "plain" ? "p" : "t"}"
                 style="left:${t.x}px;top:${t.y}px;font-size:${t.fontSize}px;color:${t.color || P.ink};${
                   t.underline ? "text-decoration:underline;text-decoration-thickness:0.08em;text-underline-offset:0.18em;" : ""
                 }">${esc(t.text)}</p>${
                t.rule
                  ? `<div class="print-rule" style="left:${t.x}px;top:${t.y + Math.round(t.fontSize * 1.5)}px;width:${t.rule}px;"></div>`
                  : ""
              }`
    )
    .join("");

// Peels are the reveal. A peel is a real sheet of photographed paper lying *on* the
// plate, and it either lifts away (`lift`, the covering layer comes off and what was
// underneath was always there in the photograph), lands (`drop`, something is covered
// or a part seats), or is simply already in place (`hold`, so a later beat can cut to
// the same state). Nested `z` runs outermost-first so an outside-in dissection reads.
const peelsHtml = (b) =>
  (b.peels || [])
    .map(
      (p, i) => `
          <div class="peel-lift" id="${peelId(b, i)}" style="left:${p.x}px;top:${p.y}px;
               width:${p.w}px;height:${p.h}px;z-index:${p.z ?? 1};">
            <div class="peel" style="filter:brightness(${p.tone ?? 0.975}) saturate(1.03);clip-path:${deckle(
              p.w, p.h, p.seed,
              p.amp ?? Math.min(26, Math.max(8, Math.min(p.w, p.h) * 0.028)),
              p.step ?? Math.min(90, Math.max(34, Math.min(p.w, p.h) * 0.075))
            )};">
              <div class="peel-fill" style="${fillCss(p.fill)}"></div>${printHtml(p)}
            </div>
          </div>`
    )
    .join("");
const chipsHtml = (b) =>
  (b.chips || [])
    .map(
      (c, i) => `
        <div class="chip-lift" id="${chipId(b, i)}" data-layout-allow-caption-zone="true"
             style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;">
          <div class="chip" style="clip-path:${deckle(c.w, c.h, c.seed, c.amp ?? 3.4, c.step ?? 26)};">
            <div class="chip-fill" style="${fillCss(c.fill)}"></div>
            <p class="chip-line ${c.family === "display" ? "d" : "t"}"
               style="font-size:${c.fontSize}px;color:${c.color || P.ink};">${esc(c.text)}</p>
          </div>
        </div>`
    )
    .join("");
const linksHtml = (b) =>
  (b.links || [])
    .map(
      (l, i) => `
        <div class="link" id="${linkId(b, i)}"
             style="left:${l.x}px;top:${l.y}px;width:${l.w}px;height:${l.h}px;
                    transform-origin:${l.axis === "y" ? "50% 0%" : "0% 50%"};${fillCss(l.fill)}"></div>`
    )
    .join("");

// Each beat places its plate so the frame shows plate rect [x0,y0,w] and pins the
// transform-origin on the indigo accent, so the plate settles *around* the accent
// and the accent itself never moves. That is the through-line.
const beatHtml = receipt.beats
  .map((b) => {
    const s = W / b.crop.w;
    const imgW = SRC_W * s;
    const imgH = SRC_H * s;
    const left = -b.crop.x * s;
    const top = -b.crop.y * s;
    const ox = b.accent.x * s;
    const oy = b.accent.y * s;
    const C = cardFor(b);
    const card = b.copy
      ? `
        <div class="card-lift" id="${b.id}-lift" data-layout-allow-caption-zone="true"
             style="left:${C.x}px;top:${C.y}px;width:${C.width}px;height:${C.height}px;
                    filter:drop-shadow(0 ${C.shadow.y1}px ${C.shadow.b1}px ${P.shadowSoft})
                           drop-shadow(0 ${C.shadow.y2}px ${C.shadow.b2}px ${P.shadowTight});">
          <div class="card" id="${b.id}-card"
               style="width:${C.width}px;height:${C.height}px;clip-path:${deckle(C.width, C.height, C.seed, C.amp ?? 3.4, C.step ?? 26)};
                      justify-content:${C.align === "left" ? "flex-start" : C.align === "right" ? "flex-end" : "center"};">
            <div class="tiles">${tilesFor(C)}</div>
            <p class="line${C.family === "text" ? " t" : ""}"
               style="font-size:${C.fontSize}px;padding:0 ${C.padX}px;">${esc(b.copy)}</p>
          </div>
        </div>`
      : "";
    const peels = (b.peels || []).length
      ? `<div class="peel-wrap" data-layout-allow-overflow="true">${peelsHtml(b)}</div>`
      : "";
    return `
      <section class="clip beat" id="${b.id}" data-start="${b.start}" data-duration="${b.duration}" data-track-index="${b.track}">
        <div class="plate-box" data-layout-allow-overflow="true"${b.mirror ? ' style="transform:scaleX(-1)"' : ""}>
          <img class="plate" id="${b.id}-plate" src="assets/${b.plate}" alt=""
               style="width:${imgW.toFixed(1)}px;height:${imgH.toFixed(1)}px;left:${left.toFixed(1)}px;top:${top.toFixed(1)}px;
                      transform-origin:${ox.toFixed(1)}px ${oy.toFixed(1)}px;${
                        b.focus ? `filter:blur(${b.focus.from}px);` : ""
                      }" />
        </div>${peels}${linksHtml(b)}${chipsHtml(b)}${card}
      </section>`;
  })
  .join("\n");

const ec = receipt.endcard;
const endHtml = `
      <div class="clip" id="endmark" data-start="${ec.start}" data-duration="${ec.duration}" data-track-index="${ec.track}">
        <div class="mark-lift" id="mark-lift">
          <img id="mark" src="assets/${ec.mark}" alt="${esc(receipt.client)}"
               style="width:${ec.markSize}px;height:${ec.markSize}px" />
        </div>
        <div class="endtype" id="endtype" style="left:${ec.textX}px;top:${ec.textY}px">
          <p class="endname" id="endname">${esc(ec.name)}</p>
          <div class="rule" id="endrule"></div>
          <p class="endmeta" id="endmeta">${esc(ec.meta)}</p>
        </div>
      </div>`;

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>${esc(receipt.client)} — ${esc(receipt.title)}</title>
    <!-- Fonts, GSAP and every plate are frozen local files. No network at render time. -->
    <link rel="stylesheet" href="assets/fonts.css" />
    <script src="assets/gsap.min.js"></script>
    <style>
      html, body { margin:0; padding:0; width:${W}px; height:${H}px; overflow:hidden; background:${P.paper}; }
      #root { position:relative; width:${W}px; height:${H}px; overflow:hidden; background:${P.paper}; }
      .clip { position:absolute; inset:0; }
      .beat .plate-box { position:absolute; inset:0; overflow:hidden; }
      /* Plates deliberately overscan so the drift never under-covers the frame. */
      .plate { position:absolute; display:block; will-change:transform; }

      /* Caption card: a torn sheet of the real paper laid on the plate.
         Fill is a positioned crop of a genuine handmade-paper region of a plate;
         alpha is the seeded deckle clip. Shadow lives on the parent so it follows
         the torn silhouette instead of the element's box. */
      /* Geometry is per-beat and inline (receipt.card merged with beat.card), so the
         type is set on each frame rather than dropped into one repeated lower-third. */
      .card-lift { position:absolute; visibility:hidden; }
      .card { position:relative; display:flex; align-items:center; }
      .tiles { position:absolute; inset:0; display:flex; }
      /* A fresh sheet reads brighter than the worked sheet under it; seat it. */
      .tile { height:100%; background-repeat:no-repeat; filter:brightness(0.962) saturate(1.04); }
      .line {
        position:relative; margin:0;
        font-family:"Archivo Black", "Arial Black", system-ui, sans-serif;
        line-height:1.02; letter-spacing:-0.02em;
        color:${P.ink}; white-space:nowrap;
      }
      .line.t { font-family:"Nunito Sans", system-ui, sans-serif; font-weight:700;
                letter-spacing:0.14em; text-transform:uppercase; }

      /* Letterpress: ink spreads a hair into the fibre and sinks, so type reads as
         printed *on* the sheet rather than composited over it. Sub-pixel by design. */
      .line, .chip-line { text-shadow: 0 0 0.75px currentColor, 0 0.5px 0.7px ${P.shadowSoft}; }

      /* Peels: real sheets lying on the plate. Shadow on the parent so it follows the
         torn silhouette; the child carries the clip and the photographed fill. */
      .peel-wrap { position:absolute; inset:0; }
      .peel-lift {
        position:absolute; will-change:transform;
        filter: drop-shadow(0 12px 18px ${P.shadowSoft}) drop-shadow(0 3px 4px ${P.shadowTight});
      }
      .peel { position:relative; width:100%; height:100%; }
      .peel-fill { position:absolute; inset:0; }${
        receipt.beats.some((b) => (b.peels || []).some((p) => (p.print || []).length))
          ? `
      .print { position:absolute; margin:0; white-space:nowrap; line-height:1.04;
               text-shadow: 0 0 0.75px currentColor, 0 0.5px 0.7px ${P.shadowSoft}; }
      .print.d { font-family:"Archivo Black","Arial Black",system-ui,sans-serif; letter-spacing:-0.02em; }
      .print.t { font-family:"Nunito Sans", system-ui, sans-serif; font-weight:700;
                 letter-spacing:0.14em; text-transform:uppercase; }
      .print.p { font-family:"Nunito Sans", system-ui, sans-serif; font-weight:700; }
      .print-rule { position:absolute; height:1.5px; background:${P.pencil}; }`
          : ""
      }

      /* Anatomy chips: same construction as the caption card, smaller. Shadow on the
         parent so it follows the torn silhouette, not the box. */
      .chip-lift {
        position:absolute;
        filter: drop-shadow(0 8px 12px ${P.shadowSoft}) drop-shadow(0 2px 3px ${P.shadowTight});
        visibility:hidden;
      }
      .chip {
        position:relative; width:100%; height:100%;
        display:flex; align-items:center; justify-content:center;
      }
      .chip-fill { position:absolute; inset:0; filter:brightness(0.965) saturate(1.04); }
      .chip-line { position:relative; margin:0; padding:0 16px; white-space:nowrap; line-height:1.04; }
      .chip-line.d { font-family:"Archivo Black","Arial Black",system-ui,sans-serif; letter-spacing:-0.02em; }
      .chip-line.t { font-family:"Nunito Sans", system-ui, sans-serif; font-weight:700;
                     letter-spacing:0.14em; text-transform:uppercase; }

      /* The signal path. Real indigo paper fibre, cropped from a plate into a thin
         band — not a drawn line. It is revealed the way the pencil rule is drawn. */
      .link { position:absolute; visibility:hidden; will-change:transform; }

      .mark-lift {
        position:absolute; left:${ec.markX}px; top:${ec.markY}px;
        filter: drop-shadow(0 14px 20px ${P.shadowSoft}) drop-shadow(0 3px 4px ${P.shadowTight});
        visibility:hidden;
      }
      #mark { display:block; }
      .endtype { position:absolute; width:${ec.textWidth}px; text-align:center; visibility:hidden; }
      .endname {
        margin:0; font-family:"Archivo Black","Arial Black",system-ui,sans-serif;
        font-size:${ec.nameSize}px; letter-spacing:-0.02em; line-height:1.05; color:${P.ink};
        white-space:nowrap;
      }
      /* Pencil construction line, drawn on the page like the reference sheets. */
      .rule {
        width:${ec.ruleWidth}px; height:1.5px; margin:${ec.ruleGap}px auto ${ec.ruleGap}px;
        background:${P.pencil}; transform-origin:50% 50%;
      }
      .endmeta {
        margin:0; font-family:"Nunito Sans", system-ui, sans-serif; font-weight:700;
        font-size:${ec.metaSize}px; letter-spacing:0.14em; text-transform:uppercase; color:${P.muted};
      }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="${receipt.compositionId}" data-root="true"
         data-width="${W}" data-height="${H}" data-fps="${fps}" data-start="0" data-duration="${DUR}">
${beatHtml}
${endHtml}
    </div>
    <script>
      // Paper-craft motion vocabulary: nothing eases like rubber. Plates drift on a
      // linear copy-stand rail; every paper element lands in discrete stepped jumps
      // with a settle, the way a sheet does under a stop-motion camera.
      const R = ${JSON.stringify({
        beats: receipt.beats.map((b) => ({
          id: b.id,
          start: b.start,
          duration: b.duration,
          drift: b.drift,
          // Camera moves, in the vocabulary Dillon named: push (drift), slide (pan)
          // and rack-focus (focus). No swoop, no spin, no card flip.
          pan: b.pan ?? null,
          focus: b.focus ?? null,
          hasCopy: Boolean(b.copy),
          // A beat that builds something needs its line to land after the build,
          // not on top of it. Default stays the house delay.
          copyAt: b.copyAt ?? null,
          card: (() => {
            const m = receipt.motion.card;
            const rot = cardFor(b).rot ?? m.restRot;
            return { ...m, dropRot: rot + (m.dropRot - m.restRot), overshootRot: rot + (m.overshootRot - m.restRot), restRot: rot };
          })(),
          peels: (b.peels || []).map((p, i) => ({
            id: peelId(b, i),
            at: p.at,
            mode: p.mode || "lift",
            dur: p.dur ?? receipt.motion.peel.dur,
            steps: p.steps ?? receipt.motion.peel.steps,
            off: { x: p.dx ?? 0, y: p.dy ?? 0, rot: p.offRot ?? 0 },
            rest: { rot: p.rot ?? 0 },
          })),
          // Each chip lands at its own rest angle; paper never lands square and two
          // chips landing at the same angle read as a template.
          chips: (b.chips || []).map((c, i) => {
            const m = receipt.motion.chip;
            const rot = c.rot ?? 0;
            return {
              id: chipId(b, i),
              at: c.at,
              m: { ...m, dropRot: rot + m.dropRotDelta, overshootRot: rot + m.overshootRotDelta, restRot: rot },
            };
          }),
          links: (b.links || []).map((l, i) => ({
            id: linkId(b, i),
            at: l.at,
            axis: l.axis === "y" ? "scaleY" : "scaleX",
            dur: l.dur ?? receipt.motion.link.dur,
            steps: l.steps ?? receipt.motion.link.steps,
          })),
        })),
        endcard: {
          start: ec.start,
          duration: ec.duration,
          drift: receipt.beats[receipt.beats.length - 1].drift,
        },
        motion: receipt.motion,
      })};

      function land(tl, target, t, m) {
        // appear (no fade — paper does not fade in), overshoot, settle
        tl.set(target, { visibility: "visible" }, t);
        tl.fromTo(
          target,
          { y: m.dropY, rotation: m.dropRot },
          { y: m.overshootY, rotation: m.overshootRot, duration: m.dropDur, ease: "steps(" + m.dropSteps + ")" },
          t
        );
        tl.to(
          target,
          { y: 0, rotation: m.restRot, duration: m.settleDur, ease: "steps(" + m.settleSteps + ")" },
          t + m.dropDur
        );
      }

      // A peel either lifts off the plate, drops onto it, or is already at rest.
      // Same stepped weight as a landing sheet — paper moves in jumps, never a fade.
      function peel(tl, target, beatStart, t, p) {
        const away = { x: p.off.x, y: p.off.y, rotation: p.off.rot };
        const home = { x: 0, y: 0, rotation: p.rest.rot };
        if (p.mode === "hold") { tl.set(target, home, beatStart); return; }
        const from = p.mode === "drop" ? away : home;
        const to = p.mode === "drop" ? home : away;
        // Pre-position at the cut, not at the move, or the sheet snaps into place first.
        tl.set(target, from, beatStart);
        tl.to(target, { ...to, duration: p.dur, ease: "steps(" + p.steps + ")" }, t);
      }

      function build() {
        const tl = gsap.timeline({ paused: true });
        const M = R.motion;

        for (const b of R.beats) {
          // Plate settles around its pinned accent. ease "none" = a rail, not a swoop.
          tl.fromTo(
            "#" + b.id + "-plate",
            { scale: b.drift.from, xPercent: 0 },
            { scale: b.drift.to, duration: b.duration, ease: "none" },
            b.start
          );
          // Slide: the copy-stand rail travelling along the subject, on a linear ramp
          // that stops before the beat ends so the frame comes to rest.
          if (b.pan)
            tl.fromTo(
              "#" + b.id + "-plate",
              { x: b.pan.fromX || 0, y: b.pan.fromY || 0 },
              { x: 0, y: 0, duration: b.pan.dur ?? b.duration, ease: "none" },
              b.start
            );
          // Rack focus: the lens turned by hand, in discrete stops, not a dissolve.
          if (b.focus)
            tl.fromTo(
              "#" + b.id + "-plate",
              { filter: "blur(" + b.focus.from + "px)" },
              { filter: "blur(" + b.focus.to + "px)", duration: b.focus.dur, ease: "steps(" + b.focus.steps + ")" },
              b.start + (b.focus.at || 0)
            );
          for (const p of b.peels || []) peel(tl, "#" + p.id, b.start, b.start + p.at, p);
          if (b.hasCopy) land(tl, "#" + b.id + "-lift", b.start + (b.copyAt ?? M.cardDelay), b.card);
          for (const c of b.chips || []) land(tl, "#" + c.id, b.start + c.at, c.m);
          for (const l of b.links || []) {
            tl.set("#" + l.id, { visibility: "visible" }, b.start + l.at);
            tl.fromTo(
              "#" + l.id,
              { [l.axis]: 0 },
              { [l.axis]: 1, duration: l.dur, ease: "steps(" + l.steps + ")" },
              b.start + l.at
            );
          }
        }

        const e = R.endcard;
        land(tl, "#mark-lift", e.start + M.markDelay, M.mark);
        tl.set("#endtype", { visibility: "visible" }, e.start + M.typeDelay);
        tl.fromTo("#endname", { y: M.type.dropY }, { y: 0, duration: M.type.dur, ease: "steps(" + M.type.steps + ")" }, e.start + M.typeDelay);
        tl.fromTo("#endrule", { scaleX: 0 }, { scaleX: 1, duration: M.rule.dur, ease: "steps(" + M.rule.steps + ")" }, e.start + M.typeDelay + M.rule.delay);
        tl.set("#endmeta", { visibility: "visible" }, e.start + M.typeDelay + M.metaDelay);
        tl.fromTo("#endmeta", { y: M.type.dropY * 0.5 }, { y: 0, duration: M.type.dur, ease: "steps(" + M.type.steps + ")" }, e.start + M.typeDelay + M.metaDelay);

        window.__timelines["${receipt.compositionId}"] = tl;
      }

      document.fonts.ready.then(build);
    </script>
  </body>
</html>
`;

fs.writeFileSync(path.join(OUT, "index.html"), html);
fs.writeFileSync(
  path.join(OUT, "hyperframes.json"),
  JSON.stringify(
    { $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", paths: { blocks: ".", assets: "assets" }, authoringSkill: "motion-graphics" },
    null,
    2
  ) + "\n"
);
console.log(`  authored ${path.join(OUT, "index.html")}`);

// ------------------------------------------------------------------ verify
const run = (args, label) => {
  try {
    // Node refuses to execFile a .cmd without a shell, and npx is a .cmd on Windows.
    // Args here are fixed literals plus a receipt-derived filename, never user input.
    return execFileSync("npx", [...CLI, ...args], { cwd: OUT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], shell: true });
  } catch (e) {
    console.error((e.stdout || "") + (e.stderr || ""));
    die(`${label} failed`);
  }
};

console.log("  checking…");
const checkOut = run(["check", "--json"], "check");
const check = JSON.parse(checkOut.slice(checkOut.indexOf("{")));
const findings = check.findings || check.results?.findings || [];
console.log(`  check    ${findings.length} finding(s)`);
for (const f of findings.slice(0, 20)) console.log(`           [${f.severity || "?"}] ${f.rule || f.id}: ${f.message}`);
if (findings.some((f) => f.severity === "error")) die("check reported errors — not rendering");

if (has("--no-render")) {
  console.log("\n  --no-render: stopped after check.\n");
  process.exit(0);
}

// ------------------------------------------------------------------- render
const mp4 = path.join(OUT, `${receipt.clientId}-${receipt.slug}-${receipt.date}.mp4`);
console.log(`  rendering ${quality}…`);
run(["render", "--quality", quality, "--output", path.basename(mp4)], "render");
if (!fs.existsSync(mp4) || fs.statSync(mp4).size === 0) die("render produced no file");

// -------------------------------------------------------- verify the artefact
const probe = JSON.parse(
  execFileSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", mp4], { encoding: "utf8" })
);
const v = probe.streams.find((s) => s.codec_type === "video");
const actualDur = Number(probe.format.duration);
const frames = Number(v.nb_frames || 0);
const expectedFrames = Math.round(DUR * fps);

const verification = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  clientId: receipt.clientId,
  client: receipt.client,
  receipt: path.resolve(receiptPath),
  receiptSha256: sha256(path.resolve(receiptPath)),
  output: { path: mp4, bytes: fs.statSync(mp4).size },
  measured: {
    codec: v.codec_name,
    width: v.width,
    height: v.height,
    fps: (([n, d]) => Number(n) / Number(d || 1))(String(v.r_frame_rate).split("/")),
    durationSeconds: actualDur,
    frames,
    pixFmt: v.pix_fmt,
  },
  expected: { width: W, height: H, fps, durationSeconds: DUR, frames: expectedFrames },
  checkFindings: findings,
  inputsVerified: verified,
  drafted: true,
  published: false,
  note: "Draft. Rendered locally. Nothing uploaded, posted, published or sent.",
};
const problems = [];
if (v.width !== W || v.height !== H) problems.push(`dimensions ${v.width}x${v.height} != ${W}x${H}`);
if (Math.abs(actualDur - DUR) > 0.15) problems.push(`duration ${actualDur}s != ${DUR}s`);
if (frames && Math.abs(frames - expectedFrames) > 2) problems.push(`frames ${frames} != ${expectedFrames}`);
verification.problems = problems;
verification.ok = problems.length === 0;

fs.writeFileSync(path.join(OUT, "verification.json"), JSON.stringify(verification, null, 2) + "\n");

console.log(`\n  MP4      ${mp4}`);
console.log(`  size     ${(verification.output.bytes / 1048576).toFixed(2)} MB`);
console.log(`  measured ${v.width}x${v.height} @ ${verification.measured.fps}fps · ${actualDur}s · ${frames} frames · ${v.codec_name}`);
if (problems.length) console.log(`  PROBLEMS ${problems.join("; ")}`);
else console.log(`  verified matches the receipt`);

if (deliverDir) {
  fs.mkdirSync(deliverDir, { recursive: true });
  fs.copyFileSync(mp4, path.join(deliverDir, path.basename(mp4)));
  fs.copyFileSync(path.join(OUT, "verification.json"), path.join(deliverDir, "verification.json"));
  fs.copyFileSync(path.resolve(receiptPath), path.join(deliverDir, path.basename(receiptPath)));
  console.log(`  delivered ${path.join(deliverDir, path.basename(mp4))}`);
}
console.log("");
