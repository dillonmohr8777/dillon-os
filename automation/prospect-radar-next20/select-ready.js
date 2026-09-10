#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { resolveGeneratedStockAssignment } = require('./generated-stock-categories');
const { decodePng, encodePng, measureAlpha, removeFlatBackground } = require('../../_os/automation/lib/logo-audit');
const { decodeJpeg } = require('../../_os/automation/lib/jpeg-decode');
const { dedupeDecisions } = require('../../_os/automation/lib/logo-eligibility');

const root = path.resolve(__dirname, '..', '..');
const codexRoot = path.resolve(root, '..', '..');
const runId = process.env.PROSPECT_RADAR_RUN_ID || process.argv[2];
if (!/^\d{8}-\d{6}$/.test(runId || '')) {
  throw new Error('Run id must use yyyyMMdd-HHmmss.');
}

const runDir = path.join(__dirname, 'runs', runId);
const batchDir = path.join(root, '02_Campaigns', 'AI Site Builder Outreach Engine', 'batches', `radar-next20-${runId}`);
const registryPath = path.join(root, '12_Brain', 'state', 'radar', 'registry.json');
const selectionPath = path.join(runDir, 'SELECTION-EVIDENCE.json');
const generatedStockLibrary = path.join(__dirname, 'generated-stock-library');
const targetCount = 20;
const BUILDABLE_VERDICTS = new Set(['rebuild', 'polish']);
const readinessPolicy = 'Current Radar rebuild or polish at 0.90 confidence or higher, phone present, untouched domain and slug, reachable official HTML, identity match, exact transparent first-party logo or deterministic flat-background removal with unchanged geometry, at least one usable first-party visual reference, and an approved category-relevant generated-stock board. A provisional Radar grade is accepted only after this live source, identity, and stock-readiness preflight passes.';
const generatedStockBoardHashes = new Map();

const artifactNames = new Set([
  'selection-evidence.json',
  'deployment.json',
  'provenance.json',
  'targets.json',
  'manifest.csv',
  'batch-summary.json',
  'run-manifest.json',
  'final-audit.json',
]);
const domainFields = new Set([
  'sourcesite', 'siteurl', 'radardomain', 'domain', 'url', 'website',
  'officialurl', 'sourceurl', 'homepage',
]);
const hardDomains = new Set(
  'davidsonfab.com smileculture.com metalmorphoseironworks.com bebalancedcenters.com plasticsurgerysolutions.com liveurgentcare.com saltersfireplace.com dreammaker-remodel.com southamptonhottub.com philadelphiagarage.com osterviolins.com blshoes.com floralandhardyofskippack.com go2tech.com candcsuperseal.com andorradental.com padentalgroup.com gleneaglepediatricdentistry.com dreamteampa.com erlegal.com maclarenfab.com goldeneaglejewelry.com mortonelectric.com porterspubeaston.com'.split(' ')
);

const sha256Buffer = (value) => crypto.createHash('sha256').update(value).digest('hex');
const sha256File = (file) => sha256Buffer(fs.readFileSync(file));
const slugify = (value) => String(value || '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 72);
const normalizeDomain = (value) => {
  try {
    let candidate = String(value || '').trim();
    if (!candidate) return '';
    if (!/^https?:/i.test(candidate)) candidate = `https://${candidate}`;
    return new URL(candidate).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
};
const atomicJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temp, file);
};
const atomicText = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temp, value, 'utf8');
  fs.renameSync(temp, file);
};
const writeBoth = (filename, value) => {
  atomicJson(path.join(runDir, filename), value);
  atomicJson(path.join(batchDir, filename), value);
};

function generatedStockEvidence(candidate, slug = slugify(candidate.name || candidate.domain)) {
  const [boardKey, descriptor] = resolveGeneratedStockAssignment({
    slug,
    name: candidate.name,
    vertical: candidate.vertical,
    verticalGroup: candidate.verticalGroup,
  });
  const boardFile = path.join(generatedStockLibrary, `${boardKey}.png`);
  if (!fs.existsSync(boardFile)) throw new Error(`approved generated-stock board is missing: ${boardKey}`);
  if (!generatedStockBoardHashes.has(boardKey)) generatedStockBoardHashes.set(boardKey, sha256File(boardFile));
  return { boardKey, descriptor, boardSha256: generatedStockBoardHashes.get(boardKey) };
}

function parseCsv(source) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (char !== '\r') cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function collectArtifactFields(value, domains, slugs) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectArtifactFields(item, domains, slugs));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    const lowerKey = key.toLowerCase();
    if (domainFields.has(lowerKey) && typeof nested === 'string') {
      const domain = normalizeDomain(nested);
      if (domain) domains.add(domain);
    }
    if (lowerKey === 'slug' && typeof nested === 'string') slugs.add(nested.toLowerCase());
    collectArtifactFields(nested, domains, slugs);
  }
}

function scanPriorEvidence() {
  const domains = new Set(hardDomains);
  const slugs = new Set();
  const scanned = [];
  const skipped = [];
  const patterns = [...artifactNames].map((name) => ['-g', `**/${name}`]).flat();
  const result = spawnSync('rg', ['--files', codexRoot, ...patterns, '-g', '!**/node_modules/**', '-g', '!**/.git/**'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  if (![0, 1].includes(result.status)) throw new Error(result.stderr || 'Prior build artifact scan failed.');
  const files = String(result.stdout || '').split(/\r?\n/).filter(Boolean);
  for (const file of files) {
    const lower = file.toLowerCase();
    if (lower.includes(`radar-next20-${runId}`) || lower.includes(`prospect-radar-next20\\runs\\${runId}`)) continue;
    if (!/(radar|prospect|site.builder|site-factory|website|philly|phl|next\d+)/i.test(file)) {
      skipped.push(file);
      continue;
    }
    const name = path.basename(file).toLowerCase();
    try {
      if (name === 'manifest.csv') {
        const [header = [], ...rows] = parseCsv(fs.readFileSync(file, 'utf8'));
        for (const row of rows) {
          header.forEach((column, index) => {
            if (!domainFields.has(String(column || '').toLowerCase())) return;
            const domain = normalizeDomain(row[index]);
            if (domain) domains.add(domain);
          });
          const slugIndex = header.findIndex((column) => String(column || '').toLowerCase() === 'slug');
          if (slugIndex >= 0 && row[slugIndex]) slugs.add(String(row[slugIndex]).toLowerCase());
        }
      } else {
        collectArtifactFields(JSON.parse(fs.readFileSync(file, 'utf8')), domains, slugs);
      }
      scanned.push(file);
    } catch (error) {
      throw new Error(`Cannot scan prior evidence ${file}: ${error.message}`);
    }
  }
  return {
    domains,
    slugs,
    files: scanned,
    skippedCount: skipped.length,
    inventorySha256: sha256Buffer(scanned.slice().sort().join('\n')),
  };
}

function decodeEntities(value) {
  return String(value || '')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function attrValue(tag, name) {
  const quoted = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  if (quoted) return decodeEntities(quoted[2].trim());
  const bare = tag.match(new RegExp(`\\b${name}\\s*=\\s*([^\\s>]+)`, 'i'));
  return bare ? decodeEntities(bare[1].trim()) : '';
}

function absoluteUrl(value, baseUrl) {
  try {
    const source = String(value || '').trim();
    if (!source || /^(data:|blob:|javascript:|#)/i.test(source)) return '';
    return new URL(source, baseUrl).href;
  } catch {
    return '';
  }
}

function extensionFor(type, url) {
  if (type === 'svg') return '.svg';
  if (type === 'png') return '.png';
  if (type === 'webp') return '.webp';
  if (type === 'jpeg') return '.jpg';
  if (type === 'gif') return '.gif';
  if (type === 'avif') return '.avif';
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  return ['.svg', '.png', '.webp', '.jpg', '.jpeg', '.gif', '.avif'].includes(ext) ? ext.replace('.jpeg', '.jpg') : '.bin';
}

function imageType(bytes, contentType = '') {
  const type = contentType.toLowerCase();
  const head = bytes.subarray(0, 256).toString('utf8').trimStart();
  if (type.includes('svg') || /^<\?xml|^<svg/i.test(head) || /<svg[\s>]/i.test(head)) return 'svg';
  if (bytes.length >= 24 && bytes.subarray(1, 4).toString('ascii') === 'PNG') return 'png';
  if (bytes.length >= 12 && bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpeg';
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (bytes.length >= 12 && bytes.subarray(4, 12).toString('ascii').includes('ftypavif')) return 'avif';
  if (bytes.length >= 6 && bytes.subarray(0, 3).toString('ascii') === 'GIF') return 'gif';
  return '';
}

function imageDimensions(bytes, type) {
  if (type === 'svg') {
    const source = bytes.toString('utf8');
    const viewBox = source.match(/viewBox\s*=\s*["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
    if (viewBox) return { width: Math.round(Number(viewBox[1])), height: Math.round(Number(viewBox[2])) };
    const width = source.match(/\bwidth\s*=\s*["']([\d.]+)/i);
    const height = source.match(/\bheight\s*=\s*["']([\d.]+)/i);
    if (width && height) return { width: Math.round(Number(width[1])), height: Math.round(Number(height[1])) };
    return { width: 1000, height: 400 };
  }
  if (type === 'png' && bytes.length >= 24) return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (type === 'gif' && bytes.length >= 10) return { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) };
  if (type === 'jpeg') {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
      const marker = bytes[offset];
      offset += 1;
      if (marker === 0xd8 || marker === 0xd9) continue;
      if (offset + 1 >= bytes.length) break;
      const length = bytes.readUInt16BE(offset);
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { height: bytes.readUInt16BE(offset + 3), width: bytes.readUInt16BE(offset + 5) };
      }
      if (length < 2) break;
      offset += length;
    }
  }
  if (type === 'webp' && bytes.length >= 30) {
    const kind = bytes.subarray(12, 16).toString('ascii');
    if (kind === 'VP8X') return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
    if (kind === 'VP8L' && bytes[20] === 0x2f) {
      return {
        width: 1 + bytes[21] + ((bytes[22] & 0x3f) << 8),
        height: 1 + ((bytes[22] & 0xc0) >> 6) + (bytes[23] << 2) + ((bytes[24] & 0x0f) << 10),
      };
    }
    if (kind === 'VP8 ' && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
      return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
    }
  }
  return null;
}

function hasTransparentBackground(bytes, type) {
  if (type === 'svg') {
    const source = bytes.toString('utf8');
    if (/<script[\s>]/i.test(source)) return false;
    const fullRect = source.match(/<rect\b[^>]*(?:width\s*=\s*["']100%["'][^>]*height\s*=\s*["']100%["']|height\s*=\s*["']100%["'][^>]*width\s*=\s*["']100%["'])[^>]*>/i);
    return !fullRect || /fill\s*=\s*["'](?:none|transparent)["']/i.test(fullRect[0]);
  }
  if (type === 'png' && bytes.length > 26) return [4, 6].includes(bytes[25]);
  if (type === 'webp' && bytes.length > 21 && bytes.subarray(12, 16).toString('ascii') === 'VP8X') return Boolean(bytes[20] & 0x10);
  if (type === 'gif') return bytes.includes(Buffer.from([0x21, 0xf9, 0x04]));
  return false;
}

/**
 * Alpha, background removal and tonal checks now come from the shared
 * pure-Node auditor rather than five separate ffmpeg invocations.
 *
 * Two reasons. First, this selector could not run anywhere without an ffmpeg
 * binary -- not on a GitHub runner without an install step, not in the cloud
 * container -- which pinned the whole daily lane to one Windows machine.
 * Second, the ffmpeg path used a global `colorkey`, which erases every pixel
 * matching the plate colour *anywhere* in the mark: a white knockout inside a
 * roundel comes out as a hole. lib/logo-audit.js floods inward from the border
 * instead, so interior plate-coloured pixels survive.
 */
function rasterAlphaAudit(file, type) {
  if (type === 'svg') return { ok: true, vector: true };
  let decoded;
  try {
    decoded = decodePng(fs.readFileSync(file));
  } catch (error) {
    return { ok: false, reason: `logo could not be read: ${String(error.message || error).slice(0, 60)}` };
  }
  if (decoded.error) return { ok: false, reason: decoded.error };
  const measured = measureAlpha(decoded.rgba, decoded.width, decoded.height);
  const ok = measured.transparentRatio >= 0.02 && measured.contentRatio >= 0.02;
  return {
    ok,
    transparentRatio: Number(measured.transparentRatio.toFixed(4)),
    edgeTransparentRatio: Number(measured.edgeTransparentRatio.toFixed(4)),
    contentRatio: Number(measured.contentRatio.toFixed(4)),
    reason: ok ? null : 'alpha plane is empty, effectively opaque, or lacks meaningful transparent area',
  };
}

/** A reference image must carry real tonal range, not be a flat colour field. */
function rasterVisualAudit(file) {
  let bytes;
  try {
    bytes = fs.readFileSync(file);
  } catch (error) {
    return { ok: false, reason: 'reference could not be read' };
  }
  const type = imageType(bytes, '');
  const decoded = type === 'jpg' || type === 'jpeg' ? decodeJpeg(bytes) : decodePng(bytes);
  if (decoded.error) return { ok: false, reason: decoded.error };
  let min = 255, max = 0;
  const { rgba, width, height } = decoded;
  const stride = Math.max(1, Math.floor((width * height) / 20000));
  for (let p = 0; p < width * height; p += stride) {
    const o = p * 4;
    if (rgba[o + 3] < 200) continue;
    const luma = 0.2126 * rgba[o] + 0.7152 * rgba[o + 1] + 0.0722 * rgba[o + 2];
    if (luma < min) min = luma;
    if (luma > max) max = luma;
  }
  const range = max - min;
  const ok = range >= 12;
  return {
    ok,
    lumaRange: Number(range.toFixed(1)),
    reason: ok ? null : 'reference is flat or lacks enough tonal variation to serve as visual evidence',
  };
}

function removeFlatLogoBackground(bytes, type, dimensions, directory) {
  const decoded = type === 'jpg' || type === 'jpeg' ? decodeJpeg(bytes) : decodePng(bytes);
  if (decoded.error) return { error: `unsupported background-removal source: ${decoded.error}` };
  const cut = removeFlatBackground(decoded.rgba, decoded.width, decoded.height);
  if (cut.error) return { error: cut.error };
  fs.mkdirSync(directory, { recursive: true });
  const sourceFile = path.join(directory, `logo-source${extensionFor(type === 'jpeg' ? 'jpg' : type, '')}`);
  fs.writeFileSync(sourceFile, bytes);
  const output = path.join(directory, 'logo.png');
  const outputBytes = encodePng(cut.rgba, decoded.width, decoded.height);
  fs.writeFileSync(output, outputBytes);
  const alpha = rasterAlphaAudit(output, 'png');
  if (!alpha.ok) return { error: `background removal produced an unusable logo: ${alpha.reason}` };
  return {
    file: output,
    bytes: outputBytes,
    transformation: cut.transformation,
    sourceFile,
    sourceSha256: sha256Buffer(bytes),
    sourceType: type,
    borderSpread: cut.border.spread,
    alpha,
  };
}

async function fetchWithLimit(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 14000);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ProspectRadarEvidence/2.0',
        accept: options.accept || '*/*',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const declared = Number(response.headers.get('content-length') || 0);
    const maxBytes = options.maxBytes || 8 * 1024 * 1024;
    if (declared > maxBytes) throw new Error(`asset exceeds ${maxBytes} bytes`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > maxBytes) throw new Error(`asset exceeds ${maxBytes} bytes`);
    return { response, bytes };
  } finally {
    clearTimeout(timeout);
  }
}

function discoverAssetUrls(html, baseUrl) {
  const logos = [];
  const references = [];
  const add = (list, value, score, evidence) => {
    const url = absoluteUrl(value, baseUrl);
    if (!url || list.some((item) => item.url === url)) return;
    list.push({ url, score, evidence });
  };

  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const stack = Array.isArray(parsed) ? [...parsed] : [parsed];
      while (stack.length) {
        const value = stack.shift();
        if (!value || typeof value !== 'object') continue;
        if (typeof value.logo === 'string') add(logos, value.logo, 120, 'JSON-LD logo');
        else if (value.logo && typeof value.logo.url === 'string') add(logos, value.logo.url, 120, 'JSON-LD logo URL');
        Object.values(value).forEach((nested) => {
          if (nested && typeof nested === 'object') stack.push(nested);
        });
      }
    } catch {
      // Invalid third-party JSON-LD does not prevent HTML asset evidence.
    }
  }

  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const property = `${attrValue(tag, 'property')} ${attrValue(tag, 'name')}`.toLowerCase();
    const content = attrValue(tag, 'content');
    if (/logo/.test(property)) add(logos, content, 115, property.trim());
    if (/(og:image|twitter:image)/.test(property)) add(references, content, 100, property.trim());
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const descriptor = `${attrValue(tag, 'class')} ${attrValue(tag, 'id')} ${attrValue(tag, 'alt')} ${attrValue(tag, 'title')}`.toLowerCase();
    const source = attrValue(tag, 'src') || attrValue(tag, 'data-src') || attrValue(tag, 'data-lazy-src');
    const srcset = attrValue(tag, 'srcset') || attrValue(tag, 'data-srcset');
    const srcsetLast = srcset ? srcset.split(',').map((part) => part.trim().split(/\s+/)[0]).filter(Boolean).pop() : '';
    const candidate = srcsetLast || source;
    const isLogo = /(logo|wordmark|brand|identity|site-title|header-mark)/.test(`${descriptor} ${candidate}`);
    if (isLogo) add(logos, candidate, /logo/.test(descriptor) ? 110 : 90, `IMG ${descriptor.trim()}`);
    else add(references, candidate, /(hero|banner|masthead|feature|project|gallery)/.test(`${descriptor} ${candidate}`) ? 90 : 50, `IMG ${descriptor.trim()}`);
  }

  // A common WordPress and legacy pattern puts the identity signal on the
  // parent anchor or wrapper while the IMG itself has an empty alt and a
  // content-hashed filename. Preserve that parent evidence instead of guessing
  // from every unlabeled image on the page.
  for (const match of html.matchAll(/<(?:a|div|span)\b[^>]*(?:class|id)\s*=\s*["'][^"']*(?:logo|wordmark|brand|site-title)[^"']*["'][^>]*>[\s\S]{0,700}?<img\b[^>]*>/gi)) {
    const imageTag = match[0].match(/<img\b[^>]*>/i)?.[0] || '';
    const source = attrValue(imageTag, 'src') || attrValue(imageTag, 'data-src') || attrValue(imageTag, 'data-lazy-src');
    const srcset = attrValue(imageTag, 'srcset') || attrValue(imageTag, 'data-srcset');
    const candidate = srcset ? srcset.split(',').map((part) => part.trim().split(/\s+/)[0]).filter(Boolean).pop() : source;
    add(logos, candidate, 105, 'Branded parent container IMG');
  }

  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = attrValue(tag, 'rel').toLowerCase();
    const sizes = attrValue(tag, 'sizes');
    if (/(apple-touch-icon|icon)/.test(rel)) {
      const score = /apple-touch-icon/.test(rel) ? 55 : /(?:180|192|256|512)/.test(sizes) ? 45 : 20;
      add(logos, attrValue(tag, 'href'), score, `LINK ${rel} ${sizes || 'size unstated'}`);
    }
  }

  for (const match of html.matchAll(/<(?:object|embed)\b[^>]*(?:data|src)\s*=\s*["'][^"']*(?:logo|wordmark|brand)[^"']*["'][^>]*>/gi)) {
    const tag = match[0];
    add(logos, attrValue(tag, 'data') || attrValue(tag, 'src'), 80, 'Embedded identity asset');
  }

  for (const match of html.matchAll(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi)) {
    const value = match[2];
    if (/logo|wordmark|brand/i.test(value)) add(logos, value, 70, 'CSS logo URL');
    else if (/hero|banner|feature|project|gallery/i.test(value)) add(references, value, 55, 'CSS image URL');
  }

  return {
    logos: logos.sort((a, b) => b.score - a.score),
    references: references
      .filter((item) => !/(logo|wordmark|brand|favicon|icon|sprite|pixel|tracking|avatar)/i.test(item.url))
      .sort((a, b) => b.score - a.score),
  };
}

function pageMeta(html) {
  const title = decodeEntities((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  let description = '';
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    if (attrValue(tag, 'name').toLowerCase() === 'description') description = attrValue(tag, 'content');
  }
  return { title, description: decodeEntities(description).replace(/\s+/g, ' ').trim() };
}

function identityCheck(candidate, meta, html, finalUrl) {
  const parked = /(domain (?:is )?for sale|buy this domain|sedo parking|hugedomains|godaddy domain|website coming soon)/i;
  if (parked.test(`${meta.title} ${meta.description} ${html.slice(0, 4000)}`)) return { ok: false, reason: 'official URL resolved to a parked or sale page' };
  const stop = new Set('the and for with from inc llc ltd corp company group services service center centre family associates association of at in a an'.split(' '));
  const tokens = String(candidate.name || '').toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length >= 3 && !stop.has(token));
  const evidence = `${meta.title} ${meta.description} ${html.slice(0, 24000)}`.toLowerCase();
  const matched = tokens.filter((token) => evidence.includes(token));
  const originalDomain = normalizeDomain(candidate.website);
  const finalDomain = normalizeDomain(finalUrl);
  const domainRelated = originalDomain === finalDomain || finalDomain.endsWith(`.${originalDomain}`) || originalDomain.endsWith(`.${finalDomain}`);
  if (!matched.length && !domainRelated) return { ok: false, reason: 'business identity did not match the resolved source' };
  return { ok: true, matchedTokens: matched, domainRelated };
}

function extractBrandColors(html, logoBytes, logoType) {
  const values = [];
  const add = (hex) => {
    let value = hex.toLowerCase();
    if (value.length === 4) value = `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
    if (!/^#[0-9a-f]{6}$/.test(value)) return;
    const rgb = [1, 3, 5].map((index) => parseInt(value.slice(index, index + 2), 16));
    const max = Math.max(...rgb);
    const min = Math.min(...rgb);
    if (max < 35 || min > 235 || max - min < 24) return;
    values.push(value);
  };
  if (logoType === 'svg') {
    for (const match of logoBytes.toString('utf8').matchAll(/(?:fill|stroke)\s*=\s*["'](#[0-9a-f]{3,6})["']/gi)) add(match[1]);
  }
  for (const match of html.matchAll(/#[0-9a-f]{3}(?:[0-9a-f]{3})?\b/gi)) add(match[0]);
  const counts = new Map();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  return [...counts].sort((a, b) => b[1] - a[1]).map(([value]) => value).slice(0, 5);
}

async function downloadLogo(candidates, directory) {
  const failures = [];
  for (const candidate of candidates.slice(0, 18)) {
    try {
      const { response, bytes } = await fetchWithLimit(candidate.url, { accept: 'image/*,image/svg+xml;q=0.9,*/*;q=0.2', maxBytes: 5 * 1024 * 1024 });
      const type = imageType(bytes, response.headers.get('content-type') || '');
      const dimensions = imageDimensions(bytes, type);
      if (!dimensions || (type !== 'svg' && Math.max(dimensions.width, dimensions.height) < 160)) throw new Error('logo source is too small');
      fs.mkdirSync(directory, { recursive: true });
      const candidateAuditFile = path.join(directory, `.candidate-logo-${process.pid}${extensionFor(type || 'png', candidate.url)}`);
      fs.writeFileSync(candidateAuditFile, bytes);
      const nativeAlpha = ['svg', 'png', 'webp', 'gif'].includes(type) && hasTransparentBackground(bytes, type)
        ? rasterAlphaAudit(candidateAuditFile, type)
        : { ok: false, reason: 'source is not transparently encoded' };
      let outputBytes = bytes;
      let outputType = type;
      let transformation = 'none; exact first-party transparent asset';
      let sourceSha256 = sha256Buffer(bytes);
      let sourceFileName = null;
      let borderSpread = null;
      if (!nativeAlpha.ok) {
        const converted = removeFlatLogoBackground(bytes, type, dimensions, directory);
        if (converted.error) throw new Error(converted.error);
        outputBytes = converted.bytes;
        outputType = 'png';
        transformation = converted.transformation;
        sourceSha256 = converted.sourceSha256;
        sourceFileName = path.basename(converted.sourceFile);
        borderSpread = converted.borderSpread;
      }
      if (!['svg', 'png', 'webp', 'gif'].includes(outputType) || !hasTransparentBackground(outputBytes, outputType)) throw new Error(`unsupported exact-logo type ${type || 'unknown'}`);
      const extension = extensionFor(outputType, candidate.url);
      const file = path.join(directory, `logo${extension}`);
      fs.mkdirSync(directory, { recursive: true });
      fs.writeFileSync(file, outputBytes);
      const alpha = rasterAlphaAudit(file, outputType);
      if (!alpha.ok) throw new Error(`logo transparency is not usable: ${alpha.reason}`);
      if (fs.existsSync(candidateAuditFile)) fs.unlinkSync(candidateAuditFile);
      return {
        file,
        fileName: path.basename(file),
        sourceUrl: candidate.url,
        sourceEvidence: candidate.evidence,
        type: outputType,
        dimensions: imageDimensions(outputBytes, outputType) || dimensions,
        sha256: sha256Buffer(outputBytes),
        sourceSha256,
        sourceType: type,
        sourceFileName,
        transformation,
        borderSpread,
        alpha,
        transparent: true,
        bytes: outputBytes.length,
        raw: outputBytes,
      };
    } catch (error) {
      failures.push({ url: candidate.url, reason: error.message });
    }
  }
  return { error: failures.length ? failures[0].reason : 'no first-party logo candidate', failures };
}

async function downloadReferences(candidates, directory, logoHash) {
  const references = [];
  const failures = [];
  for (const candidate of candidates.slice(0, 28)) {
    if (references.length >= 3) break;
    try {
      const { response, bytes } = await fetchWithLimit(candidate.url, { accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8', maxBytes: 9 * 1024 * 1024 });
      const type = imageType(bytes, response.headers.get('content-type') || '');
      if (!['png', 'webp', 'jpeg', 'avif'].includes(type)) throw new Error(`unsupported reference type ${type || 'unknown'}`);
      const hash = sha256Buffer(bytes);
      if (hash === logoHash || references.some((item) => item.sha256 === hash)) throw new Error('duplicate identity/reference asset');
      const dimensions = imageDimensions(bytes, type);
      if (dimensions && (dimensions.width < 480 || dimensions.height < 260)) throw new Error('reference image is too small');
      if (!dimensions && bytes.length < 50000) throw new Error('reference image has insufficient evidence of usable size');
      const extension = extensionFor(type, candidate.url);
      const file = path.join(directory, `reference-${references.length + 1}${extension}`);
      fs.writeFileSync(file, bytes);
      const visual = rasterVisualAudit(file);
      if (!visual.ok) {
        fs.unlinkSync(file);
        throw new Error(visual.reason);
      }
      references.push({
        file,
        fileName: path.basename(file),
        sourceUrl: candidate.url,
        sourceEvidence: candidate.evidence,
        type,
        dimensions,
        sha256: hash,
        bytes: bytes.length,
        visual,
      });
    } catch (error) {
      failures.push({ url: candidate.url, reason: error.message });
    }
  }
  return { references, failures };
}

async function probe(candidate) {
  const slug = slugify(candidate.name || candidate.domain);
  const directory = path.join(runDir, 'preflight', slug);
  const startedAt = new Date().toISOString();
  try {
    const generatedStock = generatedStockEvidence(candidate, slug);
    // Re-fetch on every selection attempt. Cached files cannot prove that the
    // current official source still serves the reviewed business logo.
    const { response, bytes } = await fetchWithLimit(candidate.website, { accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.2', maxBytes: 4 * 1024 * 1024, timeoutMs: 16000 });
    const contentType = response.headers.get('content-type') || '';
    if (!/html|xhtml/i.test(contentType) && !/<html[\s>]/i.test(bytes.toString('utf8', 0, 1024))) throw new Error('official source did not return HTML');
    const html = bytes.toString('utf8');
    const meta = pageMeta(html);
    const identity = identityCheck(candidate, meta, html, response.url);
    if (!identity.ok) throw new Error(identity.reason);
    const assets = discoverAssetUrls(html, response.url);
    const logo = await downloadLogo(assets.logos, directory);
    if (logo.error) throw new Error(`exact transparent logo unavailable: ${logo.error}`);
    if (logo.sourceUrl !== candidate.logoEligibility.source_url ||
        (logo.sourceSha256 || logo.sha256) !== candidate.logoEligibility.source_sha256) {
      throw new Error('Fetched logo differs from the reviewed exact business logo');
    }
    const referenceResult = await downloadReferences(assets.references, directory, logo.sha256);
    if (!referenceResult.references.length) throw new Error('no usable first-party visual reference');
    const colors = extractBrandColors(html, logo.raw, logo.type);
    delete logo.raw;
    const source = {
      sourceUrl: candidate.website,
      finalUrl: response.url,
      sourceDomain: normalizeDomain(response.url),
      httpStatus: response.status,
      contentType,
      pageSha256: sha256Buffer(bytes),
      title: meta.title,
      description: meta.description,
      identity,
      logo,
      references: referenceResult.references,
      referenceFailures: referenceResult.failures.slice(0, 4),
      brandColors: colors,
      checkedAt: new Date().toISOString(),
    };
    atomicJson(path.join(directory, 'SOURCE.json'), source);
    return { candidate, slug, ready: true, source, generatedStock, startedAt, finishedAt: new Date().toISOString() };
  } catch (error) {
    return { candidate, slug, ready: false, reason: error.message, startedAt, finishedAt: new Date().toISOString() };
  }
}

async function probePool(candidates) {
  const ready = [];
  const rejected = [];
  const chunkSize = 12;
  // Source readiness is intentionally strict and recent lanes can yield fewer
  // than one compliant identity per ten Radar rebuilds. Probe a bounded but
  // sufficiently deep pool so the exact-logo gate, not an arbitrary 144-row
  // ceiling, determines whether twenty exist.
  const maxCandidates = Math.min(candidates.length, 360);
  for (let start = 0; start < maxCandidates; start += chunkSize) {
    const chunk = candidates.slice(start, start + chunkSize);
    const results = await Promise.all(chunk.map((candidate) => probe(candidate)));
    results.forEach((result) => (result.ready ? ready : rejected).push(result));
    process.stdout.write(`preflight ${Math.min(start + chunk.length, maxCandidates)}/${maxCandidates}: ${ready.length} ready\n`);
    if (ready.length >= 36) break;
  }
  return { ready, rejected };
}

function chooseTwenty(ready) {
  const sorted = ready.slice().sort((a, b) => a.candidate.sortIndex - b.candidate.sortIndex);
  const chosen = [];
  const usedGroups = new Set();
  for (const item of sorted) {
    const group = item.candidate.verticalGroup || item.candidate.vertical || 'other';
    if (usedGroups.has(group)) continue;
    chosen.push(item);
    usedGroups.add(group);
    if (chosen.length === targetCount) break;
  }
  for (const item of sorted) {
    if (chosen.length === targetCount) break;
    if (!chosen.includes(item)) chosen.push(item);
  }
  if (chosen.length !== targetCount) throw new Error(`Expected ${targetCount} globally new, source-ready candidates; found ${chosen.length}.`);
  return chosen;
}

function copySelectedSources(chosen) {
  for (const item of chosen) {
    const destination = path.join(batchDir, 'source-assets', item.slug);
    fs.mkdirSync(destination, { recursive: true });
    for (const file of fs.readdirSync(path.join(runDir, 'preflight', item.slug))) {
      if (!/^(logo|reference-|SOURCE\.json)/i.test(file)) continue;
      fs.copyFileSync(path.join(runDir, 'preflight', item.slug, file), path.join(destination, file));
    }
  }
}

async function main() {
  if (fs.existsSync(selectionPath)) {
    const selection = JSON.parse(fs.readFileSync(selectionPath, 'utf8'));
    if (selection.selection?.length !== targetCount) throw new Error('Existing selection receipt is incomplete.');
    selection.selection = selection.selection.map((item) => {
      const generatedStock = generatedStockEvidence(item, item.slug);
      return {
        ...item,
        generatedStockBoard: generatedStock.boardKey,
        generatedStockBoardSha256: generatedStock.boardSha256,
        generatedStockDescriptor: generatedStock.descriptor,
      };
    });
    selection.readinessPolicy = readinessPolicy;
    selection.generatedStockValidatedAt = new Date().toISOString();
    writeBoth('SELECTION-EVIDENCE.json', selection);
    console.log(JSON.stringify({ status: 'resumed-selection-stock-ready', runId, count: selection.selection.length }, null, 2));
    return;
  }

  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(batchDir, { recursive: true });
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const prior = scanPriorEvidence();
  const rows = Object.values(registry.prospects || {});
  const logoDecisions = dedupeDecisions(rows);
  // Diagnostics belong with the run receipts, not in the tracked batch folder.
  // writeBoth() put this in both, so every run that stopped at the pool gate
  // left a phantom batch directory containing nothing but a hold list -- and
  // with the daily builder now running unattended, short days are normal and
  // those would accumulate one per morning.
  atomicJson(path.join(runDir, 'LOGO-HOLDS.json'), rows.flatMap((row, index) => logoDecisions[index].eligible ? [] :
    [{ domain: row.domain, name: row.business_name, ...logoDecisions[index] }]));
  const rawCandidates = rows
    .filter((row, index) => logoDecisions[index].eligible)
    .map((prospect) => {
      const domain = normalizeDomain(prospect.domain || prospect.website);
      return {
        domain,
        website: prospect.website,
        logoEligibility: prospect.logo_eligibility || prospect.logo_provenance || prospect.imagery?.logo_eligibility,
        name: prospect.business_name,
        city: prospect.city || '',
        area: prospect.area || '',
        vertical: prospect.vertical || 'local-business',
        verticalGroup: prospect.vertical_group || 'other',
        lifecycle: prospect.lifecycle || '',
        hasPhone: prospect.has_phone === true,
        opportunity: Number(prospect.current?.opportunity || prospect.priority_score || 0),
        quality: Number(prospect.current?.sqs || 0),
        band: prospect.current?.band || '',
        verdict: prospect.current?.verdict || '',
        confidence: Number(prospect.current?.confidence || 0),
        provisional: Boolean(prospect.current?.provisional),
        registryBuildable: Boolean(prospect.imagery?.buildable),
        imageryReason: prospect.imagery?.reason || '',
      };
    })
    .filter((candidate) => candidate.domain && candidate.website && candidate.name)
    // `rebuild` alone cannot supply this lane. Only 138 never-built rebuild rows
    // exist in the whole registry, 127 were already audited, and exactly 1 held
    // a verified exact logo -- because the two rules pull against each other: a
    // rebuild verdict means a bad site, and a bad site is precisely the one with
    // no clean logo, a dead URL, or a decade-old template. 849 never-built
    // `polish` rows are available and verify well (4 of the 5 rows that cleared
    // the 2026-09-10 sweep were polish). Those businesses have dated sites
    // rather than broken ones, which is still a real redesign pitch.
    .filter((candidate) => BUILDABLE_VERDICTS.has(candidate.verdict) && candidate.confidence >= 0.9 && candidate.hasPhone)
    .filter((candidate) => !/\.(gov|edu|mil)$/i.test(candidate.domain))
    .filter((candidate) => !prior.domains.has(candidate.domain) && !prior.slugs.has(slugify(candidate.name)))
    .sort((a, b) =>
      Number(b.lifecycle === 'queued_build') - Number(a.lifecycle === 'queued_build') ||
      Number(b.registryBuildable) - Number(a.registryBuildable) ||
      // A genuinely broken site still outranks a merely dated one, so widening
      // the pool adds depth behind the best prospects rather than displacing them.
      Number(b.verdict === 'rebuild') - Number(a.verdict === 'rebuild') ||
      b.opportunity - a.opportunity ||
      a.quality - b.quality ||
      a.domain.localeCompare(b.domain)
    )
    .map((candidate, sortIndex) => ({ ...candidate, sortIndex }));

  if (rawCandidates.length < targetCount) {
    // Leave nothing behind: a run that never selected anything has no batch.
    try {
      if (fs.existsSync(batchDir) && fs.readdirSync(batchDir).length === 0) fs.rmdirSync(batchDir);
    } catch { /* a non-empty batch dir is a real batch; never remove it */ }
    throw new Error(`Only ${rawCandidates.length} untouched rebuild/polish rows remain before source preflight.`);
  }
  const preflight = await probePool(rawCandidates);
  writeBoth('PREFLIGHT-EVIDENCE.json', {
    runId,
    generatedAt: new Date().toISOString(),
    candidatePool: rawCandidates.length,
    ready: preflight.ready.map((item) => ({ domain: item.candidate.domain, name: item.candidate.name, slug: item.slug, logo: item.source.logo.fileName, referenceCount: item.source.references.length, generatedStockBoard: item.generatedStock.boardKey, cached: Boolean(item.cached) })),
    rejected: preflight.rejected.map((item) => ({ domain: item.candidate.domain, name: item.candidate.name, website: item.candidate.website, reason: item.reason })),
  });
  const chosen = chooseTwenty(preflight.ready);
  copySelectedSources(chosen);

  const selection = {
    runId,
    generatedAt: new Date().toISOString(),
    radar: {
      registry: path.relative(root, registryPath).replace(/\\/g, '/'),
      registryUpdated: registry.updated,
      trackedCount: registry.count,
      refreshed: true,
    },
    priorEvidence: {
      filesScanned: prior.files.length,
      completedDomains: prior.domains.size,
      completedSlugs: prior.slugs.size,
      hardExclusionCount: hardDomains.size,
      skippedUnrelatedArtifacts: prior.skippedCount,
      inventorySha256: prior.inventorySha256,
      searchRoot: codexRoot,
    },
    readinessPolicy,
    candidatePool: rawCandidates.length,
    probed: preflight.ready.length + preflight.rejected.length,
    sourceReadyBeforeDiversity: preflight.ready.length,
    selection: chosen.map((item, index) => ({
      rank: index + 1,
      domain: item.candidate.domain,
      website: item.candidate.website,
      name: item.candidate.name,
      slug: item.slug,
      city: item.candidate.city,
      area: item.candidate.area,
      vertical: item.candidate.vertical,
      verticalGroup: item.candidate.verticalGroup,
      lifecycle: item.candidate.lifecycle,
      opportunity: item.candidate.opportunity,
      quality: item.candidate.quality,
      band: item.candidate.band,
      registryBuildable: item.candidate.registryBuildable,
      sourceReady: true,
      sourceFinalUrl: item.source.finalUrl,
      pageSha256: item.source.pageSha256,
      logoFile: item.source.logo.fileName,
      logoSha256: item.source.logo.sha256,
      logoSourceSha256: item.source.logo.sourceSha256,
      logoType: item.source.logo.type,
      logoTransparent: item.source.logo.transparent,
      logoTransformation: item.source.logo.transformation,
      referenceCount: item.source.references.length,
      referenceHashes: item.source.references.map((reference) => reference.sha256),
      generatedStockBoard: item.generatedStock.boardKey,
      generatedStockBoardSha256: item.generatedStock.boardSha256,
      generatedStockDescriptor: item.generatedStock.descriptor,
      status: 'selected-source-ready',
    })),
  };
  const sourceStatus = {
    runId,
    generatedAt: new Date().toISOString(),
    selected: chosen.map((item, index) => ({
      rank: index + 1,
      domain: item.candidate.domain,
      slug: item.slug,
      ...item.source,
      logo: { ...item.source.logo, file: path.relative(root, path.join(batchDir, 'source-assets', item.slug, item.source.logo.fileName)).replace(/\\/g, '/') },
      references: item.source.references.map((reference) => ({ ...reference, file: path.relative(root, path.join(batchDir, 'source-assets', item.slug, reference.fileName)).replace(/\\/g, '/') })),
    })),
    rejected: preflight.rejected.map((item) => ({
      domain: item.candidate.domain,
      name: item.candidate.name,
      website: item.candidate.website,
      reason: item.reason,
    })),
  };
  const manifest = {
    runId,
    status: 'selected-source-ready',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    batchDir: path.relative(root, batchDir).replace(/\\/g, '/'),
    targetCount,
    noScrollLab: true,
    mobileFirst: true,
    exactLogoRequired: true,
    mail_ready: 'hold',
    qa_ready: 'hold',
    delivery: 'local-only; no send, publish, deploy, CRM, queue, or account writes',
    items: selection.selection.map((item) => ({ rank: item.rank, domain: item.domain, slug: item.slug, status: 'selected-source-ready' })),
  };
  writeBoth('SELECTION-EVIDENCE.json', selection);
  writeBoth('SOURCE-STATUS.json', sourceStatus);
  writeBoth('RUN-MANIFEST.json', manifest);
  atomicText(path.join(runDir, 'selection-summary.txt'), selection.selection.map((item) => `${item.rank}. ${item.name} | ${item.domain} | ${item.vertical} | ${item.logoType} | ${item.referenceCount} refs`).join('\n') + '\n');
  console.log(JSON.stringify({
    status: manifest.status,
    runId,
    selected: selection.selection.length,
    sourceReadyPool: preflight.ready.length,
    rejected: preflight.rejected.length,
    completedDomainExclusions: prior.domains.size,
    selectionPath,
  }, null, 2));
}

main().catch((error) => {
  const receipt = { runId, status: 'blocked-selection', failedAt: new Date().toISOString(), reason: error.message };
  atomicJson(path.join(runDir, 'BLOCKED-RECEIPT.json'), receipt);
  console.error(error.stack || error);
  process.exit(1);
});
