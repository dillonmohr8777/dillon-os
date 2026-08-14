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
  if (/icon|facebook|instagram|twitter|linkedin|logo|close|search|cart|youtube/i.test(t)) return false;
  return /book|call|contact|schedule|visit|get in touch|plan|quote|start|shop|order|reserve|appoint/i.test(t);
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

function pickTokens(harvest, attitude) {
  const palette = (harvest.brand && harvest.brand.palette) || harvest.palette || [];
  const hexes = palette
    .map((p) => (typeof p === 'string' ? p : p.hex))
    .filter((h) => /^#[0-9A-Fa-f]{6}$/.test(h || ''));
  const usable = hexes.filter((h) => lum(h) > 18 && lum(h) < 240);
  const accent = [...usable].sort((a, b) => sat(b) - sat(a))[0] || '#C2410C';
  const accent2 = [...usable].filter((h) => h !== accent).sort((a, b) => sat(b) - sat(a))[0] || '#D4A017';
  const paper = mix('#F6F1E8', accent, 0.08);
  const ink = mix('#141820', accent, 0.22);
  const panel = mix(paper, accent, 0.28);
  const deep = mix('#0C1016', accent, 0.35);
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
  const families = ((harvest.brand && harvest.brand.fonts) || harvest.fonts || []).map((f) =>
    typeof f === 'string' ? f : f.family
  );
  const displayMap = {
    brutal: 'Archivo Black',
    industrial: 'Anton',
    neon: 'Bungee',
    glass: 'Fraunces',
    editorial: 'Cormorant Garamond',
    warm: 'Fraunces',
  };
  const looksSerif = families.some((f) => /serif|garamond|times|georgia|playfair|bodoni|cormorant/i.test(f || ''));
  const display = looksSerif && attitude !== 'brutal' && attitude !== 'industrial' ? 'Playfair Display' : displayMap[attitude] || 'Archivo';
  return { display, displayFallback: looksSerif ? 'Georgia,serif' : 'Impact,sans-serif', text: 'Instrument Sans' };
}

function pickAttitude(target) {
  const g = target.vertical_group || target.vertical || '';
  if (/legal/.test(g)) return 'editorial';
  if (/medical/.test(g)) return 'glass';
  if (/home-services|industrial/.test(g)) return 'industrial';
  if (/auto/.test(g)) return 'brutal';
  if (/spa|food|retail/.test(g)) return 'warm';
  return 'warm';
}

function sentencesFrom(harvest, n, fallback) {
  const voice = harvest.voice || {};
  const paras = [...(voice.paragraphs || harvest.paragraphs || [])].map(noLead).filter((p) => p.length > 40);
  const heads = [...(voice.headings || harvest.headings || [])].map(noLead).filter((h) => h.length > 8 && h.length < 90);
  const out = [];
  for (const p of paras) {
    if (out.length >= n) break;
    out.push(clipWords(p, 22));
  }
  for (const h of heads) {
    if (out.length >= n) break;
    if (!out.some((x) => x.includes(h))) out.push(clipWords(h, 12));
  }
  while (out.length < n) out.push(fallback[out.length % fallback.length]);
  return out.slice(0, n);
}

function countWords(brief) {
  const chunks = [
    brief.description,
    brief.hero && brief.hero.sub,
    brief.hero && brief.hero.headline,
    ...(brief.offerings?.items || []),
    ...(brief.proof?.items || []),
    ...(brief.story?.paragraphs || []),
    ...(brief.experience?.items || []),
    brief.feature?.heading,
    brief.feature?.text,
    brief.spotlight?.heading,
    brief.spotlight?.text,
    ...(brief.catalog?.items || []).map((i) => i.title),
    brief.contact?.sub,
    brief.closing?.heading,
  ];
  return wordsOf(chunks);
}

function buildBrief(harvest, target, compositionRef) {
  const attitude = pickAttitude(target);
  const tokens = pickTokens(harvest, attitude);
  const fonts = pickFonts(harvest, attitude);
  const name = target.name || harvest.title || target.slug;
  const city = target.city || 'Philadelphia';
  const category = (target.vertical || target.vertical_group || 'Local service').replace(/-/g, ' ');
  const url = harvest.siteUrl || target.siteUrl;
  const jsonLd = [].concat((harvest.facts && harvest.facts.jsonLd) || harvest.jsonLd || []);
  const extracted = walkJsonLd(jsonLd);
  const voice = harvest.voice || {};
  const textPool = [
    ...(voice.paragraphs || []),
    ...(voice.headings || []),
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
    extractAddressFromText(textPool, city) ||
    '';

  const fallbackOffer = [
    `${category} work around ${city}`,
    `A direct way to reach ${name}`,
    `Public details kept in one place`,
  ];
  const storyBits = sentencesFrom(harvest, 2, [
    `${name} serves ${city} with ${category}. The live homepage hides that behind a layout that fights phones.`,
    `The rebuild keeps their name, their work, and a direct way to get in touch.`,
  ]).map((s) => clipWords(s, 24));
  const offerings = sentencesFrom(harvest, 3, fallbackOffer).map((s) => clipWords(s.replace(/\.$/, ''), 12));
  const experience = [
    `Open the page on a phone. The primary action stays on screen.`,
    `Call or write without hunting a number buried in an image.`,
    `See the work, then take one next step.`,
  ];
  const proof = [
    `Listed for ${category} in ${city}.`,
    hours ? `Hours listed as ${hours}.` : `Reach them through the official site.`,
    phone ? `Phone published on their own pages.` : `Contact runs through their official site.`,
    `Rebuild queued after a documented mobile or conversion fault.`,
  ];
  const heroSub = clipWords(
    noLead(
      (harvest.voice && harvest.voice.metaDescription) ||
        harvest.metaDescription ||
        `${name} handles ${category} in ${city}. The new page makes that obvious on the first screen.`
    ),
    28
  );

  const ctaLabel =
    [...((harvest.voice && harvest.voice.ctaLabels) || [])].find(looksLikeCta) || 'Get in touch';
  const ctaHref = phone ? `tel:${phone.replace(/\D/g, '')}` : url || '#visit';
  const official = url || '#visit';

  const images = Array.from({ length: 12 }, (_, i) => ({
    file: `image-${i + 1}.webp`,
    alt: `${name} ${category} in ${city}, reference ${i + 1}`,
  }));

  const brief = {
    slug: target.slug,
    name,
    city,
    category,
    vertical: target.vertical_group || target.vertical,
    attitude,
    composition_ref: compositionRef || null,
    layout: compositionRef || undefined,
    url,
    phone: phone || undefined,
    address: address || undefined,
    hours: hours || undefined,
    description: heroSub,
    noindex: true,
    schemaType: /dental|dentist/.test(category)
      ? 'Dentist'
      : /legal/.test(String(target.vertical_group))
        ? 'LegalService'
        : 'LocalBusiness',
    logo: false,
    tokens,
    fonts,
    hero: {
      eyebrow: `${city} | ${category}`,
      headline: name,
      sub: heroSub,
      ctaPrimary: { label: ctaLabel, href: ctaHref },
      ctaSecondary: { label: 'See the work', href: '#gallery' },
      glassFloat: { title: city, sub: category },
    },
    offerings: { items: offerings },
    proof: { items: proof },
    gallery: { imageIndexes: [3, 4, 5, 6, 7] },
    story: { heading: 'About', paragraphs: storyBits },
    experience: { items: experience },
    feature: {
      heading: `Care that fits a real week in ${city}`,
      text: clipWords(
        `${name} keeps the next step obvious: call, see the work, then walk in. The page is built for a phone in your hand.`,
        28
      ),
      cta: { label: 'Visit the official site', href: official },
      imageIndex: 8,
    },
    spotlight: {
      heading: `Close to home in ${city}`,
      text: clipWords(
        `${name} is a ${city} ${category}. Neighbors should find the address, the phone, and a reason to come in without hunting.`,
        22
      ),
      imageIndex: 12,
      cta: { label: 'Plan a visit', href: '#visit' },
    },
    catalog: {
      items: [
        { title: 'Official site', href: official, imageIndex: 9 },
        { title: 'Offerings', href: '#offerings', imageIndex: 10 },
        { title: 'Visit', href: '#visit', imageIndex: 11 },
      ],
    },
    contact: {
      heading: 'Make the next visit easy.',
      sub: 'Details below come from their public pages. Empty fields stayed empty on purpose.',
    },
    closing: { cta: { label: ctaLabel, href: ctaHref }, heading: name },
    links: [
      { label: 'Official website', href: official },
      { label: 'Offerings', href: '#offerings' },
    ],
    images,
    radar: {
      priority: target.priority,
      sqs: target.sqs,
      opportunity: target.opportunity,
      hard_faults: target.hard_faults || [],
    },
  };

  brief._wordCount = countWords(brief);
  brief.attitude = inferAttitude(brief);
  return brief;
}

/**
 * Mutate a brief until a measure() callback reports HTML words in 350–500.
 * measure() should build the site and return { words }.
 */
function fitBriefToMeasuredSpec(brief, measure) {
  const extras = [
    `${brief.name} serves people who live and work in ${brief.city}.`,
    `You'll find the phone and the next step on this page, not buried in a menu.`,
    `Come in when you're ready. We'll make the visit straightforward.`,
    `Neighbors already know the name. The site should make the first visit easy.`,
    `Bring questions. Leave with a plan you can follow.`,
    `${brief.city} ${brief.category} care, written so a person can act on it.`,
  ];
  let extraIdx = 0;
  let guard = 0;
  let metrics = measure();
  while (metrics.words > 500 && guard < 16) {
    guard += 1;
    if (brief.story.paragraphs.length > 1) brief.story.paragraphs.pop();
    else if (brief.experience.items.length > 2) brief.experience.items.pop();
    else if ((brief.feature.text || '').split(/\s+/).length > 14) {
      brief.feature.text = clipWords(brief.feature.text, 14);
    } else if ((brief.spotlight.text || '').split(/\s+/).length > 12) {
      brief.spotlight.text = clipWords(brief.spotlight.text, 12);
    } else {
      break;
    }
    metrics = measure();
  }
  while (metrics.words < 360 && guard < 24) {
    guard += 1;
    const next = extras[extraIdx] || `Local ${brief.category} in ${brief.city}, kept easy to reach.`;
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

module.exports = { buildBrief, pickTokens, countWords, fitBriefToMeasuredSpec, looksLikePhone, looksLikeHours };

if (require.main === module) {
  const harvest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const target = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  const out = process.argv[4];
  const brief = buildBrief(harvest, target.slug ? target : target, target.composition_ref);
  if (out) fs.writeFileSync(out, JSON.stringify(brief, null, 2));
  else console.log(JSON.stringify(brief, null, 2));
}
