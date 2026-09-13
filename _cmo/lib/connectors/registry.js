/**
 * Connector registry and the capability contract.
 *
 * The insight this encodes: degraded mode is the product, not a fallback.
 *
 * A closed competitor can add agents faster than anyone. What it structurally
 * cannot do is stay useful while a customer waits on Google's and Meta's
 * review queues. Google Ads needs a developer token approval. Google Business
 * Profile ships with ZERO default quota and needs an access request. Meta
 * Marketing API needs app review. Those are calendar-time, not engineering
 * time, and a product that shows an empty dashboard until they clear is a
 * product that gets cancelled in week one.
 *
 * So every connector declares one of four modes, and the mode travels with the
 * data all the way into the client report:
 *
 *   live       - real credentials, real API, real numbers
 *   substitute - a different real source standing in for the ideal one
 *                (Places public-profile data instead of GBP-authenticated
 *                data; a public crawl instead of Search Console)
 *   fixture    - deterministic committed sample data. Honest, labelled, and
 *                useful for demos, tests, and evals
 *   unavailable- not configured and no substitute exists
 *
 * Provenance is rendered, never hidden. A report footnote that reads
 * "Meta Ads unavailable 12-14 Aug, figures exclude paid social" is a
 * credibility gain over a chart that silently drops three days.
 */

import { AuthError, ValidationError } from '../core/errors.js';

export const LIVE = 'live';
export const SUBSTITUTE = 'substitute';
export const FIXTURE = 'fixture';
export const UNAVAILABLE = 'unavailable';

/**
 * Connector catalogue.
 *
 * `apiFacts` records what a live implementation must call. These were verified
 * against Google's machine-readable API Discovery documents and by probing the
 * live hosts (a 401 proves a route exists; a 404 proves it does not), because
 * secondary sources in this area are frequently out of date.
 */
export const CATALOGUE = Object.freeze({
  crawl: {
    id: 'crawl',
    label: 'Site crawl',
    lane: 'organic',
    needsCredentials: false,
    capabilities: ['fetch', 'audit', 'ssr-coverage', 'chunkability', 'schema', 'robots'],
    apiFacts: { note: 'No credentials. Direct HTTPS with an SSRF guard. This is why first-run value needs no setup.' },
  },

  gsc: {
    id: 'gsc',
    label: 'Google Search Console',
    lane: 'organic',
    needsCredentials: true,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    capabilities: ['search-analytics', 'url-inspection', 'sitemaps'],
    substituteVia: 'crawl',
    apiFacts: {
      host: 'searchconsole.googleapis.com',
      endpoints: [
        'POST /webmasters/v3/sites/{siteUrl}/searchAnalytics/query',
        'POST /v1/urlInspection/index:inspect',
        'GET  /webmasters/v3/sites/{siteUrl}/sitemaps',
      ],
      quota: 'generous for a single property; batch by date to stay inside per-day row caps',
      latency: 'data lags roughly 2-3 days',
      approval: 'none - OAuth consent only. This is the highest-value zero-friction connector.',
    },
  },

  ga4: {
    id: 'ga4',
    label: 'Google Analytics 4',
    lane: 'measurement',
    needsCredentials: true,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    capabilities: ['run-report', 'realtime', 'ai-referral-segmentation'],
    apiFacts: {
      host: 'analyticsdata.googleapis.com',
      endpoints: ['POST /v1beta/properties/{propertyId}:runReport', 'POST /v1beta/properties/{propertyId}:runRealtimeReport'],
      approval: 'none - OAuth consent only',
      gotcha: 'GA4 gained a native "AI Assistant" channel but it does not include Perplexity, which lands in Referral. Custom channel rules must be ordered ABOVE Referral or AI sessions get absorbed by it. A large share of AI-referred sessions arrive as direct with no referrer at all, so treat GA4 as a floor, not a count.',
    },
  },

  googleAds: {
    id: 'googleAds',
    label: 'Google Ads',
    lane: 'paid',
    needsCredentials: true,
    scopes: ['https://www.googleapis.com/auth/adwords'],
    capabilities: ['campaign-performance', 'search-terms', 'keyword-ideas', 'recommendations'],
    apiFacts: {
      host: 'googleads.googleapis.com',
      // Probed 2026-08-18: v22-v26 return 401 (route exists); v20/v21 return
      // 404 (gone). Widely-repeated claims that v25 is "current" are wrong -
      // v26 is live and v22 is the oldest supported.
      liveVersions: ['v22', 'v23', 'v24', 'v25', 'v26'],
      endpoints: [
        'POST /v26/customers/{customerId}/googleAds:searchStream',
        'POST /v26/customers/{customerId}:generateKeywordIdeas',
        'GET  /v26/customers/{customerId}/recommendations',
      ],
      approval: 'DEVELOPER TOKEN REQUIRED. Basic access is granted after review; test-account-only until then. Apply on day one - it is calendar time.',
      readOnly: 'reads are safe; every mutate is approval-gated as spend.change or mutate.ads',
    },
  },

  metaAds: {
    id: 'metaAds',
    label: 'Meta Ads',
    lane: 'paid',
    needsCredentials: true,
    capabilities: ['insights', 'creative-performance'],
    apiFacts: {
      host: 'graph.facebook.com',
      endpoints: ['GET /v{version}/act_{adAccountId}/insights', 'GET /v{version}/{adId}/adcreatives'],
      approval: 'App Review required for ads_read on accounts you do not own. Development mode works on your own accounts immediately.',
      gotcha: 'attribution windows are set per-request; a report that does not pin the window is not reproducible',
    },
  },

  gbp: {
    id: 'gbp',
    label: 'Google Business Profile',
    lane: 'local',
    needsCredentials: true,
    capabilities: ['locations', 'reviews', 'local-posts'],
    substituteVia: 'places',
    apiFacts: {
      // Probed 2026-08-18: reviews and localPosts on the legacy v4 host both
      // return 401, so the routes exist and are live. The Q&A API is genuinely
      // gone - mybusinessqanda.googleapis.com does not resolve at all.
      host: 'mybusiness.googleapis.com',
      endpoints: [
        'GET  /v4/accounts/{accountId}/locations/{locationId}/reviews',
        'PUT  /v4/accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply',
        'GET  /v4/accounts/{accountId}/locations/{locationId}/localPosts',
        'POST /v4/accounts/{accountId}/locations/{locationId}/localPosts',
      ],
      removed: 'the Q&A API (mybusinessqanda) was discontinued and the host no longer resolves - do not build against it',
      approval: 'ZERO DEFAULT QUOTA. An access request is required before any call succeeds, separately from OAuth. Request on day one.',
      rateLimits: 'once granted, roughly 10k reads / 1k writes per day per Cloud project. Stagger post writes; bulk pushes fail. Past ~50 locations, shard across projects.',
    },
  },

  places: {
    id: 'places',
    label: 'Google Places (public profile reader)',
    lane: 'local',
    needsCredentials: true,
    capabilities: ['public-profile', 'review-summary', 'competitor-discovery'],
    apiFacts: {
      host: 'places.googleapis.com',
      endpoints: ['POST /v1/places:searchText', 'GET /v1/places/{placeId}'],
      approval: 'API key only - no review process',
      // This is the substitute that makes the local lane sellable on day one.
      role: 'Stands in for GBP while the quota request is pending: ratings, review counts, categories, hours and competitor sets are all publicly readable. Delivers most of the local proposition with no GBP access at all.',
    },
  },

  serp: {
    id: 'serp',
    label: 'SERP / AI Overviews',
    lane: 'organic',
    needsCredentials: true,
    capabilities: ['organic-ranks', 'ai-overview', 'local-pack'],
    apiFacts: {
      providers: {
        dataforseo: 'organic/advanced with load_async_ai_overview - roughly $0.0026 per keyword including the AI Overview, the cheapest path',
        serpapi: 'AI Overview text plus source citations, roughly $9-25 per 1k',
        serper: 'roughly $1 per 1k, but AI Overview field coverage is unverified',
      },
      approval: 'none - API key',
    },
  },

  psi: {
    id: 'psi',
    label: 'PageSpeed Insights / CrUX',
    lane: 'organic',
    needsCredentials: true,
    capabilities: ['lab-metrics', 'field-metrics'],
    apiFacts: {
      host: 'pagespeedonline.googleapis.com',
      endpoints: ['GET /pagespeedonline/v5/runPagespeed?url={url}&strategy=mobile'],
      approval: 'API key only; works unauthenticated at a low rate limit',
    },
  },

  wordpress: {
    id: 'wordpress',
    label: 'WordPress',
    lane: 'ops',
    needsCredentials: true,
    capabilities: ['publish-post', 'update-post', 'media'],
    apiFacts: {
      endpoints: ['POST /wp-json/wp/v2/posts', 'POST /wp-json/wp/v2/media', 'POST /wp-json/wp/v2/posts/{id}'],
      auth: 'Application Passwords over HTTPS (core since 5.6); Basic auth header',
      approval: 'none - the site owner creates an application password',
      note: 'every write here is approval-gated as publish.cms and claims an idempotency key first, so a retry cannot double-publish',
    },
  },

  slack: {
    id: 'slack',
    label: 'Slack',
    lane: 'ops',
    needsCredentials: true,
    capabilities: ['notify'],
    apiFacts: { endpoints: ['POST {incomingWebhookUrl}'], approval: 'none - an incoming webhook URL' },
  },
});

/**
 * Build a connector instance.
 *
 * Resolution order: live if credentials are present -> substitute if one is
 * declared and available -> fixture if fixture data exists -> unavailable.
 * The chosen mode is reported, never inferred by the caller.
 */
export function createConnector(id, {
  credentials = null, fixtures = null, live = null, substitute = null, allowFixtures = true, clock,
} = {}) {
  const spec = CATALOGUE[id];
  if (!spec) throw new ValidationError(`unknown connector: ${id}`, { id, known: Object.keys(CATALOGUE) });

  const hasCreds = !spec.needsCredentials || Boolean(credentials && Object.keys(credentials).length);
  let mode = UNAVAILABLE;
  let impl = null;
  let reason = '';

  if (live && hasCreds) {
    mode = LIVE;
    impl = live;
    reason = 'credentials present';
  } else if (substitute) {
    mode = SUBSTITUTE;
    impl = substitute;
    reason = `standing in via ${spec.substituteVia || 'substitute source'}${spec.needsCredentials && !hasCreds ? ' (no credentials for the primary source)' : ''}`;
  } else if (fixtures && allowFixtures) {
    mode = FIXTURE;
    impl = fixtureImpl(fixtures, id);
    reason = 'no credentials; serving committed fixture data';
  } else {
    reason = spec.needsCredentials
      ? `no credentials configured and no substitute available${spec.apiFacts?.approval ? ` - ${spec.apiFacts.approval}` : ''}`
      : 'no implementation supplied';
  }

  const wrapped = { id, label: spec.label, lane: spec.lane, mode, reason, capabilities: spec.capabilities, apiFacts: spec.apiFacts };

  // Every method returns data stamped with provenance. Nothing downstream has
  // to remember to ask which mode produced a number.
  if (impl) {
    for (const key of Object.keys(impl)) {
      if (typeof impl[key] !== 'function') continue;
      wrapped[key] = async (args) => {
        const out = await impl[key](args);
        return {
          ...(out && typeof out === 'object' && !Array.isArray(out) ? out : { data: out }),
          provenance: {
            connector: id,
            mode,
            reason,
            at: clock ? clock.iso() : new Date().toISOString(),
            // Rendered in reports. "fixture" and "substitute" must be visible
            // to whoever reads the number.
            label: mode === LIVE ? spec.label : `${spec.label} (${mode})`,
          },
        };
      };
    }
  } else {
    wrapped.unavailableReason = reason;
  }

  return wrapped;
}

function fixtureImpl(fixtures, id) {
  const data = fixtures[id] || {};
  const out = {};
  for (const [method, value] of Object.entries(data)) {
    out[method] = async () => (typeof value === 'function' ? value() : structuredClone(value));
  }
  if (!Object.keys(out).length) {
    out.noop = async () => ({ empty: true });
  }
  return out;
}

/** Build the whole set from config. */
export function createConnectorSet({ config = {}, fixtures = null, liveImpls = {}, clock, allowFixtures = true } = {}) {
  const set = {};
  for (const id of Object.keys(CATALOGUE)) {
    const spec = CATALOGUE[id];
    const cfg = config[id] || {};
    const substituteId = spec.substituteVia;
    const substituteReady = substituteId && (config[substituteId]?.credentials || !CATALOGUE[substituteId]?.needsCredentials);
    set[id] = createConnector(id, {
      credentials: cfg.credentials || null,
      fixtures,
      live: liveImpls[id] || null,
      substitute: substituteReady && liveImpls[substituteId]
        ? liveImpls[substituteId]
        : (substituteReady && fixtures?.[substituteId] ? fixtureImpl(fixtures, substituteId) : null),
      allowFixtures,
      clock,
    });
  }
  return set;
}

/** A health view for the UI and `cmo doctor`. */
export function connectorHealth(set) {
  const rows = Object.values(set).map((c) => ({
    id: c.id, label: c.label, lane: c.lane, mode: c.mode, reason: c.reason,
    capabilities: c.capabilities || [],
    approval: c.apiFacts?.approval || null,
  }));
  const counts = rows.reduce((acc, r) => { acc[r.mode] = (acc[r.mode] || 0) + 1; return acc; }, {});
  return {
    rows: rows.sort((a, b) => a.lane.localeCompare(b.lane) || a.id.localeCompare(b.id)),
    counts,
    // The two requests that are calendar-time, surfaced so they get started
    // before they block anything.
    blockingApprovals: rows
      .filter((r) => r.mode !== LIVE && /REQUIRED|ZERO DEFAULT QUOTA|App Review/i.test(r.approval || ''))
      .map((r) => ({ id: r.id, action: r.approval })),
  };
}

/** Refuse to perform a live write without credentials, loudly. */
export function assertLive(connector, action) {
  if (!connector) throw new ValidationError(`connector missing for ${action}`);
  if (connector.mode !== LIVE) {
    throw new AuthError(
      `${action} needs the ${connector.label} connector in live mode, but it is ${connector.mode} (${connector.reason})`,
      { connector: connector.id, mode: connector.mode },
    );
  }
  return true;
}
