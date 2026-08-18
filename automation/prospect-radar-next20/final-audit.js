#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const runId = process.argv[2];
if (!/^\d{8}-\d{6}$/.test(runId || '')) throw new Error('Run id must use yyyyMMdd-HHmmss.');
const runDir = path.join(__dirname, 'runs', runId);
const batchDir = path.join(root, '02_Campaigns', 'AI Site Builder Outreach Engine', 'batches', `radar-next20-${runId}`);
const shotsRoot = path.join(root, '_templates', 'site-factory', 'qa-shots');
const readJson = (file) => {
  const buffer = fs.readFileSync(file);
  const utf16le = buffer.length >= 2 && (
    (buffer[0] === 0xff && buffer[1] === 0xfe) ||
    (buffer[1] === 0x00 && buffer[3] === 0x00)
  );
  const text = buffer.toString(utf16le ? 'utf16le' : 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(text);
};
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const auditAlpha = (file) => {
  if (path.extname(file).toLowerCase() === '.svg') return { ok: true, vector: true };
  const result = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-i', file, '-vf', 'alphaextract,signalstats,metadata=print', '-frames:v', '1', '-f', 'null', 'NUL'],
    { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }
  );
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  const value = (key) => Number(output.match(new RegExp(`lavfi\\.signalstats\\.${key}=([\\d.]+)`))?.[1]);
  const alphaMin = value('YMIN');
  const alphaMax = value('YMAX');
  const alphaAverage = value('YAVG');
  const ok = result.status === 0 && Number.isFinite(alphaMin) && Number.isFinite(alphaMax) && Number.isFinite(alphaAverage) && alphaMax >= 200 && alphaMin <= 245 && alphaAverage >= 1 && alphaAverage <= 248;
  return { ok, alphaMin, alphaMax, alphaAverage };
};
const failures = [];
const checks = [];
const check = (name, condition, detail) => {
  checks.push({ name, pass: Boolean(condition), detail });
  if (!condition) failures.push(`${name}: ${detail}`);
};

const selection = readJson(path.join(batchDir, 'SELECTION-EVIDENCE.json'));
const sources = readJson(path.join(batchDir, 'SOURCE-STATUS.json'));
const summary = readJson(path.join(batchDir, 'batch-summary.json'));
const detector = readJson(path.join(runDir, 'IMPECCABLE-DETECTOR.json'));
const sourceByDomain = new Map(sources.selected.map((item) => [item.domain, item]));

check('exact selected count', selection.selection.length === 20, `${selection.selection.length}/20`);
check('global prior evidence scanned', selection.priorEvidence.filesScanned >= 1 && selection.priorEvidence.completedDomains >= 1, `${selection.priorEvidence.filesScanned} artifacts; ${selection.priorEvidence.completedDomains} prior domains`);
check('selected domains unique', new Set(selection.selection.map((item) => item.domain)).size === 20, 'domain uniqueness');
check('selected slugs unique', new Set(selection.selection.map((item) => item.slug)).size === 20, 'slug uniqueness');
check('source-ready count', sources.selected.length === 20, `${sources.selected.length}/20`);
check('all transparent logos', selection.selection.every((item) => item.logoTransparent === true), 'selection transparency flags');
check('browser QA summary', summary.ok === true && summary.qaReadyCount === 20 && summary.results.every((item) => item.qa === 'PASS' && item.visualQa === 'ran'), `${summary.qaReadyCount}/20 qa_ready`);
check('mail remains hold', summary.mailReadyAlwaysHold === true, 'batch summary mail boundary');

const allContentHashes = new Map();
const converted = [];
for (const item of selection.selection) {
  const siteDir = path.join(batchDir, 'sites', item.slug);
  const assetsDir = path.join(siteDir, 'assets');
  const htmlPath = path.join(siteDir, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const source = sourceByDomain.get(item.domain);
  const provenance = readJson(path.join(assetsDir, 'PROVENANCE.json'));
  const logoPath = path.join(assetsDir, item.logoFile);
  const logoAlpha = auditAlpha(logoPath);
  const headerLogo = html.match(/<img class="brand-logo"[^>]*src="assets\/([^"]+)"/)?.[1];
  const outroLogo = html.match(/<img class="ink-logo reveal"[^>]*src="assets\/([^"]+)"/)?.[1];
  if (source?.logo?.sourceFileName) converted.push(item.domain);

  check(`${item.slug} exact logo hash`, fs.existsSync(logoPath) && hash(logoPath) === item.logoSha256, item.logoSha256);
  check(`${item.slug} meaningful alpha`, logoAlpha.ok === true, JSON.stringify(logoAlpha));
  check(`${item.slug} same header/outro logo`, headerLogo === item.logoFile && outroLogo === item.logoFile, `${headerLogo} / ${outroLogo}`);
  check(`${item.slug} private noindex`, /<meta name="robots" content="noindex,nofollow">/.test(html), 'robots boundary');
  check(`${item.slug} no scroll lab`, !/(scroll[- ]lab|three\.js|webgl|prospect-3d-scroll)/i.test(html), 'static homepage only');
  check(`${item.slug} mobile logo finale`, html.includes('class="logo-outro surface-deep"') && html.includes('class="ink-logo reveal"'), 'ink finale markup');
  check(`${item.slug} detector palette fix`, !/#F4F0E5|#F3F2EA|#F6EEE5|#EEF3F1|#F2EFE9/i.test(html), 'no prior cream tokens');
  check(`${item.slug} detector font fix`, !/Fraunces|Instrument Sans/i.test(html), 'no blocked font pair');
  check(`${item.slug} detector tracking fix`, !/\.logo-outro p\{[^}]*letter-spacing:\.08em/.test(html), 'logo caption tracking');
  check(`${item.slug} detector elevation fix`, html.includes('.mobile-action{') && html.includes('border:0;') && html.includes('.glass-panel{'), 'base elevation utilities regenerated');
  check(`${item.slug} provenance`, provenance.assets.length === 13 && provenance.exactLogoSha256 === item.logoSha256, `${provenance.assets.length} assets`);

  const contentFiles = Array.from({ length: 12 }, (_, index) => path.join(assetsDir, `image-${index + 1}.webp`));
  check(`${item.slug} content image count`, contentFiles.every((file) => fs.existsSync(file)), '12/12 files');
  for (const file of contentFiles) {
    const digest = hash(file);
    if (!allContentHashes.has(digest)) allContentHashes.set(digest, []);
    allContentHashes.get(digest).push(path.relative(batchDir, file).replace(/\\/g, '/'));
  }
  for (const font of ['font-display-400.woff2', 'font-display-700.woff2', 'font-text-400.woff2', 'font-text-700.woff2']) {
    const file = path.join(assetsDir, font);
    check(`${item.slug} ${font}`, fs.existsSync(file) && fs.readFileSync(file).subarray(0, 4).toString('ascii') === 'wOF2', 'self-hosted WOFF2');
  }
  check(`${item.slug} no remote font dependency`, !/fonts\.(?:googleapis|gstatic)\.com/i.test(html), 'local font CSS');

  const shots = ['small-phone', 'phone', 'wide-phone', 'tablet', 'compact-desktop', 'desktop'].map((name) => path.join(shotsRoot, item.slug, `${name}.png`));
  check(`${item.slug} six-width screenshots`, shots.every((file) => fs.existsSync(file) && fs.statSync(file).size > 10000), '320 through 1440 evidence');
}

const duplicateContent = [...allContentHashes.entries()].filter(([, files]) => files.length > 1);
check('240 content visuals unique', allContentHashes.size === 240 && duplicateContent.length === 0, `${allContentHashes.size} unique hashes; ${duplicateContent.length} duplicates`);
const expectedConverted = selection.selection.filter((item) => item.logoTransformation && !item.logoTransformation.startsWith('none;')).length;
check('transparent conversion receipts match', converted.length === expectedConverted, `${converted.length}/${expectedConverted} flat-background conversions`);

const detectorCounts = Object.fromEntries([...new Set(detector.map((item) => item.antipattern))].map((pattern) => [pattern, detector.filter((item) => item.antipattern === pattern).length]));
check('single detector receipt retained', detector.length > 0 && fs.existsSync(path.join(runDir, 'IMPECCABLE-DETECTOR.json')), `${detector.length} original findings retained`);
check('detector mechanical fixes represented', detectorCounts['cream-palette'] > 0 && detectorCounts['overused-font'] > 0 && detectorCounts['wide-tracking'] > 0 && detectorCounts['gpt-thin-border-wide-shadow'] > 0, JSON.stringify(detectorCounts));

const result = {
  runId,
  status: failures.length ? 'FAIL' : 'PASS',
  generatedAt: new Date().toISOString(),
  detector: {
    passCount: 1,
    rerun: false,
    originalExitCode: 2,
    originalFindings: detector.length,
    counts: detectorCounts,
    disposition: 'Factory-level mechanical findings fixed, pages regenerated, and six-width browser confirmation repeated. Per workflow, detector was not rerun.',
  },
  selection: {
    count: selection.selection.length,
    priorArtifactsScanned: selection.priorEvidence.filesScanned,
    priorDomainsExcluded: selection.priorEvidence.completedDomains,
    sourceReadyPool: selection.sourceReadyBeforeDiversity,
    nativeTransparentLogos: 20 - converted.length,
    flatBackgroundRemoved: converted.length,
  },
  build: {
    qaReady: summary.qaReadyCount,
    mailReady: 'hold',
    contentVisuals: 240,
    uniqueContentVisualHashes: allContentHashes.size,
    deployment: 'none; local private noindex batch',
  },
  checks,
  failures,
};
fs.writeFileSync(path.join(batchDir, 'FINAL-AUDIT.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(runDir, 'FINAL-AUDIT.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ status: result.status, checks: checks.length, failures, selection: result.selection, build: result.build }, null, 2));
if (failures.length) process.exit(1);
