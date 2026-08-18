#!/usr/bin/env node
'use strict';

/**
 * Wire exact logos into headers, point portraits at stamped gens, fix notes.
 */

const fs = require('fs');
const path = require('path');
const { repoPath } = require('../lib/fsutil');
const { KEEP } = require('./haoqi-craft-attach-gen');

const ROOT = repoPath('haoqi-radar-sites');

const NEW_LOGO = {
  'j-pro': 'J-Pro Pools',
  'weathers-motors-and-auto-sales': 'Weathers Motors',
  'wynnewood-eyecare': 'Wynnewood Eye Care',
};

function decodeEntities(html) {
  return html
    .replace(/&amp;#8217;/g, "'")
    .replace(/&amp;#8211;/g, '-')
    .replace(/&amp;#8220;/g, '"')
    .replace(/&amp;#8221;/g, '"')
    .replace(/&amp;#183;/g, '·');
}

function noteFor(slug, html) {
  if (slug === 'golden-sea') {
    return html.replace(
      /No clean logo on the homepage, so the mark stays type\./,
      'Header mark is their homepage banner, kept as a designed field.',
    );
  }
  if (slug === 'weathers-motors-and-auto-sales') {
    return html.replace(
      /Harvested mark was a Pre-Owned badge, not their logo, so the header stays type\./,
      'Header mark is their oval Sales &amp; Service logo from the dealer header.',
    );
  }
  if (/has-logo/.test(html) && /No clean logo on the homepage, so the mark stays type\./.test(html)) {
    return html.replace(
      /No clean logo on the homepage, so the mark stays type\./,
      'Header mark is their logo, background cut to alpha.',
    );
  }
  return html;
}

function forcePortrait(html, name) {
  if (!/assets\/image-gen\.webp/.test(html)) return html;
  return html.replace(
    /<section class="portrait">\s*<figure>\s*<img src="assets\/image-[^"]+"[^>]*>/,
    `<section class="portrait">\n      <figure>\n        <img src="assets/image-gen.webp" alt="Generated atmosphere for ${name} with their exact logo" width="1400" height="1050" loading="lazy">`,
  );
}

function applyLogo(html, alt) {
  if (/has-logo/.test(html)) return html;
  return html.replace(
    /<a class="mark" href="#main">[\s\S]*?<\/a>/,
    `<a class="mark has-logo" href="#main"><img src="assets/logo.png" alt="${alt}"></a>`,
  );
}

function patch(slug) {
  const file = path.join(ROOT, slug, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const name = ((html.match(/"name":"([^"]+)"/) || [])[1] || slug).replace(/&/g, '&amp;');
  if (NEW_LOGO[slug]) html = applyLogo(html, NEW_LOGO[slug]);
  html = forcePortrait(html, name);
  html = noteFor(slug, html);
  html = decodeEntities(html);
  fs.writeFileSync(file, html);
  return { slug, logo: /has-logo/.test(html), portraitGen: /portrait[\s\S]*image-gen\.webp/.test(html) };
}

function rebuildHub() {
  const { KEEP: keep } = require('./haoqi-craft-attach-gen');
  const slugs = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'lib')
    .map((e) => e.name)
    .sort();
  const cards = slugs
    .map((slug) => {
      const html = fs.readFileSync(path.join(ROOT, slug, 'index.html'), 'utf8');
      const name = (html.match(/"name":"([^"]+)"/) || [, slug])[1];
      const word = (html.match(/word:\s*"([^"]+)"/) || [])[1] || '';
      const logo = /has-logo/.test(html);
      const mark = slug.replace(/-/g, '.').toUpperCase();
      return `    <a class="card" href="${slug}/">
      <strong>${mark}.</strong>
      <p>${name}. Glass line <code>${word}</code>.${logo ? ' Their logo.' : ''}</p>
    </a>`;
    })
    .join('\n');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Haoqi craft demos · ${slugs.length} radar rebuilds</title>
  <style>
    body { margin: 0; font-family: "IBM Plex Mono", ui-monospace, monospace; background: #eef5fb; color: #111; padding: 32px 20px 80px; }
    main { max-width: 760px; margin: 0 auto; }
    h1 { font-family: "Archivo Black", sans-serif; text-transform: uppercase; line-height: 0.95; }
    a { color: #02537e; }
    .card { display: block; background: #fff; border: 1px solid #111; padding: 18px; margin: 14px 0; text-decoration: none; color: inherit; }
    .card strong { font-family: "Archivo Black", sans-serif; letter-spacing: 0.04em; }
    p { max-width: 58ch; }
    code { font-size: 0.9em; }
  </style>
</head>
<body>
  <main>
    <h1>Haoqi craft on ${slugs.length} radar rebuilds</h1>
    <p>Prospect demos only. noindex. Same visual language as haoqi.design. Two-word glass lines. Exact logos when a real mark exists. Generated atmosphere carries that exact logo when we have one, and is labeled as generated.</p>
${cards}
  </main>
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
  return slugs.length;
}

function main() {
  const rows = KEEP.map(patch);
  const hub = rebuildHub();
  process.stdout.write(`${JSON.stringify({ rows, hub }, null, 2)}\n`);
}

if (require.main === module) main();
