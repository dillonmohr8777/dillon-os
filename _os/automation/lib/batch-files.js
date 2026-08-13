'use strict';

/**
 * Collect the public preview files for a site-factory batch.
 *
 * One Netlify site, one hub URL, one path per prospect:
 *   /index.html
 *   /sites/<slug>/index.html
 *   /sites/<slug>/assets/<image>
 *
 * CSV, briefs, harvest, and helper scripts stay off the public drop — they
 * carry phones and working notes that do not belong on a preview hostname.
 */

const fs = require('fs');
const path = require('path');

const ASSET_RE = /\.(webp|png|jpe?g|svg|gif|ico)$/i;
const ROBOTS_HEADERS = '/*\n  X-Robots-Tag: noindex, nofollow\n';

function collectBatchFiles(batchDir) {
  const root = path.resolve(batchDir);
  const hub = path.join(root, 'index.html');
  if (!fs.existsSync(hub)) throw new Error(`missing hub index.html in ${root}`);

  const files = new Map();
  files.set('/index.html', fs.readFileSync(hub));
  files.set('/_headers', Buffer.from(ROBOTS_HEADERS, 'utf8'));

  const sitesDir = path.join(root, 'sites');
  if (!fs.existsSync(sitesDir)) throw new Error(`missing sites/ in ${root}`);

  const slugs = fs
    .readdirSync(sitesDir, { withFileTypes: true })
    .filter((ent) => ent.isDirectory())
    .map((ent) => ent.name)
    .sort();

  if (!slugs.length) throw new Error(`no site folders under ${sitesDir}`);

  for (const slug of slugs) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error(`refusing to deploy: invalid slug "${slug}"`);
    }
    const html = path.join(sitesDir, slug, 'index.html');
    if (!fs.existsSync(html)) throw new Error(`missing ${slug}/index.html`);
    files.set(`/sites/${slug}/index.html`, fs.readFileSync(html));

    const assetsDir = path.join(sitesDir, slug, 'assets');
    if (!fs.existsSync(assetsDir)) continue;
    for (const name of fs.readdirSync(assetsDir)) {
      if (!ASSET_RE.test(name)) continue;
      files.set(`/sites/${slug}/assets/${name}`, fs.readFileSync(path.join(assetsDir, name)));
    }
  }

  return { files, slugs };
}

function siteNameFromBatch(batch) {
  const raw = String((batch && batch.deployBaseUrl) || '').trim();
  if (!raw) return '';
  try {
    const host = new URL(raw).hostname.toLowerCase();
    const m = host.match(/^([a-z0-9-]+)\.netlify\.app$/);
    return m ? m[1] : '';
  } catch {
    return '';
  }
}

module.exports = { collectBatchFiles, siteNameFromBatch, ROBOTS_HEADERS, ASSET_RE };
