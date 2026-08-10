// Fixture smoke run: seeds a run with germantown-derived stage outputs so the
// build phase exercises the REAL deterministic path (approval pin, serializer,
// generator, vite, static QA, browser QA) with zero LLM calls. The LLM stages
// memo-hit because rows are seeded through the same hash functions the stages
// use. This is a mechanical test harness, never a deliverable: the slug is
// fixture-*, the phone is a 555 number, and eval is EXPECTED to quarantine
// while headless claude auth is down.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeCtx } from "../core/run-daily.mjs";
import { inputHash, manifestOf, sha256 } from "../core/stage-machine.mjs";
import { readPrompt } from "../stages/util.mjs";
import { verifiedContacts } from "../stages/build-phase.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUN_ID = "fixture-smoke";
const SLUG = "fixture-germantown";

const ctx = makeCtx(RUN_ID);
const now = Date.now();

// ---- load the proven germantown entry and reshape it into stage outputs ----
const exampleText = fs.readFileSync(path.join(HERE, "..", "prompts", "examples", "germantown.example.txt"), "utf8");
const entry = eval(`(function(){ const plates = (s) => ({}); return ({${exampleText}}); })()`)["germantown-dental-group"];

const toHex = (n) => "#" + n.toString(16).padStart(6, "0");
const colorize = (obj) => {
  const COLOR_KEYS = new Set(["clear", "fog", "sky", "ground", "cold", "warm", "groundTint", "tint", "color", "lamp", "cool", "floor"]);
  if (Array.isArray(obj)) return obj.map((v) => colorize(v));
  if (obj && typeof obj === "object") return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, COLOR_KEYS.has(k) && typeof v === "number" ? toHex(v) : colorize(v)]));
  return obj;
};

const deDash = (s) => typeof s === "string" ? s.replace(/\s+—\s+/g, ": ").replace(/—/g, ",") : s;
const deepDeDash = (o) => JSON.parse(JSON.stringify(o), (k, v) => deDash(v));

const researchData = {
  identity: { status: "resolved", canonical_name: "Fixture Germantown Dental (smoke test)", display_name: "Fixture Germantown Dental", official_domain: null, reason_if_ambiguous: "" },
  facts: [
    { key: "phone", value: "2155550100", source_url: "fixture://smoke-test", locator: "fixture", confidence: 0.99, public_copy_ok: true },
    { key: "address", value: "123 Fixture Ave, Philadelphia, PA", source_url: "fixture://smoke-test", locator: "fixture", confidence: 0.99, public_copy_ok: true },
  ],
  logo_candidates: [],
  visual_cues: { brand_colors: [entry.accent], photography_style: "fixture", trade_materials: ["porcelain", "steel"], current_site_impression: "fixture" },
  faq_seeds: [],
  ambiguities: ["this is a mechanical fixture run, not a real prospect"],
  suspicious_content: [],
};

const briefData = {
  slug: SLUG,
  voice_words: ["clinical", "calm", "precise"],
  scene_sentence: "A patient in a quiet evening operatory watches porcelain forms settle into a perfect arch.",
  architecture_family: "transformation-story",
  verb: entry.verb,
  camera_preset: entry.world.beats.preset,
  palette: { bg: entry.bg, accent: entry.accent, accent2: entry.accent2, material_names: ["porcelain", "brushed steel", "mint glass"] },
  materials: ["porcelain", "steel", "glass"],
  type: { display_id: "oswald", text_id: "source-sans-3", justification: "machined condensed display over quiet engineered text (fixture pairing to exercise per-brand fonts)" },
  image_plan: [
    { role: "hero16x11", ratio: "16:11", prompt: "fixture placeholder hero", type_field: "left" },
    { role: "hero9x16", ratio: "9:16", prompt: "fixture placeholder mobile hero" },
    { role: "macro", ratio: "4:3", prompt: "fixture placeholder macro" },
    { role: "material", ratio: "4:3", prompt: "fixture placeholder material" },
  ],
  metaphor: { objects: ["porcelain arch segments", "steel guide rail", "mint glass panel"], arc: "misaligned segments travel a guide rail and settle into one arch as the practical warms" },
  states_arc: entry.states,
  hero_alt: entry.heroAlt,
  primary_cta: { label: "Open the map listing", kind: "listing" },
  uncertainties: ["fixture run: everything on this page is test data"],
  references: ["dental operatory equipment", "porcelain veneer trays"],
  source_confidence: 0.99,
};

// copy: proven germantown copy + new long-form sections to hit 1,100-1,700 words
const c = deepDeDash(entry.copy);
const copyData = {
  context: c.context,
  h1: c.h1,
  h1_compact: "Aligned,\nquietly.",
  chapters: c.chapters.map((ch) => ({ step: ch.step, state: ch.state, title: deDash(ch.title), body: deDash(ch.body), ledger: ch.ledger ?? null, list: ch.list ?? null, cta: ch.cta ? ["Open the map listing", "PLACEHOLDER_MAPS"] : null })),
  sequence: c.sequence,
  services: {
    kicker: "What this covers",
    heading: "The work a general practice actually does.",
    lede: "Six categories cover most of what walks through the door of a neighborhood dental office. Each one is scoped here the way a patient would ask about it, in plain terms, with the questions worth raising before any work begins.",
    items: [
      ["Preventive care", "Cleanings, exams, and imaging on a rhythm the practice recommends. The point is catching small problems while they are still small, and keeping a record that makes changes visible from one visit to the next."],
      ["Restorative dentistry", "Fillings, crowns, and bridges that rebuild function after decay or damage. Good restorative work matches the bite and the shade of everything around it, which is a materials conversation as much as a clinical one."],
      ["Cosmetic treatment", "Whitening, bonding, and veneers that change how teeth look without pretending the underlying structure does not matter. An honest cosmetic plan starts with what the enamel can support."],
      ["Alignment", "Clear aligner or orthodontic referral pathways for crowding and spacing. The question worth asking first is what the end state should look like and how retention will hold it there."],
      ["Emergency visits", "Same-week response for breaks, loss of a restoration, or pain that will not wait. Ask any practice how they triage: the answer tells you a lot about how the rest of the office runs."],
      ["Family scheduling", "Blocks that let one household book together. Small operational choices like this are why some practices keep patients for decades."],
    ],
  },
  area: {
    heading: "A neighborhood practice, not a chain.",
    body: [
      "Philadelphia neighborhoods keep their dental practices close: most patients come from a short drive or a transit stop away, and referrals travel by word of mouth between neighbors. A practice that has held its corner for years carries a kind of accountability a franchise cannot import.",
      "That standing is checkable. The map listing below shows the practice in its actual block, with hours and reviews written by people who sat in the chair. Nothing on this concept page substitutes for that record: it only argues the record deserves a better homepage.",
      "Distance matters in dental care more than it first appears. Follow-up visits, adjustment appointments, and the occasional urgent call all get easier when the office is genuinely nearby, and a practice rooted in its neighborhood tends to schedule with that reality in mind rather than against it. The right question is not whether a practice looks impressive online but whether it can hold a relationship across years of ordinary visits.",
    ],
  },
  faq: {
    heading: "Questions worth asking any practice first.",
    items: [
      ["Do they see new patients, and how soon?", "Intake windows change with the season and the roster. Call and ask for the next two open new-patient slots rather than the first one: the spacing tells you how loaded the book really is."],
      ["What imaging do they use?", "Digital radiography is standard in most modern operatories, but frequency and coverage policies differ. A practice should be able to explain when they image and why in one plain sentence."],
      ["How do they handle dental anxiety?", "Good answers are specific: longer first visits, clear signaling rules, headphones, breaks on request. Vague reassurance is not a protocol."],
      ["What happens in an emergency?", "Ask what number to call after hours and what the practice does in the first twenty-four hours. The shape of that answer separates a triage plan from an answering machine."],
      ["Do they explain costs before treatment?", "A written estimate before anything irreversible is a reasonable expectation everywhere. Practices that lead with it tend to run calmer front desks."],
      ["Can one office see the whole family?", "Many general practices treat children alongside adults; some refer little kids out. Either answer is fine, but knowing it before the first booking saves a wasted visit."],
      ["What should a first visit include?", "A thorough first appointment usually runs longer than a routine cleaning: a full charting of existing work, imaging where indicated, a gum health baseline, and a conversation about history and goals. If the first visit is only a fast polish and a wave, the practice is telling you how much attention the record will get later."],
      ["How do practices keep their equipment current?", "Sterilization logs, sensor generations, and material stock all age on different schedules. You do not need the details, but a front desk that can say when the office last upgraded anything is a front desk connected to the clinical side. It is a small question that reads the whole operation."],
    ],
  },
  brief_paragraphs: deepDeDash(c.brief),
  note: deDash(c.note),
  verify_line: deDash(c.verify.line),
  footer_line: "A neighborhood dental practice serving Philadelphia families from one corner office.",
  pullquote: "Good dentistry is mostly seeing clearly before touching anything.",
};

const worldspec = {
  lockup: entry.lockup,
  initials: entry.initials,
  lens: entry.lens,
  world: colorize(entry.world),
  panels: colorize(entry.panels),
};

// ---------------------------------------------------------------- seed DB
ctx.db.prepare(`INSERT OR REPLACE INTO runs (run_id, run_date, phase, status, repo_sha, engine_version, started_at, notes)
  VALUES (?, ?, 'awaiting_approval', 'active', ?, ?, ?, 'FIXTURE SMOKE: mechanical harness, not a deliverable')`)
  .run(RUN_ID, RUN_ID, ctx.repoSha, ctx.engineVersion, now);
ctx.db.prepare(`INSERT OR REPLACE INTO prospects (run_id, prospect_id, slug, business_name, city, vertical, radar_priority, site_quality_score, identity_status)
  VALUES (?, ?, ?, 'Fixture Germantown Dental (smoke test)', 'Philadelphia', 'dentist', 0, 0, 'resolved')`)
  .run(RUN_ID, SLUG, SLUG);
ctx.budgets.init(ctx.config.budgets.perRun);

const dir = path.join(ctx.workDir, SLUG);
fs.mkdirSync(dir, { recursive: true });

function seedStage(stage, data, ih) {
  const file = path.join(dir, `${stage}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  const manifest = manifestOf([file], dir);
  const attempt = ctx.sm.nextAttempt(RUN_ID, SLUG, stage);
  ctx.db.prepare(
    `INSERT INTO stage_executions (run_id, prospect_id, stage, attempt, input_hash, status, output_hash, output_manifest, verifier, verifier_version, cache_hit, started_at, finished_at)
     VALUES (?, ?, ?, ?, ?, 'SUCCEEDED', ?, ?, 'fixture-injection', '1', 0, ?, ?)`
  ).run(RUN_ID, SLUG, stage, attempt, ih, manifest.output_hash, JSON.stringify(manifest), now, now);
  return manifest;
}

// research + brief: rows only need to exist and verify (build phase reads files)
const researchManifest = seedStage("research", researchData, inputHash({ stage: "research", implVersion: "fixture", upstream: [] }));
for (const f of researchData.facts) {
  ctx.db.prepare(`INSERT INTO evidence (prospect_id, fact_key, fact_value, source_url, locator, retrieved_at, confidence, public_copy_ok) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`)
    .run(SLUG, f.key, f.value, f.source_url, f.locator, now, f.confidence);
}
const briefManifest = seedStage("brief", briefData, inputHash({ stage: "brief", implVersion: "fixture", upstream: [researchManifest.output_hash] }));
const briefRow = ctx.db.prepare(`SELECT * FROM stage_executions WHERE run_id = ? AND prospect_id = ? AND stage = 'brief'`).get(RUN_ID, SLUG);

// contacts EXACTLY as buildPhase computes them, to pin the copy CTA + hashes
const prospect = ctx.db.prepare(`SELECT * FROM prospects WHERE run_id = ? AND prospect_id = ?`).get(RUN_ID, SLUG);
const contacts = verifiedContacts(ctx, prospect, researchData);
copyData.chapters[3].cta = contacts.contact[0] ?? contacts.links[0];

// copy + worldspec: seed with the same input hashes the stages will compute,
// so buildPhase memo-hits and no LLM call happens.
{
  const factsRows = ctx.db.prepare(`SELECT fact_key, fact_value, source_url, public_copy_ok FROM evidence WHERE prospect_id = ?`).all(SLUG);
  const prompt = readPrompt("copy", { BRIEF_JSON: briefData, FACTS_JSON: factsRows.filter((f) => f.public_copy_ok), CONTACT_LINKS: [...contacts.contact, ...contacts.links] });
  const templateSha = sha256(prompt.replace(/\{\{[A-Z_]+\}\}/g, ""));
  const ih = inputHash({ stage: "copy", implVersion: "2", upstream: [briefRow.output_hash], external: { model: ctx.config.models.strong, templateSha } });
  const { countWords, validateOrThrow, assertNoEmDashes } = await import("../stages/util.mjs");
  validateOrThrow("copy", copyData);
  assertNoEmDashes(copyData);
  const words = countWords(copyData);
  if (words < 1100 || words > 1700) throw new Error(`fixture copy word count ${words} outside range — adjust fixture`);
  seedStage("copy", { ...copyData, measured_words: words }, ih);
  console.log(`copy fixture: ${words} words`);
}
{
  const example = fs.readFileSync(path.join(HERE, "..", "prompts", "examples", "germantown.example.txt"), "utf8");
  const prompt = readPrompt("worldspec", { EXAMPLE_ENTRY: example, BRIEF_JSON: briefData, PALETTE_JSON: briefData.palette });
  const templateSha = sha256(prompt.replace(/\{\{[A-Z_]+\}\}/g, ""));
  const ih = inputHash({ stage: "worldspec", implVersion: "1", upstream: [briefRow.output_hash], external: { model: ctx.config.models.strong, templateSha } });
  const { validateOrThrow } = await import("../stages/util.mjs");
  validateOrThrow("worldspec", worldspec);
  seedStage("worldspec", worldspec, ih);
}

console.log(`fixture run '${RUN_ID}' seeded: slug ${SLUG}, brief hash ${briefRow.output_hash.slice(0, 16)}…`);
console.log(`next: node bin/radar-studio.mjs approve --run ${RUN_ID} --approver "radar-studio fixture harness" --note "mechanical smoke test"`);
ctx.db.close();
