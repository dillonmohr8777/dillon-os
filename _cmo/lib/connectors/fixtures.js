/**
 * Committed fixture data.
 *
 * These are not test doubles bolted on afterwards - they are a shipped product
 * mode, and they do three jobs at once:
 *
 *   DEMO  - the whole product runs with no credentials and no network, so a
 *           prospect sees a finished dashboard in the first minute instead of a
 *           spinner. Every reviewer of the incumbent complained about exactly
 *           that: an onboarding that hangs on "Analyzing your website..." and
 *           delivers nothing.
 *   TESTS - deterministic inputs mean tests assert on the runtime rather than
 *           on model output.
 *   EVALS - a fixed corpus is what lets a model or prompt change be scored
 *           against a known baseline before it reaches a client.
 *
 * The numbers below are deliberately internally consistent: the Google Ads
 * conversion count exceeds the real lead count by an amount the reconciliation
 * agent can actually explain, because a demo that shows a clean reconciliation
 * demonstrates nothing.
 */

export const DEMO_WORKSPACE = Object.freeze({
  id: 'acme-hvac',
  name: 'Acme HVAC',
  kind: 'client',
  vertical: 'home services',
  market: 'Philadelphia, PA',
});

export const DEMO_PROFILE = Object.freeze({
  name: 'Acme HVAC',
  url: 'https://acmehvac.example',
  category: 'HVAC repair and installation',
  serviceArea: 'Philadelphia',
  positioning: 'Same-day furnace and AC repair for older Philadelphia rowhomes, with flat-rate pricing published before work starts.',
  audience: 'Homeowners in 1920s-1950s rowhomes who have been burned by a surprise invoice.',
  differentiators: [
    'flat-rate pricing published on the site before the visit',
    'same-day dispatch within the city limits',
    'technicians certified on high-efficiency retrofits in narrow rowhome mechanicals',
  ],
  offers: ['$89 diagnostic', 'flat-rate repair menu', 'annual maintenance plan'],
  aliases: ['Acme Heating', 'Acme HVAC Philadelphia'],
  // Without this, "Acme" would match the unrelated roofing company and the
  // measurement would be wrong in the flattering direction.
  negativeAliases: ['Acme Roofing', 'Acme Plumbing Supply'],
  domains: ['acmehvac.example'],
  sameAs: ['https://www.wikidata.org/wiki/Q00000000'],
  bannedPhrases: ['cheapest', 'unbeatable'],
  requiredDisclosures: [{ text: 'PA HIC #PA123456' }],
  localBusinessType: 'HVACBusiness',
  competitors: [
    { id: 'comfort-pros', name: 'Comfort Pros', url: 'https://comfortpros.example', domains: ['comfortpros.example'] },
    { id: 'liberty-heating', name: 'Liberty Heating', url: 'https://libertyheating.example', domains: ['libertyheating.example'] },
    { id: 'thermoking', name: 'ThermoKing Services', domains: ['thermoking.example'] },
  ],
  seeds: [
    { term: 'furnace repair', volume: 12000 },
    { term: 'ac not cooling', volume: 9000 },
    { term: 'heat pump installation', volume: 6600 },
    { term: 'duct cleaning', volume: 3200 },
    { term: 'emergency hvac service', volume: 2100 },
    { term: 'boiler replacement', volume: 2800 },
    { term: 'what is a heat pump', volume: 22000 },
    { term: 'thermostat not working', volume: 4100 },
  ],
});

export const DEMO_VOICE = Object.freeze({
  summary: 'Direct and specific. Leads with the price or the timeframe. Sounds like a technician who has been in the basement, not like a brochure.',
  rules: [
    'Lead with the concrete thing: a price, a timeframe, a part name.',
    'Short sentences. No stacked adjectives.',
    'Name the neighbourhood or the house type when it is relevant.',
    'Never open with a question.',
  ],
  forbiddenTone: ['hey there', 'we are excited to announce', 'in today\'s world'],
});

export const DEMO_FIXTURES = Object.freeze({
  crawl: {
    page: {
      url: 'https://acmehvac.example/',
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
      body: DEMO_HTML(),
      sources: [{ url: 'https://acmehvac.example/' }],
    },
    robots: {
      // Deliberately contains the classic mistake: a blanket disallow that also
      // blocks the search-index crawlers, plus GPTBot explicitly allowed. The
      // audit should flag this as critical.
      body: [
        'User-agent: *',
        'Disallow: /wp-admin/',
        '',
        'User-agent: GPTBot',
        'Allow: /',
        '',
        'User-agent: OAI-SearchBot',
        'Disallow: /',
        '',
        'Sitemap: https://acmehvac.example/sitemap.xml',
      ].join('\n'),
      status: 200,
      sources: [{ url: 'https://acmehvac.example/robots.txt' }],
    },
  },

  googleAds: {
    performance: {
      rows: [
        { campaign: 'Search - Furnace Repair', cost: 2140.55, clicks: 412, impressions: 9800, conversions: 31, ctr: 0.042, cpc: 5.19, convRate: 0.075 },
        { campaign: 'Search - AC Repair', cost: 1680.20, clicks: 355, impressions: 8600, conversions: 22, ctr: 0.041, cpc: 4.73, convRate: 0.062 },
        { campaign: 'Search - Brand', cost: 210.40, clicks: 190, impressions: 1400, conversions: 14, ctr: 0.136, cpc: 1.11, convRate: 0.074 },
        { campaign: 'PMax - Installs', cost: 1920.00, clicks: 268, impressions: 41000, conversions: 9, ctr: 0.007, cpc: 7.16, convRate: 0.034 },
      ],
      totals: { cost: 5951.15, clicks: 1225, conversions: 76 },
      sources: [{ ref: 'fixture:googleAds:2026-08' }],
    },
    searchTerms: {
      rows: [
        { term: 'emergency furnace repair philadelphia', clicks: 64, cost: 388.12, conversions: 9, hasOrganicPage: false },
        { term: 'furnace making banging noise', clicks: 51, cost: 214.30, conversions: 6, hasOrganicPage: false },
        { term: 'flat rate hvac pricing', clicks: 38, cost: 155.80, conversions: 5, hasOrganicPage: false },
        { term: 'heat pump for rowhome', clicks: 29, cost: 201.44, conversions: 4, hasOrganicPage: false },
        { term: 'acme hvac reviews', clicks: 88, cost: 96.20, conversions: 7, hasOrganicPage: true },
        { term: 'hvac repair near me', clicks: 145, cost: 702.10, conversions: 11, hasOrganicPage: true },
        { term: 'free furnace estimate', clicks: 42, cost: 189.00, conversions: 2, hasOrganicPage: false },
      ],
      sources: [{ ref: 'fixture:googleAds:searchTerms:2026-08' }],
    },
  },

  metaAds: {
    insights: {
      rows: [
        { adSet: 'Retargeting - Site Visitors', spend: 640.10, impressions: 88000, clicks: 910, leads: 12, cpl: 53.34, creative: 'before-after-carousel' },
        { adSet: 'Prospecting - Homeowners 35-64', spend: 1180.40, impressions: 240000, clicks: 1420, leads: 9, cpl: 131.16, creative: 'technician-video-15s' },
        { adSet: 'Lookalike - Past Customers', spend: 520.00, impressions: 61000, clicks: 480, leads: 7, cpl: 74.29, creative: 'flat-rate-static' },
      ],
      totals: { spend: 2340.50, leads: 28 },
      attributionWindow: '7d_click,1d_view',
      sources: [{ ref: 'fixture:metaAds:2026-08' }],
    },
  },

  places: {
    publicProfile: {
      data: {
        name: 'Acme HVAC',
        rating: 4.6,
        userRatingCount: 214,
        primaryType: 'hvac_contractor',
        businessStatus: 'OPERATIONAL',
        regularOpeningHours: { openNow: true, weekdayDescriptions: ['Monday: 7:00 AM – 7:00 PM'] },
        // Public data, so no post history or owner insights. The agent is
        // instructed to say so rather than imply it saw them.
        note: 'public Places data; post history, insights and message settings are not visible without GBP access',
      },
      sources: [{ ref: 'fixture:places:acme-hvac' }],
    },
  },

  gbp: {
    location: {
      data: {
        title: 'Acme HVAC',
        categories: { primary: 'HVAC contractor' },
        reviewSummary: { averageRating: 4.6, totalReviewCount: 214, unrepliedCount: 37 },
        localPosts: { last30Days: 0 },
      },
      sources: [{ ref: 'fixture:gbp:acme-hvac' }],
    },
  },

  gsc: {
    searchAnalytics: {
      rows: [
        { query: 'furnace repair philadelphia', clicks: 88, impressions: 2400, ctr: 0.037, position: 6.4 },
        { query: 'flat rate hvac philadelphia', clicks: 31, impressions: 610, ctr: 0.051, position: 4.1 },
        { query: 'acme hvac', clicks: 210, impressions: 780, ctr: 0.269, position: 1.2 },
        { query: 'heat pump rowhome', clicks: 12, impressions: 900, ctr: 0.013, position: 14.8 },
      ],
      sources: [{ ref: 'fixture:gsc:2026-08' }],
    },
  },

  ga4: {
    runReport: {
      rows: [
        { channel: 'Organic Search', sessions: 3120, conversions: 41 },
        { channel: 'Paid Search', sessions: 1225, conversions: 58 },
        { channel: 'Paid Social', sessions: 810, conversions: 19 },
        { channel: 'AI Assistant', sessions: 96, conversions: 4 },
        { channel: 'Referral', sessions: 240, conversions: 3 },
        { channel: 'Direct', sessions: 1890, conversions: 22 },
      ],
      note: 'Perplexity lands in Referral, not AI Assistant. A large share of AI-referred sessions arrive as Direct with no referrer, so AI Assistant is a floor.',
      sources: [{ ref: 'fixture:ga4:2026-08' }],
    },
  },

  psi: {
    runPagespeed: {
      data: { performance: 0.62, lcpMs: 3400, clsScore: 0.14, inpMs: 210 },
      sources: [{ ref: 'fixture:psi:acme-hvac' }],
    },
  },

  serp: {
    ranks: {
      rows: [
        { keyword: 'furnace repair philadelphia', position: 6, aiOverviewPresent: true, aiOverviewCitesUs: false },
        { keyword: 'flat rate hvac philadelphia', position: 4, aiOverviewPresent: false, aiOverviewCitesUs: false },
        { keyword: 'heat pump rowhome', position: 15, aiOverviewPresent: true, aiOverviewCitesUs: false },
      ],
      sources: [{ ref: 'fixture:serp:2026-08' }],
    },
  },
});

/**
 * The reconciliation demo inputs.
 *
 * Google Ads claims 76 conversions; the CRM has 52 real leads. That 46%
 * over-report is the realistic shape of this problem, and it is the number no
 * platform will show a client.
 */
export const DEMO_RECONCILIATION = Object.freeze({
  platformConversions: {
    'google-ads': { conversions: 76, spend: 5951.15 },
    'meta-ads': { conversions: 28, spend: 2340.50 },
  },
  realLeads: {
    'google-ads': { leads: 52, spend: 5951.15 },
    'meta-ads': { leads: 17, spend: 2340.50 },
  },
});

function DEMO_HTML() {
  const para = 'Our licensed technicians repair gas furnaces, heat pumps and boilers across Philadelphia, with same-day dispatch inside the city limits and flat-rate pricing published before any work begins. ';
  const para2 = 'Rowhome mechanicals are tight, and a unit sized for a suburban split will short-cycle in a 1920s Philadelphia rowhome. We size for the house you actually have. ';
  return [
    '<!doctype html><html lang="en"><head>',
    '<title>Furnace &amp; AC Repair in Philadelphia | Acme HVAC</title>',
    '<meta name="description" content="Same-day furnace and AC repair in Philadelphia. Flat-rate pricing published before work starts. PA HIC #PA123456.">',
    '<link rel="canonical" href="https://acmehvac.example/">',
    '</head><body>',
    '<h1>Same-Day Furnace and AC Repair in Philadelphia</h1>',
    `<h2>What we repair</h2><p>${para.repeat(3)}</p>`,
    `<h2>Flat-rate pricing</h2><p>${para2.repeat(2)}</p><ul><li>$89 diagnostic</li><li>Flat-rate repair menu</li><li>Annual maintenance plan</li></ul>`,
    '<h2>Service area</h2><p>We serve Philadelphia and the immediately surrounding neighbourhoods, including South Philadelphia, Fishtown, Manayunk and Chestnut Hill, with same-day dispatch where a slot is open.</p>',
    '<p>PA HIC #PA123456</p>',
    '<a href="/furnace-repair">Furnace repair</a><a href="/ac-repair">AC repair</a><a href="https://www.google.com/maps">Directions</a>',
    '<img src="/tech.jpg" alt="Technician servicing a rowhome furnace">',
    '</body></html>',
  ].join('');
}
