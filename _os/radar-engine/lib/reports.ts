'use strict';

const fs = require('fs');
const path = require('path');
const { cssVariables, lockup, LOCKUP_CSS, markDataUri } = require('../../automation/lib/brand');
const { escapeHtml, containsPii } = require('./redact.ts');
const { validateNarrative } = require('./claims.ts');
const { paraphraseAllowed } = require('./claims.ts');
const { safePathJoin } = require('./ssrf.ts');
const { token } = require('./ids.ts');

function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    try {
      return require(path.join(__dirname, '..', 'node_modules', 'playwright'));
    } catch {
      return null;
    }
  }
}

function storageAdapter(cfg) {
  const root = cfg.storageDir;
  const kind = cfg.storage || 'fs';
  const liveObject = kind === 'object' && cfg.s3Bucket && process.env.AWS_ACCESS_KEY_ID && process.env.RADAR_V2_OBJECT_LIVE === 'true';
  return {
    kind: liveObject ? 'object-live-blocked' : kind,
    async put(rel, bytes, contentType = 'application/octet-stream') {
      const abs = safePathJoin(root, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, bytes);
      if (kind === 'object') {
        return {
          ref: `object://${rel}`,
          contentType,
          path: abs,
          dryRun: !liveObject,
          note: liveObject
            ? 'live object put is blocked until a provider is approved'
            : 'object adapter writes the private filesystem; S3 stays off',
        };
      }
      return { ref: abs, contentType };
    },
    async get(ref) {
      if (!ref) throw new Error('missing storage ref');
      if (String(ref).startsWith('object://')) {
        const rel = String(ref).slice('object://'.length);
        return fs.readFileSync(safePathJoin(root, rel));
      }
      const abs = path.resolve(String(ref));
      const allowed = [
        path.resolve(root),
        path.resolve(__dirname, '..', 'artifacts'),
      ];
      const ok = allowed.some((base) => abs === base || abs.startsWith(base + path.sep));
      if (!ok) throw new Error('storage get refused outside storage root');
      return fs.readFileSync(abs);
    },
  };
}

function sectionHtml(title, body) {
  return `<section class="mod"><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

function scoreRow(label, value) {
  const n = value == null ? '—' : String(value);
  return `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(n)}</td></tr>`;
}

function findingsFor(manifest, section) {
  return (manifest.findings || []).filter((f) => f.section === section);
}

function findingHtml(f) {
  return `<article class="find">
    <p class="claim">${escapeHtml(paraphraseAllowed(f))}</p>
    <p class="meta"><span>${escapeHtml(f.type)}</span> · confidence ${Math.round(f.confidence * 100)}% · ${escapeHtml(f.severity)}</p>
    <p>${escapeHtml(f.why_it_matters)}</p>
    <p class="act">${escapeHtml(f.recommended_action)}</p>
  </article>`;
}

function renderReportHtml(manifest, { reportUrl, bookingUrl, config }) {
  const p = manifest.prospect;
  const observed = manifest.observed_at.slice(0, 10);
  const mods = new Set(manifest.modules || []);
  const narrative = (manifest.findings || []).map((f) => paraphraseAllowed(f)).join(' ');
  const claimCheck = validateNarrative(manifest, narrative);
  if (!claimCheck.ok) {
    throw new Error(`unsupported claims in narrative: ${JSON.stringify(claimCheck.unsupported)}`);
  }

  const parts = [];
  parts.push(`<header class="cover">
    ${lockup({ size: 36, subtitle: 'Private marketing audit' })}
    <p class="kicker">Confidential · ${escapeHtml(observed)}</p>
    <h1>${escapeHtml(p.business_name)}</h1>
    <p class="lede">${escapeHtml(p.website || '')} · ${escapeHtml([p.city, p.state].filter(Boolean).join(', '))}</p>
    <p class="ids">Audit ${escapeHtml(manifest.audit_id)} · Score ${escapeHtml(manifest.score_version)}</p>
  </header>`);

  if (mods.has('executive_summary')) {
    const offer = manifest.selected_offer || 'needs review';
    const sqs = manifest.scores.site_quality_score;
    parts.push(sectionHtml('Executive summary', `
      <p>This audit measured the public homepage for ${escapeHtml(p.business_name)}. Site Quality Score is ${escapeHtml(sqs == null ? 'ungraded' : String(sqs))}. The highest eligible offer is <strong>${escapeHtml(offer)}</strong>, not simply the highest raw score.</p>
      <p>Rebuild is only on the table when a hard fault is proven. Strong verified websites are not offered a redesign.</p>
    `));
  }

  if (mods.has('opportunity_scorecard')) {
    const s = manifest.scores;
    parts.push(sectionHtml('Opportunity scorecard', `
      <table class="scores">
        ${scoreRow('Site Quality Score', s.site_quality_score)}
        ${scoreRow('Opportunity Score', s.opportunity_score)}
        ${scoreRow('Rebuild opportunity', s.rebuild_opportunity)}
        ${scoreRow('SEO / AEO opportunity', s.seo_aeo_opportunity)}
        ${scoreRow('Local opportunity', s.local_opportunity)}
        ${scoreRow('Paid opportunity', s.paid_opportunity)}
        ${scoreRow('Conversion opportunity', s.conversion_opportunity)}
        ${scoreRow('Market fit', s.market_fit_score)}
        ${scoreRow('Contactability', s.contactability_score)}
        ${scoreRow('Audit confidence', s.audit_confidence)}
        ${scoreRow('Priority', s.priority_score)}
      </table>
      <p class="note">Each score stores components and explanations in the snapshot. Review volume is a fit signal, not proof of budget.</p>
    `));
  }

  const named = [
    ['website_technical_seo', 'Website and technical SEO'],
    ['search_architecture', 'Search architecture and on-page SEO'],
    ['local_seo', 'Local SEO and reputation'],
    ['competitive_positioning', 'Competitive positioning'],
    ['conversion_trust', 'Conversion and trust'],
    ['paid_media', 'Paid-media opportunity'],
    ['content_aeo', 'Content and AI / AEO readiness'],
  ];
  for (const [key, title] of named) {
    if (!mods.has(key)) continue;
    const fs = findingsFor(manifest, key);
    if (!fs.length) continue;
    parts.push(sectionHtml(title, fs.map(findingHtml).join('')));
  }

  if (mods.has('roadmap_90_day')) {
    const fs = findingsFor(manifest, 'roadmap_90_day');
    parts.push(sectionHtml('Prioritized 90-day roadmap', `
      ${fs.map(findingHtml).join('')}
      <ol>
        <li>Fix proven hard faults or confirm the site is strong enough to keep.</li>
        <li>Close the highest eligible offer: ${escapeHtml(manifest.selected_offer || 'review')}.</li>
        <li>Only then consider paid media, and only if the site can hold the click.</li>
      </ol>
    `));
  }

  parts.push(sectionHtml('Sources, limitations and next step', `
    <ul>${(manifest.limitations || []).map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>
    <p><strong>Private analytics/CMS access required</strong> before any traffic, conversion, or spend claim.</p>
    <p><a class="cta" href="${escapeHtml(bookingUrl)}">Book a walkthrough with ${escapeHtml(config.contactName)}</a></p>
    <p class="contact">${escapeHtml(config.contactName)} · <a href="${escapeHtml(config.contactUrl)}">${escapeHtml(config.contactUrl)}</a> · ${escapeHtml(config.contactEmail)}</p>
    <h3>Source appendix</h3>
    <ol class="src">${(manifest.evidence || []).map((e) => `
      <li><code>${escapeHtml(e.id)}</code> · ${escapeHtml(e.source)} · ${escapeHtml(e.classification)} · ${escapeHtml(e.metric)} · ${escapeHtml(e.captured_at)}</li>
    `).join('')}</ol>
  `));

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${escapeHtml(p.business_name)} · ${escapeHtml(config.brandName)} audit</title>
  <style>
    ${cssVariables({ theme: 'light', followSystem: false })}
    ${LOCKUP_CSS}
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--fg); font-family: var(--sans); line-height: 1.5; }
    main { max-width: 860px; margin: 0 auto; padding: 32px 20px 80px; }
    .cover { background: var(--panel); border: 1px solid var(--rule); padding: 28px; border-radius: 16px; }
    h1 { font-family: var(--display); font-size: clamp(28px, 4vw, 42px); margin: 12px 0 8px; }
    h2 { font-family: var(--display); font-size: 22px; margin: 0 0 12px; }
    .kicker, .ids, .meta, .note, .contact { color: var(--fg-mid); font-size: 13px; }
    .mod { background: var(--panel); border: 1px solid var(--rule); border-radius: 16px; padding: 22px; margin-top: 18px; }
    .find { border-top: 1px solid var(--rule); padding-top: 12px; margin-top: 12px; }
    .claim { font-weight: 650; }
    .act { color: var(--brand-ink); }
    table.scores { width: 100%; border-collapse: collapse; }
    table.scores th { text-align: left; padding: 6px 0; color: var(--fg-mid); font-weight: 550; }
    table.scores td { text-align: right; font-variant-numeric: tabular-nums; }
    .cta { display: inline-block; background: var(--brand-fill); color: var(--on-brand); text-decoration: none; padding: 12px 18px; border-radius: 999px; font-weight: 650; }
    .src { font-size: 12px; color: var(--fg-mid); }
    @media (max-width: 640px) { main { padding: 16px 12px 48px; } }
  </style>
</head>
<body>
  <main id="main">${parts.join('\n')}</main>
</body>
</html>`;

  const pii = containsPii(html, { allowAgencyEmail: true });
  return { html, claimCheck, pii };
}

function checkReport(html, manifest) {
  const fails = [];
  if (!/noindex/i.test(html)) fails.push('missing noindex');
  if (!/Source appendix/i.test(html)) fails.push('missing source appendix');
  if (!/Private analytics\/CMS access required/i.test(html)) fails.push('missing limitation language');
  if (!/NeedMomentum|needmomentum/i.test(html)) fails.push('missing Momentum identity');
  if (/lorem ipsum|TODO|placeholder copy|\[insert/i.test(html)) fails.push('placeholder copy');
  if (/[\u2014]/g.test(html)) fails.push('em dash in customer-facing copy');
  const pii = containsPii(html, { allowAgencyEmail: true });
  if (pii.leaked) fails.push('pii leakage');
  const pagesGuess = Math.max(1, Math.round(html.length / 3500));
  if (pagesGuess < 1) fails.push('blank pages');
  if (!manifest.evidence?.length) fails.push('missing sources');
  return {
    ok: fails.length === 0,
    fails,
    page_count_estimate: pagesGuess,
    pii,
  };
}

async function renderPdf(html, outPath) {
  const playwright = loadPlaywright();
  if (!playwright) return { ok: false, reason: 'playwright not installed', path: null };
  const browser = await playwright.chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({
      path: outPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' },
    });
    return { ok: true, path: outPath };
  } finally {
    await browser.close();
  }
}

async function visualCheck(html) {
  const playwright = loadPlaywright();
  if (!playwright) return { ok: false, reason: 'playwright not installed', shots: [] };
  const browser = await playwright.chromium.launch({ headless: true });
  const shots = [];
  try {
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.setContent(html, { waitUntil: 'load' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
      const blank = await page.evaluate(() => !document.body.innerText.trim());
      shots.push({ width, overflow, blank });
      await page.close();
    }
    return { ok: shots.every((s) => !s.overflow && !s.blank), shots };
  } finally {
    await browser.close();
  }
}

function reportAccessible(report, now = new Date()) {
  if (!report || report.revoked_at) return false;
  if (report.expires_at && new Date(report.expires_at) < now) return false;
  return true;
}

module.exports = {
  storageAdapter,
  loadPlaywright,
  renderReportHtml,
  checkReport,
  renderPdf,
  visualCheck,
  reportAccessible,
  token,
  markDataUri,
};
