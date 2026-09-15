#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { runQa } = require('../../_templates/site-factory/qa.js');

const root = path.resolve(__dirname, '..', '..');
const runId = process.argv[2];
if (!/^\d{8}-\d{6}$/.test(runId || '')) {
  throw new Error('Usage: node acceptance-qa.js <yyyyMMdd-HHmmss>');
}

const batchDir = path.join(
  root,
  '02_Campaigns',
  'AI Site Builder Outreach Engine',
  'batches',
  `radar-next20-${runId}`
);
const summary = JSON.parse(fs.readFileSync(path.join(batchDir, 'batch-summary.json'), 'utf8'));
const receiptOnly = process.argv.includes('--receipt-only');

(async () => {
  const results = [];
  for (const expected of summary.results) {
    const shotsRoot = path.join(root, '_templates', 'site-factory', 'qa-shots', expected.slug);
    const screenshotFiles = ['small-phone', 'phone', 'wide-phone', 'tablet', 'compact-desktop', 'desktop']
      .flatMap((name) => [`${name}-top.png`, `${name}.png`])
      .map((name) => path.join(shotsRoot, name));
    const screenshotReadback = screenshotFiles.every((file) => fs.existsSync(file) && fs.statSync(file).size > 10000);
    const result = receiptOnly ? {
      slug: expected.slug,
      status: expected.qa === 'PASS' && expected.visualQa === 'ran' && expected.qaReady === 'ready' && screenshotReadback ? 'PASS' : 'FAIL',
      staticOk: expected.qa === 'PASS',
      visualQa: expected.visualQa,
      screenshotReadback,
      failures: screenshotReadback ? expected.failures : [...expected.failures, 'Top/full screenshot readback failed'],
      warnings: expected.warnings,
      fullQa: expected.qaReady === 'ready' && screenshotReadback,
    } : await runQa(path.join(batchDir, 'sites', expected.slug));
    results.push(result);
    process.stdout.write(`${expected.slug}: ${result.status}\n`);
  }
  const failures = results.filter((result) => result.status !== 'PASS');
  const receipt = {
    schema: 1,
    runId,
    generatedAt: new Date().toISOString(),
    source: receiptOnly ? 'Fresh batch QA summary plus 240 screenshot file readback' : 'Independent acceptance browser run',
    viewports: [
      { name: 'small-phone', width: 320, height: 740 },
      { name: 'phone', width: 390, height: 844 },
      { name: 'wide-phone', width: 430, height: 932 },
      { name: 'tablet', width: 850, height: 1100 },
      { name: 'compact-desktop', width: 1024, height: 768 },
      { name: 'desktop', width: 1440, height: 900 },
    ],
    gates: [
      'static structure and metadata',
      'all rendered images loaded',
      'horizontal overflow',
      'console and page errors',
      'keyboard-visible skip-link focus',
      'reduced-motion behavior',
      'six top-of-page viewport screenshots',
      'six full-page screenshots with passed-section opacity restored',
    ],
    passCount: results.length - failures.length,
    failCount: failures.length,
    status: failures.length ? 'FAIL' : 'PASS',
    results,
  };
  fs.writeFileSync(path.join(batchDir, 'ACCEPTANCE-QA.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  process.stdout.write(`${receipt.passCount}/${results.length} strict acceptance pass\n`);
  process.exit(failures.length ? 1 : 0);
})().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
