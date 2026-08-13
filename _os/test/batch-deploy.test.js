/**
 * File-selection tests for the batch Netlify drop.
 * Run: node --test _os/test/batch-deploy.test.js
 */
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { collectBatchFiles, siteNameFromBatch } = require('../automation/lib/batch-files');

const NOINDEX = '<!doctype html><meta name="robots" content="noindex,nofollow"><title>x</title>';
let tmp;

describe('batch-files collector', () => {
  before(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'batch-deploy-'));
    fs.writeFileSync(path.join(tmp, 'index.html'), NOINDEX);
    fs.writeFileSync(path.join(tmp, 'prospects.csv'), 'phone,2155550100\n');
    fs.writeFileSync(path.join(tmp, '_write_briefs.py'), 'print(1)\n');
    fs.mkdirSync(path.join(tmp, 'briefs'));
    fs.writeFileSync(path.join(tmp, 'briefs', 'demo.json'), '{"phone":"x"}');
    fs.mkdirSync(path.join(tmp, 'sites', 'andorra-family-dentistry', 'assets'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'sites', 'andorra-family-dentistry', 'index.html'), NOINDEX);
    fs.writeFileSync(path.join(tmp, 'sites', 'andorra-family-dentistry', 'assets', 'image-1.webp'), 'img');
    fs.writeFileSync(path.join(tmp, 'sites', 'andorra-family-dentistry', 'assets', 'PROVENANCE.json'), '{}');
    fs.mkdirSync(path.join(tmp, 'sites', 'johnnys-pizza', 'assets'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'sites', 'johnnys-pizza', 'index.html'), NOINDEX);
    fs.writeFileSync(path.join(tmp, 'sites', 'johnnys-pizza', 'assets', 'logo.png'), 'png');
  });

  after(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('ships the hub plus each site path and image assets', () => {
    const { files, slugs } = collectBatchFiles(tmp);
    assert.deepEqual(slugs, ['andorra-family-dentistry', 'johnnys-pizza']);
    assert.equal(files.has('/index.html'), true);
    assert.equal(files.has('/sites/andorra-family-dentistry/index.html'), true);
    assert.equal(files.has('/sites/andorra-family-dentistry/assets/image-1.webp'), true);
    assert.equal(files.has('/sites/johnnys-pizza/assets/logo.png'), true);
    assert.equal(files.has('/_headers'), true);
    assert.match(files.get('/_headers').toString('utf8'), /noindex/);
  });

  it('keeps csv, python helpers, briefs, and provenance json off the drop', () => {
    const { files } = collectBatchFiles(tmp);
    const keys = [...files.keys()].join('\n');
    assert.equal(keys.includes('prospects.csv'), false);
    assert.equal(keys.includes('_write_briefs.py'), false);
    assert.equal(keys.includes('/briefs/'), false);
    assert.equal(keys.includes('PROVENANCE.json'), false);
  });

  it('refuses a bad slug', () => {
    const bad = path.join(tmp, 'sites', 'Not A Slug');
    fs.mkdirSync(bad);
    fs.writeFileSync(path.join(bad, 'index.html'), NOINDEX);
    assert.throws(() => collectBatchFiles(tmp), /invalid slug/);
    fs.rmSync(bad, { recursive: true, force: true });
  });

  it('reads the Netlify site name from deployBaseUrl', () => {
    assert.equal(
      siteNameFromBatch({ deployBaseUrl: 'https://phl-2026-w33.netlify.app' }),
      'phl-2026-w33'
    );
    assert.equal(
      siteNameFromBatch({ deployBaseUrl: 'https://phl-2026-w34.netlify.app' }),
      'phl-2026-w34'
    );
    assert.equal(siteNameFromBatch({ deployBaseUrl: 'https://evil.example.com' }), '');
  });
});
