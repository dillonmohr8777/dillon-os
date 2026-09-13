/**
 * AI crawler registry and robots.txt policy.
 *
 * The single most consequential technical-SEO error in this space is treating
 * every AI bot as one thing. They are three things, and conflating them either
 * costs you nothing or deletes you from AI answers entirely:
 *
 *   training      - reads your content to train a model. Blocking costs you
 *                   no citations.
 *   search_index  - builds the index an answer engine retrieves from.
 *                   Blocking removes you from those answers.
 *   user_fetch    - fetches a page because a human asked for it right now.
 *                   Blocking breaks the answer for a user who wanted you.
 *   control_token - not a crawler at all. Fetches nothing, has no user agent,
 *                   and only expresses a downstream-use preference.
 *
 * Two facts in here are the ones people get wrong most often, so they are
 * encoded as data rather than left to a human to remember:
 *
 *   - `Google-Extended` has NO user agent and fetches NOTHING. It gates
 *     Gemini/Vertex training use of already-crawled content. Disallowing it
 *     does NOT remove you from AI Overviews, because AI Overviews are grounded
 *     in the live Google Search index.
 *   - `Applebot-Extended` is the same shape for Apple Intelligence. Blocking
 *     it while keeping `Applebot` allowed is the correct configuration.
 *
 * Matching rule: match the TOKEN as a case-insensitive substring and store the
 * raw user agent verbatim. Never regex a full UA string - versions churn
 * (GPTBot/1.1 vs 1.2) and a version-pinned pattern silently stops matching.
 */

export const GATE = Object.freeze({
  training: 'training',
  searchIndex: 'search_index',
  userFetch: 'user_fetch',
  controlToken: 'control_token',
});

/**
 * @typedef {object} CrawlerRecord
 * @property {string} token       substring to match, case-insensitively
 * @property {string} operator
 * @property {string} gate        one of GATE
 * @property {string} verify      how a hit can be authenticated
 * @property {string|null} verifyUrl  published IP range list, when one exists
 * @property {string} recommend   'allow' | 'block'
 * @property {string} note
 */
export const CRAWLERS = Object.freeze([
  // --- OpenAI: three bots, three different jobs -----------------------------
  { token: 'OAI-SearchBot', operator: 'OpenAI', gate: GATE.searchIndex, recommend: 'allow',
    verify: 'published IP ranges', verifyUrl: 'https://openai.com/searchbot.json',
    note: 'Builds the index ChatGPT Search retrieves from. Blocking this removes you from ChatGPT answers.' },
  { token: 'ChatGPT-User', operator: 'OpenAI', gate: GATE.userFetch, recommend: 'allow',
    verify: 'published IP ranges', verifyUrl: 'https://openai.com/chatgpt-user.json',
    note: 'Fetches a page because a user asked. Not bulk crawling, not training.' },
  { token: 'GPTBot', operator: 'OpenAI', gate: GATE.training, recommend: 'block',
    verify: 'published IP ranges', verifyUrl: 'https://openai.com/gptbot.json',
    note: 'Training crawler. Blocking costs no citations. Match the token, not the version - both 1.1 and 1.2 are in the wild.' },

  // --- Anthropic: three bots, no verification protocol ---------------------
  { token: 'Claude-SearchBot', operator: 'Anthropic', gate: GATE.searchIndex, recommend: 'allow',
    verify: 'user-agent assertion only', verifyUrl: null,
    note: 'Search-index class. No published IP list, so hits are UA-asserted and unverifiable - bucket them separately from verified hits.' },
  { token: 'Claude-User', operator: 'Anthropic', gate: GATE.userFetch, recommend: 'allow',
    verify: 'user-agent assertion only', verifyUrl: null,
    note: 'User-initiated fetch.' },
  { token: 'ClaudeBot', operator: 'Anthropic', gate: GATE.training, recommend: 'block',
    verify: 'user-agent assertion only', verifyUrl: null,
    note: 'Training crawler. Anthropic recommends robots.txt over IP blocking, because its bots run on public-cloud IPs and IP blocks can stop them reading robots.txt at all.' },

  // --- Perplexity ----------------------------------------------------------
  { token: 'PerplexityBot', operator: 'Perplexity', gate: GATE.searchIndex, recommend: 'allow',
    verify: 'published IP ranges + forward-confirmed rDNS', verifyUrl: 'https://www.perplexity.ai/perplexitybot.json',
    note: 'Surfaces and links sites in Perplexity results.' },
  { token: 'Perplexity-User', operator: 'Perplexity', gate: GATE.userFetch, recommend: 'allow',
    verify: 'published IP ranges + forward-confirmed rDNS', verifyUrl: 'https://www.perplexity.ai/perplexitybot.json',
    note: 'User-initiated; generally ignores robots.txt because a human asked for the page.' },

  // --- Control tokens: NOT crawlers ---------------------------------------
  { token: 'Google-Extended', operator: 'Google', gate: GATE.controlToken, recommend: 'block',
    verify: 'n/a - fetches nothing', verifyUrl: null,
    note: 'No user agent, no fetches. Gates Gemini/Vertex TRAINING use of already-crawled content. Disallowing it does NOT remove you from AI Overviews or affect Search ranking.' },
  { token: 'Applebot-Extended', operator: 'Apple', gate: GATE.controlToken, recommend: 'block',
    verify: 'n/a - fetches nothing', verifyUrl: null,
    note: 'Gates Apple Intelligence training. Disallowing it still permits Apple search inclusion via Applebot.' },
  { token: 'Applebot', operator: 'Apple', gate: GATE.searchIndex, recommend: 'allow',
    verify: 'forward-confirmed rDNS', verifyUrl: null,
    note: 'Apple search and Siri surfaces. Must stay allowed for Apple visibility.' },

  // --- Bulk training / dataset crawlers -----------------------------------
  { token: 'CCBot', operator: 'Common Crawl', gate: GATE.training, recommend: 'block',
    verify: 'user-agent assertion only', verifyUrl: null,
    note: 'Feeds many downstream training corpora.' },
  { token: 'Bytespider', operator: 'ByteDance', gate: GATE.training, recommend: 'block',
    verify: 'user-agent assertion only', verifyUrl: null,
    note: 'Reported only partially compliant with robots.txt; treat compliance as best-effort.' },
  { token: 'Meta-ExternalAgent', operator: 'Meta', gate: GATE.training, recommend: 'block',
    verify: 'user-agent assertion only', verifyUrl: null, note: 'Training crawler.' },
  { token: 'Amazonbot', operator: 'Amazon', gate: GATE.training, recommend: 'block',
    verify: 'user-agent assertion only', verifyUrl: null, note: 'Training / assistant crawler.' },
  { token: 'cohere-ai', operator: 'Cohere', gate: GATE.training, recommend: 'block',
    verify: 'user-agent assertion only', verifyUrl: null, note: 'Training crawler.' },
  { token: 'Diffbot', operator: 'Diffbot', gate: GATE.training, recommend: 'block',
    verify: 'user-agent assertion only', verifyUrl: null, note: 'Knowledge-graph extraction.' },
  { token: 'Timpibot', operator: 'Timpi', gate: GATE.training, recommend: 'block',
    verify: 'user-agent assertion only', verifyUrl: null, note: 'Training crawler.' },
]);

const BY_TOKEN = new Map(CRAWLERS.map((c) => [c.token.toLowerCase(), c]));

/** Identify a crawler from a raw user-agent string. Returns null for humans. */
export function identify(userAgent) {
  const ua = String(userAgent || '').toLowerCase();
  if (!ua) return null;

  // Control tokens are checked FIRST and excluded. They never appear in a real
  // user agent, but "Applebot-Extended" contains "Applebot" - so skipping them
  // and then substring-matching would classify a control token as the
  // search-index crawler and report it as allowed traffic.
  for (const record of CRAWLERS) {
    if (record.gate !== GATE.controlToken) continue;
    if (ua.includes(record.token.toLowerCase())) return null;
  }

  // Longest token first, so "Claude-SearchBot" is not swallowed by "ClaudeBot".
  const ordered = [...BY_TOKEN.values()]
    .filter((r) => r.gate !== GATE.controlToken)
    .sort((a, b) => b.token.length - a.token.length);
  for (const record of ordered) {
    if (ua.includes(record.token.toLowerCase())) return record;
  }
  return null;
}

export function byGate(gate) {
  return CRAWLERS.filter((c) => c.gate === gate);
}

/**
 * Generate a robots.txt AI policy.
 *
 * @param {object} opts
 * @param {'retrieval-friendly'|'open'|'closed'} opts.stance
 *   retrieval-friendly (the revenue-positive default) - allow search and
 *   user-fetch classes, block training classes.
 *   open   - allow everything, including training.
 *   closed - block everything except user-initiated fetches.
 */
export function robotsPolicy({ stance = 'retrieval-friendly', sitemapUrl = null, contentSignals = true } = {}) {
  const lines = [];
  const decide = (c) => {
    if (stance === 'open') return c.gate === GATE.controlToken ? 'allow' : 'allow';
    if (stance === 'closed') return c.gate === GATE.userFetch ? 'allow' : 'block';
    return c.recommend;
  };

  lines.push('# AI crawler policy');
  lines.push(`# stance: ${stance}`);
  lines.push('# Generated by CMO OS. Three classes, three different consequences:');
  lines.push('#   search_index  - blocking removes you from that engine\'s answers');
  lines.push('#   user_fetch    - blocking breaks the page for a user who asked for you');
  lines.push('#   training      - blocking costs you no citations');
  lines.push('');

  const groups = [
    ['OpenAI', 'OpenAI'], ['Anthropic', 'Anthropic'], ['Perplexity', 'Perplexity'],
    ['Google', 'Google'], ['Apple', 'Apple'],
  ];
  const emitted = new Set();

  for (const [label, operator] of groups) {
    const set = CRAWLERS.filter((c) => c.operator === operator);
    if (!set.length) continue;
    lines.push(`# ${label}`);
    for (const c of set) {
      lines.push(`User-agent: ${c.token}`);
      lines.push(decide(c) === 'allow' ? 'Allow: /' : 'Disallow: /');
      lines.push('');
      emitted.add(c.token);
    }
  }

  const rest = CRAWLERS.filter((c) => !emitted.has(c.token));
  if (rest.length) {
    lines.push('# Bulk training and dataset crawlers');
    for (const c of rest) {
      lines.push(`User-agent: ${c.token}`);
      lines.push(decide(c) === 'allow' ? 'Allow: /' : 'Disallow: /');
      lines.push('');
    }
  }

  if (contentSignals) {
    lines.push('# Content Signals - a usage-preference layer alongside Allow/Disallow.');
    lines.push('# Preferences only: robots.txt cannot technically enforce them.');
    lines.push('User-agent: *');
    lines.push(stance === 'open'
      ? 'Content-Signal: search=yes, ai-input=yes, ai-train=yes'
      : 'Content-Signal: search=yes, ai-input=yes, ai-train=no');
    lines.push('Allow: /');
    lines.push('');
  }

  if (sitemapUrl) lines.push(`Sitemap: ${sitemapUrl}`);
  return lines.join('\n');
}

/**
 * Audit an existing robots.txt for the mistakes that actually cost visibility.
 * Returns findings, most severe first.
 */
export function auditRobots(robotsText) {
  const text = String(robotsText || '');
  const findings = [];
  const blocks = parseRobots(text);

  for (const record of CRAWLERS) {
    const rule = blocks.get(record.token.toLowerCase());
    const blocked = rule ? rule.disallowAll : (blocks.get('*')?.disallowAll ?? false);

    if (blocked && record.gate === GATE.searchIndex) {
      findings.push({
        severity: 'critical',
        code: 'SEARCH_CLASS_BLOCKED',
        token: record.token,
        message: `${record.token} is disallowed. It is a search-index crawler, so this removes the site from ${record.operator} AI answers entirely. ${record.note}`,
      });
    }
    if (blocked && record.gate === GATE.userFetch) {
      findings.push({
        severity: 'high',
        code: 'USER_FETCH_BLOCKED',
        token: record.token,
        message: `${record.token} is disallowed. It fetches pages because a human asked, so blocking it breaks the answer for a user who was already looking for this site.`,
      });
    }
    if (!blocked && record.gate === GATE.training && record.recommend === 'block') {
      findings.push({
        severity: 'info',
        code: 'TRAINING_ALLOWED',
        token: record.token,
        message: `${record.token} (training) is allowed. This is a policy choice, not an error - blocking it would cost no citations.`,
      });
    }
  }

  // The classic misconception, called out explicitly.
  const ext = blocks.get('google-extended');
  if (ext?.disallowAll) {
    findings.push({
      severity: 'info',
      code: 'GOOGLE_EXTENDED_NOTE',
      token: 'Google-Extended',
      message: 'Google-Extended is disallowed, which blocks Gemini/Vertex training use. This does NOT remove the site from AI Overviews or affect Search ranking - AI Overviews are grounded in the live Search index. If the goal was to leave AI Overviews, this is not the lever.',
    });
  }
  if (!/sitemap:/i.test(text)) {
    findings.push({ severity: 'medium', code: 'NO_SITEMAP', token: null, message: 'no Sitemap directive; AI search crawlers use it for discovery' });
  }
  if (!/content-signal/i.test(text)) {
    findings.push({ severity: 'info', code: 'NO_CONTENT_SIGNALS', token: null, message: 'no Content-Signal line; consider declaring search / ai-input / ai-train preferences' });
  }

  const order = { critical: 0, high: 1, medium: 2, info: 3 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);
  return { findings, blocks: [...blocks.keys()] };
}

/** Parse robots.txt into per-user-agent rule blocks. */
export function parseRobots(text) {
  const blocks = new Map();
  let current = [];
  for (const rawLine of String(text || '').split('\n')) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const [rawKey, ...rest] = line.split(':');
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (key === 'user-agent') {
      const agent = value.toLowerCase();
      if (!blocks.has(agent)) blocks.set(agent, { agent, allow: [], disallow: [], disallowAll: false });
      current = [blocks.get(agent)];
      continue;
    }
    if (!current.length) continue;
    for (const block of current) {
      if (key === 'disallow') {
        block.disallow.push(value);
        if (value === '/') block.disallowAll = true;
      }
      if (key === 'allow') {
        block.allow.push(value);
        // An explicit Allow: / after Disallow: / reopens the site.
        if (value === '/') block.disallowAll = false;
      }
    }
  }
  return blocks;
}
