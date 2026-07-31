const K = require('../kernel');
const { esc, attr, telHref, mapHref, inkmark, img, heroImg, hoursList } = K;

/* =========================================================== 6. FRESH BLOOM
   Soft rounded everything, rising bubbles, sparkle particles, pill sections
   that swell on reveal. Footer: bubble arc over a rounded card. */
const freshBloom = site => ({
  fonts: ['Poppins:wght@400;500;600;700;800', 'Nunito+Sans:wght@400;600;700'],
  display: "'Poppins',system-ui,sans-serif", text: "'Nunito Sans',system-ui,sans-serif",
  radius: '34px', border: '0px', particles: 'bubble',
  css: `
body{background:var(--paper)}
.bubbles{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.bubbles i{position:absolute;bottom:-14vh;border-radius:50%;background:radial-gradient(circle at 32% 30%,color-mix(in srgb,#fff 70%,transparent),color-mix(in srgb,var(--accent2) 26%,transparent));animation:float linear infinite;opacity:.42}
@keyframes float{to{transform:translateY(-124vh) translateX(var(--dx,20px))}}
main,header,footer{position:relative;z-index:1}
.hd{position:sticky;top:12px;z-index:100;width:min(1280px,100% - var(--gut)*2);margin:12px auto 0;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:22px;padding:10px 12px 10px 18px;border-radius:999px;transition:box-shadow .4s ease}
.hd.is-stuck{box-shadow:0 18px 44px -22px color-mix(in srgb,var(--deep) 50%,transparent)}
.hd nav{display:flex;gap:24px;justify-content:center;font-weight:700;font-size:.88rem}
.hd nav a:hover{color:var(--accent)}
@media(max-width:930px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{padding:clamp(60px,8vw,120px) 0 clamp(40px,5vw,70px);text-align:center}
.hero h1{font-size:clamp(2.5rem,6vw,5.2rem);font-weight:800;letter-spacing:-.035em;max-width:16ch;margin-inline:auto}
.hero h1 em{font-style:normal;color:var(--accent);position:relative;white-space:nowrap}
.hero h1 em::after{content:"";position:absolute;left:0;right:0;bottom:.08em;height:.16em;border-radius:99px;background:color-mix(in srgb,var(--accent2) 40%,transparent);z-index:-1;transform:scaleX(0);transform-origin:0;animation:swipe .9s .5s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes swipe{to{transform:scaleX(1)}}
.hero .eyebrow{color:var(--accent2);display:block;margin-bottom:22px}
.hero p{max-width:56ch;margin:24px auto 0;font-size:1.08rem;opacity:.78}
.hero .cta{display:flex;gap:12px;justify-content:center;margin-top:34px;flex-wrap:wrap}
.heroband{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:14px;margin-top:clamp(40px,5vw,66px)}
.heroband figure{margin:0;border-radius:var(--r);overflow:hidden}
.heroband figure:first-child{grid-row:span 2}
.heroband img{width:100%;height:100%;object-fit:cover;aspect-ratio:4/3}
.heroband figure:first-child img{aspect-ratio:1/1}
@media(max-width:800px){.heroband{grid-template-columns:1fr 1fr}.heroband figure:first-child{grid-column:span 2;grid-row:auto}}
section{padding:clamp(70px,9vw,130px) 0}
.pillhead{display:inline-flex;align-items:center;gap:10px;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent);border-radius:999px;padding:9px 18px;font-weight:700;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:26px}
h2.h2{font-size:clamp(2rem,4.4vw,3.7rem);font-weight:800;letter-spacing:-.03em;max-width:20ch}
.lead{margin-top:18px;max-width:56ch;opacity:.76;font-size:1.04rem}
.puffs{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:18px;margin-top:52px}
.puffs article{background:#fff;border-radius:var(--r);padding:34px 30px;box-shadow:0 20px 44px -30px color-mix(in srgb,var(--deep) 60%,transparent);transition:transform .5s cubic-bezier(.2,.8,.2,1),box-shadow .5s ease}
.puffs article:hover{transform:translateY(-8px) scale(1.015);box-shadow:0 32px 60px -30px color-mix(in srgb,var(--accent) 60%,transparent)}
.puffs .dot{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--accent) 16%,transparent);color:var(--accent);font-weight:800;margin-bottom:20px}
.puffs h3{font-size:1.2rem;font-weight:700;margin-bottom:10px}
.puffs p{font-size:.95rem;opacity:.76;line-height:1.7}
.blob{background:var(--deep);color:#fff;border-radius:clamp(30px,4vw,56px);padding:clamp(34px,5vw,72px);display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,4vw,60px);align-items:center}
@media(max-width:900px){.blob{grid-template-columns:1fr}}
.blob .media{border-radius:calc(var(--r) - 6px);aspect-ratio:4/3;overflow:hidden}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:44px}
.chips li{background:#fff;border-radius:999px;padding:14px 22px;font-weight:700;font-size:.92rem;box-shadow:0 10px 26px -18px color-mix(in srgb,var(--deep) 60%,transparent)}
.chips li b{color:var(--accent);margin-right:8px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,70px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.round{border-radius:clamp(30px,5vw,80px);overflow:hidden;aspect-ratio:4/5}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:46px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{background:#fff;border-radius:var(--r);padding:30px 28px;box-shadow:0 20px 44px -32px color-mix(in srgb,var(--deep) 60%,transparent)}
.info h4{font-weight:800;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.94rem}
.hrs li{display:flex;justify-content:space-between;gap:14px}
.close{text-align:center;background:var(--accent);color:#fff;border-radius:clamp(30px,4vw,60px);padding:clamp(46px,6vw,90px) clamp(24px,4vw,60px);margin-bottom:clamp(50px,7vw,100px)}
.close h2{font-size:clamp(1.9rem,4.6vw,3.6rem);max-width:20ch;margin-inline:auto}
.close .btn{background:#fff;color:var(--deep);margin-top:30px}
footer{background:var(--deep);color:#fff;border-radius:clamp(30px,4vw,60px) clamp(30px,4vw,60px) 0 0;position:relative;overflow:hidden;padding:clamp(56px,7vw,100px) 0 40px}
footer::before{content:"";position:absolute;left:-10%;top:-140px;width:120%;height:280px;border-radius:50%;background:color-mix(in srgb,var(--accent) 30%,transparent);filter:blur(50px)}
.fgrid{position:relative;display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:40px}
@media(max-width:880px){.fgrid{grid-template-columns:1fr}}
.fgrid h4{font-weight:800;font-size:.76rem;letter-spacing:.18em;text-transform:uppercase;opacity:.55;margin-bottom:16px}
.fgrid li{padding:7px 0;opacity:.86;font-size:.95rem}
.footmark{--logo-hf:60px;margin-bottom:20px;display:block}
.fbot{position:relative;margin-top:48px;padding-top:24px;border-top:1px solid color-mix(in srgb,#fff 18%,transparent);display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;font-size:.84rem;opacity:.62}`,
  body: `
<div class="bubbles" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<i style="left:${6 + i * 11}%;width:${16 + (i % 4) * 16}px;height:${16 + (i % 4) * 16}px;--dx:${(i % 3 - 1) * 40}px;animation-duration:${18 + i * 3}s;animation-delay:${-i * 2.4}s"></i>`).join('')}</div>
<header class="hd lg" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['About', '#story'], ['Our work', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Get a quote</a>
</header>
<main id="main">
<section class="hero" id="top"><div class="wrap">
  <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
  <h1 data-rv="up">A local cleaning company that <em>actually shows up</em></h1>
  <p data-rv="up">${esc(site.sub)}</p>
  <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#visit">${esc(site.ctaSecondary)}</a></div>
  <div class="heroband">${[0, 1, 2].map((i, k) => `<figure data-rv="scale" data-delay="${k * 110}">${k === 0 ? heroImg(site, i) : img(site, i)}</figure>`).join('')}</div>
</div></section>
<section id="services"><div class="wrap">
  <span class="pillhead" data-rv="down">What we clean</span>
  <h2 class="h2" data-rv="up" data-vanish>Residential and commercial, across Philadelphia</h2>
  <div class="puffs">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 70}"><span class="dot">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
  <ul class="chips">${site.proof.map(p => `<li data-rv="scale"><b>${esc(p[0])}</b>${esc(p[1])}</li>`).join('')}</ul>
</div></section>
<section id="story"><div class="wrap"><div class="blob" data-rv="up">
  <div><span class="pillhead" style="background:color-mix(in srgb,#fff 16%,transparent);color:#fff">About us</span>
    <h2 class="h2">${esc(site.story.title)}</h2>
    <p class="lead" style="opacity:.84">${esc(site.story.body)}</p>
    <div style="margin-top:30px"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
  <figure class="media">${img(site, 3)}</figure>
</div></div></section>
<section id="gallery"><div class="wrap two">
  <figure class="round media" data-rv="left" data-par="24">${img(site, 4)}</figure>
  <div><span class="pillhead" data-rv="down">${esc(site.feature.title)}</span>
    <h2 class="h2" data-rv="right" data-vanish>Booking is easy</h2>
    <p class="lead" data-rv="right">${esc(site.feature.body)}</p>
    <div style="margin-top:30px" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a></div></div>
</div></section>
<section id="visit"><div class="wrap">
  <span class="pillhead" data-rv="down">Visit</span>
  <h2 class="h2" data-rv="up">Get in touch with ${esc(site.short)}</h2>
  <div class="info">
    <div data-rv="up"><h4>Contact</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="180"><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
<div class="wrap"><section class="close" data-rv="scale">
  <h2>${esc(site.closing)}</h2>
  <a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a>
</section></div>
</main>
<footer><div class="wrap">
  <div class="fgrid">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.8;max-width:36ch">${esc(site.address)}</p></div>
    <div><h4>Services</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</div></footer>`,
});

/* =========================================================== 7. PITCH SHIFT
   Roofline geometry: every section separated by an angled cut, shingle-stagger
   reveals, diagonal image masks. Footer: gable end with a ridge beam. */
const pitchShift = site => ({
  fonts: ['Archivo+Black', 'Outfit:wght@400;500;600;700;800'],
  display: "'Archivo Black',Impact,sans-serif", text: "'Outfit',system-ui,sans-serif",
  radius: '4px', border: '0px', particles: 'dust',
  css: `
body{background:var(--paper)}
.btn{border-radius:4px;text-transform:uppercase;letter-spacing:.04em;font-weight:700}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:12px var(--gut);
  background:var(--deep);color:#fff;clip-path:polygon(0 0,100% 0,100% 100%,0 calc(100% - 14px))}
.hd nav{display:flex;gap:26px;justify-content:center;font-weight:600;font-size:.9rem}
.hd nav a:hover{color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{position:relative;min-height:94svh;display:grid;align-items:center;overflow:hidden;background:var(--deep);color:#fff;
  clip-path:polygon(0 0,100% 0,100% calc(100% - 6vw),0 100%)}
.hero-bg{position:absolute;inset:0}
.hero-bg img{width:100%;height:100%;object-fit:cover;opacity:.44}
.hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,var(--deep) 22%,color-mix(in srgb,var(--deep) 55%,transparent) 62%,transparent)}
.hero-in{position:relative;z-index:2;padding:70px 0 12vw}
.hero h1{font-size:clamp(2.4rem,6.4vw,5.6rem);line-height:.98;text-transform:uppercase;max-width:15ch;letter-spacing:-.02em}
.hero h1 span{display:inline-block;transform:translateY(60px) rotate(3deg);opacity:0;animation:shingle .8s cubic-bezier(.16,1,.3,1) forwards}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:22px}
@keyframes shingle{to{transform:none;opacity:1}}
.hero p{max-width:52ch;margin-top:24px;opacity:.86;font-size:1.05rem}
.hero .cta{display:flex;gap:12px;margin-top:34px;flex-wrap:wrap}
.pitchbar{background:var(--accent);color:#0d0d0d;overflow:hidden;padding:14px 0;margin-top:-2px}
.pitchbar ul{display:flex;gap:48px;width:max-content;animation:run 30s linear infinite;font-weight:700;font-size:.86rem;letter-spacing:.14em;text-transform:uppercase}
.pitchbar li::before{content:"▲";margin-right:14px;font-size:.7em}
@keyframes run{to{transform:translateX(-50%)}}
section{padding:clamp(72px,9vw,130px) 0;position:relative}
.cut{clip-path:polygon(0 5vw,100% 0,100% 100%,0 100%);margin-top:-5vw;padding-top:calc(clamp(72px,9vw,130px) + 5vw)}
.cutdown{clip-path:polygon(0 0,100% 0,100% calc(100% - 5vw),0 100%);padding-bottom:calc(clamp(72px,9vw,130px) + 5vw)}
.panel{background:var(--panel)}
.dark{background:var(--deep);color:#fff}
h2.h2{font-size:clamp(1.9rem,4.6vw,3.8rem);text-transform:uppercase;line-height:1;letter-spacing:-.02em;max-width:17ch}
.lead{margin-top:20px;max-width:56ch;line-height:1.8;opacity:.8}
.shingles{display:grid;grid-template-columns:repeat(auto-fit,minmax(255px,1fr));gap:14px;margin-top:52px}
.shingles article{background:var(--paper);padding:32px 26px;border-left:5px solid var(--accent);position:relative;transition:transform .45s cubic-bezier(.2,.8,.2,1),box-shadow .45s}
.dark .shingles article{background:color-mix(in srgb,#fff 7%,transparent)}
.shingles article:nth-child(3n+2){transform:translateY(18px)}
.shingles article:hover{transform:translateY(-8px);box-shadow:0 24px 46px -26px rgba(0,0,0,.5)}
.shingles h3{font-family:var(--display);font-size:1.05rem;text-transform:uppercase;margin-bottom:10px;letter-spacing:-.01em}
.shingles p{font-size:.93rem;line-height:1.7;opacity:.8}
.shingles .n{font-family:var(--display);color:var(--accent);font-size:.85rem;display:block;margin-bottom:12px}
@media(max-width:860px){.shingles article:nth-child(3n+2){transform:none}}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,70px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.slant{overflow:hidden;clip-path:polygon(0 0,100% 5%,100% 95%,0 100%)}
.slant img{width:100%;aspect-ratio:4/3;object-fit:cover}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:color-mix(in srgb,var(--ink) 18%,transparent);margin-top:48px}
.dark .figs{background:color-mix(in srgb,#fff 18%,transparent)}
.figs div{background:var(--paper);padding:28px 22px}
.dark .figs div{background:var(--deep)}
.figs b{font-family:var(--display);font-size:clamp(1.4rem,2.6vw,2.2rem);color:var(--accent);display:block}
.figs span{font-size:.8rem;opacity:.72;margin-top:8px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.roofgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:50px}
.roofgrid figure{margin:0;overflow:hidden;position:relative;clip-path:polygon(0 0,100% 4%,100% 100%,0 96%)}
.roofgrid figure:nth-child(2){margin-top:26px}
.roofgrid img{width:100%;aspect-ratio:3/4;object-fit:cover;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.roofgrid figure:hover img{transform:scale(1.07)}
.roofgrid figcaption{position:absolute;left:0;right:0;bottom:0;padding:14px 16px;background:linear-gradient(0deg,rgba(0,0,0,.78),transparent);color:#fff;font-size:.8rem;font-weight:600}
@media(max-width:760px){.roofgrid{grid-template-columns:1fr 1fr}.roofgrid figure:nth-child(2){margin-top:0}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:color-mix(in srgb,#fff 16%,transparent)}
.info>div{background:var(--deep);padding:30px 26px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info h4{font-family:var(--display);text-transform:uppercase;font-size:.86rem;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.94rem;opacity:.9}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff;position:relative;padding-top:0}
.gable{height:clamp(50px,7vw,100px);background:var(--accent);clip-path:polygon(50% 0,100% 100%,0 100%)}
.ridge{height:6px;background:var(--accent)}
.fin{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;padding:clamp(50px,6vw,90px) 0 38px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-family:var(--display);text-transform:uppercase;font-size:.86rem;color:var(--accent);margin-bottom:16px}
.fin li{padding:7px 0;opacity:.84;font-size:.94rem}
.footmark{--logo-hf:64px;margin-bottom:20px;display:block}
.fbot{border-top:1px solid color-mix(in srgb,#fff 16%,transparent);padding:20px 0 40px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:.82rem;opacity:.6}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['About', '#story'], ['Recent work', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.tel)}</a>
</header>
<main id="main">
<section class="hero" id="top">
  <div class="hero-bg" data-par="28">${heroImg(site, 0)}</div>
  <div class="hero-in wrap">
    <span class="eyebrow">${esc(site.eyebrow)}</span>
    <h1>${esc(site.headline).split(' ').map((w, i) => `<span style="animation-delay:${i * 55}ms">${w}</span>`).join(' ')}</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" style="color:#fff" href="#gallery">${esc(site.ctaSecondary)}</a></div>
  </div>
</section>
<div class="pitchbar" aria-hidden="true"><ul>${[...site.services, ...site.services].map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
<section id="services"><div class="wrap">
  <h2 class="h2" data-rv="up" data-vanish>What we offer</h2>
  <p class="lead" data-rv="up">Roofing, siding, gutters and everything that keeps the water outside.</p>
  <div class="shingles">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 65}"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section class="dark cut" id="story"><div class="wrap two">
  <div><h2 class="h2" data-rv="left" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="left">${esc(site.story.body)}</p>
    <div class="figs">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div></div>
  <figure class="slant" data-rv="right" data-par="20">${img(site, 1)}</figure>
</div></section>
<section class="panel cutdown"><div class="wrap two">
  <figure class="slant" data-rv="left">${img(site, 2)}</figure>
  <div><h2 class="h2" data-rv="right">${esc(site.feature.title)}</h2>
    <p class="lead" data-rv="right">${esc(site.feature.body)}</p>
    <div style="margin-top:30px" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a></div></div>
</div></section>
<section id="gallery"><div class="wrap">
  <h2 class="h2" data-rv="up" data-vanish>Recent work</h2>
  <div class="roofgrid">${[3, 4, 5].map((i, k) => `<figure data-rv="up" data-delay="${k * 110}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="900" height="1200"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="dark cut" id="visit"><div class="wrap">
  <h2 class="h2" data-rv="up">Visit or contact ${esc(site.short)}</h2>
  <div class="info" style="margin-top:44px" data-rv="up">
    <div><h4>Contact</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer>
  <div class="gable" aria-hidden="true"></div><div class="ridge" aria-hidden="true"></div>
  <div class="wrap"><div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.82;max-width:34ch;line-height:1.75">${esc(site.closing)}</p></div>
    <div><h4>Services</h4><ul>${site.services.slice(0, 6).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li><li>${esc(site.city)}</li></ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>Licensed and insured</span></div></div>
</footer>`,
});

/* ========================================================== 8. CLINIC ORBIT
   Concentric orbit rings behind a centred hero, radial service dial, rotating
   ring that tracks scroll. Footer: orbit ring with satellite links. */
const clinicOrbit = site => ({
  fonts: ['Sora:wght@400;500;600;700;800', 'Rubik:wght@400;500;600'],
  display: "'Sora',system-ui,sans-serif", text: "'Rubik',system-ui,sans-serif",
  radius: '20px', border: '1px', particles: 'dust',
  css: `
body{background:var(--paper)}
.rings{position:absolute;left:50%;top:0;translate:-50% 0;width:min(1400px,150vw);aspect-ratio:1;pointer-events:none;z-index:0}
.rings i{position:absolute;inset:0;margin:auto;border:1px solid color-mix(in srgb,var(--accent) 22%,transparent);border-radius:50%}
.rings i:nth-child(1){width:36%;height:36%}
.rings i:nth-child(2){width:56%;height:56%;border-style:dashed;opacity:.7}
.rings i:nth-child(3){width:78%;height:78%;opacity:.5}
.rings i:nth-child(4){width:100%;height:100%;opacity:.3}
.rings .sat{position:absolute;inset:0;margin:auto;width:78%;height:78%;animation:orbit 44s linear infinite}
.rings .sat::after{content:"";position:absolute;left:50%;top:-7px;width:14px;height:14px;border-radius:50%;background:var(--accent2);box-shadow:0 0 22px var(--accent2)}
@keyframes orbit{to{transform:rotate(360deg)}}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:12px var(--gut);
  background:color-mix(in srgb,var(--paper) 85%,transparent);backdrop-filter:blur(16px);border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.hd nav{display:flex;gap:26px;justify-content:center;font-weight:500;font-size:.9rem}
.hd nav a:hover{color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{position:relative;text-align:center;padding:clamp(64px,9vw,130px) 0 clamp(50px,6vw,90px);overflow:hidden}
.hero>*{position:relative;z-index:1}
.hero h1{font-size:clamp(2.3rem,5.4vw,4.6rem);font-weight:700;letter-spacing:-.035em;max-width:18ch;margin-inline:auto}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:22px}
.hero p{max-width:56ch;margin:22px auto 0;opacity:.76}
.hero .cta{display:flex;gap:12px;justify-content:center;margin-top:32px;flex-wrap:wrap}
.heromark{--logo-hh:clamp(70px,9vw,118px);margin-bottom:30px;display:inline-block}
.orb{width:min(560px,86vw);aspect-ratio:1;margin:clamp(36px,5vw,64px) auto 0;position:relative;border-radius:50%;overflow:hidden;border:10px solid color-mix(in srgb,var(--accent) 14%,transparent)}
.orb img{width:100%;height:100%;object-fit:cover}
section{padding:clamp(70px,9vw,128px) 0;position:relative}
.tone{background:color-mix(in srgb,var(--panel) 46%,var(--paper))}
.dark{background:var(--deep);color:#fff}
h2.h2{font-size:clamp(1.9rem,4.2vw,3.5rem);font-weight:700;letter-spacing:-.03em;max-width:20ch}
.lead{margin-top:18px;max-width:56ch;opacity:.76;line-height:1.8}
.center{text-align:center}
.center .h2,.center .lead{margin-inline:auto}
.dial{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:54px}
.dial article{border:1px solid color-mix(in srgb,var(--ink) 14%,transparent);border-radius:var(--r);padding:32px 28px;background:var(--paper);position:relative;overflow:hidden;transition:border-color .4s,transform .5s cubic-bezier(.2,.8,.2,1)}
.dial article::before{content:"";position:absolute;right:-40px;top:-40px;width:130px;height:130px;border-radius:50%;background:color-mix(in srgb,var(--accent) 12%,transparent);transform:scale(0);transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.dial article:hover{border-color:var(--accent);transform:translateY(-6px)}
.dial article:hover::before{transform:scale(1)}
.dial>*{position:relative}
.dial article>*{position:relative;z-index:1}
.dial .n{width:40px;height:40px;border-radius:50%;border:1px solid var(--accent);color:var(--accent);display:grid;place-items:center;font-weight:600;font-size:.86rem;margin-bottom:18px}
.dial h3{font-size:1.1rem;font-weight:600;margin-bottom:10px}
.dial p{font-size:.93rem;opacity:.76;line-height:1.7}
@media(max-width:900px){.dial{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.dial{grid-template-columns:1fr}}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,72px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.circmask{border-radius:50% 50% 20px 20px;overflow:hidden;aspect-ratio:4/5}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:48px}
.stats div{text-align:center;border:1px solid color-mix(in srgb,currentColor 16%,transparent);border-radius:50%;aspect-ratio:1;display:grid;place-content:center;padding:14px}
.stats b{display:block;font-family:var(--display);font-weight:700;font-size:clamp(1.1rem,2.2vw,1.8rem);color:var(--accent2)}
.stats span{font-size:.74rem;opacity:.7;margin-top:6px;display:block}
@media(max-width:760px){.stats{grid-template-columns:repeat(2,1fr)}}
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:50px}
.tiles figure{margin:0;border-radius:var(--r);overflow:hidden;position:relative}
.tiles figure:nth-child(2){border-radius:999px 999px var(--r) var(--r)}
.tiles img{width:100%;aspect-ratio:3/4;object-fit:cover;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.tiles figure:hover img{transform:scale(1.06)}
.tiles figcaption{position:absolute;left:14px;right:14px;bottom:14px;color:#fff;font-size:.82rem;font-weight:500;text-shadow:0 2px 12px rgba(0,0,0,.7)}
@media(max-width:760px){.tiles{grid-template-columns:1fr 1fr}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:46px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{border:1px solid color-mix(in srgb,var(--ink) 14%,transparent);border-radius:var(--r);padding:28px 26px;background:var(--paper)}
.info h4{font-weight:600;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.94rem}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff;position:relative;overflow:hidden;padding:clamp(60px,8vw,110px) 0 40px}
footer::before{content:"";position:absolute;left:50%;bottom:-52%;translate:-50% 0;width:min(900px,120vw);aspect-ratio:1;border-radius:50%;border:1px solid color-mix(in srgb,#fff 18%,transparent);pointer-events:none}
footer::after{content:"";position:absolute;left:50%;bottom:-34%;translate:-50% 0;width:min(640px,90vw);aspect-ratio:1;border-radius:50%;border:1px dashed color-mix(in srgb,#fff 14%,transparent);pointer-events:none}
.fin{position:relative;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-weight:600;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;opacity:.55;margin-bottom:16px}
.fin li{padding:7px 0;opacity:.86;font-size:.94rem}
.footmark{--logo-hf:60px;margin-bottom:20px;display:block}
.fbot{position:relative;margin-top:50px;padding-top:22px;border-top:1px solid color-mix(in srgb,#fff 16%,transparent);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.82rem;opacity:.6}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['Education', '#story'], ['Office', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>New patients</a>
</header>
<main id="main">
<section class="hero" id="top">
  <div class="rings" aria-hidden="true"><i></i><i></i><i></i><i></i><span class="sat"></span></div>
  <div class="wrap">
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <span data-rv="scale">${inkmark(site, 'heromark')}</span>
    <h1 data-rv="up">${esc(site.headline)}</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#story">${esc(site.ctaSecondary)}</a></div>
    <figure class="orb" data-rv="scale" data-par="16">${heroImg(site, 0)}</figure>
  </div>
</section>
<section class="tone center" id="services"><div class="wrap">
  <h2 class="h2" data-rv="up" data-vanish>What we offer</h2>
  <p class="lead" data-rv="up">Care and education, treated as the same job.</p>
  <div class="dial">${site.services.map((s, i) => `<article data-rv="scale" data-delay="${i * 70}" style="text-align:left"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section id="story"><div class="wrap two">
  <figure class="circmask media" data-rv="left" data-par="22">${img(site, 1)}</figure>
  <div><h2 class="h2" data-rv="right" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="right">${esc(site.story.body)}</p>
    <div style="margin-top:30px" data-rv="up"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
</div></section>
<section class="dark center"><div class="wrap">
  <h2 class="h2" data-rv="up">${esc(site.feature.title)}</h2>
  <p class="lead" data-rv="up" style="opacity:.84">${esc(site.feature.body)}</p>
  <div class="stats">${site.proof.map(p => `<div data-rv="scale"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
</div></section>
<section id="gallery"><div class="wrap center">
  <h2 class="h2" data-rv="up" data-vanish>Inside the office</h2>
  <div class="tiles">${[2, 3, 4].map((i, k) => `<figure data-rv="up" data-delay="${k * 110}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="900" height="1200"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone" id="visit"><div class="wrap center">
  <h2 class="h2" data-rv="up">Contact and directions</h2>
  <div class="info" style="text-align:left">
    <div data-rv="up"><h4>Contact</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="180"><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer><div class="wrap">
  <div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.8;max-width:36ch;line-height:1.75">${esc(site.closing)}</p>
      <div style="margin-top:24px"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a></div></div>
    <div><h4>Services</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Visit</h4><ul><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li>${site.links.slice(0, 2).map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</div></footer>`,
});

/* ============================================================ 9. PORCELAIN
   Bright gloss: glossy 3D cards, specular sweeps, a travel-photography film
   strip, editorial serif. Footer: film strip contact sheet. */
const porcelain = site => ({
  fonts: ['Playfair+Display:wght@400;500;600;700', 'Karla:wght@400;500;600;700'],
  display: "'Playfair Display',Georgia,serif", text: "'Karla',system-ui,sans-serif",
  radius: '22px', border: '1px', particles: 'sparkle',
  css: `
body{background:linear-gradient(180deg,#fff,var(--paper) 40%)}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:22px;padding:14px var(--gut);
  background:color-mix(in srgb,#fff 82%,transparent);backdrop-filter:blur(18px) saturate(160%);border-bottom:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
.hd nav{display:flex;gap:28px;justify-content:center;font-weight:600;font-size:.88rem}
.hd nav a:hover{color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(30px,5vw,72px);align-items:center;padding:clamp(56px,7vw,110px) 0}
@media(max-width:900px){.hero{grid-template-columns:1fr}}
.hero h1{font-size:clamp(2.5rem,5.4vw,4.8rem);font-weight:500;letter-spacing:-.025em;max-width:15ch}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:22px}
.hero p{margin-top:22px;max-width:52ch;opacity:.76;font-size:1.05rem;line-height:1.8}
.hero .cta{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.gloss{position:relative;border-radius:clamp(22px,3vw,40px);overflow:hidden;isolation:isolate;
  box-shadow:0 40px 80px -40px color-mix(in srgb,var(--deep) 60%,transparent),0 0 0 1px color-mix(in srgb,#fff 60%,transparent) inset}
.gloss img{width:100%;aspect-ratio:4/5;object-fit:cover}
.gloss::after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,color-mix(in srgb,#fff 34%,transparent) 0 26%,transparent 46%);pointer-events:none;
  transform:translateX(-40%);animation:sheen 6.5s ease-in-out infinite}
@keyframes sheen{0%,62%{transform:translateX(-60%)}86%,100%{transform:translateX(70%)}}
section{padding:clamp(70px,9vw,128px) 0}
.tone{background:#fff}
.deep{background:var(--deep);color:#fff}
h2.h2{font-size:clamp(1.9rem,4.2vw,3.6rem);font-weight:500;letter-spacing:-.025em;max-width:20ch}
.lead{margin-top:18px;max-width:56ch;opacity:.76;line-height:1.85}
.kick{color:var(--accent);font-weight:700;font-size:.76rem;letter-spacing:.2em;text-transform:uppercase;display:block;margin-bottom:20px}
.svc{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:52px}
@media(max-width:900px){.svc{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.svc{grid-template-columns:1fr}}
.svc article{background:#fff;border-radius:var(--r);padding:34px 30px;border:1px solid color-mix(in srgb,var(--ink) 8%,transparent);
  box-shadow:0 22px 48px -34px color-mix(in srgb,var(--deep) 60%,transparent);transition:transform .5s cubic-bezier(.2,.8,.2,1),box-shadow .5s}
.svc article:hover{transform:translateY(-8px);box-shadow:0 34px 66px -30px color-mix(in srgb,var(--accent) 50%,transparent)}
.svc h3{font-size:1.22rem;font-weight:500;margin-bottom:10px}
.svc p{font-size:.93rem;opacity:.75;line-height:1.7}
.svc .n{font-family:var(--display);color:var(--accent);font-size:1.5rem;display:block;margin-bottom:14px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,74px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:46px}
.figs div{text-align:center;padding:24px 14px;background:#fff;border-radius:var(--r);border:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
.deep .figs div{background:color-mix(in srgb,#fff 8%,transparent);border-color:color-mix(in srgb,#fff 16%,transparent)}
.figs b{font-family:var(--display);font-size:clamp(1.2rem,2.4vw,1.9rem);color:var(--accent);display:block}
.figs span{font-size:.76rem;opacity:.7;margin-top:6px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.strip{display:flex;gap:14px;overflow:hidden;margin-top:50px;padding:16px;background:#141414;border-radius:14px;
  background-image:repeating-linear-gradient(90deg,#141414 0 26px,#0b0b0b 26px 34px)}
.strip figure{flex:1;margin:0;min-width:0;border-radius:5px;overflow:hidden;position:relative}
.strip img{width:100%;aspect-ratio:1;object-fit:cover;transition:transform .8s cubic-bezier(.2,.8,.2,1),filter .5s;filter:saturate(.82)}
.strip figure:hover img{transform:scale(1.08);filter:none}
.strip figcaption{position:absolute;inset:auto 0 0 0;padding:9px 12px;background:linear-gradient(0deg,rgba(0,0,0,.85),transparent);color:#fff;font-size:.72rem}
@media(max-width:760px){.strip{flex-wrap:wrap}.strip figure{flex:1 1 44%}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:46px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{background:#fff;border-radius:var(--r);padding:30px 28px;border:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
.info h4{font-family:var(--display);font-size:1.1rem;margin-bottom:16px;color:var(--accent)}
.info li,.info p{padding:8px 0;font-size:.94rem;border-bottom:1px solid color-mix(in srgb,var(--ink) 7%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:#141414;color:#fff;padding:clamp(56px,7vw,100px) 0 40px}
.contact-sheet{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;padding:10px;background:#0b0b0b;border-radius:10px;margin-bottom:48px}
.contact-sheet img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:3px;filter:saturate(.7) contrast(1.05);transition:filter .4s}
.contact-sheet img:hover{filter:none}
@media(max-width:700px){.contact-sheet{grid-template-columns:repeat(3,1fr)}}
.fin{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-family:var(--display);font-size:1.05rem;margin-bottom:16px;opacity:.9}
.fin li{padding:7px 0;opacity:.8;font-size:.94rem}
.footmark{--logo-hf:60px;margin-bottom:20px;display:block}
.fbot{margin-top:48px;padding-top:22px;border-top:1px solid rgba(255,255,255,.16);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.82rem;opacity:.6}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['The practice', '#story'], ['Travels', '#gallery'], ['Visit', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Schedule</a>
</header>
<main id="main">
<section class="hero wrap" id="top">
  <div>
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <h1 data-rv="up">${esc(site.headline)}</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#services">${esc(site.ctaSecondary)}</a></div>
  </div>
  <figure class="gloss" data-rv="scale" data-par="20">${heroImg(site, 0)}</figure>
</section>
<section class="tone" id="services"><div class="wrap">
  <span class="kick" data-rv="down">Our services</span>
  <h2 class="h2" data-rv="up" data-vanish>Prosthetic, restorative, cosmetic and implant dentistry</h2>
  <div class="svc">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 70}"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section id="story"><div class="wrap two">
  <figure class="gloss" data-rv="left" data-par="18">${img(site, 1)}</figure>
  <div><span class="kick" data-rv="down">The practice</span>
    <h2 class="h2" data-rv="right" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="right">${esc(site.story.body)}</p>
    <div style="margin-top:30px" data-rv="up"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
</div></section>
<section class="deep" id="gallery"><div class="wrap">
  <span class="kick" data-rv="down" style="color:var(--accent2)">${esc(site.feature.title)}</span>
  <h2 class="h2" data-rv="up" data-vanish>Between appointments</h2>
  <p class="lead" data-rv="up" style="opacity:.84">${esc(site.feature.body)}</p>
  <div class="strip">${[2, 3, 4, 5].map((i, k) => `<figure data-rv="scale" data-delay="${k * 90}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="800" height="800"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
  <div class="figs">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
</div></section>
<section class="tone" id="visit"><div class="wrap">
  <span class="kick" data-rv="down">Visit</span>
  <h2 class="h2" data-rv="up">Our office hours</h2>
  <div class="info">
    <div data-rv="up"><h4>Contact</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="180"><h4>Explore</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer><div class="wrap">
  <div class="contact-sheet" aria-hidden="true">${[0, 1, 2, 3, 4, 5].map(i => `<img src="assets/${site.images[i]}" alt="" loading="lazy" decoding="async" width="400" height="400">`).join('')}</div>
  <div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.78;max-width:34ch;line-height:1.8">${esc(site.closing)}</p></div>
    <div><h4>Services</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li>${site.links.slice(0, 2).map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</div></footer>`,
});

/* =========================================================== 10. STEP TRACE
   A footprint trail: an SVG path that draws itself down the page as you scroll,
   with each section anchored to a step marker. Footer: trail terminus. */
const stepTrace = site => ({
  fonts: ['DM+Serif+Display', 'DM+Sans:wght@400;500;700'],
  display: "'DM Serif Display',Georgia,serif", text: "'DM Sans',system-ui,sans-serif",
  radius: '16px', border: '1px', particles: 'dust',
  css: `
body{background:var(--paper)}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:12px var(--gut);
  background:color-mix(in srgb,var(--paper) 88%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.hd nav{display:flex;gap:26px;justify-content:center;font-weight:500;font-size:.9rem}
.hd nav a:hover{color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.trail{position:fixed;left:clamp(10px,2.4vw,40px);top:0;bottom:0;width:52px;z-index:40;pointer-events:none;display:grid;place-items:center}
.trail svg{height:70vh;width:52px;overflow:visible}
.trail path{fill:none;stroke:color-mix(in srgb,var(--accent) 55%,transparent);stroke-width:2;stroke-dasharray:1400;stroke-dashoffset:calc(1400 - 1400 * var(--sp,0));transition:stroke-dashoffset .12s linear}
.trail .foot{fill:var(--accent);opacity:.5}
@media(max-width:1100px){.trail{display:none}}
.hero{padding:clamp(60px,8vw,120px) 0 clamp(46px,6vw,80px)}
.hero-in{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(28px,5vw,70px);align-items:center}
@media(max-width:900px){.hero-in{grid-template-columns:1fr}}
.hero h1{font-size:clamp(2.6rem,6vw,5.4rem);font-weight:400;letter-spacing:-.02em;max-width:14ch;line-height:1.02}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:22px}
.hero p{margin-top:22px;max-width:52ch;opacity:.76;line-height:1.85}
.hero .cta{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.arch{border-radius:999px 999px 22px 22px;overflow:hidden;aspect-ratio:3/4;box-shadow:0 40px 80px -46px color-mix(in srgb,var(--deep) 70%,transparent)}
.arch img{width:100%;height:100%;object-fit:cover}
section{padding:clamp(66px,8.5vw,124px) 0;position:relative}
.tone{background:color-mix(in srgb,var(--panel) 42%,var(--paper))}
.dark{background:var(--deep);color:#fff}
.step{display:inline-grid;place-items:center;width:52px;height:52px;border-radius:50%;background:var(--accent);color:#fff;
  font-family:var(--display);font-size:1.2rem;margin-bottom:24px;box-shadow:0 14px 30px -14px color-mix(in srgb,var(--accent) 80%,transparent)}
h2.h2{font-size:clamp(1.9rem,4.4vw,3.7rem);font-weight:400;letter-spacing:-.02em;max-width:20ch}
.lead{margin-top:18px;max-width:56ch;opacity:.76;line-height:1.85}
.conds{display:grid;grid-template-columns:repeat(2,1fr);gap:0;margin-top:50px;border-top:1px solid color-mix(in srgb,var(--ink) 16%,transparent)}
@media(max-width:760px){.conds{grid-template-columns:1fr}}
.conds article{padding:30px 26px 30px 0;border-bottom:1px solid color-mix(in srgb,var(--ink) 16%,transparent);position:relative;padding-left:56px;transition:background .4s ease}
.conds article::before{content:"";position:absolute;left:14px;top:36px;width:9px;height:9px;border-radius:50%;background:var(--accent);transform:scale(0);transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.conds article.rv-in::before{transform:scale(1)}
.conds article:hover{background:color-mix(in srgb,var(--accent) 6%,transparent)}
.conds h3{font-family:var(--display);font-size:1.3rem;font-weight:400;margin-bottom:9px}
.conds p{font-size:.94rem;opacity:.76;line-height:1.7}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,74px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.figs{display:flex;flex-wrap:wrap;gap:14px;margin-top:44px}
.figs div{border:1px solid color-mix(in srgb,currentColor 20%,transparent);border-radius:999px;padding:14px 24px}
.figs b{font-family:var(--display);color:var(--accent2);margin-right:9px}
.paces{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:50px}
.paces figure{margin:0;overflow:hidden;border-radius:999px 999px 16px 16px;position:relative}
.paces figure:nth-child(2){margin-top:36px;border-radius:16px 16px 999px 999px}
.paces img{width:100%;aspect-ratio:3/4;object-fit:cover;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.paces figure:hover img{transform:scale(1.06)}
.paces figcaption{position:absolute;left:16px;right:16px;bottom:20px;color:#fff;font-size:.82rem;text-shadow:0 2px 12px rgba(0,0,0,.75)}
@media(max-width:760px){.paces{grid-template-columns:1fr 1fr}.paces figure:nth-child(2){margin-top:0}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:46px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{border:1px solid color-mix(in srgb,currentColor 16%,transparent);border-radius:var(--r);padding:30px 28px}
.info h4{font-family:var(--display);font-size:1.15rem;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.94rem;border-bottom:1px solid color-mix(in srgb,currentColor 10%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff;padding:clamp(56px,7vw,100px) 0 40px;position:relative;overflow:hidden}
footer::before{content:"";position:absolute;left:-40px;top:0;bottom:0;width:180px;
  background-image:radial-gradient(color-mix(in srgb,#fff 14%,transparent) 4px,transparent 4px);background-size:38px 58px;opacity:.6}
.fin{position:relative;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-family:var(--display);font-size:1.1rem;margin-bottom:16px;opacity:.92}
.fin li{padding:7px 0;opacity:.82;font-size:.94rem}
.footmark{--logo-hf:60px;margin-bottom:20px;display:block}
.fbot{position:relative;margin-top:48px;padding-top:22px;border-top:1px solid color-mix(in srgb,#fff 16%,transparent);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.82rem;opacity:.6}`,
  body: `
<div class="trail" aria-hidden="true"><svg viewBox="0 0 52 600" preserveAspectRatio="none">
  <path d="M26 0 C 6 90, 46 170, 26 260 S 6 430, 26 520 L26 600"/>
  ${[60, 170, 280, 390, 500].map((y, i) => `<ellipse class="foot" cx="${i % 2 ? 36 : 16}" cy="${y}" rx="6" ry="9"/>`).join('')}
</svg></div>
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Conditions', '#services'], ['The practice', '#story'], ['Office', '#gallery'], ['Visit', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Call today</a>
</header>
<main id="main">
<section class="hero" id="top"><div class="wrap hero-in">
  <div>
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <h1 data-rv="up">${esc(site.headline)}</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#services">${esc(site.ctaSecondary)}</a></div>
  </div>
  <figure class="arch" data-rv="scale" data-par="20">${heroImg(site, 0)}</figure>
</div></section>
<section class="tone" id="services"><div class="wrap">
  <span class="step" data-rv="scale">01</span>
  <h2 class="h2" data-rv="up" data-vanish>Conditions we treat</h2>
  <p class="lead" data-rv="up">Medical and surgical care of the foot and ankle.</p>
  <div class="conds">${site.services.map((s, i) => `<article data-rv="right" data-delay="${i * 60}"><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section id="story"><div class="wrap two">
  <div><span class="step" data-rv="scale">02</span>
    <h2 class="h2" data-rv="left" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="left">${esc(site.story.body)}</p>
    <div class="figs">${site.proof.map(p => `<div data-rv="scale"><b>${esc(p[0])}</b>${esc(p[1])}</div>`).join('')}</div></div>
  <figure class="arch" data-rv="right" data-par="22">${img(site, 1)}</figure>
</div></section>
<section class="dark"><div class="wrap">
  <span class="step" data-rv="scale" style="background:var(--accent2)">03</span>
  <h2 class="h2" data-rv="up">${esc(site.feature.title)}</h2>
  <p class="lead" data-rv="up" style="opacity:.86">${esc(site.feature.body)}</p>
  <div style="margin-top:32px" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a></div>
</div></section>
<section id="gallery"><div class="wrap">
  <span class="step" data-rv="scale">04</span>
  <h2 class="h2" data-rv="up" data-vanish>Inside the office</h2>
  <div class="paces">${[2, 3, 4].map((i, k) => `<figure data-rv="up" data-delay="${k * 110}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="900" height="1200"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone" id="visit"><div class="wrap">
  <span class="step" data-rv="scale">05</span>
  <h2 class="h2" data-rv="up">Visit ${esc(site.short)}</h2>
  <div class="info">
    <div data-rv="up"><h4>Contact</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="180"><h4>Resources</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer><div class="wrap">
  <div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.8;max-width:34ch;line-height:1.8">${esc(site.closing)}</p></div>
    <div><h4>Conditions</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li>${site.links.slice(0, 2).map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</div></footer>`,
  extraJs: `(function(){var p=document.querySelector('.trail path');if(!p)return;function u(){var h=document.documentElement.scrollHeight-innerHeight;p.style.setProperty('--sp',(h>0?scrollY/h:0).toFixed(4));}addEventListener('scroll',u,{passive:true});u();})();`,
});

module.exports = { 'fresh-bloom': freshBloom, 'pitch-shift': pitchShift, 'clinic-orbit': clinicOrbit, porcelain, 'step-trace': stepTrace };
