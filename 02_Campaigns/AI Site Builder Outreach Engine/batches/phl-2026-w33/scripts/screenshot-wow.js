#!/usr/bin/env node
/**
 * Screenshot the wow-library catalog. JPEGs stay out of git (private layer).
 *
 *   node screenshot-wow.js [--limit 200] [--concurrency 5]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const CATALOG = path.join(ROOT, 'wow-library.json');
const SHOT_DIR = '/workspace/12_Brain/private/design-references/shots';
const ARTIFACTS = '/opt/cursor/artifacts';

const argv = process.argv.slice(2);
const limitIdx = argv.indexOf('--limit');
const concIdx = argv.indexOf('--concurrency');
const LIMIT = limitIdx >= 0 ? parseInt(argv[limitIdx + 1], 10) : 200;
const CONC = concIdx >= 0 ? parseInt(argv[concIdx + 1], 10) : 5;

function slugUrl(u) {
  try {
    const x = new URL(u);
    return (x.hostname + x.pathname)
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  } catch {
    return 'site';
  }
}

(async () => {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  fs.mkdirSync(ARTIFACTS, { recursive: true });
  const items = catalog.items.slice(0, LIMIT);
  const browser = await chromium.launch();
  const results = new Array(items.length);

  let next = 0;
  async function worker() {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    });
    while (true) {
      const i = next++;
      if (i >= items.length) break;
      const item = items[i];
      const slug = String(i + 1).padStart(3, '0') + '-' + slugUrl(item.url);
      const file = path.join(SHOT_DIR, slug + '.jpg');
      const rec = { ...item, slug, screenshot: null, ok: false, error: null };
      const page = await context.newPage();
      try {
        await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 18000 });
        await page.waitForTimeout(1200);
        await page.screenshot({ path: file, type: 'jpeg', quality: 52, fullPage: false });
        rec.screenshot = file;
        rec.ok = true;
        process.stdout.write(`ok  ${i + 1}/${items.length} ${item.url}\n`);
      } catch (err) {
        rec.error = String(err.message || err).split('\n')[0].slice(0, 160);
        process.stdout.write(`fail ${i + 1} ${item.url} ${rec.error}\n`);
      } finally {
        await page.close();
      }
      results[i] = rec;
    }
    await context.close();
  }

  await Promise.all(Array.from({ length: CONC }, () => worker()));
  await browser.close();

  const ok = results.filter((r) => r && r.ok);
  catalog.screenshoted = ok.length;
  catalog.screenshot_dir = SHOT_DIR;
  catalog.items = results.filter(Boolean);
  fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));

  const thumbs = ok.slice(0, 200);
  const cells = thumbs
    .map((r) => {
      const rel = path.relative('/workspace', r.screenshot);
      return `<figure><img src="file://${r.screenshot}" alt=""><figcaption>${r.url.replace(/^https?:\/\//, '')}</figcaption></figure>`;
    })
    .join('');
  const sheet = `<!doctype html><meta charset="utf-8"><title>Wow UI library ${ok.length}</title>
<style>
body{margin:0;background:#101418;color:#e8eef4;font:12px/1.4 ui-sans-serif,system-ui}
h1{font-size:22px;padding:24px 24px 8px}
.sub{padding:0 24px 24px;color:#8b9aab}
grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;padding:0 16px 40px}
figure{margin:0;background:#1a222b;border:1px solid #2a3540;border-radius:8px;overflow:hidden}
img{width:100%;height:160px;object-fit:cover;display:block}
figcaption{padding:8px 10px;word-break:break-all}
</style>
<h1>${ok.length} wow-site screenshots</h1>
<p class="sub">Composition reference only. Not templates to clone onto prospect sites.</p>
<grid>${cells}</grid>`;
  fs.writeFileSync(path.join(SHOT_DIR, 'index.html'), sheet);
  fs.writeFileSync(path.join(ARTIFACTS, 'wow_ui_library_index.html'), sheet);
  console.log(`done ${ok.length}/${items.length}`);
})();
