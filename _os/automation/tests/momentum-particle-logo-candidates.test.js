'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  collectMomentumParticleLogoCandidates,
  rankLogoCandidates,
} = require('../lib/momentum-particle-logo-candidates');

test('logo ranking prefers explicit exact-logo evidence', () => {
  const ranked = rankLogoCandidates(`
    <img src="hero.webp" alt="Store interior">
    <img class="nav-brand" data-role="logo" src="assets/logo.png" alt="Example official logo">
    <img class="footer-logo" src="old-logo.png" alt="Logo">
  `, 'https://example.com/sites/example/');
  assert.equal(ranked[0].candidate_url, 'https://example.com/sites/example/assets/logo.png');
  assert.equal(ranked[0].reasons.includes('data-role=logo'), true);
  assert.ok(ranked[0].score > ranked[1].score);
});

test('collector stages candidates but grants no exact-logo or registry authority', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'momentum-logo-candidates-'));
  const outputPath = path.join(root, 'candidate-manifest.json');
  const assetsDir = path.join(root, 'assets');
  const records = [];
  for (let index = 0; index < 220; index += 1) {
    records.push({
      page_id: `page-${String(index).padStart(3, '0')}`,
      business_id: `business-${String(index).padStart(3, '0')}`,
      classification: index < 133 ? 'retain' : 'repair',
      current_record: { business: `Business ${index}`, concept_url: `https://example.test/sites/${index}/` },
      canonical_identity: { predecessor_slug: `business-${index}` },
      source_fingerprint_sha256: String(index).padStart(64, '0'),
    });
  }
  for (let index = 0; index < 18; index += 1) {
    records.push({
      page_id: `excluded-${String(index).padStart(3, '0')}`,
      business_id: `excluded-business-${String(index).padStart(3, '0')}`,
      classification: 'exclude',
      current_record: { business: `Excluded ${index}`, concept_url: null },
    });
  }
  const fetchImpl = async (url) => {
    if (String(url).endsWith('logo.png')) {
      return new Response(Buffer.from('candidate-image-bytes'), { status: 200, headers: { 'content-type': 'image/png' } });
    }
    return new Response('<html><img data-role="logo" src="assets/logo.png" alt="Business official logo"></html>', {
      status: 200,
      headers: { 'content-type': 'text/html' },
    });
  };
  try {
    const result = await collectMomentumParticleLogoCandidates({
      state: 'identity_reconciled',
      reconciliation_id: 'fixture',
      records,
    }, {
      outputPath,
      assetsDir,
      logicalAssetPrefix: 'fixture/assets',
      concurrency: 3,
      fetchImpl,
    });
    assert.equal(result.counts.logical_records, 238);
    assert.equal(result.counts.active_records, 220);
    assert.equal(result.counts.candidate_extracted, 220);
    assert.equal(result.counts.excluded_no_binding, 18);
    assert.equal(result.counts.registry_eligible, 0);
    assert.equal(result.candidates.filter((candidate) => candidate.extraction_state === 'candidate_extracted').length, 220);
    assert.equal(result.candidates.every((candidate) => candidate.exact_logo_verified === false), true);
    assert.equal(result.authority.generated_logo_substitution_authorized, false);
    assert.equal(result.authority.portfolio_registry_write_authorized, false);
    assert.equal(fs.readdirSync(assetsDir).length, 220);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('collector caps concurrency at three and refuses an unreconciled manifest', async () => {
  await assert.rejects(() => collectMomentumParticleLogoCandidates({ state: 'draft', records: [] }, {
    outputPath: path.join(os.tmpdir(), 'should-not-write.json'),
  }), /reconciled Momentum estate manifest/);
  const records = Array.from({ length: 238 }, (_, index) => ({
    page_id: `page-${index}`,
    business_id: `business-${index}`,
    classification: index < 220 ? 'retain' : 'exclude',
    current_record: { business: `Business ${index}`, concept_url: index < 220 ? `https://example.test/${index}` : null },
    canonical_identity: { predecessor_slug: `business-${index}` },
  }));
  await assert.rejects(() => collectMomentumParticleLogoCandidates({ state: 'identity_reconciled', records }, {
    outputPath: path.join(os.tmpdir(), 'should-not-write.json'),
    concurrency: 4,
  }), /from 1 to 3/);
});
