'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { markDataUri } = require('../../automation/lib/brand');
const { escapeHtml, containsPii } = require('./redact.ts');
const { validateNarrative } = require('./claims.ts');
const { paraphraseAllowed } = require('./claims.ts');
const { safePathJoin } = require('./ssrf.ts');
const { token } = require('./ids.ts');
const momentumLogoDataUri = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, '../assets/need-momentum-logo.png')).toString('base64')}`;

// Brand faces already in this repo (latin subsets), embedded so neither the PDF
// nor the hosted report ever fetches a font. Nunito Sans is the variable face.
const FONT_DIR = path.join(__dirname, '../../automation/paper-craft-video/assets/fonts');
const fontUri = (file) => `data:font/woff2;base64,${fs.readFileSync(path.join(FONT_DIR, file)).toString('base64')}`;
const FONT_CSS = `@font-face{font-family:"Archivo Black";font-weight:400;font-display:block;src:url(${fontUri('archivo-black-400-2.woff2')}) format("woff2")}
@font-face{font-family:"Nunito Sans";font-weight:200 1000;font-display:block;src:url(${fontUri('nunito-sans-400-7.woff2')}) format("woff2")}`;

// The Momentum design system is the only token source. It is read at render
// time and never copied into this repo, so a token change reaches the next report.
function designTokensCss() {
  const file = process.env.MOMENTUM_TOKENS_CSS
    || path.join(os.homedir(), 'Documents', 'Codex', 'momentum-design-system', 'tokens.css');
  let css;
  try {
    css = fs.readFileSync(file, 'utf8');
  } catch {
    throw new Error(`Momentum design tokens not found at ${file}; set MOMENTUM_TOKENS_CSS`);
  }
  return css.replace(/\/\*[\s\S]*?\*\//g, ''); // internal notes stay out of customer HTML
}

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

const esc = escapeHtml;
const SEVERITY = { high: 'High', medium: 'Medium', low: 'Low', info: 'Info' };
const sevKey = (s) => (SEVERITY[s] ? s : 'info');
const humanize = (s) => {
  const t = String(s || '').replace(/_/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const pad2 = (n) => String(n).padStart(2, '0');

function findingsFor(manifest, section) {
  return (manifest.findings || []).filter((f) => f.section === section);
}

function scoreValue(v) {
  if (v == null || v === '') return { text: 'Not scored', pct: null };
  const n = Number(v);
  return { text: String(v), pct: Number.isFinite(n) && n >= 0 && n <= 100 ? n : null };
}

function meter(pct) {
  return pct == null ? '' : `<span class="meter" aria-hidden="true"><span style="width:${pct}%"></span></span>`;
}

function head(num, title, aside = '', id = '') {
  return `<header class="mod__head">
    <p class="mod__num" aria-hidden="true">${pad2(num)}</p>
    <h2${id ? ` id="${id}"` : ''}>${esc(title)}</h2>
    ${aside ? `<p class="mod__aside">${esc(aside)}</p>` : ''}
  </header>`;
}

function findingHtml(f, srcNum) {
  const refs = (f.evidence_ids || []).map((id) => srcNum.get(id)).filter(Boolean);
  return `<article class="find">
    <div class="find__rail">
      <p class="sev sev--${sevKey(f.severity)}"><span class="sev__mark" aria-hidden="true"></span>${esc(SEVERITY[f.severity] || humanize(f.severity || 'info'))}</p>
      <p class="find__meta">${esc(humanize(f.type))}<br>Confidence ${Math.round(f.confidence * 100)}%${refs.length ? `<br>Source${refs.length > 1 ? 's' : ''} ${refs.join(', ')}` : ''}</p>
    </div>
    <div class="find__body">
      <p class="claim">${esc(paraphraseAllowed(f))}</p>
      <p class="why">${esc(f.why_it_matters)}</p>
      <p class="act"><span class="act__label">Recommended action</span>${esc(f.recommended_action)}</p>
    </div>
  </article>`;
}

// Heading and first item travel together so no page ends on a bare heading.
// A lead block (the roadmap plan) sits between the heading and the first finding.
function findingsSection(num, title, list, srcNum, lead = '', extra = '') {
  const items = list.map((f) => findingHtml(f, srcNum));
  const first = lead + (items.shift() || '');
  const count = list.length ? `${list.length} finding${list.length === 1 ? '' : 's'}` : '';
  return `<section class="mod mod--findings ${extra}">
    <div class="keep">${head(num, title, count)}${first}</div>
    ${items.join('')}
  </section>`;
}

function steps(items) {
  return `<ol class="steps">${items.map((t, i) => `<li><span class="steps__n" aria-hidden="true">${pad2(i + 1)}</span><span>${esc(t)}</span></li>`).join('')}</ol>`;
}

function prospectLabel(prospect) {
  const name = String(prospect.business_name || '').trim();
  if (name) return name;
  try {
    return `Website audit · ${new URL(prospect.website).hostname}`;
  } catch {
    return 'Website audit';
  }
}

function renderReportHtml(manifest, { reportUrl, bookingUrl, config }) {
  const logo = momentumLogoDataUri;
  const p = manifest.prospect;
  const label = prospectLabel(p);
  const observed = manifest.observed_at.slice(0, 10);
  const mods = new Set(manifest.modules || []);
  const findings = manifest.findings || [];
  const scores = manifest.scores || {};
  const evidence = manifest.evidence || [];
  const srcNum = new Map(evidence.map((e, i) => [e.id, i + 1]));
  const narrative = findings.map((f) => paraphraseAllowed(f)).join(' ');
  const claimCheck = validateNarrative(manifest, narrative);
  if (!claimCheck.ok) {
    throw new Error(`unsupported claims in narrative: ${JSON.stringify(claimCheck.unsupported)}`);
  }
  const tokensCss = designTokensCss();

  const body = [];
  const toc = [];
  const add = (title, html) => {
    toc.push(title);
    body.push(html(toc.length));
  };

  if (mods.has('executive_summary')) {
    const sqs = scores.site_quality_score;
    const tally = Object.keys(SEVERITY)
      .map((k) => [k, findings.filter((f) => sevKey(f.severity) === k).length])
      .filter(([, n]) => n);
    add('Executive summary', (n) => `<section class="mod mod--summary">
      <div class="keep">${head(n, 'Executive summary')}
      <div class="summary${tally.length ? '' : ' summary--solo'}">
        <div class="summary__text">
          <p class="lead">This review examines the public homepage at ${esc(p.website || 'the submitted website')}. Its Site Quality Score is ${esc(sqs == null ? 'ungraded' : String(sqs))}. Scores summarize the checks in this report; they are not search-engine rankings or forecasts.</p>
          <p>Start with the documented issues and recommended actions below. Any larger redesign should follow a confirmed need and an agreed scope.</p>
        </div>
        ${tally.length ? `<aside class="tally" aria-label="Findings by severity">
          <p class="tally__label">Findings by severity</p>
          <ul>${tally.map(([k, c]) => `<li><span class="sev sev--${k}"><span class="sev__mark" aria-hidden="true"></span>${SEVERITY[k]}</span><b>${c}</b></li>`).join('')}</ul>
        </aside>` : ''}
      </div></div>
    </section>`);
  }

  if (mods.has('opportunity_scorecard')) {
    const row = ([lbl, key]) => {
      const v = scoreValue(scores[key]);
      return `<li><p class="score__row"><span>${esc(lbl)}</span><b${v.text === 'Not scored' ? ' class="is-empty"' : ''}>${esc(v.text)}</b></p>${meter(v.pct)}</li>`;
    };
    const hero = ([lbl, key]) => {
      const v = scoreValue(scores[key]);
      return `<div class="hero-score"><p class="hero-score__label">${esc(lbl)}</p><p class="hero-score__value${v.text === 'Not scored' ? ' is-empty' : ''}">${esc(v.text)}</p>${meter(v.pct)}</div>`;
    };
    add('Opportunity scorecard', (n) => `<section class="mod mod--scores">
      ${head(n, 'Opportunity scorecard')}
      <div class="scores-hero">${[['Site Quality Score', 'site_quality_score'], ['Opportunity Score', 'opportunity_score']].map(hero).join('')}</div>
      <div class="scores-grid">
        <div><p class="scores__group">Opportunity by area</p><ul class="scores">${[
          ['Rebuild opportunity', 'rebuild_opportunity'],
          ['SEO / AEO opportunity', 'seo_aeo_opportunity'],
          ['Local opportunity', 'local_opportunity'],
          ['Paid opportunity', 'paid_opportunity'],
          ['Conversion opportunity', 'conversion_opportunity'],
        ].map(row).join('')}</ul></div>
        <div><p class="scores__group">Audit signals</p><ul class="scores">${[
          ['Market fit', 'market_fit_score'],
          ['Contactability', 'contactability_score'],
          ['Audit confidence', 'audit_confidence'],
          ['Priority', 'priority_score'],
        ].map(row).join('')}</ul></div>
      </div>
      <p class="note">Each score stores components and explanations in the snapshot. Review volume is a fit signal, not proof of budget.</p>
    </section>`);
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
    const list = findingsFor(manifest, key);
    if (!list.length) continue;
    add(title, (n) => findingsSection(n, title, list, srcNum));
  }

  if (mods.has('roadmap_90_day')) {
    const title = 'Prioritized 90-day roadmap';
    const plan = `<div class="plan">${steps([
      'Fix proven hard faults or confirm the site is strong enough to keep.',
      'Agree on the highest-priority improvements, their owners and how success will be checked.',
      'Only then consider paid media, and only if the site can hold the click.',
    ])}</div>`;
    add(title, (n) => findingsSection(n, title, findingsFor(manifest, 'roadmap_90_day'), srcNum, plan, 'mod--roadmap'));
  }

  add('Sources and limitations', (n) => `<section class="mod mod--sources">
    <div class="keep">${head(n, 'Sources and limitations', evidence.length ? `${evidence.length} source${evidence.length === 1 ? '' : 's'}` : '')}
      <ul class="limits">${(manifest.limitations || []).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
      <p class="access"><strong>Private analytics/CMS access required</strong> before any traffic, conversion, or spend claim.</p>
    </div>
    <h3>Source appendix</h3>
    <ol class="src">${evidence.map((e) => `<li>
      <p class="src__id"><code>${esc(e.id)}</code></p>
      <p class="src__line"><b>${esc(e.source)}</b> · ${esc(e.classification)} · <span class="nw">${esc(e.captured_at)}</span></p>
      <p class="src__metric"><code>${esc(e.metric)}</code></p>
    </li>`).join('')}</ol>
  </section>`);

  const sqs = scoreValue(scores.site_quality_score);
  const place = [p.city, p.state].filter(Boolean).join(', ');
  const cover = `<header class="cover">
    <div class="cover__top">
      <img class="brand-logo" src="${logo}" alt="Momentum Digital" width="260">
      <div class="cover__stamp">
        <p class="report-brand">Momentum Digital · Private marketing audit</p>
        <p class="kicker">Confidential · ${esc(observed)}</p>
      </div>
    </div>
    <div class="cover__main">
      <p class="eyebrow">Prepared for</p>
      <h1${label.length > 80 ? ' class="is-longer"' : label.length > 40 ? ' class="is-long"' : ''}>${esc(label)}</h1>
      <p class="lede">${[p.website ? `<span class="site">${esc(p.website)}</span>` : '', esc(place)].filter(Boolean).join(' · ')}</p>
      <div class="cover__foot">
        <div class="cover__score">
          <p class="cover__label">Site Quality Score</p>
          <p class="cover__value${sqs.text === 'Not scored' ? ' is-empty' : ''}">${esc(sqs.text === 'Not scored' ? 'Ungraded' : sqs.text)}</p>
          ${meter(sqs.pct)}
        </div>
        <nav class="cover__toc" aria-label="In this report">
          <p class="cover__label">In this report</p>
          <ol>${toc.map((t, i) => `<li><span class="toc__n">${pad2(i + 1)}</span>${esc(t)}</li>`).join('')}<li><span class="toc__n" aria-hidden="true"></span>Next steps</li></ol>
        </nav>
      </div>
      <p class="ids">Audit ${esc(manifest.audit_id)} · Score ${esc(manifest.score_version)}</p>
    </div>
  </header>`;

  const closing = `<section class="mod next-steps" aria-labelledby="next-steps-title">
    <div class="close__main">
      <p class="eyebrow">Next steps</p>
      <h2 id="next-steps-title">Turn the findings into a practical plan.</h2>
      <p class="lead">Bring this report to a walkthrough with Momentum Digital. We can discuss the evidence, confirm what needs deeper access and decide which improvements fit your business.</p>
      <div class="close__cta">
        <a class="cta" href="${esc(bookingUrl)}">Discuss your website audit</a>
        <p class="contact"><a href="${esc(config.contactUrl)}">${esc(config.contactUrl)}</a><br>${esc(config.contactEmail)}</p>
      </div>
    </div>
    <div class="close__detail">
      <div>
        <h3>What to discuss</h3>
        ${steps([
          'Confirm the most important issue and its effect on the customer journey.',
          'Choose a focused scope, responsibilities and a way to measure the work.',
          'Agree on access and review steps before changes are made.',
        ])}
      </div>
      <div>
        <h3>Why work with Momentum Digital?</h3>
        <p>Our services span websites, local search, content and digital advertising. That gives you a way to discuss connected problems with one team and choose the work your business needs.</p>
      </div>
    </div>
    <div class="close__sign">
      <img class="brand-logo" src="${logo}" alt="Momentum Digital" width="260">
      <p class="note">This report is a starting point for discussion. It does not guarantee rankings, traffic, leads or revenue. No changes to your website have been made by this report.</p>
    </div>
  </section>`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${esc(label)} · ${esc(config.brandName)} audit</title>
  <style>
    ${tokensCss}
    ${FONT_CSS}
    @page {
      size: Letter; margin: 17mm 18mm 20mm; background: var(--m-paper);
      @bottom-left { content: "Momentum Digital · Private marketing audit"; font-family: var(--m-font-text); font-size: var(--m-fs-xs); font-weight: 700; letter-spacing: .04em; color: var(--m-muted); vertical-align: top; padding-top: 7mm; }
      @bottom-right { content: "Page " counter(page) " of " counter(pages); font-family: var(--m-font-text); font-size: var(--m-fs-xs); font-weight: 700; color: var(--m-muted); vertical-align: top; padding-top: 7mm; }
    }
    @page cover { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
    @page closing { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }

    *, *::before, *::after { box-sizing: border-box; }
    html { background: var(--m-paper); color: var(--m-ink); font-family: var(--m-font-text); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; font-size: var(--m-fs-body); line-height: var(--m-lh-body); }
    h1, h2, h3 { font-family: var(--m-font-display); font-weight: var(--m-weight-display); line-height: var(--m-lh-head); letter-spacing: var(--m-track-display); margin: 0; text-wrap: balance; }
    p, ul, ol { margin: 0; }
    p { orphans: 3; widows: 3; }
    a { color: var(--m-brand); overflow-wrap: anywhere; }
    a:focus-visible { outline: var(--m-focus-ring); outline-offset: var(--m-focus-offset); }
    code { font-family: var(--m-font-mono); font-size: .92em; }
    .brand-logo { display: block; height: auto; max-width: 100%; }
    .eyebrow, .kicker, .mod__aside, .sev, .act__label, .tally__label, .scores__group, .cover__label, .hero-score__label {
      font-size: var(--m-fs-xs); font-weight: 800; letter-spacing: var(--m-track-caps); text-transform: uppercase;
    }
    main { max-width: 62rem; margin: 0 auto; padding-bottom: var(--m-s-8); }

    .cover__top { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--m-s-5); padding: var(--m-s-7) var(--m-gutter) var(--m-s-6); }
    .cover__top .brand-logo { width: 17rem; }
    .cover__stamp { text-align: right; }
    .report-brand { font-weight: 800; color: var(--m-brand); font-size: var(--m-fs-sm); }
    .kicker { color: var(--m-muted); margin-top: var(--m-s-1); }
    .cover__main { background: var(--m-deep); color: var(--m-on-deep); padding: var(--m-s-8) var(--m-gutter); display: flex; flex-direction: column; gap: var(--m-s-5); }
    .cover__main .eyebrow { color: var(--m-signal); }
    .cover h1 { font-size: var(--m-fs-display); line-height: var(--m-lh-display); overflow-wrap: anywhere; max-width: 16ch; }
    .cover h1.is-long { font-size: var(--m-fs-h1); line-height: var(--m-lh-head); max-width: 22ch; }
    .cover h1.is-longer { font-size: var(--m-fs-h2); line-height: var(--m-lh-head); max-width: 30ch; }
    .lede { color: var(--m-on-deep-muted); font-size: var(--m-fs-lead); overflow-wrap: anywhere; }
    .lede .site { color: var(--m-brand-lift); font-weight: 700; }
    .cover__foot { margin-top: var(--m-s-7); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr); gap: var(--m-s-6); align-items: end; }
    .cover__score { background: var(--m-deep-raised); border-radius: var(--m-r-md); padding: var(--m-s-5) var(--m-s-6) var(--m-s-6); box-shadow: var(--m-block-sm) var(--m-block-tint); }
    .cover__label { color: var(--m-on-deep-muted); }
    .cover__value { font-family: var(--m-font-display); font-size: var(--m-fs-h1); line-height: 1; margin-top: var(--m-s-3); }
    .cover__score .meter { background: var(--m-deep); }
    .cover__score .meter > span { background: var(--m-signal); }
    .cover__toc ol { list-style: none; padding: 0; margin-top: var(--m-s-3); }
    .cover__toc li { display: flex; gap: var(--m-s-3); padding: var(--m-s-2) 0; border-top: 1px solid var(--m-deep-raised); font-weight: 700; font-size: var(--m-fs-sm); }
    .toc__n { color: var(--m-signal); font-weight: 800; min-width: 1.75rem; font-variant-numeric: tabular-nums; }
    .ids { color: var(--m-on-deep-muted); font-size: var(--m-fs-xs); overflow-wrap: anywhere; padding-top: var(--m-s-4); border-top: 1px solid var(--m-deep-raised); }

    .meter { display: block; height: .375rem; margin-top: var(--m-s-3); border-radius: var(--m-r-pill); background: var(--m-deep-raised); overflow: hidden; }
    .meter > span { display: block; height: 100%; border-radius: var(--m-r-pill); background: var(--m-brand-lift); }

    .mod { padding: var(--m-s-8) var(--m-gutter) 0; }
    .mod__head { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: baseline; gap: var(--m-s-4); padding-bottom: var(--m-s-4); margin-bottom: var(--m-s-5); border-bottom: 2px solid var(--m-ink); }
    .mod__num { font-family: var(--m-font-display); font-size: var(--m-fs-h3); line-height: 1; color: var(--m-signal-ink); }
    .mod__head h2 { font-size: var(--m-fs-h2); }
    .mod__aside { color: var(--m-muted); white-space: nowrap; }

    .summary { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: var(--m-s-7); align-items: start; }
    .summary--solo { grid-template-columns: minmax(0, 1fr); }
    .summary__text { max-width: var(--m-measure); }
    .summary__text .lead { font-size: var(--m-fs-lead); line-height: 1.5; overflow-wrap: anywhere; }
    .summary__text p + p { margin-top: var(--m-s-4); }
    .tally { background: var(--m-panel); border-radius: var(--m-r-md); padding: var(--m-s-5); }
    .tally__label { color: var(--m-muted); }
    .tally ul { list-style: none; padding: 0; margin-top: var(--m-s-3); }
    .tally li { display: flex; justify-content: space-between; align-items: center; padding: var(--m-s-2) 0; border-top: 1px solid var(--m-line); }
    .tally b { font-family: var(--m-font-display); font-weight: var(--m-weight-display); font-size: var(--m-fs-h3); line-height: 1; }

    .sev { display: inline-flex; align-items: center; gap: var(--m-s-2); color: var(--m-ink); }
    .sev__mark { width: .625rem; height: .625rem; border-radius: var(--m-r-pill); flex: none; }
    .sev--high .sev__mark { background: var(--m-signal); }
    .sev--medium .sev__mark { background: var(--m-brand); }
    .sev--low .sev__mark { background: var(--m-line-strong); }
    .sev--info .sev__mark { box-shadow: inset 0 0 0 2px var(--m-line-strong); }

    .mod--scores { background: var(--m-deep); color: var(--m-on-deep); border-radius: var(--m-r-md); padding: var(--m-s-7) var(--m-s-7) var(--m-s-6); margin-top: var(--m-s-8); }
    .mod--scores .mod__head { border-bottom-color: var(--m-deep-raised); }
    .mod--scores .mod__num { color: var(--m-signal); }
    .scores-hero { display: grid; grid-template-columns: 1fr 1fr; gap: var(--m-s-5); }
    .hero-score { background: var(--m-deep-raised); border-radius: var(--m-r-md); padding: var(--m-s-5); }
    .hero-score__label, .scores__group { color: var(--m-on-deep-muted); }
    .hero-score__value { font-family: var(--m-font-display); font-size: var(--m-fs-h1); line-height: 1; margin-top: var(--m-s-3); }
    .hero-score__value.is-empty, .cover__value.is-empty { font-size: var(--m-fs-h3); }
    .hero-score .meter { background: var(--m-deep); }
    .hero-score .meter > span { background: var(--m-signal); }
    .scores-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--m-s-7); margin-top: var(--m-s-6); }
    .scores { list-style: none; padding: 0; margin-top: var(--m-s-2); }
    .scores li { padding: var(--m-s-3) 0; border-top: 1px solid var(--m-deep-raised); }
    .score__row { display: flex; justify-content: space-between; gap: var(--m-s-3); font-size: var(--m-fs-sm); }
    .score__row b { font-weight: 800; font-variant-numeric: tabular-nums; }
    .score__row b.is-empty { font-weight: 400; color: var(--m-on-deep-muted); }
    .scores .meter { height: .25rem; margin-top: var(--m-s-2); }
    .mod--scores .note { color: var(--m-on-deep-muted); font-size: var(--m-fs-xs); margin-top: var(--m-s-5); }

    .find { display: grid; grid-template-columns: 8.5rem minmax(0, 1fr); gap: var(--m-s-6); padding: var(--m-s-5) 0; border-top: 1px solid var(--m-line); }
    .mod__head + .find { border-top: 0; padding-top: 0; }
    .find__meta { color: var(--m-muted); font-size: var(--m-fs-xs); line-height: 1.55; margin-top: var(--m-s-2); }
    .claim { font-size: var(--m-fs-lead); font-weight: 800; line-height: 1.35; overflow-wrap: anywhere; }
    .why { margin-top: var(--m-s-2); overflow-wrap: anywhere; }
    .act { margin-top: var(--m-s-4); padding: var(--m-s-3) var(--m-s-4); background: var(--m-panel); border-left: 3px solid var(--m-brand); border-radius: 0 var(--m-r-sm) var(--m-r-sm) 0; overflow-wrap: anywhere; }
    .act__label { display: block; color: var(--m-brand); margin-bottom: var(--m-s-1); }

    .steps { list-style: none; padding: 0; }
    .steps li { display: grid; grid-template-columns: 3rem minmax(0, 1fr); gap: var(--m-s-3); align-items: baseline; padding: var(--m-s-3) 0; border-top: 1px solid var(--m-line); }
    .steps li:first-child { border-top: 0; }
    .steps__n { font-family: var(--m-font-display); font-size: var(--m-fs-h3); line-height: 1; color: var(--m-signal-ink); }
    .plan { margin-bottom: var(--m-s-5); background: var(--m-panel); border-radius: var(--m-r-md); padding: var(--m-s-3) var(--m-s-6); }

    .limits { padding-left: 1.1rem; max-width: var(--m-measure); }
    .limits li + li { margin-top: var(--m-s-2); }
    .access { margin-top: var(--m-s-5); padding: var(--m-s-3) var(--m-s-4); background: var(--m-panel); border-left: 3px solid var(--m-brand); border-radius: 0 var(--m-r-sm) var(--m-r-sm) 0; }
    .mod--sources h3 { font-size: var(--m-fs-h3); margin: var(--m-s-7) 0 var(--m-s-3); break-after: avoid; }
    .src { list-style: none; padding: 0; counter-reset: src; font-size: var(--m-fs-xs); line-height: 1.5; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: var(--m-s-6); }
    .nw { white-space: nowrap; }
    .src li { counter-increment: src; position: relative; padding: var(--m-s-2) 0 var(--m-s-2) 2rem; border-top: 1px solid var(--m-line); break-inside: avoid; }
    .src li::before { content: counter(src); position: absolute; left: 0; top: var(--m-s-2); font-weight: 800; color: var(--m-signal-ink); font-variant-numeric: tabular-nums; }
    .src__id code { color: var(--m-muted); word-break: break-all; }
    .src__line { color: var(--m-muted); overflow-wrap: anywhere; }
    .src__line b { color: var(--m-ink); }
    .src__metric code { color: var(--m-ink); word-break: break-all; }

    .next-steps { padding: 0; margin-top: var(--m-s-9); break-before: page; }
    .close__main { background: var(--m-deep); color: var(--m-on-deep); padding: var(--m-s-8) var(--m-gutter); }
    .close__main .eyebrow { color: var(--m-signal); }
    .close__main h2 { font-size: var(--m-fs-h1); margin-top: var(--m-s-4); max-width: 20ch; }
    .close__main .lead { font-size: var(--m-fs-lead); margin-top: var(--m-s-5); max-width: 38rem; }
    .close__cta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--m-s-6); margin-top: var(--m-s-7); }
    .cta { display: inline-block; background: var(--m-signal); color: var(--m-on-signal); font-weight: 800; font-size: var(--m-fs-lead); text-decoration: none; padding: var(--m-s-4) var(--m-s-6); border-radius: var(--m-r-pill); box-shadow: var(--m-block-sm) var(--m-block-tint); overflow-wrap: normal; }
    .contact { color: var(--m-on-deep-muted); font-size: var(--m-fs-sm); }
    .contact a { color: var(--m-brand-lift); font-weight: 700; }
    .close__detail { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: var(--m-s-7); padding: var(--m-s-8) var(--m-gutter) var(--m-s-7); }
    .close__detail h3 { font-size: var(--m-fs-h3); margin-bottom: var(--m-s-4); }
    .close__sign { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--m-s-6); margin: 0 var(--m-gutter); padding: var(--m-s-5) 0 var(--m-s-6); border-top: 2px solid var(--m-ink); }
    .close__sign .brand-logo { width: 12rem; flex: none; }
    .close__sign .note { max-width: 25rem; color: var(--m-muted); font-size: var(--m-fs-xs); text-align: right; }

    @media (max-width: 640px) {
      .cover__top, .close__sign { flex-direction: column; align-items: flex-start; }
      .cover__stamp, .close__sign .note { text-align: left; }
      .cover__foot, .summary, .scores-hero, .scores-grid, .close__detail { grid-template-columns: minmax(0, 1fr); }
      .find { grid-template-columns: minmax(0, 1fr); gap: var(--m-s-2); }
      .mod__head { grid-template-columns: auto minmax(0, 1fr); }
      .mod__aside { grid-column: 2; white-space: normal; }
      .mod--scores { padding: var(--m-s-6) var(--m-s-5); border-radius: 0; }
      .src { grid-template-columns: minmax(0, 1fr); }
    }

    @media print {
      html { font-size: 14px; }
      main { max-width: none; padding: 0; }
      .cover { page: cover; min-height: 11in; display: flex; flex-direction: column; }
      .cover__top { padding: 0.6in 0.7in 0.45in; }
      .cover__main { flex: 1; padding: 0.7in; }
      .cover__foot { margin-top: auto; }
      .mod { padding: 0; margin-top: var(--m-s-8); }
      .cover + .mod { margin-top: 0; }
      .keep, .find, .plan, .mod--scores, .tally, .steps li { break-inside: avoid; }
      .mod.mod--scores { margin-top: var(--m-s-7); padding: var(--m-s-6) var(--m-s-6) var(--m-s-5); }
      .next-steps { page: closing; min-height: 11in; margin: 0; display: flex; flex-direction: column; }
      .close__main { padding: 0.9in 0.7in 0.7in; }
      .close__detail { flex: 1; padding: 0.55in 0.7in 0.3in; }
      .close__sign { margin: 0 0.7in; padding-bottom: 0.6in; }
    }
  </style>
</head>
<body>
  <main id="main">${cover}
${body.join('\n')}
${closing}</main>
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
  if (!/Momentum Digital|NeedMomentum|needmomentum/i.test(html)) fails.push('missing Momentum identity');
  if (/lorem ipsum|TODO|placeholder copy|\[insert/i.test(html)) fails.push('placeholder copy');
  if (/[–—]/.test(html)) fails.push('em or en dash in customer-facing copy');
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
    await page.evaluate(() => document.fonts.ready);
    // Page size, margins and the running footer live in the report's @page rules.
    await page.pdf({ path: outPath, format: 'Letter', printBackground: true, preferCSSPageSize: true });
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
  prospectLabel,
  token,
  markDataUri,
  momentumLogoDataUri,
};
