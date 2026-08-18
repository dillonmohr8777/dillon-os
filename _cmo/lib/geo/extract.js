/**
 * Mention and citation extraction from an engine answer.
 *
 * Deliberately deterministic. Independent testing of shipped AI-visibility
 * tools found roughly two-thirds accuracy with wrong-brand attribution among
 * the errors - and an LLM asked "is this brand mentioned?" is both slower and
 * less auditable than an alias table. So:
 *
 *   MENTIONS   - alias-table matching with word boundaries and NEGATIVE
 *                aliases, which is what stops "Apple" the client matching
 *                "apple cider" and stops a competitor's substring matching
 *                inside a longer name.
 *   CITATIONS  - URL/domain extraction with registrable-domain comparison, so
 *                blog.acme.com counts as owned and acme.com.evil.test does not.
 *   STANCE     - the one judgement call, kept separate from presence, because
 *                being named in "vendors to avoid" is not visibility. The LLM
 *                is used only here, on an extracted span, never for presence.
 *
 * Everything returns character offsets so prominence is computable and every
 * claim in a report can be traced back to the exact span that produced it.
 */

import { prominence } from './stats.js';

/**
 * @typedef {object} BrandSpec
 * @property {string} id
 * @property {string} name
 * @property {string[]} aliases        additional surface forms
 * @property {string[]} negativeAliases phrases that must NOT count as a match
 * @property {string[]} domains        owned domains, for citation attribution
 */

export function normalizeBrand(brand) {
  return {
    id: brand.id || slugish(brand.name),
    name: brand.name,
    aliases: dedupe([brand.name, ...(brand.aliases || [])]).filter(Boolean),
    negativeAliases: (brand.negativeAliases || []).filter(Boolean),
    domains: (brand.domains || []).map(registrableDomain).filter(Boolean),
    owned: Boolean(brand.owned),
  };
}

/**
 * Find every brand mentioned in one answer.
 *
 * @param {string} text
 * @param {BrandSpec[]} brands
 * @returns {Array} one entry per brand actually present, with offsets + prominence
 */
export function extractMentions(text, brands) {
  const body = String(text || '');
  const specs = brands.map(normalizeBrand);
  const found = [];

  for (const spec of specs) {
    const hits = [];
    for (const alias of spec.aliases) {
      const re = aliasRegex(alias);
      let m;
      while ((m = re.exec(body)) !== null) {
        const start = m.index;
        const matched = m[0];
        if (isNegated(body, start, matched, spec.negativeAliases)) continue;
        hits.push({ start, end: start + matched.length, alias, matched });
        if (re.lastIndex === m.index) re.lastIndex += 1; // guard zero-width
      }
    }
    if (!hits.length) continue;
    // Collapse overlapping alias hits. "Acme HVAC" and the shorter alias
    // "Acme" both match the same occurrence; counting both would inflate the
    // mention count, and mention counts feed share of voice. Longest match at
    // a given position wins.
    hits.sort((a, b) => (a.start - b.start) || (b.end - b.start) - (a.end - a.start));
    const merged = [];
    for (const hit of hits) {
      const last = merged[merged.length - 1];
      if (last && hit.start < last.end) continue; // overlaps an accepted hit
      merged.push(hit);
    }
    hits.length = 0;
    hits.push(...merged);
    found.push({
      brandId: spec.id,
      name: spec.name,
      owned: spec.owned,
      mentions: hits.length,
      firstOffset: hits[0].start,
      matchedAlias: hits[0].alias,
      spans: hits.slice(0, 20),
      evidenceSpan: sentenceAround(body, hits[0].start),
    });
  }

  // Ordinal = order of FIRST appearance among all brands present. That is what
  // makes "named first" measurable rather than "named at all".
  found.sort((a, b) => a.firstOffset - b.firstOffset);
  const length = body.length || 1;
  return found.map((f, i) => ({
    ...f,
    ordinal: i + 1,
    prominence: prominence({ ordinal: i + 1, firstOffset: f.firstOffset, responseLength: length }),
  }));
}

/**
 * Extract citations. Accepts both a structured citation array (Gemini-style
 * grounding metadata, Perplexity metadata) and raw markdown/plain URLs in the
 * answer body, because engines differ and a missing structured payload must
 * not silently read as "no citations".
 */
export function extractCitations(text, { structured = null, ownedDomains = [] } = {}) {
  const owned = new Set(ownedDomains.map(registrableDomain).filter(Boolean));
  const out = [];
  const seen = new Set();

  const push = (url, position, extra = {}) => {
    const clean = String(url || '').trim().replace(/[).,;]+$/, '');
    if (!/^https?:\/\//i.test(clean)) return;
    if (seen.has(clean)) return;
    seen.add(clean);
    const domain = registrableDomain(clean);
    out.push({ url: clean, domain, owned: owned.has(domain), position, ...extra });
  };

  if (Array.isArray(structured)) {
    structured.forEach((c, i) => push(c.url || c.uri, i + 1, {
      title: c.title || null,
      segmentIndices: c.segmentIndices || c.groundingChunkIndices || null,
    }));
  }

  // Markdown links first (they carry anchor text), then bare URLs.
  const body = String(text || '');
  const mdRe = /\[([^\]]{0,120})\]\((https?:\/\/[^\s)]+)\)/g;
  let m;
  while ((m = mdRe.exec(body)) !== null) push(m[2], out.length + 1, { anchor: m[1] });
  const bareRe = /https?:\/\/[^\s<>"')\]]+/g;
  while ((m = bareRe.exec(body)) !== null) push(m[0], out.length + 1);

  return out;
}

/**
 * Score one run into the shape the aggregator consumes.
 * Pure: no I/O, no model calls, so it is trivially testable.
 */
export function scoreRun({
  promptId, engine, channel, replicate, text, brands,
  structuredCitations = null, grounded = null, searchQueries = null,
  engineVersion = null, locale = null, ts = null,
}) {
  const mentions = extractMentions(text, brands);
  const ownedBrand = brands.find((b) => b.owned);
  const ownedDomains = ownedBrand ? (ownedBrand.domains || []) : [];
  const citations = extractCitations(text, { structured: structuredCitations, ownedDomains });
  const self = mentions.find((m) => m.owned) || null;

  return {
    promptId,
    engine,
    channel,
    engineVersion,
    locale,
    replicate,
    ts,
    grounded,
    searchQueries: searchQueries || null,
    responseLength: String(text || '').length,
    present: Boolean(self),
    ordinal: self ? self.ordinal : null,
    mentionCount: self ? self.mentions : 0,
    prominence: self ? self.prominence : 0,
    evidenceSpan: self ? self.evidenceSpan : null,
    brandsPresent: mentions.map((m) => ({ brandId: m.brandId, name: m.name, ordinal: m.ordinal, mentions: m.mentions, owned: m.owned })),
    citations,
    ownedCitations: citations.filter((c) => c.owned).length,
    totalCitations: citations.length,
    hasAnyBrand: mentions.length > 0,
  };
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/**
 * Word-boundary alias match. `\b` alone fails on names containing punctuation
 * ("Acme H.V.A.C.", "L&T"), so boundaries are asserted with lookarounds
 * against word characters instead.
 */
export function aliasRegex(alias) {
  const escaped = String(alias).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, 'gi');
}

/**
 * A match is negated when it sits inside a longer phrase the caller declared
 * as a false positive. Checked against the surrounding window so
 * "Apple cider" does not count as a mention of "Apple".
 */
function isNegated(body, start, matched, negatives) {
  if (!negatives || !negatives.length) return false;
  const from = Math.max(0, start - 40);
  const window = body.slice(from, start + matched.length + 40).toLowerCase();
  return negatives.some((n) => window.includes(String(n).toLowerCase()));
}

export function sentenceAround(body, offset, max = 240) {
  const text = String(body || '');
  let start = offset;
  while (start > 0 && !'.!?\n'.includes(text[start - 1])) start -= 1;
  let end = offset;
  while (end < text.length && !'.!?\n'.includes(text[end])) end += 1;
  return text.slice(start, Math.min(end + 1, start + max)).trim();
}

/**
 * Registrable domain, using a small public-suffix list for the multi-label
 * TLDs that actually appear in client work. Naive "last two labels" would
 * treat every .co.uk site as the same domain.
 */
const MULTI_SUFFIXES = new Set([
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'com.au', 'net.au', 'org.au', 'co.nz',
  'co.za', 'com.br', 'com.mx', 'co.jp', 'co.in', 'com.sg', 'com.hk', 'co.kr',
]);

export function registrableDomain(input) {
  if (!input) return '';
  let host = String(input).trim();
  try {
    if (/^https?:\/\//i.test(host)) host = new URL(host).hostname;
  } catch {
    return '';
  }
  host = host.toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
  const parts = host.split('.').filter(Boolean);
  if (parts.length <= 2) return parts.join('.');
  const lastTwo = parts.slice(-2).join('.');
  if (MULTI_SUFFIXES.has(lastTwo) && parts.length >= 3) return parts.slice(-3).join('.');
  return lastTwo;
}

function dedupe(arr) { return [...new Set(arr)]; }
function slugish(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
