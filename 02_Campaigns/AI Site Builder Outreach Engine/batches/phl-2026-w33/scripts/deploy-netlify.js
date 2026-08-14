#!/usr/bin/env node
/**
 * Deploy the week-33 hub + 25 noindex demos to the pinned Netlify site.
 * Requires NETLIFY_AUTH_TOKEN. Pins site name phl-2026-w33.
 */
const fs = require('fs');
const path = require('path');
const { ensureSite, deployFiles, waitForDeploy } = require('/workspace/_os/automation/lib/netlify.js');

const BATCH = path.join(__dirname, '..');
const SITE_NAME = 'phl-2026-w33';

function walk(dir, prefix = '') {
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name === 'refs' || name === 'scripts' || name === 'briefs') continue;
    const full = path.join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      for (const [k, v] of walk(full, rel)) out.set(k, v);
    } else if (/\.(html|css|js|png|jpg|jpeg|webp|svg|json|csv|md|txt|ico)$/i.test(name)) {
      if (name === 'PROVENANCE.json') continue;
      out.set('/' + rel.replace(/\\/g, '/'), fs.readFileSync(full));
    }
  }
  return out;
}

(async () => {
  const files = walk(BATCH);
  console.log('files', files.size);
  const site = await ensureSite(SITE_NAME);
  console.log('site', site.id, site.url, site.created ? 'created' : 'existing');
  const dep = await deployFiles(site.id, files, {
    title: 'phl-2026-w33 forward-facing wow layouts',
    draft: false,
    requireNoindex: true,
  });
  console.log('uploaded', dep.uploaded, 'held', dep.alreadyHeld, 'deploy', dep.deployUrl);
  const wait = await waitForDeploy(dep.deployId);
  console.log(JSON.stringify({ site: site.url, deploy: wait }, null, 2));
  if (!wait.ok) process.exit(1);
})().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
