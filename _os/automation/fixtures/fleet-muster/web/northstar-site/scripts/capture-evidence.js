'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputIndex = process.argv.indexOf('--out');
const outputDirectory = outputIndex >= 0 ? path.resolve(process.argv[outputIndex + 1]) : null;
const pageUrl = process.env.NORTHSTAR_FIXTURE_URL || 'http://127.0.0.1:18765/index.html';
const debuggingPort = 18766;

if (!outputDirectory) throw new Error('Usage: capture-evidence.js --out <existing-output-directory>');
fs.mkdirSync(outputDirectory, { recursive: true });

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForJson(url, attempts = 50) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // Chrome may still be starting.
    }
    await delay(100);
  }
  throw new Error(`Chrome DevTools endpoint did not become ready: ${url}`);
}

async function connectCdp(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const pending = new Map();
  const events = [];
  let nextId = 1;
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  socket.addEventListener('message', (message) => {
    const payload = JSON.parse(message.data);
    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id);
      pending.delete(payload.id);
      if (payload.error) reject(new Error(payload.error.message));
      else resolve(payload.result);
    } else if (payload.method) {
      events.push(payload);
    }
  });
  return {
    events,
    send(method, params = {}) {
      const id = nextId;
      nextId += 1;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() {
      socket.close();
    },
  };
}

async function waitForDocument(cdp) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const state = await cdp.send('Runtime.evaluate', {
      expression: 'document.readyState',
      returnByValue: true,
    });
    if (state.result.value === 'complete') return;
    await delay(100);
  }
  throw new Error('Page did not reach document.readyState=complete');
}

async function main() {
  const profileDirectory = path.join(outputDirectory, 'chrome-cdp-profile');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${profileDirectory}`,
    'about:blank',
  ], { windowsHide: true, stdio: 'ignore' });
  let cdp;
  try {
    const targets = await waitForJson(`http://127.0.0.1:${debuggingPort}/json/list`);
    const page = targets.find((target) => target.type === 'page');
    if (!page) throw new Error('Chrome did not expose a page target');
    cdp = await connectCdp(page.webSocketDebuggerUrl);
    await Promise.all([
      cdp.send('Page.enable'),
      cdp.send('Runtime.enable'),
      cdp.send('Network.enable'),
      cdp.send('Log.enable'),
      cdp.send('Accessibility.enable'),
    ]);
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });

    const results = [];
    for (const viewport of [
      { name: 'desktop-full', width: 1440, height: 1000, mobile: false },
      { name: 'mobile-full', width: 390, height: 844, mobile: true },
    ]) {
      const eventStart = cdp.events.length;
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1,
        mobile: viewport.mobile,
      });
      await cdp.send('Page.navigate', { url: pageUrl });
      await waitForDocument(cdp);
      await delay(250);
      const evaluation = await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const input = document.querySelector('#postal-code');
          input.value = '19103';
          document.querySelector('#planning-form').requestSubmit();
          const focusable = [...document.querySelectorAll('a[href], button, input')];
          return {
            title: document.title,
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            noindex: document.querySelector('meta[name="robots"]')?.content || null,
            label: document.querySelector('label[for="postal-code"]')?.textContent.trim() || null,
            status: document.querySelector('#postal-status')?.textContent.trim() || null,
            sections: [...document.querySelectorAll('[data-section]')].map((node) => node.dataset.section),
            focusableCount: focusable.length,
          };
        })()`,
        returnByValue: true,
      });
      const accessibility = await cdp.send('Accessibility.getFullAXTree');
      const postalNode = accessibility.nodes.find((node) => (
        node.role?.value === 'textbox' && node.name?.value === 'Project ZIP code'
      ));
      const screenshot = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        fromSurface: true,
      });
      const screenshotPath = path.join(outputDirectory, `${viewport.name}.png`);
      fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
      const newEvents = cdp.events.slice(eventStart);
      const requests = newEvents
        .filter((event) => event.method === 'Network.requestWillBeSent')
        .map((event) => event.params.request.url);
      const consoleErrors = newEvents
        .filter((event) => event.method === 'Runtime.exceptionThrown' || (
          event.method === 'Log.entryAdded' && event.params.entry.level === 'error'
        ))
        .map((event) => event.params.exceptionDetails?.text || event.params.entry?.text || 'unknown browser error');
      results.push({
        viewport,
        screenshotPath,
        ...evaluation.result.value,
        horizontalOverflow: evaluation.result.value.scrollWidth > evaluation.result.value.clientWidth,
        accessiblePostalTextbox: Boolean(postalNode),
        requests,
        externalRequests: requests.filter((url) => !url.startsWith('http://127.0.0.1:18765/')),
        consoleErrors,
      });
    }

    const report = {
      schemaVersion: 1,
      synthetic: true,
      browser: 'Google Chrome headless via DevTools Protocol',
      reducedMotion: 'reduce',
      passed: results.every((result) => (
        !result.horizontalOverflow
        && result.noindex.includes('noindex')
        && result.accessiblePostalTextbox
        && result.externalRequests.length === 0
        && result.consoleErrors.length === 0
      )),
      results,
    };
    fs.writeFileSync(path.join(outputDirectory, 'browser-results.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
    if (!report.passed) process.exitCode = 1;
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
