#!/usr/bin/env node
/**
 * Restore the original Connected Industry Prototype Suite (dark plum, photography,
 * five-view illustrative 3D theater) to the existing unified review site.
 *
 * This is NOT the Next.js Modern Network restyle. Do not use
 * bridge-connected-publish.js for this restore — that script requires
 * /create /my-profile /explore and will refuse the original suite.
 *
 *   NETLIFY_AUTH_TOKEN=… node _os/automation/bin/bridge-connected-suite-restore.js <site-dir>
 *   node _os/automation/bin/bridge-connected-suite-restore.js <site-dir> --dry-run
 *
 * Source of the beautiful review package:
 *   dillonmohr8777/bridge-discovery-prototype-kimi-design → latest-signal-app/site
 *   (July 21, 2026 build completed against Tori's July 23 39:17 feedback)
 *
 * Site is pinned by exact name + hostname:
 *   bridge-connected-signal / https://bridge-connected-signal.netlify.app
 *
 * Never creates a site. Never binds an API origin. Never deploys Trusted Current
 * or the Next.js restyle. Also deploys `google-maps-loader` from
 * `latest-signal-app/netlify/functions/` via digest + function zip (SHA256,
 * runtime=js). Do not zip-deploy a `site/` folder — the zip API publishes the
 * zip root as static files and ignores netlify.toml publish. Purges CDN after
 * production ready.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { deployFiles, waitForDeploy, zipStoreSingleFile, api } = require('../lib/netlify');
const {
  SITE_NAME,
  EXPECTED_HOST,
  collectFiles,
  htmlTag,
  parseArgs,
  resolvePinnedSite,
  purgeSiteCache,
} = require('./bridge-connected-publish');

const MAPS_FUNCTION_NAME = 'google-maps-loader';
const MAPS_FUNCTION_FILE = `${MAPS_FUNCTION_NAME}.js`;

const REQUIRED_ROUTES = [
  '/index.html',
  '/community/index.html',
  '/studio/index.html',
  '/business/index.html',
  '/signal/index.html',
];

const REQUIRED_3D_ASSETS = [
  '/assets/bridge-midatlantic-3d-v1.webp',
  '/assets/bridge-state-maryland-3d-v1.webp',
  '/assets/bridge-state-massachusetts-3d-v1.webp',
  '/assets/bridge-state-new-jersey-3d-v1.webp',
  '/assets/bridge-state-virginia-3d-v1.webp',
  '/assets/bridge-network-night.webp',
];

const COMPAT_REDIRECTS = [
  '/create /studio 301',
  '/create/ /studio/ 301',
  '/my-profile /business 301',
  '/my-profile/ /business/ 301',
  '/explore /signal 301',
  '/explore/ /signal/ 301',
].join('\n') + '\n';

function attachCompatibilityRedirects(files) {
  files.set('/_redirects', Buffer.from(COMPAT_REDIRECTS, 'utf8'));
  return files;
}

function validateSuite(files) {
  const errors = [];
  if (process.env.NEXT_PUBLIC_BRIDGE_API_BASE) {
    errors.push('NEXT_PUBLIC_BRIDGE_API_BASE must stay unset');
  }
  for (const route of REQUIRED_ROUTES) {
    if (!files.has(route)) errors.push(`missing ${route}`);
  }
  for (const asset of REQUIRED_3D_ASSETS) {
    if (!files.has(asset)) errors.push(`missing 3D asset ${asset}`);
  }
  if (files.has('/create/index.html')) {
    errors.push('refusing Next.js restyle: /create/index.html is present');
  }
  if (files.has('/my-profile/index.html')) {
    errors.push('refusing Next.js restyle: /my-profile/index.html is present');
  }
  if (files.has('/explore/index.html')) {
    errors.push('refusing Next.js restyle: /explore/index.html is present');
  }

  const index = files.get('/index.html');
  if (!index) {
    errors.push('missing /index.html');
  } else {
    const html = index.toString('utf8');
    const tag = htmlTag(html);
    if (/data-theme="network"/.test(tag)) {
      errors.push('index.html is the Next.js network restyle, not the original suite');
    }
    if (/data-theme="current"/.test(tag)) {
      errors.push('index.html html tag is Trusted Current');
    }
    if (!/noindex/i.test(html)) errors.push('index.html missing noindex');
    if (!html.includes('Connected Industry Prototype Suite')) {
      errors.push('index.html missing Connected Industry Prototype Suite title');
    }
    if (html.includes('Modern Network')) {
      errors.push('index.html still mentions Modern Network');
    }
    if (html.includes('Trusted Current')) {
      errors.push('index.html still mentions Trusted Current');
    }
    if (!html.includes('/signal')) {
      errors.push('index.html missing /signal Explore entry');
    }
  }

  const signal = files.get('/signal/index.html');
  if (signal) {
    const html = signal.toString('utf8');
    if (!/noindex/i.test(html)) errors.push('signal/index.html missing noindex');
    if (!html.includes('pulse-live-map')) {
      errors.push('signal/index.html missing 3D map theater mount');
    }
    if (!html.includes('bridge-midatlantic-3d-v1.webp')) {
      errors.push('signal/index.html missing corridor 3D render');
    }
    for (const label of ['Virginia render', 'Maryland render', 'New Jersey render', 'Massachusetts render']) {
      if (!html.includes(label)) errors.push(`signal/index.html missing ${label}`);
    }
  }

  const css = files.get('/styles.css');
  if (!css) {
    errors.push('missing /styles.css');
  } else if (!css.toString('utf8').includes('--purple:')) {
    errors.push('styles.css missing --purple token');
  }

  const appJs = files.get('/app.js');
  if (!appJs) errors.push('missing /app.js');
  else if (!appJs.toString('utf8').includes('/.netlify/functions/google-maps-loader')) {
    errors.push('app.js missing Google Maps loader path');
  }
  const appV2 = files.get('/app-v2.js');
  if (appV2 && !appV2.toString('utf8').includes('/.netlify/functions/google-maps-loader')) {
    errors.push('app-v2.js missing Google Maps loader path');
  }

  if (errors.length) throw new Error(`refusing to restore: ${errors.join('; ')}`);
  return {
    files: files.size,
    html: [...files.keys()].filter((p) => /\.html?$/i.test(p)).length,
  };
}

function resolveMapsFunctionPath(siteDir) {
  const root = path.resolve(siteDir);
  const candidates = [
    path.join(root, '..', 'netlify', 'functions', MAPS_FUNCTION_FILE),
    path.join(root, 'netlify', 'functions', MAPS_FUNCTION_FILE),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  throw new Error(
    `missing ${MAPS_FUNCTION_FILE} (expected latest-signal-app/netlify/functions/${MAPS_FUNCTION_FILE})`,
  );
}

function validateMapsFunction(source) {
  const text = String(source);
  const errors = [];
  if (!text.includes('GOOGLE_MAPS_BROWSER_KEY')) {
    errors.push('maps function missing GOOGLE_MAPS_BROWSER_KEY lookup');
  }
  if (!text.includes('maps3d')) errors.push('maps function missing maps3d library');
  if (!text.includes('initBridgeSignal3DMap')) {
    errors.push('maps function missing initBridgeSignal3DMap callback');
  }
  if (errors.length) throw new Error(`refusing to restore: ${errors.join('; ')}`);
  return true;
}

function packageMapsFunction(source) {
  validateMapsFunction(source);
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-maps-fn-'));
  // zip-it-and-ship-it layout: handler as index.js inside the function zip.
  const jsPath = path.join(staging, 'index.js');
  const zipPath = path.join(staging, `${MAPS_FUNCTION_NAME}.zip`);
  fs.writeFileSync(jsPath, source);
  try {
    execFileSync('zip', ['-j', '-q', '-X', zipPath, jsPath], { stdio: 'pipe' });
    return fs.readFileSync(zipPath);
  } catch {
    return zipStoreSingleFile('index.js', source);
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

/** Env var names only. Never returns or logs values. */
async function listSiteEnvKeys(siteId) {
  const tok = process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_TOKEN;
  const site = await api(`/sites/${siteId}`, { tok });
  if (!site.ok || !site.body) {
    throw new Error(`listing env keys failed: site lookup ${site.status} ${site.raw || site.error || ''}`);
  }
  const accountId = site.body.account_id || site.body.account_slug;
  const tries = [`/sites/${siteId}/env`];
  if (accountId) tries.unshift(`/accounts/${accountId}/env?site_id=${encodeURIComponent(siteId)}`);
  let lastErr = 'no env endpoint';
  for (const pathname of tries) {
    const r = await api(pathname, { tok });
    if (!r.ok) {
      lastErr = `${pathname} ${r.status}`;
      continue;
    }
    const rows = Array.isArray(r.body) ? r.body : Array.isArray(r.body?.env) ? r.body.env : [];
    return rows.map((row) => row && row.key).filter(Boolean).sort();
  }
  throw new Error(`listing env keys failed: ${lastErr}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.dir) {
    console.log(
      'Usage: node _os/automation/bin/bridge-connected-suite-restore.js <latest-signal-app/site> [--dry-run]',
    );
    process.exit(args.help ? 0 : 1);
  }

  const files = attachCompatibilityRedirects(collectFiles(args.dir));
  const summary = validateSuite(files);
  const mapsPath = resolveMapsFunctionPath(args.dir);
  const mapsSource = fs.readFileSync(mapsPath);
  const mapsZip = packageMapsFunction(mapsSource);
  console.log(
    `validated original suite ${summary.files} files (${summary.html} html) plus ${MAPS_FUNCTION_NAME} for ${SITE_NAME} (${EXPECTED_HOST})`,
  );

  if (args.dryRun) {
    console.log('dry run: nothing published.');
    return;
  }

  const site = await resolvePinnedSite();
  console.log(`pinned site ${site.name} ${site.url}`);
  const sha = process.env.BRIDGE_SOURCE_SHA || 'local';
  const title = `Connected Industry Prototype Suite ${sha}`;
  let dep;
  try {
    // Digest deploy only. A zip of site/ + netlify.toml publishes the zip root
    // as static files, so `/` 404s and the suite lands under `/site/`.
    dep = await deployFiles(site.id, files, {
      title,
      draft: false,
      requireNoindex: true,
      functions: { [MAPS_FUNCTION_NAME]: mapsZip },
    });
    console.log(
      `deploy ${dep.deployId} uploaded ${dep.uploaded}/${dep.total} files, ${dep.functionsUploaded}/${dep.functionsTotal} functions`,
    );
  } catch (err) {
    console.log(`maps function deploy failed (${err.message}); restoring static suite at site root`);
    dep = await deployFiles(site.id, files, {
      title,
      draft: false,
      requireNoindex: true,
    });
    console.log(`deploy ${dep.deployId} uploaded ${dep.uploaded}/${dep.total} files`);
    const waitedFallback = await waitForDeploy(dep.deployId, { timeoutMs: 180000 });
    if (!waitedFallback.ok) {
      throw new Error(`static restore also failed: ${waitedFallback.state} ${waitedFallback.error || ''}`);
    }
    await purgeSiteCache(site);
    throw new Error(`static suite restored but maps function failed: ${err.message}`);
  }
  const waited = await waitForDeploy(dep.deployId, { timeoutMs: 180000 });
  if (!waited.ok) throw new Error(`deploy did not go live: ${waited.state} ${waited.error || ''}`);
  await purgeSiteCache(site);
  console.log(`purged CDN cache for ${EXPECTED_HOST}`);
  console.log(`live ${waited.url || site.url}`);
}

module.exports = {
  SITE_NAME,
  EXPECTED_HOST,
  REQUIRED_ROUTES,
  REQUIRED_3D_ASSETS,
  MAPS_FUNCTION_NAME,
  COMPAT_REDIRECTS,
  collectFiles,
  attachCompatibilityRedirects,
  validateSuite,
  resolveMapsFunctionPath,
  validateMapsFunction,
  packageMapsFunction,
  listSiteEnvKeys,
  htmlTag,
  parseArgs,
  resolvePinnedSite,
  purgeSiteCache,
};

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
