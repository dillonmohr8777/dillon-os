#!/usr/bin/env node
/**
 * Site factory QA. Runs the DESIGN-SYSTEM.md ship checklist against a built site.
 *
 *   node _templates/site-factory/qa.js path/to/site-dir [--json]
 *
 * Always runs static checks. Visual/Playwright checks are required for a full QA
 * pass. If Playwright is missing, visualQa is reported as "skipped" and the
 * overall status is STATIC_ONLY (not a full PASS). Exits 1 when any check fails
 * or when visual QA did not run.
 *
 * Requireable: const { runQa } = require('./qa.js')
 */
const fs = require('fs');
const path = require('path');

async function runQa(siteDir, opts = {}) {
  const htmlPath = path.join(siteDir, 'index.html');
  if (!siteDir || !fs.existsSync(htmlPath)) {
    throw new Error('Usage: node qa.js path/to/site-dir  (must contain index.html)');
  }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const slug = path.basename(path.resolve(siteDir));
  const failures = [];
  const warnings = [];

  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!jsonLdMatch) failures.push('Missing LocalBusiness JSON-LD block');
  else {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      if (!data.name) failures.push('JSON-LD has no name');
    } catch {
      failures.push('JSON-LD does not parse');
    }
  }

  if (!/<meta name="viewport"/.test(html)) failures.push('Missing viewport meta');
  if (!/<meta name="description" content="[^"]+"/.test(html)) failures.push('Missing or empty meta description');
  if (!/<meta name="theme-color"/.test(html)) warnings.push('Missing theme-color meta');
  if (/noindex/.test(html)) warnings.push('noindex is present (correct for demos, REMOVE for live client sites)');
  else warnings.push('noindex is absent (correct for live sites, add it for prospect demos)');

  const imgs = [...html.matchAll(/<img([^>]*)>/g)];
  imgs.forEach((m) => {
    const tag = m[1];
    const src = (tag.match(/src="([^"]*)"/) || [])[1];
    if (!/alt="[^"]+"/.test(tag)) failures.push(`Image missing alt text: ${src}`);
    if (src && src.startsWith('assets/') && !fs.existsSync(path.join(siteDir, src))) {
      failures.push(`Missing asset file: ${src}`);
    }
  });

  [...html.matchAll(/href="([^"]*)"/g)].forEach((m) => {
    const href = m[1];
    if (href === '' || href === '#') failures.push('Empty CTA href found');
  });

  const requiredSections = ['hero', 'contact-system', 'closing'];
  requiredSections.forEach((s) => {
    if (!html.includes(`class="${s} `) && !html.includes(`class="${s}"`)) {
      failures.push(`Missing required section: ${s}`);
    }
  });

  const surfaces = [...html.matchAll(/<section class="[^"]*surface-([a-z]+)/g)].map((m) => m[1]);
  surfaces.forEach((s, i) => {
    if (i > 0 && s === surfaces[i - 1]) {
      warnings.push(`Sections ${i} and ${i + 1} share surface "${s}" (rhythm rule)`);
    }
  });

  let visualQa = 'skipped';
  let visualReason = 'Playwright not attempted';

  if (opts.skipVisual) {
    visualQa = 'skipped';
    visualReason = 'skipped by caller (--skip-qa / skipVisual)';
    warnings.push(`Visual QA skipped: ${visualReason}`);
  } else {
    let chromium;
    try {
      ({ chromium } = require('playwright'));
    } catch {
      visualQa = 'skipped';
      visualReason = 'Playwright not installed';
      warnings.push(
        'Playwright not installed; skipped screenshots and overflow check. Install: npm i -D playwright && npx playwright install chromium'
      );
    }

    if (chromium) {
      try {
        const shotsDir = path.join(__dirname, 'qa-shots', slug);
        fs.mkdirSync(shotsDir, { recursive: true });
        const browser = await chromium.launch();
        const url = 'file://' + path.resolve(siteDir, 'index.html');
        for (const [name, width, height] of [
          ['phone', 390, 844],
          ['tablet', 850, 1100],
          ['desktop', 1440, 900],
        ]) {
          const page = await browser.newPage({ viewport: { width, height } });
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.evaluate(() =>
            document.querySelectorAll('.reveal').forEach((n) => n.classList.add('visible', 'in-view'))
          );
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
          );
          if (overflow > 1) failures.push(`Horizontal overflow of ${overflow}px at ${name} width (${width}px)`);
          await page.screenshot({ path: path.join(shotsDir, `${name}.png`), fullPage: true });
          await page.close();
        }
        await browser.close();
        visualQa = 'ran';
        visualReason = `screenshots written to ${shotsDir}`;
      } catch (err) {
        visualQa = 'error';
        visualReason = err.message.split('\n')[0];
        failures.push(`Visual QA error: ${visualReason}`);
      }
    }
  }

  const staticOk = failures.length === 0;
  // Full PASS requires visual QA to have actually run and static checks clean.
  let status = 'FAIL';
  if (staticOk && visualQa === 'ran') status = 'PASS';
  else if (staticOk && visualQa === 'skipped') status = 'STATIC_ONLY';
  else if (staticOk && visualQa === 'error') status = 'FAIL';

  return {
    slug,
    status,
    staticOk,
    visualQa,
    visualReason,
    failures,
    warnings,
    fullQa: status === 'PASS',
  };
}

module.exports = { runQa };

if (require.main === module) {
  const siteDir = process.argv[2];
  const asJson = process.argv.includes('--json');
  const skipVisual = process.argv.includes('--skip-visual');
  runQa(siteDir, { skipVisual })
    .then((result) => {
      if (asJson) {
        console.log(JSON.stringify(result));
      } else {
        console.log(`\nQA report for ${result.slug}`);
        console.log(`  STATUS ${result.status}`);
        console.log(`  VISUAL ${result.visualQa}${result.visualReason ? ` (${result.visualReason})` : ''}`);
        result.warnings.forEach((w) => console.log(`  WARN  ${w}`));
        result.failures.forEach((f) => console.log(`  FAIL  ${f}`));
        if (result.status === 'PASS') console.log('  PASS  All required checks passed (static + visual)');
        else if (result.status === 'STATIC_ONLY') {
          console.log('  HOLD  Static checks passed but visual QA did not run; not a full QA pass');
        }
      }
      // Exit nonzero when not a full PASS so callers cannot treat static-only as success.
      process.exit(result.status === 'PASS' ? 0 : 1);
    })
    .catch((err) => {
      console.error(err.message || err);
      process.exit(1);
    });
}
