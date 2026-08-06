#!/usr/bin/env node
/* ==========================================================================
   PAPERBOUND — tools/build.js
   Inlines css/game.css and every js/NN_*.js (in load order) into a single
   self-contained page. Two outputs:

     dist/paperbound.html    a normal standalone page you can double-click
     dist/paperbound.frag    the same content with no <!doctype>/<html>/<head>/
                             <body> wrapper, for hosts that supply their own
                             document skeleton

   Usage:  node tools/build.js
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const JS = path.join(ROOT, 'js');
const DIST = path.join(ROOT, 'dist');

const css = fs.readFileSync(path.join(ROOT, 'css', 'game.css'), 'utf8');
const files = fs.readdirSync(JS).filter(f => /^\d+_.*\.js$/.test(f)).sort();

let bundle = '';
for (const f of files) {
  bundle += `\n/* ===== ${f} ===== */\n` + fs.readFileSync(path.join(JS, f), 'utf8');
}

/* The frame is deliberately single-theme: a lit paper stage in a dark room.
   The canvas carries the whole visual identity, so the page stays out of it. */
const EXTRA = `
/* --- standalone / embedded frame ------------------------------------------ */
:root { color-scheme: dark; }
html, body { width: 100%; }
#pb-fallback {
  position: fixed; left: 0; right: 0; bottom: 10px;
  text-align: center; color: #8a7a9a;
  font: 13px/1.5 "Trebuchet MS", "Lucida Grande", "Segoe UI", Verdana, sans-serif;
  letter-spacing: .04em; pointer-events: none;
}
#pb-fallback b { color: #f7edd6; font-weight: bold; }
#pb-fallback i { color: #e0483c; font-style: normal; }
@media (max-height: 620px) { #pb-fallback { display: none; } }
@media (prefers-reduced-motion: reduce) { #game { transition: none; } }
`;

const BODY = `<title>PAPERBOUND — The Seven Seals of Foldheim</title>
<style>
${css}${EXTRA}</style>

<div id="frame">
  <canvas id="game" width="960" height="540" aria-label="Paperbound game screen"></canvas>

  <div id="touchpad" aria-hidden="true">
    <div class="dpad">
      <button data-btn="up"    class="tb up">&#9650;</button>
      <button data-btn="left"  class="tb left">&#9664;</button>
      <button data-btn="right" class="tb right">&#9654;</button>
      <button data-btn="down"  class="tb down">&#9660;</button>
    </div>
    <div class="face">
      <button data-btn="x" class="tb small">C</button>
      <button data-btn="y" class="tb small">V</button>
      <button data-btn="b" class="tb">X</button>
      <button data-btn="a" class="tb big">Z</button>
    </div>
    <div class="sys">
      <button data-btn="l" class="tb tiny">Q</button>
      <button data-btn="start" class="tb tiny">&#9776;</button>
      <button data-btn="select" class="tb tiny">&#9636;</button>
      <button data-btn="r" class="tb tiny">E</button>
    </div>
  </div>
</div>

<p id="pb-fallback">
  <b>Arrows</b> move &nbsp;&middot;&nbsp; <i>Z</i> jump / talk &nbsp;&middot;&nbsp;
  <i>X</i> mallet &nbsp;&middot;&nbsp; <i>C</i> partner &nbsp;&middot;&nbsp;
  <i>V</i> fold &nbsp;&middot;&nbsp; <i>Q&thinsp;/&thinsp;E</i> run &nbsp;&middot;&nbsp;
  <i>Esc</i> satchel &nbsp;&middot;&nbsp; <i>Tab</i> map
</p>

<script>
${bundle}
</script>
`;

fs.mkdirSync(DIST, { recursive: true });

fs.writeFileSync(path.join(DIST, 'paperbound.frag'), BODY);
fs.writeFileSync(path.join(DIST, 'paperbound.html'),
  '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">\n' +
  '<meta name="description" content="A papercraft turn-based RPG: eight chapters, six partners, and seven torn seals to put back.">\n' +
  '</head>\n<body>\n' + BODY + '</body>\n</html>\n');

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(0) + ' KB';
console.log(`bundled ${files.length} scripts + css`);
console.log(`  dist/paperbound.html  ${kb(BODY) }`);
console.log(`  dist/paperbound.frag  ${kb(BODY)}`);
