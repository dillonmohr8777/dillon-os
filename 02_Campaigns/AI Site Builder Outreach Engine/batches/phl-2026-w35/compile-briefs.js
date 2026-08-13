#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { buildSite } = require('../../../../_templates/site-factory/build-site.js');

const BATCH = __dirname;
const HARVEST = path.resolve(__dirname, '../../../../_templates/site-factory/harvest');
const meta = JSON.parse(fs.readFileSync(path.join(BATCH, 'prospect-meta.json'), 'utf8'));
const chosen = JSON.parse(fs.readFileSync(path.join(BATCH, 'chosen.json'), 'utf8'));
const paletteOverrides = JSON.parse(fs.readFileSync(path.join(BATCH, 'palette-overrides.json'), 'utf8'));

const SKIP = new Set([
  // goverical.com is now a South Carolina developer, not the Philly climbing gym.
  'go-vertical',
]);

const SALVAGE = new Set(['specks-chicken', 'euphoria-nail-bar', 'ooka-hibachi']);

const JUNK_TITLE =
  /parked|buy this domain|godaddy|coming soon|404|not found|forbidden|wp engine|default web site|iis7|access denied|just a moment|attention required|cloudflare|unknown content|410:|wix|reconnect|robot|captcha|suspended|this domain/i;

const GAMBLE =
  /betting|casino|jackpot|slots|mostbet|1-win|1win|plinko|sportsbook|babu88|betvisa|pin-up app|win vegas|battery bet/i;

// Screenshot-proven facts when harvest JSON missed the street, phone, or hours.
const FACTS = {
  'golden-sea': {
    address: '1301 Skippack Pike, Blue Bell, PA 19422',
    phone: '(610) 292-8881',
    hours: 'Tue-Thu 11:30am-9:30pm; Fri-Sat 11:30am-10:30pm; Sun 12-9:30pm. Closed Mondays.',
  },
  'sangillo-tire': {
    address: '1114 MacDade Blvd, Folsom, PA 19033',
    phone: '(610) 586-3340',
    hours: 'Mon-Fri 8am-5pm, Sat 8am-12pm. Closed Sunday.',
  },
  'specks-chicken': {
    address: '3969 Ridge Pike, Collegeville, PA 19426',
    phone: '(610) 489-2110',
    hours: 'Mon-Fri 10am-9pm, Sat 11am-9pm, Sun 12pm-9pm',
  },
  'euphoria-nail-bar': {
    address: '4430 Main Street, Philadelphia, PA 19127',
    phone: '(215) 483-4341',
    hours: 'Mon-Sat 9am-8pm, Sun 10am-6pm',
  },
  'union-jacks': { phone: '610.754.0189', hours: '' },
  'caise-benefits': {
    address: '3561 Concord Road, Aston, PA 19014',
    phone: '610-494-8270',
    hours: 'Mon-Fri 8am-5pm',
  },
  'dirt-work-solutions': {
    address: '3755 Main Street, Slatington, PA 18080',
    phone: '484-239-6961',
  },
  'advance-exterior': { phone: '(484) 601-5137', hours: 'Mon-Fri 9am-5pm' },
  'red-hill-greenhouse': {
    address: '1006 Main St, Red Hill, PA 18076',
    phone: '(215) 679-7847',
  },
  'captain-car-wash': { phone: '610-539-9390' },
};

const VOICE = {
  'specks-chicken': {
    headings: ['Chicken at its finest', 'Broasted chicken since 1953', 'Drive-in in Collegeville'],
    paragraphs: [
      "Speck's Drive-In has been family-owned since 1953. They are known for broasted chicken, sandwiches, daily specials, sides, garden salads, and a secret-recipe coleslaw.",
      'Order for pickup, or use the Grubhub and DoorDash links they publish. Party orders are on the menu too.',
    ],
  },
  'euphoria-nail-bar': {
    headings: ["Manayunk's newest nail bar", 'Manicures, pedicures, waxing'],
    paragraphs: [
      'Euphoria Nail Bar sits at 4430 Main Street in Manayunk, at Main and Connaroe. They publish manicures, pedicures, nail-bar service, and waxing.',
      'They say they want a relaxing, stress-free room while they take care of the work. Hours on the current site: Monday to Saturday 9 to 8, Sunday 10 to 6.',
    ],
  },
  'ooka-hibachi': {
    headings: ['Hibachi and sushi in four towns', 'Doylestown', 'Willow Grove', 'Montgomeryville', 'Riverside'],
    paragraphs: [
      'Ooka Hibachi and Sushi lists four towns on the current homepage: Doylestown, Willow Grove, Montgomeryville, and Riverside.',
      'The live root URL currently shows a page-not-found overlay on a sushi-case photo. This rebuild keeps the four towns they print and leaves street, phone, and hours empty until a harvest proves them.',
    ],
  },
};

function walk(obj, acc = []) {
  if (!obj) return acc;
  if (Array.isArray(obj)) {
    obj.forEach((x) => walk(x, acc));
    return acc;
  }
  if (typeof obj === 'object') {
    acc.push(obj);
    Object.values(obj).forEach((v) => walk(v, acc));
  }
  return acc;
}

function hexToRgb(hex) {
  const c = String(hex || '').replace('#', '');
  if (c.length !== 6) return null;
  return [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16));
}
function rgbToHex([r, g, b]) {
  return (
    '#' +
    [r, g, b]
      .map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}
function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}
function lum(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const a = rgb.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function sat(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((x) => x / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  const l = (max + min) / 2;
  return d / (1 - Math.abs(2 * l - 1));
}
function hue(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((x) => x / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return ((h * 60) + 360) % 360;
}
function contrast(a, b) {
  const L1 = lum(a);
  const L2 = lum(b);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}
function onColor(bg) {
  return contrast(bg, '#090909') >= contrast(bg, '#FFFFFF') ? '#090909' : '#FFFFFF';
}
function darken(hex, targetLum = 0.08) {
  let c = hex;
  for (let i = 0; i < 12 && lum(c) > targetLum; i++) c = mix(c, '#050505', 0.28);
  return c;
}

function deriveTokens(palette, vertical) {
  const ranked = (palette || [])
    .map((p) => ({ hex: String(p.hex || '').toUpperCase(), weight: p.weight || 0 }))
    .filter((p) => /^#[0-9A-F]{6}$/.test(p.hex))
    .filter((p) => lum(p.hex) < 0.92 && lum(p.hex) > 0.06);
  const colorful = ranked.filter((p) => sat(p.hex) >= 0.18);
  const pool = colorful.length ? colorful : ranked;
  let accent = (pool.sort((a, b) => sat(b.hex) * 0.7 + Math.log10(b.weight + 1) * 0.3 - (sat(a.hex) * 0.7 + Math.log10(a.weight + 1) * 0.3))[0] || {}).hex;
  if (!accent) accent = fallbackAccent(vertical);
  const others = pool.filter((p) => Math.abs(hue(p.hex) - hue(accent)) > 28);
  let accent2 = (others.sort((a, b) => sat(b.hex) - sat(a.hex))[0] || {}).hex;
  if (!accent2) accent2 = mix(accent, '#C4A35A', 0.55);
  const paper = mix('#F6F3EA', accent, 0.08);
  const ink = mix('#16120F', accent, 0.22);
  const panel = mix(paper, accent, 0.42);
  const deep = darken(accent, 0.07);
  return withOnColors({
    paper,
    ink,
    accent,
    accent2,
    panel,
    deep,
    border: '1px',
    radius: '24px',
  });
}

function withOnColors(tokens) {
  return {
    ...tokens,
    onPaper: onColor(tokens.paper),
    onAccent: onColor(tokens.accent),
    onAccent2: onColor(tokens.accent2),
    onPanel: onColor(tokens.panel),
    onDeep: onColor(tokens.deep),
    border: tokens.border || '1px',
    radius: tokens.radius || '24px',
  };
}

function applyOverride(tokens, override) {
  if (!override) return tokens;
  return withOnColors({ ...tokens, ...override });
}

function fallbackAccent(vertical) {
  const map = {
    restaurant: '#C45C26',
    bar: '#8B1E3F',
    'fitness-centre': '#2E6BFF',
    insurance: '#1F4E79',
    car: '#C8102E',
    'car-repair': '#1E73BE',
    'car-parts': '#D86E07',
    dentist: '#1878C2',
    hvac: '#02537E',
    books: '#5C3D82',
    clothes: '#7A4E48',
    beauty: '#D38377',
    tattoo: '#181818',
    distillery: '#7A1F2B',
    architect: '#4E6A86',
    'swimming-pool': '#00B3C4',
    'estate-agent': '#1B365D',
    it: '#244E8A',
    tyres: '#111111',
    'car-wash': '#009AD9',
    physiotherapist: '#1A6B6B',
    roofing: '#1B365D',
    financial: '#1F4E79',
    lawyer: '#1B365D',
    florist: '#4F7965',
    excavation: '#E0A020',
  };
  return map[vertical] || '#1F4E79';
}

function fontsFor(vertical) {
  const serif = { display: 'Playfair Display', displayFallback: 'Georgia,serif', text: 'DM Sans' };
  const condensed = { display: 'Oswald', displayFallback: 'system-ui,sans-serif', text: 'DM Sans' };
  const soft = { display: 'Nunito', displayFallback: 'system-ui,sans-serif', text: 'DM Sans' };
  const editorial = { display: 'Cormorant Garamond', displayFallback: 'Georgia,serif', text: 'DM Sans' };
  const outfit = { display: 'Outfit', displayFallback: 'system-ui,sans-serif', text: 'DM Sans' };
  const map = {
    restaurant: serif,
    bar: condensed,
    distillery: serif,
    'fitness-centre': outfit,
    insurance: serif,
    dentist: soft,
    beauty: editorial,
    clothes: editorial,
    tattoo: condensed,
    books: serif,
    hvac: condensed,
    car: condensed,
    'car-repair': condensed,
    'car-parts': condensed,
    tyres: condensed,
    'car-wash': condensed,
    architect: condensed,
    'swimming-pool': outfit,
    'estate-agent': serif,
    it: outfit,
    physiotherapist: soft,
    roofing: condensed,
    financial: serif,
    lawyer: serif,
    florist: editorial,
    excavation: condensed,
  };
  return map[vertical] || serif;
}

function categoryFor(vertical, name) {
  const map = {
    restaurant: 'Restaurant',
    bar: 'Bar',
    distillery: 'Distillery',
    'fitness-centre': /climb|bjj|jiu|muay/i.test(name) ? 'Martial arts' : 'Fitness',
    insurance: 'Insurance',
    dentist: 'Dentistry',
    beauty: 'Nail salon',
    clothes: /bridal/i.test(name) ? 'Bridal' : 'Retail',
    tattoo: 'Tattoo studio',
    books: /wine/i.test(name) ? 'Bookstore and wine bar' : 'Comic shop',
    hvac: 'Heating and cooling',
    car: 'Auto dealer',
    'car-repair': 'Auto repair',
    'car-parts': 'Auto parts',
    tyres: 'Tires',
    'car-wash': 'Car wash',
    architect: 'Architecture',
    'swimming-pool': 'Pools and spas',
    'estate-agent': 'Real estate',
    it: 'IT services',
    physiotherapist: 'Physical therapy',
    roofing: 'Roofing',
    financial: 'Wealth management',
    lawyer: 'Law firm',
    florist: 'Florist',
    excavation: 'Excavation',
  };
  return map[vertical] || 'Local business';
}

function clean(s) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .replace(/[\u2013\u2014]/g, ', ')
    .trim();
}

function noBadStart(s) {
  return String(s || '').replace(/^(And|But|Or|It is|Do not|That is|This is)\s+/i, '');
}

function pickSentences(paragraphs, n = 2) {
  const out = [];
  for (const p of paragraphs || []) {
    const t = noBadStart(clean(p));
    if (t.length < 50 || t.length > 420) continue;
    if (/lorem|cookie|javascript|privacy policy|copyright|prove that you are human|1 \+ 6/i.test(t)) continue;
    if (GAMBLE.test(t)) continue;
    out.push(t);
    if (out.length >= n) break;
  }
  return out;
}

function extractAddress(jsonLd) {
  const nodes = walk(jsonLd);
  for (const n of nodes) {
    const street = n.streetAddress || n.street_address;
    const city = n.addressLocality || n.address_locality;
    const region = n.addressRegion || n.address_region;
    const zip = n.postalCode || n.postal_code;
    if (street && city) {
      return [street, city, region, zip].filter(Boolean).join(', ');
    }
    if (n.address && typeof n.address === 'string' && /\d/.test(n.address) && n.address.length < 120) {
      return n.address;
    }
  }
  return '';
}

function cleanPhone(raw) {
  const s = clean(raw).replace(/^call\s+/i, '');
  if (!s || /^call us$/i.test(s)) return '';
  const digits = s.replace(/\D/g, '');
  if (digits.length < 10) return '';
  return s;
}

function cleanHours(raw) {
  const s = clean(raw);
  if (!s || s.length > 140) return '';
  if (!/\d/.test(s)) return '';
  if (/friends|enthusiastically|lending|mong fans|battery bet/i.test(s)) return '';
  return s;
}

function cleanAddress(raw) {
  const s = clean(raw);
  if (!s || s.length > 140) return '';
  if (!/\d/.test(s)) return '';
  if (/valuedclient|@|Office:|Devon, PA Office/i.test(s)) return '';
  return s;
}

function extractPhone(h) {
  return cleanPhone(h.facts?.phone) || cleanPhone((walk(h.facts?.jsonLd).find((n) => n.telephone || n.phone) || {}).telephone || (walk(h.facts?.jsonLd).find((n) => n.phone) || {}).phone);
}

function extractHours(h) {
  const fromFacts = cleanHours(h.facts?.hours);
  if (fromFacts) return fromFacts;
  const nodes = walk(h.facts?.jsonLd);
  for (const n of nodes) {
    const oh = n.openingHours || n.openingHoursSpecification;
    if (typeof oh === 'string') {
      const cleaned = cleanHours(oh);
      if (cleaned) return cleaned;
    }
  }
  return '';
}

function primaryHref(url, phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length >= 10) return { label: 'Call', href: `tel:${digits}` };
  return { label: 'Open the site', href: url };
}

function isJunk(h, slug) {
  if (SKIP.has(slug)) return 'skipped';
  if (SALVAGE.has(slug)) return '';
  if (h.site?.error) return h.site.error;
  const title = `${h.voice?.title || ''} ${h.voice?.ogTitle || ''}`;
  if (JUNK_TITLE.test(title)) return 'junk title';
  const paras = h.voice?.paragraphs || [];
  const heads = h.voice?.headings || [];
  if (paras.length < 1 && heads.length < 2) return 'thin harvest';
  return '';
}

function uniquePhrases(list, max) {
  const seen = new Set();
  const out = [];
  for (const raw of list || []) {
    const t = clean(raw).replace(/\|/g, ' ');
    if (t.length < 3 || t.length > 42) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

function hydrateVoice(slug, h) {
  const extra = VOICE[slug];
  if (!extra) return h;
  const next = JSON.parse(JSON.stringify(h));
  next.voice = next.voice || {};
  if (slug === 'ooka-hibachi') {
    next.voice.paragraphs = extra.paragraphs;
    next.voice.headings = extra.headings;
    next.voice.ctaLabels = [];
    next.voice.navLabels = extra.headings.slice(1);
  } else {
    if (!(next.voice.paragraphs || []).length) next.voice.paragraphs = extra.paragraphs;
    if (!(next.voice.headings || []).length) next.voice.headings = extra.headings;
  }
  return next;
}

function buildBrief(slug, h, info) {
  const name = info.name;
  const city = info.city || 'Philadelphia';
  const vertical = info.vertical || '';
  const category = categoryFor(vertical, name);
  const url = info.siteUrl;
  const overlay = FACTS[slug] || {};
  const phone = overlay.phone || extractPhone(h);
  const hours = overlay.hours !== undefined && overlay.hours !== null && String(overlay.hours).length
    ? overlay.hours
    : overlay.hours === ''
      ? ''
      : extractHours(h);
  const address = overlay.address || cleanAddress(extractAddress(h.facts?.jsonLd));
  const tokens = applyOverride(deriveTokens(h.brand?.palette, vertical), paletteOverrides[slug]);
  const fonts = fontsFor(vertical);
  const headings = (h.voice?.headings || []).map(clean).filter((t) => t.length > 3 && t.length < 80 && !GAMBLE.test(t));
  const paras = pickSentences(h.voice?.paragraphs, 6);
  const nav = uniquePhrases(h.voice?.navLabels, 8);
  const ctas = uniquePhrases(h.voice?.ctaLabels, 6);
  const heroLine = headings.find((t) => !/home|welcome|menu/i.test(t) && t.length > 8) || name;
  const subBits = [];
  if (paras[0]) subBits.push(paras[0].slice(0, 220));
  else subBits.push(`${name} is a ${category.toLowerCase()} in ${city}.`);
  const radarNote = (info.faults && info.faults[0]) || (info.headline && /viewport|https|copy/i.test(info.headline) ? info.headline : '');
  const storyParas = [];
  if (paras[0]) storyParas.push(paras[0]);
  if (paras[1]) storyParas.push(paras[1]);
  if (storyParas.length < 2) {
    storyParas.push(`${name} serves ${city}${info.area ? ` in ${info.area}` : ''}. The rebuild keeps their words and puts the next action on the page.`);
  }
  if (radarNote && storyParas.join(' ').length < 380) {
    storyParas.push(`The radar flagged this site: ${String(radarNote).replace(/\s+/g, ' ').slice(0, 140)}.`);
  }
  while (storyParas.length < 2) storyParas.push(`${name} is listed in ${city}. Confirm details on the official site before you drive.`);

  const offerSeeds = headings.filter((t) => t.length > 8 && t !== heroLine).slice(0, 3);
  while (offerSeeds.length < 3) {
    const extras = [
      `${category} work for people who already know the shop.`,
      `Walk-in questions and the jobs they actually take.`,
      `A homepage that names the next step instead of hiding it.`,
    ];
    offerSeeds.push(extras[offerSeeds.length]);
  }
  const offerings = offerSeeds.map((title, i) => ({
    title: title.replace(/[.!?]+$/, ''),
    text: paras[i + 2] || `${name} in ${city}. ${phone ? `Call ${phone}.` : 'Open the official site for details.'}`,
  }));

  const ctaPrimary = primaryHref(url, phone);
  if (ctas[0] && !/click here|learn more|betwhale/i.test(ctas[0])) ctaPrimary.label = ctas[0];
  const ctaSecondary = { label: 'Open the site', href: url };

  const marquee = uniquePhrases([city, category, ...(nav.slice(0, 3)), name.split(' ')[0]], 4);
  while (marquee.length < 3) marquee.push(city);

  const featureHeading = headings[1] || `What ${name} is known for`;
  const spotlightHeading = headings[2] || `${city} on the map`;

  const catalogTitles = uniquePhrases(nav.filter((t) => !/home|facebook|instagram|link to/i.test(t)), 3);
  while (catalogTitles.length < 3) catalogTitles.push(['Visit', 'Call', 'Official site'][catalogTitles.length]);

  const brief = {
    noindex: true,
    schemaType: 'LocalBusiness',
    logo: true,
    attitude: 'align',
    fonts,
    tokens,
    nav: [
      { label: 'Work', href: '#offerings' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'Visit', href: '#visit' },
    ],
    images: Array.from({ length: 13 }, (_, i) => ({
      file: `image-${i + 1}.webp`,
      alt: `Generated 3D illustrated scene of ${category.toLowerCase()} work for ${name}, frame ${i + 1}, generated not photographed`,
    })),
    slug,
    name,
    city,
    category,
    vertical: vertical || category,
    url,
    phone,
    address,
    hours,
    description: clean(h.voice?.metaDescription || h.voice?.ogDescription || `${name} in ${city}. ${category}.`).slice(0, 158),
    marquee,
    hero: {
      eyebrow: `${city} | ${category}`,
      headline: heroLine.slice(0, 70),
      sub: subBits.join(' ').slice(0, 280),
      ctaPrimary,
      ctaSecondary,
      glassFloat: { title: city, sub: category },
      marquee,
    },
    offerings: {
      heading: offerSeeds[0] ? `${offerSeeds[0].replace(/[.!?]+$/, '')}.` : 'What they actually do.',
      items: offerings,
    },
    gallery: {
      heading: 'A look at the work.',
      imageIndexes: [3, 4, 5, 6, 7, 12],
    },
    story: {
      heading: headings.find((t) => /about|story|our|who/i.test(t)) || `About ${name.split(' ')[0]}`,
      paragraphs: storyParas.slice(0, 2),
      imageIndex: 2,
    },
    experience: {
      heading: 'How a visit actually goes.',
      items: [
        { title: phone ? 'Call before you drive' : 'Start on the official site', text: phone ? `Reach ${name} at ${phone}.` : `Open ${url} for the current details.` },
        { title: hours ? 'Hours they publish' : 'Confirm hours first', text: hours || 'Hours were not verified on the harvest. Check the official site.' },
        { title: address ? 'A real street' : `${city} on the map`, text: address ? `${address}.` : `${name} is listed in ${city}. No street address is invented here.` },
      ],
    },
    feature: {
      heading: featureHeading.replace(/[.!?]+$/, ''),
      text: paras[3] || `${name} keeps the work in ${city}. The rebuild puts the next action where a phone can hit it.`,
      cta: { label: 'Official site', href: url },
      imageIndex: 8,
    },
    spotlight: {
      heading: spotlightHeading.replace(/[.!?]+$/, ''),
      text: paras[4] || (radarNote ? `The current site still shows this fault: ${String(radarNote).slice(0, 120)}.` : `${name} is a ${category.toLowerCase()} serving ${city}.`),
      imageIndex: 13,
      cta: { label: 'Visit', href: url },
    },
    catalog: {
      items: catalogTitles.slice(0, 3).map((title, i) => ({
        title,
        href: url,
        imageIndex: 9 + i,
        text: `${title} at ${name} in ${city}.`,
      })),
    },
    contact: {
      heading: address ? 'The address, the phone, the map.' : `${city}. Confirm before you go.`,
      sub: address || `${name} is listed in ${city}. Street address stays empty until a harvest or listing proves it.`,
    },
    closing: { cta: ctaPrimary },
    links: [
      phone ? { label: 'Call', href: `tel:${phone.replace(/\D/g, '')}` } : null,
      { label: 'Official site', href: url },
    ].filter(Boolean),
  };
  return brief;
}

function trimWords(brief, targetMax = 495) {
  const tmp = path.join('/tmp', `w35-word-${brief.slug}`);
  fs.mkdirSync(path.join(tmp, brief.slug, 'assets'), { recursive: true });
  let built = buildSite(brief, tmp);
  if (built.words > targetMax) {
    brief.story.paragraphs = brief.story.paragraphs.map((p) => p.slice(0, 180));
    brief.hero.sub = brief.hero.sub.slice(0, 160);
    brief.feature.text = String(brief.feature.text || '').slice(0, 140);
    brief.spotlight.text = String(brief.spotlight.text || '').slice(0, 140);
    brief.offerings.items = brief.offerings.items.map((it) => ({ ...it, text: String(it.text || '').slice(0, 90) }));
    built = buildSite(brief, tmp);
  }
  while (built.words < 350) {
    brief.story.paragraphs.push(`${brief.name} keeps the work in ${brief.city}. Details belong on the official site, not guessed here.`);
    built = buildSite(brief, tmp);
    if (brief.story.paragraphs.length > 4) break;
  }
  return { brief, words: built.words, sections: built.sections.length };
}

function main() {
  if (chosen.length !== 25) {
    console.error(`chosen.json has ${chosen.length} slugs, need 25`);
    process.exit(1);
  }

  const briefsDir = path.join(BATCH, 'briefs');
  fs.mkdirSync(briefsDir, { recursive: true });
  for (const leftover of fs.readdirSync(briefsDir).filter((f) => f.endsWith('.json'))) {
    const slug = leftover.replace(/\.json$/, '');
    if (!chosen.includes(slug)) fs.unlinkSync(path.join(briefsDir, leftover));
  }

  for (const slug of chosen) {
    const info = meta[slug];
    if (!info) {
      console.error(`missing prospect-meta for ${slug}`);
      process.exit(1);
    }
    const file = path.join(HARVEST, slug, 'harvest.json');
    if (!fs.existsSync(file) && !SALVAGE.has(slug)) {
      console.error(`no harvest for ${slug}`);
      process.exit(1);
    }
    const h = fs.existsSync(file)
      ? hydrateVoice(slug, JSON.parse(fs.readFileSync(file, 'utf8')))
      : hydrateVoice(slug, { voice: {}, facts: {}, brand: {} });
    const junk = isJunk(h, slug);
    if (junk) {
      console.error(`chosen ${slug} is junk: ${junk}`);
      process.exit(1);
    }
    const { brief, words, sections } = trimWords(buildBrief(slug, h, info));
    fs.writeFileSync(path.join(briefsDir, `${slug}.json`), JSON.stringify(brief, null, 2));
    console.log(`brief ${slug}: ${sections} sec, ${words} words, accent ${brief.tokens.accent}, addr ${brief.address ? 'yes' : 'hold'}`);
  }
}

main();
