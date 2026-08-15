/**
 * Per-site attitude skins. Every batch site must feel like a different business,
 * not a recolored twin. attitude comes from the brief (or is inferred from tokens).
 *
 * Attitudes: glass | editorial | brutal | warm | industrial | neon | align
 * Liquid-glass is available to all; glass attitude leans into it hardest.
 * `align` mirrors Align HCM industry-solutions / public-sector motion:
 * 3D liquid glass, cream-paper ink-reveal. Colors come from brief tokens
 * (the prospect's real brand), never a shared teal.
 */
function inferAttitude(brief) {
  if (brief.attitude) return brief.attitude;
  const borderRaw = parseFloat(brief.tokens?.border);
  const radiusRaw = parseFloat(brief.tokens?.radius);
  const border = Number.isFinite(borderRaw) ? borderRaw : 2;
  const radius = Number.isFinite(radiusRaw) ? radiusRaw : 12;
  if (border >= 4 && radius <= 8) return 'brutal';
  if (border <= 1.5 && radius >= 20) return 'glass';
  if (radius >= 24) return 'editorial';
  if ((brief.category || '').match(/roof|hvac|plumb|concrete|industrial|manufact/i)) return 'industrial';
  if ((brief.category || '').match(/spa|wellness|dental|medical|wine|hotel/i)) return 'editorial';
  if ((brief.category || '').match(/bar|club|nightlife|tattoo/i)) return 'neon';
  return 'warm';
}

function buildSkinCss(brief) {
  const slug = brief.slug;
  const attitude = inferAttitude(brief);
  const display = brief.fonts?.display || 'Georgia';
  const custom = brief.skinCss || '';

  const shared = `
.slug-${slug}{--attitude:${attitude}}
.slug-${slug} .hero h1,.slug-${slug} .section-head h2,.slug-${slug} .story h2,.slug-${slug} .feature h2,.slug-${slug} .spotlight h2,.slug-${slug} .contact-intro h2,.slug-${slug} .closing h2,.slug-${slug} .offering-card h3,.slug-${slug} .experience-grid h3,.slug-${slug} .catalog-card h3,.slug-${slug} .footer-identity strong{font-family:var(--display);font-weight:700}
.slug-${slug} .glass-panel,.slug-${slug} .contact-card,.slug-${slug} .site-header,.slug-${slug} .bottom-dock,.slug-${slug} figcaption{backdrop-filter:blur(var(--glass-blur,22px)) saturate(160%);-webkit-backdrop-filter:blur(var(--glass-blur,22px)) saturate(160%)}
`;

  const attitudes = {
    glass: `
.slug-${slug}{--glass-blur:28px;--glass-alpha:.42}
.slug-${slug} .site-header{background:color-mix(in srgb,var(--paper) 55%,transparent);border-bottom-color:color-mix(in srgb,var(--ink) 10%,transparent);box-shadow:0 10px 40px color-mix(in srgb,var(--deep) 12%,transparent)}
.slug-${slug} .hero-media figure{border:1px solid color-mix(in srgb,#fff 45%,transparent);box-shadow:0 30px 80px color-mix(in srgb,var(--deep) 28%,transparent),inset 0 1px 0 color-mix(in srgb,#fff 55%,transparent);border-radius:calc(var(--radius) + 8px)}
.slug-${slug} .offering-card,.slug-${slug} .experience-grid article,.slug-${slug} .experience-acc,.slug-${slug} .catalog-card,.slug-${slug} .contact-card,.slug-${slug} .bottom-dock{background:color-mix(in srgb,var(--paper) 38%,transparent);border:1px solid color-mix(in srgb,#fff 35%,var(--ink) 12%);box-shadow:0 18px 50px color-mix(in srgb,var(--deep) 14%,transparent);backdrop-filter:blur(24px) saturate(170%)}
.slug-${slug} .marquee-strip{background:color-mix(in srgb,var(--deep) 72%,transparent);backdrop-filter:blur(18px)}
.slug-${slug} .hero::after{content:"";position:absolute;inset:auto 8% 12% auto;width:min(38vw,420px);height:min(38vw,420px);border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--accent2) 55%,transparent),transparent 70%);filter:blur(8px);pointer-events:none;z-index:0;animation:glass-orb 12s ease-in-out infinite alternate}
`,
    editorial: `
.slug-${slug}{--glass-blur:16px}
.slug-${slug} .hero h1{font-weight:500;letter-spacing:-.04em;max-width:14ch}
.slug-${slug} .hero-media figure{border-radius:2px;box-shadow:none;border-width:1px}
.slug-${slug} .offering-card,.slug-${slug} .experience-grid article,.slug-${slug} .experience-acc{border-radius:2px;background:transparent}
.slug-${slug} .gallery-rail figure{border-radius:2px}
.slug-${slug} .marquee-strip{letter-spacing:.28em;font-weight:500}
`,
    brutal: `
.slug-${slug}{--glass-blur:0px}
.slug-${slug} .site-header{backdrop-filter:none;background:var(--paper);border-bottom-width:4px}
.slug-${slug} .hero-media figure,.slug-${slug} .offering-card,.slug-${slug} .experience-acc,.slug-${slug} .gallery-rail figure,.slug-${slug} .catalog-card,.slug-${slug} .contact-card,.slug-${slug} .story figure,.slug-${slug} .feature figure{border-radius:0;box-shadow:12px 12px 0 var(--ink)}
.slug-${slug} .button{border-radius:0;box-shadow:6px 6px 0 var(--ink)}
.slug-${slug} .button:hover,.slug-${slug} .button:focus-visible{transform:translate(-2px,-2px);box-shadow:10px 10px 0 var(--ink)}
.slug-${slug} .marquee-strip{border-block:4px solid var(--ink);text-transform:uppercase}
`,
    warm: `
.slug-${slug}{--glass-blur:20px}
.slug-${slug} .hero{background:
  radial-gradient(1200px 600px at 10% -10%,color-mix(in srgb,var(--accent2) 35%,transparent),transparent 60%),
  radial-gradient(900px 500px at 90% 20%,color-mix(in srgb,var(--accent) 18%,transparent),transparent 55%),
  var(--paper)}
.slug-${slug} .hero-media figure{border-radius:calc(var(--radius) + 18px);transform:rotate(-1.2deg);box-shadow:22px 28px 0 color-mix(in srgb,var(--accent2) 55%,transparent)}
.slug-${slug} .offering-card:nth-child(2){transform:rotate(.6deg)}
.slug-${slug} .offering-card:nth-child(3){transform:rotate(-.5deg)}
.slug-${slug} .marquee-strip{background:color-mix(in srgb,var(--accent) 88%,var(--deep));color:var(--on-accent)}
`,
    industrial: `
.slug-${slug}{--glass-blur:8px}
.slug-${slug} .site-header{background:color-mix(in srgb,var(--deep) 92%,transparent);color:var(--on-deep);border-bottom-color:var(--accent)}
.slug-${slug} .site-header .wordmark,.slug-${slug} .site-header nav a{color:var(--on-deep)}
.slug-${slug} .hero h1{text-transform:uppercase;letter-spacing:-.02em}
.slug-${slug} .hero-media figure,.slug-${slug} .gallery-rail figure{border-radius:4px;filter:contrast(1.05) saturate(.92)}
.slug-${slug} .proof-grid{background:repeating-linear-gradient(-45deg,transparent,transparent 8px,color-mix(in srgb,currentColor 6%,transparent) 8px,color-mix(in srgb,currentColor 6%,transparent) 16px)}
.slug-${slug} .marquee-strip{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em}
`,
    neon: `
.slug-${slug}{--glass-blur:26px}
.slug-${slug} .hero{background:linear-gradient(160deg,var(--deep),color-mix(in srgb,var(--deep) 70%,var(--accent)) 55%,var(--deep));color:var(--on-deep)}
.slug-${slug} .hero .eyebrow,.slug-${slug} .hero h1,.slug-${slug} .hero-copy>p{color:var(--on-deep)}
.slug-${slug} .hero-media figure{border:1px solid color-mix(in srgb,var(--accent2) 55%,transparent);box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 40%,transparent),0 25px 80px color-mix(in srgb,var(--accent) 35%,transparent)}
.slug-${slug} .offering-card,.slug-${slug} .contact-card{background:color-mix(in srgb,var(--deep) 55%,transparent);color:var(--on-deep);border-color:color-mix(in srgb,var(--accent2) 40%,transparent)}
.slug-${slug} .marquee-strip{background:var(--accent);color:var(--on-accent)}
`,
    align: `
.slug-${slug}{--glass-blur:30px;--glass-alpha:.48}
.slug-${slug} .site-header{background:color-mix(in srgb,var(--paper) 58%,transparent);border-bottom-color:color-mix(in srgb,var(--accent) 28%,transparent);box-shadow:0 12px 44px color-mix(in srgb,var(--deep) 14%,transparent)}
.slug-${slug} .hero{background:
  radial-gradient(1100px 640px at 8% -12%,color-mix(in srgb,var(--accent) 38%,transparent),transparent 62%),
  radial-gradient(900px 520px at 92% 8%,color-mix(in srgb,var(--accent2) 22%,transparent),transparent 58%),
  var(--paper);perspective:1400px}
.slug-${slug} .hero::after{content:"";position:absolute;inset:auto 6% 8% auto;width:min(42vw,460px);height:min(42vw,460px);border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 62%,transparent),transparent 70%);filter:blur(10px);pointer-events:none;z-index:0;animation:glass-orb 14s ease-in-out infinite alternate}
.slug-${slug} .hero-media{transform-style:preserve-3d}
.slug-${slug} .hero-media figure{border:1px solid color-mix(in srgb,#fff 50%,var(--accent) 18%);border-radius:calc(var(--radius) + 10px);box-shadow:0 34px 90px color-mix(in srgb,var(--deep) 30%,transparent),inset 0 1px 0 color-mix(in srgb,#fff 60%,transparent);transform:rotateY(-8deg) rotateX(4deg);animation:align-tilt 9s ease-in-out infinite alternate}
.slug-${slug} .media-caption{background:color-mix(in srgb,var(--deep) 86%,#000);border:1px solid color-mix(in srgb,var(--accent) 32%,transparent)}
.slug-${slug} .media-kicker{color:var(--accent)}
.slug-${slug} .card-icon{background:#101218;color:var(--accent);box-shadow:0 0 18px color-mix(in srgb,var(--accent) 48%,transparent)}
.slug-${slug} .offering-card,.slug-${slug} .experience-grid article,.slug-${slug} .catalog-card,.slug-${slug} .contact-card{
  background:color-mix(in srgb,var(--paper) 36%,transparent);
  border:1px solid color-mix(in srgb,#fff 40%,var(--accent) 16%);
  box-shadow:0 22px 54px color-mix(in srgb,var(--deep) 16%,transparent);
  backdrop-filter:blur(26px) saturate(180%);
  transform-style:preserve-3d;
}
.slug-${slug} .offering-card:hover,.slug-${slug} .experience-grid article:hover,.slug-${slug} .catalog-card:hover{
  transform:translateY(-12px) rotateX(6deg) rotateY(-4deg) scale(1.015);
  box-shadow:0 28px 70px color-mix(in srgb,var(--accent) 28%,transparent);
}
.slug-${slug} .marquee-strip{background:color-mix(in srgb,var(--deep) 82%,var(--accent));color:var(--on-deep)}
.slug-${slug} .section-kicker,.slug-${slug} .media-kicker{color:var(--accent);letter-spacing:.18em}
.slug-${slug} .button-primary{background:var(--accent);color:var(--on-accent);box-shadow:0 16px 40px color-mix(in srgb,var(--accent) 38%,transparent)}
.slug-${slug} .button-primary:hover,.slug-${slug} .button-primary:focus-visible{background:color-mix(in srgb,var(--accent) 82%,var(--deep))}
.slug-${slug} .logo-outro{background:var(--paper)}
.slug-${slug} .map-embed{border-color:color-mix(in srgb,var(--accent) 45%,var(--ink));box-shadow:0 24px 60px color-mix(in srgb,var(--deep) 18%,transparent)}
.slug-${slug} figure img{animation:align-ken 18s ease-in-out infinite alternate}
.slug-${slug} figure:nth-child(even) img,.slug-${slug} .hero-media figure img{animation-duration:22s;animation-direction:alternate-reverse}
.slug-${slug} .offering-card::before,.slug-${slug} .catalog-card::before{
  content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:linear-gradient(115deg,transparent 35%,color-mix(in srgb,#fff 28%,transparent) 50%,transparent 65%);
  mix-blend-mode:screen;opacity:.2;animation:glass-sheen 8s ease-in-out infinite
}
.slug-${slug} .offering-card,.slug-${slug} .catalog-card{position:relative}
@keyframes align-tilt{from{transform:rotateY(-8deg) rotateX(4deg) translateZ(0)}to{transform:rotateY(6deg) rotateX(-3deg) translateZ(18px)}}
@keyframes align-ken{from{transform:scale(1.04) translate3d(-1.2%,0,0)}to{transform:scale(1.12) translate3d(1.6%,-1.4%,0)}}
@media(max-width:700px){
.slug-${slug} .hero-media figure{transform:none;animation:none}
.slug-${slug} .offering-card:hover,.slug-${slug} .experience-grid article:hover,.slug-${slug} .catalog-card:hover{transform:none}
}
@media(hover:none){
.slug-${slug} .offering-card:hover,.slug-${slug} .experience-grid article:hover,.slug-${slug} .catalog-card:hover{transform:none}
}
`,
  };

  return shared + (attitudes[attitude] || attitudes.warm) + '\n' + custom;
}

module.exports = { inferAttitude, buildSkinCss };
