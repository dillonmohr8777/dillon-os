#!/usr/bin/env node
/**
 * Site Health Watchdog — zero-dependency crawler/auditor.
 *
 * Crawls the configured site from its sitemap, audits every page for the
 * on-page and infrastructure signals that move organic rankings, scores the
 * site by category, diffs against the previous run, and writes JSON + Markdown
 * reports into the vault (SEO/AlignHCM/Watchdog by default).
 *
 *   node _os/watchdog/watchdog.mjs [--max N] [--config path]
 *
 * Node 18+. No npm installs — safe to run anywhere the vault is checked out.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tls from 'node:tls';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

// ---------- config ----------
const argv = process.argv.slice(2);
function arg(name, fallback) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}
const configPath = arg('config', join(__dirname, 'config.json'));
const cfg = JSON.parse(readFileSync(configPath, 'utf8'));
const SITE = cfg.site.replace(/\/$/, '');
const HOST = new URL(SITE).host;
const APEX = HOST.replace(/^www\./, '');
const MAX_PAGES = parseInt(arg('max', cfg.maxPages || 200), 10);
const CONCURRENCY = cfg.concurrency || 6;
const TIMEOUT = cfg.timeoutMs || 20000;
const LINK_CAP = cfg.linkCheckCap || 250;
const REPORT_DIR = join(REPO_ROOT, cfg.reportDir || 'SEO/Watchdog');
const UA = 'Mozilla/5.0 (compatible; AlignWatchdog/1.0; site health monitor)';

const today = new Date().toISOString().slice(0, 10);

// ---------- fetch helpers ----------
async function timedFetch(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  const t0 = performance.now();
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      signal: ctrl.signal,
      headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,*/*' },
      ...opts,
    });
    const ttfb = performance.now() - t0;
    return { res, ttfb };
  } finally {
    clearTimeout(t);
  }
}

/** Follow redirects manually so we can record the chain. */
async function fetchChain(url, wantBody = true) {
  const chain = [];
  let current = url;
  for (let hop = 0; hop < 6; hop++) {
    let r;
    try {
      r = await timedFetch(current);
    } catch (e) {
      return { url, finalUrl: current, chain, status: 0, error: String(e?.cause?.code || e.message || e), ttfb: 0, body: '' };
    }
    const { res, ttfb } = r;
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const loc = new URL(res.headers.get('location'), current).href;
      chain.push({ url: current, status: res.status, to: loc });
      try { await res.arrayBuffer(); } catch { /* drain */ }
      current = loc;
      continue;
    }
    let body = '';
    let bytes = 0;
    if (wantBody) {
      try {
        body = await res.text();
        bytes = Buffer.byteLength(body);
      } catch { /* body read failure is non-fatal */ }
    } else {
      try { await res.arrayBuffer(); } catch { /* drain */ }
    }
    const t1 = performance.now();
    return {
      url, finalUrl: current, chain, status: res.status, ttfb: Math.round(ttfb),
      totalMs: Math.round(ttfb + (wantBody ? t1 - t1 : 0)), bytes, body,
      headers: Object.fromEntries([...res.headers.entries()]),
    };
  }
  return { url, finalUrl: current, chain, status: 0, error: 'redirect-loop', ttfb: 0, body: '' };
}

async function pool(items, worker, size) {
  const results = new Array(items.length);
  let idx = 0;
  async function run() {
    while (idx < items.length) {
      const i = idx++;
      try { results[i] = await worker(items[i], i); }
      catch (e) { results[i] = { error: String(e) }; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, run));
  return results;
}

// ---------- HTML parsing (regex-based, no deps) ----------
function tagAttrs(tag) {
  const attrs = {};
  const re = /([a-zA-Z][a-zA-Z0-9:_-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let m;
  while ((m = re.exec(tag))) attrs[m[1].toLowerCase()] = m[3] ?? m[4] ?? m[5] ?? '';
  return attrs;
}
function allTags(html, name) {
  const re = new RegExp(`<${name}\\b[^>]*>`, 'gi');
  return (html.match(re) || []).map(tagAttrs);
}
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}
function parsePage(html, pageUrl) {
  const out = {};
  const titleM = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  out.title = titleM ? decodeEntities(titleM[1].trim()).replace(/\s+/g, ' ') : '';

  const metas = allTags(html, 'meta');
  const metaBy = (key, val) => metas.find((a) => (a[key] || '').toLowerCase() === val);
  out.description = (metaBy('name', 'description') || {}).content || '';
  out.robotsMeta = ((metaBy('name', 'robots') || {}).content || '').toLowerCase();
  out.viewport = !!metaBy('name', 'viewport');
  out.og = {
    title: !!metaBy('property', 'og:title'),
    description: !!metaBy('property', 'og:description'),
    image: !!metaBy('property', 'og:image'),
  };
  out.twitterCard = !!metaBy('name', 'twitter:card');

  const links = allTags(html, 'link');
  const canon = links.find((a) => (a.rel || '').toLowerCase() === 'canonical');
  out.canonical = canon ? new URL(canon.href, pageUrl).href : '';
  out.cssCount = links.filter((a) => (a.rel || '').toLowerCase() === 'stylesheet').length;

  out.h1s = (html.match(/<h1\b[^>]*>/gi) || []).length;
  out.langAttr = /<html[^>]+lang\s*=/i.test(html);

  const imgs = allTags(html, 'img');
  out.imgCount = imgs.length;
  out.imgNoAlt = imgs.filter((a) => !('alt' in a) || a.alt.trim() === '').length;

  out.scriptCount = (html.match(/<script\b[^>]*src=/gi) || []).length;

  // JSON-LD structured data types
  out.schemaTypes = [];
  const ldRe = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ld;
  while ((ld = ldRe.exec(html))) {
    try {
      const data = JSON.parse(ld[1].trim());
      const nodes = Array.isArray(data) ? data : data['@graph'] || [data];
      for (const n of nodes) {
        const t = n && n['@type'];
        if (t) out.schemaTypes.push(...(Array.isArray(t) ? t : [t]));
      }
    } catch { /* invalid JSON-LD is itself worth knowing */ out.schemaTypes.push('(unparseable)'); }
  }

  // internal links
  out.links = [];
  for (const a of allTags(html, 'a')) {
    const href = a.href;
    if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) continue;
    try {
      const u = new URL(href, pageUrl);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') continue;
      const h = u.host.toLowerCase();
      if (h === HOST || h === APEX) {
        u.hash = '';
        out.links.push({ href: u.href, host: h });
      }
    } catch { /* malformed href */ }
  }

  // mixed content: http:// subresources on an https page
  out.mixedContent = (html.match(/(?:src|href)\s*=\s*["']http:\/\/[^"']+["']/gi) || [])
    .filter((s) => !/href/i.test(s) || /\.(css|js)/i.test(s)).length;

  // visible word count
  const textOnly = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  out.wordCount = decodeEntities(textOnly).split(/\s+/).filter((w) => /\w/.test(w)).length;

  // blog publish date if present
  const pub = metaBy('property', 'article:published_time');
  out.publishedAt = pub ? pub.content : '';
  return out;
}

// ---------- sitemap ----------
async function fetchSitemapUrls(smUrl, seen = new Set(), depth = 0) {
  if (depth > 3 || seen.has(smUrl)) return [];
  seen.add(smUrl);
  const r = await fetchChain(smUrl, true);
  if (r.status !== 200) return [];
  const xml = r.body;
  const urls = [];
  if (/<sitemapindex/i.test(xml)) {
    const subs = [...xml.matchAll(/<sitemap>[\s\S]*?<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
    for (const s of subs) urls.push(...(await fetchSitemapUrls(s, seen, depth + 1)));
    return urls;
  }
  // <url><loc> entries only (image:loc lives inside <image:image>, matched out by requiring <url> scope)
  for (const m of xml.matchAll(/<url>[\s\S]*?<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
    try {
      const u = new URL(decodeEntities(m[1]));
      if (u.host === HOST || u.host === APEX) urls.push(u.href);
    } catch { /* skip malformed */ }
  }
  return [...new Set(urls)];
}

// ---------- site-level checks ----------
function sslExpiry(host) {
  return new Promise((resolveP) => {
    const sock = tls.connect(443, host, { servername: host, timeout: 8000 }, () => {
      const cert = sock.getPeerCertificate();
      sock.end();
      resolveP(cert && cert.valid_to ? new Date(cert.valid_to) : null);
    });
    sock.on('error', () => resolveP(null));
    sock.on('timeout', () => { sock.destroy(); resolveP(null); });
  });
}

function normalize(u) {
  try {
    const url = new URL(u);
    url.hash = '';
    let s = url.href;
    if (url.pathname !== '/' && s.endsWith('/')) s = s.slice(0, -1);
    return s;
  } catch { return u; }
}

// ---------- issue engine ----------
const issues = [];
function issue(id, severity, category, page, detail, fix) {
  issues.push({ id, severity, category, page, detail, fix });
}
const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const SEV_COST = { critical: 25, high: 10, medium: 4, low: 1 };

// ---------- main ----------
async function main() {
  console.log(`[watchdog] ${today} auditing ${SITE} (max ${MAX_PAGES} pages)`);

  // 1. robots.txt
  const robots = await fetchChain(`${SITE}/robots.txt`, true);
  let robotsSitemaps = [];
  if (robots.status !== 200) {
    issue('ROBOTS_MISSING', 'medium', 'indexability', null,
      `robots.txt returned ${robots.status}`, 'Serve a robots.txt with a Sitemap: line.');
  } else {
    robotsSitemaps = [...robots.body.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1]);
    if (/^\s*user-agent:\s*\*\s*[\r\n]+\s*disallow:\s*\/\s*$/im.test(robots.body)) {
      issue('ROBOTS_BLOCKS_ALL', 'critical', 'indexability', null,
        'robots.txt disallows the whole site', 'Remove the global Disallow: / rule.');
    }
    if (robotsSitemaps.length === 0) {
      issue('ROBOTS_NO_SITEMAP', 'low', 'indexability', null,
        'robots.txt has no Sitemap: directive', 'Add "Sitemap: ' + SITE + '/sitemap.xml".');
    }
  }

  // 2. sitemap
  const smUrl = robotsSitemaps[0] || `${SITE}/sitemap.xml`;
  let urls = await fetchSitemapUrls(smUrl);
  if (urls.length === 0) {
    issue('SITEMAP_MISSING', 'high', 'indexability', null,
      `No URLs readable from ${smUrl}`, 'Ensure sitemap.xml is published and referenced in robots.txt.');
    urls = [SITE + '/'];
  }
  const allSitemapUrls = urls.slice();
  if (urls.length > MAX_PAGES) {
    console.log(`[watchdog] sitemap has ${urls.length} URLs; crawling first ${MAX_PAGES}`);
    urls = urls.slice(0, MAX_PAGES);
  }

  // 3. redirect matrix + soft-404 + SSL
  const variants = [`http://${APEX}/`, `https://${APEX}/`, `http://${HOST}/`];
  const matrix = await pool(variants, (v) => fetchChain(v, false), 3);
  matrix.forEach((r, i) => {
    if (!r || r.error) {
      issue('VARIANT_UNREACHABLE', 'high', 'availability', variants[i],
        `${variants[i]} failed: ${r?.error}`, 'Every host/protocol variant should 301 to the canonical origin.');
    } else if (normalize(r.finalUrl) !== normalize(SITE + '/') && normalize(r.finalUrl) !== normalize(SITE)) {
      issue('VARIANT_NOT_CANONICAL', 'high', 'indexability', variants[i],
        `${variants[i]} resolves to ${r.finalUrl} (status ${r.status}) instead of ${SITE}`,
        'Point all domain variants at the canonical https://www origin with a single 301.');
    } else if (r.chain.length > 1) {
      issue('VARIANT_CHAIN', 'low', 'performance', variants[i],
        `${variants[i]} takes ${r.chain.length} hops to reach canonical`, 'Collapse to a single 301 hop.');
    }
  });

  const soft = await fetchChain(`${SITE}/watchdog-soft-404-probe-${Date.now()}`, false);
  if (soft.status === 200) {
    issue('SOFT_404', 'high', 'indexability', null,
      'Nonexistent URLs return 200 instead of 404 — search engines may index junk/duplicate pages',
      'Configure the 404 template to return a real 404 status.');
  }

  const cert = await sslExpiry(HOST);
  let sslDays = null;
  if (cert) {
    sslDays = Math.round((cert - Date.now()) / 86400000);
    if (sslDays < 14) issue('SSL_EXPIRING', 'critical', 'security', null, `TLS certificate expires in ${sslDays} days`, 'Renew immediately.');
    else if (sslDays < 30) issue('SSL_EXPIRING', 'high', 'security', null, `TLS certificate expires in ${sslDays} days`, 'Confirm auto-renewal is on.');
  }

  // 4. crawl
  const pages = await pool(urls, async (u) => {
    const r = await fetchChain(u, true);
    const rec = {
      url: u, finalUrl: r.finalUrl, status: r.status, ttfb: r.ttfb,
      bytes: r.bytes || 0, chain: r.chain.map((c) => `${c.status}→${c.to}`), error: r.error || null,
    };
    if (r.status === 200 && r.body) Object.assign(rec, parsePage(r.body, r.finalUrl));
    return rec;
  }, CONCURRENCY);

  // 5. per-page issues
  const okPages = pages.filter((p) => p.status === 200);
  const secHeaders = okPages[0]?.headers || (await fetchChain(SITE + '/', false)).headers || {};
  for (const h of ['strict-transport-security', 'x-content-type-options']) {
    // headers were captured on the page fetch; check homepage response
  }

  for (const p of pages) {
    const loc = p.url;
    if (p.error || p.status === 0) {
      issue('PAGE_UNREACHABLE', 'critical', 'availability', loc, `Fetch failed: ${p.error}`, 'Investigate hosting/DNS.');
      continue;
    }
    if (p.status >= 400) {
      issue('PAGE_ERROR', 'critical', 'availability', loc, `Sitemap URL returns ${p.status}`, 'Fix or remove from sitemap.');
      continue;
    }
    if (p.chain.length > 0) {
      issue('SITEMAP_REDIRECT', 'medium', 'indexability', loc,
        `Sitemap URL redirects (${p.chain.join(' ')})`, 'Sitemaps should list final canonical URLs only.');
    }
    if (p.status !== 200) continue;

    const isBlog = /\/blog\//.test(loc);
    if (/noindex/.test(p.robotsMeta || '')) {
      issue('NOINDEX', 'critical', 'indexability', loc, 'Page carries meta robots noindex while listed in the sitemap',
        'Remove noindex (or pull the URL from the sitemap if intentional).');
    }
    if (!p.title) issue('TITLE_MISSING', 'high', 'onpage', loc, 'No <title>', 'Write a 50–60 char keyword-led title.');
    else {
      if (p.title.length > 65) issue('TITLE_LONG', 'low', 'onpage', loc, `Title is ${p.title.length} chars: "${p.title.slice(0, 70)}…"`, 'Trim to ≤60 chars so it does not truncate in SERPs.');
      if (p.title.length < 25) issue('TITLE_SHORT', 'low', 'onpage', loc, `Title is only ${p.title.length} chars: "${p.title}"`, 'Expand with the page\'s primary keyword.');
    }
    if (!p.description) issue('DESC_MISSING', 'medium', 'onpage', loc, 'No meta description', 'Add a 120–155 char description with the target query — this is your SERP ad copy.');
    else if (p.description.length > 165) issue('DESC_LONG', 'low', 'onpage', loc, `Description ${p.description.length} chars`, 'Trim to ≤155 chars.');
    else if (p.description.length < 60) issue('DESC_SHORT', 'low', 'onpage', loc, `Description only ${p.description.length} chars`, 'Expand toward 120–155 chars.');
    if (p.h1s === 0) issue('H1_MISSING', 'medium', 'onpage', loc, 'No <h1>', 'Add exactly one keyword-bearing H1.');
    if (p.h1s > 1) issue('H1_MULTI', 'low', 'onpage', loc, `${p.h1s} <h1> tags`, 'Keep one H1; demote the rest.');
    if (!p.canonical) issue('CANONICAL_MISSING', 'medium', 'indexability', loc, 'No rel=canonical', 'Emit a self-referencing canonical.');
    else if (normalize(p.canonical) !== normalize(p.finalUrl)) {
      issue('CANONICAL_MISMATCH', 'high', 'indexability', loc,
        `Canonical points to ${p.canonical}`, 'Unless intentional, canonicals should be self-referencing — this page is telling Google to rank a different URL.');
    }
    if (isBlog && p.wordCount < 400) issue('THIN_CONTENT', 'medium', 'content', loc, `Blog post has ~${p.wordCount} words`, 'Expand to 800+ words or consolidate into a stronger post.');
    if (isBlog && !p.schemaTypes.some((t) => /Article|BlogPosting/i.test(t))) {
      issue('NO_ARTICLE_SCHEMA', 'medium', 'content', loc, `Blog post has no Article/BlogPosting JSON-LD (found: ${p.schemaTypes.join(', ') || 'none'})`,
        'Add BlogPosting schema with headline, datePublished, author.');
    }
    if (!p.og?.title || !p.og?.image) issue('OG_INCOMPLETE', 'low', 'onpage', loc,
      `Open Graph incomplete (title:${!!p.og?.title} image:${!!p.og?.image})`, 'Fill og:title/og:description/og:image for share cards.');
    if (p.imgCount > 3 && p.imgNoAlt / p.imgCount > 0.4) issue('IMG_ALT_LOW', 'low', 'content', loc,
      `${p.imgNoAlt}/${p.imgCount} images missing alt text`, 'Add descriptive alt text.');
    if (p.mixedContent > 0) issue('MIXED_CONTENT', 'high', 'security', loc, `${p.mixedContent} http:// subresources`, 'Serve all assets over https.');
    if (p.ttfb > 1500) issue('SLOW_TTFB', 'medium', 'performance', loc, `TTFB ${p.ttfb}ms`, 'Investigate HubSpot render/cache for this page.');
    else if (p.ttfb > 800) issue('SLOW_TTFB', 'low', 'performance', loc, `TTFB ${p.ttfb}ms`, 'Watch this page; aim <600ms.');
    if (p.bytes > 400_000) issue('HTML_HEAVY', 'low', 'performance', loc, `HTML is ${(p.bytes / 1024).toFixed(0)}KB`, 'Reduce inline payload.');
    if (!p.langAttr) issue('LANG_MISSING', 'low', 'onpage', loc, '<html> missing lang attribute', 'Add lang="en".');
    if (!p.viewport) issue('VIEWPORT_MISSING', 'medium', 'onpage', loc, 'No viewport meta — page fails mobile-friendly checks', 'Add the responsive viewport meta.');
  }

  // duplicate titles/descriptions
  const byTitle = new Map();
  const byDesc = new Map();
  for (const p of okPages) {
    if (p.title) byTitle.set(p.title, [...(byTitle.get(p.title) || []), p.url]);
    if (p.description) byDesc.set(p.description, [...(byDesc.get(p.description) || []), p.url]);
  }
  for (const [t, us] of byTitle) if (us.length > 1) {
    issue('TITLE_DUP', 'high', 'onpage', us.join(' , '), `${us.length} pages share the title "${t.slice(0, 60)}"`, 'Give every page a unique title.');
  }
  for (const [d, us] of byDesc) if (us.length > 1) {
    issue('DESC_DUP', 'medium', 'onpage', us.join(' , '), `${us.length} pages share one meta description`, 'Unique descriptions per page.');
  }

  // homepage schema
  const home = okPages.find((p) => normalize(p.finalUrl) === normalize(SITE));
  if (home && !home.schemaTypes.some((t) => /Organization|WebSite/i.test(t))) {
    issue('NO_ORG_SCHEMA', 'medium', 'content', home.url,
      `Homepage lacks Organization/WebSite JSON-LD (found: ${home.schemaTypes.join(', ') || 'none'})`,
      'Add Organization schema (name, logo, sameAs LinkedIn) — feeds brand knowledge panel.');
  }

  // security headers (from homepage response)
  const hh = home?.headers || {};
  if (!hh['strict-transport-security']) issue('NO_HSTS', 'low', 'security', null, 'Missing Strict-Transport-Security header', 'Enable HSTS in HubSpot settings.');
  if (!hh['x-content-type-options']) issue('NO_XCTO', 'low', 'security', null, 'Missing X-Content-Type-Options header', 'Set nosniff.');

  // 6. broken internal links
  const crawledSet = new Set(pages.map((p) => normalize(p.url)).concat(pages.map((p) => normalize(p.finalUrl))));
  const linkTargets = new Map(); // normalized url -> {hosts, sources}
  for (const p of okPages) {
    for (const l of p.links || []) {
      const n = normalize(l.href);
      if (!linkTargets.has(n)) linkTargets.set(n, { url: l.href, host: l.host, sources: new Set() });
      linkTargets.get(n).sources.add(p.url);
    }
  }
  const apexLinks = [...linkTargets.values()].filter((l) => l.host === APEX && HOST !== APEX);
  if (apexLinks.length > 0) {
    issue('APEX_INTERNAL_LINKS', 'low', 'performance', null,
      `${apexLinks.length} internal link target(s) use ${APEX} instead of ${HOST}, forcing a redirect hop`,
      'Update internal links to the canonical www host.');
  }
  const unknown = [...linkTargets.entries()].filter(([n]) => !crawledSet.has(n)).slice(0, LINK_CAP);
  const linkChecks = await pool(unknown, async ([n, meta]) => {
    let r = await timedFetch(meta.url, { method: 'HEAD' }).catch(() => null);
    let status = r?.res?.status ?? 0;
    if (status === 405 || status === 0) {
      const g = await fetchChain(meta.url, false);
      status = g.status;
    } else if (status >= 300 && status < 400) {
      const g = await fetchChain(meta.url, false);
      status = g.status;
    }
    return { url: meta.url, status, sources: [...meta.sources].slice(0, 3) };
  }, CONCURRENCY);
  for (const l of linkChecks) {
    if (l && l.status >= 400) {
      issue('LINK_BROKEN', 'high', 'content', l.url,
        `Internal link returns ${l.status} (linked from ${l.sources.join(', ')})`, 'Fix or remove the link.');
    }
  }

  // 7. scoring
  const cats = { availability: 100, indexability: 100, onpage: 100, content: 100, performance: 100, security: 100 };
  for (const i of issues) {
    const cat = i.category in cats ? i.category : 'onpage';
    cats[cat] = Math.max(0, cats[cat] - SEV_COST[i.severity]);
  }
  const weights = { availability: 0.2, indexability: 0.25, onpage: 0.25, content: 0.15, performance: 0.1, security: 0.05 };
  const score = Math.round(Object.entries(cats).reduce((s, [c, v]) => s + v * weights[c], 0));

  // 8. diff vs previous run
  const latestPath = join(REPORT_DIR, 'reports', 'latest.json');
  let prev = null;
  if (existsSync(latestPath)) { try { prev = JSON.parse(readFileSync(latestPath, 'utf8')); } catch { /* corrupt previous */ } }
  const keyOf = (i) => `${i.id}|${i.page || 'site'}`;
  const prevKeys = new Set((prev?.issues || []).map(keyOf));
  const currKeys = new Set(issues.map(keyOf));
  const newIssues = issues.filter((i) => !prevKeys.has(keyOf(i)));
  const resolved = (prev?.issues || []).filter((i) => !currKeys.has(keyOf(i)));

  // 9. write reports
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const i of issues) counts[i.severity]++;
  issues.sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);

  const report = {
    date: today, site: SITE, score, categories: cats, counts,
    pagesCrawled: pages.length, sitemapUrls: allSitemapUrls.length, sslDaysLeft: sslDays,
    prevScore: prev?.score ?? null, newIssues: newIssues.map(keyOf), resolvedIssues: resolved.map(keyOf),
    issues,
    pages: pages.map((p) => ({
      url: p.url, status: p.status, ttfb: p.ttfb, bytes: p.bytes, words: p.wordCount ?? null,
      title: p.title ?? null, titleLen: p.title?.length ?? null, descLen: p.description?.length ?? null,
      h1s: p.h1s ?? null, schema: p.schemaTypes ?? [], imgs: p.imgCount ?? null, imgNoAlt: p.imgNoAlt ?? null,
      canonicalOk: p.canonical ? normalize(p.canonical) === normalize(p.finalUrl) : null,
      published: p.publishedAt || null, redirects: p.chain?.length || 0,
    })),
  };

  const repDir = join(REPORT_DIR, 'reports');
  mkdirSync(repDir, { recursive: true });
  writeFileSync(join(repDir, `${today}.json`), JSON.stringify(report, null, 1));
  writeFileSync(latestPath, JSON.stringify(report, null, 1));
  appendFileSync(join(REPORT_DIR, 'history.jsonl'),
    JSON.stringify({ date: today, score, cats, counts, pages: pages.length }) + '\n');

  // markdown
  const sevIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '⚪' };
  let md = `# Site Health — ${cfg.brand || HOST} — ${today}\n\n`;
  md += `**Score: ${score}/100**${prev ? ` (${score - prev.score >= 0 ? '+' : ''}${score - prev.score} vs ${prev.date})` : ' (first run)'} · ${pages.length}/${allSitemapUrls.length} sitemap URLs crawled · SSL ${sslDays ?? '?'} days left\n\n`;
  md += `| Category | Score |\n|---|---|\n` + Object.entries(cats).map(([c, v]) => `| ${c} | ${v} |`).join('\n') + '\n\n';
  md += `**Issues:** ${counts.critical} critical · ${counts.high} high · ${counts.medium} medium · ${counts.low} low\n\n`;
  if (prev) {
    md += `**New since ${prev.date}:** ${newIssues.length ? newIssues.map((i) => `${i.id} (${i.page || 'site'})`).join('; ') : 'none'}\n`;
    md += `**Resolved:** ${resolved.length ? resolved.map((i) => `${i.id} (${i.page || 'site'})`).join('; ') : 'none'}\n\n`;
  }
  for (const sev of ['critical', 'high', 'medium', 'low']) {
    const list = issues.filter((i) => i.severity === sev);
    if (!list.length) continue;
    md += `## ${sevIcon[sev]} ${sev} (${list.length})\n\n`;
    for (const i of list) md += `- **${i.id}** ${i.page ? `\`${i.page}\`` : ''}\n  ${i.detail}\n  ↳ _${i.fix}_\n`;
    md += '\n';
  }
  const slow = [...report.pages].filter((p) => p.status === 200).sort((a, b) => b.ttfb - a.ttfb).slice(0, 10);
  md += `## Slowest pages (TTFB)\n\n| ms | URL |\n|---|---|\n` + slow.map((p) => `| ${p.ttfb} | ${p.url} |`).join('\n') + '\n';
  writeFileSync(join(repDir, `${today}.md`), md);

  console.log(`[watchdog] done. score=${score} issues=${issues.length} (crit:${counts.critical} high:${counts.high} med:${counts.medium} low:${counts.low})`);
  console.log(`[watchdog] reports → ${repDir}/${today}.{json,md}`);
}

main().catch((e) => { console.error('[watchdog] fatal:', e); process.exit(1); });
