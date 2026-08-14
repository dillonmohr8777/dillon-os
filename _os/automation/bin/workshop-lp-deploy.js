#!/usr/bin/env node
/**
 * Overlay the Growth Workshop LP patch onto the live Netlify site and publish.
 *
 * Mirrors the current production file set first, then replaces index.html,
 * script.js, and momentum-workshops.ics. Never creates a site. Never deploys a
 * three-file drop that would delete styles/assets.
 *
 *   NETLIFY_AUTH_TOKEN=… node _os/automation/bin/workshop-lp-deploy.js
 *   node _os/automation/bin/workshop-lp-deploy.js --dry-run
 *
 * Site is pinned by exact name: momentum-workshop-pilot
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { repoPath } = require('../lib/fsutil');
const { httpGet } = require('../lib/net');
const { api, deployFiles, waitForDeploy } = require('../lib/netlify');

const SITE_NAME = 'momentum-workshop-pilot';
const LIVE_ORIGIN = 'https://momentum-workshop-pilot.netlify.app';
const PATCH_DIR = repoPath('02_Campaigns/Growth Workshop/lp-date-push');
const PATCH_FILES = ['index.html', 'script.js', 'momentum-workshops.ics'];

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

async function findExistingSite(name) {
  const list = await api(`/sites?per_page=100&filter=all&name=${encodeURIComponent(name)}`);
  if (!list.ok) {
    throw new Error(`listing Netlify sites failed: ${list.status} ${list.raw || list.error || ''}`);
  }
  const sites = Array.isArray(list.body) ? list.body : [];
  const found = sites.find((s) => s.name === name);
  if (!found) {
    throw new Error(
      `Refusing to deploy: no existing Netlify site named "${name}". Will not create one.`,
    );
  }
  return {
    id: found.id,
    name: found.name,
    url: found.ssl_url || found.url,
  };
}

function pathsFromMarkup(text) {
  const found = new Set();
  const re = /(?:src|href)=['"]([^'"]+)['"]|url\((['"]?)([^'")]+)\2\)/gi;
  let match;
  while ((match = re.exec(text))) {
    const raw = match[1] || match[3] || '';
    if (!raw || raw.startsWith('#') || raw.startsWith('data:') || raw.startsWith('mailto:')) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw) && !raw.startsWith(LIVE_ORIGIN)) continue;
    let rel = raw.startsWith(LIVE_ORIGIN) ? raw.slice(LIVE_ORIGIN.length) : raw;
    rel = rel.split('?')[0].split('#')[0];
    if (rel.startsWith('/')) rel = rel.slice(1);
    if (!rel || rel.startsWith('//') || rel.includes('..') || rel.startsWith('%')) continue;
    if (!/\.(html|js|css|ics|txt|svg|png|jpe?g|webp|woff2?|ico)$/i.test(rel)) continue;
    found.add(rel);
  }
  return [...found];
}

async function fetchLive(rel) {
  const url = `${LIVE_ORIGIN}/${rel.replace(/^\//, '')}`;
  const res = await httpGet(url, { encoding: null, maxBytes: 8_000_000, timeoutMs: 30000 });
  if (!res.ok || res.status !== 200) {
    throw new Error(`live fetch ${rel} failed: ${res.status || ''} ${res.error || ''}`.trim());
  }
  return Buffer.isBuffer(res.body) ? res.body : Buffer.from(String(res.body));
}

async function assembleFiles() {
  const files = new Map();
  const extras = ['robots.txt', 'styles.css', 'momentum-workshops.ics'];
  const html = fs.readFileSync(path.join(PATCH_DIR, 'index.html'), 'utf8');
  const cssLive = await fetchLive('styles.css');
  const wanted = new Set([
    ...extras,
    ...pathsFromMarkup(html),
    ...pathsFromMarkup(cssLive.toString('utf8')),
  ]);

  for (const rel of wanted) {
    if (PATCH_FILES.includes(rel)) continue;
    try {
      files.set(`/${rel}`, await fetchLive(rel));
    } catch (err) {
      if (rel === 'robots.txt') continue;
      throw err;
    }
  }

  for (const name of PATCH_FILES) {
    const buf = fs.readFileSync(path.join(PATCH_DIR, name));
    files.set(`/${name}`, buf);
  }
  return files;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('/**')[1].replace(/^\s*\* ?/gm, ''));
    process.exit(0);
  }

  const files = await assembleFiles();
  const names = [...files.keys()].sort();
  const html = files.get('/index.html').toString('utf8');
  const ics = files.get('/momentum-workshops.ics').toString('utf8');
  const js = files.get('/script.js').toString('utf8');

  if (!html.includes('momentum-workshop-event-v5') && !js.includes('momentum-workshop-event-v5')) {
    throw new Error('patch check failed: script.js is not v5');
  }
  if (!js.includes('https://meet.google.com/ive-hkws-xdg')) {
    throw new Error('patch check failed: Meet URL missing from script.js');
  }
  if (!ics.includes('DTSTART;TZID=America/New_York:20260827T120000')) {
    throw new Error('patch check failed: ICS is not the Aug 27 event');
  }
  if (!files.has('/styles.css') || !files.has('/assets/momentum-360-logo.png')) {
    throw new Error('refusing to deploy: live styles/assets were not mirrored');
  }

  console.log(`assembled ${files.size} files for ${SITE_NAME}`);
  console.log(names.join('\n'));

  if (args.dryRun) {
    console.log('dry run: nothing published.');
    return;
  }

  const site = await findExistingSite(SITE_NAME);
  console.log(`pinned site ${site.name} (${site.id}) ${site.url}`);
  const dep = await deployFiles(site.id, files, {
    title: 'Growth Workshop LP Aug 27 + calendar auto-add',
    draft: false,
    requireNoindex: false,
  });
  console.log(
    `deploy ${dep.deployId} uploaded ${dep.uploaded}/${dep.total} (already held ${dep.alreadyHeld})`,
  );
  const waited = await waitForDeploy(dep.deployId);
  if (!waited.ok) throw new Error(`deploy did not go live: ${waited.state} ${waited.error || ''}`);
  console.log(`live ${waited.url || site.url}`);
}

module.exports = { SITE_NAME, PATCH_FILES, pathsFromMarkup, assembleFiles, findExistingSite };

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
