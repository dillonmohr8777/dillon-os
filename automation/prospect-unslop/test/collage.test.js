'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const HERE = path.resolve(__dirname, '..');
const COLLAGE = path.join(HERE, 'collage.py');

function writePhoto(dest, color, size) {
  const py = `
from PIL import Image
im = Image.new("RGB", (${size[0]}, ${size[1]}), (${color[0]}, ${color[1]}, ${color[2]}))
im.save(${JSON.stringify(dest)})
`;
  const res = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
  if (res.status !== 0) throw new Error(res.stderr || 'photo write failed');
}

test('collage.py body kind writes slots 6-10 without touching hero 1-5', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unslop-collage-'));
  const photos = [0, 1, 2].map((i) => {
    const p = path.join(dir, `src-${i}.png`);
    writePhoto(p, [40 + i * 50, 80, 90 + i * 20], [800, 1000]);
    return p;
  });
  const heroDir = path.join(dir, 'hero');
  fs.mkdirSync(heroDir);
  const spec = (kind) =>
    JSON.stringify({
      outDir: heroDir,
      sources: photos,
      accent: '#C2410C',
      ink: '#1A1410',
      deep: '#2A1810',
      paper: '#F4EFE7',
      accent2: '#E7A843',
      mode: 'food',
      slug: 'narberth-pizza',
      kind,
    });
  const hero = spawnSync('python3', [COLLAGE], { input: spec('hero'), encoding: 'utf8' });
  assert.equal(hero.status, 0, hero.stderr || hero.stdout);
  const heroJson = JSON.parse(hero.stdout.trim().split('\n').pop());
  assert.equal(heroJson.ok, true);
  assert.equal(heroJson.hashes.length, 5);
  const heroHash1 = crypto.createHash('sha256').update(fs.readFileSync(path.join(heroDir, 'collage-1.webp'))).digest('hex');

  const body = spawnSync('python3', [COLLAGE], { input: spec('body'), encoding: 'utf8' });
  assert.equal(body.status, 0, body.stderr || body.stdout);
  const bodyJson = JSON.parse(body.stdout.trim().split('\n').pop());
  assert.equal(bodyJson.ok, true);
  assert.equal(bodyJson.hashes.length, 5);
  const stillHero1 = crypto.createHash('sha256').update(fs.readFileSync(path.join(heroDir, 'collage-1.webp'))).digest('hex');
  assert.equal(stillHero1, heroHash1);
  for (let i = 6; i <= 10; i++) {
    assert.ok(fs.existsSync(path.join(heroDir, `collage-${i}.webp`)));
  }
  const all = [];
  for (let i = 1; i <= 10; i++) {
    all.push(crypto.createHash('sha256').update(fs.readFileSync(path.join(heroDir, `collage-${i}.webp`))).digest('hex'));
  }
  assert.equal(new Set(all).size, 10);
  const landscape = spawnSync(
    'python3',
    ['-c', `from PIL import Image; im=Image.open(${JSON.stringify(path.join(heroDir, 'collage-6.webp'))}); print(im.size[0], im.size[1])`],
    { encoding: 'utf8' }
  );
  assert.equal(landscape.status, 0, landscape.stderr);
  const [w, h] = landscape.stdout.trim().split(/\s+/).map(Number);
  assert.ok(w > h, `cinematic slot should be landscape, got ${w}x${h}`);
  fs.rmSync(dir, { recursive: true, force: true });
});
