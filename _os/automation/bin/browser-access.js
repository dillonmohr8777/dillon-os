#!/usr/bin/env node
'use strict';

/**
 * Pick the best live browser engine for the job.
 *
 *   node _os/automation/bin/browser-access.js probe
 *   node _os/automation/bin/browser-access.js start-playwright
 *   node _os/automation/bin/browser-access.js fetch https://example.com
 *   node _os/automation/bin/browser-access.js screenshot https://example.com --out /tmp/page.png
 *   node _os/automation/bin/browser-access.js recommend js_interact
 *
 * Playwright MCP here is the isolated sidecar (@playwright/mcp, no --extension).
 * Cursor's cloud Playwright server with --extension is a different process and
 * is not this engine. Never attaches to port 9222 or a default Chrome profile.
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

let mcpSessionId = null;

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
    if (process.platform === 'win32' && fs.existsSync(`${candidate}.cmd`)) return `${candidate}.cmd`;
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

function playwrightCfg() {
  return POLICY.playwright_mcp || {};
}

function playwrightMcpUrl() {
  return playwrightCfg().base_url || 'http://localhost:8931/mcp';
}

function playwrightArgs() {
  const cfg = playwrightCfg();
  const args = Array.isArray(cfg.args) && cfg.args.length
    ? [...cfg.args]
    : [
      '--headless', '--isolated', '--no-sandbox',
      '--host', '127.0.0.1', '--port', String(cfg.port || 8931),
      '--allowed-hosts', 'localhost,127.0.0.1',
      '--viewport-size', '1280x720',
    ];
  if (args.includes('--extension')) {
    throw new Error('playwright mcp sidecar must not use --extension');
  }
  const bin = chromeBinary();
  if (bin && /\/opt\/google\/chrome\/chrome$/.test(bin.replace(/\\/g, '/')) && !args.includes('--executable-path')) {
    args.push('--executable-path', bin);
  }
  return args;
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

function parseMcpMessage(text) {
  const lines = String(text || '').split('\n').filter((l) => l.startsWith('data: ')).map((l) => l.slice(6));
  const raw = lines.length ? lines[lines.length - 1] : text;
  try { return JSON.parse(raw); } catch { return { raw: text }; }
}

async function mcpRequest(body, sessionId) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  if (sessionId) headers['mcp-session-id'] = sessionId;
  const res = await fetch(playwrightMcpUrl(), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000),
  });
  return {
    ok: res.ok,
    status: res.status,
    sessionId: res.headers.get('mcp-session-id') || sessionId,
    text: await res.text(),
  };
}

async function mcpEnsureSession() {
  if (mcpSessionId) return mcpSessionId;
  const init = await mcpRequest({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'dillon-os-browser-access', version: '1.0' },
    },
  });
  if (!init.ok) {
    throw new Error(`playwright mcp initialize HTTP ${init.status}: ${String(init.text).slice(0, 200)}`);
  }
  mcpSessionId = init.sessionId;
  await mcpRequest({ jsonrpc: '2.0', method: 'notifications/initialized' }, mcpSessionId);
  return mcpSessionId;
}

async function mcpCall(name, args) {
  const sid = await mcpEnsureSession();
  const res = await mcpRequest({
    jsonrpc: '2.0',
    id: Date.now() % 1e9,
    method: 'tools/call',
    params: { name, arguments: args || {} },
  }, sid);
  const parsed = parseMcpMessage(res.text);
  if (!res.ok) throw new Error(`playwright mcp ${name} HTTP ${res.status}`);
  if (parsed.error) throw new Error(parsed.error.message || JSON.stringify(parsed.error));
  return parsed.result || {};
}

function mcpText(result) {
  return ((result && result.content) || [])
    .filter((c) => c && c.type === 'text')
    .map((c) => c.text)
    .join('\n');
}

function mcpImage(result) {
  const img = ((result && result.content) || []).find((c) => c && c.type === 'image' && c.data);
  return img ? Buffer.from(img.data, 'base64') : null;
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

async function probePlaywrightMcp() {
  try {
    mcpSessionId = null;
    await mcpEnsureSession();
    return {
      id: 'playwright_mcp',
      live: true,
      detail: `isolated sidecar ${playwrightMcpUrl()} (no --extension; never port 9222)`,
    };
  } catch (err) {
    return {
      id: 'playwright_mcp',
      live: false,
      detail: `not listening at ${playwrightMcpUrl()} (${String(err.message || err).slice(0, 160)}). start: node _os/automation/bin/browser-access.js start-playwright`,
    };
  }
}

function probeCursorExtensionPlaywright() {
  return {
    id: 'playwright_mcp_extension',
    live: false,
    detail: 'Cursor cloud Playwright with --extension needs the MCP Bridge; 2026-08-18 timed out. Not this engine.',
  };
}

function probeClaudeInChrome() {
  return {
    id: 'claude_in_chrome',
    live: false,
    detail: 'desktop-only; requires Dillon logged-in Chrome, not this cloud VM',
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startPlaywrightMcp() {
  const already = await probePlaywrightMcp();
  if (already.live) return { ...already, started: false };
  const pkg = playwrightCfg().package || '@playwright/mcp@0.0.69';
  const npx = which('npx') || (process.platform === 'win32' ? 'npx.cmd' : 'npx');
  const child = spawn(npx, ['-y', pkg, ...playwrightArgs()], {
    detached: true,
    stdio: 'ignore',
    cwd: repoPath(),
    windowsHide: true,
  });
  child.unref();
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    await sleep(400);
    const again = await probePlaywrightMcp();
    if (again.live) return { ...again, started: true, pid: child.pid };
  }
  return {
    id: 'playwright_mcp',
    live: false,
    started: true,
    detail: `spawned ${pkg} pid ${child.pid} but ${playwrightMcpUrl()} did not accept initialize`,
  };
}

async function ensurePlaywrightMcp() {
  const probed = await probePlaywrightMcp();
  if (probed.live) return probed;
  if (playwrightCfg().auto_start === false) return probed;
  return startPlaywrightMcp();
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
    await probePlaywrightMcp(),
    await probeChrome(),
    await probeCamofox(),
    probeCursorExtensionPlaywright(),
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

async function fetchViaPlaywright(url) {
  const pw = await ensurePlaywrightMcp();
  if (!pw.live) return null;
  const nav = await mcpCall('browser_navigate', { url });
  const text = mcpText(nav);
  const titleMatch = text.match(/Page Title:\s*(.*)/);
  return {
    engine: 'playwright_mcp',
    title: titleMatch ? titleMatch[1].trim() : '',
    snapshot: text.slice(0, 4000),
    endpoint: playwrightMcpUrl(),
  };
}

async function fetchUrl(url) {
  if (!/^https?:\/\//i.test(url) && !/^file:\/\//i.test(url)) die('url must be http(s) or file');
  if (/^https?:/i.test(url)) {
    try {
      const viaPw = await fetchViaPlaywright(url);
      if (viaPw && (viaPw.title || viaPw.snapshot)) return viaPw;
    } catch (err) {
      process.stderr.write(`playwright mcp fetch failed, falling back: ${err.message}\n`);
    }
  }
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
  if (/^https?:/i.test(url)) {
    try {
      const pw = await ensurePlaywrightMcp();
      if (pw.live) {
        await mcpCall('browser_navigate', { url });
        const shot = await mcpCall('browser_take_screenshot', { type: 'png', filename: path.basename(outPath) });
        const buf = mcpImage(shot);
        if (buf && buf.length > 100) {
          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          fs.writeFileSync(outPath, buf);
          return { engine: 'playwright_mcp', path: outPath, bytes: buf.length, endpoint: playwrightMcpUrl() };
        }
      }
    } catch (err) {
      process.stderr.write(`playwright mcp screenshot failed, falling back: ${err.message}\n`);
    }
  }
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
  if (cmd === 'start-playwright') {
    process.stdout.write(`${JSON.stringify(await startPlaywrightMcp(), null, 2)}\n`);
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
  die(`unknown command ${cmd}. use probe|recommend|fetch|screenshot|start-playwright`);
}

main().catch((err) => die(err.stack || String(err), 1));
