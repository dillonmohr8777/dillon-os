const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { runBatch } = require('../build-batch.js');
const { buildSite } = require('../build-site.js');
const {
  passingBrief,
  thinImageBrief,
  writeBatchFixture,
  writeUniqueAssets,
  parseCsv,
  fullPassQa,
  staticOnlyQa,
} = require('./helpers.js');

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'sf-batch-'));
}

describe('build-batch human approval gating', () => {
  it('never emits mail_ready=ready; qa_ready can be ready after full QA', async () => {
    const root = tmp();
    const briefs = [
      passingBrief({ slug: 'alpha-shop', name: 'Alpha Shop' }),
      passingBrief({ slug: 'beta-shop', name: 'Beta Shop' }),
    ];
    writeBatchFixture(root, { targetCount: 2, briefs });
    // Pre-build sites + assets so QA stub finds them after runBatch builds
    briefs.forEach((b) => buildSite(b, path.join(root, 'sites')));
    writeUniqueAssets(root, briefs.map((b) => b.slug), 12);

    const summary = await runBatch(root, {
      quiet: true,
      runQa: fullPassQa,
    });

    const rows = parseCsv(fs.readFileSync(path.join(root, 'prospects.csv'), 'utf8'));
    assert.equal(rows.length, 2);
    for (const row of rows) {
      assert.equal(row.mail_ready, 'hold', 'mail_ready must default to hold');
      assert.equal(row.qa_ready, 'ready');
    }
    assert.equal(summary.mailReadyAlwaysHold, true);
    assert.ok(summary.results.every((r) => r.mailReady === 'hold'));
    assert.equal(summary.ok, true);
  });
});

describe('build-batch partial batches', () => {
  it('exits nonzero and holds all rows when brief count != targetCount', async () => {
    const root = tmp();
    const briefs = [passingBrief({ slug: 'only-one', name: 'Only One' })];
    writeBatchFixture(root, { targetCount: 25, briefs });

    const summary = await runBatch(root, { quiet: true, runQa: fullPassQa });
    assert.equal(summary.ok, false);
    assert.equal(summary.forceHoldAll, true);
    assert.ok(summary.batchFailures.some((f) => /targetCount/.test(f)));

    const rows = parseCsv(fs.readFileSync(path.join(root, 'prospects.csv'), 'utf8'));
    for (const row of rows) {
      assert.equal(row.mail_ready, 'hold');
      assert.equal(row.qa_ready, 'hold');
    }
  });

  it('allows partial only with --allow-partial escape hatch', async () => {
    const root = tmp();
    const briefs = [passingBrief({ slug: 'preview-one', name: 'Preview One' })];
    writeBatchFixture(root, { targetCount: 25, briefs });
    buildSite(briefs[0], path.join(root, 'sites'));
    writeUniqueAssets(root, ['preview-one'], 12);

    const summary = await runBatch(root, {
      quiet: true,
      allowPartial: true,
      runQa: fullPassQa,
    });
    assert.equal(summary.forceHoldAll, false);
    assert.equal(summary.allowPartial, true);
    const rows = parseCsv(fs.readFileSync(path.join(root, 'prospects.csv'), 'utf8'));
    assert.equal(rows[0].qa_ready, 'ready');
    assert.equal(rows[0].mail_ready, 'hold');
    assert.equal(summary.ok, true);
  });
});

describe('build-batch visual QA and spec gates', () => {
  it('keeps qa_ready=hold when visual QA is skipped (static-only)', async () => {
    const root = tmp();
    const briefs = [passingBrief({ slug: 'static-only-co', name: 'Static Only Co' })];
    writeBatchFixture(root, { targetCount: 1, briefs });
    buildSite(briefs[0], path.join(root, 'sites'));
    writeUniqueAssets(root, ['static-only-co'], 12);

    const summary = await runBatch(root, {
      quiet: true,
      runQa: staticOnlyQa,
    });
    assert.equal(summary.ok, false);
    assert.equal(summary.results[0].qa, 'STATIC_ONLY');
    assert.equal(summary.results[0].visualQa, 'skipped');
    assert.equal(summary.results[0].qaReady, 'hold');
    assert.equal(summary.results[0].mailReady, 'hold');
  });

  it('blocks qa_ready on canonical spec failures (image count)', async () => {
    const root = tmp();
    const briefs = [thinImageBrief({ slug: 'thin-images-co', name: 'Thin Images Co' })];
    writeBatchFixture(root, { targetCount: 1, briefs });
    buildSite(briefs[0], path.join(root, 'sites'));
    writeUniqueAssets(root, ['thin-images-co'], 11);

    const summary = await runBatch(root, {
      quiet: true,
      runQa: fullPassQa,
    });
    assert.equal(summary.ok, false);
    assert.ok(summary.results[0].failures.some((f) => /spec images/.test(f)));
    assert.equal(summary.results[0].qaReady, 'hold');
    assert.equal(summary.results[0].mailReady, 'hold');
  });

  it('rejects hostile slugs before path joins', async () => {
    const root = tmp();
    const briefs = [passingBrief({ slug: 'ok-shop', name: 'Ok' })];
    writeBatchFixture(root, { targetCount: 1, briefs });
    // Overwrite with hostile slug inside the brief file
    fs.writeFileSync(
      path.join(root, 'briefs', 'ok-shop.json'),
      JSON.stringify(passingBrief({ slug: '../evil', name: 'Evil' }), null, 2)
    );

    const summary = await runBatch(root, { quiet: true, runQa: fullPassQa });
    assert.equal(summary.ok, false);
    assert.ok(summary.results[0].failures.some((f) => /slug/.test(f)));
    assert.equal(summary.results[0].qaReady, 'hold');
    // Must not create a traversal directory under sites
    assert.ok(!fs.existsSync(path.join(root, 'sites', '..', 'evil')));
  });
});
