/**
 * Site crawler and AEO analyzer.
 *
 * This is the connector that needs no credentials, which makes it the one that
 * carries the product's first-run value. It answers the question that gates
 * everything else in AI search:
 *
 *   CAN AN AI CRAWLER SEE THIS SITE AT ALL?
 *
 * Published analysis of half a billion crawler fetches found that no major AI
 * crawler executes JavaScript - GPTBot, ClaudeBot, PerplexityBot, and the rest
 * download JS files but never run them. There is no partial visibility here: a
 * client-rendered page either has its content in the initial HTML response or
 * it is invisible to those engines. Google's AI Overviews are the exception,
 * being grounded in the Googlebot index, which does render - so the finding is
 * reported PER ENGINE CLASS rather than as one verdict.
 *
 * `ssrCoverage` is the measurement: main-text tokens present in the raw HTML
 * response, as a fraction of what a rendering engine would see. Below ~0.7 is
 * a critical finding. It is computed from the raw HTML alone plus a static
 * analysis of what the page defers to script, so it works without a browser.
 *
 * Safety: every fetch goes through an SSRF guard. A workspace URL is attacker-
 * controlled input from the platform's point of view, and a crawler that will
 * fetch http://169.254.169.254/ on request is a credential-exfiltration
 * primitive, not a feature.
 */

import { lookup } from 'node:dns/promises';
import { registrableDomain } from '../geo/extract.js';
import { ValidationError, fromHttp, TransientError } from '../core/errors.js';

const DEFAULT_UA = 'CMO-OS/0.1 (+https://github.com/dillonmohr8777/dillon-os; site audit)';
const MAX_BYTES = 3_000_000;
const DEFAULT_TIMEOUT = 20_000;

// ---------------------------------------------------------------------------
// SSRF guard
// ---------------------------------------------------------------------------

const BLOCKED_V4 = [
  [0, 8], [10, 8], [100, 10], [127, 8], [169, 16], [172, 12], [192, 16], [198, 15], [224, 4], [240, 4],
];

/** True when an IPv4 literal is in a private, link-local, or reserved range. */
export function isBlockedIpv4(ip) {
  const parts = String(ip).split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const asInt = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  const ranges = [
    ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
    ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.168.0.0', 16],
    ['198.18.0.0', 15], ['224.0.0.0', 4], ['240.0.0.0', 4], ['255.255.255.255', 32],
  ];
  return ranges.some(([base, bits]) => {
    const b = base.split('.').map(Number);
    const baseInt = ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (asInt & mask) === (baseInt & mask);
  });
}

export function isBlockedIpv6(ip) {
  const s = String(ip).toLowerCase();
  if (s === '::1' || s === '::') return true;
  if (s.startsWith('fe80') || s.startsWith('fc') || s.startsWith('fd')) return true; // link-local, ULA
  if (s.startsWith('::ffff:')) return isBlockedIpv4(s.slice(7));                      // v4-mapped
  return false;
}

/**
 * Validate a URL is safe to fetch: public scheme, public host, resolves to a
 * public address. Returns the normalized URL.
 */
export async function assertPublicUrl(input, { resolver = lookup } = {}) {
  let url;
  try {
    url = new URL(String(input));
  } catch {
    throw new ValidationError(`not a valid URL: ${input}`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new ValidationError(`refusing non-HTTP scheme: ${url.protocol}`);
  }
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) {
    throw new ValidationError(`refusing internal hostname: ${host}`);
  }
  // Literal address given directly.
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    if (isBlockedIpv4(host)) throw new ValidationError(`refusing private address: ${host}`);
    return url;
  }
  if (host.includes(':') || host.startsWith('[')) {
    const bare = host.replace(/^\[|\]$/g, '');
    if (isBlockedIpv6(bare)) throw new ValidationError(`refusing private address: ${bare}`);
    return url;
  }
  // Resolve and check every answer - a hostname can point at 127.0.0.1.
  let addresses;
  try {
    addresses = await resolver(host, { all: true });
  } catch (err) {
    throw new ValidationError(`cannot resolve ${host}: ${err.code || err.message}`);
  }
  for (const a of addresses) {
    const blocked = a.family === 6 ? isBlockedIpv6(a.address) : isBlockedIpv4(a.address);
    if (blocked) throw new ValidationError(`${host} resolves to a private address (${a.address}); refusing to fetch`);
  }
  return url;
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

export async function fetchPage(rawUrl, { timeoutMs = DEFAULT_TIMEOUT, userAgent = DEFAULT_UA, resolver } = {}) {
  const url = await assertPublicUrl(rawUrl, { resolver });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': userAgent, accept: 'text/html,application/xhtml+xml,text/plain,*/*' },
    });
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) throw new ValidationError(`response from ${url} exceeds ${MAX_BYTES} bytes`);
    const body = new TextDecoder('utf-8', { fatal: false }).decode(buf);
    if (!res.ok) throw fromHttp(res.status, body.slice(0, 300), { host: url.hostname });
    return {
      url: res.url || url.toString(),
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      body,
      bytes: buf.byteLength,
      ms: Date.now() - startedAt,
    };
  } catch (err) {
    if (err?.name === 'AbortError') throw new TransientError(`timed out after ${timeoutMs}ms fetching ${rawUrl}`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// HTML analysis (no DOM library - a regex tokenizer is enough and has no deps)
// ---------------------------------------------------------------------------

const SCRIPT_STYLE = /<(script|style|noscript|template|svg)\b[^>]*>[\s\S]*?<\/\1>/gi;
const TAGS = /<[^>]+>/g;

export function extractText(html) {
  return String(html || '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(SCRIPT_STYLE, ' ')
    .replace(TAGS, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenCount(text) {
  return String(text || '').split(/\s+/).filter(Boolean).length;
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[2] ?? m[3] ?? m[4] ?? '').trim() : null;
}

function allTags(html, tagName) {
  const re = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  return String(html || '').match(re) || [];
}

export function parseHeadings(html) {
  const out = [];
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push({ level: Number(m[1]), text: extractText(m[2]).slice(0, 200) });
  }
  return out;
}

export function parseJsonLd(html) {
  const out = [];
  const re = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      out.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      out.push({ __parseError: true, snippet: m[1].trim().slice(0, 200) });
    }
  }
  return out;
}

/**
 * Estimate how much of the page's content is in the server response.
 *
 * A rendering engine would additionally see whatever the framework hydrates.
 * Since we do not run a browser, the denominator is estimated from the
 * strongest available signals: an embedded hydration payload (Next.js
 * `__NEXT_DATA__`, Nuxt, Remix, Astro islands) contains the text the client
 * will paint, so its extractable strings are counted as renderable content
 * that is NOT in the served HTML unless it also appears there.
 *
 * This deliberately errs toward reporting good coverage: it will not cry wolf
 * on a server-rendered page, and it flags the case that actually matters - an
 * empty shell whose text lives only in a JSON blob or is fetched later.
 */
export function ssrCoverage(html) {
  const body = String(html || '');
  const servedText = extractText(body);
  const servedTokens = tokenCount(servedText);

  const hydration = [];
  const nextData = body.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (nextData) hydration.push(nextData[1]);
  const selfNext = body.match(/self\.__next_f\s*\.push\(([\s\S]*?)\)<\/script>/i);
  if (selfNext) hydration.push(selfNext[1]);
  const nuxt = body.match(/window\.__NUXT__\s*=([\s\S]*?)<\/script>/i);
  if (nuxt) hydration.push(nuxt[1]);
  const remix = body.match(/window\.__remixContext\s*=([\s\S]*?)<\/script>/i);
  if (remix) hydration.push(remix[1]);

  // Strings inside the hydration payload that are prose-like and absent from
  // the served text are content an AI crawler will never see.
  let hiddenTokens = 0;
  const hiddenSamples = [];
  for (const blob of hydration) {
    const strings = blob.match(/"([^"\\]{25,400})"/g) || [];
    for (const s of strings) {
      const text = s.slice(1, -1);
      if (!/[a-z]{3}\s+[a-z]{3}/i.test(text)) continue;          // not prose
      if (servedText.includes(text.slice(0, 40))) continue;      // already served
      hiddenTokens += tokenCount(text);
      if (hiddenSamples.length < 3) hiddenSamples.push(text.slice(0, 120));
    }
  }

  const renderableTokens = servedTokens + hiddenTokens;
  const coverage = renderableTokens > 0 ? servedTokens / renderableTokens : 1;

  // The empty-shell case: almost no served text at all, with scripts present.
  const scriptCount = allTags(body, 'script').length;
  const emptyShell = servedTokens < 80 && scriptCount > 2;

  return {
    servedTokens,
    hiddenTokens,
    renderableTokens,
    coverage: Math.round(coverage * 1000) / 1000,
    emptyShell,
    hydrationFramework: nextData || selfNext ? 'next' : nuxt ? 'nuxt' : remix ? 'remix' : null,
    hiddenSamples,
    // Reported per engine class, because the answer genuinely differs.
    verdictByEngine: {
      'openai/anthropic/perplexity': coverage >= 0.7 && !emptyShell
        ? 'visible - content is in the served HTML'
        : 'AT RISK - these crawlers do not execute JavaScript, so content only present after hydration is invisible to them',
      'google-ai-overviews': 'likely visible - AI Overviews are grounded in the Googlebot index, and Googlebot renders JavaScript',
    },
  };
}

/**
 * Chunkability: can a retriever lift a self-contained answer out of this page?
 *
 * Retrieval-augmented systems chunk at roughly 512 tokens. A section longer
 * than that gets split, and a split that separates a question from its answer
 * destroys the passage. Studies comparing adaptive, topic-aligned chunking
 * against fixed-size splitting found a very large accuracy gap, which makes
 * this one of the few levers a site owner fully controls.
 */
export function chunkability(html, { targetTokens = 512 } = {}) {
  const headings = parseHeadings(html);
  const text = extractText(html);
  const total = tokenCount(text);

  // Split the body text at heading boundaries to approximate sections.
  const sections = [];
  const parts = String(html || '').split(/<h[23]\b[^>]*>/i);
  for (const part of parts.slice(1)) {
    const sectionText = extractText(part);
    sections.push({ tokens: tokenCount(sectionText), preview: sectionText.slice(0, 90) });
  }

  const oversized = sections.filter((s) => s.tokens > targetTokens);
  const tiny = sections.filter((s) => s.tokens > 0 && s.tokens < 40);
  const h1s = headings.filter((h) => h.level === 1);
  const findings = [];

  if (!h1s.length) findings.push({ severity: 'medium', code: 'NO_H1', message: 'no H1; the page states no single topic for a retriever to anchor on' });
  if (h1s.length > 1) findings.push({ severity: 'low', code: 'MULTIPLE_H1', message: `${h1s.length} H1 elements; a retriever cannot tell which is the page topic` });
  if (!sections.length && total > 400) {
    findings.push({ severity: 'high', code: 'NO_SECTIONS', message: `${total} tokens with no H2/H3 structure - a fixed-window chunker will cut this mid-answer` });
  }
  if (oversized.length) {
    findings.push({
      severity: 'medium', code: 'OVERSIZED_SECTIONS',
      message: `${oversized.length} section(s) exceed ${targetTokens} tokens and will be split mid-answer. Break each into sub-questions with the answer in the first sentence.`,
      examples: oversized.slice(0, 3).map((s) => ({ tokens: s.tokens, preview: s.preview })),
    });
  }
  const lists = allTags(html, 'ul').length + allTags(html, 'ol').length;
  const tables = allTags(html, 'table').length;
  if (!lists && !tables && total > 600) {
    findings.push({ severity: 'low', code: 'NO_EXTRACTABLE_STRUCTURE', message: 'no lists or tables; extractable structures are what answer engines quote' });
  }

  const meanSection = sections.length ? Math.round(sections.reduce((a, s) => a + s.tokens, 0) / sections.length) : total;
  const score = Math.max(0, Math.min(100, Math.round(
    100
    - (h1s.length === 1 ? 0 : 12)
    - (sections.length ? 0 : 25)
    - oversized.length * 8
    - (lists + tables > 0 ? 0 : 6)
    - (tiny.length > sections.length / 2 ? 8 : 0),
  )));

  return { score, totalTokens: total, sections: sections.length, meanSectionTokens: meanSection, oversized: oversized.length, headings: headings.length, lists, tables, findings };
}

/** Full single-page AEO analysis. Pure function over fetched HTML. */
export function analyzePage({ url, html, headers = {} }) {
  const body = String(html || '');
  const text = extractText(body);
  const titleMatch = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const metas = allTags(body, 'meta');
  const meta = {};
  for (const tag of metas) {
    const name = (attr(tag, 'name') || attr(tag, 'property') || '').toLowerCase();
    if (name) meta[name] = attr(tag, 'content');
  }
  const links = allTags(body, 'link').map((t) => ({ rel: (attr(t, 'rel') || '').toLowerCase(), href: attr(t, 'href') }));
  const jsonLd = parseJsonLd(body);
  const schemaTypes = jsonLd.flatMap((n) => (n && n['@type'] ? [].concat(n['@type']) : []));

  const ssr = ssrCoverage(body);
  const chunks = chunkability(body);

  const imgs = allTags(body, 'img');
  const missingAlt = imgs.filter((t) => !attr(t, 'alt')).length;

  return {
    url,
    fetchedBytes: body.length,
    title: titleMatch ? extractText(titleMatch[1]) : null,
    titleLength: titleMatch ? extractText(titleMatch[1]).length : 0,
    metaDescription: meta.description || null,
    metaDescriptionLength: (meta.description || '').length,
    canonical: links.find((l) => l.rel === 'canonical')?.href || null,
    robotsMeta: meta.robots || null,
    // These two matter specifically for AI answers: they suppress the snippet
    // AI Overviews and AI Mode draw from, while also killing the normal one.
    nosnippet: /nosnippet/i.test(meta.robots || ''),
    maxSnippet: (meta.robots || '').match(/max-snippet:\s*(-?\d+)/i)?.[1] ?? null,
    headings: parseHeadings(body).slice(0, 60),
    h1Count: parseHeadings(body).filter((h) => h.level === 1).length,
    wordCount: tokenCount(text),
    schemaTypes: [...new Set(schemaTypes)],
    jsonLdBlocks: jsonLd.length,
    jsonLdErrors: jsonLd.filter((n) => n?.__parseError).length,
    images: imgs.length,
    imagesMissingAlt: missingAlt,
    internalLinks: countLinks(body, url, true),
    externalLinks: countLinks(body, url, false),
    contentType: headers['content-type'] || null,
    ssr,
    chunkability: chunks,
    textSample: text.slice(0, 600),
  };
}

function countLinks(html, pageUrl, internal) {
  let base;
  try { base = new URL(pageUrl); } catch { return 0; }
  const domain = registrableDomain(base.href);
  let count = 0;
  for (const tag of allTags(html, 'a')) {
    const href = attr(tag, 'href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    let target;
    try { target = new URL(href, base); } catch { continue; }
    const same = registrableDomain(target.href) === domain;
    if (same === internal) count += 1;
  }
  return count;
}
