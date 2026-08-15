/**
 * Composition layouts mirrored from wow-library homepages.
 * Harvest still owns brand, copy, and photos. Each layout changes chrome,
 * hero architecture, type, gallery, and motion so two sites cannot pass
 * as recolors of the same template.
 *
 * Composition only. Never clone the referenced product brand onto a local
 * business.
 */

const RULES = [
  [/godly/, 'godly-masonry', 'masonry'],
  [/land-book/, 'landbook-grid', 'grid'],
  [/pentagram/, 'pentagram-edit', 'editorial'],
  [/studiofreight/, 'freight-bold', 'bold'],
  [/awwwards/, 'awwwards-arch', 'arch'],
  [/midjourney/, 'midjourney-bleed', 'bleed'],
  [/copilot/, 'copilot-split', 'split'],
  [/shopify\.design/, 'shopify-play', 'playful'],
  [/spotify/, 'spotify-player', 'player'],
  [/airbnb/, 'airbnb-photo', 'photo'],
  [/shopify\.com/, 'shopify-store', 'store'],
  [/todoist/, 'todoist-list', 'list'],
  [/github\.com/, 'github-repo', 'repo'],
  [/cursor\.com/, 'cursor-ide', 'ide'],
  [/anthropic/, 'anthropic-serif', 'essay'],
  [/openai/, 'openai-void', 'void'],
  [/www\.webflow\.com/, 'webflow-canvas', 'canvas'],
  [/webflow/, 'webflow-studio', 'studio'],
  [/framer/, 'framer-motion', 'motion'],
  [/clerk/, 'clerk-cards', 'cards'],
  [/resend/, 'resend-ink', 'ink'],
  [/cal\.com/, 'cal-schedule', 'schedule'],
  [/arc\.net/, 'arc-color', 'color'],
  [/raycast/, 'raycast-glow', 'glow'],
  [/cosmos/, 'cosmos-search', 'search'],
  [/apple\.com/, 'apple-stage', 'stage'],
  [/figma/, 'figma-canvas', 'canvas'],
  [/vercel/, 'vercel-geom', 'geom'],
  [/notion/, 'notion-soft', 'soft'],
  [/linear/, 'linear-dark', 'dark'],
  [/stripe/, 'stripe-split', 'split'],
];

function resolveLayout(brief) {
  const url = String(brief.layout || brief.composition_ref || '').toLowerCase();
  for (const [re, id, hero] of RULES) {
    if (re.test(url)) return { id, hero, ref: brief.composition_ref || url };
  }
  if (brief.layout && !String(brief.layout).startsWith('http')) {
    return { id: brief.layout, hero: brief.heroMode || 'split', ref: brief.composition_ref || '' };
  }
  return { id: 'profile', hero: 'split', ref: '' };
}

function hostLabel(ref) {
  try {
    return new URL(ref).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function buildLayoutChrome(brief, layout, esc) {
  const id = layout.id || 'profile';
  const name = esc(brief.name || 'Studio');
  const city = esc(brief.city || '');
  const packs = {
    'stripe-split': {
      afterHeader: `<div class="layout-proofbar" aria-hidden="true"><span>${city}</span><span>Local care</span><span>Same-day visits</span><span>Family owned</span></div>`,
    },
    'linear-dark': {
      afterHeader: `<div class="layout-status" aria-hidden="true"><span class="layout-dot"></span><span>Live in ${city}</span></div>`,
    },
    'cosmos-search': {
      headerMid: `<div class="layout-search" aria-hidden="true"><span class="layout-search-field">Search ${name}</span></div>`,
    },
    'raycast-glow': {
      afterHeader: `<div class="layout-command" aria-hidden="true"><span class="layout-search-field">Ask ${name}</span><kbd>⌘K</kbd></div>`,
    },
    'airbnb-photo': {
      headerMid: `<div class="layout-searchpill" aria-hidden="true"><span>Where</span><span>${city}</span><span>When</span><span>Any week</span></div>`,
    },
    'spotify-player': {
      rail: `<aside class="layout-library" aria-hidden="true"><strong>Your visits</strong><span>New patient</span><span>Returning</span><span>Emergency</span></aside>`,
      afterMain: `<div class="layout-nowplaying" aria-hidden="true"><span>${name}</span><span>Now serving ${city}</span></div>`,
    },
    'github-repo': {
      afterHeader: `<div class="layout-repobar" aria-hidden="true"><span>${name}</span><span>Public</span><span>Star</span><span>Fork</span></div>`,
    },
    'cursor-ide': {
      afterHeader: `<div class="layout-tabs" aria-hidden="true"><span class="is-on">index.html</span><span>brief.json</span><span>qa.md</span></div>`,
    },
    'webflow-studio': {
      rail: `<aside class="layout-rail" aria-hidden="true"><span></span><span></span><span></span><span></span></aside>`,
    },
    'arc-color': {
      afterHeader: `<div class="layout-arcbar" aria-hidden="true"></div>`,
    },
    'cal-schedule': {
      afterHeader: `<div class="layout-week" aria-hidden="true"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span></div>`,
    },
    'todoist-list': {},
    'apple-stage': {},
    'openai-void': {},
    'anthropic-serif': {},
    'shopify-store': {},
    'shopify-play': {},
    'figma-canvas': {
      afterHeader: `<div class="layout-comment" aria-hidden="true"><span>Frame 1</span></div>`,
    },
    'godly-masonry': {
      afterHeader: `<div class="layout-pills" aria-hidden="true"><span>All</span><span>Care</span><span>Team</span><span>Visit</span></div>`,
    },
    'landbook-grid': {},
    'pentagram-edit': {},
    'freight-bold': {},
    'awwwards-arch': {
      afterHeader: `<div class="layout-award" aria-hidden="true"><span>Local work</span></div>`,
    },
    'midjourney-bleed': {},
    'clerk-cards': {},
    'framer-motion': {},
    'resend-ink': {},
    'notion-soft': {},
    'vercel-geom': {},
    'copilot-split': {},
    'webflow-canvas': {},
    profile: {},
    'harvest-diner': {
      afterHeader: `<div class="layout-pills" aria-hidden="true">${(brief.nav || [])
        .slice(0, 4)
        .map((n) => `<span>${esc(n.label)}</span>`)
        .join('')}</div>`,
    },
    'harvest-clinic': {},
    'harvest-dark': {},
    'harvest-photo': {},
    'harvest-shop': {
      afterHeader: `<div class="layout-pills" aria-hidden="true">${(brief.nav || [])
        .slice(0, 4)
        .map((n) => `<span>${esc(n.label)}</span>`)
        .join('')}</div>`,
    },
    'harvest-split': {},
  };
  const picked = packs[id] || {};
  return {
    rail: picked.rail || '',
    headerMid: picked.headerMid || '',
    afterHeader: picked.afterHeader || '',
    afterMain: picked.afterMain || '',
  };
}

function buildLayoutCss(brief, layout) {
  const id = layout.id || 'profile';
  const L = `.layout-${id}`;
  const packs = {
    'stripe-split': `
${L} .site-header{background:#fff0;border-bottom:0;backdrop-filter:none}
${L} .hero{min-height:88svh;grid-template-columns:minmax(0,1.05fr) minmax(280px,.95fr);align-items:center;padding-top:8vh}
${L} .hero::after{content:"";position:absolute;right:-8%;top:-20%;width:58%;height:140%;background:conic-gradient(from 200deg at 40% 40%,var(--accent),var(--accent2),#7ad7ff,var(--accent));filter:blur(8px);border-radius:40% 60% 50% 50%;opacity:.85;pointer-events:none;z-index:0}
${L} .hero-copy{z-index:2}
${L} .hero h1{font-weight:800;letter-spacing:-.07em;max-width:13ch}
${L} .hero h1{color:inherit}
${L} .button{border-radius:8px;box-shadow:none}
${L} .hero-media{z-index:1}
${L} .hero-media figure{border:0;border-radius:24px;box-shadow:none}
${L} .layout-proofbar{display:flex;gap:36px;flex-wrap:wrap;padding:22px clamp(20px,6vw,110px);opacity:.55;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:.72rem}
${L} .glass-float{display:none}
${L} .proof{padding-block:20px}
`,
    'linear-dark': `
${L}{background:#070708;color:#f4f4f5}
${L} .site-header{background:#070708;border-bottom:1px solid #ffffff14;color:#f4f4f5;backdrop-filter:none}
${L} .site-header .wordmark,${L} .site-header nav a{color:#f4f4f5}
${L} .button-header{background:#fff;color:#090909;border-radius:999px;border-color:#fff}
${L} .hero{min-height:92svh;grid-template-columns:1fr;text-align:center;background:
  radial-gradient(900px 420px at 50% 0%,#5b8def33,transparent 60%),#070708;color:#f4f4f5;padding-top:14vh}
${L} .hero .eyebrow,${L} .hero h1,${L} .hero-copy>p{color:#f4f4f5}
${L} .hero h1{font-weight:500;letter-spacing:-.06em;max-width:16ch;margin-inline:auto;font-size:clamp(3.2rem,7vw,6.4rem)}
${L} .hero-copy>p{margin-inline:auto;opacity:.72}
${L} .button{border-radius:999px}
${L} .hero-media{max-width:920px;margin:40px auto 0;min-height:420px;width:100%}
${L} .hero-media figure{border:1px solid #ffffff18;border-radius:16px;box-shadow:0 40px 120px #0008}
${L} .layout-status{display:flex;justify-content:center;gap:8px;align-items:center;padding:12px;color:#9fe87a;font-size:.8rem}
${L} .layout-dot{width:8px;height:8px;border-radius:50%;background:#9fe87a;box-shadow:0 0 12px #9fe87a}
${L} .glass-float{display:none}
${L} .offerings,${L} .gallery,${L} .story,${L} .experience,${L} .feature,${L} .catalog,${L} .contact-system,${L} .closing,${L} .site-footer{background:#0c0c0e;color:#f4f4f5}
`,
    'notion-soft': `
${L} .site-header{background:color-mix(in srgb,var(--paper) 92%,transparent);border-bottom:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
${L} .hero{grid-template-columns:1fr;text-align:left;max-width:980px;margin:0 auto;min-height:auto;padding-block:10vh}
${L} .hero h1{font-weight:700;max-width:18ch;font-size:clamp(2.4rem,5vw,4.2rem)}
${L} .hero-media{min-height:420px}
${L} .hero-media figure,${L} .offering-card,${L} .catalog-card{border-radius:12px;box-shadow:0 1px 0 color-mix(in srgb,var(--ink) 8%,transparent),0 12px 40px color-mix(in srgb,var(--deep) 8%,transparent);border:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
${L} .offering-grid{gap:12px}
${L} .button{border-radius:8px;font-weight:650}
${L} .glass-float{border-radius:10px}
`,
    'vercel-geom': `
${L} .site-header{background:#fff;border-bottom:1px solid #00000014;backdrop-filter:none}
${L} .button,${L} .button-header{border-radius:999px}
${L} .button-primary{background:#000;color:#fff;border-color:#000}
${L} .hero{grid-template-columns:1fr 1fr;align-items:center;min-height:82svh;gap:32px}
${L} .hero-copy{text-align:left}
${L} .hero h1{font-weight:700;letter-spacing:-.08em;max-width:10ch}
${L} .hero-media{width:min(42vw,420px);min-height:420px;justify-self:center}
${L} .hero-media figure{border:0;border-radius:0;clip-path:polygon(50% 0,100% 100%,0 100%);box-shadow:none;background:var(--ink)}
${L} .hero-media img{object-fit:cover;opacity:.35}
${L} .glass-float{display:none}
${L} .proof-grid{border:0}
`,
    'figma-canvas': `
${L}{background:#1e1e1e}
${L} .site-header{background:#2c2c2c;color:#fff;border:0;backdrop-filter:none}
${L} .site-header .wordmark,${L} .site-header nav a{color:#fff}
${L} .hero{overflow:visible;background:#1e1e1e;color:#fff}
${L} .hero h1,${L} .hero-copy>p,${L} .hero .eyebrow{color:#fff}
${L} .hero-media figure{transform:rotate(4deg);border-radius:16px;box-shadow:0 30px 80px #0008;border:8px solid #fff}
${L} .gallery-grid figure:nth-child(odd){transform:rotate(-2deg)}
${L} .gallery-grid figure:nth-child(even){transform:rotate(1.6deg)}
${L} .offering-card{border-radius:16px;background:#fff}
${L} .button{border-radius:12px}
${L} .layout-comment{position:absolute;right:8%;top:120px;background:#0d99ff;color:#fff;padding:6px 10px;border-radius:8px;font-size:.75rem;z-index:4}
`,
    'apple-stage': `
${L} .site-header{background:#1d1d1f;color:#f5f5f7;border:0;backdrop-filter:none;padding-block:10px}
${L} .site-header .wordmark,${L} .site-header nav a{color:#f5f5f7;font-weight:400;font-size:.82rem}
${L} .button-header{background:#0071e3;border-color:#0071e3;border-radius:999px;color:#fff}
${L} .hero{grid-template-columns:1fr;text-align:center;min-height:auto;padding-top:72px;background:#f5f5f7;color:#1d1d1f}
${L} .hero h1{font-weight:600;letter-spacing:-.04em;max-width:12ch;margin-inline:auto;font-size:clamp(3rem,8vw,6.2rem)}
${L} .hero-copy>p{margin-inline:auto}
${L} .button{border-radius:999px;background:#0071e3;border-color:#0071e3;color:#fff}
${L} .hero-media{min-height:62svh;max-width:1100px;margin:28px auto 0;width:100%}
${L} .hero-media figure{border:0;border-radius:0;box-shadow:none}
${L} .glass-float{display:none}
${L} .closing,${L} .feature{text-align:center}
${L} .feature{grid-template-columns:1fr}
${L} .offerings,${L} .gallery{background:#fff}
`,
    'cosmos-search': `
${L}{background:#f6f4f1}
${L} .site-header{display:grid;grid-template-columns:auto 1fr auto auto;background:transparent;border:0;backdrop-filter:none}
${L} .layout-search{display:flex;justify-content:center}
${L} .layout-search-field{display:inline-flex;align-items:center;min-width:min(420px,46vw);min-height:44px;padding:0 18px;border-radius:999px;background:#fff;box-shadow:0 8px 30px #00000014;color:#888}
${L} .hero{grid-template-columns:1fr;text-align:center;min-height:78svh;align-content:center;background:#f6f4f1}
${L} .hero h1{max-width:14ch;margin-inline:auto;font-weight:700}
${L} .hero-media{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}
${L} .gallery{padding-top:0}
${L} .gallery-grid{grid-auto-rows:220px;gap:10px}
${L} .button{border-radius:999px}
${L} .button-primary{background:var(--ink);color:var(--paper);border-color:var(--ink)}
${L} .glass-float{display:none}
`,
    'raycast-glow': `
${L}, ${L} .hero, ${L} .site-header{background:#0d0d12;color:#f7f7fb}
${L} .site-header{border-bottom:1px solid #ffffff12;color:#f7f7fb;backdrop-filter:none}
${L} .site-header .wordmark,${L} .site-header nav a{color:#f7f7fb}
${L} .hero{grid-template-columns:1fr;text-align:center;background:
  radial-gradient(600px 280px at 50% 30%,color-mix(in srgb,var(--accent2) 35%,transparent),transparent 70%),#0d0d12}
${L} .hero h1,${L} .hero .eyebrow,${L} .hero-copy>p{color:#f7f7fb}
${L} .layout-command{display:flex;justify-content:center;margin:-40px 0 0;position:relative;z-index:3}
${L} .layout-command .layout-search-field{display:inline-flex;gap:12px;align-items:center;min-width:min(560px,86vw);min-height:56px;padding:0 18px;border-radius:14px;background:#1a1a22;border:1px solid #ffffff22;color:#aaa;box-shadow:0 0 80px color-mix(in srgb,var(--accent) 25%,transparent)}
${L} .layout-command kbd{margin-left:auto;border:1px solid #ffffff22;border-radius:6px;padding:2px 6px;font-size:.7rem}
${L} .hero-media figure{border-radius:18px;border:1px solid color-mix(in srgb,var(--accent2) 35%,transparent);box-shadow:0 0 80px color-mix(in srgb,var(--accent) 30%,transparent)}
${L} .button{border-radius:12px}
${L} .glass-float{display:none}
${L} .offerings,${L} .gallery,${L} .story,${L} .site-footer{background:#0d0d12;color:#f7f7fb}
`,
    'arc-color': `
${L} .layout-arcbar{height:8px;background:linear-gradient(90deg,#ff7a59,#ffd15c,#8bdc7a,#6ea8ff,#c084fc)}
${L} .hero{background:
  radial-gradient(800px 400px at 15% 20%,color-mix(in srgb,#ff7a59 40%,transparent),transparent 60%),
  radial-gradient(700px 380px at 85% 10%,color-mix(in srgb,#6ea8ff 45%,transparent),transparent 55%),
  var(--paper)}
${L} .hero h1{font-weight:800}
${L} .button{border-radius:999px}
${L} .offering-card:nth-child(1){background:color-mix(in srgb,#ff7a59 18%,var(--paper))}
${L} .offering-card:nth-child(2){background:color-mix(in srgb,#6ea8ff 18%,var(--paper))}
${L} .offering-card:nth-child(3){background:color-mix(in srgb,#8bdc7a 18%,var(--paper))}
${L} .hero-media figure{border-radius:28px;border:0}
`,
    'cal-schedule': `
${L} .hero{grid-template-columns:.9fr 1.1fr;background:var(--paper)}
${L} .hero h1{font-weight:700;max-width:12ch}
${L} .hero-media figure{border-radius:16px;border:1px solid color-mix(in srgb,var(--ink) 12%,transparent);box-shadow:0 24px 80px color-mix(in srgb,var(--deep) 16%,transparent)}
${L} .button{border-radius:999px}
${L} .layout-week{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:16px clamp(20px,6vw,110px)}
${L} .layout-week span{text-align:center;padding:12px 0;border:1px solid color-mix(in srgb,var(--ink) 12%,transparent);border-radius:12px;font-size:.8rem}
${L} .offerings .offering-grid{grid-template-columns:1fr;gap:8px}
${L} .offering-card{min-height:auto;display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;padding:18px 22px}
${L} .offering-card h3{margin-top:0;font-size:1.15rem}
${L} .contact-card{border-radius:16px}
`,
    'resend-ink': `
${L} .site-header,${L} .hero{background:#0b0d10;color:#f3f4f6}
${L} .site-header{backdrop-filter:none;border-bottom:1px solid #ffffff12}
${L} .site-header .wordmark,${L} .site-header nav a,${L} .hero h1,${L} .hero-copy>p,${L} .hero .eyebrow{color:#f3f4f6}
${L} .hero{grid-template-columns:1.1fr .9fr}
${L} .hero h1{font-weight:500;letter-spacing:-.05em}
${L} .button-primary{background:#fff;color:#090909;border-color:#fff;border-radius:8px}
${L} .hero-media figure{border:1px solid #ffffff1a;border-radius:12px;box-shadow:none}
${L} .glass-float{display:none}
${L} .story{background:#0b0d10;color:#f3f4f6}
`,
    'clerk-cards': `
${L} .hero{grid-template-columns:1fr 1fr}
${L} .offering-grid,${L} .catalog-grid{gap:20px}
${L} .offering-card,${L} .catalog-card,${L} .contact-card{
  border-radius:18px;border:1px solid color-mix(in srgb,var(--ink) 10%,transparent);
  box-shadow:0 16px 50px color-mix(in srgb,var(--deep) 10%,transparent);background:color-mix(in srgb,var(--paper) 88%,#fff)
}
${L} .button{border-radius:12px}
${L} .hero-media figure{border-radius:20px}
`,
    'framer-motion': `
${L} .hero{min-height:100svh}
${L} .hero h1{font-size:clamp(3.4rem,10vw,9rem);line-height:.82}
${L} .gallery-grid figure{transition:transform .6s cubic-bezier(.2,.75,.2,1)}
${L} .button{border-radius:0;letter-spacing:.04em;text-transform:uppercase}
${L} .site-header{mix-blend-mode:difference;color:#fff;background:transparent;border:0;backdrop-filter:none}
${L} .site-header .wordmark,${L} .site-header nav a{color:#fff}
`,
    'webflow-studio': `
${L}{display:grid;grid-template-columns:56px minmax(0,1fr)}
${L} > .skip-link{grid-column:1/-1;height:0;min-height:0;padding:0;overflow:visible}
${L} .mobile-action,${L} .layout-nowplaying{grid-column:1/-1}
${L} .layout-rail{grid-row:1/span 8;background:#1b1b1f;display:flex;flex-direction:column;gap:14px;padding:18px 12px}
${L} .layout-rail span{display:block;width:28px;height:28px;border-radius:6px;background:#ffffff18}
${L} .hero{grid-template-columns:1fr 1fr}
${L} .hero h1{font-weight:500}
${L} .button{border-radius:4px}
${L} .offering-card{border-left:6px solid var(--accent)}
${L} .hero-media figure{border-radius:8px;border:1px solid color-mix(in srgb,var(--ink) 12%,transparent)}
${L} .gallery-grid{gap:8px}
`,
    'webflow-canvas': `
${L} .hero{grid-template-columns:.8fr 1.2fr;background-image:radial-gradient(color-mix(in srgb,var(--ink) 12%,transparent) 1px,transparent 1px);background-size:18px 18px}
${L} .hero-copy{align-self:end}
${L} .hero-media figure{border-radius:0;border:0}
${L} .feature{grid-template-columns:1.2fr .8fr}
${L} .button{border-radius:6px;letter-spacing:.06em}
`,
    'openai-void': `
${L} .site-header,${L} .hero,${L} .closing{background:#000;color:#fff}
${L} .site-header{border:0;backdrop-filter:none}
${L} .site-header .wordmark,${L} .site-header nav a,${L} .hero h1,${L} .hero-copy>p,${L} .hero .eyebrow{color:#fff}
${L} .hero{grid-template-columns:1fr;text-align:center;min-height:92svh}
${L} .hero h1{font-weight:400;letter-spacing:-.05em;max-width:14ch;margin-inline:auto}
${L} .button{border-radius:999px;background:#fff;color:#000;border-color:#fff}
${L} .hero-media{max-width:720px;margin:48px auto 0;min-height:360px;opacity:.85;width:100%}
${L} .hero-media figure{border:0;border-radius:0;box-shadow:none}
${L} .glass-float{display:none}
`,
    'anthropic-serif': `
${L} .hero,${L} .story,${L} .feature{max-width:1100px;margin-inline:auto}
${L} .hero{grid-template-columns:1fr;padding-block:14vh 8vh}
${L} .hero h1{font-weight:400;letter-spacing:-.03em;max-width:16ch;font-size:clamp(3rem,7vw,6.4rem)}
${L} .hero-copy>p{max-width:42ch;font-size:1.25rem}
${L} .button{border-radius:2px;background:var(--ink);color:var(--paper)}
${L} .hero-media{min-height:520px}
${L} .hero-media figure{border:0;border-radius:2px;box-shadow:none}
${L} .glass-float{display:none}
${L} .gallery-grid{gap:8px}
`,
    'cursor-ide': `
${L} .site-header{background:#141414;color:#e6e6e6;border-bottom:1px solid #2a2a2a;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;backdrop-filter:none}
${L} .site-header .wordmark,${L} .site-header nav a{color:#e6e6e6;font-size:.78rem}
${L} .layout-tabs{display:flex;gap:0;background:#1a1a1a;border-bottom:1px solid #2a2a2a}
${L} .layout-tabs span{padding:10px 16px;font:12px/1 ui-monospace,Menlo,monospace;color:#aaa;border-right:1px solid #2a2a2a}
${L} .layout-tabs .is-on{background:#222;color:#9fe87a}
${L} .hero{background:#1a1a1a;color:#eee;grid-template-columns:1.1fr .9fr}
${L} .hero h1,${L} .hero-copy>p,${L} .hero .eyebrow{color:#eee}
${L} .button{border-radius:6px;background:#9fe87a;color:#111;border-color:#9fe87a}
${L} .hero-media figure{border:1px solid #333;border-radius:8px;box-shadow:none}
${L} .offering-card{background:#161616;color:#ddd;border-color:#2c2c2c}
${L} .glass-float{display:none}
${L} .offerings,${L} .gallery,${L} .story,${L} .site-footer{background:#141414;color:#ddd}
`,
    'github-repo': `
${L} .site-header{background:#010409;color:#e6edf3;border-bottom:1px solid #21262d;backdrop-filter:none}
${L} .site-header .wordmark,${L} .site-header nav a{color:#e6edf3}
${L} .layout-repobar{display:flex;gap:16px;align-items:center;padding:10px clamp(20px,6vw,110px);background:#0d1117;color:#e6edf3;border-bottom:1px solid #21262d;font:600 13px ui-monospace,Menlo,monospace}
${L} .layout-repobar span{border:1px solid #30363d;border-radius:6px;padding:4px 8px}
${L} .hero{background:#0d1117;color:#e6edf3;grid-template-columns:1fr 1fr}
${L} .hero h1,${L} .hero-copy>p,${L} .hero .eyebrow{color:#e6edf3}
${L} .button{border-radius:6px;background:#238636;border-color:#238636;color:#fff}
${L} .offering-card{background:#161b22;color:#e6edf3;border:1px solid #30363d;border-radius:6px;min-height:180px}
${L} .hero-media figure{border:1px solid #30363d;border-radius:6px;box-shadow:none}
${L} .glass-float{display:none}
${L} .offerings,${L} .gallery,${L} .story,${L} .site-footer{background:#0d1117;color:#e6edf3}
`,
    'copilot-split': `
${L} .hero{grid-template-columns:1fr 1fr;background:linear-gradient(180deg,#0b1020,var(--deep))}
${L} .hero h1,${L} .hero-copy>p,${L} .hero .eyebrow{color:#f5f7ff}
${L} .hero-media figure{border-radius:16px;border:1px solid #ffffff22}
${L} .button{border-radius:8px}
${L} .offerings{background:var(--paper)}
${L} .glass-float{display:none}
`,
    'todoist-list': `
${L} .hero{grid-template-columns:1.2fr .8fr}
${L} .hero h1{font-weight:800}
${L} .button-primary{background:#e44332;border-color:#e44332;color:#fff;border-radius:8px}
${L} .offering-grid{grid-template-columns:1fr;gap:10px}
${L} .offering-card{min-height:auto;display:flex;gap:16px;align-items:flex-start;padding:16px 18px;border-radius:10px}
${L} .offering-card h3{margin-top:0}
${L} .offering-card span{width:28px;height:28px;border:2px solid var(--accent);border-radius:6px;flex:0 0 28px}
`,
    'shopify-store': `
${L} .hero{grid-template-columns:1fr 1fr}
${L} .button-primary{background:#008060;border-color:#008060;color:#fff;border-radius:8px}
${L} .hero h1{font-weight:700}
${L} .catalog-grid{grid-template-columns:repeat(3,1fr)}
${L} .catalog-card figure{height:280px;border-radius:12px}
${L} .hero-media figure{border-radius:16px}
`,
    'shopify-play': `
${L} .hero h1{font-weight:900;text-transform:uppercase;letter-spacing:-.06em}
${L} .hero-media figure{border-radius:40px 8px 40px 8px}
${L} .offering-card:nth-child(1){background:var(--accent);color:var(--on-accent)}
${L} .gallery-grid figure{border-radius:28px}
${L} .button{border-radius:999px;font-weight:900}
`,
    'airbnb-photo': `
${L} .site-header{grid-template-columns:auto 1fr auto;backdrop-filter:none;background:#fff;border-bottom:1px solid #00000014}
${L} .layout-searchpill{display:flex;justify-content:center;gap:0;border:1px solid #dddddd;border-radius:999px;overflow:hidden;box-shadow:0 8px 24px #00000014;max-width:520px;margin-inline:auto}
${L} .layout-searchpill span{padding:10px 16px;font-size:.78rem;border-right:1px solid #eee}
${L} .hero{grid-template-columns:1fr;gap:22px}
${L} .hero-copy{max-width:18ch}
${L} .hero h1{font-weight:600}
${L} .hero-media{min-height:64svh}
${L} .hero-media figure{border-radius:16px;border:0;box-shadow:none}
${L} .gallery-grid{gap:8px}
${L} .gallery-grid figure{border:0;border-radius:12px}
${L} .button{border-radius:8px;background:#ff385c;border-color:#ff385c;color:#fff}
${L} .glass-float{border-radius:16px}
`,
    'godly-masonry': `
${L}{background:#0c0c0e;color:#f4f4f5}
${L} .site-header{background:#0c0c0e;border:0;backdrop-filter:none}
${L} .site-header .wordmark,${L} .site-header nav a{color:#f4f4f5}
${L} .layout-pills{display:flex;gap:8px;flex-wrap:wrap;padding:12px clamp(20px,6vw,110px)}
${L} .layout-pills span{border:1px solid #ffffff22;border-radius:999px;padding:6px 12px;font-size:.75rem}
${L} .hero{grid-template-columns:1fr;min-height:auto;padding-block:8vh;background:#0c0c0e;color:#fff}
${L} .hero h1,${L} .hero-copy>p,${L} .hero .eyebrow{color:#fff}
${L} .gallery-grid{grid-auto-rows:160px;gap:8px}
${L} .button{border-radius:999px}
${L} .glass-float{display:none}
${L} .offerings,${L} .story,${L} .site-footer{background:#111214;color:#eee}
`,
    'landbook-grid': `
${L} .hero{grid-template-columns:1fr;text-align:left;min-height:auto;padding-block:10vh}
${L} .hero h1{font-size:clamp(2.6rem,5vw,4.4rem);max-width:16ch}
${L} .catalog-grid,${L} .offering-grid{grid-template-columns:repeat(3,1fr);gap:14px}
${L} .catalog-card,${L} .offering-card{border-radius:16px;border:1px solid color-mix(in srgb,var(--ink) 10%,transparent);box-shadow:0 10px 30px color-mix(in srgb,var(--deep) 8%,transparent)}
${L} .button{border-radius:10px}
`,
    'pentagram-edit': `
${L} .hero{grid-template-columns:1fr;padding-block:16vh 8vh}
${L} .hero h1{font-weight:400;font-size:clamp(3.2rem,8vw,7rem);max-width:12ch;letter-spacing:-.05em}
${L} .hero-copy>p{max-width:36ch;font-size:1.2rem}
${L} .gallery-grid{gap:4px}
${L} .button{border-radius:0;background:var(--ink);color:var(--paper)}
${L} .glass-float{display:none}
${L} .site-header{border:0;background:transparent;backdrop-filter:none}
`,
    'freight-bold': `
${L} .hero{min-height:100svh}
${L} .hero h1{font-size:clamp(4rem,12vw,10rem);line-height:.78;text-transform:uppercase;letter-spacing:-.07em}
${L} .button{border-radius:0;text-transform:uppercase;letter-spacing:.08em}
${L} .offering-card{border:0;background:transparent;border-top:4px solid var(--ink)}
${L} .glass-float{display:none}
${L} .site-header{mix-blend-mode:difference;background:transparent;border:0;color:#fff}
${L} .site-header .wordmark,${L} .site-header nav a{color:#fff}
`,
    'awwwards-arch': `
${L} .hero{grid-template-columns:1fr;min-height:92svh;align-content:end;padding-bottom:8vh}
${L} .hero h1{font-weight:500;max-width:14ch;letter-spacing:-.06em}
${L} .hero-media{position:absolute;inset:0;min-height:100%;z-index:0}
${L} .hero-copy{z-index:2;color:#fff}
${L} .hero h1,${L} .hero-copy>p,${L} .hero .eyebrow{color:#fff}
${L} .hero-media figure{border:0;border-radius:0;height:100%}
${L} .hero-media img{filter:brightness(.55)}
${L} .layout-award{position:absolute;right:4%;top:90px;z-index:3;border:1px solid #fff;color:#fff;padding:8px 12px;font-size:.7rem;letter-spacing:.14em;text-transform:uppercase}
${L} .glass-float{display:none}
${L} .button{border-radius:0}
`,
    'midjourney-bleed': `
${L} .hero{grid-template-columns:1fr;min-height:100svh;align-content:center;text-align:center}
${L} .hero-media{position:absolute;inset:0;min-height:100%}
${L} .hero-media figure{border:0;border-radius:0;height:100%}
${L} .hero-media img{filter:brightness(.45) saturate(1.1)}
${L} .hero-copy{z-index:2;color:#fff}
${L} .hero h1,${L} .hero-copy>p,${L} .hero .eyebrow{color:#fff}
${L} .hero h1{font-weight:400;letter-spacing:-.04em}
${L} .button{border-radius:999px;background:#fff;color:#111;border-color:#fff}
${L} .glass-float{display:none}
${L} .site-header{background:transparent;border:0;color:#fff;backdrop-filter:none}
${L} .site-header .wordmark,${L} .site-header nav a{color:#fff}
`,
    'spotify-player': `
${L}{display:grid;grid-template-columns:240px minmax(0,1fr);background:#000;color:#fff}
${L} > .skip-link{grid-column:1/-1;height:0;min-height:0;padding:0;overflow:visible}
${L} .mobile-action{grid-column:1/-1}
${L} .layout-library{grid-row:1/span 6;background:#121212;margin:8px;border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:12px}
${L} .layout-library strong{font-size:.95rem}
${L} .layout-library span{background:#181818;border-radius:8px;padding:12px}
${L} .site-header{background:#000;color:#fff;border:0;backdrop-filter:none;grid-column:2}
${L} .site-header .wordmark,${L} .site-header nav a{color:#fff}
${L} .button-header{background:#fff;color:#000;border-radius:999px}
${L} .hero{background:#121212;color:#fff;grid-template-columns:1fr;grid-column:2;border-radius:12px;margin:0 8px}
${L} .hero h1,${L} .hero-copy>p,${L} .hero .eyebrow{color:#fff}
${L} .button-primary{background:#1ed760;color:#000;border-color:#1ed760;border-radius:999px}
${L} .gallery,${L} .offerings,${L} .story,${L} .experience,${L} .feature,${L} .catalog,${L} .contact-system,${L} .closing,${L} .site-footer{grid-column:2;background:#121212;color:#fff}
${L} .gallery-grid{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(220px,1fr);overflow-x:auto;grid-template-columns:none;grid-auto-rows:220px}
${L} .gallery-grid figure:nth-child(n){grid-column:auto;grid-row:auto;border-radius:8px;border:0;height:220px}
${L} .offering-card{background:#181818;color:#fff;border:0;border-radius:8px}
${L} .hero-media figure{border:0;border-radius:8px}
${L} .glass-float{display:none}
${L} .layout-nowplaying{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;padding:12px 18px;background:linear-gradient(90deg,#4b1d8f,#1e3a8a);color:#fff;font-weight:700}
${L} .site-footer{background:#000}
`,
    profile: '',
    'harvest-diner': `
${L} .hero{grid-template-columns:1fr;min-height:auto;padding-top:10vh;text-align:center}
${L} .hero-copy{max-width:920px;margin:0 auto}
${L} .hero h1{max-width:22ch;margin-inline:auto}
${L} .hero-copy>p{margin-inline:auto}
${L} .hero-media{min-height:68svh;max-width:1120px;margin:28px auto 0;perspective:1400px}
${L} .hero-media figure{
  border-radius:calc(var(--radius) + 14px);
  transform:rotate(-1.4deg);
  box-shadow:22px 28px 0 color-mix(in srgb,var(--accent2) 62%,transparent);
}
${L} .media-figure{
  border-radius:calc(var(--radius) + 12px);
  box-shadow:18px 22px 0 color-mix(in srgb,var(--accent2) 70%,transparent);
}
${L} .story,.feature,.spotlight,.gallery,.catalog,.contact-system{perspective:1200px}
${L} .layout-pills{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;padding:16px clamp(16px,5vw,80px)}
${L} .layout-pills span{border:var(--border) solid currentColor;border-radius:999px;padding:8px 16px;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase}
${L} .offering-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
${L} .offering-card,.experience-grid article,.proof article,.catalog-card{min-height:300px}
${L} .glass-float{display:none}
`,
    'harvest-clinic': `
${L} .site-header{background:color-mix(in srgb,var(--paper) 88%,transparent);border-bottom:1px solid color-mix(in srgb,var(--ink) 8%,transparent)}
${L} .hero{min-height:78svh;padding-top:12vh;align-items:end}
${L} .hero h1{font-weight:500;letter-spacing:-.05em;max-width:14ch}
${L} .button{border-radius:999px}
${L} .hero-media figure{border-radius:calc(var(--radius) + 18px);box-shadow:none}
${L} .offering-card{background:color-mix(in srgb,var(--paper) 70%,transparent)}
`,
    'harvest-dark': `
${L} .site-header{background:var(--deep);color:var(--on-deep);border-bottom-color:var(--accent);backdrop-filter:none}
${L} .site-header .wordmark,${L} .site-header nav a{color:var(--on-deep)}
${L} .hero{background:var(--deep);color:var(--on-deep);min-height:88svh}
${L} .hero .eyebrow,${L} .hero h1,${L} .hero-copy>p{color:var(--on-deep)}
${L} .hero h1{text-transform:uppercase;letter-spacing:-.03em}
${L} .hero-media figure{border-radius:4px;filter:contrast(1.06) saturate(.9)}
${L} .button-header{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
${L} .marquee-strip{background:var(--accent);color:var(--on-accent)}
`,
    'harvest-photo': `
${L} .hero{position:relative;grid-template-columns:1fr;min-height:92svh;color:var(--on-deep)}
${L} .hero-media{position:absolute;inset:0;min-height:92svh}
${L} .hero-copy{z-index:2;padding:18vh 8vw 10vh;max-width:18ch}
${L} .hero .eyebrow,${L} .hero h1,${L} .hero-copy>p{color:var(--on-deep)}
${L} .hero-media figure{border:0;border-radius:0;height:92svh;box-shadow:none}
${L} .hero-media img{filter:brightness(.68)}
${L} .glass-float{display:none}
${L} .button-primary{border-radius:999px}
`,
    'harvest-shop': `
${L} .hero{grid-template-columns:1.05fr .95fr;align-items:center}
${L} .gallery-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
${L} .catalog-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
${L} .layout-pills{display:flex;gap:18px;flex-wrap:wrap;padding:14px clamp(16px,5vw,80px);opacity:.7;text-transform:uppercase;letter-spacing:.12em;font-size:.72rem}
${L} .hero-media figure{border-radius:2px}
`,
    'harvest-split': `
${L} .hero{align-items:center;padding-top:8vh}
${L} .hero h1{max-width:13ch}
`,
  };

  const extra = packs[id] || '';
  const mobile = `
@media (max-width:850px){
  ${L} .hero{grid-template-columns:1fr}
  ${L} .layout-library,${L} .layout-rail{display:none}
  ${L}{display:block;grid-template-columns:1fr}
  ${L} .layout-search-field,${L} .layout-searchpill{min-width:0;max-width:100%}
}
`;
  return `/* layout:${id} mirrored from ${layout.ref || 'factory profile'} */\n${extra}\n${mobile}\n`;
}

module.exports = { resolveLayout, buildLayoutCss, buildLayoutChrome, RULES, hostLabel };
