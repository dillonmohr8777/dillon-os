'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { assertPublicHttpUrl } = require('../lib/net.js');

test('rejects IPv4-mapped IPv6 loopback and private destinations', () => {
  assert.doesNotThrow(() => assertPublicHttpUrl('https://example.com'));
  for (const url of [
    'http://[::ffff:127.0.0.1]/',
    'http://[::ffff:10.0.0.1]/',
    'http://[::ffff:192.168.1.1]/',
  ]) {
    assert.throws(() => assertPublicHttpUrl(url), /non-public host/);
  }
});
