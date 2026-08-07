'use strict';

/**
 * Prospect discovery from OpenStreetMap (Overpass API).
 *
 * This is Stage 1 "Discover" from `02_Campaigns/AI Site Builder Outreach Engine/
 * Pipeline Spec.md`, which was previously manual. It exists so the grader can
 * feed itself: point it at a market, get back a deduped list of real local
 * businesses with real website URLs, then hand that straight to
 * bin/grade-sites.js.
 *
 * Why OSM rather than scraping Maps: it is a public, licensed dataset (ODbL)
 * with a documented API and no terms-of-service problem, it carries the
 * `website` tag we actually need, and it covers the whole geography ladder in
 * Market Roster.md — Philadelphia now, Pennsylvania next, national after.
 *
 * What it deliberately drops:
 *   - national and regional chains (not agency prospects)
 *   - businesses whose "website" is a Facebook/Instagram/directory page
 *   - duplicate domains (one prospect per company, not per location)
 *   - anything already built for, already a client, or already mailed
 */

const { httpGet } = require('./net');

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
];

/**
 * Vertical groups mapped to OSM tag filters, ordered by Momentum fit.
 * `weight` reflects Market Roster priority: home services and medical are the
 * high-value verticals barely touched by the food-and-culture Philly batch.
 */
const VERTICAL_GROUPS = {
  'home-services': {
    weight: 1,
    label: 'Home Services',
    filters: [
      '["craft"~"^(plumber|electrician|hvac|roofer|carpenter|painter|builder|gardener|stonemason|floorer|tiler|insulation|scaffolder|glaziery|metal_construction|handyman|caulker|paver)$"]',
      '["shop"~"^(doityourself|hardware|trade|paint|flooring|bathroom_furnishing|kitchen|fireplace|garden_centre|swimming_pool|security|windows|glaziery)$"]',
      '["office"~"^(construction_company|energy_supplier)$"]',
    ],
  },
  medical: {
    weight: 1,
    label: 'Medical & Healthcare',
    filters: [
      '["amenity"~"^(dentist|doctors|clinic|veterinary)$"]',
      '["healthcare"~"^(dentist|doctor|chiropractor|physiotherapist|podiatrist|optometrist|psychotherapist|dietitian|audiologist|midwife|alternative|centre|clinic)$"]',
      '["shop"="optician"]',
    ],
  },
  legal: {
    weight: 1,
    label: 'Legal & Professional',
    filters: [
      '["office"~"^(lawyer|accountant|insurance|estate_agent|financial|financial_advisor|tax_advisor|notary|architect|engineer|consulting|employment_agency|advertising_agency|it)$"]',
    ],
  },
  'spa-wellness': {
    weight: 2,
    label: 'Spas & Wellness',
    filters: [
      '["shop"~"^(beauty|hairdresser|massage|tattoo|nail_salon|herbalist|cosmetics)$"]',
      '["leisure"~"^(spa|fitness_centre|sauna)$"]',
      '["amenity"="spa"]',
    ],
  },
  industrial: {
    weight: 2,
    label: 'Industrial & Manufacturing',
    filters: [
      '["craft"~"^(metal_construction|blacksmith|electronics_repair|sawmill|joiner|upholsterer|welder|machine_shop|signmaker)$"]',
      '["industrial"]["website"]',
      '["man_made"="works"]',
    ],
  },
  auto: {
    weight: 2,
    label: 'Auto & Transport',
    filters: [
      '["shop"~"^(car_repair|car|tyres|car_parts|motorcycle|truck|trailer|boat)$"]',
      '["amenity"~"^(car_wash|driving_school)$"]',
    ],
  },
  retail: {
    weight: 3,
    label: 'Specialty Retail',
    filters: [
      '["shop"~"^(furniture|jewelry|florist|bicycle|pet|musical_instrument|books|clothes|shoes|antiques|art|photo|frame|toys|sports|outdoor|garden_furniture|carpet|curtain|lighting|houseware|appliance|funeral_directors)$"]',
    ],
  },
  food: {
    weight: 4,
    label: 'Restaurants & Food',
    filters: [
      '["amenity"~"^(restaurant|cafe|bar|pub|ice_cream|biergarten)$"]',
      '["shop"~"^(bakery|butcher|deli|cheese|confectionery|greengrocer|seafood|wine|alcohol|coffee|chocolate|pastry|farm)$"]',
      '["craft"~"^(brewery|distillery|winery|caterer)$"]',
    ],
  },
};

/**
 * Chains and franchises. A prospect list is worthless if it is 40% CVS.
 * Matched case-insensitively against the business name as a whole word-ish
 * substring, plus OSM's own `brand`/`operator` tags which mark chains directly.
 */
const CHAIN_NAMES = [
  'cvs', 'walgreens', 'rite aid', 'duane reade', 'walmart', 'target', 'costco',
  'sam\'s club', 'bj\'s wholesale', 'kmart', 'sears', 'macy\'s', 'nordstrom',
  'mcdonald', 'burger king', 'wendy', 'subway', 'starbucks', 'dunkin', 'taco bell',
  'kfc', 'popeyes', 'chick-fil-a', 'chipotle', 'panera', 'domino', 'pizza hut',
  'papa john', 'little caesars', 'five guys', 'shake shack', 'sonic drive',
  'arby', 'jimmy john', 'jersey mike', 'firehouse subs', 'wawa', 'sheetz',
  'seven eleven', '7-eleven', 'circle k', 'royal farms', 'quiktrip',
  'dollar general', 'dollar tree', 'family dollar', 'five below', 'five below',
  'home depot', 'lowe\'s', 'menards', 'ace hardware', 'tractor supply',
  'autozone', 'advance auto', 'o\'reilly auto', 'napa auto', 'pep boys',
  'jiffy lube', 'valvoline', 'midas', 'meineke', 'firestone', 'goodyear',
  'discount tire', 'mavis', 'monro', 'aamco', 'maaco', 'ziebart',
  'planet fitness', 'la fitness', 'anytime fitness', 'orangetheory', 'crunch fitness',
  'gold\'s gym', 'ymca', 'equinox', 'blink fitness', 'retro fitness', 'f45',
  'great clips', 'sport clips', 'supercuts', 'hair cuttery', 'regis salon',
  'massage envy', 'european wax', 'drybar', 'amazing lash',
  'h&r block', 'jackson hewitt', 'liberty tax', 'state farm', 'allstate',
  'geico', 'progressive insurance', 'farmers insurance', 'nationwide insurance',
  'edward jones', 'ameriprise', 'merrill lynch', 'charles schwab', 'fidelity investments',
  'wells fargo', 'bank of america', 'chase bank', 'pnc bank', 'td bank',
  'citizens bank', 'santander', 'truist', 'capital one', 'm&t bank',
  'aspen dental', 'western dental', 'smile direct', 'invisalign',
  'lenscrafters', 'pearle vision', 'visionworks', 'warby parker', 'my eyedr',
  'banfield', 'vca animal', 'petco', 'petsmart', 'pet supplies plus',
  'roto-rooter', 'mr rooter', 'benjamin franklin plumbing', 'one hour heating',
  'servpro', 'servicemaster', 'stanley steemer', 'chem-dry', 'molly maid',
  'terminix', 'rollins', 'orkin', 'ehrlich', 'mosquito joe',
  'u-haul', 'penske', 'budget truck', 'enterprise rent', 'hertz', 'avis',
  'fedex', 'ups store', 'usps', 'dhl',
  'holiday inn', 'marriott', 'hilton', 'hyatt', 'sheraton', 'courtyard',
  'best western', 'comfort inn', 'days inn', 'la quinta', 'motel 6', 'super 8',
  'redfin', 'zillow', 'keller williams', 'coldwell banker', 're/max', 'century 21',
  'berkshire hathaway home', 'compass real estate', 'weichert', 'long & foster',
  'sherwin-williams', 'sherwin williams', 'benjamin moore', 'ppg paints',
  'verizon', 'at&t', 't-mobile', 'xfinity', 'comcast', 'spectrum',
  'gamestop', 'best buy', 'staples', 'office depot', 'michaels', 'joann',
  'hobby lobby', 'barnes & noble', 'half price books',
  'whole foods', 'trader joe', 'acme markets', 'giant food', 'shoprite',
  'aldi', 'lidl', 'safeway', 'kroger', 'weis markets', 'redner',
  'baskin-robbins', 'cold stone', 'dairy queen', 'rita\'s', 'jersey freeze',
  'orange julius', 'auntie anne', 'cinnabon', 'krispy kreme', 'insomnia cookies',
  'goodwill', 'salvation army', 'savers', 'plato\'s closet', 'once upon a child',
];

/** Their "website" is really a social or directory page, not a site we can grade. */
const NON_SITE_DOMAINS = [
  'facebook.com', 'fb.com', 'fb.me', 'instagram.com', 'twitter.com', 'x.com',
  'linkedin.com', 'tiktok.com', 'youtube.com', 'youtu.be', 'pinterest.com',
  'yelp.com', 'yellowpages.com', 'tripadvisor.com', 'opentable.com', 'resy.com',
  'doordash.com', 'ubereats.com', 'grubhub.com', 'seamless.com', 'toasttab.com',
  'clover.com', 'square.site', 'squareup.com', 'linktr.ee', 'wixsite.com',
  'business.site', 'godaddysites.com', 'weebly.com', 'blogspot.com',
  'wordpress.com', 'wix.com', 'myshopify.com', 'sites.google.com',
  'google.com', 'maps.app.goo.gl', 'goo.gl', 'bit.ly', 'zocdoc.com',
  'healthgrades.com', 'vitals.com', 'webmd.com', 'ratemds.com', 'avvo.com',
  'justia.com', 'findlaw.com', 'lawyers.com', 'martindale.com',
  'homeadvisor.com', 'angi.com', 'angieslist.com', 'thumbtack.com', 'porch.com',
  'houzz.com', 'bbb.org', 'manta.com', 'mapquest.com', 'foursquare.com',
  'nextdoor.com', 'groupon.com', 'eventbrite.com', 'patch.com',
];

function normalizeDomain(url) {
  if (!url) return '';
  let s = String(url).trim();
  if (!/^https?:\/\//i.test(s)) s = `http://${s}`;
  try {
    const u = new URL(s);
    return u.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function normalizeUrl(url) {
  if (!url) return '';
  let s = String(url).trim().replace(/\s/g, '');
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if (!u.hostname.includes('.')) return '';
    u.hash = '';
    return u.href;
  } catch {
    return '';
  }
}

function isChain(tags = {}) {
  const name = String(tags.name || '').toLowerCase();
  if (!name) return false;
  // OSM marks chains explicitly; trust those tags first.
  if (tags.brand || tags['brand:wikidata'] || tags['operator:wikidata']) return true;
  return CHAIN_NAMES.some((c) => name.includes(c));
}

function isNonSiteDomain(domain) {
  if (!domain) return true;
  return NON_SITE_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`));
}

const TAG_KEYS = ['craft', 'healthcare', 'office', 'amenity', 'shop', 'leisure', 'industrial', 'man_made'];

/**
 * Reverse index from a concrete OSM tag value to its vertical group, built once
 * by parsing the alternation lists out of the filter strings. Doing this at load
 * time keeps VERTICAL_GROUPS as the single source of truth — the earlier version
 * substring-matched the raw filter text at call time and mis-grouped values that
 * appear inside another value (e.g. `car` inside `car_repair`).
 */
const VALUE_TO_GROUP = (() => {
  const index = new Map();
  for (const [group, spec] of Object.entries(VERTICAL_GROUPS)) {
    for (const filter of spec.filters) {
      const m = filter.match(/\["([a-z_:]+)"(?:~"\^\(([^)]*)\)\$"|="([^"]+)")?\]/);
      if (!m) continue;
      const key = m[1];
      const values = m[2] ? m[2].split('|') : m[3] ? [m[3]] : [];
      for (const v of values) {
        const clean = v.trim();
        if (!clean) continue;
        // First group to claim a value wins, matching VERTICAL_GROUPS order.
        if (!index.has(`${key}=${clean}`)) index.set(`${key}=${clean}`, group);
      }
    }
  }
  return index;
})();

/** Best vertical label for an OSM element, and which group it came from. */
function classify(tags = {}) {
  for (const key of TAG_KEYS) {
    const val = tags[key];
    if (!val) continue;
    const group = VALUE_TO_GROUP.get(`${key}=${val}`);
    if (group) {
      const spec = VERTICAL_GROUPS[group];
      return { group, vertical: String(val).replace(/_/g, '-'), label: spec.label, weight: spec.weight };
    }
  }
  // Fall back to whatever descriptive tag exists so nothing goes unlabelled.
  const val = TAG_KEYS.map((k) => tags[k]).find(Boolean) || '';
  return { group: 'other', vertical: String(val).replace(/_/g, '-'), label: 'Other', weight: 5 };
}

/** Build an Overpass QL query for one area name and a set of vertical groups. */
function buildQuery(areaSpec, groups, { timeout = 180 } = {}) {
  const selected = groups.length ? groups : Object.keys(VERTICAL_GROUPS);
  const filters = selected.flatMap((g) => (VERTICAL_GROUPS[g] ? VERTICAL_GROUPS[g].filters : []));

  let areaDecl;
  let scope;
  if (areaSpec.bbox) {
    areaDecl = '';
    scope = `(${areaSpec.bbox})`;
  } else {
    const lvl = areaSpec.adminLevel ? `["admin_level"="${areaSpec.adminLevel}"]` : '';
    if (areaSpec.state) {
      // Disambiguate by nesting inside the state boundary. County names repeat
      // across states — a bare area["name"="Montgomery County"] is ambiguous, and
      // the `is_in:state` tag this used to filter on does not exist in OSM, so
      // every county query silently returned zero results.
      areaDecl =
        `area["name"="${areaSpec.state}"]["boundary"="administrative"]["admin_level"="4"]->.st;\n` +
        `rel(area.st)["name"="${areaSpec.name}"]["boundary"="administrative"]${lvl};\n` +
        `map_to_area->.a;`;
    } else {
      areaDecl = `area["name"="${areaSpec.name}"]["boundary"="administrative"]${lvl}->.a;`;
    }
    scope = '(area.a)';
  }

  const body = filters.map((f) => `  nwr${scope}["website"]${f};`).join('\n');
  return `[out:json][timeout:${timeout}];\n${areaDecl}\n(\n${body}\n);\nout tags center;`;
}

/**
 * POST a query to Overpass, trying mirrors on failure.
 *
 * Header discipline matters here: Overpass answers 406 Not Acceptable to a
 * browser-style `Accept: text/html` with a Chrome user agent, and the HTML error
 * body then fails JSON.parse. Left unchecked that path produced a cheerful
 * "0 candidates discovered" instead of an error — the worst possible outcome for
 * a discovery tool, because an empty market looks like a finished job.
 */
async function runOverpass(query, { timeoutMs = 200000, endpoints = OVERPASS_ENDPOINTS } = {}) {
  const attempts = [];
  for (const endpoint of endpoints) {
    const res = await httpGet(endpoint, {
      timeoutMs,
      maxBytes: 120_000_000,
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      userAgent: 'MomentumSiteGrader/1.0 (prospect discovery; contact via github.com/dillonmohr8777/dillon-os)',
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
    }).catch((e) => ({ ok: false, error: String(e.message || e) }));

    if (!res.ok) {
      attempts.push(`${endpoint}: ${res.error}`);
      continue;
    }
    if (res.status !== 200) {
      const hint = res.status === 429 || res.status === 504 ? ' (rate limited / overloaded — retry later)' : '';
      attempts.push(`${endpoint}: HTTP ${res.status}${hint}`);
      continue;
    }
    try {
      const doc = JSON.parse(res.body);
      if (!Array.isArray(doc.elements)) {
        attempts.push(`${endpoint}: response had no elements array`);
        continue;
      }
      if (doc.remark && /timed out|out of memory/i.test(doc.remark)) {
        attempts.push(`${endpoint}: server remark "${doc.remark}"`);
        continue;
      }
      return { ok: true, elements: doc.elements, endpoint, truncated: !!res.truncated };
    } catch (err) {
      attempts.push(`${endpoint}: unparseable response (${err.message}) — first bytes: ${String(res.body).slice(0, 80)}`);
    }
  }
  return { ok: false, error: attempts.join(' | '), elements: [] };
}

/**
 * Turn raw Overpass elements into deduped candidate rows.
 *
 * @param {Array} elements
 * @param {object} opts
 * @param {Set}   opts.excludeDomains  domains already built for / clients / mailed
 * @param {string} opts.market
 * @param {string[]} [opts.groups]     restrict to these vertical groups
 */
function toCandidates(elements, opts = {}) {
  const excludeDomains = opts.excludeDomains || new Set();
  const market = opts.market || '';
  const seen = new Map();
  const stats = {
    raw: elements.length,
    no_website: 0,
    chain: 0,
    non_site_domain: 0,
    excluded_already_done: 0,
    duplicate_domain: 0,
    kept: 0,
  };

  for (const el of elements) {
    const tags = el.tags || {};
    const rawSite = tags.website || tags['contact:website'] || tags.url || '';
    if (!rawSite) {
      stats.no_website += 1;
      continue;
    }
    if (isChain(tags)) {
      stats.chain += 1;
      continue;
    }
    const url = normalizeUrl(rawSite.split(';')[0]);
    const domain = normalizeDomain(url);
    if (!url || isNonSiteDomain(domain)) {
      stats.non_site_domain += 1;
      continue;
    }
    if (excludeDomains.has(domain)) {
      stats.excluded_already_done += 1;
      continue;
    }
    if (seen.has(domain)) {
      stats.duplicate_domain += 1;
      const prev = seen.get(domain);
      prev.location_count = (prev.location_count || 1) + 1;
      continue;
    }

    const cls = classify(tags);
    const city = tags['addr:city'] || '';
    const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
    seen.set(domain, {
      prospect_id: `osm:${el.type}/${el.id}`,
      business_name: tags.name || tags['name:en'] || domain,
      website: url,
      domain,
      vertical: cls.vertical,
      vertical_group: cls.group,
      vertical_label: cls.label,
      vertical_weight: cls.weight,
      market,
      city,
      state: tags['addr:state'] || '',
      postcode: tags['addr:postcode'] || '',
      street,
      phone: tags.phone || tags['contact:phone'] || '',
      location_count: 1,
      osm_type: el.type,
      osm_id: el.id,
      lat: el.lat ?? (el.center ? el.center.lat : null),
      lon: el.lon ?? (el.center ? el.center.lon : null),
      source: 'openstreetmap',
    });
    stats.kept += 1;
  }

  return { candidates: [...seen.values()], stats };
}

/**
 * Fields that must never reach a tracked file. This repository is public (see
 * CLAUDE.md), and a committed list of hundreds of businesses with street
 * addresses, phone numbers and GPS coordinates is a targeting dataset — not the
 * same thing as those facts existing individually in OpenStreetMap. Some OSM
 * entries are also home-run businesses, where the address is a residence.
 *
 * The grader needs none of it. Ranking only needs to know *whether* a phone
 * exists (`has_phone`), so the number itself is dropped and the boolean kept.
 * City and postcode stay: coarse enough to be useful for batching, not a
 * doorstep.
 */
const GIT_UNSAFE_FIELDS = ['street', 'lat', 'lon', 'phone', 'osm_id', 'osm_type'];

/**
 * Strip location and contact detail from a row (or array of rows) before it is
 * written anywhere Git can see. Returns new objects; never mutates the input, so
 * the in-memory pipeline keeps whatever it needs for this run.
 */
function sanitizeForGit(input) {
  const one = (row) => {
    if (!row || typeof row !== 'object') return row;
    const out = { ...row };
    if (out.phone) out.has_phone = true;
    else if (out.has_phone == null) out.has_phone = false;
    for (const f of GIT_UNSAFE_FIELDS) delete out[f];
    return out;
  };
  return Array.isArray(input) ? input.map(one) : one(input);
}

module.exports = {
  buildQuery,
  runOverpass,
  toCandidates,
  sanitizeForGit,
  GIT_UNSAFE_FIELDS,
  classify,
  isChain,
  isNonSiteDomain,
  normalizeDomain,
  normalizeUrl,
  VERTICAL_GROUPS,
  CHAIN_NAMES,
  NON_SITE_DOMAINS,
  OVERPASS_ENDPOINTS,
};
