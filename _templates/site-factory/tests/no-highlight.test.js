const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { buildSite } = require('../build-site.js');
const { passingBrief } = require('./helpers.js');

describe('no highlighted font', () => {
  it('emits headings without mark highlight wrappers', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sf-no-mark-'));
    const built = buildSite(
      passingBrief({
        slug: 'no-mark-shop',
        name: 'No Mark Shop',
        attitude: 'neon',
        composition_ref: 'https://stripe.com',
      }),
      tmp
    );
    assert.doesNotMatch(built.html, /<mark[\s>]/);
    assert.doesNotMatch(built.html, /h1 mark\{/);
    assert.doesNotMatch(built.html, /h2 mark\{/);
    assert.match(built.html, /<h1>/);
  });
});
