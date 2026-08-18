#!/usr/bin/env node
'use strict';

/**
 * Pick the best live browser engine for a job.
 *
 *   node _os/automation/bin/browser-access.js probe
 *   node _os/automation/bin/browser-access.js fetch https://example.com
 *   node _os/automation/bin/browser-access.js screenshot https://example.com --out /tmp/page.png
 *   node _os/automation/bin/browser-access.js recommend cloudflare
 *
 * Never attaches to port 9222 or a default Chrome profile. Isolated Chrome
 * uses evidence port 9223. Camofox is preferred for stealth when :9377 is up.
 */

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { repoPath, readJson, writeJson, nowISO } = require('../lib/fsutil');

const POLICY = readJson(repoPath('System/browser-access.policy.json'), {});
const STATE = repoPath('12_Brain/state/browser-access.json');
const NEVER_PORTS = new Set((POLICY.never && POLICY.never.ports) || [9222]);
const EVIDENCE_PORT = (POLICY.chrome && POLICY.chrome.evidence_port) || 9223;

function die(msg, code = 2) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function which(bin) {
  if (bin.includes('/') || bin.includes('\\')) {
    return fs.existsSync(bin) ? bin : null;
  }
  const pathEnv = process.env.PATH || '';
  for (const dir of pathEnv.split(path.delimiter)) {
    const candidate = path.join(dir, bin);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function chromeBinary() {
  const list = (POLICY.chrome && POLICY.chrome.binaries) || [];
  for (const b of list) {
    const found = which(b);
    if (found) return found;
  }
  return null;
}

function evidenceProfile() {
  const envName = (POLICY.chrome && POLICY.chrome.profile_env) || 'BROWSER_EVIDENCE_PROFILE';
  if (process.env[envName]) return process.env[envName];
  return path.join(os.tmpdir(), 'dillon-chrome-evidence');
}

function httpGet(url, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body }));
    });
    req.on('error', () => resolve({ ok: false, status: 0, body: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, body: '' }); });
  });
}

function httpJson(method, url, payload, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const data = payload ? Buffer.from(JSON.stringify(payload)) : null;
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method,
      timeout: timeoutMs,
      headers: { 'Content-Type': 'application/json', ...(data ? { 'Content-Length': data.length } : {}) },
    }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch { json = { raw: body }; }
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, json });
      });
    });
    req.on('error', () => resolve({ ok: false, status: 0, json: null }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, json: null }); });
    if (data) req.write(data);
    req.end();
  });
}

function runTimed(bin, args, { timeoutMs = 20000, stdoutFile } = {}) {
  return new Promise((resolve) => {
    const outFd = stdoutFile ? fs.openSync(stdoutFile, 'w') : 'pipe';
    const child = spawn(bin, args, {
      stdio: ['ignore', stdoutFile ? outFd : 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    if (!stdoutFile && child.stdout) child.stdout.on('data', (c) => { stdout += c; });
    if (child.stderr) child.stderr.on('data', (c) => { stderr += c; });
    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch { /* gone */ }
    }, timeoutMs);
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (stdoutFile) {
        try { fs.closeSync(outFd); } catch { /* */ }
        try { stdout = fs.readFileSync(stdoutFile, 'utf8'); } catch { stdout = ''; }
      }
      resolve({ code, signal, stdout, stderr });
    });
  });
}

function parseTitle(html) {
  const m = String(html || '').match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '';
}

async function probeCamofox() {
  const base = (POLICY.camofox && POLICY.camofox.base_url) || 'http://127.0.0.1:9377';
  const health = await httpGet(`${base}${(POLICY.camofox && POLICY.camofox.health_path) || '/health'}`);
  return {
    id: 'camofox',
    live: health.ok,
    detail: health.ok ? `health ${health.status} at ${base}` : `not listening at ${base}`,
  };
}

async function probeChrome() {
  const bin = chromeBinary();
  if (!bin) return { id: 'chrome_isolated', live: false, detail: 'no chrome binary from policy list' };
  if (bin.endsWith('google-chrome') && !bin.includes('/opt/google/chrome/chrome')) {
    return {
      id: 'chrome_isolated',
      live: false,
      detail: 'wrapper binary refused (this environment injects port 9222 + default profile)',
      binary: bin,
    };
  }
  return {
    id: 'chrome_isolated',
    live: true,
    detail: `binary ${bin}; isolated profile; evidence port ${EVIDENCE_PORT}; never ${[...NEVER_PORTS].join(',')}`,
    binary: bin,
  };
}

function probePlaywrightMcp() {
  return {
    id: 'playwright_mcp',
    live: false,
    detail: 'Cursor Playwright MCP needs the desktop extension bridge; 2026-08-18 probe timed out',
  };
}

function probeClaudeInChrome() {
  return {
    id: 'claude_in_chrome',
    live: false,
    detail: 'desktop-only; requires Dillon logged-in Chrome, not this cloud VM',
  };
}

async function probe() {
  const engines = [
    {
      id: 'firecrawl',
      live: true,
      detail: 'Composio firecrawl active; SEARCH verified 2026-08-18 (4 URLs, 2 credits); stealth = BATCH_SCRAPE only',
    },
    {
      id: 'webfetch_websearch',
      live: true,
      detail: 'Cursor native WebFetch / WebSearch',
    },
    await probeChrome(),
    await probeCamofox(),
    probePlaywrightMcp(),
    probeClaudeInChrome(),
    {
      id: 'owned_history',
      live: true,
      detail: 'python System/scripts/Export-BrowserHistory.py -> 12_Brain/private/browser-history/',
    },
    {
      id: 'bright_data',
      live: false,
      detail: 'inert; BRIGHTDATA_API_KEY unset',
    },
  ];
  const out = {
    automation_id: 'browser-access',
    recorded_at_utc: nowISO(),
    never_ports: [...NEVER_PORTS],
    evidence_port: EVIDENCE_PORT,
    jobs: POLICY.jobs || {},
    engines,
  };
  writeJson(STATE, out);
  return out;
}

function recommend(job) {
  const jobs = POLICY.jobs || {};
  const order = jobs[job];
  if (!order) die(`unknown job '${job}'. known: ${Object.keys(jobs).join(', ')}`);
  return { job, order, note: 'first live engine in this list wins; probe to see live flags' };
}

async function fetchUrl(url) {
  if (!/^https?:\/\//i.test(url) && !/^file:\/\//i.test(url)) die('url must be http(s) or file');
  const camo = await probeCamofox();
  if (camo.live && /^https?:/i.test(url)) {
    const base = POLICY.camofox.base_url;
    const created = await httpJson('POST', `${base}/tabs`, { userId: 'dillon-os', sessionKey: 'fetch', url });
    if (created.ok && created.json && created.json.tabId) {
      const snap = await httpGet(`${base}/tabs/${created.json.tabId}/snapshot?userId=dillon-os`, 15000);
      return { engine: 'camofox', tabId: created.json.tabId, snapshot: snap.body.slice(0, 8000) };
    }
  }
  const chrome = await probeChrome();
  if (!chrome.live) die(`no live fetch engine: camofox=${camo.detail}; chrome=${chrome.detail}`);
  const profile = evidenceProfile();
  fs.mkdirSync(profile, { recursive: true });
  const tmp = path.join(os.tmpdir(), `browser-access-dom-${process.pid}.html`);
  const args = [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${EVIDENCE_PORT}`,
    '--remote-debugging-address=127.0.0.1',
    '--dump-dom', url,
  ];
  const ran = await runTimed(chrome.binary, args, { timeoutMs: 18000, stdoutFile: tmp });
  const html = ran.stdout || '';
  const title = parseTitle(html);
  if (!title && html.length < 20) {
    die(`chrome dump-dom empty (code=${ran.code}). ${ran.stderr.slice(0, 300)}`);
  }
  return {
    engine: 'chrome_isolated',
    binary: chrome.binary,
    title,
    bytes: Buffer.byteLength(html),
    html_preview: html.slice(0, 2000),
  };
}

async function screenshot(url, outPath) {
  if (!/^https?:\/\//i.test(url) && !/^file:\/\//i.test(url)) die('url must be http(s) or file');
  const chrome = await probeChrome();
  if (!chrome.live) die(chrome.detail);
  const profile = evidenceProfile();
  fs.mkdirSync(profile, { recursive: true });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const args = [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${EVIDENCE_PORT}`,
    `--screenshot=${outPath}`,
    '--window-size=1280,720',
    url,
  ];
  await runTimed(chrome.binary, args, { timeoutMs: 25000 });
  if (!fs.existsSync(outPath) || fs.statSync(outPath).size < 100) {
    die(`screenshot missing or tiny: ${outPath}`);
  }
  return { engine: 'chrome_isolated', path: outPath, bytes: fs.statSync(outPath).size };
}

async function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0] || 'probe';
  if (cmd === 'probe') {
    process.stdout.write(`${JSON.stringify(await probe(), null, 2)}\n`);
    return;
  }
  if (cmd === 'recommend') {
    process.stdout.write(`${JSON.stringify(recommend(argv[1] || 'js_interact'), null, 2)}\n`);
    return;
  }
  if (cmd === 'fetch') {
    const url = argv[1];
    if (!url) die('usage: browser-access.js fetch <url>');
    process.stdout.write(`${JSON.stringify(await fetchUrl(url), null, 2)}\n`);
    return;
  }
  if (cmd === 'screenshot') {
    const url = argv[1];
    const outIdx = argv.indexOf('--out');
    const outPath = outIdx >= 0 ? argv[outIdx + 1] : path.join(os.tmpdir(), 'browser-access.png');
    if (!url) die('usage: browser-access.js screenshot <url> --out file.png');
    process.stdout.write(`${JSON.stringify(await screenshot(url, outPath), null, 2)}\n`);
    return;
  }
  die(`unknown command ${cmd}. use probe|recommend|fetch|screenshot`);
}

main().catch((err) => die(err.stack || String(err), 1));
