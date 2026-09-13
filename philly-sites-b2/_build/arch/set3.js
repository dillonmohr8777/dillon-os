const K = require('../kernel');
const { esc, attr, telHref, mapHref, inkmark, img, heroImg, hoursList } = K;

/* ========================================================= 11. GILDED SHEEN
   Luxury: gold shimmer sweeps across headings, silk gradients, thin gold rules,
   a slow-fading quote. Footer: gilded bar with a hairline monogram rule. */
const gildedSheen = site => ({
  fonts: ['Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,700', 'Manrope:wght@300;400;500;700'],
  display: "'Bodoni Moda',Didot,serif", text: "'Manrope',system-ui,sans-serif",
  radius: '3px', border: '1px', particles: 'gold',
  css: `
body{background:var(--paper)}
.gild{background:linear-gradient(100deg,var(--accent2) 6%,var(--accent) 32%,#fff8e2 44%,var(--accent) 58%,var(--accent2) 88%);
  background-size:280% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shimmer 9s ease-in-out infinite}
@keyframes shimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:24px;padding:16px var(--gut);
  background:color-mix(in srgb,var(--paper) 88%,transparent);backdrop-filter:blur(14px);
  border-bottom:1px solid color-mix(in srgb,var(--accent) 34%,transparent);transition:padding .4s ease}
.hd.is-stuck{padding-block:10px}
.hd nav{display:flex;gap:30px;justify-content:center;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;font-weight:500}
.hd nav a{position:relative;padding-bottom:4px}
.hd nav a::after{content:"";position:absolute;left:50%;bottom:0;width:0;height:1px;background:var(--accent);transition:width .45s ease,left .45s ease}
.hd nav a:hover::after{width:100%;left:0}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{position:relative;min-height:92svh;display:grid;align-items:center;overflow:hidden;text-align:center}
.hero-bg{position:absolute;inset:0}
.hero-bg img{width:100%;height:100%;object-fit:cover}
.hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--paper) 82%,transparent),color-mix(in srgb,var(--paper) 60%,transparent) 44%,color-mix(in srgb,var(--paper) 92%,transparent))}
.hero-in{position:relative;z-index:2;padding:90px 0}
.hero h1{font-size:clamp(2.2rem,5vw,4.4rem);font-weight:400;letter-spacing:-.01em;max-width:20ch;margin-inline:auto;font-style:italic}
.hero .eyebrow{display:block;margin-bottom:26px;letter-spacing:.3em;color:var(--accent2)}
.hero p{max-width:54ch;margin:26px auto 0;opacity:.76;line-height:1.85;font-weight:300}
.hero .cta{display:flex;gap:14px;justify-content:center;margin-top:36px;flex-wrap:wrap}
.rule{width:64px;height:1px;background:var(--accent);margin:30px auto}
.heromark{--logo-hh:clamp(74px,9vw,120px);margin-bottom:30px;display:inline-block}
section{padding:clamp(74px,9vw,136px) 0}
.tone{background:color-mix(in srgb,var(--panel) 70%,var(--paper))}
.deep{background:var(--deep);color:color-mix(in srgb,var(--paper) 94%,#fff)}
h2.h2{font-size:clamp(1.9rem,4.2vw,3.5rem);font-weight:400;letter-spacing:-.01em;max-width:20ch;font-style:italic}
.lead{margin-top:20px;max-width:56ch;opacity:.76;font-weight:300;line-height:1.9}
.kick{font-size:.72rem;letter-spacing:.28em;text-transform:uppercase;color:var(--accent2);display:block;margin-bottom:22px}
.center{text-align:center}.center .h2,.center .lead{margin-inline:auto}
.svc{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:color-mix(in srgb,var(--accent) 30%,transparent);margin-top:56px;border:1px solid color-mix(in srgb,var(--accent) 30%,transparent)}
@media(max-width:900px){.svc{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.svc{grid-template-columns:1fr}}
.svc article{background:var(--paper);padding:40px 32px;transition:background .5s ease}
.tone .svc article{background:color-mix(in srgb,var(--panel) 70%,var(--paper))}
.svc article:hover{background:var(--deep);color:var(--paper)}
.svc article:hover .n{color:var(--accent)}
.svc .n{font-family:var(--display);font-size:1.9rem;color:var(--accent2);display:block;margin-bottom:16px;transition:color .4s;font-style:italic}
.svc h3{font-family:var(--display);font-size:1.24rem;font-weight:400;margin-bottom:10px}
.svc p{font-size:.92rem;font-weight:300;opacity:.78;line-height:1.75}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,80px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.frame{position:relative;padding:18px}
.frame::before{content:"";position:absolute;inset:0;border:1px solid var(--accent);pointer-events:none}
.frame .media{aspect-ratio:4/5}
.quote{text-align:center;max-width:34ch;margin-inline:auto}
.quote p{font-family:var(--display);font-size:clamp(1.5rem,3.2vw,2.7rem);font-style:italic;font-weight:400;line-height:1.35}
.quote cite{display:block;margin-top:26px;font-family:var(--text);font-style:normal;font-size:.78rem;letter-spacing:.24em;text-transform:uppercase;opacity:.62}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:color-mix(in srgb,var(--accent) 30%,transparent);margin-top:52px;border:1px solid color-mix(in srgb,var(--accent) 30%,transparent)}
.figs div{background:var(--deep);padding:32px 22px;text-align:center}
.figs b{font-family:var(--display);font-size:clamp(1.3rem,2.6vw,2.1rem);display:block;font-style:italic}
.figs span{font-size:.76rem;opacity:.66;margin-top:8px;display:block;font-weight:300}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.silk{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:52px}
.silk figure{margin:0;position:relative;overflow:hidden}
.silk figure:nth-child(2){transform:translateY(38px)}
.silk img{width:100%;aspect-ratio:3/4;object-fit:cover;transition:transform 1.2s cubic-bezier(.2,.8,.2,1)}
.silk figure:hover img{transform:scale(1.06)}
.silk figcaption{position:absolute;left:0;right:0;bottom:0;padding:16px;background:linear-gradient(0deg,rgba(0,0,0,.72),transparent);color:#fff;font-size:.78rem;font-weight:300;letter-spacing:.06em}
@media(max-width:760px){.silk{grid-template-columns:1fr 1fr}.silk figure:nth-child(2){transform:none}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:44px;margin-top:50px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info h4{font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:var(--accent2);margin-bottom:20px}
.info li,.info p{padding:9px 0;font-weight:300;font-size:.95rem;border-bottom:1px solid color-mix(in srgb,currentColor 12%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:color-mix(in srgb,var(--paper) 94%,#fff)}
.gildbar{height:3px;background:linear-gradient(90deg,transparent,var(--accent) 22%,#fff8e2 50%,var(--accent) 78%,transparent)}
.fin{padding:clamp(58px,7vw,104px) 0 40px;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:44px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;opacity:.55;margin-bottom:18px}
.fin li{padding:8px 0;font-weight:300;opacity:.84;font-size:.95rem}
.footmark{--logo-hf:60px;margin-bottom:22px;display:block}
.fbot{border-top:1px solid color-mix(in srgb,var(--accent) 34%,transparent);padding:22px 0 42px;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;font-size:.76rem;letter-spacing:.14em;text-transform:uppercase;opacity:.6}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['About', '#story'], ['Our work', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Book a clean</a>
</header>
<main id="main">
<section class="hero" id="top">
  <div class="hero-bg" data-par="26">${heroImg(site, 0)}</div>
  <div class="hero-in wrap">
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <span data-rv="scale">${inkmark(site, 'heromark')}</span>
    <h1 data-rv="up"><span class="gild">${esc(site.headline)}</span></h1>
    <div class="rule" data-rv="scale"></div>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#services">${esc(site.ctaSecondary)}</a></div>
  </div>
</section>
<section class="center" id="services"><div class="wrap">
  <span class="kick" data-rv="down">Services</span>
  <h2 class="h2" data-rv="up" data-vanish>Residential cleaning, personalised</h2>
  <div class="svc">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 70}" style="text-align:left"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section class="tone" id="story"><div class="wrap two">
  <figure class="frame" data-rv="left" data-par="20"><div class="media">${img(site, 1)}</div></figure>
  <div><span class="kick" data-rv="down">About</span>
    <h2 class="h2" data-rv="right" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="right">${esc(site.story.body)}</p>
    <div style="margin-top:32px" data-rv="up"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
</div></section>
<section class="deep center"><div class="wrap">
  <blockquote class="quote" data-rv="blur"><p><span class="gild">${esc(site.quote.text)}</span></p><cite>${esc(site.quote.who)}</cite></blockquote>
  <div class="figs">${site.proof.map(p => `<div data-rv="up"><b class="gild">${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
</div></section>
<section id="gallery"><div class="wrap">
  <span class="kick" data-rv="down">Our work</span>
  <h2 class="h2" data-rv="up" data-vanish>${esc(site.feature.title)}</h2>
  <p class="lead" data-rv="up">${esc(site.feature.body)}</p>
  <div class="silk">${[2, 3, 4].map((i, k) => `<figure data-rv="up" data-delay="${k * 120}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="900" height="1200"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone" id="visit"><div class="wrap">
  <span class="kick" data-rv="down">Contact</span>
  <h2 class="h2" data-rv="up">Visit ${esc(site.short)}</h2>
  <div class="info">
    <div data-rv="up"><h4>Reach us</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="180"><h4>Explore</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
<section class="deep center"><div class="wrap">
  <h2 class="h2" data-rv="blur" style="margin-inline:auto"><span class="gild">${esc(site.closing)}</span></h2>
  <div style="margin-top:34px" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a></div>
</div></section>
</main>
<footer>
  <div class="gildbar" aria-hidden="true"></div>
  <div class="wrap"><div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="font-weight:300;opacity:.8;max-width:34ch;line-height:1.85">${esc(site.address)}</p><p style="margin-top:10px"><a href="${telHref(site.tel)}">${esc(site.tel)}</a></p></div>
    <div><h4>Services</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Explore</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div></div>
</footer>`,
});

/* ======================================================= 12. SPINAL COLUMN
   A vertical column of vertebra nodes down the page doubles as scroll progress;
   each section lights its node. Footer: the column base plate. */
const spinalColumn = site => ({
  fonts: ['Space+Grotesk:wght@400;500;600;700', 'Inter:wght@400;500;600;700'],
  display: "'Space Grotesk',system-ui,sans-serif", text: "'Inter',system-ui,sans-serif",
  radius: '14px', border: '1px', particles: 'dust',
  css: `
body{background:var(--paper)}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:12px var(--gut);
  background:color-mix(in srgb,var(--paper) 88%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.hd nav{display:flex;gap:26px;justify-content:center;font-weight:600;font-size:.88rem}
.hd nav a:hover{color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.spine{position:fixed;right:clamp(12px,2.4vw,42px);top:50%;translate:0 -50%;z-index:60;display:grid;gap:11px;pointer-events:auto}
.spine a{display:block;width:12px;height:20px;border-radius:5px;background:color-mix(in srgb,var(--ink) 16%,transparent);transition:background .4s ease,transform .4s cubic-bezier(.2,.8,.2,1)}
.spine a.on{background:var(--accent);transform:scaleX(1.6)}
.spine a:hover{background:var(--accent2)}
@media(max-width:1050px){.spine{display:none}}
.hero{position:relative;min-height:90svh;display:grid;align-items:center;overflow:hidden;background:var(--deep);color:#fff}
.hero-bg{position:absolute;inset:0}
.hero-bg img{width:100%;height:100%;object-fit:cover;opacity:.34}
.hero-in{position:relative;z-index:2;padding:80px 0;display:grid;grid-template-columns:1.15fr .85fr;gap:clamp(28px,5vw,64px);align-items:center}
@media(max-width:900px){.hero-in{grid-template-columns:1fr}}
.hero h1{font-size:clamp(2.4rem,5.6vw,4.9rem);font-weight:700;letter-spacing:-.04em;max-width:15ch;line-height:1}
.hero .eyebrow{color:var(--accent2);display:block;margin-bottom:22px}
.hero p{margin-top:22px;max-width:50ch;opacity:.84;line-height:1.8}
.hero .cta{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.hero .btn.ghost{color:#fff}
.vertcard{border-radius:20px;padding:26px;display:grid;gap:12px}
.vertcard .row{display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid color-mix(in srgb,#fff 14%,transparent);font-size:.92rem}
.vertcard .row:last-child{border-bottom:0}
.vertcard .row b{color:var(--accent2);font-family:var(--display)}
section{padding:clamp(70px,9vw,130px) 0;position:relative}
.tone{background:color-mix(in srgb,var(--panel) 40%,var(--paper))}
.dark{background:var(--deep);color:#fff}
.node{display:flex;align-items:center;gap:16px;margin-bottom:24px}
.node i{width:16px;height:28px;border-radius:6px;background:var(--accent);display:block;flex:none}
.node span{font-weight:700;font-size:.76rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent)}
h2.h2{font-size:clamp(1.9rem,4.4vw,3.6rem);font-weight:700;letter-spacing:-.035em;max-width:20ch}
.lead{margin-top:18px;max-width:56ch;opacity:.76;line-height:1.8}
.stack{margin-top:52px;display:grid;gap:12px}
.stack article{display:grid;grid-template-columns:76px 1fr;gap:24px;align-items:start;padding:28px 26px;border-radius:var(--r);
  background:var(--paper);border:1px solid color-mix(in srgb,var(--ink) 10%,transparent);
  transition:transform .5s cubic-bezier(.2,.8,.2,1),border-color .4s,box-shadow .5s}
.tone .stack article{background:#fff}
.stack article:hover{transform:translateX(12px);border-color:var(--accent);box-shadow:-8px 16px 40px -26px color-mix(in srgb,var(--accent) 90%,transparent)}
.stack .n{font-family:var(--display);font-weight:700;font-size:1.7rem;color:color-mix(in srgb,var(--accent) 40%,transparent);line-height:1}
.stack h3{font-family:var(--display);font-size:1.18rem;font-weight:600;margin-bottom:9px}
.stack p{font-size:.94rem;opacity:.76;line-height:1.7}
@media(max-width:600px){.stack article{grid-template-columns:1fr;gap:10px}}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,74px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.stackimg{border-radius:var(--r);overflow:hidden;aspect-ratio:4/5}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:46px}
.figs div{border-radius:var(--r);padding:26px 20px;background:color-mix(in srgb,#fff 8%,transparent);border:1px solid color-mix(in srgb,#fff 16%,transparent)}
.figs b{font-family:var(--display);font-size:clamp(1.3rem,2.6vw,2rem);font-weight:700;color:var(--accent2);display:block}
.figs span{font-size:.78rem;opacity:.72;margin-top:8px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.disc{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:50px}
.disc figure{margin:0;border-radius:var(--r);overflow:hidden;position:relative}
.disc img{width:100%;aspect-ratio:4/5;object-fit:cover;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.disc figure:hover img{transform:scale(1.06)}
.disc figcaption{position:absolute;left:14px;right:14px;bottom:14px;color:#fff;font-size:.82rem;font-weight:500;text-shadow:0 2px 12px rgba(0,0,0,.75)}
@media(max-width:760px){.disc{grid-template-columns:1fr 1fr}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:46px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{border-radius:var(--r);padding:30px 26px;background:#fff;border:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.info h4{font-family:var(--display);font-weight:700;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.94rem;border-bottom:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff;padding:clamp(56px,7vw,100px) 0 40px}
.base{display:flex;gap:6px;justify-content:center;margin-bottom:44px}
.base i{width:14px;height:26px;border-radius:6px;background:color-mix(in srgb,var(--accent2) 60%,transparent);opacity:.35}
.base i:nth-child(odd){opacity:.6}
.fin{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-family:var(--display);font-weight:700;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;opacity:.56;margin-bottom:16px}
.fin li{padding:7px 0;opacity:.84;font-size:.94rem}
.footmark{--logo-hf:60px;margin-bottom:20px;display:block}
.fbot{margin-top:48px;padding-top:22px;border-top:1px solid color-mix(in srgb,#fff 16%,transparent);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.82rem;opacity:.6}`,
  body: `
<nav class="spine" aria-label="Section navigation">${[['#top', 'Top'], ['#services', 'Services'], ['#story', 'About'], ['#feature', 'Team'], ['#gallery', 'Clinic'], ['#visit', 'Visit']].map(l => `<a href="${l[0]}"><span class="sr">${l[1]}</span></a>`).join('')}</nav>
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['About', '#story'], ['Clinic', '#gallery'], ['Visit', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Schedule</a>
</header>
<main id="main">
<section class="hero" id="top">
  <div class="hero-bg" data-par="26">${heroImg(site, 0)}</div>
  <div class="hero-in wrap">
    <div>
      <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
      <h1 data-rv="up">${esc(site.headline)}</h1>
      <p data-rv="up">${esc(site.sub)}</p>
      <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#story">${esc(site.ctaSecondary)}</a></div>
    </div>
    <div class="vertcard lg" data-rv="right">${site.proof.map(p => `<div class="row"><span>${esc(p[1])}</span><b>${esc(p[0])}</b></div>`).join('')}</div>
  </div>
</section>
<section id="services"><div class="wrap">
  <div class="node" data-rv="right"><i></i><span>What we offer</span></div>
  <h2 class="h2" data-rv="up" data-vanish>Proactive, whole body care</h2>
  <div class="stack">${site.services.map((s, i) => `<article data-rv="right" data-delay="${i * 60}"><span class="n">0${i + 1}</span><div><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></div></article>`).join('')}</div>
</div></section>
<section class="tone" id="story"><div class="wrap two">
  <figure class="stackimg media" data-rv="left" data-par="22">${img(site, 1)}</figure>
  <div><div class="node" data-rv="right"><i></i><span>About the clinic</span></div>
    <h2 class="h2" data-rv="right" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="right">${esc(site.story.body)}</p>
    <div style="margin-top:30px" data-rv="up"><a class="btn" href="${telHref(site.tel)}">${esc(site.ctaPrimary)}</a></div></div>
</div></section>
<section class="dark" id="feature"><div class="wrap">
  <div class="node" data-rv="right"><i style="background:var(--accent2)"></i><span style="color:var(--accent2)">The team</span></div>
  <h2 class="h2" data-rv="up">${esc(site.feature.title)}</h2>
  <p class="lead" data-rv="up" style="opacity:.86">${esc(site.feature.body)}</p>
  <div class="figs">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
</div></section>
<section id="gallery"><div class="wrap">
  <div class="node" data-rv="right"><i></i><span>Inside the clinic</span></div>
  <h2 class="h2" data-rv="up" data-vanish>Inside ${esc(site.short)}</h2>
  <div class="disc">${[2, 3, 4].map((i, k) => `<figure data-rv="up" data-delay="${k * 110}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="900" height="1120"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone" id="visit"><div class="wrap">
  <div class="node" data-rv="right"><i></i><span>Visit</span></div>
  <h2 class="h2" data-rv="up">Visit ${esc(site.short)}</h2>
  <div class="info">
    <div data-rv="up"><h4>Contact</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="180"><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer><div class="wrap">
  <div class="base" aria-hidden="true">${Array.from({ length: 11 }, () => '<i></i>').join('')}</div>
  <div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.82;max-width:34ch;line-height:1.8">${esc(site.closing)}</p></div>
    <div><h4>Services</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li>${site.links.slice(0, 2).map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</div></footer>`,
  extraJs: `(function(){var ids=['top','services','story','feature','gallery','visit'],dots=[].slice.call(document.querySelectorAll('.spine a'));
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var i=ids.indexOf(e.target.id);
  dots.forEach(function(d,k){d.classList.toggle('on',k===i);});});},{threshold:.3});
  ids.forEach(function(id){var el=document.getElementById(id);if(el)io.observe(el);});})();`,
});

/* ========================================================== 13. PICKET RUN
   Vertical picket slats: the hero is sliced into pickets that swing open, a
   rail runs between sections. Footer: a full picket fence with post caps. */
const picketRun = site => ({
  fonts: ['Bebas+Neue', 'Source+Sans+3:wght@400;600;700'],
  display: "'Bebas Neue',Impact,sans-serif", text: "'Source Sans 3',system-ui,sans-serif",
  radius: '6px', border: '2px', particles: 'dust',
  css: `
body{background:var(--paper)}
.btn{border-radius:4px;font-family:var(--display);letter-spacing:.06em;font-size:1.02rem}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:11px var(--gut);
  background:var(--deep);color:#fff;border-bottom:4px solid var(--accent)}
.hd nav{display:flex;gap:26px;justify-content:center;font-family:var(--display);font-size:1.02rem;letter-spacing:.06em}
.hd nav a:hover{color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{position:relative;min-height:88svh;display:grid;align-items:center;overflow:hidden;color:#fff;background:var(--deep)}
.pickets{position:absolute;inset:0;display:flex;z-index:1}
.pickets i{flex:1;background:var(--deep);transform-origin:left center;animation:swing 1.25s cubic-bezier(.65,0,.25,1) forwards;border-right:2px solid color-mix(in srgb,#fff 10%,transparent)}
@keyframes swing{to{transform:perspective(900px) rotateY(-96deg);opacity:0}}
.hero-bg{position:absolute;inset:0}
.hero-bg img{width:100%;height:100%;object-fit:cover;opacity:.5}
.hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--deep) 12%,color-mix(in srgb,var(--deep) 42%,transparent) 62%,transparent)}
.hero-in{position:relative;z-index:2;padding:80px 0}
.hero h1{font-family:var(--display);font-size:clamp(3rem,9vw,8rem);line-height:.9;letter-spacing:.01em;max-width:12ch}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:20px}
.hero p{max-width:52ch;margin-top:20px;opacity:.88;font-size:1.06rem}
.hero .cta{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.rail{height:22px;background:var(--accent);position:relative}
.rail::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 46px,color-mix(in srgb,#000 20%,transparent) 46px 50px)}
section{padding:clamp(70px,9vw,130px) 0;position:relative}
.tone{background:var(--panel)}
.dark{background:var(--deep);color:#fff}
h2.h2{font-family:var(--display);font-size:clamp(2.2rem,5.6vw,4.8rem);letter-spacing:.01em;line-height:.98;max-width:16ch}
.lead{margin-top:16px;max-width:56ch;opacity:.8;line-height:1.75;font-size:1.02rem}
.slats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:50px}
@media(max-width:900px){.slats{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.slats{grid-template-columns:1fr}}
.slats article{background:var(--paper);border-top:8px solid var(--accent);padding:30px 26px;
  box-shadow:0 16px 34px -26px rgba(0,0,0,.5);transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.tone .slats article{background:#fff}
.slats article:nth-child(even){transform:translateY(20px)}
.slats article:hover{transform:translateY(-8px)}
@media(max-width:600px){.slats article:nth-child(even){transform:none}}
.slats h3{font-family:var(--display);font-size:1.5rem;letter-spacing:.02em;margin-bottom:8px}
.slats p{font-size:.95rem;opacity:.78;line-height:1.7}
.slats .n{font-family:var(--display);color:var(--accent2);font-size:1.1rem;display:block;margin-bottom:10px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,72px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.postimg{border:8px solid var(--accent);border-radius:6px;overflow:hidden;aspect-ratio:4/3}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:44px}
.figs div{background:var(--accent);color:#141414;padding:24px 20px;border-radius:4px}
.figs b{font-family:var(--display);font-size:clamp(1.5rem,3vw,2.4rem);display:block;line-height:1}
.figs span{font-size:.8rem;margin-top:6px;display:block;font-weight:600}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.quote{max-width:26ch;margin-inline:auto;text-align:center}
.quote p{font-family:var(--display);font-size:clamp(2rem,5vw,4rem);line-height:1.02;color:var(--accent)}
.quote cite{display:block;margin-top:20px;font-style:normal;font-size:.86rem;letter-spacing:.14em;text-transform:uppercase;opacity:.7;font-family:var(--text)}
.fencegrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:50px}
.fencegrid figure{margin:0;overflow:hidden;border-radius:4px 4px 0 0;position:relative;border-bottom:6px solid var(--accent)}
.fencegrid img{width:100%;aspect-ratio:3/4;object-fit:cover;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.fencegrid figure:hover img{transform:scale(1.07)}
.fencegrid figcaption{position:absolute;left:0;right:0;bottom:0;padding:12px;background:linear-gradient(0deg,rgba(0,0,0,.8),transparent);color:#fff;font-size:.78rem;font-weight:600}
@media(max-width:760px){.fencegrid{grid-template-columns:1fr 1fr}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:44px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{background:#fff;border-top:8px solid var(--accent2);padding:28px 24px;border-radius:0 0 6px 6px}
.info h4{font-family:var(--display);font-size:1.3rem;color:var(--deep);margin-bottom:14px}
.info li,.info p{padding:7px 0;font-size:.94rem;border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff;padding-top:0}
.fence{display:flex;gap:8px;padding:0 var(--gut);height:76px;align-items:end}
.fence i{flex:1;background:var(--accent);border-radius:4px 4px 0 0;clip-path:polygon(0 12%,50% 0,100% 12%,100% 100%,0 100%)}
.fence i:nth-child(even){opacity:.72}
.fin{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px;padding:clamp(50px,6vw,90px) 0 38px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-family:var(--display);font-size:1.3rem;color:var(--accent);margin-bottom:14px}
.fin li{padding:7px 0;opacity:.86;font-size:.95rem}
.footmark{--logo-hf:62px;margin-bottom:20px;display:block}
.fbot{border-top:1px solid color-mix(in srgb,#fff 16%,transparent);padding:20px 0 40px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.84rem;opacity:.62}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Fencing', '#services'], ['Iron works', '#story'], ['Gallery', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Free estimate</a>
</header>
<main id="main">
<section class="hero" id="top">
  <div class="pickets" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<i style="animation-delay:${i * 65}ms"></i>`).join('')}</div>
  <div class="hero-bg" data-par="26">${heroImg(site, 0)}</div>
  <div class="hero-in wrap">
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <h1 data-rv="up">${esc(site.headline)}</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" style="color:#fff" href="#gallery">${esc(site.ctaSecondary)}</a></div>
  </div>
</section>
<div class="rail" aria-hidden="true"></div>
<section id="services"><div class="wrap">
  <h2 class="h2" data-rv="up" data-vanish>What we build</h2>
  <p class="lead" data-rv="up">Chain link, wood and iron. Installation, privacy and picket.</p>
  <div class="slats">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 70}"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section class="tone" id="story"><div class="wrap two">
  <div><h2 class="h2" data-rv="left" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="left">${esc(site.story.body)}</p>
    <div class="figs">${site.proof.map(p => `<div data-rv="scale"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div></div>
  <figure class="postimg media" data-rv="right" data-par="20">${img(site, 1)}</figure>
</div></section>
<section class="dark"><div class="wrap">
  <blockquote class="quote" data-rv="blur"><p>${esc(site.quote.text)}</p><cite>${esc(site.quote.who)}</cite></blockquote>
  <div class="two" style="margin-top:60px">
    <figure class="postimg media" data-rv="left">${img(site, 2)}</figure>
    <div><h2 class="h2" data-rv="right">${esc(site.feature.title)}</h2><p class="lead" data-rv="right">${esc(site.feature.body)}</p>
      <div style="margin-top:28px" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a></div></div>
  </div>
</div></section>
<section id="gallery"><div class="wrap">
  <h2 class="h2" data-rv="up" data-vanish>Fence gallery</h2>
  <div class="fencegrid">${[3, 4, 5, 0].map((i, k) => `<figure data-rv="up" data-delay="${k * 90}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="900" height="1200"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone" id="visit"><div class="wrap">
  <h2 class="h2" data-rv="up">Contact ${esc(site.short)}</h2>
  <div class="info">
    <div data-rv="up"><h4>Reach us</h4>${K.visitRows(site).map(r => `<p><a href="${r[2]}"${r[0] === 'Website' ? ' target="_blank" rel="noopener"' : ''}>${esc(r[1])}</a></p>`).join('')}</div>
    <div data-rv="up" data-delay="90"><h4>Hours</h4>${hoursList(site, 'hrs')}</div>
    <div data-rv="up" data-delay="180"><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
</div></section>
</main>
<footer>
  <div class="fence" aria-hidden="true">${Array.from({ length: 18 }, () => '<i></i>').join('')}</div>
  <div class="wrap"><div class="fin">
    <div>${inkmark(site, 'footmark')}<p style="opacity:.84;max-width:34ch;line-height:1.75">${esc(site.closing)}</p></div>
    <div><h4>Fencing</h4><ul>${site.services.slice(0, 5).map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="${telHref(site.tel)}">${esc(site.tel)}</a></li><li><a href="${mapHref(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></li>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div></div>
</footer>`,
});

/* ====================================================== 14. VITALS MONITOR
   Clinical HUD: an ECG trace that runs across the page, monitor-bezel panels,
   live-looking readouts, mono numerals. Footer: monitor status strip. */
const vitalsMonitor = site => ({
  fonts: ['Chakra+Petch:wght@400;500;600;700', 'Roboto:wght@400;500;700'],
  display: "'Chakra Petch',system-ui,sans-serif", text: "'Roboto',system-ui,sans-serif",
  radius: '10px', border: '1px', particles: 'spark',
  css: `
body{background:var(--paper)}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:11px var(--gut);
  background:var(--deep);color:#fff;border-bottom:1px solid color-mix(in srgb,var(--accent) 50%,transparent)}
.hd nav{display:flex;gap:24px;justify-content:center;font-family:var(--display);font-weight:600;font-size:.86rem;letter-spacing:.06em;text-transform:uppercase}
.hd nav a:hover{color:var(--accent)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.ecg{background:var(--deep);padding:0;overflow:hidden;border-bottom:1px solid color-mix(in srgb,var(--accent) 40%,transparent)}
.ecg svg{display:block;width:200%;height:58px;animation:trace 9s linear infinite}
.ecg path{fill:none;stroke:var(--accent);stroke-width:2;filter:drop-shadow(0 0 6px var(--accent))}
@keyframes trace{to{transform:translateX(-50%)}}
.hero{position:relative;min-height:86svh;display:grid;align-items:center;background:var(--deep);color:#fff;overflow:hidden}
.hero::before{content:"";position:absolute;inset:0;background-image:linear-gradient(color-mix(in srgb,var(--accent) 8%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--accent) 8%,transparent) 1px,transparent 1px);background-size:34px 34px}
.hero-in{position:relative;z-index:2;padding:74px 0;display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(28px,5vw,64px);align-items:center}
@media(max-width:900px){.hero-in{grid-template-columns:1fr}}
.hero h1{font-family:var(--display);font-size:clamp(2.3rem,5.4vw,4.6rem);font-weight:700;line-height:1.02;letter-spacing:-.02em;max-width:15ch;text-transform:uppercase}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:20px}
.hero p{margin-top:20px;max-width:50ch;opacity:.84;line-height:1.8}
.hero .cta{display:flex;gap:12px;margin-top:30px;flex-wrap:wrap}
.hero .btn.ghost{color:#fff}
.bezel{border:1px solid color-mix(in srgb,var(--accent) 45%,transparent);border-radius:14px;padding:12px;background:color-mix(in srgb,#000 26%,transparent)}
.bezel .media{border-radius:8px;aspect-ratio:4/3}
.readout{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;margin-top:12px;background:color-mix(in srgb,var(--accent) 30%,transparent)}
.readout div{background:var(--deep);padding:16px 14px}
.readout b{font-family:var(--display);font-size:1.3rem;color:var(--accent);display:block;line-height:1}
.readout span{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;opacity:.6;display:block;margin-top:6px}
section{padding:clamp(70px,9vw,128px) 0}
.tone{background:color-mix(in srgb,var(--panel) 30%,var(--paper))}
.dark{background:var(--deep);color:#fff}
.tagline{display:inline-flex;align-items:center;gap:9px;font-family:var(--display);font-size:.76rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:20px}
.tagline::before{content:"";width:9px;height:9px;border-radius:50%;background:var(--accent);animation:pulse 1.8s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 70%,transparent)}50%{opacity:.5;box-shadow:0 0 0 8px transparent}}
h2.h2{font-family:var(--display);font-size:clamp(1.9rem,4.2vw,3.4rem);font-weight:700;text-transform:uppercase;letter-spacing:-.015em;max-width:20ch}
.lead{margin-top:18px;max-width:56ch;opacity:.78;line-height:1.8}
.mods{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:50px}
@media(max-width:900px){.mods{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.mods{grid-template-columns:1fr}}
.mods article{border:1px solid color-mix(in srgb,var(--ink) 14%,transparent);border-radius:var(--r);padding:30px 26px;background:var(--paper);position:relative;overflow:hidden;transition:border-color .4s,transform .5s cubic-bezier(.2,.8,.2,1)}
.mods article::after{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);transform:translateX(-100%);transition:transform .8s ease}
.mods article:hover{border-color:var(--accent);transform:translateY(-6px)}
.mods article:hover::after{transform:translateX(100%)}
.mods .n{font-family:var(--display);font-size:.78rem;letter-spacing:.2em;color:var(--accent2);display:block;margin-bottom:14px}
.mods h3{font-family:var(--display);font-size:1.16rem;font-weight:600;margin-bottom:9px;text-transform:uppercase;letter-spacing:-.01em}
.mods p{font-size:.93rem;opacity:.76;line-height:1.7}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,72px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:color-mix(in srgb,var(--accent) 34%,transparent);margin-top:46px;border:1px solid color-mix(in srgb,var(--accent) 34%,transparent);border-radius:var(--r);overflow:hidden}
.figs div{background:var(--deep);padding:26px 20px}
.figs b{font-family:var(--display);font-size:clamp(1.3rem,2.6vw,2rem);color:var(--accent);display:block;line-height:1}
.figs span{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;opacity:.66;margin-top:8px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.scans{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:50px}
.scans figure{margin:0;border:1px solid color-mix(in srgb,var(--accent) 40%,transparent);border-radius:var(--r);overflow:hidden;position:relative}
.scans img{width:100%;aspect-ratio:4/3;object-fit:cover;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.scans figure:hover img{transform:scale(1.06)}
.scans figcaption{position:absolute;left:0;right:0;bottom:0;padding:10px 14px;background:color-mix(in srgb,var(--deep) 88%,transparent);color:#fff;font-family:var(--display);font-size:.74rem;letter-spacing:.1em;text-transform:uppercase}
@media(max-width:760px){.scans{grid-template-columns:1fr 1fr}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:46px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{border:1px solid color-mix(in srgb,var(--ink) 14%,transparent);border-radius:var(--r);padding:28px 24px;background:var(--paper)}
.info h4{font-family:var(--display);font-size:.78rem;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.info li,.info p{padding:8px 0;font-size:.94rem;border-bottom:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff;padding:clamp(52px,7vw,96px) 0 0}
.status{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:color-mix(in srgb,var(--accent) 34%,transparent);border-block:1px solid color-mix(in srgb,var(--accent) 34%,transparent);margin-top:46px}
.status div{background:var(--deep);padding:20px 18px}
.status dt{font-family:var(--display);font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;opacity:.55}
.status dd{margin:7px 0 0;font-size:.92rem}
@media(max-width:820px){.status{grid-template-columns:1fr 1fr}}
.fin{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-family:var(--display);font-size:.78rem;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.fin li{padding:7px 0;opacity:.84;font-size:.94rem}
.footmark{--logo-hf:58px;margin-bottom:20px;display:block}
.fbot{padding:18px 0 40px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-family:var(--display);font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;opacity:.6}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['Facility', '#story'], ['Inside', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.tel)}</a>
</header>
<div class="ecg" aria-hidden="true"><svg viewBox="0 0 1200 58" preserveAspectRatio="none"><path d="M0 29 H120 l14 -22 l12 44 l14 -22 H400 l14 -22 l12 44 l14 -22 H700 l14 -22 l12 44 l14 -22 H1000 l14 -22 l12 44 l14 -22 H1200"/></svg></div>
<main id="main">
<section class="hero" id="top"><div class="hero-in wrap">
  <div>
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <h1 data-rv="up">${esc(site.headline)}</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#services">${esc(site.ctaSecondary)}</a></div>
  </div>
  <div class="bezel" data-rv="right">
    <figure class="media">${heroImg(site, 0)}</figure>
    <div class="readout">${site.proof.map(p => `<div><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>
  </div>
</div></section>
<section id="services"><div class="wrap">
  <span class="tagline" data-rv="right">Services</span>
  <h2 class="h2" data-rv="up" data-vanish>Unique treatment plans for each patient</h2>
  <div class="mods">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 70}"><span class="n">MOD 0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section class="dark" id="story"><div class="wrap two">
  <figure class="bezel" data-rv="left" data-par="20"><div class="media">${img(site, 1)}</div></figure>
  <div><span class="tagline" data-rv="right">The facility</span>
    <h2 class="h2" data-rv="right" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="right" style="opacity:.86">${esc(site.story.body)}</p>
    <div class="figs">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div></div>
</div></section>
<section class="tone"><div class="wrap two">
  <div><span class="tagline" data-rv="right">Transportation</span>
    <h2 class="h2" data-rv="left">${esc(site.feature.title)}</h2>
    <p class="lead" data-rv="left">${esc(site.feature.body)}</p>
    <div style="margin-top:30px" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a></div></div>
  <figure class="bezel" data-rv="right"><div class="media">${img(site, 2)}</div></figure>
</div></section>
<section id="gallery"><div class="wrap">
  <span class="tagline" data-rv="right">Inside</span>
  <h2 class="h2" data-rv="up" data-vanish>Brand new, state of the art facility</h2>
  <div class="scans">${[3, 4, 5].map((i, k) => `<figure data-rv="up" data-delay="${k * 110}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="1200" height="900"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone" id="visit"><div class="wrap">
  <span class="tagline" data-rv="right">Contact</span>
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
    <div><h4>Links</h4><ul>${site.links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul></div>
  </div>
  <dl class="status">
    <div><dt>Practice</dt><dd>${esc(site.name)}</dd></div>
    <div><dt>Location</dt><dd>${esc(site.address)}</dd></div>
    <div><dt>Phone</dt><dd>${esc(site.tel)}</dd></div>
    <div><dt>Status</dt><dd>Accepting patients</dd></div>
  </dl>
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</div></footer>`,
});

/* ======================================================== 15. CIRCUIT LIVE
   Electrical: circuit traces that energise on scroll, spark particles, junction
   nodes, a live power rail. Footer: circuit board with solder pads. */
const circuitLive = site => ({
  fonts: ['Rajdhani:wght@400;500;600;700', 'Barlow:wght@400;500;600;700'],
  display: "'Rajdhani',system-ui,sans-serif", text: "'Barlow',system-ui,sans-serif",
  radius: '8px', border: '1px', particles: 'spark',
  css: `
body{background:var(--paper)}
.hd{position:sticky;top:0;z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:11px var(--gut);
  background:var(--deep);color:#fff}
.hd::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent),var(--accent2),var(--accent),transparent);background-size:200% 100%;animation:power 4s linear infinite}
@keyframes power{to{background-position:200% 0}}
.hd nav{display:flex;gap:26px;justify-content:center;font-family:var(--display);font-weight:600;font-size:1rem;letter-spacing:.04em;text-transform:uppercase}
.hd nav a:hover{color:var(--accent2)}
@media(max-width:940px){.hd nav{display:none}.hd{grid-template-columns:auto auto;justify-content:space-between}}
.hero{position:relative;min-height:90svh;display:grid;align-items:center;background:var(--deep);color:#fff;overflow:hidden}
.traces{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.55}
.traces path{fill:none;stroke:var(--accent);stroke-width:1.5;stroke-dasharray:900;stroke-dashoffset:900;animation:energise 3.4s cubic-bezier(.4,0,.2,1) forwards}
.traces circle{fill:var(--accent2);opacity:0;animation:pop .5s 2.6s forwards}
@keyframes energise{to{stroke-dashoffset:0}}
@keyframes pop{to{opacity:1}}
.hero-bg{position:absolute;inset:0}
.hero-bg img{width:100%;height:100%;object-fit:cover;opacity:.3}
.hero-in{position:relative;z-index:2;padding:78px 0}
.hero h1{font-family:var(--display);font-size:clamp(2.6rem,6.4vw,5.6rem);font-weight:700;line-height:1;letter-spacing:-.01em;max-width:16ch;text-transform:uppercase}
.hero h1 b{color:var(--accent2);font-weight:700}
.hero .eyebrow{color:var(--accent);display:block;margin-bottom:20px}
.hero p{max-width:52ch;margin-top:22px;opacity:.86;line-height:1.8}
.hero .cta{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.hero .btn.ghost{color:#fff}
.rail{background:var(--accent);color:#0b0b0b;overflow:hidden;padding:10px 0}
.rail ul{display:flex;gap:44px;width:max-content;animation:run 28s linear infinite;font-family:var(--display);font-weight:600;font-size:.95rem;letter-spacing:.14em;text-transform:uppercase}
.rail li::before{content:"⚡";margin-right:12px}
@keyframes run{to{transform:translateX(-50%)}}
section{padding:clamp(70px,9vw,130px) 0;position:relative}
.tone{background:color-mix(in srgb,var(--panel) 60%,var(--paper))}
.dark{background:var(--deep);color:#fff}
.kick{font-family:var(--display);font-size:.86rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);display:block;margin-bottom:18px}
h2.h2{font-family:var(--display);font-size:clamp(2rem,4.8vw,4rem);font-weight:700;text-transform:uppercase;line-height:1;letter-spacing:-.01em;max-width:18ch}
.lead{margin-top:18px;max-width:56ch;opacity:.78;line-height:1.8}
.nodes{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:52px}
@media(max-width:900px){.nodes{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.nodes{grid-template-columns:1fr}}
.nodes article{border:1px solid color-mix(in srgb,var(--ink) 14%,transparent);border-radius:var(--r);padding:30px 26px;background:var(--paper);position:relative;transition:border-color .4s,box-shadow .5s,transform .5s cubic-bezier(.2,.8,.2,1)}
.tone .nodes article{background:#fff}
.nodes article::before{content:"";position:absolute;left:26px;top:-5px;width:10px;height:10px;border-radius:50%;background:color-mix(in srgb,var(--ink) 20%,transparent);transition:background .4s,box-shadow .4s}
.nodes article:hover{border-color:var(--accent);transform:translateY(-7px);box-shadow:0 26px 50px -30px color-mix(in srgb,var(--accent) 80%,transparent)}
.nodes article:hover::before{background:var(--accent2);box-shadow:0 0 16px var(--accent2)}
.nodes .n{font-family:var(--display);font-size:.9rem;letter-spacing:.18em;color:var(--accent2);display:block;margin-bottom:12px}
.nodes h3{font-family:var(--display);font-size:1.35rem;font-weight:600;text-transform:uppercase;margin-bottom:9px}
.nodes p{font-size:.94rem;opacity:.76;line-height:1.7}
.two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,72px);align-items:center}
@media(max-width:900px){.two{grid-template-columns:1fr}}
.plate{border-radius:var(--r);overflow:hidden;aspect-ratio:4/3;border:1px solid color-mix(in srgb,var(--accent) 45%,transparent)}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:46px}
.figs div{border:1px solid color-mix(in srgb,var(--accent) 40%,transparent);border-radius:var(--r);padding:24px 18px}
.figs b{font-family:var(--display);font-size:clamp(1.4rem,2.8vw,2.2rem);font-weight:700;color:var(--accent2);display:block;line-height:1}
.figs span{font-size:.78rem;opacity:.72;margin-top:7px;display:block}
@media(max-width:760px){.figs{grid-template-columns:repeat(2,1fr)}}
.board{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:130px;gap:12px;margin-top:50px}
.board figure{margin:0;overflow:hidden;border-radius:var(--r);position:relative}
.board figure:nth-child(1){grid-column:span 2;grid-row:span 2}
.board figure:nth-child(4){grid-column:span 2}
.board img{width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.board figure:hover img{transform:scale(1.07)}
.board figcaption{position:absolute;left:0;right:0;bottom:0;padding:11px 14px;background:linear-gradient(0deg,rgba(0,0,0,.85),transparent);color:#fff;font-family:var(--display);font-size:.84rem;letter-spacing:.06em;text-transform:uppercase}
@media(max-width:760px){.board{grid-template-columns:1fr 1fr;grid-auto-rows:150px}.board figure{grid-column:span 1!important;grid-row:span 1!important}}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:46px}
@media(max-width:820px){.info{grid-template-columns:1fr}}
.info>div{border:1px solid color-mix(in srgb,var(--ink) 14%,transparent);border-radius:var(--r);padding:28px 24px;background:#fff}
.info h4{font-family:var(--display);font-size:1.1rem;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);margin-bottom:14px}
.info li,.info p{padding:8px 0;font-size:.94rem;border-bottom:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
.hrs li{display:flex;justify-content:space-between;gap:14px}
footer{background:var(--deep);color:#fff;padding:clamp(54px,7vw,98px) 0 40px;position:relative;overflow:hidden}
footer::before{content:"";position:absolute;inset:0;background-image:radial-gradient(color-mix(in srgb,var(--accent) 26%,transparent) 2px,transparent 2px);background-size:44px 44px;opacity:.4;pointer-events:none}
.fin{position:relative;display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:40px}
@media(max-width:880px){.fin{grid-template-columns:1fr}}
.fin h4{font-family:var(--display);font-size:1.05rem;text-transform:uppercase;letter-spacing:.1em;color:var(--accent2);margin-bottom:14px}
.fin li{padding:7px 0;opacity:.84;font-size:.94rem}
.footmark{--logo-hf:60px;margin-bottom:20px;display:block}
.fbot{position:relative;margin-top:46px;padding-top:22px;border-top:1px solid color-mix(in srgb,#fff 16%,transparent);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-family:var(--display);font-size:.9rem;letter-spacing:.1em;text-transform:uppercase;opacity:.62}`,
  body: `
<header class="hd" data-header>
  ${inkmark(site, 'brandmark')}
  <nav>${K.nav(site, [['Services', '#services'], ['Purpose', '#story'], ['Gallery', '#gallery'], ['Contact', '#visit']])}</nav>
  <a class="btn" href="${telHref(site.tel)}" data-mag>Get a quote</a>
</header>
<main id="main">
<section class="hero" id="top">
  <svg class="traces" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 120 H260 V320 H520 V180 H1200" style="animation-delay:.15s"/>
    <path d="M0 640 H180 V440 H640 V700 H1200" style="animation-delay:.45s"/>
    <path d="M300 800 V560 H900 V300 H1200" style="animation-delay:.75s"/>
    <circle cx="260" cy="320" r="7"/><circle cx="640" cy="700" r="7"/><circle cx="900" cy="300" r="7"/>
  </svg>
  <div class="hero-bg" data-par="24">${heroImg(site, 0)}</div>
  <div class="hero-in wrap">
    <span class="eyebrow" data-rv="down">${esc(site.eyebrow)}</span>
    <h1 data-rv="up">Electrical work.<br><b>Lighting up Pennsylvania</b><br>since 2012.</h1>
    <p data-rv="up">${esc(site.sub)}</p>
    <div class="cta" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a><a class="btn ghost" href="#gallery">${esc(site.ctaSecondary)}</a></div>
  </div>
</section>
<div class="rail" aria-hidden="true"><ul>${[...site.services, ...site.services].map(s => `<li>${esc(s[0])}</li>`).join('')}</ul></div>
<section id="services"><div class="wrap">
  <span class="kick" data-rv="right">What we do</span>
  <h2 class="h2" data-rv="up" data-vanish>Wiring installation for residential and commercial clients</h2>
  <div class="nodes">${site.services.map((s, i) => `<article data-rv="up" data-delay="${i * 70}"><span class="n">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</div>
</div></section>
<section class="dark" id="story"><div class="wrap two">
  <div><span class="kick" data-rv="right" style="color:var(--accent2)">Our purpose</span>
    <h2 class="h2" data-rv="left" data-vanish>${esc(site.story.title)}</h2>
    <p class="lead" data-rv="left" style="opacity:.86">${esc(site.story.body)}</p>
    <div class="figs">${site.proof.map(p => `<div data-rv="up"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div></div>
  <figure class="plate media" data-rv="right" data-par="20">${img(site, 1)}</figure>
</div></section>
<section class="tone"><div class="wrap two">
  <figure class="plate media" data-rv="left">${img(site, 2)}</figure>
  <div><span class="kick" data-rv="right">For investors</span>
    <h2 class="h2" data-rv="right">${esc(site.feature.title)}</h2>
    <p class="lead" data-rv="right">${esc(site.feature.body)}</p>
    <div style="margin-top:30px" data-rv="up"><a class="btn" href="${telHref(site.tel)}" data-mag>${esc(site.ctaPrimary)}</a></div></div>
</div></section>
<section id="gallery"><div class="wrap">
  <span class="kick" data-rv="right">Gallery</span>
  <h2 class="h2" data-rv="up" data-vanish>We get the job done</h2>
  <div class="board">${[3, 4, 5, 0].map((i, k) => `<figure data-rv="scale" data-delay="${k * 90}"><img src="assets/${site.images[i]}" alt="${attr(site.alts[i])}" loading="lazy" decoding="async" width="1200" height="900"><figcaption>${esc(site.alts[i])}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="tone" id="visit"><div class="wrap">
  <span class="kick" data-rv="right">Contact</span>
  <h2 class="h2" data-rv="up">Get in touch</h2>
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
  <div class="fbot"><span>${esc(site.name)}</span><span>${esc(site.city)}</span></div>
</div></footer>`,
});

module.exports = { 'gilded-sheen': gildedSheen, 'spinal-column': spinalColumn, 'picket-run': picketRun, 'vitals-monitor': vitalsMonitor, 'circuit-live': circuitLive };
