'use strict';

/**
 * Render one Haoqi craft demo. Same skeleton as Jarman / Andorra, plus
 * proof, process, and area sections so the page keeps moving after the
 * offerings block.
 */

const SCHEMA = {
  dentist: 'Dentist',
  hvac: 'HVACBusiness',
  veterinary: 'VeterinaryCare',
  restaurant: 'Restaurant',
  pub: 'Restaurant',
  bar: 'Restaurant',
  deli: 'Restaurant',
  lawyer: 'LegalService',
  shoes: 'Store',
  'garden-centre': 'HomeGoodsStore',
  gardener: 'HomeAndConstructionBusiness',
  'swimming-pool': 'LocalBusiness',
  doctor: 'MedicalClinic',
  clinic: 'MedicalClinic',
  tattoo: 'LocalBusiness',
  'estate-agent': 'RealEstateAgent',
  'fitness-centre': 'SportsActivityLocation',
  optician: 'Optician',
  optometrist: 'Optician',
  electrician: 'Electrician',
  'ice-cream': 'IceCreamShop',
  fireplace: 'HomeGoodsStore',
  jewelry: 'JewelryStore',
  florist: 'Florist',
  distillery: 'Distillery',
  beauty: 'BeautySalon',
  cosmetics: 'BeautySalon',
  hairdresser: 'BeautySalon',
  physiotherapist: 'Physician',
  books: 'BookStore',
  motorcycle: 'Store',
  plumber: 'Plumber',
};

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function telHref(phone) {
  const digits = String(phone || '').replace(/[^\d+]/g, '');
  if (!digits) return '';
  if (digits.startsWith('+')) return `tel:${digits}`;
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `tel:+${digits}`;
  return `tel:${digits}`;
}

function displayPhone(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  const ten = d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
  if (ten.length === 10) return `${ten.slice(0, 3)}-${ten.slice(3, 6)}-${ten.slice(6)}`;
  return String(phone || '').trim();
}

function mapsUrl(page) {
  const line = page.address || [page.street, page.city, page.region, page.postcode].filter(Boolean).join(', ');
  if (!line) return '';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(line)}`;
}

function hexMix(hex, toward, amount) {
  const parse = (h) => {
    const x = h.replace('#', '');
    return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)];
  };
  const a = parse(hex);
  const b = parse(toward);
  const out = a.map((v, i) => Math.round(v + (b[i] - v) * amount));
  return `#${out.map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

function tokensFromPalette(hints) {
  const hex = (hints && hints[0] && hints[0].hex) || '#1d6fe8';
  return {
    paperTop: hexMix(hex, '#d7e6f6', 0.62),
    paperMid: hexMix(hex, '#eef5fb', 0.78),
    paperBot: '#f3f7fb',
    brand: hex,
    glassA: hexMix(hex, '#ffffff', 0.45),
    glassB: hex,
    glassC: hexMix(hex, '#0a1020', 0.45),
    lime: '#c8ff3a',
  };
}

function render(page) {
  const t = tokensFromPalette(page.palette);
  const schema = SCHEMA[page.vertical] || 'LocalBusiness';
  const tel = telHref(page.phone);
  const prettyTel = displayPhone(page.phone);
  const maps = mapsUrl(page);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schema,
    name: page.name,
    url: page.siteUrl,
  };
  if (tel) jsonLd.telephone = tel.replace('tel:', '');
  if (page.street || page.city) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      streetAddress: page.street || undefined,
      addressLocality: page.city || undefined,
      addressRegion: page.region || 'PA',
      postalCode: page.postcode || undefined,
      addressCountry: 'US',
    };
  }

  const mark = page.logo
    ? `<a class="mark has-logo" href="#main"><img src="assets/${esc(page.logo)}" alt="${esc(page.name)}"></a>`
    : `<a class="mark" href="#main">${esc(page.mark)}<span class="sticker-slot" aria-hidden="true"></span></a>`;

  const ctaLabel = tel ? `Call ${prettyTel}` : page.ctaLabel || 'Visit';
  const ctaHref = tel || page.siteUrl;
  const ghostHref = page.ghostHref || '#visit';
  const ghostLabel = page.ghostLabel || 'Plan a visit';

  const offers = (page.offers || []).slice(0, 3).map((line, i) => `
        <article class="reveal${i ? ` delay-${i}` : ''}">
          <span class="idx">0${i + 1}</span>
          <p>${esc(line)}</p>
        </article>`).join('');

  const proofs = (page.proofs || []).slice(0, 3).map((item) => `
        <article class="reveal">
          <blockquote>${esc(item.quote)}</blockquote>
          ${item.cite ? `<cite>${esc(item.cite)}</cite>` : ''}
        </article>`).join('');

  const steps = (page.steps || []).slice(0, 3).map((line, i) => `
        <article class="reveal">
          <span class="idx">0${i + 1}</span>
          <p>${esc(line)}</p>
        </article>`).join('');

  const areas = (page.areas || []).slice(0, 3).map((line) => `
        <article class="reveal"><p>${esc(line)}</p></article>`).join('');

  const storyImg = page.images.story
    ? `<figure class="reveal">
        <img src="assets/${esc(page.images.story.src)}" alt="${esc(page.images.story.alt)}" width="${page.images.story.width || 1200}" height="${page.images.story.height || 900}" loading="lazy">
      </figure>`
    : '';

  const galleryImg = page.images.gallery
    ? `<figure class="reveal">
          <img src="assets/${esc(page.images.gallery.src)}" alt="${esc(page.images.gallery.alt)}" width="${page.images.gallery.width || 1200}" height="${page.images.gallery.height || 900}" loading="lazy">
          <figcaption>${esc(page.images.gallery.caption || '')}</figcaption>
        </figure>`
    : '';

  const portrait = page.images.portrait
    ? `<figure>
        <img src="assets/${esc(page.images.portrait.src)}" alt="${esc(page.images.portrait.alt)}" width="${page.images.portrait.width || 1200}" height="${page.images.portrait.height || 900}" loading="lazy">
      </figure>`
    : `<figure class="portrait-empty" aria-hidden="true"></figure>`;

  const addressHtml = [page.name, page.street, [page.city, page.region, page.postcode].filter(Boolean).join(', '), page.hours]
    .filter(Boolean)
    .map(esc)
    .join('<br>\n        ');

  return `<!DOCTYPE html>
<html class="no-js" lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta name="description" content="${esc(page.description)}">
  <meta name="theme-color" content="${t.paperTop}">
  <title>${esc(page.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Homemade+Apple&family=IBM+Plex+Mono:wght@400;500&family=Pacifico&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../lib/craft.css">
  <style>
    :root {
      --paper-top: ${t.paperTop};
      --paper-mid: ${t.paperMid};
      --paper-bot: ${t.paperBot};
      --brand: ${t.brand};
      --glass-a: ${t.glassA};
      --glass-b: ${t.glassB};
      --glass-c: ${t.glassC};
      --lime: ${t.lime};
    }
  </style>
  <script type="application/ld+json">
  ${JSON.stringify(jsonLd)}
  </script>
</head>
<body class="haoqi-craft slug-${esc(page.slug)}">
  <a class="skip" href="#main">Skip to content</a>
  <div class="load" aria-hidden="true"><div class="load-track"><div class="load-bar"></div></div></div>
  <div class="sky" aria-hidden="true"></div>
  <div class="cad" aria-hidden="true"></div>
  <canvas id="stage" aria-hidden="true"></canvas>
  <canvas id="gl" aria-hidden="true"></canvas>
  <div class="readout" id="readout">--:--  0000 X  0000 Y</div>

  <header class="site-header">
    ${mark}
    <button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
  </header>
  <nav class="overlay" hidden>
    <a href="#work">${esc(page.navWork || 'Work')}</a>
    <a href="#story">${esc(page.navStory || 'Story')}</a>
    <a href="#visit">Visit</a>
    ${tel ? `<a href="${esc(tel)}">Call</a>` : `<a href="${esc(page.siteUrl)}">Their site</a>`}
  </nav>

  <main id="main">
    <section class="hero">
      <div class="word-slot" id="word-slot" aria-hidden="true"></div>
      <div class="hero-copy">
        <h1>${esc(page.headline)}</h1>
        <p class="lede" data-scramble>${esc(page.lede)}</p>
        <div class="actions">
          <a class="cta" href="${esc(ctaHref)}">${esc(ctaLabel)}</a>
          <a class="ghost" href="${esc(ghostHref)}">${esc(ghostLabel)}</a>
        </div>
      </div>
    </section>

    <section class="offerings" id="work">
      <h2 class="reveal">${esc(page.offerTitle)}</h2>
      <div class="offer-grid">${offers}
      </div>
    </section>

    <section class="proof" id="proof">
      <h2 class="reveal">${esc(page.proofTitle)}</h2>
      <div class="proof-grid">${proofs}
      </div>
    </section>

    <section class="story" id="story">
      <div class="reveal">
        <h2>${esc(page.storyTitle)}</h2>
        ${(page.story || []).map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
      </div>
      ${storyImg}
    </section>

    ${galleryImg ? `<section class="gallery">
      <h2 class="reveal">${esc(page.galleryTitle || 'Visual evidence')}</h2>
      <div class="gallery-grid">
        ${galleryImg}
      </div>
    </section>` : ''}

    <section class="process" id="process">
      <h2 class="reveal">${esc(page.processTitle)}</h2>
      <div class="offer-grid">${steps}
      </div>
    </section>

    <section class="experience">
      <h2 class="reveal">${esc(page.expTitle)}</h2>
      <div class="exp-grid">
        ${(page.experience || []).slice(0, 3).map((line) => `        <article class="reveal"><p>${esc(line)}</p></article>`).join('\n')}
      </div>
    </section>

    <section class="area" id="area">
      <h2 class="reveal">${esc(page.areaTitle)}</h2>
      <div class="exp-grid">${areas}
      </div>
    </section>

    <section class="portrait">
      ${portrait}
      <div class="grain" aria-hidden="true"></div>
      <p class="sign">${esc(page.sign)}</p>
      <span class="shot-meta">${esc(page.shotMeta)}</span>
    </section>

    <section class="contact-system" id="visit">
      <h2 class="reveal">${esc(page.visitTitle || 'Come in')}</h2>
      <address class="reveal">
        ${addressHtml}
      </address>
      <div class="visit-links reveal">
        <a class="cta" href="${esc(ctaHref)}">${esc(tel ? 'Call' : ctaLabel)}</a>
        ${maps ? `<a class="ghost" href="${esc(maps)}">Directions</a>` : ''}
        <a class="ghost" href="${esc(page.siteUrl)}">Their current site</a>
      </div>
    </section>

    <section class="closing">
      <h2 class="reveal">${esc(page.closeTitle)}</h2>
      <p class="reveal">${esc(page.closeBody)}</p>
      <p class="reveal"><a class="cta" href="${esc(ctaHref)}">${esc(ctaLabel)}</a></p>
      <p class="note">${esc(page.note)}</p>
    </section>
  </main>

  <footer class="site-footer">
    <span id="meta">--:--  PHL</span>
    <span class="rec" aria-hidden="true"></span>
  </footer>
  <div class="mobile-bar">
    <a class="cta" href="${esc(ctaHref)}">${esc(tel ? 'Call' : ctaLabel)}</a>
    <a class="ghost" href="#visit">Visit</a>
  </div>
  <script src="../lib/craft.js"></script>
  <script>HaoqiCraft.mount({ word: ${JSON.stringify(page.word)}, cityMeta: "PHL" });</script>
</body>
</html>
`;
}

module.exports = { render, esc, telHref, displayPhone, tokensFromPalette, SCHEMA };
