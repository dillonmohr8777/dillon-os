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
    if (!/width="\d+"/.test(tag) || !/height="\d+"/.test(tag)) failures.push(`Image missing intrinsic width/height: ${src}`);
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

  if (!html.includes('class="logo-outro ')) failures.push('Missing exact-logo outro section');
  if (!html.includes('class="ink-logo reveal"')) failures.push('Missing ink-reveal logo asset');
  const headerLogo = html.match(/<img class="brand-logo"[^>]*src="assets\/([^"]+)"/);
  const outroLogo = html.match(/<img class="ink-logo reveal"[^>]*src="assets\/([^"]+)"/);
  if (!headerLogo || !outroLogo || headerLogo[1] !== outroLogo[1]) {
    failures.push('Header and ink outro must use the same exact source-logo file');
  }

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
          ['small-phone', 320, 568],
          ['phone', 390, 844],
          ['wide-phone', 700, 900],
          ['tablet', 850, 1100],
          ['compact-desktop', 1024, 768],
          ['desktop', 1440, 900],
        ]) {
          const page = await browser.newPage({ viewport: { width, height } });
          const runtimeErrors = [];
          page.on('pageerror', (error) => runtimeErrors.push(error.message));
          page.on('console', (message) => {
            if (message.type() === 'error') runtimeErrors.push(message.text());
          });
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.evaluate(async () => {
            document.querySelectorAll('.reveal').forEach((n) => n.classList.add('visible', 'in-view'));
            const images = [...document.images];
            images.forEach((image) => (image.loading = 'eager'));
            const pageHeight = document.documentElement.scrollHeight;
            for (let y = 0; y < pageHeight; y += Math.max(320, innerHeight * 0.8)) {
              scrollTo(0, y);
              await new Promise((resolve) => setTimeout(resolve, 35));
            }
            scrollTo(0, 0);
            await Promise.all(
              images.map((image) =>
                image.complete ? image.decode().catch(() => {}) : new Promise((resolve) => {
                  image.addEventListener('load', resolve, { once: true });
                  image.addEventListener('error', resolve, { once: true });
                })
              )
            );
            await document.fonts.ready;
          });
          if (runtimeErrors.length) {
            failures.push(`Runtime console error at ${name}: ${runtimeErrors[0]}`);
          }
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
          );
          if (overflow > 1) failures.push(`Horizontal overflow of ${overflow}px at ${name} width (${width}px)`);
          const visualDefects = await page.evaluate(() => {
            const root = getComputedStyle(document.documentElement);
            const firstFamily = (value) => value.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
            const textFamily = firstFamily(root.getPropertyValue('--text'));
            const displayFamily = firstFamily(root.getPropertyValue('--display'));
            const imageDefects = [...document.querySelectorAll('main img')].flatMap((image) => {
              const rect = image.getBoundingClientRect();
              const style = getComputedStyle(image);
              if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
                return [`broken image ${image.getAttribute('src') || '(missing src)'}`];
              }
              if (style.objectFit !== 'cover' || rect.width <= 0 || rect.height <= 0) return [];
              const naturalRatio = image.naturalWidth / image.naturalHeight;
              const boxRatio = rect.width / rect.height;
              const visibleFraction = Math.min(naturalRatio / boxRatio, boxRatio / naturalRatio);
              return visibleFraction < 0.8
                ? [`cropped image ${image.getAttribute('src')} retains only ${Math.round(visibleFraction * 100)}% of its frame`]
                : [];
            });
            const clippedHeadings = [...document.querySelectorAll('h1,h2,h3')].flatMap((node) => {
              const rect = node.getBoundingClientRect();
              return rect.left < -1 || rect.right > innerWidth + 1
                ? [`clipped heading "${node.textContent.trim().slice(0, 70)}"`]
                : [];
            });
            const touchDefects = innerWidth > 850 ? [] : [...document.querySelectorAll('.button,.site-header a,.mobile-action a,.catalog-card>a,.footer-links a,.contact-card a')].flatMap((node) => {
              const rect = node.getBoundingClientRect();
              if (!rect.width || !rect.height) return [];
              return rect.width < 44 || rect.height < 44
                ? [`small touch target "${node.textContent.trim().slice(0, 50)}" (${Math.round(rect.width)}x${Math.round(rect.height)})`]
                : [];
            });
            const fontDefects = [
              textFamily && !document.fonts.check(`16px "${textFamily}"`) ? `body font ${textFamily} did not load` : null,
              displayFamily && !document.fonts.check(`700 32px "${displayFamily}"`) ? `display font ${displayFamily} did not load` : null,
            ].filter(Boolean);
            return [...imageDefects, ...clippedHeadings, ...touchDefects, ...fontDefects];
          });
          visualDefects.forEach((defect) => failures.push(`${defect} at ${name} width (${width}px)`));
          const focusDefects = [];
          for (let step = 0; step < 12; step += 1) {
            await page.keyboard.press('Tab');
            const focusState = await page.evaluate(() => {
              const active = document.activeElement;
              if (!active || active === document.body) return { missing: true };
              const style = getComputedStyle(active);
              const rect = active.getBoundingClientRect();
              return {
                missing: false,
                label: (active.textContent || active.getAttribute('aria-label') || active.tagName).trim().slice(0, 60),
                visible: rect.width > 0 && rect.height > 0,
                outlineWidth: parseFloat(style.outlineWidth) || 0,
                outlineStyle: style.outlineStyle,
              };
            });
            if (focusState.missing || !focusState.visible) {
              focusDefects.push(`keyboard focus missing or invisible at tab step ${step + 1}`);
              break;
            }
            if (focusState.outlineStyle === 'none' || focusState.outlineWidth < 2) {
              focusDefects.push(`focus indicator missing for "${focusState.label}" at tab step ${step + 1}`);
              break;
            }
          }
          focusDefects.forEach((defect) => failures.push(`${defect} at ${name} width (${width}px)`));
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
