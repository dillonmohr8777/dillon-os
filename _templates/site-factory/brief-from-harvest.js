#!/usr/bin/env node
/**
 * Compile a site-factory brief from a harvest.json + radar target row.
 *
 * Palette, fonts, copy, and facts come from the harvest. Attitude and a
 * composition_ref (wow-library URL) come from the batch mapping. Never copies
 * a reference site's brand onto the business.
 *
 *   node brief-from-harvest.js <harvest.json> <target.json-or-row> [out.json]
 */
const fs = require('fs');
const path = require('path');
const { inferAttitude } = require('./lib/skins.js');

function hexToRgb(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function relLum([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a, b) {
  const L1 = relLum(a);
  const L2 = relLum(b);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}
function onColor(hex) {
  const rgb = hexToRgb(hex) || [255, 255, 255];
  const white = contrast(rgb, [255, 255, 255]);
  const black = contrast(rgb, [9, 9, 9]);
  return white >= black ? '#FFFFFF' : '#090909';
}
function sat(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const max = Math.max(...rgb);
  const min = Math.min(...rgb);
  if (max === 0) return 0;
  return (max - min) / max;
}
function lum(hex) {
  const rgb = hexToRgb(hex);
  return rgb ? (rgb[0] + rgb[1] + rgb[2]) / 3 : 0;
}
function mix(a, b, t) {
  const A = hexToRgb(a) || [240, 236, 228];
  const B = hexToRgb(b) || [20, 24, 32];
  const m = A.map((v, i) => Math.round(v * (1 - t) + B[i] * t));
  return '#' + m.map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
}
function clean(s) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .replace(/[\u2013\u2014]/g, ',')
    .trim();
}
function noLead(s) {
  return clean(s)
    .replace(/^(And|But|Or|It is|Do not|That is|This is)\b[, ]*/i, '')
    .replace(/^[a-z]/, (c) => c.toUpperCase());
}
function clipWords(s, n) {
  const parts = clean(s).split(/\s+/).filter(Boolean);
  if (parts.length <= n) return parts.join(' ');
  return parts.slice(0, n).join(' ');
}
function wordsOf(...parts) {
  return parts
    .flat()
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

function looksLikeHours(s) {
  const t = clean(s);
  if (!t || t.length > 90) return false;
  if (/semper|friends|satisfaction|employee|comfort and quality|facebook|call us/i.test(t)) return false;
  return /\b(\d{1,2}(:\d{2})?\s*(a\.?m\.?|p\.?m\.?)|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon-fri|closed)\b/i.test(
    t
  );
}
function looksLikePhone(s) {
  const d = String(s || '').replace(/\D/g, '');
  return d.length >= 10 && d.length <= 11;
}
function looksLikeCta(s) {
  const t = clean(s);
  if (!t || t.length > 28) return false;
  if (
    /icon|facebook|instagram|twitter|linkedin|logo|close|search|cart|youtube|menu|shrimp|scallop|stromboli|coupon|50%|browse|newsletter/i.test(
      t
    )
  ) {
    return false;
  }
  return /book|call|contact|schedule|visit|get in touch|plan a visit|quote|order|reserve|appoint/i.test(t);
}

function walkJsonLd(nodes) {
  const phones = [];
  const addrs = [];
  const seen = new Set();
  const walk = (o, depth) => {
    if (!o || depth > 8) return;
    if (typeof o === 'string') {
      if (seen.has(o) || o.length < 8) return;
      seen.add(o);
      return;
    }
    if (Array.isArray(o)) {
      o.slice(0, 40).forEach((x) => walk(x, depth + 1));
      return;
    }
    if (typeof o !== 'object') return;
    if (o.telephone) phones.push(String(o.telephone));
    const a = o.address;
    if (typeof a === 'string' && a.length > 10) addrs.push(a);
    if (a && typeof a === 'object') {
      const s = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode]
        .filter(Boolean)
        .join(', ');
      if (s) addrs.push(s);
    }
    Object.values(o).forEach((v) => walk(v, depth + 1));
  };
  walk(nodes, 0);
  return { phones, addrs };
}

function extractAddressFromText(texts, city) {
  const re =
    /\b\d{1,5}\s+[A-Za-z0-9.'#-]+(?:\s+[A-Za-z0-9.'#-]+){0,6}\s+(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Pike|Boulevard|Blvd\.?|Drive|Dr\.?|Lane|Ln\.?|Way|Court|Ct\.?)\.?\b(?:[^\n,]{0,40})(?:,\s*[A-Za-z .]{2,40}){0,3}(?:,?\s*(?:PA|Pennsylvania))?(?:,?\s*\d{5})?/gi;
  for (const t of texts) {
    const m = String(t || '').match(re);
    if (!m) continue;
    let hit = clean(m[0]).replace(/\s+,/g, ',');
    if (hit.length < 12 || hit.length > 160) continue;
    if (!/\d{5}|Philadelphia|Pennsylvania|\bPA\b/.test(hit) && city) {
      hit = `${hit}, ${city}, PA`;
    }
    if (/\d{5}|Philadelphia|Pennsylvania|\bPA\b/.test(hit)) return hit;
  }
  return '';
}

const GOOGLE_FONT_MAP = {
  georgia: 'Playfair Display',
  times: 'Libre Baskerville',
  'times new roman': 'Libre Baskerville',
  garamond: 'Cormorant Garamond',
  palatino: 'Cormorant Garamond',
  impact: 'Anton',
  'arial black': 'Archivo Black',
  oswald: 'Oswald',
  bebas: 'Bebas Neue',
  montserrat: 'Montserrat',
  lato: 'Lato',
  roboto: 'Roboto',
  'open sans': 'Open Sans',
  poppins: 'Poppins',
  merriweather: 'Merriweather',
  raleway: 'Raleway',
  playfair: 'Playfair Display',
  'playfair display': 'Playfair Display',
  cormorant: 'Cormorant Garamond',
  fraunces: 'Fraunces',
  anton: 'Anton',
};

function pickTokens(harvest, attitude) {
  const palette = (harvest.brand && harvest.brand.palette) || harvest.palette || [];
  const entries = palette
    .map((p) => (typeof p === 'string' ? { hex: p, weight: 1 } : p))
    .filter((p) => /^#[0-9A-Fa-f]{6}$/.test((p && p.hex) || ''));
  const usable = entries.filter((p) => lum(p.hex) > 12 && lum(p.hex) < 248);
  const hexes = usable.map((p) => p.hex);
  const lights = hexes.filter((h) => lum(h) > 170).sort((a, b) => lum(b) - lum(a));
  const darks = hexes.filter((h) => lum(h) < 70).sort((a, b) => lum(a) - lum(b));
  const scored = [...usable]
    .filter((p) => sat(p.hex) > 0.12)
    .sort((a, b) => {
      const aw = a.weight || 1;
      const bw = b.weight || 1;
      if (bw > aw * 1.4) return 1;
      if (aw > bw * 1.4) return -1;
      return sat(b.hex) - sat(a.hex);
    });
  const accent = (scored[0] && scored[0].hex) || [...hexes].sort((a, b) => sat(b) - sat(a))[0] || '#C2410C';
  let accent2 = (scored[1] && scored[1].hex) || hexes.filter((h) => h !== accent).sort((a, b) => sat(b) - sat(a))[0];
  if (!accent2 || sat(accent2) < 0.12) accent2 = mix(accent, '#D4A017', 0.45);
  let paper = lights[0] || mix('#F6F1E8', accent, 0.1);
  let ink = darks[0] || mix('#141820', accent, 0.22);
  if (['warm', 'glass', 'editorial'].includes(attitude) && lum(paper) < 160) {
    paper = mix('#F6F1E8', accent, 0.12);
  }
  if (['industrial', 'brutal', 'neon'].includes(attitude) && lum(ink) > 80) {
    ink = mix('#121212', accent, 0.25);
  }
  const panel = mix(paper, accent, 0.32);
  const deep = darks[1] || mix('#0C1016', accent, 0.4);
  const border = attitude === 'brutal' || attitude === 'industrial' ? '4px' : attitude === 'editorial' || attitude === 'glass' ? '1px' : '2px';
  const radius = attitude === 'brutal' ? '0px' : attitude === 'industrial' ? '4px' : attitude === 'glass' ? '28px' : attitude === 'editorial' ? '2px' : '16px';
  return {
    paper,
    ink,
    accent,
    accent2,
    panel,
    deep,
    onPaper: onColor(paper),
    onAccent: onColor(accent),
    onAccent2: onColor(accent2),
    onPanel: onColor(panel),
    onDeep: onColor(deep),
    border,
    radius,
  };
}

function pickFonts(harvest, attitude) {
  const rawFonts = (harvest.brand && harvest.brand.fonts) || harvest.fonts || [];
  const families = rawFonts.map((f) => (typeof f === 'string' ? f : f.family));
  const displayMap = {
    brutal: 'Archivo Black',
    industrial: 'Anton',
    neon: 'Bungee',
    glass: 'Fraunces',
    editorial: 'Cormorant Garamond',
    warm: 'Fraunces',
  };
  const looksSerif = families.some((f) => /serif|garamond|times|georgia|playfair|bodoni|cormorant|palatino/i.test(f || ''));
  const bySize = [...rawFonts]
    .map((f) => (typeof f === 'string' ? { family: f, maxSizePx: 0 } : f))
    .sort((a, b) => (b.maxSizePx || 0) - (a.maxSizePx || 0));
  let mapped = '';
  for (const fam of [...bySize.map((f) => f.family), ...families]) {
    const key = String(fam || '').toLowerCase().replace(/['"]/g, '').trim();
    if (GOOGLE_FONT_MAP[key]) {
      mapped = GOOGLE_FONT_MAP[key];
      break;
    }
  }
  const display =
    mapped && attitude !== 'brutal' && attitude !== 'industrial'
      ? mapped
      : looksSerif && attitude !== 'brutal' && attitude !== 'industrial'
        ? 'Playfair Display'
        : displayMap[attitude] || 'Archivo';
  return { display, displayFallback: looksSerif ? 'Georgia,serif' : 'Impact,sans-serif', text: 'Instrument Sans' };
}

function pickAttitude(target, harvest) {
  const g = `${target.vertical_group || ''} ${target.vertical || ''}`.toLowerCase();
  if (/legal|lawyer/.test(g)) return 'editorial';
  if (/medical|dentist|vet|clinic|doctor/.test(g)) return 'glass';
  if (/tattoo|bar|nightlife|pub/.test(g)) return 'neon';
  if (/auto|car|tire/.test(g)) return 'brutal';
  if (/home-services|industrial|electric|hvac|metal|hardware|pipe|floorer/.test(g)) return 'industrial';
  if (/spa|food|retail|restaurant|beauty|fitness|florist|furniture|ice/.test(g)) return 'warm';
  if (harvest) {
    const palette = (harvest.brand && harvest.brand.palette) || [];
    const hexes = palette.map((p) => (typeof p === 'string' ? p : p.hex)).filter((h) => /^#[0-9A-Fa-f]{6}$/.test(h || ''));
    const avg = hexes.slice(0, 4).reduce((s, h) => s + lum(h), 0) / Math.max(hexes.slice(0, 4).length, 1);
    if (avg < 70) return 'industrial';
  }
  return 'warm';
}

function inferMirrorLayout(_target, _harvest) {
  return { layout: 'harvest-diner', heroMode: 'photo' };
}

function rawHarvestTexts(harvest) {
  const voice = harvest.voice || {};
  return [
    harvest.title,
    harvest.metaDescription,
    voice.title,
    voice.metaDescription,
    voice.ogDescription,
    ...(voice.headings || harvest.headings || []),
    ...(voice.paragraphs || harvest.paragraphs || []),
  ].filter(Boolean);
}

function inferTown(harvest, target, address) {
  const addrTown = String(address || '').match(
    /\b([A-Z][A-Za-z.'-]{2,}(?:\s+[A-Z][A-Za-z.'-]{2,}){0,2})\s+(?:PA|Pennsylvania)\b/
  );
  if (addrTown && !/county|street|avenue|road|drive|lane|pike/i.test(addrTown[1])) return clean(addrTown[1]);
  const blob = rawHarvestTexts(harvest).join(' ');
  const named = blob.match(/\b(?:of|in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+PA\b/);
  if (named && !/county/i.test(named[1])) return named[1];
  const city = target.city || '';
  if (city && !/county/i.test(city)) return city;
  return city || 'Pennsylvania';
}

function flattenCopy(value) {
  if (!value) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap((item) => flattenCopy(item));
  if (typeof value === 'object') {
    return [value.title, value.text, value.body, value.heading, value.sub, value.label].filter(Boolean);
  }
  return [];
}

function ensureCardText(text, fallback) {
  const t = noLead(text || '');
  if (wordsOf(t) >= 12) return clipWords(t, 28);
  const extra = noLead(fallback || '');
  return clipWords([t, extra].filter(Boolean).join(' '), 28);
}

function isJunkHead(h) {
  const t = clean(h);
  if (!t || t.length < 4 || t.length > 80) return true;
  if (/^(home|success!?|featured on:?|welcome to|our newsletter|drop us a line|hours of operation|checking your browser)$/i.test(t)) {
    return true;
  }
  if (/cookie|privacy policy|terms of use|copyright|just a moment/i.test(t)) return true;
  return false;
}

function isJunkPara(p) {
  const t = clean(p);
  if (!t || t.length < 40) return true;
  if (/copyright|privacy policy|terms of use|media room|dialogue is an essential/i.test(t)) return true;
  if (/ServicesLandscape|AreasAll Service|Personal Training Personal Training/i.test(t)) return true;
  if ((t.match(/[A-Z][a-z]+/g) || []).length > 14 && !/[.!?']/.test(t)) return true;
  return false;
}

function usefulNav(labels) {
  return (labels || [])
    .map(clean)
    .filter((t) => t && t.length < 28)
    .filter((t) => !/^(home|facebook|instagram|twitter|linkedin|logo|menu|close|search|cart)$/i.test(t));
}

function foundingLine(texts, name, city, category) {
  const blob = texts.join(' ');
  const year = blob.match(/\bsince\s+(19\d{2}|20\d{2})\b/i);
  const years = blob.match(/\bover\s+(\d{2,})\s+years\b/i);
  if (year) return `${name} has served ${city} since ${year[1]}.`;
  if (years) return `${name} has served ${city} for over ${years[1]} years.`;
  return `${name} is a ${city} ${category}.`;
}

function sentencesFrom(harvest, n, fallback, clip = 32) {
  const voice = harvest.voice || {};
  const paras = [...(voice.paragraphs || harvest.paragraphs || [])]
    .map(noLead)
    .filter((p) => !isJunkPara(p) && !/mobile website is live/i.test(p));
  const heads = [...(voice.headings || harvest.headings || [])]
    .map(noLead)
    .filter((h) => !isJunkHead(h) && h.length > 8 && h.length < 90);
  const out = [];
  for (const p of paras) {
    if (out.length >= n) break;
    out.push(clipWords(p, clip));
  }
  for (const h of heads) {
    if (out.length >= n) break;
    if (!out.some((x) => x.includes(h))) out.push(clipWords(h, Math.min(18, clip)));
  }
  while (out.length < n) out.push(fallback[out.length % fallback.length]);
  return out.slice(0, n);
}

function countWords(brief) {
  const chunks = [
    brief.description,
    brief.hero && brief.hero.sub,
    brief.hero && brief.hero.headline,
    ...flattenCopy(brief.offerings?.items || brief.offerings),
    ...flattenCopy(brief.proof?.items || brief.proof),
    brief.story?.heading,
    ...flattenCopy(brief.story?.paragraphs || []),
    ...flattenCopy(brief.experience?.items || brief.experience),
    brief.feature?.heading,
    brief.feature?.text,
    brief.spotlight?.heading,
    brief.spotlight?.text,
    ...flattenCopy(brief.catalog?.items || []),
    brief.contact?.heading,
    brief.contact?.sub,
    brief.closing?.heading,
  ];
  return wordsOf(chunks);
}

function buildBrief(harvest, target, compositionRef) {
  const attitude = pickAttitude(target, harvest);
  const tokens = pickTokens(harvest, attitude);
  const fonts = pickFonts(harvest, attitude);
  const mirror = inferMirrorLayout(target, harvest);
  if (!compositionRef) {
    fonts.display = 'Playfair Display';
    fonts.displayFallback = 'Georgia,serif';
  }
  const name = target.name || harvest.title || target.slug;
  const city = target.city || 'Philadelphia';
  const category = (target.vertical || target.vertical_group || 'Local service').replace(/-/g, ' ');
  const url = harvest.siteUrl || target.siteUrl;
  const jsonLd = [].concat((harvest.facts && harvest.facts.jsonLd) || harvest.jsonLd || []);
  const extracted = walkJsonLd(jsonLd);
  const voice = harvest.voice || {};
  const heads = (voice.headings || []).map(noLead).filter((h) => !isJunkHead(h));
  const paras = (voice.paragraphs || []).map(noLead).filter((p) => !isJunkPara(p));
  const navs = usefulNav(voice.navLabels || []);
  const textPool = [
    ...paras,
    ...heads,
    harvest.metaDescription,
    voice.metaDescription,
    voice.ogDescription,
  ];
  const rawPhone = [harvest.facts && harvest.facts.phone, harvest.phone, ...extracted.phones].find(looksLikePhone) || '';
  const phone = looksLikePhone(rawPhone) ? clean(rawPhone) : '';
  const hoursRaw = clean((harvest.facts && harvest.facts.hours) || harvest.hours || '');
  const hours = looksLikeHours(hoursRaw) ? hoursRaw : '';
  const address =
    clean((harvest.facts && harvest.facts.address) || '') ||
    extracted.addrs.find((a) => /\d/.test(a) && a.length > 10) ||
    extractAddressFromText(rawHarvestTexts(harvest), city) ||
    extractAddressFromText(textPool, city) ||
    '';
  const town = inferTown(harvest, target, address);

  const fallbackOffer = [
    `${name} handles ${category} for people who already look for that work in ${town}.`,
    `A visitor can reach ${name} from this page without hunting through a buried menu.`,
    `Public details stay in one place so the next visit is straightforward.`,
  ];
  const storyBits = sentencesFrom(
    harvest,
    3,
    [
      `${name} serves ${town} with ${category}. Neighbors already know the name from the work, not from a slogan.`,
      `The rebuild keeps their wording, their work, and a direct way to get in touch when someone is ready.`,
      `Come in with a question. Leave with a next step you can actually follow.`,
    ],
    36
  );
  const offerHeads = heads.filter((h) => {
    if (h.length < 6 || h.length > 48) return false;
    if (/direction|newsletter|sharing|copyright|delivers to|looking to take|call \d/i.test(h)) return false;
    return true;
  });
  const offerBodies = sentencesFrom(harvest, 3, fallbackOffer, 28);
  const offerings = [0, 1, 2].map((i) => ({
    title: clipWords((offerHeads[i] || offerBodies[i] || fallbackOffer[i]).replace(/\.$/, ''), 10),
    text: ensureCardText(offerBodies[i], fallbackOffer[i]),
  }));
  const experienceBits = paras.slice(2, 6).filter((p) => wordsOf(p) >= 10);
  const experienceFallback = [
    `Open the page on a phone. The primary action stays on screen so nobody has to pinch and hunt.`,
    `Call or write without digging a number out of a flattened image or a footer graphic.`,
    `See the work they already talk about, then take one next step when you are ready.`,
  ];
  const experienceSource = experienceBits.length >= 3 ? experienceBits : sentencesFrom(harvest, 3, experienceFallback, 24);
  const experienceTitles = ['The visit', 'The work', 'The next step'];
  const experience = [0, 1, 2].map((i) => ({
    title: clipWords(offerHeads[i + 3] || experienceTitles[i], 8),
    text: ensureCardText(experienceSource[i], experienceFallback[i]),
  }));
  const proof = [
    {
      title: town,
      text: ensureCardText(
        foundingLine([...textPool, ...rawHarvestTexts(harvest)], name, town, category),
        `${name} is a ${town} ${category} whose public pages already carry the wording on this rebuild.`
      ),
    },
    {
      title: hours ? 'Hours' : 'Reach them',
      text: hours
        ? `Hours listed as ${hours} on their public pages. Confirm before you drive.`
        : `Use the official website when you want current hours or a next step that still matches their desk.`,
    },
    {
      title: phone ? 'Call' : 'Contact',
      text: phone
        ? `Call ${phone} the way their own pages publish it. That number is the one they already give the public.`
        : `Contact runs through their official site so the published number stays the one they control.`,
    },
    {
      title: address ? 'Visit' : `${town} work`,
      text: address
        ? `Find them at ${address}. The street line comes from their own pages, not a guessed pin.`
        : `${name} works with people in ${town} and the towns around it. The official site stays the source for a street line.`,
    },
  ];
  const heroLine =
    heads.find((h) => h.length >= 12 && h.length <= 64 && h.toLowerCase() !== name.toLowerCase()) || name;
  const heroSub = clipWords(
    noLead(
      voice.metaDescription ||
        harvest.metaDescription ||
        paras[0] ||
        `${name} handles ${category} in ${town}. The new page makes that obvious on the first screen.`
    ),
    40
  );

  const ctaLabel =
    [...(voice.ctaLabels || [])].find(looksLikeCta) ||
    navs.find(looksLikeCta) ||
    (phone ? 'Call now' : 'Get in touch');
  const ctaHref = phone ? `tel:${phone.replace(/\D/g, '')}` : url || '#visit';
  const official = url || '#visit';
  const storyHead = heads.find((h) => /story|about|birth|welcome|history/i.test(h)) || `About ${name}`;
  const featureHead =
    heads.find((h) => h !== heroLine && h !== storyHead && h.length > 10) || offerings[0].title || name;
  const featureText = clipWords(
    paras.find((p) => !storyBits.some((s) => p.startsWith(s.slice(0, 18)))) || paras[0] || heroSub,
    40
  );
  const spotlightHead =
    heads.find((h) => h !== heroLine && h !== storyHead && h !== featureHead) || `${town} ${category}`;
  const catalogTitles = (navs.length >= 3 ? navs : ['Official site', 'Offerings', 'Visit']).slice(0, 3);
  const catalogCopy = [
    `Open ${name}'s own website for the latest hours, offerings, and announcements they still control.`,
    `Read the ${category} work they already name on their pages, then pick the one that matches your visit.`,
    address
      ? `Set a course for ${address} when you are ready to walk in.`
      : `Plan the visit around ${town}. Confirm the street line on their official site before you drive.`,
  ];
  const nav = (navs.length ? navs : ['Explore', 'Gallery', 'Visit']).slice(0, 3).map((label) => {
    if (/menu|service|offer|food|breakfast|dinner/i.test(label)) return { label, href: '#offerings' };
    if (/photo|gallery|work|look/i.test(label)) return { label, href: '#gallery' };
    if (/contact|visit|hour|location|map/i.test(label)) return { label, href: '#visit' };
    if (/about|story/i.test(label)) return { label, href: '#top' };
    return { label, href: '#offerings' };
  });
  const marquee = [...navs, ...heads.filter((h) => h.length < 28)].filter(Boolean).slice(0, 6);

  const images = Array.from({ length: 13 }, (_, i) => ({
    file: `image-${i + 1}.webp`,
    alt:
      i === 12
        ? `3D view of ${town}, Pennsylvania`
        : `${name} ${category} in ${town}, reference ${i + 1}`,
  }));

  const schemaType = /dental|dentist/.test(category)
    ? 'Dentist'
    : /vet/.test(category)
      ? 'VeterinaryCare'
      : /legal|lawyer/.test(`${target.vertical_group || ''} ${category}`)
        ? 'LegalService'
        : /restaurant|diner|pizza|bar|food/.test(category)
          ? 'Restaurant'
          : 'LocalBusiness';

  const brief = {
    slug: target.slug,
    name,
    city,
    town,
    category,
    vertical: target.vertical_group || target.vertical,
    attitude,
    composition_ref: compositionRef || null,
    layout: compositionRef || mirror.layout,
    heroMode: compositionRef ? undefined : mirror.heroMode,
    url,
    phone: phone || undefined,
    address: address || undefined,
    hours: hours || undefined,
    description: heroSub,
    noindex: true,
    schemaType,
    logo: false,
    tokens,
    fonts,
    nav,
    hero: {
      eyebrow: navs[0] ? `${town} | ${navs[0]}` : `${town} | ${category}`,
      headline: heroLine,
      sub: heroSub,
      ctaPrimary: { label: ctaLabel, href: ctaHref },
      ctaSecondary: { label: navs.find((n) => /gallery|menu|photo|work/i.test(n)) || 'See the work', href: '#gallery' },
      glassFloat: { title: town, sub: category },
    },
    offerings: { heading: navs.find((n) => /menu|service/i.test(n)) || undefined, items: offerings },
    proof: { items: proof },
    gallery: { imageIndexes: [3, 4, 5, 6, 7] },
    story: { heading: storyHead, paragraphs: storyBits },
    experience: { items: experience },
    feature: {
      heading: featureHead,
      text: featureText,
      cta: { label: navs.find((n) => /order|book|quote|call/i.test(n)) || 'Visit the official site', href: official },
      imageIndex: 8,
    },
    spotlight: {
      heading: spotlightHead,
      text: clipWords(
        paras[1] || `${name} is a ${town} ${category}. Come in when you're ready to see the work in person.`,
        36
      ),
      imageIndex: 12,
      cta: { label: navs.find((n) => /contact|visit/i.test(n)) || 'Plan a visit', href: '#visit' },
    },
    catalog: {
      items: catalogTitles.map((title, i) => ({
        title,
        text: catalogCopy[i],
        href: i === 0 ? official : i === 1 ? '#offerings' : '#visit',
        imageIndex: 9 + i,
      })),
    },
    contact: {
      heading: heads.find((h) => /contact|visit|drop us|get in/i.test(h)) || `Come see us in ${town}.`,
      sub:
        paras.find((p) => /visit|call|order|book|address/i.test(p)) ||
        `Details below come from their public pages. The town view is a 3D reading of ${town}, not a delivery-zone map.`,
      imageIndex: 13,
      imageCaption: `${town}, Pennsylvania`,
      kicker: 'Visit and contact',
      aside: `Public details for ${town}`,
    },
    closing: { cta: { label: ctaLabel, href: ctaHref }, heading: name },
    links: [
      { label: 'Official website', href: official },
      { label: catalogTitles[1] || 'Offerings', href: '#offerings' },
    ],
    images,
    radar: {
      priority: target.priority,
      sqs: target.sqs,
      opportunity: target.opportunity,
      hard_faults: target.hard_faults || [],
    },
  };

  if (!compositionRef && marquee.length >= 3) {
    brief.marquee = marquee;
    brief.hero.marquee = marquee;
  }

  brief._wordCount = countWords(brief);
  brief.attitude = inferAttitude(brief);
  return brief;
}

/**
 * Mutate a brief until a measure() callback reports HTML words in 450–850.
 * measure() should build the site and return { words }.
 */
function fitBriefToMeasuredSpec(brief, measure) {
  const place = brief.town || brief.city;
  const extras = [
    `${brief.name} serves people who live and work in ${place}.`,
    `You'll find the phone and the next step on this page, not buried in a menu.`,
    `Come in when you're ready. We'll make the visit straightforward.`,
    `Neighbors already know the name. The site should make the first visit easy.`,
    `Bring questions. Leave with a plan you can follow.`,
    `${place} ${brief.category} care, written so a person can act on it.`,
  ];
  let extraIdx = 0;
  let guard = 0;
  let metrics = measure();
  while (metrics.words > 850 && guard < 20) {
    guard += 1;
    if (brief.story.paragraphs.length > 2) brief.story.paragraphs.pop();
    else if ((brief.feature.text || '').split(/\s+/).length > 22) {
      brief.feature.text = clipWords(brief.feature.text, 22);
    } else if ((brief.spotlight.text || '').split(/\s+/).length > 20) {
      brief.spotlight.text = clipWords(brief.spotlight.text, 20);
    } else if ((brief.story.paragraphs[0] || '').split(/\s+/).length > 24) {
      brief.story.paragraphs[0] = clipWords(brief.story.paragraphs[0], 24);
    } else {
      break;
    }
    metrics = measure();
  }
  while (metrics.words < 450 && guard < 28) {
    guard += 1;
    const next = extras[extraIdx] || `Local ${brief.category} in ${place}, kept easy to reach from a phone.`;
    extraIdx += 1;
    brief.story.paragraphs.push(next);
    metrics = measure();
  }
  brief._wordCount = countWords(brief);
  brief._measuredWords = metrics.words;
  brief._measuredImages = metrics.images;
  brief._measuredSections = Array.isArray(metrics.sections) ? metrics.sections.length : metrics.sections;
  return metrics;
}

module.exports = {
  buildBrief,
  pickTokens,
  countWords,
  fitBriefToMeasuredSpec,
  looksLikePhone,
  looksLikeHours,
  inferMirrorLayout,
  pickAttitude,
  inferTown,
};

if (require.main === module) {
  const harvest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const target = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  const out = process.argv[4];
  const brief = buildBrief(harvest, target.slug ? target : target, target.composition_ref);
  if (out) fs.writeFileSync(out, JSON.stringify(brief, null, 2));
  else console.log(JSON.stringify(brief, null, 2));
}
