'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { createServer } = require('../lib/web.ts');
const { loadConfig } = require('../lib/config.ts');

test('all parsed POST routes reject oversized fixed and chunked bodies before processing', async () => {
  const server = createServer({ store: {}, adapters: {}, campaign: {}, cfg: loadConfig({ staging: true, qaToken: 'test-only' }) });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  try {
    for (const path of ['/intake', '/webhooks/booking', '/qa/absent/approve?token=test-only']) {
      for (const chunked of [false, true]) {
        const status = await new Promise((resolve, reject) => {
          const req = http.request({ host: '127.0.0.1', port, path, method: 'POST', headers: chunked ? {} : { 'content-length': 65537 } }, res => {
            res.resume();
            res.on('end', () => resolve(res.statusCode));
          });
          req.on('error', reject);
          req.write('x'.repeat(32768));
          req.end('x'.repeat(32769));
        });
        assert.equal(status, 413, `${path}, chunked=${chunked}`);
      }
    }
    const form = await fetch(`http://127.0.0.1:${port}/intake`);
    assert.equal(form.status, 200);
    const html = await form.text();
    assert.match(html, /Private staging: synthetic test data only/);
    assert.match(html, /src="data:image\/png;base64,[^"]+" alt="Momentum Digital"/);
    const health = await (await fetch(`http://127.0.0.1:${port}/health`)).json();
    assert.equal(health.staging, true);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
