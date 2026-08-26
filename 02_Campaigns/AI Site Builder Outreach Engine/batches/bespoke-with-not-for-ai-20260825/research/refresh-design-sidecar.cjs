const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const designPath = path.join(root, 'DESIGN.md');
const sidecarPath = path.join(root, '.impeccable', 'design.json');
const markdown = fs.readFileSync(designPath, 'utf8');
const sidecar = JSON.parse(fs.readFileSync(sidecarPath, 'utf8'));
const lines = markdown.split(/\r?\n/);

const clean = (value) => value
  .replace(/^\s*-\s*/, '')
  .replace(/\*\*/g, '')
  .trim();

const title = markdown.match(/^# Design System:\s*(.+)$/m)?.[1]?.trim();
const northStar = markdown.match(/\*\*Creative North Star:\s*"([^"]+)"\*\*/)?.[1];
const overviewBlock = markdown.match(/\*\*Creative North Star:[^\n]+\*\*\s*([\s\S]*?)\n\*\*Key Characteristics:\*\*/)?.[1]?.trim();
const keyBlock = markdown.match(/\*\*Key Characteristics:\*\*\s*([\s\S]*?)\n## Colors/)?.[1] || '';
const keyCharacteristics = keyBlock.split(/\r?\n/).filter((line) => /^\s*-\s+/.test(line)).map(clean);

const rules = [];
let currentSection = 'overview';
for (const line of lines) {
  const sectionMatch = line.match(/^##\s+(.+)$/);
  if (sectionMatch) currentSection = sectionMatch[1].toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
  const ruleMatch = line.match(/^\*\*The (.+?) Rule\.\*\*\s*(.+)$/);
  if (ruleMatch) {
    rules.push({
      name: `The ${ruleMatch[1]} Rule`,
      body: ruleMatch[2].trim(),
      section: currentSection,
    });
  }
}

function listBetween(startHeading, endHeading) {
  const start = lines.findIndex((line) => line.trim() === startHeading);
  if (start < 0) return [];
  const end = endHeading
    ? lines.findIndex((line, index) => index > start && line.trim() === endHeading)
    : lines.length;
  return lines.slice(start + 1, end < 0 ? lines.length : end)
    .filter((line) => /^\s*-\s+/.test(line))
    .map(clean);
}

sidecar.generatedAt = new Date().toISOString();
if (title) sidecar.title = `Design System: ${title}`;
sidecar.extensions.colorMeta['robot-highlight'] = {
  role: 'secondary',
  displayName: 'Robot Highlight',
  canonical: '#F39A50',
  tonalRamp: ['#321B0C', '#593016', '#824720', '#AC602D', '#D77C3D', '#F39A50', '#F8C395', '#FDEBDD'],
};
sidecar.narrative = {
  northStar: northStar || sidecar.narrative?.northStar || '',
  overview: overviewBlock || sidecar.narrative?.overview || '',
  keyCharacteristics,
  rules,
  dos: listBetween('### Do:', "### Don't:"),
  donts: listBetween("### Don'ts:", null).length
    ? listBetween("### Don'ts:", null)
    : listBetween("### Don't:", null),
};

sidecar.extensions.motion = sidecar.extensions.motion.filter((entry) => !['brand-reactors', 'robot-to-logo'].includes(entry.name));
sidecar.extensions.motion.push(
  {
    name: 'brand-reactors',
    value: '5.5s–8s',
    purpose: 'Distinct orbital and core signals for policy, systems, team, workflow, and adoption states.',
  },
  {
    name: 'robot-to-logo',
    value: '3.7s',
    purpose: 'Charge, circuit travel, color transition, and exact-pixel settlement from the footer robot to the official logo.',
  },
);

sidecar.components = sidecar.components.filter((entry) => !['Brand Reactor', 'Signal Replay'].includes(entry.name));
sidecar.components.push(
  {
    name: 'Brand Reactor',
    kind: 'custom',
    description: 'An orbital liquid-glass circuit core used where another robot would dilute the character.',
    html: '<div class="ds-reactor" aria-hidden="true"><i></i><i></i><svg viewBox="0 0 48 48"><path d="M6 17V7h12v8h6V7h11v8h7v12h-8v6h8v9H30v-8h-6v8H13V32H6V21h8v-4z"/><path d="M18 18h12v12H18z"/></svg></div>',
    css: '.ds-reactor { position:relative; display:grid; width:180px; aspect-ratio:1; place-items:center; border:1px solid rgba(15,110,86,.24); border-radius:50%; background:radial-gradient(circle at 38% 32%,rgba(255,255,255,.92),rgba(255,255,255,.38) 26%,transparent 27%),rgba(15,110,86,.10); box-shadow:inset 0 0 44px rgba(15,110,86,.14),0 28px 72px rgba(11,24,16,.16); color:#0F6E56; } .ds-reactor i { position:absolute; inset:10%; border:1px solid rgba(15,110,86,.4); border-radius:50%; animation:ds-orbit 8s linear infinite; } .ds-reactor i:nth-child(2) { inset:24%; animation-duration:5.5s; animation-direction:reverse; } .ds-reactor i::after { position:absolute; top:-4px; left:48%; width:8px; aspect-ratio:1; border-radius:50%; background:#0F6E56; box-shadow:0 0 16px #0F6E56; content:""; } .ds-reactor svg { z-index:2; width:42%; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; } @keyframes ds-orbit { to { transform:rotate(360deg); } }',
  },
  {
    name: 'Signal Replay',
    kind: 'button',
    description: 'A live signal meter that replays the footer robot-to-logo transformation.',
    html: '<button class="ds-signal" aria-label="Replay signal"><span></span><span></span><span></span><span></span><span></span></button>',
    css: '.ds-signal { display:flex; height:24px; align-items:end; gap:5px; padding:11px 12px; border:1px solid rgba(159,232,112,.3); border-radius:999px; background:rgba(17,20,18,.72); box-shadow:0 12px 38px rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.12); cursor:pointer; backdrop-filter:blur(16px) saturate(150%); } .ds-signal span { width:3px; height:35%; border-radius:999px; background:#9FE870; animation:ds-pulse 1.25s ease-in-out infinite alternate; } .ds-signal span:nth-child(2) { height:70%; animation-delay:-.3s; } .ds-signal span:nth-child(3) { height:100%; animation-delay:-.6s; } .ds-signal span:nth-child(4) { height:62%; animation-delay:-.45s; } .ds-signal span:nth-child(5) { height:42%; animation-delay:-.15s; } .ds-signal:hover { border-color:rgba(159,232,112,.7); transform:translateY(-2px); } .ds-signal:focus-visible { outline:3px solid #9FE870; outline-offset:4px; } @keyframes ds-pulse { to { transform:scaleY(.45); opacity:.45; } }',
  },
);

fs.writeFileSync(sidecarPath, `${JSON.stringify(sidecar, null, 2)}\n`);
console.log(`Refreshed ${sidecarPath}`);
