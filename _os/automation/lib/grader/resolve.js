'use strict';

/**
 * Pass 0. Decide what we are even looking at before spending a grade on it.
 *
 * The expensive mistakes this pass exists to prevent:
 *  - treating a bot wall (403 / Cloudflare) as a bad website, then mailing a
 *    business whose site is actually fine;
 *  - treating a Facebook page or trade-directory listing as "they have a site";
 *  - grading a domain that belongs to someone else entirely.
 */

const { get, normalizeUrl } = require('./http');
const { stripTags, STUB_MARKERS } = require('./htmlscan');

const SOCIAL_HOSTS = /(?:^|\.)(?:facebook|fb|instagram|twitter|x|linkedin|tiktok|youtube|nextdoor)\.com$|(?:^|\.)linktr\.ee$|(?:^|\.)beacons\.ai$|(?:^|\.)bio\.link$|(?:^|\.)carrd\.co$/i;
const DIRECTORY_HOSTS =
  /(?:^|\.)(?:yelp|yellowpages|bbb|angi|angieslist|thumbtack|houzz|manta|mapquest|chamberofcommerce|networx|porch|buildzoom|homeadvisor|nextdoor|alignable|zocdoc|healthgrades|vitals|webmd|opentable|resy|tripadvisor|visitphilly|restaurantji|roastersmap|fishtowndistrict|dc21|psaphcc|bac-1|ampdphilly)\.(?:com|org|net|gov)$/i;
const PLATFORM_STUB_HOSTS = /(?:^|\.)business\.site$|(?:^|\.)godaddysites\.com$|(?:^|\.)wixsite\.com$|(?:^|\.)weebly\.com$|(?:^|\.)squarespace\.com$|(?:^|\.)webnode\.|(?:^|\.)tripod\.com$|(?:^|\.)angelfire\.com$/i;
const BOT_WALL_MARKERS =
  /just a moment|checking your browser|cf-browser-verification|enable javascript and cookies|attention required!|请开启|access denied|verify you are human|ddos protection by|incapsula|perimeterx|press & hold|captcha/i;

/**
 * Headers that mean "you got a challenge, not the page". Learned the hard way:
 * SiteGround answers bots with HTTP 202 and an sg-captcha header, which every
 * naive 2xx check reads as success and then grades as an empty, terrible site.
 */
const CHALLENGE_HEADERS = ['sg-captcha', 'cf-mitigated', 'x-sucuri-block', 'x-datadome', 'x-iinfo'];

/** Client-rendered stacks whose static HTML is not the page a visitor sees. */
const CLIENT_RENDERED_MARKERS = [
  { id: 'next', re: /__NEXT_DATA__|\/_next\/static/i },
  { id: 'nuxt', re: /__NUXT__|\/_nuxt\//i },
  { id: 'gatsby', re: /___gatsby|gatsby-browser/i },
  { id: 'remix', re: /__remixContext/i },
  { id: 'spa-root', re: /<div\s+id=["'](?:root|__next|app|__nuxt)["']\s*>\s*<\/div>/i },
  { id: 'angular', re: /ng-version=|<app-root/i },
  { id: 'squarespace', re: /static1\.squarespace|Static\.SQUARESPACE_CONTEXT/i },
  { id: 'wix', re: /wixstatic|wixapps|静/i },
  { id: 'webflow-interactions', re: /wf-interactions|webflow\.js/i },
  { id: 'noscript-warning', re: /<noscript>[\s\S]{0,200}?(?:enable|requires|turn on)\s+javascript/i },
];

/**
 * Is the response body actually a homepage we can grade?
 * Returns null when fine, or a reason string when the grade would be fiction.
 */
function ungradeableReason(page) {
  const text = stripTags(page.html || '');
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const bytes = Buffer.byteLength(page.html || '', 'utf8');

  const challenge = CHALLENGE_HEADERS.find((h) => page.headers && page.headers[h]);
  if (challenge) return `challenge header ${challenge}: ${page.headers[challenge]}`;
  // 202 for a GET homepage is not a normal success; it is how several WAFs stall bots.
  if (page.status === 202) return `HTTP 202 with ${words} words — WAF stall, not the page`;
  if (bytes < 3000 && words < 60) return `body is ${bytes}B / ${words} words — empty or challenge response`;
  if (BOT_WALL_MARKERS.test(text.slice(0, 3000)) && words < 300) return 'interstitial bot check served instead of the page';
  return null;
}

/**
 * Which client-rendered stack, if any, is hiding the real content.
 *
 * The trap here: a genuinely thin site and an unreadable shell both look like
 * "not much text". Thin-with-no-framework is a real thin site and one of our
 * best prospects, so word count alone must never decide. The framework markers
 * are the discriminator; thinness only confirms the markers are load-bearing.
 */
function clientRenderedBy(html, words, scriptCount, imageCount = 0) {
  const hits = CLIENT_RENDERED_MARKERS.filter((m) => m.re.test(html)).map((m) => m.id);
  // Plenty of server-rendered text or imagery means the static HTML is the page,
  // even on a framework that could have rendered client-side.
  const contentThin = words < 200 || (words < 350 && imageCount < 5);
  if (hits.length && contentThin) return hits;
  if (!hits.length && words < 120 && scriptCount >= 4) return ['thin-html-heavy-js'];
  return null;
}

/** Parked, placeholder, or for-sale. Not a bad site — no site. */
function stubReason(page) {
  const text = stripTags(page.html || '');
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  if (words > 400) return null;
  const marker = STUB_MARKERS.find((re) => re.test(text));
  return marker ? `placeholder page: "${(text.match(marker) || [''])[0].slice(0, 60)}"` : null;
}

const STOPWORDS = new Set(['inc', 'llc', 'co', 'company', 'corp', 'the', 'and', 'of', 'llp', 'pc', 'pa', 'ltd']);

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

function nameTokens(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !STOPWORDS.has(t));
}

/**
 * Does this page plausibly belong to this business? Used to confirm an
 * unmatched candidate URL, and to catch a domain that changed hands.
 */
function nameMatch(businessName, page) {
  const toks = nameTokens(businessName);
  if (!toks.length) return { matched: null, hits: [] };
  const haystack = `${page.finalUrl} ${(page.html || '').slice(0, 60000)}`.toLowerCase();
  const hits = toks.filter((t) => haystack.includes(t));
  return { matched: hits.length >= Math.min(2, toks.length) || (toks.length === 1 && hits.length === 1), hits };
}

/**
 * @returns {Promise<{state, page, reason, url, notes}>}
 *   state: 'live' | 'no-site' | 'social-only' | 'directory-only' | 'platform-stub'
 *          | 'blocked' | 'dead' | 'js-shell' | 'unverified-owner'
 */
async function resolveTarget({ website, candidate_urls = [], evidence_urls = [], business_name = '' } = {}) {
  const notes = [];
  const tried = [];

  const primary = normalizeUrl(website);
  const candidates = [primary, ...candidate_urls.map(normalizeUrl)].filter(Boolean);

  if (!candidates.length) {
    const kind = evidence_urls.some((u) => SOCIAL_HOSTS.test(hostOf(u)))
      ? 'social-only'
      : evidence_urls.length
        ? 'directory-only'
        : 'no-site';
    return {
      state: kind,
      url: null,
      page: null,
      reason:
        kind === 'social-only'
          ? 'Only a social profile, no website of their own'
          : kind === 'directory-only'
            ? `Only third-party listings (${evidence_urls.map(hostOf).filter(Boolean).slice(0, 2).join(', ')})`
            : 'No website on record',
      notes,
    };
  }

  for (const url of candidates) {
    const host = hostOf(url);
    tried.push(url);

    if (SOCIAL_HOSTS.test(host)) {
      notes.push(`${host} is a social profile, not a website`);
      continue;
    }
    if (DIRECTORY_HOSTS.test(host)) {
      notes.push(`${host} is a third-party directory`);
      continue;
    }

    const page = await get(url);

    if (PLATFORM_STUB_HOSTS.test(host)) {
      return { state: 'platform-stub', url, page: page.ok ? page : null, reason: `Hosted on ${host}, a builder stub rather than a real site`, notes };
    }

    if (!page.ok) {
      if (page.status === 403 || page.status === 429 || page.status === 503) {
        return { state: 'blocked', url, page, reason: `HTTP ${page.status} — bot wall, cannot grade from static HTML`, notes };
      }
      if (page.error === 'timeout') {
        notes.push(`${host} timed out`);
        return { state: 'dead', url, page, reason: 'Request timed out', notes };
      }
      if (page.error) {
        notes.push(`${host}: ${page.error}`);
        continue;
      }
      notes.push(`${host} returned HTTP ${page.status}`);
      continue;
    }

    // A placeholder page is an answer, not a failure to read one — check it
    // before the size guard, or every "coming soon" page looks like a bot wall.
    const stub = stubReason(page);
    if (stub) {
      return { state: 'platform-stub', url, page, reason: stub, notes };
    }

    // Refuse to grade a response that is not really the homepage. A confident
    // low score on a challenge page is worse than no score: it puts a business
    // with a good site into the outreach list.
    const ungradeable = ungradeableReason(page);
    if (ungradeable) {
      return { state: 'blocked', url, page, reason: ungradeable, notes };
    }

    const text = stripTags(page.html || '');
    const words = text.split(/\s+/).filter(Boolean).length;
    const match = nameMatch(business_name, page);
    // A primary URL we already matched by domain does not need on-page proof;
    // a candidate URL does, otherwise we might grade a stranger's site.
    const needsProof = url !== primary;
    if (needsProof && match.matched === false) {
      notes.push(`${host} does not mention the business name`);
      continue;
    }

    const csr = clientRenderedBy(
      page.html,
      words,
      (page.html.match(/<script\b[^>]*src=/gi) || []).length,
      (page.html.match(/<img\b/gi) || []).length
    );
    if (csr) {
      return {
        state: 'js-shell',
        url,
        page,
        reason: `Client-rendered (${csr.join(', ')}); static HTML holds only ${words} words`,
        notes,
        nameMatch: match,
      };
    }

    return {
      state: 'live',
      url,
      page,
      reason: needsProof ? `Confirmed by on-page name match (${match.hits.slice(0, 3).join(', ')})` : 'Live site',
      notes,
      nameMatch: match,
    };
  }

  // Every candidate failed. If the only things left are listings, say so plainly.
  const kind = evidence_urls.some((u) => SOCIAL_HOSTS.test(hostOf(u))) ? 'social-only' : evidence_urls.length ? 'directory-only' : 'dead';
  return {
    state: kind,
    url: candidates[0] || null,
    page: null,
    reason: notes.length ? notes.join('; ') : 'No reachable website',
    notes,
    tried,
  };
}

module.exports = {
  resolveTarget,
  nameMatch,
  hostOf,
  ungradeableReason,
  clientRenderedBy,
  stubReason,
  SOCIAL_HOSTS,
  DIRECTORY_HOSTS,
  PLATFORM_STUB_HOSTS,
  BOT_WALL_MARKERS,
  CHALLENGE_HEADERS,
};
