'use strict';

/**
 * Decide whether a web page belongs to the business the registry says it does.
 *
 * This is a trust boundary, not a convenience: a false positive attaches one
 * business's logo to another business's concept site. So it stays conservative
 * and refuses rather than guesses.
 *
 * It replaces a strict containment check that rejected roughly a quarter of
 * otherwise-good prospects, most of them wrongly. The worst offender was HTML
 * entities: "Avon Chiropractic &amp; Injury Center" normalised to
 * "avon chiropractic and amp injury center", because `&amp;` was never decoded
 * and `amp` survived as a token. Local trade names are full of ampersands
 * ("Plumbing & Heating", "Salon & Spa"), so that one bug alone was throwing
 * away a large slice of the buildable registry.
 *
 * The other correction is directional. A registry name comes from OpenStreetMap
 * and is often the long legal form ("Alderfer Glass Company") while the site
 * brands short ("Alderfer Glass"). Matching now works in both directions, but
 * only across *distinctive* words -- an industry word like "plumbing" or
 * "center" can never carry a match on its own.
 */

const ENTITIES = {
  amp: '&', quot: '"', apos: "'", lsquo: "'", rsquo: "'", ldquo: '"', rdquo: '"',
  nbsp: ' ', ndash: '-', mdash: '-', hellip: '...', reg: '', trade: '', copy: '',
};

/** Resolve HTML entities so `&amp;` becomes `&` before any normalisation. */
function decodeEntities(value) {
  return String(value ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => (name.toLowerCase() in ENTITIES ? ENTITIES[name.toLowerCase()] : m));
}

function safeChar(code) {
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
}

/** Words that never, on their own, identify a business. */
const GENERIC = new Set([
  'the', 'and', 'of', 'a', 'an', 'at', 'in', 'on', 'for', 'to',
  'inc', 'llc', 'ltd', 'co', 'corp', 'corporation', 'company', 'group', 'holdings',
  'services', 'service', 'solutions', 'systems', 'associates', 'partners',
  'center', 'centre', 'clinic', 'office', 'offices', 'shop', 'store', 'studio',
  'home', 'welcome', 'official', 'site', 'website', 'page',
  'llp', 'pc', 'pa', 'plc', 'gmbh',
]);

/** Crude but predictable singularisation: "nails" and "nail" must agree. */
function singular(token) {
  if (token.length > 3 && /(?:ss|us|is)$/.test(token)) return token;
  if (token.length > 4 && token.endsWith('ies')) return `${token.slice(0, -3)}y`;
  if (token.length > 3 && token.endsWith('es') && /(?:ch|sh|x|z|s)es$/.test(token)) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1);
  return token;
}

/** Lowercase word tokens, entities resolved, `&` spelled out, punctuation gone. */
function tokenize(value) {
  return decodeEntities(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]s\b/g, '')       // possessives: "madonna's" -> "madonna"
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(singular);
}

const distinctive = (tokens) => tokens.filter((t) => !GENERIC.has(t) && t.length > 1);

/**
 * Compare a registry business name against one string taken from the page.
 *
 * Returns a reason alongside the verdict so a hold says which rule refused it.
 */
function compareNames(expected, candidate) {
  const E = tokenize(expected);
  const C = tokenize(candidate);
  if (!E.length || !C.length) return { match: false, reason: 'business_identity_unverified' };

  const eKey = E.join(' ');
  const cKey = C.join(' ');
  if (eKey === cKey) return { match: true, how: 'exact' };
  if (` ${cKey} `.includes(` ${eKey} `)) return { match: true, how: 'page_contains_registry_name' };

  const eD = distinctive(E);
  const cD = distinctive(C);
  if (!eD.length || !cD.length) return { match: false, reason: 'business_identity_unverified' };

  const cSet = new Set(cD);
  // Every distinctive word of the registry name appears on the page.
  if (eD.every((t) => cSet.has(t))) return { match: true, how: 'all_distinctive_words_present' };

  // The page brands shorter than the legal name ("Alderfer Glass" for "Alderfer
  // Glass Company"). Two distinctive words is the floor -- one would let a bare
  // surname match an unrelated business.
  const eSet = new Set(eD);
  if (cD.length >= 2 && cD.every((t) => eSet.has(t))) {
    return { match: true, how: 'page_brands_shorter' };
  }
  return { match: false, reason: 'business_identity_mismatch' };
}

/**
 * Check a harvested page against a prospect row.
 *
 * A page whose only text is a challenge screen, a 404, or a suspension notice
 * carries no identity and is refused with `business_identity_unverified` rather
 * than being scored as a mismatch -- the distinction matters, because one is
 * "come back later" and the other is "this is the wrong business".
 */
const DEAD_PAGE = /^(?:just a moment|attention required|404|page not found|not found|account suspended|coming soon|under construction|domain (?:for sale|parking)|access denied|error)\b/;

function identifyBusiness(prospect, harvest) {
  const expected = prospect?.business_name || prospect?.name || '';
  if (!String(expected).trim()) return { match: false, reason: 'business_identity_unverified' };

  const facts = harvest?.facts || {};
  const voice = harvest?.voice || {};
  const candidates = [facts.businessNameFromLd, voice.title, voice.metaDescription, ...(voice.headings || [])]
    .map((v) => decodeEntities(v || '').trim())
    .filter(Boolean);

  if (!candidates.length) return { match: false, reason: 'business_identity_unverified' };
  if (candidates.every((c) => DEAD_PAGE.test(c.toLowerCase()))) {
    return { match: false, reason: 'business_identity_unverified', dead: true };
  }

  let best = { match: false, reason: 'business_identity_mismatch' };
  for (const candidate of candidates) {
    const result = compareNames(expected, candidate);
    if (result.match) return { ...result, observed: candidate };
    if (result.reason === 'business_identity_mismatch') best = result;
  }
  return best;
}

module.exports = { identifyBusiness, compareNames, tokenize, decodeEntities, singular, distinctive, GENERIC };
