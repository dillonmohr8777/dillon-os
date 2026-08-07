'use strict';

/**
 * Download a prospect's own photographs and logo.
 *
 * A rebuild demo without the business's real imagery is not a demo, it is a
 * wireframe — and worse, the arch template points at `assets/image-N`, so a build
 * with nothing copied in renders as a column of broken-image icons. That is what
 * shipped in the first draft deploy.
 *
 * The rule that matters: **only ever their own images.** Reusing the reference
 * build's photographs would put a Folcroft painting company's job shots on a
 * dental page, which is worse than a broken image because it looks deliberate.
 * Nothing here has a fallback to stock or to another business's assets; when a
 * prospect has no usable imagery the build says so and stays blocked.
 *
 * Selection is opinionated because a homepage scrape returns a lot of junk:
 * tracking pixels, social icons, payment badges, spacer GIFs. Anything tiny,
 * anything that smells like chrome, and anything that fails to decode as a real
 * image is dropped rather than padded into the page.
 */

const { httpGet } = require('./net');

/** Filename or path fragments that mark an asset as chrome rather than content. */
const CHROME_PATTERNS =
  /(?:sprite|icon|favicon|pixel|spacer|blank|1x1|tracking|badge|button|arrow|bullet|divider|social|facebook|twitter|instagram|linkedin|yelp|bbb|visa|mastercard|amex|paypal|angies?list|houzz|thumbtack|google-?play|app-?store|captcha|loader|spinner|placeholder)/i;

/** Fragments that suggest the asset IS the logo. */
const LOGO_PATTERNS = /(?:logo|brandmark|wordmark|site-?id|header-?img)/i;

const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

/** Read real dimensions from the file header, so we never trust the markup. */
function probeDimensions(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 24) return null;

  // PNG: IHDR width/height at fixed offsets.
  if (buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') {
    return { format: 'png', width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // GIF
  if (buf.toString('ascii', 0, 3) === 'GIF') {
    return { format: 'gif', width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }
  // WEBP (VP8/VP8L/VP8X)
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buf.toString('ascii', 12, 16);
    try {
      if (chunk === 'VP8X') return { format: 'webp', width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
      if (chunk === 'VP8 ') return { format: 'webp', width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      if (chunk === 'VP8L') {
        const b = buf.readUInt32LE(21);
        return { format: 'webp', width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
      }
    } catch {
      return { format: 'webp', width: 0, height: 0 };
    }
  }
  // JPEG: walk the segment markers to the first SOF.
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = buf[i + 1];
      // SOF0..SOF15, excluding DHT/JPG/DAC which share the range.
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { format: 'jpg', height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return { format: 'jpg', width: 0, height: 0 };
  }
  if (buf.toString('ascii', 0, 200).includes('<svg')) return { format: 'svg', width: 0, height: 0 };
  return null;
}

function extFor(url, contentType, probed) {
  if (probed?.format) return probed.format;
  const mime = String(contentType || '').split(';')[0].trim().toLowerCase();
  if (EXT_BY_MIME[mime]) return EXT_BY_MIME[mime];
  const m = String(url).match(/\.(jpe?g|png|webp|gif|avif|svg)(?:\?|#|$)/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
}

function absolutize(src, baseUrl) {
  try {
    return new URL(src, baseUrl).href;
  } catch {
    return '';
  }
}

/**
 * Download and select a prospect's imagery.
 *
 * @param {object} harvest  harvest-lite output (needs `images` and `finalUrl`)
 * @param {object} [opts]   { max, minWidth, minBytes, timeoutMs, concurrency,
 *                          metadataOnly } — metadataOnly drops the image bodies
 *                          once dimensions are read, for callers that only need
 *                          counts and sizes rather than the files themselves
 * @returns {Promise<{images:Array, logo:object|null, rejected:Array, ok:boolean, reason?:string}>}
 *          Each kept image: { url, buffer, ext, width, height, bytes, isLogo }
 */
async function harvestImages(harvest, opts = {}) {
  const max = opts.max || 13;
  const minWidth = opts.minWidth || 400;
  const minBytes = opts.minBytes || 6000;
  const base = harvest?.finalUrl || harvest?.siteUrl || '';
  const candidates = Array.isArray(harvest?.images) ? harvest.images : [];

  if (!candidates.length) {
    return { images: [], logo: null, rejected: [], ok: false, reason: 'harvest found no images on their site' };
  }

  // De-duplicate by absolute URL before spending any requests.
  const seen = new Set();
  const queue = [];
  for (const img of candidates) {
    const url = absolutize(img.src, base);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    queue.push({ url, alt: img.alt || '' });
  }

  const kept = [];
  const rejected = [];
  const concurrency = opts.concurrency || 5;
  let cursor = 0;

  async function worker() {
    while (cursor < queue.length && kept.length < max + 4) {
      const item = queue[cursor++];

      if (CHROME_PATTERNS.test(item.url) && !LOGO_PATTERNS.test(item.url)) {
        rejected.push({ url: item.url, why: 'looks like chrome (icon, badge, tracker)' });
        continue;
      }

      let res;
      try {
        res = await httpGet(item.url, { encoding: null, timeoutMs: opts.timeoutMs || 20000, maxBytes: 8_000_000 });
      } catch (err) {
        rejected.push({ url: item.url, why: String(err?.message || err).slice(0, 60) });
        continue;
      }
      if (!res.ok || res.status !== 200 || !Buffer.isBuffer(res.body)) {
        rejected.push({ url: item.url, why: `fetch ${res.status || res.error}` });
        continue;
      }

      const probed = probeDimensions(res.body);
      if (!probed) {
        rejected.push({ url: item.url, why: 'not a decodable image' });
        continue;
      }

      const isLogo = LOGO_PATTERNS.test(item.url) || LOGO_PATTERNS.test(item.alt);
      // Logos are legitimately small and often SVG, so they skip the size floor.
      if (!isLogo && probed.format !== 'svg') {
        if (res.body.length < minBytes) {
          rejected.push({ url: item.url, why: `only ${res.body.length}B` });
          continue;
        }
        if (probed.width && probed.width < minWidth) {
          rejected.push({ url: item.url, why: `only ${probed.width}px wide` });
          continue;
        }
      }

      kept.push({
        url: item.url,
        alt: item.alt,
        // `metadataOnly` callers just want to count and measure. Retaining the
        // body for those is expensive enough to matter: up to 12 images at an 8MB
        // cap across 6 concurrent workers is ~570MB of live Buffers, held on a
        // shared CI runner that has already spent its memory on 80 Playwright
        // renders. The dimensions are already probed by this point, so the bytes
        // have served their purpose.
        buffer: opts.metadataOnly ? null : res.body,
        ext: extFor(item.url, res.headers?.['content-type'], probed),
        width: probed.width || 0,
        height: probed.height || 0,
        bytes: res.body.length,
        isLogo,
      });
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, worker));

  const logo = kept.find((k) => k.isLogo) || null;
  // Content images, biggest first — the hero wants the best photograph available.
  const photos = kept
    .filter((k) => !k.isLogo)
    .sort((a, b) => b.width * b.height - a.width * a.height || b.bytes - a.bytes)
    .slice(0, max);

  return {
    images: photos,
    logo,
    rejected,
    ok: photos.length > 0,
    reason: photos.length ? null : `all ${queue.length} candidate image(s) were rejected as chrome, too small, or unfetchable`,
  };
}

module.exports = { harvestImages, probeDimensions, CHROME_PATTERNS, LOGO_PATTERNS };
