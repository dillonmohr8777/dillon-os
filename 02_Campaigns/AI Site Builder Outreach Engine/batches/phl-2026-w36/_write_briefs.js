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
      text: 'The in-house plan is published at $16 a month or $100 a year. It is for people who want Andorra Family Dentistry to cover treatment on a membership the office runs, not a mystery coupon.',
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
          text: 'When a child is sick, the visit happens with the same practice that holds the well-child record. The sick visit is not a separate brand. It is the medical home on a harder day.',
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
          text: 'Flavors are named, not coded. Butter pecan, death by chocolate, moose tracks, cookies & cream, pistachio, and cotton candy are the ones we can stand behind from their list.',
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
      text: 'The shoppe does not hide behind a short seasonal list. Death by chocolate and moose tracks sit next to pistachio and butter pecan. The board is the product, and the product is ice cream.',
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
      'Family and cosmetic dentistry in Phoenixville. Dr. Truong Nguyen. Extractions, whitening, fillings, root canals, crowns, bridges, dentures, implants, emergency care.',
    marquee: ['Family dentistry', 'Cosmetic', 'Implants', 'Emergency care', 'Phoenixville'],
    hero: {
      headline: 'Family and cosmetic dentistry',
      sub: 'Always Dental Care is Dr. Truong Nguyen\'s Phoenixville practice for family and cosmetic dentistry. The chair work covers extractions, whitening, fillings, root canals, crowns, bridges, dentures, and implants. Emergency care is part of the same office, not a separate brand down the road.',
      glassFloat: { title: 'Phoenixville', sub: 'Dr. Truong Nguyen' },
    },
    offerings: {
      heading: 'What the chair actually does',
      items: [
        {
          title: 'Restore the tooth',
          text: 'Fillings, root canals, crowns, and bridges are the restorative core. Dr. Truong Nguyen treats the tooth in front of you so you leave with a plan that matches the damage, not a menu of upsells.',
        },
        {
          title: 'Replace what is gone',
          text: 'Extractions, dentures, and implants handle the teeth that cannot stay. The practice keeps replacement in the same family and cosmetic office that did the exam.',
        },
        {
          title: 'Whiten, and see you in an emergency',
          text: 'Whitening is the cosmetic side of the same chair. Emergency care is listed with the rest of the work, so a broken tooth or a sudden ache has a place to go inside this practice.',
        },
      ],
    },
    story: {
      heading: 'Dr. Truong Nguyen, Egypt Road',
      paragraphs: [
        'Always Dental Care is a family and cosmetic practice in Phoenixville. Dr. Truong Nguyen is the named dentist. The service list is specific: extractions, whitening, fillings, root canals, crowns, bridges, dentures, implants, and emergency care. Those are the verbs the office will stand behind.',
        'Family dentistry here means the same practice can fill a molar on Tuesday and talk implants when a tooth is past saving. Cosmetic work sits next to that, not in a separate spa brand. Emergency care is on the list so the office is usable on the day something breaks.',
      ],
    },
    experience: {
      heading: 'How treatment actually moves',
      items: [
        {
          title: 'Diagnose, then restore',
          text: 'A visit starts with the tooth in front of you. Fillings, root canals, crowns, and bridges are how the practice restores what can be kept.',
        },
        {
          title: 'Extract or replace when needed',
          text: 'Extractions, dentures, and implants are the replacement path. You stay in Dr. Nguyen\'s office for that decision instead of being sent out for the hard part.',
        },
        {
          title: 'Cosmetic and emergency in the same practice',
          text: 'Whitening is scheduled like other chair time. Emergency care is part of the published service list, so urgent dental work has a home here.',
        },
      ],
    },
    feature: {
      heading: 'One practice for the full list',
      text: 'Fillings and implants are not split across two brands. Dr. Truong Nguyen\'s office publishes extractions, whitening, fillings, root canals, crowns, bridges, dentures, implants, and emergency care as one practice.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Family dentistry with a cosmetic chair',
      text: 'The Phoenixville office is family and cosmetic on purpose. A child\'s filling and an adult implant consult can live in the same relationship with the same dentist.',
      ctaLabel: 'See the services',
    },
    catalog: {
      items: [
        {
          title: 'Restorative care',
          text: 'Fillings, root canals, crowns, and bridges in Dr. Truong Nguyen\'s Phoenixville chair.',
        },
        {
          title: 'Implants and dentures',
          text: 'Extractions, dentures, and implants when a tooth cannot be kept.',
        },
        {
          title: 'Whitening and emergency care',
          text: 'Cosmetic whitening and emergency dental care from the same practice.',
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
    description: 'Retail used cars on Frankford Avenue in Philadelphia.',
    marquee: ['Used cars', 'Frankford Ave', 'Retail lot', 'Philadelphia'],
    hero: {
      headline: 'Retail used cars on Frankford Ave',
      sub: 'First Class Auto Land is a used car dealer on Frankford Avenue in Philadelphia. The work is retail used cars, sold from the lot at 4050 Frankford Ave. You come to see the inventory in person, pick a car that is actually on the ground, and deal with the lot that put it there.',
      glassFloat: { title: 'Frankford Ave', sub: 'Used car dealer' },
    },
    offerings: {
      heading: 'What the lot actually sells',
      items: [
        {
          title: 'Retail used cars',
          text: 'The dealer sells used cars at retail. You are buying a vehicle that is on the Frankford Avenue lot, not a brokered maybe from another state. The product is the car in front of you.',
        },
        {
          title: 'A lot you can walk',
          text: 'Retail means you walk the row. First Class Auto Land is set up as a dealer you visit, look at paint and miles, and decide with the car in daylight.',
        },
        {
          title: 'Frankford Avenue inventory',
          text: 'The address is the inventory. 4050 Frankford Ave is where the used cars sit. If a car matters, it matters because it is on that lot.',
        },
      ],
    },
    story: {
      heading: 'A dealer on Frankford',
      paragraphs: [
        'Philadelphia already has plenty of used-car promises. First Class Auto Land keeps the claim small: retail used cars on Frankford Avenue. The lot is the offer. You do not need a myth about the brand. You need the car that is parked there.',
        'A used car purchase works when you can see the vehicle, ask about that vehicle, and leave in that vehicle. The Frankford Avenue dealer is built around that sequence. No invented makes, no invented specials. The work is the lot.',
      ],
    },
    experience: {
      heading: 'How a purchase actually runs',
      items: [
        {
          title: 'Walk the retail lot',
          text: 'You start on the pavement at 4050 Frankford Ave. The used cars are the inventory. You look at the ones that are actually there.',
        },
        {
          title: 'Pick the car on the ground',
          text: 'Retail used cars means the decision is about a specific vehicle, not a catalog photo. You choose the car you can put a hand on.',
        },
        {
          title: 'Deal with the lot that holds it',
          text: 'The dealer that parked the car is the dealer you buy from. First Class Auto Land is the Frankford Avenue counter for that transaction.',
        },
      ],
    },
    feature: {
      heading: 'Used cars, sold at retail',
      text: 'The lot does not need a longer slogan. First Class Auto Land sells used cars at retail on Frankford Avenue. You come for a vehicle you can see.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'The address is the showroom',
      text: '4050 Frankford Ave is where the inventory lives. A used car dealer this straightforward wants you on the lot, looking at the row, before anyone talks paper.',
      ctaLabel: 'See the lot',
    },
    catalog: {
      items: [
        {
          title: 'Retail used cars',
          text: 'Used vehicles sold at retail from the Frankford Avenue dealer.',
        },
        {
          title: 'On-lot inventory',
          text: 'Cars you can walk up to at 4050 Frankford Ave, Philadelphia.',
        },
        {
          title: 'The Frankford lot',
          text: 'A Philadelphia used car dealer whose showroom is the street-facing row.',
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
          text: 'Szechuan Chicken, Mongolian Beef, and Moo Goo Gai Pan are the named Chinese plates. Those are the dishes the restaurant puts in its own language, so those are the dishes this page will claim.',
        },
        {
          title: 'Japanese rolls and Shumai',
          text: 'Dragon Roll and Shumai sit on the Japanese side of the same menu. You can eat Chinese and Japanese in one order from one North Wales kitchen.',
        },
        {
          title: 'Lunch specials and delivery',
          text: 'Lunch specials are on the board for the midday order. Free delivery starts at a $15 minimum. Delivery is cash only. That is the rule as they publish it.',
        },
      ],
    },
    story: {
      heading: 'One kitchen, two menus',
      paragraphs: [
        'Eastern Dragon cooks Chinese and Japanese food on Upper State Road. Szechuan Chicken and Mongolian Beef share the ticket with Dragon Roll and Shumai. Moo Goo Gai Pan is there for the plate that wants vegetables and a quieter sauce. The restaurant is a neighborhood kitchen, not a tasting room.',
        'Lunch specials give the midday order a shorter path. Delivery is part of the service: free at a $15 minimum, cash only when the food leaves the building. You can sit, pick up, or send the order out. The dishes stay the ones they name.',
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
          text: 'Chinese and Japanese food from one North Wales kitchen. The claim stays inside the dishes they publish.',
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
      'BYOB restaurant in Sumneytown. Reservations. Smoked beef ribs, brisket, smoked fish and chicken mentioned on their site.',
    marquee: ['BYOB', 'Reservations', 'Smoked beef ribs', 'Brisket', 'Sumneytown'],
    hero: {
      headline: 'BYOB on Main Street',
      sub: 'Francis Kaufman House is a BYOB restaurant in Sumneytown. Reservations are how a table gets held. Their site and listings mention smoked beef ribs, brisket, smoked fish, and chicken. Claims stay inside those plates. Bring the bottle you want at the table.',
      glassFloat: { title: 'Sumneytown', sub: 'BYOB restaurant' },
    },
    offerings: {
      heading: 'What the house will stand behind',
      items: [
        {
          title: 'BYOB at the table',
          text: 'The restaurant is BYOB. Wine, beer, or the bottle you chose comes with you. The house cooks. You pour. That is the arrangement they publish.',
        },
        {
          title: 'Reservations',
          text: 'A table at Francis Kaufman House is held by reservation. You call, you set the night, you arrive to a room that already expects you.',
        },
        {
          title: 'Smoked plates they mention',
          text: 'Smoked beef ribs, brisket, smoked fish, and chicken appear on their site and listings. Those are the dishes this page will name. No awards, no secret-menu claims.',
        },
      ],
    },
    story: {
      heading: 'A Sumneytown table',
      paragraphs: [
        'Francis Kaufman House sits on Main Street in Sumneytown. The restaurant asks you to bring your own bottle and to reserve the table. The food they put in public language includes smoked beef ribs, brisket, smoked fish, and chicken. That is enough to know what kind of kitchen you are walking into.',
        'The page will not invent a tasting menu or a published hour that their own site and the aggregators cannot agree on. The honest offer is a reserved BYOB table and the smoked plates they mention. Come for those, and confirm the rest with the house in Sumneytown.'
      ],
    },
    experience: {
      heading: 'How a night at the house works',
      items: [
        {
          title: 'Reserve the table',
          text: 'Reservations are the front door. You set the night with the house before you drive to Sumneytown.',
        },
        {
          title: 'Bring the bottle',
          text: 'BYOB means the wine, beer, or liquor is yours to carry in. The restaurant cooks. The table drinks what you brought.',
        },
        {
          title: 'Eat the smoked plates they name',
          text: 'Smoked beef ribs, brisket, smoked fish, and chicken are the dishes their site and listings mention. Order inside that list and you are ordering what they have put in public.',
        },
      ],
    },
    feature: {
      heading: 'BYOB, reserved, smoked',
      text: 'The house is a reserved table, a bottle you brought, and smoked food they are willing to name: beef ribs, brisket, fish, and chicken. Everything else you confirm with them before you drive to Sumneytown.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Modest on purpose',
      text: 'Listings like to embroider a country restaurant. This page will not. Francis Kaufman House is a BYOB room in Sumneytown that mentions smoked beef ribs, brisket, smoked fish, and chicken. Reservations hold the table.',
      ctaLabel: 'Reserve',
    },
    catalog: {
      items: [
        {
          title: 'Smoked beef ribs',
          text: 'Named on their site and listings. A smoked plate at the Sumneytown house.',
        },
        {
          title: 'Brisket',
          text: 'Another smoked plate they mention. Confirm availability when you reserve.',
        },
        {
          title: 'BYOB reservations',
          text: 'Hold the table, bring the bottle, eat what the house is cooking that night.',
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
    hours: '',
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
    description: 'Chinese restaurant in Norristown. Pickup and delivery from their locations page.',
    marquee: ['Pickup', 'Delivery', 'Chinese food', 'Norristown', 'Marshall Street'],
    hero: {
      headline: 'Chinese food, pickup and delivery',
      sub: 'Bei Jing Chinese Food is a Chinese restaurant on East Marshall Street in Norristown. The service they put on their locations page is pickup and delivery. You order Chinese food, you collect it at the counter, or you have it sent to the door. The kitchen stays in Norristown. No extra dining-room story, no borrowed dish list. Pickup and delivery are the published paths.',
      glassFloat: { title: 'Norristown', sub: 'Pickup and delivery' },
    },
    offerings: {
      heading: 'How the restaurant actually serves',
      items: [
        {
          title: 'Chinese food from Marshall Street',
          text: 'The restaurant cooks Chinese food in Norristown. The claim stays at that scale. No invented house specials, no borrowed menu from another shop.',
        },
        {
          title: 'Pickup at the counter',
          text: 'Pickup is one of the two ways they publish. You order, you walk into 130 E Marshall St, you take the bag. The kitchen and the counter are the same place.',
        },
        {
          title: 'Delivery from the same kitchen',
          text: 'Delivery is the other path on their locations page. The food still comes from the Norristown restaurant. You are not ordering a ghost kitchen with a borrowed name.',
        },
      ],
    },
    story: {
      heading: 'A Norristown Chinese kitchen',
      paragraphs: [
        'Bei Jing Chinese Food keeps the offer honest: a Chinese restaurant on East Marshall Street that does pickup and delivery. That is what their locations page stands behind, so that is what this page will say. The rest of a menu is for their site, not for invented copy.',
        'Norristown already knows how this kind of restaurant works. You call or you order, you pick up on Marshall Street, or you wait for the bag to arrive. The kitchen does not need a myth. The kitchen needs the order.',
      ],
    },
    experience: {
      heading: 'How an order actually leaves the kitchen',
      items: [
        {
          title: 'Place the Chinese food order',
          text: 'You order from Bei Jing Chinese Food in Norristown. The ticket is for the Marshall Street kitchen, not a third-party brand.',
        },
        {
          title: 'Pick it up at the counter',
          text: 'Pickup means you come to 130 E Marshall St and take the food from the restaurant that cooked it.',
        },
        {
          title: 'Have it delivered',
          text: 'Delivery is the other published path. The same Norristown kitchen sends the order out.',
        },
      ],
    },
    feature: {
      heading: 'Pickup and delivery, their words',
      text: 'Their locations page names pickup and delivery. This page will not add a dining-room novel or a dish list we cannot verify. Chinese food, from Norristown, those two ways out the door.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Marshall Street is the kitchen',
      text: '130 E Marshall St is where the order is cooked. Pickup walks in. Delivery leaves from the same door. Bei Jing Chinese Food is that address doing that work.',
      ctaLabel: 'Order',
    },
    catalog: {
      items: [
        {
          title: 'Pickup',
          text: 'Collect Chinese food at the Norristown counter on East Marshall Street.',
        },
        {
          title: 'Delivery',
          text: 'The same kitchen sends the order out, as their locations page states.',
        },
        {
          title: 'Norristown kitchen',
          text: 'Chinese food cooked at 130 E Marshall St, not a borrowed storefront.',
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
      text: 'That is their line. Martin Slater and Matthew Kennedy run the shop that has to make it true: sell the house, write the coverage, stay local after 50+ years.',
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
    hours: '',
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
      'Dive bar in Ambler. U-shaped bar, local taps Victory, Troegs, Sterling Pig. Pizza, sandwiches, fried pickles. From a PA Eats feature.',
    marquee: ['U-shaped bar', 'Victory', 'Troegs', 'Sterling Pig', 'Fried pickles', 'Ambler'],
    hero: {
      headline: 'The u-shaped bar on Main',
      sub: 'Bar 31 is a dive bar at 31 N Main St in Ambler. A PA Eats feature called out the u-shaped bar, the local taps, and the food that comes with them. Victory, Troegs, and Sterling Pig are the named beers. Pizza, sandwiches, and fried pickles are the named plates. That is the room.',
      glassFloat: { title: 'Ambler', sub: 'Dive bar' },
    },
    offerings: {
      heading: 'What the bar actually pours and plates',
      items: [
        {
          title: 'The u-shaped bar',
          text: 'The room is built around a u-shaped bar. You sit on the rail, not in a dining concept. Bar 31 is a dive bar that wants you at that shape of wood.',
        },
        {
          title: 'Local taps',
          text: 'Victory, Troegs, and Sterling Pig are the taps PA Eats named. Local beer, poured at a Main Street dive, not a flight menu with twenty guest handles.',
        },
        {
          title: 'Pizza, sandwiches, fried pickles',
          text: 'The food that got written down is pizza, sandwiches, and fried pickles. Those are the plates this page will claim. Order them with the beer that is on.',
        },
      ],
    },
    story: {
      heading: 'Ambler, 31 North Main',
      paragraphs: [
        'Bar 31 is the dive at 31 N Main St. The PA Eats feature is the public record used here: a u-shaped bar, Victory and Troegs and Sterling Pig on tap, pizza and sandwiches and fried pickles on the plate. The bar does not need a brand story beyond the room those sentences describe.',
        'A night here is sit the rail, drink the local tap, eat the fried pickles or the pizza or the sandwich. Ambler already knows the door. This page will not invent a cocktail program or a weekend DJ. The work is the u-shaped bar.',
      ],
    },
    experience: {
      heading: 'How a night at 31 actually goes',
      items: [
        {
          title: 'Take a seat on the U',
          text: 'The bar is u-shaped. You sit on it. That is the geometry PA Eats wrote down, and it is the way the room works.',
        },
        {
          title: 'Drink the local taps',
          text: 'Victory, Troegs, and Sterling Pig are the named beers. You order what is on, from those houses.',
        },
        {
          title: 'Eat pizza, a sandwich, or fried pickles',
          text: 'Those are the plates the feature named. Food at Bar 31 is that list, eaten at the same rail as the beer.',
        },
      ],
    },
    feature: {
      heading: 'A dive with named taps',
      text: 'Victory, Troegs, and Sterling Pig are not generic "local craft." They are the taps a PA Eats feature put on Bar 31. The u-shaped bar is where they get poured.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Fried pickles belong here',
      text: 'Pizza, sandwiches, and fried pickles are the food the bar is willing to be known for. Order them like a dive bar orders food: with the beer, at the rail.',
      ctaLabel: 'See the bar',
    },
    catalog: {
      items: [
        {
          title: 'U-shaped bar',
          text: 'The rail that defines the room at 31 N Main St, Ambler.',
        },
        {
          title: 'Victory, Troegs, Sterling Pig',
          text: 'The local taps named in the PA Eats feature.',
        },
        {
          title: 'Pizza and fried pickles',
          text: 'Pizza, sandwiches, and fried pickles from the same dive bar kitchen.',
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
      'Authentic Korean-Japanese restaurant in Norristown. Sushi bar, BBQ party trays, phone orders.',
    marquee: ['Korean-Japanese', 'Sushi bar', 'BBQ party trays', 'Phone orders', 'Norristown'],
    hero: {
      headline: 'Authentic Korean-Japanese',
      sub: 'August Moon cooks authentic Korean-Japanese cuisine on East Main Street in Norristown. The room holds a sushi bar. BBQ party trays are how larger tables eat. Phone orders are how a lot of the food leaves. Lunch and dinner run on the hours from their order page. Sunday the restaurant is closed.',
      glassFloat: { title: 'Norristown', sub: 'Sushi bar and BBQ trays' },
    },
    offerings: {
      heading: 'What August Moon actually cooks',
      items: [
        {
          title: 'Korean-Japanese in one room',
          text: 'The restaurant calls the food authentic Korean-Japanese. You can eat across both kitchens in one visit: Korean plates and Japanese sushi from the same East Main Street address.',
        },
        {
          title: 'Sushi bar',
          text: 'A sushi bar is part of the room. Rolls and nigiri are ordered there, not as a side note on a purely Korean menu.',
        },
        {
          title: 'BBQ party trays and phone orders',
          text: 'BBQ party trays are built for a table, not a single bowl. Phone orders are a published path: you call, you set the ticket, you pick up or sit down when the kitchen has it.',
        },
      ],
    },
    story: {
      heading: 'East Main Street, two cuisines',
      paragraphs: [
        'August Moon is a Norristown restaurant that refuses to pick only Korea or only Japan. Authentic Korean-Japanese is their own phrase. The sushi bar and the BBQ party trays are how that phrase looks on a table. Phone orders keep the kitchen usable when you are not walking in cold.',
        'Lunch is a shorter window on weekdays. Dinner stretches later on Friday and Saturday. Sunday they close. Those hours come from their order page, so the page you are reading will not invent a brunch or a late-night service they did not publish.',
      ],
    },
    experience: {
      heading: 'How a meal actually gets to the table',
      items: [
        {
          title: 'Call the ticket in',
          text: 'Phone orders are how many tables start. You call August Moon, you name the Korean plates, the sushi, or the BBQ party tray, and the kitchen works that ticket.',
        },
        {
          title: 'Sit the sushi bar or the table',
          text: 'The sushi bar is a real station in the room. A party tray is for the larger table that wants Korean BBQ in a shared format.',
        },
        {
          title: 'Lunch window, then dinner',
          text: 'Weekday lunch is 11:30am to 2pm. Dinner returns in the late afternoon. Saturday dinner starts at 4pm. Sunday there is no service.',
        },
      ],
    },
    feature: {
      heading: 'Sushi bar and BBQ party trays',
      text: 'Those two formats are the restaurant in physical form. One is a bar of Japanese work. The other is a Korean BBQ tray built for a group. Authentic Korean-Japanese means both are in the same Norristown room.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Phone orders are part of the kitchen',
      text: 'August Moon publishes phone orders as a way in. You do not have to discover the menu only by walking East Main Street. Call, name the tray or the sushi, and let the kitchen cook.',
      ctaLabel: 'Call in an order',
    },
    catalog: {
      items: [
        {
          title: 'Sushi bar',
          text: 'Japanese sushi ordered at the bar inside August Moon on East Main Street.',
        },
        {
          title: 'BBQ party trays',
          text: 'Korean BBQ in a shared tray built for a table, not a single bowl.',
        },
        {
          title: 'Phone orders',
          text: 'Call 610-277-4008 and put Korean-Japanese food on a ticket.',
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
    hours: '',
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
    description: 'Used car dealer in Aston. Inventory and trade-ins from their live contact page.',
    marquee: ['Inventory', 'Trade-ins', 'Used cars', 'Aston', 'Conchester Hwy'],
    hero: {
      headline: 'Inventory and trade-ins in Aston',
      sub: 'Highline Motors is a used car dealer on Conchester Highway in Aston. Their live contact page puts the work in two words: inventory and trade-ins. You come to see the used cars they hold, and you can bring the car you already have. The lot is 469 Conchester Hwy.',
      glassFloat: { title: 'Aston', sub: 'Inventory and trade-ins' },
    },
    offerings: {
      heading: 'What the Aston lot actually does',
      items: [
        {
          title: 'Used car inventory',
          text: 'The dealer holds used cars you can come see. Inventory is their word. The product is a vehicle on the Conchester Highway lot, not a maybe in transit.',
        },
        {
          title: 'Trade-ins',
          text: 'Trade-ins are the other half of their contact-page offer. You bring the car you have. They look at it as part of the deal for the car you want.',
        },
        {
          title: 'A dealer you visit',
          text: 'Highline Motors is an Aston lot. The visit is the point: walk the inventory, talk the trade, decide on a used car that is actually there.',
        },
      ],
    },
    story: {
      heading: 'Conchester Highway, used cars',
      paragraphs: [
        'Highline Motors keeps the claim as tight as their contact page. Inventory. Trade-ins. A used car dealer in Aston. You are not promised a brand of car this page cannot verify. You are promised a lot that holds vehicles and takes trades.',
        'A used-car deal works when both sides of the driveway are honest. They have inventory. You may have a trade. Conchester Highway is where those two facts meet. The rest is the specific car on the ground that day. Highline Motors is the Aston dealer that put both words on the contact page.'
      ],
    },
    experience: {
      heading: 'How a deal actually starts',
      items: [
        {
          title: 'See the inventory',
          text: 'You start with the used cars Highline Motors is holding in Aston. Inventory means the row you can walk, not a hidden list.',
        },
        {
          title: 'Bring a trade if you have one',
          text: 'Trade-ins are a published part of the work. The car you already drive can enter the same conversation as the car you want.',
        },
        {
          title: 'Deal on the lot',
          text: 'The dealer and the inventory are in one place: 469 Conchester Hwy. The purchase happens around a vehicle that is there.',
        },
      ],
    },
    feature: {
      heading: 'Used cars, plus the one you bring',
      text: 'Inventory and trade-ins are a paired offer. Highline Motors sells used cars in Aston and takes the car you already have as part of the deal.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'The contact page named the work',
      text: 'Plenty of lots hide behind adjectives. Their live contact page did not. Inventory. Trade-ins. That is the Highline Motors offer, written the way they run the Aston lot.',
      ctaLabel: 'See inventory',
    },
    catalog: {
      items: [
        {
          title: 'Inventory',
          text: 'Used cars on the ground at the Aston dealer on Conchester Highway.',
        },
        {
          title: 'Trade-ins',
          text: 'Bring the car you have. Trade-ins are part of how Highline Motors deals.',
        },
        {
          title: 'Aston lot',
          text: 'A used car dealer you visit at 469 Conchester Hwy, Aston, PA.',
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
      'Comic shop in Philadelphia. Comics, manga, graphic novels, figures. Clean approachable shop. Custom art commissions.',
    marquee: ['Comics', 'Manga', 'Graphic novels', 'Figures', 'Custom art', 'Manayunk'],
    hero: {
      headline: 'Comics, manga, figures, commissions',
      sub: "Johnny Destructo's Hero Complex is a comic shop on Main Street in Philadelphia. The racks hold comics, manga, and graphic novels. Figures are on the floor. Custom art commissions are part of the shop, not a side hustle down the street. The room is a clean, approachable shop, not a basement you have to decode.",
      glassFloat: { title: 'Philadelphia', sub: 'Clean, approachable shop' },
    },
    offerings: {
      heading: 'What the shop actually holds',
      items: [
        {
          title: 'Comics, manga, graphic novels',
          text: 'The reading stock is comics, manga, and graphic novels. You come in for issues and volumes you can hold, in a shop that is built to be walked without a secret handshake.',
        },
        {
          title: 'Figures',
          text: 'Figures sit with the books. Hero Complex is a comic shop that also sells the objects people put on a shelf next to the pull list.',
        },
        {
          title: 'Custom art commissions',
          text: 'Custom art commissions are a published part of the shop. You can leave with a book, a figure, or a piece made for you. The counter handles all three.',
        },
      ],
    },
    story: {
      heading: 'A clean shop on Main Street',
      paragraphs: [
        "Johnny Destructo's Hero Complex keeps the comic shop approachable on purpose. Comics, manga, and graphic novels are the racks. Figures are in the room. Custom art commissions are on the offer list. The shop is clean enough that a new reader can walk in without feeling like they failed a test.",
        'Manayunk Main Street is the address. The hours from their contact page run noon to 8pm Monday through Saturday and noon to 6pm on Sunday. You come for the pull, the volume, the figure, or the commission. You leave with something the shop actually sells.',
      ],
    },
    experience: {
      heading: 'How a visit to the shop works',
      items: [
        {
          title: 'Walk the racks',
          text: 'Comics, manga, and graphic novels are out where you can browse. The shop is clean and approachable, so the first visit does not require a guide.',
        },
        {
          title: 'Check the figures',
          text: 'Figures are part of the same floor. You can leave with a book and an object from one counter.',
        },
        {
          title: 'Ask about a commission',
          text: 'Custom art commissions are shop work. You talk to the counter about a piece made for you, in the same place you buy the weekly comics.',
        },
      ],
    },
    feature: {
      heading: 'A comic shop you can actually walk into',
      text: 'Clean and approachable is the room. Comics, manga, graphic novels, and figures are the stock. Custom art commissions are the extra that still belongs to this counter.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Commissions live here',
      text: "Hero Complex does not send custom art down the street. Commissions are part of Johnny Destructo's shop, next to the comics and the figures.",
      ctaLabel: 'See the shop',
    },
    catalog: {
      items: [
        {
          title: 'Comics and manga',
          text: 'Issues and volumes on the racks at 4327 Main Street, Philadelphia.',
        },
        {
          title: 'Graphic novels and figures',
          text: 'Longer books and figures in the same clean, approachable shop.',
        },
        {
          title: 'Custom art commissions',
          text: 'Commission a piece from the same counter that pulls your comics.',
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
      sub: 'Dutton Road Veterinary Clinic is a full-service, state-of-the-art veterinary clinic and surgical facility in Northeast Philadelphia. The staff is greyhound-savvy and the prices stay affordable because the clinic is nonprofit. Low-cost vaccines, spays and neuters, general and specialty surgeries, and pet dentistry are the published roster.',
      glassFloat: { title: 'Northeast Philly', sub: 'Nonprofit clinic and surgery' },
    },
    offerings: {
      heading: 'What the clinic actually does',
      items: [
        {
          title: 'Low-cost vaccines, spay, and neuter',
          text: 'Vaccines, spays, and neuters sit at affordable nonprofit prices. The work started for greyhounds in the kennel and now covers the dogs and cats who live around Dutton Road.',
        },
        {
          title: 'General and specialty surgery',
          text: 'The surgical facility is the other half of the name. General and specialty surgeries run in the same building as the clinic, with staff veterinarians who keep training on current methods.',
        },
        {
          title: 'Pet dentistry',
          text: 'Pet dentistry is a named specialty, not an add-on. Greyhounds have unique anesthesia and dental needs. That is why National Greyhound Adoption Program built a clinic in the first place, and why dentistry stayed on the public roster.',
        },
      ],
    },
    story: {
      heading: 'From a Wingate Street trailer to Dutton Road',
      paragraphs: [
        'In 1995 National Greyhound Adoption Program opened a nonprofit clinic in a retro-fitted office trailer on Wingate Street. Two staff veterinarians worked two days a week and it was not uncommon to see 25 greyhounds on each of those days. Adopters from far outside the city started coming because greyhounds need different anesthesia and dentistry.',
        'In 2009 the adoption kennel moved to 10901 Dutton Road. In 2011 the veterinary clinic and surgical facility opened its doors to the public. Greyhounds are still the mission. A growing share of the patients are now the neighborhood dogs and cats who need the same affordable surgery and dentistry.',
      ],
    },
    experience: {
      heading: 'How a visit actually runs',
      items: [
        {
          title: 'Call and come in the rear entrance',
          text: 'Appointments are set by phone. Drive straight into the driveway instead of following the bend, then use the double doors at the back of the building. That is the clinic entrance they publish.',
        },
        {
          title: 'Vaccines, dentistry, or surgery on the roster',
          text: 'You are here for a vaccine, a spay or neuter, dentistry, or a surgical case. The veterinarians are greyhound-savvy and they treat non-greyhound dogs and cats the same way: current methods, not a trailer workaround.',
        },
        {
          title: 'Pay when the work is done',
          text: 'Services are payable at the time they are rendered. Cash, check, Visa, Mastercard, Discover, and American Express are the published methods. This is a nonprofit clinic, not a payment-plan mill.',
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
      'One-on-one licensed physical therapy in Collegeville. Orthopedic, sports, post-surgical, vestibular. Dr. Jeff Kurtz, clinic director. Ursinus / Perkiomen Creek community.',
    marquee: ['One-on-one', 'Orthopedic', 'Sports', 'Post-surgical', 'Vestibular', 'Collegeville'],
    hero: {
      headline: 'One-on-one licensed therapists',
      sub: 'Kinetic Physical Therapy in Collegeville is one-on-one care with licensed therapists. The clinic treats orthopedic, sports, post-surgical, and vestibular cases. Dr. Jeff Kurtz is the clinic director. The room sits in the Ursinus / Perkiomen Creek community at 241 Plaza Drive.',
      glassFloat: { title: 'Collegeville', sub: 'Dr. Jeff Kurtz, clinic director' },
    },
    offerings: {
      heading: 'The cases the clinic actually takes',
      items: [
        {
          title: 'Orthopedic and sports',
          text: 'Orthopedic and sports cases are treated one-on-one with a licensed therapist. You are not handed to an aide for the hour that was supposed to be skilled care.',
        },
        {
          title: 'Post-surgical',
          text: 'Post-surgical physical therapy is on the Collegeville list. The therapist works the protocol with you in the room, under a clinic directed by Dr. Jeff Kurtz.',
        },
        {
          title: 'Vestibular',
          text: 'Vestibular work is a named service, not an afterthought. Balance and inner-ear cases get the same one-on-one licensed hour as a knee or a shoulder.',
        },
      ],
    },
    story: {
      heading: 'Collegeville, one patient at a time',
      paragraphs: [
        'Kinetic Physical Therapy puts licensed therapists in a one-on-one hour. Orthopedic, sports, post-surgical, and vestibular are the published case types. Dr. Jeff Kurtz directs the Collegeville clinic. The community around the door is Ursinus and the Perkiomen Creek, not a downtown medical tower.',
        'The method is the differentiator they are willing to name: one-on-one. A visit is you and a licensed therapist in the work, whether the problem is a joint, a sport, a surgery, or the vestibular system. Plaza Drive is where that hour happens. Dr. Jeff Kurtz directs the Collegeville clinic that holds those four case types.'
      ],
    },
    experience: {
      heading: 'How a Kinetic hour actually runs',
      items: [
        {
          title: 'One-on-one with a licensed therapist',
          text: 'The hour is skilled care. A licensed therapist stays with you. That is the Collegeville model, not a gym pass with occasional check-ins.',
        },
        {
          title: 'Treat the named case type',
          text: 'Orthopedic, sports, post-surgical, or vestibular. The plan is built for the case they published, under Dr. Jeff Kurtz as clinic director.',
        },
        {
          title: 'Work inside the Ursinus community',
          text: 'The clinic sits at 241 Plaza Drive in the Ursinus / Perkiomen Creek community. You are treated as a neighbor case, not a unit in a regional mill.',
        },
      ],
    },
    feature: {
      heading: 'Licensed, one-on-one, four case types',
      text: 'Orthopedic, sports, post-surgical, vestibular. Those are the doors. Behind each door is a licensed therapist and an hour that is not split across three patients. Kinetic Physical Therapy in Collegeville is one-on-one licensed care under Dr. Jeff Kurtz.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Dr. Jeff Kurtz directs the clinic',
      text: 'Collegeville has a named clinic director. Dr. Jeff Kurtz is on the work, in a Kinetic Physical Therapy that still sells one-on-one licensed care to the Ursinus / Perkiomen Creek community.',
      ctaLabel: 'Collegeville location',
    },
    catalog: {
      items: [
        {
          title: 'Orthopedic and sports',
          text: 'One-on-one licensed therapy for orthopedic and sports cases in Collegeville.',
        },
        {
          title: 'Post-surgical',
          text: 'Post-surgical physical therapy with a licensed therapist in the room.',
        },
        {
          title: 'Vestibular',
          text: 'Vestibular care as a named service, directed by Dr. Jeff Kurtz.',
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
      'Heating and air for Bucks, Montgomery, and Philadelphia counties. Based in Morrisville.',
    marquee: ['Heating', 'Air', 'Bucks', 'Montgomery', 'Philadelphia', 'Morrisville'],
    hero: {
      headline: 'Heating and air for three counties',
      sub: 'Accurate Temperature is an HVAC company in Morrisville. The work is heating and air for Bucks, Montgomery, and Philadelphia counties. You call a Morrisville shop when the house is too cold or too hot, and the service area is those three counties, not a national dispatch board.',
      glassFloat: { title: 'Morrisville', sub: 'Bucks, Montgomery, Philadelphia' },
    },
    offerings: {
      heading: 'The work they put on the truck',
      items: [
        {
          title: 'Heating',
          text: 'Heating is half the name. Accurate Temperature works heat for houses in Bucks, Montgomery, and Philadelphia counties from a Morrisville base.',
        },
        {
          title: 'Air',
          text: 'Air is the other half. Cooling and air work sit with the heating, so the same company handles the year instead of handing summer to a stranger.',
        },
        {
          title: 'Three-county service',
          text: 'Bucks, Montgomery, and Philadelphia are the published counties. The shop is in Morrisville. The truck goes where those counties are, not wherever an algorithm points.',
        },
      ],
    },
    story: {
      heading: 'A Morrisville HVAC shop',
      paragraphs: [
        'Accurate Temperature keeps the offer in plain language: heating and air, from Morrisville, for Bucks, Montgomery, and Philadelphia counties. No invented 24/7 badge. No invented brand of furnace. The company does HVAC in the counties they name.',
        'A house that will not heat or will not cool needs a shop that already works those streets. Rennard Lane is the base. The three counties are the map. Heating and air are the verbs. That is the whole brief, and it is enough to know who you are calling. Accurate Temperature is the Morrisville company that published that map.'
      ],
    },
    experience: {
      heading: 'How the service actually runs',
      items: [
        {
          title: 'Call a Morrisville HVAC shop',
          text: 'The company is Accurate Temperature at 810 Rennard Lane. You are talking to a local heating and air shop, not a national call center that resells the job.',
        },
        {
          title: 'Work the heat or the air',
          text: 'The visit is heating or air, the two halves they publish. The technician is there for the system that is failing, in the season it is failing.',
        },
        {
          title: 'Stay inside the three counties',
          text: 'Bucks, Montgomery, and Philadelphia are the service map. If the house is in those counties, it is inside the work they claim.',
        },
      ],
    },
    feature: {
      heading: 'Heating and air, named counties',
      text: 'The company will not be described as "full-service comfort solutions." Accurate Temperature does heating and air for Bucks, Montgomery, and Philadelphia counties from Morrisville. The truck leaves Rennard Lane for those three counties and comes back to the same shop.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Morrisville is the base',
      text: '810 Rennard Lane is where the shop lives. The counties are where the heating and air work goes. That split is honest: a local base, a three-county map.',
      ctaLabel: 'Talk to the shop',
    },
    catalog: {
      items: [
        {
          title: 'Heating',
          text: 'Heat work for houses in Bucks, Montgomery, and Philadelphia counties.',
        },
        {
          title: 'Air',
          text: 'Air and cooling from the same Morrisville HVAC company.',
        },
        {
          title: 'Three-county map',
          text: 'Bucks, Montgomery, Philadelphia. The published service area.',
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
    description: 'Pizza and steaks neighborhood shop in Narberth.',
    marquee: ['Pizza', 'Steaks', 'Neighborhood shop', 'Narberth', 'Montgomery Ave'],
    hero: {
      headline: 'Pizza and steaks, neighborhood shop',
      sub: 'Narberth Pizza is a pizza and steaks shop on Montgomery Avenue. The neighborhood already knows the door. You come for a pie or a steak, you take it home or you eat it as a neighborhood shop meal, and you do not need a concept deck to understand the order.',
      glassFloat: { title: 'Narberth', sub: 'Pizza and steaks' },
    },
    offerings: {
      heading: 'What the shop actually cooks',
      items: [
        {
          title: 'Pizza',
          text: 'Pizza is the first word on the door. Narberth Pizza is a neighborhood shop that makes pies for the people who already live on these blocks.',
        },
        {
          title: 'Steaks',
          text: 'Steaks are the other half of the name. A cheesesteak shop that also does pizza, or a pizza shop that also does steaks: either way the ticket can hold both.',
        },
        {
          title: 'A neighborhood counter',
          text: 'The shop is a neighborhood shop. Montgomery Avenue is the address. You order pizza and steaks from a counter that belongs to Narberth, not a chain board.',
        },
      ],
    },
    story: {
      heading: 'Narberth, 940 Montgomery',
      paragraphs: [
        'Narberth Pizza does not need a longer myth. Pizza and steaks, from a neighborhood shop on Montgomery Avenue. The hours that match across listings are 11am to 9pm Monday through Saturday and 12pm to 9pm on Sunday. The work is the order in front of you.',
        'A neighborhood shop earns the next ticket by cooking the last one. Pie or steak, the claim stays inside those two foods. No invented specialty crust, no invented secret sauce. Narberth already has the shop. This page just says what it sells: pizza and steaks from a neighborhood counter.'
      ],
    },
    experience: {
      heading: 'How an order at the shop works',
      items: [
        {
          title: 'Order pizza or a steak',
          text: 'The ticket is pizza, steaks, or both. That is the menu this page will stand behind from their own category.',
        },
        {
          title: 'Use the neighborhood counter',
          text: '940 Montgomery Ave is the shop. You order like a neighbor: walk in or call, take the food from the people who cooked it.',
        },
        {
          title: 'Eat it as a shop meal',
          text: 'Narberth Pizza is a neighborhood shop, not a white-tablecloth room. The food is meant to be eaten the way a Main Line block already eats pizza and steaks.',
        },
      ],
    },
    feature: {
      heading: 'Two foods, one Narberth shop',
      text: 'Pizza and steaks are enough of a menu to be a neighborhood institution. Narberth Pizza keeps both on the same Montgomery Avenue counter. A neighbor order is a pie, a steak, or both from that shop.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'The neighborhood already has a shop',
      text: 'Narberth already has a pizza and steaks shop. The counter sells those two foods to the blocks around Montgomery Avenue. Come for those two things.',
      ctaLabel: 'See the shop',
    },
    catalog: {
      items: [
        {
          title: 'Pizza',
          text: 'Pies from the neighborhood shop at 940 Montgomery Ave, Narberth.',
        },
        {
          title: 'Steaks',
          text: 'Steaks on the same ticket as the pizza, from the same counter.',
        },
        {
          title: 'Neighborhood shop',
          text: 'A Narberth shop for pizza and steaks, not a chain storefront.',
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
    description: 'Nail spa in Warrington. Manicure, pedicure, spa.',
    marquee: ['Manicure', 'Pedicure', 'Spa', 'Warrington', 'Main Street'],
    hero: {
      headline: 'Manicure, pedicure, spa',
      sub: 'Belle Palace Nail Spa is a nail spa on Main Street in Warrington. The work is manicure, pedicure, and spa care. You book the chair, you sit for the service they publish, and you leave with hands or feet that were actually worked in that room. Hours come from their booking page.',
      glassFloat: { title: 'Warrington', sub: 'Nail spa' },
    },
    offerings: {
      heading: 'The services the spa actually books',
      items: [
        {
          title: 'Manicure',
          text: 'Manicure is the hand work. Belle Palace books it as a nail spa service, in a Warrington chair, not as a mall kiosk rush.',
        },
        {
          title: 'Pedicure',
          text: 'Pedicure is the foot work. The spa puts it next to manicure on purpose. You can do one or both in the same visit.',
        },
        {
          title: 'Spa',
          text: 'Spa is the third word they use. The visit is meant to feel like a nail spa, not a hallway of dryers. Main Street in Warrington is the room.',
        },
      ],
    },
    story: {
      heading: 'Main Street, Warrington',
      paragraphs: [
        'Belle Palace Nail Spa keeps the menu in three words: manicure, pedicure, spa. That is what this page will sell. The booking page hours run later on weekdays, a little earlier on Saturday, and shorter on Sunday. The address is 1509 Main St.',
        'A nail spa visit is time in a chair with a named service. You are not promised a treatment this page cannot verify. You are promised manicure, pedicure, and spa care in Warrington, booked like a spa books a chair. Belle Palace Nail Spa is the Main Street room that publishes those three services and the booking-page hours that hold them.'
      ],
    },
    experience: {
      heading: 'How a spa visit actually goes',
      items: [
        {
          title: 'Book the chair',
          text: 'The spa runs on booked time. You take a manicure, a pedicure, or both, inside the hours on their booking page.',
        },
        {
          title: 'Sit for the published service',
          text: 'Manicure and pedicure are the hands-and-feet work. Spa is the way they want that work to feel in the Warrington room.',
        },
        {
          title: 'Leave from Main Street',
          text: '1509 Main St is the door. The service happens in that nail spa, not at a pop-up table.',
        },
      ],
    },
    feature: {
      heading: 'A nail spa with three verbs',
      text: 'Manicure. Pedicure. Spa. Belle Palace uses those words on purpose. The Warrington shop is a chair for that work, on Main Street. You book the service they publish and sit in the nail spa that put those three words on the visit.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Booked like a spa, not a rush bar',
      text: 'Their booking page is the public clock. Weekdays run to 7:30pm. Saturday starts at 9:30am. Sunday closes at 4pm. The services inside those hours are manicure, pedicure, and spa.',
      ctaLabel: 'Book',
    },
    catalog: {
      items: [
        {
          title: 'Manicure',
          text: 'Hand work in the Warrington nail spa on Main Street.',
        },
        {
          title: 'Pedicure',
          text: 'Foot work in the same Belle Palace chair as the manicure.',
        },
        {
          title: 'Spa visit',
          text: 'Nail spa care booked as a spa visit, not a hallway rush.',
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
          text: 'New patients are offered a cleaning, exam, and x-ray. That is their on-ramp. Doctors Boghara, Parikh, Taee, and Dudhat are the people who then do the work.',
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
    description: 'Hair studio in Philadelphia. Haircut and dye from their service page.',
    marquee: ['Haircut', 'Dye', 'Hair studio', 'South 10th', 'Philadelphia'],
    hero: {
      headline: 'Haircut and dye on South 10th',
      sub: "Mack's Hair Studio is a hair studio at 271 S 10th St in Philadelphia. Their service page names the work in two words: haircut and dye. You sit for a cut, you sit for color, or you sit for both. A phone number is not published here because it is not verified.",
      glassFloat: { title: 'Philadelphia', sub: 'Haircut and dye' },
    },
    offerings: {
      heading: 'What the studio actually does',
      items: [
        {
          title: 'Haircut',
          text: 'Haircut is the first service on their page. Mack\'s is a studio where the cut is the work, done on South 10th Street, not a mall trim.',
        },
        {
          title: 'Dye',
          text: 'Dye is the second service they publish. Color lives in the same studio as the cut, so a change of shade does not send you to another chair across town.',
        },
        {
          title: 'A Center City studio',
          text: '271 S 10th St is the room. The studio is a Philadelphia hair studio. You come to that address for the haircut and the dye they list.',
        },
      ],
    },
    story: {
      heading: 'Two services, one studio',
      paragraphs: [
        "Mack's Hair Studio does not get a longer menu on this page than their service page earned. Haircut. Dye. A studio on South 10th Street. That is the honest offer. No invented balayage list, no invented celebrity client, no invented phone.",
        'A hair studio visit is time in a chair with a named service. You go to 271 S 10th St for a cut, for color, or for both. The rest of a beauty menu can live on their site if they publish it. This page will not invent it.',
      ],
    },
    experience: {
      heading: 'How a studio visit actually runs',
      items: [
        {
          title: 'Come to South 10th',
          text: 'The studio is at 271 S 10th St, Philadelphia. You go to the room. The work does not start on a phone we cannot verify.',
        },
        {
          title: 'Sit for the haircut',
          text: 'Haircut is the published cut service. The chair time is for the hair in front of the stylist, in this studio.',
        },
        {
          title: 'Sit for the dye',
          text: 'Dye is the published color service. Cut and color can live in one visit because both are on their service page.',
        },
      ],
    },
    feature: {
      heading: 'Haircut and dye, their service page',
      text: "Two verbs are enough when they are the ones the studio published. Mack's Hair Studio cuts and dyes hair on South 10th Street in Philadelphia.",
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'The address is the booking path we can verify',
      text: 'Without a verified phone, the studio still has a door. 271 S 10th St is where haircut and dye happen. Use their official site for the rest of the path in.',
      ctaLabel: 'Official site',
    },
    catalog: {
      items: [
        {
          title: 'Haircut',
          text: "The cut service from Mack's Hair Studio on South 10th Street.",
        },
        {
          title: 'Dye',
          text: 'Color in the same Philadelphia studio as the haircut.',
        },
        {
          title: 'The studio',
          text: '271 S 10th St, Philadelphia. A hair studio for cut and dye.',
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
          text: 'Shop rules from their site. Bring cash. Do not sit under the minimum.',
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
    description: 'Optometry in Malvern. Eye exams, contacts, frames.',
    marquee: ['Eye exams', 'Contacts', 'Frames', 'Malvern', 'West King Street'],
    hero: {
      headline: 'Eye exams, contacts, frames',
      sub: 'Malvern Vision Care is an optometry practice on West King Street. The work they publish is eye exams, contacts, and frames. You come to see, you leave with a prescription, contacts, or a pair of frames from that office. Hours are left blank because sources disagree.',
      glassFloat: { title: 'Malvern', sub: 'Optometry' },
    },
    offerings: {
      heading: 'What the practice actually does',
      items: [
        {
          title: 'Eye exams',
          text: 'An eye exam is the start of the chart. Malvern Vision Care is an optometry office, so the exam is the skilled work, not a glasses vending machine with a poster.',
        },
        {
          title: 'Contacts',
          text: 'Contacts are a published service. The same practice that does the exam can fit and supply contacts, so the prescription does not have to leave town to become a lens.',
        },
        {
          title: 'Frames',
          text: 'Frames are the third published piece. You can take the exam and choose frames in the same Malvern office on West King Street.',
        },
      ],
    },
    story: {
      heading: 'West King Street optometry',
      paragraphs: [
        'Malvern Vision Care keeps a short, honest list: eye exams, contacts, frames. That is enough to run an optometry practice. This page will not invent a specialty clinic, a pediatric program, or a set of hours the sources cannot agree on.',
        'A visit is an exam first. Contacts and frames are how the exam becomes something you wear. 32 W King St is the office. 610-644-1879 is the phone. The rest of a vision-care novel can wait until their site and the aggregators tell the same story. Malvern Vision Care is optometry with those three published services, and nothing extra invented for the brief.'
      ],
    },
    experience: {
      heading: 'How an optometry visit actually moves',
      items: [
        {
          title: 'Sit for the eye exam',
          text: 'The exam is the medical work. Malvern Vision Care starts there, as an optometry practice, not as a frame shop that happens to have a chart.',
        },
        {
          title: 'Fit contacts when that is the path',
          text: 'Contacts are on their list. If the prescription is for lenses you wear on the eye, the same office can handle that path.',
        },
        {
          title: 'Choose frames in the same office',
          text: 'Frames are the third published service. Exam and frames can be one Malvern visit on West King Street.',
        },
      ],
    },
    feature: {
      heading: 'Three words of optometry',
      text: 'Eye exams. Contacts. Frames. Malvern Vision Care is that practice on West King Street. No extra departments invented for the brief. An exam can become contacts or frames in the same Malvern office, which is the whole published path.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Hours stay off this page',
      text: 'Sources disagree on the clock, so the clock is empty. The services are not in dispute: eye exams, contacts, and frames, from the Malvern office.',
      ctaLabel: 'Confirm on their site',
    },
    catalog: {
      items: [
        {
          title: 'Eye exams',
          text: 'Optometric exams at 32 W King St, Malvern.',
        },
        {
          title: 'Contacts',
          text: 'Contact lenses from the same practice that did the exam.',
        },
        {
          title: 'Frames',
          text: 'Frames chosen in the Malvern office after the exam.',
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
      'Criminal defense, probate, wills, and estates in Media. Former Assistant Public Defender, Delaware County.',
    marquee: ['Criminal defense', 'Probate', 'Wills', 'Estates', 'Media', 'Delaware County'],
    hero: {
      headline: 'Criminal defense and estate work',
      sub: 'Kevin T. Coyne, Esq. practices criminal defense, probate, wills, and estates from the first floor at 12 Veterans Square in Media. He is a former Assistant Public Defender in Delaware County. The criminal work and the estate work share one lawyer who has already been inside the county system.',
      glassFloat: { title: 'Media', sub: 'Former Assistant Public Defender' },
    },
    offerings: {
      heading: 'The files this office actually takes',
      items: [
        {
          title: 'Criminal defense',
          text: 'Criminal defense is the first lane. A former Assistant Public Defender in Delaware County is a lawyer who has already stood on that side of the caption in this county.',
        },
        {
          title: 'Probate and estates',
          text: 'Probate and estates are the after-death files. The same Media office that does criminal defense also moves an estate through the orphan\'s court work a family actually has.',
        },
        {
          title: 'Wills',
          text: 'Wills are the planning side of the estate practice. You sit with Kevin T. Coyne to put a will in place before the probate file exists.',
        },
      ],
    },
    story: {
      heading: 'Veterans Square, one lawyer',
      paragraphs: [
        'Kevin T. Coyne, Esq. keeps a Media office that holds two kinds of gravity: criminal defense, and the quieter work of wills, probate, and estates. The credential that matters on the criminal side is former Assistant Public Defender, Delaware County. The address is 12 Veterans Square, 1st Floor. The site lists 8AM-5PM.',
        'Families and defendants do not need a firm novel. They need a lawyer who has done the county\'s criminal work and who will also write the will or probate the estate. This office is that combination, in Media, under one name.',
      ],
    },
    experience: {
      heading: 'How the work actually starts',
      items: [
        {
          title: 'Bring a criminal matter',
          text: 'Criminal defense starts with the charge and the county. A former Assistant Public Defender in Delaware County already knows how that courthouse works.',
        },
        {
          title: 'Bring a will or an estate',
          text: 'Wills are planned while everyone is alive. Probate and estates are the file after. Both sit in this Media practice.',
        },
        {
          title: 'Work from Veterans Square',
          text: 'The office is on the first floor at 12 Veterans Square. The lawyer is Kevin T. Coyne. The work does not get handed to an anonymous team on the first call.',
        },
      ],
    },
    feature: {
      heading: 'A defender\'s background, an estates practice',
      text: 'Former Assistant Public Defender, Delaware County, is not decoration. It is why the criminal defense work has a local spine. Probate, wills, and estates are the other half of the same Media office.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'One name on both kinds of file',
      text: 'Criminal defense and estate work can feel like two professions. Kevin T. Coyne, Esq. practices both from Veterans Square. You are hiring the lawyer, not a department.',
      ctaLabel: 'Talk to the office',
    },
    catalog: {
      items: [
        {
          title: 'Criminal defense',
          text: 'Defense work from a former Assistant Public Defender in Delaware County.',
        },
        {
          title: 'Wills',
          text: 'Wills planned in the Media office before a probate file exists.',
        },
        {
          title: 'Probate and estates',
          text: 'Probate and estate administration from 12 Veterans Square, 1st Floor.',
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
      'Architecture in Norristown. Building design, preservation, sustainable design, adaptive reuse, interiors. Montgomery County EOC, Spring City Public Library, Academy of Vocal Arts, Waldorf School of Philadelphia.',
    marquee: [
      'Building design',
      'Preservation',
      'Adaptive reuse',
      'Interiors',
      'Norristown',
    ],
    hero: {
      headline: 'Building design, preservation, reuse',
      sub: 'Seiler+Drury Architecture practices from DeKalb Street in Norristown. The work is building design, preservation, sustainable design, adaptive reuse, and interiors. Built work includes the Montgomery County EOC, Spring City Public Library, the Academy of Vocal Arts, and the Waldorf School of Philadelphia.',
      glassFloat: { title: 'Norristown', sub: 'Architecture' },
    },
    offerings: {
      heading: 'The kinds of projects they actually take',
      items: [
        {
          title: 'Building design',
          text: 'New building design is the first verb. Seiler+Drury draws and delivers buildings, including civic work like the Montgomery County EOC and Spring City Public Library.',
        },
        {
          title: 'Preservation and adaptive reuse',
          text: 'Preservation and adaptive reuse keep a structure in the story. The Academy of Vocal Arts and the Waldorf School of Philadelphia sit in a portfolio that already knows how to work with what is standing.',
        },
        {
          title: 'Sustainable design and interiors',
          text: 'Sustainable design and interiors are published parts of the practice. The architecture does not stop at the envelope. Rooms and performance are in the same Norristown office.',
        },
      ],
    },
    story: {
      heading: 'A Norristown practice with named buildings',
      paragraphs: [
        'Seiler+Drury Architecture is a Norristown firm whose public buildings can be named. Montgomery County EOC. Spring City Public Library. Academy of Vocal Arts. Waldorf School of Philadelphia. Those projects are how this page will talk about the work, instead of a generic "award-winning studio" line.',
        'The practice verbs are building design, preservation, sustainable design, adaptive reuse, and interiors. Civic, school, and cultural buildings are already in the portfolio. 420 DeKalb St is the office that does that work. 610-272-4809 is the phone.',
      ],
    },
    experience: {
      heading: 'How an architectural project actually moves',
      items: [
        {
          title: 'Start with the building problem',
          text: 'A client comes with a new building, a structure to preserve, a reuse, or an interior. Seiler+Drury takes the problem as architecture, not as a rendering contest.',
        },
        {
          title: 'Design across the published verbs',
          text: 'Building design, preservation, sustainable design, adaptive reuse, and interiors are the methods. The project uses the ones it needs, from the same Norristown practice.',
        },
        {
          title: 'Look at buildings they have already done',
          text: 'Montgomery County EOC, Spring City Public Library, Academy of Vocal Arts, and the Waldorf School of Philadelphia are the named proof. A new client can walk those before hiring the next drawing.',
        },
      ],
    },
    feature: {
      heading: 'Civic and cultural buildings, already built',
      text: 'The Montgomery County EOC and Spring City Public Library are civic work. The Academy of Vocal Arts and the Waldorf School of Philadelphia are cultural and school work. Seiler+Drury is the Norristown practice on those jobs.',
      ctaLabel: 'Official site',
    },
    spotlight: {
      heading: 'Preservation and reuse are practice, not a slogan',
      text: 'Adaptive reuse and preservation are on the service list because the portfolio already had to keep buildings alive. Sustainable design and interiors sit with them so a project does not split across three firms.',
      ctaLabel: 'See the work',
    },
    catalog: {
      items: [
        {
          title: 'Montgomery County EOC',
          text: 'Named civic work from Seiler+Drury Architecture.',
        },
        {
          title: 'Spring City Public Library',
          text: 'A named library project in the same Norristown practice.',
        },
        {
          title: 'Academy of Vocal Arts',
          text: 'Cultural work, alongside the Waldorf School of Philadelphia, in a portfolio of design, preservation, and reuse.',
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



