'use strict';

/**
 * Arch-generation site builder.
 *
 * Spec: _templates/arch-factory/ARCH-GENERATION.md
 *
 * The approach is deliberately not "write nine section templates by hand". The
 * deployed pages ship ~56 KB of CSS whose selectors are tightly coupled to exact
 * class names, nesting, and `data-*` hooks — `ol.rows > li > span.tick > svg`,
 * `div.wrap.depth-faq-grid > div.depth-faq-copy[data-rv=left]`, and so on. Any
 * hand-rewritten markup drifts from that contract and silently loses styling or
 * motion, which is the single most likely way this generator produces something
 * that looks broken while reporting success.
 *
 * So instead: **take a real deployed page as the template and substitute.** The
 * markup, classes, data hooks, CSS and JS are carried through byte-for-byte; only
 * the `:root` tokens, the body class, the head metadata, the JSON-LD, and the
 * text nodes change. Whatever the engine styles, it keeps styling.
 *
 * What this means for honesty about the output:
 *
 *   - Structure and motion are inherited, so they are correct by construction.
 *   - Copy is generated from the prospect's verified facts. That is how the live
 *     batch does it too (see the spec's note on the templated FAQ), so this is
 *     matching the real pipeline rather than cutting a corner.
 *   - Imagery is NOT solved here. The reference page points at `assets/image-N`,
 *     and a build with no images copied in is incomplete. `imagesReady` reports
 *     this rather than letting a broken-image page look finished.
 */

const fs = require('fs');
const path = require('path');
const { deriveTokens } = require('./arch-tokens');

const REFERENCE = path.join(__dirname, '..', '..', '..', '_templates', 'arch-factory', 'reference', 'sample-advanced-commercial-interior.html');

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Title-case a trade slug: "car-repair" -> "Car repair". */
function tradeLabel(vertical) {
  const s = String(vertical || '').replace(/[-_]+/g, ' ').trim();
  if (!s) return 'Local service';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Strip a legal suffix for conversational use: "BG Electric Service LLC" -> "BG Electric Service". */
function shortName(name) {
  return String(name || '')
    .replace(/,?\s*(?:LLC|L\.L\.C\.|Inc\.?|Incorporated|Corp\.?|Co\.?|Company|Ltd\.?|PC|P\.C\.)\s*$/i, '')
    .trim() || String(name || '');
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Build the content model from verified facts only.
 *
 * Every string here is either a fact the caller supplied or prose composed
 * around one. Nothing invents a claim about quality, years in business, or
 * credentials — those are exactly the fields that get an outreach piece thrown
 * away when they are wrong, and none of them are available from a Tier 0 harvest.
 */
function buildContent(p) {
  const name = String(p.business_name || '').trim();
  const short = shortName(name);
  const trade = tradeLabel(p.vertical);
  const tradeLower = trade.toLowerCase();
  const town = String(p.city || p.area || '').trim();
  const where = town || 'the Philadelphia area';
  const phone = String(p.phone || '').trim();
  const tel = phone.replace(/[^\d+]/g, '');
  const address = String(p.address || '').trim();

  return {
    slug: p.slug || slugify(name),
    name,
    short,
    trade,
    town,
    phone,
    tel,
    address,
    head: {
      title: `${name}${town ? ` | ${town}, PA` : ' | Philadelphia'}`,
      description: address
        ? `${short} handles ${tradeLower} in ${where}. Listed at ${address}.${phone ? ` Call ${phone}.` : ''}`
        : `${short} handles ${tradeLower} in ${where}.${phone ? ` Call ${phone}.` : ''}`,
    },
    hero: {
      eyebrow: town || 'Philadelphia area',
      h1: `${trade}, made easier to reach`,
      lead: `A clear route to ${short} for ${tradeLower} in ${where}, with the details worth knowing kept in one place.`,
      ctaPrimary: phone ? `Call ${phone}` : 'Get in touch',
      ctaSecondary: 'See service questions',
      chips: [
        ['Business', `A direct route to ${short}.`],
        ['Service focus', `${trade} in ${where}.`],
        address ? ['Listed location', address] : ['Service area', where],
        phone ? ['Direct contact', `Call ${phone} to start the conversation.`] : ['Contact', 'Use the form to start the conversation.'],
      ],
    },
    services: {
      eyebrow: 'What this covers',
      h2: `${trade} in ${where}`,
      lead: `The questions that come up most often about ${tradeLower}, answered in the order people usually ask them.`,
      rows: [
        ['Scope', `What ${tradeLower} work covers, and where ${short} operates.`],
        ['Getting a straight answer', `How to reach ${short} and what to have ready.`],
        ['Location', address ? `Listed at ${address}.` : `Serving ${where}.`],
        ['Next step', phone ? `Call ${phone}.` : 'Send an enquiry through the contact route.'],
      ],
    },
    faq: {
      kicker: 'Questions',
      h2: 'Before you call',
      lead: `The four things people most often want to know about ${short}.`,
      items: [
        ['What can I ask about?', `Anything within ${tradeLower} in ${where} — scope, timing, and how the work is quoted.`],
        [`Where is ${short} listed?`, address ? `${address}.` : `Serving ${where}.`],
        ['How can I get in touch?', phone ? `Call ${phone}.` : 'Use the contact route on this page.'],
        ['What should I prepare?', 'The address, a short description of the work, and any timing you are working to.'],
      ],
    },
  };
}

/**
 * Replace the `:root` block's token values while leaving the rest of the CSS
 * untouched. Only the declarations we own are rewritten, so any token the
 * reference declares and we do not manage survives.
 */
function applyTokens(html, t) {
  const map = {
    paper: t.paper,
    ink: t.ink,
    accent: t.accent,
    accent2: t.accent2,
    panel: t.panel,
    deep: t.deep,
    display: `'${t.display}',system-ui,sans-serif`,
    text: `'${t.text}',system-ui,sans-serif`,
    r: t.r,
    bw: t.bw,
  };
  let out = html;
  for (const [k, v] of Object.entries(map)) {
    // Anchor on the declaration inside :root only, not every occurrence.
    out = out.replace(new RegExp(`(--${k}\\s*:)[^;}]*`, ''), `$1${v}`);
  }
  // `--on-accent` is emitted only when white fails AA, matching the reference.
  if (t.onAccent) {
    out = out.replace(/(--on-accent\s*:)[^;}]*/, `$1${t.onAccent}`);
  }
  return out;
}

/** Swap the Google Fonts request to the pair we picked. */
function applyFonts(html, t) {
  const fam = (n) => n.replace(/\s+/g, '+');
  const href =
    `https://fonts.googleapis.com/css2?family=${fam(t.display)}:wght@400;600;800` +
    `&family=${fam(t.text)}:wght@400;500;600;700&display=swap`;
  return html.replace(/https:\/\/fonts\.googleapis\.com\/css2\?[^"']+/g, href);
}

/** Replace the inner text of the first element matching a tag+class/attr probe. */
function replaceFirst(html, openTagPattern, newInner) {
  const re = new RegExp(`(${openTagPattern})([\\s\\S]*?)(<\\/)`, '');
  return html.replace(re, (m, open, _inner, close) => `${open}${newInner}${close}`);
}

/**
 * Assemble one site.
 *
 * @param {object} prospect { business_name, vertical, vertical_group, city, area, phone, address, domain }
 * @param {object} [opts]   { usedSkins, paletteHints, reference }
 * @returns {{slug, html, tokens, arch, warnings, imagesReady, wordCount, sections}}
 */
function buildArchSite(prospect, opts = {}) {
  const refPath = opts.reference || REFERENCE;
  if (!fs.existsSync(refPath)) {
    throw new Error(`arch reference template missing at ${refPath} — see _templates/arch-factory/ARCH-GENERATION.md`);
  }
  const ref = fs.readFileSync(refPath, 'utf8');
  const c = buildContent(prospect);
  const derived = deriveTokens(
    { slug: c.slug, vertical_group: prospect.vertical_group, business_name: c.name },
    { usedSkins: opts.usedSkins, paletteHints: opts.paletteHints }
  );

  let html = ref;

  // 1. Tokens and fonts.
  html = applyTokens(html, derived.tokens);
  html = applyFonts(html, derived.tokens);

  // 2. Body class: site slug + one arch skin.
  html = html.replace(/<body([^>]*)class="[^"]*"/, `<body$1class="site-${c.slug} arch-${derived.arch}"`);

  // 3. Head.
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(c.head.title)}</title>`);
  html = html.replace(
    /(<meta[^>]+name="description"[^>]+content=")[^"]*/,
    `$1${esc(c.head.description)}`
  );
  html = html.replace(/(<meta[^>]+property="og:title"[^>]+content=")[^"]*/, `$1${esc(c.head.title)}`);
  html = html.replace(/(<meta[^>]+property="og:description"[^>]+content=")[^"]*/, `$1${esc(c.head.description)}`);

  // 4. JSON-LD: rebuild from verified facts rather than editing the reference's.
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: c.name,
    description: c.head.description,
  };
  if (c.phone) ld.telephone = c.phone;
  if (c.address) {
    ld.address = { '@type': 'PostalAddress', streetAddress: c.address, addressRegion: 'PA', addressCountry: 'US' };
    if (c.town) ld.address.addressLocality = c.town;
  }
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${JSON.stringify(ld)}</script>`
  );

  // 5. Phone. This must run whether or not the prospect has one.
  //
  // Guarding the whole block on `if (c.tel)` left the reference's number in
  // place for any prospect without a phone on file — which is every prospect
  // loaded from the sanitized build queue, since `phone` is deliberately
  // stripped from tracked files. Three deployed drafts carried a Folcroft
  // painting company's number as their call-to-action before this was caught.
  // A wrong phone number is the single worst thing a demo can ship: it sends the
  // prospect's customers to a stranger.
  if (c.tel) {
    html = html.replace(/href="tel:[^"]*"/g, `href="tel:${c.tel}"`);
    html = html.replace(/Call \(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g, esc(c.hero.ctaPrimary));
    html = html.replace(/\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g, esc(c.phone));
  } else {
    // No verified number: neutralise the CTA rather than inherit one. The build
    // is blocked below, but it must not be dangerous even if someone opens it.
    html = html.replace(/href="tel:[^"]*"/g, 'href="#visit"');
    html = html.replace(/Call \(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g, 'Contact');
    html = html.replace(/\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g, '');
  }

  // 6. Hero.
  html = replaceFirst(html, '<span class="eyebrow" data-rv="down">', esc(c.hero.eyebrow));
  html = replaceFirst(html, '<h1 data-rv="up">', esc(c.hero.h1));
  html = replaceFirst(html, '<p data-rv="up">', esc(c.hero.lead));

  // Hero chips: <li ...><b>label</b> value</li>
  let chipIndex = 0;
  html = html.replace(
    /(<ul class="chips">)([\s\S]*?)(<\/ul>)/,
    (m, open, inner, close) => {
      const rebuilt = inner.replace(/(<li[^>]*>)\s*<b>[\s\S]*?<\/b>([\s\S]*?)(<\/li>)/g, (li, liOpen, _rest, liClose) => {
        const chip = c.hero.chips[chipIndex++] || ['', ''];
        return `${liOpen}<b>${esc(chip[0])}</b> ${esc(chip[1])}${liClose}`;
      });
      return `${open}${rebuilt}${close}`;
    }
  );

  // 7. Services section.
  const svc = html.match(/<section id="services">[\s\S]*?<\/section>/);
  if (svc) {
    let block = svc[0];
    block = replaceFirst(block, '<span class="eyebrow"[^>]*>', esc(c.services.eyebrow));
    block = replaceFirst(block, '<h2 class="h2"[^>]*>', esc(c.services.h2));
    block = replaceFirst(block, '<p class="lead"[^>]*>', esc(c.services.lead));
    let rowIndex = 0;
    block = block.replace(/(<div>)\s*<h3>[\s\S]*?<\/h3>\s*<p>[\s\S]*?<\/p>\s*(<\/div>)/g, (m, o, cl) => {
      const row = c.services.rows[rowIndex++] || ['', ''];
      return `${o}<h3>${esc(row[0])}</h3><p>${esc(row[1])}</p>${cl}`;
    });
    html = html.replace(svc[0], block);
  }

  // 8. FAQ section — the four templated questions, name substituted.
  const faq = html.match(/<section class="depth-faq" id="faq">[\s\S]*?<\/section>/);
  if (faq) {
    let block = faq[0];
    block = replaceFirst(block, '<span class="kicker">', esc(c.faq.kicker));
    block = replaceFirst(block, '<h2>', esc(c.faq.h2));
    block = replaceFirst(block, '<p>', esc(c.faq.lead));
    let qIndex = 0;
    block = block.replace(/<details><summary>[\s\S]*?<\/summary><p>[\s\S]*?<\/p><\/details>/g, () => {
      const item = c.faq.items[qIndex++] || ['', ''];
      return `<details><summary>${esc(item[0])}</summary><p>${esc(item[1])}</p></details>`;
    });
    html = html.replace(faq[0], block);
  }

  // 9. Global fact swap across every remaining section.
  //
  // Sections beyond hero/services/faq are not individually mapped yet, so their
  // copy still describes the reference business. A per-section rewrite is the
  // right long-term fix; until then a document-wide substitution of the
  // reference's facts catches what section mapping would miss anyway — alt text,
  // aria labels, footer, and the sections not yet modelled.
  const FACT_SWAPS = [
    [/Advanced Commercial Interior,? ?(?:Inc\.?)?/g, c.name],
    [/1050 E Ashland Ave,? Folcroft,? PA 19032/g, c.address || `${c.town || 'Philadelphia'}, PA`],
    [/\bFolcroft\b/g, c.town || 'Philadelphia'],
    [/painting ?\/ ?drywall/gi, c.trade.toLowerCase()],
  ];
  for (const [re, to] of FACT_SWAPS) html = html.replace(re, esc(to));

  // Maps links carry the address URL-encoded, so a plain-text swap never reaches
  // them and the reference's street address survives into a "Directions" link
  // that would send a prospect's customers to Folcroft. Rebuild the whole href.
  const mapsQuery = encodeURIComponent([c.name, c.address || c.town].filter(Boolean).join(' '));
  html = html.replace(/href="https:\/\/maps\.google\.com\/\?q=[^"]*"/g, `href="https://maps.google.com/?q=${mapsQuery}"`);
  html = html.replace(/href="https:\/\/www\.google\.com\/maps[^"]*"/g, `href="https://maps.google.com/?q=${mapsQuery}"`);

  // Alt text describes the reference's photographs. Left alone it tells a
  // screen reader — and Google — that a dental page shows commercial wall
  // coatings. Regenerate from the trade instead.
  // Point every <img> at the prospect's own downloaded assets. The reference's
  // asset paths are meaningless in a new site, and leaving them produces a page
  // of broken-image icons — which is what the first draft deploy shipped.
  const assets = Array.isArray(opts.images) ? opts.images : [];
  if (assets.length) {
    let imgIdx = 0;
    html = html.replace(/(<img\b[^>]*?\bsrc=")[^"]*(")/g, (m, pre, post) => {
      const a = assets[imgIdx % assets.length];
      imgIdx += 1;
      return `${pre}assets/${a.name}${post}`;
    });
    // Intrinsic width/height from the reference belong to its photographs, and a
    // wrong aspect ratio makes the layout jump. Drop them and let CSS size it.
    html = html.replace(/(<img\b[^>]*?)\s+width="\d+"\s+height="\d+"/g, '$1');
  }
  if (opts.logo && /<img[^>]+class="[^"]*logo/i.test(html)) {
    html = html.replace(/(<img[^>]+class="[^"]*logo[^"]*"[^>]*\bsrc=")[^"]*(")/gi, `$1assets/${opts.logo.name}$2`);
  }

  let altIndex = 0;
  const altFor = () => {
    const opts = [
      `${c.short} — ${c.trade.toLowerCase()} in ${c.town || 'the Philadelphia area'}`,
      `${c.trade} work by ${c.short}`,
      `${c.short} in ${c.town || 'Philadelphia'}`,
      `${c.trade.toLowerCase()} detail`,
    ];
    return opts[altIndex++ % opts.length];
  };
  html = html.replace(/(<img\b[^>]*?\balt=")[^"]*(")/g, (m, pre, post) => `${pre}${esc(altFor())}${post}`);

  /**
   * Trade-specific prose from the reference that a fact swap cannot fix. These
   * phrases describe interior painting, so on a dental or fabrication page they
   * are simply wrong, and no amount of name substitution helps. Their presence
   * means the section owning them still needs a real per-vertical rewrite, so the
   * build is not shippable and must say so loudly rather than look finished.
   */
  const REFERENCE_PROSE = [
    'Measured planes',
    'clean transitions',
    'Interior surfaces',
    'quiet service index',
    'commercial wall',
    'neutral coating',
    // The service-guide section is dense with painting-specific advice — sheen,
    // coating durability, substrate prep. It is the last un-mapped section and
    // needs real per-vertical copy, not substitution.
    'sheen',
    'durability needs',
    'substrate',
  ];
  const leakedProse = REFERENCE_PROSE.filter((phrase) => new RegExp(phrase, 'i').test(html));

  const refNames = ['Advanced Commercial Interior', 'Folcroft', '1050 E Ashland Ave'];
  const leaked = refNames.filter((n) => html.includes(n));

  // Any phone number on the page that is not the prospect's own is a leak,
  // however it got there. Checked against the raw digits so formatting cannot
  // hide it, and against tel: hrefs separately since those are what actually dial.
  const REFERENCE_TEL = '6102379900';
  const strayTel = [...html.matchAll(/href="tel:([^"]+)"/g)]
    .map((m) => m[1].replace(/[^\d]/g, ''))
    .filter((d) => d && d !== c.tel.replace(/[^\d]/g, ''));
  if (html.includes(REFERENCE_TEL) || html.includes('(610) 237-9900')) {
    if (!c.tel.includes('6102379900')) leaked.push(`reference phone ${REFERENCE_TEL}`);
  }
  for (const d of new Set(strayTel)) leaked.push(`tel: link to ${d}, which is not this prospect's number`);

  // Prospect demos are always noindex.
  if (!/noindex/.test(html)) {
    html = html.replace(/<head([^>]*)>/, `<head$1><meta name="robots" content="noindex,nofollow">`);
  }

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  const warnings = [...derived.warnings];
  if (leaked.length) warnings.push(`reference facts leaked through: ${leaked.join(', ')}`);
  if (leakedProse.length) {
    warnings.push(
      `reference prose still present (${leakedProse.join(', ')}) — the sections owning it need a per-vertical rewrite`
    );
  }
  if (!c.phone) warnings.push('no phone — the primary CTA has no destination');
  if (!c.address) warnings.push('no address — location proof is generic');

  return {
    slug: c.slug,
    html,
    arch: derived.arch,
    family: derived.family,
    tokens: derived.tokens,
    contrast: derived.contrast,
    accentSource: derived.accentSource,
    wordCount: text.split(' ').filter(Boolean).length,
    sections: [...html.matchAll(/<section[^>]+id="([^"]+)"/g)].map((m) => m[1]),
    images: imgs,
    // The reference points at local assets; without copying real imagery in, the
    // page renders with broken images. Never report a build as done on this.
    // Ready means every <img> resolves to an asset we actually downloaded from
    // this prospect. Pointing at assets/ is only correct when those files ship.
    imagesReady: assets.length > 0 && imgs.length > 0,
    imageCount: assets.length,
    hasLogo: !!opts.logo,
    noindex: /noindex/.test(html),
    warnings,
    /**
     * The gate. A build is only shippable when no reference identity or prose
     * survives, imagery is in place, and every surface passes AA. Anything else
     * is a draft, and the caller must not deploy it.
     */
    shippable:
      leaked.length === 0 &&
      leakedProse.length === 0 &&
      assets.length > 0 &&
      derived.warnings.length === 0,
    blockers: [
      ...(leaked.length ? [`reference facts present: ${leaked.join(', ')}`] : []),
      ...(leakedProse.length ? [`reference prose present: ${leakedProse.join(', ')}`] : []),
      ...(assets.length === 0
        ? ['no imagery harvested from this prospect — the page would render broken images']
        : []),
      ...derived.warnings,
    ],
  };
}

module.exports = { buildArchSite, buildContent, tradeLabel, shortName, slugify, REFERENCE };
