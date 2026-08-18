#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', 'philly-sites');
const HARDENING_ID = 'ship-hardening-20260729';

const sites = {
  'fantes-kitchen-shop': {
    name: "Fante's Kitchen Shop",
    url: 'https://fantes.com/',
    telephone: '+1-215-922-5557',
    streetAddress: '1006 South 9th Street',
    postalCode: '19147',
  },
  'magic-gardens': {
    name: "Philadelphia's Magic Gardens",
    url: 'https://www.phillymagicgardens.org/',
    telephone: '+1-215-733-0390',
    streetAddress: '1020 South Street',
    postalCode: '19147',
  },
  'eastern-state': {
    name: 'Eastern State Penitentiary',
    url: 'https://easternstate.org/',
    telephone: '+1-215-236-3300',
    streetAddress: '2027 Fairmount Avenue',
    postalCode: '19130',
  },
  'morris-arboretum': {
    name: 'Morris Arboretum & Gardens',
    url: 'https://www.morrisarboretum.org/',
    telephone: '+1-215-247-5777',
    streetAddress: '100 East Northwestern Avenue',
    postalCode: '19118',
  },
  'reanimator-coffee': {
    name: 'ReAnimator Coffee',
    url: 'https://www.reanimatorcoffee.com/',
    telephone: '+1-215-232-1710',
    streetAddress: '310 W. Master St.',
    postalCode: '',
  },
  'dibruno-bros': {
    name: 'Di Bruno Bros.',
    url: 'https://dibruno.com/',
    telephone: '+1-215-922-2876',
    streetAddress: '930 S. 9th Street',
    postalCode: '19147',
  },
  'frankford-hall': {
    name: 'Frankford Hall',
    url: 'https://frankfordhall.com/',
    telephone: '+1-215-634-3338',
    streetAddress: '1210 Frankford Avenue',
    postalCode: '19125',
  },
  'standard-tap': {
    name: 'Standard Tap',
    url: 'https://standardtap.com/',
    telephone: '+1-215-238-0630',
    streetAddress: '901 N. 2nd Street',
    postalCode: '19123',
  },
};

const hardeningCss = `<style id="${HARDENING_ID}">html,body{overflow-x:clip!important;overflow-y:visible!important}.site-header{position:sticky!important;inset:0 0 auto!important;margin:0!important;z-index:99!important}.site-header nav{display:flex!important}a[href],button{min-width:44px;min-height:44px}a[href]:not(.brand){display:inline-flex;align-items:center}.reveal,.vanish-out{opacity:1!important;transform:none!important;filter:none!important}@media(max-width:850px){.site-header{display:grid!important;grid-template-columns:1fr auto!important;padding:.5rem!important}.site-header nav{grid-column:1/-1;overflow:auto}.site-header nav a{flex:1 0 auto;justify-content:center}}</style>`;

for (const [slug, business] of Object.entries(sites)) {
  const file = path.join(ROOT, slug, 'index.html');
  let html = fs.readFileSync(file, 'utf8');

  if (!/name=["']theme-color["']/i.test(html)) {
    const deep = html.match(/--deep:\s*(#[0-9a-f]{3,8})/i)?.[1] || '#111111';
    html = html.replace('</head>', `<meta name="theme-color" content="${deep}"></head>`);
  }

  if (!/["']@type["']\s*:\s*["']LocalBusiness["']/i.test(html)) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: business.name,
      url: business.url,
      telephone: business.telephone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.streetAddress,
        addressLocality: 'Philadelphia',
        addressRegion: 'PA',
        addressCountry: 'US',
        ...(business.postalCode ? { postalCode: business.postalCode } : {}),
      },
    };
    html = html.replace(
      '</head>',
      `<script type="application/ld+json">${JSON.stringify(structuredData)}</script></head>`
    );
  }

  const existingHardening = new RegExp(
    `<style id="${HARDENING_ID}">[\\s\\S]*?<\\/style>`,
    'i'
  );
  if (existingHardening.test(html)) {
    html = html.replace(existingHardening, hardeningCss);
  } else {
    html = html.replace('</head>', `${hardeningCss}</head>`);
  }

  // These self-contained pages ship minified. CSS/JS comments add payload but no runtime value.
  html = html.replace(/\/\*[\s\S]*?\*\//g, '');

  fs.writeFileSync(file, html);
  console.log(`Hardened ${slug}`);
}
