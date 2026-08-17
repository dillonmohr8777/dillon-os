#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const sites = require('./lib/catalog.js');

const ROOT = __dirname;

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/< /g, '&lt;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function telHref(phone) {
  const d = String(phone || '').replace(/[^\d+]/g, '');
  if (!d) return '';
  if (d.startsWith('+')) return `tel:${d}`;
  if (d.length === 10) return `tel:+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `tel:+${d}`;
  return `tel:${d}`;
}

function css(site) {
  return `:root{
  --paper:#efe6d4;--ink:${site.brand};--accent:${site.accent};
  --line:color-mix(in srgb,var(--ink) 18%,transparent);
  --chip:color-mix(in srgb,var(--accent) 16%,var(--paper));
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--ink);font:18px/1.55 "IBM Plex Sans",system-ui,sans-serif;overflow-x:hidden}
.no-js .reveal{opacity:1;transform:none}
body:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.35;
  background-image:
    linear-gradient(var(--line) 1px,transparent 1px),
    linear-gradient(90deg,var(--line) 1px,transparent 1px),
    radial-gradient(circle at 50% 0,color-mix(in srgb,var(--accent) 18%,transparent),transparent 42%);
  background-size:48px 48px,48px 48px,100% 80vh}
.skip{position:absolute;left:-999px}
.skip:focus{left:12px;top:12px;z-index:9;background:var(--paper);padding:.4rem .7rem}
.wrap{width:min(1120px,calc(100% - 40px));margin:0 auto;position:relative;z-index:1}
.mast{padding:28px 0 8px}
.mast-mark{width:min(484px,92vw);height:148px;display:block}
.mast-mark.particles-done canvas{display:none}
.kicker{font:12px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:color-mix(in srgb,var(--ink) 62%,transparent)}
h1{font:700 clamp(2.4rem,6vw,4.6rem)/.95 "IBM Plex Serif",Georgia,serif;margin:.2em 0 .3em;text-wrap:balance}
.lede{max-width:46ch;font-size:1.05rem}
.flag{margin:18px 0;padding:12px 14px;border:1px dashed var(--accent);background:var(--chip);font-size:.92rem;max-width:62ch}
.ticker{overflow:hidden;border-block:1px solid var(--line);margin:28px 0 8px}
.ticker b{display:inline-block;padding:10px 0;white-space:nowrap;animation:ticker 80s linear infinite}
@keyframes ticker{to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){.ticker b{animation:none}}
main{padding-bottom:90px}
.box{--arm:20px;position:relative;margin:28px 0;padding:28px 28px 24px;border-radius:22px;
  background:
    linear-gradient(var(--ink),var(--ink)) 0 0 / var(--arm) 1px no-repeat,
    linear-gradient(var(--ink),var(--ink)) 0 0 / 1px var(--arm) no-repeat,
    linear-gradient(var(--ink),var(--ink)) 100% 0 / var(--arm) 1px no-repeat,
    linear-gradient(var(--ink),var(--ink)) 100% 0 / 1px var(--arm) no-repeat,
    linear-gradient(var(--ink),var(--ink)) 0 100% / var(--arm) 1px no-repeat,
    linear-gradient(var(--ink),var(--ink)) 0 100% / 1px var(--arm) no-repeat,
    linear-gradient(var(--ink),var(--ink)) 100% 100% / var(--arm) 1px no-repeat,
    linear-gradient(var(--ink),var(--ink)) 100% 100% / 1px var(--arm) no-repeat,
    color-mix(in srgb,var(--paper) 88%,white);
  box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 28%,transparent);
  transition:--arm .25s ease}
.box:hover{--arm:34px;box-shadow:inset 0 0 0 1px var(--accent)}
@property --arm{syntax:"<length>";inherits:false;initial-value:20px}
.idx{font:11px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
.box-title{font:600 1.35rem/1.2 "IBM Plex Serif",Georgia,serif;margin:.45rem 0 .7rem;padding-bottom:.55rem;border-bottom:1px solid var(--line)}
.box p{max-width:46ch;margin:0}
figure.slot{margin:28px 0;padding:0}
figure.slot img{width:100%;height:460px;object-fit:cover;border-radius:22px;display:block;background:color-mix(in srgb,var(--ink) 6%,var(--paper))}
figcaption{font:12px/1.4 "IBM Plex Mono",ui-monospace,monospace;margin-top:8px;color:color-mix(in srgb,var(--ink) 55%,transparent)}
.img-slot{height:460px;border:1px dashed color-mix(in srgb,var(--ink) 35%,transparent);border-radius:22px;
  background:repeating-linear-gradient(-45deg,transparent,transparent 8px,color-mix(in srgb,var(--ink) 6%,transparent) 8px,color-mix(in srgb,var(--ink) 6%,transparent) 9px);
  display:flex;align-items:flex-end;padding:16px;font:12px/1.4 "IBM Plex Mono",ui-monospace,monospace}
.outro{margin-top:190px;text-align:center}
.outro-mark{width:min(1080px,96vw);height:380px;margin:0 auto}
footer{padding:28px 0 76px;font-size:.88rem}
footer nav{display:flex;gap:18px;flex-wrap:wrap;margin-top:10px}
a{color:var(--ink)}
.demo{font:11px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase}
@media (max-width:520px){figure.slot img,.img-slot{height:280px} .mast-mark{height:96px} .outro-mark{height:160px}}
`;
}

function particleScript() {
  return `<script>
(function(){
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');
  function explode(el, hold){
    if(!el) return;
    var svg = el.querySelector('svg');
    if(!svg){ el.classList.add('particles-done'); return; }
    if(document.hidden){ el.classList.add('particles-done'); return; }
    var w = el.clientWidth, h = el.clientHeight;
    var c = document.createElement('canvas');
    c.width = w*2; c.height = h*2; c.style.width=w+'px'; c.style.height=h+'px';
    el.appendChild(c);
    var ctx = c.getContext('2d');
    var xml = new XMLSerializer().serializeToString(svg);
    var img = new Image();
    img.onload = function(){
      ctx.drawImage(img,0,0,c.width,c.height);
      try{
        var data = ctx.getImageData(0,0,c.width,c.height).data;
        var pts=[];
        for(var y=0;y<c.height;y+=3){
          for(var x=0;x<c.width;x+=3){
            var i=(y*c.width+x)*4;
            if(data[i+3]>40) pts.push({x:x,y:y,ox:x,oy:y,r:data[i],g:data[i+1],b:data[i+2],a:data[i+3]/255,vx:(Math.random()-.5)*1.4,vy:(Math.random()-.8)*1.8});
          }
        }
        svg.style.opacity='0';
        var t0 = performance.now();
        var holdMs = hold||1500;
        function frame(now){
          var t = now-t0;
          ctx.clearRect(0,0,c.width,c.height);
          var go = t>holdMs;
          var u = go? Math.min(1,(t-holdMs)/1800) : 0;
          for(var p of pts){
            if(go){ p.x+=p.vx; p.y+=p.vy; p.vy+=0.03; p.a*=0.992; }
            ctx.fillStyle='rgba('+p.r+','+p.g+','+p.b+','+p.a+')';
            ctx.fillRect(p.x,p.y,2.2,2.2);
          }
          if(u<1 && !document.hidden) requestAnimationFrame(frame);
          else el.classList.add('particles-done');
        }
        requestAnimationFrame(frame);
      }catch(e){ el.classList.add('particles-done'); }
    };
    img.src = 'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(xml)));
    setTimeout(function(){ el.classList.add('particles-done'); }, 6000);
  }
  document.querySelectorAll('[data-particles]').forEach(function(el){
    var hold = Number(el.getAttribute('data-hold')||1500);
    if(el.hasAttribute('data-onview')){
      var io=new IntersectionObserver(function(ents){
        ents.forEach(function(e){ if(e.isIntersecting){ explode(el,hold); io.disconnect(); } });
      },{threshold:0.25});
      io.observe(el);
    } else explode(el,hold);
  });
})();
</script>`;
}

function wordmark(site, wide) {
  const label = esc(site.name);
  const w = wide ? 1080 : 484;
  const h = wide ? 380 : 148;
  const size = wide ? 72 : 36;
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">
    <rect width="${w}" height="${h}" fill="transparent"/>
    <text x="12" y="${wide ? 210 : 88}" fill="${site.ink || site.brand}" font-family="IBM Plex Serif, Georgia, serif" font-size="${size}" font-weight="700">${label}</text>
    <text x="14" y="${wide ? 268 : 118}" fill="${site.accent}" font-family="IBM Plex Mono, monospace" font-size="${wide ? 22 : 13}" letter-spacing="4">${esc(site.buzz)}</text>
  </svg>`;
}

function slotHtml(site, slot) {
  const file = `assets/image-${slot.n}.webp`;
  const abs = path.join(ROOT, site.slug, file);
  if (fs.existsSync(abs)) {
    return `<figure class="slot" data-prompt="${esc(slot.prompt)}">
      <img src="${file}" alt="${esc(slot.alt)}" width="1400" height="788" loading="${slot.n === 1 ? 'eager' : 'lazy'}" ${slot.n === 1 ? 'fetchpriority="high"' : ''}>
      <figcaption>${esc(slot.alt)}</figcaption>
    </figure>`;
  }
  return `<div class="img-slot" data-prompt="${esc(slot.prompt)}" role="img" aria-label="${esc(slot.alt)}">SLOT ${String(slot.n).padStart(2, '0')} · waiting on generated plate · ${esc(site.buzz)}</div>`;
}

function page(site) {
  const address = [site.street, site.city, site.region, site.postcode].filter(Boolean).join(', ');
  const schema = {
    '@context': 'https://schema.org',
    '@type': site.schema,
    name: site.name,
    url: site.website,
    telephone: site.phone || undefined,
    email: site.email || undefined,
    address: address
      ? { '@type': 'PostalAddress', streetAddress: site.street || undefined, addressLocality: site.city || undefined, addressRegion: site.region, postalCode: site.postcode || undefined }
      : undefined,
  };
  const ticker = site.ticker
    ? `<div class="ticker" aria-hidden="true"><b>${esc(site.ticker.concat(site.ticker).join('  ·  '))}</b></div>`
    : '';
  const boxes = site.sections
    .map(
      (sec, i) => `<section class="box reveal">
      <div class="idx">CMP ${String(i + 1).padStart(2, '0')} / ${esc(site.buzz)}</div>
      <h2 class="box-title">${esc(sec.title)}</h2>
      <p>${esc(sec.body)}</p>
    </section>`
    )
    .join('\n');
  const slots = site.slots.map((s) => slotHtml(site, s)).join('\n');
  const tel = telHref(site.phone);
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="description" content="${esc(site.lede)}">
<title>${esc(site.name)} — prospect demo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Serif:wght@600;700&display=swap" rel="stylesheet">
<style>${css(site)}</style>
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="mast">
  <div class="wrap">
    <div class="kicker">PROSPECT DEMO · ${esc(site.area || site.region)} · ${esc(site.buzz)}</div>
    <div class="mast-mark" data-particles data-hold="1500">${wordmark(site, false)}</div>
    <h1>${esc(site.h1)}</h1>
    <p class="lede">${esc(site.lede)}</p>
    ${site.flag ? `<p class="flag">${esc(site.flag)}</p>` : ''}
  </div>
</header>
${ticker}
<main id="main" class="wrap">
${boxes}
${slots}
</main>
<div class="outro">
  <div class="outro-mark" data-particles data-onview data-hold="2400">${wordmark(site, true)}</div>
</div>
<footer>
  <div class="wrap">
    <div class="demo">Not their live site · noindex · generated plates, not photography</div>
    <p>${esc(site.name)}${address ? ' · ' + esc(address) : ''}${site.phone ? ' · ' + esc(site.phone) : ''}</p>
    <nav aria-label="Footer">
      <a href="../index.html">Hub</a>
      <a href="${esc(site.website)}">Their current URL</a>
      ${tel ? `<a href="${tel}">Call</a>` : ''}
    </nav>
  </div>
</footer>
${particleScript()}
</body>
</html>`;
}

function hub() {
  const cards = sites
    .map((s) => {
      const n = s.slots.filter((slot) => fs.existsSync(path.join(ROOT, s.slug, `assets/image-${slot.n}.webp`))).length;
      return `<a class="card" href="${s.slug}/index.html">
        <span class="kicker">${esc(s.buzz)}${s.flag ? ' · flagged' : ''}</span>
        <strong>${esc(s.name)}</strong>
        <em>${esc([s.city, s.area].filter(Boolean).join(' · '))}</em>
        <span class="meta">${n}/3 plates</span>
      </a>`;
    })
    .join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Radar 17 Aug 2026 — 22 demos</title>
<style>
body{margin:0;background:#efe6d4;color:#1a1a1a;font:18px/1.45 "IBM Plex Sans",system-ui,sans-serif}
.wrap{width:min(1100px,calc(100% - 36px));margin:0 auto;padding:36px 0 80px}
h1{font:700 2.6rem/1 "IBM Plex Serif",Georgia,serif}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
.card{display:flex;flex-direction:column;gap:6px;padding:18px;border-radius:18px;text-decoration:none;color:inherit;background:#fff8ea;box-shadow:inset 0 0 0 1px #0002}
.card:hover{box-shadow:inset 0 0 0 1px #000}
.kicker{font:11px/1 "IBM Plex Mono",monospace;letter-spacing:.12em;text-transform:uppercase}
.meta{font:12px/1 "IBM Plex Mono",monospace}
.note{max-width:62ch}
</style>
</head>
<body>
<div class="wrap">
<p class="kicker">RADAR BATCH · 2026-08-17</p>
<h1>22 demos. Casselle blocked.</h1>
<p class="note">Image plates are editorial two-colour engravings from the Claude slot prompts. They are not photographs of anyone’s premises or staff. Law Offices of D. A. Casselle is omitted — do not contact.</p>
<div class="grid">${cards}</div>
</div>
</body>
</html>`;
}

function writeAll() {
  for (const site of sites) {
    const dir = path.join(ROOT, site.slug);
    fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), page(site));
    const prompts = site.slots.map((s) => `# ${site.slug} / ${s.n}\n\n${s.prompt}\n`).join('\n---\n\n');
    fs.writeFileSync(path.join(dir, 'assets', 'PROMPTS.md'), prompts);
  }
  fs.writeFileSync(path.join(ROOT, 'index.html'), hub());
  const manifest = sites.flatMap((site) =>
    site.slots.map((s) => ({
      slug: site.slug,
      n: s.n,
      file: `${site.slug}-slot-${s.n}.png`,
      dest: path.join(site.slug, `assets/image-${s.n}.webp`),
      alt: s.alt,
      prompt: s.prompt,
      brand: site.brand,
      accent: site.accent,
    }))
  );
  fs.writeFileSync(path.join(ROOT, 'lib', 'image-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`wrote ${sites.length} sites + hub, ${manifest.length} slot prompts`);
}

if (require.main === module) writeAll();

module.exports = { sites, writeAll, ROOT };
