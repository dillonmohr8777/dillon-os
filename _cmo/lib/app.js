/**
 * Application wiring.
 *
 * One place constructs the whole system, so the CLI, the HTTP server, and the
 * tests all run the identical object graph. A test that wires its own subset is
 * a test that passes while production is broken.
 *
 * Configuration is read from the environment once, here, and never read again
 * anywhere else in the codebase. Credentials are never logged, never written to
 * the store, and never placed in an artifact.
 */

import path from 'node:path';
import { systemClock, frozenClock } from './core/clock.js';
import { createLogger } from './core/log.js';
import { createStore } from './store/store.js';
import { createBudget, DEFAULT_BUDGET } from './runtime/budget.js';
import { breakerRegistry } from './runtime/breaker.js';
import { createApprovalQueue } from './runtime/approval.js';
import { createIdempotencyStore } from './runtime/idempotency.js';
import { createEngine } from './runtime/engine.js';
import { createRouter, DEFAULT_PROFILE, PROFILES } from './llm/router.js';
import { createLlmClient } from './llm/client.js';
import { createCache } from './llm/cache.js';
import { createMockProvider } from './llm/providers/mock.js';
import { createAnthropicProvider } from './llm/providers/anthropic.js';
import { createConnectorSet, connectorHealth } from './connectors/registry.js';
import { fetchPage, analyzePage } from './connectors/crawl.js';
import { agentRegistry } from './agents/index.js';
import { DEMO_FIXTURES, DEMO_PROFILE } from './connectors/fixtures.js';

export const DEFAULT_DATA_DIR = 'data';

/**
 * Read configuration from the environment.
 *
 * `CMO_PROVIDER=mock` is the default when no credential is present, so the
 * product boots and demos with nothing configured rather than erroring.
 */
export function readConfig(env = process.env) {
  const hasAnthropic = Boolean(env.ANTHROPIC_API_KEY || env.ANTHROPIC_AUTH_TOKEN);
  const provider = (env.CMO_PROVIDER || (hasAnthropic ? 'anthropic' : 'mock')).toLowerCase();
  return {
    provider,
    dataDir: env.CMO_DATA_DIR || DEFAULT_DATA_DIR,
    routingProfile: env.CMO_ROUTING_PROFILE || DEFAULT_PROFILE,
    port: Number(env.CMO_PORT || 4343),
    host: env.CMO_HOST || '127.0.0.1',
    allowFixtures: env.CMO_ALLOW_FIXTURES !== '0',
    logLevel: env.CMO_LOG_LEVEL || 'info',
    budget: {
      dailyUsd: numOr(env.CMO_BUDGET_DAILY_USD, DEFAULT_BUDGET.dailyUsd),
      monthlyUsd: numOr(env.CMO_BUDGET_MONTHLY_USD, DEFAULT_BUDGET.monthlyUsd),
      perRunUsd: numOr(env.CMO_BUDGET_PER_RUN_USD, DEFAULT_BUDGET.perRunUsd),
    },
    // Presence only. The values are handed to the connector layer and never
    // echoed anywhere.
    connectors: {
      gsc: { credentials: env.CMO_GOOGLE_OAUTH_JSON ? { oauth: env.CMO_GOOGLE_OAUTH_JSON } : null },
      ga4: { credentials: env.CMO_GA4_PROPERTY_ID && env.CMO_GOOGLE_OAUTH_JSON ? { property: env.CMO_GA4_PROPERTY_ID } : null },
      googleAds: { credentials: env.CMO_GOOGLE_ADS_DEVELOPER_TOKEN ? { token: env.CMO_GOOGLE_ADS_DEVELOPER_TOKEN } : null },
      metaAds: { credentials: env.CMO_META_ACCESS_TOKEN ? { token: env.CMO_META_ACCESS_TOKEN } : null },
      gbp: { credentials: env.CMO_GBP_ACCOUNT_ID ? { account: env.CMO_GBP_ACCOUNT_ID } : null },
      places: { credentials: env.CMO_PLACES_API_KEY ? { key: env.CMO_PLACES_API_KEY } : null },
      serp: { credentials: env.CMO_SERP_API_KEY ? { key: env.CMO_SERP_API_KEY } : null },
      psi: { credentials: env.CMO_PSI_API_KEY ? { key: env.CMO_PSI_API_KEY } : null },
      wordpress: { credentials: env.CMO_WP_URL && env.CMO_WP_APP_PASSWORD ? { url: env.CMO_WP_URL } : null },
      slack: { credentials: env.CMO_SLACK_WEBHOOK ? { webhook: true } : null },
      crawl: {},
    },
    providerConfigured: hasAnthropic,
  };
}

function numOr(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Build the application.
 *
 * @param {object} opts
 * @param {object} opts.env      environment to read config from
 * @param {boolean} opts.memory  in-memory store (tests)
 * @param {number} opts.freezeAt freeze the clock (tests, replay)
 */
export function createApp({
  env = process.env, memory = false, freezeAt = null, root = null,
  // Force fixture mode for connectors that have fixture data, even when a live
  // implementation exists. `cmo demo` uses this so the walkthrough never
  // depends on a network or on a real client's site being up.
  forceFixtures = [],
} = {}) {
  const config = readConfig(env);
  const clock = freezeAt != null ? frozenClock(freezeAt) : systemClock();
  const logger = createLogger({ scope: 'cmo', level: config.logLevel, clock });
  const dataRoot = root || path.resolve(process.cwd(), config.dataDir);
  const store = createStore(memory ? { driver: 'memory', clock } : { root: dataRoot, driver: 'fs', clock });

  const provider = config.provider === 'anthropic'
    ? createAnthropicProvider()
    // The offline provider is given a vendor pool so a GEO scan produces a real
    // distribution instead of a flat zero. It is a simulator, not a stub.
    : createMockProvider({
      vendorPool: [DEMO_PROFILE.name, ...DEMO_PROFILE.competitors.map((c) => c.name)],
      topicHints: DEMO_PROFILE.seeds.map((s) => s.term).concat([DEMO_PROFILE.category]),
    });

  const breakers = breakerRegistry({ threshold: 3, cooldownMs: 120_000, clock });

  // The crawl connector is the only one implemented against a live network
  // here: it needs no credentials, which is what makes first-run value real.
  const liveImpls = {
    crawl: {
      page: async ({ url }) => {
        const res = await fetchPage(url);
        return { url: res.url, status: res.status, headers: res.headers, body: res.body, sources: [{ url: res.url }] };
      },
      robots: async ({ url }) => {
        const origin = new URL(url).origin;
        const res = await fetchPage(`${origin}/robots.txt`);
        return { body: res.body, status: res.status, sources: [{ url: `${origin}/robots.txt` }] };
      },
      audit: async ({ url }) => {
        const res = await fetchPage(url);
        return { analysis: analyzePage({ url, html: res.body, headers: res.headers }), sources: [{ url: res.url }] };
      },
    },
  };

  const forced = new Set(forceFixtures);
  const connectors = createConnectorSet({
    config: config.connectors,
    fixtures: DEMO_FIXTURES,
    liveImpls: Object.fromEntries(Object.entries(liveImpls).filter(([id]) => !forced.has(id))),
    clock,
    allowFixtures: config.allowFixtures,
  });

  const agents = agentRegistry();

  /** Per-workspace facade. Everything below is fenced to one workspace. */
  function workspace(wsId, { actor = 'operator', routingProfile = null, budgetLimits = null } = {}) {
    const budget = createBudget({ store, wsId, clock, limits: budgetLimits || config.budget });
    const router = createRouter({ profile: routingProfile || config.routingProfile, breakers });
    const cache = createCache({ clock });
    const llm = createLlmClient({ provider, router, budget, breakers, cache, clock, logger: logger.child('llm', { workspaceId: wsId }) });
    const approvals = createApprovalQueue({ store, wsId, clock });
    const idempotency = createIdempotencyStore({ store, wsId, clock });
    const engine = createEngine({
      store, wsId, clock, llm, approvals, budget, breakers, connectors,
      logger: logger.child('engine', { workspaceId: wsId }), actor, agents,
    });
    return { id: wsId, ws: store.ws(wsId), budget, router, llm, approvals, idempotency, engine };
  }

  return {
    config, clock, logger, store, provider, breakers, connectors, agents, workspace,
    health: () => ({
      provider: { name: provider.name, mock: Boolean(provider.isMock), configured: config.providerConfigured },
      routingProfile: config.routingProfile,
      routingProfiles: Object.keys(PROFILES),
      store: { driver: store.driver, root: store.root },
      connectors: connectorHealth(connectors),
      breakers: breakers.snapshot(),
      budget: config.budget,
      dataDir: dataRoot,
    }),
  };
}
