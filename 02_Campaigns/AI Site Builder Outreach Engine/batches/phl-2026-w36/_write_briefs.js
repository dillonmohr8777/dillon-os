#!/usr/bin/env node
/**
 * Writes 25 site-factory briefs for batch phl-2026-w36.
 * Run: node 02_Campaigns/AI\ Site\ Builder\ Outreach\ Engine/batches/phl-2026-w36/_write_briefs.js
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'briefs');

const ATTITUDE_SHAPE = {
  glass: { border: '1px', radius: '24px' },
  editorial: { border: '1px', radius: '2px' },
  brutal: { border: '4px', radius: '0' },
  warm: { border: '2px', radius: '18px' },
  industrial: { border: '2px', radius: '4px' },
  neon: { border: '2px', radius: '8px' },
  align: { border: '1px', radius: '24px' },
};

const SERIF_DISPLAY = new Set([
  'Fraunces',
  'Cormorant Garamond',
  'Libre Baskerville',
  'Zen Antique',
]);

function hexLum(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return 0;
  const to = (s) => {
    const c = parseInt(s, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * to(h.slice(0, 2)) + 0.7152 * to(h.slice(2, 4)) + 0.0722 * to(h.slice(4, 6));
}

function onHex(hex) {
  return hexLum(hex) > 0.38 ? '#090909' : '#FFFFFF';
}

function telHref(phone) {
  return `tel:${String(phone).replace(/\D/g, '')}`;
}

function displayFallback(display) {
  if (SERIF_DISPLAY.has(display)) return 'Georgia,serif';
  return 'Impact,sans-serif';
}

function images(name, craft) {
  return Array.from({ length: 13 }, (_, i) => ({
    file: `image-${i + 1}.webp`,
    alt: `Grainy collage illustration of ${craft} for ${name}, frame ${i + 1}`,
  }));
}

function tokensFor(site) {
  const shape = ATTITUDE_SHAPE[site.attitude];
  const { paper, ink, accent, accent2, panel, deep } = site.palette;
  return {
    paper,
    ink,
    accent,
    accent2,
    panel,
    deep,
    onPaper: onHex(paper),
    onAccent: onHex(accent),
    onAccent2: onHex(accent2),
    onPanel: onHex(panel),
    onDeep: onHex(deep),
    border: shape.border,
    radius: shape.radius,
  };
}

function pageWords(brief) {
  const chunks = [
    brief.hero.sub,
    ...brief.offerings.items.flatMap((i) => [i.title, i.text]),
    ...brief.story.paragraphs,
    ...brief.experience.items.flatMap((i) => [i.title, i.text]),
    brief.feature.heading,
    brief.feature.text,
    brief.spotlight.heading,
    brief.spotlight.text,
    ...brief.catalog.items.map((i) => i.text),
    brief.contact.sub,
  ];
  return chunks.join(' ').trim().split(/\s+/).filter(Boolean).length;
}

function assemble(site) {
  const phone = site.phone || '';
  const address = site.address || '';
  const hours = site.hours || '';
  const url = site.url;
  const headerCta = phone
    ? { label: 'Call', href: telHref(phone) }
    : { label: 'Official site', href: url };
  const heroCtaSecondary = { label: 'Plan a visit', href: '#visit' };
  const links = [];
  if (phone) links.push({ label: 'Call', href: telHref(phone) });
  links.push({ label: 'Official site', href: url });
  if (site.extraLinks) links.push(...site.extraLinks);

  const brief = {
    slug: site.slug,
    name: site.name,
    city: site.city,
    category: site.category,
    vertical: site.vertical,
    attitude: site.attitude,
    url,
    phone,
    address,
    hours,
    description: site.description,
    noindex: true,
    schemaType: site.schemaType,
    logo: false,
    marquee: site.marquee,
    tokens: tokensFor(site),
    fonts: {
      display: site.fonts.display,
      displayFallback: displayFallback(site.fonts.display),
      text: site.fonts.text,
    },
    nav: [
      { label: 'Explore', href: '#offerings' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'Visit', href: '#visit' },
    ],
    headerCta,
    images: images(site.name, site.craft),
    hero: {
      eyebrow: `${site.city} | ${site.category}`,
      headline: site.hero.headline,
      sub: site.hero.sub,
      ctaPrimary: headerCta,
      ctaSecondary: heroCtaSecondary,
      glassFloat: site.hero.glassFloat,
      marquee: site.marquee,
    },
    offerings: {
      heading: site.offerings.heading,
      items: site.offerings.items,
    },
    gallery: {
      heading: 'A look at the work.',
      imageIndexes: [3, 4, 5, 6, 7, 12],
    },
    story: {
      heading: site.story.heading,
      paragraphs: site.story.paragraphs,
      imageIndex: 2,
    },
    experience: {
      heading: site.experience.heading,
      items: site.experience.items,
    },
    feature: {
      heading: site.feature.heading,
      text: site.feature.text,
      cta: { label: site.feature.ctaLabel || 'Official site', href: url },
      imageIndex: 8,
    },
    spotlight: {
      heading: site.spotlight.heading,
      text: site.spotlight.text,
      imageIndex: 13,
      cta: { label: site.spotlight.ctaLabel || 'Visit', href: url },
    },
    catalog: {
      items: site.catalog.items.map((item, i) => ({
        title: item.title,
        href: item.href || url,
        imageIndex: [9, 10, 11][i],
        text: item.text,
      })),
    },
    contact: {
      heading: site.contact.heading,
      sub: address || site.contact.sub || '',
    },
    closing: {
      cta: headerCta,
    },
    links,
  };
  return brief;
}

const SITES = [
  {
    slug: 'andorra-family-dentistry',
    name: 'Andorra Family Dentistry',
    city: 'Philadelphia',
    category: 'Family and cosmetic dentistry',
    vertical: 'healthcare',
    schemaType: 'Dentist',
    url: 'https://www.andorradental.com/',
    phone: '215-515-5710',
    address: '8919 Ridge Ave., Suite 9, Philadelphia, PA 19128',
    hours: 'Mon-Fri 9am-5pm, Sat 9am-3pm',
    attitude: 'glass',
    palette: {
      paper: '#F4F1EC',
      ink: '#1F3370',
      accent: '#2C4A80',
      accent2: '#C0392B',
      panel: '#D8DDE4',
      deep: '#161A1B',
    },
    fonts: { display: 'Oswald', text: 'Open Sans' },
    craft: 'family and cosmetic dentistry',
    description:
      'Family and cosmetic dentistry on Ridge Avenue in Andorra. Dr. Dhaval Shah, Dr. Shilpa Emani, and Dr. Sucheta Bansal. Invisalign, implants, iTero scanning, smile makeovers, emergency care.',
    marquee: [
      'Personalized service',
      'State-of-the-art',
      'Dentistry for all ages',
      'Smile brighter',
      'Ridge Avenue',
    ],
    extraLinks: [
      { label: 'Facebook', href: 'https://www.facebook.com/Andorra-Family-Dentistry-2360086290978211/' },
      { label: 'Instagram', href: 'https://www.instagram.com/andorrafamilydentistry/' },
    ],
    hero: {
      headline: 'Here to help you smile brighter',
      sub: 'Andorra Family Dentistry is personalized service with state-of-the-art technology on Ridge Avenue. Dr. Dhaval Shah, Dr. Shilpa Emani, and Dr. Sucheta Bansal work one-on-one so the plan fits the mouth in the chair. The practice serves Philadelphia plus Andorra, Conshohocken, Lafayette Hill, and Roxborough.',
      glassFloat: { title: 'Andorra', sub: 'Drs. Shah, Emani, and Bansal' },
    },
    offerings: {
      heading: 'How we can help you today',
      items: [
        {
          title: 'Invisalign and aesthetic dentistry',
          text: 'Invisalign clear aligners discreetly line the teeth. Aesthetic dentistry, veneers, whitening, and a full-range smile makeover sit next to that work when the goal is how the smile reads in the room.',
        },
        {
          title: 'Implants, crowns, and restorations',
          text: 'Dental implants, implant-supported dentures, crowns, bridges, root canals, and extractions are on the same roster. The restorative side is built to last, not to upsell a second visit you did not ask for.',
        },
        {
          title: 'iTero scanning and family care',
          text: 'iTero digital scanners, 3D scanning, and digital X-rays keep the diagnostics precise. General and family dentistry covers cleanings, exams, sealants, fluoride, night guards, and same-day emergency care for every age.',
        },
      ],
    },
    story: {
      heading: 'Dentistry for all ages on Ridge Avenue',
      paragraphs: [
        'The line they use is personalized service with state-of-the-art technology. Dr. Shah, Dr. Emani, and Dr. Bansal take time so you feel at ease in the chair. Health, smile, and comfort are the named priorities. The team is multilingual and the office is set up for patients who arrive in a wheelchair.',
        'Neighbors come from Andorra, Conshohocken, Lafayette Hill, and Roxborough, not only from the 19128 block. Smile Care Membership is published at $16 a month or $100 a year for people who want treatment covered on a plan the office runs in-house.',
      ],
    },
    experience: {
      heading: 'How a visit actually runs',
      items: [
        {
          title: 'Start with a one-on-one plan',
          text: 'The first visit is a consultation with Dr. Shah, Dr. Emani, or Dr. Bansal. They write an individualized plan before any restorative or cosmetic work starts, so you know the sequence.',
        },
        {
          title: 'Scan, then treat',
          text: 'iTero and 3D scanning replace a lot of the old impression work. Cleanings, Invisalign, implants, and emergency visits all run from that digital record instead of a second guessing pass.',
        },
        {
          title: 'Keep the smile on a schedule',
          text: 'Family dentistry is built for a first visit through senior maintenance. Same-day emergency care is on the list when something breaks between the regular exams.',
        },
      ],
    },
    feature: {
      heading: 'State-of-the-art, still a family room',
      text: 'Advanced technology is there to make the treatment precise. The room is still a family practice: children, adults, and seniors, with a multilingual team and a plan written for the person in the chair.',
      ctaLabel: 'Meet the team',
    },
    spotlight: {
      heading: 'Smile Care Membership',
      text: 'The in-house plan is published at $16 a month or $100 a year. The plan is for people who want Andorra Family Dentistry to cover treatment on a membership the office runs, not a mystery coupon.',
      ctaLabel: 'See patient info',
    },
    catalog: {
      items: [
        {
          title: 'Invisalign',
          text: 'Clear aligners designed to line teeth without a metal smile. Part of the aesthetic roster next to veneers and whitening.',
        },
        {
          title: 'Dental implants',
          text: 'Implant placements, All-on-4, and implant-supported dentures. Built as long-lasting restorations, not a one-season fix.',
        },
        {
          title: 'iTero digital scanning',
          text: 'iTero scanners, 3D scanning, digital X-rays, and intraoral cameras. Diagnostics first, then the treatment.',
        },
      ],
    },
    contact: { heading: 'Ridge Avenue, Andorra', sub: '' },
  },
  {
    slug: 'mt-airy-pediatrics',
    name: 'Advocare Mt. Airy Pediatrics',
    city: 'Philadelphia',
    category: 'Pediatric medical home',
    vertical: 'healthcare',
    schemaType: 'MedicalClinic',
    url: 'https://www.mtairypediatrics.com/',
    phone: '215-247-2996',
    address: '6673 Germantown Avenue, Philadelphia, PA 19119',
    hours: '',
    attitude: 'glass',
    palette: {
      paper: '#F4F7F6',
      ink: '#102226',
      accent: '#53BCD0',
      accent2: '#B1E090',
      panel: '#E9E5DD',
      deep: '#14343A',
    },
    fonts: { display: 'Lato', text: 'Source Sans 3' },
    craft: 'pediatric care',
    description:
      'Pediatric medical home in Mt. Airy. Healthy children from healthy families. Well child visits and sick visits.',
    marquee: ['Medical home', 'Well child visits', 'Sick visits', 'Mt. Airy', 'Healthy families'],
    hero: {
      headline: 'We are proud to be your medical home.',
      sub: 'Advocare Mt. Airy Pediatrics exists so children grow inside healthy families and a healthy community. The practice treats raising a child as rewarding and challenging, and the work is to help parents enjoy that stretch while a child reaches full potential. Well child visits and sick visits sit at the center of the medical home.',
      glassFloat: { title: 'Mt. Airy', sub: 'Pediatric medical home' },
    },
    offerings: {
      heading: 'Care that stays with the child',
      items: [
        {
          title: 'Well child visits',
          text: 'Well child visits keep growth, vaccines, and development on a known cadence. The visit is the medical home in practice: a regular room, a known provider, and a record that follows the child from visit to visit.',
        },
        {
          title: 'Sick visits',
          text: 'Sick child visits are for the days the cadence breaks. The same medical home that knows the well-child chart also sees the fever, the cough, and the worry that comes with it.',
        },
        {
          title: 'Your providers',
          text: 'Care is delivered by Dr. Marcie E. Macolino, MD, Susan W. Nordlof, MSN, CRNP, and Danica Mae Lagman, CRNP. The medical home is the people, not a rotating window.',
        },
      ],
    },
    story: {
      heading: 'Healthy children from healthy families',
      paragraphs: [
        'The mission on Germantown Avenue is stated in the practice\'s own words: healthy children are the result of healthy families and communities. Parents get help enjoying the work of raising a child, and the child gets a medical home that intends to see potential all the way through.',
        'Advocare Mt. Airy Pediatrics keeps well child visits and sick visits in one office so the chart, the providers, and the family stay aligned. The medical home is the point. You are not shopping a new clinic every time a child is well or unwell.',
      ],
    },
    experience: {
      heading: 'How the medical home works',
      items: [
        {
          title: 'A known well-child cadence',
          text: 'Well child visits set the rhythm. Growth, development, and the questions parents carry between birthdays get a regular room and a provider who already knows the child.',
        },
        {
          title: 'Sick care inside the same home',
          text: 'When a child is sick, the visit happens with the same practice that holds the well-child record. The sick visit is not a separate brand. You are in the medical home on a harder day.',
        },
        {
          title: 'Providers who stay on the chart',
          text: 'Dr. Macolino, Susan Nordlof, and Danica Mae Lagman are the named clinicians. Families meet the people who will keep seeing the child, not a generic pediatric desk.',
        },
      ],
    },
    feature: {
      heading: 'A medical home, not a one-off visit',
      text: 'The practice is built so well child visits and sick visits live together. Healthy children come from healthy families, and the office on Germantown Avenue is the place that sentence gets practiced.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Meet the clinicians',
      text: 'Dr. Marcie E. Macolino, MD leads the physician side. Susan W. Nordlof, MSN, CRNP and Danica Mae Lagman, CRNP practice alongside her. The medical home is those three names plus the family in the room.',
      ctaLabel: 'Our providers',
    },
    catalog: {
      items: [
        {
          title: 'Well Child Visits',
          text: 'Scheduled well child care so growth, vaccines, and development stay on the practice chart.',
        },
        {
          title: 'Sick Child Visits',
          text: 'Sick visits inside the same medical home that already knows the child.',
        },
        {
          title: 'Our Providers',
          text: 'Dr. Marcie E. Macolino, MD, Susan W. Nordlof, MSN, CRNP, and Danica Mae Lagman, CRNP.',
        },
      ],
    },
    contact: { heading: 'The medical home on Germantown Avenue', sub: '' },
  },
  {
    slug: 'sprinkles-icecream',
    name: 'Sprinkles Ice Cream Shoppe',
    city: 'Elkins Park',
    category: 'Ice cream shoppe',
    vertical: 'food',
    schemaType: 'IceCreamShop',
    url: 'http://www.sprinklesicecreamelkinspark.com/',
    phone: '215-887-1233',
    address: '908 Township Line Road, Elkins Park, PA 19027',
    hours: 'Sunday 12pm-9pm, Monday closed, Tue-Thur 12pm-9pm, Fri-Sat 12pm-10pm',
    attitude: 'warm',
    palette: {
      paper: '#F7F7EA',
      ink: '#3A1C0C',
      accent: '#7F3D1A',
      accent2: '#7836C4',
      panel: '#E4D9B8',
      deep: '#1E1208',
    },
    fonts: { display: 'Francois One', text: 'Open Sans' },
    craft: 'ice cream',
    description: 'Famous for Flavor. Family friendly ice cream shoppe in Elkins Park.',
    marquee: ['Famous for Flavor', 'Butter pecan', 'Death by chocolate', 'Moose tracks', 'Elkins Park'],
    hero: {
      headline: 'Famous for Flavor',
      sub: 'Sprinkles Ice Cream Shoppe is a family friendly shoppe on Township Line Road in Elkins Park. The house line is Famous for Flavor. You come in, you pick a scoop, and you stay long enough to enjoy the company of others. Butter pecan, death by chocolate, moose tracks, cookies & cream, pistachio, and cotton candy are on the board.',
      glassFloat: { title: 'Elkins Park', sub: 'Famous for Flavor' },
    },
    offerings: {
      heading: 'What the shoppe actually scoops',
      items: [
        {
          title: 'Classic scoops',
          text: 'Butter pecan, cookies & cream, and pistachio are the familiar names people ask for by habit. The shoppe scoops them as ice cream, not as a flight or a concept. You point, they pack the cup or the cone.',
        },
        {
          title: 'The louder flavors',
          text: 'Death by chocolate, moose tracks, and cotton candy sit on the same board. Famous for Flavor is the shoppe\'s own line, and those three are the ones that sound like it.',
        },
        {
          title: 'A family friendly shoppe',
          text: 'Sprinkles calls itself a family friendly ice cream shoppe. The visit is scoop, sit, and enjoy the company of others. Cakes are part of the shoppe\'s name on the door: ice cream shops, ice cream cakes.',
        },
      ],
    },
    story: {
      heading: 'Township Line Road, scooped',
      paragraphs: [
        'Elkins Park already knows the shoppe. Famous for Flavor is printed in the shoppe\'s own language, and the board backs it with butter pecan, death by chocolate, moose tracks, cookies & cream, pistachio, and cotton candy. The work is ice cream, served in a room meant for families.',
        'A visit is not a tasting menu. You walk in, you choose a flavor that already has a name, and you stay. Monday the shoppe is closed. The rest of the week the door is for scoops and the people who came with you.',
      ],
    },
    experience: {
      heading: 'How a scoop actually happens',
      items: [
        {
          title: 'Read the board',
          text: 'Flavors are named, not coded. Butter pecan, death by chocolate, moose tracks, cookies & cream, pistachio, and cotton candy are on the board they scoop from.',
        },
        {
          title: 'Get the scoop packed',
          text: 'The shoppe packs ice cream the ordinary way: cup or cone, the flavor you asked for. Famous for Flavor is the standard they put on the work.',
        },
        {
          title: 'Stay and enjoy the room',
          text: 'Sprinkles asks you to relax and enjoy the company of others. The shoppe is built for a family visit, not a grab-and-vanish window.',
        },
      ],
    },
    feature: {
      heading: 'Famous for Flavor, on purpose',
      text: 'The shoppe does not hide behind a short seasonal list. Death by chocolate and moose tracks sit next to pistachio and butter pecan. The board is the product, and the product is ice cream you can name.',
      ctaLabel: 'See the flavors',
    },
    spotlight: {
      heading: 'Ice cream cakes belong here too',
      text: 'The shoppe\'s own title pairs ice cream shops with ice cream cakes. A family visit can be a scoop tonight or a cake for the table. Either way the line is the same: Famous for Flavor.',
      ctaLabel: 'Official site',
    },
    catalog: {
      items: [
        {
          title: 'Butter pecan',
          text: 'A named classic on the Sprinkles board. Scoop it in the shoppe on Township Line Road.',
        },
        {
          title: 'Death by chocolate',
          text: 'One of the louder house flavors. Famous for Flavor, packed in a cup or a cone.',
        },
        {
          title: 'Moose tracks',
          text: 'On the same board as cookies & cream, pistachio, and cotton candy.',
        },
      ],
    },
    contact: { heading: 'Find the shoppe', sub: '' },
  },
  {
    slug: 'gallo-insurance',
    name: 'Gallo Insurance Agency',
    city: 'Folsom',
    category: 'Independent insurance',
    vertical: 'insurance',
    schemaType: 'InsuranceAgency',
    url: 'https://www.erieinsurance.com/agencies/aa8210/gallo-insurance-agency',
    phone: '610-237-1500',
    address: '143 Macdade Blvd, Folsom, PA 19033',
    hours: 'Monday-Friday 9am-5pm',
    attitude: 'editorial',
    palette: {
      paper: '#F6F1E8',
      ink: '#1A2430',
      accent: '#0B3A6A',
      accent2: '#C4A35A',
      panel: '#D7DDE4',
      deep: '#0E1C2A',
    },
    fonts: { display: 'Fraunces', text: 'Source Sans 3' },
    craft: 'independent insurance',
    description:
      'Independent hometown insurance agency in Folsom. Justin Gallo. Auto, home, life, and business. Erie and other carriers.',
    marquee: ['Independent', 'Erie Insurance', 'Auto', 'Home', 'Life', 'Business', 'Folsom'],
    hero: {
      headline: 'An independent hometown agency',
      sub: 'Gallo Insurance Agency is Justin Gallo\'s independent shop on Macdade Boulevard in Folsom. The work is auto, home, life, and business coverage, placed with Erie and other carriers. You get a hometown agency that can shop more than one paper, not a single-company window.',
      glassFloat: { title: 'Folsom', sub: 'Independent agency' },
    },
    offerings: {
      heading: 'Coverage the agency actually places',
      items: [
        {
          title: 'Auto and home',
          text: 'Personal auto and home are the everyday policies. Justin Gallo places them as an independent agent, which means Erie can be the answer and another carrier can be the answer when the risk wants it.',
        },
        {
          title: 'Life and business',
          text: 'Life and business coverage sit in the same agency. The hometown shop is built to keep personal and commercial questions in one conversation instead of sending you down the road.',
        },
        {
          title: 'Erie and other carriers',
          text: 'The agency writes with Erie and other carriers. Independence is the method: compare, recommend, bind. You are not locked to one company\'s appetite before the first question.',
        },
      ],
    },
    story: {
      heading: 'Justin Gallo, Folsom',
      paragraphs: [
        'The agency is a person and a street. Justin Gallo runs an independent hometown shop at 143 Macdade Blvd. Folsom neighbors come in for auto, home, life, and business, and they leave with a policy that was placed, not a referral to a 1-800 desk.',
        'Erie is on the door through the agency listing, and other carriers are in the toolkit. That mix is the point of an independent agency. The recommendation can follow the risk instead of the logo on the window.',
      ],
    },
    experience: {
      heading: 'How an independent quote actually runs',
      items: [
        {
          title: 'Tell the agency the risk',
          text: 'You bring the car, the house, the life question, or the business. Justin Gallo works the facts as an independent agent, not as a single-carrier script.',
        },
        {
          title: 'Compare Erie and other carriers',
          text: 'The agency can place with Erie and with other carriers. The comparison is the service. You see which paper fits the risk before anyone binds.',
        },
        {
          title: 'Bind the policy at the hometown shop',
          text: 'Coverage is bound through the Folsom agency. Auto, home, life, and business stay in one relationship so the next change does not start from zero.',
        },
      ],
    },
    feature: {
      heading: 'Independence is the product',
      text: 'A captive window sells one company. Gallo Insurance Agency sells the ability to place auto, home, life, and business with Erie and other carriers from a hometown desk.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Folsom, on Macdade',
      text: 'The agency is local on purpose. Justin Gallo\'s shop is the place you walk into when the policy should be written by someone who will still be on Macdade Boulevard after the binder goes out.',
      ctaLabel: 'Visit the agency',
    },
    catalog: {
      items: [
        {
          title: 'Auto',
          text: 'Personal auto placed by an independent hometown agency. Erie and other carriers.',
        },
        {
          title: 'Home',
          text: 'Home coverage written from the Folsom shop, compared across the carriers the agency can use.',
        },
        {
          title: 'Life and business',
          text: 'Life and business policies in the same independent agency as the personal lines.',
        },
      ],
    },
    contact: { heading: 'The Folsom agency', sub: '' },
  },
  {
    slug: 'always-dental-care',
    name: 'Always Dental Care',
    city: 'Phoenixville',
    category: 'Family and cosmetic dentistry',
    vertical: 'healthcare',
    schemaType: 'Dentist',
    url: 'https://www.alwaysdentalcare.com/',
    phone: '484-392-7687',
    address: '1570 Egypt Rd #210, Phoenixville, PA 19460',
    hours: 'Mon Tue Thu 9am-6pm, Wed 9am-5pm, Friday 9am-1pm every other Friday, Sat-Sun closed',
    attitude: 'glass',
    palette: {
      paper: '#F7F4EE',
      ink: '#1B2430',
      accent: '#2B6CB0',
      accent2: '#E8C547',
      panel: '#E3E7EE',
      deep: '#122033',
    },
    fonts: { display: 'Outfit', text: 'DM Sans' },
    craft: 'family and cosmetic dentistry',
    description:
      'Dr. Truong Nguyen, NYU Dentistry. Family and cosmetic care in Phoenixville behind the Wawa. Implants, crowns, whitening, fillings, root canals, bridges, dentures, emergency. Late evenings.',
    marquee: ['Dr. Truong Nguyen', 'Implants', 'Crowns', 'Whitening', 'Emergency care'],
    hero: {
      headline: 'Dr. Nguyen, behind the Wawa',
      sub: 'Always Dental Care is Dr. Truong Nguyen at 1570 Egypt Rd #210 in Phoenixville, behind the Wawa and next to Hand & Stone. NYU College of Dentistry, residency at Wyckoff Heights, more than 20 years in the chair and about 11 of them in Phoenixville. Implants, crowns, whitening, fillings, root canals, bridges, dentures, deep cleanings, and emergency visits. Late evenings. Every other Friday. Saturday closed.',
      glassFloat: { title: 'Phoenixville', sub: 'Dr. Truong Nguyen, NYU' },
    },
    offerings: {
      heading: 'What Dr. Nguyen\'s chair actually does',
      items: [
        {
          title: 'Fillings, root canals, crowns, bridges',
          text: 'Restore the tooth in front of you. Fillings and root canals keep what can stay. Crowns and bridges rebuild what is broken. The plan matches the damage, not a menu of upsells.',
        },
        {
          title: 'Implants, dentures, extractions',
          text: 'When a tooth cannot stay, the same office extracts, then talks implants or dentures. You do not get sent down the road for the hard part.',
        },
        {
          title: 'Whitening and emergency care',
          text: 'Whitening is the cosmetic chair. Emergency care is on the list so a broken tooth at 5pm still has a Phoenixville dentist. Monday, Tuesday, and Thursday run until 6.',
        },
      ],
    },
    story: {
      heading: 'NYU, Wyckoff, then Egypt Road',
      paragraphs: [
        'Dr. Truong Nguyen trained at NYU College of Dentistry and finished residency at Wyckoff Heights Medical Center. He has been in Phoenixville long enough that families already know the suite behind the Wawa. Soccer, bowling, and a poker night are the off-hours version of the same person who will sit with a kid\'s filling and an implant consult in one week.',
        'Family dentistry here means the molar on Tuesday and the implant conversation when a tooth is past saving. Cosmetic whitening sits next to that, not in a separate spa brand. Late evenings keep the office usable after work. Every other Friday mornings. Saturday the chair rests.',
      ],
    },
    experience: {
      heading: 'How treatment at Always Dental actually moves',
      items: [
        {
          title: 'Diagnose, then restore',
          text: 'Fillings, root canals, crowns, and bridges are how the practice keeps a tooth. Dr. Nguyen writes the sequence before the drill starts.',
        },
        {
          title: 'Extract or replace when needed',
          text: 'Extractions, dentures, and implants stay in this office. The hard decision does not become a referral to a stranger.',
        },
        {
          title: 'Whitening, or come in broken',
          text: 'Schedule the cosmetic hour, or use the emergency slot when something lets go after work. Monday, Tuesday, and Thursday go to 6pm.',
        },
      ],
    },
    feature: {
      heading: 'One Phoenixville dentist for the full list',
      text: 'NYU-trained. Eleven years in this town. Implants and fillings in the same suite behind the Wawa. Late evenings so the office is still open when you get off. Dr. Truong Nguyen is the name on the chart.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Behind the Wawa, next to Hand & Stone',
      text: '1570 Egypt Rd #210. Easy to find once you have been once. Bring the kid, the crown, or the tooth that broke at dinner. Saturday is closed. Call 484-392-7687 for the rest of the week.',
      ctaLabel: 'See the services',
    },
    catalog: {
      items: [
        {
          title: 'Restorative care',
          text: 'Fillings, root canals, crowns, and bridges in Dr. Nguyen\'s Phoenixville chair.',
        },
        {
          title: 'Implants and dentures',
          text: 'Extractions, dentures, and implants when a tooth cannot be kept.',
        },
        {
          title: 'Whitening and emergency care',
          text: 'Cosmetic whitening and after-work emergency visits from the same practice.',
        },
      ],
    },
    contact: { heading: 'Egypt Road, suite 210', sub: '' },
  },
  {
    slug: 'first-class-auto-land',
    name: 'First Class Auto Land',
    city: 'Philadelphia',
    category: 'Used car dealer',
    vertical: 'auto',
    schemaType: 'AutoDealer',
    url: 'https://www.firstclassautoland.com/',
    phone: '215-533-5181',
    address: '4050 Frankford Ave, Philadelphia, PA 19124',
    hours: '',
    attitude: 'brutal',
    palette: {
      paper: '#F2EDE4',
      ink: '#161616',
      accent: '#C2410C',
      accent2: '#F4B942',
      panel: '#D5D0C6',
      deep: '#111111',
    },
    fonts: { display: 'Archivo Black', text: 'Work Sans' },
    craft: 'used car sales',
    description:
      'Third-generation family used car dealer on Frankford Avenue. Cars, trucks, and SUVs. 119-point inspection. 3-month / 4,500-mile powertrain warranty. Financing and trade-ins. Niko, Mike, Tommy, Chris, Oren.',
    marquee: ['Family owned', '119-point inspection', 'Powertrain warranty', 'Financing', 'Trade-ins'],
    hero: {
      headline: 'Third-generation lot on Frankford',
      sub: 'First Class Auto Land is a third-generation, family-owned used car dealer at 4050 Frankford Ave. The row holds cars, trucks, and SUVs. Every vehicle goes through a 119-point inspection. They back what they sell with a 3-month or 4,500-mile full powertrain warranty. Financing and trade-ins happen on the same lot.',
      glassFloat: { title: 'Frankford Ave', sub: 'Family owned, 119-point inspection' },
    },
    offerings: {
      heading: 'How the Frankford lot actually deals',
      items: [
        {
          title: 'Cars, trucks, and SUVs',
          text: 'Import and domestic, pre-owned and nearly new. Niko and Tommy walk the row with you. You test-drive the vehicle that is sitting on Frankford Avenue, not a photo from another state.',
        },
        {
          title: 'Financing with Mike',
          text: 'Mike runs the paper. Reviews keep naming him because he stays in the deal when the bank part gets messy. Trade-ins are on the table. They will even run you to the bank if the payment method needs a branch.',
        },
        {
          title: '119-point inspection and warranty',
          text: 'Every vehicle gets a 119-point inspection before it hits the row. The lot backs the sale with a 3-month or 4,500-mile full powertrain warranty, so the first months after you leave are not a shrug.',
        },
      ],
    },
    story: {
      heading: 'A family lot people drive hours to use',
      paragraphs: [
        'First Class Auto Land has been a Frankford Avenue family shop for decades, now in its third generation. Buyers come from Bucks, Montgomery, Delaware, and Chester, and from New Jersey, because Niko, Mike, Tommy, Chris, and Oren still treat a used-car deal like a person is in the chair.',
        'The sequence is walk the lot, take the test drive, sit with Mike, leave in the car. People buy a second vehicle here a year later. The warranty and the 119-point inspection are why the second trip feels less stupid than the first used-car story you were told.',
      ],
    },
    experience: {
      heading: 'How a First Class purchase actually runs',
      items: [
        {
          title: 'Walk the row with Niko or Tommy',
          text: 'Cars, trucks, and SUVs are on the pavement. You pick the one you can put a hand on, then you take it around the block.',
        },
        {
          title: 'Sit with Mike on the paper',
          text: 'Financing and trade-ins happen in the office. Mike stays in the deal. Oren and Chris keep the rest of the lot moving.',
        },
        {
          title: 'Leave with the warranty on the car',
          text: 'The 119-point inspection already happened. The 3-month or 4,500-mile powertrain warranty rides home with you.',
        },
      ],
    },
    feature: {
      heading: 'Family owned, inspected, warranted',
      text: 'Third generation on Frankford Avenue. Cars, trucks, and SUVs that went through 119 points. A 3-month or 4,500-mile full powertrain warranty on what leaves the lot. Mike on the financing. Trade-ins welcome.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'People name the staff',
      text: 'Niko finds the car. Tommy walks the lot. Mike does the financing. Chris and Oren close the easy ones. First Class Auto Land is those people on Frankford Avenue, not a nameless row of flags.',
      ctaLabel: 'See the lot',
    },
    catalog: {
      items: [
        {
          title: 'Cars, trucks, SUVs',
          text: 'Import and domestic used vehicles on the Frankford Avenue row, ready to test-drive.',
        },
        {
          title: '119-point inspection',
          text: 'Every vehicle, plus a 3-month or 4,500-mile full powertrain warranty after you leave.',
        },
        {
          title: 'Financing and trade-ins',
          text: 'Mike on the paper. They want the car you already drive, and they will work the bank piece.',
        },
      ],
    },
    contact: { heading: 'The Frankford Avenue lot', sub: '' },
  },
  {
    slug: 'eastern-dragon',
    name: 'Eastern Dragon',
    city: 'North Wales',
    category: 'Chinese and Japanese restaurant',
    vertical: 'food',
    schemaType: 'Restaurant',
    url: 'http://www.easterndragonfood.com/',
    phone: '215-855-0366',
    address: '830 Upper State Rd, North Wales, PA 19454',
    hours: 'Sun-Thurs 11am-9:30pm, Fri-Sat 11am-10:30pm',
    attitude: 'warm',
    palette: {
      paper: '#F6EFE4',
      ink: '#2A120C',
      accent: '#B42318',
      accent2: '#D4A017',
      panel: '#E4D3C0',
      deep: '#1A0C08',
    },
    fonts: { display: 'Bebas Neue', text: 'Noto Sans' },
    craft: 'Chinese and Japanese cooking',
    description:
      'Chinese and Japanese restaurant in North Wales. Szechuan Chicken, Mongolian Beef, Moo Goo Gai Pan, Dragon Roll, Shumai, lunch specials. Free delivery minimum $15, cash only on delivery.',
    marquee: ['Szechuan Chicken', 'Mongolian Beef', 'Dragon Roll', 'Lunch specials', 'North Wales'],
    hero: {
      headline: 'Chinese and Japanese, Upper State Road',
      sub: 'Eastern Dragon is a Chinese and Japanese restaurant in North Wales. The kitchen is known for Szechuan Chicken, Mongolian Beef, Moo Goo Gai Pan, Dragon Roll, and Shumai. Lunch specials run during the day. Free delivery starts at a $15 minimum, and delivery is cash only.',
      glassFloat: { title: 'North Wales', sub: 'Chinese and Japanese' },
    },
    offerings: {
      heading: 'What the kitchen actually sends out',
      items: [
        {
          title: 'Chinese plates',
          text: 'Szechuan Chicken, Mongolian Beef, and Moo Goo Gai Pan come off the Chinese side. Shrimp tempura and shumai ride with them when the table wants Japanese starters on the same ticket.',
        },
        {
          title: 'Japanese rolls and Shumai',
          text: 'Dragon Roll and Shumai sit on the Japanese side of the same menu. You can eat Chinese and Japanese in one order from one North Wales kitchen.',
        },
        {
          title: 'Lunch specials and delivery',
          text: 'Lunch specials are on the board for the midday order. Free delivery starts at a $15 minimum. Delivery is cash only, the way they run the road.',
        },
      ],
    },
    story: {
      heading: 'One kitchen, two menus',
      paragraphs: [
        'Eastern Dragon cooks Chinese and Japanese food on Upper State Road. Szechuan Chicken and Mongolian Beef share the ticket with Dragon Roll and Shumai. Moo Goo Gai Pan is there for the plate that wants vegetables and a quieter sauce. The restaurant is a neighborhood kitchen, not a tasting room.',
        'Lunch specials give the midday order a shorter path. Free delivery starts at $15, cash only when the food leaves the building. Sit, pick up, or send Szechuan Chicken and a Dragon Roll to the same door.',
      ],
    },
    experience: {
      heading: 'How an order actually moves',
      items: [
        {
          title: 'Build the ticket',
          text: 'You order Szechuan Chicken, Mongolian Beef, Moo Goo Gai Pan, Dragon Roll, Shumai, or a lunch special. The kitchen cooks the names on the ticket.',
        },
        {
          title: 'Stay, pick up, or send it out',
          text: 'The restaurant serves the room and the road. Delivery is free at a $15 minimum. Cash only on delivery, as they state it.',
        },
        {
          title: 'Eat the plate they named',
          text: 'Szechuan Chicken next to a Dragon Roll. Mongolian Beef next to shumai. One North Wales kitchen, both menus on the ticket.',
        },
      ],
    },
    feature: {
      heading: 'Szechuan Chicken to Dragon Roll',
      text: 'The menu is allowed to be both. Szechuan Chicken and Mongolian Beef sit next to Dragon Roll and Shumai. Moo Goo Gai Pan keeps a milder plate on the same ticket.',
      ctaLabel: 'See the menu',
    },
    spotlight: {
      heading: 'Lunch specials, then delivery',
      text: 'Midday orders can take a lunch special. When the food goes out, free delivery starts at $15 and the driver collects cash. Those are their rules, written here the way they run them.',
      ctaLabel: 'Official site',
    },
    catalog: {
      items: [
        {
          title: 'Szechuan Chicken',
          text: 'A named Chinese plate from the Eastern Dragon kitchen in North Wales.',
        },
        {
          title: 'Dragon Roll',
          text: 'Japanese side of the same menu, ordered with Shumai or a Chinese plate.',
        },
        {
          title: 'Lunch specials',
          text: 'Midday specials, plus free delivery at a $15 minimum, cash only on delivery.',
        },
      ],
    },
    contact: { heading: 'Upper State Road', sub: '' },
  },
  {
    slug: 'francis-kaufman-house',
    name: 'Francis Kaufman House',
    city: 'Sumneytown',
    category: 'BYOB restaurant',
    vertical: 'food',
    schemaType: 'Restaurant',
    url: 'http://franciskaufmanhouse.com/',
    phone: '215-234-2499',
    address: '3164 Main Street #63, Sumneytown, PA 18084',
    hours: '',
    attitude: 'editorial',
    palette: {
      paper: '#F3EDE2',
      ink: '#2A2118',
      accent: '#7A2E12',
      accent2: '#C4A574',
      panel: '#DCCFC0',
      deep: '#1A140E',
    },
    fonts: { display: 'Cormorant Garamond', text: 'Source Serif 4' },
    craft: 'BYOB dining',
    description:
      'BYOB, cash only. Chef William Francis and Desiree. 1850 cigar factory turned hotel. Crab cakes, filet, smoked brisket, smoked beef ribs, scallops, chocolate flourless torte. Country fare with international flair.',
    marquee: ['BYOB', 'Cash only', 'Crab cakes', 'Smoked brisket', 'Chef William Francis'],
    hero: {
      headline: 'Country fare, international flair',
      sub: 'Francis Kaufman House is Chef William Francis and Desiree in an 1850 building that started as a cigar factory and later ran as a hotel. The room is BYOB and cash only. Regulars order crab cakes, filet, smoked brisket, smoked beef ribs, scallops, and the chocolate flourless torte. Reserve the table. Bring the bottle.',
      glassFloat: { title: 'Sumneytown', sub: 'Chef William Francis' },
    },
    offerings: {
      heading: 'What the house actually puts on the plate',
      items: [
        {
          title: 'Crab cakes, filet, scallops',
          text: 'Crab cakes and scallops are the seafood people drive to Sumneytown for. Filet is the steak that shows up in the same reviews. Homemade and fresh is how the kitchen talks about the work.',
        },
        {
          title: 'Smoked brisket and beef ribs',
          text: 'Smoked brisket, smoked beef ribs, smoked fish, and chicken sit on the board when the pit is running. Country fare with international flair is their own line, and the smoke is how it tastes on Main Street.',
        },
        {
          title: 'BYOB, cash, chocolate torte',
          text: 'Bring the wine. Pay cash. Finish with the chocolate flourless torte. Desiree works the house with Chef William Francis, so the night feels like a dining room someone actually lives in.',
        },
      ],
    },
    story: {
      heading: 'An 1850 building, a chef, a bottle you brought',
      paragraphs: [
        '3164 Main Street in Sumneytown has been a cigar factory and a hotel. Francis Kaufman House is what Chef William Francis and Desiree do with it now: reserved tables, bottles from your cellar, cash at the end. Wild game has been part of the kitchen\'s history. Crab cakes and smoked brisket are what people name after they leave.',
        'You call 215-234-2499 and hold the night. The food is homemade. The room is small enough that a reservation matters. Bring a red for the filet or a white for the scallops. Leave room for the flourless torte.',
      ],
    },
    experience: {
      heading: 'How a night at Kaufman House actually goes',
      items: [
        {
          title: 'Reserve, then bring the bottle',
          text: 'The table is held ahead of time. Wine, beer, or whiskey comes with you. The house cooks. You pour.',
        },
        {
          title: 'Eat crab cakes or the smoked plates',
          text: 'Crab cakes, filet, scallops, smoked brisket, smoked beef ribs. Ask what William is running that night. The kitchen still cooks wild game when it is on.',
        },
        {
          title: 'Pay cash, take the torte',
          text: 'Cash only at the end. Chocolate flourless torte if you still have room. Desiree keeps the room moving.',
        },
      ],
    },
    feature: {
      heading: 'Chef William Francis, an 1850 house',
      text: 'Cigar factory, then hotel, now a BYOB dining room in Sumneytown. Crab cakes, smoked brisket, filet, scallops, and a flourless torte. Cash only. Reservations. A bottle from your own shelf.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Country fare with international flair',
      text: 'Their line, not a brochure invention. Homemade plates, smoke when the pit is on, wild game in the house history. Chef William Francis and Desiree still run 3164 Main Street like a house that knows your name after the second visit.',
      ctaLabel: 'Reserve',
    },
    catalog: {
      items: [
        {
          title: 'Crab cakes and scallops',
          text: 'The seafood plates regulars drive to Sumneytown for, next to a filet if you want steak.',
        },
        {
          title: 'Smoked brisket and beef ribs',
          text: 'Smoke from the house kitchen, with smoked fish and chicken when they are running.',
        },
        {
          title: 'Chocolate flourless torte',
          text: 'The finish. BYOB, cash only, reservation on the books.',
        },
      ],
    },
    contact: { heading: 'Main Street, Sumneytown', sub: '' },
  },
  {
    slug: 'beijing-chinese-food',
    name: 'Bei Jing Chinese Food',
    city: 'Norristown',
    category: 'Chinese restaurant',
    vertical: 'food',
    schemaType: 'Restaurant',
    url: 'https://www.beijingchinesefoodpa.com/',
    phone: '610-275-4086',
    address: '130 E Marshall St, Norristown, PA 19401',
    hours: 'Daily 1pm-1am',
    attitude: 'warm',
    palette: {
      paper: '#F7F1E6',
      ink: '#1F120C',
      accent: '#C81E1E',
      accent2: '#E6B422',
      panel: '#E6D7C4',
      deep: '#1A0E0A',
    },
    fonts: { display: 'Zen Antique', text: 'Noto Sans' },
    craft: 'Chinese takeout',
    description:
      'Late-night Chinese in Norristown. General Tso\'s, sesame chicken, pork fried rice, beef lo mein, wonton soup, fried dumplings, crab rangoons. Pickup and delivery from East Marshall Street.',
    marquee: ['General Tso\'s', 'Sesame chicken', 'Lo mein', 'Lunch specials', 'Open late'],
    hero: {
      headline: 'General Tso\'s until 1am',
      sub: 'Bei Jing Chinese Food cooks on East Marshall Street in Norristown. The tickets that leave this kitchen are General Tso\'s chicken, sesame chicken, sweet and sour chicken, pork fried rice, and beef lo mein. Wonton soup, fried dumplings, and crab rangoons start the bag. Pickup at the counter or delivery from the same stove. Open daily 1pm to 1am.',
      glassFloat: { title: 'Norristown', sub: 'Open daily 1pm to 1am' },
    },
    offerings: {
      heading: 'What the Marshall Street kitchen sends out',
      items: [
        {
          title: 'General Tso\'s and sesame chicken',
          text: 'General Tso\'s chicken and sesame chicken are the plates people reorder. Sweet and sour chicken sits next to them when you want the brighter sauce. Lunch specials put the same dishes on a shorter midday ticket with fried rice.',
        },
        {
          title: 'Rice, lo mein, and the fried start',
          text: 'Pork fried rice and beef lo mein fill the box. Wonton soup, fried dumplings, cheese wontons, and crab rangoons are the openers. Wings ride along when the table wants them.',
        },
        {
          title: 'Lunch specials, then late pickup',
          text: 'Chow mein, pepper steak, Hunan, and Szechuan shrimp show up on the lunch board. After dark the same kitchen still packs General Tso\'s and lo mein for pickup or delivery until 1am.',
        },
      ],
    },
    story: {
      heading: 'A Norristown Chinese kitchen that stays open',
      paragraphs: [
        'East Marshall Street already treats Bei Jing as the late Chinese run. You call 610-275-4086, you name General Tso\'s or sesame chicken, and the bag comes out hot. Regulars talk about big portions and food that is still steaming when it hits the door.',
        'Pickup walks into 130 E Marshall St. Delivery leaves from the same kitchen, not a ghost brand with a borrowed name. Lunch specials cover the afternoon. The overnight window is the reason Norristown keeps this number saved.',
      ],
    },
    experience: {
      heading: 'How a Bei Jing order actually moves',
      items: [
        {
          title: 'Name the plate',
          text: 'General Tso\'s, sesame chicken, sweet and sour, pork fried rice, beef lo mein, wonton soup, dumplings, crab rangoons. The ticket is those dishes, cooked here.',
        },
        {
          title: 'Grab it or send it',
          text: 'Walk the counter on East Marshall Street or have the same kitchen deliver. Either path is the Norristown stove, not a third-party commissary.',
        },
        {
          title: 'Eat it while it is still hot',
          text: 'Portions come out large. The point of a 1am Chinese run is food that is still hot when you open the bag.',
        },
      ],
    },
    feature: {
      heading: 'The late-night Chinese number in Norristown',
      text: 'General Tso\'s, sesame chicken, and beef lo mein from a kitchen that stays open until 1am. Lunch specials earlier. Pickup and delivery off East Marshall Street either way.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Crab rangoons, then the Tso\'s',
      text: 'Start with fried dumplings or crab rangoons. Put General Tso\'s or sesame chicken in the bag with pork fried rice. Bei Jing has been packing that order for Norristown for a long time.',
      ctaLabel: 'Order',
    },
    catalog: {
      items: [
        {
          title: 'General Tso\'s chicken',
          text: 'The plate Norristown reorders, packed for pickup or a 1am delivery.',
        },
        {
          title: 'Sesame chicken',
          text: 'Next to sweet and sour on the same Marshall Street menu, with lunch specials at midday.',
        },
        {
          title: 'Pork fried rice and lo mein',
          text: 'Pork fried rice, beef lo mein, wonton soup, dumplings, and crab rangoons from the same kitchen.',
        },
      ],
    },
    contact: { heading: 'East Marshall Street', sub: '' },
  },
  {
    slug: 'glocker-realtors',
    name: 'Glocker Realty & Insurance',
    city: 'Boyertown',
    category: 'Real estate and insurance',
    vertical: 'real-estate',
    schemaType: 'RealEstateAgent',
    url: 'https://www.glocker.com/',
    phone: '610-367-2058',
    address: '900 E. Philadelphia Ave, Boyertown, PA 19512',
    hours: '',
    attitude: 'align',
    palette: {
      paper: '#F4F1EA',
      ink: '#1A2420',
      accent: '#2F6B4F',
      accent2: '#C4A35A',
      panel: '#DDE5DF',
      deep: '#12201A',
    },
    fonts: { display: 'Plus Jakarta Sans', text: 'DM Sans' },
    craft: 'real estate and insurance',
    description:
      'Locally owned real estate and insurance in Boyertown for 50+ years. Owners Martin Slater and Matthew Kennedy. RESULTS THAT MOVE YOU.',
    marquee: ['RESULTS THAT MOVE YOU', 'Real estate', 'Insurance', 'Boyertown', '50+ years'],
    extraLinks: [{ label: 'Insurance office', href: 'tel:6109483301' }],
    hero: {
      headline: 'RESULTS THAT MOVE YOU',
      sub: 'Glocker Realty & Insurance is a locally owned Boyertown shop with more than 50 years on the work. Owners Martin Slater and Matthew Kennedy run real estate and insurance from 900 E. Philadelphia Ave. The line they use is RESULTS THAT MOVE YOU. Real estate reaches 610-367-2058. The insurance office is a separate line at 610-948-3301.',
      glassFloat: { title: 'Boyertown', sub: 'Locally owned 50+ years' },
    },
    offerings: {
      heading: 'Two desks, one locally owned firm',
      items: [
        {
          title: 'Real estate',
          text: 'The realty side lists, shows, and closes. RESULTS THAT MOVE YOU is their line for that work. Martin Slater and Matthew Kennedy own the firm that does it in Boyertown.',
        },
        {
          title: 'Insurance',
          text: 'Insurance sits in the same locally owned company. The insurance office has its own number, 610-948-3301, so a policy question does not have to wait on a listing conversation.',
        },
        {
          title: 'Fifty-plus years, still local',
          text: 'The firm is locally owned after more than 50 years. Boyertown is not a franchise sticker on a national desk. The owners are named: Martin Slater and Matthew Kennedy.',
        },
      ],
    },
    story: {
      heading: 'Boyertown, still theirs',
      paragraphs: [
        'Glocker Realty & Insurance has been locally owned for more than 50 years. Martin Slater and Matthew Kennedy are the owners now. The firm still works real estate and insurance from East Philadelphia Avenue in Boyertown. RESULTS THAT MOVE YOU is the sentence they put on that work.',
        'Real estate and insurance in one company means a house question and a policy question can live under the same roof. The numbers stay distinct so you reach the right desk: real estate at 610-367-2058, insurance at 610-948-3301. The ownership stays local either way.',
      ],
    },
    experience: {
      heading: 'How the firm actually works a file',
      items: [
        {
          title: 'Real estate that is meant to move',
          text: 'Listings, showings, and closings are the realty work. RESULTS THAT MOVE YOU is their measure, not a borrowed slogan from a national desk.',
        },
        {
          title: 'Insurance at the sister desk',
          text: 'A policy is handled by the insurance office inside the same locally owned firm. You are not sent to a distant carrier lobby for the first conversation.',
        },
        {
          title: 'Owners on the letterhead',
          text: 'Martin Slater and Matthew Kennedy own the company. After 50+ years the firm is still a Boyertown name, not a sold-off brand.',
        },
      ],
    },
    feature: {
      heading: 'Real estate and insurance, locally owned',
      text: 'The firm does both on purpose. A move and a policy can start in the same Boyertown company, with owners whose names are on the door.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'RESULTS THAT MOVE YOU',
      text: 'RESULTS THAT MOVE YOU is their line. Martin Slater and Matthew Kennedy run the shop that has to make it true: sell the house, write the coverage, stay local after 50+ years.',
      ctaLabel: 'Talk to the firm',
    },
    catalog: {
      items: [
        {
          title: 'Real estate',
          text: 'Boyertown realty from a locally owned firm. RESULTS THAT MOVE YOU.',
        },
        {
          title: 'Insurance office',
          text: 'Insurance inside the same company. Separate office line at 610-948-3301.',
        },
        {
          title: 'Martin Slater and Matthew Kennedy',
          text: 'The owners. Locally held after more than 50 years in Boyertown.',
        },
      ],
    },
    contact: { heading: 'East Philadelphia Avenue', sub: '' },
  },
  {
    slug: 'bar-31',
    name: 'Bar 31',
    city: 'Ambler',
    category: 'Dive bar',
    vertical: 'nightlife',
    schemaType: 'BarOrPub',
    url: 'https://www.bar31.net/',
    phone: '215-646-0440',
    address: '31 N Main St, Ambler, PA 19002',
    hours: 'Mon-Sat 11am-2am, Sun 11am-12am',
    attitude: 'neon',
    palette: {
      paper: '#F2EDE6',
      ink: '#14181C',
      accent: '#E23B2F',
      accent2: '#F0C14B',
      panel: '#2A3036',
      deep: '#0C0E10',
    },
    fonts: { display: 'Rubik Mono One', text: 'IBM Plex Sans' },
    craft: 'dive bar service',
    description:
      'Dive bar at 31 N Main in Ambler. Horseshoe bar, jukebox, electronic darts, smoking at the bar. Pulled pork, roast beef, hot sausage, wings, pierogies, pickled eggs. Victory, Troegs, Sterling Pig. Bartender Dave.',
    marquee: ['Horseshoe bar', 'Cheap drafts', 'Pierogies', 'Jukebox', 'Dave'],
    hero: {
      headline: 'Horseshoe bar, cheap drafts, Dave',
      sub: 'Bar 31 is the dive at 31 N Main St in Ambler. Sit the horseshoe rail. Punch the jukebox. Throw electronic darts. Smoke at the bar. Drafts stay cheap, including Victory, Troegs, and Sterling Pig. Eat pulled pork, roast beef, hot sausage sandwiches, wings, pierogies, fried pickles, and pickled eggs. Regulars ask for Dave.',
      glassFloat: { title: 'Ambler', sub: 'Horseshoe bar, open late' },
    },
    offerings: {
      heading: 'What 31 actually pours and plates',
      items: [
        {
          title: 'The horseshoe rail',
          text: 'The room is a U-shaped bar. You sit on the wood, not in a dining concept. Jukebox in the corner. Electronic darts in the room. Smoking at the bar, the old way.',
        },
        {
          title: 'Cheap drafts, named taps',
          text: 'Victory, Troegs, and Sterling Pig have been the local taps people write down. The rest of the handles stay cheap enough that Ambler treats this as a weeknight bar, not a flight room.',
        },
        {
          title: 'Sandwiches, pierogies, pickled eggs',
          text: 'Pulled pork, roast beef, and hot sausage sandwiches. Wings and fried pickles. Pierogies. A jar of pickled eggs. Pizza when the kitchen is running it. Food you eat at the rail with the beer.',
        },
      ],
    },
    story: {
      heading: 'Ambler already knows 31',
      paragraphs: [
        'Bar 31 opens at 11am and stays until 2am Monday through Saturday, midnight on Sunday. The friendliest dive on Main Street is the line regulars keep using, and Dave is the bartender they name. You come for a cheap draft, a pulled pork sandwich, and a room that still lets you smoke at the bar.',
        'PA Eats wrote down the horseshoe, the local taps, the pizza and fried pickles. The rest of the ticket is roast beef, hot sausage, wings, pierogies, and pickled eggs. No cocktail program. No cover. The jukebox is the band.',
      ],
    },
    experience: {
      heading: 'How a night at 31 actually goes',
      items: [
        {
          title: 'Take a seat on the horseshoe',
          text: 'Sit the rail. Punch the jukebox. Throw a round of electronic darts. Smoke if that is why you came.',
        },
        {
          title: 'Drink the cheap draft',
          text: 'Victory, Troegs, Sterling Pig, or whatever Dave is pouring. The point is a cold one that does not punish the tab.',
        },
        {
          title: 'Eat at the rail',
          text: 'Pulled pork, roast beef, hot sausage, wings, pierogies, fried pickles, pickled eggs. Pizza if you want a pie with the beer.',
        },
      ],
    },
    feature: {
      heading: 'A dive with a jukebox, not a guest list',
      text: 'Horseshoe bar. Cheap drafts. Dave behind it. Pulled pork and pierogies on the plate. Open until 2am most nights. Bar 31 is the Ambler rail you already knew was there.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Ask for Dave',
      text: 'Regulars call this the friendliest bar in town and they mean the person pouring. Sit the horseshoe, eat a hot sausage sandwich, let the jukebox do the rest.',
      ctaLabel: 'See the bar',
    },
    catalog: {
      items: [
        {
          title: 'Horseshoe bar',
          text: 'U-shaped rail at 31 N Main, with a jukebox, electronic darts, and smoking at the bar.',
        },
        {
          title: 'Victory, Troegs, Sterling Pig',
          text: 'Named local taps next to cheap drafts that keep Ambler in the room.',
        },
        {
          title: 'Pierogies and pulled pork',
          text: 'Sandwiches, wings, fried pickles, pickled eggs, and pizza from the dive kitchen.',
        },
      ],
    },
    contact: { heading: '31 North Main', sub: '' },
  },
  {
    slug: 'august-moon',
    name: 'August Moon',
    city: 'Norristown',
    category: 'Korean Japanese cuisine',
    vertical: 'food',
    schemaType: 'Restaurant',
    url: 'https://augustmoonpa.com/',
    phone: '610-277-4008',
    address: '300 East Main Street, Norristown, PA 19401',
    hours:
      'Lunch Mon-Fri 11:30am-2pm; Dinner Mon-Thu 4:30pm-9pm Fri 4:30pm-9:30pm Sat 4pm-9:30pm; Sunday closed',
    attitude: 'glass',
    palette: {
      paper: '#F6F3EE',
      ink: '#1A1A1A',
      accent: '#C45C2C',
      accent2: '#2B6B4F',
      panel: '#E4DCD2',
      deep: '#14120F',
    },
    fonts: { display: 'Outfit', text: 'Noto Sans KR' },
    craft: 'Korean Japanese cuisine',
    description:
      'Korean-Japanese on East Main in Norristown. Kalbi, bibimbap, jap chae, doen jang jigae, salmon teriyaki, tuna tataki. Volcano, Polar Bear, Godzilla, and New August Moon rolls. Sushi bar and BBQ party trays.',
    marquee: ['Kalbi', 'Bibimbap', 'Volcano roll', 'Godzilla roll', 'Sushi bar'],
    hero: {
      headline: 'Kalbi, bibimbap, and the Volcano roll',
      sub: 'August Moon calls itself simply the best sushi and sashimi on East Main Street in Norristown. Korean plates are kalbi, bibimbap, jap chae, and doen jang jigae. Japanese plates are salmon teriyaki and tuna tataki. The sushi bar turns Volcano, Polar Bear, Godzilla, and New August Moon rolls. BBQ party trays feed the bigger table. Phone the ticket in.',
      glassFloat: { title: 'Norristown', sub: 'Sushi bar and kalbi' },
    },
    offerings: {
      heading: 'What August Moon actually cooks',
      items: [
        {
          title: 'Korean plates',
          text: 'Kalbi hits the table as short ribs. Bibimbap comes in the hot bowl. Jap chae is the glass-noodle plate. Doen jang jigae is the stew you want when the night is cold. Those are the Korean names people already order.',
        },
        {
          title: 'Sushi bar rolls',
          text: 'Volcano, Polar Bear, Godzilla, and the New August Moon roll are the house sushi. Salmon teriyaki and tuna tataki sit next to nigiri when you want a quieter Japanese plate.',
        },
        {
          title: 'BBQ party trays and phone orders',
          text: 'A BBQ party tray is how a birthday or office table eats Korean from this kitchen. Call 610-277-4008, name the kalbi and the rolls, pick up or sit down when it is ready.',
        },
      ],
    },
    story: {
      heading: 'East Main Street, two kitchens, one ticket',
      paragraphs: [
        'August Moon refuses to pick only Korea or only Japan. You can eat kalbi and a Godzilla roll in the same sitting. The sushi bar is a real station. Lunch runs Monday through Friday 11:30am to 2pm. Dinner returns at 4:30, later on Friday and Saturday. Sunday the kitchen rests.',
        'Norristown already uses this number for party trays. Phone the order, bring the table, split bibimbap and Polar Bear rolls down the middle. Authentic Korean-Japanese is their phrase, and the named dishes are how it shows up on a plate.',
      ],
    },
    experience: {
      heading: 'How a meal at August Moon actually gets to the table',
      items: [
        {
          title: 'Call in kalbi or the rolls',
          text: 'Phone the ticket: kalbi, bibimbap, jap chae, a Volcano roll, a Godzilla roll, a BBQ party tray. The kitchen works those names.',
        },
        {
          title: 'Sit the sushi bar or the larger table',
          text: 'Nigiri and house rolls at the bar. Korean BBQ trays when the group is bigger than two chairs.',
        },
        {
          title: 'Lunch window, then dinner',
          text: 'Weekday lunch closes at 2pm. Dinner comes back at 4:30. Saturday dinner starts at 4. Sunday there is no service.',
        },
      ],
    },
    feature: {
      heading: 'From doen jang jigae to the Godzilla roll',
      text: 'Korean stew and Japanese rolls in the same Norristown room. Kalbi and bibimbap for the table that wants a hot bowl. Volcano, Polar Bear, Godzilla, and New August Moon rolls for the sushi bar. BBQ party trays when you are feeding a crowd.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Simply the best sushi and sashimi',
      text: 'Their line. Pair it with kalbi if you came for Korean. Phone 610-277-4008 so the tray is already moving when you hit East Main Street.',
      ctaLabel: 'Call in an order',
    },
    catalog: {
      items: [
        {
          title: 'Kalbi and bibimbap',
          text: 'Short ribs and the hot bowl, with jap chae and doen jang jigae on the same Korean ticket.',
        },
        {
          title: 'Volcano and Godzilla rolls',
          text: 'House sushi with Polar Bear and New August Moon rolls at the bar.',
        },
        {
          title: 'BBQ party trays',
          text: 'Korean BBQ for a group, phoned in and packed or plated in the Norristown room.',
        },
      ],
    },
    contact: { heading: '300 East Main Street', sub: '' },
  },
  {
    slug: 'highline-motors',
    name: 'Highline Motors',
    city: 'Aston',
    category: 'Used car dealer',
    vertical: 'auto',
    schemaType: 'AutoDealer',
    url: 'https://www.highlineaston.com/',
    phone: '610-753-4536',
    address: '469 Conchester Hwy, Aston, PA 19014',
    hours: 'Mon-Fri 9am-6pm, Sat 10am-4pm',
    attitude: 'industrial',
    palette: {
      paper: '#EEEAE3',
      ink: '#161616',
      accent: '#C45C12',
      accent2: '#4A90C4',
      panel: '#D4D0C8',
      deep: '#101010',
    },
    fonts: { display: 'Oswald', text: 'Barlow' },
    craft: 'used car sales',
    description:
      'Used cars, SUVs, trucks, and vans on Conchester Highway in Aston. Honda, Ford, Subaru, BMW, Lexus, Audi on the row. Trade-ins. Pat on the lot. Weekdays 9-6, Saturday 10-4.',
    marquee: ['SUVs', 'Trucks', 'Trade-ins', 'Honda', 'Subaru', 'Aston'],
    hero: {
      headline: 'SUVs, trucks, and the car you trade',
      sub: 'Highline Motors sits at 469 Conchester Hwy in Aston with used SUVs, sedans, trucks, and vans on the row. Recent inventory has run Honda CR-Vs, Ford Fusions, Subaru Foresters, BMW X3s, Lexus RXs, and Audi Q5s. Bring the car you already drive. Pat is the name regulars keep using when the deal actually closes.',
      glassFloat: { title: 'Aston', sub: 'SUVs, trucks, trade-ins' },
    },
    offerings: {
      heading: 'What the Conchester Highway lot actually holds',
      items: [
        {
          title: 'SUVs, trucks, sedans, vans',
          text: 'The lot turns over Honda, Ford, Subaru, BMW, Lexus, Audi, Chevy, and GMC. You walk a CR-V, a Forester, an Explorer, a Silverado, or a Sienna depending on the week. The car you buy is the one sitting in Aston that day.',
        },
        {
          title: 'Trade-ins with Pat',
          text: 'They want your vehicle. Trade-ins are half the driveway. Pat works the deal so the car you drive in can pay down the car you drive out. Miss Jay is the other name people mention when the paperwork stays calm.',
        },
        {
          title: 'A weekday lot you can actually catch',
          text: 'Monday through Friday the lot runs 9am to 6pm. Saturday is 10am to 4pm. You look at miles, you take a drive, you talk money on Conchester Highway before anyone emails a maybe.',
        },
      ],
    },
    story: {
      heading: 'Aston, on the highway, with a person on the lot',
      paragraphs: [
        'Highline Motors is the used-car stop on Conchester Highway when you want an SUV or a truck you can see in daylight. Buyers come back for a second car years later and still ask for Pat. The inventory moves: Honda and Subaru for the school run, Ford and Chevy when you need the bed, BMW and Lexus when the budget can take the badge.',
        'A deal here is walk the row, pick the vehicle, put your trade on the table. People who liked the lot talk about leaving with a car that lasted. Look at the specific car. Ask Pat the hard questions while you are still on the pavement.',
      ],
    },
    experience: {
      heading: 'How an Aston deal actually starts',
      items: [
        {
          title: 'Walk the SUVs and trucks',
          text: 'CR-Vs, Foresters, Explorers, Silverados, and the sedan row sit in the same lot. You pick the one with the miles you can live with.',
        },
        {
          title: 'Put your trade in the conversation',
          text: 'Drive in with the car you have. Pat and Miss Jay work the number so the trade is part of the deal, not a later errand.',
        },
        {
          title: 'Leave Conchester in the new one',
          text: 'Weekdays until 6, Saturday until 4. The purchase happens around a vehicle that is already in Aston.',
        },
      ],
    },
    feature: {
      heading: 'Honda to Lexus, plus the trade',
      text: 'Highline Motors turns over SUVs, trucks, sedans, and vans on Conchester Highway. Honda, Ford, Subaru, BMW, Lexus, Audi show up on the row. Pat works the trade so you are not stuck with two cars in the driveway.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Ask for Pat',
      text: 'Regulars who bought twice still name Pat. Miss Jay shows up in the paperwork stories. Highline Motors is that Aston lot: look at the SUV, talk the trade, decide before dark.',
      ctaLabel: 'See inventory',
    },
    catalog: {
      items: [
        {
          title: 'SUVs and crossovers',
          text: 'Honda CR-V, Subaru Forester, BMW X3, Lexus RX, Audi Q5, and the week\'s other crossovers.',
        },
        {
          title: 'Trucks and vans',
          text: 'Silverados, Explorers, Siennas, and the work vehicles that share the Aston row.',
        },
        {
          title: 'Trade-ins',
          text: 'Bring the car you have. Pat works the number into the car you want.',
        },
      ],
    },
    contact: { heading: 'Conchester Highway', sub: '' },
  },
  {
    slug: 'hero-complex',
    name: "Johnny Destructo's Hero Complex",
    city: 'Philadelphia',
    category: 'Comic shop',
    vertical: 'retail',
    schemaType: 'Store',
    url: 'https://www.jdsherocomplex.com/',
    phone: '215-482-7700',
    address: '4327 Main Street, Philadelphia, PA 19127',
    hours: 'Mon-Sat 12pm-8pm Sunday 12pm-6pm',
    attitude: 'neon',
    palette: {
      paper: '#F4F0E8',
      ink: '#16141C',
      accent: '#5B2C91',
      accent2: '#E23B2F',
      panel: '#D8D2E4',
      deep: '#120E18',
    },
    fonts: { display: 'Bungee', text: 'Nunito' },
    craft: 'comics and graphic novels',
    description:
      'Manayunk comic shop. Floppies, manga, graphic novels, figures, owner-printed shirts, original art, commissions. Clean, approachable shop. JD will order what is not on the rack. Noon to 8, Sunday to 6.',
    marquee: ['Comics', 'Manga', 'Pull list', 'Figures', 'Manayunk'],
    hero: {
      headline: 'A clean comic shop on Main',
      sub: 'Johnny Destructo\'s Hero Complex at 4327 Main Street in Manayunk is the shop JD built so a new reader can walk in without failing a test. Floppies, graphic novels, and manga on the racks. Superhero and anime figures on the floor. Owner-printed shirts and original art. Custom commissions. If it is not here, he will order it. Pull lists ship as far as Reading.',
      glassFloat: { title: 'Manayunk', sub: 'Clean, approachable shop' },
    },
    offerings: {
      heading: 'What the Main Street shop actually holds',
      items: [
        {
          title: 'Comics, manga, graphic novels',
          text: 'Weekly floppies, trade paperbacks, and Japanese manga. JD\'s job is the jumping-on point: if you like a show and do not know the book, he will put the first volume in your hand. Subscriptions stay even after people move.',
        },
        {
          title: 'Figures, shirts, original art',
          text: 'Superhero and anime figures. Hand-screened shirts and stickers JD prints. Original art on the wall. Indie books from local writers sit next to the hits because the shop backs the scene it lives in.',
        },
        {
          title: 'Commissions and special orders',
          text: 'Custom art commissions from the same counter that pulls your list. Cannot find the back issue? He will hunt it. Book clubs and game nights when the calendar has them.',
        },
      ],
    },
    story: {
      heading: 'Manayunk Main Street, noon to 8',
      paragraphs: [
        'JD took the mission on purpose: a comic shop that does not assault you at the door. Veteran geeks and first-timers get the same counter. Monday through Saturday the shop runs noon to 8pm. Sunday closes at 6. Call 215-482-7700 if you want the pull waiting.',
        'People who left Manayunk still get boxes shipped because the recommendations were that good. Family-friendly, all ages, no secret handshake. Comics, manga, figures, a shirt from the owner, a commission if you want a piece that does not exist yet.',
      ],
    },
    experience: {
      heading: 'How a visit to Hero Complex actually works',
      items: [
        {
          title: 'Walk the racks',
          text: 'Floppies, manga, and graphic novels are out. Ask JD where to jump in. The first visit does not require a guide, but he will be one if you want it.',
        },
        {
          title: 'Check figures, shirts, and art',
          text: 'Figures, owner-printed shirts, stickers, original art. Leave with a book and an object from one counter.',
        },
        {
          title: 'Start a pull or a commission',
          text: 'Subscriptions, special orders, custom art. The counter handles the weekly habit and the piece made for you.',
        },
      ],
    },
    feature: {
      heading: 'A comic shop you can actually walk into',
      text: 'Clean on purpose. Comics, manga, graphic novels, figures, shirts JD prints, original art, commissions. Manayunk Main Street, noon to 8. Sunday to 6. He will order what is missing.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Ask JD where to jump in',
      text: 'His line is expert advice for veteran geeks and new fans. Pull lists, manga, a figure, a commission. Hero Complex is that counter at 4327 Main Street.',
      ctaLabel: 'See the shop',
    },
    catalog: {
      items: [
        {
          title: 'Comics and manga',
          text: 'Floppies, trades, and manga on the racks at 4327 Main Street, Manayunk.',
        },
        {
          title: 'Figures and shirts',
          text: 'Superhero and anime figures, plus shirts and stickers the owner prints.',
        },
        {
          title: 'Pulls and commissions',
          text: 'Subscriptions, special orders, and custom art from the same counter.',
        },
      ],
    },
    contact: { heading: 'Main Street, Philadelphia', sub: '' },
  },
  {
    slug: 'dutton-road-vet',
    name: 'Dutton Road Veterinary Clinic',
    city: 'Philadelphia',
    category: 'Veterinary clinic and surgical facility',
    vertical: 'veterinary',
    schemaType: 'VeterinaryCare',
    url: 'https://duttonroadvetclinic.com/',
    phone: '215-331-2968',
    address: '10901 Dutton Road (Rear Entrance), Philadelphia, PA 19154',
    hours: '',
    attitude: 'neon',
    palette: {
      paper: '#F4EFE6',
      ink: '#1A1410',
      accent: '#C73B6A',
      accent2: '#6B8F3A',
      panel: '#E4D4C4',
      deep: '#14110E',
    },
    fonts: { display: 'Archivo Black', text: 'Source Sans 3' },
    craft: 'veterinary clinic and surgery',
    description:
      'Nonprofit veterinary clinic and surgical facility in Northeast Philadelphia. Low-cost vaccines, spays and neuters, general and specialty surgeries, pet dentistry. Greyhound-savvy staff. National Greyhound Adoption Program.',
    marquee: [
      'Low-cost vaccines',
      'Spay and neuter',
      'Pet dentistry',
      'Surgery',
      'Northeast Philly',
    ],
    extraLinks: [{ label: 'Adopt a greyhound', href: 'http://www.ngap-pet-care.com/' }],
    hero: {
      headline: 'Clinic and surgery for the neighborhood pet',
      sub: 'Dutton Road Veterinary Clinic is a full-service veterinary clinic and surgical facility in Northeast Philadelphia. The staff is greyhound-savvy and prices stay affordable because the clinic is nonprofit. Low-cost vaccines, spays and neuters, general and specialty surgeries, and pet dentistry are the published roster.',
      glassFloat: { title: 'Northeast Philly', sub: 'Nonprofit clinic and surgery' },
    },
    offerings: {
      heading: 'What the clinic actually does',
      items: [
        {
          title: 'Low-cost vaccines, spay, and neuter',
          text: 'Vaccines, spays, and neuters sit at affordable nonprofit prices. The work started for greyhounds in the kennel and now covers the dogs and cats around Dutton Road.',
        },
        {
          title: 'General and specialty surgery',
          text: 'The surgical facility is the other half of the name. General and specialty surgeries run in the same building, with staff veterinarians who keep training on current methods.',
        },
        {
          title: 'Pet dentistry',
          text: 'Pet dentistry is a named specialty. Greyhounds have unique anesthesia and dental needs, which is why National Greyhound Adoption Program built a clinic, and why dentistry stayed on the public roster.',
        },
      ],
    },
    story: {
      heading: 'From a Wingate Street trailer to Dutton Road',
      paragraphs: [
        'In 1995 National Greyhound Adoption Program opened a nonprofit clinic in a retro-fitted office trailer on Wingate Street. Two staff veterinarians worked two days a week and often saw 25 greyhounds on each of those days. Adopters from far outside the city started coming because greyhounds need different anesthesia and dentistry.',
        'In 2009 the adoption kennel moved to 10901 Dutton Road. In 2011 the veterinary clinic and surgical facility opened its doors to the public. Greyhounds are still the mission. A growing share of the patients are now the neighborhood dogs and cats who need the same affordable surgery and dentistry.',
      ],
    },
    experience: {
      heading: 'How a visit actually runs',
      items: [
        {
          title: 'Come in the rear entrance',
          text: 'Drive straight into the driveway instead of following the bend, then use the double doors at the back of the building. Greyhound-savvy staff meet you there for vaccines, dentistry, or surgery.',
        },
        {
          title: 'Vaccines, dentistry, or surgery on the roster',
          text: 'You are here for a vaccine, a spay or neuter, dentistry, or a surgical case. The veterinarians are greyhound-savvy and they treat neighborhood dogs and cats the same way: current methods.',
        },
        {
          title: 'Pay when the work is done',
          text: 'Services are payable when they are rendered. Cash, check, Visa, Mastercard, Discover, and American Express. A nonprofit clinic, not a payment-plan mill.',
        },
      ],
    },
    feature: {
      heading: 'Nonprofit prices, surgical facility on site',
      text: 'The clinic exists to keep greyhound care specialized and to keep neighborhood pets in reach of surgery and dentistry. Affordable prices are the point of a nonprofit, not a coupon layered on a private hospital.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Still greyhound-savvy',
      text: 'National Greyhound Adoption Program built this clinic because greyhounds need different anesthesia and dentistry. That expertise stayed when the doors opened to the public. Adopt through NGAP if a retired racer is the dog you want.',
      ctaLabel: 'Adopt a greyhound',
    },
    catalog: {
      items: [
        {
          title: 'Vaccines, spay, and neuter',
          text: 'Low-cost vaccines and spay/neuter for dogs and cats. Nonprofit pricing on the procedures the neighborhood actually needs.',
        },
        {
          title: 'Pet dentistry',
          text: 'Dentistry as a specialty. The clinic was built around greyhound dental and anesthesia needs and kept that work for every patient.',
        },
        {
          title: 'Surgery',
          text: 'General and specialty surgeries in the same building. Staff veterinarians, current methods, payable when the work is done.',
        },
      ],
    },
    contact: { heading: 'Rear entrance, Dutton Road', sub: '' },
  },
  {
    slug: 'kinetic-physical-therapy',
    name: 'Kinetic Physical Therapy',
    city: 'Collegeville',
    category: 'Physical therapy',
    vertical: 'healthcare',
    schemaType: 'MedicalClinic',
    url: 'https://www.kineticptpa.com/locations/collegeville/',
    phone: '610-424-1100',
    address: '241 Plaza Drive, Collegeville, PA 19426',
    hours: '',
    attitude: 'align',
    palette: {
      paper: '#F3F6F4',
      ink: '#143028',
      accent: '#1F7A4D',
      accent2: '#C4A35A',
      panel: '#D5E4DA',
      deep: '#10241C',
    },
    fonts: { display: 'Plus Jakarta Sans', text: 'Source Sans 3' },
    craft: 'physical therapy',
    description:
      'One-on-one PT in Collegeville. Dr. Jeff Kurtz. Orthopedic, sports, post-surgical, vestibular, concussion, running assessments, blood flow restriction. Hip replacement, rotator cuff, ACL. Ursinus / Perkiomen Creek.',
    marquee: ['One-on-one', 'Vestibular', 'Post-surgical', 'Running assessment', 'Dr. Jeff Kurtz'],
    hero: {
      headline: 'One-on-one with Dr. Jeff Kurtz',
      sub: 'Kinetic Physical Therapy at 241 Plaza Drive is licensed, one-on-one care under clinic director Dr. Jeff Kurtz. Orthopedic and sports cases, post-surgical protocols, vestibular and balance work, concussion management, running assessments, and blood flow restriction. Hip replacement, rotator cuff tendonitis, muscle strain, and ACL reconstruction are the visits Collegeville actually books.',
      glassFloat: { title: 'Collegeville', sub: 'Dr. Jeff Kurtz, clinic director' },
    },
    offerings: {
      heading: 'The cases the Collegeville clinic actually takes',
      items: [
        {
          title: 'Orthopedic and sports',
          text: 'Rotator cuff, muscle strain, ACL reconstruction, the Ursinus athlete, the trail runner. A licensed therapist stays in the hour. You are not handed to an aide for the work that was supposed to be skilled care.',
        },
        {
          title: 'Post-surgical and joint replacement',
          text: 'Hip replacement, total knee, the protocol after the surgeon is done. Dr. Kurtz and Brandon Vattima work the plan in the room, not as a gym pass with occasional check-ins.',
        },
        {
          title: 'Vestibular, concussion, running, BFR',
          text: 'Balance and inner-ear cases. Concussion management. Running assessments. Blood flow restriction. Soft tissue mobilization and ergonomic work when the desk did the damage.',
        },
      ],
    },
    story: {
      heading: 'Collegeville, one patient at a time',
      paragraphs: [
        'Kinetic PT has clinics across Chester and Montgomery. Collegeville is the Plaza Drive room for the Ursinus / Perkiomen Creek community. Dr. Jeff Kurtz directs it. One-on-one is the method: a licensed therapist, an hour that is not split across three patients.',
        'Call 610-424-1100. Bring the operative report, the dizzy spells, or the mileage that started to hurt. Office workers, college athletes, and active seniors sit in the same clinic because the case types were built that way. Manual therapy and therapeutic exercise stay in the hour with you.',
      ],
    },
    experience: {
      heading: 'How a Kinetic hour actually runs',
      items: [
        {
          title: 'One-on-one with a licensed therapist',
          text: 'The hour is skilled care. Dr. Kurtz or another licensed therapist stays with you. Collegeville is not a mill.',
        },
        {
          title: 'Treat the named case',
          text: 'Orthopedic, sports, post-surgical, vestibular, concussion, running, blood flow restriction. The plan matches what you walked in with.',
        },
        {
          title: 'Work inside the Ursinus community',
          text: '241 Plaza Drive. Neighbors, athletes, and post-op patients from the same creek towns, not a unit in a regional mill.',
        },
      ],
    },
    feature: {
      heading: 'Licensed, one-on-one, the cases on the door',
      text: 'Hip replacement. Rotator cuff. ACL. Vestibular. Concussion. Running assessment. Blood flow restriction. Behind each door is a licensed therapist and an hour that belongs to you. Dr. Jeff Kurtz directs the Collegeville clinic.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Dr. Jeff Kurtz directs the clinic',
      text: 'Collegeville has a named director. Kinetic Physical Therapy still sells one-on-one licensed care to the Ursinus / Perkiomen Creek community, with Brandon Vattima on the floor alongside him.',
      ctaLabel: 'Collegeville location',
    },
    catalog: {
      items: [
        {
          title: 'Orthopedic and sports',
          text: 'Rotator cuff, muscle strain, ACL, and the running athlete, one-on-one in Collegeville.',
        },
        {
          title: 'Post-surgical',
          text: 'Hip and knee replacement protocols with a licensed therapist in the room.',
        },
        {
          title: 'Vestibular and concussion',
          text: 'Balance, inner ear, concussion, running assessments, and blood flow restriction.',
        },
      ],
    },
    contact: { heading: 'Plaza Drive, Collegeville', sub: '' },
  },
  {
    slug: 'accurate-temperature',
    name: 'Accurate Temperature',
    city: 'Morrisville',
    category: 'HVAC',
    vertical: 'home-services',
    schemaType: 'HVACBusiness',
    url: 'https://accuratetemperatures.com/',
    phone: '215-917-2115',
    address: '810 Rennard Lane, Morrisville, PA 19067',
    hours: '',
    attitude: 'industrial',
    palette: {
      paper: '#EEF0F4',
      ink: '#10162C',
      accent: '#2B5AA8',
      accent2: '#E07A2A',
      panel: '#D5D9E2',
      deep: '#10162C',
    },
    fonts: { display: 'Barlow Condensed', text: 'IBM Plex Sans' },
    craft: 'heating and air',
    description:
      'Jeff Taylor\'s HVAC shop in Morrisville. 30+ years. Trane and Carrier. Heat pumps, oil-to-gas, oil-to-heat-pump, boilers, condensing furnaces. Residential and light commercial. Bucks, Montgomery, Philadelphia.',
    marquee: ['Jeff Taylor', 'Trane', 'Carrier', 'Heat pumps', 'Oil to gas'],
    hero: {
      headline: 'Jeff Taylor, Trane and Carrier',
      sub: 'Accurate Temperature is Jeff Taylor\'s Morrisville HVAC shop after more than 30 years in the trade. Residential and light commercial. Trane and Carrier equipment. Heat pumps, oil-to-gas conversions, oil-to-heat-pump, boilers, condensing furnaces, new construction, and retrofit. Same-day service is what neighbors keep praising.',
      glassFloat: { title: 'Morrisville', sub: 'Jeff Taylor, 30+ years' },
    },
    offerings: {
      heading: 'What the Morrisville truck actually does',
      items: [
        {
          title: 'Heat pumps and conversions',
          text: 'Heat pumps for houses getting off oil. Oil-to-gas and oil-to-heat-pump conversions when the old tank has to go. Boilers and condensing furnaces when the house still wants hydronic or a hot-air swap.',
        },
        {
          title: 'Trane and Carrier',
          text: 'Jeff installs and services Trane and Carrier. New construction and retrofit both come off the same Morrisville shop, so a replacement and a first-time system talk to the same person.',
        },
        {
          title: 'Three-county service, same-day when it fails',
          text: 'Bucks, Montgomery, and Philadelphia. Neighbors call 215-917-2115 when the house will not heat or cool and they want Jeff\'s truck, not a national dispatch board.',
        },
      ],
    },
    story: {
      heading: 'A Morrisville shop with a name on the truck',
      paragraphs: [
        'Accurate Temperature is Jeff Taylor at 810 Rennard Lane. Thirty-plus years of heating and air, still a person you can reach. Trane and Carrier are the brands on the truck. Heat pumps and oil conversions are the jobs that keep showing up in Bucks and Montgomery as tanks die.',
        'Light commercial sits next to the residential calls. A condensing furnace swap and a rooftop repair can live in the same week. Same-day service is the reputation, earned on houses that were actually cold when he showed up.',
      ],
    },
    experience: {
      heading: 'How an Accurate Temperature visit actually runs',
      items: [
        {
          title: 'Talk to Jeff\'s shop',
          text: 'You are calling a Morrisville HVAC company, not a national call center that resells the job. Describe the heat pump, the boiler, or the furnace that quit.',
        },
        {
          title: 'Repair, convert, or replace',
          text: 'Trane and Carrier gear, oil-to-gas, oil-to-heat-pump, boilers, condensing furnaces. The visit matches the system that is failing.',
        },
        {
          title: 'Stay inside the three counties',
          text: 'Bucks, Montgomery, Philadelphia. If the house is on that map, it is inside the work the truck claims.',
        },
      ],
    },
    feature: {
      heading: 'Heat pumps, oil conversions, named brands',
      text: 'Jeff Taylor has been doing this more than 30 years. Trane and Carrier. Heat pumps and oil-to-gas when the tank has to go. Boilers and condensing furnaces when the house still wants fire. Same-day when the system is down.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Rennard Lane is the base',
      text: '810 Rennard Lane in Morrisville. The truck leaves for Bucks, Montgomery, and Philadelphia and comes back to Jeff\'s shop. Heating and air with a person on the invoice.',
      ctaLabel: 'Talk to the shop',
    },
    catalog: {
      items: [
        {
          title: 'Heat pumps',
          text: 'Heat pumps and oil-to-heat-pump conversions for houses getting off the tank.',
        },
        {
          title: 'Trane and Carrier',
          text: 'Install and service, plus boilers and condensing furnaces when the house wants them.',
        },
        {
          title: 'Oil-to-gas',
          text: 'Oil-to-gas conversions and same-day emergency heat from the Morrisville shop.',
        },
      ],
    },
    contact: { heading: 'Rennard Lane, Morrisville', sub: '' },
  },
  {
    slug: 'narberth-pizza',
    name: 'Narberth Pizza',
    city: 'Narberth',
    category: 'Pizza and steaks',
    vertical: 'food',
    schemaType: 'Restaurant',
    url: 'https://www.narberthpizza.com/',
    phone: '610-668-2230',
    address: '940 Montgomery Ave, Narberth, PA 19072',
    hours: 'Mon-Sat 11am-9pm Sunday 12pm-9pm',
    attitude: 'warm',
    palette: {
      paper: '#F6EFE4',
      ink: '#2A140C',
      accent: '#C43C14',
      accent2: '#E6B422',
      panel: '#E4D4C0',
      deep: '#1A0E0A',
    },
    fonts: { display: 'Anton', text: 'Nunito' },
    craft: 'pizza and steaks',
    description:
      'Pizza and steaks across from the Wawa on Montgomery Avenue. Narberth pie, Meat Loves, Buffalo Chicken, cheesesteaks, pizza steaks, calzones, hoagies, pizza fries.',
    marquee: ['Narberth pie', 'Cheesesteaks', 'Buffalo Chicken', 'Pizza fries', 'Across from Wawa'],
    hero: {
      headline: 'The Narberth pie, then a steak',
      sub: 'Narberth Pizza cooks on Montgomery Avenue, across from the Wawa. The house pie is pepperoni, mushrooms, green pepper, and onion. Meat Loves, Vegetable, and Buffalo Chicken sit next to it. Steaks run cheesesteak, pizza steak, BBQ, buffalo, and mushroom, plus chicken steaks. The Narberth chicken steak gets jalapeño and fried onions.',
      glassFloat: { title: 'Narberth', sub: 'Across from the Wawa' },
    },
    offerings: {
      heading: 'What the Montgomery Avenue counter actually cooks',
      items: [
        {
          title: 'Named pies',
          text: 'The Narberth is pepperoni, mushrooms, green pepper, and onion. Meat Loves loads the pie. Vegetable keeps it quieter. Buffalo Chicken is the hot one. Calzones fold the same fillings when you want them closed.',
        },
        {
          title: 'Steaks the block reorders',
          text: 'Cheesesteak, pizza steak, BBQ, buffalo, and mushroom steaks. Chicken steaks for the other side of the board. The Narberth chicken steak comes with jalapeño and fried onions. Regulars call the steaks the reason they keep the number.',
        },
        {
          title: 'Hoagies, pizza fries, delivery',
          text: 'Hoagies and pizza fries fill the rest of the ticket. The owner works the counter. Delivery leaves fast from 940 Montgomery Ave, the shop across from the Wawa.',
        },
      ],
    },
    story: {
      heading: 'A Narberth shop with a named pie',
      paragraphs: [
        'Montgomery Avenue already has this counter memorized. You walk in for the Narberth pie or you call 610-668-2230 for a cheesesteak and pizza fries. The owner is often on the floor. Neighbors talk about steaks that actually taste like a shop that cares, and delivery that shows up while the fries are still loud.',
        'Monday through Saturday the door runs 11am to 9pm. Sunday opens at noon. A ticket can hold a Buffalo Chicken pie and a pizza steak in the same bag. Calzones and hoagies ride along when the table is bigger than a movie night.',
      ],
    },
    experience: {
      heading: 'How a Narberth order actually happens',
      items: [
        {
          title: 'Pick the pie by name',
          text: 'Narberth, Meat Loves, Vegetable, or Buffalo Chicken. A plain pie works if you already know the toppings. Calzones if you want it folded.',
        },
        {
          title: 'Add the steak',
          text: 'Cheesesteak, pizza steak, BBQ, buffalo, mushroom, or the Narberth chicken steak with jalapeño and fried onions. The steaks are why a lot of the block came back.',
        },
        {
          title: 'Grab hoagies or pizza fries',
          text: 'Hoagies and pizza fries round the bag. Pickup at the counter across from the Wawa, or send the same kitchen out for delivery.',
        },
      ],
    },
    feature: {
      heading: 'Pizza and steaks with actual names',
      text: 'The Narberth pie is pepperoni, mushrooms, green pepper, and onion. The steaks include a jalapeño chicken steak the shop named after the town. Pizza fries and hoagies fill the rest of a Montgomery Avenue night.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Across from the Wawa, owner on the counter',
      text: '940 Montgomery Ave is the shop you can see from the Wawa lot. The owner works the counter. Call in the Narberth pie and a cheesesteak and the bag is usually moving before you hang up.',
      ctaLabel: 'See the shop',
    },
    catalog: {
      items: [
        {
          title: 'The Narberth pie',
          text: 'Pepperoni, mushrooms, green pepper, and onion. Meat Loves, Vegetable, and Buffalo Chicken sit beside it.',
        },
        {
          title: 'Cheesesteaks and pizza steaks',
          text: 'Cheesesteak, pizza steak, BBQ, buffalo, mushroom, plus the Narberth chicken steak with jalapeño.',
        },
        {
          title: 'Pizza fries and hoagies',
          text: 'The rest of a neighborhood ticket, packed at the counter across from the Wawa.',
        },
      ],
    },
    contact: { heading: 'Montgomery Avenue', sub: '' },
  },
  {
    slug: 'belle-palace-nail-spa',
    name: 'Belle Palace Nail Spa',
    city: 'Warrington',
    category: 'Nail spa',
    vertical: 'beauty',
    schemaType: 'BeautySalon',
    url: 'https://bellepalacewarrington.com/',
    phone: '215-798-7777',
    address: '1509 Main St, Warrington, PA 18976',
    hours: 'Mon-Fri 10am-7:30pm Sat 9:30am-6pm Sun 10am-4pm',
    attitude: 'glass',
    palette: {
      paper: '#F7F2F4',
      ink: '#2A1820',
      accent: '#C45C7A',
      accent2: '#E8C4A0',
      panel: '#EDE4E8',
      deep: '#1A1014',
    },
    fonts: { display: 'Cormorant Garamond', text: 'Jost' },
    craft: 'nail spa care',
    description:
      'Nail spa on Main Street in Warrington. Dip, gel, acrylic, Gel X, BIAB, pedicure, waxing, lashes, kids. Large shop, many techs.',
    marquee: ['Dip', 'Gel X', 'BIAB', 'Acrylic', 'Pedicure', 'Lashes'],
    hero: {
      headline: 'Dip, Gel X, BIAB, acrylic',
      sub: 'Belle Palace Nail Spa is the big shop at 1509 Main St in Warrington. Dip, gel, acrylic, Gel X, and BIAB are the nail work. Pedicures, waxing, and lashes sit in the same room. Kids get chairs too. Many techs, so a Saturday pedicure and a Gel X set can happen without turning the visit into a hostage situation.',
      glassFloat: { title: 'Warrington', sub: 'Dip, Gel X, BIAB' },
    },
    offerings: {
      heading: 'What the Warrington chairs actually do',
      items: [
        {
          title: 'Dip, gel, acrylic, Gel X, BIAB',
          text: 'Dip powder for the set that has to last. Gel for the shine. Acrylic when you want length. Gel X and BIAB for the newer overlays people keep asking for. Pick the system, sit the chair, leave with nails that match the appointment you booked.',
        },
        {
          title: 'Pedicure, waxing, lashes',
          text: 'Pedicures run beside the nail tables. Waxing and lash work live in the same spa, so you are not driving Main Street twice for brows and a fill.',
        },
        {
          title: 'Kids and a shop that can take a crowd',
          text: 'Kids chairs are on the books. The floor has enough techs that a family Saturday is the point of a large Warrington spa, not a problem.',
        },
      ],
    },
    story: {
      heading: 'Main Street, a lot of techs, the sets people ask for',
      paragraphs: [
        'Belle Palace is the Warrington nail spa you book when you already know you want dip or Gel X, not a mystery "spa manicure." Weekdays run 10am to 7:30pm. Saturday opens at 9:30am. Sunday is shorter. Call 215-798-7777 and take the chair.',
        'People come for acrylic length, for BIAB, for a pedicure that is actually a pedicure, and for lashes on the same trip. The shop is large on purpose. You can hear more than one drill at once, which is how a Main Street spa keeps the wait from eating the afternoon.',
      ],
    },
    experience: {
      heading: 'How a Belle Palace visit actually goes',
      items: [
        {
          title: 'Book the set by name',
          text: 'Dip, gel, acrylic, Gel X, or BIAB. Say the system when you book so the tech is ready for that overlay, not a generic polish change.',
        },
        {
          title: 'Add pedicure, wax, or lashes',
          text: 'Feet, brows, and lashes can live in the same visit as the fill. Kids can sit too.',
        },
        {
          title: 'Leave from Main Street',
          text: '1509 Main St is the door. Many techs, one spa, nails that match the appointment you actually asked for.',
        },
      ],
    },
    feature: {
      heading: 'The Warrington shop for Gel X and dip',
      text: 'Dip, gel, acrylic, Gel X, BIAB. Pedicure, waxing, lashes, kids. Belle Palace is a large Main Street spa with enough chairs that Saturday is still possible.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Book the overlay, not a mystery manicure',
      text: 'Say Gel X or BIAB or dip when you call. The techs already do those sets. Weekdays until 7:30pm. Saturday from 9:30am. Sunday still open.',
      ctaLabel: 'Book',
    },
    catalog: {
      items: [
        {
          title: 'Dip and gel',
          text: 'Dip powder and gel sets in the Warrington spa, built to last past the weekend.',
        },
        {
          title: 'Gel X, BIAB, acrylic',
          text: 'Overlays and length from techs who already run those systems every day.',
        },
        {
          title: 'Pedicure, wax, lashes',
          text: 'Feet, waxing, and lash work in the same Main Street shop, with chairs for kids.',
        },
      ],
    },
    contact: { heading: 'Main Street, Warrington', sub: '' },
  },
  {
    slug: 'smile-culture-dental',
    name: 'Smile Culture Dental',
    city: 'Huntingdon Valley',
    category: 'Dentistry',
    vertical: 'healthcare',
    schemaType: 'Dentist',
    url: 'https://smileculture.com/huntingdon-valley/',
    phone: '267-715-7373',
    address: '2150 E County Line Rd, Huntingdon Valley, PA 19006',
    hours: 'Mon 9AM-7PM Tue 9AM-5PM Wed-Thu 8AM-5PM Friday 8AM-2PM',
    attitude: 'align',
    palette: {
      paper: '#F5F7F8',
      ink: '#143038',
      accent: '#2BB5A0',
      accent2: '#C4A35A',
      panel: '#DCE8E6',
      deep: '#0F2428',
    },
    fonts: { display: 'Plus Jakarta Sans', text: 'DM Sans' },
    craft: 'dentistry',
    description:
      'Smiles Elevated By Kindness, Comfort, & Transparency. Exams, cleanings, fillings, implants, veneers, Invisalign. New patient cleaning, exam, and x-ray offer. Doctors Boghara, Parikh, Taee, Dudhat.',
    marquee: [
      'Kindness',
      'Comfort',
      'Transparency',
      'Implants',
      'Veneers',
      'Invisalign',
      'Huntingdon Valley',
    ],
    hero: {
      headline: 'Smiles Elevated By Kindness, Comfort, & Transparency.',
      sub: 'Smile Culture Dental in Huntingdon Valley uses that headline on purpose. Kindness, comfort, and transparency are the way the office wants the chair to feel. The work is exams, cleanings, fillings, implants, veneers, and Invisalign. Doctors Boghara, Parikh, Taee, and Dudhat are the named clinicians. New patients can take a cleaning, exam, and x-ray offer.',
      glassFloat: { title: 'Huntingdon Valley', sub: 'Kindness, comfort, transparency' },
    },
    offerings: {
      heading: 'Care they put on the Huntingdon Valley page',
      items: [
        {
          title: 'Exams, cleanings, fillings',
          text: 'Everyday dentistry starts here. Exams, cleanings, and fillings are how the office keeps a mouth on a known plan, with kindness, comfort, and transparency as the published standard.',
        },
        {
          title: 'Implants, veneers, Invisalign',
          text: 'Implants, veneers, and Invisalign are the larger cases. Smile Culture keeps them in the same Huntingdon Valley practice as the cleaning, so a bigger plan does not send you to a stranger.',
        },
        {
          title: 'New patient cleaning, exam, and x-ray',
          text: 'New patients are offered a cleaning, exam, and x-ray. The offer is the on-ramp. Doctors Boghara, Parikh, Taee, and Dudhat are the people who then do the work.',
        },
      ],
    },
    story: {
      heading: 'Their headline, their doctors',
      paragraphs: [
        'Smile Culture Dental prints a long headline and means it: Smiles Elevated By Kindness, Comfort, & Transparency. The Huntingdon Valley office is where that sentence has to survive an exam, a filling, an implant consult, a veneer plan, or Invisalign. Doctors Boghara, Parikh, Taee, and Dudhat are the names on the work.',
        'A new patient can start with a cleaning, exam, and x-ray offer. After that the chart can hold everyday dentistry or the larger cases. County Line Road is the address. The hours from their page run later on Monday and shorter on Friday. Transparency includes those clocks.',
      ],
    },
    experience: {
      heading: 'How care actually starts here',
      items: [
        {
          title: 'Enter through exam and cleaning',
          text: 'New patients can take the cleaning, exam, and x-ray offer. Returning patients keep exams, cleanings, and fillings on a regular chair.',
        },
        {
          title: 'Step up to implants, veneers, or Invisalign',
          text: 'When the case is larger, the same practice plans implants, veneers, or Invisalign. You stay with Smile Culture Dental in Huntingdon Valley.',
        },
        {
          title: 'See a named doctor',
          text: 'Doctors Boghara, Parikh, Taee, and Dudhat are the clinicians. Kindness, comfort, and transparency are the standard they put on that chair time.',
        },
      ],
    },
    feature: {
      heading: 'Kindness, comfort, and transparency in the chair',
      text: 'The headline is the method. Exams and implants both have to survive those three words. Smile Culture Dental in Huntingdon Valley is the office that published them.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'A new patient offer with a full practice behind it',
      text: 'The cleaning, exam, and x-ray offer is how a new chart starts. Behind it sit fillings, implants, veneers, Invisalign, and four named doctors. The offer is an on-ramp, not the whole practice.',
      ctaLabel: 'Huntingdon Valley',
    },
    catalog: {
      items: [
        {
          title: 'Exams and cleanings',
          text: 'Everyday dentistry, including a new patient cleaning, exam, and x-ray offer.',
        },
        {
          title: 'Implants and veneers',
          text: 'Larger restorative and cosmetic cases inside the same Huntingdon Valley practice.',
        },
        {
          title: 'Invisalign',
          text: 'Invisalign planned by Doctors Boghara, Parikh, Taee, and Dudhat.',
        },
      ],
    },
    contact: { heading: 'East County Line Road', sub: '' },
  },
  {
    slug: 'macks-hair-studio',
    name: "Mack's Hair Studio",
    city: 'Philadelphia',
    category: 'Hair studio',
    vertical: 'beauty',
    schemaType: 'HairSalon',
    url: 'https://www.mackshairstudio.com/',
    phone: '',
    address: '271 S 10th St, Philadelphia, PA 19107',
    hours: '',
    attitude: 'brutal',
    palette: {
      paper: '#F3EEE6',
      ink: '#161616',
      accent: '#111111',
      accent2: '#E8C547',
      panel: '#D8D2C8',
      deep: '#0E0E0E',
    },
    fonts: { display: 'Archivo Black', text: 'Inter' },
    craft: 'haircutting',
    description:
      'Center City hair studio on South 10th. Haircuts from $45, women\'s cuts from $35, haircut and dye around $100. Color and cut in the same chair.',
    marquee: ['Haircut', 'Dye', 'Haircut and dye', 'South 10th', 'Center City'],
    hero: {
      headline: 'Cut and dye on South 10th',
      sub: 'Mack\'s Hair Studio sits at 271 S 10th St in Center City, a short walk from Washington Square. A haircut is about 45 minutes and starts at $45. Women\'s cuts start at $35. Haircut and dye is the longer chair, about an hour and a half, listed around $100 when you want a new shade with the cut.',
      glassFloat: { title: 'Center City', sub: 'Cut, dye, South 10th' },
    },
    offerings: {
      heading: 'What the South 10th chair actually does',
      items: [
        {
          title: 'Haircut',
          text: 'Forty-five minutes in the chair. Men\'s cuts start at $45. Women\'s cuts start at $35 depending on what is getting done. You walk in for the shape, not a mall trim that grows out angry in a week.',
        },
        {
          title: 'Dye',
          text: 'Color lives in the same studio. Pick a shade, sit for the dye, leave with hair that matches the cut instead of fighting it.',
        },
        {
          title: 'Haircut and dye together',
          text: 'The combo is the appointment people book when they want both in one visit. About 90 minutes. Around $100. Cut and color from one chair on South 10th so you are not splitting the day across two salons.',
        },
      ],
    },
    story: {
      heading: 'A Center City studio, two services that actually matter',
      paragraphs: [
        'Mack\'s Hair Studio is a small room on South 10th, close enough to Washington Square that you can walk off the cut. The studio sells haircuts, dye, and the combined chair. Squire lists those three, and those three are the visit.',
        'Center City already has loud salons. This one is a studio: sit down, get the shape, get the color if you came for it, walk back toward the square. Bring the reference photo. Leave with hair that looks like the appointment you booked.',
      ],
    },
    experience: {
      heading: 'How a Mack\'s visit actually runs',
      items: [
        {
          title: 'Come to South 10th',
          text: '271 S 10th St, Philadelphia. The work starts in the room, not on a phone tree.',
        },
        {
          title: 'Sit for the cut',
          text: 'Forty-five minutes. $45 for a haircut, $35 to start for a women\'s cut. Shape first.',
        },
        {
          title: 'Add dye when you want the shade',
          text: 'Dye alone, or haircut and dye for about 90 minutes around $100. One studio, both services.',
        },
      ],
    },
    feature: {
      heading: 'Cut, dye, or both',
      text: 'Mack\'s Hair Studio on South 10th is a Center City chair for a haircut, a dye, or the combined appointment. Prices start where the studio listed them: $35, $45, and about $100 for cut and color together.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Washington Square is the walk after',
      text: 'Finish the cut, walk toward the square. The studio is small on purpose. Haircut, dye, haircut and dye. Book the chair that matches the hair you want to leave with.',
      ctaLabel: 'Official site',
    },
    catalog: {
      items: [
        {
          title: 'Haircut',
          text: 'About 45 minutes. Starts at $45, women\'s cuts from $35, on South 10th Street.',
        },
        {
          title: 'Dye',
          text: 'Color in the same Center City studio as the cut.',
        },
        {
          title: 'Haircut and dye',
          text: 'About 90 minutes, around $100, when you want the shade and the shape in one visit.',
        },
      ],
    },
    contact: { heading: 'South 10th Street', sub: '' },
  },
  {
    slug: 'heart-and-soul-tattoo',
    name: 'Heart and Soul Tattoo',
    city: 'East Greenville',
    category: 'Tattoo shop',
    vertical: 'tattoo',
    schemaType: 'LocalBusiness',
    url: 'https://heartandsoultattoos.com/',
    phone: '215-679-3775',
    address: '205 Main Street, East Greenville, PA 18041',
    hours: 'Mon 12pm-5pm Tue-Sat 12pm-7pm Sun 12pm-5pm',
    attitude: 'brutal',
    palette: {
      paper: '#EDE8E0',
      ink: '#141414',
      accent: '#8B1E1E',
      accent2: '#C4A574',
      panel: '#D4CCC2',
      deep: '#0C0C0C',
    },
    fonts: { display: 'Oswald', text: 'Work Sans' },
    craft: 'tattoo work',
    description:
      'Tattoo shop in East Greenville. Black & Grey, American Traditional, cover ups, re-works. $100 shop minimum, cash only. Artists Scott Wilgeroth, Sam Vanderberg, Kevin Walker, Josh Hernandez.',
    marquee: ['Black & Grey', 'American Traditional', 'Cover ups', 'Cash only', '$100 minimum'],
    hero: {
      headline: 'Black & Grey, American Traditional, cover ups',
      sub: 'Heart and Soul Tattoo is a shop on Main Street in East Greenville. The work they name is Black & Grey, American Traditional, cover ups, and re-works. The shop minimum is $100. The shop is cash only. The artists are Scott Wilgeroth, Sam Vanderberg, Kevin Walker, and Josh Hernandez.',
      glassFloat: { title: 'East Greenville', sub: 'Cash only, $100 minimum' },
    },
    offerings: {
      heading: 'What the shop will actually tattoo',
      items: [
        {
          title: 'Black & Grey and American Traditional',
          text: 'Those two styles are the published lanes. You come to Heart and Soul for Black & Grey or American Traditional, done by the artists on the wall.',
        },
        {
          title: 'Cover ups and re-works',
          text: 'Cover ups and re-works are shop work, not a favor. An old tattoo can be the reason you sit, and the shop treats that as a named service.',
        },
        {
          title: 'Cash only, $100 minimum',
          text: 'The shop minimum is $100. Payment is cash only. Those rules are theirs. Bring cash, and do not expect a $40 walk-in butterfly to clear the floor.',
        },
      ],
    },
    story: {
      heading: 'Main Street, four artists',
      paragraphs: [
        'Heart and Soul Tattoo puts the rules on the table. Black & Grey. American Traditional. Cover ups. Re-works. One hundred dollars to sit. Cash only. Scott Wilgeroth, Sam Vanderberg, Kevin Walker, and Josh Hernandez are the artists. East Greenville is the town. 205 Main Street is the door.',
        'A tattoo shop that publishes a minimum and a cash rule is doing you a favor. You know how to arrive. You know what styles they will stand behind. You know the names of the people who will do the work. Hours from their site run noon to 5pm Monday and Sunday, noon to 7pm Tuesday through Saturday.',
      ],
    },
    experience: {
      heading: 'How a sit at the shop actually works',
      items: [
        {
          title: 'Pick a published style',
          text: 'Black & Grey, American Traditional, a cover up, or a re-work. Those are the lanes. You talk the idea inside what the shop already does.',
        },
        {
          title: 'Sit with a named artist',
          text: 'Scott Wilgeroth, Sam Vanderberg, Kevin Walker, or Josh Hernandez. The tattoo is done by one of those four, in the East Greenville shop.',
        },
        {
          title: 'Clear the shop minimum in cash',
          text: 'The floor is $100. The till is cash only. You come ready for both, or you do not sit.',
        },
      ],
    },
    feature: {
      heading: 'Styles, artists, rules',
      text: 'Black & Grey and American Traditional are the styles. Cover ups and re-works are the repair work. Four named artists. Cash only. $100 minimum. Heart and Soul Tattoo is that list, on Main Street.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'The artists are the shop',
      text: 'Scott Wilgeroth, Sam Vanderberg, Kevin Walker, and Josh Hernandez are not decorations on a landing page. They are who tattoos at 205 Main Street. You sit with one of them.',
      ctaLabel: 'See the shop',
    },
    catalog: {
      items: [
        {
          title: 'Black & Grey',
          text: 'A published style at Heart and Soul Tattoo in East Greenville.',
        },
        {
          title: 'American Traditional',
          text: 'The other published lane, next to cover ups and re-works.',
        },
        {
          title: 'Cash only, $100 minimum',
          text: 'Shop rules from their site. Bring cash. Stay at or above the $100 minimum.',
        },
      ],
    },
    contact: { heading: 'Main Street, East Greenville', sub: '' },
  },
  {
    slug: 'malvern-vision',
    name: 'Malvern Vision Care',
    city: 'Malvern',
    category: 'Optometry',
    vertical: 'healthcare',
    schemaType: 'Optician',
    url: 'https://www.malvernvision.com/',
    phone: '610-644-1879',
    address: '32 W King St, Malvern, PA 19355',
    hours: '',
    attitude: 'editorial',
    palette: {
      paper: '#F4F1EA',
      ink: '#1A2430',
      accent: '#2B5F8A',
      accent2: '#C4A35A',
      panel: '#DCE2E8',
      deep: '#12202C',
    },
    fonts: { display: 'Fraunces', text: 'Source Sans 3' },
    craft: 'optometry',
    description:
      'Optometry on West King Street in Malvern. Eye exams, contact fittings, frames. Off-street parking. Call 610-644-1879.',
    marquee: ['Eye exams', 'Contacts', 'Frames', 'West King Street', 'Malvern'],
    hero: {
      headline: 'Exams, contacts, frames on King Street',
      sub: 'Malvern Vision Care is the optometry office at 32 W King St. You sit for a full exam, you leave with a contact fitting or a pair of frames from the same room, and you park off-street instead of hunting a meter. Call 610-644-1879 and take the chair. Patients keep the doctor and the technician because they explain the options without rushing the prescription.',
      glassFloat: { title: 'Malvern', sub: 'Exams, contacts, frames' },
    },
    offerings: {
      heading: 'What the King Street office actually does',
      items: [
        {
          title: 'Eye exams',
          text: 'A real optometric exam, not a glasses vending machine with a poster. The chart starts here. Kids and adults both sit. The doctor walks the findings so you know why the prescription changed.',
        },
        {
          title: 'Contact fittings',
          text: 'Contacts are fitted in the same office that did the exam. The prescription becomes a lens you can wear, without shipping the Rx across town to a warehouse.',
        },
        {
          title: 'Frames on the wall',
          text: 'Pick frames after the exam, in the same Malvern room. The technician will lay out the options against how you actually use the glasses: desk, drive, sun, the pair you already destroy.',
        },
      ],
    },
    story: {
      heading: 'West King Street optometry, no mall energy',
      paragraphs: [
        'Malvern Vision Care is a King Street practice: exam first, then contacts or frames. People come back for a second and third pair because the technician talks through coatings and lens types like an adult. Off-street parking sits with the office, which matters on a borough street.',
        'Call 610-644-1879 for the appointment. Confirm hours when you book, because the clock has moved in listings. The work has not: exams, contacts, frames, a doctor and a tech who stay on the chart.',
      ],
    },
    experience: {
      heading: 'How a Malvern vision visit actually moves',
      items: [
        {
          title: 'Sit for the exam',
          text: 'The medical work comes first. Malvern Vision Care starts with the eyes, then talks about what you will wear.',
        },
        {
          title: 'Fit contacts when that is the path',
          text: 'If the prescription is for lenses on the eye, the same office handles the fitting and the supply.',
        },
        {
          title: 'Choose frames before you leave',
          text: 'The wall is in the same room. Exam and frames can be one King Street visit.',
        },
      ],
    },
    feature: {
      heading: 'One Malvern office for the whole prescription',
      text: 'Eye exam, contact fitting, frames on the wall. Off-street parking. A technician who will actually explain the lens. Malvern Vision Care on West King Street is that visit.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Call, then sit',
      text: '610-644-1879 is the number. Confirm the day\'s hours when you book. The chair is for exams, contacts, and frames, not a mystery specialty clinic bolted on for a brochure.',
      ctaLabel: 'Confirm on their site',
    },
    catalog: {
      items: [
        {
          title: 'Eye exams',
          text: 'Optometric exams at 32 W King St, with a doctor who stays on the findings.',
        },
        {
          title: 'Contacts',
          text: 'Fittings and lenses from the same practice that did the exam.',
        },
        {
          title: 'Frames',
          text: 'Frames chosen in the Malvern office, with a technician who will walk the options.',
        },
      ],
    },
    contact: { heading: 'West King Street', sub: '' },
  },
  {
    slug: 'kevin-t-coyne',
    name: 'Kevin T. Coyne, Esq.',
    city: 'Media',
    category: 'Criminal defense, probate, wills, estates',
    vertical: 'legal',
    schemaType: 'Attorney',
    url: 'https://kevintcoyneattorney.com/',
    phone: '610-833-2300',
    address: '12 Veterans Square, 1st Floor, Media, PA 19063',
    hours: '8AM-5PM',
    attitude: 'editorial',
    palette: {
      paper: '#F4F0E8',
      ink: '#1A2430',
      accent: '#1B4F8A',
      accent2: '#C4A35A',
      panel: '#DCE3EA',
      deep: '#0E1C2A',
    },
    fonts: { display: 'Libre Baskerville', text: 'Source Sans 3' },
    craft: 'criminal defense and estate law',
    description:
      'Kevin T. Coyne, Esq. Media. Former Delaware County Assistant Public Defender since 1991. Criminal defense, personal injury, workers\' comp, wills, estates, guardianship, PFA defense. Contingency on injury files.',
    marquee: ['Criminal defense', 'Personal injury', 'Wills', 'Estates', 'Since 1991'],
    hero: {
      headline: 'Public defender spine, private files',
      sub: 'Kevin T. Coyne opened in 1991 as a Delaware County Assistant Public Defender and still takes the criminal file personally from 12 Veterans Square in Media. Personal injury, workers\' compensation, wills, probate, estates, Orphans\' Court guardianship, and Protection From Abuse defense sit in the same office. Injury work runs on contingency. He will travel any Pennsylvania county the case needs.',
      glassFloat: { title: 'Media', sub: 'Former Assistant Public Defender' },
    },
    offerings: {
      heading: 'The files this office actually takes',
      items: [
        {
          title: 'Criminal defense',
          text: 'Charges, DUI, and the caption that has to be answered in Delaware County. A former Assistant Public Defender already knows that courthouse from the other side of the table.',
        },
        {
          title: 'Personal injury and workers\' comp',
          text: 'Car wrecks, slip and falls, workplace injuries. Arbitration when damages sit under $50,000. Contingency means you do not pay a retainer to start the injury file. He also handles medical malpractice and premises claims when the facts support them.',
        },
        {
          title: 'Wills, estates, PFA, guardianship',
          text: 'Wills while everyone is alive. Probate and estates after. Orphans\' Court guardianship. Defense on a Protection From Abuse petition. One lawyer, not a department that hands you to a clerk.',
        },
      ],
    },
    story: {
      heading: 'Veterans Square, one lawyer since 1991',
      paragraphs: [
        'Kevin started as an assistant public defender in 1991, kept a private practice on the side, then put the firm on Veterans Square in Media. Thirty-plus years later the criminal file and the will still get the same person. Chester, Montgomery, and Philadelphia counties are in range. He will go wherever in Pennsylvania the caption sits.',
        'Families hire him because the injury claim and the estate can live next to the criminal matter without a new intake team. Office hours run 8am to 5pm. Call 610-833-2300. You are hiring Kevin T. Coyne, not a billboard firm.',
      ],
    },
    experience: {
      heading: 'How the work actually starts',
      items: [
        {
          title: 'Bring the criminal matter',
          text: 'The charge and the county come first. A former Delaware County public defender already knows how that courthouse moves.',
        },
        {
          title: 'Bring the injury or the will',
          text: 'Contingency on most personal injury files. Wills get written while everyone is alive. Probate is the file after. Workers\' comp when the job did the damage.',
        },
        {
          title: 'Work from Veterans Square',
          text: 'First floor, 12 Veterans Square. The lawyer is Kevin. The first call does not get handed to an anonymous team.',
        },
      ],
    },
    feature: {
      heading: 'A defender\'s background, an estates and injury practice',
      text: 'Former Assistant Public Defender, Delaware County, since 1991. Criminal defense with a local spine. Personal injury on contingency. Wills, probate, guardianship, and PFA defense from the same Media office.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'One name on both kinds of file',
      text: 'Criminal court in the morning, a will in the afternoon. Kevin T. Coyne, Esq. practices both from Veterans Square. You are hiring the lawyer.',
      ctaLabel: 'Talk to the office',
    },
    catalog: {
      items: [
        {
          title: 'Criminal defense',
          text: 'Defense work from a former Assistant Public Defender in Delaware County.',
        },
        {
          title: 'Personal injury',
          text: 'Wrecks, falls, workplace injuries. Contingency. Arbitration when the file is under $50,000.',
        },
        {
          title: 'Wills and estates',
          text: 'Wills, probate, guardianship, and PFA defense from 12 Veterans Square.',
        },
      ],
    },
    contact: { heading: 'Veterans Square, first floor', sub: '' },
  },
  {
    slug: 'seiler-and-drury',
    name: 'Seiler+Drury Architecture',
    city: 'Norristown',
    category: 'Architecture',
    vertical: 'architecture',
    schemaType: 'ProfessionalService',
    url: 'https://sdarc.com/',
    phone: '610-272-4809',
    address: '420 DeKalb St, Norristown, PA 19401',
    hours: '',
    attitude: 'industrial',
    palette: {
      paper: '#F2EFE8',
      ink: '#1A1A1A',
      accent: '#3D5A4C',
      accent2: '#C4A35A',
      panel: '#D8D4CC',
      deep: '#121212',
    },
    fonts: { display: 'Outfit', text: 'IBM Plex Sans' },
    craft: 'architecture',
    description:
      'Doug Seiler, AIA, LEED AP. Norristown architecture. Municipal Hall, Montgomery County EOC, Spring City Public Library, Academy of Vocal Arts, Norristown WWTP, Arcadia Health Sciences. Design, preservation, adaptive reuse.',
    marquee: ['Municipal Hall', 'EOC', 'Adaptive reuse', 'Preservation', 'Doug Seiler'],
    hero: {
      headline: 'Municipal Hall, EOC, libraries, reuse',
      sub: 'Seiler+Drury Architecture is Doug Seiler, AIA, LEED AP, working from 420 DeKalb St in Norristown. Built work includes Norristown Municipal Hall, the Montgomery County EOC, Spring City Public Library, the Academy of Vocal Arts, the Waldorf School of Philadelphia, Arcadia\'s Health Sciences Center, and the Norristown wastewater campus. Building design, preservation, sustainable design, adaptive reuse, interiors.',
      glassFloat: { title: 'Norristown', sub: 'Doug Seiler, AIA, LEED AP' },
    },
    offerings: {
      heading: 'The kinds of projects they actually take',
      items: [
        {
          title: 'Civic buildings',
          text: 'Norristown Municipal Hall went from 39,000 to 46,000 square feet under Doug\'s drawings, Georgian on purpose, kept instead of demolished. Montgomery County EOC, Spring City Public Library, Plymouth Township, and the Norristown wastewater labs and blower buildings are the same civic muscle.',
        },
        {
          title: 'Schools and cultural rooms',
          text: 'Academy of Vocal Arts. Waldorf School of Philadelphia. Arcadia University Health Sciences Center, art studios, and black box theatre. Girard College. Montgomery County Community College culinary. Buildings people actually use.',
        },
        {
          title: 'Preservation, reuse, interiors',
          text: 'Adaptive reuse for von C Brewing, Face to Face Germantown, and office interiors for Interdigital and CFAR. BIM, energy work, post-occupancy. The architecture does not stop at the envelope.',
        },
      ],
    },
    story: {
      heading: 'A Norristown firm that already built the town',
      paragraphs: [
        'Doug Seiler has more than 35 years on the boards, New York and New Hampshire before Norristown. Council hired Seiler+Drury to give Municipal Hall another 80 years instead of a new box. The wastewater campus, the EOC addition, and the library work are how a local firm looks when it already knows the township manager.',
        'Clients also come from outside the borough: Camden County Environmental Center, Elmwood Park Zoo\'s event pavilion, L2 Brands, Philly Office Retail. Civic, school, cultural, and reuse from one DeKalb Street office. Call 610-272-4809 when the next building has to stay standing.',
      ],
    },
    experience: {
      heading: 'How an architectural project actually moves',
      items: [
        {
          title: 'Start with the building problem',
          text: 'A new civic hall, a structure to keep, a reuse, or an interior. Seiler+Drury takes it as architecture, not a rendering contest.',
        },
        {
          title: 'Design across the published verbs',
          text: 'Building design, preservation, sustainable design, adaptive reuse, interiors. BIM and energy work in the same Norristown practice.',
        },
        {
          title: 'Look at buildings they have already done',
          text: 'Municipal Hall, the EOC, Spring City Public Library, Academy of Vocal Arts, Arcadia Health Sciences, the wastewater campus. Walk those before hiring the next drawing.',
        },
      ],
    },
    feature: {
      heading: 'Civic and cultural buildings, already built',
      text: 'Norristown Municipal Hall. Montgomery County EOC. Spring City Public Library. Academy of Vocal Arts. Arcadia Health Sciences. Seiler+Drury is the DeKalb Street practice on those jobs, with Doug Seiler as principal-in-charge.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Keep the building, give it 80 more years',
      text: 'Doug\'s line on Municipal Hall. Preservation and adaptive reuse are practice because the portfolio already had to keep structures alive. Sustainable design and interiors sit with them so a project does not split across three firms.',
      ctaLabel: 'See the work',
    },
    catalog: {
      items: [
        {
          title: 'Norristown Municipal Hall',
          text: 'Expansion and renovation, Georgian kept, civic work from Seiler+Drury.',
        },
        {
          title: 'Montgomery County EOC',
          text: 'Named civic work, next to Spring City Public Library and the wastewater campus.',
        },
        {
          title: 'Academy of Vocal Arts',
          text: 'Cultural work alongside Arcadia Health Sciences and the Waldorf School of Philadelphia.',
        },
      ],
    },
    contact: { heading: 'DeKalb Street, Norristown', sub: '' },
  },
];

function assertNoEmDash(brief) {
  const blob = JSON.stringify(brief);
  if (blob.includes('\u2014') || blob.includes('\u2013')) {
    throw new Error(`${brief.slug} contains an em dash or en dash`);
  }
}

function assertExperienceClean(brief) {
  const banned = /call before|hours they publish|a real street|reach .* at \d/i;
  for (const item of brief.experience.items) {
    const line = `${item.title} ${item.text}`;
    if (banned.test(line)) {
      throw new Error(`${brief.slug} experience looks like call/hours/street: ${line}`);
    }
  }
}

function assertNoHedge(brief) {
  const blob = [
    brief.hero.sub,
    ...brief.offerings.items.flatMap((i) => [i.title, i.text]),
    ...brief.story.paragraphs,
    ...brief.experience.items.flatMap((i) => [i.title, i.text]),
    brief.feature.heading,
    brief.feature.text,
    brief.spotlight.heading,
    brief.spotlight.text,
    ...brief.catalog.items.map((i) => i.text),
    brief.contact.sub,
    brief.description,
  ].join('\n');
  const hedge =
    /no invented|claim stays|this page will not|as their locations page|hours stay off|sources disagree|this page just says|this page will say|we cannot verify|invented copy|borrowed dish list|borrowed menu/i;
  const hit = blob.match(hedge);
  if (hit) {
    throw new Error(`${brief.slug} still has research-disclaimer copy: ${hit[0]}`);
  }
  const sentences = blob.split(/(?<=[.!?])\s+/);
  const opener = /^(And|But|Or|It is|Do not|That is|This is)\b/;
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (opener.test(trimmed)) {
      throw new Error(`${brief.slug} banned sentence opener: ${trimmed.slice(0, 80)}`);
    }
  }
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const expected = 25;
  if (SITES.length !== expected) {
    throw new Error(`Expected ${expected} site definitions, got ${SITES.length}`);
  }
  const slugs = new Set();
  const report = [];
  for (const site of SITES) {
    if (slugs.has(site.slug)) throw new Error(`Duplicate slug ${site.slug}`);
    slugs.add(site.slug);
    const brief = assemble(site);
    assertNoEmDash(brief);
    assertExperienceClean(brief);
    assertNoHedge(brief);
    const words = pageWords(brief);
    if (brief.images.length !== 13) {
      throw new Error(`${brief.slug} has ${brief.images.length} images`);
    }
    if (brief.gallery.imageIndexes.join(',') !== '3,4,5,6,7,12') {
      throw new Error(`${brief.slug} gallery indexes are wrong`);
    }
    if (brief.catalog.items.map((i) => i.imageIndex).join(',') !== '9,10,11') {
      throw new Error(`${brief.slug} catalog indexes are wrong`);
    }
    if (brief.noindex !== true || brief.logo !== false) {
      throw new Error(`${brief.slug} noindex/logo flags are wrong`);
    }
    const file = path.join(OUT_DIR, `${brief.slug}.json`);
    fs.writeFileSync(file, `${JSON.stringify(brief, null, 2)}\n`);
    report.push({ slug: brief.slug, words, attitude: brief.attitude, file });
  }
  const written = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.json'));
  if (written.length !== expected) {
    throw new Error(`Expected ${expected} JSON files, found ${written.length}`);
  }
  const bad = report.filter((row) => row.words < 420 || row.words > 650);
  for (const row of report) {
    const mark = row.words < 420 || row.words > 650 ? '  OUT OF RANGE' : '';
    console.log(`${row.slug.padEnd(28)} ${String(row.words).padStart(3)}w  ${row.attitude}${mark}`);
  }
  console.log(`\nWrote ${written.length} briefs to ${OUT_DIR}`);
  if (bad.length) {
    throw new Error(`${bad.length} briefs outside 420-650 words: ${bad.map((b) => `${b.slug}=${b.words}`).join(', ')}`);
  }
}

main();



