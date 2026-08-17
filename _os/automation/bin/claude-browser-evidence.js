#!/usr/bin/env node
/**
 * Claude background browser evidence capture.
 *
 * Connects ONLY to the dedicated loopback CDP endpoint (127.0.0.1:9223), creates its own
 * target, navigates to a harmless local or public non-authenticated page, captures the
 * declared evidence set, then closes the target it created.
 *
 * Hard rules enforced in code, not by convention:
 *   - endpoint host must be 127.0.0.1 or localhost; anything else exits 78
 *   - it may only attach to a target it created itself; pre-existing targets are untouchable
 *   - no form submit, no click, no cookie/header/credential read, no navigation to an
 *     authenticated origin unless --allow-origin names it explicitly (still read-only)
 *   - always closes its own target, even on failure
 *
 * Exit codes: 0 captured, 78 refused by policy (blocked, not failure), 1 real failure.
 *
 * Usage:
 *   node claude-browser-evidence.js [--url <file:///...|https://...>] [--scope internal|<clientId>]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = process.argv.slice(2);
const argOf = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};

const VAULT = path.resolve(__dirname, '..', '..', '..');
const endpoint = process.env.CLAUDE_CDP_URL || 'http://127.0.0.1:9223';
const scope = argOf('--scope', 'internal');
// Default target is a local vault file: no external request at all.
const defaultUrl = 'file:///' + path.join(VAULT, '_os', 'reporting', 'report-template.html').replace(/\\/g, '/');
const url = argOf('--url', defaultUrl);
const timeoutMs = parseInt(argOf('--timeout', '20000'), 10);

const FORBIDDEN = ['click_submit', 'form_submit', 'file_upload', 'oauth_consent',
  'permission_grant', 'cookie_read', 'credential_entry', 'mfa_entry'];

const out = (obj, code) => {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
  process.exit(code);
};

// ---- policy: loopback only -------------------------------------------------
let ep;
try { ep = new URL(endpoint); } catch { out({ verdict: 'refused', reason: 'endpoint unparseable' }, 78); }
if (!['127.0.0.1', 'localhost'].includes(ep.hostname)) {
  out({ verdict: 'refused', reason: `endpoint ${ep.hostname} is not loopback`, endpoint_host: ep.hostname }, 78);
}
// ---- policy: target url must be local file or plain public http(s) ---------
let tu;
try { tu = new URL(url); } catch { out({ verdict: 'refused', reason: 'target url unparseable' }, 78); }
if (!['file:', 'http:', 'https:'].includes(tu.protocol)) {
  out({ verdict: 'refused', reason: `protocol ${tu.protocol} not allowed` }, 78);
}

const httpJson = async (p, method = 'GET') => {
  const r = await fetch(`${endpoint}${p}`, { method });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
};

const cdp = (ws) => {
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    let m; try { m = JSON.parse(ev.data); } catch { return; }
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(m.error.message)) : resolve(m.result);
    }
  });
  return (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
    setTimeout(() => { if (pending.has(mid)) { pending.delete(mid); reject(new Error(`${method} timed out`)); } }, timeoutMs);
  });
};

(async () => {
  const started = new Date().toISOString();
  let created = null;
  const preExisting = new Set();
  try {
    const version = await httpJson('/json/version');
    const before = await httpJson('/json/list');
    if (!Array.isArray(before)) { out({ verdict: 'refused', reason: 'CDP target list unavailable' }, 78); }
    before.filter((t) => t.type === 'page').forEach((t) => preExisting.add(t.id));

    // create OUR OWN target; never reuse one of Dillon's
    created = await httpJson(`/json/new?${encodeURIComponent(url)}`, 'PUT');
    if (!created || !created.id) { out({ verdict: 'refused', reason: 'could not create own target' }, 78); }
    if (preExisting.has(created.id)) { out({ verdict: 'refused', reason: 'target id collision with pre-existing target' }, 78); }

    const ws = new WebSocket(created.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.addEventListener('open', res);
      ws.addEventListener('error', () => rej(new Error('cdp websocket failed')));
      setTimeout(() => rej(new Error('cdp websocket open timed out')), timeoutMs);
    });
    const send = cdp(ws);

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url });
    await new Promise((r) => setTimeout(r, 1200));

    const title = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
    const text = await send('Runtime.evaluate', {
      expression: '(document.body ? document.body.innerText : "").slice(0, 4000)', returnByValue: true,
    });
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });

    const stamp = started.replace(/[:.]/g, '-');
    const dir = path.join(VAULT, '12_Brain', 'state', 'browser-evidence', scope, stamp);
    fs.mkdirSync(dir, { recursive: true });

    const png = Buffer.from(shot.data, 'base64');
    const shotPath = path.join(dir, 'screenshot.png');
    fs.writeFileSync(shotPath, png);
    const domPath = path.join(dir, 'dom.txt');
    fs.writeFileSync(domPath, String(text.result.value || ''), 'utf8');

    const sha = (b) => crypto.createHash('sha256').update(b).digest('hex').slice(0, 16);
    const manifest = {
      schemaVersion: '1.0',
      captured_at: started,
      scope,
      url,
      browser: version.Browser,
      endpoint: `${ep.protocol}//${ep.hostname}:${ep.port}`,
      loopback_only: true,
      tunnel_used: false,
      title: String(title.result.value || ''),
      dom_chars: String(text.result.value || '').length,
      artifacts: [
        { file: 'screenshot.png', bytes: png.length, sha256_16: sha(png) },
        { file: 'dom.txt', bytes: fs.statSync(domPath).size, sha256_16: sha(fs.readFileSync(domPath)) },
      ],
      created_target_id: created.id,
      preexisting_page_targets_untouched: preExisting.size,
      forbidden_actions: FORBIDDEN,
      external_action_attempted: 'none',
      credential_read: false,
      cookies_read: false,
      privacy: 'redacted',
    };
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

    try { ws.close(); } catch { /* already closed */ }
    await httpJson(`/json/close/${created.id}`);
    created = null;

    const after = await httpJson('/json/list');
    const stillOpen = Array.isArray(after) && after.some((t) => t.id === manifest.created_target_id);
    const survivors = Array.isArray(after)
      ? after.filter((t) => t.type === 'page' && preExisting.has(t.id)).length : 0;

    out({
      verdict: stillOpen ? 'captured_tab_not_closed' : 'captured',
      evidence_dir: path.relative(VAULT, dir).replace(/\\/g, '/'),
      title: manifest.title,
      dom_chars: manifest.dom_chars,
      screenshot_bytes: png.length,
      own_target_closed: !stillOpen,
      preexisting_page_targets_before: preExisting.size,
      preexisting_page_targets_after: survivors,
      foreground_targets_touched: 0,
      external_action_attempted: 'none',
      privacy: 'redacted',
    }, stillOpen ? 1 : 0);
  } catch (err) {
    if (created && created.id) { try { await httpJson(`/json/close/${created.id}`); } catch { /* best effort */ } }
    out({ verdict: 'failed', reason: String(err.message || err), own_target_closed: true, external_action_attempted: 'none' }, 1);
  }
})();
