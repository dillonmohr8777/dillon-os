'use strict';

const { captionsFor } = require('./intent');

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function contrastOn(hex) {
  const h = String(hex || '#000').replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const y = (r * 299 + g * 587 + b * 114) / 1000;
  return y > 155 ? '#111820' : '#FFFFFF';
}

function css(brief) {
  const t = brief.tokens;
  return `
:root{
  --paper:${t.paper};--ink:${t.ink};--accent:${t.accent};--accent2:${t.accent2};
  --panel:${t.panel};--deep:${t.deep};--on-paper:${t.onPaper};--on-accent:${t.onAccent};
  --on-deep:${t.onDeep};--radius:${t.radius};--ease:cubic-bezier(.2,.8,.2,1);
  --display:"${brief.fonts.display}",${brief.fonts.displayFallback};
  --text:"${brief.fonts.text}",system-ui,sans-serif;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;overflow-x:clip}
body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 var(--text);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}
a{color:inherit}
.skip-link{position:absolute;left:12px;top:-80px;background:var(--ink);color:#fff;padding:10px 14px;z-index:20}
.skip-link:focus{top:12px}
.wrap{width:min(90vw,1120px);margin-inline:auto}
.site-header{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:14px 5vw;background:color-mix(in srgb,var(--paper) 86%,transparent);backdrop-filter:blur(18px);border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.brand{display:flex;align-items:center;min-height:48px;text-decoration:none}
.brand-logo{height:48px;width:auto;max-width:min(46vw,220px);object-fit:contain}
.wordmark{font:800 1.1rem/1 var(--display);letter-spacing:-.03em}
.site-header nav{display:flex;gap:18px}
.site-header nav a{min-height:44px;display:inline-flex;align-items:center;text-decoration:none;font-weight:700}
.button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:12px 18px;border-radius:999px;background:var(--accent);color:var(--on-accent);font-weight:800;text-decoration:none;border:0;transition:transform .28s var(--ease)}
.button:hover,.button:focus-visible{transform:translateY(-3px)}
.button-quiet{background:transparent;color:var(--ink);border:1px solid color-mix(in srgb,var(--ink) 22%,transparent)}
.hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(280px,.9fr);gap:clamp(28px,6vw,72px);align-items:center;padding:clamp(48px,8vw,110px) 5vw}
.hero-copy h1{margin:0 0 16px;font:700 clamp(2.6rem,7vw,5.6rem)/.92 var(--display);letter-spacing:-.05em;text-wrap:balance}
.hero-copy p{max-width:38ch;font-size:1.08rem}
.hero-points{list-style:none;padding:0;margin:28px 0 0;display:grid;gap:10px;font-weight:800}
.hero-points li{display:flex;gap:10px;align-items:center}
.hero-points li:before{content:"";width:8px;height:8px;border-radius:50%;background:var(--accent)}
.hero-visual{margin:0;position:relative;filter:drop-shadow(0 30px 34px color-mix(in srgb,var(--deep) 28%,transparent));transition:transform .42s var(--ease)}
.hero-visual:hover{transform:translateY(-8px) rotate(-.35deg)}
.image-frame{position:relative;aspect-ratio:4/5;overflow:hidden;border-radius:18px;border:1px solid color-mix(in srgb,var(--accent) 55%,transparent);background:var(--deep)}
.slides{position:absolute;inset:0}
.slides img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.08);transition:opacity 1s var(--ease),transform 7s linear}
.slides img.is-on{opacity:1;transform:scale(1);z-index:1}
.hero-visual:hover .slides img.is-on{transform:scale(1.045);filter:contrast(1.05) saturate(1.08)}
.hero-visual figcaption{position:absolute;right:-18px;bottom:22px;z-index:3;max-width:250px;padding:18px 20px;border-radius:14px;background:color-mix(in srgb,var(--deep) 94%,transparent);color:var(--on-deep);border:1px solid hsla(0,0%,100%,.22);backdrop-filter:blur(12px)}
.hero-visual figcaption span{display:block;color:var(--accent);font:800 10px var(--display);letter-spacing:.13em;text-transform:uppercase;margin-bottom:5px}
.hero-visual figcaption strong{display:block;font:700 15px/1.4 var(--display)}
.swipe-dots{display:flex;gap:8px;justify-content:center;margin-top:14px}
.swipe-dots button{width:8px;height:8px;padding:0;border-radius:50%;border:0;background:color-mix(in srgb,var(--ink) 25%,transparent);min-width:44px;min-height:44px;display:grid;place-items:center}
.swipe-dots button::after{content:"";width:8px;height:8px;border-radius:50%;background:inherit}
.swipe-dots button.is-on{background:var(--accent)}
section{padding:clamp(64px,9vw,120px) 5vw}
.section-kicker{display:block;margin-bottom:10px;font:800 .72rem var(--display);letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
h2{margin:0 0 18px;font:700 clamp(2rem,5vw,4.2rem)/.95 var(--display);letter-spacing:-.04em;text-wrap:balance}
.offer-grid,.card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr));gap:16px}
.card{padding:22px;border-radius:16px;background:color-mix(in srgb,var(--panel) 80%,var(--paper));border:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.media-card{margin:0;overflow:hidden;border-radius:16px;border:1px solid color-mix(in srgb,var(--accent) 35%,transparent);min-height:16rem}
.media-card img{width:100%;height:100%;min-height:16rem;object-fit:cover;transition:transform 1.1s var(--ease)}
.media-card:hover img{transform:scale(1.04)}
.surface-deep{background:var(--deep);color:var(--on-deep)}
.surface-accent{background:var(--accent);color:var(--on-accent)}
.contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr));gap:16px}
.logo-finale{min-height:42vh;display:grid;place-items:center;padding:12vh 5vw;background:var(--paper)}
.logo-finale img{width:min(70vw,420px);height:auto;max-height:28vh;object-fit:contain;filter:contrast(1.05);animation:ink-in 1.1s var(--ease) both}
@keyframes ink-in{from{opacity:0;transform:scale(1.08);filter:blur(12px) contrast(.2)}to{opacity:1;transform:none;filter:contrast(1.05)}}
.mobile-action{display:none;position:fixed;left:12px;right:12px;bottom:12px;z-index:40}
.mobile-action .button{width:100%}
.footer{padding:48px 5vw 110px;display:grid;gap:18px;border-top:1px solid color-mix(in srgb,var(--ink) 12%,transparent)}
.disclosure{opacity:.72;font-size:.88rem;max-width:62ch}
.ticker{overflow:hidden;border-block:8px solid transparent;position:relative;background:var(--deep);color:var(--on-deep)}
.ticker:before,.ticker:after{content:"";position:absolute;left:0;right:0;height:8px;z-index:2;background:linear-gradient(90deg,var(--accent),color-mix(in srgb,var(--accent) 40%,white),var(--accent2),var(--accent));background-size:240% 100%;animation:lineSwipe 3.4s linear infinite}
.ticker:after{bottom:0;top:auto}
.ticker-track{display:flex;gap:48px;white-space:nowrap;animation:ticker 28s linear infinite;font:800 .9rem var(--display);letter-spacing:.18em;text-transform:uppercase;padding:16px 0}
@keyframes ticker{to{transform:translateX(-50%)}}
@keyframes lineSwipe{to{background-position:-240% 0}}
.reveal{opacity:1}
.js .reveal{opacity:0;transform:translateY(28px);filter:blur(6px);transition:opacity .7s var(--ease),transform .7s var(--ease),filter .7s var(--ease)}
.js .reveal.visible{opacity:1;transform:none;filter:none}
@media(max-width:840px){
  .hero{grid-template-columns:1fr;padding-top:32px}
  .hero-visual{width:min(100%,440px);margin-inline:auto}
  .hero-visual figcaption{right:8px}
  .site-header nav{display:none}
  .mobile-action{display:block}
}
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .js .reveal,.js .reveal.visible{opacity:1!important;transform:none!important;filter:none!important;transition:none!important}
  .slides img{transition:none;transform:none}
  .ticker-track,.ticker:before,.ticker:after,.logo-finale img{animation:none}
}
`;
}

function renderSite(brief) {
  const caps = captionsFor(brief.family);
  const points = (brief.points || []).slice(0, 3);
  const offerings = (brief.offerings || []).slice(0, 3);
  const logo = brief.logo
    ? `<img class="brand-logo" src="assets/logo.png" alt="${esc(brief.name)}">`
    : `<span class="wordmark">${esc(brief.name)}</span>`;
  const phoneDigits = String(brief.phone || '').replace(/\D/g, '');
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brief.address || `${brief.name} ${brief.city || ''}`)}`;
  const ctaHref = phoneDigits ? `tel:${phoneDigits}` : brief.url || '#visit';
  const ctaLabel = phoneDigits ? `Call ${brief.phone}` : 'Open official source';
  const slides = [1, 2, 3]
    .map(
      (n, i) =>
        `<img src="assets/collage-${n}.webp" alt="${esc(brief.imageAlts[n - 1])}" class="${i === 0 ? 'is-on' : ''}" ${i === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} width="1200" height="1500">`
    )
    .join('');
  const dots = [1, 2, 3]
    .map((n, i) => `<button type="button" class="${i === 0 ? 'is-on' : ''}" data-slide="${i}" aria-label="Show image ${n}"></button>`)
    .join('');
  const ticker = (brief.marquee || [brief.name, brief.city, brief.category]).concat(brief.marquee || []).join(' · ');
  const fonts = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(brief.fonts.display).replace(/%20/g, '+')}:wght@500;700&family=${encodeURIComponent(brief.fonts.text).replace(/%20/g, '+')}:wght@400;700&display=swap`;

  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>${esc(brief.name)} | ${esc(brief.city || 'Concept')}</title>
<meta name="description" content="${esc(brief.description)}">
<script>document.documentElement.classList.replace('no-js','js')||document.documentElement.classList.add('js')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fonts}" rel="stylesheet">
<style>${css(brief)}</style>
</head>
<body class="slug-${esc(brief.slug)} family-${esc(brief.family)}">
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <a class="brand" href="#top">${logo}</a>
  <nav aria-label="Primary"><a href="#work">Work</a><a href="#gallery">Gallery</a><a href="#visit">Visit</a></nav>
  <a class="button" href="${esc(ctaHref)}">${esc(ctaLabel)}</a>
</header>
<main id="main">
  <section class="hero" id="top">
    <div class="hero-copy reveal">
      <span class="section-kicker">${esc(brief.city || '')} · ${esc(brief.category)}</span>
      <h1>${esc(brief.headline)}</h1>
      <p>${esc(brief.sub)}</p>
      <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:22px">
        <a class="button" href="${esc(ctaHref)}">${esc(ctaLabel)}</a>
        ${brief.url ? `<a class="button button-quiet" href="${esc(brief.url)}">Official source</a>` : ''}
      </div>
      <ul class="hero-points">${points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    </div>
    <figure class="hero-visual reveal">
      <div class="image-frame" data-swipe>
        <div class="slides">${slides}</div>
      </div>
      <figcaption>
        <span>${esc(caps[0].kicker)}</span>
        <strong>${esc(caps[0].line)}</strong>
      </figcaption>
      <div class="swipe-dots" role="tablist" aria-label="Hero images">${dots}</div>
    </figure>
  </section>
  <div class="ticker" aria-hidden="true"><div class="ticker-track"><span>${esc(ticker)}</span><span>${esc(ticker)}</span></div></div>
  <section id="work">
    <span class="section-kicker reveal">How this place works</span>
    <h2 class="reveal">${esc(brief.workHeading)}</h2>
    <div class="offer-grid">
      ${offerings
        .map(
          (item, i) =>
            `<article class="card reveal delay-${i + 1}"><span class="section-kicker">0${i + 1}</span><p>${esc(item)}</p></article>`
        )
        .join('')}
    </div>
  </section>
  <section id="gallery" class="surface-deep">
    <span class="section-kicker reveal">${brief.mode === 'food' ? 'The food' : 'The people'}</span>
    <h2 class="reveal">${esc(brief.galleryHeading)}</h2>
    <div class="card-grid">
      <figure class="media-card reveal"><img loading="lazy" src="assets/collage-4.webp" alt="${esc(brief.imageAlts[3])}" width="1200" height="1500"></figure>
      <figure class="media-card reveal"><img loading="lazy" src="assets/collage-5.webp" alt="${esc(brief.imageAlts[4])}" width="1200" height="1500"></figure>
    </div>
    <p class="disclosure reveal" style="margin-top:18px">${esc(brief.imageDisclosure)}</p>
  </section>
  <section id="visit">
    <span class="section-kicker reveal">Visit and contact</span>
    <h2 class="reveal">${esc(brief.contactHeading)}</h2>
    <div class="contact-grid">
      ${brief.address ? `<article class="card reveal"><span class="section-kicker">Address</span><p>${esc(brief.address)}</p><a class="button button-quiet" href="${esc(maps)}">Directions</a></article>` : ''}
      ${brief.phone ? `<article class="card reveal"><span class="section-kicker">Phone</span><p><a href="tel:${phoneDigits}">${esc(brief.phone)}</a></p></article>` : ''}
      ${brief.hours ? `<article class="card reveal"><span class="section-kicker">Hours</span><p>${esc(brief.hours)}</p></article>` : `<article class="card reveal"><span class="section-kicker">Hours</span><p>Confirm current hours on the official source.</p></article>`}
    </div>
  </section>
  ${
    brief.logo
      ? `<div class="logo-finale" aria-hidden="true"><img src="assets/logo.png" alt=""></div>`
      : ''
  }
</main>
<footer class="footer">
  <strong>${esc(brief.name)}</strong>
  <p class="disclosure">Private Momentum 360 concept. noindex. Not the live website. ${esc(brief.imageDisclosure)} Confirm services, hours, and pricing with the business.</p>
  ${brief.url ? `<a href="${esc(brief.url)}">Official website</a>` : ''}
</footer>
<div class="mobile-action"><a class="button" href="${esc(ctaHref)}">${esc(ctaLabel)}</a></div>
<script>
(() => {
  const header = document.querySelector('.site-header');
  const nodes = [...document.querySelectorAll('.reveal')];
  const show = (n) => n.classList.add('visible');
  if (!('IntersectionObserver' in window)) { nodes.forEach(show); }
  else {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { threshold: .12 });
    nodes.forEach((n) => io.observe(n));
  }
  addEventListener('scroll', () => header && header.classList.toggle('is-scrolled', scrollY > 12), { passive: true });
  const frame = document.querySelector('[data-swipe]');
  if (!frame) return;
  const imgs = [...frame.querySelectorAll('img')];
  const dots = [...document.querySelectorAll('.swipe-dots button')];
  const cap = document.querySelector('.hero-visual figcaption strong');
  const kick = document.querySelector('.hero-visual figcaption span');
  const captions = ${JSON.stringify(caps.slice(0, 3))};
  let i = 0;
  const go = (n) => {
    i = (n + imgs.length) % imgs.length;
    imgs.forEach((im, idx) => im.classList.toggle('is-on', idx === i));
    dots.forEach((d, idx) => d.classList.toggle('is-on', idx === i));
    if (captions[i] && cap && kick) { kick.textContent = captions[i].kicker; cap.textContent = captions[i].line; }
  };
  dots.forEach((d) => d.addEventListener('click', () => go(Number(d.dataset.slide))));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    let t = setInterval(() => go(i + 1), 4200);
    frame.addEventListener('pointerenter', () => clearInterval(t));
    frame.addEventListener('pointerleave', () => { t = setInterval(() => go(i + 1), 4200); });
  }
  let x0 = 0;
  frame.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  frame.addEventListener('pointerup', (e) => {
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
  });
})();
</script>
</body></html>`;
}

module.exports = { renderSite, contrastOn };
