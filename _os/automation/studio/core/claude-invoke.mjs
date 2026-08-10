// Hardened headless `claude -p` invocation.
// - prompt via stdin (Windows argv limit)
// - strict JSON output parsing (unparseable = failure, never regex-rescued)
// - hard timeout with full process-tree kill (taskkill /T)
// - cost captured even on failure
// - memoized via llm_calls (cache_key = template sha + inputs hash + model + tools)
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { sha256, canonicalJson } from "./stage-machine.mjs";
import { casPath } from "./paths.mjs";

export function llmCacheKey({ templateSha, inputsHash, model, allowedTools = [], maxTurns }) {
  return sha256(canonicalJson({ templateSha, inputsHash, model, allowedTools: [...allowedTools].sort(), maxTurns }));
}

export async function invokeClaude(db, {
  prompt, model, allowedTools = [], maxTurns = 24, timeoutMs = 600_000,
  templateSha, inputsHash, cwd, permissionMode = "dontAsk",
}) {
  const cacheKey = llmCacheKey({ templateSha, inputsHash, model, allowedTools, maxTurns });
  const cached = db.prepare(`SELECT * FROM llm_calls WHERE cache_key = ?`).get(cacheKey);
  if (cached?.response_artifact && fs.existsSync(cached.response_artifact)) {
    const parsed = JSON.parse(fs.readFileSync(cached.response_artifact, "utf8"));
    return { ...extractResult(parsed), cached: true, costUsd: 0, durationMs: 0 };
  }

  const args = ["-p", "--output-format", "json", "--max-turns", String(maxTurns)];
  if (model) args.push("--model", model);
  if (allowedTools.length) args.push("--allowedTools", allowedTools.join(","));
  if (permissionMode) args.push("--permission-mode", permissionMode);

  const started = Date.now();
  const { stdout, timedOut, code } = await spawnWithTreeKill("claude", args, prompt, { timeoutMs, cwd });
  const durationMs = Date.now() - started;

  let parsed;
  try { parsed = JSON.parse(stdout); }
  catch {
    recordCall(db, cacheKey, { templateSha, inputsHash, model, allowedTools }, null, null, durationMs);
    throw new Error(timedOut
      ? `claude call timed out after ${timeoutMs} ms`
      : `claude output was not valid JSON (exit ${code}); refusing to rescue fragments`);
  }

  const costUsd = Number(parsed.total_cost_usd ?? 0);
  const artifact = persistResponse(parsed, cacheKey);
  recordCall(db, cacheKey, { templateSha, inputsHash, model, allowedTools }, artifact, costUsd, durationMs, parsed.session_id);

  if (parsed.is_error) throw new Error(`claude reported error: ${String(parsed.result).slice(0, 500)}`);
  return { ...extractResult(parsed), cached: false, costUsd, durationMs };
}

function extractResult(parsed) {
  return { text: parsed.result ?? "", usage: parsed.usage ?? null, sessionId: parsed.session_id ?? null };
}

function persistResponse(parsed, cacheKey) {
  const body = JSON.stringify(parsed);
  const file = casPath(sha256(body), "json");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, body);
  return file;
}

function recordCall(db, cacheKey, manifest, artifact, costUsd, durationMs, sessionId = null) {
  db.prepare(
    `INSERT OR REPLACE INTO llm_calls (cache_key, request_manifest, response_artifact, cost_usd, duration_ms, session_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(cacheKey, canonicalJson(manifest), artifact, costUsd, durationMs, sessionId, Date.now());
}

// Extract the single fenced JSON block a stage prompt demands; validation
// against a schema happens at the stage boundary (ajv), not here.
export function fencedJson(text) {
  const m = text.match(/```json\s*([\s\S]*?)```/);
  if (!m) throw new Error("response did not contain a fenced json block");
  return JSON.parse(m[1]);
}

function spawnWithTreeKill(cmd, args, stdinText, { timeoutMs, cwd }) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, shell: process.platform === "win32", windowsHide: true });
    let stdout = "", stderr = "", timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try { execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" }); }
      catch { child.kill("SIGKILL"); }
    }, timeoutMs);
    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });
    child.on("error", (err) => { clearTimeout(timer); reject(err); });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, code, timedOut });
    });
    child.stdin.write(stdinText);
    child.stdin.end();
  });
}
