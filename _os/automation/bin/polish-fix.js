#!/usr/bin/env node
'use strict';

/**
 * Fix the two defects that hold finished pages out of outreach, deterministically.
 *
 * The polish gate (bin/polish-audit.js) found 98 of 238 live pages blocked. The
 * failures are not design problems and do not need a rebuild:
 *
 *   68  asserted-imagery  alt text says a photograph is *of this business* while
 *                         the page carries no illustrative-imagery disclosure.
 *                         Half the batch already ships that disclosure, so the
 *                         fix is to add the same paragraph these pages are
 *                         missing — one insertion, no re-render.
 *   17  em-dash           house rule: none on a customer-facing page.
 *   13  unreachable       genuinely broken; cannot be fixed from here.
 *
 * This downloads each page, applies those two fixes, re-runs the audit against
 * the result, and writes a deployable tree. It refuses to write a page that
 * still fails, so the output directory is by construction shippable.
 *
 * Usage
 *   node bin/polish-fix.js --urls <file> --out <dir> [--limit 300]
 *
 * It does **not** deploy. Publishing is approval-gated (see CLAUDE.md), so this
 * leaves a verified tree and a manifest for a human to release.
 *
 * Assets are left where they are: pages reference them relatively and the
 * existing deploy already serves them, so rewriting asset paths would break more
 * than it fixed. Only the HTML changes.
 */

const fs = require('fs');
const path = require('path');
const { httpGet } = require('../lib/net');
const { auditPage } = require('./polish-audit');

/**
 * The disclosure the passing pages already carry, copied verbatim so the batch
 * reads as one voice rather than two. It is deliberately specific: it says what
 * the imagery is *and* what it does not claim, which is the part that matters if
 * a business ever asks.
 */
const DISCLOSURE_TEXT =
  'Illustrative concept imagery plus any photographs harvested from the official site. ' +
  'These visuals do not claim to depict current staff, customers, or completed work.';

const DISCLOSURE_HTML =
  `<p class="disclosure" data-generated-imagery style="margin-top:18px">${DISCLOSURE_TEXT}</p>`;

function parseArgs(argv) {
  const o = { urls: '', out: '', limit: 400, help: false };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--urls') o.urls = String(argv[++i] || '');
    else if (a === '--out') o.out = String(argv[++i] || '');
    else if (a === '--limit') o.limit = Math.max(1, parseInt(argv[++i], 10) || 400);
    else if (a === '--help' || a === '-h') o.help = true;
  }
  return o;
}

/** Em dashes never reach a customer-facing page. Spaced ones become a comma. */
function stripEmDashes(html) {
  // Only touch text, never attribute values or markup: an em dash inside a URL
  // or a data attribute is not copy and rewriting it could break the page.
  return html.replace(/>([^<]+)</g, (m, text) => {
    if (!text.includes('—')) return m;
    const fixed = text
      .replace(/\s+—\s+/g, ', ')
      .replace(/—/g, '-');
    return `>${fixed}<`;
  });
}

/**
 * Insert the disclosure immediately after the last image-bearing section, which
 * is where the passing pages put it. Falls back to just before </main>, then
 * </body>, so a template variant still gets a visible disclosure rather than
 * being silently skipped.
 */
function insertDisclosure(html) {
  if (/data-generated-imagery|illustrative concept image/i.test(html)) return html;

  const lastFigure = html.lastIndexOf('</figure>');
  if (lastFigure !== -1) {
    const closeSection = html.indexOf('</section>', lastFigure);
    if (closeSection !== -1) {
      return html.slice(0, closeSection) + DISCLOSURE_HTML + html.slice(closeSection);
    }
    const after = lastFigure + '</figure>'.length;
    return html.slice(0, after) + DISCLOSURE_HTML + html.slice(after);
  }
  for (const close of ['</main>', '</body>']) {
    const i = html.lastIndexOf(close);
    if (i !== -1) return html.slice(0, i) + DISCLOSURE_HTML + html.slice(i);
  }
  return html + DISCLOSURE_HTML;
}

function fixPage(html) {
  const applied = [];
  let out = html;

  const withDisclosure = insertDisclosure(out);
  if (withDisclosure !== out) { applied.push('disclosure'); out = withDisclosure; }

  const withoutDashes = stripEmDashes(out);
  if (withoutDashes !== out) { applied.push('em-dash'); out = withoutDashes; }

  return { html: out, applied };
}

async function fetchText(url) {
  const res = await httpGet(url, { timeoutMs: 25000 });
  const body = res && res.body ? res.body : null;
  return { status: res ? res.status : 0, html: body ? body.toString('utf8') : (res && res.html) || '' };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.urls || !args.out) {
    process.stdout.write(
      'usage: polish-fix.js --urls <file-of-urls> --out <dir> [--limit 400]\n\n' +
      'Applies the disclosure line and strips em dashes, re-audits, and writes only\n' +
      'pages that pass. Does not deploy: publishing is approval-gated.\n'
    );
    process.exit(args.help ? 0 : 1);
  }

  const urls = fs.readFileSync(args.urls, 'utf8')
    .split(/\r?\n/).map((l) => l.trim()).filter((l) => /^https?:\/\//i.test(l))
    .slice(0, args.limit);

  fs.mkdirSync(args.out, { recursive: true });
  const manifest = [];
  const stats = { checked: 0, already_clean: 0, fixed: 0, still_blocked: 0, unreachable: 0 };

  for (const url of urls) {
    const slug = url.replace(/\/$/, '').split('/').slice(-1)[0] || 'page';
    stats.checked += 1;
    let got;
    try {
      got = await fetchText(url);
    } catch (err) {
      stats.unreachable += 1;
      manifest.push({ slug, url, outcome: 'unreachable', detail: String(err && err.message || err).slice(0, 90) });
      continue;
    }
    if (got.status >= 400 || !got.html) {
      stats.unreachable += 1;
      manifest.push({ slug, url, outcome: 'unreachable', detail: `HTTP ${got.status}` });
      continue;
    }

    const before = auditPage(got.html, { slug });
    const beforeBlockers = before.findings.filter((f) => f.blocker).map((f) => f.code);
    if (!beforeBlockers.length) {
      stats.already_clean += 1;
      manifest.push({ slug, url, outcome: 'already clean' });
      continue;
    }

    const { html, applied } = fixPage(got.html);
    const after = auditPage(html, { slug });
    const afterBlockers = after.findings.filter((f) => f.blocker).map((f) => f.code);

    if (afterBlockers.length) {
      // Refuse to write a page that still fails. A half-fixed page in a
      // directory named "cleared" is worse than no page at all.
      stats.still_blocked += 1;
      manifest.push({ slug, url, outcome: 'still blocked', was: beforeBlockers, now: afterBlockers, applied });
      continue;
    }

    const dir = path.join(args.out, slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    stats.fixed += 1;
    manifest.push({ slug, url, outcome: 'fixed', was: beforeBlockers, applied });
  }

  fs.writeFileSync(path.join(args.out, 'fix-manifest.json'), JSON.stringify({ stats, manifest }, null, 1));

  process.stdout.write(
    `\n${stats.checked} page(s) processed\n` +
    `  already clean   : ${stats.already_clean}\n` +
    `  fixed and saved : ${stats.fixed}\n` +
    `  still blocked   : ${stats.still_blocked}\n` +
    `  unreachable     : ${stats.unreachable}\n` +
    `\nwrote ${args.out}/ (+ fix-manifest.json)\n` +
    'Nothing deployed. Publishing is approval-gated.\n'
  );
  if (stats.still_blocked) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((err) => {
    process.stderr.write(`polish-fix failed: ${err && err.stack || err}\n`);
    process.exit(2);
  });
}
module.exports = { fixPage, stripEmDashes, insertDisclosure, DISCLOSURE_TEXT };
