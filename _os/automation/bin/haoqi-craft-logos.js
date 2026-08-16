#!/usr/bin/env node
'use strict';

/**
 * Re-fetch honest logos and cut backgrounds. Favicons stay out.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { repoPath, ensureDir } = require('../lib/fsutil');
const { httpGet } = require('../lib/net');

const ROOT = repoPath('haoqi-radar-sites');
const LOGO_PY = repoPath('_os/automation/lib/haoqi-logo.py');

const FETCH = [
  { slug: 'always-dental-care', url: 'https://www.alwaysdentalcare.com/wp-content/themes/charlie-child/images/logo.webp' },
  { slug: 'benjamin-lovell-shoes', url: 'https://blshoes.com/wp-content/uploads/2022/02/Logo2.jpg' },
  { slug: 'dream-team', url: 'https://dreamteampa.com/wp-content/uploads/2026/05/dream-team-logo.webp' },
  { slug: 'dutton-road-vet', url: 'http://duttonroadvetclinic.com/shop/images/logo.jpg' },
  { slug: 'erlegal', url: 'https://www.1634legal.com/wp-content/uploads/2022/10/erlegalteam-header-logo.png' },
  { slug: 'heart-and-soul-tattoo', url: 'https://heartandsoultattoos.com/wp-content/uploads/2017/01/logo-3.png' },
  { slug: 'kinetic-physical-therapy', url: 'https://kineticptpa.com/wp-content/uploads/2023/10/kinetic-primary-logo-white-rgb-900px-w-72ppi.png' },
  { slug: 'mcmenamin-and-margiotti', url: 'https://buxmontlaw.com/wp-content/uploads/2025/09/McMenamin-Law-logo2.png' },
  { slug: 'mt-airy-pediatrics', url: 'https://irp.cdn-website.com/5dd696d9/dms3rep/multi/opt/Advocare-Logo-Your-Purpose-360w.png' },
  { slug: 'oaks-italian-deli', url: 'http://oaksitaliandeli.com/images/logo.png' },
  { slug: 'peking-gourmet', url: 'http://pekinggourmetpottstown.com/templates/tyl02/images/logo.png' },
  { slug: 'smile-culture-dental', url: 'https://smileculture.com/wp-content/uploads/2020/02/Smile-Culture-Dental_Horizontal_Logo2-e1747350391153.png' },
  { slug: 'wja-landscaping', recutOnly: true },
  { slug: 'zuber-realty', url: 'https://www.zuberrealty.com/wp-content/uploads/2021/10/zuber-logo-230x125-01.png' },
];

const DROP = ['pennsylvania-dental-group', 'new-pennsburg-diner'];

async function fetchBuf(url) {
  const res = await httpGet(url, { encoding: null, timeoutMs: 20000, maxBytes: 8_000_000 });
  if (!res.ok || !Buffer.isBuffer(res.body)) throw new Error(`fetch ${res.status || res.error}`);
  return res.body;
}

function cut(srcPath, destPath) {
  const run = spawnSync('python3', [LOGO_PY, srcPath, destPath], { encoding: 'utf8' });
  return { ok: run.status === 0 && fs.existsSync(destPath), out: (run.stdout || run.stderr || '').trim() };
}

async function main() {
  for (const slug of DROP) {
    const png = path.join(ROOT, slug, 'assets', 'logo.png');
    if (fs.existsSync(png)) fs.unlinkSync(png);
    process.stdout.write(`drop ${slug}\n`);
  }

  for (const row of FETCH) {
    const dir = path.join(ROOT, row.slug, 'assets');
    ensureDir(dir);
    const dest = path.join(dir, 'logo.png');
    const tmp = `${dest}.src`;
    try {
      if (row.url) {
        const buf = await fetchBuf(row.url);
        fs.writeFileSync(tmp, buf);
      } else if (fs.existsSync(dest)) {
        fs.copyFileSync(dest, tmp);
      } else {
        process.stdout.write(`skip ${row.slug} no source\n`);
        continue;
      }
      const result = cut(tmp, dest);
      try {
        fs.unlinkSync(tmp);
      } catch {
        /* keep */
      }
      process.stdout.write(`${row.slug} ${result.ok ? 'ok' : 'fail'} ${result.out}\n`);
      if (!result.ok && fs.existsSync(dest) && /favicon/.test(result.out)) {
        fs.unlinkSync(dest);
      }
    } catch (err) {
      process.stdout.write(`${row.slug} fail ${err.message}\n`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
