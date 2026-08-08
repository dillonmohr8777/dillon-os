const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
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

function digestFiles(root, relativePaths) {
  const digests = {};
  const visit = (relativePath) => {
    const absolute = path.join(root, relativePath);
    const stat = fs.statSync(absolute);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(absolute).sort()) visit(path.join(relativePath, name));
      return;
    }
    digests[relativePath.split(path.sep).join('/')] = crypto
      .createHash('sha256')
      .update(fs.readFileSync(absolute))
      .digest('hex');
  };
  relativePaths.forEach(visit);
  return digests;
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

describe('build-batch runtime resumability', () => {
  it('fails closed before build work when trigger identity is missing', async () => {
    const root = tmp();
    const briefs = [passingBrief({ slug: 'identity-gate', name: 'Identity Gate' })];
    writeBatchFixture(root, { targetCount: 1, briefs });
    const batchPath = path.join(root, 'batch.json');
    const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
    delete batch.runtime;
    fs.writeFileSync(batchPath, JSON.stringify(batch, null, 2));
    let builds = 0;
    await assert.rejects(
      runBatch(root, {
        quiet: true,
        runQa: fullPassQa,
        buildSite: (...args) => {
          builds += 1;
          return buildSite(...args);
        },
      }),
      /triggerIdentity is required/
    );
    assert.equal(builds, 0);
    assert.equal(fs.existsSync(path.join(root, 'agent-run.json')), false);
  });

  it('resumes at the first unfinished item and matches an uninterrupted artifact set', async () => {
    const briefs = [
      passingBrief({ slug: 'alpha-runtime', name: 'Alpha Runtime' }),
      passingBrief({ slug: 'beta-runtime', name: 'Beta Runtime' }),
    ];

    const uninterruptedRoot = tmp();
    writeBatchFixture(uninterruptedRoot, { targetCount: 2, briefs });
    briefs.forEach((brief) => buildSite(brief, path.join(uninterruptedRoot, 'sites')));
    writeUniqueAssets(uninterruptedRoot, briefs.map((brief) => brief.slug), 12);
    const uninterrupted = await runBatch(uninterruptedRoot, { quiet: true, runQa: fullPassQa });
    assert.equal(uninterrupted.ok, true);

    const resumedRoot = tmp();
    writeBatchFixture(resumedRoot, { targetCount: 2, briefs });
    briefs.forEach((brief) => buildSite(brief, path.join(resumedRoot, 'sites')));
    writeUniqueAssets(resumedRoot, briefs.map((brief) => brief.slug), 12);

    await assert.rejects(
      runBatch(resumedRoot, {
        quiet: true,
        runQa: fullPassQa,
        interruptAfterItems: 1,
      }),
      (error) => error.code === 'SITE_BATCH_INTERRUPTED'
    );
    const interruptedManifest = JSON.parse(
      fs.readFileSync(path.join(resumedRoot, 'agent-run.json'), 'utf8')
    );
    assert.equal(interruptedManifest.items[0].status, 'completed');
    assert.equal(interruptedManifest.items[1].status, 'running');

    let resumedBuilds = 0;
    const resumed = await runBatch(resumedRoot, {
      quiet: true,
      runQa: fullPassQa,
      buildSite: (brief, outputRoot) => {
        resumedBuilds += 1;
        return buildSite(brief, outputRoot);
      },
    });
    assert.equal(resumed.ok, true);
    assert.equal(resumedBuilds, 1, 'the completed first item must not rebuild');

    const manifest = JSON.parse(fs.readFileSync(path.join(resumedRoot, 'agent-run.json'), 'utf8'));
    assert.equal(manifest.status, 'awaiting_review');
    assert.deepEqual(manifest.items.map((item) => item.status), ['completed', 'completed']);
    assert.deepEqual(manifest.items.map((item) => item.attempts), [1, 2]);
    assert.ok(manifest.items.every((item) => item.artifacts.every((artifact) => /^[a-f0-9]{64}$/.test(artifact.sha256))));

    const materialPaths = ['sites', 'index.html', 'manifest.csv', 'prospects.csv', 'batch-report.md'];
    assert.deepEqual(
      digestFiles(resumedRoot, materialPaths),
      digestFiles(uninterruptedRoot, materialPaths)
    );
  });
});
