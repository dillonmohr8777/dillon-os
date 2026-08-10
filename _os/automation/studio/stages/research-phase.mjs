// Research-phase stages: intake -> research -> logo -> brief -> reviewer page.
// No publishing, no outreach; everything lands in the work dir + DB.
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "../core/paths.mjs";
import { inputHash, manifestOf, sha256, STATUS } from "../core/stage-machine.mjs";
import { invokeClaude, fencedJson } from "../core/claude-invoke.mjs";
import { validateOrThrow, readPrompt } from "./util.mjs";

// Builds 166-178 shipped before the studio existed; never rebuild them.
const PRE_STUDIO_BUILT = [
  "golden-eagle-jewelry", "maclaren-kitchen-bath", "morton-electric-pool-spa",
  "germantown-dental-group", "udis-conn-orthodontics", "jarman-sales-service",
  "lees-hoagie-house", "anthony-gueriera-insurance", "ban-ban-asian-bistro",
  "big-head-transport", "dutton-road-veterinary-clinic", "elite-auto-parts",
  "kehans-auto-service",
];

export function slugify(name) {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function parseCsv(text) {
  const [head, ...lines] = text.split(/\r?\n/).filter(Boolean);
  const cols = head.split(",");
  return lines.map((line) => {
    const cells = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) { cells.push(cur); cur = ""; }
      else cur += ch;
    }
    cells.push(cur);
    return Object.fromEntries(cols.map((c, i) => [c, cells[i] ?? ""]));
  });
}

// ---------------------------------------------------------------- intake
export function intake(ctx, count) {
  const csvPath = path.join(REPO_ROOT, ctx.config.radar.buildQueue);
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  const already = new Set([
    ...PRE_STUDIO_BUILT,
    ...ctx.db.prepare("SELECT prospect_id FROM built_sites").all().map((r) => r.prospect_id),
  ]);
  const eligible = rows
    .filter((r) => r.verdict === "rebuild")
    .filter((r) => Number(r.site_quality) <= ctx.config.intake.rebuildBandMax)
    .map((r) => ({ ...r, slug: slugify(r.business_name) }))
    .filter((r) => !already.has(r.slug))
    .sort((a, b) => Number(b.priority_score) - Number(a.priority_score));

  const picked = eligible.slice(0, count);
  const ins = ctx.db.prepare(
    `INSERT OR IGNORE INTO prospects (run_id, prospect_id, slug, business_name, city, vertical, radar_priority, site_quality_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const p of picked) {
    ins.run(ctx.runId, p.slug, p.slug, p.business_name, p.city, p.vertical, Number(p.priority_score), Number(p.site_quality));
  }
  return { picked, poolRemaining: eligible.length - picked.length };
}

// ------------------------------------------------------- generic LLM stage
async function llmStage(ctx, prospect, { stage, implVersion, upstream, prompt, model, allowedTools, schemaKind, verifierExtra, maxTurns, timeoutMs }) {
  const templateSha = sha256(prompt.replace(/\{\{[A-Z_]+\}\}/g, ""));
  const ih = inputHash({
    stage, implVersion,
    params: {},
    upstream,
    external: { model, templateSha },
  });
  const memo = ctx.sm.findMemo(prospect.slug, stage, ih);
  if (memo) return { row: memo, data: JSON.parse(fs.readFileSync(JSON.parse(memo.output_manifest).entries[0] ? path.join(JSON.parse(memo.output_manifest).baseDir, JSON.parse(memo.output_manifest).entries[0].path) : "", "utf8")), cached: true };

  const row = ctx.sm.create(ctx.runId, prospect.slug, stage, ih);
  const lease = ctx.sm.lease(row.id);
  const hb = setInterval(() => ctx.sm.heartbeat(row.id, lease), 15_000);
  hb.unref();
  try {
    const settle = ctx.budgets.reserve("llm_usd", 3);
    if (!settle) { clearInterval(hb); ctx.db.prepare("UPDATE stage_executions SET status='EXHAUSTED', finished_at=? WHERE id=?").run(Date.now(), row.id); throw new Error(`budget exhausted before ${stage}`); }
    const res = await invokeClaude(ctx.db, {
      prompt, model, allowedTools, maxTurns: maxTurns ?? 24,
      timeoutMs: timeoutMs ?? ctx.config.budgets.perStageDefaults.llm_timeout_ms,
      templateSha, inputsHash: ih, cwd: ctx.workDir,
    });
    settle(res.costUsd);
    const data = fencedJson(res.text);
    validateOrThrow(schemaKind, data);
    if (verifierExtra) verifierExtra(data);

    const dir = path.join(ctx.workDir, prospect.slug);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = path.join(dir, `${stage}.tmp-${lease}.json`);
    const finalPath = path.join(dir, `${stage}.json`);
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, finalPath);
    const manifest = manifestOf([finalPath], dir);
    ctx.sm.succeed(row.id, lease, {
      manifest, verifier: `ajv:${schemaKind}`, verifierVersion: "1",
      cost: { usd: res.costUsd, ms: res.durationMs, tokens: res.usage },
    });
    return { row: ctx.sm.get(ctx.runId, prospect.slug, stage, row.attempt), data, cached: false, costUsd: res.costUsd, ms: res.durationMs };
  } catch (err) {
    try { ctx.sm.fail(row.id, lease, err.message); } catch { /* already terminal */ }
    throw err;
  } finally {
    clearInterval(hb);
  }
}

// ---------------------------------------------------------------- research
export async function research(ctx, prospect) {
  const prompt = readPrompt("research", {
    PROSPECT_JSON: {
      business_name: prospect.business_name, city: prospect.city,
      vertical: prospect.vertical, website_from_radar: prospect.website ?? null,
    },
  });
  const out = await llmStage(ctx, prospect, {
    stage: "research", implVersion: "1", upstream: [],
    prompt, model: ctx.config.models.strong,
    allowedTools: ["WebSearch", "WebFetch"], schemaKind: "research",
    maxTurns: 40, timeoutMs: 900_000,
  });
  // evidence ledger rows
  if (!out.cached) {
    const ins = ctx.db.prepare(
      `INSERT INTO evidence (prospect_id, fact_key, fact_value, source_url, locator, retrieved_at, confidence, public_copy_ok)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const f of out.data.facts) {
      ins.run(prospect.slug, f.key, String(f.value).slice(0, 2000), f.source_url, f.locator ?? "", Date.now(), f.confidence, f.public_copy_ok ? 1 : 0);
    }
  }
  if (out.data.identity.status === "ambiguous") {
    const err = new Error(`identity ambiguous: ${out.data.identity.reason_if_ambiguous || "unspecified"}`);
    err.quarantine = true;
    throw err;
  }
  return out;
}

// ---------------------------------------------------------------- logo
// Deterministic, fail-open to a labeled text lockup (logo failure downgrades,
// never quarantines). SVGs are sanitized; nothing is ever redrawn.
export async function logo(ctx, prospect, researchData) {
  const stage = "logo";
  const ih = inputHash({ stage, implVersion: "1", upstream: [], external: { candidates: researchData.logo_candidates.map((c) => c.url) } });
  const memo = ctx.sm.findMemo(prospect.slug, stage, ih);
  if (memo) return { row: memo, cached: true, result: JSON.parse(fs.readFileSync(path.join(JSON.parse(memo.output_manifest).baseDir, "logo.json"), "utf8")) };

  const row = ctx.sm.create(ctx.runId, prospect.slug, stage, ih);
  const lease = ctx.sm.lease(row.id);
  const dir = path.join(ctx.workDir, prospect.slug);
  fs.mkdirSync(dir, { recursive: true });
  let result = { official: false, tier: "E", note: "text lockup fallback (labeled concept mark)" };
  try {
    for (const cand of researchData.logo_candidates ?? []) {
      if (!/^https:\/\//.test(cand.url)) continue;
      try {
        const res = await fetch(cand.url, { redirect: "follow", signal: AbortSignal.timeout(20_000) });
        if (!res.ok) continue;
        const type = res.headers.get("content-type") ?? "";
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 900 || buf.length > 6_000_000) continue;
        let ext = type.includes("svg") ? "svg" : type.includes("png") ? "png" : type.includes("jpeg") ? "jpg" : type.includes("webp") ? "webp" : null;
        if (!ext) continue;
        let body = buf;
        if (ext === "svg") {
          let svg = buf.toString("utf8");
          svg = svg.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+="[^"]*"/gi, "").replace(/href="https?:[^"]*"/gi, 'href=""');
          body = Buffer.from(svg);
        }
        const file = path.join(dir, `logo-original.${ext}`);
        fs.writeFileSync(file, body);
        result = {
          official: cand.tier !== "E", tier: cand.tier, source_url: cand.url,
          file, sha256: sha256(body), content_type: type, bytes: body.length,
        };
        break;
      } catch { /* next candidate */ }
    }
    fs.writeFileSync(path.join(dir, "logo.json"), JSON.stringify(result, null, 2));
    ctx.db.prepare(
      `INSERT OR REPLACE INTO logos (prospect_id, source_url, source_tier, file_path, sha256, official, sanitized, confidence, retrieved_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`
    ).run(prospect.slug, result.source_url ?? null, result.tier, result.file ?? null, result.sha256 ?? null, result.official ? 1 : 0, result.official ? 0.8 : 0.2, Date.now());
    const manifest = manifestOf([path.join(dir, "logo.json"), ...(result.file ? [result.file] : [])], dir);
    ctx.sm.succeed(row.id, lease, { manifest, verifier: "logo-provenance", verifierVersion: "1" });
    return { row, result, cached: false };
  } catch (err) {
    ctx.sm.fail(row.id, lease, err.message);
    throw err;
  }
}

// ---------------------------------------------------------------- brief
export async function brief(ctx, prospect, researchRow, researchData) {
  const fontPool = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "_os/automation/studio/config/font-pool.json"), "utf8"));
  const recent = ctx.db.prepare(
    `SELECT architecture_family, palette_bucket, font_pair, camera_preset, motion_verb
     FROM design_signatures ORDER BY created_at DESC LIMIT 60`
  ).all();
  // Pre-studio signatures so the first runs still diverge from builds 166-178.
  const seeded = [
    { architecture_family: "transformation-story", palette_bucket: "teal-dark", font_pair: "alumni-sans+public-sans", camera_preset: "pushReveal", motion_verb: "ALIGN" },
    { architecture_family: "transformation-story", palette_bucket: "gold-dark", font_pair: "facet-display+lab-text", camera_preset: "orbitArc", motion_verb: "FACET" },
  ];
  const prompt = readPrompt("brief", {
    PROSPECT_JSON: { business_name: prospect.business_name, city: prospect.city, vertical: prospect.vertical, slug: prospect.slug },
    RESEARCH_JSON: { identity: researchData.identity, facts: researchData.facts, visual_cues: researchData.visual_cues, faq_seeds: researchData.faq_seeds, ambiguities: researchData.ambiguities },
    RECENT_SIGNATURES: [...seeded, ...recent],
    FONT_POOL: fontPool.families.map((f) => ({ id: f.id, family: f.family, role: f.role, voices: f.voices })),
  });
  const out = await llmStage(ctx, prospect, {
    stage: "brief", implVersion: "1", upstream: [researchRow.output_hash],
    prompt, model: ctx.config.models.strong, allowedTools: [], schemaKind: "brief",
    verifierExtra: (data) => {
      const pool = new Set(fontPool.families.map((f) => f.id));
      if (!pool.has(data.type.display_id) || !pool.has(data.type.text_id)) throw new Error("brief chose a font outside the pool");
      const pair = `${data.type.display_id}+${data.type.text_id}`;
      const clash = recent.find((r) => r.font_pair === pair);
      if (clash) throw new Error(`font pair ${pair} used within the lookback window`);
    },
  });
  return out;
}

// ---------------------------------------------------------- reviewer page
export function reviewerPage(ctx, entries) {
  const rows = entries.map((e) => `
    <article class="brief" data-slug="${e.brief.slug}">
      <header>
        <label><input type="checkbox" class="inc" checked /> <strong>${e.prospect.business_name}</strong></label>
        <span>${e.prospect.vertical} · ${e.prospect.city} · priority ${e.prospect.radar_priority} · confidence ${e.brief.source_confidence ?? "?"}</span>
      </header>
      <p class="scene">${e.brief.scene_sentence}</p>
      <dl>
        <div><dt>Voice</dt><dd>${e.brief.voice_words.join(" · ")}</dd></div>
        <div><dt>Architecture</dt><dd>${e.brief.architecture_family}</dd></div>
        <div><dt>Verb</dt><dd>${e.brief.verb}</dd></div>
        <div><dt>Camera</dt><dd>${e.brief.camera_preset}</dd></div>
        <div><dt>Palette</dt><dd><i style="background:${e.brief.palette.bg}"></i><i style="background:${e.brief.palette.accent}"></i><i style="background:${e.brief.palette.accent2}"></i> ${(e.brief.palette.material_names ?? []).join(", ")}</dd></div>
        <div><dt>Type</dt><dd>${e.brief.type.display_id} + ${e.brief.type.text_id}</dd></div>
        <div><dt>Metaphor</dt><dd>${(e.brief.metaphor.objects ?? []).join(", ")}</dd></div>
        <div><dt>CTA</dt><dd>${e.brief.primary_cta.label} (${e.brief.primary_cta.kind})</dd></div>
        <div><dt>References</dt><dd>${(e.brief.references ?? []).join(" · ")}</dd></div>
      </dl>
      <details><summary>Image plan (${e.brief.image_plan.length})</summary><ol>${e.brief.image_plan.map((i) => `<li><b>${i.role}</b> ${i.prompt}</li>`).join("")}</ol></details>
      <details><summary>Uncertainties (${e.brief.uncertainties.length})</summary><ul>${e.brief.uncertainties.map((u) => `<li>${u}</li>`).join("")}</ul></details>
      <code class="hash">brief ${e.briefHash.slice(0, 16)}…</code>
    </article>`).join("\n");

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
  <meta name="robots" content="noindex, nofollow"/><title>Batch approval — ${ctx.runId}</title>
  <style>
    body{margin:0;padding:40px;background:#0b0d0f;color:#f2efe8;font:15px/1.6 "Segoe UI",sans-serif;max-width:960px}
    h1{font-size:28px;margin:0 0 6px} .sub{color:#9a968c;margin:0 0 30px}
    .brief{border:1px solid #2a2e33;border-radius:10px;padding:22px 24px;margin:0 0 18px;background:#101317}
    .brief header{display:flex;justify-content:space-between;gap:16px;align-items:baseline;margin-bottom:8px}
    .brief header span{color:#9a968c;font-size:12.5px}
    .scene{color:#cfcabd;font-style:italic;margin:6px 0 14px}
    dl{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px 20px;margin:0 0 10px}
    dt{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#8b877d}
    dd{margin:2px 0 0;font-size:13.5px} dd i{display:inline-block;width:14px;height:14px;border-radius:3px;margin-right:4px;vertical-align:-2px;border:1px solid #333}
    details{margin:8px 0;font-size:13px;color:#c4c0b5} summary{cursor:pointer}
    .hash{display:block;margin-top:10px;color:#6f6b62;font-size:11px}
    .bar{position:sticky;top:0;background:#0b0d0fee;padding:14px 0;margin-bottom:20px;border-bottom:1px solid #23262b}
    button{background:#e8b84a;border:0;color:#151310;font-weight:700;padding:10px 18px;border-radius:8px;cursor:pointer}
    textarea{width:100%;height:110px;background:#0e1013;color:#c9c5ba;border:1px solid #2a2e33;border-radius:8px;margin-top:12px;font:12px monospace}
  </style></head><body>
  <h1>Prospect Radar — batch approval</h1>
  <p class="sub">Run ${ctx.runId} · ${entries.length} shape briefs · uncheck to exclude · then run the printed command</p>
  <div class="bar"><button onclick="emit()">Generate approval command</button><textarea id="out" readonly placeholder="The exact radar-studio approve command appears here."></textarea></div>
  ${rows}
  <script>
    function emit(){
      const ex = [...document.querySelectorAll('.brief')].filter(b => !b.querySelector('.inc').checked).map(b => b.dataset.slug);
      const cmd = 'node _os/automation/studio/bin/radar-studio.mjs approve --run ${ctx.runId} --approver "Dillon Mohr"' + (ex.length ? ' --exclude ' + ex.join(',') : '');
      document.getElementById('out').value = cmd;
    }
  </script></body></html>`;

  const dir = path.join(ctx.dataRootDir, "review", ctx.runId);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "index.html");
  fs.writeFileSync(file, html);
  return file;
}
