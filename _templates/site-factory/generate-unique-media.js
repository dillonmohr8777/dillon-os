#!/usr/bin/env node
/**
 * Fill every factory image slot with a unique still or short loop.
 *
 * Half the week-33b slugs get photoreal stills. The other half get CSS Ken
 * Burns motion on unique stills. Harvest photos stay when they are real
 * first-party files.
 * Atmosphere gradients and empty slots are replaced. Never claimed as the
 * business's official photography.
 *
 *   node generate-unique-media.js <site-dir> <brief.json> [harvest-dir]
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { applyHarvestImages } = require('./apply-harvest-images.js');

const ANIMATED_SLUGS = new Set([
  'train-and-nourish',
  'o-donnell-weiss-and-mattei-p-c',
  'tm-prestige-home-cash-buyer',
  'balance-studios',
  'weathers-motors-and-auto-sales',
  'custom-it-solutions',
  'captain-car-wash',
  'johnny-s-pizza',
  'home-furnishings-consignment',
  'chestnut-hill-animal-hospital',
  'golden-sea',
  'pro-nails',
]);

const SCENES = {
  hardware: [
    'warehouse racks of white PVC pipe under cool industrial lights',
    'blue and gray pipe fittings on a steel workbench',
    'cut schedule-80 pipe ends on concrete',
    'outdoor pipe bundles strapped on a loading dock',
    'brass valves and elbows on a pegboard',
    'wet concrete reflecting stacked conduit',
    'forklift aisle between pipe crates',
    'gray electrical conduit coils',
    'white pipe stacked in a suburban supply yard',
    'close-up of a solvent-weld joint',
    'dusk exterior of a supply warehouse',
    'orange safety cones beside a pipe pallet',
  ],
  'fitness-centre': [
    'sunlit gym floor with kettlebells and a jump rope',
    'dumbbell rack in a brick-wall studio',
    'yoga mats rolled beside a window',
    'resistance bands on a wooden bench',
    'morning light across an empty lifting platform',
    'row of medicine balls against a dark wall',
    'stainless water bottle and towel on rubber flooring',
    'cable machine in a quiet training room',
    'outdoor training turf with cones',
    'close-up of chalked hands-free barbell knurling',
    'mirror wall reflecting empty studio space',
    'dusk gym interior with warm pendant lights',
  ],
  gardener: [
    'freshly edged lawn and mulched beds',
    'stone patio with boxwood and lanterns',
    'wheelbarrow of soil beside hostas',
    'trim hedge line in late-day sun',
    'stacked fieldstone retaining wall',
    'dripping hose over new plantings',
    'paver walk through ornamental grass',
    'close-up of wet soil and seedlings',
    'suburban backyard after a landscape install',
    'cedar mulch and river rock border',
    'pruned crepe myrtle against a fence',
    'blue-hour garden lights along a path',
  ],
  lawyer: [
    'walnut conference table with empty leather chairs',
    'law library shelves in warm tungsten',
    'brass lamp on a blotter and legal pads',
    'stone courthouse steps after rain',
    'reception waiting room with a single orchid',
    'close-up of a fountain pen on cream paper',
    'frosted-glass office corridor',
    'morning light through tall office windows',
    'dark wood door with a brass handle',
    'quiet reading nook with bound volumes',
    'marble lobby floor and a single bench',
    'dusk exterior of a brick professional building',
  ],
  hvac: [
    'outdoor condenser on a concrete pad',
    'copper line-set against painted siding',
    'propane tank in a side yard',
    'furnace closet with clean ductwork',
    'thermostat wall in a finished hallway',
    'technician-free rooftop units at golden hour',
    'oil tank in a tidy utility room',
    'vent register in hardwood flooring',
    'van parked at a suburban curb, no lettering',
    'close-up of a copper flare fitting',
    'snow-dusted heat pump',
    'basement mechanical room, organized',
  ],
  'estate-agent': [
    'brick rowhouse stoop in late sun',
    'empty living room with original millwork',
    'front porch with a sold-free mailbox',
    'kitchen with butcher-block and a window',
    'tree-lined Philadelphia block',
    'fresh paint on a stair newel',
    'backyard with a small deck',
    'close-up of a brass door knocker',
    'bay window and hardwood floors',
    'dusk exterior with warm interior glow',
    'stone walkway to a painted door',
    'attic dormer with morning light',
  ],
  florist: [
    'greenhouse benches of geraniums',
    'hand-tied bouquet of ranunculus, no card',
    'glass cooler of mixed roses',
    'terracotta pots and potting soil',
    'sunlit greenhouse aisle',
    'close-up of peony petals',
    'eucalyptus and dusty miller on a worktable',
    'hanging baskets under shade cloth',
    'seedling flats with condensation',
    'wrapped kraft bouquet, no text',
    'orchids in a shop window',
    'dusk greenhouse with sodium lights',
  ],
  car: [
    'used sedan on a wet lot at dusk',
    'showroom floor with a single clean coupe',
    'service bay with a lift, no signage',
    'close-up of a polished alloy wheel',
    'row of cars under string lights',
    'detailing towels on a fender',
    'engine bay, clean and dry',
    'key fob on a leather desk',
    'rain-beaded hood in morning light',
    'asphalt lot with painted stall lines',
    'headlight close-up, no badge readable',
    'office window overlooking the lot',
  ],
  restaurant: [
    'diner counter with pie under a dome',
    'griddle with pancakes and bacon',
    'booth with coffee and a sundae glass',
    'neon-free chrome stool row',
    'plated roast chicken and vegetables',
    'pizza coming out of a deck oven',
    'Chinese takeout boxes beside steamed dumplings',
    'pint glasses and a wood bar top',
    'deli case of meats and cheeses',
    'close-up of melted mozzarella',
    'red-sauce pasta in a white bowl',
    'night window of a neighborhood restaurant',
  ],
  it: [
    'server rack with blinking status lights',
    'cable-managed patch panel',
    'laptop on a standing desk, screen off',
    'network closet, tidy',
    'keyboard and a coffee mug, no logos',
    'monitor glow in a dark office',
    'fiber spools on a shelf',
    'conference table with closed notebooks',
    'close-up of ethernet ports',
    'suburban office park at dusk',
    'whiteboard with unmarked diagrams',
    'tool bag beside a workstation',
  ],
  'car-wash': [
    'tunnel entrance with hanging cloths',
    'soapy hood in bright sun',
    'rinsing arch over a dark SUV',
    'vacuum island on wet concrete',
    'close-up of water beading on paint',
    'foam cannon spray, no signage',
    'drying bay with yellow towels',
    'night wash tunnel interior lights',
    'tire shine on a wet wheel',
    'queue lane painted arrows only',
    'spot-free rinse droplets',
    'dusk exterior of a wash building',
  ],
  electrician: [
    'panel interior with neat breakers',
    'coil of romex on a job-site floor',
    'recessed can lights in a new ceiling',
    'meter can on painted siding',
    'close-up of a wire nut bundle',
    'ladder against a suburban house',
    'LED shop lights over a workbench',
    'outlet cut-in on drywall',
    'van toolbox, no lettering',
    'conduit bends on a concrete wall',
    'switch plate in a finished kitchen',
    'dusk porch light just on',
  ],
  furniture: [
    'mid-century dresser in a sunlit showroom',
    'velvet armchair and a brass lamp',
    'dining table set for no one',
    'stacked vintage chairs',
    'close-up of walnut grain',
    'consignment aisle of sofas',
    'mirror leaning on a plaster wall',
    'ceramic lamps on a sideboard',
    'oriental rug rolled halfway',
    'window light on linen upholstery',
    'brass hardware on a highboy',
    'dusk storefront with furniture silhouettes',
  ],
  bar: [
    'tap handles and a wood bar, no logos',
    'pint of amber ale with foam',
    'dartboard wall in warm light',
    'booth with pretzels and mustard',
    'close-up of a frosted mug',
    'fireplace in a stone tavern',
    'whiskey bottles as unreadable silhouettes',
    'pool table under a low lamp',
    'night patio with string lights',
    'kitchen pass with pub plates',
    'leather stool row',
    'dusk stone inn exterior',
  ],
  veterinary: [
    'empty exam table with a folded towel',
    'sunny waiting-room bench and plants',
    'stainless scale on a clean floor',
    'treat jar and a leash hook',
    'close-up of a stethoscope',
    'kennel room with soft bedding',
    'reception desk with a single orchid',
    'x-ray light box, film blank',
    'garden path to a clinic door',
    'cat tree in a quiet corner',
    'morning light through clinic blinds',
    'dusk brick veterinary building',
  ],
  tyres: [
    'stack of new tires in a service bay',
    'car on a lift with a wheel off',
    'close-up of tire tread',
    'alignment rack in a clean shop',
    'tire iron on a rubber mat',
    'wet lot with a single sedan',
    'balancing machine, no screens readable',
    'row of winter tires',
    'air hose coiled on a wall',
    'sunset through an open bay door',
    'valve stem close-up',
    'dusk tire shop exterior',
  ],
  beauty: [
    'manicure table with a desk lamp',
    'rows of polish bottles, labels unreadable',
    'pedicure chairs in soft light',
    'close-up of a finished nude manicure',
    'sterilizer and clean towels',
    'marble nail desk with flowers',
    'waiting bench and a plant',
    'UV lamp and a file, no brands',
    'soft-focus salon mirrors',
    'pink and gold salon interior',
    'hand cream and a linen napkin',
    'dusk salon storefront glow',
  ],
  tattoo: [
    'tattoo chair in a dim studio',
    'ink caps on a steel tray, no flash sheets',
    'close-up of a rotary machine',
    'brick wall with warm Edison bulbs',
    'black nitrile gloves and green soap',
    'stencil paper on a clean bench',
    'mirror and a leather table',
    'aftercare shelf, labels unreadable',
    'neon-free dark wood studio',
    'close-up of fine-line needles in a case',
    'waiting couch and a plant',
    'dusk tattoo shop door',
  ],
};

function hash(s) {
  return crypto.createHash('sha1').update(String(s)).digest('hex');
}

function hexToRgb(hex) {
  const h = String(hex || '#888888').replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) || 80,
    g: parseInt(h.slice(2, 4), 16) || 80,
    b: parseInt(h.slice(4, 6), 16) || 80,
  };
}

function sceneFor(brief, n) {
  const vertical = String(brief.vertical || brief.category || 'restaurant').toLowerCase();
  const list = SCENES[vertical] || SCENES.restaurant;
  return list[(n - 1) % list.length];
}

function harvestSlotSet(prov) {
  const set = new Set();
  for (const s of prov.sources || []) {
    const m = String(s.to || '').match(/image-(\d+)/);
    if (m) set.add(Number(m[1]));
  }
  return set;
}

function isTinyOrMissing(file) {
  if (!fs.existsSync(file)) return true;
  return fs.statSync(file).size < 800;
}

function looksLikeAtmosphere(file, n, prov) {
  if ((prov.generatedAtmosphere || []).includes(n)) return true;
  if (!fs.existsSync(file)) return true;
  const buf = fs.readFileSync(file);
  const animatedFile =
    (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) ||
    (buf.slice(0, 4).toString('ascii') === 'RIFF' &&
      (buf.includes(Buffer.from('ANIM')) || buf.includes(Buffer.from('ANMF'))));
  if (animatedFile) return true;
  const size = buf.length;
  const harvested = harvestSlotSet(prov);
  if (harvested.has(n) && size >= 800) return false;
  return size < 45000;
}

function sceneHtml(brief, n, scene) {
  const t = brief.tokens || {};
  const a = hexToRgb(t.accent || '#4B4F58');
  const b = hexToRgb(t.accent2 || '#C2410C');
  const d = hexToRgb(t.deep || '#12161C');
  const p = hexToRgb(t.paper || '#E5E1DA');
  const salt = parseInt(hash(`${brief.slug}:${n}:${scene}`).slice(0, 8), 16);
  const ang = 20 + (salt % 140);
  const x1 = 8 + (salt % 40);
  const y1 = 10 + ((salt >> 3) % 36);
  const x2 = 55 + ((salt >> 6) % 30);
  const y2 = 48 + ((salt >> 9) % 28);
  const grain = 0.12 + ((salt >> 12) % 10) / 100;
  const subject = n % 6;
  return `<!doctype html><meta charset="utf-8">
<style>
html,body{margin:0;height:100%;overflow:hidden;background:#111}
body{
  background:
    radial-gradient(900px 520px at ${x1}% ${y1}%, rgb(${a.r},${a.g},${a.b}), transparent 58%),
    radial-gradient(760px 480px at ${x2}% ${y2}%, rgb(${b.r},${b.g},${b.b}), transparent 62%),
    linear-gradient(${ang}deg, rgb(${d.r},${d.g},${d.b}), rgb(${p.r},${p.g},${p.b}));
}
.grain{position:fixed;inset:0;opacity:${grain};pointer-events:none;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.vignette{position:fixed;inset:0;box-shadow:inset 0 0 180px 40px rgba(0,0,0,.45);pointer-events:none}
.stage{position:absolute;inset:0}
.pipe{position:absolute;border-radius:40px;background:linear-gradient(90deg,#d9d9d9,#8a8f96 40%,#f2f2f2 70%,#6d7278);
  box-shadow:0 18px 40px rgba(0,0,0,.35), inset 0 8px 16px rgba(255,255,255,.35)}
.orb{position:absolute;border-radius:50%;filter:blur(.4px);
  box-shadow:0 24px 50px rgba(0,0,0,.4), inset -12px -16px 30px rgba(0,0,0,.25), inset 10px 12px 20px rgba(255,255,255,.28)}
.slab{position:absolute;border-radius:6px;
  box-shadow:0 22px 48px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.25)}
.leaf{position:absolute;border-radius:60% 10% 60% 10%;transform:rotate(${(salt % 50) - 20}deg);
  box-shadow:0 16px 30px rgba(0,0,0,.28)}
.bar{position:absolute;border-radius:999px;box-shadow:0 10px 24px rgba(0,0,0,.3)}
</style>
<div class="stage">
${
  subject === 0
    ? `<div class="pipe" style="left:${12 + (n % 7)}%;top:${28 + (n % 5)}%;width:78%;height:${72 + (n % 20)}px;transform:rotate(${-8 + (n % 9)}deg)"></div>
       <div class="pipe" style="left:${8 + (n % 5)}%;top:${46 + (n % 6)}%;width:70%;height:${54 + (n % 16)}px;transform:rotate(${6 - (n % 7)}deg);opacity:.88"></div>`
    : ''
}
${
  subject === 1
    ? `<div class="orb" style="left:${30 + (n % 20)}%;top:${22 + (n % 18)}%;width:${220 + n * 9}px;height:${220 + n * 9}px;background:radial-gradient(circle at 35% 30%, #fff, rgb(${a.r},${a.g},${a.b}) 42%, rgb(${d.r},${d.g},${d.b}))"></div>`
    : ''
}
${
  subject === 2
    ? `<div class="slab" style="left:${18 + (n % 10)}%;top:${30 + (n % 8)}%;width:${46 + n}%;height:${38 + n}%;background:linear-gradient(160deg, rgb(${p.r},${p.g},${p.b}), rgb(${a.r},${a.g},${a.b}))"></div>
       <div class="slab" style="left:${48 + (n % 8)}%;top:${42 + (n % 6)}%;width:${28 + n}%;height:${22 + n}%;background:rgb(${b.r},${b.g},${b.b});opacity:.85"></div>`
    : ''
}
${
  subject === 3
    ? `<div class="leaf" style="left:${24 + n}%;top:${20 + n}%;width:${180 + n * 8}px;height:${90 + n * 4}px;background:rgb(${Math.max(40, a.g)},${Math.min(180, 80 + n * 8)},${Math.max(30, a.b / 2)})"></div>
       <div class="leaf" style="left:${38 + n}%;top:${36 + n}%;width:${160 + n * 6}px;height:${80 + n * 3}px;background:rgb(${Math.max(30, b.g / 2)},${Math.min(160, 60 + n * 7)},40)"></div>`
    : ''
}
${
  subject === 4
    ? `<div class="bar" style="left:12%;top:${40 + n * 2}%;width:76%;height:18px;background:#1a1a1a"></div>
       <div class="bar" style="left:18%;top:${48 + n * 2}%;width:64%;height:14px;background:rgb(${a.r},${a.g},${a.b})"></div>
       <div class="orb" style="left:${50 + n}%;top:${28 + n}%;width:160px;height:160px;background:radial-gradient(circle at 30% 30%,#fff8e7, rgb(${b.r},${b.g},${b.b}))"></div>`
    : ''
}
${
  subject === 5
    ? `<div class="slab" style="inset:18% 12% 22% 12%;background:linear-gradient(180deg, rgba(255,255,255,.18), transparent 30%), rgb(${d.r},${d.g},${d.b});border-radius:18px"></div>
       <div class="orb" style="left:42%;top:34%;width:${140 + n * 4}px;height:${140 + n * 4}px;background:radial-gradient(circle at 32% 28%,#fff, rgb(${a.r},${a.g},${a.b}))"></div>`
    : ''
}
</div>
<div class="grain"></div>
<div class="vignette"></div>`;
}

function animateStill(stillPath, destPath, slug, n) {
  const h = hash(`${slug}:${n}:kenburns`);
  const zoomEnd = (1.08 + (parseInt(h.slice(0, 2), 16) / 255) * 0.1).toFixed(3);
  const panX = ((parseInt(h.slice(2, 4), 16) / 255) * 90).toFixed(1);
  const panY = ((parseInt(h.slice(4, 6), 16) / 255) * 50).toFixed(1);
  const frames = 32 + (parseInt(h.slice(6, 8), 16) % 10);
  const stamp = h.slice(0, 6);
  const tmp = `${destPath}.${process.pid}.anim.webp`;
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-loop',
      '1',
      '-i',
      stillPath,
      '-vf',
      `zoompan=z='min(1.0+0.0014*on,${zoomEnd})':x='iw/2-(iw/zoom/2)+${panX}':y='ih/2-(ih/zoom/2)+${panY}':d=${frames}:s=1280x720:fps=8,drawbox=x=iw-12:y=ih-12:w=10:h=10:color=0x${stamp}@1:t=fill`,
      '-t',
      String((frames / 8).toFixed(2)),
      '-an',
      '-c:v',
      'libwebp',
      '-q:v',
      '72',
      '-loop',
      '0',
      tmp,
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );
  fs.copyFileSync(tmp, destPath);
  fs.unlinkSync(tmp);
}

function findGeneratedStill(slug, n) {
  const root = path.join(__dirname, 'generated-media', slug);
  if (!fs.existsSync(root)) return null;
  const names = [`image-${n}.png`, `image-${n}.jpg`, `image-${n}.webp`, `image-${n}.jpeg`];
  for (const name of names) {
    const p = path.join(root, name);
    if (fs.existsSync(p) && fs.statSync(p).size > 2000) return p;
  }
  return null;
}

function assignAiStills(slug, needed, harvested, destFor, prov) {
  const named = {};
  const unused = [];
  for (let n = 1; n <= 16; n++) {
    const p = findGeneratedStill(slug, n);
    if (!p) continue;
    const dest = destFor(n);
    const harvestIsReal = harvested.has(n) && !looksLikeAtmosphere(dest, n, prov);
    if (n <= needed && !harvestIsReal) {
      named[n] = p;
    } else {
      unused.push(p);
    }
  }
  let i = 0;
  for (let n = 1; n <= needed; n++) {
    if (named[n] || harvested.has(n)) continue;
    if (unused[i]) {
      named[n] = unused[i];
      i += 1;
    }
  }
  return named;
}

async function generateUniqueMedia(siteDir, brief, harvestDir) {
  const assets = path.join(siteDir, 'assets');
  fs.mkdirSync(assets, { recursive: true });
  const needed = (brief.images || []).length || 12;
  const slug = brief.slug || path.basename(siteDir);
  const animated = ANIMATED_SLUGS.has(slug);
  if (harvestDir && slug) {
    applyHarvestImages(slug, siteDir, { harvestDir, targetCount: needed });
  }
  const provPath = path.join(assets, 'PROVENANCE.json');
  const prev = fs.existsSync(provPath) ? JSON.parse(fs.readFileSync(provPath, 'utf8')) : {};
  const harvested = harvestSlotSet(prev);

  const destFor = (n) => path.join(assets, `image-${n}.webp`);
  const aiMap = assignAiStills(slug, needed, harvested, destFor, prev);
  const work = [];
  for (let n = 1; n <= needed; n++) {
    const dest = destFor(n);
    const keepHarvest = harvested.has(n) && !looksLikeAtmosphere(dest, n, prev) && !aiMap[n];
    if (keepHarvest && !animated) continue;
    work.push({ n, dest, keepHarvest });
  }
  if (!work.length) return { generated: 0, animated: 0, photoreal: 0 };

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 980 } });
  const generated = [];
  const animatedSlots = [];
  const photorealSlots = [];
  const aiUsed = [];

  for (const job of work) {
    const still = path.join(assets, `.still-${job.n}.jpg`);
    const ai = aiMap[job.n];
    if (ai) {
      execFileSync(
        'ffmpeg',
        ['-y', '-i', ai, '-frames:v', '1', '-update', '1', '-q:v', '4', still],
        { stdio: ['ignore', 'pipe', 'pipe'] }
      );
      aiUsed.push(job.n);
    } else if (job.keepHarvest) {
      execFileSync(
        'ffmpeg',
        ['-y', '-i', job.dest, '-frames:v', '1', '-update', '1', '-q:v', '4', still],
        { stdio: ['ignore', 'pipe', 'pipe'] }
      );
    } else {
      const scene = sceneFor(brief, job.n);
      await page.setContent(sceneHtml(brief, job.n, scene));
      const buf = await page.screenshot({ type: 'jpeg', quality: 88 });
      fs.writeFileSync(still, buf);
      generated.push(job.n);
    }

    const stamp = hash(`${slug}/image-${job.n}.webp:${animated ? 'anim' : 'still'}`).slice(0, 6);
    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-i',
        still,
        '-frames:v',
        '1',
        '-update',
        '1',
        '-vf',
        `scale=1400:-2,drawbox=x=iw-12:y=ih-12:w=10:h=10:color=0x${stamp}@1:t=fill`,
        '-q:v',
        '4',
        job.dest,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );
    if (animated) animatedSlots.push(job.n);
    else photorealSlots.push(job.n);
    if (fs.existsSync(still)) fs.unlinkSync(still);
  }
  await browser.close();

  prev.generatedAtmosphere = [];
  prev.generatedUnique = generated;
  prev.aiStills = aiUsed;
  prev.animatedSlots = animatedSlots;
  prev.photorealSlots = photorealSlots;
  prev.mediaMode = animated ? 'animated' : 'photoreal';
  prev.generatedNote =
    'Generated atmosphere and lookalike stills. Not the business official photography. Half the batch is animated, half is photoreal.';
  prev.harvestDir = harvestDir || prev.harvestDir || null;
  fs.writeFileSync(provPath, JSON.stringify(prev, null, 2));
  return {
    generated: generated.length,
    animated: animatedSlots.length,
    photoreal: photorealSlots.length,
    ai: aiUsed.length,
    slots: work.map((w) => w.n),
  };
}

module.exports = { generateUniqueMedia, ANIMATED_SLUGS, sceneFor };

if (require.main === module) {
  const siteDir = process.argv[2];
  const brief = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  generateUniqueMedia(siteDir, brief, process.argv[4]).then((r) => {
    console.log(JSON.stringify(r));
  });
}
