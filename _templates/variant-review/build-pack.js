#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildSite } = require('../site-factory/build-site');

const ROOT = __dirname;
const SITES = path.join(ROOT, 'sites');
const BRIEFS = path.join(ROOT, 'briefs');

const briefs = [
  {
    slug: 'kiln-heating',
    name: 'Kiln Heating Co',
    city: 'Philadelphia',
    category: 'Heating and Cooling',
    vertical: 'Home Services',
    attitude: 'industrial',
    url: 'https://example.com/kiln-heating',
    phone: '215-555-0101',
    address: '4400 Demo Ave, Philadelphia, PA 19140',
    hours: '24/7 emergency dispatch, office 7am-6pm',
    description: 'North Philly heating and cooling. Same-day AC rescue in summer, heat the same night in January.',
    noindex: true,
    schemaType: 'HVACBusiness',
    tagline: 'Emergency HVAC, measured twice',
    marquee: ['Same-day AC', 'Heat tonight', 'Flat diagnostic', 'North Philly crew'],
    tokens: {
      paper: '#E7E2D6',
      ink: '#1A1C16',
      accent: '#C45C26',
      accent2: '#E2B84A',
      panel: '#C9C3B4',
      deep: '#14160F',
      onAccent: '#FFFFFF',
      onAccent2: '#090909',
      onPanel: '#090909',
      onDeep: '#FFFFFF',
      border: '3px',
      radius: '4px',
    },
    fonts: { display: 'Bebas Neue', displayFallback: 'Impact,sans-serif', text: 'IBM Plex Sans' },
    logo: false,
    hero: {
      eyebrow: 'Philadelphia | Heating and Cooling',
      headline: 'The AC dies. We show up.',
      sub: 'Kiln Heating Co runs emergency cooling and heat for rowhomes and small commercial. Diagnostic is flat. Repair is quoted before the panel goes back on.',
      ctaPrimary: { label: 'Call the truck', href: 'tel:2155550101' },
      ctaSecondary: { label: 'See services', href: '#offerings' },
      glassFloat: { title: 'Dispatch window', sub: 'Most calls answered in under 20 minutes' },
    },
    offerings: {
      items: [
        'Emergency AC and heat pump rescue with a flat diagnostic',
        'Furnace and boiler repair for rowhomes that cannot wait overnight',
        'Seasonal tune-ups with a written filter and airflow report',
      ],
    },
    proof: {
      items: [
        '24/7 emergency line, no answering-service maze',
        'Flat diagnostic credited toward the repair',
        'NATE-trained techs, fully insured',
        'North Philly to the near Northeast, same crew',
      ],
    },
    story: {
      heading: 'About',
      paragraphs: [
        'Kiln started as a night-shift rescue shop after too many summer calls got quoted in the morning.',
        'The rule is still the same: if the house is hot or cold, the truck moves before the paperwork.',
      ],
    },
    experience: {
      items: [
        'Call, get an arrival window, get a text when the tech is 15 minutes out.',
        'Diagnostic is one price. The repair is a second yes, not a surprise.',
        'Photos of the failed part and the install stay in your job folder.',
      ],
    },
    feature: {
      heading: 'Cooling restored the same afternoon',
      text: 'Most emergency AC calls close the same day when parts are on the truck. If they are not, you get the honest wait and a loaner fan, not a stall.',
      cta: { label: 'Request dispatch', href: 'tel:2155550101' },
      imageIndex: 8,
    },
    catalog: {
      items: [
        { title: 'Emergency service', href: 'https://example.com/kiln-heating/emergency', imageIndex: 9 },
        { title: 'Tune-ups', href: 'https://example.com/kiln-heating/tune-up', imageIndex: 10 },
        { title: 'Installs', href: 'https://example.com/kiln-heating/install', imageIndex: 11 },
      ],
    },
    contact: {},
    closing: { cta: { label: 'Call the truck', href: 'tel:2155550101' } },
    links: [
      { label: 'Emergency', href: 'https://example.com/kiln-heating/emergency' },
      { label: 'Tune-ups', href: 'https://example.com/kiln-heating/tune-up' },
    ],
    images: demoImages('Kiln Heating Co', [
      'Service van at a Philadelphia rowhome',
      'Outdoor condenser after a same-day repair',
      'Technician checking gauges on a condensing unit',
      'Furnace cabinet with a new filter',
      'Thermostat set after a heat restore',
      'Coil cleaning on an attic air handler',
      'Crew loading recovery tanks',
      'Finished outdoor unit with a level pad',
      'Close-up of a capacitor replacement',
      'Emergency night call on a porch',
      'Seasonal tune-up checklist',
      'Small commercial rooftop unit',
    ]),
  },
  {
    slug: 'lot-line-landscape',
    name: 'Lot Line Landscape',
    city: 'Philadelphia',
    category: 'Landscaping and Concrete',
    vertical: 'Home Services',
    attitude: 'warm',
    url: 'https://example.com/lot-line',
    phone: '215-555-0102',
    address: '1800 Demo St, Philadelphia, PA 19148',
    hours: 'Monday-Saturday, 7am-5pm',
    description: 'South Philly landscaping, patios, and concrete that lasts a freeze-thaw winter.',
    noindex: true,
    schemaType: 'HomeAndConstructionBusiness',
    tagline: 'Yards, patios, and concrete that hold',
    marquee: ['Patios', 'Walks', 'Planting', 'South Philly'],
    tokens: {
      paper: '#F3E6D0',
      ink: '#2A2218',
      accent: '#4F7A3C',
      accent2: '#C47A2C',
      panel: '#DCC9A8',
      deep: '#1E2818',
      onAccent: '#FFFFFF',
      onAccent2: '#090909',
      onPanel: '#090909',
      onDeep: '#FFFFFF',
      border: '2px',
      radius: '22px',
    },
    fonts: { display: 'Fraunces', displayFallback: 'Georgia,serif', text: 'Nunito Sans' },
    logo: false,
    hero: {
      eyebrow: 'Philadelphia | Landscaping and Concrete',
      headline: 'The yard should work in August and in March.',
      sub: 'Lot Line builds patios, walks, and planting beds for tight city lots. We quote drainage first, then the pretty layer.',
      ctaPrimary: { label: 'Book a site walk', href: 'https://example.com/lot-line/book' },
      ctaSecondary: { label: 'See the work', href: '#gallery' },
      glassFloat: { title: 'Site walks', sub: 'South Philly, Passyunk, and the near suburbs' },
    },
    offerings: {
      items: [
        'Patios and walks in paver or poured concrete with real pitch',
        'Planting beds, privacy screens, and soil that is not leftover fill',
        'Steps, walls, and small concrete that survives freeze-thaw',
      ],
    },
    proof: {
      items: [
        'Every quote includes a drainage note, not just a pretty plan',
        'Licensed and insured for residential exterior work',
        'One crew from demo to plant, no mystery subs',
        'Winter shutdown is honest. Spring dates are held.',
      ],
    },
    story: {
      heading: 'About',
      paragraphs: [
        'Lot Line started on alleys where a patio had to share space with trash day and a basketball hoop.',
        'The work still starts with where water goes, then with how the yard should feel on a Sunday.',
      ],
    },
    experience: {
      items: [
        'Site walk, measured sketch, and a written allowance for plants.',
        'Demo week, then base, then finish. You get photos at each stage.',
        'A one-year workmanship window on the hardscape we install.',
      ],
    },
    feature: {
      heading: 'Outdoor living that drains',
      text: 'A pretty patio that ponds is a winter problem. We set pitch, joints, and a place for the water to leave before we talk furniture.',
      cta: { label: 'Book a site walk', href: 'https://example.com/lot-line/book' },
      imageIndex: 8,
    },
    catalog: {
      items: [
        { title: 'Patios', href: 'https://example.com/lot-line/patios', imageIndex: 9 },
        { title: 'Planting', href: 'https://example.com/lot-line/planting', imageIndex: 10 },
        { title: 'Concrete', href: 'https://example.com/lot-line/concrete', imageIndex: 11 },
      ],
    },
    contact: {},
    closing: { cta: { label: 'Book a site walk', href: 'https://example.com/lot-line/book' } },
    links: [
      { label: 'Book', href: 'https://example.com/lot-line/book' },
      { label: 'Patios', href: 'https://example.com/lot-line/patios' },
    ],
    images: demoImages('Lot Line Landscape', [
      'Finished paver patio on a tight city lot',
      'Fresh planting bed along a fence',
      'Concrete walk with a clean edge',
      'Crew setting base stone',
      'Privacy screen of evergreens',
      'Steps down to a small garden',
      'Before photo of a packed dirt yard',
      'After photo of the same yard with a patio',
      'Detail of a soldier-course paver edge',
      'Outdoor dining table on the new patio',
      'Rain the day after install, water leaving the pad',
      'Small concrete retaining wall',
    ]),
  },
  {
    slug: 'atelier-ninth-bridal',
    name: 'Atelier Ninth Bridal',
    city: 'Philadelphia',
    category: 'Bridal Boutique',
    vertical: 'Retail',
    attitude: 'editorial',
    url: 'https://example.com/atelier-ninth',
    phone: '215-555-0103',
    address: '900 Demo Blvd, Philadelphia, PA 19107',
    hours: 'Tuesday-Saturday, 11am-6pm, appointments required',
    description: 'Appointment-only bridal fittings in Center City. Gowns you can walk in, sit in, and still feel like yourself.',
    noindex: true,
    schemaType: 'ClothingStore',
    tagline: 'Fittings by appointment',
    marquee: ['By appointment', 'Center City', 'Alterations on site', 'Private salon'],
    tokens: {
      paper: '#F7F1E8',
      ink: '#1C1714',
      accent: '#8A5A44',
      accent2: '#C9A36A',
      panel: '#E6D9CC',
      deep: '#2A211C',
      onAccent: '#FFFFFF',
      onAccent2: '#090909',
      onPanel: '#090909',
      onDeep: '#FFFFFF',
      border: '1px',
      radius: '2px',
    },
    fonts: { display: 'Cormorant Garamond', displayFallback: 'Georgia,serif', text: 'Jost' },
    logo: false,
    hero: {
      eyebrow: 'Philadelphia | Bridal Boutique',
      headline: 'Try the gown like you will wear it.',
      sub: 'Atelier Ninth is appointment-only. Ninety quiet minutes, honest mirrors, and alterations that start from how you actually stand.',
      ctaPrimary: { label: 'Book a fitting', href: 'https://example.com/atelier-ninth/book' },
      ctaSecondary: { label: 'The salon', href: '#experience' },
      glassFloat: { title: 'Private salon', sub: 'One party at a time' },
    },
    offerings: {
      items: [
        'Private gown fittings with a 90-minute appointment block',
        'On-site alterations from first pin to final hem',
        'Veils, shoes, and a short list of pieces that earn the rack',
      ],
    },
    proof: {
      items: [
        'Appointment only. No walk-in crush on the floor',
        'One fitting room, one stylist, one party',
        'Alterations stay in-house',
        'Center City, two blocks from a paid garage',
      ],
    },
    story: {
      heading: 'About',
      paragraphs: [
        'Atelier Ninth opened because too many bridal floors treat a fitting like a queue.',
        'The salon is small on purpose. If the gown cannot survive a sit-down dinner, it does not leave with you.',
      ],
    },
    experience: {
      items: [
        'Book online, arrive with the people who actually help you decide.',
        'You try, sit, walk, and look in a full-length that is not flattering on purpose.',
        'Pins get photographed. The alteration ticket is yours to keep.',
      ],
    },
    feature: {
      heading: 'The fitting is the product',
      text: 'A gown that photographs well on a hanger can still fail at a table. We fit for the night you will actually have.',
      cta: { label: 'Book a fitting', href: 'https://example.com/atelier-ninth/book' },
      imageIndex: 8,
    },
    catalog: {
      items: [
        { title: 'Appointments', href: 'https://example.com/atelier-ninth/book', imageIndex: 9 },
        { title: 'Alterations', href: 'https://example.com/atelier-ninth/alterations', imageIndex: 10 },
        { title: 'The salon', href: 'https://example.com/atelier-ninth/salon', imageIndex: 11 },
      ],
    },
    contact: {},
    closing: { cta: { label: 'Book a fitting', href: 'https://example.com/atelier-ninth/book' } },
    links: [
      { label: 'Book a fitting', href: 'https://example.com/atelier-ninth/book' },
      { label: 'Alterations', href: 'https://example.com/atelier-ninth/alterations' },
    ],
    images: demoImages('Atelier Ninth Bridal', [
      'Quiet bridal salon with a single gown on a stand',
      'Fitting room with a full-length mirror',
      'Detail of a silk train on a dark wood floor',
      'Pins along a hem during a fitting',
      'Veil rack in soft window light',
      'Stylist checking a shoulder seam',
      'Champagne and black seating nook',
      'Gown on a form after alterations',
      'Close-up of a button row',
      'Appointment desk with a date book',
      'Street view of the salon door',
      'Finished hem on a satin skirt',
    ]),
  },
  {
    slug: 'two-coats-painting',
    name: 'Two Coats Painting',
    city: 'Philadelphia',
    category: 'House Painting',
    vertical: 'Home Services',
    attitude: 'brutal',
    url: 'https://example.com/two-coats',
    phone: '215-555-0104',
    address: '2500 Demo Rd, Philadelphia, PA 19134',
    hours: 'Monday-Friday, 7am-4pm',
    description: 'Interior and exterior painting with a written two-coat spec. No foggy extras on the invoice.',
    noindex: true,
    schemaType: 'HomeAndConstructionBusiness',
    tagline: 'Prep hard. Two coats. Done.',
    marquee: ['Prep', 'Prime', 'Two coats', 'Kensington crew'],
    tokens: {
      paper: '#F2EFE6',
      ink: '#111111',
      accent: '#1F4B99',
      accent2: '#E23B2E',
      panel: '#D7D3C8',
      deep: '#0D0D0D',
      onAccent: '#FFFFFF',
      onAccent2: '#FFFFFF',
      onPanel: '#090909',
      onDeep: '#FFFFFF',
      border: '6px',
      radius: '0px',
    },
    fonts: { display: 'Archivo Black', displayFallback: 'Impact,sans-serif', text: 'Work Sans' },
    logo: false,
    hero: {
      eyebrow: 'Philadelphia | House Painting',
      headline: 'If it needs two coats, you get two coats.',
      sub: 'Two Coats Painting writes the spec before the first drop cloth. Prep is on the quote. Touch-ups after walkthrough are on us.',
      ctaPrimary: { label: 'Get a quote', href: 'https://example.com/two-coats/quote' },
      ctaSecondary: { label: 'Before and after', href: '#gallery' },
      glassFloat: { title: 'Written spec', sub: 'Prep, prime, two finish coats' },
    },
    offerings: {
      items: [
        'Interior walls, ceilings, and trim with a two-coat finish spec',
        'Exterior siding, soffits, and front steps that see weather',
        'Cabinet and door enamel when the kitchen is the whole job',
      ],
    },
    proof: {
      items: [
        'Quote names the coats, not just the rooms',
        'Fully insured, lead-safe work practices',
        'Color samples on your actual wall, not a chip in the truck',
        'Kensington, Fishtown, Port Richmond, and nearby',
      ],
    },
    story: {
      heading: 'About',
      paragraphs: [
        'The name is the spec. Too many paint jobs sell a color and skip the second coat when the light is bad.',
        'We still paint houses. We just write down the work so you can see it on the wall and on the invoice.',
      ],
    },
    experience: {
      items: [
        'Walkthrough, photos, and a room-by-room spec.',
        'Furniture is shifted, floors are covered, vents are taped.',
        'Final walk is with you, in daylight, with a wet-edge list if anything remains.',
      ],
    },
    feature: {
      heading: 'The before and after is the close',
      text: 'We photograph the room before tape goes up and after the second coat cures. That is the job record, not a marketing set.',
      cta: { label: 'Get a quote', href: 'https://example.com/two-coats/quote' },
      imageIndex: 8,
    },
    catalog: {
      items: [
        { title: 'Interiors', href: 'https://example.com/two-coats/interior', imageIndex: 9 },
        { title: 'Exteriors', href: 'https://example.com/two-coats/exterior', imageIndex: 10 },
        { title: 'Cabinets', href: 'https://example.com/two-coats/cabinets', imageIndex: 11 },
      ],
    },
    contact: {},
    closing: { cta: { label: 'Get a quote', href: 'https://example.com/two-coats/quote' } },
    links: [
      { label: 'Get a quote', href: 'https://example.com/two-coats/quote' },
      { label: 'Interiors', href: 'https://example.com/two-coats/interior' },
    ],
    images: demoImages('Two Coats Painting', [
      'Painter cutting a clean line along trim',
      'Room after the second coat in daylight',
      'Drop cloths and taped baseboard',
      'Exterior front of a rowhome mid-paint',
      'Cabinet doors on racks during enamel',
      'Color samples on a living room wall',
      'Before shot of a scuffed stair hall',
      'After shot of the same stair hall',
      'Close-up of a rolled wall with even sheen',
      'Crew van on a Kensington block',
      'Ladder set for a stairwell',
      'Finished porch ceiling',
    ]),
  },
  {
    slug: 'harbor-light-spa',
    name: 'Harbor Light Spa',
    city: 'Philadelphia',
    category: 'Wellness Spa',
    vertical: 'Health',
    attitude: 'glass',
    url: 'https://example.com/harbor-light',
    phone: '215-555-0105',
    address: '1200 Demo Pier, Philadelphia, PA 19106',
    hours: 'Tuesday-Sunday, 10am-8pm',
    description: 'Calm spa bookings near the waterfront. Massage, skin, and a short menu you can actually finish.',
    noindex: true,
    schemaType: 'DaySpa',
    tagline: 'Book the hour. Keep the hour.',
    marquee: ['Massage', 'Skin', 'Quiet rooms', 'Waterfront'],
    tokens: {
      paper: '#F6F3EE',
      ink: '#243038',
      accent: '#3D6B73',
      accent2: '#D4B48A',
      panel: '#E3E7E4',
      deep: '#1B2A30',
      onAccent: '#FFFFFF',
      onAccent2: '#090909',
      onPanel: '#090909',
      onDeep: '#FFFFFF',
      border: '1px',
      radius: '28px',
    },
    fonts: { display: 'Cormorant Garamond', displayFallback: 'Georgia,serif', text: 'Outfit' },
    logo: false,
    hero: {
      eyebrow: 'Philadelphia | Wellness Spa',
      headline: 'One primary action. Book the hour.',
      sub: 'Harbor Light keeps the menu short on purpose. Massage, skin, and enough quiet that the appointment is the treatment.',
      ctaPrimary: { label: 'Book now', href: 'https://example.com/harbor-light/book' },
      ctaSecondary: { label: 'The menu', href: '#offerings' },
      glassFloat: { title: 'Open hours', sub: 'Tuesday to Sunday, 10 to 8' },
    },
    offerings: {
      items: [
        'Swedish and deep-tissue massage in 60 or 90 minutes',
        'Facials for skin that lives in city air, not a 12-step kit',
        'Add-ons that are actually 15 minutes, not a hidden upsell hour',
      ],
    },
    proof: {
      items: [
        'Licensed therapists, private rooms, real sound control',
        'Online booking with the remaining times shown',
        'No membership maze to take a first appointment',
        'Waterfront block with garage validation on file',
      ],
    },
    story: {
      heading: 'About',
      paragraphs: [
        'Harbor Light is a small spa because a packed floor is not rest.',
        'The rooms stay few. The clock starts when you are on the table, not when the paperwork ends.',
      ],
    },
    experience: {
      items: [
        'Book the hour. Arrive 10 minutes early. Phones stay in the locker.',
        'Intake is one page. Pressure and scent get a real yes or no.',
        'You leave with water, a time of next availability, and nothing else to buy.',
      ],
    },
    feature: {
      heading: 'The hour is protected',
      text: 'We do not stack appointments so tightly that your 60 becomes 48. If the room is running late, you still get the minutes you paid for.',
      cta: { label: 'Book now', href: 'https://example.com/harbor-light/book' },
      imageIndex: 8,
    },
    catalog: {
      items: [
        { title: 'Massage', href: 'https://example.com/harbor-light/massage', imageIndex: 9 },
        { title: 'Skin', href: 'https://example.com/harbor-light/skin', imageIndex: 10 },
        { title: 'Book', href: 'https://example.com/harbor-light/book', imageIndex: 11 },
      ],
    },
    contact: {},
    closing: { cta: { label: 'Book now', href: 'https://example.com/harbor-light/book' } },
    links: [
      { label: 'Book now', href: 'https://example.com/harbor-light/book' },
      { label: 'Massage', href: 'https://example.com/harbor-light/massage' },
    ],
    images: demoImages('Harbor Light Spa', [
      'Quiet treatment room with low light',
      'Linen stack and a single chair',
      'Reception with a small booking screen',
      'Massage table ready with folded towels',
      'Facial steamer beside a sink',
      'Hall with frosted glass doors',
      'Tea service on a sideboard',
      'Window with a muted waterfront view',
      'Detail of oils in amber bottles',
      'Locker alcove',
      'Soft hallway lighting',
      'Finished room after reset',
    ]),
  },
  {
    slug: 'signal-street-ads',
    name: 'Signal Street Ads',
    city: 'Philadelphia',
    category: 'Local Advertising',
    vertical: 'Marketing',
    attitude: 'neon',
    url: 'https://example.com/signal-street',
    phone: '215-555-0106',
    address: '1600 Demo Plaza, Philadelphia, PA 19103',
    hours: 'Monday-Friday, 9am-5pm',
    description: 'Google Ads and Meta Ads for local service brands. One scoreboard, real leads, no blended dashboards.',
    noindex: true,
    schemaType: 'ProfessionalService',
    tagline: 'Local ads. Separate scoreboards.',
    marquee: ['Google Ads', 'Meta Ads', 'Lead quality', 'No blended dashboards'],
    tokens: {
      paper: '#0F1115',
      ink: '#F4F1EA',
      accent: '#6DFF9B',
      accent2: '#7AA2FF',
      panel: '#1A1F2A',
      deep: '#07080B',
      onPaper: '#F4F1EA',
      onAccent: '#090909',
      onAccent2: '#090909',
      onPanel: '#F4F1EA',
      onDeep: '#F4F1EA',
      border: '1px',
      radius: '16px',
    },
    fonts: { display: 'Oswald', displayFallback: 'Arial Black,sans-serif', text: 'IBM Plex Sans' },
    logo: false,
    hero: {
      eyebrow: 'Philadelphia | Local Advertising',
      headline: 'If the lead is not real, it does not count.',
      sub: 'Signal Street runs Google Ads and Meta Ads for local operators. Each account stays on its own scoreboard. Spend changes wait for approval.',
      ctaPrimary: { label: 'Book a call', href: 'https://example.com/signal-street/book' },
      ctaSecondary: { label: 'How we report', href: '#proof' },
      glassFloat: { title: 'Working rule', sub: 'No merged clients. No silent spend.' },
    },
    offerings: {
      items: [
        'Google Ads search and call tracking that ties to real intake',
        'Meta lead ads with form, phone, and CRM reconciliation',
        'Monthly reporting that names the source, not a blended graph',
      ],
    },
    proof: {
      items: [
        'One client, one scoreboard, no cross-account mixing',
        'Spend, creative, and campaign edits stay approval-gated',
        'Lead quality is checked against the actual inbox or CRM',
        'Built for local service, not generic ecommerce templates',
      ],
    },
    story: {
      heading: 'About',
      paragraphs: [
        'Signal Street exists because local ads die when dashboards get merged and nobody can say which phone call paid.',
        'The work is still ads. The standard is a lead you can name.',
      ],
    },
    experience: {
      items: [
        'Discovery call, access checklist, then a 14-day baseline.',
        'Weekly notes on search terms, form spam, and booked jobs.',
        'Nothing launches or scales without a written yes.',
      ],
    },
    feature: {
      heading: 'Reporting that can survive a client question',
      text: 'If you cannot point at the call, the form, or the booked job, the number does not go in the report.',
      cta: { label: 'Book a call', href: 'https://example.com/signal-street/book' },
      imageIndex: 8,
    },
    catalog: {
      items: [
        { title: 'Google Ads', href: 'https://example.com/signal-street/google', imageIndex: 9 },
        { title: 'Meta Ads', href: 'https://example.com/signal-street/meta', imageIndex: 10 },
        { title: 'Reporting', href: 'https://example.com/signal-street/reporting', imageIndex: 11 },
      ],
    },
    contact: {},
    closing: { cta: { label: 'Book a call', href: 'https://example.com/signal-street/book' } },
    links: [
      { label: 'Book a call', href: 'https://example.com/signal-street/book' },
      { label: 'Reporting', href: 'https://example.com/signal-street/reporting' },
    ],
    images: demoImages('Signal Street Ads', [
      'Dark dashboard with a single client scoreboard',
      'Search term review on a laptop',
      'Call tracking log with names redacted',
      'Meta ads manager cropped without account IDs',
      'Weekly note printed on a desk',
      'Local service van used as a campaign visual',
      'Whiteboard of campaign hypotheses',
      'Lead form quality checklist',
      'Calendar block for a client review',
      'Two monitors with separate brand files',
      'Phone on a stand during a tracking test',
      'Closed laptop at the end of a reporting day',
    ]),
  },
];

function demoImages(brand, alts) {
  return alts.map((alt, i) => ({
    file: `image-${i + 1}.webp`,
    alt: `${brand} placeholder: ${alt}`,
  }));
}

function writePlaceholderWebp(filePath, color) {
  const result = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-f',
      'lavfi',
      '-i',
      `color=c=${color}:s=1600x1066`,
      '-frames:v',
      '1',
      '-c:v',
      'libwebp',
      '-quality',
      '50',
      filePath,
    ],
    { stdio: 'pipe' },
  );
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || '').toString().slice(-400);
    throw new Error(`ffmpeg failed for ${filePath}: ${err}`);
  }
}

function writeHub(results) {
  const cards = results
    .map(
      (r) => `<a class="card" href="sites/${r.slug}/index.html"><strong>${r.name}</strong><span>${r.attitude} · ${r.category}</span></a>`,
    )
    .join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Variant review pack</title><style>
body{margin:0;font:16px/1.45 system-ui,sans-serif;background:#111;color:#f4f1ea}
main{max-width:980px;margin:0 auto;padding:48px 20px}
h1{font-size:clamp(2rem,5vw,3.4rem);margin:0 0 12px}
p{max-width:62ch;color:#cfc8bb}
.grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:28px}
.card{display:flex;flex-direction:column;gap:6px;padding:18px;border:1px solid #444;border-radius:14px;color:inherit;text-decoration:none;background:#1a1a1a}
.card:hover{border-color:#6dff9b}
.card span{color:#9aa;font-size:.9rem}
</style></head><body><main><h1>Variant review pack</h1><p>Original factory candidates for the Variant stack decision. Private staging. Noindex. Not Variant exports and not client sites.</p><div class="grid">${cards}</div></main></body></html>`;
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
}

function main() {
  fs.mkdirSync(BRIEFS, { recursive: true });
  fs.mkdirSync(SITES, { recursive: true });
  const colors = ['#C45C26', '#4F7A3C', '#8A5A44', '#1F4B99', '#3D6B73', '#6DFF9B', '#E2B84A', '#C47A2C', '#C9A36A', '#E23B2E', '#D4B48A', '#7AA2FF'];
  const results = [];
  for (const brief of briefs) {
    const briefPath = path.join(BRIEFS, `${brief.slug}.json`);
    fs.writeFileSync(briefPath, JSON.stringify(brief, null, 2) + '\n');
    const built = buildSite(brief, SITES);
    const assetDir = path.join(built.outDir, 'assets');
    for (let i = 1; i <= 12; i += 1) {
      writePlaceholderWebp(path.join(assetDir, `image-${i}.webp`), colors[i - 1]);
    }
    results.push({
      slug: brief.slug,
      name: brief.name,
      attitude: brief.attitude,
      category: brief.category,
      htmlBytes: built.htmlBytes,
      missingAssets: built.missingAssets,
    });
    console.log(`built ${brief.slug} ${(built.htmlBytes / 1024).toFixed(1)} KB missing=${built.missingAssets.join(',') || 'none'}`);
  }
  writeHub(results);
  fs.writeFileSync(path.join(ROOT, 'pack-summary.json'), JSON.stringify({ generated_at: new Date().toISOString(), results }, null, 2) + '\n');
}

main();
