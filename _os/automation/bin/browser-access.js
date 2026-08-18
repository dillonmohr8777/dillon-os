#!/usr/bin/env node
'use strict';

/**
 * browser-access - pick the cheapest LIVE web engine for a job, then stop.
 *
 * The ladder lives in System/browser-access.policy.json, not in this file, so
 * the policy can change without a code edit.
 *
 * An honest limit worth stating up front: a Node CLI cannot call WebFetch,
 * WebSearch, or Firecrawl - those are agent tools reached over MCP. This CLI
 * therefore does two different things. It PROBES and RECOMMENDS the whole
 * ladder including the agent-only rungs, and it EXECUTES only the rungs a CLI
 * can actually drive (direct HTTP, and Chrome's own --dump-dom/--screenshot).
 * Reporting an agent-only rung as if the CLI had used it would be a lie that
 * makes the ladder look shorter than it is.
 *
 *   node _os/automation/bin/browser-access.js probe
 *   node _os/automation/bin/browser-access.js recommend <job>
 *   node _os/automation/bin/browser-access.js fetch <url>
 *   node _os/automation/bin/browser-access.js screenshot <url> --out /tmp/page.png
 *   node _os/automation/bin/browser-access.js start-playwright
 *
 * Add --json to any subcommand for machine output.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { execFileSync, spawn } = require('child_process');
const { repoPath, readJson } = require('../lib/fsutil');

const POLICY_PATH = repoPath('System/browser-access.policy.json');
const policy = readJson(POLICY_PATH, null);
if (!policy) {
  process.stderr.write(`missing policy: ${POLICY_PATH}\n`);
  process.exit(2);
}

const JSON_OUT = process.argv.includes('--json');

/** Windows Chrome locations. The policy's Linux path does not exist on this box. */
const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  `${process.env.LOCALAPPDATA || ''}\\Google\\Chrome\\Application\\chrome.exe`,
  '/opt/google/chrome/chrome',
];

function chromeBinary() {
  for (const c of CHROME_CANDIDATES) {
    try { if (c && fs.existsSync(c)) return c; } catch { /* keep looking */ }
  }
  return null;
}


/**
 * A one-shot Chrome cannot share the profile the long-running :9223 instance
 * already locked, so each CLI invocation gets its own throwaway dir. Still an
 * isolated profile - never Dillon's default, which the policy forbids.
 */
function oneShotProfile() {
  const base = path.join(process.env.TEMP || process.env.TMP || '.', `claude-chrome-oneshot-${process.pid}`);
  fs.mkdirSync(base, { recursive: true });
  return base;
}

/** HEAD/GET a URL with a hard timeout. Resolves {ok, status} and never throws. */
function ping(url, timeoutMs = 2500) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v) => { if (!settled) { settled = true; resolve(v); } };
    let req;
    try {
      const mod = url.startsWith('https:') ? https : http;
      req = mod.get(url, { timeout: timeoutMs }, (res) => {
        res.resume();
        done({ ok: res.statusCode > 0 && res.statusCode < 500, status: res.statusCode });
      });
    } catch {
      return done({ ok: false, status: null });
    }
    req.on('error', () => done({ ok: false, status: null }));
    req.on('timeout', () => { req.destroy(); done({ ok: false, status: null }); });
  });
}

function get(url, timeoutMs = 20000, redirects = 5) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https:') ? https : http;
    const req = mod.get(url, {
      timeout: timeoutMs,
      headers: { 'user-agent': 'dillon-os/browser-access (+local research)' },
    }, (res) => {
      const code = res.statusCode || 0;
      if (code >= 300 && code < 400 && res.headers.location && redirects > 0) {
        res.resume();
        const next = new URL(res.headers.location, url).toString();
        return get(next, timeoutMs, redirects - 1).then(resolve, reject);
      }
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve({ status: code, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

/** Refuse the forbidden surfaces before any engine runs. */
function enforce(target) {
  const bad = (policy.forbidden.ports || []).find((p) => String(target).includes(`:${p}`));
  if (bad) {
    process.stderr.write(`REFUSED: port ${bad} is forbidden by policy. ${policy.forbidden.why}\n`);
    process.exit(3);
  }
}

async function probeEngines() {
  const out = [];
  for (const [name, e] of Object.entries(policy.engines)) {
    const row = { engine: name, kind: e.kind, cost: e.cost, live: null, detail: '' };
    if (e.kind === 'agent_tool') {
      row.live = 'agent-only';
      row.detail = e.tool ? `call ${e.tool} over ${e.mcp}` : 'agent tool, not CLI-drivable';
    } else if (e.kind === 'operator_only') {
      row.live = 'operator-only';
      row.detail = 'Dillon desktop; never driven unattended';
    } else if (e.kind === 'api_key') {
      const set = Boolean(process.env[e.env]);
      row.live = set;
      row.detail = set ? `${e.env} set` : `${e.env} unset - inert`;
    } else if (e.kind === 'cli') {
      row.live = true;
      row.detail = 'always available';
    } else if (e.kind === 'http') {
      const r = await ping(e.probe);
      row.live = r.ok;
      row.detail = r.ok ? `HTTP ${r.status} at ${e.probe}` : `no response at ${e.probe}`;
      // A live Chrome must be on the dedicated profile, or it is refused.
      if (name === 'chrome_isolated' && r.ok && e.required_user_data_dir_contains) {
        const verdict = verifyChromeProfile(e);
        row.detail += ` | ${verdict.detail}`;
        if (!verdict.ok) row.live = false;
      }
    }
    if (name === 'chrome_isolated') {
      const bin = chromeBinary();
      row.detail += bin ? ` | binary ${bin}` : ' | binary NOT FOUND';
    }
    out.push(row);
  }
  return out;
}

/**
 * Confirm the listener on the isolated port is not the default profile.
 * Cheap to check and the difference between a read and an authenticated action.
 */
function verifyChromeProfile(engine) {
  const needle = engine.required_user_data_dir_contains;
  try {
    const ps = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      `(Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | ` +
      `Where-Object { $_.CommandLine -match 'remote-debugging-port=${engine.port}' } | ` +
      `Select-Object -First 1 -ExpandProperty CommandLine)`,
    ], { encoding: 'utf8', timeout: 15000 });
    if (!/--user-data-dir/.test(ps)) {
      return { ok: false, detail: 'REFUSED: no --user-data-dir, that is the default profile' };
    }
    if (!ps.includes(needle)) {
      return { ok: false, detail: `REFUSED: profile does not contain "${needle}"` };
    }
    return { ok: true, detail: `profile ok (contains "${needle}")` };
  } catch {
    return { ok: false, detail: 'profile unverifiable - treating as unusable' };
  }
}

function render(rows) {
  if (JSON_OUT) { process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`); return; }
  const w = Math.max(...rows.map((r) => String(r.engine).length), 8);
  process.stdout.write(`${'ENGINE'.padEnd(w)}  LIVE         DETAIL\n`);
  for (const r of rows) {
    const live = r.live === true ? 'yes' : r.live === false ? 'NO' : String(r.live);
    process.stdout.write(`${String(r.engine).padEnd(w)}  ${live.padEnd(11)}  ${r.detail}\n`);
  }
}

async function cmdProbe() {
  const rows = await probeEngines();
  render(rows);
  if (!JSON_OUT) {
    const down = rows.filter((r) => r.live === false).map((r) => r.engine);
    if (down.length) process.stdout.write(`\ndown: ${down.join(', ')}\n`);
  }
  return rows;
}

async function cmdRecommend(job) {
  const ladder = policy.jobs[job];
  if (!ladder) {
    process.stderr.write(`unknown job "${job}". known: ${Object.keys(policy.jobs).join(', ')}\n`);
    process.exit(2);
  }
  const rows = await probeEngines();
  const byName = new Map(rows.map((r) => [r.engine, r]));
  const out = ladder.map((name, i) => {
    const r = byName.get(name) || { live: 'unknown', detail: 'not in policy.engines' };
    return { rung: i + 1, engine: name, live: r.live, detail: r.detail };
  });
  const first = out.find((r) => r.live === true || r.live === 'agent-only');
  if (JSON_OUT) {
    process.stdout.write(`${JSON.stringify({ job, ladder: out, use: first || null }, null, 2)}\n`);
    return;
  }
  process.stdout.write(`job: ${job}\n`);
  for (const r of out) {
    const live = r.live === true ? 'yes' : r.live === false ? 'NO' : String(r.live);
    process.stdout.write(`  ${r.rung}. ${r.engine.padEnd(24)} ${live.padEnd(11)} ${r.detail}\n`);
  }
  process.stdout.write(first
    ? `\nuse: ${first.engine} (${first.live === 'agent-only' ? 'call it as an agent tool' : 'live now'})\n`
    : '\nno live rung for this job - report the block, do not improvise\n');
}

/** Static fetch: direct HTTP first, then Chrome --dump-dom for JS-rendered pages. */
async function cmdFetch(url) {
  enforce(url);
  try {
    const r = await get(url);
    if (r.status >= 200 && r.status < 300 && r.body.trim()) {
      process.stdout.write(JSON_OUT
        ? `${JSON.stringify({ engine: 'direct_http', status: r.status, bytes: r.body.length, body: r.body }, null, 2)}\n`
        : `# engine: direct_http (HTTP ${r.status}, ${r.body.length} bytes)\n${r.body}`);
      return;
    }
    process.stderr.write(`direct_http returned ${r.status}; failing over to chrome --dump-dom\n`);
  } catch (e) {
    process.stderr.write(`direct_http failed (${e.message}); failing over to chrome --dump-dom\n`);
  }

  const bin = chromeBinary();
  if (!bin) {
    process.stderr.write('no chrome binary; next rung is an agent tool (Firecrawl SCRAPE) - CLI stops here\n');
    process.exit(2);
  }
  const dom = execFileSync(bin, [
    '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${oneShotProfile()}`,
    '--dump-dom', url,
  ], { encoding: 'utf8', timeout: 60000, maxBuffer: 64 * 1024 * 1024 });
  process.stdout.write(JSON_OUT
    ? `${JSON.stringify({ engine: 'chrome_isolated', bytes: dom.length, body: dom }, null, 2)}\n`
    : `# engine: chrome_isolated --dump-dom (${dom.length} bytes)\n${dom}`);
}

function cmdScreenshot(url) {
  enforce(url);
  const i = process.argv.indexOf('--out');
  const out = i > 0 ? process.argv[i + 1] : path.join(process.env.TEMP || '.', 'page.png');
  const bin = chromeBinary();
  if (!bin) { process.stderr.write('no chrome binary\n'); process.exit(2); }
  try {
    execFileSync(bin, [
      '--headless', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
      '--no-default-browser-check', `--user-data-dir=${oneShotProfile()}`,
      '--window-size=1280,900', `--screenshot=${out}`, url,
    ], { encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    // Surface Chrome's own words. The generic "Command failed" hides the cause,
    // which cost a debug cycle when a locked profile was the real problem.
    const why = (e.stderr || '').toString().trim() || e.message;
    process.stderr.write(`chrome_isolated screenshot failed: ${why}\n`);
    process.stderr.write('next rung: playwright_mcp (start-playwright)\n');
    process.exit(2);
  }
  const bytes = fs.existsSync(out) ? fs.statSync(out).size : 0;
  process.stdout.write(`${JSON.stringify({ engine: 'chrome_isolated', out, bytes }, null, 2)}\n`);
  if (!bytes) process.exit(2);
}

function cmdStartPlaywright() {
  const e = policy.engines.playwright_mcp;
  const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['@playwright/mcp', '--headless', '--isolated', '--port', '8931'],
    { detached: true, stdio: 'ignore' });
  child.unref();
  process.stdout.write(`${JSON.stringify({
    started: e.start, pid: child.pid, mcp_name: e.mcp_name, probe: e.probe,
    note: 'give it a few seconds, then re-run probe. An "Extension connection timeout" from a Playwright tool means the wrong server was used.',
  }, null, 2)}\n`);
}

(async () => {
  const cmd = process.argv[2];
  const arg = process.argv[3];
  switch (cmd) {
    case 'probe': await cmdProbe(); break;
    case 'recommend': await cmdRecommend(arg); break;
    case 'fetch': if (!arg) { process.stderr.write('fetch needs a url\n'); process.exit(2); } await cmdFetch(arg); break;
    case 'screenshot': if (!arg) { process.stderr.write('screenshot needs a url\n'); process.exit(2); } cmdScreenshot(arg); break;
    case 'start-playwright': cmdStartPlaywright(); break;
    default:
      process.stderr.write('usage: browser-access.js probe|recommend <job>|fetch <url>|screenshot <url> [--out p]|start-playwright [--json]\n');
      process.exit(2);
  }
})().catch((e) => { process.stderr.write(`${e.stack || e.message}\n`); process.exit(1); });
