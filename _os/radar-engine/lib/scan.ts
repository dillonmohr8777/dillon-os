'use strict';

const { analyzeTier0, fetchPage, visibleText, detectPlatform } = require('../../automation/lib/site-audit');
const { parseJsonLd, robotsPolicy } = require('../../automation/lib/aeo-trust');
const { classifyEmail } = require('../../automation/lib/contacts');
const { id } = require('./ids.ts');
const { normalizeDomain } = require('./normalize.ts');
const { assertSafeScanUrl } = require('./ssrf.ts');
const { redactText } = require('./redact.ts');

const SCANNER_VERSION = 'radar-wrap-1.0.0';

function item(partial) {
  return {
    id: id('evidence'),
    source: 'fixture',
    url: '',
    provider_record_id: null,
    captured_at: new Date().toISOString(),
    metric: '',
    excerpt: '',
    classification: 'technical',
    confidence: 0.8,
    freshness_expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
    artifact_ref: null,
    ...partial,
  };
}

function excerpt(text, n = 180) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, n);
}

function analyzeHtmlDocument(html, url) {
  const res = {
    ok: true,
    html,
    body: html,
    status: 200,
    finalUrl: url,
    bytes: Buffer.byteLength(html),
    responseMs: 12,
    hops: [{ url, status: 200 }],
    headers: { 'content-type': 'text/html' },
  };
  return analyzeTier0(res, url);
}

function aeoSignals(html, url) {
  const { blocks, count } = parseJsonLd(html);
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const author = /itemprop=["']author["']|rel=["']author["']|<address/i.test(html);
  const faq = /FAQPage|itemtype=["'][^"']*FAQPage/i.test(html) || /<h2[^>]*>\s*faq/i.test(html);
  const robots = robotsPolicy('', '*');
  return {
    jsonLdCount: count,
    jsonLdBlocks: blocks,
    title: String(title).trim(),
    author,
    faq,
    entityClarity: /\b(LLC|Inc|Heating|Cooling|HVAC|Plumbing|Dental|Law)\b/i.test(html),
    robotsBlocked: robots.blocked,
    url,
  };
}

function publishedContacts(html, url) {
  const domain = normalizeDomain(url);
  const emails = [];
  const re = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  let m;
  while ((m = re.exec(html))) {
    const classified = classifyEmail(m[0]);
    if (!classified) continue;
    const onOwnDomain = classified.domain === domain || classified.domain.endsWith(`.${domain}`);
    emails.push({ ...classified, onOwnDomain, own_domain: onOwnDomain });
  }
  const form = /<form[\s>]/i.test(html);
  const phone = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/.exec(html);
  const people = [];
  const person = html.match(/([A-Z][a-z]+ [A-Z][a-z]+),\s*(Owner|Manager|Director|DDS|DMD|MD|Esq)/);
  if (person) people.push({ name: person[1], title: person[2] });
  return { emails, form, phone: phone ? phone[0] : '', people, domain };
}

function evidenceFromAudit(audit, html, url, extra = {}) {
  const items = [];
  const text = visibleText(html || '');
  items.push(item({
    source: extra.source || 'tier0',
    url,
    metric: `reachable=${audit.reachable === true}`,
    excerpt: audit.error || `HTTP ${audit.httpStatus || 'n/a'}`,
    classification: 'reachability',
    confidence: audit.reachable === true ? 0.95 : 0.9,
  }));
  items.push(item({
    source: extra.source || 'tier0',
    url,
    metric: `https=${audit.https === true}; tls_broken=${audit.brokenTls === true}`,
    excerpt: audit.https ? 'HTTPS on final URL' : 'no HTTPS on final URL',
    classification: 'technical',
    confidence: 0.95,
  }));
  items.push(item({
    source: extra.source || 'tier0',
    url,
    metric: `viewport=${audit.hasViewport === true}`,
    excerpt: audit.hasViewport ? 'viewport meta present' : 'no viewport meta',
    classification: 'technical',
    confidence: 0.95,
  }));
  items.push(item({
    source: extra.source || 'tier0',
    url,
    metric: `bytes=${audit.transferBytes || Buffer.byteLength(html || '')}; responseMs=${audit.responseMs}`,
    excerpt: 'page weight and response time from the fetch, not a lab Lighthouse run',
    classification: 'performance',
    confidence: 0.7,
  }));
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const meta = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i) || [])[1] || '';
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '';
  const canonical = (html.match(/rel=["']canonical["'][^>]+href=["']([^"']+)/i) || [])[1] || '';
  items.push(item({
    source: extra.source || 'tier0',
    url,
    metric: `title_len=${title.trim().length}; meta_len=${meta.length}; h1=${Boolean(h1)}; canonical=${Boolean(canonical)}`,
    excerpt: excerpt(title || 'no title'),
    classification: 'onpage',
    confidence: 0.9,
  }));
  items.push(item({
    source: extra.source || 'tier0',
    url,
    metric: `robots=${extra.robots || 'not-fetched'}; index=${!/noindex/i.test(html)}`,
    excerpt: /noindex/i.test(html) ? 'noindex present on page' : 'no noindex on homepage markup',
    classification: 'indexability',
    confidence: extra.robots ? 0.85 : 0.55,
  }));
  const aeo = aeoSignals(html, url);
  items.push(item({
    source: extra.source || 'tier0',
    url,
    metric: `jsonld=${aeo.jsonLdCount}; faq=${aeo.faq}; author=${aeo.author}; entity=${aeo.entityClarity}`,
    excerpt: 'AEO readiness from on-page signals only. No AI-engine visibility was measured.',
    classification: 'aeo',
    confidence: 0.7,
  }));
  items.push(item({
    source: extra.source || 'tier0',
    url,
    metric: `words=${text.split(/\s+/).filter(Boolean).length}`,
    excerpt: redactText(excerpt(text)),
    classification: 'content',
    confidence: 0.8,
  }));
  const contacts = publishedContacts(html, url);
  items.push(item({
    source: 'own-site',
    url,
    metric: `emails=${contacts.emails.length}; form=${contacts.form}; phone=${Boolean(contacts.phone)}`,
    excerpt: 'contact routes published on the business site. No guessed addresses.',
    classification: 'conversion',
    confidence: 0.85,
  }));
  items.push(item({
    source: extra.source || 'tier0',
    url,
    metric: `cta=${audit.hasCta === true}; phone_action=${audit.hasPhone === true}`,
    excerpt: 'forms and tel: links observed in markup',
    classification: 'conversion',
    confidence: 0.8,
  }));
  items.push(item({
    source: extra.source || 'tier0',
    url,
    metric: `platform=${detectPlatform(html)}; logo=${/logo/i.test(html)}`,
    excerpt: 'first-party imagery presence from markup, not a harvested binary',
    classification: 'imagery',
    confidence: 0.6,
  }));
  if (extra.places) {
    items.push(item({
      source: 'places',
      url: extra.places.id || '',
      provider_record_id: extra.places.id || null,
      metric: `rating=${extra.places.rating}; reviews=${extra.places.userRatingCount}; status=${extra.places.businessStatus}`,
      excerpt: extra.places.displayName || 'Places identity',
      classification: 'local',
      confidence: 0.8,
    }));
  } else {
    items.push(item({
      source: 'places',
      url,
      metric: 'places=not-queried',
      excerpt: 'Google listing identity was not fetched for this run. Local scores use only supplied fixture fields.',
      classification: 'local',
      confidence: 0.3,
    }));
  }
  if (extra.social) {
    items.push(item({
      source: 'own-site',
      url,
      metric: `social=${extra.social.join(',')}`,
      excerpt: 'social profile links published by the business. Manual research only; no autonomous DMs.',
      classification: 'trust',
      confidence: 0.7,
    }));
  }
  return { items, aeo, contacts, text };
}

function scanFixture({ html, url, prospect = {}, places = null }) {
  assertSafeScanUrl(url);
  const audit = analyzeHtmlDocument(html, url);
  const social = [...html.matchAll(/https?:\/\/(?:www\.)?(facebook|instagram|linkedin|yelp)\.com\/[^\s"'<]+/gi)]
    .map((m) => m[0]);
  const { items, aeo, contacts } = evidenceFromAudit(audit, html, url, {
    source: 'fixture',
    places,
    social,
  });
  return {
    scanner_version: SCANNER_VERSION,
    fixture: true,
    audit: {
      ...audit,
      hasCta: audit.hasCta === true || /contact|schedule|call now|get a quote/i.test(html),
      hasPhone: audit.clickToCall === true || audit.phoneVisible === true,
      hasForm: /<form[\s>]/i.test(html),
      wordCount: visibleText(html).split(/\s+/).filter(Boolean).length,
    },
    evidence: items,
    aeo,
    contacts,
    prospect,
  };
}

async function scanPublicWebsite({ url, prospect = {}, fetchPageFn = fetchPage }) {
  const safeUrl = assertSafeScanUrl(url);
  const fetched = await fetchPageFn(safeUrl.href, { timeoutMs: 15000, maxRedirects: 5 });
  if (!fetched || !fetched.ok) {
    throw new Error(`public website fetch failed: ${String(fetched?.error || 'no response').slice(0, 160)}`);
  }
  if (fetched.status < 200 || fetched.status >= 300) {
    throw new Error(`public website returned HTTP ${fetched.status}`);
  }
  const contentType = String(fetched.headers?.['content-type'] || '').toLowerCase();
  if (contentType && !/(?:text\/html|application\/xhtml\+xml)/i.test(contentType)) {
    throw new Error('public website response was not HTML');
  }

  const html = String(fetched.html || fetched.body || '');
  if (!html) throw new Error('public website response contained no HTML');
  const finalUrl = fetched.finalUrl || safeUrl.href;
  const audit = analyzeTier0({ ...fetched, html, body: fetched.body || html }, safeUrl.href);
  if (audit.reachable !== true) throw new Error('public website could not be audited');
  const social = [...html.matchAll(/https?:\/\/(?:www\.)?(facebook|instagram|linkedin|yelp)\.com\/[^\s"'<]+/gi)]
    .map((m) => m[0]);
  const { items, aeo, contacts } = evidenceFromAudit(audit, html, finalUrl, {
    source: 'tier0',
    social,
  });
  return {
    scanner_version: SCANNER_VERSION,
    fixture: false,
    audit: {
      ...audit,
      finalUrl,
      hasCta: audit.hasCta === true || /contact|schedule|call now|get a quote/i.test(html),
      hasPhone: audit.clickToCall === true || audit.phoneVisible === true,
      hasForm: /<form[\s>]/i.test(html),
      wordCount: visibleText(html).split(/\s+/).filter(Boolean).length,
      publicSignals: {
        emailCount: contacts.emails.length,
        hasPhone: Boolean(contacts.phone),
        hasForm: contacts.form,
      },
    },
    evidence: items,
    aeo,
    contacts,
    prospect,
  };
}

module.exports = {
  SCANNER_VERSION,
  analyzeHtmlDocument,
  evidenceFromAudit,
  scanFixture,
  scanPublicWebsite,
  publishedContacts,
  aeoSignals,
};
