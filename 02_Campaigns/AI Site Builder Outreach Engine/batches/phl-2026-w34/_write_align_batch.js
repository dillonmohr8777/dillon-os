#!/usr/bin/env node
/**
 * phl-2026-w34: next 25 radar rebuilds, Align HCM industry-solutions mirror.
 * Animated (not photoreal) teal illustrations. Facts from harvest/research only.
 */
const fs = require('fs');
const path = require('path');
const { buildSvg, uniqueTokens } = require('../../../../_templates/site-factory/lib/align-illustrations.js');

const BATCH = path.join(__dirname);
const BRIEFS = path.join(BATCH, 'briefs');
const SITES = path.join(BATCH, 'sites');

function imgs(alts) {
  return alts.map((alt, i) => ({ file: `image-${i + 1}.svg`, alt }));
}

function brief(partial) {
  const tokens = uniqueTokens(partial.slug);
  const alts = Array.from({ length: 13 }, (_, i) =>
    `Animated Align-teal illustration of ${partial.category.toLowerCase()} work, frame ${i + 1}, generated not photographed`
  );
  return {
    noindex: true,
    schemaType: 'LocalBusiness',
    logo: false,
    attitude: 'align',
    fonts: {
      display: 'Plus Jakarta Sans',
      displayFallback: 'system-ui,sans-serif',
      text: 'DM Sans',
    },
    tokens,
    nav: [
      { label: 'Work', href: '#offerings' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'Visit', href: '#visit' },
    ],
    images: imgs(alts),
    ...partial,
  };
}

const S = [];

S.push(brief({
  slug: 'pennsylvania-dental-group', name: 'Pennsylvania Dental Group', city: 'Philadelphia',
  category: 'General and cosmetic dentistry', vertical: 'Health',
  url: 'https://www.padentalgroup.com/', phone: '(215) 387-0883',
  address: '3700 Market Street, Suite 101, Philadelphia, PA 19104',
  hours: 'Monday-Thursday 7am-5pm, Friday 7am-3pm',
  description: 'General and cosmetic dentistry in University City and Center City. Pennsylvania Dental Group has served Philadelphia for over 45 years.',
  marquee: ['University City', 'Center City', 'General', 'Cosmetic', 'Hygiene'],
  hero: { eyebrow: 'Philadelphia | Family of practices', headline: 'Gentle quality care, 45 years in', sub: 'Pennsylvania Dental Group treats University City and Center City with the same plan they would want for themselves. Call Market Street or South Street and sit with a team that still talks like neighbors.', ctaPrimary: { label: 'Book University City', href: 'https://www.padentalgroup.com/' }, ctaSecondary: { label: 'Call the office', href: 'tel:2153870883' }, glassFloat: { title: 'University City', sub: '3700 Market St' }, marquee: ['General', 'Cosmetic', 'Hygiene', 'Saving plans'] },
  offerings: { heading: 'Care that stays on one floor.', kicker: 'Where we help', items: ['General dentistry that restores function before it chases a photo.', 'Cosmetic work planned so the bite still works when you leave.', 'Hygiene visits that keep the same chair, the same faces, the same plan.'] },
  gallery: { heading: 'Rooms built for a long visit.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'A top Philadelphia dentist, still local', paragraphs: ['Pennsylvania Dental Group has practiced in Philadelphia for over 45 years. The claim on their site is gentle quality care, and the offices still sit where people actually live and work.', 'University City is 3700 Market Street, Suite 101. Center City is 1740 South Street, Suite 504. Call (215) 387-0883 for Market Street or (215) 545-6334 for South Street. Confirm hours on the official site before you drive.'], imageIndex: 2 },
  experience: { heading: 'Support that moves from clarity to capability.', items: ['You register as a new patient online, then you walk into a room that already has your chart.', 'Treatment is explained in plain language before anything starts.', 'Follow-up is a real person at the desk, not a portal maze.'] },
  feature: { heading: 'No insurance. They still have a path.', text: 'Dental saving plans on the official site cut fees without deductibles, waiting periods, or claim denials. Ask the front desk which plan fits the work you actually need.', cta: { label: 'See patient info', href: 'https://www.padentalgroup.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Two offices, one standard', text: 'West Philadelphia and South Philadelphia share the same doctors and the same promise. Pick the chair that is closer to your day.', imageIndex: 13, cta: { label: 'Find an office', href: 'https://www.padentalgroup.com/contact/' } },
  catalog: { heading: 'Ways into care.', items: [{ title: 'University City', href: 'https://www.padentalgroup.com/', imageIndex: 9 }, { title: 'Center City', href: 'https://www.padentalgroup.com/', imageIndex: 10 }, { title: 'New patient forms', href: 'https://www.padentalgroup.com/', imageIndex: 11 }] },
  contact: { heading: 'Make the next visit easy.', sub: 'Start at 3700 Market Street, Suite 101. Confirm Center City hours on the official site.' },
  closing: { heading: 'Pennsylvania Dental Group', cta: { label: 'Book University City', href: 'https://www.padentalgroup.com/' } },
  links: [{ label: 'Official site', href: 'https://www.padentalgroup.com/' }, { label: 'Call', href: 'tel:2153870883' }],
}));

S.push(brief({
  slug: 'havercrown-dental', name: 'HaverCrown Dental', city: 'Havertown',
  category: 'Family dentistry', vertical: 'Health',
  url: 'https://www.havercrowndental.com/', phone: '(610) 446-6688',
  address: '100 S Eagle Rd, Havertown, PA 19083',
  description: 'Family-owned dentistry on South Eagle Road in Havertown. Dr. Shafagh and the team keep modern care in a comforting room.',
  marquee: ['Havertown', 'Family owned', 'Eagle Road', 'Modern care'],
  hero: { eyebrow: 'Havertown | Family dentistry', headline: 'Your best interests, on Eagle Road', sub: 'HaverCrown Dental is a local, family-owned practice. Dr. Shafagh and the team take the time to make the chair feel like a neighborhood office, not a mill.', ctaPrimary: { label: 'Call the office', href: 'tel:6104466688' }, ctaSecondary: { label: 'Open the official site', href: 'https://www.havercrowndental.com/' }, glassFloat: { title: '100 S Eagle Rd', sub: 'Havertown 19083' } },
  offerings: { heading: 'Modern care, comforting rooms.', items: ['Family dentistry for the people who already live in 19083.', 'Time in the chair for concerns you have been putting off.', 'A local team that still answers the phone at (610) 446-6688.'] },
  gallery: { heading: 'Light, linen, a calm wait.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Family owned on purpose', paragraphs: ['Welcome to HaverCrown Dental, where they say they have your best interests at heart. The office sits at 100 S Eagle Rd in Havertown.', 'Call (610) 446-6688. Confirm hours on the official site before you drive. The site itself is dated. The care is the reason people still call.'], imageIndex: 2 },
  experience: { heading: 'How a visit should go.', items: ['You call. A person picks up.', 'You sit. They listen before they plan.', 'You leave with a next step you can keep.'] },
  feature: { heading: 'Comfort is the first clinical tool', text: 'Dr. Shafagh and the team treat the fear of the chair as part of the job. That is the whole pitch, and it is the one a family office has to earn every Tuesday.', cta: { label: 'Call Havertown', href: 'tel:6104466688' }, imageIndex: 8 },
  spotlight: { heading: 'Havertown, not a chain lobby', text: 'Family-owned means the same faces at the desk. Bring the kids, bring the questions, bring the old x-rays.', imageIndex: 13, cta: { label: 'Get directions', href: 'https://www.google.com/maps/search/?api=1&query=100+S+Eagle+Rd+Havertown+PA' } },
  catalog: { items: [{ title: 'Call the desk', href: 'tel:6104466688', imageIndex: 9 }, { title: 'Official site', href: 'https://www.havercrowndental.com/', imageIndex: 10 }, { title: 'Map the office', href: 'https://www.google.com/maps/search/?api=1&query=100+S+Eagle+Rd+Havertown+PA', imageIndex: 11 }] },
  contact: { heading: 'Find the office.', sub: '100 S Eagle Rd, Havertown. Confirm hours before you drive.' },
  closing: { cta: { label: 'Call the office', href: 'tel:6104466688' } },
  links: [{ label: 'Call', href: 'tel:6104466688' }, { label: 'Official site', href: 'https://www.havercrowndental.com/' }],
}));

S.push(brief({
  slug: 'always-dental-care', name: 'Always Dental Care', city: 'Phoenixville',
  category: 'Family and cosmetic dentistry', vertical: 'Health',
  url: 'https://www.alwaysdentalcare.com/', phone: '484.392.7687',
  address: '1570 Egypt Rd #210, Phoenixville, PA 19460',
  hours: 'Monday-Thursday 9am-6pm, Wednesday 9am-5pm, Friday 9am-1pm every other week',
  description: 'Family and cosmetic dentistry in Phoenixville with Truong Nguyen, DDS. Implants, whitening, fillings, and evening hours.',
  marquee: ['Phoenixville', 'Dr. Nguyen', 'Implants', 'Family care'],
  hero: { eyebrow: 'Phoenixville | Family and cosmetic', headline: 'Family care by Truong Nguyen, DDS', sub: 'Always Dental Care treats Phoenixville, Oaks, and the towns around Egypt Road. Late evenings and a Saturday once a month so the visit fits a real week.', ctaPrimary: { label: 'Call the office', href: 'tel:4843927687' }, ctaSecondary: { label: 'Open the site', href: 'https://www.alwaysdentalcare.com/' }, glassFloat: { title: 'Behind the Wawa', sub: 'Egypt Rd #210' } },
  offerings: { heading: 'Implants, general, cosmetic.', items: ['Dental implants that replace the tooth and the root as one plan.', 'General care for kids, parents, and the people who have been skipping cleanings.', 'Cosmetic work when you want the smile to match the rest of the day.'] },
  gallery: { heading: 'A room that tries to feel easy.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Eleven years on Egypt Road', paragraphs: ['Dr. Truong Nguyen has practiced in Phoenixville and the towns around it for 11 years. NYU College of Dentistry, residency at Wyckoff Heights. Soccer, bowling, family, and a chair that tries not to scare you.', 'The office is 1570 Egypt Rd #210, behind the Wawa, next to Hand and Stone. Call 484.392.7687. Confirm Friday hours. They run every other Friday.'], imageIndex: 2 },
  experience: { heading: 'Built around a busy week.', items: ['Evening hours most weekdays so you are not begging for a lunch slot.', 'A Saturday once a month when the weekday will not give.', 'Emergency care when a tooth will not wait for the calendar.'] },
  feature: { heading: 'Implants as a permanent part of the smile', text: 'Ask Dr. Nguyen about implants when you are missing a tooth. The pitch on the site is simple: replace the tooth and the root so the smile stays.', cta: { label: 'See services', href: 'https://www.alwaysdentalcare.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Oaks, Pottstown, King of Prussia', text: 'The site names the towns they actually serve. If you can reach Egypt Road, you can reach the chair.', imageIndex: 13, cta: { label: 'Contact', href: 'https://www.alwaysdentalcare.com/contact/' } },
  catalog: { items: [{ title: 'Implants', href: 'https://www.alwaysdentalcare.com/', imageIndex: 9 }, { title: 'Family care', href: 'https://www.alwaysdentalcare.com/', imageIndex: 10 }, { title: 'Contact', href: 'https://www.alwaysdentalcare.com/contact/', imageIndex: 11 }] },
  contact: { heading: 'Park behind the Wawa.', sub: '1570 Egypt Rd #210, Phoenixville. Confirm Friday hours before you drive.' },
  closing: { cta: { label: 'Call the office', href: 'tel:4843927687' } },
  links: [{ label: 'Call', href: 'tel:4843927687' }, { label: 'Official site', href: 'https://www.alwaysdentalcare.com/' }],
}));

S.push(brief({
  slug: 'colmar-dentistry-for-kids', name: 'Colmar Dentistry For Kids', city: 'Montgomeryville',
  category: 'Pediatric dentistry', vertical: 'Health',
  url: 'https://www.colmarkids.com/',
  address: '671 Bethlehem Pike, Montgomeryville, PA 18936',
  description: 'Pediatric dentistry in Montgomeryville with Dr. Kathryn Leahey, DMD. A dental home for kids who still need the visit to feel kind.',
  marquee: ['Kids first', 'Bethlehem Pike', 'Dr. Leahey', 'Montgomeryville'],
  hero: { eyebrow: 'Montgomeryville | Pediatric dentistry', headline: 'A dental home for kids', sub: 'Dr. Kathryn Leahey is the pediatric dentist at Colmar Dentistry For Kids. The job is good oral habits that last, taught without rushing a nervous child.', ctaPrimary: { label: 'Request a visit', href: 'https://www.colmarkids.com/' }, ctaSecondary: { label: 'Open the site', href: 'https://www.colmarkids.com/' }, glassFloat: { title: '671 Bethlehem Pike', sub: 'Montgomeryville' } },
  offerings: { heading: 'Built for children, not a scaled-down adult chair.', items: ['Pediatric exams that teach habits instead of scolding them.', 'A first visit planned so the room feels known before the work starts.', 'Conservative options when a child needs treatment, not a sales ladder.'] },
  gallery: { heading: 'Color, calm, a smaller scale.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Welcome to the practice', paragraphs: ['Dr. Kathryn Leahey is the friendly, experienced pediatric dentist named on the homepage. Colmar Dentistry For Kids sits at 671 Bethlehem Pike in Montgomeryville.', 'The site is thin. The promise is not. Bring the child, ask the questions, leave with a habit they can keep.'], imageIndex: 2 },
  experience: { heading: 'What the first visit is for.', items: ['The room is introduced before the tools.', 'Parents stay when the child needs them in the chair.', 'The plan is prevention first, treatment when it earns its place.'] },
  feature: { heading: 'Habits that outlast the sticker', text: 'The homepage says she will help them learn good oral habits so they can enjoy a beautiful smile for a lifetime. That is the work. The sticker is extra.', cta: { label: 'Request an appointment', href: 'https://www.colmarkids.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Montgomeryville and the towns around it', text: 'If Bethlehem Pike is on the way home from school, this is the dental home that fits the route.', imageIndex: 13, cta: { label: 'Open the site', href: 'https://www.colmarkids.com/' } },
  catalog: { items: [{ title: 'Meet Dr. Leahey', href: 'https://www.colmarkids.com/', imageIndex: 9 }, { title: 'Request a visit', href: 'https://www.colmarkids.com/', imageIndex: 10 }, { title: 'Find the office', href: 'https://www.google.com/maps/search/?api=1&query=671+Bethlehem+Pike+Montgomeryville+PA', imageIndex: 11 }] },
  contact: { heading: 'Find the kids office.', sub: '671 Bethlehem Pike, Montgomeryville. Confirm hours on the official site.' },
  closing: { cta: { label: 'Request a visit', href: 'https://www.colmarkids.com/' } },
  links: [{ label: 'Official site', href: 'https://www.colmarkids.com/' }],
}));

S.push(brief({
  slug: 'glen-eagle-pediatric-dentistry', name: 'Glen Eagle Pediatric Dentistry', city: 'Glen Mills',
  category: 'Pediatric dentistry', vertical: 'Health',
  url: 'https://gleneaglepediatricdentistry.com/', phone: '(484) 639-9066',
  address: '589 Wilmington West Chester Pike, Glen Mills, PA 19342',
  hours: 'Patient visits Tuesday through Thursday, 8am-5pm',
  description: 'Pediatric dentistry in Glen Mills with Dr. Marc. A dental home for kids across Delaware County, with parents welcome in the room.',
  marquee: ['Glen Mills', 'Dr. Marc', 'Delaware County', 'Kids first'],
  hero: { eyebrow: 'Glen Mills | Pediatric dentistry', headline: 'We know kids', sub: 'Glen Eagle Pediatric Dentistry treats children of all ages, including kids with different needs. Dr. Marc builds the visit so a nervous four-year-old can look forward to coming back.', ctaPrimary: { label: 'Call the office', href: 'tel:4846399066' }, ctaSecondary: { label: 'Open the site', href: 'https://gleneaglepediatricdentistry.com/' }, glassFloat: { title: 'Dr. Marc', sub: 'Glen Mills' } },
  offerings: { heading: 'A dental home, not a one-off cleaning.', items: ['Prevention and education for the whole family, with parents welcome in the room.', 'Conservative treatment when a child actually needs it.', 'A first visit that includes a tour so the rooms feel known.'] },
  gallery: { heading: 'A room kids will walk back into.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Meet Dr. Marc', paragraphs: ['Dr. Marc took a Master of Public Health at West Chester University and a DDS at NYU, then chose pediatric dentistry on purpose. The site says every child deserves a positive dental experience.', 'The office is 589 Wilmington West Chester Pike in Glen Mills. Call (484) 639-9066. Patient appointments run Tuesday through Thursday. Serving Glen Mills, Aston, Chadds Ford, West Chester, and Delaware County.'], imageIndex: 2 },
  experience: { heading: 'How they settle a first visit.', items: ['A tour of each room before the work starts.', 'Parents stay. The reviews keep naming that.', 'The plan is explained to the child, not around the child.'] },
  feature: { heading: 'Parents in the room, on purpose', text: 'The practice says parents are welcome during appointments. Reviews from Amyan, Melissa, Jess, and Ellie all land on the same point: the staff made a first visit feel like a visit, not a trial.', cta: { label: 'Read the story', href: 'https://gleneaglepediatricdentistry.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Delaware County, one dental home', text: 'Glen Mills is the chair. Aston, Chadds Ford, and West Chester are the drive. The work is the same.', imageIndex: 13, cta: { label: 'Contact', href: 'https://gleneaglepediatricdentistry.com/contact-us/' } },
  catalog: { items: [{ title: 'Meet Dr. Marc', href: 'https://gleneaglepediatricdentistry.com/', imageIndex: 9 }, { title: 'First visit', href: 'https://gleneaglepediatricdentistry.com/', imageIndex: 10 }, { title: 'Contact', href: 'https://gleneaglepediatricdentistry.com/contact-us/', imageIndex: 11 }] },
  contact: { heading: 'Make the next visit easy.', sub: '589 Wilmington West Chester Pike, Glen Mills. Patient visits Tuesday through Thursday.' },
  closing: { cta: { label: 'Call the office', href: 'tel:4846399066' } },
  links: [{ label: 'Call', href: 'tel:4846399066' }, { label: 'Official site', href: 'https://gleneaglepediatricdentistry.com/' }],
}));

S.push(brief({
  slug: 'chestnut-hill-animal-hospital', name: 'Chestnut Hill Animal Hospital', city: 'Erdenheim',
  category: 'Veterinary hospital', vertical: 'Health',
  url: 'http://chestnuthillvet.com/', phone: '215-836-2950',
  address: '903 Bethlehem Pike, Erdenheim, PA 19038',
  description: 'Veterinary hospital in Erdenheim since 1974. Traditional medicine, surgery, rehab, and complementary care for the animals you actually live with.',
  marquee: ['Since 1974', 'Bethlehem Pike', 'Rehab', 'Surgery'],
  hero: { eyebrow: 'Erdenheim | Veterinary hospital', headline: 'Honor the bond. Treat the animal.', sub: 'Chestnut Hill Animal Hospital has been on Bethlehem Pike since 1974. Cats, dogs, birds, rabbits, and the rest of the house. Call 215-836-2950.', ctaPrimary: { label: 'Call the hospital', href: 'tel:2158362950' }, ctaSecondary: { label: 'Open the site', href: 'http://chestnuthillvet.com/' }, glassFloat: { title: 'Since 1974', sub: '903 Bethlehem Pike' } },
  offerings: { heading: 'Medicine, surgery, rehab, in one hospital.', items: ['Traditional medical and surgical care for the animals you brought in.', 'Rehab, fitness, and pain management with certified people on the floor.', 'Complementary tools when they earn a place: laser, acupuncture, herbs, diet.'] },
  gallery: { heading: 'A hospital that still feels like a practice.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Established in 1974', paragraphs: ['Chestnut Hill Animal Hospital sits at 903 Bethlehem Pike in Erdenheim. The homepage is a table layout from another decade. The work is not.', 'They care for cats, dogs, birds, ferrets, reptiles, fish, rabbits, and small mammals. Specialist work in the building includes ultrasound, radiology, cardiology, surgery, and dentistry. Call 215-836-2950.'], imageIndex: 2 },
  experience: { heading: 'How a visit moves.', items: ['You call. They tell you if it is wellness, sick, or rehab.', 'In-house lab, ECG, blood pressure, and radiographs so the work stays in the building.', 'Nutrition, exercise, and mental stimulation sit next to the medical plan.'] },
  feature: { heading: 'Rehab in the same building as surgery', text: 'Certified rehab and pain management live on the same floor as the surgical suite. You are not driving a recovering dog across the county for the second half of the plan.', cta: { label: 'See services', href: 'http://chestnuthillvet.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Creatures great and small', text: 'The site lists the species on purpose. If it lives in your house, ask if they will see it.', imageIndex: 13, cta: { label: 'Call', href: 'tel:2158362950' } },
  catalog: { items: [{ title: 'Services', href: 'http://chestnuthillvet.com/', imageIndex: 9 }, { title: 'Rehab', href: 'http://chestnuthillvet.com/', imageIndex: 10 }, { title: 'Contact', href: 'http://chestnuthillvet.com/', imageIndex: 11 }] },
  contact: { heading: 'Find the hospital.', sub: '903 Bethlehem Pike, Erdenheim. Confirm hours on the official site.' },
  closing: { cta: { label: 'Call the hospital', href: 'tel:2158362950' } },
  links: [{ label: 'Call', href: 'tel:2158362950' }, { label: 'Official site', href: 'http://chestnuthillvet.com/' }],
}));

S.push(brief({
  slug: 'county-line-veterinary-hospital', name: 'County Line Veterinary Hospital', city: 'Hatboro',
  category: 'Veterinary hospital', vertical: 'Health',
  url: 'https://countylineveterinary.com/', phone: '(215) 675-0533',
  address: '325 West County Line Road, Hatboro, PA 19040',
  hours: 'Monday-Friday 9am-8pm, Saturday 9am-1pm, Sunday closed',
  description: 'Full-service veterinary hospital in Hatboro since 1956. Dr. Tracy Heitzman and the staff serve Montgomery and Bucks County pets.',
  marquee: ['Since 1956', 'Hatboro', 'County Line Road', 'Full service'],
  hero: { eyebrow: 'Hatboro | Veterinary hospital', headline: 'Professional pet care with a personal touch', sub: 'County Line Veterinary Hospital has served Montgomery and Bucks County since 1956. Dr. Tracy Heitzman and the staff still want the visit to feel like their own animals are on the table.', ctaPrimary: { label: 'Call the hospital', href: 'tel:2156750533' }, ctaSecondary: { label: 'Open the site', href: 'https://countylineveterinary.com/' }, glassFloat: { title: 'Since 1956', sub: 'Hatboro' } },
  offerings: { heading: 'A full-service hospital, not a pop-up clinic.', items: ['Wellness and sick care for the pets of Montgomery and Bucks County.', 'Hours that run until 8pm on weekdays so the after-work visit is real.', 'A staff that treats the appointment like it is their own animal.'] },
  gallery: { heading: 'The floor behind the front desk.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Hatboro since 1956', paragraphs: ['County Line Veterinary Hospital sits at 325 West County Line Road in Hatboro. The phone is (215) 675-0533. Fax is (215) 675-4250.', 'The radar still points at an older domain. The live practice site is countylineveterinary.com. Confirm hours there before you drive. Urgent care services are listed as coming in 2026.'], imageIndex: 2 },
  experience: { heading: 'Hours that match a workday.', items: ['Weekdays 9 to 8. Saturday 9 to 1.', 'Sunday the hospital is closed. Central Veterinary Center covers Sunday questions.', 'You call (215) 675-0533 and a person books the slot.'] },
  feature: { heading: 'Personal touch is the operating system', text: 'Dr. Tracy Heitzman and the staff say they work to give you the care they would want for their own. That is the whole differentiator in a county full of clinics.', cta: { label: 'Meet the hospital', href: 'https://countylineveterinary.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Urgent care on the way', text: 'The homepage flags urgent care services coming in 2026. Until then, call the hospital and ask what the day can hold.', imageIndex: 13, cta: { label: 'Call', href: 'tel:2156750533' } },
  catalog: { items: [{ title: 'Appointments', href: 'https://countylineveterinary.com/', imageIndex: 9 }, { title: 'Hours', href: 'https://countylineveterinary.com/', imageIndex: 10 }, { title: 'Map', href: 'https://www.google.com/maps/search/?api=1&query=325+West+County+Line+Road+Hatboro+PA', imageIndex: 11 }] },
  contact: { heading: 'Find the hospital.', sub: '325 West County Line Road, Hatboro. Confirm hours before you drive.' },
  closing: { cta: { label: 'Call the hospital', href: 'tel:2156750533' } },
  links: [{ label: 'Call', href: 'tel:2156750533' }, { label: 'Official site', href: 'https://countylineveterinary.com/' }],
}));

S.push(brief({
  slug: 'wynnewood-eyecare', name: 'Wynnewood Eyecare', city: 'Wynnewood',
  category: 'Optometry', vertical: 'Health',
  url: 'https://www.wynnewoodeyecare.com/',
  description: 'Optometry practice serving Montgomery County from Wynnewood. Eye exams and a shop floor that still fits frames in person.',
  marquee: ['Wynnewood', 'Eye exams', 'Frames', 'Montgomery County'],
  hero: { eyebrow: 'Wynnewood | Optometry', headline: 'See the work in person', sub: 'Wynnewood Eyecare is an optometry practice in Montgomery County. The current site is dated. The visit is still an exam, a conversation, and frames you can hold.', ctaPrimary: { label: 'Open the official site', href: 'https://www.wynnewoodeyecare.com/' }, ctaSecondary: { label: 'Plan a visit', href: '#visit' }, glassFloat: { title: 'Wynnewood', sub: 'Montgomery County' } },
  offerings: { heading: 'Exams, lenses, a real fitting.', items: ['Comprehensive eye exams for the people who already live nearby.', 'Frames and lenses fitted on a floor, not from a thumbnail.', 'Follow-up when the prescription needs a second look.'] },
  gallery: { heading: 'Glass, light, a quiet shop.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'A local eyecare office', paragraphs: ['Wynnewood Eyecare sits in Montgomery County. The radar flagged a site with no viewport and a page that still thinks it is 2012.', 'Confirm the street address, phone, and hours on the official site before you drive. We will not invent a suite number to look finished.'], imageIndex: 2 },
  experience: { heading: 'How an exam should feel.', items: ['You book. You sit. Someone dilates, or they tell you why they will not.', 'You try frames on your face, not on a model.', 'You leave with a prescription you can actually fill.'] },
  feature: { heading: 'The floor still matters', text: 'Online frame photos lie about scale. A Wynnewood exam is the chance to see the pair on your face under real light.', cta: { label: 'Open the site', href: 'https://www.wynnewoodeyecare.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Montgomery County, one chair', text: 'If Wynnewood is the commute, this is the eyecare stop that does not send you to a mall kiosk.', imageIndex: 13, cta: { label: 'Official site', href: 'https://www.wynnewoodeyecare.com/' } },
  catalog: { items: [{ title: 'Exams', href: 'https://www.wynnewoodeyecare.com/', imageIndex: 9 }, { title: 'Frames', href: 'https://www.wynnewoodeyecare.com/', imageIndex: 10 }, { title: 'Contact', href: 'https://www.wynnewoodeyecare.com/', imageIndex: 11 }] },
  contact: { heading: 'Confirm before you drive.', sub: 'Wynnewood, Montgomery County. Pull the live address and phone from the official site.' },
  closing: { cta: { label: 'Open the official site', href: 'https://www.wynnewoodeyecare.com/' } },
  links: [{ label: 'Official site', href: 'https://www.wynnewoodeyecare.com/' }],
}));

S.push(brief({
  slug: 'malvern-vision-care', name: 'Malvern Vision Care', city: 'Malvern',
  category: 'Optometry', vertical: 'Health',
  url: 'https://www.malvernvision.com/',
  description: 'Optometry in Malvern, Chester County. Eye exams and optical care for people who want the prescription filled by the same office that measured it.',
  marquee: ['Malvern', 'Chester County', 'Eye exams', 'Optical'],
  hero: { eyebrow: 'Malvern | Optometry', headline: 'Vision care in Malvern', sub: 'Malvern Vision Care serves Chester County. The current homepage is not built for a phone. The exam still is.', ctaPrimary: { label: 'Open the official site', href: 'https://www.malvernvision.com/' }, ctaSecondary: { label: 'Plan a visit', href: '#visit' }, glassFloat: { title: 'Malvern', sub: 'Chester County' } },
  offerings: { heading: 'Measure, fit, follow up.', items: ['Eye exams for the people who already work and live in Malvern.', 'Optical dispensing so the pair leaves the same building.', 'A follow-up when the first pair is not quite right.'] },
  gallery: { heading: 'Lenses, light, a quiet room.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Chester County eyecare', paragraphs: ['Malvern Vision Care is an optometry practice in Malvern. The radar scored the site as broken: no viewport, a desktop-width page on phones.', 'Confirm the street address, phone, and hours on the official site before you drive. Facts we cannot verify stay off this page.'], imageIndex: 2 },
  experience: { heading: 'One office, one prescription.', items: ['The exam and the frames live in the same conversation.', 'You leave with a pair you saw on your own face.', 'You can come back when the fit needs a tweak.'] },
  feature: { heading: 'The phone page should not fight the exam', text: 'A practice that measures your eyes should not make you pinch-zoom the homepage. That is the rebuild. The clinical work was already there.', cta: { label: 'Open the site', href: 'https://www.malvernvision.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Malvern and the Main Line edge', text: 'If Malvern is the workday, this is the eyecare stop that does not send you into King of Prussia traffic for a fitting.', imageIndex: 13, cta: { label: 'Official site', href: 'https://www.malvernvision.com/' } },
  catalog: { items: [{ title: 'Exams', href: 'https://www.malvernvision.com/', imageIndex: 9 }, { title: 'Optical', href: 'https://www.malvernvision.com/', imageIndex: 10 }, { title: 'Contact', href: 'https://www.malvernvision.com/', imageIndex: 11 }] },
  contact: { heading: 'Confirm before you drive.', sub: 'Malvern, Chester County. Pull live address and hours from the official site.' },
  closing: { cta: { label: 'Open the official site', href: 'https://www.malvernvision.com/' } },
  links: [{ label: 'Official site', href: 'https://www.malvernvision.com/' }],
}));

S.push(brief({
  slug: 'live-urgent-care', name: 'Live Urgent Care', city: 'King of Prussia',
  category: 'Urgent care', vertical: 'Health',
  url: 'https://liveurgentcare.com/locations/kingofprussia/',
  description: 'Urgent care in King of Prussia for the visit that cannot wait for a primary-care slot. Confirm hours and services on the official location page.',
  marquee: ['King of Prussia', 'Urgent care', 'Walk in', 'Montgomery County'],
  hero: { eyebrow: 'King of Prussia | Urgent care', headline: 'Care when the calendar will not give', sub: 'Live Urgent Care in King of Prussia is for the sprain, the fever, the thing that will not wait three weeks for a physical. Confirm hours on the location page before you drive.', ctaPrimary: { label: 'Open the location page', href: 'https://liveurgentcare.com/locations/kingofprussia/' }, ctaSecondary: { label: 'Plan a visit', href: '#visit' }, glassFloat: { title: 'King of Prussia', sub: 'Urgent care' } },
  offerings: { heading: 'Built for the visit that cannot wait.', items: ['Walk-in urgent care for the day primary care is booked out.', 'A location page that should tell you hours, parking, and what they will see.', 'Follow-up notes you can take back to your own doctor.'] },
  gallery: { heading: 'A clinic that moves at urgent speed.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'King of Prussia, on purpose', paragraphs: ['Live Urgent Care lists a King of Prussia location. The radar flagged a homepage that is not built for a phone, which is a problem when you are trying to check hours with one hand.', 'Confirm the street address, phone, and today’s hours on the official location page. We will not invent a suite to look complete.'], imageIndex: 2 },
  experience: { heading: 'How an urgent visit should go.', items: ['You check hours. You go. You are not guessing from a desktop-only page.', 'You describe the problem once, to a person who can treat it or send you on.', 'You leave with instructions you can read in the parking lot.'] },
  feature: { heading: 'Hours have to be readable on a phone', text: 'Urgent care fails when the location page hides the clock. The rebuild puts hours, map, and the next action on the first screen.', cta: { label: 'Open King of Prussia', href: 'https://liveurgentcare.com/locations/kingofprussia/' }, imageIndex: 8 },
  spotlight: { heading: 'Montgomery County, same-day', text: 'King of Prussia is the listed location. Confirm what the floor will see today before you leave the house.', imageIndex: 13, cta: { label: 'Location page', href: 'https://liveurgentcare.com/locations/kingofprussia/' } },
  catalog: { items: [{ title: 'King of Prussia', href: 'https://liveurgentcare.com/locations/kingofprussia/', imageIndex: 9 }, { title: 'Services', href: 'https://liveurgentcare.com/locations/kingofprussia/', imageIndex: 10 }, { title: 'Hours', href: 'https://liveurgentcare.com/locations/kingofprussia/', imageIndex: 11 }] },
  contact: { heading: 'Confirm hours first.', sub: 'King of Prussia. Pull live address and phone from the official location page.' },
  closing: { cta: { label: 'Open the location page', href: 'https://liveurgentcare.com/locations/kingofprussia/' } },
  links: [{ label: 'Location page', href: 'https://liveurgentcare.com/locations/kingofprussia/' }],
}));

S.push(brief({
  slug: 'plastic-surgery-solutions', name: 'Plastic Surgery Solutions', city: 'Sanatoga',
  category: 'Plastic surgery', vertical: 'Health',
  url: 'https://plasticsurgerysolutions.com/',
  description: 'Plastic surgery practice in Sanatoga, Montgomery County. Consult first. Confirm surgeons, procedures, and hours on the official site.',
  marquee: ['Sanatoga', 'Consult first', 'Montgomery County', 'Surgical care'],
  hero: { eyebrow: 'Sanatoga | Plastic surgery', headline: 'A consult before a plan', sub: 'Plastic Surgery Solutions serves Sanatoga and Montgomery County. The current site is dated. The work still starts with a conversation, not a gallery of before-and-afters you cannot verify.', ctaPrimary: { label: 'Open the official site', href: 'https://plasticsurgerysolutions.com/' }, ctaSecondary: { label: 'Plan a visit', href: '#visit' }, glassFloat: { title: 'Sanatoga', sub: 'Montgomery County' } },
  offerings: { heading: 'Consult, plan, recover.', items: ['A consult that names the procedure in plain language.', 'Surgical care scheduled around recovery you can actually take.', 'Follow-up that belongs to the same practice that operated.'] },
  gallery: { heading: 'Quiet rooms, serious work.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Sanatoga, Montgomery County', paragraphs: ['Plastic Surgery Solutions is listed in Sanatoga. The radar flagged a site with no viewport and thin trust signals.', 'Confirm the surgeon names, the street address, and the phone on the official site before you book. We will not invent credentials.'], imageIndex: 2 },
  experience: { heading: 'How a consult should go.', items: ['You ask what they actually do. They answer without a brochure fog.', 'You hear recovery time before you hear a quote.', 'You leave with a next step you can keep or decline.'] },
  feature: { heading: 'The consult is the product', text: 'A plastic surgery homepage that cannot be read on a phone is a bad first impression for a practice that asks for trust. The rebuild leads with the consult, the map, and a real next action.', cta: { label: 'Open the site', href: 'https://plasticsurgerysolutions.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Montgomery County, one practice', text: 'Sanatoga is the listed city. Confirm parking, hours, and who you will sit with on the official site.', imageIndex: 13, cta: { label: 'Official site', href: 'https://plasticsurgerysolutions.com/' } },
  catalog: { items: [{ title: 'Consult', href: 'https://plasticsurgerysolutions.com/', imageIndex: 9 }, { title: 'Procedures', href: 'https://plasticsurgerysolutions.com/', imageIndex: 10 }, { title: 'Contact', href: 'https://plasticsurgerysolutions.com/', imageIndex: 11 }] },
  contact: { heading: 'Confirm before you book.', sub: 'Sanatoga, Montgomery County. Pull live address and phone from the official site.' },
  closing: { cta: { label: 'Open the official site', href: 'https://plasticsurgerysolutions.com/' } },
  links: [{ label: 'Official site', href: 'https://plasticsurgerysolutions.com/' }],
}));

S.push(brief({
  slug: 'be-balanced-hormone', name: 'Be Balanced Hormone Weight Loss Centers', city: 'Royersford',
  category: 'Hormone balancing and weight loss', vertical: 'Health',
  url: 'https://bebalancedcenters.com/location/collegeville/', phone: '',
  address: '519 Main Street, Royersford, PA 19468',
  hours: 'Monday and Thursday 10am-6pm, Friday 10am-4pm, Saturday by appointment',
  description: 'Natural hormone balancing and weight loss in Royersford with Roseanne C. McGrory. One-on-one support, whole food, no injections.',
  marquee: ['Royersford', 'Hormone balance', 'Main Street', 'One on one'],
  hero: { eyebrow: 'Royersford | Hormone balancing', headline: 'Balance first. Weight follows.', sub: 'Be Balanced in Royersford is Roseanne C. McGrory’s center. Natural hormone balancing, whole food, and one-on-one support. No prepackaged meals. No injections.', ctaPrimary: { label: 'See the Royersford center', href: 'https://bebalancedcenters.com/location/collegeville/' }, ctaSecondary: { label: 'Plan a visit', href: '#visit' }, glassFloat: { title: '519 Main Street', sub: 'Royersford' } },
  offerings: { heading: 'A plan you can keep on a weeknight.', items: ['One-on-one support from specialists who already did the program.', 'Whole food and plant-based supplements instead of a freezer of branded meals.', 'Relaxation work when stress is part of the weight.'] },
  gallery: { heading: 'A center that feels like a consult, not a gym.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Roseanne’s second time through', paragraphs: ['Roseanne C. McGrory owns the Royersford center. She did the program in 2018 after years of yo-yo diets, then joined the team. Jane Peronteau coaches beside her as a yoga therapist.', 'The center is 519 Main Street, Royersford, PA 19468. Monday and Thursday 10 to 6, Friday 10 to 4, Saturday by appointment. The Collegeville URL still routes here. Confirm on the location page.'], imageIndex: 2 },
  experience: { heading: 'From assessment to a plan.', items: ['Take the free hormone assessment, or skip it and book the consult.', 'Sit with a specialist. Name the symptoms. Hear a plan.', 'Walk the plan with the same people, not a rotating script.'] },
  feature: { heading: 'No injections. No freezer meals.', text: 'The center’s own copy says no rigorous exercise mandate, no prepackaged meals, no medical injections. The work is hormone balance, food you cook, and a person who stays on the call.', cta: { label: 'Read the location page', href: 'https://bebalancedcenters.com/location/collegeville/' }, imageIndex: 8 },
  spotlight: { heading: 'Collegeville in the URL, Royersford on the door', text: 'The radar listed Collegeville. The live location page puts the center on Main Street in Royersford. Trust the door.', imageIndex: 13, cta: { label: 'Location page', href: 'https://bebalancedcenters.com/location/collegeville/' } },
  catalog: { items: [{ title: 'How it works', href: 'https://bebalancedcenters.com/location/collegeville/', imageIndex: 9 }, { title: 'Meet the team', href: 'https://bebalancedcenters.com/location/collegeville/', imageIndex: 10 }, { title: 'Book a consult', href: 'https://bebalancedcenters.com/location/collegeville/', imageIndex: 11 }] },
  contact: { heading: 'Find the center.', sub: '519 Main Street, Royersford. Confirm Saturday appointments on the location page.' },
  closing: { cta: { label: 'See the Royersford center', href: 'https://bebalancedcenters.com/location/collegeville/' } },
  links: [{ label: 'Location page', href: 'https://bebalancedcenters.com/location/collegeville/' }],
}));

S.push(brief({
  slug: 'jarman-hvac', name: 'Jarman Sales & Service', city: 'Philadelphia',
  category: 'Window and wall air conditioning', vertical: 'Home Services',
  url: 'http://jarmanairconditioning.com/', phone: '(215) 389-2345',
  address: '2041 Point Breeze Ave, Philadelphia, PA 19145',
  description: 'Family-owned Friedrich dealer in Point Breeze. Window, wall, and PTAC air conditioning, installation, winter storage, and service since 1951.',
  marquee: ['Point Breeze', 'Friedrich', 'Window AC', 'Since 1951'],
  hero: { eyebrow: 'Philadelphia | Window and wall AC', headline: 'Point Breeze still services the unit', sub: 'Jarman Sales & Service installs and services window, wall, and PTAC units from 2041 Point Breeze Ave. Family owned. Friedrich authorized. Call (215) 389-2345.', ctaPrimary: { label: 'Call the shop', href: 'tel:2153892345' }, ctaSecondary: { label: 'Open the site', href: 'http://jarmanairconditioning.com/' }, glassFloat: { title: 'Since 1951', sub: 'Point Breeze' } },
  offerings: { heading: 'Window, wall, PTAC, one shop.', items: ['Custom installation for through-the-wall and window units that have to fit the opening you have.', 'Offseason maintenance, winter storage, and steam cleaning so the unit lasts.', 'Friedrich product on the floor, including heat pumps, electric heat, and PTAC.'] },
  gallery: { heading: 'Sleeves, chassis, a South Philly shop.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Family owned since 1951', paragraphs: ['Jarman Sales & Service sits at 2041 Point Breeze Ave in Philadelphia. The radar still has jarmanairconditioning.com. Listings also point at jarmansalesandservice.com. Confirm the live site before you send a deposit.', 'Robert Jarman’s shop has been the Friedrich stop in this part of the city for people who still want a wall unit that works. Call (215) 389-2345.'], imageIndex: 2 },
  experience: { heading: 'How a job should go.', items: ['You call with the opening size, not a guess from a big-box aisle.', 'They install to the sleeve you have, or they tell you the sleeve has to change.', 'Winter storage and a clean-out sit on the same account as the install.'] },
  feature: { heading: 'Friedrich, on purpose', text: 'The shop is listed as a Friedrich authorized dealer and service provider. Energy Star units, window and wall, PTAC for the rooms that need a commercial chassis.', cta: { label: 'Call Point Breeze', href: 'tel:2153892345' }, imageIndex: 8 },
  spotlight: { heading: 'South Philadelphia, one specialty', text: 'This is not a whole-house furnace company pretending to do window units. The specialty is the unit in the wall.', imageIndex: 13, cta: { label: 'Call', href: 'tel:2153892345' } },
  catalog: { items: [{ title: 'Installation', href: 'http://jarmanairconditioning.com/', imageIndex: 9 }, { title: 'Service', href: 'http://jarmanairconditioning.com/', imageIndex: 10 }, { title: 'Call the shop', href: 'tel:2153892345', imageIndex: 11 }] },
  contact: { heading: 'Find the shop.', sub: '2041 Point Breeze Ave, Philadelphia. Confirm hours before you roll a truck.' },
  closing: { cta: { label: 'Call the shop', href: 'tel:2153892345' } },
  links: [{ label: 'Call', href: 'tel:2153892345' }, { label: 'Official site', href: 'http://jarmanairconditioning.com/' }],
}));

S.push(brief({
  slug: 'bg-electric', name: 'BG Electric Service LLC', city: 'Philadelphia',
  category: 'Electrical contractor', vertical: 'Home Services',
  url: 'https://www.bgelectricservicellc.com/',
  description: 'Electrical contractor in Philadelphia. Service, panels, and lighting for homes and small commercial work. Confirm license details on the official site.',
  marquee: ['Philadelphia', 'Electrical', 'Service calls', 'Panels'],
  hero: { eyebrow: 'Philadelphia | Electrical contractor', headline: 'Service that shows up for the panel', sub: 'BG Electric Service LLC is a Philadelphia electrical contractor. The current site is dated and sometimes errors out. The work is still the panel, the lighting, and the call you make when the breaker will not reset.', ctaPrimary: { label: 'Open the official site', href: 'https://www.bgelectricservicellc.com/' }, ctaSecondary: { label: 'Plan a visit', href: '#visit' }, glassFloat: { title: 'Philadelphia', sub: 'Electrical service' } },
  offerings: { heading: 'Panels, lighting, the call-out.', items: ['Service calls when a breaker, outlet, or fixture fails.', 'Panel work for homes that have outgrown the original box.', 'Lighting and small commercial jobs that still need a licensed electrician.'] },
  gallery: { heading: 'Copper, panel covers, a van.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'A Philadelphia electrical shop', paragraphs: ['BG Electric Service LLC is listed in Philadelphia. The radar scored the site as a rebuild: no viewport, almost no homepage copy, no phone on the page.', 'Confirm the phone, the license, and the service area on the official site before you book. We will not invent a van number.'], imageIndex: 2 },
  experience: { heading: 'How a service call should go.', items: ['You describe the fault. They tell you if it is a call-out or a panel job.', 'They show up with the parts that actually fit the panel you have.', 'You get a price before the cover comes off, not after.'] },
  feature: { heading: 'The phone number belongs on the first screen', text: 'An electrician’s site that hides the phone is a site that cannot take the job. The rebuild puts the next action where a person with a dead outlet can hit it.', cta: { label: 'Open the site', href: 'https://www.bgelectricservicellc.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Philadelphia homes, small commercial', text: 'The vertical is electrical service. Confirm what they will take before you send photos of a Federal Pacific panel.', imageIndex: 13, cta: { label: 'Official site', href: 'https://www.bgelectricservicellc.com/' } },
  catalog: { items: [{ title: 'Service', href: 'https://www.bgelectricservicellc.com/', imageIndex: 9 }, { title: 'Panels', href: 'https://www.bgelectricservicellc.com/', imageIndex: 10 }, { title: 'Contact', href: 'https://www.bgelectricservicellc.com/', imageIndex: 11 }] },
  contact: { heading: 'Confirm before you book.', sub: 'Philadelphia. Pull live phone and address from the official site.' },
  closing: { cta: { label: 'Open the official site', href: 'https://www.bgelectricservicellc.com/' } },
  links: [{ label: 'Official site', href: 'https://www.bgelectricservicellc.com/' }],
}));

S.push(brief({
  slug: 'auger-manufacturing', name: 'Auger Manufacturing Specialists', city: 'Frazer',
  category: 'Auger and flighting manufacturer', vertical: 'Industrial',
  url: 'http://augermfgspec.com/', phone: '1-610-647-4677',
  address: '22A Bacton Hill Rd, Frazer, Pennsylvania 19355',
  description: 'Auger and spiral flighting manufacturer in Frazer since 1973. Food, pharma, cosmetics, plastics, and chemical tooling, plus repair of worn augers.',
  marquee: ['Since 1973', 'Frazer', 'Flighting', 'Repair'],
  hero: { eyebrow: 'Frazer | Augers since 1973', headline: 'Flighting for the line you already run', sub: 'Auger Manufacturing Specialists builds and repairs augers, conveyor screws, and helicoid flighting from 22A Bacton Hill Rd. Food, pharma, cosmetics, plastics, chemical. Call 1-800-544-1199.', ctaPrimary: { label: 'Call the shop', href: 'tel:16106474677' }, ctaSecondary: { label: 'Email the shop', href: 'mailto:info@augermfgspec.com' }, glassFloat: { title: 'Since 1973', sub: 'Frazer, PA' } },
  offerings: { heading: 'Build new. Repair what still has a shaft.', items: ['All types, sizes, and lengths of augers and spiral flighting for process industries.', 'Repair that straightens shafts, adds flights, and takes out nicks instead of forcing a new buy.', 'Vertical auger filler tooling and horizontal feeder augers as the specialty.'] },
  gallery: { heading: 'Flighting, shafts, a Chester County floor.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Original manufacturer since 1973', paragraphs: ['Auger Manufacturing Specialists has been on this work since 1973. The site still mentions PACK EXPO 2020. The shop is still in Frazer.', '22A Bacton Hill Rd, Frazer, PA 19355. USA and Canada 1-800-544-1199. Local 1-610-647-4677. Fax 610-640-9085. Email info@augermfgspec.com.'], imageIndex: 2 },
  experience: { heading: 'How a job moves.', items: ['You send the worn auger. They tell you if repair beats a new tool.', 'OEM and one-off users sit on the same floor.', 'You get a part that matches the filler you already own.'] },
  feature: { heading: 'Repair before you scrap the shaft', text: 'The homepage’s own line: frequently they can save you the cost of a new auger by repairing it. Straighten, add flights, take out nicks. Send the worn one.', cta: { label: 'Contact the shop', href: 'http://augermfgspec.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Process industries, one specialty', text: 'Food, chemical, pharmaceutical, cosmetic, plastics. If the product moves on a screw, this is the shop.', imageIndex: 13, cta: { label: 'Call', href: 'tel:18005441199' } },
  catalog: { items: [{ title: 'New augers', href: 'http://augermfgspec.com/', imageIndex: 9 }, { title: 'Repair', href: 'http://augermfgspec.com/', imageIndex: 10 }, { title: 'Contact', href: 'http://augermfgspec.com/', imageIndex: 11 }] },
  contact: { heading: 'Find the shop.', sub: '22A Bacton Hill Rd, Frazer. Confirm dock hours before you ship a worn auger.' },
  closing: { cta: { label: 'Call the shop', href: 'tel:16106474677' } },
  links: [{ label: 'Call', href: 'tel:16106474677' }, { label: 'Email', href: 'mailto:info@augermfgspec.com' }],
}));

S.push(brief({
  slug: 'verruni-landscaping', name: 'L A Verruni Landscaping', city: 'Pottstown',
  category: 'Landscaping', vertical: 'Home Services',
  url: 'http://www.verrunilandscaping.com/',
  address: '1357 Farmington Avenue, Pottstown, PA 19464',
  description: 'Landscaping in Pottstown. The current site is a coming-soon page. The work is still the property, the plantings, and a crew that shows up.',
  marquee: ['Pottstown', 'Farmington Avenue', 'Landscaping', 'Property work'],
  hero: { eyebrow: 'Pottstown | Landscaping', headline: 'The property still needs a crew', sub: 'L A Verruni Landscaping is listed on Farmington Avenue in Pottstown. The website currently says coming soon. The rebuild is the page a property owner can actually use.', ctaPrimary: { label: 'Open the site', href: 'http://www.verrunilandscaping.com/' }, ctaSecondary: { label: 'Find the shop', href: '#visit' }, glassFloat: { title: 'Pottstown', sub: 'Farmington Ave' } },
  offerings: { heading: 'Ground, plantings, a finished edge.', items: ['Landscape work for Pottstown properties that have outgrown weekend maintenance.', 'Plantings and beds that match the house you already have.', 'A crew you can reach when the site is not a coming-soon graphic.'] },
  gallery: { heading: 'Beds, stone, a finished yard.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Pottstown, Farmington Avenue', paragraphs: ['Listings put L A Verruni Landscaping at 1357 Farmington Avenue, Pottstown, PA 19464. The live domain currently shows a coming-soon page.', 'Confirm the phone and the season’s book of work before you send a deposit. A coming-soon site is not a quote.'], imageIndex: 2 },
  experience: { heading: 'How a landscape job should start.', items: ['You walk the property. They name what the soil and the light will actually support.', 'You get a scope, not a vibe board.', 'The crew returns to maintain what they installed.'] },
  feature: { heading: 'A coming-soon page cannot take the job', text: 'The radar flagged a broken homepage. The rebuild puts the map, the next action, and the work in front of a Pottstown owner who is done waiting on a splash screen.', cta: { label: 'Open the domain', href: 'http://www.verrunilandscaping.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Montgomery County properties', text: 'Pottstown is the listed city. Confirm the service radius before you assume they will trailer to the far side of the county.', imageIndex: 13, cta: { label: 'Map the address', href: 'https://www.google.com/maps/search/?api=1&query=1357+Farmington+Avenue+Pottstown+PA' } },
  catalog: { items: [{ title: 'Landscaping', href: 'http://www.verrunilandscaping.com/', imageIndex: 9 }, { title: 'Property work', href: 'http://www.verrunilandscaping.com/', imageIndex: 10 }, { title: 'Map', href: 'https://www.google.com/maps/search/?api=1&query=1357+Farmington+Avenue+Pottstown+PA', imageIndex: 11 }] },
  contact: { heading: 'Find the yard.', sub: '1357 Farmington Avenue, Pottstown. Confirm phone and hours before you drive.' },
  closing: { cta: { label: 'Open the site', href: 'http://www.verrunilandscaping.com/' } },
  links: [{ label: 'Official site', href: 'http://www.verrunilandscaping.com/' }],
}));

S.push(brief({
  slug: 'dreammaker-bath-kitchen', name: 'DreamMaker Bath & Kitchen', city: 'Chester Springs',
  category: 'Bath and kitchen remodeling', vertical: 'Home Services',
  url: 'https://www.dreammaker-remodel.com/chester-county/',
  description: 'Bath and kitchen remodeling in Chester County. DreamMaker is a franchise network. Confirm the local owner, showroom, and phone on the Chester County page.',
  marquee: ['Chester Springs', 'Bath', 'Kitchen', 'Remodel'],
  hero: { eyebrow: 'Chester County | Bath and kitchen', headline: 'Remodel the rooms you actually use', sub: 'DreamMaker Bath & Kitchen lists Chester County from Chester Springs. The local page should name the owner, the showroom, and the next appointment. Confirm those on the official location page.', ctaPrimary: { label: 'Open Chester County', href: 'https://www.dreammaker-remodel.com/chester-county/' }, ctaSecondary: { label: 'Plan a visit', href: '#visit' }, glassFloat: { title: 'Chester Springs', sub: 'Bath and kitchen' } },
  offerings: { heading: 'Bath, kitchen, a finished room.', items: ['Kitchen remodels planned around the way you already cook.', 'Bath remodels that respect the plumbing you have, not a catalog fantasy.', 'A local franchisee you can sit with before demolition starts.'] },
  gallery: { heading: 'Stone, cabinets, a finished edge.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Chester County, local owner', paragraphs: ['DreamMaker Bath & Kitchen is a national remodel brand with a Chester County location page. The radar flagged a dated, desktop-width page.', 'Confirm the local owner, the showroom address, and the phone on the Chester County page before you book a design visit. Franchise pages change. Trust the live page.'], imageIndex: 2 },
  experience: { heading: 'How a remodel should start.', items: ['A design visit in the rooms you have, not a showroom-only pitch.', 'A scope and a calendar before the first dumpster.', 'One local contact when the tile is late.'] },
  feature: { heading: 'The local page has to carry the owner', text: 'A franchise remodel only works when the local page names a person and a phone. The rebuild puts that above the national stock photos.', cta: { label: 'Open Chester County', href: 'https://www.dreammaker-remodel.com/chester-county/' }, imageIndex: 8 },
  spotlight: { heading: 'Chester Springs as the listed city', text: 'The radar placed them in Chester Springs. Confirm the showroom on the location page before you drive.', imageIndex: 13, cta: { label: 'Location page', href: 'https://www.dreammaker-remodel.com/chester-county/' } },
  catalog: { items: [{ title: 'Kitchens', href: 'https://www.dreammaker-remodel.com/chester-county/', imageIndex: 9 }, { title: 'Baths', href: 'https://www.dreammaker-remodel.com/chester-county/', imageIndex: 10 }, { title: 'Contact', href: 'https://www.dreammaker-remodel.com/chester-county/', imageIndex: 11 }] },
  contact: { heading: 'Confirm the showroom.', sub: 'Chester Springs, Chester County. Pull live address and phone from the location page.' },
  closing: { cta: { label: 'Open Chester County', href: 'https://www.dreammaker-remodel.com/chester-county/' } },
  links: [{ label: 'Location page', href: 'https://www.dreammaker-remodel.com/chester-county/' }],
}));

S.push(brief({
  slug: 'fillman-and-sons-floors', name: 'Fillman & Sons Floors & More', city: 'Emmaus',
  category: 'Flooring', vertical: 'Home Services',
  url: 'http://www.fillmanandsons.com/',
  description: 'Flooring contractor in Emmaus, Lehigh County. Hardwood, the jobs around it, and a family name on the van. Confirm hours on the official site.',
  marquee: ['Emmaus', 'Floors', 'Family shop', 'Lehigh County'],
  hero: { eyebrow: 'Emmaus | Flooring', headline: 'Floors, and the work around them', sub: 'Fillman & Sons Floors & More is a Lehigh County flooring shop. The current site is not built for a phone. The floor still has to be measured, delivered, and finished.', ctaPrimary: { label: 'Open the official site', href: 'http://www.fillmanandsons.com/' }, ctaSecondary: { label: 'Plan a visit', href: '#visit' }, glassFloat: { title: 'Emmaus', sub: 'Lehigh County' } },
  offerings: { heading: 'Measure, install, finish.', items: ['Hardwood and the flooring jobs a family shop will still take.', 'Installation that respects the subfloor you already have.', 'The “and more” on the door: the adjacent work they will name when you ask.'] },
  gallery: { heading: 'Grain, finish, a clean edge.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'A family name on the van', paragraphs: ['Fillman & Sons Floors & More is listed in Emmaus. The radar scored the site as broken: no viewport on a phone.', 'Confirm the street address, phone, and what “and more” covers on the official site before you order material. We will not invent a showroom suite.'], imageIndex: 2 },
  experience: { heading: 'How a floor job should go.', items: ['They measure the rooms you have, including the closets you forgot.', 'You see the finish on a sample, not only on a screen.', 'They come back to the edges when the house settles.'] },
  feature: { heading: 'The site should be as straight as the plank', text: 'A flooring company that hides the phone on mobile is fighting its own close. The rebuild puts the map, the next action, and the work on the first screen.', cta: { label: 'Open the site', href: 'http://www.fillmanandsons.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Lehigh County, one shop', text: 'Emmaus is the listed city. Confirm the service radius before you assume they will trailer across the river.', imageIndex: 13, cta: { label: 'Official site', href: 'http://www.fillmanandsons.com/' } },
  catalog: { items: [{ title: 'Floors', href: 'http://www.fillmanandsons.com/', imageIndex: 9 }, { title: 'And more', href: 'http://www.fillmanandsons.com/', imageIndex: 10 }, { title: 'Contact', href: 'http://www.fillmanandsons.com/', imageIndex: 11 }] },
  contact: { heading: 'Confirm before you drive.', sub: 'Emmaus, Lehigh County. Pull live address and phone from the official site.' },
  closing: { cta: { label: 'Open the official site', href: 'http://www.fillmanandsons.com/' } },
  links: [{ label: 'Official site', href: 'http://www.fillmanandsons.com/' }],
}));

S.push(brief({
  slug: 'sciacca-service-center', name: 'Sciacca Service Center', city: 'Montgomery County',
  category: 'Auto service', vertical: 'Home Services',
  url: 'http://sciaccaservicecenter.com/',
  description: 'Auto service center in Montgomery County. Repairs, maintenance, and a bay you can actually visit. Confirm hours on the official site.',
  marquee: ['Service bays', 'Montgomery County', 'Maintenance', 'Repairs'],
  hero: { eyebrow: 'Montgomery County | Auto service', headline: 'A bay that still talks to you', sub: 'Sciacca Service Center is a Montgomery County auto shop. The current site is dated. The work is still the inspection, the repair, and a person who will walk you to the car.', ctaPrimary: { label: 'Open the official site', href: 'http://sciaccaservicecenter.com/' }, ctaSecondary: { label: 'Plan a visit', href: '#visit' }, glassFloat: { title: 'Montgomery County', sub: 'Auto service' } },
  offerings: { heading: 'Inspect, repair, hand the keys back.', items: ['Maintenance for the cars that already live in the driveway.', 'Repairs explained before the parts order, not after.', 'A service writer you can call without a chatbot.'] },
  gallery: { heading: 'Lifts, lights, a clean bay.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'A county shop, not a chain tablet', paragraphs: ['Sciacca Service Center is listed in Montgomery County. The radar flagged a site with no viewport.', 'Confirm the street address, phone, and hours on the official site before you leave the car. We will not invent a bay number.'], imageIndex: 2 },
  experience: { heading: 'How a drop-off should go.', items: ['You describe the noise. They road-test it.', 'You get a call before they replace the expensive part.', 'You pick up a car that starts, with the old part in a bag if you asked.'] },
  feature: { heading: 'The estimate belongs on the phone', text: 'A shop homepage that cannot be read on a phone is a shop that loses the afternoon drop-off. The rebuild puts hours, map, and the next action first.', cta: { label: 'Open the site', href: 'http://sciaccaservicecenter.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Montgomery County cars', text: 'Confirm the service radius and whether they handle your make before you assume every bay is a specialist bay.', imageIndex: 13, cta: { label: 'Official site', href: 'http://sciaccaservicecenter.com/' } },
  catalog: { items: [{ title: 'Service', href: 'http://sciaccaservicecenter.com/', imageIndex: 9 }, { title: 'Repairs', href: 'http://sciaccaservicecenter.com/', imageIndex: 10 }, { title: 'Contact', href: 'http://sciaccaservicecenter.com/', imageIndex: 11 }] },
  contact: { heading: 'Confirm before you drop the car.', sub: 'Montgomery County. Pull live address and phone from the official site.' },
  closing: { cta: { label: 'Open the official site', href: 'http://sciaccaservicecenter.com/' } },
  links: [{ label: 'Official site', href: 'http://sciaccaservicecenter.com/' }],
}));

S.push(brief({
  slug: 'easy-auto-tag-insurance', name: 'Easy Auto Tag & Insurance', city: 'Philadelphia',
  category: 'Auto tags and insurance', vertical: 'Professional Services',
  url: 'http://www.easyautotag.com/',
  description: 'Auto tags and insurance in Philadelphia. Notary, tags, and a desk that still takes walk-ins. The current site is not on HTTPS.',
  marquee: ['Philadelphia', 'Tags', 'Insurance', 'Notary'],
  hero: { eyebrow: 'Philadelphia | Tags and insurance', headline: 'Tags, insurance, a desk that is open', sub: 'Easy Auto Tag & Insurance is a Philadelphia tag and insurance office. The current site is marked not secure and barely has copy. The rebuild puts the map and the next action on the first screen.', ctaPrimary: { label: 'Open the official site', href: 'http://www.easyautotag.com/' }, ctaSecondary: { label: 'Plan a visit', href: '#visit' }, glassFloat: { title: 'Philadelphia', sub: 'Tags and insurance' } },
  offerings: { heading: 'Tags, insurance, the errand that has to finish.', items: ['Auto tags and title work for the people who still have to stand in a line.', 'Insurance conversations at the same desk, when they actually write it.', 'A notary and the paper the state still wants in an envelope.'] },
  gallery: { heading: 'A counter, a printer, a finished errand.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'A Philadelphia tag office', paragraphs: ['Easy Auto Tag & Insurance is listed in Philadelphia. The radar scored the site as a rebuild: no HTTPS, 11 words on the homepage, no phone on the page.', 'Confirm the street address, phone, and hours on the official site or by walking up. We will not invent a window number.'], imageIndex: 2 },
  experience: { heading: 'How the errand should go.', items: ['You bring the title, the ID, and the question.', 'They tell you if they can finish it today.', 'You leave with tags or a list of the one document you still need.'] },
  feature: { heading: 'HTTPS is the first trust signal', text: 'A tag and insurance office asking for personal information on a non-secure page is the fault the radar caught. The rebuild is the page you can actually use.', cta: { label: 'Open the site', href: 'http://www.easyautotag.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Philadelphia walk-ins', text: 'Confirm hours before you take a number. Tag offices close earlier than you think.', imageIndex: 13, cta: { label: 'Official site', href: 'http://www.easyautotag.com/' } },
  catalog: { items: [{ title: 'Tags', href: 'http://www.easyautotag.com/', imageIndex: 9 }, { title: 'Insurance', href: 'http://www.easyautotag.com/', imageIndex: 10 }, { title: 'Contact', href: 'http://www.easyautotag.com/', imageIndex: 11 }] },
  contact: { heading: 'Confirm before you go.', sub: 'Philadelphia. Pull live address and hours from the official site.' },
  closing: { cta: { label: 'Open the official site', href: 'http://www.easyautotag.com/' } },
  links: [{ label: 'Official site', href: 'http://www.easyautotag.com/' }],
}));

S.push(brief({
  slug: 'eisenberg-rothweiler', name: 'Eisenberg, Rothweiler, Winkler, Eisenberg & Jeck', city: 'Philadelphia',
  category: 'Personal injury law', vertical: 'Legal',
  url: 'https://www.erlegal.com/', phone: '(215) 546-6636',
  address: '1634 Spruce Street, Philadelphia, PA 19103',
  description: 'Philadelphia personal injury firm on Spruce Street near Rittenhouse Square. Catastrophic injury, medical malpractice, products, and a free consult.',
  marquee: ['Spruce Street', 'Rittenhouse', 'Injury law', 'Free consult'],
  hero: { eyebrow: 'Philadelphia | Personal injury', headline: 'Serious injury. A firm on Spruce.', sub: 'Eisenberg, Rothweiler, Winkler, Eisenberg & Jeck sits at 1634 Spruce Street, one block from Rittenhouse Square. Personal injury, medical malpractice, products. Call (215) 546-6636 for a free consult.', ctaPrimary: { label: 'Call for a consult', href: 'tel:2155466636' }, ctaSecondary: { label: 'Open the site', href: 'https://www.erlegal.com/' }, glassFloat: { title: '1634 Spruce', sub: 'Rittenhouse' } },
  offerings: { heading: 'Cases that change a life.', items: ['Catastrophic personal injury and the defendants who can actually pay a verdict.', 'Medical malpractice and birth injury work that needs a firm used to hospitals.', 'Product liability and construction accidents, not a volume fender-bender mill.'] },
  gallery: { heading: 'A Center City office, not a billboard.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Spruce Street, one block from the Square', paragraphs: ['The firm’s office is 1634 Spruce Street, Philadelphia, PA 19103. Listings still use erlegal.com. Related pages also sit at 1634legal.com under a longer partnership name. Confirm the live letterhead before you send records.', 'Call (215) 546-6636. Toll-free listings also show (866) 569-3400. The work is catastrophic injury, not a small-claims stack.'], imageIndex: 2 },
  experience: { heading: 'How a consult should go.', items: ['You call. You get a person, not a form that goes nowhere.', 'They tell you if the case is theirs, or they tell you it is not.', 'You leave with a next step, even if the next step is no.'] },
  feature: { heading: 'A free consult, on purpose', text: 'The firm asks injured people to call before they guess. The rebuild puts the Spruce Street map, the phone, and that consult on the first screen.', cta: { label: 'Call Spruce Street', href: 'tel:2155466636' }, imageIndex: 8 },
  spotlight: { heading: 'Philadelphia and Pennsylvania', text: 'The office is Center City. The cases run the state. Confirm where they will file before you assume every county is in.', imageIndex: 13, cta: { label: 'Official site', href: 'https://www.erlegal.com/' } },
  catalog: { items: [{ title: 'Injury', href: 'https://www.erlegal.com/', imageIndex: 9 }, { title: 'Consult', href: 'https://www.erlegal.com/', imageIndex: 10 }, { title: 'Office', href: 'https://www.google.com/maps/search/?api=1&query=1634+Spruce+Street+Philadelphia+PA', imageIndex: 11 }] },
  contact: { heading: 'Find the office.', sub: '1634 Spruce Street, Philadelphia. One block from Rittenhouse Square.' },
  closing: { cta: { label: 'Call for a consult', href: 'tel:2155466636' } },
  links: [{ label: 'Call', href: 'tel:2155466636' }, { label: 'Official site', href: 'https://www.erlegal.com/' }],
}));

S.push(brief({
  slug: 'mcmenamin-margiotti', name: 'McMenamin & Margiotti', city: 'Colmar',
  category: 'Law firm', vertical: 'Legal',
  url: 'https://buxmontlaw.com/',
  address: '2307 N Broad St, Colmar, PA 18915',
  description: 'Montgomery and Bucks County law firm. Family, divorce, criminal defense, DUI, injury, and civil litigation. Free consult with Pat McMenamin.',
  marquee: ['Colmar', 'Family law', 'DUI', 'Criminal defense'],
  hero: { eyebrow: 'Colmar | Montgomery and Bucks', headline: 'Honesty. Integrity. Results.', sub: 'McMenamin Law focuses on you, not a brochure about themselves. Family and divorce, criminal defense, DUI, injury, civil litigation. Pat McMenamin has practiced in these suburbs for over 35 years.', ctaPrimary: { label: 'Request a consult', href: 'https://buxmontlaw.com/' }, ctaSecondary: { label: 'Open the site', href: 'https://buxmontlaw.com/' }, glassFloat: { title: 'Colmar', sub: 'Bucks and Montco' } },
  offerings: { heading: 'Family, criminal, injury, one firm.', items: ['Family and divorce, including support and custody, with a plan you hear in the first meeting.', 'Criminal and DUI defense that does not plead you out for a quick fee.', 'Accident and injury work that still names compassion and a result.'] },
  gallery: { heading: 'A suburban office that still takes the meeting.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Over 35 years in these counties', paragraphs: ['Patrick J. McMenamin has practiced in the Philadelphia suburbs for over 35 years. The firm’s site is buxmontlaw.com. Listings also put an office at 2307 N Broad St, Colmar, PA 18915.', 'The first consult is free. They say they will tell you the cost and what you can expect. Confirm the live phone and hours on the official site before you drive.'], imageIndex: 2 },
  experience: { heading: 'What the consult is for.', items: ['Pat meets you. There is no charge for the first conversation.', 'They listen without a clock on the table.', 'You leave knowing the strategy, the cost, and whether to hire them.'] },
  feature: { heading: 'DUI defense that actually defends', text: 'The firm warns that some DUI lawyers take the money and plead you guilty. They want you in the office, with an attorney who will fight the charge in Montgomery and Bucks County courts.', cta: { label: 'Read the practice', href: 'https://buxmontlaw.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Lansdale, Colmar, the two counties', text: 'The homepage speaks to Lansdale. The radar listed Colmar. Confirm which door you are walking through before you put the folder on the seat.', imageIndex: 13, cta: { label: 'Official site', href: 'https://buxmontlaw.com/' } },
  catalog: { items: [{ title: 'Family law', href: 'https://buxmontlaw.com/', imageIndex: 9 }, { title: 'DUI defense', href: 'https://buxmontlaw.com/', imageIndex: 10 }, { title: 'Consult', href: 'https://buxmontlaw.com/', imageIndex: 11 }] },
  contact: { heading: 'Find the office.', sub: 'Colmar / Lansdale. Confirm the live address and phone on buxmontlaw.com.' },
  closing: { cta: { label: 'Request a consult', href: 'https://buxmontlaw.com/' } },
  links: [{ label: 'Official site', href: 'https://buxmontlaw.com/' }],
}));

S.push(brief({
  slug: 'barnes-financial-group', name: 'Barnes Financial Group', city: 'Media',
  category: 'Financial planning', vertical: 'Professional Services',
  url: 'http://www.barnesfinancial.com/',
  description: 'Financial planning in Media, Delaware County. Confirm advisors, credentials, and hours on the official site before you send documents.',
  marquee: ['Media', 'Planning', 'Delaware County', 'Advisors'],
  hero: { eyebrow: 'Media | Financial planning', headline: 'A plan you can sit with', sub: 'Barnes Financial Group is listed in Media. The current site is dated. The work is still a conversation about money, risk, and a next step you can keep.', ctaPrimary: { label: 'Open the official site', href: 'http://www.barnesfinancial.com/' }, ctaSecondary: { label: 'Plan a visit', href: '#visit' }, glassFloat: { title: 'Media', sub: 'Delaware County' } },
  offerings: { heading: 'Advice, documents, a real review.', items: ['Financial planning for households that already have a tax person and still need a plan.', 'A review of the accounts you actually hold, not a product ladder.', 'Follow-up that belongs to the same advisor who took the first meeting.'] },
  gallery: { heading: 'A quiet office, a clear table.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Media, Delaware County', paragraphs: ['Barnes Financial Group is listed in Media. The radar flagged a site with no viewport.', 'Confirm the street address, phone, and advisor names on the official site before you send account statements. We will not invent credentials.'], imageIndex: 2 },
  experience: { heading: 'How a first meeting should go.', items: ['You bring the statements. They ask what the money is for.', 'You hear a plan in language you can repeat at dinner.', 'You leave with homework, not a binder you will not open.'] },
  feature: { heading: 'Trust starts with a readable page', text: 'A planning firm that cannot render on a phone is asking for personal data from a desktop-only relic. The rebuild puts the next action and the map first.', cta: { label: 'Open the site', href: 'http://www.barnesfinancial.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Delaware County households', text: 'Media is the listed city. Confirm whether they will take a household that is still accumulating, or only the ones already in distribution.', imageIndex: 13, cta: { label: 'Official site', href: 'http://www.barnesfinancial.com/' } },
  catalog: { items: [{ title: 'Planning', href: 'http://www.barnesfinancial.com/', imageIndex: 9 }, { title: 'Advisors', href: 'http://www.barnesfinancial.com/', imageIndex: 10 }, { title: 'Contact', href: 'http://www.barnesfinancial.com/', imageIndex: 11 }] },
  contact: { heading: 'Confirm before you send files.', sub: 'Media, Delaware County. Pull live address and phone from the official site.' },
  closing: { cta: { label: 'Open the official site', href: 'http://www.barnesfinancial.com/' } },
  links: [{ label: 'Official site', href: 'http://www.barnesfinancial.com/' }],
}));

S.push(brief({
  slug: 'bpm-fitness', name: 'BPM Fitness', city: 'Philadelphia',
  category: 'Fitness studio', vertical: 'Spas & Wellness',
  url: 'https://bpmfitnessphl.com/',
  description: 'Fitness studio in Philadelphia. Classes, training, and a floor that should be easy to find on a phone. Confirm hours on the official site.',
  marquee: ['Philadelphia', 'Training', 'Classes', 'Studio'],
  hero: { eyebrow: 'Philadelphia | Fitness', headline: 'A studio with a pulse', sub: 'BPM Fitness is a Philadelphia studio. The current site is dated and sometimes errors out. The rebuild puts the schedule, the map, and the next class on the first screen.', ctaPrimary: { label: 'Open the official site', href: 'https://bpmfitnessphl.com/' }, ctaSecondary: { label: 'Plan a visit', href: '#visit' }, glassFloat: { title: 'Philadelphia', sub: 'Fitness studio' } },
  offerings: { heading: 'Train, recover, come back.', items: ['Classes and training for people who already live in the city.', 'A floor that should tell you the next session without a desktop maze.', 'Coaches you can name, not a rotating app trainer.'] },
  gallery: { heading: 'A room that wants you back tomorrow.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'A Philadelphia studio', paragraphs: ['BPM Fitness is listed in Philadelphia. The radar scored the site as a rebuild: no viewport, almost no homepage copy.', 'Confirm the street address, the schedule, and the drop-in rules on the official site before you go. We will not invent a class time.'], imageIndex: 2 },
  experience: { heading: 'How a first session should go.', items: ['You find the door from your phone.', 'You meet a coach who asks what you are here for.', 'You leave knowing the next class, not guessing from Instagram.'] },
  feature: { heading: 'The schedule belongs on the homepage', text: 'A studio that hides hours on a broken page loses the 6am visitor. The rebuild puts schedule, map, and a real CTA where a tired thumb can hit them.', cta: { label: 'Open the site', href: 'https://bpmfitnessphl.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Philadelphia, one floor', text: 'Confirm parking, the neighborhood, and whether drop-ins are real before you bag the shoes.', imageIndex: 13, cta: { label: 'Official site', href: 'https://bpmfitnessphl.com/' } },
  catalog: { items: [{ title: 'Classes', href: 'https://bpmfitnessphl.com/', imageIndex: 9 }, { title: 'Training', href: 'https://bpmfitnessphl.com/', imageIndex: 10 }, { title: 'Contact', href: 'https://bpmfitnessphl.com/', imageIndex: 11 }] },
  contact: { heading: 'Confirm before you go.', sub: 'Philadelphia. Pull live address and hours from the official site.' },
  closing: { cta: { label: 'Open the official site', href: 'https://bpmfitnessphl.com/' } },
  links: [{ label: 'Official site', href: 'https://bpmfitnessphl.com/' }],
}));

S.push(brief({
  slug: 'train-and-nourish', name: 'Train and Nourish', city: 'Philadelphia',
  category: 'Women’s personal training', vertical: 'Spas & Wellness',
  url: 'https://trainandnourish.com/', phone: '(267) 710-7744',
  address: '1621 East Passyunk Ave, Philadelphia, PA 19148',
  description: 'Women-only personal training and nutrition studios in Philadelphia, Ardmore, and West Chester. Founded by Jenna Reilly. Book a free consult.',
  marquee: ['East Passyunk', 'Fishtown', 'Ardmore', 'West Chester', 'Women only'],
  hero: { eyebrow: 'Philadelphia | Women’s training', headline: 'Weight training without the gym intimidation', sub: 'Train and Nourish is Jenna Reilly’s women-only studio. Five locations: East Passyunk, Art Museum, Fishtown, Ardmore, West Chester. Private training, small classes, nutrition coaching.', ctaPrimary: { label: 'Book a free consult', href: 'https://trainandnourish.com/' }, ctaSecondary: { label: 'Call Passyunk', href: 'tel:2677107744' }, glassFloat: { title: '1621 E Passyunk', sub: 'Women only' } },
  offerings: { heading: 'Train. Nourish. Stay.', items: ['1-on-1 and semi-private training with female coaches in a women-only room.', 'Small group classes capped at 11, modified to the body in front of them.', 'Virtual nutrition coaching for energy, weight, and hormones.'] },
  gallery: { heading: 'Bright rooms, real barbells, no audience.', imageIndexes: [3, 4, 5, 6, 7, 12] },
  story: { heading: 'Born from gym intimidation', paragraphs: ['Jenna Reilly built Train and Nourish because her clients felt watched on a gym floor and stuck on cardio machines. The studios are private and women-only on purpose.', 'East Passyunk is 1621 East Passyunk Ave, (267) 710-7744. Art Museum 559 North 20th St. Fishtown 1316 North Front St. Ardmore 19 Cricket Ave. West Chester 109 N High St. Confirm hours on the official site.'], imageIndex: 2 },
  experience: { heading: 'A free 30-minute consult.', items: ['You talk goals and history. They build a plan.', 'Beginners, pregnancy, injury, peri-menopause: the site names those rooms on purpose.', 'You leave knowing which studio and which coach.'] },
  feature: { heading: 'Five studios, one standard', text: 'East Passyunk, Art Museum, Fishtown, Ardmore, West Chester. Same idea in each: female coaches, a private room, weight training taught as a skill.', cta: { label: 'See locations', href: 'https://trainandnourish.com/' }, imageIndex: 8 },
  spotlight: { heading: 'Nutrition sits next to the barbell', text: 'Karley Kochenour leads nutrition coaching. Virtual, so the food plan does not depend on which studio you train in.', imageIndex: 13, cta: { label: 'Book a consult', href: 'https://trainandnourish.com/' } },
  catalog: { items: [{ title: 'Personal training', href: 'https://trainandnourish.com/', imageIndex: 9 }, { title: 'Classes', href: 'https://trainandnourish.com/', imageIndex: 10 }, { title: 'Locations', href: 'https://trainandnourish.com/', imageIndex: 11 }] },
  contact: { heading: 'Pick the studio.', sub: 'Start at 1621 East Passyunk Ave, or confirm the other four on the official site.' },
  closing: { cta: { label: 'Book a free consult', href: 'https://trainandnourish.com/' } },
  links: [{ label: 'Official site', href: 'https://trainandnourish.com/' }, { label: 'Call Passyunk', href: 'tel:2677107744' }],
}));

function writeAll() {
  if (S.length !== 25) {
    throw new Error(`expected 25 sites, got ${S.length}`);
  }
  fs.mkdirSync(BRIEFS, { recursive: true });
  for (const site of S) {
    fs.writeFileSync(path.join(BRIEFS, `${site.slug}.json`), JSON.stringify(site, null, 2) + '\n');
    const assets = path.join(SITES, site.slug, 'assets');
    fs.mkdirSync(assets, { recursive: true });
    for (let i = 1; i <= 13; i++) {
      const svg = buildSvg({
        slug: site.slug,
        index: i,
        vertical: site.category.toLowerCase().includes('dent') ? 'dentist'
          : site.category.toLowerCase().includes('vet') ? 'veterinary'
          : site.category.toLowerCase().includes('eye') || site.category.toLowerCase().includes('optom') ? 'optometrist'
          : site.category.toLowerCase().includes('urgent') || site.category.toLowerCase().includes('plastic') || site.category.toLowerCase().includes('hormone') ? 'clinic'
          : site.category.toLowerCase().includes('air') ? 'hvac'
          : site.category.toLowerCase().includes('electric') ? 'electrician'
          : site.category.toLowerCase().includes('auger') ? 'metal-construction'
          : site.category.toLowerCase().includes('land') ? 'gardener'
          : site.category.toLowerCase().includes('bath') || site.category.toLowerCase().includes('kitchen') ? 'kitchen'
          : site.category.toLowerCase().includes('floor') ? 'floorer'
          : site.category.toLowerCase().includes('tag') || site.category.toLowerCase().includes('insurance') ? 'insurance'
          : site.category.toLowerCase().includes('law') || site.category.toLowerCase().includes('injury') ? 'lawyer'
          : site.category.toLowerCase().includes('financial') ? 'accountant'
          : site.category.toLowerCase().includes('train') || site.category.toLowerCase().includes('fitness') ? 'fitness-centre'
          : site.category.toLowerCase().includes('auto') ? 'car-repair'
          : 'ring',
        name: site.name,
      });
      fs.writeFileSync(path.join(assets, `image-${i}.svg`), svg);
    }
    fs.writeFileSync(
      path.join(assets, 'PROVENANCE.json'),
      JSON.stringify({
        slug: site.slug,
        generated: 'animated-align-teal-svg',
        photoreal: false,
        count: 13,
        note: 'Illustrated motion graphics in Align HCM teal/navy/cream. Not client photography.',
      }, null, 2) + '\n'
    );
    console.log('wrote', site.slug);
  }
}

writeAll();
console.log(`Wrote ${S.length} briefs and illustrated assets.`);

