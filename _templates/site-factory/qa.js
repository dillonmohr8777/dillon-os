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
const { SPEC, checkSpec } = require('./lib/spec.js');

function parseHex(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  const hex = match[1].length === 3
    ? match[1].split('').map((c) => c + c).join('')
    : match[1];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function relativeLuminance(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const channels = rgb.map((v) => {
    const n = v / 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(a, b) {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  if (l1 == null || l2 == null) return null;
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function parseRootTokens(html) {
  const root = (html.match(/:root\{([^}]+)\}/) || [])[1] || '';
  return Object.fromEntries(
    [...root.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+)/gi)].map((m) => [m[1], m[2].trim()])
  );
}

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
  const contentImageSrcs = [];
  imgs.forEach((m) => {
    const tag = m[1];
    const src = (tag.match(/src="([^"]*)"/) || [])[1];
    if (!/alt="[^"]+"/.test(tag)) failures.push(`Image missing alt text: ${src}`);
    if (src && src.startsWith('assets/') && !fs.existsSync(path.join(siteDir, src))) {
      failures.push(`Missing asset file: ${src}`);
    }
    if (src && src.startsWith('assets/') && !/\/logo\.(png|jpe?g|webp)$/i.test(src)) {
      contentImageSrcs.push(src);
    }
  });

  const duplicateSrcs = [...new Set(
    contentImageSrcs.filter((src, index) => contentImageSrcs.indexOf(src) !== index)
  )];
  duplicateSrcs.forEach((src) => failures.push(`Duplicate image reference within site: ${src}`));

  const assetsDir = path.join(siteDir, 'assets');
  const assetFiles = fs.existsSync(assetsDir)
    ? fs.readdirSync(assetsDir)
      .map((name) => path.join(assetsDir, name))
      .filter((file) => fs.statSync(file).isFile())
    : [];
  const assetBytes = assetFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0);
  const largestAssetBytes = assetFiles.reduce(
    (largest, file) => Math.max(largest, fs.statSync(file).size),
    0
  );

  const copyHtml = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');
  const metrics = {
    sections: [...html.matchAll(/<section class="([a-z-]+)/g)].length,
    words: (copyHtml.match(/>[^<>]{3,}</g) || []).join(' ').split(/\s+/).filter(Boolean).length,
    images: new Set(contentImageSrcs).size,
    kb: +(Buffer.byteLength(html) / 1024).toFixed(1),
    assetBytes,
    largestAssetBytes,
    duplicateImageReferences: duplicateSrcs,
  };
  failures.push(...checkSpec(metrics));

  const tokens = parseRootTokens(html);
  const contrastPairs = [
    ['paper', 'on-paper'],
    ['accent', 'on-accent'],
    ['accent2', 'on-accent2'],
    ['panel', 'on-panel'],
    ['deep', 'on-deep'],
  ];
  contrastPairs.forEach(([surface, foreground]) => {
    const ratio = contrastRatio(tokens[surface], tokens[foreground]);
    if (ratio == null) {
      failures.push(`Contrast tokens are missing or invalid: --${surface} / --${foreground}`);
    } else if (ratio < 4.5) {
      failures.push(
        `Contrast ${surface}/${foreground} is ${ratio.toFixed(2)}:1, below WCAG AA 4.5:1`
      );
    }
  });
  if (!/\.surface-paper\{[^}]*color:var\(--on-paper\)/.test(html)) {
    failures.push('surface-paper does not use --on-paper');
  }
  if (!/\.surface-panel\{[^}]*color:var\(--on-panel\)/.test(html)) {
    failures.push('surface-panel does not use --on-panel');
  }

  [...html.matchAll(/href="([^"]*)"/g)].forEach((m) => {
    const href = m[1];
    if (href === '' || href === '#') failures.push('Empty CTA href found');
    if (/^#[a-z][a-z0-9-]*$/i.test(href)) {
      const id = href.slice(1);
      if (!new RegExp(`id="${id}"`).test(html)) failures.push(`Internal link target is missing: ${href}`);
    }
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
      let browser;
      try {
        const shotsDir = path.join(__dirname, 'qa-shots', slug);
        fs.mkdirSync(shotsDir, { recursive: true });
        browser = await chromium.launch();
        const url = 'file://' + path.resolve(siteDir, 'index.html');
        for (const [name, width, height] of [
          ['phone', 390, 844],
          ['tablet', 850, 1100],
          ['desktop', 1440, 900],
        ]) {
          const page = await browser.newPage({ viewport: { width, height } });
          await page.goto(url, { waitUntil: 'domcontentloaded' });
          const imageFailures = await page.evaluate(async () => {
            document.documentElement.style.scrollBehavior = 'auto';
            if (document.fonts && document.fonts.ready) await document.fonts.ready;
            const broken = [];
            for (const image of document.images) {
              image.scrollIntoView({ block: 'center' });
              await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
              try {
                if (image.decode) await image.decode();
              } catch {
                broken.push(image.getAttribute('src') || '(unknown)');
              }
              if (!image.naturalWidth || !image.naturalHeight) {
                const src = image.getAttribute('src') || '(unknown)';
                if (!broken.includes(src)) broken.push(src);
              }
            }
            document.getAnimations().forEach((animation) => {
              try { animation.finish(); } catch {}
            });
            scrollTo(0, 0);
            return broken;
          });
          imageFailures.forEach((src) => failures.push(`Image did not decode at ${name}: ${src}`));
          await page.waitForTimeout(80);

          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
          );
          if (overflow > 1) failures.push(`Horizontal overflow of ${overflow}px at ${name} width (${width}px)`);

          const layout = await page.evaluate(() => {
            const visible = (element) => {
              if (!element) return false;
              const style = getComputedStyle(element);
              const rect = element.getBoundingClientRect();
              return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
            };
            const eyebrow = document.querySelector('.hero .eyebrow');
            const heading = document.querySelector('.hero h1');
            const eyebrowRect = eyebrow && eyebrow.getBoundingClientRect();
            const headingRect = heading && heading.getBoundingClientRect();
            const navLinks = [...document.querySelectorAll('.site-header nav a')];
            const tinyTargets = [...document.querySelectorAll('a,button')]
              .filter(visible)
              .map((element) => {
                const rect = element.getBoundingClientRect();
                return {
                  label: (element.textContent || element.getAttribute('aria-label') || element.tagName).trim().slice(0, 60),
                  width: Math.round(rect.width),
                  height: Math.round(rect.height),
                };
              })
              .filter((item) => item.width < 44 || item.height < 44);
            return {
              heroTextOverlap:
                !!eyebrowRect && !!headingRect &&
                eyebrowRect.bottom > headingRect.top + 1 &&
                eyebrowRect.top < headingRect.bottom,
              navLinkCount: navLinks.length,
              navLinksVisible: navLinks.every(visible),
              tinyTargets,
              mobileActionExists: !!document.querySelector('.mobile-action'),
              mobileActionHiddenAtTop:
                !document.querySelector('.mobile-action') ||
                (
                  document.querySelector('.mobile-action').getAttribute('aria-hidden') === 'true' &&
                  !document.querySelector('.mobile-action').classList.contains('is-active')
                ),
            };
          });
          if (layout.heroTextOverlap) failures.push(`Hero eyebrow overlaps heading at ${name} width (${width}px)`);
          if (layout.navLinkCount < 3 || !layout.navLinksVisible) {
            failures.push(`Primary navigation is not fully available at ${name} width (${width}px)`);
          }
          layout.tinyTargets.slice(0, 10).forEach((target) => {
            failures.push(
              `Touch target "${target.label}" is ${target.width}x${target.height}px at ${name}; minimum is 44x44px`
            );
          });
          if (width <= 850 && !layout.mobileActionHiddenAtTop) {
            failures.push(`Mobile action is visible before the hero CTA leaves view at ${name} width`);
          }

          const sticky = await page.evaluate(async () => {
            const header = document.querySelector('.site-header');
            if (!header) return { exists: false };
            scrollTo(0, Math.min(700, Math.max(0, document.documentElement.scrollHeight - innerHeight)));
            await new Promise((resolve) => setTimeout(resolve, 80));
            const rect = header.getBoundingClientRect();
            return {
              exists: true,
              position: getComputedStyle(header).position,
              top: Math.round(rect.top),
            };
          });
          if (!sticky.exists || sticky.position !== 'sticky' || Math.abs(sticky.top) > 1) {
            failures.push(`Header does not remain sticky at ${name} width (${width}px)`);
          }

          if (width <= 850 && layout.mobileActionExists) {
            const mobileState = await page.evaluate(async () => {
              const hero = document.querySelector('.hero');
              const action = document.querySelector('.mobile-action');
              scrollTo(0, hero ? hero.offsetTop + hero.offsetHeight + 100 : innerHeight);
              await new Promise((resolve) => setTimeout(resolve, 140));
              const padding = parseFloat(getComputedStyle(document.body).paddingBottom) || 0;
              return {
                active: action.classList.contains('is-active') && action.getAttribute('aria-hidden') === 'false',
                padding,
                height: action.getBoundingClientRect().height,
              };
            });
            if (!mobileState.active) failures.push(`Mobile action does not activate after the hero at ${name} width`);
            if (mobileState.padding + 1 < mobileState.height) {
              failures.push(`Mobile action lacks enough body clearance at ${name} width`);
            }
          }

          await page.evaluate(() => {
            document.getAnimations().forEach((animation) => {
              try { animation.finish(); } catch {}
            });
            scrollTo(0, 0);
          });
          await page.waitForTimeout(80);
          await page.screenshot({ path: path.join(shotsDir, `${name}.png`), fullPage: true });
          await page.close();
        }
        visualQa = 'ran';
        visualReason = `screenshots written to ${shotsDir}`;
      } catch (err) {
        visualQa = 'error';
        visualReason = err.message.split('\n')[0];
        failures.push(`Visual QA error: ${visualReason}`);
      } finally {
        if (browser) await browser.close();
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
    metrics,
    fullQa: status === 'PASS',
  };
}

module.exports = { runQa, contrastRatio, parseRootTokens };

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
