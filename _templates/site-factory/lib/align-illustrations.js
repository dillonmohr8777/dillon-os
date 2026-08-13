/**
 * Unique animated (not photoreal) Align-teal illustrations for batch sites.
 * Each SVG is hashed-distinct. No logos, no type. SMIL + CSS motion inside
 * the file so the art itself moves; page CSS adds 3D / Ken Burns on top.
 */
const crypto = require('crypto');

function hash32(s) {
  return parseInt(crypto.createHash('sha256').update(String(s)).digest('hex').slice(0, 8), 16);
}

function hsl(h, s, l) {
  return `hsl(${((h % 360) + 360) % 360} ${s}% ${l}%)`;
}

const MOTIFS = {
  dentist: 'tooth',
  veterinary: 'paw',
  optometrist: 'lens',
  optician: 'lens',
  clinic: 'cross',
  doctor: 'cross',
  alternative: 'leaf',
  hvac: 'wave',
  electrician: 'bolt',
  'metal-construction': 'gear',
  gardener: 'leaf',
  kitchen: 'arc',
  floorer: 'plank',
  insurance: 'shield',
  lawyer: 'column',
  accountant: 'bars',
  'fitness-centre': 'ring',
  'car-repair': 'wrench',
};

function motifKind(vertical = '', category = '') {
  const hay = `${vertical} ${category}`.toLowerCase();
  if (/dent/.test(hay)) return 'dentist';
  if (/vet|animal/.test(hay)) return 'veterinary';
  if (/eye|optom|vision/.test(hay)) return 'optometrist';
  if (/urgent|plastic|hormone|clinic/.test(hay)) return 'clinic';
  if (/hvac|air|heat/.test(hay)) return 'hvac';
  if (/electric/.test(hay)) return 'electrician';
  if (/auger|metal|manufact/.test(hay)) return 'metal-construction';
  if (/land|garden/.test(hay)) return 'gardener';
  if (/bath|kitchen/.test(hay)) return 'kitchen';
  if (/floor/.test(hay)) return 'floorer';
  if (/tag|insurance/.test(hay)) return 'insurance';
  if (/law|injury|legal/.test(hay)) return 'lawyer';
  if (/financial|account/.test(hay)) return 'accountant';
  if (/train|fitness|nourish/.test(hay)) return 'fitness-centre';
  if (/auto|car|service center/.test(hay)) return 'car-repair';
  return MOTIFS[vertical] ? vertical : 'clinic';
}

function motifPath(kind, seed) {
  const j = seed % 17;
  switch (kind) {
    case 'tooth':
      return `M80 40c18 0 28 14 28 28v18c0 22-8 38-28 48-20-10-28-26-28-48V68c0-14 10-28 28-28z`;
    case 'paw':
      return `M80 92c18 0 32-12 32-28 0-10-8-16-16-16-6 0-10 3-16 3s-10-3-16-3c-8 0-16 6-16 16 0 16 14 28 32 28z M52 48c8 0 14-8 14-16S60 18 52 18 38 24 38 32s6 16 14 16z M108 48c8 0 14-8 14-16s-6-14-14-14-14 6-14 14 6 16 14 16z M68 28c7 0 12-7 12-14S75 2 68 2 56 7 56 14s5 14 12 14z M92 28c7 0 12-7 12-14S99 2 92 2 80 7 80 14s5 14 12 14z`;
    case 'lens':
      return `M80 30a42 42 0 1 1 0 84 42 42 0 1 1 0-84zm0 14a28 28 0 1 0 0 56 28 28 0 1 0 0-56z`;
    case 'cross':
      return `M68 28h24v32h32v24H92v32H68V84H36V60h32z`;
    case 'bolt':
      return `M92 12 48 78h28l-12 50 52-72H88z`;
    case 'wave':
      return `M12 80c18-22 28-22 46 0s28 22 46 0 28-22 44 0v18c-16-22-26-22-44 0s-28 22-46 0-28-22-46 0z`;
    case 'gear':
      return `M70 18h20l6 16 16-6 10 18-14 10 14 10-10 18-16-6-6 16H70l-6-16-16 6-10-18 14-10-14-10 10-18 16 6z M80 58a18 18 0 1 0 0.1 0z`;
    case 'leaf':
      return `M80 16c36 22 48 54 28 88-28 8-52-10-60-40 22-8 40-22 32-48z`;
    case 'arc':
      return `M28 96c0-36 24-64 52-64s52 28 52 64H112c0-24-14-44-32-44S48 72 48 96z`;
    case 'plank':
      return `M20 44h120v18H20zm0 28h120v18H20zm0 28h120v18H20z`;
    case 'shield':
      return `M80 16 124 36v34c0 28-20 48-44 58-24-10-44-30-44-58V36z`;
    case 'column':
      return `M40 28h80v12H40zm12 12h56v72H52zM36 112h88v12H36z`;
    case 'bars':
      return `M36 96h20V48H36zm34 0h20V28H70zm34 0h20V60H104z`;
    case 'ring':
      return `M80 28a40 40 0 1 1 0 80 40 40 0 1 1 0-80zm0 14a26 26 0 1 0 .1 0z`;
    case 'wrench':
      return `M48 28c12-12 28-8 36 4l40 40-16 16-40-40c-12-8-16-24-4-36zm52 52 24 24-12 12-24-24z`;
    default:
      return `M40 ${40 + j}h80v80H40z`;
  }
}

function buildSvg({ slug, index, vertical, name, category = '' }) {
  const seed = hash32(`${slug}:${index}:${name}`);
  const kind = MOTIFS[vertical] || MOTIFS[motifKind(vertical, category)] || 'ring';
  const tealH = 162 + (seed % 22);
  const paper = hsl(42 + (seed % 8), 28, 92 - (index % 4));
  const navy = hsl(214, 48, 10 + (seed % 6));
  const teal = hsl(tealH, 58, 38 + (index % 8));
  const teal2 = hsl(tealH + 12, 62, 52);
  const orange = hsl(24 + (seed % 10), 78, 54);
  const blobA = 80 + (seed % 40);
  const blobB = 120 + ((seed >> 3) % 50);
  const dur = (6 + (index % 5) + (seed % 4) * 0.35).toFixed(2);
  const dur2 = (8 + (index % 6) * 0.4).toFixed(2);
  const x1 = 20 + (index * 17 + seed) % 220;
  const y1 = 30 + (index * 13 + (seed >> 2)) % 140;
  const x2 = 80 + (index * 23) % 200;
  const y2 = 70 + (index * 19) % 120;
  const path = motifPath(kind, seed + index);
  const extra = motifPath(kind, seed + 11);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000" role="img" aria-hidden="true">
  <title>Animated Align-teal illustration ${index} for ${slug}</title>
  <defs>
    <linearGradient id="g${index}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${navy}"/>
      <stop offset=".45" stop-color="${teal}"/>
      <stop offset="1" stop-color="${paper}"/>
    </linearGradient>
    <radialGradient id="r${index}" cx="35%" cy="20%" r="70%">
      <stop offset="0" stop-color="${teal2}" stop-opacity=".9"/>
      <stop offset="1" stop-color="${navy}" stop-opacity=".1"/>
    </radialGradient>
    <linearGradient id="glass${index}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".28"/>
      <stop offset="1" stop-color="${teal2}" stop-opacity=".05"/>
    </linearGradient>
    <filter id="f${index}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${8 + (index % 6)}" />
    </filter>
    <style>
      .float { animation: float ${dur}s ease-in-out infinite alternate; }
      .spin { animation: spin ${dur2}s linear infinite; transform-origin: 800px 500px; }
      .pulse { animation: pulse ${dur}s ease-in-out infinite alternate; }
      .sheen { animation: sheen ${Number(dur) + 3}s ease-in-out infinite; }
      @keyframes float { from { transform: translate(0,0) scale(1); } to { transform: translate(${8 + index}px, ${-12 - index}px) scale(1.04); } }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes pulse { from { opacity:.55; } to { opacity:.95; } }
      @keyframes sheen { from { transform: translateX(-12%); opacity:.15; } to { transform: translateX(18%); opacity:.4; } }
      @media (prefers-reduced-motion: reduce) {
        .float,.spin,.pulse,.sheen { animation: none !important; }
      }
    </style>
  </defs>
  <rect width="1600" height="1000" fill="${paper}"/>
  <rect width="1600" height="1000" fill="url(#g${index})" opacity=".88"/>
  <ellipse class="float" cx="${x1 + 400}" cy="${y1 + 280}" rx="${blobA + 180}" ry="${blobB}" fill="url(#r${index})" filter="url(#f${index})" opacity=".85"/>
  <ellipse class="pulse" cx="${x2 + 900}" cy="${y2 + 420}" rx="${blobB + 40}" ry="${blobA}" fill="${teal2}" opacity=".35" filter="url(#f${index})"/>
  <circle class="float" cx="${300 + (index * 41) % 1000}" cy="${180 + (index * 29) % 600}" r="${40 + (index % 7) * 8}" fill="${orange}" opacity=".28"/>
  <circle class="pulse" cx="${1100 + (index * 19) % 280}" cy="${160 + (index * 37) % 220}" r="${28 + (index % 5) * 6}" fill="${teal}" opacity=".22"/>
  <g class="spin" opacity=".22">
    <path d="${extra}" fill="${teal}" transform="translate(720 380) scale(4.2)"/>
  </g>
  <g class="float" opacity=".9">
    <path d="${path}" fill="${paper}" stroke="${teal}" stroke-width="4" transform="translate(${480 + (index % 7) * 36} ${220 + (index % 5) * 28}) scale(3.4)"/>
  </g>
  <rect x="120" y="90" width="1360" height="820" fill="url(#glass${index})" rx="48" opacity=".55"/>
  <rect class="sheen" x="120" y="90" width="220" height="820" fill="#fff" opacity=".12" rx="48"/>
  <rect x="48" y="48" width="1504" height="904" fill="none" stroke="${teal2}" stroke-opacity=".35" stroke-width="2" rx="42"/>
</svg>
`;
}

function uniqueTokens(slug, index = 0) {
  const seed = hash32(slug + ':tokens');
  const tealH = 162 + (seed % 18);
  const paperShift = seed % 6;
  const papers = ['#F4F0E6', '#F2EEE0', '#F6F1E4', '#EFEBE0', '#F3F0E8', '#F5F2E7'];
  const accents = [
    '#157A6A', '#186F62', '#1A7A6C', '#14685C', '#1B7366',
    '#0F6B5C', '#187566', '#1C6F63', '#155E54', '#1A806F',
  ];
  const oranges = ['#E8832A', '#E07A22', '#D9782C', '#F08A32', '#DC7C28'];
  return {
    paper: papers[paperShift],
    ink: '#0A1628',
    accent: accents[(seed + index) % accents.length],
    accent2: oranges[seed % oranges.length],
    panel: '#D4E3DD',
    deep: '#0A1628',
    onPaper: '#090909',
    onAccent: '#FFFFFF',
    onAccent2: '#090909',
    onPanel: '#090909',
    onDeep: '#FFFFFF',
    border: '1px',
    radius: '24px',
  };
}

module.exports = { buildSvg, uniqueTokens, MOTIFS, motifKind };
