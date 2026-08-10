// Shared stage utilities: schema validation, the config.mjs serializer,
// placeholder plates, copy gates.
import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const hex = { type: "string", pattern: "^#[0-9a-fA-F]{6}$" };
const vec3 = { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 };
const pair = { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 };

export const SCHEMAS = {
  research: {
    type: "object",
    required: ["identity", "facts", "logo_candidates", "visual_cues"],
    properties: {
      identity: {
        type: "object",
        required: ["status", "canonical_name"],
        properties: { status: { enum: ["resolved", "ambiguous"] } },
      },
      facts: {
        type: "array",
        items: {
          type: "object",
          required: ["key", "value", "source_url", "confidence"],
          properties: { confidence: { type: "number", minimum: 0, maximum: 1 } },
        },
      },
      logo_candidates: { type: "array", maxItems: 6 },
    },
  },
  brief: {
    type: "object",
    required: ["slug", "voice_words", "scene_sentence", "architecture_family", "verb",
      "camera_preset", "palette", "type", "image_plan", "metaphor", "states_arc",
      "hero_alt", "primary_cta", "uncertainties", "references"],
    properties: {
      voice_words: { type: "array", minItems: 3, maxItems: 3 },
      camera_preset: { enum: ["orbitArc", "pushReveal", "craneDown", "driftLateral"] },
      palette: { type: "object", required: ["bg", "accent", "accent2"], properties: { bg: hex, accent: hex, accent2: hex } },
      image_plan: { type: "array", minItems: 4, maxItems: 6 },
      states_arc: { type: "array", minItems: 4, maxItems: 4 },
      references: { type: "array", minItems: 2 },
    },
  },
  copy: {
    type: "object",
    required: ["context", "h1", "h1_compact", "chapters", "sequence", "services", "area", "faq",
      "brief_paragraphs", "note", "verify_line"],
    properties: {
      chapters: { type: "array", minItems: 4, maxItems: 4, items: { type: "object", required: ["step", "state", "title", "body"] } },
      sequence: {
        type: "object", required: ["heading", "lede", "cards"],
        properties: { cards: { type: "array", minItems: 6, maxItems: 6 } },
      },
      services: { type: "object", required: ["heading", "items"], properties: { items: { type: "array", minItems: 5, maxItems: 6 } } },
      faq: { type: "object", required: ["items"], properties: { items: { type: "array", minItems: 6, maxItems: 8 } } },
      brief_paragraphs: { type: "array", minItems: 2, maxItems: 2 },
    },
  },
  worldspec: {
    type: "object",
    required: ["lockup", "initials", "lens", "world", "panels"],
    properties: {
      lockup: { type: "array", minItems: 2, maxItems: 2 },
      world: {
        type: "object",
        required: ["clear", "fog", "fogDensity", "exposure", "beats", "props", "particles"],
        properties: {
          clear: hex, fog: hex, sky: hex, ground: hex, cold: hex, warm: hex, groundTint: hex,
          fogDensity: { type: "number", minimum: 0.008, maximum: 0.022 },
          exposure: { type: "number", minimum: 1.0, maximum: 1.5 },
          bloom: { type: "number", minimum: 0.1, maximum: 0.3 },
          plateDistance: { type: "number", minimum: 22, maximum: 30 },
          warmRamp: pair,
          beats: {
            type: "object", required: ["preset", "r", "h", "low", "target", "fov"],
            properties: {
              preset: { enum: ["orbitArc", "pushReveal", "craneDown", "driftLateral"] },
              r: { type: "number", minimum: 7, maximum: 10 },
              h: { type: "number", minimum: 2, maximum: 3.4 },
              low: { type: "number", minimum: 0.9, maximum: 1.3 },
              target: vec3,
              fov: { type: "number", minimum: 30, maximum: 42 },
            },
          },
          props: { type: "array", minItems: 5, maxItems: 9, items: { type: "object", required: ["geo", "mat", "pos"] } },
          particles: { type: "array", minItems: 1, maxItems: 1 },
        },
      },
      panels: { type: "array", minItems: 2, maxItems: 2, items: { type: "object", required: ["id", "src", "label", "meta", "size", "position", "rotY", "in", "out"] } },
    },
  },
  evaluation: {
    type: "object",
    required: ["slug", "scores", "total", "criticals", "verdict"],
    properties: {
      verdict: { enum: ["pass", "fail"] },
      scores: {
        type: "object",
        required: ["research_accuracy", "mobile_typography", "distinctiveness", "realism_3d",
          "imagery_logo", "content", "motion_interaction", "a11y", "perf"],
      },
    },
  },
};

const compiled = Object.fromEntries(Object.entries(SCHEMAS).map(([k, v]) => [k, ajv.compile(v)]));

export function validateOrThrow(kind, data) {
  const validate = compiled[kind];
  if (!validate(data)) {
    const msgs = (validate.errors ?? []).slice(0, 8).map((e) => `${e.instancePath || "/"} ${e.message}`);
    throw new Error(`${kind} schema rejected: ${msgs.join("; ")}`);
  }
  return data;
}

// House rule (enforced repo-wide by lib/arch-build.js too): no em dashes on
// customer-facing pages, and no "--" masquerading as one.
export function assertNoEmDashes(copyJson) {
  const text = JSON.stringify(copyJson);
  if (text.includes("—")) throw new Error("copy contains an em dash (banned house rule)");
  if (/\w\s--\s\w/.test(text)) throw new Error('copy contains " -- " (banned house rule)');
}

export function countWords(copy) {
  const parts = [];
  const push = (v) => { if (typeof v === "string") parts.push(v); };
  push(copy.context); push(copy.h1);
  for (const ch of copy.chapters) { push(ch.title); push(ch.body); (ch.list ?? []).forEach(push); (ch.ledger ?? []).flat().forEach(push); }
  push(copy.sequence.heading); push(copy.sequence.lede); copy.sequence.cards.forEach((c) => { push(c[1]); push(c[2]); });
  push(copy.services.heading); push(copy.services.lede); copy.services.items.forEach((i) => { push(i[0]); push(i[1]); });
  push(copy.area?.heading); (copy.area?.body ?? []).forEach(push);
  push(copy.faq?.heading); (copy.faq?.items ?? []).forEach((i) => { push(i[0]); push(i[1]); });
  copy.brief_paragraphs.forEach(push); push(copy.note); push(copy.verify_line);
  return parts.join(" ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

// ---- config.mjs serialization -------------------------------------------
const COLOR_KEYS = new Set(["clear", "fog", "sky", "ground", "cold", "warm", "groundTint", "tint", "color", "lamp", "cool", "floor"]);

function jsValue(value, key, indent) {
  if (typeof value === "string" && COLOR_KEYS.has(key) && /^#[0-9a-fA-F]{6}$/.test(value)) {
    return `0x${value.slice(1)}`;
  }
  if (value === null) return "null";
  if (Array.isArray(value)) {
    const inner = value.map((v) => jsValue(v, key, indent));
    const flat = inner.join(", ");
    if (flat.length < 100) return `[${flat}]`;
    return `[\n${indent}  ${inner.join(`,\n${indent}  `)}\n${indent}]`;
  }
  if (typeof value === "object") return jsObject(value, indent);
  return JSON.stringify(value);
}

function jsObject(obj, indent = "  ") {
  const inner = Object.entries(obj).map(([k, v]) => {
    const keyOut = /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
    return `${indent}  ${keyOut}: ${jsValue(v, k, indent + "  ")}`;
  });
  return `{\n${inner.join(",\n")}\n${indent}}`;
}

export function serializeConfig({ meta, sites, order }) {
  const entries = order.map((slug) => `  ${JSON.stringify(slug)}: ${jsObject(sites[slug], "  ")}`).join(",\n\n");
  return `/* Generated by radar-studio. Colors are 0x literals for three.js; the
   plates helper mirrors the next10 convention. Do not hand-edit inside a run:
   edit the stage artifacts and re-run assembly. */
const plates = (slug) => ({
  hero: \`/assets/plates/\${slug}/hero.webp\`,
  hero900: \`/assets/plates/\${slug}/hero-900.webp\`,
  macro: \`/assets/plates/\${slug}/macro.webp\`,
  material: \`/assets/plates/\${slug}/material.webp\`
});

export const META = ${jsObject(meta, "")};

export const SITES = {
${entries}
};

export const ORDER = ${JSON.stringify(order)};
`;
}

// Placeholder plates: palette-true abstract compositions (SVG -> webp via sharp).
// Unique per site, honestly synthetic, clearly pending the real image provider.
export async function generatePlaceholderPlates({ slug, palette, outDir, seed = 7 }) {
  const sharp = (await import("sharp")).default;
  const sizes = { hero: [1600, 1100], "hero-900": [900, 1560], macro: [1200, 900], material: [1200, 900] };
  fs.mkdirSync(outDir, { recursive: true });
  const written = [];
  let s = seed;
  const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (const [name, [w, h]] of Object.entries(sizes)) {
    const blobs = Array.from({ length: 5 }, () => {
      const cx = (0.15 + rand() * 0.7) * w, cy = (0.15 + rand() * 0.7) * h;
      const r = (0.12 + rand() * 0.3) * Math.min(w, h);
      const c = rand() > 0.5 ? palette.accent : palette.accent2;
      const o = 0.08 + rand() * 0.22;
      return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${c}" opacity="${o.toFixed(2)}" filter="url(#b)"/>`;
    }).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${palette.bg}"/>
          <stop offset="1" stop-color="${shade(palette.bg, 1.6)}"/>
        </linearGradient>
        <filter id="b"><feGaussianBlur stdDeviation="${Math.round(Math.min(w, h) / 18)}"/></filter>
        <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.035 0"/></filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      ${blobs}
      <rect width="100%" height="100%" filter="url(#n)"/>
      <rect x="0" y="${h - Math.round(h * 0.3)}" width="100%" height="${Math.round(h * 0.3)}" fill="${palette.bg}" opacity="0.45"/>
    </svg>`;
    const out = path.join(outDir, `${name}.webp`);
    await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(out);
    written.push(out);
  }
  return written;
}

function shade(hexColor, factor) {
  const n = parseInt(hexColor.slice(1), 16);
  const ch = (shift) => Math.min(255, Math.round(((n >> shift) & 0xff) * factor)).toString(16).padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
}

export function readPrompt(name, substitutions = {}) {
  const p = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "prompts", `${name}.md`);
  let text = fs.readFileSync(p, "utf8");
  for (const [key, value] of Object.entries(substitutions)) {
    text = text.replaceAll(`{{${key}}}`, typeof value === "string" ? value : JSON.stringify(value, null, 1));
  }
  return text;
}
