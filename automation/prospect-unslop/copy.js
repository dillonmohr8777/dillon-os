'use strict';

/**
 * Honest homepage copy. Keep their nouns. Never invent phone, hours, menu, or awards.
 */

function clip(s, n) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n).replace(/\s+\S*$/, '')}.`;
}

function clean(s) {
  return String(s || '')
    .replace(/[\u2014\u2013]/g, ', ')
    .replace(/\s+,/g, ',')
    .replace(/,\s+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isJunk(s) {
  return /lorem|coming soon|privacy policy|just a moment|cookie|cloudflare|enable javascript|under construction|closed our doors|out of business/i.test(
    s || ''
  );
}

function familyBank(family, name) {
  const n = name;
  const banks = {
    food: {
      points: ['The plate leads', 'The kitchen stays in the picture', 'Hours live on their official site'],
      offerings: [
        { title: 'The plate', body: `${n} is a kitchen first. The preview leads with food, not a stock dining room.` },
        { title: 'The pass', body: 'Hands, heat, and the ticket. You see the work behind the dish.' },
        { title: 'The room', body: 'A table worth sitting down for. Reservations and tonight\'s menu stay with them.' },
      ],
      experience: [
        { title: 'Arrive hungry', body: 'The homepage should make the food obvious before anyone hunts a PDF menu.' },
        { title: 'See the work', body: 'Prep, the pass, and the plate. Not random people in a sunlit atrium.' },
        { title: 'Confirm with them', body: 'Call, hours, and ordering stay on the official source so nothing here is guessed.' },
      ],
      workHeading: 'What comes out of this kitchen.',
      galleryHeading: 'Food worth sitting down for.',
      storyHeading: 'A kitchen with a name on the door.',
      featureHeading: 'Close enough to taste the work.',
      contactHeading: 'Make the next visit easy.',
      closing: `${n} should feel like a place you can taste from the first screen.`,
    },
    dental: {
      points: ['The chair is calm', 'Hands on real care', 'You book with them'],
      offerings: [
        { title: 'The visit', body: `${n} is about a real operatory, not a stock smile collage.` },
        { title: 'The team', body: 'People who do the work: exam, cleaning, the conversation at the chair.' },
        { title: 'The next step', body: 'Call or book on their official line. Nothing here invents an opening.' },
      ],
      experience: [
        { title: 'Walk in knowing who they are', body: 'Name, place, and a clear call path above the fold.' },
        { title: 'See the room', body: 'Treatment, reception, and careful hands. Not a handshake in an atrium.' },
        { title: 'Book with them', body: 'Hours and insurance questions stay on their official site.' },
      ],
      workHeading: 'Care that looks like the actual chair.',
      galleryHeading: 'People doing the work.',
      storyHeading: 'A practice, not a template.',
      featureHeading: 'Close on the skill.',
      contactHeading: 'Start the visit.',
      closing: `${n} should feel easy to call before anyone scrolls twice.`,
    },
    veterinary: {
      points: ['Animals first', 'A calm exam', 'You confirm with the clinic'],
      offerings: [
        { title: 'The exam', body: `${n} is a clinic for pets. The preview shows the work, not clip-art paws.` },
        { title: 'The team', body: 'Veterinarians and techs at the table, with the animal in the frame.' },
        { title: 'The visit', body: 'Reception, the leash, the next appointment. Details stay official.' },
      ],
      experience: [
        { title: 'Arrive with your pet', body: 'The homepage should feel like a clinic, not a stock farm.' },
        { title: 'See the care', body: 'Exam table, gentle hands, a tech who is actually working.' },
        { title: 'Call the desk', body: 'Hours and emergencies belong on their official line.' },
      ],
      workHeading: 'Care that looks like a real clinic.',
      galleryHeading: 'Animals and the people who treat them.',
      storyHeading: 'A hospital for pets, named.',
      featureHeading: 'Hands on the animal, not the slogan.',
      contactHeading: 'Reach the clinic.',
      closing: `${n} should make the next appointment feel obvious.`,
    },
    auto: {
      points: ['The bay is real', 'Hands on the car', 'Service starts with a call'],
      offerings: [
        { title: 'The shop', body: `${n} is a working floor: cars, tools, and people who know the bay.` },
        { title: 'The visit', body: 'Advisor and driver in the lane. Not a handshake in a glass lobby.' },
        { title: 'The next step', body: 'Hours, estimates, and parts stay on their official site.' },
      ],
      experience: [
        { title: 'Pull in', body: 'The homepage should look like a shop you can drive to.' },
        { title: 'Talk to the person doing the work', body: 'Inspection, the hood, the tablet in the lane.' },
        { title: 'Leave with a plan', body: 'Confirm wait times and pricing with them, not with guessed copy.' },
      ],
      workHeading: 'The work, in the bay where it happens.',
      galleryHeading: 'People on the actual job.',
      storyHeading: 'A shop with a name over the door.',
      featureHeading: 'Close on the tool in the hand.',
      contactHeading: 'Get the car in.',
      closing: `${n} should feel like a shop you can trust from the first scroll.`,
    },
    legal: {
      points: ['A real consultation', 'Documents in the room', 'You call their office'],
      offerings: [
        { title: 'The conversation', body: `${n} is counsel in a room, not a marble-column stock photo.` },
        { title: 'The work', body: 'Files, listening, the next step written down.' },
        { title: 'The office', body: 'A place you can actually visit. Hours stay official.' },
      ],
      experience: [
        { title: 'Reach them', body: 'Phone and the official site are the path. Nothing here invents a retainer.' },
        { title: 'Sit down', body: 'A consultation looks like two people at a table, not a skyline mural.' },
        { title: 'Leave with a next step', body: 'What they handle is their language. We keep their nouns when harvest has them.' },
      ],
      workHeading: 'Counsel that looks like the actual office.',
      galleryHeading: 'People in the work.',
      storyHeading: 'A firm with a name you can say out loud.',
      featureHeading: 'Close on the meeting, not the slogan.',
      contactHeading: 'Start the conversation.',
      closing: `${n} should feel like an office you can call today.`,
    },
    trade: {
      points: ['Job site first', 'Hands on the trade', 'Estimates stay official'],
      offerings: [
        { title: 'The job', body: `${n} is tools, vans, and people on the work. Not a stock handshake.` },
        { title: 'The crew', body: 'Loading materials, talking with a homeowner, finishing the install.' },
        { title: 'The ask', body: 'Call for an estimate. We don\'t invent a price.' },
      ],
      experience: [
        { title: 'See the trade', body: 'The homepage should look like the work they actually do.' },
        { title: 'Talk to the lead', body: 'A conversation at the door or in the shop, not a fake testimonial wall.' },
        { title: 'Book the visit', body: 'Hours and service area stay on their official site.' },
      ],
      workHeading: 'The work, on the job.',
      galleryHeading: 'People doing the trade.',
      storyHeading: 'A crew with a name on the van.',
      featureHeading: 'Close on the hands.',
      contactHeading: 'Ask for the visit.',
      closing: `${n} should look like a crew you would let in the house.`,
    },
    salon: {
      points: ['The chair is the product', 'Hands on the service', 'Book with them'],
      offerings: [
        { title: 'The service', body: `${n} is a station, tools, and a person at work.` },
        { title: 'The room', body: 'A salon you can walk into, not a marble stock set.' },
        { title: 'The book', body: 'Appointments stay on their official line.' },
      ],
      experience: [
        { title: 'Walk in', body: 'The homepage should feel like the shop, not a perfume ad.' },
        { title: 'Sit in the chair', body: 'Hands, tools, the actual service in progress.' },
        { title: 'Book the next one', body: 'Hours and walk-in rules stay official.' },
      ],
      workHeading: 'The chair, not the slogan.',
      galleryHeading: 'People at the station.',
      storyHeading: 'A shop with a name on the window.',
      featureHeading: 'Close on the craft.',
      contactHeading: 'Book the chair.',
      closing: `${n} should make the next appointment feel obvious.`,
    },
    fitness: {
      points: ['The floor is real', 'Coaching in the room', 'You train with them'],
      offerings: [
        { title: 'The session', body: `${n} is coaching, a floor, and a plan. Not a stock high-five.` },
        { title: 'The work', body: 'Lifts, stretches, a therapist or trainer actually spotting the movement.' },
        { title: 'The next visit', body: 'Membership and hours stay on their official site.' },
      ],
      experience: [
        { title: 'Walk the floor', body: 'The homepage should look like a gym or clinic you can enter.' },
        { title: 'Train with someone', body: 'A coach in the frame, not a disconnected abs collage.' },
        { title: 'Come back', body: 'Schedules stay official. Nothing here invents a class time.' },
      ],
      workHeading: 'Training that looks like the floor.',
      galleryHeading: 'People in the work.',
      storyHeading: 'A gym or clinic with a name.',
      featureHeading: 'Close on the spot.',
      contactHeading: 'Start a session.',
      closing: `${n} should feel like a floor you would actually train on.`,
    },
    medical: {
      points: ['A calm exam', 'Clinicians at work', 'You call the desk'],
      offerings: [
        { title: 'The visit', body: `${n} is an exam room and a person who knows the chart.` },
        { title: 'The team', body: 'Clinicians, vitals, the front desk. Not a stock stethoscope pile.' },
        { title: 'The next step', body: 'Hours and insurance stay on their official site.' },
      ],
      experience: [
        { title: 'Check in', body: 'The homepage should make the clinic obvious.' },
        { title: 'See the room', body: 'A provider in the work, not a marble lobby.' },
        { title: 'Follow up', body: 'Appointments stay official. Nothing here invents availability.' },
      ],
      workHeading: 'Care in the actual room.',
      galleryHeading: 'People doing the work.',
      storyHeading: 'A clinic with a name on the door.',
      featureHeading: 'Close on the tray, not the slogan.',
      contactHeading: 'Reach the desk.',
      closing: `${n} should feel easy to call before the fold is gone.`,
    },
    retail: {
      points: ['The shop is the product', 'Hands on the goods', 'Visit or call them'],
      offerings: [
        { title: 'The floor', body: `${n} is a shop you can walk. The preview shows the goods and the people.` },
        { title: 'The counter', body: 'A conversation over the thing they sell, not a mall stock set.' },
        { title: 'The visit', body: 'Hours stay official. Nothing here invents inventory.' },
      ],
      experience: [
        { title: 'Browse', body: 'The homepage should look like the shop, not a catalog template.' },
        { title: 'Ask', body: 'An associate in the frame, handling the product.' },
        { title: 'Take it home', body: 'Pricing and stock stay on their official site.' },
      ],
      workHeading: 'A shop that looks like a shop.',
      galleryHeading: 'People and the product.',
      storyHeading: 'A storefront with a name.',
      featureHeading: 'Close on what they sell.',
      contactHeading: 'Plan the visit.',
      closing: `${n} should feel like a counter you would walk up to.`,
    },
    bridal: {
      points: ['The gown is the work', 'A fitting, not a catalog', 'You book with them'],
      offerings: [
        { title: 'The fitting', body: `${n} is a room, a gown, and someone who knows the zipper.` },
        { title: 'The work', body: 'Pins, fabric, a conversation in natural light.' },
        { title: 'The appointment', body: 'Hours stay official. Nothing here invents a sample sale.' },
      ],
      experience: [
        { title: 'Book the fitting', body: 'The homepage should make the shop feel real.' },
        { title: 'Try the dress', body: 'A stylist in the work, not a Pinterest collage.' },
        { title: 'Leave with a plan', body: 'Alterations and dates stay with them.' },
      ],
      workHeading: 'The fitting room, not the slogan.',
      galleryHeading: 'People in the work.',
      storyHeading: 'A shop with a name on the door.',
      featureHeading: 'Close on the cloth.',
      contactHeading: 'Book the fitting.',
      closing: `${n} should feel like a shop you would actually walk into.`,
    },
    professional: {
      points: ['The work is specific', 'People at the tools', 'You reach them directly'],
      offerings: [
        { title: 'The work', body: `${n} is a specialist shop: people doing the job, not a skyline mural.` },
        { title: 'The conversation', body: 'A plan on the table. Their nouns, when harvest has them.' },
        { title: 'The next step', body: 'Call or visit the official source. Nothing here invents a retainer.' },
      ],
      experience: [
        { title: 'Find them', body: 'Name, place, and a clear path above the fold.' },
        { title: 'See the work', body: 'A workstation, a meeting, hands on the tools of the trade.' },
        { title: 'Follow up', body: 'Hours and scope stay official.' },
      ],
      workHeading: 'The work, in the room where it happens.',
      galleryHeading: 'People, not stock extras.',
      storyHeading: 'A studio or office with a name.',
      featureHeading: 'Close on the craft.',
      contactHeading: 'Start the conversation.',
      closing: `${n} should feel like a team you can actually reach.`,
    },
  };
  return banks[family] || banks.professional;
}

function voiceFromHtml(html) {
  const strip = (s) =>
    String(s || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
    .replace(/[\u2014\u2013]/g, ', ')
    .replace(/\s+,/g, ',')
    .replace(/,\s+/g, ', ')
    .replace(/\s+/g, ' ')
      .trim();
  const headings = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map((m) => strip(m[1]))
    .filter((h) => h.length > 2 && h.length < 90);
  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => strip(m[1]))
    .filter((p) => p.length > 40 && p.length < 600);
  const navLabels = [...html.matchAll(/<nav[\s\S]*?<\/nav>/gi)]
    .flatMap((block) => [...block[0].matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)])
    .map((m) => strip(m[1]))
    .filter((n) => n.length > 2 && n.length < 28);
  const ctaLabels = [...html.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((m) => strip(m[1]))
    .filter((t) => /call|book|order|visit|contact|schedule|reserve/i.test(t) && t.length < 32);
  return {
    title: strip((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ''),
    metaDescription:
      (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i) || [])[1] || '',
    headings,
    paragraphs,
    navLabels,
    ctaLabels,
    wordCount: strip(html).split(/\s+/).filter(Boolean).length,
  };
}

function honestCopy(site, harvest, family) {
  const bank = familyBank(family, site.name);
  const v = harvest?.voice || {};
  const headings = [...(v.headings || []), ...(harvest?.headings || [])]
    .map(clean)
    .filter((h) => h.length > 8 && h.length < 80 && !isJunk(h) && !/^(home|welcome to)/i.test(h));
  const paras = [...(v.paragraphs || []), ...(harvest?.paragraphs || []), ...(harvest?.paras || [])]
    .map(clean)
    .filter((p) => p.length > 40 && p.length < 500 && !isJunk(p));
  const nav = (v.navLabels || []).map(clean).filter((n) => n.length > 2 && n.length < 28 && !isJunk(n));
  const ctas = (v.ctaLabels || []).map(clean).filter((c) => c.length > 2 && c.length < 32 && !isJunk(c));

  const headline = headings[0] && !/closed|coming soon/i.test(headings[0]) ? headings[0] : site.name;
  const sub =
    paras[0] ||
    (v.metaDescription && !isJunk(v.metaDescription) ? clean(v.metaDescription) : null) ||
    `${site.name} in ${site.city || 'Pennsylvania'}. A private concept homepage: their mark when we have it, industry photography, and a clearer visit path.`;

  const harvestedOfferings = headings.slice(1, 8).filter((h) => h !== headline);
  const offerings =
    harvestedOfferings.length >= 3
      ? harvestedOfferings.slice(0, 3).map((title, i) => ({
          title,
          body: paras[i + 1] || bank.offerings[i].body,
        }))
      : bank.offerings;

  const story = clip(
    paras.slice(0, 3).join(' ') || `${bank.offerings[0].body} ${bank.experience[0].body}`,
    640
  );
  const storyMore = clip(paras[3] || bank.experience[1].body, 280);
  const featureBody = clip(paras[4] || bank.offerings[1].body, 280);

  const catalog = [];
  if (site.url) {
    catalog.push({
      title: 'Official site',
      body: 'Menus, hours, and booking stay on their site. This preview never guesses those.',
      href: site.url,
    });
  }
  if (site.phone) {
    catalog.push({
      title: 'Call',
      body: site.phone,
      href: `tel:${String(site.phone).replace(/\D/g, '')}`,
    });
  }
  if (site.address) {
    catalog.push({
      title: 'Find them',
      body: site.address,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`,
    });
  }

  const out = {
    headline: clip(headline, 70),
    sub: clip(sub, 280),
    points: bank.points,
    offerings,
    experience: bank.experience,
    catalog,
    story,
    storyMore,
    featureBody,
    workHeading: bank.workHeading,
    galleryHeading: bank.galleryHeading,
    storyHeading: bank.storyHeading,
    featureHeading: bank.featureHeading,
    contactHeading: bank.contactHeading,
    closing: bank.closing,
    navWork: nav[0] || 'Work',
    navStory: nav[1] || 'Story',
    navVisit: nav.find((n) => /visit|contact|hours|book|call/i.test(n)) || 'Visit',
    primaryCtaFallback: ctas[0] || '',
    description: clip(`${site.name} in ${site.city || 'PA'}. Private concept preview.`, 155),
  };
  out.wordCount = wordCount(out);
  return out;
}

function wordCount(copy) {
  const blob = [
    copy.headline,
    copy.sub,
    copy.story,
    copy.storyMore,
    copy.featureBody,
    copy.closing,
    ...(copy.offerings || []).flatMap((o) => [o.title, o.body]),
    ...(copy.experience || []).flatMap((o) => [o.title, o.body]),
    ...(copy.catalog || []).flatMap((o) => [o.title, o.body]),
    ...(copy.points || []),
  ].join(' ');
  return blob.split(/\s+/).filter(Boolean).length;
}

module.exports = { honestCopy, familyBank, wordCount, clip, clean, voiceFromHtml };
