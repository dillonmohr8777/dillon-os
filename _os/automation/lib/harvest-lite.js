'use strict';

/**
 * Fetch-only harvest — the prospect's real copy and brand hints without a browser.
 *
 * `_templates/site-factory/harvest.js` is the full harvester and it needs
 * Playwright: it screenshots the site, downloads imagery, and reads computed
 * styles. That is strictly better when a browser is available. This module exists
 * for the case where one is not, which is every cloud runner behind a
 * CONNECT-only proxy, and it is what lets brief generation proceed at all in
 * those environments.
 *
 * What it can get from raw HTML, honestly:
 *
 *   - their real copy: headings, paragraphs, nav labels, CTA labels
 *   - contact facts: phone, address, hours, email, JSON-LD
 *   - declared brand colours from inline CSS custom properties and hex literals
 *   - image URLs and alt text
 *   - the trade and locality words they use about themselves
 *
 * What it cannot get, and must never pretend to:
 *
 *   - computed styles, so the palette is *declared* colour, not painted area.
 *     The full harvester weights colour by how much of the page it covers; this
 *     one counts occurrences. Those are different measurements and the field is
 *     named `paletteHints` rather than `palette` to keep them from being confused.
 *   - anything on a client-rendered page. If `renderPending` is set, the copy is
 *     whatever shipped in the source, which on a React or Squarespace site is
 *     close to nothing. Brief generation must refuse those rather than write a
 *     site from an empty harvest.
 *   - screenshots, so no visual QA and no design judgement.
 *
 * Output is deliberately shaped like the full harvester's `harvest.json` so the
 * same brief writer consumes either, with `source: 'harvest-lite'` and a
 * `limitations` array so a downstream consumer can tell what it is holding.
 */

const { auditTier0 } = require('./site-audit');
const { httpGet } = require('./net');

/** Words that mark a heading as navigation furniture rather than real copy. */
const CHROME_WORDS = /^(home|about|about us|contact|contact us|services|menu|blog|news|gallery|reviews|testimonials|faq|search|login|sign in|cart|skip to (main )?content|toggle navigation)$/i;

function textBetween(html, re) {
  const out = [];
  let m;
  const rx = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
  while ((m = rx.exec(html)) !== null) {
    const t = String(m[1] || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&#39;|&rsquo;|&apos;/gi, "'")
      .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (t) out.push(t);
  }
  return out;
}

const uniq = (a) => [...new Set(a)];

/**
 * Declared brand colours, most frequent first.
 *
 * This counts how often a colour is *written* in the stylesheet, which is a
 * proxy for prominence and nothing more. Near-neutrals are dropped because every
 * site declares black, white and a dozen greys, and they say nothing about brand.
 */
function paletteHints(html) {
  const counts = {};
  const bump = (hex) => {
    let h = hex.toUpperCase();
    if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    if (h.length !== 7) return;
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    // Drop near-greys and near-black/white: no brand information in them.
    if (max - min < 24) return;
    if (max < 28 || min > 236) return;
    counts[h] = (counts[h] || 0) + 1;
  };
  for (const m of html.matchAll(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g)) bump(`#${m[1]}`);
  for (const m of html.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) {
    bump('#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join(''));
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([hex, count]) => ({ hex, count }));
}

/** Font families the page actually asks for, Google Fonts first. */
function fontHints(html) {
  const fams = [];
  for (const m of html.matchAll(/fonts\.googleapis\.com\/css2?\?([^"']+)/g)) {
    for (const f of m[1].matchAll(/family=([^&:]+)/g)) fams.push(decodeURIComponent(f[1]).replace(/\+/g, ' '));
  }
  for (const m of html.matchAll(/font-family\s*:\s*([^;}"']+)/g)) {
    const first = m[1].split(',')[0].replace(/["']/g, '').trim();
    if (first && !/^(inherit|initial|unset|var\(|sans-serif|serif|monospace|system-ui)/i.test(first)) fams.push(first);
  }
  const counts = {};
  for (const f of fams) counts[f] = (counts[f] || 0) + 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([family, count]) => ({ family, count }));
}

function extractFacts(html, text) {
  const jsonLd = [];
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      jsonLd.push(JSON.parse(m[1]));
    } catch {
      /* malformed blocks are common; skip rather than fail the harvest */
    }
  }
  const flat = JSON.stringify(jsonLd);

  const telHref = (html.match(/href=["']tel:([^"']+)/i) || [])[1] || '';
  const phone =
    telHref.replace(/[^\d+()\s.-]/g, '').trim() ||
    (text.match(/\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/) || [])[0] ||
    '';

  const email = (html.match(/href=["']mailto:([^"'?]+)/i) || [])[1] || '';

  // Prefer the structured address, fall back to a street pattern in the copy.
  let address = '';
  const ldStreet = (flat.match(/"streetAddress"\s*:\s*"([^"]+)"/) || [])[1];
  const ldCity = (flat.match(/"addressLocality"\s*:\s*"([^"]+)"/) || [])[1];
  const ldRegion = (flat.match(/"addressRegion"\s*:\s*"([^"]+)"/) || [])[1];
  const ldZip = (flat.match(/"postalCode"\s*:\s*"([^"]+)"/) || [])[1];
  if (ldStreet) address = [ldStreet, ldCity, ldRegion, ldZip].filter(Boolean).join(', ');
  else {
    address =
      (text.match(
        /\b\d{1,6}\s+[A-Z][A-Za-z.'-]*(?:\s+[A-Z0-9][A-Za-z.'-]*){0,4}\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Pike|Hwy|Highway|Place|Pl|Court|Ct)\b[^.,;|]{0,40}/
      ) || [])[0] || '';
  }

  const hours =
    (text.match(/(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*[^.|\n]{0,60}(?:am|pm|a\.m|p\.m|closed)/i) || [])[0] || '';

  return {
    phone: phone.trim(),
    email,
    address: address.trim(),
    hours: hours.trim(),
    jsonLd,
    businessNameFromLd: (flat.match(/"name"\s*:\s*"([^"]+)"/) || [])[1] || '',
  };
}

/**
 * Harvest one prospect from raw HTML.
 *
 * @param {string} url
 * @param {object} [opts] { timeoutMs, audit } — pass an existing Tier 0 audit to
 *        avoid a second fetch when the grader already has one.
 * @returns {Promise<object|null>} harvest-shaped object, or null when the page
 *          could not be read at all.
 */
async function harvestLite(url, opts = {}) {
  const audit = opts.audit || (await auditTier0(url, { checkHttpRedirect: false, timeoutMs: opts.timeoutMs }));
  if (audit.reachable === false || audit.fetchInconclusive) {
    return {
      source: 'harvest-lite',
      siteUrl: url,
      ok: false,
      reason: audit.reachable === false ? `site does not load (${audit.error})` : `fetch inconclusive (${audit.error})`,
    };
  }

  // auditTier0 does not retain the body, so fetch once more for the raw markup.
  const res = opts.html ? { ok: true, body: opts.html } : await httpGet(audit.finalUrl || url, {
    timeoutMs: opts.timeoutMs || 20000,
    maxBytes: 3_000_000,
  });
  if (!res.ok || !res.body) {
    return { source: 'harvest-lite', siteUrl: url, ok: false, reason: res.error || 'could not read markup' };
  }
  const html = res.body;

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const headings = uniq(textBetween(html, /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi))
    .filter((t) => t.length > 2 && t.length < 200 && !CHROME_WORDS.test(t));
  const paragraphs = uniq(textBetween(html, /<(?:p|li)[^>]*>([\s\S]*?)<\/(?:p|li)>/gi))
    .filter((t) => t.length > 40 && t.length < 700);
  const navLabels = uniq(textBetween(html, /<a[^>]*>([\s\S]*?)<\/a>/gi))
    .filter((t) => t.length > 1 && t.length < 40);
  const ctaLabels = navLabels.filter((t) =>
    /book|call|schedule|request|quote|estimate|contact|appointment|order|shop|get started|learn more|apply/i.test(t)
  );

  const images = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = (tag.match(/\bsrc=["']([^"']+)/i) || [])[1] || '';
    const alt = (tag.match(/\balt=["']([^"']*)/i) || [])[1] || '';
    if (src && !/^data:/i.test(src)) images.push({ src, alt });
  }
  const og = (html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i) || [])[1];
  if (og) images.unshift({ src: og, alt: 'og:image' });

  const facts = extractFacts(html, text);
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  const limitations = [
    'declared colours only — no computed styles, so paletteHints is occurrence-counted rather than area-weighted',
    'no screenshots, so no visual QA or design judgement',
    'no downloaded imagery — image URLs only',
  ];
  if (audit.renderPending) {
    limitations.unshift(
      'PAGE RENDERS CLIENT-SIDE: the copy below is only what shipped in the source and is probably incomplete. Do not write a brief from this.'
    );
  }
  if (wordCount < 250) {
    limitations.unshift(`only ${wordCount} words readable — too thin to ground 1,200 words of new copy`);
  }

  return {
    source: 'harvest-lite',
    siteUrl: url,
    finalUrl: audit.finalUrl || url,
    ok: true,
    harvestedAt: new Date().toISOString().slice(0, 10),
    renderPending: audit.renderPending === true,
    platform: audit.platform || '',
    voice: {
      title: (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.replace(/\s+/g, ' ').trim() || '',
      metaDescription: (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i) || [])[1] || '',
      headings: headings.slice(0, 40),
      paragraphs: paragraphs.slice(0, 60),
      navLabels: navLabels.slice(0, 30),
      ctaLabels: uniq(ctaLabels).slice(0, 12),
      wordCount,
    },
    brand: { paletteHints: paletteHints(html), fontHints: fontHints(html) },
    facts,
    images: images.slice(0, 40),
    decaySignals: {
      missingViewport: audit.hasViewport === false,
      staleCopyrightYear: audit.copyrightYear || null,
      tableLayout: audit.tableLayout === true,
      noHttps: audit.https === false,
    },
    limitations,
    /**
     * Whether this harvest is rich enough to write a ~1,200-word arch-generation
     * brief from. Anything else must be sent back for a real Playwright harvest
     * rather than padded — the arch generation's whole voice depends on naming
     * their actual trade, town and facts.
     */
    briefReady:
      audit.renderPending !== true &&
      wordCount >= 250 &&
      headings.length >= 3 &&
      (!!facts.phone || !!facts.address),
  };
}

module.exports = { harvestLite, paletteHints, fontHints, extractFacts };
