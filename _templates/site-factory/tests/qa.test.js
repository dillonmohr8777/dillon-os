const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildSite } = require('../build-site.js');
const { runQa, contrastRatio, parseRootTokens } = require('../qa.js');
const { passingBrief, writeUniqueAssets } = require('./helpers.js');

function fixture(brief) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sf-qa-'));
  const sitesRoot = path.join(root, 'sites');
  const built = buildSite(brief, sitesRoot);
  writeUniqueAssets(root, [brief.slug], 12);
  return built.outDir;
}

describe('qa static quality gates', () => {
  it('parses tokens and computes WCAG contrast', () => {
    const tokens = parseRootTokens('<style>:root{--paper:#ffffff;--on-paper:#000000}</style>');
    assert.equal(tokens.paper, '#ffffff');
    assert.equal(tokens['on-paper'], '#000000');
    assert.equal(contrastRatio(tokens.paper, tokens['on-paper']), 21);
  });

  it('passes a canonical site through static gates', async () => {
    const brief = passingBrief({ slug: 'static-pass', name: 'Static Pass' });
    const result = await runQa(fixture(brief), { skipVisual: true });
    assert.equal(result.status, 'STATIC_ONLY');
    assert.equal(result.failures.length, 0);
    assert.equal(result.metrics.images, 12);
  });

  it('fails a low-contrast token pair', async () => {
    const brief = passingBrief({
      slug: 'contrast-fail',
      name: 'Contrast Fail',
      tokens: { accent: '#FFFFFF', onAccent: '#FFFFFF' },
    });
    const result = await runQa(fixture(brief), { skipVisual: true });
    assert.ok(result.failures.some((failure) => /Contrast accent\/on-accent/.test(failure)));
  });

  it('fails repeated image references within one homepage', async () => {
    const brief = passingBrief({ slug: 'duplicate-fail', name: 'Duplicate Fail' });
    brief.gallery.imageIndexes[5] = 3;
    const result = await runQa(fixture(brief), { skipVisual: true });
    assert.ok(result.failures.some((failure) => /Duplicate image reference/.test(failure)));
  });
});
