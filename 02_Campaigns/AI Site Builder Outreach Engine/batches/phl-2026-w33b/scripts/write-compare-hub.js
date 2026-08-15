#!/usr/bin/env node
/**
 * Pair each rebuild with the harvest screenshot of THAT business's live site.
 */
const fs = require('fs');
const path = require('path');

const BATCH = path.join(__dirname, '..');
const HARVEST = '/workspace/_templates/site-factory/harvest';
const REFS = path.join(BATCH, 'refs');
const ARTIFACTS = '/opt/cursor/artifacts';
const briefsDir = path.join(BATCH, 'briefs');

fs.mkdirSync(REFS, { recursive: true });
fs.mkdirSync(path.join(ARTIFACTS, 'mirror-w33b'), { recursive: true });

const pairs = fs
  .readdirSync(briefsDir)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => {
    const brief = JSON.parse(fs.readFileSync(path.join(briefsDir, f), 'utf8'));
    const src = path.join(HARVEST, brief.slug, 'shots', 'site-desktop.png');
    const destName = `${brief.slug}.png`;
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(REFS, destName));
      const art = path.join(ARTIFACTS, 'mirror-w33b', destName);
      fs.copyFileSync(src, art);
    }
    return {
      slug: brief.slug,
      name: brief.name,
      layout: brief.layout,
      url: brief.url,
      shot: fs.existsSync(path.join(REFS, destName)) ? `refs/${destName}` : '',
    };
  });

const cells = pairs
  .map((p) => {
    const shot = p.shot
      ? `<img src="${p.shot}" alt="Live homepage of ${p.name}">`
      : '<p class="miss">Harvest shot missing</p>';
    return `<article>
      <header><strong>${p.name}</strong><span>${p.layout} · <a href="${p.url}">their site</a></span></header>
      <div class="pair">
        <figure>${shot}<figcaption>Their live homepage (harvest)</figcaption></figure>
        <figure><iframe title="${p.name}" src="sites/${p.slug}/index.html"></iframe><figcaption>Mirrored rebuild</figcaption></figure>
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
<title>Harvest vs mirrored rebuild · phl-2026-w33b</title>
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
article a{color:#9ecbff}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}
figure{margin:0;background:#151922;border:1px solid var(--line);border-radius:12px;overflow:hidden}
img,iframe{display:block;width:100%;height:540px;border:0;background:#000;object-fit:cover;object-position:top}
figcaption{padding:10px 12px;color:var(--muted);font-size:.85rem}
.miss{padding:40px}
@media (max-width:900px){.pair{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="wrap">
<h1>Their live site, then the mirrored rebuild</h1>
<p class="sub">phl-2026-w33b. Unused radar rebuilds, priority desc. Harvest owns brand, copy, photos, and palette. No wow-library chrome.</p>
${cells}
</div>
</body>
</html>`;

fs.writeFileSync(path.join(BATCH, 'compare.html'), html);
console.log('wrote compare.html', pairs.length);
