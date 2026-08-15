#!/usr/bin/env node
/**
 * Copy mapped wow JPEGs into gitignored refs/ and write compare.html.
 * Shots stay out of git. Hub is for the VM taste pass.
 */
const fs = require('fs');
const path = require('path');
const { resolveLayout, hostLabel } = require('/workspace/_templates/site-factory/lib/layouts.js');

const BATCH = path.join(__dirname, '..');
const SHOT_DIR = '/workspace/12_Brain/private/design-references/shots';
const REFS = path.join(BATCH, 'refs');
const ARTIFACTS = '/opt/cursor/artifacts';
const wow = JSON.parse(fs.readFileSync(path.join(BATCH, 'wow-library.json'), 'utf8'));
const briefsDir = path.join(BATCH, 'briefs');

fs.mkdirSync(REFS, { recursive: true });
fs.mkdirSync(path.join(ARTIFACTS, 'wow-library'), { recursive: true });

const byUrl = new Map((wow.items || []).map((i) => [String(i.url || '').replace(/\/$/, ''), i]));

const pairs = fs
  .readdirSync(briefsDir)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => {
    const brief = JSON.parse(fs.readFileSync(path.join(briefsDir, f), 'utf8'));
    const layout = resolveLayout(brief);
    const key = String(brief.composition_ref || '').replace(/\/$/, '');
    const item = byUrl.get(key) || (wow.items || []).find((i) => i.url === brief.composition_ref);
    const src = item && item.slug ? path.join(SHOT_DIR, `${item.slug}.jpg`) : '';
    const destName = `${brief.slug}.jpg`;
    if (src && fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(REFS, destName));
    }
    return {
      slug: brief.slug,
      name: brief.name,
      layout: layout.id,
      host: hostLabel(brief.composition_ref),
      ref: brief.composition_ref,
      shot: fs.existsSync(path.join(REFS, destName)) ? `refs/${destName}` : '',
    };
  });

const cells = pairs
  .map((p) => {
    const shot = p.shot
      ? `<img src="${p.shot}" alt="Homepage screenshot of ${p.host}">`
      : '<p class="miss">Shot missing</p>';
    return `<article>
      <header><strong>${p.name}</strong><span>${p.layout} · ${p.host}</span></header>
      <div class="pair">
        <figure>${shot}<figcaption>Wow homepage (${p.host})</figcaption></figure>
        <figure><iframe title="${p.name}" src="sites/${p.slug}/index.html"></iframe><figcaption>Rebuilt ${p.slug}</figcaption></figure>
      </div>
    </article>`;
  })
  .join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Wow homepage vs rebuilt prospect · phl-2026-w33</title>
<style>
:root{--bg:#0b0d12;--ink:#f2f5fb;--muted:#9aa5b8;--line:#ffffff1e}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.45 "Segoe UI",sans-serif}
.wrap{width:min(1440px,calc(100% - 32px));margin:auto;padding:40px 0 80px}
h1{font-size:clamp(1.8rem,4vw,3rem);letter-spacing:-.03em;max-width:22ch}
.sub{color:var(--muted);max-width:70ch}
article{margin:48px 0;padding-top:28px;border-top:1px solid var(--line)}
article header{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
article header span{color:var(--muted);font-size:.85rem}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}
figure{margin:0;background:#151922;border:1px solid var(--line);border-radius:12px;overflow:hidden}
img,iframe{display:block;width:100%;height:540px;border:0;background:#000;object-fit:cover;object-position:top}
figcaption{padding:10px 12px;color:var(--muted);font-size:.8rem}
.miss{padding:40px}
@media (max-width:900px){.pair{grid-template-columns:1fr}img,iframe{height:360px}}
</style>
</head>
<body>
<div class="wrap">
<h1>Wow homepage screenshots next to the rebuilt prospect</h1>
<p class="sub">Left column is the captured wow homepage. Right column is the local business demo using that composition (hero, chrome, type). Brand, copy, and photos stay with the harvest. Do not clone the referenced product brand.</p>
<p class="sub"><a href="index.html" style="color:#b6f36d">Batch hub</a> · <a href="library.html" style="color:#b6f36d">200-shot library</a></p>
${cells}
</div>
</body>
</html>`;
fs.writeFileSync(path.join(BATCH, 'compare.html'), html);

const libraryItems = (wow.items || []).filter((i) => i.ok && i.slug).slice(0, 200);
const libCells = libraryItems
  .map((i) => {
    const file = `${i.slug}.jpg`;
    const src = path.join(SHOT_DIR, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(ARTIFACTS, 'wow-library', file));
      fs.copyFileSync(src, path.join(REFS, `lib-${file}`));
    }
    return `<figure><img src="refs/lib-${file}" alt=""><figcaption>${String(i.url || '').replace(/^https?:\/\//, '')}</figcaption></figure>`;
  })
  .join('');

const library = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>200 wow homepage screenshots</title>
<style>
body{margin:0;background:#101418;color:#e8eef4;font:13px/1.4 ui-sans-serif,system-ui}
h1{font-size:28px;padding:28px 24px 8px}
.sub{padding:0 24px 24px;color:#8b9aab;max-width:70ch}
grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;padding:0 16px 40px}
figure{margin:0;background:#1a222b;border:1px solid #2a3540;border-radius:8px;overflow:hidden}
img{width:100%;height:180px;object-fit:cover;object-position:top;display:block}
figcaption{padding:8px 10px;word-break:break-all}
</style>
</head>
<body>
<h1>${libraryItems.length} wow homepage screenshots</h1>
<p class="sub">Captured in this VM. Composition reference only. Harvest still owns brand, copy, and photos on prospect demos.</p>
<grid>${libCells}</grid>
</body>
</html>`;
fs.writeFileSync(path.join(BATCH, 'library.html'), library);

const artLib = library.replace(/src="refs\/lib-/g, 'src="wow-library/');
fs.writeFileSync(path.join(ARTIFACTS, 'wow_library_contact.html'), artLib);
fs.writeFileSync(path.join(ARTIFACTS, 'compare.html'), html.replace(/src="refs\//g, 'src="wow-refs/').replace(/src="sites\//g, 'src="file:///workspace/02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w33/sites/'));

fs.mkdirSync(path.join(ARTIFACTS, 'wow-refs'), { recursive: true });
for (const p of pairs) {
  const src = path.join(REFS, `${p.slug}.jpg`);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(ARTIFACTS, 'wow-refs', `${p.slug}.jpg`));
}

console.log(`compare hub ${pairs.length} pairs; library ${libraryItems.length} shots`);
