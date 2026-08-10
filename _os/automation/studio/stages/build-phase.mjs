// Build-phase stages: copy -> fonts -> images -> worldspec -> assemble -> build+QA.
// Everything works inside workDir/<run>/batch — an isolated engine consumer.
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { REPO_ROOT, enginePath, casPath } from "../core/paths.mjs";
import { inputHash, manifestOf, sha256 } from "../core/stage-machine.mjs";
import { invokeClaude, fencedJson } from "../core/claude-invoke.mjs";
import { validateOrThrow, assertNoEmDashes, countWords, serializeConfig, generatePlaceholderPlates, readPrompt } from "./util.mjs";

const STUDIO = path.join(REPO_ROOT, "_os", "automation", "studio");

// -------------------------------------------------------------- contacts
export function verifiedContacts(ctx, prospect, researchData) {
  const facts = Object.fromEntries(
    ctx.db.prepare(`SELECT fact_key, fact_value, confidence, public_copy_ok FROM evidence WHERE prospect_id = ?`).all(prospect.slug)
      .filter((f) => f.public_copy_ok && f.confidence >= 0.7)
      .map((f) => [f.fact_key, f.fact_value])
  );
  const links = [];
  const contact = [];
  if (facts.phone) {
    const digits = String(facts.phone).replace(/\D/g, "");
    if (digits.length === 10 || (digits.length === 11 && digits.startsWith("1"))) {
      contact.push([`Call ${prospect.business_name.split(" ")[0]}`, `tel:+1${digits.slice(-10)}`]);
    }
  }
  const domain = researchData.identity.official_domain;
  if (domain) links.push(["Official site", `https://${domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`]);
  const q = encodeURIComponent(`${prospect.business_name} ${facts.address ?? prospect.city ?? ""}`.trim());
  links.push([facts.address ? "Directions" : "Map listing", `https://www.google.com/maps/search/?api=1&query=${q}`]);
  return { links, contact, facts, domain };
}

// -------------------------------------------------------------- copy
export async function copyStage(ctx, prospect, briefRow, briefData, contacts) {
  const factsRows = ctx.db.prepare(`SELECT fact_key, fact_value, source_url, public_copy_ok FROM evidence WHERE prospect_id = ?`).all(prospect.slug);
  const prompt = readPrompt("copy", {
    BRIEF_JSON: briefData,
    FACTS_JSON: factsRows.filter((f) => f.public_copy_ok),
    CONTACT_LINKS: [...contacts.contact, ...contacts.links],
  });
  const templateSha = sha256(prompt.replace(/\{\{[A-Z_]+\}\}/g, ""));
  const ih = inputHash({ stage: "copy", implVersion: "2", upstream: [briefRow.output_hash], external: { model: ctx.config.models.strong, templateSha } });
  const memo = ctx.sm.findMemo(prospect.slug, "copy", ih);
  if (memo) {
    const m = JSON.parse(memo.output_manifest);
    return { row: memo, data: JSON.parse(fs.readFileSync(path.join(m.baseDir, "copy.json"), "utf8")), cached: true };
  }
  const row = ctx.sm.create(ctx.runId, prospect.slug, "copy", ih);
  const lease = ctx.sm.lease(row.id);
  try {
    const settle = ctx.budgets.reserve("llm_usd", 4);
    if (!settle) throw new Error("budget exhausted before copy");
    const res = await invokeClaude(ctx.db, {
      prompt, model: ctx.config.models.strong, allowedTools: [], maxTurns: 8,
      timeoutMs: 900_000, templateSha, inputsHash: ih, cwd: ctx.workDir,
    });
    settle(res.costUsd);
    const data = fencedJson(res.text);
    validateOrThrow("copy", data);
    assertNoEmDashes(data);
    const words = countWords(data);
    const { wordsMin, wordsMax } = ctx.config.quality;
    if (words < wordsMin || words > wordsMax) throw new Error(`copy word count ${words} outside ${wordsMin}-${wordsMax}`);
    for (let i = 0; i < 4; i++) {
      if (data.chapters[i].state !== briefData.states_arc[i]) throw new Error(`chapter ${i} state "${data.chapters[i].state}" != brief arc "${briefData.states_arc[i]}"`);
    }
    const dir = path.join(ctx.workDir, prospect.slug);
    fs.mkdirSync(dir, { recursive: true });
    const finalPath = path.join(dir, "copy.json");
    fs.writeFileSync(finalPath + ".tmp", JSON.stringify({ ...data, measured_words: words }, null, 2));
    fs.renameSync(finalPath + ".tmp", finalPath);
    const manifest = manifestOf([finalPath], dir);
    ctx.sm.succeed(row.id, lease, { manifest, verifier: "ajv:copy+words+emdash+states", verifierVersion: "2", cost: { usd: res.costUsd, ms: res.durationMs } });
    return { row: ctx.sm.get(ctx.runId, prospect.slug, "copy", row.attempt), data: { ...data, measured_words: words }, cached: false, costUsd: res.costUsd, ms: res.durationMs };
  } catch (err) {
    try { ctx.sm.fail(row.id, lease, err.message); } catch { }
    throw err;
  }
}

// -------------------------------------------------------------- fonts
export async function fontsStage(ctx, prospect, briefData) {
  const pool = JSON.parse(fs.readFileSync(path.join(STUDIO, "config", "font-pool.json"), "utf8"));
  const pick = (id) => pool.families.find((f) => f.id === id);
  const display = pick(briefData.type.display_id);
  const text = pick(briefData.type.text_id);
  const ih = inputHash({ stage: "fonts", implVersion: "1", upstream: [], external: { display: display.id, text: text.id } });
  const memo = ctx.sm.findMemo(prospect.slug, "fonts", ih);
  if (memo) {
    const m = JSON.parse(memo.output_manifest);
    return { row: memo, data: JSON.parse(fs.readFileSync(path.join(m.baseDir, "fonts.json"), "utf8")), cached: true };
  }
  const row = ctx.sm.create(ctx.runId, prospect.slug, "fonts", ih);
  const lease = ctx.sm.lease(row.id);
  try {
    const dir = path.join(ctx.workDir, prospect.slug, "fonts");
    fs.mkdirSync(dir, { recursive: true });
    const entries = {};
    for (const [role, f] of [["display", display], ["text", text]]) {
      const url = f.variable
        ? pool.urlTemplateVariable.replace("{id}", f.id)
        : pool.urlTemplateStatic.replace("{id}", f.id).replace("{weight}", String(f.weights.at(-1)));
      const cache = path.join(ctx.dataRootDir, "cache", "fonts", `${f.id}${f.variable ? "-vf" : `-${f.weights.at(-1)}`}.woff2`);
      if (!fs.existsSync(cache)) {
        const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
        if (!res.ok) throw new Error(`font download failed ${f.id}: HTTP ${res.status}`);
        fs.mkdirSync(path.dirname(cache), { recursive: true });
        fs.writeFileSync(cache, Buffer.from(await res.arrayBuffer()));
      }
      const local = path.join(dir, `${f.id}.woff2`);
      fs.copyFileSync(cache, local);
      entries[role] = {
        family: f.family, id: f.id, file: `/assets/fonts/${f.id}.woff2`,
        localFile: local, weightRange: f.variable ? "100 900" : String(f.weights.at(-1)),
        license: f.license, source_url: url,
      };
      ctx.db.prepare(
        `INSERT OR REPLACE INTO fonts (site_slug, role, family, source_url, license, subset_sha, ledger_note)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(prospect.slug, role, f.family, url, f.license, sha256(fs.readFileSync(local)), "fontsource latin subset; pyftsubset deferred to M2");
    }
    const finalPath = path.join(ctx.workDir, prospect.slug, "fonts.json");
    fs.writeFileSync(finalPath, JSON.stringify(entries, null, 2));
    const manifest = manifestOf([finalPath, entries.display.localFile, entries.text.localFile], path.join(ctx.workDir, prospect.slug));
    ctx.sm.succeed(row.id, lease, { manifest, verifier: "font-ledger", verifierVersion: "1" });
    return { row: ctx.sm.get(ctx.runId, prospect.slug, "fonts", row.attempt), data: entries, cached: false };
  } catch (err) {
    try { ctx.sm.fail(row.id, lease, err.message); } catch { }
    throw err;
  }
}

// -------------------------------------------------------------- images
// M1: placeholder adapter only. Real providers (openai|higgsfield) plug in
// behind the same contract once Dillon picks one; prompts are already in the
// brief's image_plan, so switching providers re-runs only this stage.
export async function imagesStage(ctx, prospect, briefData) {
  const provider = ctx.config.images?.provider ?? "placeholder";
  const ih = inputHash({
    stage: "images", implVersion: "1", upstream: [],
    external: { provider, plan: briefData.image_plan.map((p) => sha256(p.prompt)), palette: briefData.palette },
  });
  const memo = ctx.sm.findMemo(prospect.slug, "images", ih);
  if (memo) return { row: memo, cached: true, dir: path.join(JSON.parse(memo.output_manifest).baseDir, "plates") };

  const row = ctx.sm.create(ctx.runId, prospect.slug, "images", ih);
  const lease = ctx.sm.lease(row.id);
  try {
    const settle = ctx.budgets.reserve("images_count", briefData.image_plan.length);
    if (!settle) throw new Error("image budget exhausted");
    const dir = path.join(ctx.workDir, prospect.slug, "plates");
    if (provider !== "placeholder") throw new Error(`image provider "${provider}" not wired yet — placeholder is the only M1 adapter`);
    const files = await generatePlaceholderPlates({ slug: prospect.slug, palette: briefData.palette, outDir: dir, seed: hashSeed(prospect.slug) });
    settle(files.length);
    const ins = ctx.db.prepare(
      `INSERT OR REPLACE INTO images (prospect_id, role, prompt_hash, prompt, model, file_path, sha256, synthetic, approved, generated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?)`
    );
    for (const [i, f] of files.entries()) {
      const plan = briefData.image_plan[Math.min(i, briefData.image_plan.length - 1)];
      ins.run(prospect.slug, path.basename(f, ".webp"), sha256(plan.prompt), plan.prompt, "placeholder-pending-provider", f, sha256(fs.readFileSync(f)), Date.now());
    }
    const manifest = manifestOf(files, path.join(ctx.workDir, prospect.slug));
    ctx.sm.succeed(row.id, lease, { manifest, verifier: "image-ledger", verifierVersion: "1" });
    return { row: ctx.sm.get(ctx.runId, prospect.slug, "images", row.attempt), dir, cached: false };
  } catch (err) {
    try { ctx.sm.fail(row.id, lease, err.message); } catch { }
    throw err;
  }
}

function hashSeed(slug) {
  let n = 0;
  for (const ch of slug) n = (n * 31 + ch.charCodeAt(0)) % 100000;
  return n + 11;
}

// -------------------------------------------------------------- worldspec
export async function worldspecStage(ctx, prospect, briefRow, briefData) {
  const example = fs.readFileSync(path.join(STUDIO, "prompts", "examples", "germantown.example.txt"), "utf8");
  const prompt = readPrompt("worldspec", {
    EXAMPLE_ENTRY: example,
    BRIEF_JSON: briefData,
    PALETTE_JSON: briefData.palette,
  });
  const templateSha = sha256(prompt.replace(/\{\{[A-Z_]+\}\}/g, ""));
  const ih = inputHash({ stage: "worldspec", implVersion: "1", upstream: [briefRow.output_hash], external: { model: ctx.config.models.strong, templateSha } });
  const memo = ctx.sm.findMemo(prospect.slug, "worldspec", ih);
  if (memo) {
    const m = JSON.parse(memo.output_manifest);
    return { row: memo, data: JSON.parse(fs.readFileSync(path.join(m.baseDir, "worldspec.json"), "utf8")), cached: true };
  }
  const row = ctx.sm.create(ctx.runId, prospect.slug, "worldspec", ih);
  const lease = ctx.sm.lease(row.id);
  try {
    const settle = ctx.budgets.reserve("llm_usd", 3);
    if (!settle) throw new Error("budget exhausted before worldspec");
    const res = await invokeClaude(ctx.db, {
      prompt, model: ctx.config.models.strong, allowedTools: [], maxTurns: 8,
      timeoutMs: 900_000, templateSha, inputsHash: ih, cwd: ctx.workDir,
    });
    settle(res.costUsd);
    const data = fencedJson(res.text);
    validateOrThrow("worldspec", data);
    const dir = path.join(ctx.workDir, prospect.slug);
    const finalPath = path.join(dir, "worldspec.json");
    fs.writeFileSync(finalPath + ".tmp", JSON.stringify(data, null, 2));
    fs.renameSync(finalPath + ".tmp", finalPath);
    const manifest = manifestOf([finalPath], dir);
    ctx.sm.succeed(row.id, lease, { manifest, verifier: "ajv:worldspec+ranges", verifierVersion: "1", cost: { usd: res.costUsd, ms: res.durationMs } });
    return { row: ctx.sm.get(ctx.runId, prospect.slug, "worldspec", row.attempt), data, cached: false, costUsd: res.costUsd, ms: res.durationMs };
  } catch (err) {
    try { ctx.sm.fail(row.id, lease, err.message); } catch { }
    throw err;
  }
}

// -------------------------------------------------------------- assemble
export function assembleEntry({ prospect, briefData, copyData, worldspec, fonts, contacts, buildNumber }) {
  const lastChapter = copyData.chapters[3];
  const allowed = new Set([...contacts.contact, ...contacts.links].map(([, u]) => u));
  if (lastChapter.cta && !allowed.has(lastChapter.cta[1])) {
    lastChapter.cta = contacts.contact[0] ?? contacts.links[0];
  }
  return {
    build: buildNumber,
    name: prospect.business_name,
    lockup: worldspec.lockup,
    initials: worldspec.initials,
    verb: briefData.verb,
    domain: contacts.domain ?? null,
    city: `${prospect.city}, PA`,
    vertical: prospect.vertical,
    lens: worldspec.lens,
    accent: briefData.palette.accent,
    accent2: briefData.palette.accent2,
    bg: briefData.palette.bg,
    plates: { __raw: `plates(${JSON.stringify(prospect.slug)})` },
    heroAlt: briefData.hero_alt,
    fonts: {
      display: { family: fonts.display.family, file: fonts.display.file, weightRange: fonts.display.weightRange },
      text: { family: fonts.text.family, file: fonts.text.file, weightRange: fonts.text.weightRange },
    },
    world: worldspec.world,
    panels: worldspec.panels,
    states: briefData.states_arc,
    copy: {
      context: copyData.context,
      h1: copyData.h1,
      chapters: copyData.chapters.map((ch) => {
        const out = { step: ch.step, state: ch.state, title: ch.title, body: ch.body };
        if (ch.ledger) out.ledger = ch.ledger;
        else if (ch.list) out.list = ch.list;
        else if (ch.cta) out.cta = ch.cta;
        return out;
      }),
      sequence: copyData.sequence,
      services: copyData.services,
      area: copyData.area,
      faq: copyData.faq,
      brief: copyData.brief_paragraphs,
      note: copyData.note,
      verify: { line: copyData.verify_line, links: contacts.links },
      contact: contacts.contact,
    },
  };
}

// Support {__raw} escape in the serializer via a pre-pass.
export function writeConfig(batchDir, { meta, sites, order }) {
  let text = serializeConfig({ meta, sites, order });
  text = text.replace(/\{\s*__raw:\s*"((?:[^"\\]|\\.)*)"\s*\}/g, (_, raw) => JSON.parse(`"${raw}"`));
  fs.writeFileSync(path.join(batchDir, "src", "config.mjs"), text);
  return text;
}

// -------------------------------------------------------------- batch build
export function prepareBatchDir(ctx) {
  const batch = path.join(ctx.workDir, "batch");
  const eng = enginePath(ctx.config);
  fs.mkdirSync(path.join(batch, "src"), { recursive: true });
  fs.mkdirSync(path.join(batch, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(batch, "public", "assets", "fonts"), { recursive: true });
  fs.mkdirSync(path.join(batch, "public", "assets", "plates"), { recursive: true });
  for (const f of ["src/scenes.js", "src/site.js", "src/styles.css"]) fs.copyFileSync(path.join(eng, f), path.join(batch, f));
  for (const f of ["build-pages.mjs", "generate-textures.mjs", "qa.mjs", "qa-browser.mjs"]) fs.copyFileSync(path.join(eng, "scripts", f), path.join(batch, "scripts", f));
  fs.copyFileSync(path.join(eng, "vite.config.js"), path.join(batch, "vite.config.js"));
  fs.copyFileSync(path.join(eng, "package.json"), path.join(batch, "package.json"));
  fs.copyFileSync(path.join(eng, "fixtures", "_headers"), path.join(batch, "public", "_headers"));
  // default lab fonts (the lab index @font-face expects them)
  for (const f of fs.readdirSync(path.join(eng, "fixtures", "fonts"))) {
    fs.copyFileSync(path.join(eng, "fixtures", "fonts", f), path.join(batch, "public", "assets", "fonts", f));
  }
  // engine deps via junction (same volume, instant, never committed)
  const nm = path.join(batch, "node_modules");
  if (!fs.existsSync(nm)) fs.symlinkSync(path.join(eng, "node_modules"), nm, "junction");
  return batch;
}

export function runIn(dir, cmd, args, { timeoutMs = 600_000, env = {} } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(cmd, args, { cwd: dir, shell: true, windowsHide: true, env: { ...process.env, ...env } });
    let out = "", err = "";
    const timer = setTimeout(() => { try { spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { shell: true }); } catch { } }, timeoutMs);
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { err += d; });
    child.on("close", (code) => {
      clearTimeout(timer);
      code === 0 ? resolvePromise({ out, err }) : reject(new Error(`${cmd} ${args.join(" ")} exited ${code}\n${(out + err).slice(-2000)}`));
    });
  });
}
