#!/usr/bin/env node
/* ==========================================================================
   PAPERBOUND — tools/sheets.js
   Renders reference sheets of the cast using the game's own sprite renderer,
   then screenshots each one. Useful for eyeballing the whole roster at once
   without walking the game.

   Usage:
     node tools/sheets.js --out ./sheets
   Requires playwright resolvable from NODE_PATH.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

let playwright;
try { playwright = require('playwright'); }
catch (e) { console.error('sheets: playwright not resolvable (set NODE_PATH)'); process.exit(2); }

const ROOT = path.resolve(__dirname, '..');
const JS = path.join(ROOT, 'js');
const oi = process.argv.indexOf('--out');
const OUT = path.resolve(oi > 0 ? process.argv[oi + 1] : path.join(ROOT, 'sheets'));
fs.mkdirSync(OUT, { recursive: true });

const EXEC = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'].find(p => fs.existsSync(p));

/* The sprite renderer needs util, paper, sprites and the cast. Enemies/partners
   give us the roster and the stat lines. Load them in one shared scope, the way
   the browser does. */
const NEED = ['00_util.js', '03_paper.js', '04_sprites.js', '05_cast.js',
  '06_items.js', '07_badges.js', '08_moves.js', '09_enemies.js', '10_partners.js'];
const bundle = NEED.map(f => fs.readFileSync(path.join(JS, f), 'utf8')).join('\n;\n');

/* ---- which sprites go on which sheet ------------------------------------ */
const SHEETS = [
  {
    file: '01-heroes', title: 'PIP AND HIS PARTNERS',
    subtitle: 'the hero, and the six who travel with him',
    cell: [236, 330], cols: 4, maxScale: 3.2,
    pick: (PB) => [
      { id: 'pip', label: 'Pip', note: 'courier, first class' },
      { id: 'twigby', label: 'Twigby', note: 'Creasewood scout' },
      { id: 'lumen', label: 'Lumen', note: 'the kept flame' },
      { id: 'bloop', label: 'Bloop', note: 'the folded boat' },
      { id: 'snip', label: 'Snip', note: 'the understudy' },
      { id: 'margo', label: 'Margo', note: 'the marginalia' },
      { id: 'volt', label: 'Volt', note: 'the spare part' },
      { id: 'first_draft', label: 'The First Draft', note: 'the version that was thrown away' }
    ]
  },
  {
    file: '02-bosses', title: 'CHAPTER BOSSES',
    subtitle: 'one per chapter, plus what is behind the last door',
    cell: [252, 340], cols: 4, maxScale: 2.6,
    pick: (PB) => {
      const order = ['bramblejack', 'pyra_sizzlefold', 'nautilus_grim', 'great_kerf',
        'the_redactor', 'crinkle_wyrm', 'chief_ampere', 'duke_smudge',
        'smudge_ascendant', 'the_blank'];
      return order.map((id, i) => {
        const e = PB.Enemies.all()[id];
        return {
          id: e && e.sprite || id, label: (e && e.name) || id,
          note: e ? `${e.hp} HP · ${e.atk} ATK · ${e.def || 0} DEF` : '',
          tag: i < 8 ? 'ch ' + (i + 1) : 'ch 8'
        };
      });
    }
  },
  {
    file: '03-minibosses', title: 'MINI-BOSSES AND SUPERBOSSES',
    subtitle: 'the optional fights and the ones guarding a door',
    cell: [252, 340], cols: 4, maxScale: 2.6,
    pick: (PB) => {
      const ids = ['wick_and_wisp', 'barnacle_bosun', 'trimmet', 'footnote_fenn',
        'fenrisk', 'foreman_ratchet', 'captain_sable',
        'origami_sovereign', 'vermillion'];
      return ids.map(id => {
        const e = PB.Enemies.all()[id];
        return {
          id: e && e.sprite || id, label: (e && e.name) || id,
          note: e ? `${e.hp} HP · ${e.atk} ATK · ${e.def || 0} DEF` : ''
        };
      });
    }
  },
  {
    file: '04-enemies', title: 'THE BESTIARY',
    subtitle: 'the rank and file, by chapter',
    cell: [162, 208], cols: 8, maxScale: 2.0,
    pick: (PB) => {
      const E = PB.Enemies.all();
      return Object.keys(E)
        .filter(k => !(E[k].flags || []).includes('boss'))
        .sort((a, b) => (E[a].tier || 0) - (E[b].tier || 0))
        .map(k => ({ id: E[k].sprite || k, label: E[k].name || k, note: `${E[k].hp} HP` }));
    }
  },
  {
    file: '05-townsfolk', title: 'TOWNSFOLK',
    subtitle: 'everyone who stands still and has something to say',
    cell: [178, 236], cols: 7, maxScale: 2.2,
    pick: () => ['mayor_folio', 'elder_quill', 'shopkeep_ream', 'smith_deckle', 'chef_pulp',
      'badgesmith_foil', 'sage_vellum', 'courier_nib', 'villager_a', 'villager_b',
      'villager_c', 'villager_d', 'grandma_creased', 'kid_dot', 'kid_dash',
      'guard_gild', 'scholar_ibis', 'archivist_marge', 'sailor_keel', 'miner_grit',
      'barker_tilt', 'bard_octavo', 'ferrier_stamp'].map(id => ({ id, label: id.replace(/_/g, ' ') }))
  }
];

/* ---- the page that does the drawing ------------------------------------ */
function pageFor(sheet, entries) {
  const [cw, chh] = sheet.cell;
  const cols = Math.min(sheet.cols, entries.length);
  const rows = Math.ceil(entries.length / cols);
  const PAD = 34, HEAD = 108;
  const W = PAD * 2 + cols * cw;
  const H = HEAD + PAD + rows * chh;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;background:#120d1c}
    canvas{display:block}
  </style></head><body>
  <canvas id="c" width="${W}" height="${H}"></canvas>
  <script>${bundle}</script>
  <script>
  (function(){
    var U=PB.U,P=PB.Paper,S=PB.Sprites;
    var cv=document.getElementById('c'),ctx=cv.getContext('2d');
    var W=${W},H=${H},PAD=${PAD},HEAD=${HEAD},CW=${cw},CH=${chh},COLS=${cols};
    var entries=${JSON.stringify(entries)};
    var MAXS=${sheet.maxScale || 3.4};

    P.buildTexture(W,H);

    /* --- measure a sprite's true extent by rendering it once off-screen and
       finding the non-transparent bounding box, relative to the feet origin. */
    var MS=760, off=document.createElement('canvas');
    off.width=MS;off.height=MS;
    var octx=off.getContext('2d');
    var FX=MS/2, FY=MS*0.72;                     // feet position in the probe
    function measure(id){
      octx.clearRect(0,0,MS,MS);
      try{ S.draw(octx,id,FX,FY,{t:24,anim:'idle',scale:1,shadow:false}); }catch(e){ return null; }
      var d=octx.getImageData(0,0,MS,MS).data;
      var minX=MS,maxX=-1,minY=MS,maxY=-1;
      for(var y=0;y<MS;y++){
        var row=y*MS*4;
        for(var x=0;x<MS;x++){
          if(d[row+x*4+3]>10){
            if(x<minX)minX=x; if(x>maxX)maxX=x;
            if(y<minY)minY=y; if(y>maxY)maxY=y;
          }
        }
      }
      if(maxX<0) return null;
      return { w:maxX-minX+1, h:maxY-minY+1,
               cx:(minX+maxX)/2-FX, top:minY-FY, bot:maxY-FY };
    }

    // ground
    var g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#241a34');g.addColorStop(1,'#120d1c');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

    P.textWave(ctx,${JSON.stringify(sheet.title)},W/2,62,{
      size:38,align:'center',color:'#f7edd6',outlineColor:'#120d1c',ow:6,amp:2.5,freq:.3,phase:0});
    P.text(ctx,${JSON.stringify(sheet.subtitle || '')},W/2,88,{
      size:15,align:'center',color:'#bda8d0',outline:false,shadow:false});

    var LABEL_H=${sheet.cols > 6 ? 40 : 52};
    for(var i=0;i<entries.length;i++){
      var e=entries[i];
      var cx=PAD+(i%COLS)*CW, cy=HEAD+Math.floor(i/COLS)*CH;

      P.rr(ctx,cx+6,cy+6,CW-12,CH-14,12,'#f7edd6','#8a6a3a',2.5);
      P.rr(ctx,cx+12,cy+12,CW-24,CH-26,8,null,'#d8c49a',1.4);

      // the art area inside the card, above the label plate
      var ax0=cx+18, ax1=cx+CW-18;
      var ay0=cy+18, ay1=cy+CH-LABEL_H-20;
      var availW=ax1-ax0, availH=ay1-ay0;

      var m=measure(e.id);
      if(m){
        var sc=Math.min(availW/m.w, availH/m.h)*0.94;
        sc=Math.min(sc,MAXS);
        // place so the measured box sits centred in the art area
        var px=(ax0+ax1)/2 - m.cx*sc;
        var py=(ay0+ay1)/2 - (m.top+m.bot)/2*sc;

        ctx.save();
        ctx.beginPath();ctx.rect(cx+13,cy+13,CW-26,CH-28);ctx.clip();

        // a soft disc under the actual feet
        ctx.globalAlpha=.45;
        P.ell(ctx,px,py+2,Math.min(availW*0.4,Math.max(16,m.w*sc*0.3)),6,'#e0cfa8',null);
        ctx.globalAlpha=1;

        try{ S.draw(ctx,e.id,px,py,{t:24,anim:'idle',scale:sc,shadow:true}); }
        catch(err){ P.text(ctx,'?',(ax0+ax1)/2,(ay0+ay1)/2,{size:30,align:'center',color:'#c8443c'}); }
        ctx.restore();
      } else {
        P.text(ctx,'(no sprite)',(ax0+ax1)/2,(ay0+ay1)/2,{
          size:13,align:'center',color:'#a89a78',outline:false,shadow:false});
      }

      if(e.tag){
        P.rr(ctx,cx+CW-58,cy+16,44,20,6,'#e0483c','#8a2a24',1.6);
        P.text(ctx,e.tag,cx+CW-36,cy+30,{size:12,align:'center',color:'#fff8e0',outline:false,shadow:false});
      }
      P.text(ctx,e.label,cx+CW/2,cy+CH-(e.note?38:26),{
        size:${sheet.cols > 6 ? 12 : 16},align:'center',color:'#2a1c3c',outline:false,shadow:false});
      if(e.note){
        P.text(ctx,e.note,cx+CW/2,cy+CH-20,{
          size:${sheet.cols > 6 ? 10 : 12},align:'center',color:'#7a6a4a',outline:false,shadow:false});
      }
    }

    P.overlayTexture(ctx,W,H,.3);
    window.__done=true;
  })();
  </script></body></html>`;
}

(async () => {
  /* Pull the roster out of the bundle once, in Node, so the sheet definitions
     can be data-driven. */
  const shim = { addEventListener() {}, console };
  const sandboxPB = (new Function('window', 'document',
    bundle + '\n;return PB;'))(shim, { createElement: () => ({ getContext: () => null, style: {} }) });

  const browser = await playwright.chromium.launch({
    executablePath: EXEC || undefined, args: ['--no-sandbox', '--disable-gpu']
  });

  const written = [];
  for (const sheet of SHEETS) {
    const entries = sheet.pick(sandboxPB).filter(e => e.id && sandboxPB.Sprites.has(e.id));
    if (!entries.length) { console.log(`  skip ${sheet.file} (no sprites resolved)`); continue; }

    const page = await browser.newPage({ deviceScaleFactor: 2 });
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

    await page.setContent(pageFor(sheet, entries), { waitUntil: 'load' });
    await page.waitForFunction('window.__done === true', { timeout: 15000 }).catch(() => {});
    const el = await page.$('#c');
    const out = path.join(OUT, sheet.file + '.png');
    await el.screenshot({ path: out });
    await page.close();

    const kb = (fs.statSync(out).size / 1024).toFixed(0);
    console.log(`  ${sheet.file}.png  ${entries.length} sprites  ${kb} KB` +
      (errs.length ? `  \x1b[31m(${errs.length} render errors)\x1b[0m` : ''));
    if (errs.length) [...new Set(errs)].slice(0, 4).forEach(e => console.log('      ' + e));
    written.push(out);
  }

  await browser.close();
  console.log('\nsheets written to ' + OUT);
})().catch(e => { console.error('sheets failed:', e && e.stack || e); process.exit(1); });
