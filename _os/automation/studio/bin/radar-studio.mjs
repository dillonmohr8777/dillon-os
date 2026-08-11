#!/usr/bin/env node
// radar-studio — daily production orchestrator for Prospect Radar scroll-world concepts.
// Fail-closed: a successful local check never authorizes an external send,
// public deploy, account change, or secret use (per _os/automation/docs/OPERATOR.md).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { loadConfig, dataRoot, ensureDataTree, dbPath, REPO_ROOT, enginePath } from "../core/paths.mjs";
import { openDb } from "../core/db.mjs";

const [, , command, ...rest] = process.argv;
const flags = parseFlags(rest);

const COMMANDS = {
  doctor, status, "run-daily": runDaily, resume, approve, arm, disarm,
  rollback: notYet("rollback"), "register-schedule": refuseSchedule,
  "verify-live": notYet("verify-live"),
};

if (!command || !COMMANDS[command]) {
  console.log(`radar-studio <command>\n\ncommands:\n  doctor             validate environment without exposing secrets\n  run-daily          start a daily run (research phase)\n  resume             continue an interrupted run\n  status             show run progress and quarantines\n  approve            record a hash-pinned batch approval\n  arm                activate a publish authority file\n  disarm             deactivate publishing\n  rollback           restore the prior deployment\n  register-schedule  create the local daily schedule (explicit, M4)\n  verify-live        verify the published hub and routes`);
  process.exit(command ? 2 : 0);
}
await COMMANDS[command]();

// ---------------------------------------------------------------- doctor
async function doctor() {
  const config = loadConfig();
  const results = [];
  const ok = (name, detail) => results.push({ name, level: "ok", detail });
  const warn = (name, detail) => results.push({ name, level: "warn", detail });
  const fail = (name, detail) => results.push({ name, level: "fail", detail });

  // toolchain
  for (const [tool, args, min] of [["node", ["--version"], 24], ["git", ["--version"]], ["netlify", ["--version"]], ["claude", ["--version"]], ["python", ["--version"]]]) {
    try {
      const v = execFileSync(tool, args, { encoding: "utf8", shell: process.platform === "win32", windowsHide: true, timeout: 30_000 }).trim().split("\n")[0];
      if (tool === "node" && min && Number(v.replace(/^v/, "").split(".")[0]) < min) fail(`${tool}`, `${v} < required ${min}`);
      else ok(tool, v);
    } catch { fail(tool, "not found on PATH"); }
  }

  // gh is optional but noted
  try { ok("gh", execFileSync("gh", ["--version"], { encoding: "utf8", shell: true, windowsHide: true, timeout: 30_000 }).split("\n")[0]); }
  catch { warn("gh", "not installed — PR automation unavailable; git refspec fallback in use"); }

  // playwright browsers
  const pw = path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
  if (fs.existsSync(pw) && fs.readdirSync(pw).some((d) => d.startsWith("chromium"))) ok("playwright-chromium", pw);
  else warn("playwright-chromium", "no chromium under %LOCALAPPDATA%\\ms-playwright — browser QA will fail until installed");

  // disk
  try {
    const drive = path.parse(dataRoot(config)).root;
    const out = execFileSync("powershell", ["-NoProfile", "-Command", `(Get-PSDrive ${drive[0]}).Free`], { encoding: "utf8", windowsHide: true, timeout: 30_000 }).trim();
    const freeGb = Number(out) / 1024 ** 3;
    if (freeGb < config.diskFloorGb.fail) fail("disk", `${freeGb.toFixed(1)} GB free < hard floor ${config.diskFloorGb.fail} GB`);
    else if (freeGb < config.diskFloorGb.warn) warn("disk", `${freeGb.toFixed(1)} GB free < comfort floor ${config.diskFloorGb.warn} GB`);
    else ok("disk", `${freeGb.toFixed(1)} GB free`);
  } catch (e) { warn("disk", `could not measure: ${e.message}`); }

  // timezone
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  tz === config.timezone ? ok("timezone", tz) : fail("timezone", `${tz} != ${config.timezone}`);

  // data root + db
  try {
    const root = ensureDataTree();
    fs.accessSync(root, fs.constants.W_OK);
    ok("data-root", root);
    if (isOneDrivePath(root)) fail("data-root-location", "data root resolves under OneDrive — hot I/O must be local");
    const db = openDb();
    db.prepare("SELECT 1").get();
    db.close();
    ok("state-db", dbPath());
  } catch (e) { fail("data-root", e.message); }

  // repo + engine
  try {
    const branch = execFileSync("git", ["-C", REPO_ROOT, "branch", "--show-current"], { encoding: "utf8", windowsHide: true }).trim();
    const dirty = execFileSync("git", ["-C", REPO_ROOT, "status", "--porcelain"], { encoding: "utf8", windowsHide: true }).trim();
    ok("repo", `${REPO_ROOT} @ ${branch}${dirty ? ` (${dirty.split("\n").length} dirty)` : " (clean)"}`);
  } catch (e) { fail("repo", e.message); }
  try {
    const ev = JSON.parse(fs.readFileSync(path.join(enginePath(config), "engine.version.json"), "utf8"));
    ok("engine", `v${ev.engine_version} from ${ev.extracted_from} @ ${String(ev.source_commit).slice(0, 8)}`);
  } catch { fail("engine", "engine.version.json unreadable — run engine extraction"); }

  // radar inputs
  for (const key of ["buildQueue", "registry"]) {
    const p = path.join(REPO_ROOT, config.radar[key]);
    fs.existsSync(p) ? ok(`radar-${key}`, p) : warn(`radar-${key}`, `${p} missing`);
  }

  // netlify auth (never prints tokens; getCurrentUser needs no linked folder)
  try {
    const out = execFileSync("netlify", ["api", "getCurrentUser"], { encoding: "utf8", shell: true, windowsHide: true, timeout: 60_000 });
    const user = JSON.parse(out);
    ok("netlify-auth", `logged in as ${user.email ?? user.full_name ?? "unknown account"}`);
  } catch { warn("netlify-auth", "needs_netlify_login — run: netlify login"); }

  // authority
  const auth = authorityFile();
  if (!fs.existsSync(auth)) ok("authority", "disarmed (no authority file) — publishing disabled, as designed");
  else {
    try {
      const a = JSON.parse(fs.readFileSync(auth, "utf8"));
      const expired = new Date(a.expires) < new Date();
      expired ? warn("authority", `expired ${a.expires} — publishing disabled`) : ok("authority", `armed until ${a.expires} for ${a.siteNamePattern}`);
    } catch { fail("authority", "authority file unreadable/invalid"); }
  }

  // report
  let worst = "ok";
  for (const r of results) {
    const mark = r.level === "ok" ? "  OK " : r.level === "warn" ? " WARN" : " FAIL";
    console.log(`${mark}  ${r.name.padEnd(22)} ${r.detail}`);
    if (r.level === "fail") worst = "fail"; else if (r.level === "warn" && worst === "ok") worst = "warn";
  }
  console.log(`\ndoctor: ${worst.toUpperCase()}`);
  process.exit(worst === "fail" ? 1 : 0);
}

// ---------------------------------------------------------------- status
async function status() {
  const db = openDb();
  const runs = db.prepare(`SELECT * FROM runs ORDER BY run_date DESC LIMIT 5`).all();
  if (!runs.length) { console.log("no runs recorded"); db.close(); return; }
  for (const run of runs) {
    console.log(`run ${run.run_id}  phase=${run.phase} status=${run.status} engine=${run.engine_version ?? "?"}`);
    const rows = db.prepare(
      `SELECT stage, status, COUNT(*) AS n FROM stage_executions WHERE run_id = ? GROUP BY stage, status ORDER BY stage`
    ).all(run.run_id);
    for (const r of rows) console.log(`   ${r.stage.padEnd(14)} ${r.status.padEnd(11)} ${r.n}`);
    const q = db.prepare(
      `SELECT prospect_id, failure_reason FROM stage_executions WHERE run_id = ? AND status = 'QUARANTINED'`
    ).all(run.run_id);
    for (const r of q) console.log(`   QUARANTINED ${r.prospect_id}: ${r.failure_reason}`);
  }
  db.close();
}

// ---------------------------------------------------------------- arm / disarm
function authorityFile() {
  return path.join(dataRoot(), "authority", "netlify-preview.json");
}

async function arm() {
  const until = flags.until;
  const approver = flags.approver;
  if (!until || !approver) {
    console.error(`arm requires explicit authority terms:\n  radar-studio arm --until YYYY-MM-DD --approver "Dillon Mohr" [--note "..."]\nThis writes the authority file that permits noindex preview deploys ONLY\n(site pattern from studio.config.json). It never enables outreach or mail.`);
    process.exit(2);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(until) || new Date(until) < new Date()) {
    console.error(`--until must be a future YYYY-MM-DD date`);
    process.exit(2);
  }
  const config = loadConfig();
  ensureDataTree();
  const authority = {
    version: 1,
    scope: "netlify-noindex-preview",
    allowedActions: ["sites:create", "deploy"],
    siteNamePattern: config.netlify.siteNamePattern,
    noindexRequired: true,
    maxSitesPerDay: config.netlify.maxSitesPerDay,
    maxDeploysPerDay: config.netlify.maxDeploysPerDay,
    expires: until,
    approver,
    note: flags.note ?? "",
    armedAt: new Date().toISOString(),
  };
  fs.writeFileSync(authorityFile(), JSON.stringify(authority, null, 2));
  console.log(`armed until ${until} (scope: noindex preview deploys matching ${authority.siteNamePattern}).`);
  console.log(`runtime re-validates this file at publish time; disarm with: radar-studio disarm`);
}

async function disarm() {
  const f = authorityFile();
  if (fs.existsSync(f)) { fs.rmSync(f); console.log("disarmed: authority file removed. Scheduled runs will build locally and stop."); }
  else console.log("already disarmed (no authority file).");
}

// ---------------------------------------------------------------- run/resume/approve
function todayRunId() {
  const d = new Date().toLocaleDateString("en-CA", { timeZone: loadConfig().timezone });
  return d; // YYYY-MM-DD
}

async function runDaily() {
  const { researchPhase, buildPhase } = await import("../core/run-daily.mjs");
  const runId = flags.run ?? todayRunId();
  const phase = flags.phase ?? "research";
  if (phase === "research") {
    const count = Number(flags.count ?? loadConfig().intake.dailyTarget);
    await researchPhase(runId, { count });
  } else if (phase === "build") {
    await buildPhase(runId);
  } else {
    console.error(`unknown --phase ${phase} (research|build)`);
    process.exit(2);
  }
}

async function resume() {
  const { researchPhase, buildPhase } = await import("../core/run-daily.mjs");
  const runId = flags.run ?? todayRunId();
  const db = openDb();
  const run = db.prepare(`SELECT * FROM runs WHERE run_id = ?`).get(runId);
  db.close();
  if (!run) { console.error(`no run ${runId} to resume`); process.exit(2); }
  console.log(`resuming run ${runId} from phase=${run.phase}`);
  if (run.phase === "research") await researchPhase(runId, { count: Number(flags.count ?? loadConfig().intake.dailyTarget) });
  else if (run.phase === "awaiting_approval") console.log("awaiting approval — run the approve command from the reviewer page");
  else if (run.phase === "building") await buildPhase(runId);
  else console.log(`run ${runId} is ${run.phase}; nothing to resume`);
}

async function approve() {
  const { approveRun } = await import("../core/run-daily.mjs");
  const runId = flags.run ?? todayRunId();
  if (!flags.approver) {
    console.error(`approve requires an explicit human approver:\n  radar-studio approve --run ${runId} --approver "Dillon Mohr" [--exclude slug,slug] [--note "..."]`);
    process.exit(2);
  }
  approveRun(runId, {
    approver: flags.approver,
    exclude: flags.exclude ? String(flags.exclude).split(",").map((s) => s.trim()).filter(Boolean) : [],
    note: flags.note ?? "",
  });
}

// ---------------------------------------------------------------- stubs
function notYet(name) {
  return async () => {
    console.error(`${name}: not implemented in this milestone. Fail-closed: no action was taken.`);
    process.exit(3);
  };
}

// Unlocked 2026-08-10 by explicit owner instruction ("automation: 10 a day ...
// the next 10 builds every day"). Registers two current-user Task Scheduler
// jobs; remove them with: radar-studio register-schedule --remove
async function refuseSchedule() {
  const studio = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const node = process.execPath;
  const logDir = path.join(dataRoot(), "logs");
  fs.mkdirSync(logDir, { recursive: true });

  if (flags.remove) {
    for (const name of ["RadarStudio-Research", "RadarStudio-Build"]) {
      try { execFileSync("powershell", ["-NoProfile", "-Command", `Unregister-ScheduledTask -TaskName '${name}' -Confirm:$false`], { windowsHide: true }); console.log(`removed ${name}`); }
      catch { console.log(`${name} was not registered`); }
    }
    return;
  }

  const ps = `
$ErrorActionPreference = 'Stop'
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 5) -MultipleInstances IgnoreNew
$research = New-ScheduledTaskAction -Execute '${node}' -Argument 'bin\\radar-studio.mjs run-daily --phase research' -WorkingDirectory '${studio}'
$rTrig = New-ScheduledTaskTrigger -Daily -At 05:15
Register-ScheduledTask -TaskName 'RadarStudio-Research' -Action $research -Trigger $rTrig -Settings $settings -Description 'Prospect Radar daily studio: research the next 10 queue prospects into shape briefs + reviewer page. Logs: ${logDir.replace(/\\/g, "\\\\")}' -Force | Out-Null
$build = New-ScheduledTaskAction -Execute '${node}' -Argument 'bin\\radar-studio.mjs run-daily --phase build' -WorkingDirectory '${studio}'
$bTrig = New-ScheduledTaskTrigger -Daily -At 10:00
$bTrig.Repetition = (New-ScheduledTaskTrigger -Once -At 10:00 -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Hours 6)).Repetition
Register-ScheduledTask -TaskName 'RadarStudio-Build' -Action $build -Trigger $bTrig -Settings $settings -Description 'Prospect Radar daily studio: idempotent build poll; exits until the batch is approved, then builds, QAs, publishes if armed.' -Force | Out-Null
Get-ScheduledTask -TaskName 'RadarStudio-*' | Select-Object TaskName, State | Format-Table -AutoSize | Out-String
`;
  const psFile = path.join(dataRoot(), "logs", "register-schedule.ps1");
  fs.writeFileSync(psFile, ps);
  const out = execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", psFile], { encoding: "utf8", windowsHide: true, timeout: 120_000 });
  console.log(out.trim());
  console.log(`registered. Research fires daily 05:15; build polls half-hourly 10:00-16:00.`);
  console.log(`Note: stage output goes to the run DB and artifacts dir; the scheduled runs`);
  console.log(`fail closed (and say why in 'radar-studio status') until headless claude is logged in.`);
}

// ---------------------------------------------------------------- util
function parseFlags(args) {
  const out = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith("--")) { out[key] = args[++i]; }
      else out[key] = true;
    }
  }
  return out;
}

function isOneDrivePath(p) {
  return /onedrive/i.test(p);
}
