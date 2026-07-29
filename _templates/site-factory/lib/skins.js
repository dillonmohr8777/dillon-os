/**
 * Per-site attitude skins. Every batch site must feel like a different business,
 * not a recolored twin. attitude comes from the brief (or is inferred from tokens).
 *
 * Attitudes: glass | editorial | brutal | warm | industrial | neon
 * Liquid-glass is available to all; glass attitude leans into it hardest.
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

function inferVertical(brief) {
  const value = [brief.vertical, brief.category, brief.schemaType]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (/roof|hvac|heat|cool|plumb|electric|clean|repair|contract|landscap|pest|remodel|vent|home service/.test(value)) {
    return 'home-services';
  }
  if (/restaurant|bar|cafe|coffee|bakery|food|hospitality|hotel|venue|nightlife/.test(value)) {
    return 'hospitality';
  }
  if (/spa|wellness|dental|medical|clinic|therapy|health|fitness|salon/.test(value)) {
    return 'health-wellness';
  }
  if (/shop|store|retail|boutique|record|apparel|jewelry|market/.test(value)) {
    return 'retail';
  }
  if (/law|account|consult|agency|professional|financial|insurance|real estate/.test(value)) {
    return 'professional';
  }
  return 'local-business';
}

function buildSkinCss(brief) {
  const slug = brief.slug;
  const attitude = inferAttitude(brief);
  const custom = brief.skinCss || '';

  const shared = `
.slug-${slug}{--attitude:${attitude}}
.slug-${slug} .hero h1,.slug-${slug} .section-head h2,.slug-${slug} .story h2,.slug-${slug} .feature h2,.slug-${slug} .spotlight h2,.slug-${slug} .contact-intro h2,.slug-${slug} .closing h2,.slug-${slug} .offering-card h3,.slug-${slug} .experience-grid h3,.slug-${slug} .catalog-card h3,.slug-${slug} .footer-identity strong{font-family:var(--display);font-weight:700}
.slug-${slug} .glass-panel,.slug-${slug} .contact-card,.slug-${slug} .site-header,.slug-${slug} figcaption{backdrop-filter:blur(var(--glass-blur,22px)) saturate(160%);-webkit-backdrop-filter:blur(var(--glass-blur,22px)) saturate(160%)}
.slug-${slug}.vertical-home-services .proof{order:0}
.slug-${slug}.vertical-home-services .contact-system{background-image:linear-gradient(135deg,color-mix(in srgb,currentColor 5%,transparent),transparent 48%)}
.slug-${slug}.vertical-hospitality .gallery-grid figure:first-child,
.slug-${slug}.vertical-retail .gallery-grid figure:first-child{grid-column:span 8}
.slug-${slug}.vertical-professional .proof-grid{grid-template-columns:repeat(2,1fr)}
`;

  const attitudes = {
    glass: `
.slug-${slug}{--glass-blur:28px;--glass-alpha:.42}
.slug-${slug} .site-header{background:color-mix(in srgb,var(--paper) 55%,transparent);border-bottom-color:color-mix(in srgb,var(--ink) 10%,transparent);box-shadow:0 10px 40px color-mix(in srgb,var(--deep) 12%,transparent)}
.slug-${slug} .hero-media figure{border:1px solid color-mix(in srgb,#fff 45%,transparent);box-shadow:0 30px 80px color-mix(in srgb,var(--deep) 28%,transparent),inset 0 1px 0 color-mix(in srgb,#fff 55%,transparent);border-radius:calc(var(--radius) + 8px)}
.slug-${slug} .offering-card,.slug-${slug} .experience-grid article,.slug-${slug} .catalog-card,.slug-${slug} .contact-card{background:color-mix(in srgb,var(--paper) 38%,transparent);border:1px solid color-mix(in srgb,#fff 35%,var(--ink) 12%);box-shadow:0 18px 50px color-mix(in srgb,var(--deep) 14%,transparent);backdrop-filter:blur(24px) saturate(170%)}
.slug-${slug} .signal-strip{background:color-mix(in srgb,var(--deep) 72%,transparent);backdrop-filter:blur(18px)}
.slug-${slug} .hero{grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr)}
.slug-${slug} .hero-copy{z-index:3}
.slug-${slug} .hero::after{content:"";position:absolute;inset:auto 8% 12% auto;width:min(38vw,420px);height:min(38vw,420px);border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--accent2) 45%,transparent),transparent 70%);filter:blur(8px);pointer-events:none;z-index:0}
`,
    editorial: `
.slug-${slug}{--glass-blur:16px}
.slug-${slug} .hero h1{font-weight:500;letter-spacing:-.04em;max-width:14ch}
.slug-${slug} .hero{grid-template-columns:minmax(0,.68fr) minmax(0,1.32fr);align-items:end}
.slug-${slug} .hero-copy{padding-bottom:clamp(20px,6vw,90px)}
.slug-${slug} .hero-media figure{border-radius:2px;box-shadow:none;border-width:1px}
.slug-${slug} .offering-grid{grid-template-columns:1.45fr .8fr .8fr;align-items:end}
.slug-${slug} .offering-card:first-child{min-height:390px}
.slug-${slug} .offering-card,.slug-${slug} .experience-grid article{border-radius:2px;background:transparent}
.slug-${slug} .gallery-grid figure{border-radius:2px}
.slug-${slug} .signal-strip{letter-spacing:.18em;font-weight:500}
.slug-${slug} .section-head h2 mark{background:transparent;color:var(--accent);padding:0;box-shadow:inset 0 -.12em 0 var(--accent2)}
`,
    brutal: `
.slug-${slug}{--glass-blur:0px}
.slug-${slug} .site-header{backdrop-filter:none;background:var(--paper);border-bottom-width:4px}
.slug-${slug} .hero{grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr)}
.slug-${slug} .offering-grid{grid-template-columns:2fr 1fr}
.slug-${slug} .offering-card:first-child{grid-row:span 2;min-height:558px}
.slug-${slug} .hero-media figure,.slug-${slug} .offering-card,.slug-${slug} .gallery-grid figure,.slug-${slug} .catalog-card,.slug-${slug} .contact-card,.slug-${slug} .story figure,.slug-${slug} .feature figure{border-radius:0;box-shadow:12px 12px 0 var(--ink)}
.slug-${slug} .button{border-radius:0;box-shadow:6px 6px 0 var(--ink)}
.slug-${slug} .button:hover,.slug-${slug} .button:focus-visible{transform:translate(-2px,-2px);box-shadow:10px 10px 0 var(--ink)}
.slug-${slug} .signal-strip{border-block:4px solid var(--ink);text-transform:uppercase}
`,
    warm: `
.slug-${slug}{--glass-blur:20px}
.slug-${slug} .hero{background:
  radial-gradient(1200px 600px at 10% -10%,color-mix(in srgb,var(--accent2) 35%,transparent),transparent 60%),
  radial-gradient(900px 500px at 90% 20%,color-mix(in srgb,var(--accent) 18%,transparent),transparent 55%),
  var(--paper)}
.slug-${slug} .story{grid-template-columns:.78fr 1.22fr}
.slug-${slug} .hero-media figure{border-radius:calc(var(--radius) + 18px);transform:rotate(-1.2deg);box-shadow:22px 28px 0 color-mix(in srgb,var(--accent2) 55%,transparent)}
.slug-${slug} .offering-card:nth-child(2){transform:rotate(.6deg)}
.slug-${slug} .offering-card:nth-child(3){transform:rotate(-.5deg)}
.slug-${slug} .signal-strip{background:color-mix(in srgb,var(--accent) 88%,var(--deep));color:var(--on-accent)}
`,
    industrial: `
.slug-${slug}{--glass-blur:8px}
.slug-${slug} .site-header{background:color-mix(in srgb,var(--deep) 92%,transparent);color:var(--on-deep);border-bottom-color:var(--accent)}
.slug-${slug} .site-header .wordmark,.slug-${slug} .site-header nav a{color:var(--on-deep)}
.slug-${slug} .hero h1{text-transform:uppercase;letter-spacing:-.02em}
.slug-${slug} .hero{grid-template-columns:minmax(0,1.15fr) minmax(360px,.85fr)}
.slug-${slug} .experience-grid{grid-template-columns:1.4fr .8fr .8fr}
.slug-${slug} .hero-media figure,.slug-${slug} .gallery-grid figure{border-radius:4px;filter:contrast(1.05) saturate(.92)}
.slug-${slug} .proof-grid{background:color-mix(in srgb,currentColor 5%,transparent)}
.slug-${slug} .signal-strip{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em}
`,
    neon: `
.slug-${slug}{--glass-blur:26px}
.slug-${slug} .hero{grid-template-columns:minmax(0,1fr);background:linear-gradient(160deg,var(--deep),color-mix(in srgb,var(--deep) 70%,var(--accent)) 55%,var(--deep));color:var(--on-deep)}
.slug-${slug} .hero-copy{grid-area:1/1;max-width:min(760px,70%);padding:clamp(28px,6vw,80px);background:color-mix(in srgb,var(--deep) 62%,transparent);backdrop-filter:blur(22px);z-index:3}
.slug-${slug} .hero-media{grid-area:1/1;min-height:76svh}
.slug-${slug} .hero .eyebrow,.slug-${slug} .hero h1,.slug-${slug} .hero-copy>p{color:var(--on-deep)}
.slug-${slug} .hero h1 mark{background:transparent;color:var(--accent2);text-shadow:0 0 28px color-mix(in srgb,var(--accent2) 55%,transparent)}
.slug-${slug} .hero-media figure{border:1px solid color-mix(in srgb,var(--accent2) 55%,transparent);box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 40%,transparent),0 25px 80px color-mix(in srgb,var(--accent) 35%,transparent)}
.slug-${slug} .offering-card,.slug-${slug} .contact-card{background:color-mix(in srgb,var(--deep) 55%,transparent);color:var(--on-deep);border-color:color-mix(in srgb,var(--accent2) 40%,transparent)}
.slug-${slug} .signal-strip{background:var(--accent);color:var(--on-accent);text-shadow:0 0 18px color-mix(in srgb,var(--on-accent) 35%,transparent)}
`,
  };

  const responsive = `
@media(max-width:850px){
  .slug-${slug} .hero,.slug-${slug} .story,.slug-${slug} .feature,.slug-${slug} .spotlight,
  .slug-${slug} .offering-grid,.slug-${slug} .experience-grid{
    display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:auto
  }
  .slug-${slug} .hero-copy,.slug-${slug} .hero-media{grid-area:auto;max-width:none;padding:0}
  .slug-${slug} .offering-card:first-child{grid-row:auto;min-height:270px}
  .slug-${slug} .hero-media{min-height:480px}
}
`;

  return shared + (attitudes[attitude] || attitudes.warm) + responsive + '\n' + custom;
}

module.exports = { inferAttitude, inferVertical, buildSkinCss };
