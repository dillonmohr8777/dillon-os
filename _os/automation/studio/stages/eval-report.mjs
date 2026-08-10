// Independent visual evaluation + run report.
import fs from "node:fs";
import path from "node:path";
import { inputHash, manifestOf, sha256 } from "../core/stage-machine.mjs";
import { invokeClaude, fencedJson } from "../core/claude-invoke.mjs";
import { validateOrThrow, readPrompt } from "./util.mjs";

export async function evalStage(ctx, prospect, briefData, { batchDir, round, qaSummary, imageryStatus }) {
  const shotDir = path.join(batchDir, "artifacts", "browser", round);
  const shots = fs.readdirSync(shotDir)
    .filter((f) => f.startsWith(prospect.slug) && f.endsWith(".png"))
    .map((f) => path.join(shotDir, f));
  if (!shots.length) throw new Error(`no screenshots for ${prospect.slug} in ${shotDir}`);

  const prompt = readPrompt("eval", {
    BRIEF_JSON: { slug: briefData.slug, business: prospect.business_name, vertical: prospect.vertical, voice_words: briefData.voice_words, verb: briefData.verb, architecture_family: briefData.architecture_family, references: briefData.references },
    QA_SUMMARY: qaSummary,
    SCREENSHOT_LIST: shots.join("\n"),
    IMAGERY_STATUS: imageryStatus,
  });
  const templateSha = sha256(prompt.replace(/\{\{[A-Z_]+\}\}/g, ""));
  const ih = inputHash({
    stage: "eval", implVersion: "1",
    upstream: shots.map((s) => sha256(fs.readFileSync(s))).sort(),
    external: { model: ctx.config.models.strong, templateSha },
  });
  const memo = ctx.sm.findMemo(prospect.slug, "eval", ih);
  if (memo) {
    const m = JSON.parse(memo.output_manifest);
    return { row: memo, data: JSON.parse(fs.readFileSync(path.join(m.baseDir, "eval.json"), "utf8")), cached: true };
  }
  const row = ctx.sm.create(ctx.runId, prospect.slug, "eval", ih);
  const lease = ctx.sm.lease(row.id);
  try {
    const settle = ctx.budgets.reserve("llm_usd", 3);
    if (!settle) throw new Error("budget exhausted before eval");
    const res = await invokeClaude(ctx.db, {
      prompt, model: ctx.config.models.strong, allowedTools: ["Read"], maxTurns: 30,
      timeoutMs: 900_000, templateSha, inputsHash: ih, cwd: shotDir,
    });
    settle(res.costUsd);
    const data = fencedJson(res.text);
    validateOrThrow("evaluation", data);
    const dir = path.join(ctx.workDir, prospect.slug);
    const finalPath = path.join(dir, "eval.json");
    fs.writeFileSync(finalPath + ".tmp", JSON.stringify(data, null, 2));
    fs.renameSync(finalPath + ".tmp", finalPath);
    ctx.db.prepare(
      `INSERT OR REPLACE INTO scores (run_id, slug, research15, typography15, distinctiveness15, realism15, imagery10, content10, motion10, a11y5, perf5, total, criticals_json, verdict, scored_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(ctx.runId, prospect.slug,
      data.scores.research_accuracy, data.scores.mobile_typography, data.scores.distinctiveness,
      data.scores.realism_3d, data.scores.imagery_logo, data.scores.content,
      data.scores.motion_interaction, data.scores.a11y, data.scores.perf,
      data.total, JSON.stringify(data.criticals), data.verdict, Date.now());
    const manifest = manifestOf([finalPath], dir);
    ctx.sm.succeed(row.id, lease, { manifest, verifier: "ajv:evaluation", verifierVersion: "1", cost: { usd: res.costUsd, ms: res.durationMs } });
    return { row: ctx.sm.get(ctx.runId, prospect.slug, "eval", row.attempt), data, cached: false, costUsd: res.costUsd, ms: res.durationMs };
  } catch (err) {
    try { ctx.sm.fail(row.id, lease, err.message); } catch { }
    throw err;
  }
}

export function writeRunReport(ctx, { entries, quarantined, batchDir, timings }) {
  const budgets = ctx.db.prepare(`SELECT resource, cap, spent FROM budgets WHERE run_id = ?`).all(ctx.runId);
  const llm = ctx.db.prepare(`SELECT COUNT(*) n, COALESCE(SUM(cost_usd),0) usd, COALESCE(SUM(duration_ms),0) ms FROM llm_calls`).get();
  const stageRows = ctx.db.prepare(
    `SELECT stage, status, COUNT(*) n, COALESCE(SUM(json_extract(cost_json,'$.usd')),0) usd,
            COALESCE(AVG(finished_at - started_at),0) avg_ms
     FROM stage_executions WHERE run_id = ? GROUP BY stage, status ORDER BY stage`
  ).all(ctx.runId);

  const lines = [
    `# Run report — ${ctx.runId}`,
    "",
    `- Shipped: ${entries.filter((e) => e.verdict === "pass").length} · Quarantined/failed: ${quarantined.length + entries.filter((e) => e.verdict === "fail").length} of ${entries.length + quarantined.length} intake`,
    `- Engine: v${ctx.engineVersion} · Repo SHA: ${ctx.repoSha}`,
    `- Imagery status: placeholder plates (provider decision pending) — imagery/realism scores reflect that honestly`,
    "",
    "## Per-site",
    ...entries.map((e) => [
      `### ${e.prospect.business_name} (${e.prospect.slug}) — build ${e.buildNumber}`,
      `- Verdict: **${e.verdict}** (${e.total}/100)${e.criticals?.length ? ` · criticals: ${e.criticals.join(", ")}` : ""}`,
      `- Scores: research ${e.scores.research_accuracy}/15 · type ${e.scores.mobile_typography}/15 · distinct ${e.scores.distinctiveness}/15 · 3d ${e.scores.realism_3d}/15 · imagery ${e.scores.imagery_logo}/10 · content ${e.scores.content}/10 · motion ${e.scores.motion_interaction}/10 · a11y ${e.scores.a11y}/5 · perf ${e.scores.perf}/5`,
      `- Words: ${e.words} · Fonts: ${e.fontPair} · Verb: ${e.verb} · Camera: ${e.camera}`,
      e.weakest ? `- Weakest: ${e.weakest}` : "",
      e.repairDirectives?.length ? `- Repair directives (for the M2 repair loop): ${e.repairDirectives.map((r) => `[${r.target}] ${r.instruction}`).join(" · ")}` : "",
    ].filter(Boolean).join("\n")),
    "",
    "## Quarantined",
    ...(quarantined.length ? quarantined.map((q) => `- ${q.slug}: ${q.reason}`) : ["- none"]),
    "",
    "## Cost & time (measured)",
    `- LLM calls: ${llm.n} · $${llm.usd.toFixed(2)} · ${(llm.ms / 60000).toFixed(1)} min model time`,
    ...budgets.map((b) => `- Budget ${b.resource}: ${b.spent.toFixed(2)} / ${b.cap}`),
    ...(timings ? Object.entries(timings).map(([k, v]) => `- ${k}: ${(v / 60000).toFixed(1)} min wall`) : []),
    "",
    "## Stage table",
    "| stage | status | n | usd | avg ms |",
    "|---|---|---|---|---|",
    ...stageRows.map((r) => `| ${r.stage} | ${r.status} | ${r.n} | ${Number(r.usd).toFixed(2)} | ${Math.round(r.avg_ms)} |`),
    "",
    `Batch dir: ${batchDir}`,
    `Preview: cd into the batch dir and run \`npx vite preview --port 4178\``,
  ];
  const dir = path.join(ctx.artifactsDir);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `RUN-REPORT-${ctx.runId}.md`);
  fs.writeFileSync(file, lines.join("\n") + "\n");
  return file;
}
