'use strict';

/**
 * Image intent for the 138-site unslop pass.
 *
 * Services, medical, auto, legal, wellness: people doing the actual work.
 * Food: the food, the pass, the kitchen — chefs only when they are plating.
 * Nothing random. Every slot has a job on the page.
 */

const FOOD_RE =
  /\b(tacos?|pizza|pizzeria|deli|grill|bistro|restaurant|hibachi|sushi|chinese|thai|hot\s?dogs?|creamery|diner|hoagie|bakery|coffee|cafe|kafe|pubs?|ale\b|steaks?|pasta|gourmet|inns?|wine|cheese|distill|still works|brewery|asian)/i;

const SLUG_FAMILY = {
  katana: 'food',
  'eastern-dragon': 'food',
  'sesame-inn': 'food',
  'wholly-grounds': 'food',
  'scott-lot': 'auto',
  'sciacca-service-center': 'auto',
  'j-pro-inc': 'trade',
  'pipe-xpress': 'trade',
  'novacare': 'fitness',
  'udis-conn-orthodontics': 'dental',
  'andorra-family-dentistry': 'dental',
  'colmar-dentistry-for-kids': 'dental',
  'hero-complex': 'retail',
  'frazer-antiques': 'retail',
  'benjamin-lovell-shoes': 'retail',
  'legacy-jewelers': 'retail',
  'floral-and-hardy': 'retail',
  'the-restaurant-store': 'trade',
};

const PEOPLE_FAMILIES = {
  bridal: /\b(bridal|formal|gown|wedding dress)/i,
  dental: /\b(dental|dentist|orthodont|teeth|smile)/i,
  veterinary: /\b(vets?\b|veterinary|animal hospital|animal clinic|pets?\b)/i,
  auto: /\b(auto|car wash|tires?|motors?|chevrolet|buick|ferrari|pre-owned|garage|mechanic|auto parts|tag & insurance|auto tag)/i,
  legal: /\b(attorney|law\b|llp|p\.c\.|injury|insurance|wealth|financial|tax\b)/i,
  salon: /\b(nail|hair|tattoo|salon|beauty)/i,
  fitness: /\b(fitness|gym|physical therapy|rehab|train and nourish|hormone)/i,
  medical: /\b(urgent care|health|vision|eye care|eyecare|surgery|pediatric|clinic|hospital)/i,
  trade: /\b(electric|hvac|plumb|pools?|fabricat|manufactur|supply|floor|landscap|iron|fireplace|hot tub|seal|heating|air.conditioning|propane)/i,
  retail: /\b(book|jewelry|jewel|shoe|antique|consignment|outlet|florist|floral|greenhouse|violin|kitchen and bath|bath & kitchen)/i,
  professional: /\b(it |tech|marketing|transport|realty|real estate|home cash|post, llc)/i,
};

function familyFor(name, extra = '') {
  const hay = `${name} ${extra}`;
  const slug = String(extra || '')
    .trim()
    .toLowerCase();
  if (SLUG_FAMILY[slug]) return SLUG_FAMILY[slug];
  // Supply houses named "Restaurant Store" are trade, not kitchens.
  if (!/restaurant store/i.test(hay) && FOOD_RE.test(hay)) return 'food';
  // Veterinary before medical so "Vets & Urgent Care" stays animals, not a clinic.
  const order = [
    'bridal',
    'dental',
    'veterinary',
    'auto',
    'legal',
    'fitness',
    'trade',
    'salon',
    'retail',
    'medical',
    'professional',
  ];
  for (const family of order) {
    if (PEOPLE_FAMILIES[family] && PEOPLE_FAMILIES[family].test(hay)) return family;
  }
  return 'professional';
}

function modeFor(family) {
  return family === 'food' ? 'food' : 'people';
}

function foodPlate(name) {
  const n = name;
  if (/taco/i.test(n)) return 'street-style tacos on a warm corn tortilla with cilantro, onion, and salsa, restaurant lighting';
  if (/pizza|pizzeria/i.test(n)) return 'wood-fired pizza with blistered leopard-spotted crust on a peel';
  if (/hibachi|sushi/i.test(n)) return 'hibachi or sushi plate: glistening rice, seared protein, and precise garnish';
  if (/thai/i.test(n)) return 'Thai curry or noodle dish in a ceramic bowl with herbs and chili oil';
  if (/chinese|dragon|peking|sesame|eastern/i.test(n)) return 'Chinese banquet plate: wok-seared vegetables and protein, steam rising';
  if (/hoagie/i.test(n)) return 'seeded hoagie roll stacked with meats, oil, and shredded lettuce';
  if (/hot\s?dog/i.test(n)) return 'griddled hot dog on a toasted bun with mustard and relish';
  if (/deli/i.test(n)) return 'deli sandwich cut on butcher paper with pickles and a side';
  if (/diner/i.test(n)) return 'diner breakfast plate: eggs, toast, and a coffee mug, morning light';
  if (/coffee|grounds/i.test(n)) return 'freshly pulled espresso and pastry on a cafe counter';
  if (/creamery/i.test(n)) return 'scooped ice cream or bottled cream on a chilled metal counter';
  if (/wine|cheese/i.test(n)) return 'cheese board and open wine bottle on a wooden tasting counter';
  if (/still|distill|brew|ale/i.test(n)) return 'poured pint or spirit in glass beside copper stills or tap handles';
  if (/katana/i.test(n)) return 'Japanese plated dish: grilled fish or ramen bowl, steam, dark ceramic';
  return `signature plated dish from ${n}`;
}

/**
 * Five intentional slots. Order is hero → process → relationship → place → craft.
 * Food swaps relationship for dining and process for kitchen.
 */
function scenesFor(family, name) {
  const n = name;
  const plate = foodPlate(n);
  const people = {
    bridal: [
      `Bridal stylist helping a client into a gown in a small-town formal shop, natural window light, no text`,
      `Seamstress at a sewing table with ivory fabric and pins, working hands, no text`,
      `Consultant and client reviewing dress options in a quiet fitting room, no text`,
      `Boutique interior with gowns on a rack and a person walking the aisle, no text`,
      `Close-up of skilled hands adjusting a bodice or veil, no logos`,
    ],
    dental: [
      `Dentist in a modern operatory talking with a seated patient, calm clinical light, no text`,
      `Hygienist providing a cleaning with focused hands and instruments, no text`,
      `Front-desk coordinator welcoming a family in a dental reception, no text`,
      `Bright dental treatment room with a clinician preparing a tray, no text`,
      `Close-up of gloved hands working carefully at a dental chair, no logos`,
    ],
    veterinary: [
      `Veterinarian examining a dog on a table with a technician assisting, no text`,
      `Vet tech comforting a cat in a clean exam room, no text`,
      `Receptionist greeting a pet owner holding a leash in a clinic lobby, no text`,
      `Clinic treatment area with a clinician at work, no text`,
      `Close-up of a veterinarian's hands checking an animal's ear or paw, no logos`,
    ],
    auto: [
      `Technician in work shirt inspecting a vehicle on the shop floor, no text`,
      `Mechanic under a hood with tools, real garage, no text`,
      `Service advisor with a customer beside a car in the drive lane, no text`,
      `Shop bay with a person walking a car into service, no text`,
      `Close-up of skilled hands on a wheel, battery, or diagnostic tool, no logos`,
    ],
    legal: [
      `Advisor in professional attire seated with a client at a conference table, no text`,
      `Attorney reviewing documents at a desk with natural office light, no text`,
      `Two people in a calm consultation, listening, no text`,
      `Reception of a small professional office with a person arriving, no text`,
      `Close-up of hands over a folder and pen during a meeting, no logos`,
    ],
    salon: [
      `Stylist working on a client's hair or nails in a real salon station, no text`,
      `Artist focused on a service in progress, hands and tools visible, no text`,
      `Client and stylist talking in the chair, relaxed, no text`,
      `Salon interior with a person at the front desk, no text`,
      `Close-up of skilled hands during the service, no logos`,
    ],
    fitness: [
      `Trainer coaching a client through a lift or stretch in a gym, no text`,
      `Therapist guiding a patient's shoulder or knee in a clinic, no text`,
      `Two people reviewing a plan on a clipboard after a session, no text`,
      `Training floor with a coach walking the room, no text`,
      `Close-up of spotting hands or a resistance band in use, no logos`,
    ],
    medical: [
      `Clinician speaking with a patient in an exam room, no text`,
      `Nurse taking vitals with a calm bedside manner, no text`,
      `Front desk checking in a visitor, no text`,
      `Clinic corridor with a provider walking toward a room, no text`,
      `Close-up of gloved hands preparing a clean instrument tray, no logos`,
    ],
    trade: [
      `Tradesperson in branded workwear on a jobsite or in a shop, no text`,
      `Technician working with tools on equipment or landscape, no text`,
      `Crew lead talking with a homeowner at the door or yard, no text`,
      `Van or shop with a person loading materials, no text`,
      `Close-up of skilled hands on the actual trade work, no logos`,
    ],
    retail: [
      `Associate helping a customer choose an item in the shop, no text`,
      `Craftsperson or buyer handling the product with care, no text`,
      `Two people at the counter during a purchase conversation, no text`,
      `Store interior with a person browsing, no text`,
      `Close-up of hands presenting the product, no logos`,
    ],
    professional: [
      `Specialist in a work setting talking with a client, no text`,
      `Person at a workstation doing the actual service, no text`,
      `Two colleagues reviewing a plan, no text`,
      `Office or shop entrance with a person arriving, no text`,
      `Close-up of hands on the tools of this trade, no logos`,
    ],
    food: [
      `Photoreal ${plate}, steam, natural restaurant light, no people faces required, no text, no logos`,
      `Chef plating that same kind of food at the pass in a working kitchen for ${n}, hands and food sharp, no text`,
      `Prep: raw ingredients and a cook's hands on the board for ${n}, no faces required, no text`,
      `Dining counter or table set with ${plate}, empty seats, warm room light, no text`,
      `Extreme close-up of the food texture for ${n} — crust, broth, grill marks, or fresh garnish, no logos`,
    ],
  };
  return people[family] || people.professional;
}

function captionsFor(family) {
  if (family === 'food') {
    return [
      { kicker: 'The plate', line: 'Food first. The kitchen stays honest.' },
      { kicker: 'The pass', line: 'Hands, heat, and the ticket.' },
      { kicker: 'Prep', line: 'What goes on the board before the fire.' },
      { kicker: 'The room', line: 'A table worth sitting down for.' },
      { kicker: 'The craft', line: 'Close enough to taste the work.' },
    ];
  }
  return [
    { kicker: 'The people', line: 'The work starts with who shows up.' },
    { kicker: 'The process', line: 'Hands on the actual job.' },
    { kicker: 'The conversation', line: 'A real visit, not a stock handshake.' },
    { kicker: 'The place', line: 'The room where the work happens.' },
    { kicker: 'The craft', line: 'Close on the skill, not the slogan.' },
  ];
}

function attitudeFor(slug, family) {
  const order = ['editorial', 'warm', 'glass', 'industrial', 'brutal', 'neon'];
  let h = 0;
  for (const ch of slug) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  if (family === 'food') return ['warm', 'editorial', 'brutal'][h % 3];
  if (family === 'trade' || family === 'auto') return ['industrial', 'brutal', 'warm'][h % 3];
  if (family === 'legal' || family === 'professional') return ['editorial', 'glass', 'warm'][h % 3];
  if (family === 'salon') return ['neon', 'warm', 'glass'][h % 3];
  return order[h % order.length];
}

function fontPairFor(slug, family) {
  const pairs = [
    { display: 'Fraunces', text: 'Source Sans 3', displayFallback: 'Georgia,serif' },
    { display: 'Newsreader', text: 'Figtree', displayFallback: 'Georgia,serif' },
    { display: 'Syne', text: 'Figtree', displayFallback: 'Arial,sans-serif' },
    { display: 'Bricolage Grotesque', text: 'Manrope', displayFallback: 'Arial,sans-serif' },
    { display: 'Alegreya', text: 'Karla', displayFallback: 'Georgia,serif' },
    { display: 'Bodoni Moda', text: 'Urbanist', displayFallback: 'Georgia,serif' },
  ];
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  if (family === 'food') return pairs[h % 2];
  if (family === 'trade') return pairs[2];
  return pairs[h % pairs.length];
}

module.exports = {
  familyFor,
  modeFor,
  scenesFor,
  captionsFor,
  attitudeFor,
  fontPairFor,
  foodPlate,
};
