import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  OFFICE_DASHBOARD_HOST,
  startOfficeDashboardServer
} from '../ops/serve-office-dashboard.mjs';

const agencyRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(agencyRoot, '..', '..');

test('office live server serves fresh local state, HTML, and only approved assets', async (t) => {
  const started = await startOfficeDashboardServer({ repoRoot, port: 0 });
  t.after(async () => {
    await new Promise((resolve, reject) => {
      started.server.close((error) => error ? reject(error) : resolve());
    });
  });

  const address = started.server.address();
  assert.ok(address && typeof address !== 'string');
  assert.equal(address.address, OFFICE_DASHBOARD_HOST);
  assert.ok(address.port > 0);

  const healthResponse = await fetch(`${started.url}/health`);
  assert.equal(healthResponse.status, 200);
  assert.equal(healthResponse.headers.get('cache-control'), 'no-store');
  assert.match(healthResponse.headers.get('content-type') || '', /^application\/json/);
  const health = await healthResponse.json();
  assert.deepEqual({ status: health.status, service: health.service }, {
    status: 'ok',
    service: 'immohrtal-office-dashboard'
  });
  assert.ok(!Number.isNaN(Date.parse(health.served_at)));

  const firstStateResponse = await fetch(`${started.url}/api/state`);
  assert.equal(firstStateResponse.status, 200);
  assert.equal(firstStateResponse.headers.get('cache-control'), 'no-store');
  assert.equal(firstStateResponse.headers.get('x-content-type-options'), 'nosniff');
  const firstState = await firstStateResponse.json();
  assert.ok(!Number.isNaN(Date.parse(firstState.served_at)));
  assert.equal(firstState.snapshot.workflow_id, 'IMMOHRTAL-DAY1-20260825');
  assert.equal(firstState.snapshot.roster.length, 5);
  assert.ok(!Number.isNaN(Date.parse(firstState.snapshot.as_of)));
  assert.ok(firstState.snapshot.roster.every((seat) => seat.online_claim === false));

  await new Promise((resolve) => setTimeout(resolve, 5));
  const secondStateResponse = await fetch(`${started.url}/api/state`);
  const secondState = await secondStateResponse.json();
  assert.ok(Date.parse(secondState.served_at) >= Date.parse(firstState.served_at));
  assert.notEqual(secondState.snapshot.as_of, firstState.snapshot.as_of);

  const htmlResponse = await fetch(`${started.url}/`);
  assert.equal(htmlResponse.status, 200);
  assert.equal(htmlResponse.headers.get('cache-control'), 'no-store');
  assert.match(htmlResponse.headers.get('content-type') || '', /^text\/html/);
  const html = await htmlResponse.text();
  assert.match(html, /IMMOHRTAL Marketing Solutions/);
  assert.match(html, /<article class="seat-row"/);
  assert.match(html, /noindex,nofollow,noarchive,nosnippet/);

  const fontName = 'FoundryMono-400.woff2';
  const fontResponse = await fetch(`${started.url}/fonts/${fontName}`);
  assert.equal(fontResponse.status, 200);
  assert.equal(fontResponse.headers.get('cache-control'), 'no-store');
  assert.equal(fontResponse.headers.get('content-type'), 'font/woff2');
  const servedFont = Buffer.from(await fontResponse.arrayBuffer());
  const sourceFont = fs.readFileSync(path.join(repoRoot, 'immohrtal-marketing-site', 'public', 'fonts', fontName));
  assert.deepEqual(servedFont, sourceFont);

  const unapprovedFont = await fetch(`${started.url}/fonts/not-approved.woff2`);
  assert.equal(unapprovedFont.status, 404);
  assert.equal(unapprovedFont.headers.get('cache-control'), 'no-store');

  const missing = await fetch(`${started.url}/missing`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { status: 'not_found' });

  const rejectedMethod = await fetch(`${started.url}/api/state`, { method: 'POST' });
  assert.equal(rejectedMethod.status, 405);
  assert.equal(rejectedMethod.headers.get('allow'), 'GET, HEAD');
  assert.deepEqual(await rejectedMethod.json(), { status: 'method_not_allowed' });
});
