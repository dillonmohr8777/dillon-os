#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { resolveGeneratedStockAssignment } = require('./generated-stock-categories');

const [releaseDir, boardsDir, receiptPath] = process.argv.slice(2);
if (!releaseDir || !boardsDir || !receiptPath) {
  console.error('Usage: node integrate-generated-stock.js <release-dir> <boards-dir> <receipt-path>');
  process.exit(1);
}

const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const stableSeed = value => parseInt(crypto.createHash('sha256').update(value).digest('hex').slice(0, 8), 16);
const posix = value => value.split(path.sep).join('/');

function resolveAssignment(slug) {
  const briefPath = path.join(releaseDir, 'briefs', `${slug}.json`);
  if (!fs.existsSync(briefPath)) throw new Error(`No generated-stock assignment or brief for ${slug}.`);
  const brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'));
  return resolveGeneratedStockAssignment({
    slug,
    name: brief.name,
    category: brief.category,
    vertical: brief.vertical,
    verticalGroup: brief.verticalGroup,
  });
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${command} failed (${result.status}): ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

function logoHashes(siteDir) {
  const entries = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/(logo|brand|wordmark)/i.test(entry.name)) {
        entries.push({ file: posix(path.relative(siteDir, full)), sha256: sha256(full) });
      }
    }
  };
  walk(siteDir);
  return entries.sort((a, b) => a.file.localeCompare(b.file));
}

function ensureDisclosure(html) {
  if (html.includes('Illustrative generated imagery. These are concept visuals')) return html;
  const disclosure = '<p class="generated-imagery-disclosure" style="grid-column:1/-1;margin:1rem 0 0;color:inherit;opacity:.72;font-size:.875rem;line-height:1.45">Illustrative generated imagery. These are concept visuals and do not depict the business, its staff, customers, or completed work.</p>';
  if (html.includes('</footer>')) return html.replace('</footer>', `${disclosure}</footer>`);
  return html.replace('</body>', `${disclosure}</body>`);
}

function insertGallery(html, descriptor, imageNumbers = [1, 2, 3, 4]) {
  const figures = imageNumbers.map(i => `<figure style="margin:0;overflow:hidden;border-radius:clamp(1rem,3vw,2rem);min-height:15rem"><img loading="lazy" width="960" height="720" src="assets/generated-stock-${i}.webp" alt="Illustrative generated ${descriptor} concept image ${i}" style="display:block;width:100%;height:100%;min-height:15rem;object-fit:cover"></figure>`).join('');
  const gallery = `<section class="generated-stock-gallery" aria-labelledby="generated-stock-heading" style="padding:clamp(3.5rem,8vw,7rem) clamp(1rem,5vw,5rem);background:#111;color:#fff"><div style="max-width:84rem;margin:0 auto"><p style="margin:0 0 .5rem;opacity:.68;text-transform:uppercase;letter-spacing:.16em;font-size:.72rem">Visual direction</p><h2 id="generated-stock-heading" style="max-width:18ch;margin:0 0 1.5rem;font-size:clamp(2rem,5vw,4.5rem);line-height:.94">The work should look like the work.</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr));gap:clamp(.75rem,2vw,1.25rem)">${figures}</div></div></section>`;
  if (html.includes('<footer')) return html.replace('<footer', `${gallery}<footer`);
  return html.replace('</body>', `${gallery}</body>`);
}

function replaceImagery(html, descriptor) {
  let replacementCount = 0;
  html = html.replace(/<img\b[^>]*>/gi, tag => {
    if (/(?:logo|wordmark)/i.test(tag) || /class=["'][^"']*\bbrand(?:-|\b)/i.test(tag)) return tag;
    // The page may contain many legacy media slots, but this correction deliberately
    // renders each generated stock image once. Extra legacy slots are removed below.
    if (replacementCount >= 4) return '';
    const imageNumber = replacementCount + 1;
    replacementCount += 1;
    let next = tag
      .replace(/\s+srcset=(?:"[^"]*"|'[^']*')/gi, '')
      .replace(/\s+sizes=(?:"[^"]*"|'[^']*')/gi, '')
      .replace(/\s+src=(?:"[^"]*"|'[^']*')/i, ` src="assets/generated-stock-${imageNumber}.webp"`)
      .replace(/\s+alt=(?:"[^"]*"|'[^']*')/i, ` alt="Illustrative generated ${descriptor} concept image ${imageNumber}"`)
      .replace(/\s+width=(?:"[^"]*"|'[^']*')/i, ' width="960"')
      .replace(/\s+height=(?:"[^"]*"|'[^']*')/i, ' height="720"');
    if (!/\ssrc=/i.test(next)) next = next.replace(/>$/, ` src="assets/generated-stock-${imageNumber}.webp">`);
    if (!/\salt=/i.test(next)) next = next.replace(/>$/, ` alt="Illustrative generated ${descriptor} concept image ${imageNumber}">`);
    return next;
  });
  if (replacementCount < 3) {
    const missing = replacementCount === 0 ? [1, 2, 3, 4] : Array.from({ length: 4 - replacementCount }, (_, index) => replacementCount + index + 1);
    html = insertGallery(html, descriptor, missing);
    replacementCount = 4;
  }
  html = html
    .replace(/<figure\b[^>]*>\s*<\/figure>/gi, '')
    .replace(/<div class=["']reveal[^"']*["']>\s*<\/div>/gi, '');
  if (!html.includes('generated-stock-mobile-motion')) {
    html = html.replace('</style>', '/* generated-stock-mobile-motion */@media(max-width:760px){.js .reveal.reveal-left,.js .reveal.reveal-right{transform:translateY(22px)}.js .reveal.reveal-left.visible,.js .reveal.reveal-right.visible{transform:none}}</style>');
  }
  html = html
    .replace(/html\{scroll-behavior:smooth;overflow-x:(?:visible|clip)\}/gi, 'html{scroll-behavior:smooth;overflow-x:visible}')
    .replace(/first-party source material/gi, 'business-relevant generated concept imagery')
    .replace(/first-party visual source/gi, 'business-relevant visual direction')
    .replace(/first-party visual context/gi, 'business-relevant visual context')
    .replace(/official identity and first-party/gi, 'official identity and business-relevant')
    .replace(/source material as visual evidence/gi, 'generated imagery as illustrative context')
    .replace(/first-party project material/gi, 'business-relevant concept imagery')
    .replace(/first-party photography/gi, 'actual business photography');
  return { html: ensureDisclosure(html), replacementCount };
}

const sitesDir = path.join(releaseDir, 'sites');
const actualSites = fs.readdirSync(sitesDir, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
if (![20, 50].includes(actualSites.length)) throw new Error(`Expected a 20-site daily batch or 50-site release; found ${actualSites.length}.`);
// resolveAssignment throws when no board is approved for a vertical. That refusal
// is correct — guessing imagery for a business is worse than shipping without it.
// But one unapproved vertical used to abort the whole batch, so 19 finished,
// QA-passed sites were discarded because the 20th had no board. Collect the
// failures instead: assigned sites proceed, unassigned ones are named in the
// receipt and reported as needing an approved board.
const resolvedAssignments = {};
const unassignedSites = [];
for (const slug of actualSites) {
  try {
    resolvedAssignments[slug] = resolveAssignment(slug);
  } catch (err) {
    unassignedSites.push({ slug, reason: err.message });
  }
}
if (!Object.keys(resolvedAssignments).length) {
  throw new Error(
    `No site in this batch has an approved generated-stock board. `
    + unassignedSites.map(u => u.reason).join(' | '),
  );
}

const receipt = {
  generatedAt: new Date().toISOString(),
  releaseDir,
  boardDir: boardsDir,
  generator: 'OpenAI built-in Imagegen, 2x2 editorial board cropped into four site assets',
  disclosure: 'Illustrative generated imagery. These are concept visuals and do not depict the business, its staff, customers, or completed work.',
  siteCount: actualSites.length,
  imageCount: 0,
  sites: [],
  // Named, not hidden: a silent skip would read as "all 20 integrated".
  unassignedSites,
  unassignedCount: unassignedSites.length,
};

for (const slug of Object.keys(resolvedAssignments)) {
  const [boardKey, descriptor] = resolvedAssignments[slug];
  const boardPath = path.join(boardsDir, `${boardKey}.png`);
  if (!fs.existsSync(boardPath)) throw new Error(`Missing board ${boardPath}`);
  const siteDir = path.join(sitesDir, slug);
  const assetsDir = path.join(siteDir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  const logosBefore = logoHashes(siteDir);
  const probe = JSON.parse(run('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_streams', boardPath]));
  const stream = probe.streams.find(item => item.codec_type === 'video');
  const halfW = Math.floor(stream.width / 2);
  const halfH = Math.floor(stream.height / 2);
  const quadrants = [[0, 0], [halfW, 0], [0, halfH], [halfW, halfH]];
  const seed = stableSeed(slug);
  const generated = [];
  quadrants.forEach(([x, y], index) => {
    const output = path.join(assetsDir, `generated-stock-${index + 1}.webp`);
    const xOffset = (seed + index * 11) % 41;
    const yOffset = 80 + ((seed >>> 3) + index * 19) % 121;
    const filter = `crop=${halfW}:${halfH}:${x}:${y},scale=1000:1000:flags=lanczos,crop=960:720:${xOffset}:${yOffset}`;
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', boardPath, '-vf', filter, '-c:v', 'libwebp', '-quality', '84', output]);
    generated.push({ file: posix(path.relative(siteDir, output)), sha256: sha256(output), bytes: fs.statSync(output).size });
  });
  const htmlPath = path.join(siteDir, 'index.html');
  const originalHtml = fs.readFileSync(htmlPath, 'utf8');
  const { html, replacementCount } = replaceImagery(originalHtml, descriptor);
  fs.writeFileSync(htmlPath, html, 'utf8');

  const designPath = path.join(siteDir, 'DESIGN.md');
  if (fs.existsSync(designPath)) {
    const design = fs.readFileSync(designPath, 'utf8').replace(
      /All content images are traceable first-party derivatives\./g,
      'Content imagery is generated, business-category relevant, and explicitly disclosed as illustrative concept material.'
    );
    fs.writeFileSync(designPath, design, 'utf8');
  }

  const provenancePath = path.join(assetsDir, 'PROVENANCE.json');
  if (fs.existsSync(provenancePath)) {
    const provenance = JSON.parse(fs.readFileSync(provenancePath, 'utf8'));
    provenance.generatedStock = {
      boardKey,
      boardSha256: sha256(boardPath),
      mode: 'OpenAI built-in Imagegen',
      descriptor,
      disclosure: receipt.disclosure,
      outputs: generated,
    };
    fs.writeFileSync(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`, 'utf8');
  }

  const logosAfter = logoHashes(siteDir);
  if (JSON.stringify(logosBefore) !== JSON.stringify(logosAfter)) throw new Error(`Logo integrity failure: ${slug}`);
  receipt.imageCount += generated.length;
  receipt.sites.push({ slug, boardKey, descriptor, boardSha256: sha256(boardPath), replacementCount, generated, logosBefore, logosAfter });
}

fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ status: 'PASS', siteCount: receipt.siteCount, imageCount: receipt.imageCount, receiptPath }, null, 2));
