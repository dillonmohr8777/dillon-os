import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const cli = Object.fromEntries(process.argv.slice(2).map((part, index, all) => {
  if (!part.startsWith('--')) return null;
  const [key, inline] = part.slice(2).split('=', 2);
  return [key, inline ?? all[index + 1]];
}).filter(Boolean));

const releaseRoot = path.resolve(cli.release || 'C:/Users/dillo/Documents/Codex/work/prospect-radar-all-245-20260813');
const buildRoot = path.resolve(cli.build || path.join(scriptRoot, '.release-build'));
const telegramAssets = path.resolve(cli.telegramAssets || 'C:/Users/dillo/Documents/Codex/work/prospect-radar-ready-80-20260812/dist/assets');
const dist = path.join(releaseRoot, 'dist');
const sitesRoot = path.join(dist, 'sites');

for (const required of [releaseRoot, dist, sitesRoot, buildRoot]) {
  if (!fs.existsSync(required)) throw new Error(`Required path is missing: ${required}`);
}

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeText = (file, value) => fs.writeFileSync(file, value, { encoding: 'utf8' });
const sourceManifest = readJson(path.join(releaseRoot, 'ALL-BUSINESSES-MANIFEST.json'));
const coverage = readJson(path.join(releaseRoot, 'CONTACT-COVERAGE.json'));
const officialFetch = readJson(path.join(releaseRoot, 'OFFICIAL-CONTACT-FETCH.json'));
const policy = readJson(path.join(scriptRoot, 'contact-policy.json'));

const squash = value => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/&/g, ' and ')
  .replace(/\b(incorporated|inc|llc|ltd|company|co|corporation|corp)\b/g, ' ')
  .replace(/[^a-z0-9]+/gi, ' ')
  .trim()
  .toLowerCase();
const digits = value => String(value || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
const formatPhone = value => {
  const number = digits(value);
  return number.length === 10 ? `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}` : '';
};
const escapeHtml = value => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');
const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
const validUrl = value => /^https?:\/\//i.test(String(value || ''));
const normalizedUrl = value => validUrl(value) ? String(value).trim() : '';

const coverageBySlug = new Map(coverage.records.map(record => [record.slug, record]));
const officialBySlug = new Map(officialFetch.results.map(record => [record.slug, record]));

const records = sourceManifest.records.map(source => {
  const aliasOf = policy.aliases[source.slug] || '';
  const excluded = policy.exclusions[source.slug] || null;
  const base = coverageBySlug.get(source.slug) || {};
  const override = policy.overrides[source.slug] || {};
  const acceptedPhone = policy.acceptedOfficialFetch[source.slug] || '';
  const official = officialBySlug.get(source.slug) || {};
  const state = aliasOf ? 'alias' : excluded ? 'excluded' : 'callable';
  const business = override.business || source.business;
  const phone = state === 'callable' ? formatPhone(override.phone || acceptedPhone || base.phone || base.existingTel) : '';
  const address = override.address || base.address || '';
  const sourceUrl = normalizedUrl(override.sourceUrl)
    || (acceptedPhone ? normalizedUrl(official.selectedEvidenceUrl || official.sourceUrl) : '')
    || normalizedUrl(base.sourceUrl);
  const verification = override.verification
    || (acceptedPhone ? 'Official business source fetched and matched' : base.phoneVerification)
    || (base.existingTel ? 'Existing official site contact' : '');
  const verifiedAt = override.phone || acceptedPhone ? policy.verifiedAt : (base.verifiedAt || policy.verifiedAt);
  return {
    ...source,
    business,
    originalBusiness: source.business,
    state,
    aliasOf,
    exclusionReason: excluded?.reason || '',
    exclusionEvidenceUrl: excluded?.evidenceUrl || '',
    phone,
    phoneDigits: digits(phone),
    address,
    category: base.category || '',
    publicEmail: base.publicEmail || '',
    sourceUrl,
    verification,
    verifiedAt,
    qaStatus: state === 'callable' ? 'Pending full QA' : state === 'alias' ? 'Redirect to canonical site' : 'Excluded from calling',
  };
});

const callable = records.filter(record => record.state === 'callable');
const aliases = records.filter(record => record.state === 'alias');
const exclusions = records.filter(record => record.state === 'excluded');
if (records.length !== 245) throw new Error(`Expected 245 routes, received ${records.length}`);
if (callable.length !== 238 || aliases.length !== 5 || exclusions.length !== 2) {
  throw new Error(`Unexpected organization: ${callable.length} callable, ${aliases.length} aliases, ${exclusions.length} exclusions`);
}
const missingPhones = callable.filter(record => record.phoneDigits.length !== 10);
if (missingPhones.length) throw new Error(`Callable rows missing valid phones: ${missingPhones.map(row => row.slug).join(', ')}`);
for (const alias of aliases) {
  if (!records.some(record => record.slug === alias.aliasOf && record.state === 'callable')) {
    throw new Error(`Alias ${alias.slug} points to missing canonical route ${alias.aliasOf}`);
  }
}

function copyAssets(source, destination) {
  if (!fs.existsSync(source)) throw new Error(`Asset source is missing: ${source}`);
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copyAssets(from, to);
    } else if (fs.existsSync(to)) {
      const existing = fs.readFileSync(to);
      const incoming = fs.readFileSync(from);
      if (!existing.equals(incoming)) throw new Error(`Asset collision with different content: ${to}`);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

copyAssets(telegramAssets, path.join(dist, 'assets'));
for (const packageName of ['next10', 'trio']) {
  const builtDist = path.join(buildRoot, packageName, 'dist');
  const namespacedAssets = path.join(dist, 'assets', packageName);
  if (!path.resolve(namespacedAssets).startsWith(path.resolve(path.join(dist, 'assets')))) {
    throw new Error(`Unsafe generated asset target: ${namespacedAssets}`);
  }
  fs.rmSync(namespacedAssets, { recursive: true, force: true });
  copyAssets(path.join(builtDist, 'assets'), namespacedAssets);
  const builtSites = path.join(builtDist, 'sites');
  for (const slug of fs.readdirSync(builtSites)) {
    const from = path.join(builtSites, slug);
    const to = path.join(sitesRoot, slug);
    fs.cpSync(from, to, { recursive: true, force: true });
    const htmlFile = path.join(to, 'index.html');
    const html = fs.readFileSync(htmlFile, 'utf8').replaceAll('/assets/', `/assets/${packageName}/`);
    writeText(htmlFile, html);
  }
  for (const assetFile of fs.readdirSync(namespacedAssets, { recursive: true })) {
    const fullPath = path.join(namespacedAssets, assetFile);
    if (!fs.statSync(fullPath).isFile() || !/\.(?:css|js|mjs)$/i.test(fullPath)) continue;
    const contents = fs.readFileSync(fullPath, 'utf8').replaceAll('/assets/', `/assets/${packageName}/`);
    writeText(fullPath, contents);
  }
}

const style = `
<style id="momentum-call-ready-hardening">
  html,body{max-width:100%;overflow-x:clip}
  *,*::before,*::after{box-sizing:border-box}
  img,video,canvas,svg,iframe{max-width:100%}
  h1,h2,h3,h4,p,a,button{overflow-wrap:anywhere}
  button,input,select,textarea,[role="button"],a.button,.button,.mobile-action a,.site-header nav a,header nav a{min-width:44px;min-height:44px}
  .m360-call-ready{position:relative;isolation:isolate;padding:clamp(2.5rem,7vw,6rem) clamp(1rem,5vw,4rem);background:#0a0d12;color:#f7f8fb;border-top:1px solid rgba(255,255,255,.16);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
  .m360-call-ready__inner{width:min(1120px,100%);margin-inline:auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.92fr);gap:clamp(1.5rem,5vw,4rem);align-items:start}
  .m360-call-ready__eyebrow{margin:0 0 .75rem;color:#b6f36d;font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
  .m360-call-ready h2{margin:0 0 1rem;color:#fff;font-size:clamp(2rem,5vw,4.4rem);line-height:1;letter-spacing:-.04em}
  .m360-call-ready p{max-width:62ch;color:#c6cbd5;line-height:1.65}
  .m360-call-ready__actions{display:flex;flex-wrap:wrap;gap:.75rem;margin:1.5rem 0}
  .m360-call-ready__actions a{display:inline-flex;min-height:48px;align-items:center;justify-content:center;padding:.75rem 1rem;border:1px solid #b6f36d;border-radius:.55rem;background:#b6f36d;color:#10140c;font-weight:800;text-decoration:none}
  .m360-call-ready__actions a+ a{background:transparent;color:#f7f8fb}
  .m360-call-ready__source{font-size:.84rem}
  .m360-call-ready__map{width:100%;height:clamp(280px,38vw,410px);border:0;border-radius:.8rem;background:#171c24}
  @media(max-width:740px){.m360-call-ready__inner{grid-template-columns:1fr}.m360-call-ready{padding-inline:1rem}}
  @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
</style>`;

const phonePattern = /(?<!\d)(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?!\d)/g;
const markerPattern = /<!-- MOMENTUM_CALL_READY_START -->[\s\S]*?<!-- MOMENTUM_CALL_READY_END -->/g;

function replaceIdentity(html, from, to) {
  if (!from || !to || from === to) return html;
  const variants = new Set([
    from,
    from.replace(/&/g, '&amp;'),
    from.replace(/'/g, '&#39;'),
    escapeHtml(from),
  ]);
  for (const variant of variants) html = html.split(variant).join(variant.includes('&') ? escapeHtml(to) : to);
  return html;
}

function contactSection(record) {
  const mapQuery = record.address || `${record.business} current location`;
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  const map = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  const source = record.sourceUrl
    ? `<a href="${escapeHtml(record.sourceUrl)}" rel="noopener noreferrer">Review contact source</a>`
    : 'Verified prospect record';
  const location = record.address
    ? `<p><strong>Location:</strong> ${escapeHtml(record.address)}</p>`
    : '<p><strong>Location:</strong> Use the directions link to confirm the current business location before visiting.</p>';
  return `<!-- MOMENTUM_CALL_READY_START -->
<section class="m360-call-ready" aria-labelledby="m360-contact-heading">
  <div class="m360-call-ready__inner">
    <div>
      <p class="m360-call-ready__eyebrow">Current business contact</p>
      <h2 id="m360-contact-heading">Contact ${escapeHtml(record.business)}</h2>
      <p>This private concept is prepared for a direct business review. The phone and location path below were checked against the prospect record before this release. Call first to confirm current hours, availability, and any visit details. The page is a Momentum 360 website preview and is not represented as the business's published website.</p>
      <div class="m360-call-ready__actions">
        <a href="tel:+1${record.phoneDigits}" aria-label="Call ${escapeHtml(record.business)} at ${escapeHtml(record.phone)}">Call ${escapeHtml(record.phone)}</a>
        <a href="${directions}" rel="noopener noreferrer">Get directions</a>
      </div>
      ${location}
      <p class="m360-call-ready__source">Contact status checked ${escapeHtml(record.verifiedAt)}. ${source}</p>
    </div>
    <iframe class="m360-call-ready__map" src="${map}" title="Map for ${escapeHtml(record.business)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
  </div>
</section>
<!-- MOMENTUM_CALL_READY_END -->`;
}

for (const record of callable) {
  const htmlPath = path.join(sitesRoot, record.slug, 'index.html');
  if (!fs.existsSync(htmlPath)) throw new Error(`Missing callable site: ${htmlPath}`);
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = replaceIdentity(html, record.originalBusiness, record.business);
  html = html.replace(markerPattern, '');
  html = html.replace(/<style id="momentum-call-ready-hardening">[\s\S]*?<\/style>/g, '');
  html = html.replace(/href=(['"])tel:[^'">]+\1/gi, `href="tel:+1${record.phoneDigits}"`);
  html = html.replace(phonePattern, record.phone);
  html = html.replace(/<button\b(?![^>]*(?:aria-label|aria-labelledby|title)=)/gi, '<button aria-label="Site control"');
  html = html.replace(/<input\b(?![^>]*(?:aria-label|aria-labelledby|title|placeholder)=)/gi, '<input aria-label="Site input"');
  html = html.replace(/<select\b(?![^>]*(?:aria-label|aria-labelledby|title)=)/gi, '<select aria-label="Site selection"');
  html = html.replace(/<textarea\b(?![^>]*(?:aria-label|aria-labelledby|title|placeholder)=)/gi, '<textarea aria-label="Site details"');
  if (!/<meta\s+name=["']robots["']/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, '<head$1>\n<meta name="robots" content="noindex,nofollow,noarchive">');
  } else {
    html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,nofollow,noarchive">');
  }
  html = html.replace(/<\/head>/i, `${style}\n</head>`);
  const section = contactSection(record);
  if (/<\/main>/i.test(html)) html = html.replace(/<\/main>/i, `${section}\n</main>`);
  else if (/<footer\b/i.test(html)) html = html.replace(/<footer\b/i, `${section}\n<footer`);
  else html = html.replace(/<\/body>/i, `${section}\n</body>`);
  writeText(htmlPath, html);
}

const redirects = [
  ...aliases.flatMap(record => [
    `/sites/${record.slug} /sites/${record.aliasOf}/ 301!`,
    `/sites/${record.slug}/* /sites/${record.aliasOf}/:splat 301!`,
  ]),
  ...exclusions.flatMap(record => [
    `/sites/${record.slug} /?excluded=${record.slug} 302!`,
    `/sites/${record.slug}/* /?excluded=${record.slug} 302!`,
  ]),
];
writeText(path.join(dist, '_redirects'), `${redirects.join('\n')}\n`);

const cards = callable.map((record, index) => `<a class="build" href="${record.route}" data-search="${escapeHtml(`${record.business} ${record.slug} ${record.currentBatch}`.toLowerCase())}">
  <span>${String(index + 1).padStart(3, '0')}</span>
  <strong>${escapeHtml(record.business)}</strong>
  <small>${escapeHtml(record.phone)}${record.category ? ` · ${escapeHtml(record.category)}` : ''}</small>
  <em>Call ready · desktop, tablet, mobile QA pending</em>
</a>`).join('\n');

const hub = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>Momentum Prospect Radar | 238 Call Ready Businesses</title>
  <style>
    :root{color-scheme:dark;--bg:#080a0e;--panel:#11151c;--ink:#f4f6fb;--muted:#aeb6c5;--accent:#b6f36d;--line:#2b3340}*{box-sizing:border-box}html,body{max-width:100%;overflow-x:clip}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}header{padding:clamp(32px,6vw,80px);border-bottom:1px solid var(--line)}h1{max-width:15ch;margin:0;font-size:clamp(2.6rem,7vw,6.2rem);line-height:.95;letter-spacing:-.04em;overflow-wrap:anywhere}header p{max-width:68ch;color:var(--muted)}.metrics{display:flex;flex-wrap:wrap;gap:10px;margin:24px 0}.metric{padding:10px 14px;border:1px solid var(--line);border-radius:999px;color:var(--muted)}.metric strong{color:var(--ink)}.controls{display:flex;gap:12px;align-items:center;flex-wrap:wrap}input{min-height:48px;width:min(560px,100%);padding:0 16px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--ink)}main{padding:clamp(20px,5vw,72px)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}.build{display:flex;min-height:220px;min-width:44px;flex-direction:column;padding:22px;border:1px solid var(--line);border-radius:14px;background:var(--panel);color:inherit;text-decoration:none}.build[hidden]{display:none}.build span,.build small,.build em{color:var(--muted)}.build strong{margin:28px 0 8px;font-size:1.35rem;line-height:1.15}.build em{margin-top:auto;font-style:normal}.build:hover,.build:focus-visible{border-color:var(--accent);outline:2px solid transparent}.build:hover em,.build:focus-visible em{color:var(--accent)}footer{padding:28px clamp(20px,5vw,72px);border-top:1px solid var(--line);color:var(--muted)}@media(max-width:600px){header,main{padding-inline:18px}.grid{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
  </style>
</head>
<body>
  <header>
    <p>Momentum 360 · private sales review</p>
    <h1>Every real business, ready for the call.</h1>
    <p>One organized inventory for Jesse. Duplicate URLs resolve to their canonical sites and invalid or closed prospects are excluded from the call list.</p>
    <div class="metrics"><span class="metric"><strong>238</strong> callable businesses</span><span class="metric"><strong>5</strong> clean aliases</span><span class="metric"><strong>2</strong> exclusions</span><span class="metric"><strong>245</strong> total routes</span></div>
    <div class="controls"><input id="search" type="search" placeholder="Search business, phone, or batch" aria-label="Search businesses"><strong><span id="visible">238</span> visible</strong></div>
  </header>
  <main><div class="grid">${cards}</div></main>
  <footer>Private noindex concept sites prepared for direct business review.</footer>
  <script>const q=document.querySelector('#search'),cards=[...document.querySelectorAll('.build')],visible=document.querySelector('#visible');q.addEventListener('input',()=>{const s=q.value.toLowerCase().trim();let n=0;for(const card of cards){const show=!s||card.dataset.search.includes(s);card.hidden=!show;if(show)n++}visible.textContent=n});</script>
</body>
</html>`;
writeText(path.join(dist, 'index.html'), hub);

const manifest = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  clientId: 'momentum-360',
  purpose: 'Jesse business-by-business call review',
  summary: { routes: records.length, callableBusinesses: callable.length, aliases: aliases.length, exclusions: exclusions.length },
  mailReady: 'hold',
  qaStatus: 'pending',
  records,
};
writeText(path.join(releaseRoot, 'ALL-BUSINESSES-MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeText(path.join(releaseRoot, 'CALL-READY-CONTACTS.json'), `${JSON.stringify({ generatedAt: manifest.generatedAt, summary: manifest.summary, records: callable }, null, 2)}\n`);

const sheetHeaders = ['#', 'Business', 'Phone', 'Phone Source', 'Last Verified', 'Address / Location', 'Live Site', 'Batch', 'QA Status', 'Call Priority', 'Call Result', 'Follow Up', 'Notes'];
const sheetRows = callable.map((record, index) => [
  index + 1,
  record.business,
  record.phone,
  record.sourceUrl || record.verification || 'Verified prospect record',
  record.verifiedAt,
  record.address || 'Confirm location during call',
  `https://momentum-prospect-radar-next20-2026-08-11.netlify.app${record.route}`,
  record.currentBatch,
  'Pending final QA',
  '',
  '',
  '',
  '',
]);
writeText(path.join(releaseRoot, 'JESSE-CALL-SHEET.csv'), `${[sheetHeaders, ...sheetRows].map(row => row.map(csvCell).join(',')).join('\n')}\n`);

console.log(JSON.stringify({
  releaseRoot,
  routes: records.length,
  callableBusinesses: callable.length,
  aliases: aliases.length,
  exclusions: exclusions.length,
  phones: callable.filter(record => record.phoneDigits.length === 10).length,
  rebuiltAssetPackages: ['telegram', 'next10', 'trio'],
}, null, 2));
