#!/usr/bin/env node
/**
 * Momentum site factory.
 * Generates a complete single-page profile site (the Philly-25 template system)
 * from a JSON brief. Plain Node, no dependencies.
 *
 *   node _templates/site-factory/build-site.js path/to/brief.json [output-dir]
 *
 * Also requireable for batch runs: require('./build-site.js').buildSite(brief, outRoot)
 *
 * Output: <output-dir>/<slug>/index.html plus an assets/ folder you fill with
 * image-1.webp ... image-N.webp and logo.png (see README.md).
 * Design contract: philly-sites/DESIGN-SYSTEM.md
 */
const fs = require('fs');
const path = require('path');
const { assertSafeSlug } = require('./lib/validate.js');
const { buildSkinCss, inferAttitude } = require('./lib/skins.js');

function readPngSize(file) {
  try {
    const buf = fs.readFileSync(file);
    if (buf.length < 24 || buf[0] !== 0x89 || buf[1] !== 0x50) return null;
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    if (!width || !height) return null;
    return { width, height };
  } catch {
    return null;
  }
}

/**
 * Render a brief into a finished site directory.
 * Returns { outDir, htmlBytes, sections, words, images, missingAssets }.
 */
function buildSite(brief, outRoot) {
const baseCss = fs.readFileSync(path.join(__dirname, 'base.css'), 'utf8');

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
const DANGLE =
  /(?:\s+(?:a|an|the|and|or|but|nor|not|so|for|with|to|of|in|on|at|by|from|as|than|then|if|when|because)|,|;|:)\s*$/i;
const cleanWords = (s) =>
  String(s || '')
    .replace(/<\/?mark>/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .replace(/\s+([.!?])/g, '$1')
    .trim();
const completePhrase = (s) => {
  let t = cleanWords(s).replace(/[,\s]+$/g, '').trim();
  while (t && DANGLE.test(t)) t = t.replace(DANGLE, '').trim();
  return t;
};
const plainHeading = (s, fallback = '') => {
  const cleaned = completePhrase(s);
  const chosen = cleaned.length >= 3 ? cleaned : completePhrase(fallback);
  return esc(chosen);
};

const required = ['slug', 'name', 'city', 'tokens', 'fonts', 'hero'];
for (const key of required) {
  if (!brief[key]) {
    throw new Error(`Brief is missing required field: ${key}`);
  }
}
assertSafeSlug(brief.slug);
const logoFile = path.join(outRoot, brief.slug, 'assets', 'logo.png');
const logoSize = brief.logo === false ? null : readPngSize(logoFile);

const t = brief.tokens;
const tokenDefaults = {
  onPaper: '#090909', onAccent: '#FFFFFF', onAccent2: '#090909',
  onPanel: '#090909', onDeep: '#FFFFFF', border: '2px', radius: '12px',
};
for (const [k, v] of Object.entries(tokenDefaults)) t[k] = t[k] || v;

const fontFallback = brief.fonts.displayFallback || 'Georgia,serif';
const rootBlock =
  `:root{--paper:${t.paper};--ink:${t.ink};--accent:${t.accent};--accent2:${t.accent2};` +
  `--panel:${t.panel};--deep:${t.deep};--on-paper:${t.onPaper};--on-accent:${t.onAccent};` +
  `--on-accent2:${t.onAccent2};--on-panel:${t.onPanel};--on-deep:${t.onDeep};` +
  `--border:${t.border};--radius:${t.radius};--display:'${brief.fonts.display}',${fontFallback}}`;

const fontFamilies = [brief.fonts.display, brief.fonts.text]
  .filter(Boolean)
  .map((f) => `family=${f.trim().replace(/ /g, '+')}:wght@400;500;600;700;800;900`)
  .join('&');

const images = brief.images || [];
const usedImageIndexes = new Set();
const maxImageIndex = Math.max(images.length || 0, 12);
const claimImageIndex = (preferred) => {
  const want = Number(preferred);
  if (Number.isFinite(want) && want > 0 && !usedImageIndexes.has(want)) {
    usedImageIndexes.add(want);
    return want;
  }
  for (let i = 1; i <= maxImageIndex; i++) {
    if (!usedImageIndexes.has(i)) {
      usedImageIndexes.add(i);
      return i;
    }
  }
  return 0;
};
const img = (n, opts = {}) => {
  if (!n) return '';
  const meta = images[n - 1] || {};
  const file = meta.file || `image-${n}.webp`;
  const alt = esc(meta.alt || brief.name);
  const eager = opts.eager ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
  return `<img${eager} src="assets/${file}" alt="${alt}">`;
};
const figure = (n, opts = {}) => {
  const idx = claimImageIndex(n);
  if (!idx) return '';
  const cap = opts.caption ? `<figcaption>${esc(opts.caption)}</figcaption>` : '';
  const live = idx % 2 === 1 ? ' live-frame' : ' still-frame';
  return `<figure class="media-figure${live}" data-hover>${img(idx, opts)}${cap}</figure>`;
};

const capSentence = (s) => {
  const t = String(s || '').trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const supportingCopy = () => {
  const bits = [`${brief.name} in ${brief.city}.`];
  if (brief.phone) bits.push(`Call ${brief.phone}.`);
  else if (brief.url) bits.push('Open the official site for details.');
  return bits.join(' ');
};
const cardCopy = (item) => {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    const title = completePhrase(item.title || item.heading || '');
    const text = String(item.text || item.body || '').trim();
    if (title && text) return { title, text };
    if (title) return { title, text: supportingCopy() };
    if (text) return cardCopy(text);
  }
  const raw = cleanWords(item);
  if (!raw) return { title: '', text: '' };
  const two = raw.match(/^(.+?[.!?])\s+(.+)$/s);
  if (two && two[2].trim().length > 8) {
    const title = completePhrase(two[1].replace(/[.!?]+$/, ''));
    if (title.length >= 8 && !DANGLE.test(title)) {
      return { title, text: capSentence(two[2]) };
    }
  }
  return { title: completePhrase(raw.replace(/[.!?]+$/, '')), text: supportingCopy() };
};
const catalogBlurb = (item) => {
  if (item && item.text) return String(item.text).trim();
  const title = (item && item.title) || 'Details';
  const bits = [`${title} at ${brief.name} in ${brief.city}.`];
  if (brief.phone) bits.push(`Call ${brief.phone}.`);
  else if (brief.url) bits.push('Open the official site for details.');
  if (brief.hours) bits.push(brief.hours.replace(/\.+$/, '') + '.');
  return bits.join(' ');
};

const cta = (c, cls = 'button button-primary') =>
  c ? `<a class="${cls}" href="${esc(c.href)}">${esc(c.label)}<span aria-hidden="true">\u2197</span></a>` : '';

const sectionKicker = (text) => (text ? `<span class="section-kicker">${esc(text)}</span>` : '');

const marqueeHtml = (phrases) => {
  const list = (phrases || []).filter(Boolean);
  if (!list.length) return '';
  const loop = list.concat(list).map((p) => `<span>${esc(p)}</span>`).join('');
  return `<div class="marquee-strip" aria-hidden="true"><div class="marquee-track">${loop}${loop}</div></div>`;
};

// Alternate surfaces so no two adjacent sections match (DESIGN-SYSTEM.md rhythm rule).
let lastSurface = '';
const surfaceOrder = ['paper', 'accent', 'panel', 'deep'];
const pickSurface = (preferred) => {
  let s = preferred;
  if (!s || s === lastSurface) {
    s = surfaceOrder.find((x) => x !== lastSurface);
  }
  lastSurface = s;
  return `surface-${s}`;
};

const builders = {
  hero(d) {
    lastSurface = 'paper';
    const float = d.glassFloat
      ? `<div class="glass-panel glass-float"><strong>${esc(d.glassFloat.title || brief.name)}</strong><span>${esc(d.glassFloat.sub || brief.city)}</span></div>`
      : `<div class="glass-panel glass-float"><strong>${esc(brief.name)}</strong><span>${esc(brief.city)}</span></div>`;
    return `<section class="hero surface-paper vanish-out" id="top"><div class="hero-copy reveal"><span class="eyebrow">${esc(d.eyebrow || `${brief.city} | ${brief.category || ''}`)}</span><h1>${plainHeading(d.headline, brief.name)}</h1><p>${esc(d.sub || brief.description || '')}</p><div class="button-row">${cta(d.ctaPrimary)}${cta(d.ctaSecondary, 'button button-secondary')}</div></div><div class="hero-media reveal reveal-right">${figure(1, { eager: true })}${float}</div></section>${marqueeHtml(d.marquee || brief.marquee)}`;
  },
  offerings(d) {
    const cards = d.items
      .map((item, i) => {
        const { title, text } = cardCopy(item);
        return `<article class="offering-card reveal delay-${(i % 3) + 1}"><span>0${i + 1}</span><h3>${esc(title)}</h3>${text ? `<p>${esc(text)}</p>` : ''}</article>`;
      })
      .join('');
    return `<section class="offerings ${pickSurface(d.surface || 'accent')} vanish-out" id="offerings"><header class="section-head reveal">${sectionKicker(d.kicker || 'What to explore')}<h2>${plainHeading(d.heading, 'What they actually do.')}</h2></header><div class="offering-grid">${cards}</div></section>`;
  },
  proof() {
    return '';
  },
  gallery(d) {
    const figs = (d.imageIndexes || [3, 4, 5, 6, 7]).map((n) => figure(n)).join('');
    return `<section class="gallery ${pickSurface(d.surface || 'paper')} vanish-out" id="gallery"><header class="section-head reveal"><h2>${plainHeading(d.heading, 'See what makes this place distinct.')}</h2></header><div class="gallery-rail" data-filmstrip>${figs}</div></section>`;
  },
  story(d) {
    const paras = (d.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('');
    return `<section class="story ${pickSurface(d.surface || 'deep')} vanish-out"><div class="story-copy reveal reveal-left"><h2>${plainHeading(d.heading, 'About')}</h2>${paras}</div><div class="reveal reveal-right">${figure(d.imageIndex || 2)}</div></section>`;
  },
  experience(d) {
    const cards = d.items
      .map((item, i) => {
        const { title, text } = cardCopy(item);
        return `<article class="reveal delay-${(i % 3) + 1}"><span>0${i + 1}</span><h3>${esc(title)}</h3>${text ? `<p>${esc(text)}</p>` : ''}</article>`;
      })
      .join('');
    return `<section class="experience ${pickSurface(d.surface || 'panel')} vanish-out"><header class="section-head reveal"><h2>${plainHeading(d.heading, 'Built around the details.')}</h2></header><div class="experience-grid">${cards}</div></section>`;
  },
  feature(d) {
    return `<section class="feature ${pickSurface(d.surface || 'accent')} vanish-out"><div class="reveal reveal-left">${figure(d.imageIndex || 8)}</div><div class="feature-copy reveal reveal-right"><h2>${plainHeading(d.heading)}</h2><p>${esc(d.text || '')}</p>${cta(d.cta, 'button button-secondary')}</div></section>`;
  },
  spotlight(d) {
    if (!d.heading) return '';
    return `<section class="spotlight ${pickSurface(d.surface || 'panel')} vanish-out"><div class="feature-copy reveal reveal-left"><h2>${plainHeading(d.heading)}</h2><p>${esc(d.text || '')}</p>${cta(d.cta, 'button button-secondary')}</div><div class="reveal reveal-right">${figure(d.imageIndex || 6)}</div></section>`;
  },
  catalog(d) {
    const cards = d.items
      .map((item, i) => {
        const blurb = catalogBlurb(item);
        return `<article class="catalog-card reveal delay-${(i % 3) + 1}">${figure(item.imageIndex || 9 + i)}<h3>${esc(completePhrase(item.title))}</h3>${blurb ? `<p>${esc(blurb)}</p>` : ''}<a href="${esc(item.href)}">Explore \u2197</a></article>`;
      })
      .join('');
    return `<section class="catalog ${pickSurface(d.surface || 'deep')} vanish-out"><header class="section-head reveal"><h2>${plainHeading(d.heading, 'More ways into the experience.')}</h2></header><div class="catalog-grid">${cards}</div></section>`;
  },
  social(d) {
    const indexes = d.imageIndexes || [3, 4, 5, 6, 7, 8];
    const captions = d.captions || [];
    const figs = indexes
      .map((n, i) => figure(n, { caption: captions[i] || 'From their feed' }))
      .join('');
    if (!figs) return '';
    return `<aside class="social-strip ${pickSurface(d.surface || 'paper')} vanish-out" id="social"><header class="section-head reveal">${sectionKicker(d.kicker || 'Pulled from their world')}<h2>${plainHeading(d.heading, 'From their world.')}</h2></header><div class="social-rail">${figs}</div></aside>`;
  },
  contact(d) {
    const mapQuery = brief.address || `${brief.name}, ${brief.city}`;
    const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
    const mapsEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&hl=en&z=16&output=embed`;
    const phoneDigits = (brief.phone || '').replace(/\D/g, '');
    const cards = [
      brief.address &&
        `<article class="contact-card glass-panel reveal"><span>Address</span><strong>${esc(brief.address)}</strong><a class="button button-quiet" href="${esc(mapsHref)}">Open map<span aria-hidden="true">\u2197</span></a></article>`,
      !brief.address &&
        brief.city &&
        `<article class="contact-card glass-panel reveal"><span>Location</span><strong>${esc(brief.city)}</strong><a class="button button-quiet" href="${esc(mapsHref)}">Open map<span aria-hidden="true">\u2197</span></a></article>`,
      brief.phone &&
        `<article class="contact-card glass-panel reveal delay-1"><span>Telephone</span><strong><a href="tel:${phoneDigits}">${esc(brief.phone)}</a></strong></article>`,
      brief.hours &&
        `<article class="contact-card glass-panel reveal delay-2"><span>Hours</span><strong>${esc(brief.hours)}</strong>${brief.url ? `<a href="${esc(brief.url)}">Confirm on official site \u2197</a>` : ''}</article>`,
      d.extraCard &&
        `<article class="contact-card glass-panel reveal delay-3"><span>${esc(d.extraCard.label)}</span><strong>${esc(d.extraCard.title)}</strong>${cta(d.extraCard.cta, 'button button-quiet')}</article>`,
    ]
      .filter(Boolean)
      .join('');
    const mapFrame = `<figure class="map-embed"><iframe title="${esc(`Map of ${brief.name} in ${brief.city}`)}" src="${esc(mapsEmbed)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen=""></iframe></figure>`;
    return `<section class="contact-system ${pickSurface(d.surface || 'panel')} vanish-out" id="visit"><div class="section-kicker">Visit and contact</div><div class="contact-intro reveal"><h2>${plainHeading(d.heading, 'Make the next visit easy.')}</h2><p>${esc(d.sub || 'Verified details and direct official links, together in one place.')}</p></div><div class="contact-grid">${cards}</div>${mapFrame}</section>`;
  },
  closing(d) {
    const tag = d.kicker || brief.city || '';
    const sizeAttr = logoSize ? ` width="${logoSize.width}" height="${logoSize.height}"` : '';
    const logoVars = logoSize ? ` style="--logo-w:${logoSize.width}px;--logo-h:${logoSize.height}px"` : '';
    const mark =
      brief.logo === false
        ? `<span class="logo-outro-wordmark">${esc(brief.name)}</span><span class="logo-outro-wordmark logo-outro-ghost" aria-hidden="true">${esc(brief.name)}</span>`
        : `<img class="logo-outro-mark" src="assets/logo.png" alt="${esc(brief.name)}"${sizeAttr} decoding="sync" fetchpriority="high"><img class="logo-outro-ghost" src="assets/logo.png" alt="${esc(brief.name)}"${sizeAttr} decoding="async" aria-hidden="true">`;
    return `<section class="closing logo-outro surface-paper" aria-label="${esc(brief.name)} logo"><div class="ink-reveal reveal"${logoVars}>${mark}</div>${tag ? `<p class="logo-outro-tag">${esc(tag)}</p>` : ''}${cta(d.cta || (brief.hero && brief.hero.ctaPrimary))}</section>`;
  },
};

// Long homepage structure matching Philly-25 depth. social/spotlight only render when brief has content.
const defaultOrder = [
  'hero',
  'offerings',
  'gallery',
  'story',
  'experience',
  'feature',
  'spotlight',
  'catalog',
  'contact',
  'closing',
];
const sections = (brief.sections || defaultOrder)
  .map((name) => {
    const data = brief[name] || {};
    if (!builders[name]) {
      console.warn(`Unknown section "${name}" skipped.`);
      return '';
    }
    if (['offerings', 'proof', 'experience', 'catalog'].includes(name) && !(data.items && data.items.length)) return '';
    if (name === 'feature' && !data.heading) return '';
    if (name === 'spotlight' && !data.heading) return '';
    if (name === 'story' && !(data.paragraphs && data.paragraphs.length)) return '';
    if (name === 'social' && !(data.imageIndexes && data.imageIndexes.length) && !brief.social) return '';
    return builders[name](name === 'social' ? (brief.social || data) : data);
  })
  .join('');

const navLinks = (brief.nav || [
  { label: 'Explore', href: '#offerings' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Visit', href: '#visit' },
])
  .map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`)
  .join('');

const footerLinks = (brief.links || [])
  .map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)} \u2197</a></li>`)
  .join('');

const brand =
  brief.logo === false
    ? `<span class="wordmark">${esc(brief.name)}</span>`
    : `<img class="brand-logo" src="assets/logo.png" alt="${esc(brief.name)}"${logoSize ? ` width="${logoSize.width}" height="${logoSize.height}"` : ''} decoding="async">`;

const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': brief.schemaType || 'LocalBusiness',
  name: brief.name,
  ...(brief.url && { url: brief.url }),
  ...(brief.phone && { telephone: brief.phone }),
  ...(brief.address && { address: brief.address }),
});

const noindex = brief.noindex !== false ? '<meta name="robots" content="noindex,nofollow">' : '';
const disclosure = brief.noindex !== false
  ? '<div class="footer-disclosure"><span>Private staging concept</span><p>Noindex preview for review. Details and availability should be reconfirmed on the official website before publication.</p></div>'
  : `<div class="footer-disclosure"><span>${esc(brief.name)}</span><p>\u00a9 ${new Date().getFullYear()} ${esc(brief.name)}. All rights reserved.</p></div>`;

const primaryCta = brief.headerCta || (brief.hero && brief.hero.ctaPrimary);
const dockNav = (brief.nav || [
  { label: 'Explore', href: '#offerings' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Visit', href: '#visit' },
]);
const dockLeft = dockNav.slice(0, 2);
const dockRight = dockNav.slice(2, 4);
const dockCta = primaryCta || (brief.url ? { label: 'Visit site', href: brief.url } : null);
const inkMark = brief.logo === false
  ? `<span class="ink-mark wordmark">${esc(brief.name.split(' ')[0] || brief.name)}</span>`
  : `<img class="ink-mark" src="assets/logo.png" alt="${esc(brief.name)}"${logoSize ? ` width="${logoSize.width}" height="${logoSize.height}"` : ''} decoding="async">`;
const dockLinks = (items) => items.map((l) => `<a class="dock-link" href="${esc(l.href)}">${esc(l.label)}</a>`).join('');
const mobileBar = `<nav class="bottom-dock mobile-action" aria-label="Page"><div class="dock-cluster">${dockLinks(dockLeft)}</div><div class="ink-logo" data-ink-logo><canvas width="240" height="240" aria-hidden="true"></canvas>${inkMark}</div><div class="dock-cluster">${dockLinks(dockRight)}${dockCta ? cta(dockCta, 'button dock-cta') : ''}</div></nav>`;

const attitude = inferAttitude(brief);
const skinCss = buildSkinCss(brief);

const revealScript = `(()=>{const header=document.querySelector('.site-header');const well=document.querySelector('[data-ink-logo]');const canvas=well&&well.querySelector('canvas');const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;const nodes=[...document.querySelectorAll('.reveal')];const vanish=[...document.querySelectorAll('.vanish-out')];const reveal=node=>node.classList.add('visible','in-view');const show=()=>nodes.forEach(reveal);const revealPassed=()=>nodes.forEach(node=>{if(!node.classList.contains('visible')&&node.getBoundingClientRect().top<innerHeight*1.08)reveal(node)});if(!('IntersectionObserver' in window)){show()}else{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){reveal(entry.target);observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -8% 0px'});nodes.forEach(node=>observer.observe(node));const leave=new IntersectionObserver(entries=>entries.forEach(entry=>{entry.target.classList.toggle('is-leaving',!entry.isIntersecting&&entry.boundingClientRect.bottom<0)}),{threshold:0});vanish.forEach(node=>leave.observe(node))}let inked=false,parts=[],raf=0;const burst=()=>{if(!canvas||reduce)return;const ctx=canvas.getContext('2d');if(!ctx)return;const dpr=Math.min(2,window.devicePixelRatio||1);const css=240;canvas.width=css*dpr;canvas.height=css*dpr;const w=canvas.width,h=canvas.height;const cs=well?getComputedStyle(well):null;const accent=(cs&&cs.getPropertyValue('--accent').trim())||'#fff';const accent2=(cs&&cs.getPropertyValue('--accent2').trim())||'#ffe08a';const colors=['#fff',accent,accent2,'#ffe9a8'];parts=[];for(let i=0;i<110;i++){const a=Math.random()*Math.PI*2,s=(1.4+Math.random()*6.2)*dpr;parts.push({x:w/2,y:h/2,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.4*dpr,life:1,r:(2.8+Math.random()*6.5)*dpr,color:colors[i%colors.length]})}const tick=()=>{ctx.clearRect(0,0,w,h);parts=parts.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.045*dpr;p.life-=0.012;if(p.life<=0)return false;ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();return true});if(parts.length)raf=requestAnimationFrame(tick);else ctx.clearRect(0,0,w,h)};cancelAnimationFrame(raf);tick()};const setInk=()=>{const on=scrollY>28;if(header){header.classList.toggle('is-scrolled',scrollY>12);if(!reduce)header.classList.toggle('logo-sent',on)}if(well){well.classList.toggle('is-inked',reduce||on);if(on&&!inked)burst();if(!on)inked=false;else inked=true}};let scheduled=false;const onScroll=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{revealPassed();setInk();scheduled=false})}};addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',revealPassed,{passive:true});addEventListener('pageshow',()=>requestAnimationFrame(()=>{revealPassed();setInk()}));setInk();revealPassed();const rail=document.querySelector('[data-filmstrip]');if(rail&&!reduce){let paused=false,dir=1;const pause=()=>{paused=true};const resume=()=>{paused=false};rail.addEventListener('pointerenter',pause);rail.addEventListener('pointerleave',resume);rail.addEventListener('focusin',pause);rail.addEventListener('focusout',resume);rail.addEventListener('touchstart',pause,{passive:true});const drift=()=>{if(!paused){rail.scrollLeft+=dir*0.55;if(rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-2)dir=-1;if(rail.scrollLeft<=0)dir=1}requestAnimationFrame(drift)};requestAnimationFrame(drift)}})();`;

const html = `<!doctype html><html lang="en" class="no-js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${noindex}<script>document.documentElement.classList.remove('no-js');document.documentElement.classList.add('js')</script><title>${esc(brief.name)} | ${esc(brief.city)}</title><meta name="description" content="${esc(brief.description || '')}"><meta name="theme-color" content="${t.deep}"><meta name="generator" content="momentum-site-factory"><meta name="attitude" content="${esc(attitude)}"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?${fontFamilies}&display=swap" rel="stylesheet"><script type="application/ld+json">${jsonLd}</script><style>
${rootBlock}
${baseCss}
${skinCss}</style></head><body class="profile-page slug-${esc(brief.slug)} attitude-${esc(attitude)}"><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><a class="brand" href="#top">${brand}</a><nav aria-label="Primary">${navLinks}</nav>${cta(primaryCta, 'button button-header')}</header><main id="main">${sections}</main><footer class="site-footer"><div class="footer-identity"><strong>${esc(brief.name)}</strong><span>${esc(brief.tagline || brief.category || '')}</span></div><div class="footer-contact"><h2>Contact</h2>${brief.address ? `<p>${esc(brief.address)}</p>` : ''}${brief.phone ? `<p><a href="tel:${(brief.phone || '').replace(/\D/g, '')}">${esc(brief.phone)}</a></p>` : ''}</div><div class="footer-hours"><h2>Visit</h2>${brief.hours ? `<p>${esc(brief.hours)}</p>` : ''}${brief.url ? `<a href="${esc(brief.url)}">Official website \u2197</a>` : ''}</div><nav class="footer-links" aria-label="Useful links"><h2>Links</h2><ul>${footerLinks}</ul></nav>${disclosure}</footer>${mobileBar}<script>${revealScript}</script></body></html>`;

const outDir = path.join(outRoot, brief.slug);
fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.html'), html);

const wanted = new Set(brief.logo === false ? [] : ['logo.png']);
const usedImages = html.match(/assets\/[a-z0-9-]+\.(webp|png|jpg|svg)/g) || [];
usedImages.forEach((u) => wanted.add(u.replace('assets/', '')));
const have = new Set(fs.readdirSync(path.join(outDir, 'assets')));
const missingAssets = [...wanted].filter((f) => !have.has(f));
const photos = [...new Set(usedImages.filter((u) => /image-\d+\./.test(u)))];

// Measured against the canonical batch spec in philly-sites/DESIGN-SYSTEM.md
  // Count copy only: strip style/script before word tally so skins don't inflate metrics.
  const sectionNames = [...html.matchAll(/<section class="([a-z-]+)/g)].map((m) => m[1]);
  const copyHtml = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');
  const words = (copyHtml.match(/>[^<>]{3,}</g) || []).join(' ').split(/\s+/).filter(Boolean).length;

  return {
    slug: brief.slug,
    outDir,
    html,
    htmlBytes: html.length,
    sections: sectionNames,
    words,
    images: photos.length,
    missingAssets,
  };
}

module.exports = { buildSite };

if (require.main === module) {
  const briefPath = process.argv[2];
  if (!briefPath) {
    console.error('Usage: node build-site.js path/to/brief.json [output-dir]');
    process.exit(1);
  }
  const brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'));
  const outRoot = process.argv[3] || path.dirname(briefPath);
  try {
    const r = buildSite(brief, outRoot);
    console.log(`Built ${path.join(r.outDir, 'index.html')} (${(r.htmlBytes / 1024).toFixed(1)} KB)`);
    console.log(`Spec: ${r.sections.length} sections, ${r.words} words, ${r.images} images`);
    if (r.missingAssets.length) {
      console.log(`Assets still needed in ${path.join(r.outDir, 'assets')}:`);
      r.missingAssets.forEach((f) => console.log(`  - ${f}`));
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
