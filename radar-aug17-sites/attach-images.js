#!/usr/bin/env node
'use strict';

/** Convert generated PNGs into site WebP plates and rebuild HTML. */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const srcDir = process.argv[2] || '/opt/cursor/artifacts/assets';
const py = `
from pathlib import Path
from PIL import Image
import json, sys
src = Path(sys.argv[1])
root = Path(sys.argv[2])
manifest = json.loads((root / 'lib' / 'image-manifest.json').read_text())
n = 0
for row in manifest:
    png = src / row['file']
    if not png.exists():
        continue
    dest = root / row['dest']
    dest.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(png).convert('RGB')
    w, h = im.size
    if w > 1400:
        im = im.resize((1400, round(h * 1400 / w)), Image.Resampling.LANCZOS)
    im.save(dest, 'WEBP', quality=72, method=6)
    n += 1
    print(dest, dest.stat().st_size)
print('attached', n)
`;
const r = spawnSync('python3', ['-c', py, srcDir, ROOT], { encoding: 'utf8' });
process.stdout.write(r.stdout || '');
process.stderr.write(r.stderr || '');
if (r.status) process.exit(r.status);
require('./build.js').writeAll();
