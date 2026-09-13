const K = require('../kernel');
const { esc, attr, telHref, mapHref, inkmark, img, heroImg, hoursList } = K;

/* =========================================================== 16. SOFT ARCH
   Warm sand: big arch shapes, arch-shaped reveal masks, colonnade rhythm.
   Footer: a colonnade of arches with the details set inside them. */
const softArch = site => ({
  fonts: ['Fraunces:opsz,wght@9..144,400;9..144,600', 'Figtree:wght@400;500;600;700'],
  display: "'Fraunces',Georgia,serif", text: "'Figtree',system-ui,sans-serif",
  radius: '999px', border: '1px', particles: 'dust',
  css: `
body{background:var(--paper)}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:22px;padding:13px var(--gut);
  background:color-mix(in srgb,var(--paper) 88%,transparent);backdrop-filter:blur(16px)}
.hd nav{display:flex;gap:28px;justify-content:center;font-weight:600;font-size:.9rem}
.hd nav a:hover{color:var(--accent2)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{padding:clamp(50px,7vw,100px) 0 clamp(46px,6vw,84px);position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;left:50%;top:-6vw;translate:-50% 0;width:min(1100px,124vw);height:min(1100px,124vw);
  border-radius:999px 999px 0 0;background:color-mix(in srgb,var(--panel) 70%,transparent);z-index:0}
.hero-in{position:relative;z-index:1;text-align:center}
.hero h1{font-size:clamp(2.4rem,5.6vw,4.8rem);font-weight:400;letter-spacing:-.025em;max-width:16ch;margin-inline:auto}
.hero .eyebrow{color:var(--accent2);display:block;margin-bottom:22px}
.hero p{max-width:54ch;margin:22px auto 0;opacity:.78;line-height:1.8}
.hero .cta{display:flex;gap:12px;justify-content:center;margin-top:32px;flex-wrap:wrap}
.heromark{--logo-hh:clamp(70px,9vw,112px);margin-bottom:28px;display:inline-block}
.archframe{width:min(760px,92%);margin:clamp(38px,5vw,66px) auto 0;border-radius:999px 999px 30px 30px;overflow:hidden;
  box-shadow:0 50px 90px -50px color-mix(in srgb,var(--deep) 70%,transparent)}
.archframe img{width:100%;aspect-ratio:4/5;object-fit:cover}
section{padding:clamp(70px,9vw,128px) 0}
.tone{background:color-mix(in srgb,var(--panel) 46%,var(--paper))}
.dark{background:var(--deep);color:color-mix(in srgb,var(--paper) 96%,#fff)}
h2.h2{font-size:clamp(1.9rem,4.4vw,3.6rem);font-weight:400;letter-spacing:-.025em;max-width:20ch}
.lead{margin-top:18px;max-width:56ch;opacity:.76;line-height:1.85}
.kick{font-weight:700;font-size:.74rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent2);display:block;margin-bottom:20px}
.center{text-align:center}.center .h2,.center .lead{margin-inline:auto}
.arches{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:56px}
@media(max-width:900px){.arches{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.arches{grid-template-columns:1fr}}
.arches article{background:var(--paper);border-radius:200px 200px 26px 26px;padding:44px 30px 34px;text-align:center;
  border:1px solid color-mix(in srgb,var(--ink) 10%,transparent);transition:transform .55s cubic-bezier(.2,.8,.2,1),background .45s ease}
.tone .arches article{background:#fff}
.arches article:hover{transform:translateY(-10px);background:var(--accent);color:#fff}
.arches article:hover .n{background:#fff;color:var(--accent)}
.arches .n{width:44px;height:44px;border-radius:50%;background:color-mix(in srgb,var(--accent) 16%,transparent);color:var(--accent);
  display:grid;place-items:center;font-weight:700;font-size:.88rem;margin:0 auto 20px;transition:background .4s,color .4s}
.arches h3{font-family:var(--display);font-size:1.2rem;font-weight:400;margin-bottom:10px}
.arches p{font-size:.93rem;opacity:.78;line-height:1.7}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,76px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.archimg{border-radius:999px 999px 24px 24px;overflow:hidden;aspect-ratio:3/4}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:46px}
.figs div{text-align:center;border-radius:999px 999px 16px 16px;padding:30px 16px 22px;background:color-mix(in srgb,var(--accent) 12%,transparent)}
.dark .figs div{background:color-mix(in srgb,#fff 10%,transparent)}
.figs b{font-family:var(--display);font-size:clamp(1.2rem,2.4vw,1.9rem);display:block;color:var(--accent2)}
.figs span{font-size:.78rem;opacity:.72;margin-top:7px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.colonnade{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:52px}
.colonnade figure{margin:0;border-radius:999px 999px 20px 20px;overflow:hidden;position:relative}
.colonnade figure:nth-child(2){margin-top:-30px}
.colonnade img{width:100%;aspect-ratio:3/4;object-fit:cover;transition:transform 1.1s cubic-bezier(.2,.8,.2,1)}
.colonnade figure:hover img{transform:scale(1.06)}
.colonnade figcaption{position:absolute;left:18px;right:18px;bottom:18px;color:#fff;font-size:.84rem;text-shadow:0 2px 12px rgba(0,0,0,.7)}
@media(max-width:760px){.colonnade{grid-template-columns:1fr 1fr}.colonnade figure:nth-child(2){margin-top:0}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:46px;text-align:left}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{border-radius:34px;padding:32px 30px;background:var(--paper);border:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.tone .info>div{background:#fff}
.info h4{font-family:var(--display);font-size:1.15rem;color:var(--accent2);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.94rem;border-bottom:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:color-mix(in srgb,var(--paper) 96%,#fff);padding:0 0 40px}
.colon{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
.colon>div{border-right:1px solid color-mix(in srgb,#fff 14%,transparent);padding:52px 26px 34px;position:relative;text-align:center}
.colon>div::before{content:"";position:absolute;left:50%;top:0;translate:-50% 0;width:76%;height:60px;border-radius:0 0 999px 999px;border:1px solid color-mix(in srgb,#fff 14%,transparent);border-top:0}
.colon>div:last-child{border-right:0}
.colon h4{font-family:var(--display);font-size:1rem;margin-bottom:14px;opacity:.94}
.colon li,.colon p{padding:6px 0;font-size:.9rem;opacity:.82}
@media(max-width:880px){.colon{grid-template-columns:1fr 1fr}.colon>div:nth-child(2){border-right:0}}
.fmark{text-align:center;padding:clamp(46px,6vw,84px) 0 8px}
.footmark{--logo-hf:66px;display:inline-block}
.fbot{margin-top:34px;padding-top:22px;border-top:1px solid color-mix(in srgb,#fff 14%,transparent);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.84rem;opacity:.62}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['The practice', '#story'], ['Office', '#gallery'], ['Visit', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Make an appointment</a>
</header>
<main id="main">
<section class="hero" id="top"><div class="wrap hero-in">
  <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
  <span data-rv="scale">${inkmark(site, 'heromark')}</span>
  <h1 data-rv="up">${esc(site.headline)}</h1>
  <p data-rv="up">${esc(site.sub)}</p>
  <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#services">${esc(site.ctaSecondary)}</a></div>
  <figure class="archframe" data-rv="clip" data-par="16">${heroImg(site, 0)}</figure>
</div></section>
<section class="tone center" id="services"><div class="wrap">
  <span class="kick" data-rv="down">Our services</span>
  <h2 class="h2" data-rv="up" data-vanish>Foot and ankle care for all ages</h2>
  <div class="arches">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 80}"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section id="story"><div class="wrap two">
  <figure class="archimg media" data-rv="left" data-par="22">${img(site, 1)}</figure>
  <div><span class="kick" data-rv="down">The practice</span>
    <h2 class="h2" data-rv="right" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="right">${esc(site.story.body)}</p>
    <div style="margin-top:30px" data-rv="up"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
</div></section>
<section class="dark center"><div class="wrap">
  <span class="kick" data-rv="down">${esc(site.feature.title)}</span>
  <h2 class="h2" data-rv="up">Before your first visit</h2>
  <p class="lead" data-rv="up" style="opacity:.86">${esc(site.feature.body)}</p>
  <div class="figs">${site.proof.map(p => `<div data-rv="scale"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
</div></section>
<section class="center" id="gallery"><div class="wrap">
  <span class="kick" data-rv="down">Inside</span>
  <h2 class="h2" data-rv="up" data-vanish>Inside ${esc(site.short)}</h2>
  <div class="colonnade">${[2, 3, 4].map((i, k) => `<figure data-rv="up" data-delay="${k * 120}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="900" height="1200"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone center" id="visit"><div class="wrap">
  <span class="kick" data-rv="down">Contact and directions</span>
  <h2 class="h2" data-rv="up">Visit ${esc(site.short)}</h2>
  <div class="info">
    <div data-rv="up"><h4>Contact</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="180"><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer>
  <div class="wrap fmark">${inkmark(site, 'footmark')}<p style="margin-top:18px;opacity:.8;max-width:48ch;margin-inline:auto;line-height:1.8">${esc(site.closing)}</p></div>
  <div class="colon">
    <div><h4>Contact</h4><p><a href="${telHref(site.tel)}">${esc(site.tel)}</a></p></div>
    <div><h4>Visit</h4><p><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></p></div>
    <div><h4>Services</h4><ul>${site.services.slice(0, 3).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Links</h4><ul>${site.links.slice(0, 3).map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <div class="wrap"><div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div></div>
</footer>`,
});

/* =========================================================== 17. AQUA LANE
   Water: caustic light, pool lane lines, a waterline that rises with scroll,
   ripple hovers. Footer: waterline with lane markers. */
const aquaLane = site => ({
  fonts: ['Outfit:wght@400;500;600;700;800', 'Mulish:wght@400;500;600;700'],
  display: "'Outfit',system-ui,sans-serif", text: "'Mulish',system-ui,sans-serif",
  radius: '18px', border: '1px', particles: 'bubble',
  css: `
body{background:var(--paper)}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:12px var(--gut);
  background:color-mix(in srgb,var(--paper) 86%,transparent);backdrop-filter:blur(16px);border-bottom:1px solid color-mix(in srgb,var(--accent) 22%,transparent)}
.hd nav{display:flex;gap:26px;justify-content:center;font-weight:600;font-size:.9rem}
.hd nav a:hover{color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{position:relative;min-height:92svh;display:grid;align-items:center;overflow:hidden;color:#fff;background:var(--deep)}
.hero-bg{position:absolute;inset:0}
.hero-bg img{width:100%;height:100%;object-fit:cover;opacity:.46}
.caustic{position:absolute;inset:-20%;z-index:1;pointer-events:none;opacity:.4;
  background:
   radial-gradient(closest-side,color-mix(in srgb,var(--accent2) 40%,transparent),transparent) 20% 30%/46% 46% no-repeat,
   radial-gradient(closest-side,color-mix(in srgb,#9fd7ff 34%,transparent),transparent) 74% 62%/40% 40% no-repeat,
   radial-gradient(closest-side,color-mix(in srgb,var(--accent) 40%,transparent),transparent) 48% 82%/36% 36% no-repeat;
  filter:blur(34px);animation:swell 20s ease-in-out infinite alternate}
@keyframes swell{to{transform:translate3d(4%,-5%,0) scale(1.14)}}
.lanes{position:absolute;inset:0;z-index:1;pointer-events:none;
  background:repeating-linear-gradient(90deg,transparent 0 148px,color-mix(in srgb,#fff 12%,transparent) 148px 150px)}
.hero-in{position:relative;z-index:2;padding:82px 0}
.hero h1{font-size:clamp(2.4rem,5.8vw,5rem);font-weight:700;letter-spacing:-.035em;max-width:16ch;line-height:1.02}
.hero .eyebrow{color:var(--accent2);display:block;margin-bottom:22px}
.hero p{max-width:52ch;margin-top:22px;opacity:.88;line-height:1.8}
.hero .cta{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.hero .btn.ghost{color:#fff}
.waterline{height:70px;margin-top:-70px;position:relative;z-index:3;pointer-events:none;
  background:linear-gradient(0deg,var(--paper),transparent);}
section{padding:clamp(70px,9vw,128px) 0;position:relative}
.tone{background:color-mix(in srgb,var(--panel) 42%,var(--paper))}
.dark{background:var(--deep);color:#fff;position:relative;overflow:hidden}
.dark::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 118px,color-mix(in srgb,#fff 7%,transparent) 118px 120px);pointer-events:none}
.dark>*{position:relative}
.kick{font-weight:700;font-size:.74rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent2);display:block;margin-bottom:20px}
h2.h2{font-size:clamp(1.9rem,4.4vw,3.6rem);font-weight:700;letter-spacing:-.035em;max-width:20ch}
.lead{margin-top:18px;max-width:56ch;opacity:.78;line-height:1.85}
.pool{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:52px}
@media(max-width:900px){.pool{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.pool{grid-template-columns:1fr}}
.pool article{border-radius:var(--r);padding:32px 28px;background:var(--paper);border:1px solid color-mix(in srgb,var(--accent) 20%,transparent);
  position:relative;overflow:hidden;transition:transform .5s cubic-bezier(.2,.8,.2,1),box-shadow .5s}
.tone .pool article{background:#fff}
.pool article::before{content:"";position:absolute;left:50%;bottom:-160px;translate:-50% 0;width:280px;height:280px;border-radius:50%;
  background:color-mix(in srgb,var(--accent) 14%,transparent);transition:bottom .7s cubic-bezier(.2,.8,.2,1)}
.pool article:hover{transform:translateY(-8px);box-shadow:0 30px 56px -34px color-mix(in srgb,var(--accent) 90%,transparent)}
.pool article:hover::before{bottom:-120px}
.pool article>*{position:relative;z-index:1}
.pool .n{font-family:var(--display);font-weight:700;font-size:.82rem;letter-spacing:.18em;color:var(--accent);display:block;margin-bottom:14px}
.pool h3{font-family:var(--display);font-size:1.18rem;font-weight:600;margin-bottom:9px}
.pool p{font-size:.93rem;opacity:.76;line-height:1.7}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,74px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.wave{border-radius:var(--r);overflow:hidden;aspect-ratio:4/3;position:relative}
.wave::after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,transparent 40%,color-mix(in srgb,var(--accent2) 26%,transparent),transparent 70%);
  transform:translateX(-100%);animation:glide 7s ease-in-out infinite}
@keyframes glide{0%,55%{transform:translateX(-100%)}85%,100%{transform:translateX(100%)}}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:46px}
.figs div{border-radius:var(--r);padding:26px 20px;background:color-mix(in srgb,#fff 9%,transparent);border:1px solid color-mix(in srgb,#fff 16%,transparent)}
.figs b{font-family:var(--display);font-size:clamp(1.3rem,2.6vw,2rem);font-weight:700;color:var(--accent2);display:block;line-height:1}
.figs span{font-size:.78rem;opacity:.74;margin-top:8px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.deck{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:50px}
.deck figure{margin:0;border-radius:var(--r);overflow:hidden;position:relative}
.deck figure:nth-child(odd){margin-top:26px}
.deck img{width:100%;aspect-ratio:3/4;object-fit:cover;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.deck figure:hover img{transform:scale(1.07)}
.deck figcaption{position:absolute;left:14px;right:14px;bottom:14px;color:#fff;font-size:.8rem;font-weight:600;text-shadow:0 2px 12px rgba(0,0,0,.75)}
@media(max-width:760px){.deck{grid-template-columns:1fr 1fr}.deck figure:nth-child(odd){margin-top:0}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:46px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{border-radius:var(--r);padding:30px 26px;background:#fff;border:1px solid color-mix(in srgb,var(--accent) 20%,transparent)}
.info h4{font-family:var(--display);font-weight:700;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.94rem;border-bottom:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff;padding:clamp(56px,7vw,100px) 0 0;position:relative;overflow:hidden}
footer::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 118px,color-mix(in srgb,#fff 7%,transparent) 118px 120px);pointer-events:none}
.fin{position:relative;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-family:var(--display);font-weight:700;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent2);margin-bottom:16px}
.fin li{padding:7px 0;opacity:.84;font-size:.94rem}
.footmark{--logo-hf:60px;margin-bottom:20px;display:block}
.markers{position:relative;display:flex;gap:10px;margin-top:48px;padding-bottom:26px}
.markers i{flex:1;height:8px;border-radius:99px;background:color-mix(in srgb,var(--accent2) 55%,transparent);opacity:.35}
.markers i:nth-child(3n){opacity:.75}
.fbot{position:relative;border-top:1px solid color-mix(in srgb,#fff 16%,transparent);padding:20px 0 40px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.84rem;opacity:.62}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['About', '#story'], ['Facility', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.tel)}</a>
</header>
<main id="main">
<section class="hero" id="top">
  <div class="hero-bg" data-par="28">${heroImg(site, 0)}</div>
  <div class="caustic" aria-hidden="true"></div><div class="lanes" aria-hidden="true"></div>
  <div class="hero-in wrap">
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <h1 data-rv="up">${esc(site.headline)}</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#services">${esc(site.ctaSecondary)}</a></div>
  </div>
</section>
<div class="waterline" aria-hidden="true"></div>
<section id="services"><div class="wrap">
  <span class="kick" data-rv="down">Our services</span>
  <h2 class="h2" data-rv="up" data-vanish>Rehab services under one roof</h2>
  <div class="pool">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 70}"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section class="tone" id="story"><div class="wrap two">
  <div><span class="kick" data-rv="down">About us</span>
    <h2 class="h2" data-rv="left" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="left">${esc(site.story.body)}</p>
    <div style="margin-top:30px" data-rv="up"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
  <figure class="wave media" data-rv="right" data-par="22">${img(site, 1)}</figure>
</div></section>
<section class="dark"><div class="wrap two">
  <figure class="wave media" data-rv="left">${img(site, 2)}</figure>
  <div><span class="kick" data-rv="down">Aquatic therapy</span>
    <h2 class="h2" data-rv="right">${esc(site.feature.title)}</h2>
    <p class="lead" data-rv="right" style="opacity:.86">${esc(site.feature.body)}</p>
    <div class="figs">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div></div>
</div></section>
<section id="gallery"><div class="wrap">
  <span class="kick" data-rv="down">The facility</span>
  <h2 class="h2" data-rv="up" data-vanish>Inside ${esc(site.short)}</h2>
  <div class="deck">${[3, 4, 5, 0].map((i, k) => `<figure data-rv="up" data-delay="${k * 100}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="900" height="1200"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone" id="visit"><div class="wrap">
  <span class="kick" data-rv="down">Contact</span>
  <h2 class="h2" data-rv="up">Visit ${esc(site.short)}</h2>
  <div class="info">
    <div data-rv="up"><h4>Reach us</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="180"><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer><div class="wrap">
  <div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.84;max-width:34ch;line-height:1.8">${esc(site.closing)}</p></div>
    <div><h4>Services</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li>${site.links.slice(0, 2).map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <div class="markers" aria-hidden="true">${Array.from({ length: 12 }, () => '<i></i>').join('')}</div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</div></footer>`,
});

/* ========================================================== 18. FORGE IRON
   Dark forge: ember particles, wrought scrollwork rules, hammered texture,
   heat-glow hovers. Footer: a wrought iron gate with finials. */
const forgeIron = site => ({
  fonts: ['Cinzel:wght@400;500;600;700', 'Barlow:wght@400;500;600;700'],
  display: "'Cinzel',Georgia,serif", text: "'Barlow',system-ui,sans-serif",
  radius: '2px', border: '1px', particles: 'ember',
  css: `
body{background:var(--paper)}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:22px;padding:12px var(--gut);
  background:var(--deep);color:#F2EDE6;border-bottom:1px solid color-mix(in srgb,var(--accent2) 44%,transparent)}
.hd nav{display:flex;gap:26px;justify-content:center;font-family:var(--display);font-size:.82rem;letter-spacing:.1em;text-transform:uppercase}
.hd nav a:hover{color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.scroll-rule{height:34px;background:var(--deep);position:relative;overflow:hidden}
.scroll-rule svg{position:absolute;left:0;top:0;width:200%;height:100%}
.scroll-rule path{fill:none;stroke:color-mix(in srgb,var(--accent2) 62%,transparent);stroke-width:1.4}
.hero{position:relative;min-height:94svh;display:grid;align-items:center;overflow:hidden;color:#F5F0EA;background:var(--deep);text-align:center}
.hero-bg{position:absolute;inset:0}
.hero-bg img{width:100%;height:100%;object-fit:cover;opacity:.34;filter:contrast(1.08)}
.hero-bg::after{content:"";position:absolute;inset:0;background:radial-gradient(70% 60% at 50% 42%,transparent,color-mix(in srgb,var(--deep) 88%,transparent))}
.heat{position:absolute;left:50%;bottom:-30%;translate:-50% 0;width:min(900px,120vw);aspect-ratio:1;border-radius:50%;
  background:radial-gradient(closest-side,color-mix(in srgb,var(--accent2) 44%,transparent),transparent);filter:blur(50px);z-index:1;
  animation:forge 7s ease-in-out infinite alternate}
@keyframes forge{to{opacity:.55;transform:translate(-50%,-4%) scale(1.1)}}
.hero-in{position:relative;z-index:2;padding:88px 0}
.hero h1{font-family:var(--display);font-size:clamp(2.1rem,5vw,4.4rem);font-weight:600;letter-spacing:.01em;max-width:17ch;margin-inline:auto;line-height:1.1}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:24px;letter-spacing:.26em}
.hero p{max-width:54ch;margin:24px auto 0;opacity:.84;line-height:1.85}
.hero .cta{display:flex;gap:14px;justify-content:center;margin-top:34px;flex-wrap:wrap}
.hero .btn.ghost{color:#F5F0EA}
.heromark{--logo-hh:clamp(76px,9vw,124px);margin-bottom:30px;display:inline-block}
.finial{width:100%;max-width:280px;margin:28px auto 0;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);position:relative}
.finial::after{content:"";position:absolute;left:50%;top:-4px;translate:-50% 0;width:9px;height:9px;rotate:45deg;background:var(--accent)}
section{padding:clamp(72px,9vw,132px) 0;position:relative}
.tone{background:color-mix(in srgb,var(--panel) 52%,var(--paper))}
.dark{background:var(--deep);color:#F2EDE6}
.kick{font-family:var(--display);font-size:.74rem;letter-spacing:.28em;text-transform:uppercase;color:var(--accent);display:block;margin-bottom:22px}
h2.h2{font-family:var(--display);font-size:clamp(1.7rem,3.8vw,3.1rem);font-weight:600;letter-spacing:.005em;max-width:20ch;line-height:1.14}
.lead{margin-top:20px;max-width:56ch;opacity:.78;line-height:1.9}
.center{text-align:center}.center .h2,.center .lead{margin-inline:auto}
.forged{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:color-mix(in srgb,var(--accent2) 34%,transparent);margin-top:56px;border:1px solid color-mix(in srgb,var(--accent2) 34%,transparent)}
@media(max-width:900px){.forged{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.forged{grid-template-columns:1fr}}
.forged article{background:var(--paper);padding:36px 30px;transition:background .5s ease,color .5s ease}
.tone .forged article{background:color-mix(in srgb,var(--panel) 52%,var(--paper))}
.forged article:hover{background:var(--deep);color:#F2EDE6}
.forged article:hover .n{color:var(--accent)}
.forged .n{font-family:var(--display);font-size:1.1rem;color:var(--accent2);display:block;margin-bottom:14px;letter-spacing:.14em}
.forged h3{font-family:var(--display);font-size:1.16rem;font-weight:600;margin-bottom:11px;letter-spacing:.01em}
.forged p{font-size:.93rem;opacity:.8;line-height:1.75}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,76px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.ironframe{position:relative;padding:14px;border:1px solid color-mix(in srgb,var(--accent2) 50%,transparent)}
.ironframe::before,.ironframe::after{content:"";position:absolute;width:16px;height:16px;rotate:45deg;background:var(--accent2)}
.ironframe::before{left:-8px;top:-8px}.ironframe::after{right:-8px;bottom:-8px}
.ironframe .media{aspect-ratio:4/3}
.quote{max-width:36ch;margin-inline:auto;text-align:center}
.quote p{font-family:var(--display);font-size:clamp(1.15rem,2.2vw,1.75rem);line-height:1.5;font-weight:500}
.quote cite{display:block;margin-top:24px;font-family:var(--text);font-style:normal;font-size:.78rem;letter-spacing:.22em;text-transform:uppercase;opacity:.62}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:color-mix(in srgb,var(--accent2) 34%,transparent);margin-top:52px;border:1px solid color-mix(in srgb,var(--accent2) 34%,transparent)}
.figs div{background:var(--deep);padding:30px 20px;text-align:center}
.figs b{font-family:var(--display);font-size:clamp(1.2rem,2.4vw,1.9rem);color:var(--accent);display:block}
.figs span{font-size:.78rem;opacity:.7;margin-top:8px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.gates{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:52px}
.gates figure{margin:0;overflow:hidden;position:relative;border:1px solid color-mix(in srgb,var(--accent2) 40%,transparent)}
.gates img{width:100%;aspect-ratio:3/4;object-fit:cover;transition:transform 1.1s cubic-bezier(.2,.8,.2,1),filter .6s}
.gates figure:hover img{transform:scale(1.06);filter:brightness(1.08)}
.gates figcaption{position:absolute;left:0;right:0;bottom:0;padding:14px 16px;background:linear-gradient(0deg,rgba(0,0,0,.85),transparent);color:#F2EDE6;font-family:var(--display);font-size:.78rem;letter-spacing:.08em}
@media(max-width:760px){.gates{grid-template-columns:1fr 1fr}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:color-mix(in srgb,var(--accent2) 30%,transparent);margin-top:48px;border:1px solid color-mix(in srgb,var(--accent2) 30%,transparent)}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{background:var(--paper);padding:30px 26px}
.tone .info>div{background:color-mix(in srgb,var(--panel) 52%,var(--paper))}
.info h4{font-family:var(--display);font-size:.78rem;letter-spacing:.22em;text-transform:uppercase;color:var(--accent2);margin-bottom:18px}
.info li,.info p{padding:8px 0;font-size:.94rem;border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#F2EDE6;padding-top:0}
.gate{display:flex;gap:12px;align-items:end;padding:0 var(--gut);height:92px}
.gate i{flex:1;background:linear-gradient(0deg,color-mix(in srgb,var(--accent2) 70%,transparent),transparent);position:relative;height:100%}
.gate i::after{content:"";position:absolute;left:50%;top:0;translate:-50% -50%;width:11px;height:11px;rotate:45deg;background:var(--accent2)}
.fin{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:44px;padding:clamp(52px,6vw,94px) 0 38px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-family:var(--display);font-size:.78rem;letter-spacing:.22em;text-transform:uppercase;color:var(--accent);margin-bottom:18px}
.fin li{padding:7px 0;opacity:.84;font-size:.94rem}
.footmark{--logo-hf:62px;margin-bottom:22px;display:block}
.fbot{border-top:1px solid color-mix(in srgb,var(--accent2) 40%,transparent);padding:20px 0 40px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-family:var(--display);font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;opacity:.66}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Fencing', '#services'], ['About', '#story'], ['Gallery', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Call now</a>
</header>
<main id="main">
<section class="hero" id="top">
  <div class="hero-bg" data-par="26">${heroImg(site, 0)}</div>
  <div class="heat" aria-hidden="true"></div>
  <div class="hero-in wrap">
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <span data-rv="scale">${inkmark(site, 'heromark')}</span>
    <h1 data-rv="up">${esc(site.headline)}</h1>
    <div class="finial" data-rv="scale"></div>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#visit">${esc(site.ctaSecondary)}</a></div>
  </div>
</section>
<div class="scroll-rule" aria-hidden="true"><svg viewBox="0 0 400 34" preserveAspectRatio="none"><path d="M0 17 q12 -14 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0"/></svg></div>
<section class="center" id="services"><div class="wrap">
  <span class="kick" data-rv="down">Our services</span>
  <h2 class="h2" data-rv="up" data-vanish>Vinyl, chain link, wood, aluminum and iron</h2>
  <div class="forged">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 70}" style="text-align:left"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section class="tone" id="story"><div class="wrap two">
  <figure class="ironframe" data-rv="left" data-par="20"><div class="media">${img(site, 1)}</div></figure>
  <div><span class="kick" data-rv="down">About Patriot</span>
    <h2 class="h2" data-rv="right" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="right">${esc(site.story.body)}</p>
    <div style="margin-top:32px" data-rv="up"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
</div></section>
<section class="dark center"><div class="wrap">
  <span class="kick" data-rv="down">What customers say</span>
  <blockquote class="quote" data-rv="blur"><p>${esc(site.quote.text)}</p><cite>${esc(site.quote.who)}</cite></blockquote>
  <div class="figs">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
</div></section>
<section id="gallery"><div class="wrap">
  <span class="kick" data-rv="down">Recent work</span>
  <h2 class="h2" data-rv="up" data-vanish>${esc(site.feature.title)}</h2>
  <p class="lead" data-rv="up">${esc(site.feature.body)}</p>
  <div class="gates">${[2, 3, 4].map((i, k) => `<figure data-rv="up" data-delay="${k * 120}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="900" height="1200"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone" id="visit"><div class="wrap">
  <span class="kick" data-rv="down">Contact Patriot</span>
  <h2 class="h2" data-rv="up">Visit or call ${esc(site.short)}</h2>
  <div class="info">
    <div data-rv="up"><h4>Reach us</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="180"><h4>Services</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer>
  <div class="gate" aria-hidden="true">${Array.from({ length: 14 }, () => '<i></i>').join('')}</div>
  <div class="wrap"><div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.84;max-width:34ch;line-height:1.85">${esc(site.closing)}</p></div>
    <div><h4>Fencing</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li><li>${esc(site.city)}</li></ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>Financing available</span></div></div>
</footer>`,
});

/* =========================================================== 19. CASE FILE
   A case-file deck: cards stack, then fan out on scroll, tabbed dividers,
   stamped labels. Footer: a row of file tabs holding the details. */
const caseFile = site => ({
  fonts: ['Instrument+Serif:ital@0;1', 'Inter:wght@400;500;600;700'],
  display: "'Instrument Serif',Georgia,serif", text: "'Inter',system-ui,sans-serif",
  radius: '10px', border: '1px', particles: 'dust',
  css: `
body{background:var(--paper)}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:12px var(--gut);
  background:color-mix(in srgb,var(--paper) 90%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid color-mix(in srgb,var(--ink) 12%,transparent)}
.hd nav{display:flex;gap:26px;justify-content:center;font-weight:500;font-size:.9rem}
.hd nav a:hover{color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{padding:clamp(54px,7vw,104px) 0;position:relative}
.hero-in{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(30px,5vw,70px);align-items:center}
@media(max-width:900px){.hero-in{grid-template-columns:1fr}}
.hero h1{font-family:var(--display);font-size:clamp(2.5rem,6vw,5.2rem);font-weight:400;letter-spacing:-.02em;max-width:15ch;line-height:1.02}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:22px}
.hero p{margin-top:22px;max-width:52ch;opacity:.78;line-height:1.8}
.hero .cta{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.deck{position:relative;height:clamp(340px,42vw,480px)}
.deck figure{position:absolute;inset:0;margin:0;border-radius:var(--r);overflow:hidden;border:6px solid var(--paper);
  box-shadow:0 30px 60px -34px color-mix(in srgb,var(--deep) 70%,transparent);
  transform:rotate(var(--rot)) translate(var(--tx),var(--ty));transition:transform .9s cubic-bezier(.2,.8,.2,1)}
.deck figure img{width:100%;height:100%;object-fit:cover}
.deck.fan figure:nth-child(1){--rot:-7deg;--tx:-9%;--ty:3%}
.deck.fan figure:nth-child(2){--rot:3deg;--tx:5%;--ty:-3%}
.deck.fan figure:nth-child(3){--rot:-1deg;--tx:0;--ty:0}
.deck figure{--rot:0deg;--tx:0;--ty:0}
.stamp{position:absolute;right:6%;top:6%;z-index:4;border:2px solid var(--accent);color:var(--accent);border-radius:6px;
  padding:9px 14px;font-weight:700;font-size:.74rem;letter-spacing:.18em;text-transform:uppercase;rotate:-8deg;background:color-mix(in srgb,var(--paper) 82%,transparent)}
section{padding:clamp(68px,9vw,126px) 0}
.tone{background:color-mix(in srgb,var(--panel) 34%,var(--paper))}
.dark{background:var(--deep);color:#fff}
.tabrow{display:flex;gap:6px;margin-bottom:-1px;flex-wrap:wrap}
.tabrow span{background:var(--accent);color:#fff;border-radius:8px 8px 0 0;padding:10px 20px;font-weight:600;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase}
.tabrow span+span{background:color-mix(in srgb,var(--ink) 12%,transparent);color:inherit}
h2.h2{font-family:var(--display);font-size:clamp(2rem,4.6vw,3.8rem);font-weight:400;letter-spacing:-.02em;max-width:20ch;line-height:1.06}
.lead{margin-top:18px;max-width:56ch;opacity:.78;line-height:1.8}
.folder{border:1px solid color-mix(in srgb,var(--ink) 14%,transparent);border-radius:0 var(--r) var(--r) var(--r);padding:clamp(28px,4vw,52px);background:var(--paper)}
.tone .folder{background:#fff}
.files{display:grid;grid-template-columns:repeat(2,1fr);gap:2px;background:color-mix(in srgb,var(--ink) 12%,transparent);margin-top:8px}
@media(max-width:760px){.files{grid-template-columns:1fr}}
.files article{background:var(--paper);padding:28px 26px;transition:background .4s ease,transform .5s cubic-bezier(.2,.8,.2,1)}
.tone .files article{background:#fff}
.files article:hover{background:var(--accent);color:#fff;transform:scale(1.015);z-index:2;position:relative}
.files article:hover .n{color:#fff;opacity:.7}
.files .n{font-family:var(--display);font-size:1.5rem;color:var(--accent);display:block;margin-bottom:10px}
.files h3{font-size:1.06rem;font-weight:600;margin-bottom:8px}
.files p{font-size:.93rem;opacity:.78;line-height:1.7}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,72px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.polaroid{background:#fff;padding:14px 14px 52px;border-radius:4px;box-shadow:0 26px 54px -30px color-mix(in srgb,var(--deep) 70%,transparent);rotate:-2deg;transition:rotate .6s ease}
.polaroid:hover{rotate:0deg}
.polaroid img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:2px}
.polaroid figcaption{margin-top:14px;font-family:var(--display);font-size:1.02rem;font-style:italic;color:#333}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:46px}
.figs div{border:1px solid color-mix(in srgb,#fff 20%,transparent);border-radius:var(--r);padding:26px 20px}
.figs b{font-family:var(--display);font-size:clamp(1.4rem,2.8vw,2.2rem);color:var(--accent);display:block;line-height:1}
.figs span{font-size:.78rem;opacity:.72;margin-top:8px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.sheets{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:50px}
.sheets figure{margin:0;background:#fff;padding:10px 10px 34px;border-radius:4px;box-shadow:0 22px 44px -30px color-mix(in srgb,var(--deep) 70%,transparent);position:relative;transition:transform .55s cubic-bezier(.2,.8,.2,1)}
.sheets figure:nth-child(odd){rotate:-1.6deg}
.sheets figure:nth-child(even){rotate:1.4deg}
.sheets figure:hover{rotate:0deg;transform:translateY(-8px)}
.sheets img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:2px}
.sheets figcaption{position:absolute;left:12px;right:12px;bottom:10px;font-size:.78rem;color:#444}
@media(max-width:760px){.sheets{grid-template-columns:1fr 1fr}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:color-mix(in srgb,var(--ink) 12%,transparent);margin-top:8px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{background:var(--paper);padding:28px 24px}
.tone .info>div{background:#fff}
.info h4{font-weight:600;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.94rem;border-bottom:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff;padding:clamp(52px,7vw,96px) 0 0}
.tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:44px}
.tabs>div{background:color-mix(in srgb,#fff 8%,transparent);border-radius:10px 10px 0 0;padding:22px 20px;border-top:4px solid var(--accent)}
.tabs>div:nth-child(2){border-top-color:var(--accent2)}
.tabs dt{font-size:.66rem;letter-spacing:.18em;text-transform:uppercase;opacity:.55}
.tabs dd{margin:8px 0 0;font-family:var(--display);font-size:1.06rem}
@media(max-width:820px){.tabs{grid-template-columns:1fr 1fr}}
.fin{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-weight:600;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;opacity:.56;margin-bottom:16px}
.fin li{padding:7px 0;opacity:.84;font-size:.94rem}
.footmark{--logo-hf:58px;margin-bottom:20px;display:block}
.fbot{padding:20px 0 40px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.82rem;opacity:.6}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['Injuries', '#story'], ['Office', '#gallery'], ['Schedule', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Schedule</a>
</header>
<main id="main">
<section class="hero" id="top"><div class="wrap hero-in">
  <div>
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <h1 data-rv="up">${esc(site.headline)}</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#visit">${esc(site.ctaSecondary)}</a></div>
  </div>
  <div class="deck" data-rv="scale" id="deck">
    <span class="stamp">Open 7 days</span>
    ${[0, 1, 2].map(i => `<figure>${i === 0 ? heroImg(site, i) : img(site, i)}</figure>`).join('')}
  </div>
</div></section>
<section id="services"><div class="wrap">
  <div class="tabrow" data-rv="right"><span>What we offer</span><span>Case types</span></div>
  <div class="folder">
    <h2 class="h2" data-rv="up" data-vanish>Accident, injury and workers comp care</h2>
    <div class="files">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 60}"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
  </div>
</div></section>
<section class="tone" id="story"><div class="wrap two">
  <figure class="polaroid" data-rv="left" data-par="18"><img src="assets/${site.images[3]}" alt="${attr(site.alts[3])}" loading="lazy" decoding="async" width="1200" height="900"><figcaption>${esc(site.alts[3])}</figcaption></figure>
  <div><h2 class="h2" data-rv="right" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="right">${esc(site.story.body)}</p>
    <div style="margin-top:30px" data-rv="up"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
</div></section>
<section class="dark"><div class="wrap">
  <h2 class="h2" data-rv="up">${esc(site.feature.title)}</h2>
  <p class="lead" data-rv="up" style="opacity:.86">${esc(site.feature.body)}</p>
  <div class="figs">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
</div></section>
<section id="gallery"><div class="wrap">
  <h2 class="h2" data-rv="up" data-vanish>Inside ${esc(site.short)}</h2>
  <div class="sheets">${[4, 5, 0].map((i, k) => `<figure data-rv="up" data-delay="${k * 110}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="1200" height="900"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone" id="visit"><div class="wrap">
  <div class="tabrow" data-rv="right"><span>Schedule</span><span>Contact</span></div>
  <div class="folder">
    <h2 class="h2" data-rv="up">Schedule your appointment</h2>
    <div class="info">
      <div data-rv="up"><h4>Contact</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
      <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
      <div data-rv="up" data-delay="180"><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
    </div>
  </div>
</div></section>
</main>
<footer><div class="wrap">
  <div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.84;max-width:34ch;line-height:1.8">${esc(site.closing)}</p></div>
    <div><h4>Services</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <dl class="tabs">
    <div><dt>Practice</dt><dd>${esc(site.short)}</dd></div>
    <div><dt>Address</dt><dd>${esc(site.address)}</dd></div>
    <div><dt>Phone</dt><dd>${esc(site.tel)}</dd></div>
    <div><dt>Open</dt><dd>Seven days</dd></div>
  </dl>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</div></footer>`,
  extraJs: `(function(){var d=document.getElementById('deck');if(!d)return;
  new IntersectionObserver(function(e){if(e[0].isIntersecting)d.classList.add('fan');},{threshold:.4}).observe(d);})();`,
});

/* =========================================================== 20. ONE ON ONE
   Editorial split-screen: giant numerals, a hard vertical wipe between panes,
   one idea per screen. Footer: a session card with the booking details. */
const oneOnOne = site => ({
  fonts: ['Syne:wght@400;600;700;800', 'Work+Sans:wght@400;500;600;700'],
  display: "'Syne',system-ui,sans-serif", text: "'Work Sans',system-ui,sans-serif",
  radius: '0px', border: '2px', particles: 'sparkle',
  css: `
body{background:var(--paper)}
.btn{border-radius:0}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:12px var(--gut);
  background:var(--paper);border-bottom:2px solid var(--ink)}
.hd nav{display:flex;gap:26px;justify-content:center;font-weight:600;font-size:.9rem}
.hd nav a:hover{color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{display:grid;grid-template-columns:1fr 1fr;min-height:90svh;border-bottom:2px solid var(--ink)}
@media(max-width:900px){.hero{grid-template-columns:1fr}}
.hero-t{padding:clamp(46px,6vw,96px) var(--gut);display:grid;align-content:center;border-right:2px solid var(--ink)}
@media(max-width:900px){.hero-t{border-right:0;border-bottom:2px solid var(--ink)}}
.hero h1{font-family:var(--display);font-size:clamp(2.4rem,5.4vw,4.6rem);font-weight:800;letter-spacing:-.045em;line-height:.98;max-width:14ch}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:22px}
.hero p{margin-top:22px;max-width:48ch;opacity:.78;line-height:1.8}
.hero .cta{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.hero-m{position:relative;overflow:hidden;min-height:52svh}
.hero-m img{width:100%;height:100%;object-fit:cover}
.wipe{position:absolute;inset:0;background:var(--accent);z-index:2;animation:wipe 1.15s cubic-bezier(.76,0,.24,1) forwards;transform-origin:right}
@keyframes wipe{to{transform:scaleX(0)}}
section{padding:clamp(70px,9vw,130px) 0;border-bottom:2px solid var(--ink)}
.dark{background:var(--deep);color:#fff;border-color:#fff}
.accent{background:var(--accent);color:#fff;border-color:#fff}
.bignum{font-family:var(--display);font-weight:800;font-size:clamp(4rem,16vw,13rem);line-height:.8;letter-spacing:-.06em;color:color-mix(in srgb,var(--accent) 22%,transparent);display:block;margin-bottom:-.16em}
.dark .bignum,.accent .bignum{color:color-mix(in srgb,#fff 24%,transparent)}
h2.h2{font-family:var(--display);font-size:clamp(1.9rem,4.6vw,3.8rem);font-weight:800;letter-spacing:-.04em;max-width:18ch;line-height:1.02}
.lead{margin-top:20px;max-width:56ch;opacity:.8;line-height:1.85;font-size:1.04rem}
.rows{margin-top:52px;border-top:2px solid currentColor}
.rows article{display:grid;grid-template-columns:88px 1.1fr 2fr;gap:24px;padding:26px 0;border-bottom:2px solid currentColor;align-items:baseline;
  transition:padding-left .45s cubic-bezier(.2,.8,.2,1),background .4s}
.rows article:hover{padding-left:20px;background:color-mix(in srgb,currentColor 6%,transparent)}
.rows .n{font-family:var(--display);font-weight:800;font-size:1.4rem;opacity:.4}
.rows h3{font-family:var(--display);font-weight:700;font-size:1.2rem;letter-spacing:-.02em}
.rows p{font-size:.95rem;opacity:.78;line-height:1.75}
@media(max-width:820px){.rows article{grid-template-columns:56px 1fr}.rows p{grid-column:2/-1}}
.split{display:grid;grid-template-columns:1fr 1fr;border-block:2px solid var(--ink)}
.split.on-dark{border-color:#fff}
@media(max-width:900px){.split{grid-template-columns:1fr}}
.split .pane{padding:clamp(30px,4vw,64px)}
.split .media{border-left:2px solid currentColor;aspect-ratio:1}
@media(max-width:900px){.split .media{border-left:0;border-top:2px solid currentColor}}
.figs{display:grid;grid-template-columns:repeat(4,1fr);border:2px solid currentColor;margin-top:48px}
.figs div{padding:26px 20px;border-right:2px solid currentColor}
.figs div:last-child{border-right:0}
.figs b{font-family:var(--display);font-weight:800;font-size:clamp(1.3rem,2.6vw,2.1rem);display:block;color:var(--accent)}
.dark .figs b,.accent .figs b{color:#fff}
.figs span{font-size:.78rem;opacity:.74;margin-top:8px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}.figs div:nth-child(2){border-right:0}}
.strip{display:grid;grid-template-columns:repeat(4,1fr);border:2px solid currentColor;margin-top:50px}
.strip figure{margin:0;position:relative;overflow:hidden;border-right:2px solid currentColor}
.strip figure:last-child{border-right:0}
.strip img{width:100%;aspect-ratio:3/4;object-fit:cover;filter:grayscale(1);transition:filter .5s,transform .9s cubic-bezier(.2,.8,.2,1)}
.strip figure:hover img{filter:none;transform:scale(1.06)}
.strip figcaption{position:absolute;left:0;right:0;bottom:0;padding:12px;background:var(--accent);color:#fff;font-size:.76rem;font-weight:600;transform:translateY(101%);transition:transform .4s}
.strip figure:hover figcaption{transform:none}
@media(max-width:760px){.strip{grid-template-columns:1fr 1fr}}
.info{display:grid;grid-template-columns:repeat(3,1fr);border:2px solid currentColor;margin-top:46px}
.info>div{padding:30px 26px;border-right:2px solid currentColor}
.info>div:last-child{border-right:0}
@media(max-width:820px){.info{grid-template-columns:1fr}.info>div{border-right:0;border-bottom:2px solid currentColor}}
.info h4{font-family:var(--display);font-weight:700;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.94rem}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff;padding:clamp(52px,7vw,96px) 0 40px}
.card{border:2px solid #fff;padding:clamp(26px,4vw,46px);display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:34px;margin-bottom:44px}
@media(max-width:880px){.card{grid-template-columns:1fr}}
.card h4{font-family:var(--display);font-weight:700;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent2);margin-bottom:14px}
.card li,.card p{padding:6px 0;font-size:.94rem;opacity:.88}
.footmark{--logo-hf:58px;margin-bottom:18px;display:block}
.fbot{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.82rem;opacity:.62}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['What we do', '#services'], ['Philosophy', '#story'], ['Studio', '#gallery'], ['Book', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Book</a>
</header>
<main id="main">
<section class="hero" id="top" style="padding:0">
  <div class="hero-t">
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <h1 data-rv="up">${esc(site.headline)}</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#visit">${esc(site.ctaSecondary)}</a></div>
  </div>
  <div class="hero-m"><span class="wipe" aria-hidden="true"></span>${heroImg(site, 0)}</div>
</section>
<section id="services"><div class="wrap">
  <span class="bignum">01</span>
  <h2 class="h2" data-rv="up" data-vanish>What we do</h2>
  <p class="lead" data-rv="up">Physical therapy and personal training, one patient at a time.</p>
  <div class="rows">${site.services.map((s, i) => `<article data-rv="right" data-delay="${i * 60}"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section class="dark" id="story" style="padding-bottom:0">
  <div class="wrap"><span class="bignum">02</span>
    <h2 class="h2" data-rv="up" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="up" style="opacity:.86">${esc(site.story.body)}</p>
    <div class="figs">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
  </div>
  <div class="split on-dark" style="margin-top:clamp(50px,6vw,90px)">
    <div class="pane"><h2 class="h2" style="font-size:clamp(1.5rem,3vw,2.4rem)" data-rv="left">${esc(site.feature.title)}</h2>
      <p class="lead" data-rv="left" style="opacity:.86">${esc(site.feature.body)}</p></div>
    <figure class="media" data-rv="right">${img(site, 1)}</figure>
  </div>
</section>
<section class="accent" id="gallery"><div class="wrap">
  <span class="bignum">03</span>
  <h2 class="h2" data-rv="up" data-vanish>Inside the studio</h2>
  <div class="strip">${[2, 3, 4, 5].map((i, k) => `<figure data-rv="up" data-delay="${k * 90}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="900" height="1200"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section id="visit"><div class="wrap">
  <span class="bignum">04</span>
  <h2 class="h2" data-rv="up">Book a session</h2>
  <div class="info">
    <div data-rv="up"><h4>Contact</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="180"><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer><div class="wrap">
  <div class="card">
    <div>${inkmark(site, 'footmark')}<p style="max-width:32ch;line-height:1.8">${esc(site.closing)}</p></div>
    <div><h4>Session</h4><ul><li>One hour, one patient</li><li>Licensed DPT</li><li>Cash based</li></ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li></ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</div></footer>`,
});

module.exports = { 'soft-arch': softArch, 'aqua-lane': aquaLane, 'forge-iron': forgeIron, 'case-file': caseFile, 'one-on-one': oneOnOne };
