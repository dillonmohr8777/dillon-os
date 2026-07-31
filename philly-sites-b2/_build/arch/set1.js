const K = require('../kernel');
const { esc, attr, telHref, mapHref, inkmark, img, heroImg, hoursList } = K;

/* ============================================================ 1. AURORA DRIFT
   Dark aurora hero, glass service cards with 3D tilt, horizontal scroll gallery,
   header that hides going down and returns going up. Footer: aurora glow slab. */
const auroraDrift = site => ({
  fonts: ['Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800', 'Manrope:wght@400;500;700;800'],
  display: "'Fraunces',Georgia,serif", text: "'Manrope',system-ui,sans-serif",
  radius: '26px', border: '1px', particles: 'ink',
  css: `
body{background:var(--deep);color:#EAF2F6}
.aur{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;opacity:.85}
.aur i{position:absolute;display:block;border-radius:50%;filter:blur(90px);opacity:.5;animation:drift 26s ease-in-out infinite alternate}
.aur i:nth-child(1){width:60vw;height:60vw;left:-14vw;top:-18vw;background:var(--accent)}
.aur i:nth-child(2){width:52vw;height:52vw;right:-16vw;top:12vh;background:var(--accent2);animation-duration:34s}
.aur i:nth-child(3){width:44vw;height:44vw;left:24vw;bottom:-20vh;background:color-mix(in srgb,var(--accent2) 60%,#fff);animation-duration:41s}
@keyframes drift{to{transform:translate3d(8vw,-6vh,0) scale(1.22)}}
main,header,footer{position:relative;z-index:1}
.hd{position:fixed;top:14px;left:50%;translate:-50% 0;z-index:100;display:flex;align-items:center;gap:26px;padding:9px 12px 9px 20px;border-radius:999px;transition:translate .45s cubic-bezier(.2,.8,.2,1),opacity .35s ease}
.hd.hide{translate:-50% -140%;opacity:0}
.hd nav{display:flex;gap:20px;font-weight:700;font-size:.86rem}
.hd nav a{opacity:.78}.hd nav a:hover{opacity:1;color:var(--accent2)}
.hd .btn{min-height:44px;padding:0 20px;font-size:.84rem}
@media(max-width:900px){.hd nav{display:none}}
.hero{min-height:100svh;display:grid;place-items:center;text-align:center;padding:132px 0 90px}
.hero h1{font-size:clamp(2.9rem,6.4vw,6rem);font-weight:600;letter-spacing:-.03em;max-width:16ch;margin-inline:auto}
.hero .eyebrow{color:var(--accent2);margin-bottom:26px;display:block}
.hero p{max-width:60ch;margin:26px auto 0;opacity:.8;font-size:clamp(1rem,1.3vw,1.16rem)}
.hero .cta{display:flex;gap:14px;justify-content:center;margin-top:38px;flex-wrap:wrap}
.hero .btn.ghost{color:#EAF2F6}
.heromark{--logo-hh:clamp(76px,10vw,132px);margin-bottom:34px;display:block}
.ribbon{overflow:hidden;border-block:1px solid color-mix(in srgb,#fff 14%,transparent);padding:16px 0;background:color-mix(in srgb,#000 22%,transparent)}
.ribbon ul{display:flex;gap:56px;width:max-content;animation:slide 42s linear infinite;font:700 .82rem/1 var(--text);letter-spacing:.2em;text-transform:uppercase;opacity:.7}
.ribbon li::before{content:"◆";color:var(--accent2);margin-right:18px}
@keyframes slide{to{transform:translateX(-50%)}}
section{padding:clamp(84px,11vw,150px) 0}
.h2{font-size:clamp(2.1rem,4.4vw,3.9rem);font-weight:600;letter-spacing:-.025em;max-width:20ch}
.lead{opacity:.74;max-width:56ch;margin-top:20px;font-size:1.05rem}
.svc{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:56px}
.svc article{padding:34px 30px 30px;border-radius:var(--r)}
.svc article:nth-child(even){transform:translateY(26px)}
.svc h3{font-size:1.3rem;font-weight:600;margin-bottom:12px}
.svc p{opacity:.72;font-size:.95rem}
.svc .n{font:700 .74rem/1 var(--text);letter-spacing:.2em;color:var(--accent2);display:block;margin-bottom:18px}
@media(max-width:760px){.svc article:nth-child(even){transform:none}}
.split{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(30px,5vw,80px);align-items:center}
@media(max-width:900px){.split{grid-template-columns:1fr}}
.split .media{border-radius:var(--r);aspect-ratio:4/5}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:color-mix(in srgb,#fff 12%,transparent);border-radius:var(--r);overflow:hidden}
.stats div{background:color-mix(in srgb,var(--deep) 88%,#000);padding:32px 22px}
.stats b{display:block;font-family:var(--display);font-size:clamp(1.5rem,2.6vw,2.3rem);font-weight:600;color:var(--accent2)}
.stats span{font-size:.82rem;opacity:.66;margin-top:8px;display:block}
@media(max-width:820px){.stats{grid-template-columns:repeat(2,1fr)}}
.rail{overflow:hidden;margin-top:52px}
.rail-in{display:flex;gap:18px;transform:translateX(calc(var(--s,0) * -22%));transition:transform .1s linear}
.rail figure{flex:0 0 min(420px,74vw);margin:0}
.rail .media{aspect-ratio:4/3;border-radius:var(--r)}
.rail figcaption{margin-top:12px;font-size:.82rem;opacity:.6;letter-spacing:.06em}
.feat{border-radius:calc(var(--r) + 10px);padding:clamp(36px,5vw,70px);display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:center}
@media(max-width:900px){.feat{grid-template-columns:1fr}}
.feat .media{border-radius:var(--r);aspect-ratio:5/4}
.visit{display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(28px,4vw,64px)}
@media(max-width:900px){.visit{grid-template-columns:1fr}}
.vrow{display:flex;justify-content:space-between;gap:20px;padding:22px 0;border-bottom:1px solid color-mix(in srgb,#fff 12%,transparent)}
.vrow span:first-child{font:700 .74rem/1 var(--text);letter-spacing:.2em;text-transform:uppercase;opacity:.55;padding-top:5px}
.vrow a,.vrow p{font-family:var(--display);font-size:1.16rem}
.hrs li{display:flex;justify-content:space-between;padding:13px 0;border-bottom:1px solid color-mix(in srgb,#fff 9%,transparent);font-size:.92rem}
.hrs li span:first-child{opacity:.6}
.close{text-align:center}
.close h2{font-size:clamp(2.2rem,5.4vw,4.6rem);font-weight:600;letter-spacing:-.03em;max-width:18ch;margin-inline:auto}
footer{padding:clamp(70px,9vw,120px) 0 44px;border-top:1px solid color-mix(in srgb,#fff 12%,transparent);position:relative;overflow:hidden}
footer::before{content:"";position:absolute;left:50%;top:-160px;width:120vw;height:320px;translate:-50% 0;background:radial-gradient(closest-side,color-mix(in srgb,var(--accent2) 42%,transparent),transparent);filter:blur(30px);pointer-events:none}
.fgrid{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:44px}
@media(max-width:860px){.fgrid{grid-template-columns:1fr}}
.fgrid h4{font:700 .74rem/1 var(--text);letter-spacing:.2em;text-transform:uppercase;opacity:.5;margin-bottom:18px}
.fgrid li{padding:7px 0;font-size:.94rem;opacity:.8}
.fgrid li a:hover{color:var(--accent2)}
.fbot{margin-top:56px;padding-top:26px;border-top:1px solid color-mix(in srgb,#fff 10%,transparent);display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;font-size:.82rem;opacity:.55}
.footmark{--logo-hf:60px;margin-bottom:20px;display:block}`,
  body: `
<div class="aur" aria-hidden="true"><i></i><i></i><i></i></div>
<header class="hd lg" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['Practice', '#story'], ['Inside', '#gallery'], ['Visit', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Call now</a>
</header>
<main id="main">
<section class="hero" id="top"><div class="wrap">
  <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
  <span data-rv="scale">${inkmark(site, 'heromark')}</span>
  <h1 data-rv="blur">${esc(site.headline)}</h1>
  <p data-rv="up">${esc(site.sub)}</p>
  <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.ctaSecondary)}</a></div>
</div></section>
<div class="ribbon" aria-hidden="true"><ul>${[...site.services, ...site.services].map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
<section id="services"><div class="wrap">
  <h2 class="h2" data-rv="up" data-vanish>What we do</h2>
  <p class="lead" data-rv="up">Chiropractic care built around the person in the room.</p>
  <div class="svc">${site.services.map((s, i) => `<article class="lg tilt3d" data-rv="up" data-delay="${i * 80}"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section id="story"><div class="wrap split">
  <div><h2 class="h2" data-rv="left" data-vanish>${esc(site.story.title)}</h2><p class="lead" data-rv="left">${esc(site.story.body)}</p>
  <div style="margin-top:34px" data-rv="up"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
  <figure class="media" data-rv="scale" data-par="26">${img(site, 0)}</figure>
</div></section>
<section><div class="wrap">
  <div class="stats" data-rv="up">${site.proof.map(p => `<div><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
</div></section>
<section id="gallery"><div class="wrap"><h2 class="h2" data-rv="up" data-vanish>Inside ${esc(site.short)}</h2></div>
  <div class="rail wrap" data-scrub><div class="rail-in">${[1, 2, 3, 4].map(i => `<figure><div class="media">${img(site, i)}</div><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div></div>
</section>
<section id="feature"><div class="wrap"><div class="feat lg" data-rv="up">
  <div><h2 class="h2">${esc(site.feature.title)}</h2><p class="lead">${esc(site.feature.body)}</p></div>
  <figure class="media">${img(site, 5)}</figure>
</div></div></section>
<section id="visit"><div class="wrap visit">
  <div data-rv="left"><h2 class="h2">Visit ${esc(site.short)}</h2>
    ${K.visitRows(site).map(r => `<div class="vrow"><span>${esc(r[0])}</span><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></div>`).join('')}
  </div>
  <div data-rv="right"><h4 class="eyebrow" style="opacity:.5;margin-bottom:16px;display:block">Hours</h4>${hoursList(site, 'hrs')}</div>
</div></section>
<section class="close"><div class="wrap">
  <h2 data-rv="blur">${esc(site.closing)}</h2>
  <div style="margin-top:36px" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a></div>
</div></section>
</main>
<footer><div class="wrap">
  <div class="fgrid">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.7;max-width:38ch;font-size:.95rem">${esc(site.sub)}</p></div>
    <div><h4>Explore</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li></ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</div></footer>`,
  extraJs: `(function(){var h=document.querySelector('.hd'),last=0;addEventListener('scroll',function(){var y=scrollY;h.classList.toggle('hide',y>last&&y>360);last=y;},{passive:true});})();`,
});

/* ============================================================ 2. ZEN STRATA
   Horizontal strata bands sliding from alternating sides, rice-paper texture,
   hairline rules, expanding service rows. Footer: stacked offset paper sheets. */
const zenStrata = site => ({
  fonts: ['Cormorant+Garamond:wght@300;400;500;600', 'Jost:wght@300;400;500;600'],
  display: "'Cormorant Garamond',Georgia,serif", text: "'Jost',system-ui,sans-serif",
  radius: '2px', border: '1px', particles: 'mist',
  css: `
body{background:var(--paper);
  background-image:radial-gradient(color-mix(in srgb,var(--ink) 5%,transparent) 1px,transparent 1px);background-size:4px 4px}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:26px;padding:16px var(--gut);
  background:color-mix(in srgb,var(--paper) 84%,transparent);backdrop-filter:blur(14px);transition:padding .4s ease,box-shadow .4s ease}
.hd.is-stuck{padding-block:10px;box-shadow:0 1px 0 color-mix(in srgb,var(--ink) 12%,transparent)}
.hd nav{display:flex;gap:30px;justify-content:center;font-size:.82rem;letter-spacing:.14em;text-transform:uppercase;font-weight:400}
.hd nav a{position:relative;padding-bottom:3px}
.hd nav a::after{content:"";position:absolute;left:0;bottom:0;height:1px;width:0;background:var(--accent);transition:width .45s cubic-bezier(.2,.8,.2,1)}
.hd nav a:hover::after{width:100%}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{display:grid;grid-template-columns:1fr 1fr;min-height:88svh;align-items:center;gap:0}
@media(max-width:900px){.hero{grid-template-columns:1fr}}
.hero-t{padding:clamp(50px,7vw,110px) var(--gut)}
.hero h1{font-size:clamp(2.9rem,6vw,5.6rem);font-weight:300;letter-spacing:-.02em;line-height:1.02}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:30px;font-weight:500}
.hero p{margin-top:26px;max-width:46ch;font-weight:300;font-size:1.06rem;line-height:1.75;color:color-mix(in srgb,var(--ink) 76%,transparent)}
.hero .cta{display:flex;gap:12px;margin-top:38px;flex-wrap:wrap}
.hero-m{position:relative;height:100%;min-height:60svh;overflow:hidden}
.hero-m img{width:100%;height:100%;object-fit:cover}
.hero-m::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--paper),transparent 34%)}
.veil{position:absolute;inset:0;display:flex;z-index:2}
.veil i{flex:1;background:var(--paper);transform-origin:bottom;animation:lift 1.5s cubic-bezier(.7,0,.2,1) forwards}
.veil i:nth-child(2){animation-delay:.11s}.veil i:nth-child(3){animation-delay:.22s}.veil i:nth-child(4){animation-delay:.33s}.veil i:nth-child(5){animation-delay:.44s}
@keyframes lift{to{transform:scaleY(0)}}
.strata{padding:clamp(80px,10vw,140px) 0;position:relative}
.strata + .strata{border-top:1px solid color-mix(in srgb,var(--ink) 12%,transparent)}
.tone{background:color-mix(in srgb,var(--panel) 60%,var(--paper))}
.dark{background:var(--deep);color:color-mix(in srgb,var(--paper) 94%,#fff)}
.dark .rule{background:color-mix(in srgb,#fff 20%,transparent)}
h2.h2{font-size:clamp(2rem,4.2vw,3.6rem);font-weight:300;letter-spacing:-.02em;max-width:22ch}
.kick{display:flex;align-items:center;gap:16px;margin-bottom:26px;color:var(--accent);font-size:.74rem;letter-spacing:.24em;text-transform:uppercase}
.kick::after{content:"";flex:1;height:1px;background:currentColor;opacity:.4}
.rows{margin-top:56px;border-top:1px solid color-mix(in srgb,var(--ink) 14%,transparent)}
.rows details{border-bottom:1px solid color-mix(in srgb,var(--ink) 14%,transparent)}
.rows summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:56px 1fr 28px;gap:20px;align-items:baseline;padding:26px 0;transition:padding-left .45s ease,color .3s ease}
.rows summary::-webkit-details-marker{display:none}
.rows summary:hover{padding-left:14px;color:var(--accent)}
.rows summary i{font-style:normal;font-size:.76rem;letter-spacing:.16em;opacity:.5}
.rows summary b{font-family:var(--display);font-size:clamp(1.3rem,2.4vw,2rem);font-weight:400}
.rows summary em{font-style:normal;justify-self:end;transition:transform .4s ease}
.rows details[open] summary em{transform:rotate(45deg)}
.rows p{padding:0 0 30px 76px;max-width:62ch;font-weight:300;line-height:1.8;color:color-mix(in srgb,var(--ink) 72%,transparent)}
@media(max-width:640px){.rows p{padding-left:0}}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,80px);align-items:center}
@media(max-width:880px){.two{grid-template-columns:1fr}}
.plate{position:relative;overflow:hidden}
.plate img{aspect-ratio:3/4;object-fit:cover;width:100%}
.plate::after{content:"";position:absolute;inset:0;border:1px solid color-mix(in srgb,var(--paper) 60%,transparent);margin:16px;pointer-events:none}
.qbig{font-family:var(--display);font-size:clamp(1.6rem,3.2vw,2.7rem);font-weight:300;line-height:1.3;max-width:24ch;font-style:italic}
.layers{display:grid;gap:12px;margin-top:56px}
.layers figure{margin:0;position:relative;overflow:hidden;height:clamp(180px,26vw,300px)}
.layers img{width:100%;height:100%;object-fit:cover;transform:scale(1.08);transition:transform 1.4s cubic-bezier(.2,.8,.2,1)}
.layers figure:hover img{transform:scale(1)}
.layers figcaption{position:absolute;left:22px;bottom:18px;color:#fff;font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;text-shadow:0 2px 14px rgba(0,0,0,.6)}
.layers figure::before{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.5),transparent 55%);z-index:1}
.grid3{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:color-mix(in srgb,var(--ink) 14%,transparent);margin-top:48px}
.grid3 div{background:var(--paper);padding:34px 24px}
.grid3 b{display:block;font-family:var(--display);font-size:2rem;font-weight:400;color:var(--accent)}
.grid3 span{display:block;margin-top:8px;font-size:.84rem;font-weight:300;opacity:.7}
@media(max-width:760px){.grid3{grid-template-columns:repeat(2,1fr)}}
.info{display:grid;grid-template-columns:1fr 1fr 1fr;gap:44px}
@media(max-width:880px){.info{grid-template-columns:1fr}}
.info h4{font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;opacity:.55;margin-bottom:20px;font-family:var(--text);font-weight:500}
.info li,.info p{padding:9px 0;font-weight:300;border-bottom:1px solid color-mix(in srgb,currentColor 12%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:16px}
footer{background:var(--deep);color:color-mix(in srgb,var(--paper) 92%,#fff);padding-top:0}
.sheets{position:relative;height:96px}
.sheets i{position:absolute;left:0;right:0;height:56px;background:var(--paper);opacity:.1}
.sheets i:nth-child(1){top:0;transform:skewY(-.9deg)}
.sheets i:nth-child(2){top:22px;opacity:.06;transform:skewY(.7deg)}
.sheets i:nth-child(3){top:44px;opacity:.03;transform:skewY(-.4deg)}
.fin{padding:clamp(56px,7vw,100px) 0 42px;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:44px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;opacity:.5;margin-bottom:18px;font-family:var(--text)}
.fin li{padding:8px 0;font-weight:300;opacity:.82}
.fin li a:hover{color:var(--accent2)}
.footmark{--logo-hf:56px;margin-bottom:20px;display:block}
.fbot{border-top:1px solid color-mix(in srgb,#fff 14%,transparent);padding:24px 0 40px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;font-size:.78rem;opacity:.6;letter-spacing:.08em}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['Approach', '#story'], ['Clinic', '#gallery'], ['Visit', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Book a visit</a>
</header>
<main id="main">
<section class="hero" id="top">
  <div class="hero-t">
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <h1 data-rv="up">${esc(site.headline)}</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#services">${esc(site.ctaSecondary)}</a></div>
  </div>
  <div class="hero-m"><div class="veil" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>${heroImg(site, 0)}</div>
</section>
<section class="strata" id="services"><div class="wrap">
  <div class="kick" data-rv="right">Services</div>
  <h2 class="h2" data-rv="up" data-vanish>Care that begins with the whole picture</h2>
  <div class="rows">${site.services.map((s, i) => `<details${i === 0 ? ' open' : ''} data-rv="up" data-delay="${i * 60}"><summary><i>0${i + 1}</i><b>${esc(s[0])}</b><em>+</em></summary><p>${esc(s[1])}</p></details>`).join('')}</div>
</div></section>
<section class="strata tone" id="story"><div class="wrap two">
  <figure class="plate" data-rv="left" data-par="20">${img(site, 1)}</figure>
  <div><div class="kick" data-rv="right">The practice</div><h2 class="h2" data-rv="right" data-vanish>${esc(site.story.title)}</h2>
  <p style="margin-top:24px;font-weight:300;line-height:1.85;max-width:52ch" data-rv="right">${esc(site.story.body)}</p>
  <div class="grid3">${site.proof.map(p => `<div data-rv="scale"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div></div>
</div></section>
<section class="strata dark"><div class="wrap two">
  <div><div class="kick" data-rv="right" style="color:var(--accent2)">${esc(site.feature.title)}</div>
  <p class="qbig" data-rv="blur">${esc(site.feature.body)}</p></div>
  <figure class="plate" data-rv="scale">${img(site, 2)}</figure>
</div></section>
<section class="strata" id="gallery"><div class="wrap">
  <div class="kick" data-rv="right">Inside</div>
  <h2 class="h2" data-rv="up" data-vanish>Inside ${esc(site.short)}</h2>
  <div class="layers">${[3, 4, 5].map((i, k) => `<figure data-rv="clip" data-delay="${k * 130}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="1600" height="700"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="strata tone" id="visit"><div class="wrap">
  <div class="kick" data-rv="right">Visit</div>
  <h2 class="h2" data-rv="up" style="margin-bottom:52px">Visit ${esc(site.short)}</h2>
  <div class="info">
    <div data-rv="up"><h4>Contact</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="180"><h4>Explore</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
<section class="strata dark" style="text-align:center">
  <div class="wrap"><h2 class="h2" style="max-width:20ch;margin-inline:auto" data-rv="blur">${esc(site.closing)}</h2>
  <div style="margin-top:34px" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a></div></div>
</section>
</main>
<footer>
  <div class="sheets" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="wrap"><div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="font-weight:300;opacity:.75;max-width:36ch">${esc(site.address)}</p><p style="margin-top:10px"><a href="${telHref(site.tel)}">${esc(site.tel)}</a></p></div>
    <div><h4>Explore</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
    <div><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div></div>
</footer>`,
});

/* ======================================================= 3. KINETIC BLUEPRINT
   Drafting-table blueprint: grid paper, dimension lines that draw on scroll,
   spec-table services, plate captions. Footer: engineering title block. */
const kineticBlueprint = site => ({
  fonts: ['Archivo:wght@400;600;700;900', 'IBM+Plex+Mono:wght@400;500;600'],
  display: "'Archivo',system-ui,sans-serif", text: "'IBM Plex Mono',ui-monospace,monospace",
  radius: '0px', border: '1px', particles: 'dust',
  css: `
body{background:var(--paper);
  background-image:linear-gradient(color-mix(in srgb,var(--accent) 9%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--accent) 9%,transparent) 1px,transparent 1px);
  background-size:28px 28px}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;gap:20px;align-items:center;
  padding:12px var(--gut);border-bottom:1px solid var(--ink);background:color-mix(in srgb,var(--paper) 92%,transparent);backdrop-filter:blur(10px)}
.hd nav{display:flex;gap:26px;justify-content:center;font-size:.74rem;letter-spacing:.14em;text-transform:uppercase}
.hd nav a{border-bottom:1px solid transparent;padding-bottom:2px}
.hd nav a:hover{border-color:var(--accent);color:var(--accent)}
.hd .btn{border-radius:0;min-height:42px;font-family:var(--text);font-size:.76rem;letter-spacing:.1em;text-transform:uppercase}
@media(max-width:960px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.btn{border-radius:0}
.hero{padding:clamp(56px,8vw,110px) 0 0;position:relative}
.hero-grid{display:grid;grid-template-columns:1fr auto;gap:40px;align-items:end}
@media(max-width:900px){.hero-grid{grid-template-columns:1fr}}
.hero h1{font-size:clamp(2.5rem,5.6vw,5rem);font-weight:900;letter-spacing:-.035em;text-transform:uppercase;max-width:16ch}
.tag{font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:var(--accent);border:1px solid var(--accent);display:inline-block;padding:7px 13px;margin-bottom:28px}
.hero p{margin-top:24px;max-width:56ch;font-size:.94rem;line-height:1.85;color:color-mix(in srgb,var(--ink) 78%,transparent)}
.hero .cta{display:flex;gap:12px;margin-top:34px;flex-wrap:wrap}
.dimframe{position:relative;margin-top:clamp(46px,6vw,84px);border:1px solid var(--ink);padding:14px;background:color-mix(in srgb,var(--paper) 70%,transparent)}
.dimframe .media{aspect-ratio:21/9}
.dimframe::before,.dimframe::after{content:"";position:absolute;background:var(--accent)}
.dimframe::before{left:-1px;top:-1px;width:26px;height:26px;clip-path:polygon(0 0,100% 0,0 100%)}
.dimframe::after{right:-1px;bottom:-1px;width:26px;height:26px;clip-path:polygon(100% 100%,100% 0,0 100%)}
.dimline{position:absolute;left:14px;right:14px;bottom:-30px;height:1px;background:var(--ink);transform:scaleX(var(--s,0));transform-origin:0 50%}
.dimtxt{position:absolute;left:50%;bottom:-52px;translate:-50% 0;font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;opacity:.6}
section{padding:clamp(74px,9vw,130px) 0}
.sechead{display:grid;grid-template-columns:auto 1fr;gap:22px;align-items:center;margin-bottom:48px}
.sechead .no{font-size:.7rem;letter-spacing:.2em;border:1px solid var(--ink);padding:6px 10px}
.sechead h2{font-size:clamp(1.7rem,3.4vw,3rem);font-weight:900;text-transform:uppercase;letter-spacing:-.02em}
.sechead::after{content:"";height:1px;background:var(--ink);opacity:.3;grid-column:1/-1}
.spec{border-top:1px solid var(--ink)}
.spec .r{display:grid;grid-template-columns:70px 1.1fr 2fr;gap:24px;padding:22px 8px;border-bottom:1px solid color-mix(in srgb,var(--ink) 30%,transparent);position:relative;overflow:hidden;transition:background .35s ease,padding-left .35s ease}
.spec .r::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--accent);transform:scaleY(0);transform-origin:bottom;transition:transform .4s ease}
.spec .r:hover{background:color-mix(in srgb,var(--accent) 7%,transparent);padding-left:18px}
.spec .r:hover::before{transform:scaleY(1)}
.spec .k{font-size:.72rem;opacity:.55;letter-spacing:.12em}
.spec .t{font-family:var(--display);font-weight:700;font-size:1.06rem;text-transform:uppercase;letter-spacing:-.01em}
.spec .d{font-size:.9rem;line-height:1.8;opacity:.78}
@media(max-width:820px){.spec .r{grid-template-columns:52px 1fr}.spec .d{grid-column:2/-1}}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,74px);align-items:start}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.plate{border:1px solid var(--ink);padding:12px;position:relative;background:color-mix(in srgb,var(--paper) 60%,transparent)}
.plate .media{aspect-ratio:4/3}
.plate figcaption{margin-top:10px;font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;opacity:.6;display:flex;justify-content:space-between;gap:12px}
.body-copy{font-size:.96rem;line-height:1.9;max-width:54ch;opacity:.82}
.data{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--ink);margin-top:44px}
.data div{padding:26px 20px;border-right:1px solid color-mix(in srgb,var(--ink) 30%,transparent)}
.data div:last-child{border-right:0}
.data b{display:block;font-family:var(--display);font-weight:900;font-size:clamp(1.4rem,2.6vw,2.1rem);color:var(--accent)}
.data span{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;opacity:.6;margin-top:8px;display:block}
@media(max-width:760px){.data{grid-template-columns:repeat(2,1fr)}.data div:nth-child(2){border-right:0}}
.plates{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
.callout{border:2px solid var(--ink);padding:clamp(28px,4vw,54px);display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center;background:var(--deep);color:color-mix(in srgb,var(--paper) 94%,#fff)}
@media(max-width:880px){.callout{grid-template-columns:1fr}}
.callout h3{font-size:clamp(1.5rem,3vw,2.4rem);font-weight:900;text-transform:uppercase}
.callout p{margin-top:16px;opacity:.82;line-height:1.85;font-size:.94rem}
.info{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--ink)}
.info>div{padding:30px 26px;border-right:1px solid color-mix(in srgb,var(--ink) 30%,transparent)}
.info>div:last-child{border-right:0}
@media(max-width:820px){.info{grid-template-columns:1fr}.info>div{border-right:0;border-bottom:1px solid color-mix(in srgb,var(--ink) 30%,transparent)}}
.info h4{font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;opacity:.55;margin-bottom:16px;font-family:var(--text)}
.info li,.info p{padding:7px 0;font-size:.88rem}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{border-top:2px solid var(--ink);background:color-mix(in srgb,var(--paper) 60%,#fff)}
.title-block{display:grid;grid-template-columns:1.4fr repeat(4,1fr);border-top:1px solid var(--ink)}
.title-block>div{border-right:1px solid var(--ink);padding:22px 20px;min-height:120px}
.title-block>div:last-child{border-right:0}
.title-block dt{font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;opacity:.5}
.title-block dd{margin:8px 0 0;font-family:var(--display);font-weight:700;font-size:.96rem;text-transform:uppercase;letter-spacing:-.01em}
@media(max-width:900px){.title-block{grid-template-columns:1fr 1fr}.title-block>div{border-bottom:1px solid var(--ink)}}
.footmark{--logo-hf:52px}
.fbot{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:18px var(--gut);font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;opacity:.55;border-top:1px solid var(--ink)}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Treatments', '#services'], ['Clinic', '#story'], ['Plates', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Call</a>
</header>
<main id="main">
<section class="hero" id="top"><div class="wrap">
  <div class="hero-grid">
    <div><span class="tag" data-rv="down">${esc(site.eyebrow)}</span>
      <h1 data-rv="up">${esc(site.headline)}</h1>
      <p data-rv="up">${esc(site.sub)}</p>
      <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#services">${esc(site.ctaSecondary)}</a></div>
    </div>
    <div data-rv="scale">${inkmark(site, 'heromark')}</div>
  </div>
  <figure class="dimframe" data-rv="clip" data-scrub>
    <div class="media">${heroImg(site, 0)}</div>
    <span class="dimline" aria-hidden="true"></span><span class="dimtxt">${esc(site.address)}</span>
  </figure>
</div></section>
<section id="services"><div class="wrap">
  <div class="sechead" data-rv="up" data-vanish><span class="no">SHEET 01</span><h2>What we treat</h2></div>
  <div class="spec">${site.services.map((s, i) => `<div class="r" data-rv="right" data-delay="${i * 55}"><span class="k">0${i + 1}</span><span class="t">${esc(s[0])}</span><span class="d">${esc(s[1])}</span></div>`).join('')}</div>
  <div class="data">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
</div></section>
<section id="story"><div class="wrap two">
  <div><div class="sechead" data-rv="up" data-vanish><span class="no">SHEET 02</span><h2>${esc(site.story.title)}</h2></div>
    <p class="body-copy" data-rv="up">${esc(site.story.body)}</p>
    <div style="margin-top:32px" data-rv="up"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
  <figure class="plate" data-rv="left" data-par="18"><div class="media">${img(site, 1)}</div><figcaption><span>${esc(site.alts[1])}</span><span>PL-02</span></figcaption></figure>
</div></section>
<section><div class="wrap"><div class="callout" data-rv="up">
  <div><h3>${esc(site.feature.title)}</h3><p>${esc(site.feature.body)}</p></div>
  <figure class="media" style="aspect-ratio:16/10">${img(site, 2)}</figure>
</div></div></section>
<section id="gallery"><div class="wrap">
  <div class="sechead" data-rv="up" data-vanish><span class="no">SHEET 03</span><h2>Inside ${esc(site.short)}</h2></div>
  <div class="plates">${[3, 4, 5].map((i, k) => `<figure class="plate" data-rv="up" data-delay="${k * 110}"><div class="media">${img(site, i)}</div><figcaption><span>${esc(site.alts[i])}</span><span>PL-0${k + 3}</span></figcaption></figure>`).join('')}</div>
</div></section>
<section id="visit"><div class="wrap">
  <div class="sechead" data-rv="up"><span class="no">SHEET 04</span><h2>Contact and directions</h2></div>
  <div class="info" data-rv="up">
    <div><h4>Contact</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div><h4>Reference</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer>
  <div class="wrap" style="padding:clamp(44px,6vw,80px) 0 34px;display:flex;gap:30px;align-items:center;justify-content:space-between;flex-wrap:wrap">
    ${inkmark(site, 'footmark')}
    <p style="max-width:44ch;font-size:.9rem;line-height:1.8;opacity:.78">${esc(site.closing)}</p>
    <a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a>
  </div>
  <dl class="title-block">
    <div><dt>Practice</dt><dd>${esc(site.name)}</dd></div>
    <div><dt>Location</dt><dd>${esc(site.address)}</dd></div>
    <div><dt>Telephone</dt><dd>${esc(site.tel)}</dd></div>
    <div><dt>Area served</dt><dd>${esc(site.city)}</dd></div>
    <div><dt>Sheet</dt><dd>01 of 01</dd></div>
  </dl>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</footer>`,
});

/* ============================================================ 4. FIELD GRID
   Commercial job-site grid: hard cell borders, ticker, filling grid cells,
   coordinate strip. Footer: site-plan block with grid references. */
const fieldGrid = site => ({
  fonts: ['Oswald:wght@400;500;600;700', 'Barlow:wght@400;500;600;700'],
  display: "'Oswald',Impact,sans-serif", text: "'Barlow',system-ui,sans-serif",
  radius: '0px', border: '2px', particles: 'dust',
  css: `
body{background:var(--paper)}
.btn{border-radius:0;text-transform:uppercase;letter-spacing:.1em;font-family:var(--display);font-weight:500}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:22px;
  padding:10px var(--gut);background:var(--deep);color:#fff;border-bottom:3px solid var(--accent)}
.hd nav{display:flex;gap:24px;justify-content:center;font-family:var(--display);font-size:.84rem;letter-spacing:.1em;text-transform:uppercase}
.hd nav a:hover{color:var(--accent)}
@media(max-width:960px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.ticker{background:var(--accent);color:#141414;overflow:hidden;padding:9px 0;border-bottom:3px solid var(--deep)}
.ticker ul{display:flex;gap:44px;width:max-content;animation:run 34s linear infinite;font-family:var(--display);font-size:.8rem;letter-spacing:.18em;text-transform:uppercase}
.ticker li::before{content:"／";margin-right:16px;opacity:.5}
@keyframes run{to{transform:translateX(-50%)}}
.hero{position:relative;min-height:82svh;display:grid;align-items:end;overflow:hidden;color:#fff}
.hero-bg{position:absolute;inset:0;z-index:0}
.hero-bg img{width:100%;height:100%;object-fit:cover;transform:scale(1.1)}
.hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,var(--deep) 4%,color-mix(in srgb,var(--deep) 66%,transparent) 46%,color-mix(in srgb,var(--deep) 26%,transparent))}
.hero-in{position:relative;z-index:1;padding:clamp(58px,8vw,110px) 0 clamp(38px,5vw,64px)}
.hero h1{font-family:var(--display);font-weight:700;font-size:clamp(2.4rem,6.2vw,5.6rem);line-height:.96;text-transform:uppercase;letter-spacing:-.01em;max-width:17ch}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:20px}
.hero p{max-width:56ch;margin-top:22px;opacity:.86;line-height:1.75}
.hero .cta{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.coords{display:grid;grid-template-columns:repeat(4,1fr);border-block:3px solid var(--deep)}
.coords div{padding:22px 20px;border-right:2px solid color-mix(in srgb,var(--deep) 22%,transparent);background:var(--panel)}
.coords div:last-child{border-right:0}
.coords b{font-family:var(--display);font-size:clamp(1.3rem,2.4vw,2rem);font-weight:600;display:block;color:var(--deep)}
.coords span{font-size:.76rem;letter-spacing:.12em;text-transform:uppercase;opacity:.7;display:block;margin-top:6px}
@media(max-width:760px){.coords{grid-template-columns:repeat(2,1fr)}}
section{padding:clamp(70px,9vw,124px) 0}
.head{display:flex;align-items:baseline;gap:20px;margin-bottom:44px;flex-wrap:wrap}
.head h2{font-family:var(--display);font-size:clamp(1.9rem,4.2vw,3.6rem);font-weight:600;text-transform:uppercase;letter-spacing:-.01em}
.head .idx{font-family:var(--display);color:var(--accent);font-size:1rem;letter-spacing:.2em}
.head::after{content:"";flex:1;height:3px;background:var(--deep);min-width:40px}
.cells{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;background:var(--deep);border:3px solid var(--deep)}
.cells article{background:var(--paper);padding:34px 28px;position:relative;overflow:hidden;transition:color .4s ease}
.cells article::before{content:"";position:absolute;inset:0;background:var(--deep);transform:translateY(101%);transition:transform .5s cubic-bezier(.2,.8,.2,1);z-index:0}
.cells article:hover::before{transform:translateY(0)}
.cells article:hover{color:#fff}
.cells article:hover .num{color:var(--accent)}
.cells>*{position:relative}
.cells article>*{position:relative;z-index:1}
.cells .num{font-family:var(--display);font-size:.86rem;letter-spacing:.2em;color:var(--accent2);display:block;margin-bottom:16px;transition:color .4s}
.cells h3{font-family:var(--display);font-size:1.3rem;font-weight:500;text-transform:uppercase;margin-bottom:12px}
.cells p{font-size:.92rem;line-height:1.75;opacity:.82}
@media(max-width:900px){.cells{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.cells{grid-template-columns:1fr}}
.two{display:grid;grid-template-columns:1fr 1fr;gap:0;border:3px solid var(--deep)}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.two .pane{padding:clamp(30px,4vw,60px)}
.two .media{aspect-ratio:4/3;border-left:3px solid var(--deep)}
@media(max-width:900px){.two .media{border-left:0;border-top:3px solid var(--deep)}}
.two h2{font-family:var(--display);font-size:clamp(1.7rem,3.2vw,2.8rem);text-transform:uppercase;font-weight:600;line-height:1.04}
.two p{margin-top:20px;line-height:1.85;opacity:.84}
.dark{background:var(--deep);color:#fff}
.pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;background:color-mix(in srgb,#fff 20%,transparent);border:3px solid color-mix(in srgb,#fff 20%,transparent)}
.pillars div{background:var(--deep);padding:36px 28px}
.pillars b{font-family:var(--display);font-size:2.6rem;color:var(--accent);display:block;line-height:1}
.pillars h4{font-family:var(--display);text-transform:uppercase;font-size:1.05rem;margin:14px 0 10px;font-weight:500}
.pillars p{font-size:.9rem;opacity:.78;line-height:1.7}
@media(max-width:860px){.pillars{grid-template-columns:1fr}}
.mosaic{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:minmax(150px,auto);gap:3px;background:var(--deep);border:3px solid var(--deep)}
.mosaic figure{margin:0;position:relative;overflow:hidden}
.mosaic figure:nth-child(1){grid-column:span 2;grid-row:span 2}
.mosaic figure:nth-child(4){grid-column:span 2}
.mosaic img{width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.mosaic figure:hover img{transform:scale(1.07)}
.mosaic figcaption{position:absolute;left:0;bottom:0;background:var(--accent);color:#141414;font-family:var(--display);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;padding:6px 12px;transform:translateY(105%);transition:transform .4s ease}
.mosaic figure:hover figcaption{transform:none}
@media(max-width:760px){.mosaic{grid-template-columns:repeat(2,1fr)}.mosaic figure:nth-child(1),.mosaic figure:nth-child(4){grid-column:span 2;grid-row:auto}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;background:var(--deep);border:3px solid var(--deep)}
.info>div{background:var(--paper);padding:30px 26px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info h4{font-family:var(--display);text-transform:uppercase;font-size:.86rem;letter-spacing:.16em;color:var(--accent2);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.92rem;border-bottom:1px solid color-mix(in srgb,var(--deep) 12%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff}
.plan{display:grid;grid-template-columns:repeat(6,1fr);border-top:3px solid var(--accent)}
.plan>div{border-right:1px solid color-mix(in srgb,#fff 16%,transparent);padding:26px 16px;min-height:130px}
.plan>div:first-child{grid-column:span 2}
.plan>div:last-child{border-right:0}
.plan dt{font-family:var(--display);font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;opacity:.5}
.plan dd{margin:8px 0 0;font-size:.9rem;line-height:1.5}
@media(max-width:900px){.plan{grid-template-columns:1fr 1fr}.plan>div:first-child{grid-column:span 2}}
.footmark{--logo-hf:60px}
.fbot{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:18px var(--gut);font-family:var(--display);font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;opacity:.6;border-top:1px solid color-mix(in srgb,#fff 16%,transparent)}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['Company', '#story'], ['Work', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.tel)}</a>
</header>
<div class="ticker" aria-hidden="true"><ul>${[...site.services, ...site.services].map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
<main id="main">
<section class="hero" id="top">
  <div class="hero-bg" data-par="34">${heroImg(site, 0)}</div>
  <div class="hero-in wrap">
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <h1 data-rv="up">${esc(site.headline)}</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" style="color:#fff" href="#story">${esc(site.ctaSecondary)}</a></div>
  </div>
</section>
<div class="coords">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
<section id="services"><div class="wrap">
  <div class="head" data-rv="up" data-vanish><span class="idx">01</span><h2>What we do</h2></div>
  <div class="cells">${site.services.map((s, i) => `<article data-rv="scale" data-delay="${i * 70}"><span class="num">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section id="story"><div class="wrap">
  <div class="head" data-rv="up" data-vanish><span class="idx">02</span><h2>The company</h2></div>
  <div class="two" data-rv="up">
    <div class="pane"><h2>${esc(site.story.title)}</h2><p>${esc(site.story.body)}</p>
      <div style="margin-top:28px"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
    <figure class="media">${img(site, 1)}</figure>
  </div>
</div></section>
<section class="dark"><div class="wrap">
  <div class="head" data-rv="up" style="color:#fff"><span class="idx">03</span><h2>${esc(site.feature.title)}</h2></div>
  <div class="pillars">
    <div data-rv="up"><b>01</b><h4>Quality craftsmanship</h4><p>${esc(site.feature.body)}</p></div>
    <div data-rv="up" data-delay="90"><b>02</b><h4>Safety</h4><p>Three decades on live commercial sites means safety is the schedule, not an afterthought bolted onto it.</p></div>
    <div data-rv="up" data-delay="180"><b>03</b><h4>Professional service</h4><p>${esc(site.proof[3][0])} ${esc(site.proof[3][1]).toLowerCase()}, on every project we take.</p></div>
  </div>
</div></section>
<section id="gallery"><div class="wrap">
  <div class="head" data-rv="up" data-vanish><span class="idx">04</span><h2>On site</h2></div>
  <div class="mosaic">${[2, 3, 4, 5].map((i, k) => `<figure data-rv="scale" data-delay="${k * 90}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="1200" height="900"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section id="visit"><div class="wrap">
  <div class="head" data-rv="up"><span class="idx">05</span><h2>Contact</h2></div>
  <div class="info" data-rv="up">
    <div><h4>Reach us</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer>
  <div class="wrap" style="padding:clamp(48px,6vw,88px) 0 36px;display:flex;gap:28px;justify-content:space-between;align-items:center;flex-wrap:wrap">
    ${inkmark(site, 'footmark')}
    <p style="font-family:var(--display);text-transform:uppercase;font-size:clamp(1.1rem,2.2vw,1.8rem);max-width:20ch;line-height:1.15">${esc(site.closing)}</p>
    <a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a>
  </div>
  <dl class="plan">
    <div><dt>Company</dt><dd>${esc(site.name)}</dd></div>
    <div><dt>Yard</dt><dd>${esc(site.address)}</dd></div>
    <div><dt>Phone</dt><dd>${esc(site.tel)}</dd></div>
    <div><dt>Area</dt><dd>${esc(site.city)}</dd></div>
    <div><dt>Est.</dt><dd>${esc(site.proof[0][0])}</dd></div>
  </dl>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</footer>`,
});

/* =========================================================== 5. POURED SLAB
   Concrete: shear slabs that slide apart, control joints, cast-texture noise,
   heavy stencil type. Footer: poured slab with joint lines and a stamp. */
const pouredSlab = site => ({
  fonts: ['Anton', 'Inter:wght@400;500;600;700'],
  display: "'Anton',Impact,sans-serif", text: "'Inter',system-ui,sans-serif",
  radius: '0px', border: '0px', particles: 'dust',
  css: `
body{background:var(--paper)}
.cast{background-image:repeating-linear-gradient(115deg,color-mix(in srgb,var(--ink) 3%,transparent) 0 2px,transparent 2px 7px),radial-gradient(color-mix(in srgb,var(--ink) 4%,transparent) 1px,transparent 1px);background-size:auto,5px 5px}
.btn{border-radius:0;text-transform:uppercase;font-family:var(--display);letter-spacing:.06em;font-weight:400}
.hd{position:fixed;top:0;left:0;right:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:14px var(--gut);
  transition:background .4s ease,padding .4s ease;color:#fff;mix-blend-mode:normal}
.hd.is-stuck{background:var(--deep);padding-block:9px;box-shadow:0 10px 30px -14px rgba(0,0,0,.6)}
.hd nav{display:flex;gap:26px;justify-content:center;font-family:var(--display);font-size:.9rem;letter-spacing:.08em;text-transform:uppercase}
.hd nav a{opacity:.82}.hd nav a:hover{opacity:1;color:var(--accent2)}
@media(max-width:960px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{position:relative;min-height:100svh;display:grid;align-items:center;overflow:hidden;color:#fff;background:var(--deep)}
.hero-bg{position:absolute;inset:0}
.hero-bg img{width:100%;height:100%;object-fit:cover;opacity:.5}
.hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(200deg,color-mix(in srgb,var(--deep) 82%,transparent),color-mix(in srgb,var(--deep) 40%,transparent) 58%,color-mix(in srgb,var(--deep) 90%,transparent))}
.hero-in{position:relative;z-index:2;padding:150px 0 90px}
.hero h1{font-family:var(--display);font-size:clamp(3rem,10vw,9rem);line-height:.86;text-transform:uppercase;letter-spacing:-.02em;max-width:13ch}
.hero h1 span{display:block;overflow:hidden}
.hero h1 span i{display:block;font-style:normal;transform:translateY(102%);animation:rise .95s cubic-bezier(.16,1,.3,1) forwards}
.hero h1 span:nth-child(2) i{animation-delay:.12s}.hero h1 span:nth-child(3) i{animation-delay:.24s}
@keyframes rise{to{transform:none}}
.hero .eyebrow{color:var(--accent2);display:block;margin-bottom:24px}
.hero p{max-width:52ch;margin-top:26px;opacity:.86;line-height:1.8}
.hero .cta{display:flex;gap:12px;margin-top:36px;flex-wrap:wrap}
.joint{height:14px;background:var(--deep);position:relative}
.joint::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 78px,color-mix(in srgb,#fff 18%,transparent) 78px 80px)}
section{padding:clamp(76px,10vw,140px) 0;position:relative}
.slabhead{font-family:var(--display);font-size:clamp(2.2rem,6.4vw,5.4rem);text-transform:uppercase;line-height:.94;letter-spacing:-.02em;max-width:15ch}
.sub{margin-top:20px;max-width:56ch;line-height:1.85;opacity:.78}
.shear{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2px;margin-top:56px;background:color-mix(in srgb,var(--ink) 18%,transparent)}
.shear article{background:var(--paper);padding:38px 30px 34px;position:relative;transition:transform .5s cubic-bezier(.2,.8,.2,1),background .4s ease}
.shear article:hover{transform:translateY(-10px);background:var(--deep);color:#fff;z-index:2;box-shadow:0 26px 50px -20px rgba(0,0,0,.5)}
.shear article:hover .n{color:var(--accent2)}
.shear .n{font-family:var(--display);font-size:2.4rem;line-height:1;color:color-mix(in srgb,var(--ink) 22%,transparent);display:block;margin-bottom:16px;transition:color .4s}
.shear h3{font-family:var(--display);font-size:1.35rem;text-transform:uppercase;letter-spacing:.01em;margin-bottom:12px}
.shear p{font-size:.93rem;line-height:1.75;opacity:.82}
.dark{background:var(--deep);color:#fff}
.two{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(28px,5vw,72px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.form-frame{position:relative;padding:16px;background:color-mix(in srgb,var(--accent) 16%,transparent)}
.form-frame .media{aspect-ratio:4/5}
.form-frame::before{content:"";position:absolute;inset:6px;border:2px dashed color-mix(in srgb,var(--ink) 30%,transparent);pointer-events:none}
.dark .form-frame::before{border-color:color-mix(in srgb,#fff 30%,transparent)}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:color-mix(in srgb,#fff 18%,transparent);margin-top:48px}
.figs div{background:var(--deep);padding:30px 22px}
.figs b{font-family:var(--display);font-size:clamp(1.7rem,3.2vw,2.8rem);color:var(--accent2);display:block;line-height:1}
.figs span{font-size:.8rem;opacity:.7;margin-top:10px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.pour{display:grid;grid-template-columns:repeat(6,1fr);grid-auto-rows:120px;gap:2px}
.pour figure{margin:0;overflow:hidden;position:relative;background:var(--ink)}
.pour figure:nth-child(1){grid-column:span 4;grid-row:span 2}
.pour figure:nth-child(2){grid-column:span 2;grid-row:span 1}
.pour figure:nth-child(3){grid-column:span 2;grid-row:span 1}
.pour figure:nth-child(4){grid-column:span 3;grid-row:span 2}
.pour figure:nth-child(5){grid-column:span 3;grid-row:span 2}
.pour img{width:100%;height:100%;object-fit:cover;transition:transform 1.1s cubic-bezier(.2,.8,.2,1),filter .6s}
.pour figure:hover img{transform:scale(1.08)}
.pour figcaption{position:absolute;inset:auto 0 0 0;padding:10px 14px;background:color-mix(in srgb,var(--deep) 86%,transparent);color:#fff;font-family:var(--display);font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;transform:translateY(102%);transition:transform .4s ease}
.pour figure:hover figcaption{transform:none}
@media(max-width:860px){.pour{grid-template-columns:repeat(2,1fr);grid-auto-rows:150px}.pour figure{grid-column:span 1!important;grid-row:span 1!important}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:color-mix(in srgb,var(--ink) 18%,transparent)}
.info>div{background:var(--paper);padding:32px 26px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info h4{font-family:var(--display);text-transform:uppercase;letter-spacing:.1em;font-size:.94rem;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.93rem;border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff;position:relative}
footer::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 calc(16.66% - 1px),color-mix(in srgb,#fff 10%,transparent) calc(16.66% - 1px) 16.66%);pointer-events:none}
.fin{position:relative;padding:clamp(56px,8vw,110px) 0 40px;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-family:var(--display);text-transform:uppercase;letter-spacing:.12em;font-size:.9rem;color:var(--accent2);margin-bottom:16px}
.fin li{padding:7px 0;opacity:.84;font-size:.94rem}
.stamp{display:inline-block;border:2px solid color-mix(in srgb,#fff 40%,transparent);padding:12px 18px;font-family:var(--display);text-transform:uppercase;font-size:.86rem;letter-spacing:.14em;transform:rotate(-3deg);margin-top:24px;opacity:.8}
.footmark{--logo-hf:66px;margin-bottom:20px;display:block}
.fbot{position:relative;border-top:1px solid color-mix(in srgb,#fff 16%,transparent);padding:20px 0 40px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:.78rem;opacity:.6}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['About', '#story'], ['Work', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Free estimate</a>
</header>
<main id="main">
<section class="hero" id="top">
  <div class="hero-bg" data-par="30">${heroImg(site, 0)}</div>
  <div class="hero-in wrap">
    <span class="eyebrow">${esc(site.eyebrow)}</span>
    <h1><span><i>Strong.</i></span><span><i>Long lasting.</i></span><span><i>Poured right.</i></span></h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" style="color:#fff" href="#gallery">${esc(site.ctaSecondary)}</a></div>
  </div>
</section>
<div class="joint" aria-hidden="true"></div>
<section class="cast" id="services"><div class="wrap">
  <h2 class="slabhead" data-rv="up" data-vanish>What we pour</h2>
  <p class="sub" data-rv="up">${esc(site.headline)}</p>
  <div class="shear">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 70}"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section class="dark" id="story"><div class="wrap two">
  <div><h2 class="slabhead" data-rv="left" data-vanish>${esc(site.story.title)}</h2>
    <p class="sub" data-rv="left">${esc(site.story.body)}</p>
    <div style="margin-top:32px" data-rv="up"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div>
    <div class="figs">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
  </div>
  <figure class="form-frame" data-rv="right" data-par="22"><div class="media">${img(site, 1)}</div></figure>
</div></section>
<section class="cast"><div class="wrap two">
  <figure class="form-frame" data-rv="left"><div class="media" style="aspect-ratio:5/4">${img(site, 2)}</div></figure>
  <div><h2 class="slabhead" style="font-size:clamp(1.8rem,4.4vw,3.4rem)" data-rv="right">${esc(site.feature.title)}</h2>
  <p class="sub" data-rv="right">${esc(site.feature.body)}</p></div>
</div></section>
<section class="dark" id="gallery"><div class="wrap">
  <h2 class="slabhead" data-rv="up" data-vanish>Recent pours</h2>
  <div class="pour" style="margin-top:48px">${[3, 4, 5, 0, 1].map((i, k) => `<figure data-rv="scale" data-delay="${k * 80}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="1200" height="900"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="cast" id="visit"><div class="wrap">
  <h2 class="slabhead" data-rv="up">Contact</h2>
  <div class="info" style="margin-top:44px" data-rv="up">
    <div><h4>Reach us</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer>
  <div class="wrap"><div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.8;max-width:36ch;line-height:1.8">${esc(site.closing)}</p><span class="stamp">Est. ${esc(site.proof[0][0])}</span></div>
    <div><h4>Services</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li>${site.links.slice(0, 2).map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div></div>
</footer>`,
});

module.exports = { 'aurora-drift': auroraDrift, 'zen-strata': zenStrata, 'kinetic-blueprint': kineticBlueprint, 'field-grid': fieldGrid, 'poured-slab': pouredSlab };
