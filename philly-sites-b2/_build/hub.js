// Builds the review hub (index.html) listing all 25 rebuilt homepages.
const fs = require('fs');
const path = require('path');
const { sites } = require('./data');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SIGNATURE = {
  'aurora-drift': 'Drifting aurora field, glass service cards on 3D tilt, header that hides and returns',
  'zen-strata': 'Strata bands, rice-paper grain, slat curtain lifting off the hero, expanding service rows',
  'kinetic-blueprint': 'Blueprint grid, dimension line that draws on scroll, spec-table services, title-block footer',
  'field-grid': 'Hard job-site grid, service ticker, cells that flood with colour, site-plan footer',
  'poured-slab': 'Cast concrete texture, headline poured line by line, shear slabs, control-joint footer',
  'fresh-bloom': 'Rising bubbles, pill sections, swelling cards, bubble-arc footer',
  'pitch-shift': 'Angled roofline cuts between sections, shingle-stagger word reveal, gable footer',
  'clinic-orbit': 'Concentric orbit rings with a tracking satellite, circular media, orbit-ring footer',
  'porcelain': 'Gloss sheen sweeps, 3D-lifted cards, travel film strip, contact-sheet footer',
  'step-trace': 'Footprint trail that draws down the page as you scroll, arch media, trail-terminus footer',
  'gilded-sheen': 'Gold shimmer sweeping the headings, hairline rules, gilded-bar footer',
  'spinal-column': 'Vertebra rail that doubles as section nav, stacking rows, column-base footer',
  'picket-run': 'Picket slats that swing open off the hero, rail dividers, picket-fence footer',
  'vitals-monitor': 'Running ECG trace, monitor-bezel panels, live readouts, status-strip footer',
  'circuit-live': 'Circuit traces that energise on load, spark particles, power rail, circuit-board footer',
  'soft-arch': 'Arch masks and colonnade rhythm, warm sand palette, arch-colonnade footer',
  'aqua-lane': 'Caustic light and pool lane lines, waterline fade, lane-marker footer',
  'forge-iron': 'Ember particles over a forge glow, wrought scrollwork rules, iron-gate footer',
  'case-file': 'Card deck that fans out on scroll, polaroid and file-sheet media, file-tab footer',
  'one-on-one': 'Editorial split-screen with a hard wipe, giant numerals, session-card footer',
  'ridge-line': 'Layered ridge silhouettes parallaxing, roofline horizon dividers, skyline footer',
  'liquid-suite': 'Full liquid glass: refracting panels over a moving colour field, tilt on everything',
  'stone-garden': 'Stacked stone forms, raked-sand rules, ripple hovers, garden-bed footer',
  'impact-dossier': 'Shard reveals, impact shockwave rings, mono index numbers, dossier footer',
  'build-blocks': 'Blocks laying themselves into a wall, offset courses, mortar-course footer',
};

const cards = sites.map((s, i) => `
  <a class="card" href="${s.slug}/" data-rv style="--d:${i * 32}ms">
    <span class="thumb"><img src="${s.slug}/assets/${s.images[0]}" alt="" loading="lazy" decoding="async" width="600" height="420">
      <span class="mark" style="--plate:${s.logoTone === 'light' ? '#101114' : '#fff'}"><img src="${s.slug}/assets/logo.png" alt="${esc(s.name)} logo" loading="lazy" decoding="async"></span></span>
    <span class="body">
      <span class="idx">${String(i + 1).padStart(2, '0')}</span>
      <strong>${esc(s.name)}</strong>
      <em>${esc(s.archetype)}</em>
      <span class="sig">${esc(SIGNATURE[s.archetype] || '')}</span>
      <span class="meta"><span>${esc(s.tel)}</span><span>${esc(s.city)}</span></span>
      <span class="sw">${['accent', 'accent2', 'panel', 'deep'].map(k => `<i style="background:${s.tokens[k]}"></i>`).join('')}</span>
    </span>
  </a>`).join('');

const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Philly Batch 2 | 25 rebuilt homepages</title>
<meta name="description" content="Twenty five Philadelphia home services and healthcare homepages, each rebuilt on its own design archetype with the business's real logo.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#0B0D10;--fg:#EDF1F4;--dim:#8D99A4;--line:#1E242B;--acc:#5AC8FA}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
.wrap{width:min(1420px,100% - 48px);margin-inline:auto}
header{padding:clamp(46px,7vw,96px) 0 clamp(26px,3vw,44px);border-bottom:1px solid var(--line)}
h1{font:700 clamp(2rem,5vw,4rem)/1 'Space Grotesk',sans-serif;letter-spacing:-.04em;margin:0 0 18px;max-width:20ch}
.kick{color:var(--acc);font:600 .74rem/1 'Space Grotesk',sans-serif;letter-spacing:.24em;text-transform:uppercase;display:block;margin-bottom:22px}
header p{max-width:70ch;color:var(--dim);margin:0}
.stats{display:flex;gap:34px;flex-wrap:wrap;margin-top:30px}
.stats div b{font:700 1.7rem/1 'Space Grotesk',sans-serif;display:block;color:var(--acc)}
.stats div span{font-size:.8rem;color:var(--dim);letter-spacing:.06em}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:20px;padding:clamp(30px,4vw,56px) 0 90px}
.card{border:1px solid var(--line);border-radius:18px;overflow:hidden;background:#10141A;display:flex;flex-direction:column;
  transition:transform .45s cubic-bezier(.2,.8,.2,1),border-color .35s,box-shadow .45s;opacity:0;transform:translateY(26px)}
.card.in{opacity:1;transform:none;transition-delay:var(--d)}
.card:hover{transform:translateY(-7px);border-color:var(--acc);box-shadow:0 26px 54px -30px rgba(90,200,250,.55)}
.thumb{position:relative;display:block;aspect-ratio:16/10;overflow:hidden;background:#05070A}
.thumb>img{width:100%;height:100%;object-fit:cover;opacity:.62;transition:opacity .45s,transform .9s cubic-bezier(.2,.8,.2,1)}
.card:hover .thumb>img{opacity:.9;transform:scale(1.05)}
.mark{position:absolute;left:16px;bottom:16px;background:var(--plate);border-radius:10px;padding:8px 11px;display:grid;place-items:center;box-shadow:0 8px 22px -10px rgba(0,0,0,.7)}
.mark img{height:30px;width:auto;max-width:150px;object-fit:contain;display:block}
.body{padding:20px 22px 22px;display:flex;flex-direction:column;gap:7px;flex:1}
.idx{font:600 .72rem/1 'Space Grotesk',sans-serif;letter-spacing:.2em;color:var(--acc)}
.body strong{font:600 1.08rem/1.25 'Space Grotesk',sans-serif;letter-spacing:-.015em}
.body em{font-style:normal;font-size:.76rem;letter-spacing:.14em;text-transform:uppercase;color:var(--acc);opacity:.8}
.sig{font-size:.86rem;color:var(--dim);line-height:1.55;margin-top:2px}
.meta{display:flex;justify-content:space-between;gap:12px;font-size:.78rem;color:var(--dim);margin-top:auto;padding-top:12px;border-top:1px solid var(--line)}
.sw{display:flex;gap:5px}
.sw i{width:22px;height:7px;border-radius:99px}
footer{border-top:1px solid var(--line);padding:26px 0 60px;color:var(--dim);font-size:.84rem;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}
@media(prefers-reduced-motion:reduce){.card{opacity:1;transform:none}}
</style></head><body>
<header><div class="wrap">
  <span class="kick">Philadelphia batch 2 &middot; 25 homepages</span>
  <h1>Twenty five rebuilds. Twenty five different design systems.</h1>
  <p>Every homepage below was rebuilt from scratch on its own archetype: its own layout, motion signature, footer, and reveal behaviour. Each carries the business's real logo with an ink-particle field behind it, four to six of their real photographs, and their real services, hours, phone and address.</p>
  <div class="stats">
    <div><b>25</b><span>UNIQUE ARCHETYPES</span></div>
    <div><b>25</b><span>REAL LOGOS</span></div>
    <div><b>25</b><span>DISTINCT FOOTERS</span></div>
    <div><b>6</b><span>PHOTOS PER PAGE</span></div>
  </div>
</div></header>
<main class="wrap"><div class="grid">${cards}</div></main>
<footer class="wrap"><span>Philadelphia home services and healthcare &middot; batch 2</span><span>Internal review build &middot; noindex</span></footer>
<script>
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
document.querySelectorAll('[data-rv]').forEach(function(c){io.observe(c);});
</script>
</body></html>`;

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), html);
console.log('hub written, ' + sites.length + ' cards, ' + (Buffer.byteLength(html) / 1024).toFixed(1) + 'kb');
