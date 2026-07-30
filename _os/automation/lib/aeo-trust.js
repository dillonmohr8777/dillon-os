'use strict';

const fs = require('fs');
const path = require('path');
const {
  REPO_ROOT,
  repoPath,
  ensureDir,
  readJson,
  writeJson,
  nowISO,
} = require('./fsutil');
const { enqueue } = require('./registry');

const DEFAULT_PROFILE = {
  required_bots: ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'],
  require_faq: true,
  require_json_ld: true,
  require_contact_signal: true,
  require_real_image: true,
  min_internal_links: 1,
  block_on_warnings: false,
};

function stripTags(html) {
  return String(html || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function firstMatch(html, regex) {
  const match = String(html || '').match(regex);
  return match ? String(match[1] || '').trim() : '';
}

function allMatches(html, regex) {
  const values = [];
  let match;
  const source = String(html || '');
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const global = new RegExp(regex.source, flags);
  while ((match = global.exec(source))) values.push(match);
  return values;
}

function metaContent(html, name) {
  const tags = allMatches(html, /<meta\b[^>]*>/gi).map((match) => match[0]);
  for (const tag of tags) {
    const named = firstMatch(tag, new RegExp(`\\b(?:name|property)\\s*=\\s*["']${name}["']`, 'i'));
    if (!named && !new RegExp(`\\b(?:name|property)\\s*=\\s*["']${name}["']`, 'i').test(tag)) continue;
    const content = firstMatch(tag, /\bcontent\s*=\s*["']([^"']+)["']/i);
    if (content) return content;
  }
  return '';
}

function hasLinkRel(html, rel) {
  return allMatches(html, /<link\b[^>]*>/gi)
    .map((match) => match[0])
    .some((tag) => new RegExp(`\\brel\\s*=\\s*["'][^"']*\\b${rel}\\b[^"']*["']`, 'i').test(tag) && /\bhref\s*=\s*["'][^"']+["']/i.test(tag));
}

function parseJsonLd(html) {
  const blocks = allMatches(html, /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const parsed = [];
  const errors = [];
  for (const block of blocks) {
    try {
      parsed.push(JSON.parse(block[1].trim()));
    } catch (error) {
      errors.push(error.message);
    }
  }
  return { blocks: parsed, errors, count: blocks.length };
}

function jsonLdTypes(value, output = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => jsonLdTypes(item, output));
  } else if (value && typeof value === 'object') {
    if (value['@type']) {
      const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
      output.push(...types.map(String));
    }
    Object.values(value).forEach((item) => jsonLdTypes(item, output));
  }
  return [...new Set(output)];
}

function robotsPolicy(robotsText, bot) {
  const groups = [];
  let current = null;
  for (const rawLine of String(robotsText || '').split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    if (!line) continue;
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (key === 'user-agent') {
      current = { agents: [value.toLowerCase()], rules: [] };
      groups.push(current);
    } else if (current && (key === 'allow' || key === 'disallow')) {
      current.rules.push({ type: key, path: value });
    }
  }
  const target = String(bot).toLowerCase();
  const matching = groups.filter((group) => group.agents.includes(target));
  const selected = matching.length ? matching : groups.filter((group) => group.agents.includes('*'));
  const blocked = selected.some((group) => group.rules.some((rule) => rule.type === 'disallow' && rule.path === '/'));
  return { blocked, matched: selected.length > 0 };
}

function localLinks(html) {
  return allMatches(html, /<a\b[^>]*href\s*=\s*["']([^"'#?]+)["'][^>]*>/gi)
    .map((match) => match[1].trim())
    .filter((href) => href && !/^(?:https?:|mailto:|tel:|javascript:|\/\/)/i.test(href));
}

function resolveLocalLink(siteDir, href) {
  const cleaned = href.replace(/^\/+/, '');
  const candidate = path.resolve(siteDir, cleaned || 'index.html');
  if (!candidate.startsWith(`${path.resolve(siteDir)}${path.sep}`) && candidate !== path.resolve(siteDir)) return null;
  if (fs.existsSync(candidate)) return candidate;
  if (fs.existsSync(`${candidate}.html`)) return `${candidate}.html`;
  if (fs.existsSync(path.join(candidate, 'index.html'))) return path.join(candidate, 'index.html');
  return null;
}

function check(id, ok, severity, detail) {
  return { id, ok: Boolean(ok), severity, detail };
}

function analyzeSite(siteDir, profile = {}) {
  const activeProfile = { ...DEFAULT_PROFILE, ...profile };
  const root = path.resolve(siteDir);
  const indexFile = path.join(root, 'index.html');
  if (!fs.existsSync(indexFile)) {
    return {
      status: 'fail',
      site_dir: root,
      checks: [check('index-html', false, 'critical', 'index.html is missing.')],
      critical_failures: ['index-html'],
      warnings: [],
    };
  }

  const html = fs.readFileSync(indexFile, 'utf8');
  const text = stripTags(html);
  const firstWords = text.split(/\s+/).slice(0, 300).join(' ');
  const title = firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const lang = firstMatch(html, /<html\b[^>]*\blang\s*=\s*["']([^"']+)["']/i);
  const h1s = allMatches(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi);
  const jsonLd = parseJsonLd(html);
  const schemaTypes = jsonLdTypes(jsonLd.blocks);
  const faqQuestions = allMatches(html, /<(?:h2|h3|summary)\b[^>]*>[^<]*(?:\?|how|what|why|when|where|who)[^<]*<\/(?:h2|h3|summary)>/gi).length;
  const hasFaqSchema = schemaTypes.includes('FAQPage');
  const images = allMatches(html, /<img\b[^>]*>/gi).map((match) => match[0]);
  const realImages = images.filter((tag) => {
    const src = firstMatch(tag, /\bsrc\s*=\s*["']([^"']+)["']/i);
    return src && !/(?:placeholder|placehold\.co|dummy|example\.com|data:image\/svg)/i.test(src);
  });
  const imagesWithAlt = realImages.filter((tag) => /\balt\s*=\s*["'][^"']{2,}["']/i.test(tag));
  const internal = [...new Set(localLinks(html))];
  const brokenInternal = internal.filter((href) => !resolveLocalLink(root, href));
  const robotsFile = path.join(root, 'robots.txt');
  const robotsText = fs.existsSync(robotsFile) ? fs.readFileSync(robotsFile, 'utf8') : '';
  const blockedBots = (activeProfile.required_bots || []).filter((bot) => robotsPolicy(robotsText, bot).blocked);
  const expected = activeProfile.expected_business || {};
  const missingNap = Object.entries(expected)
    .filter(([, value]) => String(value || '').trim())
    .filter(([, value]) => !text.toLowerCase().includes(String(value).trim().toLowerCase()))
    .map(([key]) => key);

  const checks = [
    check('html-lang', Boolean(lang), 'critical', lang ? `Language is ${lang}.` : 'html lang is missing.'),
    check('title', title.length >= 10 && title.length <= 70, 'critical', title ? `Title length is ${title.length}.` : 'Title is missing.'),
    check('meta-description', metaContent(html, 'description').length >= 70, 'critical', 'Meta description should be specific and at least 70 characters.'),
    check('canonical', hasLinkRel(html, 'canonical'), 'critical', 'Canonical link is required.'),
    check('viewport', /<meta\b[^>]*name\s*=\s*["']viewport["'][^>]*>/i.test(html), 'critical', 'Viewport meta is required.'),
    check('single-h1', h1s.length === 1, 'critical', `Expected one H1; found ${h1s.length}.`),
    check('direct-answer', /(?:is|are|helps?|provides?|specializes?|we\s+(?:help|provide|serve|build)|you\s+get)\b/i.test(firstWords), 'critical', 'The first 300 words need a direct definition or answer block.'),
    check('summary-structure', /<(?:ul|ol)\b/i.test(html) || /<h2\b/i.test(html), 'warning', 'Add a scannable summary, list, or section structure.'),
    check('faq', !activeProfile.require_faq || hasFaqSchema || faqQuestions >= 2, 'critical', `FAQ signals found: ${faqQuestions}; FAQPage schema: ${hasFaqSchema}.`),
    check('json-ld', !activeProfile.require_json_ld || (jsonLd.count > 0 && jsonLd.errors.length === 0 && schemaTypes.length > 0), 'critical', `JSON-LD blocks: ${jsonLd.count}; types: ${schemaTypes.join(', ') || 'none'}; parse errors: ${jsonLd.errors.length}.`),
    check('real-images', !activeProfile.require_real_image || realImages.length > 0, 'critical', `Real image candidates: ${realImages.length}.`),
    check('image-alt', !activeProfile.require_real_image || (realImages.length > 0 && imagesWithAlt.length === realImages.length), 'warning', `${imagesWithAlt.length}/${realImages.length} real images have useful alt text.`),
    check('contact-signal', !activeProfile.require_contact_signal || /(?:tel:|mailto:|contact|book|schedule|call\s+(?:us|now|today)|get\s+(?:a\s+)?quote)/i.test(html), 'critical', 'A visible contact or conversion path is required.'),
    check('nap-parity', missingNap.length === 0, 'critical', missingNap.length ? `Missing expected business fields: ${missingNap.join(', ')}.` : 'Expected business identity is present.'),
    check('robots-ai-access', blockedBots.length === 0, 'critical', blockedBots.length ? `Explicitly blocked bots: ${blockedBots.join(', ')}.` : 'No required AI bot is explicitly blocked.'),
    check('internal-links', internal.length >= Number(activeProfile.min_internal_links || 0) && brokenInternal.length === 0, 'critical', `Internal links: ${internal.length}; broken: ${brokenInternal.join(', ') || 'none'}.`),
    check('placeholder-copy', !/(?:lorem ipsum|your business name|replace this|coming soon|todo:|example phone)/i.test(text), 'critical', 'Placeholder copy must be removed.'),
  ];

  const criticalFailures = checks.filter((item) => !item.ok && item.severity === 'critical').map((item) => item.id);
  const warnings = checks.filter((item) => !item.ok && item.severity === 'warning').map((item) => item.id);
  const status = criticalFailures.length || (activeProfile.block_on_warnings && warnings.length) ? 'fail' : warnings.length ? 'pass-with-warnings' : 'pass';
  return {
    status,
    site_dir: root,
    checked_at: nowISO(),
    checks,
    critical_failures: criticalFailures,
    warnings,
    metrics: {
      schema_types: schemaTypes,
      faq_questions: faqQuestions,
      real_images: realImages.length,
      internal_links: internal.length,
    },
  };
}

function renderReport(result, profileFile) {
  const rows = result.checks.map((item) => `| ${item.ok ? 'PASS' : 'FAIL'} | ${item.id} | ${item.severity} | ${item.detail.replace(/\|/g, '\\|')} |`).join('\n');
  return `---
note_type: review
status: ${result.status === 'fail' ? 'active' : 'done'}
created: ${result.checked_at.slice(0, 10)}
updated: ${result.checked_at.slice(0, 10)}
owner: Dillon Mohr
verification_status: ${result.status === 'fail' ? 'disputed' : 'verified'}
source_refs:
  - "${path.relative(REPO_ROOT, result.site_dir).replace(/\\/g, '/')}"
tags:
  - brain
  - review
  - aeo
  - website-qa
---

# AEO and trust gate

**Verdict: ${result.status.toUpperCase()}**

- Site: \`${path.relative(REPO_ROOT, result.site_dir).replace(/\\/g, '/')}\`
- Profile: \`${profileFile ? path.relative(REPO_ROOT, profileFile).replace(/\\/g, '/') : 'built-in default'}\`
- Critical failures: ${result.critical_failures.join(', ') || 'none'}
- Warnings: ${result.warnings.join(', ') || 'none'}

| Result | Check | Severity | Evidence |
|---|---|---|---|
${rows}

## Deployment contract

A failing result blocks deployment. A passing result is necessary but does not
replace visual review, functional QA, maker/checker separation, or the mapped
Netlify target verification.
`;
}

function runAeoTrustGate(siteDir, options = {}) {
  const profileFile = options.profile ? path.resolve(options.profile) : null;
  const profile = profileFile ? readJson(profileFile, {}) : {};
  const result = analyzeSite(path.resolve(siteDir), profile);
  const stateFile = repoPath('12_Brain/state/aeo-trust-gate.json');
  const reportFile = repoPath('Daily-Briefs/aeo-trust-report.md');
  writeJson(stateFile, { ...result, profile_file: profileFile, report_file: path.relative(REPO_ROOT, reportFile) });
  ensureDir(path.dirname(reportFile));
  fs.writeFileSync(reportFile, renderReport(result, profileFile), 'utf8');
  enqueue('aeo-trust-gate', 'evaluated', {
    status: result.status,
    site_dir: path.relative(REPO_ROOT, result.site_dir),
    critical_failures: result.critical_failures,
  });
  return { ...result, state_file: stateFile, report_file: reportFile };
}

module.exports = {
  DEFAULT_PROFILE,
  stripTags,
  parseJsonLd,
  robotsPolicy,
  analyzeSite,
  runAeoTrustGate,
};
