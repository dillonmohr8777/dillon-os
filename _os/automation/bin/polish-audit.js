#!/usr/bin/env node
'use strict';

/**
 * The polish gate: nothing gets shown to a business until it passes this.
 *
 * The standing rule is "only fully polished websites in any batch or build."
 * That was an instruction a human had to remember, applied by eye, once per
 * batch. It did not hold: the 2026-08-19 rebuild of 136 pages fixed every
 * structural defect it set out to fix — no WebGL to fail, no placeholder copy,
 * no em dashes, noindex on every page — and still shipped imagery that asserts,
 * in alt text, that AI-generated photographs depict a specific named business.
 *
 * So the rule becomes a check that runs against the built pages themselves.
 *
 * Usage
 *   node bin/polish-audit.js --hub https://<batch>.netlify.app [--limit 40] [--json out.json]
 *   node bin/polish-audit.js --dir path/to/built/sites [--limit 40]
 *
 * Exit code is 1 if any page fails a BLOCKER, so this can gate a deploy.
 *
 * What it checks, and why each one is here rather than in a style guide:
 *
 *   BLOCKERS (a page failing any of these must not be shown)
 *     no-noindex          A prospect could find their own unsolicited concept in
 *                         Google. `lib/netlify.js` enforces this at deploy; this
 *                         re-checks the served page.
 *     asserted-imagery    Alt text claims a photograph is *of this business* while
 *                         the page carries no generated-imagery disclosure. Either
 *                         the photo is theirs (fine) or it is not (must say so).
 *     em-dash             House rule: no em dashes on customer-facing pages.
 *     placeholder         Unfinished template copy, lorem, `{{token}}`, "coming soon".
 *     no-images           A homepage concept with no imagery is not a concept.
 *     webgl-only-hero     A <canvas>/WebGL hero with no <img> fallback renders
 *                         black for anyone opening the bare link. This is the
 *                         exact bug that held 20 finished pages out of outreach.
 *
 *   WARNINGS (worth a human look, not a hard stop)
 *     thin-copy           Under 250 words reads as a stub.
 *     generic-alt         Every image sharing one templated alt phrase.
 *     heavy-asset         Any single image over 900KB.
 */

const fs = require('fs');
const path = require('path');
const { httpGet } = require('../lib/net');

const BLOCKERS = new Set([
  'no-noindex', 'asserted-imagery', 'em-dash', 'placeholder', 'no-images', 'webgl-only-hero',
]);

/** Alt phrasings that assert the image depicts this specific business. */
const ASSERTS_OWNERSHIP = /\b(?:the\s+\w+\s+)?photograph(?:s)?\s+(?:for|of)\s+/i;
/** The disclosure the builder ships with generated imagery. */
const DISCLOSURE = /data-generated-imagery|illustrative concept image/i;

function parseArgs(argv) {
  const o = { hub: '', dir: '', urls: '', limit: 40, json: '', help: false };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--hub') o.hub = String(argv[++i] || '').replace(/\/$/, '');
    else if (a === '--dir') o.dir = String(argv[++i] || '');
    else if (a === '--urls') o.urls = String(argv[++i] || '');
    else if (a === '--limit') o.limit = Math.max(1, parseInt(argv[++i], 10) || 40);
    else if (a === '--json') o.json = String(argv[++i] || '');
    else if (a === '--help' || a === '-h') o.help = true;
  }
  return o;
}

function textOf(html) {
  const stripped = String(html)
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return stripped.replace(/\s+/g, ' ').trim();
}

function auditPage(html, { slug = '' } = {}) {
  const findings = [];
  const body = textOf(html);
  const imgTags = String(html).match(/<img\b[^>]*>/gi) || [];
  const alts = imgTags
    .map((t) => (t.match(/alt="([^"]*)"/i) || [, ''])[1])
    .filter((a) => a && a.trim());

  if (!/noindex/i.test(html)) findings.push(['no-noindex', 'page is indexable by search engines']);

  const hasDisclosure = DISCLOSURE.test(html);
  const asserting = alts.filter((a) => ASSERTS_OWNERSHIP.test(a));
  if (asserting.length && !hasDisclosure) {
    findings.push([
      'asserted-imagery',
      `${asserting.length} alt text(s) claim a photograph is of this business, with no generated-imagery disclosure ` +
      `(e.g. "${asserting[0].slice(0, 70)}")`,
    ]);
  }

  if (body.includes('—')) findings.push(['em-dash', 'em dash present in visible copy']);

  const placeholder = body.match(/lorem ipsum|coming soon|your (?:business|company) name|\{\{[^}]+\}\}|\bTODO\b/i);
  if (placeholder) findings.push(['placeholder', `unfinished template copy: "${placeholder[0]}"`]);

  if (imgTags.length === 0) findings.push(['no-images', 'no <img> on the page']);

  const canvas = /<canvas\b/i.test(html);
  const webgl = /webgl|WebGLRenderer|THREE\./.test(html);
  if ((canvas || webgl) && imgTags.length === 0) {
    findings.push(['webgl-only-hero', 'canvas/WebGL hero with no image fallback — renders black without it']);
  }

  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < 250) findings.push(['thin-copy', `only ${words} words of copy`]);

  if (alts.length >= 4) {
    const shapes = new Set(alts.map((a) => a.replace(/[A-Z][\w'&.-]*(?:\s+[A-Z][\w'&.-]*)*/g, '{name}')));
    if (shapes.size <= 2) {
      findings.push(['generic-alt', `${alts.length} images share ${shapes.size} templated alt phrasing(s)`]);
    }
  }

  return {
    slug,
    words,
    images: imgTags.length,
    findings: findings.map(([code, detail]) => ({ code, detail, blocker: BLOCKERS.has(code) })),
  };
}

async function fetchText(url) {
  const res = await httpGet(url, { timeoutMs: 25000 });
  const body = res && res.body ? res.body : null;
  return {
    status: res ? res.status : 0,
    html: body ? body.toString('utf8') : (res && res.html) || '',
  };
}

/**
 * Pull the per-business page slugs out of a batch hub.
 *
 * Two layouts exist in the wild and both have to work, because the batches worth
 * auditing are spread across five hosts: the radar hubs nest pages under
 * `sites/<slug>/`, while the earlier philly-25 hubs link flat `<slug>/`.
 */
function slugsFromHub(html) {
  const nested = new Set();
  for (const m of String(html).matchAll(/href="\.?\/?sites\/([^/"?#]+)\/?"/g)) nested.add(m[1]);
  if (nested.size) return { prefix: 'sites/', slugs: [...nested] };

  const flat = new Set();
  for (const m of String(html).matchAll(/href="\.?\/?([A-Za-z0-9][A-Za-z0-9._-]*)\/"/g)) {
    const s = m[1];
    // Skip anything that is plainly not a page directory.
    if (/^(https?:|\/\/|#|mailto:|tel:)/i.test(s)) continue;
    if (/^(assets|static|css|js|img|images|fonts)$/i.test(s)) continue;
    if (/\.(css|js|png|jpe?g|webp|svg|ico|xml|txt)$/i.test(s)) continue;
    flat.add(s);
  }
  return { prefix: '', slugs: [...flat] };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || (!args.hub && !args.dir && !args.urls)) {
    process.stdout.write(
      'usage: polish-audit.js --hub https://<batch>.netlify.app [--limit 40] [--json out.json]\n' +
      '       polish-audit.js --urls <file-of-urls> [--limit 400]\n' +
      '       polish-audit.js --dir <path-to-built-sites> [--limit 40]\n\n' +
      'Exits 1 if any page fails a blocker. Nothing showable should fail this.\n'
    );
    process.exit(args.help ? 0 : 1);
  }

  const pages = [];
  if (args.urls) {
    // A hub can be JS-driven, link-free, or simply out of date. The inventory
    // knows the exact URL of every page ever built, across all five hosts, so
    // reading a URL list is the only mode guaranteed to cover a whole batch.
    const list = fs.readFileSync(args.urls, 'utf8')
      .split(/\r?\n/).map((l) => l.trim()).filter((l) => /^https?:\/\//i.test(l))
      .slice(0, args.limit);
    process.stderr.write(`auditing ${list.length} page(s) from ${path.basename(args.urls)}\n`);
    for (const url of list) {
      const slug = url.replace(/\/$/, '').split('/').slice(-1)[0] || url;
      try {
        const r = await fetchText(url);
        if (r.status >= 400 || !r.html) pages.push({ slug, url, html: '', error: `HTTP ${r.status}` });
        else pages.push({ slug, url, html: r.html });
      } catch (err) {
        pages.push({ slug, url, html: '', error: String(err && err.message || err).slice(0, 80) });
      }
    }
  } else if (args.dir) {
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const f = path.join(d, e.name);
        if (e.isDirectory()) walk(f);
        else if (/\.html?$/i.test(e.name)) pages.push({ slug: path.relative(args.dir, f), html: fs.readFileSync(f, 'utf8') });
      }
    };
    walk(args.dir);
  } else {
    const hub = await fetchText(`${args.hub}/`);
    const found = slugsFromHub(hub.html);
    const slugs = found.slugs.slice(0, args.limit);
    if (!slugs.length) {
      process.stderr.write(`no site links found at ${args.hub}/\n`);
      process.exit(1);
    }
    process.stderr.write(`auditing ${slugs.length} page(s) from ${args.hub}\n`);
    for (const slug of slugs) {
      try {
        const r = await fetchText(`${args.hub}/${found.prefix}${slug}/`);
        if (r.status >= 400 || !r.html) {
          pages.push({ slug, html: '', error: `HTTP ${r.status}` });
        } else {
          pages.push({ slug, html: r.html });
        }
      } catch (err) {
        pages.push({ slug, html: '', error: String(err && err.message || err).slice(0, 80) });
      }
    }
  }

  const results = pages.map((p) => ({
    url: p.url || '',
    ...(p.error
      ? { slug: p.slug, words: 0, images: 0, findings: [{ code: 'unreachable', detail: p.error, blocker: true }] }
      : auditPage(p.html, { slug: p.slug })),
  }));

  const counts = new Map();
  for (const r of results) for (const f of r.findings) counts.set(f.code, (counts.get(f.code) || 0) + 1);
  const failed = results.filter((r) => r.findings.some((f) => f.blocker));

  process.stdout.write(`\n${results.length} page(s) audited\n`);
  process.stdout.write(`  clean and showable : ${results.length - failed.length}\n`);
  process.stdout.write(`  blocked            : ${failed.length}\n\n`);
  if (counts.size) {
    process.stdout.write('findings by type:\n');
    for (const [code, n] of [...counts].sort((a, b) => b[1] - a[1])) {
      process.stdout.write(`  ${BLOCKERS.has(code) || code === 'unreachable' ? 'BLOCK' : 'warn '} ${String(n).padStart(4)}  ${code}\n`);
    }
  }
  if (failed.length) {
    process.stdout.write('\nblocked pages (first 15):\n');
    for (const r of failed.slice(0, 15)) {
      const b = r.findings.filter((f) => f.blocker).map((f) => f.code).join(', ');
      process.stdout.write(`  ${r.slug} — ${b}\n`);
    }
  }

  if (args.json) {
    fs.writeFileSync(args.json, JSON.stringify({ audited: results.length, blocked: failed.length, results }, null, 1));
    process.stdout.write(`\nwrote ${args.json}\n`);
  }

  if (failed.length) {
    process.stdout.write('\nNot cleared to show. Fix the blockers or hold the batch.\n');
    process.exit(1);
  }
  process.stdout.write('\nEvery page passes. Cleared to show.\n');
}

if (require.main === module) {
  main().catch((err) => {
    process.stderr.write(`polish-audit failed: ${err && err.stack || err}\n`);
    process.exit(2);
  });
}
module.exports = { auditPage, slugsFromHub, BLOCKERS };
