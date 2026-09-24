'use strict';

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { captchaAdapter } = require('../lib/adapters.ts');
const { intakeForm } = require('../lib/web.ts');
const { loadConfig } = require('../lib/config.ts');

const LIVE_FLAG = 'RADAR_V2_CAPTCHA_LIVE';

async function withLiveCaptcha(run) {
  const previous = process.env[LIVE_FLAG];
  process.env[LIVE_FLAG] = 'true';
  try {
    await run();
  } finally {
    if (previous === undefined) delete process.env[LIVE_FLAG];
    else process.env[LIVE_FLAG] = previous;
  }
}

function adapter(options = {}) {
  return captchaAdapter({ captcha: 'turnstile', captchaSecret: 'test-secret', captchaExpectedHostname: 'forms.example', ...options.config }, {
    fetchImpl: options.fetchImpl,
    timeoutMs: options.timeoutMs,
    ...options.adapterOptions,
  });
}

function providerResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, json: async () => body };
}

describe('Turnstile captcha adapter', () => {
  it('wires the form token to the server field and refuses an unconfigured widget', async () => {
    await withLiveCaptcha(async () => {
    const off = intakeForm(loadConfig({ captcha: 'off' }));
    assert.doesNotMatch(off, /challenges\.cloudflare\.com/);
    const missing = intakeForm(loadConfig({ captcha: 'turnstile', captchaSiteKey: '' }));
    assert.match(missing, /type="submit" disabled/);
    assert.doesNotMatch(missing, /challenges\.cloudflare\.com/);
    const ready = loadConfig({ captcha: 'turnstile', captchaSiteKey: 'public-key', captchaExpectedHostname: 'forms.example', captchaExpectedAction: 'audit_request', captchaSecret: 'never-render-this' });
    const configured = intakeForm(ready);
    assert.match(configured, /data-response-field-name="captcha_token"/);
    assert.match(configured, /data-action="audit_request"/);
    assert.doesNotMatch(configured, /never-render-this/);
    assert.match(configured, /data-size="flexible"/);
    for (const field of ['captchaSecret', 'captchaExpectedHostname']) {
      assert.match(intakeForm({ ...ready, [field]: '' }), /type="submit" disabled/);
    }
    process.env[LIVE_FLAG] = 'false';
    assert.match(intakeForm(ready), /type="submit" disabled/);
    });
  });
  it('refuses live verification without an expected hostname before calling the provider', async () => {
    await withLiveCaptcha(async () => {
      let calls = 0;
      const captcha = adapter({ config: { captchaExpectedHostname: '' }, fetchImpl: async () => { calls++; return providerResponse({ success: true }); } });
      assert.deepEqual(await captcha.verify('synthetic-token'), { ok: false, state: 'hostname-not-configured' });
      assert.equal(calls, 0);
    });
  });
  it('rejects empty, non-string, and oversized tokens without calling the provider', async () => {
    await withLiveCaptcha(async () => {
      let calls = 0;
      const captcha = adapter({ fetchImpl: async () => { calls += 1; } });
      for (const token of ['', ' '.repeat(1), {}, 'x'.repeat(2049)]) {
        assert.equal((await captcha.verify(token)).state, token === '' ? 'missing' : 'invalid-token');
      }
      assert.equal(calls, 0);
    });
  });

  it('rejects provider-denied tokens and non-success HTTP responses', async () => {
    await withLiveCaptcha(async () => {
      const denied = adapter({ fetchImpl: async () => providerResponse({ success: false, 'error-codes': ['invalid-input-response'] }) });
      assert.deepEqual(await denied.verify('bad-token'), { ok: false, state: 'provider-rejected' });

      const unavailable = adapter({ fetchImpl: async () => providerResponse({}, 503) });
      assert.deepEqual(await unavailable.verify('token'), { ok: false, state: 'provider-error' });
    });
  });

  it('fails closed on provider timeout', async () => {
    await withLiveCaptcha(async () => {
      const captcha = adapter({
        timeoutMs: 5,
        fetchImpl: (_url, { signal }) => new Promise((_, reject) => {
          signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
        }),
      });
      assert.deepEqual(await captcha.verify('token'), { ok: false, state: 'timeout' });
    });
  });

  it('fails closed on network errors without returning provider or secret details', async () => {
    await withLiveCaptcha(async () => {
      const captcha = adapter({ fetchImpl: async () => { throw new Error('request failed: test-secret'); } });
      const result = await captcha.verify('token');
      assert.deepEqual(result, { ok: false, state: 'provider-error' });
      assert.doesNotMatch(JSON.stringify(result), /test-secret|token/);
    });
  });

  it('rejects a successful response for the wrong hostname or action', async () => {
    await withLiveCaptcha(async () => {
      const response = { success: true, hostname: 'wrong.example', action: 'intake' };
      const captcha = adapter({
        config: { captchaExpectedHostname: 'forms.example', captchaExpectedAction: 'intake' },
        fetchImpl: async () => providerResponse(response),
      });
      assert.deepEqual(await captcha.verify('token'), { ok: false, state: 'hostname-mismatch' });

      const wrongAction = adapter({
        config: { captchaExpectedHostname: 'forms.example', captchaExpectedAction: 'intake' },
        fetchImpl: async () => providerResponse({ ...response, hostname: 'forms.example', action: 'login' }),
      });
      assert.deepEqual(await wrongAction.verify('token'), { ok: false, state: 'action-mismatch' });
    });
  });

  it('posts the secret, token, and optional IP and accepts a matching synthetic success', async () => {
    await withLiveCaptcha(async () => {
      let request;
      const captcha = adapter({
        config: { captchaExpectedHostname: 'forms.example', captchaExpectedAction: 'intake' },
        fetchImpl: async (url, init) => {
          request = { url, init };
          return providerResponse({ success: true, hostname: 'forms.example', action: 'intake' });
        },
      });
      assert.deepEqual(await captcha.verify('synthetic-token', '203.0.113.8'), { ok: true, state: 'verified' });
      assert.equal(request.url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
      assert.equal(request.init.method, 'POST');
      assert.equal(request.init.redirect, 'error');
      assert.equal(request.init.headers['content-type'], 'application/x-www-form-urlencoded');
      assert.deepEqual(Object.fromEntries(new URLSearchParams(request.init.body)), {
        secret: 'test-secret', response: 'synthetic-token', remoteip: '203.0.113.8',
      });
    });
  });
});
