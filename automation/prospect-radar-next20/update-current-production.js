#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..', '..');
const runId = process.argv[2];
const releaseDir = path.resolve(String(process.argv[3] || ''));
if (!/^\d{8}-\d{6}$/.test(runId || '') || !releaseDir) {
  throw new Error('Usage: update-current-production.js <yyyyMMdd-HHmmss> <verified-release-directory>');
}

const pointerPath = path.join(__dirname, 'CURRENT-PRODUCTION.json');
const runDir = path.join(__dirname, 'runs', runId);
const batchDir = path.join(root, '02_Campaigns', 'AI Site Builder Outreach Engine', 'batches', `radar-next20-${runId}`);
const releaseManifestPath = path.join(releaseDir, 'RELEASE-MANIFEST.json');
const liveQaPath = path.join(runDir, 'netlify-live-qa', 'NETLIFY-RELEASE-QA.json');
const deployPath = path.join(runDir, 'NETLIFY-DEPLOY-RECEIPT.json');
const finalAuditPath = path.join(batchDir, 'FINAL-AUDIT.json');
for (const file of [pointerPath, path.join(releaseDir, 'index.html'), releaseManifestPath, liveQaPath, deployPath, finalAuditPath]) {
  if (!fs.existsSync(file)) throw new Error(`Required release evidence is missing: ${file}`);
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const atomicJson = (file, value) => {
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, file);
};

const current = readJson(pointerPath);
const manifest = readJson(releaseManifestPath);
const liveQa = readJson(liveQaPath);
const deploy = readJson(deployPath);
const audit = readJson(finalAuditPath);
const releaseHash = sha256(path.join(releaseDir, 'index.html'));
const exactSiteId = '3cf338d4-6813-4712-a6dc-d27e8778cae9';
const exactSiteName = 'momentum-prospect-radar-next20-2026-08-11';
const expectedIndexedBusinesses = Number(current.indexed_businesses) + 20;
const expectedRouteDirectories = Number(current.route_directories) + 20;

const verifiedRoutes = liveQa.routes || [];
const verifiedPages = liveQa.pages || [];
if (
  current.site?.id !== exactSiteId || current.site?.name !== exactSiteName ||
  manifest.targetSite?.id !== exactSiteId || manifest.targetSite?.name !== exactSiteName ||
  deploy.site_id !== exactSiteId || deploy.site_name !== exactSiteName ||
  audit.status !== 'PASS' || audit.counts?.businesses !== 20 || audit.counts?.qaReady !== 20 ||
  manifest.release?.indexedBusinesses !== expectedIndexedBusinesses ||
  manifest.release?.routeDirectories !== expectedRouteDirectories ||
  manifest.release?.indexSha256 !== releaseHash ||
  liveQa.status !== 'PASS' || liveQa.expectedRootCount !== expectedIndexedBusinesses || liveQa.root?.siteLinks?.length !== expectedIndexedBusinesses ||
  verifiedRoutes.length !== 20 || verifiedPages.length !== 20 ||
  !verifiedRoutes.every((entry) => entry.status === 200 && entry.noindex && entry.heroStatus === 200 && entry.provenanceStatus === 200 && entry.provenanceOutputs === 12 && entry.assetFailures?.length === 0) ||
  !verifiedPages.every((entry) => entry.status === 200 && entry.overflow <= 0 && entry.robots.includes('noindex') && entry.heroLoaded && entry.disclosure)
) {
  throw new Error('Refusing to advance CURRENT-PRODUCTION.json: release, live, audit, or exact-target gate did not pass.');
}

const next = {
  site: current.site,
  deploy_id: deploy.deploy_id,
  deploy_url: deploy.deploy_url,
  indexed_businesses: manifest.release.indexedBusinesses,
  route_directories: manifest.release.routeDirectories,
  local_snapshot: releaseDir,
  index_sha256: releaseHash,
  live_verified: true,
  live_verified_at: liveQa.verifiedAt,
  live_qa_receipt: path.relative(root, liveQaPath).replace(/\\/g, '/'),
  deployment_receipt: path.relative(root, deployPath).replace(/\\/g, '/'),
  release_manifest: releaseManifestPath,
  mail_ready: 'hold',
};
atomicJson(pointerPath, next);
const updateReceipt = {
  schema: 1,
  runId,
  updatedAt: new Date().toISOString(),
  status: 'PASS',
  previous: { deploy_id: current.deploy_id, indexed_businesses: current.indexed_businesses, index_sha256: current.index_sha256 },
  current: next,
};
atomicJson(path.join(runDir, 'CURRENT-PRODUCTION-UPDATE.json'), updateReceipt);
console.log(JSON.stringify(updateReceipt, null, 2));
