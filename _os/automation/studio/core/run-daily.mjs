// The daily run: research phase -> hash-pinned approval -> build phase.
// Resumable by construction: every stage memoizes on input hash; re-running a
// phase skips verified work.
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { loadConfig, dataRoot, ensureDataTree, workDir, artifactsDir, REPO_ROOT, enginePath } from "./paths.mjs";
import { openDb } from "./db.mjs";
import { RunLock } from "./lock.mjs";
import { StageMachine } from "./stage-machine.mjs";
import { Budgets, Semaphore } from "./scheduler.mjs";
import { intake, research, logo, brief, reviewerPage } from "../stages/research-phase.mjs";
import { verifiedContacts, copyStage, fontsStage, imagesStage, worldspecStage, assembleEntry, writeConfig, prepareBatchDir, runIn } from "../stages/build-phase.mjs";
import { evalStage, writeRunReport } from "../stages/eval-report.mjs";
import { sha256 } from "./stage-machine.mjs";
import { execFileSync } from "node:child_process";

export function makeCtx(runId) {
  const config = loadConfig();
  const root = ensureDataTree();
  const db = openDb();
  const ctx = {
    config, db, runId,
    dataRootDir: root,
    workDir: workDir(runId),
    artifactsDir: artifactsDir(runId),
    sm: new StageMachine(db, { leaseStaleMs: config.retries.leaseStaleSeconds * 1000 }),
    budgets: new Budgets(db, runId),
    lanes: { research: new Semaphore(config.lanes.research) },
    repoSha: execFileSync("git", ["-C", REPO_ROOT, "rev-parse", "--short", "HEAD"], { encoding: "utf8", windowsHide: true }).trim(),
    engineVersion: JSON.parse(fs.readFileSync(path.join(enginePath(config), "engine.version.json"), "utf8")).engine_version,
  };
  fs.mkdirSync(ctx.workDir, { recursive: true });
  fs.mkdirSync(ctx.artifactsDir, { recursive: true });
  return ctx;
}

export async function researchPhase(runId, { count }) {
  const ctx = makeCtx(runId);
  const lock = new RunLock(path.join(ctx.dataRootDir, "locks")).acquire();
  const started = Date.now();
  try {
    ctx.db.prepare(
      `INSERT INTO runs (run_id, run_date, phase, status, repo_sha, engine_version, started_at)
       VALUES (?, ?, 'research', 'active', ?, ?, ?)
       ON CONFLICT(run_id) DO UPDATE SET phase = CASE WHEN runs.phase = 'research' THEN 'research' ELSE runs.phase END`
    ).run(runId, runId, ctx.repoSha, ctx.engineVersion, started);
    ctx.budgets.init(ctx.config.budgets.perRun);
    ctx.sm.reapStale();

    const { picked, poolRemaining } = intake(ctx, count);
    console.log(`intake: ${picked.length} prospects (${poolRemaining} more eligible in queue)`);
    if (!picked.length) throw new Error("no eligible prospects in the build queue");

    const results = [];
    const quarantined = [];
    await Promise.all(picked.map((p) => ctx.lanes.research.run(async () => {
      const prospect = ctx.db.prepare(`SELECT * FROM prospects WHERE run_id = ? AND prospect_id = ?`).get(runId, p.slug);
      prospect.website = p.website;
      try {
        console.log(`research: ${p.slug} ...`);
        const r = await research(ctx, prospect);
        await logo(ctx, prospect, r.data);
        const b = await brief(ctx, prospect, r.row, r.data);
        const briefHash = b.row.output_hash;
        results.push({ prospect, research: r.data, brief: b.data, briefHash });
        console.log(`research: ${p.slug} ok (brief ${briefHash.slice(0, 12)})`);
      } catch (err) {
        quarantined.push({ slug: p.slug, reason: err.message });
        ctx.db.prepare(`UPDATE prospects SET identity_status = 'ambiguous', quarantine_reason = ? WHERE run_id = ? AND prospect_id = ?`)
          .run(err.message.slice(0, 500), runId, p.slug);
        console.error(`research: ${p.slug} QUARANTINED: ${err.message}`);
      }
    })));

    const reviewFile = results.length ? reviewerPage(ctx, results) : null;
    ctx.db.prepare(`UPDATE runs SET phase = 'awaiting_approval' WHERE run_id = ?`).run(runId);
    console.log(`\nresearch phase done in ${((Date.now() - started) / 60000).toFixed(1)} min`);
    if (reviewFile) {
      console.log(`reviewer page: ${reviewFile}`);
      console.log(`approve with:  node _os/automation/studio/bin/radar-studio.mjs approve --run ${runId} --approver "Dillon Mohr" [--exclude slug,slug]`);
    }
    for (const q of quarantined) console.log(`quarantined: ${q.slug} — ${q.reason}`);
    return { results, quarantined, reviewFile };
  } finally {
    lock.release();
    ctx.db.close();
  }
}

export function approveRun(runId, { approver, exclude = [], note = "" }) {
  const ctx = makeCtx(runId);
  try {
    const run = ctx.db.prepare(`SELECT * FROM runs WHERE run_id = ?`).get(runId);
    if (!run) throw new Error(`no run ${runId}`);
    const briefs = ctx.db.prepare(
      `SELECT prospect_id, output_hash FROM stage_executions
       WHERE run_id = ? AND stage = 'brief' AND status = 'SUCCEEDED'`
    ).all(runId).filter((b) => !exclude.includes(b.prospect_id));
    if (!briefs.length) throw new Error("nothing to approve: no SUCCEEDED briefs (or all excluded)");

    const payload = {
      run_id: runId, approver, note, mode: "explicit",
      approved_at: new Date().toISOString(),
      sites: briefs.map((b) => ({ prospect_id: b.prospect_id, brief_hash: b.output_hash })),
      excluded: exclude,
    };
    const approvalsDir = path.join(REPO_ROOT, ctx.config.approvalsDir);
    fs.mkdirSync(approvalsDir, { recursive: true });
    const file = path.join(approvalsDir, `${runId}.approval.json`);
    fs.writeFileSync(file, JSON.stringify(payload, null, 2) + "\n");
    ctx.db.prepare(
      `INSERT INTO approvals (run_id, kind, approver, note, doc_sha256, payload, created_at) VALUES (?, 'batch_shape', ?, ?, ?, ?, ?)`
    ).run(runId, approver, note, sha256(JSON.stringify(payload)), JSON.stringify(payload), Date.now());
    ctx.db.prepare(`UPDATE runs SET phase = 'building' WHERE run_id = ?`).run(runId);
    console.log(`approved ${briefs.length} site(s) for run ${runId}${exclude.length ? `, excluded: ${exclude.join(", ")}` : ""}`);
    console.log(`approval file: ${file}`);
    return file;
  } finally {
    ctx.db.close();
  }
}

export async function buildPhase(runId) {
  const ctx = makeCtx(runId);
  const lock = new RunLock(path.join(ctx.dataRootDir, "locks")).acquire();
  const started = Date.now();
  const timings = {};
  try {
    ctx.budgets.init(ctx.config.budgets.perRun);
    ctx.sm.reapStale();
    // hash-pinned approval gate
    const approvalFile = path.join(REPO_ROOT, ctx.config.approvalsDir, `${runId}.approval.json`);
    if (!fs.existsSync(approvalFile)) { console.log("awaiting approval — nothing to do"); return { skipped: true }; }
    const approval = JSON.parse(fs.readFileSync(approvalFile, "utf8"));

    const approved = [];
    for (const site of approval.sites) {
      const current = ctx.db.prepare(
        `SELECT output_hash FROM stage_executions WHERE run_id = ? AND prospect_id = ? AND stage = 'brief' AND status = 'SUCCEEDED'
         ORDER BY attempt DESC LIMIT 1`
      ).get(runId, site.prospect_id);
      if (!current) { console.error(`hold ${site.prospect_id}: no SUCCEEDED brief`); continue; }
      if (current.output_hash !== site.brief_hash) { console.error(`hold ${site.prospect_id}: brief hash changed since approval — re-approve`); continue; }
      approved.push(site.prospect_id);
    }
    if (!approved.length) throw new Error("no approved site passes the hash pin");
    console.log(`building ${approved.length} approved site(s): ${approved.join(", ")}`);

    // per-site preparation
    const entries = [];
    const quarantined = [];
    const t0 = Date.now();
    for (const slug of approved) {
      const prospect = ctx.db.prepare(`SELECT * FROM prospects WHERE run_id = ? AND prospect_id = ?`).get(runId, slug);
      try {
        const briefRow = ctx.db.prepare(`SELECT * FROM stage_executions WHERE run_id = ? AND prospect_id = ? AND stage = 'brief' AND status = 'SUCCEEDED' ORDER BY attempt DESC LIMIT 1`).get(runId, slug);
        const briefData = JSON.parse(fs.readFileSync(path.join(ctx.workDir, slug, "brief.json"), "utf8"));
        const researchData = JSON.parse(fs.readFileSync(path.join(ctx.workDir, slug, "research.json"), "utf8"));
        const contacts = verifiedContacts(ctx, prospect, researchData);
        console.log(`copy: ${slug} ...`);
        const copyOut = await copyStage(ctx, prospect, briefRow, briefData, contacts);
        console.log(`fonts: ${slug} (${briefData.type.display_id}+${briefData.type.text_id})`);
        const fontsOut = await fontsStage(ctx, prospect, briefData);
        console.log(`images: ${slug} (placeholder)`);
        await imagesStage(ctx, prospect, briefData);
        console.log(`worldspec: ${slug} ...`);
        const wsOut = await worldspecStage(ctx, prospect, briefRow, briefData);
        entries.push({ prospect, briefData, copyData: copyOut.data, worldspec: wsOut.data, fonts: fontsOut.data, contacts });
      } catch (err) {
        quarantined.push({ slug, reason: err.message.slice(0, 400) });
        console.error(`QUARANTINED ${slug}: ${err.message}`);
      }
    }
    timings.per_site_stages = Date.now() - t0;
    if (!entries.length) throw new Error("every approved site failed pre-build stages");

    // fan-in: assemble batch
    const t1 = Date.now();
    const batch = prepareBatchDir(ctx);
    let nextBuild = Number((ctx.db.prepare(`SELECT value FROM meta WHERE key = 'next_build_number'`).get() ?? { value: "179" }).value);
    const sites = {}; const order = [];
    for (const e of entries) {
      e.buildNumber = nextBuild++;
      sites[e.prospect.slug] = assembleEntry({ ...e, buildNumber: e.buildNumber });
      order.push(e.prospect.slug);
      // plates + fonts into the batch tree
      const plateDst = path.join(batch, "public", "assets", "plates", e.prospect.slug);
      fs.mkdirSync(plateDst, { recursive: true });
      for (const f of fs.readdirSync(path.join(ctx.workDir, e.prospect.slug, "plates"))) {
        fs.copyFileSync(path.join(ctx.workDir, e.prospect.slug, "plates", f), path.join(plateDst, f));
      }
      for (const role of ["display", "text"]) {
        fs.copyFileSync(e.fonts[role].localFile, path.join(batch, "public", "assets", "fonts", `${e.fonts[role].id}.woff2`));
      }
      // design signature
      ctx.db.prepare(
        `INSERT OR REPLACE INTO design_signatures (run_id, slug, architecture_family, palette_bucket, font_pair, camera_preset, motion_verb, metaphor_keys, cta_text_hash, section_order_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(runId, e.prospect.slug, e.briefData.architecture_family,
        `${e.briefData.palette.bg}|${e.briefData.palette.accent}`,
        `${e.briefData.type.display_id}+${e.briefData.type.text_id}`,
        e.briefData.camera_preset, e.briefData.verb,
        (e.briefData.metaphor.objects ?? []).slice(0, 5).join(","),
        sha256(e.briefData.primary_cta.label), sha256(JSON.stringify(Object.keys(e.copyData))), Date.now());
    }
    ctx.db.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('next_build_number', ?)`).run(String(nextBuild));

    writeConfig(batch, {
      meta: {
        labTitle: `Prospect Radar — Daily Studio ${runId}`,
        labHeading: `${entries.length === 1 ? "One world" : entries.length === 2 ? "Two worlds" : entries.length + " worlds"},<br />one grammar.`,
        labLede: `Builds ${entries[0].buildNumber}–${entries.at(-1).buildNumber} of the Prospect Radar daily studio. Each homepage is a composited scroll world: a synthetic concept plate, business-specific 3D choreography, and editorial panels sharing one camera. Concept work only; every page carries its own source boundary.`,
        labPath: "/", labBackLabel: "Daily hub", labFooterLabel: "All builds in this run",
        expectedFonts: 2,
      },
      sites, order,
    });
    console.log(`assembled config for ${order.length} site(s); building ...`);
    await runIn(batch, "npm", ["run", "build"], { timeoutMs: 600_000 });
    timings.assemble_build = Date.now() - t1;

    // static QA
    const t2 = Date.now();
    await runIn(batch, "npm", ["run", "qa"]);
    console.log("static QA: PASS");

    // browser QA against vite preview
    const preview = spawn("npx", ["vite", "preview", "--port", "4179", "--strictPort"], { cwd: batch, shell: true, windowsHide: true });
    await new Promise((r) => setTimeout(r, 4000));
    let browserQaOk = true; let browserQaOut = "";
    try {
      const round = `run-${runId}`;
      const res = await runIn(batch, "node", ["scripts/qa-browser.mjs", "http://127.0.0.1:4179", round], { timeoutMs: 900_000 });
      browserQaOut = res.out.split("\n").filter(Boolean).at(-1) ?? "";
      console.log(`browser QA: ${browserQaOut}`);
    } catch (err) {
      browserQaOk = false; browserQaOut = err.message;
      console.error(`browser QA FAILED: ${err.message.slice(0, 600)}`);
    } finally {
      try { spawn("taskkill", ["/PID", String(preview.pid), "/T", "/F"], { shell: true }); } catch { }
    }
    timings.qa = Date.now() - t2;

    // independent visual evaluation
    const t3 = Date.now();
    const round = `run-${runId}`;
    const staticQa = JSON.parse(fs.readFileSync(path.join(batch, "artifacts", "STATIC-QA.json"), "utf8"));
    const browserQa = fs.existsSync(path.join(batch, "artifacts", `BROWSER-QA-${round}.json`))
      ? JSON.parse(fs.readFileSync(path.join(batch, "artifacts", `BROWSER-QA-${round}.json`), "utf8")) : null;
    const reportEntries = [];
    for (const e of entries) {
      try {
        const perSite = browserQa?.results?.filter((r) => r.name === e.prospect.slug) ?? [];
        const qaSummary = {
          static_pass: staticQa.ok, browser_pass_all: browserQaOk,
          site_checks: perSite.map((r) => ({ viewport: r.viewport, passed: r.passed, overflow: r.overflow, consoleErrors: r.consoleErrors?.length ?? 0 })),
          js_gzip_kb: staticQa.productionJavaScript.gzipKilobytes,
          words: e.copyData.measured_words,
        };
        const ev = await evalStage(ctx, e.prospect, e.briefData, {
          batchDir: batch, round, qaSummary,
          imageryStatus: "PLACEHOLDER plates: abstract palette compositions pending the image-provider decision. Score imagery_logo and realism_3d for what is visible, and name it in weakest.",
        });
        reportEntries.push({
          prospect: e.prospect, buildNumber: e.buildNumber, verdict: ev.data.verdict, total: ev.data.total,
          scores: ev.data.scores, criticals: ev.data.criticals, weakest: ev.data.weakest,
          repairDirectives: ev.data.repair_directives, words: e.copyData.measured_words,
          fontPair: `${e.briefData.type.display_id}+${e.briefData.type.text_id}`,
          verb: e.briefData.verb, camera: e.briefData.camera_preset,
        });
        if (ev.data.verdict === "pass") {
          ctx.db.prepare(`INSERT OR REPLACE INTO built_sites (prospect_id, run_id, slug, deployed_url, built_at) VALUES (?, ?, ?, NULL, ?)`)
            .run(e.prospect.slug, runId, e.prospect.slug, Date.now());
        }
      } catch (err) {
        quarantined.push({ slug: e.prospect.slug, reason: `eval failed: ${err.message.slice(0, 300)}` });
      }
    }
    timings.eval = Date.now() - t3;
    timings.total_build_phase = Date.now() - started;

    ctx.db.prepare(`UPDATE runs SET phase = 'reported', finished_at = ? WHERE run_id = ?`).run(Date.now(), runId);
    const reportFile = writeRunReport(ctx, { entries: reportEntries, quarantined, batchDir: batch, timings });
    console.log(`\nrun report: ${reportFile}`);
    return { reportFile, batch, reportEntries, quarantined };
  } finally {
    lock.release();
    ctx.db.close();
  }
}
