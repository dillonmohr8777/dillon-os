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
 * Duplicates are skipped. Deploy is not performed. Outreach is the sales
 * manager's job. This factory only improves the homepages.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { harvestLite, extractFacts } = require('../../_os/automation/lib/harvest-lite');
const { harvestImages } = require('../../_os/automation/lib/harvest-images');
const crypto = require('crypto');
const { familyFor, modeFor, scenesFor, captionsFor, attitudeFor, fontPairFor, pickOfficialUrl } = require('./intent');
const { renderSite, contrastOn } = require('./render');
const { honestCopy, voiceFromHtml, wordCount } = require('./copy');
const { collectFromPage, closeBrowser, isChallenge } = require('./harvest-browser');

const ROOT = path.resolve(__dirname, '../..');
const HERE = __dirname;
const NETLIFY = 'https://momentum-prospect-radar-next20-2026-08-11.netlify.app';
const OUT = path.join(ROOT, '02_Campaigns', 'AI Site Builder Outreach Engine', 'batches', 'radar-unslop-20260819');
const HARVEST = path.join(HERE, 'harvest');
const only = process.argv.filter((a) => a.startsWith('--only=')).map((a) => a.slice(7));
const limit = Number((process.argv.find((a) => a.startsWith('--limit=')) || '').split('=')[1] || 0);
const fresh = process.argv.includes('--fresh');
const rerender = process.argv.includes('--rerender');
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
  let last = new Error('fetch failed');
  for (let i = 0; i < 3; i += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': 'Mozilla/5.0 DillonOS-unslop' },
        redirect: 'follow',
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return await res.text();
    } catch (err) {
      last = err;
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
  throw last;
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
    legal: { paper: '#F4F1EA', ink: '#1B1A16', accent: '#8C5A2B', accent2: '#C4A574', panel: '#E7DFD2', deep: '#1A1814' },
    salon: { paper: '#F6F0F3', ink: '#1C1218', accent: '#BE185D', accent2: '#F9A8D4', panel: '#EBD7E2', deep: '#2A1020' },
    fitness: { paper: '#EEF2F0', ink: '#121816', accent: '#15803D', accent2: '#86EFAC', panel: '#D7E4DA', deep: '#102018' },
    medical: { paper: '#F2F6F8', ink: '#12202A', accent: '#0369A1', accent2: '#7DD3FC', panel: '#D5E4EE', deep: '#0C2230' },
    retail: { paper: '#F5F1EA', ink: '#1A1612', accent: '#B45309', accent2: '#F5D0A6', panel: '#E8DCCB', deep: '#22180E' },
    professional: { paper: '#F3F4F6', ink: '#111827', accent: '#1D4ED8', accent2: '#93C5FD', panel: '#DCE3EE', deep: '#0B1220' },
  };
  return map[family] || { paper: '#F4EFE7', ink: '#111820', accent: '#F05A28', accent2: '#17324D', panel: '#E6DED4', deep: '#0B1D2D' };
}

function attitudeChrome(attitude) {
  const map = {
    glass: { border: '1px', radius: '28px' },
    editorial: { border: '1px', radius: '2px' },
    brutal: { border: '4px', radius: '0px' },
    warm: { border: '1px', radius: '22px' },
    industrial: { border: '2px', radius: '4px' },
    neon: { border: '1px', radius: '18px' },
  };
  return map[attitude] || map.warm;
}

function hashCollages(assetDir) {
  return [1, 2, 3, 4, 5].map((i) => {
    const p = path.join(assetDir, `collage-${i}.webp`);
    return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  });
}

function recoverLogo(dir) {
  if (!dir || !fs.existsSync(dir)) return '';
  const hits = [];
  for (const f of fs.readdirSync(dir)) {
    if (!/^logo/i.test(f) || !/\.(png|svg|webp|jpe?g)$/i.test(f)) continue;
    const p = path.join(dir, f);
    const size = fs.statSync(p).size;
    if (/\.svg$/i.test(f) ? size < 400 : size < 2048) continue;
    hits.push({ p, size });
  }
  hits.sort((a, b) => b.size - a.size);
  return hits[0]?.p || '';
}

function writeLogoPng(srcPath, destPng) {
  if (!srcPath || !fs.existsSync(srcPath)) return { ok: false, src: '' };
  const destDir = path.dirname(destPng);
  const destSvg = path.join(destDir, 'logo.svg');
  const ext = path.extname(srcPath).toLowerCase();
  try {
    if (ext === '.svg') {
      fs.copyFileSync(srcPath, destSvg);
      spawnSync(
        'python3',
        ['-c', `from PIL import Image\ntry:\n im=Image.open(r'''${srcPath}''')\n im.convert('RGBA').save(r'''${destPng}''')\nexcept Exception:\n pass`],
        { encoding: 'utf8' }
      );
      if (fs.existsSync(destPng) && fs.statSync(destPng).size >= 800) return { ok: true, src: 'assets/logo.png' };
      return { ok: true, src: 'assets/logo.svg' };
    }
    if (ext === '.png') {
      if (fs.statSync(srcPath).size < 2048) return { ok: false, src: '' };
      fs.copyFileSync(srcPath, destPng);
      return { ok: true, src: 'assets/logo.png' };
    }
    spawnSync(
      'python3',
      ['-c', `from PIL import Image; im=Image.open(r'''${srcPath}'''); im.convert('RGBA').save(r'''${destPng}''')`],
      { encoding: 'utf8' }
    );
    if (fs.existsSync(destPng) && fs.statSync(destPng).size >= 2048) return { ok: true, src: 'assets/logo.png' };
    return { ok: false, src: '' };
  } catch {
    return { ok: false, src: '' };
  }
}

async function fetchFirstPartyLogo(images, baseUrl, harvestDir) {
  const list = Array.isArray(images) ? images : [];
  for (const img of list) {
    const hay = `${img.src || img.url || ''} ${img.alt || ''}`;
    if (!/(logo|brandmark|wordmark|site-?logo)/i.test(hay)) continue;
    if (/(favicon|sprite|pixel|icon[-_.]|apple-touch|og:image|opengraph)/i.test(hay)) continue;
    let href = img.src || img.url || '';
    try {
      href = new URL(href, baseUrl || undefined).href;
    } catch {
      continue;
    }
    try {
      const buf = await fetchBin(href);
      if (buf.length < 800) continue;
      const extMatch = href.match(/\.(svg|png|webp|jpe?g)(?:\?|$)/i);
      const ext = extMatch ? `.${extMatch[1].toLowerCase().replace('jpeg', 'jpg')}` : '.png';
      if (ext !== '.svg' && buf.length < 2048) continue;
      const dest = path.join(harvestDir, `logo-url${ext}`);
      fs.writeFileSync(dest, buf);
      return dest;
    } catch {
      /* try the next candidate */
    }
  }
  return '';
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
      `${c.kicker} photograph for ${site.name}: ${['people at work', 'hands on the job', 'a real conversation', 'the place', 'the craft'][i]}`
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
  if (!fresh && !rerender && fs.existsSync(receiptPath)) {
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
    receipt.netlifyError = String(err.message || err);
    if (uniqueSourceCount(loadLocalPhotos(photoDir)) < MIN_SOURCES) {
      receipt.error = `netlify fetch: ${err.message}`;
      return receipt;
    }
  }
  const extracted = html ? extractOfficial(html) : { url: '', logo: '', city: '' };
  let prevUrl = '';
  if (fs.existsSync(receiptPath)) {
    try {
      prevUrl = JSON.parse(fs.readFileSync(receiptPath, 'utf8')).url || '';
    } catch {
      /* ignore */
    }
  }
  let official = pickOfficialUrl(site.name, site.slug, [prevUrl, extracted.url]);
  const cityGuess = extracted.city;

  const localReady = uniqueSourceCount(loadLocalPhotos(photoDir)) >= MIN_SOURCES;

  let harvest = null;
  if (official) {
    try {
      harvest = await harvestLite(official, { timeoutMs: 16000 });
    } catch (err) {
      harvest = { ok: false, reason: String(err.message || err) };
    }
  }

  const liteChallenged = harvest && isChallenge(harvest.voice?.title, '');
  const thinVoice = !harvest?.ok || liteChallenged || (harvest.voice?.wordCount || 0) < 80;
  if (official && thinVoice) {
    const browser = await collectFromPage(official);
    receipt.browser = browser.ok ? 'ok' : browser.reason;
    if (browser.ok && browser.html) {
      const text = browser.html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ');
      harvest = {
        ok: true,
        finalUrl: browser.url || official,
        voice: voiceFromHtml(browser.html),
        facts: extractFacts(browser.html, text),
        images: browser.images || [],
      };
    } else if (browser.ok && browser.images?.length) {
      harvest = harvest || { ok: false, images: [] };
      harvest.images = (harvest.images || []).concat(browser.images);
    }
  }

  const voiceCache = path.join(harvestDir, 'voice.json');
  if ((!harvest || !harvest.ok || !(harvest.voice?.headings || []).length) && fs.existsSync(voiceCache)) {
    try {
      const cached = JSON.parse(fs.readFileSync(voiceCache, 'utf8'));
      if (cached.voice) {
        harvest = harvest || {};
        harvest.ok = true;
        harvest.voice = (harvest.voice?.headings || []).length ? harvest.voice : cached.voice;
        harvest.facts = harvest.facts || {
          phone: cached.phone,
          address: cached.address,
          hours: cached.hours,
        };
        harvest.finalUrl = harvest.finalUrl || cached.url || official;
        receipt.harvestCached = true;
      }
    } catch {
      /* ignore broken cache */
    }
  }

  const facts = harvest?.facts || {};
  const city = (facts.address || '').split(',')[1]?.trim() || cityGuess || 'Pennsylvania';
  const phone = facts.phone || '';
  const address = facts.address || '';
  const hours = facts.hours || '';
  let url = pickOfficialUrl(site.name, site.slug, [official, harvest?.finalUrl, prevUrl]);

  for (const stale of fs.readdirSync(photoDir)) {
    if (/^image-\d+\.webp$/i.test(stale)) fs.unlinkSync(path.join(photoDir, stale));
  }
  if (fresh) {
    for (const stale of fs.readdirSync(photoDir)) {
      if (/^src-\d+\./i.test(stale)) fs.unlinkSync(path.join(photoDir, stale));
    }
  }

  let logoPath = recoverLogo(harvestDir) || recoverLogo(assetDir);
  let photoPaths = [];

  if (harvest?.ok && !isChallenge(harvest.voice?.title, '')) {
    const pulled = await fetchFirstPartyLogo(harvest.images, harvest.finalUrl || url, harvestDir);
    if (pulled) logoPath = pulled;
    if (!rerender || !logoPath) {
      const imgs = await harvestImages(harvest, { max: rerender ? 8 : 16, minWidth: 420, concurrency: 4, timeoutMs: 16000 });
      if (imgs.logo?.buffer) {
        const dest = path.join(harvestDir, imgs.logo.ext === 'svg' ? 'logo-harvest.svg' : 'logo-harvest.png');
        fs.writeFileSync(dest, imgs.logo.buffer);
        logoPath = dest;
      }
      if (!rerender) photoPaths = await saveHarvestedPhotos(imgs, harvestDir, mode);
    }
  }

  if (!rerender && !localReady && official && uniqueSourceCount(photoPaths.concat(loadLocalPhotos(photoDir))) < MIN_SOURCES) {
    const browser = await collectFromPage(official);
    receipt.browser = receipt.browser || (browser.ok ? 'ok' : browser.reason);
    if (browser.ok && browser.images?.length) {
      url = pickOfficialUrl(site.name, site.slug, [browser.url, url, official, prevUrl]) || url;
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

  if (!logoPath && extracted.logo) {
    try {
      const buf = await fetchBin(`${NETLIFY}/sites/${site.slug}/${extracted.logo}`);
      const dest = path.join(harvestDir, `logo-netlify${path.extname(extracted.logo) || '.png'}`);
      fs.writeFileSync(dest, buf);
      if (buf.length >= 2048 || path.extname(extracted.logo).toLowerCase() === '.svg') logoPath = dest;
    } catch {
      /* continue */
    }
  }

  photoPaths = [...new Set(loadLocalPhotos(photoDir))];
  const sourceCount = uniqueSourceCount(photoPaths);
  const genFills = photoPaths.filter((p) => /^gen-/i.test(path.basename(p)));
  const officialPhotos = photoPaths.filter((p) => /^src-/i.test(path.basename(p)));
  const logoOut = path.join(assetDir, 'logo.png');
  const logoWrite = writeLogoPng(logoPath, logoOut);
  receipt.hasLogo = logoWrite.ok;
  receipt.logoSrc = logoWrite.src;
  if (!logoWrite.ok && fs.existsSync(logoOut) && fs.statSync(logoOut).size < 2048) fs.unlinkSync(logoOut);

  let tokens = defaultPalette(family);
  if (receipt.hasLogo && fs.existsSync(logoOut) && fs.statSync(logoOut).size >= 800) {
    try {
      const pal = JSON.parse(runPy('palette.py', undefined, [logoOut]));
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
  const chrome = attitudeChrome(attitudeFor(site.slug, family), tokens);
  tokens = { ...tokens, ...chrome };
  tokens.onPaper = contrastOn(tokens.paper);
  tokens.onAccent = contrastOn(tokens.accent);
  tokens.onDeep = contrastOn(tokens.deep);
  tokens.radius = chrome.radius;

  const prompts = scenesFor(family, site.name);
  fs.writeFileSync(
    path.join(harvestDir, 'prompts.json'),
    JSON.stringify({ slug: site.slug, name: site.name, family, mode, prompts }, null, 2)
  );
  fs.writeFileSync(
    path.join(harvestDir, 'voice.json'),
    JSON.stringify(
      {
        slug: site.slug,
        name: site.name,
        url,
        city,
        phone,
        address,
        hours,
        harvestOk: Boolean(harvest?.ok),
        voice: harvest?.voice || {},
        headings: (harvest?.headings || []).slice(0, 12),
        paras: (harvest?.paragraphs || []).slice(0, 8),
      },
      null,
      2
    )
  );

  receipt.photoCount = photoPaths.length;
  receipt.sourceCount = sourceCount;
  receipt.officialPhotos = officialPhotos.length;
  receipt.genFills = genFills.length;
  receipt.url = url;
  receipt.city = city;
  receipt.rerender = rerender;

  if (sourceCount < MIN_SOURCES && !rerender) {
    receipt.error = `only ${sourceCount} unique industry photograph(s); need generated ${mode}-intent fills`;
    receipt.needsGen = true;
    receipt.prompts = prompts;
    fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
    return receipt;
  }

  let composed;
  const existingCollages = ['collage-1.webp', 'collage-2.webp', 'collage-3.webp', 'collage-4.webp', 'collage-5.webp']
    .map((f) => path.join(assetDir, f))
    .filter((p) => fs.existsSync(p) && fs.statSync(p).size > 8000);
  if (rerender && existingCollages.length === 5) {
    composed = { ok: true, hashes: hashCollages(assetDir), reused: true };
  } else {
    const spec = {
      outDir: assetDir,
      sources: photoPaths,
      accent: tokens.accent,
      ink: tokens.ink,
      mode,
      slug: site.slug,
    };
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
  }

  const copy = honestCopy({ ...site, city, url, phone, address, hours }, harvest, family);
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
    logoSrc: receipt.logoSrc || 'assets/logo.png',
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
  qa.push({ check: 'five-slides', ok: (htmlOut.match(/class="slide(?: is-on)?"/g) || []).length >= 5 });
  qa.push({ check: 'json-ld', ok: /application\/ld\+json/.test(htmlOut) });
  qa.push({ check: 'offering-cards', ok: /offering-card/.test(htmlOut) });
  qa.push({ check: 'enough-sections', ok: (htmlOut.match(/<section/g) || []).length >= 8 });
  qa.push({ check: 'reduced-motion', ok: /prefers-reduced-motion/.test(htmlOut) });
  qa.push({ check: 'no-webgl-required', ok: !/scene-canvas|forcegl/.test(htmlOut) });
  qa.push({ check: 'unique-collages', ok: new Set(composed.hashes).size === 5 });
  qa.push({ check: 'enough-sources', ok: rerender || sourceCount >= MIN_SOURCES });
  qa.push({ check: 'people-or-food-mode', ok: mode === 'food' || mode === 'people' });
  qa.push({ check: 'no-em-dash', ok: !htmlOut.includes('\u2014') });
  receipt.qa = qa;
  receipt.ok = qa.every((q) => q.ok);
  receipt.hashes = composed.hashes;
  receipt.copyWords = copy.wordCount || wordCount(copy);
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
<header><h1>138-site unslop</h1><p>Private. noindex. Homepage quality pass. Outreach sits with the sales manager. Do not mail from this factory.</p></header>
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
    results.push({ ...d, ok: false, dropped: true, reason: 'duplicate row: keep the canonical slug' });
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
