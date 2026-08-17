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

function buildSkinCss(brief) {
  const slug = brief.slug;
  const attitude = inferAttitude(brief);
  const display = brief.fonts?.display || 'Georgia';
  const custom = brief.skinCss || '';

  const shared = `
.slug-${slug}{--attitude:${attitude}}
.slug-${slug} .hero h1,.slug-${slug} .section-head h2,.slug-${slug} .story h2,.slug-${slug} .feature h2,.slug-${slug} .spotlight h2,.slug-${slug} .contact-intro h2,.slug-${slug} .closing h2,.slug-${slug} .offering-card h3,.slug-${slug} .experience-grid h3,.slug-${slug} .catalog-card h3,.slug-${slug} .footer-identity strong{font-family:var(--display);font-weight:700}
.slug-${slug} .glass-panel,.slug-${slug} .contact-card,.slug-${slug} .site-header,.slug-${slug} figcaption{backdrop-filter:blur(var(--glass-blur,22px)) saturate(160%);-webkit-backdrop-filter:blur(var(--glass-blur,22px)) saturate(160%)}
`;

  const attitudes = {
    glass: `
.slug-${slug}{--glass-blur:28px;--glass-alpha:.42}
.slug-${slug} .site-header{background:color-mix(in srgb,var(--paper) 55%,transparent);border-bottom-color:color-mix(in srgb,var(--ink) 10%,transparent);box-shadow:0 10px 40px color-mix(in srgb,var(--deep) 12%,transparent)}
.slug-${slug} .hero-media figure{border:1px solid color-mix(in srgb,#fff 45%,transparent);box-shadow:0 30px 80px color-mix(in srgb,var(--deep) 28%,transparent),inset 0 1px 0 color-mix(in srgb,#fff 55%,transparent);border-radius:calc(var(--radius) + 8px)}
.slug-${slug} .offering-card,.slug-${slug} .experience-grid article,.slug-${slug} .catalog-card,.slug-${slug} .contact-card{background:color-mix(in srgb,var(--paper) 38%,transparent);border:1px solid color-mix(in srgb,#fff 35%,var(--ink) 12%);box-shadow:0 18px 50px color-mix(in srgb,var(--deep) 14%,transparent);backdrop-filter:blur(24px) saturate(170%)}
.slug-${slug} .marquee-strip{background:color-mix(in srgb,var(--deep) 72%,transparent);backdrop-filter:blur(18px)}
.slug-${slug} .hero::after{content:"";position:absolute;inset:auto 8% 12% auto;width:min(38vw,420px);height:min(38vw,420px);border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--accent2) 55%,transparent),transparent 70%);filter:blur(8px);pointer-events:none;z-index:0;animation:glass-orb 12s ease-in-out infinite alternate}
`,
    editorial: `
.slug-${slug}{--glass-blur:16px}
.slug-${slug} .hero h1{font-weight:500;letter-spacing:-.04em;max-width:14ch}
.slug-${slug} .hero-media figure{border-radius:2px;box-shadow:none;border-width:1px}
.slug-${slug} .offering-card,.slug-${slug} .experience-grid article{border-radius:2px;background:transparent}
.slug-${slug} .gallery-grid figure{border-radius:2px}
.slug-${slug} .marquee-strip{letter-spacing:.28em;font-weight:500}
.slug-${slug} .section-head h2 mark{background:transparent;color:var(--accent);padding:0;box-shadow:inset 0 -.12em 0 var(--accent2)}
`,
    brutal: `
.slug-${slug}{--glass-blur:0px}
.slug-${slug} .site-header{backdrop-filter:none;background:var(--paper);border-bottom-width:4px}
.slug-${slug} .hero-media figure,.slug-${slug} .offering-card,.slug-${slug} .gallery-grid figure,.slug-${slug} .catalog-card,.slug-${slug} .contact-card,.slug-${slug} .story figure,.slug-${slug} .feature figure{border-radius:0;box-shadow:12px 12px 0 var(--ink)}
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
.slug-${slug} .hero-media figure,.slug-${slug} .gallery-grid figure{border-radius:4px;filter:contrast(1.05) saturate(.92)}
.slug-${slug} .proof-grid{background:repeating-linear-gradient(-45deg,transparent,transparent 8px,color-mix(in srgb,currentColor 6%,transparent) 8px,color-mix(in srgb,currentColor 6%,transparent) 16px)}
.slug-${slug} .marquee-strip{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em}
`,
    neon: `
.slug-${slug}{--glass-blur:26px}
.slug-${slug} .hero{background:linear-gradient(160deg,var(--deep),color-mix(in srgb,var(--deep) 70%,var(--accent)) 55%,var(--deep));color:var(--on-deep)}
.slug-${slug} .hero .eyebrow,.slug-${slug} .hero h1,.slug-${slug} .hero-copy>p{color:var(--on-deep)}
.slug-${slug} .hero h1 mark{background:transparent;color:var(--accent2);text-shadow:0 0 28px color-mix(in srgb,var(--accent2) 55%,transparent)}
.slug-${slug} .hero-media figure{border:1px solid color-mix(in srgb,var(--accent2) 55%,transparent);box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 40%,transparent),0 25px 80px color-mix(in srgb,var(--accent) 35%,transparent)}
.slug-${slug} .offering-card,.slug-${slug} .contact-card{background:color-mix(in srgb,var(--deep) 55%,transparent);color:var(--on-deep);border-color:color-mix(in srgb,var(--accent2) 40%,transparent)}
.slug-${slug} .marquee-strip{background:var(--accent);color:var(--on-accent);text-shadow:0 0 18px color-mix(in srgb,var(--on-accent) 35%,transparent)}
`,
  };

  return shared + (attitudes[attitude] || attitudes.warm) + '\n' + custom;
}

module.exports = { inferAttitude, buildSkinCss };
