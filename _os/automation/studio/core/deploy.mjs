// Publish gate. Runs ONLY when a valid authority file is present (arm command),
// respects daily site/deploy caps, deploys the QA-passed batch dist to a
// per-day noindex preview site, verifies it live, and records a rollback
// pointer. Disarmed or expired => builds stay local, loudly.
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { dataRoot } from "./paths.mjs";

const NETLIFY_ENTRY = "C:/Users/DillonMohr/Downloads/node-v24.14.1-win-x64/node_modules/netlify-cli/bin/run.js";

export function readAuthority() {
  const file = path.join(dataRoot(), "authority", "netlify-preview.json");
  if (!fs.existsSync(file)) return { armed: false, reason: "disarmed (no authority file)" };
  let a;
  try { a = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return { armed: false, reason: "authority file unreadable" }; }
  if (new Date(a.expires) < new Date()) return { armed: false, reason: `authority expired ${a.expires}` };
  if (a.scope !== "netlify-noindex-preview") return { armed: false, reason: `unknown scope ${a.scope}` };
  return { armed: true, authority: a };
}

// argv goes straight to node's spawn (no shell), so JSON arguments survive.
function netlify(args, { timeoutMs = 300_000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [NETLIFY_ENTRY, ...args], { windowsHide: true, shell: false });
    let out = "", err = "";
    const timer = setTimeout(() => { try { child.kill("SIGKILL"); } catch { } }, timeoutMs);
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { err += d; });
    child.on("error", (e) => { clearTimeout(timer); reject(e); });
    child.on("close", (code) => {
      clearTimeout(timer);
      code === 0 ? resolve(out) : reject(new Error(`netlify ${args[0]} exited ${code}: ${(err + out).slice(0, 500)}`));
    });
  });
}

async function findOrCreateSite(ctx, siteName) {
  const accountSlug = ctx.config.netlify.accountSlug;
  try {
    const created = JSON.parse(await netlify(["api", "createSite", "--data",
      JSON.stringify({ account_slug: accountSlug, name: siteName })]));
    if (created?.id) return { id: created.id, url: created.ssl_url, created: true };
  } catch { /* name taken or create refused: fall through to lookup */ }
  const sites = JSON.parse(await netlify(["api", "listSites", "--data", JSON.stringify({ name: siteName })]));
  const hit = (Array.isArray(sites) ? sites : []).find((s) => s.name === siteName);
  if (!hit) throw new Error(`could not create or find site ${siteName}`);
  return { id: hit.id, url: hit.ssl_url, created: false };
}

export async function deployIfArmed(ctx, batch, entries) {
  const gate = readAuthority();
  if (!gate.armed) {
    console.log(`publish: skipped, ${gate.reason} (build stays local; run 'radar-studio arm' to enable)`);
    return { deployed: false, reason: gate.reason };
  }
  const a = gate.authority;
  const siteName = `momentum-prospect-radar-daily-${ctx.runId}`;
  if (!new RegExp(a.siteNamePattern).test(siteName)) {
    return { deployed: false, reason: `site name ${siteName} outside authorized pattern` };
  }
  const today = Date.now() - 24 * 3600 * 1000;
  const todays = ctx.db.prepare(`SELECT COUNT(*) n FROM deploys WHERE created_at > ? AND state != 'aborted'`).get(today).n;
  if (todays >= (a.maxDeploysPerDay ?? 3)) {
    return { deployed: false, reason: `daily deploy cap reached (${todays})` };
  }
  // noindex is required by the authority: every page already carries the meta
  // tag and _headers X-Robots-Tag; verify the artifact before upload.
  const headers = fs.readFileSync(path.join(batch, "dist", "_headers"), "utf8");
  if (!/X-Robots-Tag: noindex/.test(headers)) {
    return { deployed: false, reason: "dist/_headers missing noindex; refusing to publish" };
  }

  const site = await findOrCreateSite(ctx, siteName);
  console.log(`publish: site ${siteName} (${site.created ? "created" : "existing"})`);
  const prior = ctx.db.prepare(`SELECT deploy_id FROM deploys WHERE site_id = ? AND state = 'live_verified' ORDER BY created_at DESC LIMIT 1`).get(site.id)?.deploy_id ?? null;

  const res = JSON.parse(await netlify(["deploy", "--prod", "--dir", path.join(batch, "dist"), "--site", site.id, "--json"], { timeoutMs: 600_000 }));
  const url = res.url ?? site.url;

  // live verification: lab 200 + one site route 200 with the noindex header
  const labOk = (await fetch(url + "/", { signal: AbortSignal.timeout(30_000) })).ok;
  const probe = await fetch(`${url}/sites/${entries[0].prospect.slug}/`, { signal: AbortSignal.timeout(30_000) });
  const robots = probe.headers.get("x-robots-tag") ?? "";
  const verified = labOk && probe.ok && /noindex/.test(robots);

  ctx.db.prepare(
    `INSERT INTO deploys (run_id, site_name, site_id, deploy_id, prior_deploy_id, state, url, verified_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(ctx.runId, siteName, site.id, res.deploy_id ?? null, prior,
    verified ? "live_verified" : "uploaded", url, verified ? Date.now() : null, Date.now());

  if (!verified) throw new Error(`deploy uploaded but live verification failed (lab ${labOk}, route ${probe.status}, robots "${robots}")`);
  console.log(`publish: LIVE ${url} (noindex verified, rollback pointer ${prior ?? "none"})`);
  return { deployed: true, url };
}
