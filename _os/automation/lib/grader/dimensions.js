'use strict';

/**
 * The six SIGNAL dimensions. Each check returns a verdict of true, false, or
 * null. Null means "this pass could not determine it" and is excluded from both
 * sides of the ratio, so a blocked or JS-rendered page comes back as low
 * confidence rather than as a fake bad score. That distinction is the whole
 * reason the grader can be trusted to suppress outreach.
 */

const WEIGHTS = require('./weights.json');

const YES = (evidence) => ({ hit: true, evidence });
const NO = (evidence) => ({ hit: false, evidence });
const UNKNOWN = (evidence) => ({ hit: null, evidence });

/** Sliding credit: full points at or under `good`, zero at or over `bad`. */
function slide(value, good, bad) {
  if (value == null || !Number.isFinite(value)) return null;
  if (value <= good) return 1;
  if (value >= bad) return 0;
  return Number(((bad - value) / (bad - good)).toFixed(3));
}

const CHECKS = {
  structure: {
    https: (p) => (p.finalUrl.startsWith('https://') ? YES('https') : NO(`served over ${p.protocol}`)),
    redirectHygiene: (p) => {
      if (p.redirects.length === 0) return YES('direct response');
      if (p.redirects.length <= 2) return YES(`${p.redirects.length} redirect(s)`);
      return NO(`${p.redirects.length} redirect hops`);
    },
    titleQuality: (p, s) => {
      if (!s.title) return NO('no <title>');
      if (s.titleIsTemplate) return NO(`template title "${s.title}"`);
      const len = s.title.trim().length;
      if (len < 12) return NO(`title only ${len} chars`);
      if (len > 75) return NO(`title ${len} chars, truncates in results`);
      return YES(`"${s.title.slice(0, 60)}"`);
    },
    metaDescription: (p, s) => {
      if (!s.metaDescription) return NO('no meta description');
      const len = s.metaDescription.trim().length;
      if (len < 50 || len > 180) return NO(`meta description ${len} chars`);
      return YES(`${len} chars`);
    },
    docShape: (p, s) => {
      if (!s.hasDoctype) return NO('missing HTML5 doctype');
      if (!s.lang) return NO('no lang attribute on <html>');
      return YES(`doctype + lang="${s.lang}"`);
    },
    noLayoutTables: (p, s) => (s.layoutTableTells.length ? NO(s.layoutTableTells.join(', ')) : YES('no layout tables')),
    noDeadTech: (p, s) => (s.deadTech.length ? NO(s.deadTech.join(', ')) : YES('no dead tech')),
  },

  impression: {
    modernCss: (p, s) => {
      const c = s.modernCss;
      const hits = [c.customProps && 'custom properties', c.grid && 'grid', c.flex && 'flex', c.clamp && 'clamp()', c.aspectRatio && 'aspect-ratio', c.utilityFramework && 'utility classes'].filter(Boolean);
      if (hits.length >= 3) return YES(hits.join(', '));
      if (hits.length >= 1) return { hit: 0.5, evidence: `only ${hits.join(', ')}` };
      // All CSS may live in an external file this pass never fetched.
      if (c.externalStylesheets > 0) return UNKNOWN(`${c.externalStylesheets} external stylesheet(s), no inline modern CSS`);
      return NO('no modern CSS features found');
    },
    typography: (p, s) => (s.webfonts ? YES('webfont loaded') : s.modernCss.externalStylesheets > 0 ? UNKNOWN('fonts may be in external CSS') : NO('browser default typography')),
    noDatedMotion: (p, s) => (s.datedMotion.length ? NO(s.datedMotion.join(', ')) : YES('no dated motion')),
    imageCraft: (p, s) => {
      const i = s.images;
      if (i.count === 0) return NO('no images at all');
      const hits = [];
      const missing = [];
      if (i.modernFormat > 0) hits.push(`${i.modernFormat} webp/avif`);
      else missing.push('no webp/avif');
      if (i.srcset > 0) hits.push(`${i.srcset} responsive`);
      else missing.push('no srcset');
      const gifRatio = i.count ? i.gifs / i.count : 0;
      if (gifRatio > 0.3) return NO(`${i.gifs}/${i.count} images are GIFs`);
      if (hits.length >= 2) return YES(hits.join(', '));
      if (hits.length === 1) return { hit: 0.5, evidence: `${hits[0]}, ${missing.join(', ')}` };
      return NO(`${i.count} images, none modern-format or responsive`);
    },
    heroPresence: (p, s) => {
      if (!s.hero.hasH1 && !s.hero.leadMedia) return NO('no h1 and no lead media');
      if (!s.hero.hasH1) return { hit: 0.5, evidence: 'lead media but no h1' };
      if (!s.hero.leadMedia) return { hit: 0.5, evidence: 'h1 but no lead image' };
      return YES(`h1 "${s.h1s[0].slice(0, 50)}" over lead media`);
    },
    notStub: (p, s) => {
      if (s.platformStub.length) return NO(s.platformStub.join(', '));
      if (s.stubMarkers) return NO('placeholder or parked-page copy');
      if (s.words < 80) return NO(`only ${s.words} words on the page`);
      return YES('real page, not a placeholder');
    },
  },

  getFound: {
    structuredData: (p, s) => {
      if (s.jsonLd.blocks === 0) return NO('no JSON-LD');
      if (s.jsonLd.parsed === 0) return NO(`${s.jsonLd.blocks} JSON-LD block(s), none parse`);
      const business = s.jsonLd.types.filter((t) => /LocalBusiness|Organization|Restaurant|Store|Dentist|Physician|Plumber|HVAC|HomeAndConstruction|ProfessionalService|MedicalBusiness|FoodEstablishment/i.test(t));
      if (!business.length) return { hit: 0.5, evidence: `JSON-LD present (${s.jsonLd.types.slice(0, 4).join(', ') || 'untyped'}) but no business type` };
      return YES(`${business.slice(0, 3).join(', ')}`);
    },
    napOnPage: (p, s) => {
      const c = s.contact;
      const parts = [c.phoneText && 'phone', (c.addressText || c.zipText) && 'address', 'name'].filter(Boolean);
      if (c.phoneText && (c.addressText || c.zipText)) return YES(parts.join(' + '));
      if (c.phoneText || c.addressText || c.zipText) return { hit: 0.5, evidence: `only ${parts.join(' + ')} as text` };
      return NO('no phone or address as selectable text');
    },
    socialCards: (p, s) => {
      if (s.openGraph && s.twitterCard) return YES('og + twitter card');
      if (s.openGraph || s.twitterCard) return { hit: 0.5, evidence: s.openGraph ? 'og only' : 'twitter card only' };
      return NO('no share metadata');
    },
    headingOrder: (p, s) => {
      if (s.h1s.length === 0) return NO('no h1');
      if (s.h1s.length > 1) return { hit: 0.5, evidence: `${s.h1s.length} h1 elements` };
      if (s.h2Count === 0) return { hit: 0.5, evidence: 'single h1, no h2 structure' };
      return YES(`1 h1, ${s.h2Count} h2`);
    },
    contentDepth: (p, s) => {
      const credit = slide(400 - Math.min(s.words, 400), 100, 320);
      if (s.words >= 300) return YES(`${s.words} words`);
      if (s.words >= 120) return { hit: credit, evidence: `${s.words} words, thin` };
      return NO(`${s.words} words`);
    },
    crawlFiles: (p) => {
      if (p.robots == null && p.sitemap == null) return UNKNOWN('crawl files not checked this pass');
      const hits = [p.robots?.reachable && 'robots.txt', p.sitemap?.reachable && 'sitemap.xml'].filter(Boolean);
      if (hits.length === 2) return YES(hits.join(' + '));
      if (hits.length === 1) return { hit: 0.5, evidence: `${hits[0]} only` };
      return NO('no robots.txt or sitemap.xml');
    },
  },

  navigation: {
    viewport: (p, s) => {
      if (!s.viewport) return NO('no viewport meta: renders desktop-width on phones');
      if (!s.viewportResponsive) return NO(`viewport "${s.viewport}" is not device-width`);
      return YES('responsive viewport');
    },
    realNav: (p, s) => {
      if (!s.nav.hasNavElement && s.nav.internalPathCount < 3) return NO('no navigation found');
      if (s.nav.internalPathCount < 3) return { hit: 0.5, evidence: `nav markup but only ${s.nav.internalPathCount} internal link(s)` };
      return YES(`${s.nav.internalPathCount} internal links`);
    },
    multiPage: (p, s) => {
      if (s.nav.internalPathCount >= 5) return YES(`${s.nav.internalPathCount} distinct pages linked`);
      if (s.nav.internalPathCount >= 2) return { hit: 0.5, evidence: `${s.nav.internalPathCount} pages` };
      return NO('single-page brochure');
    },
    altText: (p, s) => {
      const i = s.images;
      if (i.count === 0) return UNKNOWN('no images to check');
      const ratio = i.withAlt / i.count;
      if (ratio >= 0.9) return YES(`${i.withAlt}/${i.count} images have alt`);
      if (ratio >= 0.5) return { hit: 0.5, evidence: `${i.withAlt}/${i.count} images have alt` };
      return NO(`${i.withAlt}/${i.count} images have alt`);
    },
    landmarks: (p, s) => {
      const l = s.landmarks;
      const hits = [l.main && 'main', l.header && 'header', l.footer && 'footer', l.skipLink && 'skip link'].filter(Boolean);
      if (hits.length >= 3) return YES(hits.join(', '));
      if (hits.length >= 1) return { hit: 0.5, evidence: hits.join(', ') };
      return NO('no semantic landmarks');
    },
    // Width/height attributes on images are good practice now: they reserve
    // space and stop layout shift. Only unconstrained fixed CSS widths are the
    // problem, so this looks at the stylesheet, not the img tags.
    noFixedWidth: (p, s) => (s.fixedWidth ? NO('hardcoded desktop widths in CSS') : YES('no fixed desktop widths')),
  },

  action: {
    tapToCall: (p, s) => {
      if (s.contact.telLinks > 0) return YES(`${s.contact.telLinks} tel: link(s)`);
      if (s.contact.phoneText) return NO('phone is text only, not tappable');
      return NO('no phone number on the page');
    },
    primaryCta: (p, s) => {
      if (s.cta.inTopSlice) return YES('CTA language above the fold');
      if (s.cta.anywhere) return { hit: 0.5, evidence: 'CTA exists but buried' };
      if (s.cta.buttonish > 0) return { hit: 0.5, evidence: `${s.cta.buttonish} button-styled links, no CTA copy` };
      return NO('no call to action');
    },
    contactPath: (p, s) => {
      if (s.contact.hasForm) return YES('form or booking embed');
      if (s.contact.contactPage) return { hit: 0.5, evidence: 'contact page linked, no form here' };
      if (s.contact.mailLinks > 0) return { hit: 0.5, evidence: 'mailto only' };
      return NO('no form, booking, or contact page');
    },
    directions: (p, s) => {
      if (s.contact.mapLinks > 0) return YES('map link');
      if (s.contact.addressText) return { hit: 0.5, evidence: 'address text, no map link' };
      return NO('no address or directions');
    },
    hours: (p, s) => (s.contact.hoursText ? YES('hours published') : NO('no hours on the page')),
    socialProof: (p, s) => {
      if (s.contact.socialLinks > 0) return YES(`${s.contact.socialLinks} social link(s)`);
      if (/\b(?:review|testimonial|\d(?:\.\d)?\s*(?:star|out of 5))/i.test(s.text)) return YES('reviews or testimonials on page');
      return NO('no social links or reviews');
    },
  },

  load: {
    htmlWeight: (p, s) => {
      const kb = Math.round(s.bytes / 1024);
      const credit = slide(kb, 150, 600);
      if (credit === 1) return YES(`${kb}KB HTML`);
      if (credit === 0) return NO(`${kb}KB HTML document`);
      return { hit: credit, evidence: `${kb}KB HTML` };
    },
    responseTime: (p) => {
      const credit = slide(p.ttfbMs, 1200, 5000);
      if (credit == null) return UNKNOWN('no timing captured');
      if (credit === 1) return YES(`${p.ttfbMs}ms to first byte`);
      if (credit === 0) return NO(`${p.ttfbMs}ms to first byte`);
      return { hit: credit, evidence: `${p.ttfbMs}ms to first byte` };
    },
    scriptRestraint: (p, s) => {
      if (s.scripts.external <= 8 && s.scripts.blocking <= 2) return YES(`${s.scripts.external} scripts, ${s.scripts.blocking} blocking`);
      if (s.scripts.external <= 15) return { hit: 0.5, evidence: `${s.scripts.external} scripts, ${s.scripts.blocking} blocking` };
      return NO(`${s.scripts.external} external scripts, ${s.scripts.blocking} blocking`);
    },
    lazyImages: (p, s) => {
      if (s.images.count <= 3) return UNKNOWN('too few images to matter');
      const ratio = s.images.lazy / s.images.count;
      if (ratio >= 0.5) return YES(`${s.images.lazy}/${s.images.count} lazy-loaded`);
      if (ratio > 0) return { hit: 0.5, evidence: `${s.images.lazy}/${s.images.count} lazy-loaded` };
      return NO(`0/${s.images.count} images lazy-loaded`);
    },
  },
};

/**
 * Run every dimension against a fetched page plus its scan.
 * Returns per-dimension awarded/available points and a flat check ledger.
 */
function gradeDimensions(page, scanned) {
  const dimensions = {};
  const ledger = [];

  for (const [dimId, dimSpec] of Object.entries(WEIGHTS.dimensions)) {
    let awarded = 0;
    let available = 0;
    const checks = [];

    for (const [checkId, checkSpec] of Object.entries(dimSpec.checks)) {
      const fn = CHECKS[dimId] && CHECKS[dimId][checkId];
      const result = fn ? fn(page, scanned) : UNKNOWN('check not implemented');
      const row = {
        dimension: dimId,
        id: checkId,
        label: checkSpec.label,
        tier: checkSpec.tier || 'stakes',
        max: checkSpec.points,
        hit: result.hit,
        evidence: result.evidence,
      };
      if (result.hit === null) {
        row.points = null;
      } else {
        const credit = result.hit === true ? 1 : result.hit === false ? 0 : Number(result.hit);
        row.points = Number((checkSpec.points * credit).toFixed(2));
        awarded += row.points;
        available += checkSpec.points;
      }
      checks.push(row);
      ledger.push(row);
    }

    // Normalize to the dimension's full weight so unknowns neither help nor hurt.
    const raw = available > 0 ? awarded / available : null;
    dimensions[dimId] = {
      label: dimSpec.label,
      letter: dimSpec.letter,
      max: dimSpec.max,
      awarded: Number(awarded.toFixed(2)),
      available,
      score: raw == null ? null : Number((raw * dimSpec.max).toFixed(2)),
      determined: available / Object.values(dimSpec.checks).reduce((a, c) => a + c.points, 0),
      checks,
    };
  }

  return { dimensions, ledger };
}

module.exports = { gradeDimensions, CHECKS, slide };
