#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { compareCandidatesChronologically, chooseOldestReady } = require('./chronological-priority');
const { resolveGeneratedStockAssignment } = require('./generated-stock-categories');
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
const targetCount = 20;
const readinessPolicy = 'Current Radar rebuild at 0.90 confidence or higher, untouched domain and slug, reachable official HTML, identity match, and a verified exact transparent first-party logo with current hash and visual-review evidence; a text or generated identity fallback is prohibited. Eligible businesses are probed and selected by ascending registry first_seen date: oldest tracked first; missing or invalid dates sort last; lifecycle, buildability, opportunity, quality, and domain are tie-breakers only within the same date. Vertical diversity never overrides chronology. Phone, address, and city fields remain blank unless the official source exposes them. After selection and before build, every exact slug must receive a unique business-specific Align HCM Image Gen board; category or shared boards are prohibited. A provisional Radar grade is accepted only after this live source and identity preflight passes.';

const artifactNames = new Set([
  'selection-evidence.json',
  'deployment.json',
  'provenance.json',
  'targets.json',
  'manifest.csv',
  'batch-summary.json',
  'run-manifest.json',
  'final-audit.json',
  'release-manifest.json',
  'current-production.json',
  'daily-release.json',
  'netlify-release-qa.json',
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

function siteSpecificBoardRequirement(candidate, slug = slugify(candidate.name || candidate.domain)) {
  return {
    boardKey: slug,
    descriptor: String(candidate.vertical || candidate.verticalGroup || 'local business').toLowerCase(),
    boardSha256: null,
    status: 'pending-required-site-specific-generation',
  };
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
    if (lowerKey === 'slugs' && Array.isArray(nested)) {
      nested.filter((item) => typeof item === 'string').forEach((item) => slugs.add(item.toLowerCase()));
    }
    if (lowerKey === 'route' && typeof nested === 'string') {
      const routeSlug = nested.match(/\/sites\/([^/]+)\/?/i)?.[1];
      if (routeSlug) slugs.add(routeSlug.toLowerCase());
    }
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
  const routeResult = spawnSync('rg', ['--files', codexRoot, '-g', '**/index.html', '-g', '!**/node_modules/**', '-g', '!**/.git/**'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  if (![0, 1].includes(routeResult.status)) throw new Error(routeResult.stderr || 'Prior live-route scan failed.');
  const routeFiles = String(routeResult.stdout || '').split(/\r?\n/).filter(Boolean)
    .filter((file) => /(radar|prospect|site.builder|site-factory|website|philly|phl|next\d+)/i.test(file))
    .filter((file) => !file.toLowerCase().includes(`radar-next20-${runId}`) && !file.toLowerCase().includes(`prospect-radar-next20\\runs\\${runId}`));
  for (const file of routeFiles) {
    const normalized = file.replace(/\\/g, '/');
    const directorySlug = normalized.match(/\/sites\/([^/]+)\/index\.html$/i)?.[1];
    if (directorySlug) slugs.add(directorySlug.toLowerCase());
    try {
      const source = fs.readFileSync(file, 'utf8');
      for (const match of source.matchAll(/href=["']\/sites\/([^/"']+)\//gi)) slugs.add(match[1].toLowerCase());
    } catch (error) {
      throw new Error(`Cannot scan prior live route ${file}: ${error.message}`);
    }
  }
  return {
    domains,
    slugs,
    files: scanned,
    routeFiles,
    skippedCount: skipped.length,
      inventorySha256: sha256Buffer(scanned.slice().sort().join('\n')),
      routeInventorySha256: sha256Buffer(routeFiles.slice().sort().join('\n')),
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

function rasterAlphaAudit(file, type) {
  if (type === 'svg') return { ok: true, vector: true };
  const result = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-vf', 'alphaextract,signalstats,metadata=print', '-frames:v', '1', '-f', 'null', 'NUL'], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  const value = (key) => Number(output.match(new RegExp(`lavfi\\.signalstats\\.${key}=([\\d.]+)`))?.[1]);
  const min = value('YMIN');
  const max = value('YMAX');
  const average = value('YAVG');
  const ok = result.status === 0 && Number.isFinite(min) && Number.isFinite(max) && Number.isFinite(average) && max >= 200 && min <= 245 && average >= 1 && average <= 248;
  return { ok, alphaMin: min, alphaMax: max, alphaAverage: average, reason: ok ? null : 'alpha plane is empty, effectively opaque, or lacks meaningful transparent area' };
}

function rasterVisualAudit(file) {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-vf', 'signalstats,metadata=print', '-frames:v', '1', '-f', 'null', 'NUL'], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  const value = (key) => Number(output.match(new RegExp(`lavfi\\.signalstats\\.${key}=([\\d.]+)`))?.[1]);
  const ranges = {
    luma: value('YMAX') - value('YMIN'),
    chromaU: value('UMAX') - value('UMIN'),
    chromaV: value('VMAX') - value('VMIN'),
  };
  const finite = Object.values(ranges).every(Number.isFinite);
  const maxRange = finite ? Math.max(ranges.luma, ranges.chromaU, ranges.chromaV) : 0;
  const ok = result.status === 0 && finite && maxRange >= 12;
  return {
    ok,
    lumaRange: ranges.luma,
    chromaURange: ranges.chromaU,
    chromaVRange: ranges.chromaV,
    reason: ok ? null : 'reference is flat or lacks enough tonal variation to serve as visual evidence',
  };
}

function removeFlatLogoBackground(bytes, type, dimensions, directory) {
  if (!['jpeg', 'png'].includes(type) || !dimensions?.width || !dimensions?.height) return { error: 'unsupported background-removal source' };
  const sourceFile = path.join(directory, `logo-source.${type === 'jpeg' ? 'jpg' : 'png'}`);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(sourceFile, bytes);
  const points = [
    [0, 0],
    [Math.max(0, dimensions.width - 1), 0],
    [0, Math.max(0, dimensions.height - 1)],
    [Math.max(0, dimensions.width - 1), Math.max(0, dimensions.height - 1)],
  ];
  const colors = points.map(([x, y]) => {
    const sample = spawnSync('ffmpeg', ['-v', 'error', '-i', sourceFile, '-vf', `crop=1:1:${x}:${y},format=rgb24`, '-frames:v', '1', '-f', 'rawvideo', 'pipe:1'], { encoding: null, maxBuffer: 1024 * 1024 });
    if (sample.status !== 0 || !sample.stdout || sample.stdout.length < 3) return null;
    return [...sample.stdout.subarray(0, 3)];
  });
  if (colors.some((color) => !color)) return { error: 'could not sample logo border' };
  const spread = Math.max(...colors.flatMap((a) => colors.map((b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]))));
  if (spread > 24) return { error: 'logo border is not a single removable color' };
  const average = [0, 1, 2].map((channel) => Math.round(colors.reduce((sum, color) => sum + color[channel], 0) / colors.length));
  const key = average.map((value) => value.toString(16).padStart(2, '0')).join('');
  const output = path.join(directory, 'logo.png');
  const filter = `colorkey=0x${key}:0.095:0.035,format=rgba`;
  const converted = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', sourceFile, '-vf', filter, '-frames:v', '1', output], { encoding: 'utf8' });
  if (converted.status !== 0 || !fs.existsSync(output)) return { error: converted.stderr || 'logo background removal failed' };
  const outputBytes = fs.readFileSync(output);
  if (!hasTransparentBackground(outputBytes, 'png')) return { error: 'background removal did not emit alpha' };
  const alpha = rasterAlphaAudit(output, 'png');
  if (!alpha.ok) return { error: `background removal produced an unusable logo: ${alpha.reason}` };
  return {
    file: output,
    bytes: outputBytes,
    transformation: `flat border color #${key} removed with deterministic FFmpeg colorkey; geometry unchanged`,
    sourceFile,
    sourceSha256: sha256Buffer(bytes),
    sourceType: type,
    borderSpread: Number(spread.toFixed(2)),
    alpha,
  };
}

async function fetchWithLimit(url, options = {}) {
  const maxBytes = options.maxBytes || 8 * 1024 * 1024;
  const timeoutMs = options.timeoutMs || 14000;
  const accept = options.accept || '*/*';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ProspectRadarEvidence/2.0',
        accept,
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const declared = Number(response.headers.get('content-length') || 0);
    if (declared > maxBytes) throw new Error(`asset exceeds ${maxBytes} bytes`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > maxBytes) throw new Error(`asset exceeds ${maxBytes} bytes`);
    return { response, bytes };
  } catch (fetchError) {
    const curlResult = spawnSync('curl.exe', [
      '--location',
      '--fail',
      '--silent',
      '--show-error',
      '--max-time', String(Math.max(10, Math.ceil(timeoutMs / 1000))),
      '--connect-timeout', '8',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36',
      '--header', `Accept: ${accept}`,
      url,
    ], {
      encoding: null,
      timeout: timeoutMs + 3000,
      maxBuffer: maxBytes + 8192,
    });
    const curlBytes = Buffer.from(curlResult.stdout || []);
    if (curlResult.status === 0 && !curlResult.error && curlBytes.length <= maxBytes) {
      return {
        response: {
          ok: true,
          status: 200,
          url,
          headers: { get: () => '' },
        },
        bytes: curlBytes,
      };
    }

    // A few public first-party sites reject programmatic fetches but serve
    // their HTML normally to a browser. This fallback is intentionally limited
    // to HTML evidence, and the caller still verifies identity and origin.
    if (/html|xhtml/i.test(accept)) {
      try {
        const { chromium } = require('playwright');
        const browser = await chromium.launch({ headless: true });
        try {
          const page = await browser.newPage({
            viewport: { width: 1365, height: 900 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36',
          });
          const browserResponse = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
          if (!browserResponse || !browserResponse.ok()) {
            throw new Error(`browser HTTP ${browserResponse ? browserResponse.status() : 'no response'}`);
          }
          const html = Buffer.from(await page.content(), 'utf8');
          if (html.length > maxBytes) throw new Error('browser response exceeds size limit');
          const responseHeaders = browserResponse.headers();
          return {
            response: {
              ok: true,
              status: browserResponse.status(),
              url: page.url(),
              headers: { get: (name) => responseHeaders[String(name).toLowerCase()] || '' },
            },
            bytes: html,
          };
        } finally {
          await browser.close();
        }
      } catch (browserError) {
        const curlError = String(curlResult.stderr || curlResult.error || 'curl did not return a valid response').trim();
        throw new Error(`${fetchError.message}; curl: ${curlError}; browser: ${browserError.message}`);
      }
    }

    const curlError = String(curlResult.stderr || curlResult.error || 'curl did not return a valid response').trim();
    throw new Error(`${fetchError.message}; curl: ${curlError}`);
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

function plainText(value) {
  return decodeEntities(String(value || ''))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeOfficialPhone(value) {
  let decoded = String(value || '');
  try { decoded = decodeURIComponent(decoded); } catch {}
  const source = plainText(decoded).replace(/^tel:/i, '');
  const digits = source.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return '';
  return source.slice(0, 40);
}

function formatPostalAddress(address) {
  if (!address) return '';
  if (typeof address === 'string') {
    const formatted = plainText(address).slice(0, 220);
    if (!/\b(?:\d{1,6}|P\.?\s*O\.?\s+Box)\b/i.test(formatted)) return '';
    if (/@|https?:|\b(?:office|phone|tel|email)\s*:/i.test(formatted)) return '';
    return formatted;
  }
  if (typeof address !== 'object') return '';
  const formatted = [address.streetAddress, address.addressLocality, address.addressRegion, address.postalCode]
    .map(plainText)
    .filter(Boolean)
    .join(', ')
    .replace(/, ([A-Z]{2}),/g, ', $1 ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
  if (!/\b(?:\d{1,6}|P\.?\s*O\.?\s+Box)\b/i.test(formatted)) return '';
  return formatted;
}

function sanitizeStoredContact(contact = {}) {
  const phone = normalizeOfficialPhone(contact.phone || '');
  const address = formatPostalAddress(contact.address || '');
  const city = plainText(contact.city || '').slice(0, 100);
  return {
    phone,
    address,
    city,
    phoneSource: phone ? (contact.phoneSource || null) : null,
    addressSource: address ? (contact.addressSource || null) : null,
  };
}

function extractOfficialContact(html) {
  const contacts = [];
  const add = (phone, address, city, source) => {
    const normalizedPhone = normalizeOfficialPhone(phone);
    const normalizedAddress = formatPostalAddress(address);
    const normalizedCity = plainText(city || (typeof address === 'object' ? address.addressLocality : '')).slice(0, 100);
    if (!normalizedPhone && !normalizedAddress && !normalizedCity) return;
    contacts.push({ phone: normalizedPhone, address: normalizedAddress, city: normalizedCity, source });
  };

  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const stack = Array.isArray(parsed) ? [...parsed] : [parsed];
      while (stack.length) {
        const value = stack.shift();
        if (!value || typeof value !== 'object') continue;
        add(value.telephone, value.address, value.address?.addressLocality, 'official JSON-LD');
        Object.values(value).forEach((nested) => {
          if (nested && typeof nested === 'object') stack.push(nested);
        });
      }
    } catch {
      // Invalid JSON-LD is not evidence and does not block otherwise valid HTML.
    }
  }

  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*["']tel:([^"']+)["'][^>]*>/gi)) {
    add(match[1], '', '', 'official tel link');
  }
  for (const match of html.matchAll(/<address\b[^>]*>([\s\S]*?)<\/address>/gi)) {
    add('', match[1], '', 'official address element');
  }

  const phone = contacts.map((item) => item.phone).find(Boolean) || '';
  const address = contacts.map((item) => item.address).find(Boolean) || '';
  const city = contacts.map((item) => item.city).find(Boolean)
    || (address.match(/,\s*([^,]+),\s*[A-Z]{2}\b/) || [])[1]
    || '';
  return {
    phone,
    address,
    city: plainText(city).slice(0, 100),
    phoneSource: contacts.find((item) => item.phone)?.source || null,
    addressSource: contacts.find((item) => item.address)?.source || null,
  };
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

function createTypographicIdentity(candidate, directory, failures = []) {
  const escapeXml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  const label = String(candidate.name || candidate.domain || 'Local business').trim();
  const fontSize = label.length > 34 ? 54 : label.length > 24 ? 64 : 76;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="320" viewBox="0 0 1200 320" role="img" aria-label="${escapeXml(label)}"><text x="600" y="178" text-anchor="middle" dominant-baseline="middle" fill="#F4EFE7" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="${fontSize}" font-weight="800" letter-spacing="-1.5">${escapeXml(label)}</text><path d="M370 242H830" stroke="#F05A28" stroke-width="10" stroke-linecap="round"/></svg>`;
  const bytes = Buffer.from(svg, 'utf8');
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, 'logo.svg');
  fs.writeFileSync(file, bytes);
  return {
    file,
    fileName: 'logo.svg',
    sourceUrl: candidate.website,
    sourceEvidence: 'Exact business name from the verified official source; code-rendered transparent typographic fallback.',
    type: 'svg',
    dimensions: { width: 1200, height: 320 },
    sha256: sha256Buffer(bytes),
    sourceSha256: null,
    sourceType: 'verified business name',
    sourceFileName: null,
    transformation: 'Disclosed exact-name typographic fallback; no icon, symbol, or first-party logo imitation.',
    borderSpread: null,
    alpha: { ok: true, reason: 'SVG has no background rectangle.' },
    transparent: true,
    identityFallback: true,
    downloadFailures: failures.slice(0, 4),
    bytes: bytes.length,
    raw: bytes,
  };
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
    const generatedStock = siteSpecificBoardRequirement(candidate, slug);
    // Re-fetch every time; a cached asset cannot renew exact-logo provenance.
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
      contact: extractOfficialContact(html),
      visualReferenceFallback: referenceResult.references.length ? null : 'No usable first-party photography was exposed by the legacy source. Use only disclosed Align Image Gen concept imagery.',
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
  const chosen = chooseOldestReady(ready, targetCount);
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
    const existingSourceStatusPath = path.join(runDir, 'SOURCE-STATUS.json');
    if (fs.existsSync(existingSourceStatusPath)) {
      const sourceStatus = JSON.parse(fs.readFileSync(existingSourceStatusPath, 'utf8'));
      sourceStatus.selected = (sourceStatus.selected || []).map((item) => ({
        ...item,
        contact: sanitizeStoredContact(item.contact),
      }));
      sourceStatus.generatedAt = new Date().toISOString();
      writeBoth('SOURCE-STATUS.json', sourceStatus);
    }
    if (selection.selection?.length !== targetCount) throw new Error('Existing selection receipt is incomplete.');
    selection.selection = selection.selection.map((item) => {
      const generatedStock = siteSpecificBoardRequirement(item, item.slug);
      return {
        ...item,
        generatedStockBoard: generatedStock.boardKey,
        generatedStockBoardSha256: generatedStock.boardSha256,
        generatedStockDescriptor: generatedStock.descriptor,
        generatedStockStatus: generatedStock.status,
      };
    });
    selection.readinessPolicy = readinessPolicy;
    selection.generatedStockValidatedAt = new Date().toISOString();
    writeBoth('SELECTION-EVIDENCE.json', selection);
    console.log(JSON.stringify({ status: 'resumed-selection-site-boards-required', runId, count: selection.selection.length }, null, 2));
    process.exit(0);
  }

  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(batchDir, { recursive: true });
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const prior = scanPriorEvidence();
  const rows = Object.values(registry.prospects || {});
  const logoDecisions = dedupeDecisions(rows);
  writeBoth('LOGO-HOLDS.json', rows.flatMap((row, index) => logoDecisions[index].eligible ? [] :
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
        firstSeen: prospect.first_seen || '',
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
    .filter((candidate) => candidate.verdict === 'rebuild' && candidate.confidence >= 0.9)
    .filter((candidate) => !/\.(gov|edu|mil)$/i.test(candidate.domain))
    .filter((candidate) => !prior.domains.has(candidate.domain) && !prior.slugs.has(slugify(candidate.name)))
    .sort(compareCandidatesChronologically)
    .map((candidate, sortIndex) => ({ ...candidate, sortIndex }));

  if (rawCandidates.length < targetCount) throw new Error(`Only ${rawCandidates.length} untouched rebuild rows remain before source preflight.`);
  const preflight = await probePool(rawCandidates);
  writeBoth('PREFLIGHT-EVIDENCE.json', {
    runId,
    generatedAt: new Date().toISOString(),
    candidatePool: rawCandidates.length,
    ready: preflight.ready.map((item) => ({ domain: item.candidate.domain, name: item.candidate.name, firstSeen: item.candidate.firstSeen, slug: item.slug, logo: item.source.logo.fileName, referenceCount: item.source.references.length, requiredSiteSpecificBoard: item.generatedStock.boardKey, contact: item.source.contact, cached: Boolean(item.cached) })),
    rejected: preflight.rejected.map((item) => ({ domain: item.candidate.domain, name: item.candidate.name, firstSeen: item.candidate.firstSeen, website: item.candidate.website, reason: item.reason })),
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
      liveRouteFilesScanned: prior.routeFiles.length,
      inventorySha256: prior.inventorySha256,
      routeInventorySha256: prior.routeInventorySha256,
      searchRoot: codexRoot,
    },
    readinessPolicy,
    candidatePool: rawCandidates.length,
    probed: preflight.ready.length + preflight.rejected.length,
    sourceReadyBeforeChronology: preflight.ready.length,
    selectionOrder: 'registry first_seen ascending; same-date tie-breakers only; missing dates last',
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
      firstSeen: item.candidate.firstSeen,
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
      generatedStockStatus: item.generatedStock.status,
      status: 'selected-source-ready-site-board-pending',
    })),
  };
  const sourceStatus = {
    runId,
    generatedAt: new Date().toISOString(),
    selected: chosen.map((item, index) => ({
      rank: index + 1,
      domain: item.candidate.domain,
      firstSeen: item.candidate.firstSeen,
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
    status: 'selected-source-ready-site-board-pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    batchDir: path.relative(root, batchDir).replace(/\\/g, '/'),
    targetCount,
    noScrollLab: true,
    mobileFirst: true,
    exactLogoRequired: true,
    mail_ready: 'hold',
    qa_ready: 'hold',
    delivery: 'local build and evidence only until all required board, QA, live-release, and sheet-readback gates pass; no send, CRM, queue, or account writes',
    items: selection.selection.map((item) => ({ rank: item.rank, domain: item.domain, firstSeen: item.firstSeen, slug: item.slug, status: 'selected-source-ready-site-board-pending' })),
  };
  writeBoth('SELECTION-EVIDENCE.json', selection);
  writeBoth('SOURCE-STATUS.json', sourceStatus);
  writeBoth('RUN-MANIFEST.json', manifest);
  atomicText(path.join(runDir, 'selection-summary.txt'), selection.selection.map((item) => `${item.rank}. ${item.firstSeen || 'date-pending'} | ${item.name} | ${item.domain} | ${item.vertical} | ${item.logoType} | ${item.referenceCount} refs`).join('\n') + '\n');
  console.log(JSON.stringify({
    status: manifest.status,
    runId,
    selected: selection.selection.length,
    sourceReadyPool: preflight.ready.length,
    rejected: preflight.rejected.length,
    completedDomainExclusions: prior.domains.size,
    selectionPath,
  }, null, 2));
  process.exit(0);
}

main().catch((error) => {
  const receipt = { runId, status: 'blocked-selection', failedAt: new Date().toISOString(), reason: error.message };
  atomicJson(path.join(runDir, 'BLOCKED-RECEIPT.json'), receipt);
  console.error(error.stack || error);
  process.exit(1);
});
