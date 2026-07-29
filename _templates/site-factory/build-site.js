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
const { buildSkinCss, inferAttitude, inferVertical } = require('./lib/skins.js');

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

const required = ['slug', 'name', 'city', 'tokens', 'fonts', 'hero'];
for (const key of required) {
  if (!brief[key]) {
    throw new Error(`Brief is missing required field: ${key}`);
  }
}
assertSafeSlug(brief.slug);

const t = brief.tokens;
const tokenDefaults = {
  onPaper: '#090909', onAccent: '#FFFFFF', onAccent2: '#090909',
  onPanel: '#090909', onDeep: '#FFFFFF', border: '2px', radius: '12px',
};
for (const [k, v] of Object.entries(tokenDefaults)) t[k] = t[k] || v;

const safeCssFont = (value, fallback) => {
  const cleaned = String(value || '').replace(/['"\\;{}<>]/g, '').trim();
  return cleaned || fallback;
};
const displayFont = safeCssFont(brief.fonts.display, 'Georgia');
const textFont = safeCssFont(brief.fonts.text, 'system-ui');
const fontFallback = safeCssFont(brief.fonts.displayFallback, 'Georgia,serif');
const rootBlock =
  `:root{--paper:${t.paper};--ink:${t.ink};--accent:${t.accent};--accent2:${t.accent2};` +
  `--panel:${t.panel};--deep:${t.deep};--on-paper:${t.onPaper};--on-accent:${t.onAccent};` +
  `--on-accent2:${t.onAccent2};--on-panel:${t.onPanel};--on-deep:${t.onDeep};` +
  `--border:${t.border};--radius:${t.radius};--display:'${displayFont}',${fontFallback};` +
  `--text:'${textFont}',system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}`;

const fontFamilies = [displayFont, textFont]
  .filter(Boolean)
  .map((f) => `family=${f.trim().replace(/ /g, '+')}:wght@400;500;600;700;800;900`)
  .join('&');

const vertical = inferVertical(brief);
const isHomeService = vertical === 'home-services';
const serviceArea = brief.serviceArea || brief.market || brief.city;
const verticalCopy = {
  'home-services': {
    offeringsKicker: 'Services and scope',
    offeringsHeading: 'The right work, <mark>clearly scoped.</mark>',
    galleryHeading: 'Proof of work, <mark>not stock promises.</mark>',
    contactKicker: 'Coverage and scheduling',
    contactHeading: 'Get the job <mark>on the calendar.</mark>',
    contactSub: 'Service area, availability, and direct booking details in one place.',
    contactId: 'contact',
    nav: [
      { label: 'Services', href: '#offerings' },
      { label: 'Proof', href: '#proof' },
      { label: 'Schedule', href: '#contact' },
    ],
  },
  hospitality: {
    offeringsKicker: 'What to order',
    offeringsHeading: 'The signatures, <mark>front and center.</mark>',
    galleryHeading: 'A feel for the room, <mark>before you arrive.</mark>',
    contactKicker: 'Visit and contact',
    contactHeading: 'Plan the next <mark>visit.</mark>',
    contactSub: 'Hours, location, and official links together in one place.',
    contactId: 'visit',
    nav: [
      { label: 'Highlights', href: '#offerings' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'Visit', href: '#visit' },
    ],
  },
  retail: {
    offeringsKicker: 'What to find',
    offeringsHeading: 'The collection, <mark>without the clutter.</mark>',
    galleryHeading: 'A closer look at <mark>what is in store.</mark>',
    contactKicker: 'Shop and contact',
    contactHeading: 'Make the next <mark>stop easy.</mark>',
    contactSub: 'Hours, location, and direct official links together in one place.',
    contactId: 'visit',
    nav: [
      { label: 'Collection', href: '#offerings' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'Visit', href: '#visit' },
    ],
  },
  'health-wellness': {
    offeringsKicker: 'Care and services',
    offeringsHeading: 'A clearer path to <mark>the right care.</mark>',
    galleryHeading: 'The people and setting, <mark>before your appointment.</mark>',
    contactKicker: 'Appointments and contact',
    contactHeading: 'Take the next step <mark>with confidence.</mark>',
    contactSub: 'Availability, location, and direct contact details in one place.',
    contactId: 'contact',
    nav: [
      { label: 'Services', href: '#offerings' },
      { label: 'Approach', href: '#proof' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  professional: {
    offeringsKicker: 'How we help',
    offeringsHeading: 'The work, <mark>made legible.</mark>',
    galleryHeading: 'The team and the work, <mark>in context.</mark>',
    contactKicker: 'Consultation and contact',
    contactHeading: 'Start the right <mark>conversation.</mark>',
    contactSub: 'Direct contact details and next steps in one place.',
    contactId: 'contact',
    nav: [
      { label: 'Services', href: '#offerings' },
      { label: 'Proof', href: '#proof' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  'local-business': {
    offeringsKicker: 'What to explore',
    offeringsHeading: 'Signature offerings, <mark>clearly framed.</mark>',
    galleryHeading: 'See what makes this business <mark>distinct.</mark>',
    contactKicker: 'Visit and contact',
    contactHeading: 'Make the next step <mark>easy.</mark>',
    contactSub: 'Verified details and direct official links together in one place.',
    contactId: 'contact',
    nav: [
      { label: 'Explore', href: '#offerings' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'Contact', href: '#contact' },
    ],
  },
};
const language = verticalCopy[vertical] || verticalCopy['local-business'];

const images = brief.images || [];
const img = (n, opts = {}) => {
  const meta = images[n - 1] || {};
  const file = meta.file || `image-${n}.webp`;
  const alt = esc(meta.alt || brief.name);
  const eager = opts.eager ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
  return `<img${eager} src="assets/${file}" alt="${alt}">`;
};
const figure = (n, opts = {}) => {
  const cap = opts.caption ? `<figcaption>${esc(opts.caption)}</figcaption>` : '';
  return `<figure class="media-figure" data-hover>${img(n, opts)}${cap}</figure>`;
};

const isExternalHref = (href) => /^https?:\/\//i.test(String(href || ''));
const cta = (c, cls = 'button button-primary') => {
  if (!c) return '';
  const icon = isExternalHref(c.href) ? '<span aria-hidden="true">\u2197</span>' : '';
  return `<a class="${cls}" href="${esc(c.href)}">${esc(c.label)}${icon}</a>`;
};

const sectionKicker = (text) => (text ? `<span class="section-kicker">${esc(text)}</span>` : '');

const signalStripHtml = (phrases) => {
  const list = (phrases || []).filter(Boolean);
  if (!list.length) return '';
  const items = list.map((p) => `<span role="listitem">${esc(p)}</span>`).join('');
  return `<div class="signal-strip"><div class="signal-track" role="list" aria-label="Business highlights">${items}</div></div>`;
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
    const secondary =
      isHomeService &&
      brief.locationType !== 'storefront' &&
      d.ctaSecondary &&
      (/visit|map/i.test(d.ctaSecondary.label || '') || d.ctaSecondary.href === '#visit')
        ? { ...d.ctaSecondary, label: 'Check service area', href: '#contact' }
        : d.ctaSecondary;
    const float = d.glassFloat
      ? `<div class="glass-panel glass-float"><strong>${esc(d.glassFloat.title || brief.name)}</strong><span>${esc(d.glassFloat.sub || brief.city)}</span></div>`
      : `<div class="glass-panel glass-float"><strong>${esc(brief.name)}</strong><span>${esc(brief.city)}</span></div>`;
    return `<section class="hero surface-paper" id="top"><div class="hero-copy reveal"><span class="eyebrow">${esc(d.eyebrow || `${brief.city} | ${brief.category || ''}`)}</span><h1><mark>${esc(d.headline || brief.name)}</mark></h1><p>${esc(d.sub || brief.description || '')}</p><div class="button-row">${cta(d.ctaPrimary)}${cta(secondary, 'button button-secondary')}</div></div><div class="hero-media reveal reveal-right">${figure(1, { eager: true })}${float}</div></section>${signalStripHtml(d.marquee || brief.marquee)}`;
  },
  offerings(d) {
    const cards = d.items
      .map((item, i) => `<article class="offering-card reveal delay-${(i % 3) + 1}"><span>0${i + 1}</span><h3>${esc(item)}</h3></article>`)
      .join('');
    return `<section class="offerings ${pickSurface(d.surface || 'accent')}" id="offerings"><header class="section-head reveal">${sectionKicker(d.kicker || language.offeringsKicker)}<h2>${d.heading || language.offeringsHeading}</h2></header><div class="offering-grid">${cards}</div></section>`;
  },
  proof(d) {
    const cells = d.items
      .map((item, i) => `<article class="reveal delay-${(i % 3) + 1}"><span>0${i + 1}</span><strong>${esc(item)}</strong></article>`)
      .join('');
    return `<section class="proof ${pickSurface(d.surface || 'panel')} reveal" id="proof"><div class="proof-grid">${cells}</div></section>`;
  },
  gallery(d) {
    const figs = (d.imageIndexes || [3, 4, 5, 6, 7]).map((n) => figure(n)).join('');
    return `<section class="gallery ${pickSurface(d.surface || 'paper')}" id="gallery"><header class="section-head reveal"><h2>${d.heading || language.galleryHeading}</h2></header><div class="gallery-grid reveal">${figs}</div></section>`;
  },
  story(d) {
    const paras = (d.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('');
    return `<section class="story ${pickSurface(d.surface || 'deep')}"><div class="story-copy reveal reveal-left"><h2>${esc(d.heading || 'About')}</h2>${paras}</div><div class="reveal reveal-right">${figure(d.imageIndex || 2)}</div></section>`;
  },
  experience(d) {
    const cards = d.items
      .map((item, i) => `<article class="reveal delay-${(i % 3) + 1}"><span>0${i + 1}</span><h3>${esc(item)}</h3></article>`)
      .join('');
    return `<section class="experience ${pickSurface(d.surface || 'panel')}"><header class="section-head reveal"><h2>${esc(d.heading || 'Built around the details.')}</h2></header><div class="experience-grid">${cards}</div></section>`;
  },
  feature(d) {
    return `<section class="feature ${pickSurface(d.surface || 'accent')}"><div class="reveal reveal-left">${figure(d.imageIndex || 8)}</div><div class="feature-copy reveal reveal-right"><h2>${esc(d.heading)}</h2><p>${esc(d.text || '')}</p>${cta(d.cta, 'button button-secondary')}</div></section>`;
  },
  spotlight(d) {
    if (!d.heading) return '';
    return `<section class="spotlight ${pickSurface(d.surface || 'panel')}"><div class="feature-copy reveal reveal-left"><h2>${esc(d.heading)}</h2><p>${esc(d.text || '')}</p>${cta(d.cta, 'button button-secondary')}</div><div class="reveal reveal-right">${figure(d.imageIndex || 6)}</div></section>`;
  },
  catalog(d) {
    const cards = d.items
      .map(
        (item, i) =>
          `<article class="catalog-card reveal delay-${(i % 3) + 1}">${figure(item.imageIndex || 9 + i)}<h3>${esc(item.title)}</h3><a href="${esc(item.href)}">Explore${isExternalHref(item.href) ? ' <span aria-hidden="true">\u2197</span>' : ''}</a></article>`
      )
      .join('');
    return `<section class="catalog ${pickSurface(d.surface || 'deep')}"><header class="section-head reveal"><h2>${d.heading || 'More ways to <mark>get started.</mark>'}</h2></header><div class="catalog-grid">${cards}</div></section>`;
  },
  social(d) {
    const indexes = d.imageIndexes || [3, 4, 5, 6, 7, 8];
    const captions = d.captions || [];
    const figs = indexes
      .map((n, i) => figure(n, { caption: captions[i] || 'From their feed' }))
      .join('');
    if (!figs) return '';
    return `<section class="social-strip ${pickSurface(d.surface || 'paper')}" id="social"><header class="section-head reveal">${sectionKicker(d.kicker || 'Pulled from their world')}<h2>${d.heading || 'Recent work, <mark>in context.</mark>'}</h2></header><div class="social-rail">${figs}</div></section>`;
  },
  contact(d) {
    const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brief.address || brief.name + ' ' + brief.city)}`;
    const phoneDigits = (brief.phone || '').replace(/\D/g, '');
    const primaryAction = d.cta || (brief.hero && brief.hero.ctaPrimary);
    const cards = [
      isHomeService && serviceArea &&
        `<article class="contact-card glass-panel reveal"><span>Service area</span><strong>${esc(serviceArea)}</strong><p>Confirm your address when scheduling.</p></article>`,
      !isHomeService && brief.address &&
        `<article class="contact-card glass-panel reveal"><span>Address</span><strong>${esc(brief.address)}</strong><a class="button button-quiet" href="${esc(mapsHref)}">Open map<span aria-hidden="true">\u2197</span></a></article>`,
      brief.phone &&
        `<article class="contact-card glass-panel reveal delay-1"><span>Telephone</span><strong><a href="tel:${phoneDigits}">${esc(brief.phone)}</a></strong></article>`,
      brief.hours &&
        `<article class="contact-card glass-panel reveal delay-2"><span>${isHomeService ? 'Availability' : 'Hours'}</span><strong>${esc(brief.hours)}</strong>${brief.url ? `<a href="${esc(brief.url)}">Confirm on official site \u2197</a>` : ''}</article>`,
      isHomeService && primaryAction &&
        `<article class="contact-card contact-action glass-panel reveal delay-3"><span>Schedule</span><strong>${esc(d.actionTitle || 'Choose the next available window.')}</strong>${cta(primaryAction, 'button button-primary')}</article>`,
      d.extraCard &&
        `<article class="contact-card glass-panel reveal delay-3"><span>${esc(d.extraCard.label)}</span><strong>${esc(d.extraCard.title)}</strong>${cta(d.extraCard.cta, 'button button-quiet')}</article>`,
    ]
      .filter(Boolean)
      .join('');
    const aliasId = language.contactId === 'visit' ? 'contact' : 'visit';
    return `<section class="contact-system ${pickSurface(d.surface || 'deep')}" id="${language.contactId}"><span class="anchor-alias" id="${aliasId}" aria-hidden="true"></span><div class="section-kicker">${esc(d.kicker || language.contactKicker)}</div><div class="contact-intro reveal"><h2>${d.heading || language.contactHeading}</h2><p>${esc(d.sub || language.contactSub)}</p></div><div class="contact-grid">${cards}</div></section>`;
  },
  closing(d) {
    return `<section class="closing ${pickSurface(d.surface || 'panel')} reveal">${sectionKicker(d.kicker || `${brief.city}, in full`)}<h2><mark>${esc(d.heading || brief.name)}</mark></h2>${cta(d.cta || (brief.hero && brief.hero.ctaPrimary))}</section>`;
  },
};

// Ten-section recipes preserve the measured batch depth while moving reassurance
// earlier for higher-stakes service and professional decisions. Social and
// spotlight remain opt-in via brief.sections so the default never repeats images.
const defaultOrders = {
  'home-services': ['hero', 'proof', 'offerings', 'experience', 'story', 'feature', 'gallery', 'catalog', 'contact', 'closing'],
  professional: ['hero', 'proof', 'offerings', 'story', 'experience', 'feature', 'gallery', 'catalog', 'contact', 'closing'],
  'health-wellness': ['hero', 'proof', 'offerings', 'story', 'experience', 'gallery', 'feature', 'catalog', 'contact', 'closing'],
  hospitality: ['hero', 'offerings', 'gallery', 'proof', 'story', 'experience', 'feature', 'catalog', 'contact', 'closing'],
  retail: ['hero', 'offerings', 'gallery', 'proof', 'experience', 'story', 'feature', 'catalog', 'contact', 'closing'],
  'local-business': ['hero', 'offerings', 'proof', 'gallery', 'story', 'experience', 'feature', 'catalog', 'contact', 'closing'],
};
const defaultOrder = defaultOrders[vertical] || defaultOrders['local-business'];
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

const navLinks = (brief.nav || language.nav)
  .map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`)
  .join('');

const footerLinks = (brief.links || [])
  .map(
    (l) =>
      `<li><a href="${esc(l.href)}">${esc(l.label)}${isExternalHref(l.href) ? ' <span aria-hidden="true">\u2197</span>' : ''}</a></li>`
  )
  .join('');

const brand = brief.logo === false
  ? `<span class="wordmark">${esc(brief.name)}</span>`
  : `<img class="brand-logo" src="assets/logo.png" alt="${esc(brief.name)}">`;

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
const mobileBar = primaryCta
  ? `<div class="mobile-action" role="region" aria-label="Primary action" aria-hidden="true">${cta(primaryCta)}</div>`
  : '';

const attitude = inferAttitude(brief);
const skinCss = buildSkinCss(brief);

const revealScript = `(()=>{
  const header=document.querySelector('.site-header');
  const nodes=[...document.querySelectorAll('.reveal')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal=node=>{
    if(node.classList.contains('visible'))return;
    node.classList.add('visible','in-view');
    if(!reduced&&node.animate){
      const x=node.classList.contains('reveal-left')?-18:node.classList.contains('reveal-right')?18:0;
      node.animate(
        [{opacity:.82,transform:\`translate(\${x}px,18px)\`},{opacity:1,transform:'translate(0,0)'}],
        {duration:560,easing:'cubic-bezier(.16,1,.3,1)'}
      );
    }
  };
  const revealPassed=()=>nodes.forEach(node=>{
    if(node.getBoundingClientRect().top<innerHeight*1.08)reveal(node);
  });
  if('IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){reveal(entry.target);observer.unobserve(entry.target)}
    }),{threshold:.08,rootMargin:'0px 0px -6% 0px'});
    nodes.forEach(node=>observer.observe(node));
  }else{nodes.forEach(reveal)}

  const mobile=document.querySelector('.mobile-action');
  const heroAction=document.querySelector('.hero .button-primary');
  const setMobile=active=>{
    if(!mobile)return;
    mobile.classList.toggle('is-active',active);
    mobile.setAttribute('aria-hidden',String(!active));
    document.body.classList.toggle('mobile-action-active',active);
  };
  if(mobile&&heroAction&&'IntersectionObserver'in window){
    new IntersectionObserver(([entry])=>{
      setMobile(!entry.isIntersecting&&entry.boundingClientRect.top<0);
    },{threshold:.1}).observe(heroAction);
  }

  const navLinks=[...document.querySelectorAll('.site-header nav a[href^="#"]')];
  const sectionById=new Map(navLinks.map(link=>[link.getAttribute('href').slice(1),link]));
  if(sectionById.size&&'IntersectionObserver'in window){
    const activeObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      navLinks.forEach(link=>link.removeAttribute('aria-current'));
      sectionById.get(entry.target.id)?.setAttribute('aria-current','location');
    }),{rootMargin:'-28% 0px -62% 0px'});
    sectionById.forEach((_,id)=>{const section=document.getElementById(id);if(section)activeObserver.observe(section)});
  }

  if(location.hash){
    const target=document.querySelector(location.hash);
    if(target){target.querySelectorAll('.reveal').forEach(reveal);if(target.classList.contains('reveal'))reveal(target)}
  }
  let scheduled=false;
  const onScroll=()=>{
    if(header)header.classList.toggle('is-scrolled',scrollY>12);
    if(!scheduled){scheduled=true;requestAnimationFrame(()=>{revealPassed();scheduled=false})}
  };
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',revealPassed,{passive:true});
  addEventListener('pageshow',()=>requestAnimationFrame(revealPassed));
  onScroll();revealPassed();
})();`;

const footerLocationTitle = isHomeService ? 'Service area' : 'Contact';
const footerLocation = isHomeService ? serviceArea : brief.address;
const footerHoursTitle = isHomeService ? 'Availability' : 'Visit';

const html = `<!doctype html><html lang="en" class="no-js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${noindex}<script>document.documentElement.classList.remove('no-js');document.documentElement.classList.add('js')</script><title>${esc(brief.name)} | ${esc(brief.city)}</title><meta name="description" content="${esc(brief.description || '')}"><meta name="theme-color" content="${t.deep}"><meta name="generator" content="momentum-site-factory"><meta name="attitude" content="${esc(attitude)}"><meta name="vertical" content="${esc(vertical)}"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?${fontFamilies}&display=swap" rel="stylesheet"><script type="application/ld+json">${jsonLd}</script><style>
${rootBlock}
${baseCss}
${skinCss}</style></head><body class="profile-page slug-${esc(brief.slug)} attitude-${esc(attitude)} vertical-${esc(vertical)}"><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><a class="brand" href="#top">${brand}</a><nav aria-label="Primary">${navLinks}</nav>${cta(primaryCta, 'button button-header')}</header><main id="main">${sections}</main><footer class="site-footer"><div class="footer-identity"><strong>${esc(brief.name)}</strong><span>${esc(brief.tagline || brief.category || '')}</span></div><div class="footer-contact"><h2>${footerLocationTitle}</h2>${footerLocation ? `<p>${esc(footerLocation)}</p>` : ''}${brief.phone ? `<p><a href="tel:${(brief.phone || '').replace(/\D/g, '')}">${esc(brief.phone)}</a></p>` : ''}</div><div class="footer-hours"><h2>${footerHoursTitle}</h2>${brief.hours ? `<p>${esc(brief.hours)}</p>` : ''}${brief.url ? `<a href="${esc(brief.url)}">Official website \u2197</a>` : ''}</div><nav class="footer-links" aria-label="Useful links"><h2>Links</h2><ul>${footerLinks}</ul></nav>${disclosure}</footer>${mobileBar}<script>${revealScript}</script></body></html>`;

const outDir = path.join(outRoot, brief.slug);
fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.html'), html);

const wanted = new Set(brief.logo === false ? [] : ['logo.png']);
const usedImages = html.match(/assets\/[a-z0-9-]+\.(webp|png|jpg)/g) || [];
const contentImageReferences = usedImages.filter((item) => !/\/logo\.(webp|png|jpg)$/i.test(item));
usedImages.forEach((u) => wanted.add(u.replace('assets/', '')));
const have = new Set(fs.readdirSync(path.join(outDir, 'assets')));
const missingAssets = [...wanted].filter((f) => !have.has(f));
const assetFiles = [...wanted]
  .map((file) => path.join(outDir, 'assets', file))
  .filter((file) => fs.existsSync(file) && fs.statSync(file).isFile());
const assetBytes = assetFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0);
const largestAssetBytes = assetFiles.reduce((max, file) => Math.max(max, fs.statSync(file).size), 0);

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
    htmlBytes: Buffer.byteLength(html),
    sections: sectionNames,
    words,
    images: new Set(contentImageReferences).size,
    imagePlacements: contentImageReferences.length,
    duplicateImageReferences: contentImageReferences.filter(
      (item, index) => contentImageReferences.indexOf(item) !== index
    ),
    assetBytes,
    largestAssetBytes,
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
      process.exitCode = 1;
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
