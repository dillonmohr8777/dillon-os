/* Align HCM industry films. Boot: build the DOM, drive the playhead.
 *
 * Loaded after the scene file, because a scene file calls the engine helpers
 * (split, typeset, eyebrow, icon, lockupSVG) while it is still being parsed,
 * and this half needs SCENES and TITLE to already exist. Order in shell.html is
 * assets, engine, scenes, boot.
 */

/* ------------------------------------------------------------------- build */

const DURATION = SCENES[SCENES.length - 1].out;
const stage = document.getElementById('stage');
const layerScenes = document.getElementById('scenes');
document.title = TITLE;
qa(document, '[data-footer-mid]').forEach(el => { el.textContent = FOOTER; });

SCENES.forEach(s => {
  const el = document.createElement('div');
  el.className = 'scene';
  el.id = s.id;
  el.innerHTML = s.html;
  layerScenes.appendChild(el);
  s.el = el;
});

const orbBlue = document.querySelector('.bg-orb.blue');
const orbEmber = document.querySelector('.bg-orb.ember');
const washEl = document.querySelector('.wash');
const ruleTop = document.querySelector('.rule-top');
const footerEl = document.querySelector('.footer');
const grainEl = document.querySelector('.bg-grain');

/* ------------------------------------------------------------------- seek */

function seek(t) {
  t = Math.max(0, Math.min(DURATION, t));

  orbBlue.style.transform = `translate3d(${(Math.sin(t * 0.19) * 80).toFixed(2)}px,${(Math.cos(t * 0.14) * 54).toFixed(2)}px,0) scale(${(1 + Math.sin(t * 0.1) * 0.07).toFixed(4)})`;
  orbEmber.style.transform = `translate3d(${(Math.cos(t * 0.16) * -72).toFixed(2)}px,${(Math.sin(t * 0.12) * 50).toFixed(2)}px,0) scale(${(1 + Math.cos(t * 0.09) * 0.09).toFixed(4)})`;
  grainEl.style.transform = `translate3d(${((t * 37) % 180).toFixed(1)}px,${((t * 23) % 180).toFixed(1)}px,0)`;

  ruleTop.style.transform = `scaleX(${E.easeOutExpo(seg(t, 0.05, 1.4)).toFixed(4)})`;
  footerEl.style.opacity = E.easeOutCubic(seg(t, 0.5, 1.5)).toFixed(3);

  let wash = 0;
  for (const s of SCENES) {
    const live = t >= s.in && t < s.out + LAP;
    if (live !== s.__live) { s.el.classList.toggle('on', live); s.__live = live; }
    if (!live) continue;

    const dur = s.out - s.in;
    const lt = t - s.in;

    /* scenes overlap on the cut so nothing dips through black, and the
       incoming content is already forming as the outgoing clears */
    const inP = E.easeOutCubic(seg(lt, 0, LAP));
    const outP = E.easeInCubic(seg(lt, dur, dur + LAP));
    s.el.style.opacity = (inP * (1 - outP)).toFixed(3);
    s.el.style.transform = `scale(${(lerp(1.025, 1.0, inP) * lerp(1, 1.03, outP)).toFixed(4)})`;

    s.draw(s.el, Math.min(lt, dur), dur);   /* content freezes through the lap */
    if (s.wash) wash = Math.max(wash, s.wash(Math.min(lt, dur)));
  }
  washEl.style.opacity = wash.toFixed(3);
}

window.__seek = seek;
window.DURATION = DURATION;
window.FPS = FPS;

/* ------------------------------------------------------------------ warmup */

const FACES = [
  '400 16px Inter', '500 16px Inter', '600 16px Inter', '700 16px Inter', '800 16px Inter',
  '700 16px "Playfair Display"', '900 16px "Playfair Display"', 'italic 700 16px "Playfair Display"',
];

function fitGhosts() {
  document.querySelectorAll('.ghost').forEach(g => {
    const base = parseFloat(getComputedStyle(g).fontSize);
    const w = g.offsetWidth;            /* layout width, immune to the fit scale */
    const room = g.closest('.copy') ? 820 : 1620;
    if (w > room) g.style.fontSize = (base * (room / w)).toFixed(1) + 'px';
  });
}

/* Scenes start hidden, so the browser never requests the faces they use and
   document.fonts.ready resolves against nothing. Load them explicitly, then lay
   every scene out once. Without this the exporter can write early frames in
   fallback metrics. Hero art is decoded up front for the same reason. */
async function warmup() {
  await Promise.all(FACES.map(f => document.fonts.load(f)));
  await document.fonts.ready;
  await Promise.all(Object.values(HEROES).map(src => new Promise(res => {
    const im = new Image();
    im.onload = im.onerror = res;
    im.src = src;
  })));
  const scenes = qa(document, '.scene');
  const was = scenes.map(s => s.classList.contains('on'));
  scenes.forEach(s => s.classList.add('on'));
  void document.body.offsetHeight;
  fitGhosts();
  scenes.forEach((s, i) => { if (!was[i]) s.classList.remove('on'); });
}
window.__ready = warmup();

/* ------------------------------------------------------------- fit + player */

function fit() {
  const pad = document.body.classList.contains('export') ? 0 : 60;
  const s = Math.min((window.innerWidth - pad) / 1920, (window.innerHeight - pad) / 1080);
  stage.style.transform = `scale(${s})`;
}
window.addEventListener('resize', fit);
fit();

(function player() {
  const ui = document.getElementById('ui');
  if (!ui) return;
  const btn = ui.querySelector('button');
  const range = ui.querySelector('input');
  const read = ui.querySelector('.t');
  range.max = String(DURATION);
  let playing = false, raf = 0, last = 0, head = 0;

  function paint() {
    range.value = String(head);
    read.textContent = head.toFixed(2) + ' / ' + DURATION.toFixed(2) + ' s';
    seek(head);
  }
  function tick(now) {
    if (!playing) return;
    head += (now - last) / 1000; last = now;
    if (head >= DURATION) head = 0;
    paint();
    raf = requestAnimationFrame(tick);
  }
  btn.onclick = () => {
    playing = !playing;
    btn.textContent = playing ? 'Pause' : 'Play';
    if (playing) { last = performance.now(); raf = requestAnimationFrame(tick); }
    else cancelAnimationFrame(raf);
  };
  range.oninput = () => { head = parseFloat(range.value); paint(); };
  window.__ready.then(paint);
})();
