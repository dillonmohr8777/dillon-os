#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..', '..');
const runId = process.argv[2];
if (!/^\d{8}-\d{6}$/.test(runId || '')) throw new Error('Run id must use yyyyMMdd-HHmmss.');
const runDir = path.join(__dirname, 'runs', runId);
const batchDir = path.join(root, '02_Campaigns', 'AI Site Builder Outreach Engine', 'batches', `radar-next20-${runId}`);
const shotsRoot = path.join(root, '_templates', 'site-factory', 'qa-shots');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const failures = [];
const checks = [];
const check = (name, condition, detail) => {
  checks.push({ name, pass: Boolean(condition), detail });
  if (!condition) failures.push(`${name}: ${detail}`);
};

const selection = readJson(path.join(batchDir, 'SELECTION-EVIDENCE.json'));
const sources = readJson(path.join(batchDir, 'SOURCE-STATUS.json'));
const summary = readJson(path.join(batchDir, 'batch-summary.json'));
const acceptance = readJson(path.join(batchDir, 'ACCEPTANCE-QA.json'));
const detector = readJson(path.join(runDir, 'IMPECCABLE-DETECTOR.json'));
const selectedBySlug = new Map(selection.selection.map((item) => [item.slug, item]));

check('exact selected count', selection.selection.length === 20, `${selection.selection.length}/20`);
check('untouched global inventory scanned', selection.priorEvidence.filesScanned >= 1 && selection.priorEvidence.completedDomains >= 1, `${selection.priorEvidence.filesScanned} artifacts; ${selection.priorEvidence.completedDomains} prior domains`);
check('selected domains unique', new Set(selection.selection.map((item) => item.domain)).size === 20, '20 unique domains');
check('selected slugs unique', new Set(selection.selection.map((item) => item.slug)).size === 20, '20 unique slugs');
check('source-ready count', sources.selected.length === 20 && sources.selected.every((item) => item.identity?.ok && item.httpStatus === 200), `${sources.selected.length}/20 source records`);
check('build QA summary', summary.ok === true && summary.qaReadyCount === 20 && summary.results.every((item) => item.qa === 'PASS' && item.visualQa === 'ran'), `${summary.qaReadyCount}/20 qa_ready`);
check('strict browser acceptance', acceptance.status === 'PASS' && acceptance.passCount === 20 && acceptance.failCount === 0, `${acceptance.passCount}/20 acceptance pass`);
check('mail remains hold', summary.mailReadyAlwaysHold === true && summary.results.every((item) => item.mailReady === 'hold'), 'no outreach authorization');
check('detector receipt', detector.passCount === 1 && detector.rerun === false && detector.exitCode !== detector.blockingExitCode, `${detector.findingCount} warnings, no exit-code-2 block`);

const boardHashes = new Map();
const contentHashes = new Map();
const viewports = ['small-phone', 'phone', 'wide-phone', 'tablet', 'compact-desktop', 'desktop'];
for (const result of summary.results) {
  const selected = selectedBySlug.get(result.slug);
  const siteDir = path.join(batchDir, 'sites', result.slug);
  const assetsDir = path.join(siteDir, 'assets');
  const html = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');
  const provenance = readJson(path.join(assetsDir, 'ALIGN-IMAGE-PROVENANCE.json'));
  const logoPath = path.join(assetsDir, selected.logoFile);

  const allowedIdentity = selected.logoTransformation === 'none; exact first-party transparent asset'
    || /exact-name typographic fallback/.test(selected.logoTransformation)
    || (Boolean(selected.logoSourceSha256) && /removed with deterministic FFmpeg colorkey; geometry unchanged/.test(selected.logoTransformation));
  check(`${result.slug} exact or disclosed identity`, fs.existsSync(logoPath) && hash(logoPath) === selected.logoSha256 && allowedIdentity, selected.logoTransformation);
  const identityFallback = /exact-name typographic fallback/.test(selected.logoTransformation);
  check(`${result.slug} identity presentation`, identityFallback
    ? /<span class="wordmark">/.test(html) && !/<img class="brand-logo"/.test(html) && !/exact (?:mark|logo)/i.test(html)
    : /<img class="brand-logo"/.test(html), identityFallback ? 'verified business name as ordinary live text' : 'verified first-party logo');
  check(`${result.slug} private noindex`, /<meta name="robots" content="noindex,nofollow">/.test(html), 'noindex,nofollow');
  check(`${result.slug} Align type system`, /Plus Jakarta Sans/.test(html) && /DM Sans/.test(html) && /font-display-800\.woff2/.test(html), 'self-hosted Plus Jakarta Sans 800 and DM Sans');
  check(`${result.slug} visible grain layer`, /class="film-grain"/.test(html) && /assets\/grain\.svg/.test(html) && /opacity:\.13/.test(html), 'image and interface grain');
  check(`${result.slug} honest illustrative disclosure`, /Generated imagery does not depict/.test(html), 'not actual staff, customers, facility, products, projects, or outcomes');
  check(`${result.slug} no continuous marquee`, !/animation:marquee-scroll|@keyframes marquee-scroll/.test(html), 'reader-controlled optional strip');
  check(`${result.slug} site-specific board`, provenance.business === selected.name && provenance.board.key === result.slug && provenance.outputs.length === 12 && provenance.board.prompt.toLowerCase().includes(selected.name.toLowerCase()), `${provenance.business}; ${provenance.board.key}`);
  check(`${result.slug} board source exists`, fs.existsSync(path.join(root, provenance.board.file)) && hash(path.join(root, provenance.board.file)) === provenance.board.sha256, provenance.board.sha256);
  check(`${result.slug} grain provenance`, provenance.treatment.imageGrain.includes('Visible refined 35mm film grain') && hash(path.join(assetsDir, provenance.treatment.interfaceGrain.file)) === provenance.treatment.interfaceGrain.sha256, provenance.treatment.interfaceGrain.sha256);

  if (!boardHashes.has(provenance.board.sha256)) boardHashes.set(provenance.board.sha256, []);
  boardHashes.get(provenance.board.sha256).push(result.slug);
  for (const output of provenance.outputs) {
    const file = path.join(assetsDir, output.output);
    check(`${result.slug} ${output.output}`, fs.existsSync(file) && hash(file) === output.outputSha256 && output.dimensions.width === 1200 && output.dimensions.height === 900, output.outputSha256);
    const digest = hash(file);
    if (!contentHashes.has(digest)) contentHashes.set(digest, []);
    contentHashes.get(digest).push(`${result.slug}/${output.output}`);
  }
  for (const font of ['font-display-400.woff2', 'font-display-800.woff2', 'font-text-400.woff2', 'font-text-700.woff2']) {
    const file = path.join(assetsDir, font);
    check(`${result.slug} ${font}`, fs.existsSync(file) && fs.readFileSync(file).subarray(0, 4).toString('ascii') === 'wOF2', 'valid self-hosted WOFF2');
  }
  const shots = viewports.flatMap((name) => [path.join(shotsRoot, result.slug, `${name}-top.png`), path.join(shotsRoot, result.slug, `${name}.png`)]);
  check(`${result.slug} top and full-page viewport screenshots`, shots.every((file) => fs.existsSync(file) && fs.statSync(file).size > 10000), 'top-of-page and full-page evidence at 320 through 1440');
}

const duplicateBoards = [...boardHashes.values()].filter((items) => items.length > 1);
const duplicateContent = [...contentHashes.values()].filter((items) => items.length > 1);
check('20 unique business-specific boards', boardHashes.size === 20 && duplicateBoards.length === 0, `${boardHashes.size} unique board hashes; ${duplicateBoards.length} duplicates`);
check('240 unique content derivatives', contentHashes.size === 240 && duplicateContent.length === 0, `${contentHashes.size} unique image hashes; ${duplicateContent.length} duplicates`);

const audit = {
  schema: 1,
  runId,
  status: failures.length ? 'FAIL' : 'PASS',
  generatedAt: new Date().toISOString(),
  selectionBasis: 'Current untouched Prospect Radar queue after global prior-build exclusion and live source preflight. This receipt does not assert that any prospect was discovered on the run date.',
  counts: {
    businesses: summary.results.length,
    qaReady: summary.qaReadyCount,
    viewportScreenshots: summary.results.length * viewports.length * 2,
    siteSpecificImageBoards: boardHashes.size,
    contentImages: summary.results.length * 12,
    uniqueContentImageHashes: contentHashes.size,
  },
  boundaries: {
    mailReady: 'hold',
    generatedPeopleDisclosure: 'Illustrative industry representatives; not actual business staff or customers.',
    detector: detector.disposition,
  },
  checks,
  failures,
};
fs.writeFileSync(path.join(batchDir, 'FINAL-AUDIT.json'), `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(runDir, 'FINAL-AUDIT.json'), `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ status: audit.status, counts: audit.counts, checks: checks.length, failures }, null, 2));
process.exit(failures.length ? 1 : 0);
