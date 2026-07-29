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
const img = (n, opts = {}) => {
  const meta = images[n - 1] || {};
  const file = meta.file || `image-${n}.webp`;
  const alt = esc(meta.alt || brief.name);
  const eager = opts.eager ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
  return `<img${eager} src="assets/${file}" alt="${alt}">`;
};
const figure = (n, opts = {}) => `<figure class="media-figure">${img(n, opts)}</figure>`;

const cta = (c, cls = 'button button-primary') =>
  c ? `<a class="${cls}" href="${esc(c.href)}">${esc(c.label)}<span aria-hidden="true">\u2197</span></a>` : '';

const sectionKicker = (text) => (text ? `<span class="section-kicker">${esc(text)}</span>` : '');

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
    return `<section class="hero surface-paper" id="top"><div class="hero-copy reveal"><span class="eyebrow">${esc(d.eyebrow || `${brief.city} | ${brief.category || ''}`)}</span><h1><mark>${esc(d.headline || brief.name)}</mark></h1><p>${esc(d.sub || brief.description || '')}</p><div class="button-row">${cta(d.ctaPrimary)}${cta(d.ctaSecondary, 'button button-secondary')}</div></div><div class="hero-media reveal">${figure(1, { eager: true })}</div></section>`;
  },
  offerings(d) {
    const cards = d.items
      .map((item, i) => `<article class="offering-card reveal"><span>0${i + 1}</span><h3>${esc(item)}</h3></article>`)
      .join('');
    return `<section class="offerings ${pickSurface(d.surface || 'accent')}" id="offerings"><header class="section-head reveal">${sectionKicker(d.kicker || 'What to explore')}<h2>${d.heading || 'Signature offerings, <mark>clearly framed.</mark>'}</h2></header><div class="offering-grid">${cards}</div></section>`;
  },
  proof(d) {
    const cells = d.items
      .map((item, i) => `<article><span>0${i + 1}</span><strong>${esc(item)}</strong></article>`)
      .join('');
    return `<section class="proof ${pickSurface(d.surface || 'panel')} reveal"><div class="proof-grid">${cells}</div></section>`;
  },
  gallery(d) {
    const figs = (d.imageIndexes || [3, 4, 5, 6, 7]).map((n) => figure(n)).join('');
    return `<section class="gallery ${pickSurface(d.surface || 'paper')}" id="gallery"><header class="section-head reveal"><h2>${d.heading || 'See what makes this place <mark>distinct.</mark>'}</h2></header><div class="gallery-grid">${figs}</div></section>`;
  },
  story(d) {
    const paras = (d.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('');
    return `<section class="story ${pickSurface(d.surface || 'deep')}"><div class="story-copy reveal"><h2>${esc(d.heading || 'About')}</h2>${paras}</div>${figure(d.imageIndex || 2)}</section>`;
  },
  experience(d) {
    const cards = d.items
      .map((item, i) => `<article class="reveal"><span>0${i + 1}</span><h3>${esc(item)}</h3></article>`)
      .join('');
    return `<section class="experience ${pickSurface(d.surface || 'panel')}"><header class="section-head reveal"><h2>${esc(d.heading || 'Built around the details.')}</h2></header><div class="experience-grid">${cards}</div></section>`;
  },
  feature(d) {
    return `<section class="feature ${pickSurface(d.surface || 'accent')}">${figure(d.imageIndex || 8)}<div class="feature-copy reveal"><h2>${esc(d.heading)}</h2><p>${esc(d.text || '')}</p>${cta(d.cta, 'button button-secondary')}</div></section>`;
  },
  catalog(d) {
    const cards = d.items
      .map(
        (item, i) =>
          `<article class="catalog-card reveal">${figure(item.imageIndex || 9 + i)}<h3>${esc(item.title)}</h3><a href="${esc(item.href)}">Explore \u2197</a></article>`
      )
      .join('');
    return `<section class="catalog ${pickSurface(d.surface || 'deep')}"><header class="section-head reveal"><h2>${d.heading || 'More ways into the <mark>experience.</mark>'}</h2></header><div class="catalog-grid">${cards}</div></section>`;
  },
  contact(d) {
    const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brief.address || brief.name + ' ' + brief.city)}`;
    const phoneDigits = (brief.phone || '').replace(/\D/g, '');
    const cards = [
      brief.address &&
        `<article class="contact-card"><span>Address</span><strong>${esc(brief.address)}</strong><a class="button button-quiet" href="${esc(mapsHref)}">Open map<span aria-hidden="true">\u2197</span></a></article>`,
      brief.phone &&
        `<article class="contact-card"><span>Telephone</span><strong><a href="tel:${phoneDigits}">${esc(brief.phone)}</a></strong></article>`,
      brief.hours &&
        `<article class="contact-card"><span>Hours</span><strong>${esc(brief.hours)}</strong>${brief.url ? `<a href="${esc(brief.url)}">Confirm on official site \u2197</a>` : ''}</article>`,
      d.extraCard &&
        `<article class="contact-card"><span>${esc(d.extraCard.label)}</span><strong>${esc(d.extraCard.title)}</strong>${cta(d.extraCard.cta, 'button button-quiet')}</article>`,
    ]
      .filter(Boolean)
      .join('');
    return `<section class="contact-system ${pickSurface(d.surface || 'deep')} reveal" id="visit"><div class="section-kicker">Visit and contact</div><div class="contact-intro"><h2>${d.heading || 'Make the next visit <mark>easy.</mark>'}</h2><p>${esc(d.sub || 'Verified details and direct official links, together in one place.')}</p></div><div class="contact-grid">${cards}</div></section>`;
  },
  closing(d) {
    return `<section class="closing ${pickSurface(d.surface || 'panel')} reveal">${sectionKicker(d.kicker || `${brief.city}, in full`)}<h2><mark>${esc(d.heading || brief.name)}</mark></h2>${cta(d.cta || (brief.hero && brief.hero.ctaPrimary))}</section>`;
  },
};

const defaultOrder = ['hero', 'offerings', 'proof', 'gallery', 'story', 'experience', 'feature', 'catalog', 'contact', 'closing'];
const sections = (brief.sections || defaultOrder)
  .map((name) => {
    const data = brief[name] || {};
    if (!builders[name]) {
      console.warn(`Unknown section "${name}" skipped.`);
      return '';
    }
    // Skip optional sections with no content
    if (['offerings', 'proof', 'experience', 'catalog'].includes(name) && !(data.items && data.items.length)) return '';
    if (name === 'feature' && !data.heading) return '';
    if (name === 'story' && !(data.paragraphs && data.paragraphs.length)) return '';
    return builders[name](data);
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

const revealScript = `(()=>{const nodes=[...document.querySelectorAll('.reveal')];const reveal=node=>node.classList.add('visible','in-view');const show=()=>nodes.forEach(reveal);const revealPassed=()=>nodes.forEach(node=>{if(!node.classList.contains('visible')&&node.getBoundingClientRect().top<innerHeight*1.08)reveal(node)});if(!('IntersectionObserver' in window)){show();return}const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){reveal(entry.target);observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -6% 0px'});nodes.forEach(node=>observer.observe(node));let scheduled=false;addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{revealPassed();scheduled=false})}},{passive:true});addEventListener('resize',revealPassed,{passive:true});addEventListener('pageshow',()=>requestAnimationFrame(revealPassed));revealPassed()})();`;

const html = `<!doctype html><html lang="en" class="no-js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${noindex}<script>document.documentElement.classList.remove('no-js');document.documentElement.classList.add('js')</script><title>${esc(brief.name)} | ${esc(brief.city)}</title><meta name="description" content="${esc(brief.description || '')}"><meta name="theme-color" content="${t.deep}"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?${fontFamilies}&display=swap" rel="stylesheet"><script type="application/ld+json">${jsonLd}</script><style>
${rootBlock}
${baseCss}
${brief.skinCss || ''}</style></head><body class="profile-page slug-${esc(brief.slug)}"><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><a class="brand" href="#top">${brand}</a><nav aria-label="Primary">${navLinks}</nav>${cta(brief.headerCta || (brief.hero && brief.hero.ctaPrimary), 'button button-header')}</header><main id="main">${sections}</main><footer class="site-footer"><div class="footer-identity"><strong>${esc(brief.name)}</strong><span>${esc(brief.tagline || brief.category || '')}</span></div><div class="footer-contact"><h2>Contact</h2>${brief.address ? `<p>${esc(brief.address)}</p>` : ''}${brief.phone ? `<p><a href="tel:${(brief.phone || '').replace(/\D/g, '')}">${esc(brief.phone)}</a></p>` : ''}</div><div class="footer-hours"><h2>Visit</h2>${brief.hours ? `<p>${esc(brief.hours)}</p>` : ''}${brief.url ? `<a href="${esc(brief.url)}">Official website \u2197</a>` : ''}</div><nav class="footer-links" aria-label="Useful links"><h2>Links</h2><ul>${footerLinks}</ul></nav>${disclosure}</footer><script>${revealScript}</script></body></html>`;

const outDir = path.join(outRoot, brief.slug);
fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.html'), html);

const wanted = new Set(brief.logo === false ? [] : ['logo.png']);
const usedImages = html.match(/assets\/[a-z0-9-]+\.(webp|png|jpg)/g) || [];
usedImages.forEach((u) => wanted.add(u.replace('assets/', '')));
const have = new Set(fs.readdirSync(path.join(outDir, 'assets')));
const missingAssets = [...wanted].filter((f) => !have.has(f));

// Measured against the canonical batch spec in philly-sites/DESIGN-SYSTEM.md
const sectionNames = [...html.matchAll(/<section class="([a-z-]+)/g)].map((m) => m[1]);
const words = (html.match(/>[^<>]{3,}</g) || []).join(' ').split(/\s+/).filter(Boolean).length;

  return {
    slug: brief.slug,
    outDir,
    html,
    htmlBytes: html.length,
    sections: sectionNames,
    words,
    images: usedImages.length,
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
