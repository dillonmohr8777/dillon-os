'use strict';

const { captionsFor, bodyCaptionsFor } = require('./intent');
const { buildSkinCss, inferAttitude } = require('../../_templates/site-factory/lib/skins');

const esc = (s) =>
  String(s ?? '')
    .replace(/[\u2014\u2013]/g, '-')
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
  return y > 155 ? '#090909' : '#FFFFFF';
}

function jsonLd(brief) {
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: brief.name,
    url: brief.url || undefined,
    image: 'assets/collage-1.webp',
  };
  if (brief.phone) obj.telephone = brief.phone;
  if (brief.address) obj.address = { '@type': 'PostalAddress', streetAddress: brief.address };
  return JSON.stringify(obj);
}

function proofItems(brief) {
  const items = [];
  if (brief.city) items.push({ k: 'Place', v: brief.city });
  if (brief.phone) items.push({ k: 'Call', v: brief.phone });
  if (brief.hours) items.push({ k: 'Hours', v: brief.hours });
  items.push({ k: 'Preview', v: 'Private concept. Details stay with them.' });
  return items.slice(0, 4);
}

function css(brief) {
  const t = brief.tokens;
  const attitude = inferAttitude(brief);
  return `
:root{
  --paper:${t.paper};--ink:${t.ink};--accent:${t.accent};--accent2:${t.accent2};
  --panel:${t.panel};--deep:${t.deep};--on-paper:${t.onPaper};--on-accent:${t.onAccent};
  --on-deep:${t.onDeep};--radius:${t.radius || '16px'};--border:${t.border || '1px'};
  --ease:cubic-bezier(.2,.8,.2,1);
  --display:"${brief.fonts.display}",${brief.fonts.displayFallback || 'Georgia,serif'};
  --text:"${brief.fonts.text}",system-ui,sans-serif;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;overflow-x:clip}
body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 var(--text);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}
a{color:inherit}
:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
.skip-link{position:absolute;left:12px;top:-80px;background:var(--ink);color:#fff;padding:10px 14px;z-index:40}
.skip-link:focus{top:12px}
.wrap{width:min(92vw,1180px);margin-inline:auto}
.site-header{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:12px 5vw;background:color-mix(in srgb,var(--paper) 82%,transparent);backdrop-filter:blur(18px);border-bottom:var(--border) solid color-mix(in srgb,var(--ink) 12%,transparent)}
.brand{display:flex;align-items:center;min-height:48px;text-decoration:none}
.brand-logo{height:52px;width:auto;max-width:min(48vw,240px);object-fit:contain;object-position:left center}
.wordmark{font:800 1.15rem/1 var(--display);letter-spacing:-.03em}
.site-header nav{display:flex;gap:18px}
.site-header nav a{min-height:44px;display:inline-flex;align-items:center;text-decoration:none;font-weight:700}
.button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:12px 20px;border-radius:999px;background:var(--accent);color:var(--on-accent);font-weight:800;text-decoration:none;border:0;transition:transform .28s var(--ease)}
.button:hover,.button:focus-visible{transform:translateY(-2px)}
.button-quiet{background:transparent;color:inherit;border:var(--border) solid color-mix(in srgb,currentColor 28%,transparent)}
.hero{position:relative;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(280px,.95fr);gap:clamp(28px,6vw,72px);align-items:center;padding:clamp(48px,8vw,110px) 5vw}
.hero h1{margin:0 0 16px;font:700 clamp(3.6rem,7vw,7rem)/.92 var(--display);letter-spacing:-.05em;text-wrap:balance}
.hero-copy>p{max-width:42ch;font-size:1.12rem;text-wrap:pretty}
.hero-points{list-style:none;padding:0;margin:28px 0 0;display:grid;gap:10px;font-weight:800}
.hero-points li{display:flex;gap:10px;align-items:center}
.hero-points li:before{content:"";width:8px;height:8px;border-radius:50%;background:var(--accent);flex:none}
.hero-media{margin:0}
.hero-media figure{margin:0;position:relative;filter:drop-shadow(0 30px 34px color-mix(in srgb,var(--deep) 28%,transparent))}
.image-frame{position:relative;aspect-ratio:4/5;overflow:hidden;border-radius:var(--radius);border:var(--border) solid color-mix(in srgb,var(--accent) 55%,transparent);background:var(--deep)}
.image-frame::after,.split figure::after,.moments figure::after,.cinematic-frame::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:2;opacity:.2;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23g)'/></svg>");background-size:160px 160px}
.split figure,.moments figure,.cinematic-frame{position:relative}
.slides{position:absolute;inset:0}
.slides img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.08);transition:opacity 1s var(--ease),transform 7s linear}
.slides img.is-on{opacity:1;transform:scale(1);z-index:1}
.hero-media:hover .slides img.is-on{transform:scale(1.045)}
.hero-media figcaption{position:absolute;right:-14px;bottom:22px;z-index:3;max-width:250px;padding:18px 20px;border-radius:calc(var(--radius) - 2px);background:color-mix(in srgb,var(--deep) 94%,transparent);color:var(--on-deep);border:1px solid hsla(0,0%,100%,.22)}
.hero-media figcaption span{display:block;color:var(--accent);font:800 10px var(--display);letter-spacing:.13em;text-transform:uppercase;margin-bottom:5px}
.hero-media figcaption strong{display:block;font:700 15px/1.4 var(--display)}
.swipe-dots{display:flex;gap:8px;justify-content:center;margin-top:14px}
.swipe-dots button{width:8px;height:8px;padding:0;border:0;background:transparent;min-width:44px;min-height:44px;display:grid;place-items:center}
.swipe-dots button::after{content:"";width:8px;height:8px;border-radius:50%;background:color-mix(in srgb,var(--ink) 25%,transparent)}
.swipe-dots button.is-on::after{background:var(--accent)}
section{padding:clamp(72px,10vw,140px) 5vw}
.section-head{margin-bottom:28px}
.section-kicker{display:block;margin-bottom:10px;font:800 .72rem var(--display);letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
h2{margin:0 0 18px;font:700 clamp(2.6rem,5.2vw,5.6rem)/.95 var(--display);letter-spacing:-.04em;text-wrap:balance}
.proof{padding:clamp(28px,4vw,48px) 5vw}
.proof-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr));gap:12px}
.proof-grid article{padding:18px;border:var(--border) solid color-mix(in srgb,currentColor 16%,transparent);border-radius:var(--radius)}
.proof-grid span{display:block;font:800 .7rem var(--display);letter-spacing:.14em;text-transform:uppercase;opacity:.7;margin-bottom:6px}
.offer-grid,.experience-grid,.contact-grid,.catalog-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr));gap:16px}
.offering-card,.experience-grid article,.contact-card,.catalog-card{padding:22px;border-radius:var(--radius);background:color-mix(in srgb,var(--panel) 80%,var(--paper));border:var(--border) solid color-mix(in srgb,var(--ink) 10%,transparent)}
.offering-card h3,.experience-grid h3{margin:8px 0 10px;font:700 1.35rem/1.15 var(--display)}
.split{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.9fr);gap:clamp(24px,5vw,56px);align-items:center}
.split figure{margin:0;overflow:hidden;border-radius:var(--radius);border:var(--border) solid color-mix(in srgb,var(--accent) 35%,transparent)}
.split img{width:100%;height:100%;min-height:28rem;object-fit:cover;aspect-ratio:4/5}
.cinematic{padding:0;position:relative}
.cinematic-frame{margin:0;overflow:hidden;min-height:min(58vh,640px)}
.cinematic-frame img{width:100%;height:min(58vh,640px);object-fit:cover;display:block;animation:cinePush 8s var(--ease) both}
.cinematic-frame figcaption{position:absolute;left:5vw;bottom:1.6rem;z-index:3;color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.55);font:700 clamp(1.4rem,3vw,2.6rem)/1.1 var(--display);max-width:18ch}
.moments-section .moments{display:grid;grid-template-columns:1.08fr .92fr;gap:clamp(12px,2vw,22px);align-items:start}
.moments figure{margin:0;overflow:hidden;border-radius:var(--radius);min-height:24rem;border:var(--border) solid color-mix(in srgb,var(--accent) 30%,transparent)}
.moments figure:nth-child(2){margin-top:11vh}
.moments img{width:100%;height:100%;object-fit:cover;min-height:24rem;transition:transform 1.1s var(--ease)}
.moments figure:hover img{transform:scale(1.04)}
@keyframes cinePush{from{transform:scale(1.08)}to{transform:scale(1)}}
.surface-deep{background:var(--deep);color:var(--on-deep)}
.surface-accent{background:var(--accent);color:var(--on-accent)}
.surface-panel{background:var(--panel)}
.closing{text-align:center}
.closing h2{max-width:18ch;margin-inline:auto}
.logo-finale{min-height:28vh;display:grid;place-items:center;padding:10vh 5vw}
.logo-finale img{width:min(70vw,380px);height:auto;max-height:22vh;object-fit:contain}
.mobile-action{display:none;position:fixed;left:12px;right:12px;bottom:12px;z-index:40}
.mobile-action .button{width:100%}
.footer{padding:48px 5vw 110px;display:grid;gap:14px;border-top:var(--border) solid color-mix(in srgb,var(--ink) 12%,transparent)}
.disclosure{opacity:.78;font-size:.9rem;max-width:66ch;text-wrap:pretty}
.marquee-strip{overflow:hidden;position:relative;background:var(--deep);color:var(--on-deep)}
.marquee-strip:before,.marquee-strip:after{content:"";position:absolute;left:0;right:0;height:8px;z-index:2;background:linear-gradient(90deg,var(--accent),color-mix(in srgb,var(--accent) 40%,white),var(--accent2),var(--accent));background-size:240% 100%;animation:lineSwipe 3.4s linear infinite}
.marquee-strip:after{bottom:0;top:auto}
.ticker-track{display:flex;gap:48px;white-space:nowrap;animation:ticker 28s linear infinite;font:800 .9rem var(--display);letter-spacing:.18em;text-transform:uppercase;padding:16px 0}
@keyframes ticker{to{transform:translateX(-50%)}}
@keyframes lineSwipe{to{background-position:-240% 0}}
.reveal{opacity:1}
.js .reveal{opacity:0;transform:translateY(28px);filter:blur(6px);transition:opacity .7s var(--ease),transform .7s var(--ease),filter .7s var(--ease)}
.js .reveal.reveal-left{transform:translateX(-32px)}
.js .reveal.reveal-right{transform:translateX(32px)}
.js .delay-1{transition-delay:.12s}
.js .delay-2{transition-delay:.24s}
.js .delay-3{transition-delay:.36s}
.js .reveal.visible{opacity:1;transform:none;filter:none}
.vanish-out{transition:opacity .6s var(--ease),filter .6s var(--ease)}
.js .vanish-out.is-away{opacity:.18;filter:blur(4px)}
@media(max-width:850px){
  .hero,.split,.moments-section .moments{grid-template-columns:1fr}
  .moments figure:nth-child(2){margin-top:0}
  .hero{padding-top:28px}
  .hero-media{width:min(100%,440px);margin-inline:auto}
  .hero-media figcaption{right:8px}
  .site-header nav{display:none}
  .mobile-action{display:block}
}
@media(max-width:520px){
  .hero h1{font-size:clamp(2.6rem,12vw,3.6rem)}
}
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .js .reveal,.js .reveal.visible{opacity:1!important;transform:none!important;filter:none!important;transition:none!important}
  .slides img,.cinematic-frame img{transition:none;transform:none;animation:none}
  .ticker-track,.marquee-strip:before,.marquee-strip:after{animation:none}
  *{animation-duration:.01ms!important;transition-duration:.01ms!important}
}
${buildSkinCss({ ...brief, attitude })}
`;
}

function renderSite(brief) {
  const caps = captionsFor(brief.family);
  const bodyCaps = bodyCaptionsFor(brief.mode || (brief.family === 'food' ? 'food' : 'people'));
  const alts = brief.imageAlts || [];
  const alt = (i, fallback) => esc(alts[i] || fallback || brief.name);
  const points = (brief.points || []).slice(0, 3);
  const offerings = (brief.offerings || []).slice(0, 3);
  const experience = (brief.experience || []).slice(0, 3);
  const catalog = (brief.catalog || []).slice(0, 4);
  const proof = proofItems(brief);
  const logoSrc = brief.logoSrc || 'assets/logo.png';
  const logo = brief.logo
    ? `<img class="brand-logo" src="${esc(logoSrc)}" alt="${esc(brief.name)}">`
    : `<span class="wordmark">${esc(brief.name)}</span>`;
  const phoneDigits = String(brief.phone || '').replace(/\D/g, '');
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brief.address || `${brief.name} ${brief.city || ''}`)}`;
  const ctaHref = phoneDigits ? `tel:${phoneDigits}` : brief.url || '#visit';
  const ctaLabel = phoneDigits
    ? `Call ${brief.phone}`
    : brief.primaryCtaFallback || 'Open official site';
  const slides = [1, 2, 3, 4, 5]
    .map(
      (n, i) =>
        `<img class="slide${i === 0 ? ' is-on' : ''}" src="assets/collage-${n}.webp" alt="${alt(n - 1, brief.name)}" ${i === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} width="960" height="1200">`
    )
    .join('');
  const dots = [1, 2, 3, 4, 5]
    .map((n, i) => `<button type="button" class="${i === 0 ? 'is-on' : ''}" data-slide="${i}" aria-label="Show image ${n}"></button>`)
    .join('');
  const tickerBits = (brief.marquee || [brief.name, brief.city, brief.category]).filter(Boolean);
  const ticker = tickerBits.concat(tickerBits).join(' · ');
  const fonts = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(brief.fonts.display).replace(/%20/g, '+')}:wght@500;700&family=${encodeURIComponent(brief.fonts.text).replace(/%20/g, '+')}:wght@400;700&display=swap`;

  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<meta name="theme-color" content="${esc(brief.tokens.deep)}">
<title>${esc(brief.name)} | ${esc(brief.city || 'Concept')}</title>
<meta name="description" content="${esc(brief.description)}">
<script type="application/ld+json">${jsonLd(brief)}</script>
<script>document.documentElement.classList.replace('no-js','js')||document.documentElement.classList.add('js')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fonts}" rel="stylesheet">
<style>${css(brief)}</style>
</head>
<body class="profile-page slug-${esc(brief.slug)} family-${esc(brief.family)} attitude-${esc(brief.attitude || 'warm')}">
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <a class="brand" href="#top">${logo}</a>
  <nav aria-label="Primary"><a href="#work">${esc(brief.navWork || 'Work')}</a><a href="#story">${esc(brief.navStory || 'Story')}</a><a href="#visit">${esc(brief.navVisit || 'Visit')}</a></nav>
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
        ${brief.url && ctaHref !== brief.url ? `<a class="button button-quiet" href="${esc(brief.url)}">Official site</a>` : ''}
      </div>
      <ul class="hero-points">${points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    </div>
    <div class="hero-media reveal">
      <figure>
        <div class="image-frame" data-swipe>
          <div class="slides">${slides}</div>
        </div>
        <figcaption>
          <span>${esc(caps[0].kicker)}</span>
          <strong>${esc(caps[0].line)}</strong>
        </figcaption>
      </figure>
      <div class="swipe-dots" role="tablist" aria-label="Hero images">${dots}</div>
    </div>
  </section>
  <div class="marquee-strip" aria-hidden="true"><div class="ticker-track"><span>${esc(ticker)}</span><span>${esc(ticker)}</span></div></div>
  <section class="proof surface-panel vanish-out">
    <div class="proof-grid">
      ${proof.map((p) => `<article class="reveal"><span>${esc(p.k)}</span><strong>${esc(p.v)}</strong></article>`).join('')}
    </div>
  </section>
  <section class="cinematic vanish-out" aria-label="${esc(bodyCaps[0].kicker)}">
    <figure class="cinematic-frame">
      <img loading="lazy" src="assets/collage-6.webp" alt="${alt(5, bodyCaps[0].line)}" width="1200" height="675">
      <figcaption class="reveal">${esc(bodyCaps[0].line)}</figcaption>
    </figure>
  </section>
  <section class="offerings" id="work">
    <div class="section-head reveal">
      <span class="section-kicker">How this place works</span>
      <h2>${esc(brief.workHeading)}</h2>
    </div>
    <div class="offer-grid">
      ${offerings
        .map(
          (item, i) =>
            `<article class="offering-card reveal delay-${i + 1}"><span class="section-kicker">0${i + 1}</span><h3>${esc(item.title || item)}</h3><p>${esc(item.body || item)}</p></article>`
        )
        .join('')}
    </div>
  </section>
  <section class="story surface-deep" id="story">
    <div class="split">
      <div class="reveal">
        <span class="section-kicker">Story</span>
        <h2>${esc(brief.storyHeading)}</h2>
        <p>${esc(brief.story)}</p>
        <p>${esc(brief.storyMore)}</p>
      </div>
      <figure class="reveal reveal-right"><img loading="lazy" src="assets/collage-7.webp" alt="${alt(6, bodyCaps[1].line)}" width="960" height="1200"></figure>
    </div>
  </section>
  <section class="moments-section vanish-out" id="gallery">
    <div class="section-head reveal">
      <span class="section-kicker">${brief.mode === 'food' ? 'The food' : 'The people'}</span>
      <h2>${esc(brief.galleryHeading)}</h2>
    </div>
    <div class="moments">
      <figure class="reveal reveal-left"><img loading="lazy" src="assets/collage-8.webp" alt="${alt(7, bodyCaps[2].line)}" width="960" height="1200"></figure>
      <figure class="reveal reveal-right delay-1"><img loading="lazy" src="assets/collage-9.webp" alt="${alt(8, bodyCaps[3].line)}" width="960" height="1200"></figure>
    </div>
    <p class="disclosure reveal" style="margin-top:18px">${esc(brief.imageDisclosure)}</p>
  </section>
  <section class="feature surface-panel">
    <div class="split">
      <figure class="reveal reveal-left"><img loading="lazy" src="assets/collage-10.webp" alt="${alt(9, bodyCaps[4].line)}" width="960" height="1200"></figure>
      <div class="reveal">
        <span class="section-kicker">The craft</span>
        <h2>${esc(brief.featureHeading)}</h2>
        <p>${esc(brief.featureBody)}</p>
      </div>
    </div>
  </section>
  <section class="experience">
    <div class="section-head reveal">
      <span class="section-kicker">The visit</span>
      <h2>What showing up should feel like.</h2>
    </div>
    <div class="experience-grid">
      ${experience
        .map(
          (item, i) =>
            `<article class="reveal"><span class="section-kicker">0${i + 1}</span><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p></article>`
        )
        .join('')}
    </div>
  </section>
  ${
    catalog.length
      ? `<section class="catalog surface-panel" id="catalog">
    <div class="section-head reveal">
      <span class="section-kicker">Go further</span>
      <h2>Where the real details live.</h2>
    </div>
    <div class="catalog-grid">
      ${catalog
        .map(
          (item, i) =>
            `<article class="catalog-card reveal delay-${i + 1}"><span class="section-kicker">0${i + 1}</span><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p>${item.href ? `<a class="button button-quiet" href="${esc(item.href)}">${esc(item.title)}</a>` : ''}</article>`
        )
        .join('')}
    </div>
  </section>`
      : ''
  }
  <section class="contact-system" id="visit">
    <div class="section-head reveal">
      <span class="section-kicker">Visit and contact</span>
      <h2>${esc(brief.contactHeading)}</h2>
    </div>
    <div class="contact-grid">
      ${brief.address ? `<article class="contact-card reveal"><span class="section-kicker">Address</span><p>${esc(brief.address)}</p><a class="button button-quiet" href="${esc(maps)}">Directions</a></article>` : ''}
      ${brief.phone ? `<article class="contact-card reveal"><span class="section-kicker">Phone</span><p><a href="tel:${phoneDigits}">${esc(brief.phone)}</a></p></article>` : ''}
      <article class="contact-card reveal"><span class="section-kicker">Hours</span><p>${esc(brief.hours || 'Hours stay on the official site so this preview never guesses.')}</p></article>
    </div>
  </section>
  <section class="closing surface-accent">
    <div class="reveal">
      <span class="section-kicker">Next</span>
      <h2>${esc(brief.closing)}</h2>
      <p style="margin:18px auto 28px;max-width:42ch">${esc(brief.imageDisclosure)}</p>
      <a class="button" href="${esc(ctaHref)}" style="background:var(--on-accent);color:var(--accent)">${esc(ctaLabel)}</a>
    </div>
  </section>
  ${brief.logo ? `<div class="logo-finale" aria-hidden="true"><img src="${esc(logoSrc)}" alt=""></div>` : ''}
</main>
<footer class="footer">
  <strong>${esc(brief.name)}</strong>
  <p class="disclosure">Private Momentum 360 concept. noindex. Not the live website. ${esc(brief.imageDisclosure)} Services, hours, and pricing stay with the business.</p>
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
    const vanish = [...document.querySelectorAll('.vanish-out')];
    const vo = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-away', !e.isIntersecting && e.boundingClientRect.top < 0)), { threshold: 0 });
    vanish.forEach((n) => vo.observe(n));
  }
  addEventListener('scroll', () => header && header.classList.toggle('is-scrolled', scrollY > 12), { passive: true });
  const frame = document.querySelector('[data-swipe]');
  if (!frame) return;
  const imgs = [...frame.querySelectorAll('img')];
  const dots = [...document.querySelectorAll('.swipe-dots button')];
  const cap = document.querySelector('.hero-media figcaption strong');
  const kick = document.querySelector('.hero-media figcaption span');
  const captions = ${JSON.stringify(caps)};
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

module.exports = { renderSite, contrastOn, jsonLd, proofItems };
