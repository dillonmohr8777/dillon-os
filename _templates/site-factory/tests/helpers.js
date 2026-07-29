const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function png(r, g, b) {
  const w = 8;
  const h = 8;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const o = y * (w * 3 + 1) + 1 + x * 3;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }
  const crc = (bb) => {
    let c = ~0;
    for (const by of bb) {
      c ^= by;
      for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return ~c >>> 0;
  };
  const chunk = (t, d) => {
    const l = Buffer.alloc(4);
    l.writeUInt32BE(d.length);
    const td = Buffer.concat([Buffer.from(t), d]);
    const cr = Buffer.alloc(4);
    cr.writeUInt32BE(crc(td));
    return Buffer.concat([l, td, cr]);
  };
  const ih = Buffer.alloc(13);
  ih.writeUInt32BE(w, 0);
  ih.writeUInt32BE(h, 4);
  ih[8] = 8;
  ih[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ih),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function loadBaseBrief() {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'example-brief.json'), 'utf8')
  );
}

/** Brief that meets canonical section/word/image ranges (12 images). */
function passingBrief(overrides = {}) {
  const b = loadBaseBrief();
  // Keep within 9-11 counted <section> nodes: drop social/spotlight for gate tests
  // unless the caller opts in. Still exercises attitude skins + marquee chrome.
  delete b.social;
  delete b.spotlight;
  b.images = Array.from({ length: 12 }, (_, i) => ({
    file: `image-${i + 1}.webp`,
    alt: `Alt ${i + 1}`,
  }));
  b.gallery = { imageIndexes: [3, 4, 5, 6, 7, 12] };
  Object.assign(b, overrides);
  if (overrides.tokens) b.tokens = { ...b.tokens, ...overrides.tokens };
  if (overrides.social === undefined && 'social' in overrides) delete b.social;
  return b;
}

/** Brief that intentionally undershoots image count (spec failure). */
function thinImageBrief(overrides = {}) {
  const b = loadBaseBrief();
  delete b.social;
  delete b.spotlight;
  b.images = Array.from({ length: 11 }, (_, i) => ({
    file: `image-${i + 1}.webp`,
    alt: `Alt ${i + 1}`,
  }));
  b.gallery = { imageIndexes: [3, 4, 5, 6, 7] };
  Object.assign(b, overrides);
  return b;
}

function writeBatchFixture(root, { targetCount, briefs, batchId = 'test-batch' }) {
  fs.mkdirSync(path.join(root, 'briefs'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'batch.json'),
    JSON.stringify(
      {
        id: batchId,
        title: 'Test Batch',
        market: 'Philadelphia, PA',
        week: '2026-07-29',
        idPrefix: 'TST',
        targetCount,
        deployBaseUrl: 'https://example-batch.netlify.app',
      },
      null,
      2
    )
  );
  briefs.forEach((brief) => {
    fs.writeFileSync(path.join(root, 'briefs', `${brief.slug}.json`), JSON.stringify(brief, null, 2));
  });
}

function writeUniqueAssets(batchRoot, slugs, imageCount = 12) {
  slugs.forEach((slug, si) => {
    const dir = path.join(batchRoot, 'sites', slug, 'assets');
    fs.mkdirSync(dir, { recursive: true });
    for (let i = 1; i <= imageCount; i++) {
      fs.writeFileSync(
        path.join(dir, `image-${i}.webp`),
        png((si * 53 + i * 17) % 256, (i * 29 + si * 7) % 256, (si * 97 + i * 13) % 256)
      );
    }
  });
}

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const parseLine = (l) => {
    const out = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < l.length; i++) {
      const c = l[i];
      if (q) {
        if (c === '"' && l[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (c === '"') q = false;
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ',') {
        out.push(cur);
        cur = '';
      } else cur += c;
    }
    out.push(cur);
    return out;
  };
  const header = parseLine(lines[0]);
  return lines.slice(1).map((l) => {
    const cols = parseLine(l);
    const row = {};
    header.forEach((h, i) => {
      row[h] = cols[i];
    });
    return row;
  });
}

/** Deterministic full-PASS QA stub for unit tests (visual ran). */
function fullPassQa(siteDir) {
  return Promise.resolve({
    slug: require('path').basename(siteDir),
    status: 'PASS',
    staticOk: true,
    visualQa: 'ran',
    visualReason: 'stub',
    failures: [],
    warnings: [],
    fullQa: true,
  });
}

/** Deterministic static-only QA stub. */
function staticOnlyQa(siteDir) {
  return Promise.resolve({
    slug: require('path').basename(siteDir),
    status: 'STATIC_ONLY',
    staticOk: true,
    visualQa: 'skipped',
    visualReason: 'Playwright not installed',
    failures: [],
    warnings: ['Playwright not installed'],
    fullQa: false,
  });
}

module.exports = {
  png,
  loadBaseBrief,
  passingBrief,
  thinImageBrief,
  writeBatchFixture,
  writeUniqueAssets,
  parseCsv,
  fullPassQa,
  staticOnlyQa,
};
