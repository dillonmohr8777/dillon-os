const { after, before, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  createWebhookServer,
  loadOrCreateSecret,
  verifySignature,
} = require('../webhook-gateway');

describe('webhook gateway', () => {
  const secret = 'a'.repeat(64);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webhook-gateway-'));
  const logFile = path.join(tempDir, 'webhook-log.json');
  let server;
  let baseUrl;

  before(async () => {
    server = createWebhookServer({ secret, logFile });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('serves a public health check', async () => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, 'healthy');
  });

  it('rejects unsigned and malformed signatures', async () => {
    const unsigned = await fetch(`${baseUrl}/webhook/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    assert.equal(unsigned.status, 401);

    const malformed = await fetch(`${baseUrl}/webhook/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': 'sha256=short',
      },
      body: '{}',
    });
    assert.equal(malformed.status, 401);
  });

  it('accepts signed JSON without persisting request headers', async () => {
    const payload = JSON.stringify({ event: 'test' });
    const signature = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;
    const response = await fetch(`${baseUrl}/webhook/grok`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        Authorization: 'Bearer must-not-be-logged',
      },
      body: payload,
    });

    assert.equal(response.status, 200);
    const log = fs.readFileSync(logFile, 'utf8');
    assert.match(log, /"event": "test"/);
    assert.doesNotMatch(log, /must-not-be-logged|x-webhook-signature/i);
  });

  it('creates a private 256-bit secret when missing', () => {
    const secretFile = path.join(tempDir, 'private', 'secret.txt');
    const generated = loadOrCreateSecret(secretFile);
    assert.match(generated, /^[a-f0-9]{64}$/);
    assert.equal(fs.statSync(secretFile).mode & 0o777, 0o600);
    assert.equal(loadOrCreateSecret(secretFile), generated);
  });

  it('compares signatures without throwing on invalid lengths', () => {
    assert.equal(verifySignature(Buffer.from('{}'), 'sha256=x', secret), false);
  });
});
