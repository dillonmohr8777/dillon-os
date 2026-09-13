const K = require('../kernel');
const { esc, attr, telHref, mapHref, inkmark, img, heroImg, hoursList } = K;

/* =========================================================== 21. RIDGE LINE
   Layered ridge silhouettes parallaxing at different rates, roofline horizon
   between every section. Footer: a full ridge horizon with a warranty seal. */
const ridgeLine = site => ({
  fonts: ['Familjen+Grotesk:wght@400;500;600;700', 'Inter:wght@400;500;600;700'],
  display: "'Familjen Grotesk',system-ui,sans-serif", text: "'Inter',system-ui,sans-serif",
  radius: '12px', border: '1px', particles: 'dust',
  css: `
body{background:var(--paper)}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:12px var(--gut);
  background:color-mix(in srgb,var(--paper) 90%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid color-mix(in srgb,var(--ink) 12%,transparent)}
.hd nav{display:flex;gap:26px;justify-content:center;font-weight:600;font-size:.9rem}
.hd nav a:hover{color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{position:relative;min-height:94svh;display:grid;align-items:center;overflow:hidden;color:#fff;background:var(--deep)}
.hero-bg{position:absolute;inset:0}
.hero-bg img{width:100%;height:100%;object-fit:cover;opacity:.42}
.ridges{position:absolute;left:0;right:0;bottom:0;z-index:1;pointer-events:none}
.ridges svg{position:absolute;left:0;bottom:0;width:110%;height:auto}
.ridges svg:nth-child(1){opacity:.28;transform:translate3d(0,calc(var(--p,0)*22px),0)}
.ridges svg:nth-child(2){opacity:.5;transform:translate3d(0,calc(var(--p,0)*14px),0)}
.ridges svg:nth-child(3){opacity:1;transform:translate3d(0,calc(var(--p,0)*6px),0)}
.hero-in{position:relative;z-index:2;padding:80px 0 clamp(90px,12vw,180px)}
.hero h1{font-size:clamp(2.4rem,5.8vw,5rem);font-weight:700;letter-spacing:-.035em;max-width:15ch;line-height:1.02}
.hero .eyebrow{color:var(--accent2);display:block;margin-bottom:22px}
.hero p{max-width:52ch;margin-top:22px;opacity:.86;line-height:1.8}
.hero .cta{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.hero .btn.ghost{color:#fff}
.seal{display:inline-flex;align-items:center;gap:10px;border:1px solid color-mix(in srgb,var(--accent2) 60%,transparent);border-radius:999px;
  padding:9px 18px;font-size:.78rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;margin-top:26px;color:var(--accent2)}
.seal::before{content:"";width:9px;height:9px;border-radius:50%;background:var(--accent2)}
section{padding:clamp(70px,9vw,130px) 0;position:relative}
.tone{background:color-mix(in srgb,var(--panel) 34%,var(--paper))}
.dark{background:var(--deep);color:#fff}
.horizon{height:44px;background:var(--paper);position:relative;margin-top:-44px;z-index:3;
  clip-path:polygon(0 100%,0 46%,14% 12%,28% 44%,42% 6%,58% 40%,72% 10%,86% 42%,100% 14%,100% 100%)}
.dark + .horizon{background:var(--paper)}
.kick{font-weight:700;font-size:.74rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);display:block;margin-bottom:20px}
h2.h2{font-size:clamp(1.9rem,4.4vw,3.6rem);font-weight:700;letter-spacing:-.035em;max-width:20ch}
.lead{margin-top:18px;max-width:56ch;opacity:.78;line-height:1.85}
.pitch{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:52px}
@media(max-width:900px){.pitch{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.pitch{grid-template-columns:1fr}}
.pitch article{background:var(--paper);border:1px solid color-mix(in srgb,var(--ink) 12%,transparent);border-radius:var(--r);
  padding:32px 28px;position:relative;overflow:hidden;transition:transform .5s cubic-bezier(.2,.8,.2,1),border-color .4s}
.tone .pitch article{background:#fff}
.pitch article::after{content:"";position:absolute;left:0;right:0;top:0;height:5px;background:var(--accent);transform:scaleX(0);transform-origin:0;transition:transform .55s cubic-bezier(.2,.8,.2,1)}
.pitch article:hover{transform:translateY(-8px);border-color:var(--accent)}
.pitch article:hover::after{transform:scaleX(1)}
.pitch .n{font-family:var(--display);font-weight:700;font-size:.84rem;letter-spacing:.18em;color:var(--accent2);display:block;margin-bottom:14px}
.pitch h3{font-family:var(--display);font-size:1.18rem;font-weight:600;margin-bottom:9px}
.pitch p{font-size:.93rem;opacity:.76;line-height:1.7}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,74px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.roofimg{border-radius:var(--r);overflow:hidden;aspect-ratio:4/3;clip-path:polygon(0 8%,50% 0,100% 8%,100% 100%,0 100%)}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:46px}
.figs div{border-radius:var(--r);padding:26px 20px;background:color-mix(in srgb,#fff 9%,transparent);border:1px solid color-mix(in srgb,#fff 16%,transparent)}
.figs b{font-family:var(--display);font-weight:700;font-size:clamp(1.3rem,2.6vw,2rem);color:var(--accent2);display:block;line-height:1}
.figs span{font-size:.78rem;opacity:.74;margin-top:8px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.jobs{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:140px;gap:14px;margin-top:50px}
.jobs figure{margin:0;overflow:hidden;border-radius:var(--r);position:relative}
.jobs figure:nth-child(1){grid-column:span 2;grid-row:span 2}
.jobs figure:nth-child(4){grid-column:span 2}
.jobs img{width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.jobs figure:hover img{transform:scale(1.07)}
.jobs figcaption{position:absolute;left:0;right:0;bottom:0;padding:12px 16px;background:linear-gradient(0deg,rgba(0,0,0,.82),transparent);color:#fff;font-size:.82rem;font-weight:500}
@media(max-width:760px){.jobs{grid-template-columns:1fr 1fr;grid-auto-rows:150px}.jobs figure{grid-column:span 1!important;grid-row:span 1!important}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:46px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{border-radius:var(--r);padding:30px 26px;background:#fff;border:1px solid color-mix(in srgb,var(--ink) 12%,transparent)}
.info h4{font-family:var(--display);font-weight:700;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.94rem;border-bottom:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff;position:relative;padding:0 0 40px}
.skyline{height:clamp(60px,8vw,110px);background:var(--accent);
  clip-path:polygon(0 100%,0 62%,10% 18%,20% 62%,30% 8%,42% 58%,54% 14%,66% 60%,78% 10%,90% 56%,100% 20%,100% 100%)}
.fin{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;padding:clamp(48px,6vw,88px) 0 36px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-family:var(--display);font-weight:700;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent2);margin-bottom:16px}
.fin li{padding:7px 0;opacity:.84;font-size:.94rem}
.footmark{--logo-hf:60px;margin-bottom:20px;display:block}
.fbot{border-top:1px solid color-mix(in srgb,#fff 16%,transparent);padding-top:22px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.84rem;opacity:.62}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['Why RHI', '#story'], ['Recent work', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.tel)}</a>
</header>
<main id="main">
<section class="hero" id="top">
  <div class="hero-bg" data-par="30">${heroImg(site, 0)}</div>
  <div class="ridges" aria-hidden="true" data-par="0">
    <svg viewBox="0 0 1200 160" preserveAspectRatio="none"><path fill="${site.tokens.accent2}" d="M0 160 L0 96 L180 32 L360 104 L560 24 L760 110 L960 40 L1200 118 L1200 160Z"/></svg>
    <svg viewBox="0 0 1200 130" preserveAspectRatio="none"><path fill="${site.tokens.accent}" d="M0 130 L0 84 L150 34 L340 92 L540 30 L740 96 L950 44 L1200 100 L1200 130Z"/></svg>
    <svg viewBox="0 0 1200 90" preserveAspectRatio="none"><path fill="${site.tokens.deep}" d="M0 90 L0 58 L160 20 L330 66 L520 18 L720 68 L930 26 L1200 72 L1200 90Z"/></svg>
  </div>
  <div class="hero-in wrap">
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <h1 data-rv="up">${esc(site.headline)}</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#story">${esc(site.ctaSecondary)}</a></div>
    <div><span class="seal" data-rv="scale">10 to 50 year roof warranty</span></div>
  </div>
</section>
<section id="services"><div class="wrap">
  <span class="kick" data-rv="down">What we offer</span>
  <h2 class="h2" data-rv="up" data-vanish>Commercial and residential roofing</h2>
  <div class="pitch">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 70}"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section class="tone" id="story"><div class="wrap two">
  <figure class="roofimg media" data-rv="left" data-par="22">${img(site, 1)}</figure>
  <div><span class="kick" data-rv="down">Why choose RHI</span>
    <h2 class="h2" data-rv="right" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="right">${esc(site.story.body)}</p>
    <div style="margin-top:30px" data-rv="up"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
</div></section>
<section class="dark"><div class="wrap">
  <span class="kick" data-rv="down" style="color:var(--accent2)">Family owned and operated</span>
  <h2 class="h2" data-rv="up">${esc(site.feature.title)}</h2>
  <p class="lead" data-rv="up" style="opacity:.86">${esc(site.feature.body)}</p>
  <div class="figs">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
</div></section>
<div class="horizon" aria-hidden="true"></div>
<section id="gallery"><div class="wrap">
  <span class="kick" data-rv="down">Recent work</span>
  <h2 class="h2" data-rv="up" data-vanish>Roofs we have replaced</h2>
  <div class="jobs">${[2, 3, 4, 5].map((i, k) => `<figure data-rv="scale" data-delay="${k * 90}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="1200" height="900"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone" id="visit"><div class="wrap">
  <span class="kick" data-rv="down">Contact</span>
  <h2 class="h2" data-rv="up">Get a roofing consultation</h2>
  <div class="info">
    <div data-rv="up"><h4>Reach us</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="180"><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer>
  <div class="skyline" aria-hidden="true"></div>
  <div class="wrap"><div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.84;max-width:34ch;line-height:1.8">${esc(site.closing)}</p></div>
    <div><h4>Services</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li>${site.links.slice(0, 2).map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>Licensed, insured and certified</span></div></div>
</footer>`,
});

/* ======================================================== 22. LIQUID SUITE
   The full liquid-glass build: refracting glass panels over a moving colour
   field, 3D tilt everywhere, frosted nav. Footer: one long glass slab. */
const liquidSuite = site => ({
  fonts: ['Plus+Jakarta+Sans:wght@400;500;600;700;800', 'Inter:wght@400;500;600'],
  display: "'Plus Jakarta Sans',system-ui,sans-serif", text: "'Inter',system-ui,sans-serif",
  radius: '28px', border: '1px', particles: 'mist',
  css: `
body{background:var(--paper);position:relative}
.field{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.field i{position:absolute;border-radius:50%;filter:blur(70px);opacity:.5;animation:swim 30s ease-in-out infinite alternate}
.field i:nth-child(1){width:46vw;height:46vw;left:-8vw;top:-10vh;background:var(--accent2)}
.field i:nth-child(2){width:40vw;height:40vw;right:-6vw;top:34vh;background:var(--accent);animation-duration:38s}
.field i:nth-child(3){width:52vw;height:52vw;left:26vw;bottom:-24vh;background:color-mix(in srgb,var(--accent2) 60%,#fff);animation-duration:46s}
@keyframes swim{to{transform:translate3d(6vw,-7vh,0) scale(1.18)}}
main,header,footer{position:relative;z-index:1}
.hd{position:fixed;top:14px;left:50%;translate:-50% 0;z-index:100;width:min(1240px,calc(100% - 28px));
  display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:22px;padding:10px 12px 10px 18px;border-radius:999px}
.hd nav{display:flex;gap:24px;justify-content:center;font-weight:600;font-size:.88rem}
.hd nav a{opacity:.8}.hd nav a:hover{opacity:1;color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{min-height:100svh;display:grid;place-items:center;text-align:center;padding:140px 0 90px}
.hero h1{font-size:clamp(2.4rem,5.6vw,4.9rem);font-weight:800;letter-spacing:-.045em;max-width:17ch;margin-inline:auto}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:24px}
.hero p{max-width:56ch;margin:24px auto 0;opacity:.76;line-height:1.8;font-size:1.05rem}
.hero .cta{display:flex;gap:13px;justify-content:center;margin-top:34px;flex-wrap:wrap}
.heromark{--logo-hh:clamp(76px,10vw,126px);margin-bottom:32px;display:inline-block}
.pane{border-radius:clamp(24px,3vw,42px);padding:clamp(28px,4vw,58px)}
.heropanes{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:clamp(44px,5vw,74px)}
@media(max-width:820px){.heropanes{grid-template-columns:1fr}}
.heropanes figure{margin:0;border-radius:clamp(20px,2.4vw,34px);overflow:hidden}
.heropanes img{width:100%;aspect-ratio:4/5;object-fit:cover}
section{padding:clamp(66px,9vw,124px) 0}
.kick{font-weight:700;font-size:.74rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);display:block;margin-bottom:20px}
h2.h2{font-size:clamp(1.9rem,4.4vw,3.6rem);font-weight:800;letter-spacing:-.04em;max-width:20ch}
.lead{margin-top:18px;max-width:56ch;opacity:.76;line-height:1.85}
.center{text-align:center}.center .h2,.center .lead{margin-inline:auto}
.glasses{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:52px}
@media(max-width:900px){.glasses{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.glasses{grid-template-columns:1fr}}
.glasses article{border-radius:26px;padding:34px 30px;text-align:left}
.glasses .n{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:14px;background:color-mix(in srgb,var(--accent) 18%,transparent);color:var(--accent);font-weight:800;font-size:.88rem;margin-bottom:18px}
.glasses h3{font-size:1.16rem;font-weight:700;margin-bottom:9px}
.glasses p{font-size:.93rem;opacity:.76;line-height:1.7}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,72px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.refract{border-radius:clamp(22px,3vw,38px);overflow:hidden;aspect-ratio:4/5;position:relative}
.refract::after{content:"";position:absolute;inset:0;background:linear-gradient(130deg,color-mix(in srgb,#fff 26%,transparent) 0 24%,transparent 48%);pointer-events:none}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:46px}
.figs div{border-radius:20px;padding:26px 20px;text-align:center}
.figs b{font-family:var(--display);font-weight:800;font-size:clamp(1.2rem,2.4vw,1.9rem);color:var(--accent);display:block}
.figs span{font-size:.78rem;opacity:.72;margin-top:7px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:50px}
.tiles figure{margin:0;border-radius:24px;overflow:hidden;position:relative}
.tiles figure:nth-child(even){margin-top:30px}
.tiles img{width:100%;aspect-ratio:3/4;object-fit:cover;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.tiles figure:hover img{transform:scale(1.06)}
.tiles figcaption{position:absolute;left:16px;right:16px;bottom:16px;color:#fff;font-size:.82rem;font-weight:500;text-shadow:0 2px 14px rgba(0,0,0,.75)}
@media(max-width:760px){.tiles{grid-template-columns:1fr 1fr}.tiles figure:nth-child(even){margin-top:0}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:46px;text-align:left}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{border-radius:24px;padding:30px 28px}
.info h4{font-weight:700;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.94rem;border-bottom:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{padding:clamp(50px,7vw,96px) 0 44px}
.slab{border-radius:clamp(26px,3vw,44px);padding:clamp(32px,4vw,62px);display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px}
@media(max-width:880px){.slab{grid-template-columns:1fr}}
.slab h4{font-weight:700;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;opacity:.58;margin-bottom:16px}
.slab li{padding:7px 0;opacity:.84;font-size:.94rem}
.footmark{--logo-hf:60px;margin-bottom:20px;display:block}
.fbot{margin-top:34px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.82rem;opacity:.6}`,
  body: `
<div class="field" aria-hidden="true"><i></i><i></i><i></i></div>
<header class="hd lg" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Care', '#services'], ['Doctors', '#story'], ['Practice', '#gallery'], ['Visit', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Book now</a>
</header>
<main id="main">
<section class="hero" id="top"><div class="wrap">
  <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
  <span data-rv="scale">${inkmark(site, 'heromark')}</span>
  <h1 data-rv="blur">${esc(site.headline)}</h1>
  <p data-rv="up">${esc(site.sub)}</p>
  <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#story">${esc(site.ctaSecondary)}</a></div>
  <div class="heropanes">${[0, 1, 2].map((i, k) => `<figure class="lg" data-rv="up" data-delay="${k * 110}">${k === 0 ? heroImg(site, i) : img(site, i)}</figure>`).join('')}</div>
</div></section>
<section class="center" id="services"><div class="wrap">
  <span class="kick" data-rv="down">What we offer</span>
  <h2 class="h2" data-rv="up" data-vanish>Chiropractic, rehabilitation and nutrition</h2>
  <div class="glasses">${site.services.map((s, i) => `<article class="lg tilt3d" data-rv="up" data-delay="${i * 70}"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section id="story"><div class="wrap two">
  <figure class="refract lg" data-rv="left" data-par="22">${img(site, 3)}</figure>
  <div><span class="kick" data-rv="down">The doctors</span>
    <h2 class="h2" data-rv="right" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="right">${esc(site.story.body)}</p>
    <div class="figs">${site.proof.map(p => `<div class="lg" data-rv="scale"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div></div>
</div></section>
<section><div class="wrap"><div class="pane lg two" data-rv="up">
  <div><span class="kick">${esc(site.feature.title)}</span>
    <h2 class="h2" style="font-size:clamp(1.6rem,3.2vw,2.6rem)">Center City chiropractic care</h2>
    <p class="lead">${esc(site.feature.body)}</p>
    <div style="margin-top:28px"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a></div></div>
  <figure class="refract" style="aspect-ratio:5/4">${img(site, 4)}</figure>
</div></div></section>
<section class="center" id="gallery"><div class="wrap">
  <span class="kick" data-rv="down">Inside</span>
  <h2 class="h2" data-rv="up" data-vanish>Inside ${esc(site.short)}</h2>
  <div class="tiles">${[5, 0, 1, 2].map((i, k) => `<figure data-rv="up" data-delay="${k * 100}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="900" height="1200"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="center" id="visit"><div class="wrap">
  <span class="kick" data-rv="down">Visit</span>
  <h2 class="h2" data-rv="up">Visit ${esc(site.short)}</h2>
  <div class="info">
    <div class="lg" data-rv="up"><h4>Contact</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div class="lg" data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div class="lg" data-rv="up" data-delay="180"><h4>The doctors</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer><div class="wrap">
  <div class="slab lg">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.78;max-width:34ch;line-height:1.8">${esc(site.closing)}</p></div>
    <div><h4>Care</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li></ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</div></footer>`,
});

/* ========================================================= 23. STONE GARDEN
   Zen: stacked stone forms, raked-sand rules, muted sage, ripple hovers and a
   very slow reveal cadence. Footer: raked garden bed with stone markers. */
const stoneGarden = site => ({
  fonts: ['Lora:wght@400;500;600', 'Karla:wght@400;500;600;700'],
  display: "'Lora',Georgia,serif", text: "'Karla',system-ui,sans-serif",
  radius: '999px', border: '1px', particles: 'dust',
  css: `
body{background:var(--paper)}
.rake{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.5;
  background:repeating-radial-gradient(circle at 78% 12%,transparent 0 46px,color-mix(in srgb,var(--ink) 4%,transparent) 46px 48px)}
main,header,footer{position:relative;z-index:1}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:22px;padding:14px var(--gut);
  background:color-mix(in srgb,var(--paper) 88%,transparent);backdrop-filter:blur(14px)}
.hd nav{display:flex;gap:28px;justify-content:center;font-weight:500;font-size:.88rem}
.hd nav a:hover{color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{padding:clamp(56px,8vw,116px) 0;text-align:center}
.hero h1{font-size:clamp(2.3rem,5.2vw,4.4rem);font-weight:400;letter-spacing:-.02em;max-width:17ch;margin-inline:auto;line-height:1.12}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:24px}
.hero p{max-width:54ch;margin:24px auto 0;opacity:.76;line-height:1.9}
.hero .cta{display:flex;gap:13px;justify-content:center;margin-top:34px;flex-wrap:wrap}
.stones{display:flex;justify-content:center;align-items:flex-end;gap:0;margin:clamp(40px,5vw,72px) auto 0;max-width:min(720px,92%);flex-direction:column}
.stones figure{margin:0;width:100%;overflow:hidden;position:relative}
.stones figure:nth-child(1){border-radius:999px 999px 40px 40px;width:100%}
.stones figure:nth-child(2){border-radius:36px;width:76%;margin-top:14px;align-self:flex-end}
.stones figure:nth-child(3){border-radius:999px;width:52%;margin-top:14px;align-self:flex-start}
.stones img{width:100%;object-fit:cover;aspect-ratio:16/10}
.stones figure:nth-child(1) img{aspect-ratio:4/3}
.stones figure:nth-child(3) img{aspect-ratio:2/1}
section{padding:clamp(70px,9vw,132px) 0}
.tone{background:color-mix(in srgb,var(--panel) 44%,var(--paper))}
.dark{background:var(--deep);color:color-mix(in srgb,var(--paper) 96%,#fff)}
.kick{font-weight:600;font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:var(--accent);display:block;margin-bottom:22px}
h2.h2{font-size:clamp(1.8rem,4vw,3.3rem);font-weight:400;letter-spacing:-.02em;max-width:20ch;line-height:1.16}
.lead{margin-top:20px;max-width:56ch;opacity:.76;line-height:1.95}
.center{text-align:center}.center .h2,.center .lead{margin-inline:auto}
.pebbles{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:56px}
@media(max-width:900px){.pebbles{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.pebbles{grid-template-columns:1fr}}
.pebbles article{background:var(--paper);border:1px solid color-mix(in srgb,var(--ink) 12%,transparent);border-radius:160px 160px 28px 28px;
  padding:40px 30px 32px;text-align:center;position:relative;overflow:hidden;transition:transform .7s cubic-bezier(.2,.8,.2,1),border-color .5s}
.tone .pebbles article{background:#fff}
.pebbles article::before{content:"";position:absolute;left:50%;top:38px;translate:-50% -50%;width:14px;height:14px;border-radius:50%;
  border:1px solid var(--accent);transition:transform .9s cubic-bezier(.2,.8,.2,1),opacity .9s}
.pebbles article:hover{transform:translateY(-8px);border-color:var(--accent)}
.pebbles article:hover::before{transform:translate(-50%,-50%) scale(9);opacity:0}
.pebbles h3{font-family:var(--display);font-size:1.18rem;font-weight:400;margin:26px 0 10px}
.pebbles p{font-size:.93rem;opacity:.76;line-height:1.75}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,78px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.stone{border-radius:999px 999px 40px 40px;overflow:hidden;aspect-ratio:3/4}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:48px}
.figs div{text-align:center;border-radius:999px 999px 18px 18px;padding:32px 16px 24px;background:color-mix(in srgb,var(--accent) 12%,transparent)}
.dark .figs div{background:color-mix(in srgb,#fff 10%,transparent)}
.figs b{font-family:var(--display);font-size:clamp(1.1rem,2.2vw,1.7rem);display:block}
.figs span{font-size:.78rem;opacity:.74;margin-top:8px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.beds{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:52px}
.beds figure{margin:0;border-radius:999px 999px 26px 26px;overflow:hidden;position:relative}
.beds figure:nth-child(2){margin-top:34px}
.beds img{width:100%;aspect-ratio:3/4;object-fit:cover;transition:transform 1.3s cubic-bezier(.2,.8,.2,1)}
.beds figure:hover img{transform:scale(1.05)}
.beds figcaption{position:absolute;left:18px;right:18px;bottom:18px;color:#fff;font-size:.84rem;text-shadow:0 2px 12px rgba(0,0,0,.7)}
@media(max-width:760px){.beds{grid-template-columns:1fr 1fr}.beds figure:nth-child(2){margin-top:0}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:48px;text-align:left}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{border-radius:36px;padding:32px 30px;background:var(--paper);border:1px solid color-mix(in srgb,var(--ink) 12%,transparent)}
.tone .info>div{background:#fff}
.info h4{font-family:var(--display);font-size:1.12rem;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.94rem;border-bottom:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:color-mix(in srgb,var(--paper) 96%,#fff);padding:clamp(56px,7vw,102px) 0 40px;position:relative;overflow:hidden}
footer::before{content:"";position:absolute;inset:0;opacity:.4;pointer-events:none;
  background:repeating-radial-gradient(circle at 22% 108%,transparent 0 40px,color-mix(in srgb,#fff 7%,transparent) 40px 42px)}
.markers{position:relative;display:flex;gap:14px;justify-content:center;margin-bottom:44px}
.markers i{width:18px;height:26px;border-radius:999px 999px 6px 6px;background:color-mix(in srgb,#fff 18%,transparent)}
.markers i:nth-child(2){height:36px;width:24px}
.markers i:nth-child(3){height:20px}
.fin{position:relative;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:44px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-family:var(--display);font-size:1.05rem;margin-bottom:16px;opacity:.94}
.fin li{padding:7px 0;opacity:.82;font-size:.94rem}
.footmark{--logo-hf:60px;margin-bottom:20px;display:block}
.fbot{position:relative;margin-top:48px;padding-top:24px;border-top:1px solid color-mix(in srgb,#fff 14%,transparent);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.82rem;opacity:.62}`,
  body: `
<div class="rake" aria-hidden="true"></div>
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['Our office', '#story'], ['Inside', '#gallery'], ['Visit', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>New patients</a>
</header>
<main id="main">
<section class="hero" id="top"><div class="wrap">
  <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
  <h1 data-rv="up">${esc(site.headline)}</h1>
  <p data-rv="up">${esc(site.sub)}</p>
  <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#services">${esc(site.ctaSecondary)}</a></div>
  <div class="stones">${[0, 1, 2].map((i, k) => `<figure data-rv="up" data-delay="${k * 160}">${k === 0 ? heroImg(site, i) : img(site, i)}</figure>`).join('')}</div>
</div></section>
<section class="tone center" id="services"><div class="wrap">
  <span class="kick" data-rv="down">Services</span>
  <h2 class="h2" data-rv="up" data-vanish>Care that assesses the whole patient</h2>
  <div class="pebbles">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 100}"><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section id="story"><div class="wrap two">
  <figure class="stone media" data-rv="left" data-par="22">${img(site, 3)}</figure>
  <div><span class="kick" data-rv="down">About our office</span>
    <h2 class="h2" data-rv="right" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="right">${esc(site.story.body)}</p>
    <div style="margin-top:32px" data-rv="up"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
</div></section>
<section class="dark center"><div class="wrap">
  <span class="kick" data-rv="down" style="color:var(--accent2)">${esc(site.feature.title)}</span>
  <h2 class="h2" data-rv="up">Nothing is a surprise</h2>
  <p class="lead" data-rv="up" style="opacity:.86">${esc(site.feature.body)}</p>
  <div class="figs">${site.proof.map(p => `<div data-rv="scale"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
</div></section>
<section class="center" id="gallery"><div class="wrap">
  <span class="kick" data-rv="down">Inside</span>
  <h2 class="h2" data-rv="up" data-vanish>Inside ${esc(site.short)}</h2>
  <div class="beds">${[4, 5, 0].map((i, k) => `<figure data-rv="up" data-delay="${k * 140}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="900" height="1200"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone center" id="visit"><div class="wrap">
  <span class="kick" data-rv="down">Visit</span>
  <h2 class="h2" data-rv="up">Visit ${esc(site.short)}</h2>
  <div class="info">
    <div data-rv="up"><h4>Contact</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="100"><h4>Office hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="200"><h4>New patients</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer><div class="wrap">
  <div class="markers" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.82;max-width:34ch;line-height:1.9">${esc(site.closing)}</p></div>
    <div><h4>Services</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li>${site.links.slice(0, 2).map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</div></footer>`,
});

/* ====================================================== 24. IMPACT DOSSIER
   High-contrast: shard-shaped reveals, hard rules, an impact ring, mono index
   numbers, a dark clinical dossier feel. Footer: dossier index block. */
const impactDossier = site => ({
  fonts: ['Archivo:wght@400;600;700;800;900', 'Space+Mono:wght@400;700'],
  display: "'Archivo',system-ui,sans-serif", text: "'Space Mono',ui-monospace,monospace",
  radius: '0px', border: '2px', particles: 'spark',
  css: `
body{background:var(--paper)}
.btn{border-radius:0;font-family:var(--display);text-transform:uppercase;letter-spacing:.06em;font-weight:700}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:11px var(--gut);
  background:var(--deep);color:#fff;border-bottom:3px solid var(--accent)}
.hd nav{display:flex;gap:24px;justify-content:center;font-size:.76rem;letter-spacing:.12em;text-transform:uppercase}
.hd nav a:hover{color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{position:relative;min-height:92svh;display:grid;align-items:center;overflow:hidden;background:var(--deep);color:#fff}
.hero-bg{position:absolute;inset:0;clip-path:polygon(46% 0,100% 0,100% 100%,26% 100%)}
.hero-bg img{width:100%;height:100%;object-fit:cover;opacity:.5}
.hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--deep),transparent 46%)}
.impact{position:absolute;right:14%;top:44%;translate:0 -50%;width:min(420px,44vw);aspect-ratio:1;z-index:1;pointer-events:none}
.impact i{position:absolute;inset:0;margin:auto;border:2px solid color-mix(in srgb,var(--accent) 50%,transparent);border-radius:50%;
  animation:shock 3.6s cubic-bezier(.2,.8,.2,1) infinite}
.impact i:nth-child(2){animation-delay:1.2s}.impact i:nth-child(3){animation-delay:2.4s}
@keyframes shock{0%{transform:scale(.2);opacity:0}22%{opacity:.9}100%{transform:scale(1);opacity:0}}
.hero-in{position:relative;z-index:2;padding:80px 0}
.hero h1{font-family:var(--display);font-size:clamp(2.3rem,5.6vw,4.9rem);font-weight:900;text-transform:uppercase;letter-spacing:-.03em;max-width:14ch;line-height:.98}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:22px}
.hero p{max-width:48ch;margin-top:22px;opacity:.84;line-height:1.8;font-size:.94rem}
.hero .cta{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.hero .btn.ghost{color:#fff}
.bar{background:var(--accent);color:#fff;display:grid;grid-template-columns:repeat(4,1fr)}
.bar div{padding:20px 22px;border-right:2px solid color-mix(in srgb,#fff 30%,transparent)}
.bar div:last-child{border-right:0}
.bar b{font-family:var(--display);font-weight:900;font-size:clamp(1.1rem,2.2vw,1.7rem);display:block;text-transform:uppercase}
.bar span{font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;opacity:.86;margin-top:6px;display:block}
@media(max-width:760px){.bar{grid-template-columns:1fr 1fr}}
section{padding:clamp(70px,9vw,128px) 0}
.tone{background:color-mix(in srgb,var(--panel) 40%,var(--paper))}
.dark{background:var(--deep);color:#fff}
.idx{display:flex;align-items:center;gap:16px;margin-bottom:24px;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}
.idx::after{content:"";flex:1;height:2px;background:currentColor;opacity:.35}
h2.h2{font-family:var(--display);font-size:clamp(1.8rem,4.2vw,3.5rem);font-weight:900;text-transform:uppercase;letter-spacing:-.025em;max-width:20ch;line-height:1.02}
.lead{margin-top:20px;max-width:56ch;opacity:.8;line-height:1.85;font-size:.94rem}
.shards{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:var(--ink);margin-top:52px;border:2px solid var(--ink)}
@media(max-width:900px){.shards{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.shards{grid-template-columns:1fr}}
.shards article{background:var(--paper);padding:32px 26px;position:relative;overflow:hidden;transition:color .45s}
.tone .shards article{background:color-mix(in srgb,var(--panel) 40%,var(--paper))}
.shards article::before{content:"";position:absolute;inset:0;background:var(--accent);clip-path:polygon(0 100%,100% 100%,100% 100%,0 100%);transition:clip-path .55s cubic-bezier(.2,.8,.2,1)}
.shards article:hover::before{clip-path:polygon(0 0,100% 12%,100% 100%,0 100%)}
.shards article:hover{color:#fff}
.shards article>*{position:relative;z-index:1}
.shards .n{font-size:.74rem;letter-spacing:.18em;color:var(--accent2);display:block;margin-bottom:14px}
.shards article:hover .n{color:#fff}
.shards h3{font-family:var(--display);font-size:1.12rem;font-weight:800;text-transform:uppercase;margin-bottom:10px;letter-spacing:-.01em}
.shards p{font-size:.88rem;opacity:.82;line-height:1.75}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,72px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.shard-img{overflow:hidden;clip-path:polygon(0 0,100% 6%,100% 94%,0 100%);aspect-ratio:4/3}
.shard-img img{width:100%;height:100%;object-fit:cover}
.figs{display:grid;grid-template-columns:repeat(4,1fr);border:2px solid currentColor;margin-top:46px}
.figs div{padding:26px 20px;border-right:2px solid currentColor}
.figs div:last-child{border-right:0}
.figs b{font-family:var(--display);font-weight:900;font-size:clamp(1.2rem,2.4vw,1.9rem);color:var(--accent);display:block;text-transform:uppercase}
.figs span{font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;opacity:.72;margin-top:8px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}.figs div:nth-child(2){border-right:0}}
.plates{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:var(--ink);border:2px solid var(--ink);margin-top:50px}
.plates figure{margin:0;position:relative;overflow:hidden;background:var(--ink)}
.plates img{width:100%;aspect-ratio:4/5;object-fit:cover;filter:grayscale(.4) contrast(1.05);transition:filter .5s,transform 1s cubic-bezier(.2,.8,.2,1)}
.plates figure:hover img{filter:none;transform:scale(1.05)}
.plates figcaption{position:absolute;left:0;right:0;bottom:0;padding:12px 14px;background:var(--accent);color:#fff;font-size:.72rem;letter-spacing:.08em;transform:translateY(101%);transition:transform .4s}
.plates figure:hover figcaption{transform:none}
@media(max-width:760px){.plates{grid-template-columns:1fr 1fr}}
.info{display:grid;grid-template-columns:repeat(3,1fr);border:2px solid currentColor;margin-top:46px}
.info>div{padding:30px 26px;border-right:2px solid currentColor}
.info>div:last-child{border-right:0}
@media(max-width:820px){.info{grid-template-columns:1fr}.info>div{border-right:0;border-bottom:2px solid currentColor}}
.info h4{font-family:var(--display);font-weight:800;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.88rem}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff;padding:clamp(50px,7vw,94px) 0 0}
.dossier{display:grid;grid-template-columns:repeat(5,1fr);border-block:2px solid color-mix(in srgb,#fff 26%,transparent);margin-top:44px}
.dossier>div{padding:22px 18px;border-right:1px solid color-mix(in srgb,#fff 20%,transparent)}
.dossier>div:first-child{grid-column:span 2}
.dossier>div:last-child{border-right:0}
.dossier dt{font-size:.64rem;letter-spacing:.18em;text-transform:uppercase;opacity:.55}
.dossier dd{margin:8px 0 0;font-family:var(--display);font-weight:700;font-size:.94rem;text-transform:uppercase}
@media(max-width:880px){.dossier{grid-template-columns:1fr 1fr}.dossier>div:first-child{grid-column:span 2}}
.fin{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-family:var(--display);font-weight:800;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.fin li{padding:7px 0;opacity:.84;font-size:.9rem}
.footmark{--logo-hf:58px;margin-bottom:20px;display:block}
.fbot{padding:18px 0 40px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;opacity:.6}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['About us', '#story'], ['Center', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.tel)}</a>
</header>
<main id="main">
<section class="hero" id="top">
  <div class="hero-bg" data-par="24">${heroImg(site, 0)}</div>
  <div class="impact" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="hero-in wrap">
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <h1 data-rv="up">${esc(site.headline)}</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#services">${esc(site.ctaSecondary)}</a></div>
  </div>
</section>
<div class="bar">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
<section id="services"><div class="wrap">
  <div class="idx" data-rv="right">Section 01 / Services</div>
  <h2 class="h2" data-rv="up" data-vanish>Our services</h2>
  <p class="lead" data-rv="up">Advanced and personal care for motor vehicle accidents, work related injuries, and slip and falls.</p>
  <div class="shards">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 65}"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section class="dark" id="story"><div class="wrap two">
  <div><div class="idx" data-rv="right">Section 02 / About us</div>
    <h2 class="h2" data-rv="left" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="left" style="opacity:.86">${esc(site.story.body)}</p>
    <div class="figs">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div></div>
  <figure class="shard-img" data-rv="right" data-par="20">${img(site, 1)}</figure>
</div></section>
<section class="tone"><div class="wrap two">
  <figure class="shard-img" data-rv="left">${img(site, 2)}</figure>
  <div><div class="idx" data-rv="right">Section 03 / Treatment</div>
    <h2 class="h2" data-rv="right">${esc(site.feature.title)}</h2>
    <p class="lead" data-rv="right">${esc(site.feature.body)}</p>
    <div style="margin-top:30px" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a></div></div>
</div></section>
<section id="gallery"><div class="wrap">
  <div class="idx" data-rv="right">Section 04 / The center</div>
  <h2 class="h2" data-rv="up" data-vanish>Inside ${esc(site.short)}</h2>
  <div class="plates">${[3, 4, 5].map((i, k) => `<figure data-rv="up" data-delay="${k * 100}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="900" height="1120"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone" id="visit"><div class="wrap">
  <div class="idx" data-rv="right">Section 05 / Contact</div>
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
    <div>${inkmark(site, 'footmark')}<p style="opacity:.84;max-width:34ch;line-height:1.8;font-size:.9rem">${esc(site.closing)}</p></div>
    <div><h4>Services</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <dl class="dossier">
    <div><dt>Center</dt><dd>${esc(site.name)}</dd></div>
    <div><dt>Address</dt><dd>${esc(site.address)}</dd></div>
    <div><dt>Phone</dt><dd>${esc(site.tel)}</dd></div>
    <div><dt>Area</dt><dd>${esc(site.city)}</dd></div>
  </dl>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</div></footer>`,
});

/* ======================================================== 25. BUILD BLOCKS
   Modular masonry: blocks assemble on scroll into a wall, offset courses, a
   trade-yellow accent. Footer: a finished block wall with a mortar course. */
const buildBlocks = site => ({
  fonts: ['Manrope:wght@400;500;600;700;800', 'IBM+Plex+Sans:wght@400;500;600;700'],
  display: "'Manrope',system-ui,sans-serif", text: "'IBM Plex Sans',system-ui,sans-serif",
  radius: '6px', border: '2px', particles: 'dust',
  css: `
body{background:var(--paper)}
.btn{border-radius:4px;font-weight:700;letter-spacing:.02em}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:11px var(--gut);
  background:var(--deep);color:#fff;border-bottom:4px solid var(--accent2)}
.hd nav{display:flex;gap:26px;justify-content:center;font-weight:600;font-size:.9rem}
.hd nav a:hover{color:var(--accent2)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{position:relative;min-height:90svh;display:grid;align-items:center;overflow:hidden;background:var(--deep);color:#fff}
.wall{position:absolute;inset:0;z-index:1;display:grid;grid-template-columns:repeat(8,1fr);grid-auto-rows:12.5%;gap:3px;pointer-events:none}
.wall i{background:color-mix(in srgb,var(--deep) 96%,#fff);opacity:0;animation:lay .55s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes lay{from{opacity:1;transform:translateY(-16px)}to{opacity:0;transform:none}}
.hero-bg{position:absolute;inset:0}
.hero-bg img{width:100%;height:100%;object-fit:cover;opacity:.42}
.hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(80deg,var(--deep) 16%,color-mix(in srgb,var(--deep) 50%,transparent) 64%,transparent)}
.hero-in{position:relative;z-index:2;padding:80px 0}
.hero h1{font-size:clamp(2.4rem,5.8vw,5rem);font-weight:800;letter-spacing:-.04em;max-width:15ch;line-height:1.02}
.hero .eyebrow{color:var(--accent2);display:block;margin-bottom:22px}
.hero p{max-width:52ch;margin-top:22px;opacity:.86;line-height:1.8}
.hero .cta{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.hero .btn.ghost{color:#fff}
.course{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;background:var(--deep)}
.course div{background:var(--accent2);color:#141414;padding:22px 20px}
.course b{font-weight:800;font-size:clamp(1.1rem,2.2vw,1.7rem);display:block}
.course span{font-size:.78rem;margin-top:6px;display:block;opacity:.82;font-weight:600}
@media(max-width:760px){.course{grid-template-columns:1fr 1fr}}
section{padding:clamp(70px,9vw,130px) 0}
.tone{background:color-mix(in srgb,var(--panel) 46%,var(--paper))}
.dark{background:var(--deep);color:#fff}
.kick{font-weight:700;font-size:.74rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent2);display:block;margin-bottom:20px}
h2.h2{font-size:clamp(1.9rem,4.4vw,3.6rem);font-weight:800;letter-spacing:-.04em;max-width:20ch}
.lead{margin-top:18px;max-width:56ch;opacity:.78;line-height:1.85}
.blocks{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-top:52px}
.blocks article{grid-column:span 2;background:var(--paper);border:2px solid var(--ink);border-radius:var(--r);padding:30px 26px;
  transition:transform .5s cubic-bezier(.2,.8,.2,1),background .4s,color .4s}
.tone .blocks article{background:#fff}
.blocks article:nth-child(1),.blocks article:nth-child(4){grid-column:span 3}
.blocks article:nth-child(2),.blocks article:nth-child(5){grid-column:span 3}
.blocks article:hover{transform:translateY(-8px);background:var(--accent);color:#fff;border-color:var(--accent)}
.blocks article:hover .n{color:var(--accent2)}
.blocks .n{font-weight:800;font-size:.82rem;letter-spacing:.16em;color:var(--accent);display:block;margin-bottom:12px}
.blocks h3{font-size:1.2rem;font-weight:700;margin-bottom:9px}
.blocks p{font-size:.94rem;opacity:.8;line-height:1.7}
@media(max-width:820px){.blocks{grid-template-columns:1fr}.blocks article{grid-column:span 1!important}}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,72px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.blockimg{border:6px solid var(--accent2);border-radius:var(--r);overflow:hidden;aspect-ratio:4/3}
.quote{border-left:8px solid var(--accent2);padding-left:clamp(20px,3vw,40px);max-width:34ch}
.quote p{font-size:clamp(1.3rem,2.8vw,2.2rem);font-weight:800;letter-spacing:-.03em;line-height:1.18}
.quote cite{display:block;margin-top:18px;font-style:normal;font-size:.82rem;letter-spacing:.14em;text-transform:uppercase;opacity:.68}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:46px}
.figs div{border:2px solid color-mix(in srgb,#fff 26%,transparent);border-radius:var(--r);padding:24px 20px}
.figs b{font-weight:800;font-size:clamp(1.2rem,2.4vw,1.9rem);color:var(--accent2);display:block}
.figs span{font-size:.78rem;opacity:.74;margin-top:8px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.courses{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-top:50px}
.courses figure{margin:0;overflow:hidden;border-radius:var(--r);position:relative;grid-column:span 2}
.courses figure:nth-child(1){grid-column:span 4}
.courses figure:nth-child(4){grid-column:span 3}
.courses figure:nth-child(5){grid-column:span 3}
.courses img{width:100%;aspect-ratio:16/10;object-fit:cover;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.courses figure:hover img{transform:scale(1.06)}
.courses figcaption{position:absolute;left:0;right:0;bottom:0;padding:12px 16px;background:linear-gradient(0deg,rgba(0,0,0,.82),transparent);color:#fff;font-size:.82rem;font-weight:600}
@media(max-width:820px){.courses{grid-template-columns:1fr 1fr}.courses figure{grid-column:span 1!important}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:46px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{border:2px solid var(--ink);border-radius:var(--r);padding:28px 24px;background:#fff}
.info h4{font-weight:700;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.94rem;border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff;padding-top:0}
.mortar{display:grid;grid-template-columns:repeat(9,1fr);gap:4px;padding:0 var(--gut)}
.mortar i{height:22px;background:var(--accent2);border-radius:3px;opacity:.85}
.mortar i:nth-child(even){opacity:.5}
.fin{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;padding:clamp(50px,6vw,90px) 0 38px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-weight:700;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent2);margin-bottom:16px}
.fin li{padding:7px 0;opacity:.84;font-size:.94rem}
.footmark{--logo-hf:60px;margin-bottom:20px;display:block}
.fbot{border-top:1px solid color-mix(in srgb,#fff 16%,transparent);padding:20px 0 40px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.84rem;opacity:.62}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['Our mission', '#story'], ['Projects', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.tel)}</a>
</header>
<main id="main">
<section class="hero" id="top">
  <div class="wall" aria-hidden="true">${Array.from({ length: 64 }, (_, i) => `<i style="animation-delay:${(i % 8) * 45 + Math.floor(i / 8) * 70}ms"></i>`).join('')}</div>
  <div class="hero-bg" data-par="26">${heroImg(site, 0)}</div>
  <div class="hero-in wrap">
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <h1 data-rv="up">${esc(site.headline)}</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#story">${esc(site.ctaSecondary)}</a></div>
  </div>
</section>
<div class="course">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
<section id="services"><div class="wrap">
  <span class="kick" data-rv="down">What we offer</span>
  <h2 class="h2" data-rv="up" data-vanish>Interior and exterior remodeling</h2>
  <div class="blocks">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 70}"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section class="tone" id="story"><div class="wrap two">
  <figure class="blockimg media" data-rv="left" data-par="20">${img(site, 1)}</figure>
  <div><span class="kick" data-rv="down">Our mission</span>
    <h2 class="h2" data-rv="right" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="right">${esc(site.story.body)}</p>
    <div style="margin-top:30px" data-rv="up"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
</div></section>
<section class="dark"><div class="wrap two">
  <blockquote class="quote" data-rv="left"><p>${esc(site.quote.text)}</p><cite>${esc(site.quote.who)}</cite></blockquote>
  <div><h2 class="h2" style="font-size:clamp(1.5rem,3vw,2.3rem)" data-rv="right">${esc(site.feature.title)}</h2>
    <p class="lead" data-rv="right" style="opacity:.86">${esc(site.feature.body)}</p>
    <div class="figs">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div></div>
</div></section>
<section id="gallery"><div class="wrap">
  <span class="kick" data-rv="down">Projects</span>
  <h2 class="h2" data-rv="up" data-vanish>Recent work</h2>
  <div class="courses">${[2, 3, 4, 5, 0].map((i, k) => `<figure data-rv="up" data-delay="${k * 90}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="1200" height="750"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone" id="visit"><div class="wrap">
  <span class="kick" data-rv="down">Contact</span>
  <h2 class="h2" data-rv="up">Get a quote from ${esc(site.short)}</h2>
  <div class="info">
    <div data-rv="up"><h4>Reach us</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="180"><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer>
  <div class="mortar" aria-hidden="true">${Array.from({ length: 18 }, () => '<i></i>').join('')}</div>
  <div class="wrap"><div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.84;max-width:34ch;line-height:1.8">${esc(site.closing)}</p></div>
    <div><h4>Services</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li>${site.links.slice(0, 2).map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div></div>
</footer>`,
});

module.exports = { 'ridge-line': ridgeLine, 'liquid-suite': liquidSuite, 'stone-garden': stoneGarden, 'impact-dossier': impactDossier, 'build-blocks': buildBlocks };
