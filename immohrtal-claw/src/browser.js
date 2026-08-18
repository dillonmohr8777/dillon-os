'use strict';

const { assertPublicHttpUrl } = require('./net');

/**
 * Read-only browser transport over the Chrome DevTools Protocol.
 *
 * Exists for one job: pages that `web_fetch` returns as an empty JS shell.
 * It opens a throwaway tab, waits for the render, lifts the text, and closes
 * the tab. It cannot click, submit, download, or authenticate, because none of
 * those verbs are implemented - the boundary is the absence of the code, not a
 * flag someone can flip.
 *
 * Gated on CLAW_CDP_URL / BOX_CDP_URL. No URL, no transport.
 */
function cdpBase() {
  const raw = process.env.CLAW_CDP_URL || process.env.BOX_CDP_URL || '';
  return raw.replace(/\/$/, '');
}

function available() {
  return Boolean(cdpBase());
}

async function cdpJson(pathname, { method = 'GET', timeout = 5000 } = {}) {
  const res = await fetch(`${cdpBase()}${pathname}`, {
    method,
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error(`CDP ${pathname} -> HTTP ${res.status}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function version() {
  const info = await cdpJson('/json/version');
  return {
    ok: true,
    browser: info.Browser || 'unknown',
    protocol: info['Protocol-Version'] || '',
    endpoint: cdpBase(),
  };
}

// Minimal CDP client. One socket, one page, sequential commands.
function connect(wsUrl, timeout) {
  return new Promise((resolve, reject) => {
    let WebSocketImpl = globalThis.WebSocket;
    if (!WebSocketImpl) {
      reject(new Error('this Node build has no WebSocket; CDP needs Node 22+'));
      return;
    }
    const ws = new WebSocketImpl(wsUrl);
    const timer = setTimeout(() => {
      try { ws.close(); } catch { /* already gone */ }
      reject(new Error('CDP websocket timed out'));
    }, timeout);
    ws.onopen = () => {
      clearTimeout(timer);
      resolve(ws);
    };
    ws.onerror = () => {
      clearTimeout(timer);
      reject(new Error('CDP websocket failed to open'));
    };
  });
}

function rpc(ws, id, method, params, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CDP ${method} timed out`)), timeout);
    const onMessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(typeof event.data === 'string' ? event.data : '');
      } catch {
        return;
      }
      if (msg.id !== id) return;
      clearTimeout(timer);
      ws.removeEventListener('message', onMessage);
      if (msg.error) reject(new Error(`CDP ${method}: ${msg.error.message || 'error'}`));
      else resolve(msg.result);
    };
    ws.addEventListener('message', onMessage);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

const READ_TEXT = `(() => {
  const drop = document.querySelectorAll('script,style,noscript,svg,iframe');
  for (const el of drop) el.remove();
  const main = document.querySelector('main,article,[role=main]') || document.body;
  return {
    title: document.title || '',
    url: location.href,
    text: (main.innerText || '').replace(/\\n{3,}/g, '\\n\\n').trim(),
  };
})()`;

/**
 * Open a public URL, let it render, return its text. Always closes the tab it
 * opened, including on failure, so a bad page cannot leak tabs into the
 * operator's browser session.
 */
async function readPage({ url, waitMs = 1200, maxChars = 12000, timeout = 20000 }) {
  if (!available()) {
    throw new Error('browser transport is off: set CLAW_CDP_URL or BOX_CDP_URL to a local CDP endpoint');
  }
  // Same SSRF guard as web_fetch. A browser is not an excuse to reach a
  // private host, and CDP would happily load one.
  await assertPublicHttpUrl(url);

  const target = await cdpJson(`/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })
    .catch(() => cdpJson(`/json/new?${encodeURIComponent(url)}`, { method: 'GET' }));
  const targetId = target.id;
  if (!targetId || !target.webSocketDebuggerUrl) {
    throw new Error('CDP did not return a debuggable tab');
  }

  let ws;
  try {
    ws = await connect(target.webSocketDebuggerUrl, timeout);
    await rpc(ws, 1, 'Page.enable', {}, timeout);
    await rpc(ws, 2, 'Runtime.enable', {}, timeout);
    // Cheap settle instead of a full load-event dance: this is a text read,
    // not a test harness.
    await new Promise((r) => setTimeout(r, Math.min(Math.max(waitMs, 0), 10000)));
    const out = await rpc(ws, 3, 'Runtime.evaluate', {
      expression: READ_TEXT,
      returnByValue: true,
      awaitPromise: false,
    }, timeout);
    const value = (out && out.result && out.result.value) || {};
    const text = String(value.text || '');
    return {
      ok: true,
      url: value.url || url,
      title: value.title || '',
      chars: text.length,
      truncated: text.length > maxChars,
      text: text.slice(0, maxChars),
      via: 'cdp',
    };
  } finally {
    if (ws) {
      try { ws.close(); } catch { /* already closed */ }
    }
    try {
      await cdpJson(`/json/close/${targetId}`);
    } catch { /* tab already gone; nothing to clean up */ }
  }
}

module.exports = { available, version, readPage, cdpBase };
