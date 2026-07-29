#!/usr/bin/env node
/**
 * Site factory QA. Runs the DESIGN-SYSTEM.md ship checklist against a built site.
 *
 *   node _templates/site-factory/qa.js path/to/site-dir
 *
 * Always runs the static checks (no dependencies). If Playwright is installed
 * (npx playwright install chromium), it also screenshots the page at phone,
 * tablet, and desktop widths into qa-shots/<slug>/ and fails on horizontal
 * overflow. Exits 1 when any check fails.
 */
const fs = require('fs');
const path = require('path');

const siteDir = process.argv[2];
if (!siteDir || !fs.existsSync(path.join(siteDir, 'index.html'))) {
  console.error('Usage: node qa.js path/to/site-dir  (must contain index.html)');
  process.exit(1);
}
const html = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');
const slug = path.basename(path.resolve(siteDir));
const failures = [];
const warnings = [];

// --- Static checks ---
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
  if (!html.includes(`class="${s} `) && !html.includes(`class="${s}"`)) failures.push(`Missing required section: ${s}`);
});

// Adjacent surface rhythm
const surfaces = [...html.matchAll(/<section class="[^"]*surface-([a-z]+)/g)].map((m) => m[1]);
surfaces.forEach((s, i) => {
  if (i > 0 && s === surfaces[i - 1]) warnings.push(`Sections ${i} and ${i + 1} share surface "${s}" (rhythm rule)`);
});

// --- Playwright checks (optional) ---
async function browserChecks() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    warnings.push('Playwright not installed; skipped screenshots and overflow check. Install: npm i -D playwright && npx playwright install chromium');
    return;
  }
  const shotsDir = path.join(__dirname, 'qa-shots', slug);
  fs.mkdirSync(shotsDir, { recursive: true });
  const browser = await chromium.launch();
  const url = 'file://' + path.resolve(siteDir, 'index.html');
  for (const [name, width, height] of [['phone', 390, 844], ['tablet', 850, 1100], ['desktop', 1440, 900]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(url, { waitUntil: 'networkidle' });
    // Force all reveal-on-scroll elements visible so full-page shots show real content
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach((n) => n.classList.add('visible', 'in-view')));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) failures.push(`Horizontal overflow of ${overflow}px at ${name} width (${width}px)`);
    await page.screenshot({ path: path.join(shotsDir, `${name}.png`), fullPage: true });
    await page.close();
  }
  await browser.close();
  console.log(`Screenshots written to ${shotsDir}`);
}

browserChecks().then(() => {
  console.log(`\nQA report for ${slug}`);
  warnings.forEach((w) => console.log(`  WARN  ${w}`));
  failures.forEach((f) => console.log(`  FAIL  ${f}`));
  if (!failures.length) {
    console.log('  PASS  All required checks passed');
  }
  process.exit(failures.length ? 1 : 0);
});
