'use strict';

/**
 * Signal extraction from raw HTML. Deliberately regex-based, not a DOM parse:
 * we are detecting tells, not rendering a page, and the grader must stay
 * dependency-free so it can run on any list without an install step.
 */

const TEMPLATE_TITLES = [
  /^home$/i,
  /^untitled/i,
  /^welcome to wordpress/i,
  /^my (site|blog|website)/i,
  /^index$/i,
  /^new page/i,
  /^document$/i,
  /^wix site$/i,
  /^squarespace$/i,
  /^site under construction/i,
  /^default web site page$/i,
];

const STUB_MARKERS = [
  /under construction/i,
  /coming soon/i,
  /this domain (is|may be) for sale/i,
  /buy this domain/i,
  /parked (free )?(courtesy|by)/i,
  /godaddy\.com.*domain/i,
  /website coming soon/i,
  /future home of/i,
  /if you are the site owner/i,
  /account (has been )?suspended/i,
  /sedoparking|parkingcrew|afternic|hugedomains/i,
];

const DEAD_TECH = [
  { id: 'flash', re: /\.swf\b|application\/x-shockwave-flash|<embed[^>]+swf/i, label: 'Flash embed' },
  { id: 'frameset', re: /<frameset\b|<frame\b/i, label: 'frameset' },
  { id: 'oldJquery', re: /jquery[.-](?:1\.[0-8]|1\.9)(?:\.\d+)?(?:\.min)?\.js/i, label: 'jQuery 1.x' },
  { id: 'documentWrite', re: /document\.write\s*\(/i, label: 'document.write' },
  { id: 'appletOrObject', re: /<applet\b/i, label: 'Java applet' },
  { id: 'vmlFilter', re: /progid:DXImageTransform/i, label: 'IE filter CSS' },
];

const DATED_MOTION = [
  { id: 'marquee', re: /<marquee\b/i, label: '<marquee>' },
  { id: 'blink', re: /<blink\b|text-decoration:\s*blink/i, label: 'blink' },
  { id: 'jqueryCycle', re: /jquery\.cycle|nivo-?slider|flexslider|jcarousel|wowslider|coin-?slider|slides?\.min\.js/i, label: 'jQuery-era slider' },
  { id: 'jqueryEffect', re: /\.(?:fadeIn|slideToggle|slideDown|animate)\s*\(\s*['"]?slow/i, label: 'jQuery slow animation' },
  { id: 'animatedGifHero', re: /<img[^>]+src=["'][^"']*(?:banner|header|hero|welcome)[^"']*\.gif/i, label: 'animated GIF banner' },
  { id: 'scrollingText', re: /<[^>]+onmouseover=["'][^"']*status\s*=/i, label: 'status-bar scroller' },
];

const PLATFORM_STUBS = [
  { id: 'gbpSite', re: /business\.site|\.business\.site/i, label: 'Google Business site' },
  { id: 'wixAdi', re: /wix-?adi|Wix\.com Website Builder/i, label: 'Wix ADI default' },
  { id: 'linkInBio', re: /linktr\.ee|beacons\.ai|carrd\.co|bio\.link/i, label: 'link-in-bio page' },
];

const CTA_WORDS =
  /\b(book (now|online|an? \w+)?|schedule|request (a )?(quote|estimate|appointment|service)|get (a )?(quote|estimate|started)|free (quote|estimate|consultation)|call (now|us|today)|order (now|online)|make (a )?reservation|reserve|contact us|buy tickets|shop now|apply now|start (your )?(project|order))\b/i;

function stripTags(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  if (!m) return null;
  return (m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4] || '').trim();
}

function allTags(html, name) {
  const out = [];
  const re = new RegExp(`<${name}\\b[^>]*>`, 'gi');
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[0]);
  return out;
}

function metaContent(html, key, kind = 'name') {
  const re = new RegExp(`<meta\\b[^>]*${kind}\\s*=\\s*["']?${key}["']?[^>]*>`, 'i');
  const m = html.match(re);
  return m ? attr(m[0], 'content') : null;
}

function firstMatch(list, html) {
  return list.filter((entry) => entry.re.test(html)).map((entry) => entry.label);
}

/**
 * @param {string} html raw response body
 * @param {string} finalUrl url after redirects, used for same-origin link math
 */
function scan(html, finalUrl = '') {
  const lower = html.toLowerCase();
  const text = stripTags(html);
  const words = text ? text.split(/\s+/).length : 0;

  let origin = '';
  try {
    origin = new URL(finalUrl).origin;
  } catch {
    origin = '';
  }

  const anchors = allTags(html, 'a');
  const hrefs = anchors.map((a) => attr(a, 'href')).filter(Boolean);
  const internalPaths = new Set();
  let telLinks = 0;
  let mailLinks = 0;
  let mapLinks = 0;
  let socialLinks = 0;
  for (const href of hrefs) {
    if (/^tel:/i.test(href)) { telLinks++; continue; }
    if (/^mailto:/i.test(href)) { mailLinks++; continue; }
    if (/(?:google\.[a-z.]+\/maps|maps\.google|maps\.app\.goo\.gl|goo\.gl\/maps|apple\.com\/maps|waze\.com)/i.test(href)) mapLinks++;
    if (/(?:facebook|instagram|twitter|x\.com|linkedin|tiktok|youtube|yelp)\.[a-z]/i.test(href)) { socialLinks++; continue; }
    if (/^(https?:)?\/\//i.test(href)) {
      if (origin && href.includes(origin.replace(/^https?:\/\//, ''))) {
        try { internalPaths.add(new URL(href, finalUrl).pathname); } catch { /* ignore */ }
      }
      continue;
    }
    if (/^[#?]/.test(href) || /^javascript:/i.test(href)) continue;
    try { internalPaths.add(new URL(href, finalUrl || 'https://x.invalid/').pathname); } catch { /* ignore */ }
  }
  internalPaths.delete('/');

  const imgs = allTags(html, 'img');
  const imgsWithAlt = imgs.filter((t) => attr(t, 'alt') !== null).length;
  const imgSrcs = imgs.map((t) => attr(t, 'src') || attr(t, 'data-src') || '').filter(Boolean);

  const jsonLdBlocks = [];
  const ldRe = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ld;
  while ((ld = ldRe.exec(html)) !== null) {
    try {
      jsonLdBlocks.push(JSON.parse(ld[1].trim()));
    } catch {
      jsonLdBlocks.push({ __parseError: true });
    }
  }
  const ldTypes = [];
  const collectTypes = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(collectTypes); return; }
    if (node['@type']) ldTypes.push(...[].concat(node['@type']));
    if (node['@graph']) collectTypes(node['@graph']);
  };
  jsonLdBlocks.forEach(collectTypes);

  const headTop = html.slice(0, Math.min(html.length, 4000));
  const bodyStart = html.slice(0, Math.floor(html.length * 0.35));

  const viewport = metaContent(html, 'viewport');
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]) : null;
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1])).filter(Boolean);
  const h2Count = (html.match(/<h2\b/gi) || []).length;

  const scripts = allTags(html, 'script');
  const externalScripts = scripts.filter((t) => attr(t, 'src'));
  const blockingScripts = externalScripts.filter((t) => !/\basync\b|\bdefer\b/i.test(t));

  const copyrightYears = [...text.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/gi)].map((m) => Number(m[1]));
  const yearsInFooter = [...text.slice(-1500).matchAll(/\b(19|20)\d{2}\b/g)].map((m) => Number(m[0]));

  return {
    bytes: Buffer.byteLength(html, 'utf8'),
    text,
    words,
    title,
    titleIsTemplate: title ? TEMPLATE_TITLES.some((re) => re.test(title.trim())) : null,
    metaDescription: metaContent(html, 'description'),
    hasDoctype: /^\s*<!doctype\s+html\s*>/i.test(html.slice(0, 200)),
    lang: (html.match(/<html\b[^>]*>/i) || [''])[0] ? attr((html.match(/<html\b[^>]*>/i) || [''])[0], 'lang') : null,
    viewport,
    viewportResponsive: viewport ? /width\s*=\s*device-width/i.test(viewport) : false,
    h1s,
    h2Count,
    // Layout tables: nested tables or tables carrying spacer/border layout attributes.
    layoutTableTells: (() => {
      const tables = allTags(html, 'table');
      if (!tables.length) return [];
      const tells = [];
      if (tables.length >= 3) tells.push(`${tables.length} tables`);
      if (tables.some((t) => attr(t, 'cellpadding') !== null || attr(t, 'cellspacing') !== null || attr(t, 'bgcolor') !== null)) tells.push('table layout attributes');
      if (/<font\b/i.test(html)) tells.push('<font> tags');
      if (/<center\b/i.test(html)) tells.push('<center> tags');
      if (/spacer\.gif|transparent\.gif|blank\.gif/i.test(html)) tells.push('spacer gifs');
      return tells;
    })(),
    deadTech: firstMatch(DEAD_TECH, html),
    datedMotion: firstMatch(DATED_MOTION, html),
    platformStub: firstMatch(PLATFORM_STUBS, html),
    stubMarkers: STUB_MARKERS.filter((re) => re.test(text)).length > 0 && words < 400,
    modernCss: {
      customProps: /--[a-z0-9-]+\s*:/i.test(html),
      grid: /display\s*:\s*grid|grid-template/i.test(html),
      flex: /display\s*:\s*flex/i.test(html),
      clamp: /clamp\s*\(/i.test(html),
      aspectRatio: /aspect-ratio\s*:/i.test(html),
      // Utility frameworks imply a modern build even when CSS is external.
      utilityFramework: /tailwind|class="[^"]*\b(?:md|lg|sm):[a-z-]/i.test(html),
      externalStylesheets: allTags(html, 'link').filter((t) => /stylesheet/i.test(attr(t, 'rel') || '')).length,
    },
    webfonts:
      /fonts\.googleapis\.com|fonts\.gstatic\.com|@font-face|use\.typekit|fonts\.bunny\.net|typography\.com/i.test(html),
    images: {
      count: imgs.length,
      withAlt: imgsWithAlt,
      modernFormat: imgSrcs.filter((s) => /\.(webp|avif)(\?|$)/i.test(s)).length,
      gifs: imgSrcs.filter((s) => /\.gif(\?|$)/i.test(s)).length,
      srcset: imgs.filter((t) => attr(t, 'srcset') !== null || /<picture\b/i.test(html)).length,
      lazy: imgs.filter((t) => /lazy/i.test(attr(t, 'loading') || '') || attr(t, 'data-src') !== null).length,
      fixedWidthAttrs: imgs.filter((t) => Number(attr(t, 'width')) > 1000).length,
    },
    hero: {
      hasH1: h1s.length > 0,
      leadMedia:
        /<video\b/i.test(bodyStart) ||
        allTags(bodyStart, 'img').length > 0 ||
        /background-image\s*:\s*url/i.test(bodyStart),
    },
    jsonLd: { blocks: jsonLdBlocks.length, types: ldTypes, parsed: jsonLdBlocks.filter((b) => !b.__parseError).length },
    openGraph: Boolean(metaContent(html, 'og:title', 'property') || metaContent(html, 'og:image', 'property')),
    twitterCard: Boolean(metaContent(html, 'twitter:card') || metaContent(html, 'twitter:card', 'property')),
    contact: {
      telLinks,
      mailLinks,
      mapLinks,
      socialLinks,
      phoneText: /\(?\b\d{3}\)?[.\s-]\d{3}[.\s-]\d{4}\b/.test(text),
      addressText: /\b\d{1,6}\s+[A-Z][A-Za-z.]+\s+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|pike|way|pl|place|ct|court|hwy|highway)\b/i.test(text),
      zipText: /\b\d{5}(?:-\d{4})?\b/.test(text),
      hoursText:
        /\b(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?\s*[-–—:]?\s*(?:\d{1,2}(?::\d{2})?\s*(?:am|pm)|closed)/i.test(text) ||
        /\bhours\b[\s\S]{0,120}?\d{1,2}(?::\d{2})?\s*(?:am|pm)/i.test(text),
      hasForm: /<form\b/i.test(html) || /calendly|acuityscheduling|squareup\.com\/appointments|setmore|booksy|jotform|typeform|hubspot.*forms|gravityform|wpcf7/i.test(html),
      contactPage: [...internalPaths].some((p) => /contact|quote|estimate|appointment|book|schedule|reserve/i.test(p)),
    },
    cta: {
      inTopSlice: CTA_WORDS.test(stripTags(bodyStart)),
      anywhere: CTA_WORDS.test(text),
      buttonish: anchors.filter((a) => /btn|button|cta/i.test(attr(a, 'class') || '')).length,
    },
    nav: {
      hasNavElement: /<nav\b/i.test(html) || /class=["'][^"']*\b(?:nav|navbar|menu|main-menu)\b/i.test(html),
      internalPathCount: internalPaths.size,
      internalPaths: [...internalPaths].slice(0, 40),
    },
    landmarks: {
      main: /<main\b/i.test(html) || /role=["']main["']/i.test(html),
      header: /<header\b/i.test(html),
      footer: /<footer\b/i.test(html),
      skipLink: /skip\s*(?:to|nav|main|content)/i.test(html),
    },
    fixedWidth: /(?:width|max-width)\s*:\s*(?:9[5-9]\d|1[0-9]{3,})px/i.test(html) && !/max-width\s*:\s*100%/i.test(html),
    scripts: { total: scripts.length, external: externalScripts.length, blocking: blockingScripts.length },
    copyrightYear: copyrightYears.length ? Math.max(...copyrightYears) : yearsInFooter.length ? Math.max(...yearsInFooter) : null,
    // Rendered-HTML tell: lots of script, almost no text. Static grading is unsafe.
    looksLikeJsShell: words < 180 && externalScripts.length >= 3,
    headTop,
  };
}

module.exports = { scan, stripTags, CTA_WORDS, STUB_MARKERS, TEMPLATE_TITLES };
