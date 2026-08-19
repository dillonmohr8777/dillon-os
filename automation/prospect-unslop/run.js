#!/usr/bin/env node
'use strict';

/**
 * Unslop the 138-site fix queue.
 *
 * Harvest official photography (fetch-only, then Playwright when Cloudflare
 * blocks), sample the real logo, compose 5 unique industry-intent collages,
 * render an Align HCM-style motion page.
 *
 * Services: people doing the work. Food: the plate, the pass, the kitchen.
 * Duplicates are skipped. Deploy is not performed. Sheet updates happen only
 * after QA is green.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { harvestLite } = require('../../_os/automation/lib/harvest-lite');
const { harvestImages } = require('../../_os/automation/lib/harvest-images');
const { familyFor, modeFor, scenesFor, captionsFor, attitudeFor, fontPairFor } = require('./intent');
const { renderSite, contrastOn } = require('./render');
const { collectFromPage, closeBrowser, isChallenge } = require('./harvest-browser');

const ROOT = path.resolve(__dirname, '../..');
const HERE = __dirname;
const NETLIFY = 'https://momentum-prospect-radar-next20-2026-08-11.netlify.app';
const OUT = path.join(ROOT, '02_Campaigns', 'AI Site Builder Outreach Engine', 'batches', 'radar-unslop-20260819');
const HARVEST = path.join(HERE, 'harvest');
const only = process.argv.filter((a) => a.startsWith('--only=')).map((a) => a.slice(7));
const limit = Number((process.argv.find((a) => a.startsWith('--limit=')) || '').split('=')[1] || 0);
const fresh = process.argv.includes('--fresh');
const MIN_SOURCES = 3;

function loadQueue() {
  const rows = fs.readFileSync(path.join(HERE, 'queue.csv'), 'utf8').trim().split(/\n/).slice(1);
  return rows.map((line) => {
    const parts = [];
    let cur = '';
    let q = false;
    for (const ch of line) {
      if (ch === '"') q = !q;
      else if (ch === ',' && !q) {
        parts.push(cur);
        cur = '';
      } else cur += ch;
    }
    parts.push(cur);
    const [id, name, slug, issue, drop] = parts;
    return { id: Number(id), name, slug, issue, drop: drop === '1' };
  });
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 DillonOS-unslop' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

async function fetchBin(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 DillonOS-unslop' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function extractOfficial(html) {
  let jsonUrl = '';
  const ld = html.match(/<script type="application\/ld\+json">(\{[\s\S]*?\})<\/script>/i);
  if (ld) {
    try {
      const j = JSON.parse(ld[1]);
      jsonUrl = j.url || j['@id'] || '';
      if (typeof jsonUrl !== 'string' || /schema\.org|netlify\.app/i.test(jsonUrl)) jsonUrl = '';
    } catch {
      jsonUrl = '';
    }
  }
  const hrefs = [...html.matchAll(/href="(https?:[^"]+)"/gi)].map((m) => m[1]);
  const skip = /netlify\.app|google\.com\/maps|fonts\.google|gstatic\.com|googleapis|facebook\.com|instagram\.com|twitter\.com|linkedin\.com|youtube\.com|cdnjs|cloudflare|fontawesome|typekit|tel:|mailto:/i;
  const ext = hrefs.find((h) => {
    if (skip.test(h) || /momentum-prospect/i.test(h)) return false;
    try {
      const u = new URL(h);
      if (/\.(css|js|woff2?|ttf|eot|png|svg)(\?|$)/i.test(u.pathname)) return false;
      if (/gstatic|google|facebook|instagram|twitter|linkedin|youtube|cloudfront/i.test(u.hostname)) return false;
      return true;
    } catch {
      return false;
    }
  });
  const city = (html.match(/([A-Z][A-Za-z .'-]+,\s*PA)/) || html.match(/>([A-Z][a-z]+(?: [A-Z][a-z]+)?)\s*(?:\||,)/) || [])[1] || '';
  const logo = (html.match(/src="(assets\/logo\.[a-z]+)"/i) || [])[1] || '';
  return { url: jsonUrl || ext || '', city: (city || '').replace(/, PA.*/, '').trim(), logo };
}

function looksPeopleOrFood(img, mode) {
  const hay = `${img.url} ${img.alt || ''}`.toLowerCase();
  if (/(logo|icon|sprite|pixel|badge|button|favicon|placeholder|concept.?study|image-\d+\.webp)/i.test(hay)) {
    return false;
  }
  if (mode === 'food') {
    if (/(headshot|portrait|staff-photo|team-member|head-shot)/i.test(hay)) return false;
    if (
      /(food|dish|plate|pizza|taco|kitchen|menu|burger|noodle|sushi|grill|hoagie|coffee|dessert|bowl|ramen|curry|bbq|meal|brunch|taco|pastry)/i.test(
        hay
      )
    ) {
      return true;
    }
    return (img.width || 0) >= 700 && (img.height || 0) >= 420;
  }
  if (/(team|staff|doctor|dentist|vet|mechanic|stylist|chef|patient|client|family|portrait|owner|tech|people|person|hygienist)/i.test(hay)) {
    return true;
  }
  return (img.width || 0) >= 700;
}

function runPy(script, input, args = []) {
  const result = spawnSync('python3', [path.join(HERE, script), ...args], {
    input: input == null ? undefined : Buffer.isBuffer(input) ? input : input,
    encoding: input && !Buffer.isBuffer(input) ? 'utf8' : undefined,
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`${script} failed: ${(result.stderr || result.stdout || '').slice(0, 400)}`);
  }
  return result.stdout;
}

function defaultPalette(family) {
  const map = {
    food: { paper: '#F4EFE7', ink: '#1A1410', accent: '#C2410C', accent2: '#E7A843', panel: '#E8D9C8', deep: '#2A1810' },
    dental: { paper: '#F3F7FB', ink: '#123044', accent: '#0E7490', accent2: '#38BDF8', panel: '#D9E8F0', deep: '#0B2A3A' },
    veterinary: { paper: '#F3F6F1', ink: '#1C2A1A', accent: '#3F6F4A', accent2: '#D4A017', panel: '#DDE6D4', deep: '#16301C' },
    auto: { paper: '#EEF0F3', ink: '#14181E', accent: '#B42318', accent2: '#F2C14E', panel: '#D5DAE0', deep: '#10141A' },
    bridal: { paper: '#F7F1EA', ink: '#2C2118', accent: '#8C5A3C', accent2: '#D9B99B', panel: '#E9DED3', deep: '#3A2A20' },
    trade: { paper: '#F0EDE6', ink: '#1A1C16', accent: '#C2410C', accent2: '#F5C451', panel: '#DDD8CC', deep: '#1F2118' },
  };
  return map[family] || { paper: '#F4EFE7', ink: '#111820', accent: '#F05A28', accent2: '#17324D', panel: '#E6DED4', deep: '#0B1D2D' };
}

function clip(s, n) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n).replace(/\s+\S*$/, '')}.`;
}

function honestCopy(site, harvest, family) {
  const v = harvest?.voice || {};
  const headings = (v.headings || []).filter((h) => h.length > 8 && h.length < 80);
  const paras = (v.paragraphs || []).filter((p) => !/lorem|coming soon|privacy policy|just a moment/i.test(p));
  const badHeadline = /closed our doors|we have closed|out of business|coming soon|lorem|under construction|just a moment/i;
  const headline =
    headings[0] && !/home|welcome to/i.test(headings[0]) && !badHeadline.test(headings[0]) ? headings[0] : site.name;
  const sub =
    paras[0] && !badHeadline.test(paras[0])
      ? paras[0]
      : v.metaDescription && !badHeadline.test(v.metaDescription)
        ? v.metaDescription
        : `${site.name} in ${site.city || 'Pennsylvania'}. Confirm current details on the official source.`;
  const offerings = (headings.slice(1, 6).length >= 3 ? headings.slice(1, 4) : paras.slice(1, 4)).filter(Boolean);
  while (offerings.length < 3) {
    offerings.push(
      family === 'food'
        ? "Confirm today's menu and hours on the official source."
        : 'Confirm current services and availability on the official source.'
    );
  }
  const points =
    family === 'food'
      ? ['The plate comes first', 'Kitchen in motion', 'A table you can trust']
      : ['People who do the work', 'A visit that is easy to start', 'Details confirmed at the source'];
  return {
    headline: clip(headline, 70),
    sub: clip(sub, 220),
    offerings: offerings.slice(0, 3).map((x) => clip(x, 140)),
    points,
    workHeading: family === 'food' ? 'What comes out of this kitchen.' : 'The work, in the room where it happens.',
    galleryHeading: family === 'food' ? 'Food worth sitting down for.' : 'People, not stock extras.',
    contactHeading: 'Make the next visit easy.',
    description: clip(`${site.name} in ${site.city || 'PA'}. Private concept preview.`, 150),
  };
}

function imageAlts(site, family, mode) {
  const caps = captionsFor(family);
  if (mode === 'food') {
    return [
      `Plated food from a ${site.name} kitchen concept`,
      `Chef plating at the pass for ${site.name}`,
      `Prep and ingredients for ${site.name}`,
      `Dining setting for ${site.name}`,
      `Close food texture for ${site.name}`,
    ];
  }
  return caps.map(
    (c, i) =>
      `${c.kicker} photograph for ${site.name} — ${['people at work', 'hands on the job', 'a real conversation', 'the place', 'the craft'][i]}`
  );
}

function loadLocalPhotos(photoDir) {
  if (!fs.existsSync(photoDir)) return [];
  return fs
    .readdirSync(photoDir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .filter((f) => !/^image-\d+\.webp$/i.test(f))
    .map((f) => path.join(photoDir, f))
    .filter((p) => fs.statSync(p).size > 8000);
}

function uniqueSourceCount(paths) {
  const seen = new Set();
  for (const p of paths) {
    try {
      seen.add(fs.realpathSync(p));
    } catch {
      seen.add(p);
    }
  }
  return seen.size;
}

async function saveHarvestedPhotos(imgs, harvestDir, mode) {
  const photoDir = path.join(harvestDir, 'photos');
  fs.mkdirSync(photoDir, { recursive: true });
  const photoPaths = [];
  let idx = loadLocalPhotos(photoDir).filter((p) => /src-\d+\./i.test(path.basename(p))).length;
  for (const photo of imgs.images || []) {
    if (!looksPeopleOrFood(photo, mode)) continue;
    const ext = photo.ext === 'svg' ? 'jpg' : photo.ext || 'jpg';
    const dest = path.join(photoDir, `src-${idx}.${ext}`);
    fs.writeFileSync(dest, photo.buffer);
    photoPaths.push(dest);
    idx += 1;
    if (photoPaths.length >= 8) break;
  }
  return photoPaths;
}

async function processSite(site) {
  const family = familyFor(site.name, site.slug);
  const mode = modeFor(family);
  const outDir = path.join(OUT, 'sites', site.slug);
  const assetDir = path.join(outDir, 'assets');
  const harvestDir = path.join(HARVEST, site.slug);
  const photoDir = path.join(harvestDir, 'photos');
  fs.mkdirSync(assetDir, { recursive: true });
  fs.mkdirSync(photoDir, { recursive: true });

  const receiptPath = path.join(outDir, 'RECEIPT.json');
  if (!fresh && fs.existsSync(receiptPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
      const collages = ['collage-1.webp', 'collage-2.webp', 'collage-3.webp', 'collage-4.webp', 'collage-5.webp'];
      const allThere = collages.every((f) => fs.existsSync(path.join(assetDir, f)) && fs.statSync(path.join(assetDir, f)).size > 8000);
      if (prev.ok && allThere && (prev.sourceCount || 0) >= MIN_SOURCES) return prev;
    } catch {
      /* rebuild */
    }
  }

  const receipt = {
    id: site.id,
    slug: site.slug,
    name: site.name,
    family,
    mode,
    issue: site.issue,
    ok: false,
    qa: [],
  };

  let html = '';
  try {
    html = await fetchText(`${NETLIFY}/sites/${site.slug}/`);
  } catch (err) {
    receipt.error = `netlify fetch: ${err.message}`;
    return receipt;
  }
  const extracted = extractOfficial(html);
  let official = extracted.url;
  const cityGuess = extracted.city;

  const localReady = uniqueSourceCount(loadLocalPhotos(photoDir)) >= MIN_SOURCES;

  let harvest = null;
  if (official && !localReady) {
    try {
      harvest = await harvestLite(official, { timeoutMs: 18000 });
    } catch (err) {
      harvest = { ok: false, reason: String(err.message || err) };
    }
  }

  const facts = harvest?.facts || {};
  const city = (facts.address || '').split(',')[1]?.trim() || cityGuess || 'Pennsylvania';
  const phone = facts.phone || '';
  const address = facts.address || '';
  const hours = facts.hours || '';
  let url = harvest?.finalUrl || official || '';

  // Drop leftover Netlify concept-study placeholders from earlier runs.
  for (const stale of fs.readdirSync(photoDir)) {
    if (/^image-\d+\.webp$/i.test(stale)) fs.unlinkSync(path.join(photoDir, stale));
  }
  if (fresh) {
    for (const stale of fs.readdirSync(photoDir)) {
      if (/^src-\d+\./i.test(stale)) fs.unlinkSync(path.join(photoDir, stale));
    }
  }

  let logoPath = '';
  if (extracted.logo) {
    try {
      const buf = await fetchBin(`${NETLIFY}/sites/${site.slug}/${extracted.logo}`);
      const ext = path.extname(extracted.logo) || '.png';
      const dest = path.join(harvestDir, `logo${ext}`);
      fs.writeFileSync(dest, buf);
      logoPath = dest;
    } catch {
      /* continue */
    }
  }

  const liteChallenged = harvest && isChallenge(harvest.voice?.title, '');
  let photoPaths = [];

  if (harvest?.ok && !liteChallenged) {
    const imgs = await harvestImages(harvest, { max: 16, minWidth: 420, concurrency: 4, timeoutMs: 16000 });
    if (imgs.logo?.buffer) {
      const ext = imgs.logo.ext === 'svg' ? 'png' : imgs.logo.ext || 'png';
      const dest = path.join(harvestDir, `logo.${ext === 'jpg' ? 'png' : ext}`);
      fs.writeFileSync(dest, imgs.logo.buffer);
      logoPath = dest;
    }
    photoPaths = await saveHarvestedPhotos(imgs, harvestDir, mode);
  }

  if (!localReady && official && uniqueSourceCount(photoPaths.concat(loadLocalPhotos(photoDir))) < MIN_SOURCES) {
    const browser = await collectFromPage(official);
    receipt.browser = browser.ok ? 'ok' : browser.reason;
    if (browser.ok && browser.images?.length) {
      url = browser.url || url;
      const merged = {
        ok: true,
        finalUrl: browser.url || official,
        images: browser.images.map((img) => ({ src: img.src, alt: img.alt })),
      };
      const imgs = await harvestImages(merged, { max: 16, minWidth: 400, concurrency: 4, timeoutMs: 16000 });
      if (imgs.logo?.buffer && !logoPath) {
        const dest = path.join(harvestDir, 'logo.png');
        fs.writeFileSync(dest, imgs.logo.buffer);
        logoPath = dest;
      }
      const extra = await saveHarvestedPhotos(imgs, harvestDir, mode);
      photoPaths = photoPaths.concat(extra);
    }
  }

  photoPaths = [...new Set(loadLocalPhotos(photoDir))];
  const sourceCount = uniqueSourceCount(photoPaths);
  const genFills = photoPaths.filter((p) => /^gen-/i.test(path.basename(p)));
  const officialPhotos = photoPaths.filter((p) => /^src-/i.test(path.basename(p)));

  let tokens = defaultPalette(family);
  if (logoPath && fs.existsSync(logoPath)) {
    try {
      const pal = JSON.parse(runPy('palette.py', undefined, [logoPath]));
      if (pal.ok) {
        tokens = {
          paper: pal.paper,
          ink: pal.ink,
          accent: pal.accent,
          accent2: pal.accent2,
          panel: pal.panel,
          deep: pal.deep,
        };
      }
    } catch {
      /* keep family default */
    }
  }
  tokens.onPaper = contrastOn(tokens.paper);
  tokens.onAccent = contrastOn(tokens.accent);
  tokens.onDeep = contrastOn(tokens.deep);
  tokens.radius = '16px';

  if (logoPath) {
    const logoOut = path.join(assetDir, 'logo.png');
    if (path.extname(logoPath).toLowerCase() === '.png') fs.copyFileSync(logoPath, logoOut);
    else {
      spawnSync(
        'python3',
        ['-c', `from PIL import Image; im=Image.open(r'''${logoPath}'''); im.convert('RGBA').save(r'''${logoOut}''')`],
        { encoding: 'utf8' }
      );
    }
  }

  const prompts = scenesFor(family, site.name);
  fs.writeFileSync(
    path.join(harvestDir, 'prompts.json'),
    JSON.stringify({ slug: site.slug, name: site.name, family, mode, prompts }, null, 2)
  );

  receipt.photoCount = photoPaths.length;
  receipt.sourceCount = sourceCount;
  receipt.officialPhotos = officialPhotos.length;
  receipt.genFills = genFills.length;
  receipt.hasLogo = fs.existsSync(path.join(assetDir, 'logo.png'));
  receipt.url = url;
  receipt.city = city;

  if (sourceCount < MIN_SOURCES) {
    receipt.error = `only ${sourceCount} unique industry photograph(s); need generated ${mode}-intent fills`;
    receipt.needsGen = true;
    receipt.prompts = prompts;
    fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
    return receipt;
  }

  const spec = {
    outDir: assetDir,
    sources: photoPaths,
    accent: tokens.accent,
    ink: tokens.ink,
    mode,
    slug: site.slug,
  };
  let composed;
  try {
    composed = JSON.parse(runPy('collage.py', JSON.stringify(spec)));
  } catch (err) {
    receipt.error = `collage: ${err.message}`;
    fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
    return receipt;
  }
  if (!composed.ok) {
    receipt.error = composed.reason;
    fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
    return receipt;
  }

  const copy = honestCopy({ ...site, city }, harvest, family);
  const fonts = fontPairFor(site.slug, family);
  const usedGen = genFills.length > 0;
  const brief = {
    slug: site.slug,
    name: site.name,
    city,
    category: family === 'food' ? 'Food' : family.replace(/^\w/, (c) => c.toUpperCase()),
    family,
    mode,
    url,
    phone,
    address,
    hours,
    logo: receipt.hasLogo,
    tokens,
    fonts,
    attitude: attitudeFor(site.slug, family),
    marquee: [site.name, city, family === 'food' ? 'The plate' : 'The work'].filter(Boolean),
    imageAlts: imageAlts(site, family, mode),
    imageDisclosure: usedGen
      ? 'Illustrative concept imagery plus any photographs harvested from the official site. These visuals do not claim to depict current staff, customers, or completed work.'
      : 'Photographs harvested from the official site and recomposed as concept collages. They are not a claim about current staff or completed jobs.',
    ...copy,
  };

  fs.writeFileSync(path.join(outDir, 'index.html'), renderSite(brief));
  fs.writeFileSync(path.join(OUT, 'briefs', `${site.slug}.json`), JSON.stringify(brief, null, 2));

  const htmlOut = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
  const qa = [];
  const need = ['collage-1.webp', 'collage-2.webp', 'collage-3.webp', 'collage-4.webp', 'collage-5.webp'];
  for (const f of need) {
    const p = path.join(assetDir, f);
    qa.push({ check: f, ok: fs.existsSync(p) && fs.statSync(p).size > 8000 });
  }
  qa.push({ check: 'noindex', ok: /noindex/.test(htmlOut) });
  qa.push({ check: 'logo-or-wordmark', ok: receipt.hasLogo || /wordmark/.test(htmlOut) });
  qa.push({ check: 'swipe', ok: /data-swipe/.test(htmlOut) });
  qa.push({ check: 'reduced-motion', ok: /prefers-reduced-motion/.test(htmlOut) });
  qa.push({ check: 'no-webgl-required', ok: !/scene-canvas|forcegl/.test(htmlOut) });
  qa.push({ check: 'unique-collages', ok: new Set(composed.hashes).size === 5 });
  qa.push({ check: 'enough-sources', ok: sourceCount >= MIN_SOURCES });
  qa.push({ check: 'people-or-food-mode', ok: mode === 'food' || mode === 'people' });
  receipt.qa = qa;
  receipt.ok = qa.every((q) => q.ok);
  receipt.hashes = composed.hashes;
  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
  return receipt;
}

async function pool(items, n, fn) {
  const out = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
  return out;
}

function writeHub(results) {
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cards = results
    .filter((r) => r && !r.dropped)
    .map((r) => {
      const status = r.ok ? 'ready' : r.needsGen ? 'needs-images' : 'blocked';
      return `<a class="card ${status}" href="sites/${r.slug}/"><strong>${esc(r.name)}</strong><span>${esc(r.family)} · ${status}</span>${r.ok ? `<img src="sites/${r.slug}/assets/collage-1.webp" alt="">` : ''}</a>`;
    })
    .join('');
  fs.writeFileSync(
    path.join(OUT, 'index.html'),
    `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Unslop 138</title>
<style>body{font:16px/1.4 system-ui;background:#111;color:#eee;margin:0}header{padding:24px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;padding:24px}.card{display:block;background:#1c1c1c;color:#fff;text-decoration:none;border-radius:12px;overflow:hidden}.card img{width:100%;aspect-ratio:4/5;object-fit:cover}.card strong,.card span{display:block;padding:8px 10px 0}.card span{opacity:.7;padding-bottom:12px}.ready{outline:2px solid #3ddc84}.blocked{outline:2px solid #c2410c}.needs-images{outline:2px solid #f5c451}</style>
<header><h1>138-site unslop</h1><p>Private. noindex. Sheet updates only after QA green. People at work; food for kitchens.</p></header>
<div class="grid">${cards}</div>`
  );
}

async function main() {
  fs.mkdirSync(path.join(OUT, 'sites'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'briefs'), { recursive: true });
  let queue = loadQueue();
  if (only.length) queue = queue.filter((q) => only.includes(q.slug) || only.includes(String(q.id)));
  if (limit) queue = queue.slice(0, limit);

  const results = [];
  const active = queue.filter((q) => !q.drop);
  const dropped = queue.filter((q) => q.drop);

  const built = await pool(active, 3, async (site) => {
    process.stdout.write(`→ ${site.id} ${site.slug}\n`);
    try {
      return await processSite(site);
    } catch (err) {
      return { ...site, ok: false, error: String(err.message || err) };
    }
  });
  results.push(...built);
  for (const d of dropped) {
    results.push({ ...d, ok: false, dropped: true, reason: 'duplicate row — keep the canonical slug' });
  }

  const summary = {
    total: queue.length,
    built: built.filter((r) => r.ok).length,
    needsGen: built.filter((r) => r.needsGen).length,
    blocked: built.filter((r) => !r.ok && !r.needsGen).length,
    dropped: dropped.length,
    results,
  };
  fs.writeFileSync(path.join(OUT, 'SUMMARY.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(HERE, 'needs-gen.json'), JSON.stringify(built.filter((r) => r.needsGen), null, 2));
  writeHub(results);
  console.log(
    JSON.stringify({ built: summary.built, needsGen: summary.needsGen, blocked: summary.blocked, dropped: summary.dropped })
  );
  await closeBrowser();
}

main().catch(async (err) => {
  console.error(err);
  await closeBrowser();
  process.exit(1);
});
