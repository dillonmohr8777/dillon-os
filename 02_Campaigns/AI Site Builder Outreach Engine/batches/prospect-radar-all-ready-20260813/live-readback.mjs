import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const valueAfter = flag => args.includes(flag) ? args[args.indexOf(flag) + 1] : '';
const releaseRoot = path.resolve(valueAfter('--release') || 'C:/Users/dillo/Documents/Codex/work/prospect-radar-all-245-20260813');
const baseUrl = (valueAfter('--url') || 'https://momentum-prospect-radar-next20-2026-08-11.netlify.app').replace(/\/$/, '');
const manifestPath = path.join(releaseRoot, 'ALL-BUSINESSES-MANIFEST.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const callable = manifest.records.filter(record => record.state === 'callable');
const aliases = manifest.records.filter(record => record.state === 'alias');
const exclusions = manifest.records.filter(record => record.state === 'excluded');
const digits = value => String(value || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');

async function pool(items, worker, concurrency = 12) {
  const results = new Array(items.length);
  let cursor = 0;
  async function consume() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, consume));
  return results;
}

const pages = await pool(callable, async record => {
  try {
    const response = await fetch(`${baseUrl}${record.route}`, { headers: { 'user-agent': 'Momentum360ReleaseQA/1.0' } });
    const html = await response.text();
    const phone = digits(record.phone);
    const telDigits = [...html.matchAll(/href=["']tel:([^"']+)/gi)].map(match => digits(match[1]));
    const assets = [...html.matchAll(/(?:src|href)=["']([^"'#?]+(?:\.(?:css|js|mjs|png|jpe?g|webp|avif|gif|svg|woff2?|mp4|webm)))["']/gi)]
      .map(match => new URL(match[1], `${baseUrl}${record.route}`).href)
      .filter(url => new URL(url).origin === new URL(baseUrl).origin);
    const checks = {
      status: response.status,
      canonicalUrl: response.url,
      noindexHeader: /noindex/i.test(response.headers.get('x-robots-tag') || ''),
      noindexMeta: /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) || /<meta\s+content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots/i.test(html),
      h1Count: (html.match(/<h1\b/gi) || []).length,
      contactSection: (html.match(/class=["'][^"']*m360-call-ready(?:\s|["'])/gi) || []).length >= 1,
      phoneMatch: telDigits.includes(phone),
      directionsLink: /href=["'][^"']*google\.com\/maps\/search/i.test(html),
      assets: [...new Set(assets)],
    };
    const reasons = [];
    if (checks.status !== 200) reasons.push(`HTTP_${checks.status}`);
    if (!checks.noindexHeader || !checks.noindexMeta) reasons.push('NOINDEX_MISSING');
    if (checks.h1Count !== 1) reasons.push(`H1_COUNT_${checks.h1Count}`);
    if (!checks.contactSection) reasons.push('CONTACT_LAYER_MISSING');
    if (!checks.phoneMatch) reasons.push('PHONE_MISMATCH');
    if (!checks.directionsLink) reasons.push('DIRECTIONS_MISSING');
    return { slug: record.slug, business: record.business, route: record.route, ...checks, reasons, pass: reasons.length === 0 };
  } catch (error) {
    return { slug: record.slug, business: record.business, route: record.route, reasons: [`FETCH_ERROR: ${error.message}`], assets: [], pass: false };
  }
});

const uniqueAssets = [...new Set(pages.flatMap(page => page.assets))];
const assets = await pool(uniqueAssets, async url => {
  try {
    const response = await fetch(url, { method: 'HEAD', headers: { 'user-agent': 'Momentum360ReleaseQA/1.0' } });
    return { url, status: response.status, pass: response.ok };
  } catch (error) {
    return { url, status: 0, error: error.message, pass: false };
  }
}, 16);

const redirects = await pool([...aliases, ...exclusions], async record => {
  const response = await fetch(`${baseUrl}${record.route}`, { redirect: 'manual', headers: { 'user-agent': 'Momentum360ReleaseQA/1.0' } });
  const expectedStatus = record.state === 'alias' ? 301 : 302;
  const expectedLocation = record.state === 'alias' ? `/sites/${record.aliasOf}/` : `/?excluded=${record.slug}`;
  const location = response.headers.get('location') || '';
  return { slug: record.slug, state: record.state, status: response.status, location, expectedStatus, expectedLocation, pass: response.status === expectedStatus && (location === expectedLocation || location === `${baseUrl}${expectedLocation}`) };
});

const hubResponse = await fetch(baseUrl, { headers: { 'user-agent': 'Momentum360ReleaseQA/1.0' } });
const hubHtml = await hubResponse.text();
const hub = {
  status: hubResponse.status,
  noindexHeader: /noindex/i.test(hubResponse.headers.get('x-robots-tag') || ''),
  noindexMeta: /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(hubHtml),
  cards: (hubHtml.match(/class=["']build["']/g) || []).length,
};
hub.pass = hub.status === 200 && hub.noindexHeader && hub.noindexMeta && hub.cards === callable.length;

const report = {
  schemaVersion: 1,
  verifiedAt: new Date().toISOString(),
  baseUrl,
  summary: {
    callableRoutes: pages.length,
    routePasses: pages.filter(page => page.pass).length,
    routeFailures: pages.filter(page => !page.pass).length,
    uniqueLocalAssets: assets.length,
    assetPasses: assets.filter(asset => asset.pass).length,
    assetFailures: assets.filter(asset => !asset.pass).length,
    redirectPasses: redirects.filter(redirect => redirect.pass).length,
    redirectFailures: redirects.filter(redirect => !redirect.pass).length,
    hubPass: hub.pass,
  },
  hub,
  redirects,
  failedAssets: assets.filter(asset => !asset.pass),
  pages,
};
report.ok = report.summary.routeFailures === 0 && report.summary.assetFailures === 0 && report.summary.redirectFailures === 0 && report.summary.hubPass;
fs.writeFileSync(path.join(releaseRoot, 'LIVE-READBACK.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (report.ok) {
  manifest.liveUrl = baseUrl;
  manifest.liveVerifiedAt = report.verifiedAt;
  manifest.liveReadbackStatus = 'passed';
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}
console.log(JSON.stringify({ ok: report.ok, ...report.summary }, null, 2));
process.exitCode = report.ok ? 0 : 1;
