// Shared kernel for the 25 rebuilt homepages.
// Provides: token block, reset, liquid-glass primitives, the ink-magic particle
// logo engine, the appear/disappear scroll engine, and small HTML helpers.
// Everything visual beyond this file lives in the per-site archetype.

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attr = s => esc(s);
const telHref = t => 'tel:' + String(t).replace(/[^\d+]/g, '');
const mapHref = a => 'https://maps.google.com/?q=' + encodeURIComponent(a);

// ---------------------------------------------------------------- head
function head(site, { fonts, display, text, extraMeta = '' }) {
  const t = site.tokens;
  const fontHref = 'https://fonts.googleapis.com/css2?' + fonts.map(f => 'family=' + f).join('&') + '&display=swap';
  const ld = {
    '@context': 'https://schema.org',
    '@type': site.schema,
    name: site.name,
    url: site.url,
    telephone: site.tel,
    address: { '@type': 'PostalAddress', streetAddress: site.address, addressLocality: 'Philadelphia', addressRegion: 'PA' },
    areaServed: site.city,
  };
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>${esc(site.name)} | ${esc(site.city)}</title>
<meta name="description" content="${attr(site.sub)}">
<meta name="theme-color" content="${t.deep}">
<meta name="generator" content="philly-batch-2-rebuild">
<meta name="archetype" content="${site.archetype}">${extraMeta}
<link rel="icon" href="assets/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontHref}" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
}

// ---------------------------------------------------------------- tokens + reset
function base(site, { display, text, radius = '18px', border = '1px' }) {
  const t = site.tokens;
  return `
:root{
  --paper:${t.paper};--ink:${t.ink};--accent:${t.accent};--accent2:${t.accent2};
  --panel:${t.panel};--deep:${t.deep};
  --display:${display};--text:${text};
  --r:${radius};--bw:${border};
  --glass:color-mix(in srgb,var(--paper) 62%,transparent);
  --glass-line:color-mix(in srgb,var(--ink) 16%,transparent);
  --shadow:0 24px 60px -24px color-mix(in srgb,var(--deep) 45%,transparent);
  --gut:clamp(20px,5vw,72px);
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;overflow-x:clip;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 var(--text);overflow-x:clip;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
img{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
h1,h2,h3,h4{font-family:var(--display);margin:0;line-height:1.02;text-wrap:balance}
p{margin:0;text-wrap:pretty}
ul,ol{margin:0;padding:0;list-style:none}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
:focus-visible{outline:3px solid var(--accent);outline-offset:3px;border-radius:4px}
.wrap{width:min(1280px,100% - var(--gut)*2);margin-inline:auto}
.skip{position:fixed;left:12px;top:-80px;z-index:999;background:var(--deep);color:#fff;padding:12px 18px;border-radius:8px;transition:top .2s}
.skip:focus{top:12px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.media{overflow:hidden;position:relative;background:color-mix(in srgb,var(--ink) 8%,var(--paper))}
.media img{width:100%;height:100%;object-fit:cover;display:block}
.eyebrow{font:600 .72rem/1 var(--text);letter-spacing:.22em;text-transform:uppercase}

/* ---- liquid glass ---- */
.lg{
  position:relative;isolation:isolate;
  background:linear-gradient(140deg,color-mix(in srgb,#fff 26%,transparent),color-mix(in srgb,var(--paper) 18%,transparent));
  backdrop-filter:blur(20px) saturate(175%);-webkit-backdrop-filter:blur(20px) saturate(175%);
  border:1px solid color-mix(in srgb,#fff 34%,transparent);
  box-shadow:var(--shadow),inset 0 1px 0 color-mix(in srgb,#fff 55%,transparent),inset 0 -1px 0 color-mix(in srgb,var(--deep) 12%,transparent);
}
.lg::after{
  content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;
  background:radial-gradient(120% 80% at var(--mx,50%) var(--my,0%),color-mix(in srgb,#fff 28%,transparent),transparent 62%);
  opacity:.85;mix-blend-mode:screen;transition:opacity .4s ease;
}
.tilt3d{transform-style:preserve-3d;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.tilt3d>*{transform:translateZ(24px)}

/* ---- buttons ---- */
.btn{
  display:inline-flex;align-items:center;gap:.6em;min-height:52px;padding:0 28px;
  border-radius:999px;font:700 .95rem/1 var(--text);letter-spacing:.01em;
  background:var(--accent);color:#fff;position:relative;overflow:hidden;
  transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s ease,background .3s ease;
  box-shadow:0 14px 30px -12px color-mix(in srgb,var(--accent) 70%,transparent);
}
.btn::before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,transparent 30%,color-mix(in srgb,#fff 40%,transparent),transparent 70%);transform:translateX(-120%);transition:transform .7s ease}
.btn:hover::before{transform:translateX(120%)}
.btn:hover{transform:translateY(-3px)}
.btn:active{transform:scale(.97)}
.btn.ghost{background:transparent;color:inherit;border:1.5px solid color-mix(in srgb,currentColor 35%,transparent);box-shadow:none}
.btn.ghost:hover{background:color-mix(in srgb,currentColor 8%,transparent)}

/* ---- appear / disappear engine ---- */
[data-rv]{opacity:0;transition:opacity .9s cubic-bezier(.2,.8,.2,1),transform 1s cubic-bezier(.2,.8,.2,1),filter .9s ease,clip-path 1s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform}
[data-rv="up"]{transform:translateY(46px)}
[data-rv="down"]{transform:translateY(-38px)}
[data-rv="left"]{transform:translateX(-56px)}
[data-rv="right"]{transform:translateX(56px)}
[data-rv="scale"]{transform:scale(.9)}
[data-rv="blur"]{filter:blur(14px);transform:translateY(24px)}
[data-rv="rot"]{transform:rotate(-4deg) translateY(40px)}
/* A full inset(0 0 100% 0) collapses the element's own intersection box to zero
   area, so IntersectionObserver never reports it and it stays hidden forever.
   Keep part of the box measurable and hide it with opacity instead. */
[data-rv="clip"]{clip-path:inset(0 0 62% 0);opacity:0}
[data-rv="flip"]{transform:perspective(900px) rotateX(28deg);transform-origin:top center}
/* clip-path is reset ONLY for the clip variant. Applying it to every revealed
   element clips inline wrappers to their text box, which silently hides any
   taller child (the hero logo lockups, for one). */
.rv-in[data-rv]{opacity:1;transform:none;filter:none}
.rv-in[data-rv="clip"]{clip-path:inset(0 0 0 0)}
/* reveal wrappers must be able to size to their content */
span[data-rv]{display:inline-block}
/* disappearing elements: fade back out as they leave upward */
.rv-out[data-vanish]{opacity:0;transform:translateY(-30px) scale(.97);filter:blur(6px)}
[data-vanish]{transition:opacity .7s ease,transform .7s ease,filter .7s ease}

/* ---- particle logo ----
   Every real logo gets a plate coloured opposite its measured ink tone. On a
   surface of the same tone as the plate it vanishes; on the opposite surface it
   appears and keeps the logo legible. One rule, correct on every background. */
.inkmark{position:relative;display:inline-flex;align-items:center;justify-content:center;line-height:0;--plate:${site.logoTone === 'light' ? '#101114' : '#FFFFFF'}}
.inkmark::before{content:"";position:absolute;inset:-9px -14px;border-radius:16px;background:var(--plate);opacity:.96;z-index:0;transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.inkmark:hover::before{transform:scale(1.04)}
.inkmark.bare::before{display:none}
.inkmark canvas{position:absolute;inset:-42% -34%;width:168%;height:184%;pointer-events:none;z-index:1}
.inkmark img{position:relative;z-index:2;width:auto;height:100%;object-fit:contain}
.brandmark img{height:var(--logo-h,54px)}
.footmark img{height:var(--logo-hf,64px)}
.heromark img{height:var(--logo-hh,120px)}

/* ---- scroll progress ---- */
.prog{position:fixed;left:0;top:0;height:3px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,var(--accent),var(--accent2));z-index:200;pointer-events:none}

/* ---- mobile call bar ---- */
.callbar{position:fixed;left:0;right:0;bottom:0;z-index:120;display:none;padding:10px 14px calc(10px + env(safe-area-inset-bottom));gap:10px;background:color-mix(in srgb,var(--deep) 90%,transparent);backdrop-filter:blur(18px)}
.callbar a{flex:1;justify-content:center;min-height:50px}
@media(max-width:860px){.callbar{display:flex}body{padding-bottom:76px}}
@media(prefers-reduced-motion:reduce){
  *{animation-duration:.01ms!important;transition-duration:.01ms!important}
  [data-rv]{opacity:1!important;transform:none!important;filter:none!important;clip-path:none!important}
}
`;
}

// ---------------------------------------------------------------- ink magic particles
// Variants change the physics + look; every site gets one tuned to its brand.
const PARTICLE_JS = `
(function(){
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function hex(c){c=c.trim();if(c[0]!=='#')return[120,120,120];if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];}
  var CS=getComputedStyle(document.documentElement);
  var A=hex(CS.getPropertyValue('--accent')),B=hex(CS.getPropertyValue('--accent2'));
  var MODE=document.body.dataset.particles||'ink';
  var CFG={
    ink:{n:34,size:[1.2,3.4],life:[90,210],rise:-0.16,drift:.34,blur:0,alpha:.62,glow:0,swirl:.9},
    sparkle:{n:30,size:[.9,2.4],life:[50,120],rise:-0.1,drift:.5,blur:0,alpha:.9,glow:8,swirl:.4},
    ember:{n:28,size:[1,2.8],life:[70,150],rise:-0.42,drift:.28,blur:0,alpha:.85,glow:12,swirl:.6},
    dust:{n:40,size:[.8,2],life:[140,300],rise:-0.06,drift:.2,blur:0,alpha:.45,glow:0,swirl:1.3},
    bubble:{n:26,size:[2,6],life:[110,240],rise:-0.3,drift:.24,blur:0,alpha:.4,glow:4,swirl:.7},
    spark:{n:32,size:[.8,2.2],life:[36,90],rise:-0.05,drift:.9,blur:0,alpha:1,glow:14,swirl:.2},
    mist:{n:22,size:[6,16],life:[160,340],rise:-0.12,drift:.16,blur:6,alpha:.22,glow:0,swirl:1.6},
    gold:{n:30,size:[1,3],life:[80,190],rise:-0.2,drift:.3,blur:0,alpha:.8,glow:10,swirl:.8}
  };
  var cfg=CFG[MODE]||CFG.ink;
  document.querySelectorAll('.inkmark').forEach(function(host){
    if(RM)return;
    var cv=document.createElement('canvas');host.prepend(cv);
    var ctx=cv.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2),W=0,H=0,ps=[],raf=0,live=false,hot=0;
    function fit(){var r=cv.getBoundingClientRect();W=Math.max(40,r.width);H=Math.max(40,r.height);cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
    function seed(p){
      p.x=W*(.18+Math.random()*.64);p.y=H*(.32+Math.random()*.46);
      p.vx=(Math.random()-.5)*cfg.drift;p.vy=cfg.rise*(.5+Math.random());
      p.r=cfg.size[0]+Math.random()*(cfg.size[1]-cfg.size[0]);
      p.l=0;p.max=cfg.life[0]+Math.random()*(cfg.life[1]-cfg.life[0]);
      p.c=Math.random()<.62?A:B;p.ph=Math.random()*6.28;
    }
    for(var i=0;i<cfg.n;i++){var p={};seed(p);p.l=Math.random()*p.max;ps.push(p);}
    function frame(){
      ctx.clearRect(0,0,W,H);
      if(cfg.blur)ctx.filter='blur('+cfg.blur+'px)';else ctx.filter='none';
      for(var i=0;i<ps.length;i++){
        var p=ps[i];p.l++;
        if(p.l>p.max){seed(p);continue;}
        var t=p.l/p.max, fade=t<.18?t/.18:(1-t)/.82;
        p.ph+=.04;
        p.x+=p.vx+Math.sin(p.ph)*cfg.swirl*.16;
        p.y+=p.vy*(1+hot*1.6);
        var a=cfg.alpha*fade*(.5+hot*.7);
        if(a<=0.004)continue;
        ctx.globalAlpha=a;
        if(cfg.glow){ctx.shadowBlur=cfg.glow;ctx.shadowColor='rgba('+p.c[0]+','+p.c[1]+','+p.c[2]+',.9)';}else ctx.shadowBlur=0;
        ctx.fillStyle='rgb('+p.c[0]+','+p.c[1]+','+p.c[2]+')';
        ctx.beginPath();
        if(MODE==='spark'){ctx.rect(p.x,p.y,p.r*2.6,p.r*.5);}
        else if(MODE==='bubble'){ctx.arc(p.x,p.y,p.r,0,6.283);ctx.globalAlpha=a*.5;}
        else {ctx.arc(p.x,p.y,p.r,0,6.283);}
        ctx.fill();
      }
      ctx.shadowBlur=0;ctx.filter='none';
      hot*=.94;
      raf=requestAnimationFrame(frame);
    }
    function on(){if(live)return;live=true;fit();raf=requestAnimationFrame(frame);}
    function off(){live=false;cancelAnimationFrame(raf);ctx.clearRect(0,0,W,H);}
    new IntersectionObserver(function(es){es[0].isIntersecting?on():off();},{rootMargin:'120px'}).observe(host);
    host.addEventListener('pointerenter',function(){hot=1;});
    addEventListener('resize',fit,{passive:true});
  });
})();`;

// ---------------------------------------------------------------- scroll engines
const SCROLL_JS = `
(function(){
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
  // appear
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('rv-in');e.target.classList.remove('rv-out');}
      else if(e.target.hasAttribute('data-vanish') && e.boundingClientRect.top<0){e.target.classList.add('rv-out');}
    });
  },{threshold:.14,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('[data-rv]').forEach(function(el,i){
    if(el.dataset.delay===undefined)el.style.transitionDelay=(i%7)*70+'ms';
    else el.style.transitionDelay=el.dataset.delay+'ms';
    io.observe(el);
  });
  // Safety net: anything already at or above the fold reveals regardless of what
  // the observer reports, so no element can ever be left permanently hidden.
  addEventListener('load',function(){
    document.querySelectorAll('[data-rv]:not(.rv-in)').forEach(function(el){
      if(el.getBoundingClientRect().top<innerHeight)el.classList.add('rv-in');
    });
  });
  // scroll progress + header state + parallax + scrub
  var prog=document.querySelector('.prog'),hdr=document.querySelector('[data-header]');
  var par=[].slice.call(document.querySelectorAll('[data-par]'));
  var scrub=[].slice.call(document.querySelectorAll('[data-scrub]'));
  var tick=false;
  function upd(){
    var y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
    if(prog)prog.style.transform='scaleX('+(h>0?y/h:0)+')';
    if(hdr)hdr.classList.toggle('is-stuck',y>28);
    if(!RM){
      for(var i=0;i<par.length;i++){var el=par[i],r=el.getBoundingClientRect();
        if(r.bottom>-200&&r.top<innerHeight+200){
          var p=(r.top+r.height/2-innerHeight/2)/innerHeight;
          el.style.setProperty('--p',p.toFixed(4));
          el.style.transform='translate3d(0,'+(p*parseFloat(el.dataset.par||18)).toFixed(2)+'px,0)';
        }}
      for(var j=0;j<scrub.length;j++){var s=scrub[j],rr=s.getBoundingClientRect();
        var t=1-Math.min(1,Math.max(0,(rr.top+rr.height*.2)/innerHeight));
        s.style.setProperty('--s',t.toFixed(4));}
    }
    tick=false;
  }
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd);}},{passive:true});
  addEventListener('resize',upd,{passive:true});upd();
  // liquid glass pointer sheen + 3d tilt
  document.querySelectorAll('.lg,.tilt3d').forEach(function(c){
    c.addEventListener('pointermove',function(e){
      var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      c.style.setProperty('--mx',(x*100).toFixed(1)+'%');
      c.style.setProperty('--my',(y*100).toFixed(1)+'%');
      if(!RM&&c.classList.contains('tilt3d'))
        c.style.transform='perspective(1000px) rotateX('+((.5-y)*11).toFixed(2)+'deg) rotateY('+((x-.5)*13).toFixed(2)+'deg) translateZ(6px)';
    });
    c.addEventListener('pointerleave',function(){c.style.transform='';c.style.setProperty('--mx','50%');c.style.setProperty('--my','0%');});
  });
  // count up
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return;cio.unobserve(e.target);
    var el=e.target,to=parseFloat(el.dataset.count),pre=el.dataset.pre||'',suf=el.dataset.suf||'',t0=0;
    function step(ts){if(!t0)t0=ts;var k=Math.min(1,(ts-t0)/1100),v=Math.round(to*(1-Math.pow(1-k,3)));
      el.textContent=pre+v+suf;if(k<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);
  });},{threshold:.6});
  document.querySelectorAll('[data-count]').forEach(function(el){cio.observe(el);});
  // magnetic cta
  if(!RM)document.querySelectorAll('[data-mag]').forEach(function(b){
    b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();
      b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.16).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.22).toFixed(1)+'px)';});
    b.addEventListener('pointerleave',function(){b.style.transform='';});
  });
})();`;

// ---------------------------------------------------------------- html helpers
const inkmark = (site, cls, alt) =>
  `<span class="inkmark ${cls}"><img src="${site.logo}" alt="${attr(alt || site.name + ' logo')}" width="240" height="90" decoding="async"></span>`;

const img = (site, i, cls = '', extra = '') =>
  `<img src="assets/${site.images[i]}" alt="${attr(site.alts[i] || site.name)}" class="${cls}" loading="lazy" decoding="async" width="1200" height="900"${extra}>`;

const heroImg = (site, i, cls = '') =>
  `<img src="assets/${site.images[i]}" alt="${attr(site.alts[i] || site.name)}" class="${cls}" fetchpriority="high" decoding="async" width="1600" height="1100">`;

const callbar = site => `<div class="callbar">
<a class="btn" href="${telHref(site.tel)}">Call ${esc(site.tel)}</a>
<a class="btn ghost" style="color:#fff" href="${mapHref(site.address)}" target="_blank" rel="noopener">Directions</a>
</div>`;

const nav = (site, items) => items.map(([label, href]) => `<a href="${href}">${esc(label)}</a>`).join('');

// visit block content is shared shape, styled per archetype
function visitRows(site) {
  return [
    ['Call', site.tel, telHref(site.tel)],
    ['Visit', site.address, mapHref(site.address)],
    ['Website', site.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), site.url],
  ];
}

function hoursList(site, cls = '') {
  return `<ul class="${cls}">${site.hours.map(([d, h]) => `<li><span>${esc(d)}</span><span>${esc(h)}</span></li>`).join('')}</ul>`;
}

function page({ site, fonts, display, text, radius, border, css, body, particles, extraJs = '', extraMeta = '', bodyClass = '' }) {
  return `<!doctype html><html lang="en"><head>
${head(site, { fonts, display, text, extraMeta })}
<style>${base(site, { display, text, radius, border })}${css}</style>
</head>
<body class="site-${site.slug} arch-${site.archetype} ${bodyClass}" data-particles="${particles}">
<a class="skip" href="#main">Skip to content</a>
<div class="prog"></div>
${body}
${callbar(site)}
<script>${PARTICLE_JS}${SCROLL_JS}${extraJs}</script>
</body></html>`;
}

module.exports = { esc, attr, telHref, mapHref, head, base, page, inkmark, img, heroImg, nav, callbar, visitRows, hoursList, PARTICLE_JS, SCROLL_JS };
