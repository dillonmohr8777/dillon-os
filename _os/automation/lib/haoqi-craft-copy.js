'use strict';

/**
 * Turn a harvest-lite into Haoqi page copy. Their nouns stay. Filler goes.
 * Nothing here invents a year, a doctor, or a neighborhood.
 */

const CHROME = /^(home|about|about us|contact|contact us|services|our services|menu|blog|news|gallery|reviews|testimonials|faq|privacy|terms|cookie|login|hours|location|locations|our team|meet the team|welcome|404 error|oops)$/i;
const MENU_SOUP = /cosmetic dentist cosmetic|patient info financial|facebook icon|instagram icon|close \w+ open|shop by series|document\.getElementById|new patient registration|top philadelphia dentist|just a moment|site not found/i;

function tidy(s) {
  return String(s || '')
    .replace(/&amp;#038;|&#038;|&amp;/g, '&')
    .replace(/&amp;#039;|&#039;|&apos;|&#39;/g, "'")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/--&gt;|&gt;|&lt;/g, ' ')
    .replace(/\u2014|\u2013/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .trim();
}

function firstSentence(s, max = 180) {
  const t = tidy(s);
  const cut = t.split(/(?<=[.!?])\s+/)[0] || t;
  if (cut.length <= max) return cut;
  return `${cut.slice(0, max).replace(/\s+\S*$/, '')}.`;
}

function isUseful(s) {
  const t = tidy(s);
  if (t.length < 28 || t.length > 420) return false;
  if (CHROME.test(t) || MENU_SOUP.test(t)) return false;
  if ((t.match(/,/g) || []).length > 8 && t.length < 160) return false;
  if (/copyright|all rights reserved|lorem ipsum/i.test(t)) return false;
  if (/site not found|just a moment|situs toto|bandar togel|ground-up single-family|new patient registration|fax:\s*\d|404 error|page can.t be found|stay konnected|verifying that you are not a robot/i.test(t)) return false;
  if (/-->|close \w+ open \w+|shop by series|document\.getElementById/i.test(t)) return false;
  const titleCaseRuns = (t.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){4,}/g) || []).length;
  if (titleCaseRuns && t.split(' ').length < 18) return false;
  return true;
}

function markFromName(name) {
  const bits = String(name || '')
    .replace(/[,.&]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !/^(inc|llc|pc|p\.c|the|and|of|for)$/i.test(w));
  const a = (bits[0] || 'SHOP').slice(0, 12).toUpperCase();
  const b = (bits[1] || bits[0] || 'CO').slice(0, 8).toUpperCase();
  return `${a}.${b}`;
}

function signFromName(name) {
  const first = String(name || 'Here').split(/[\s,]/)[0];
  return `${first.replace(/[^A-Za-z0-9']/g, '')}.`;
}

function pickHeadline(harvest, name, word) {
  const heads = (harvest.voice?.headings || []).map(tidy).filter((h) => h.length > 8 && h.length < 70 && !CHROME.test(h));
  const named = heads.find((h) => h.toLowerCase().includes(String(name).split(' ')[0].toLowerCase()));
  if (named && !/welcome to/i.test(named)) return named;
  const claim = heads.find((h) => /for|in|since|family|your|the/i.test(h) && !/welcome/i.test(h));
  if (claim) return claim;
  return `${name}`;
}

function pickLede(harvest, name, city) {
  const meta = tidy(harvest.voice?.metaDescription || '');
  const paras = (harvest.voice?.paragraphs || []).filter(isUseful);
  const local = paras.find((p) => new RegExp(city.split(/\s+/)[0], 'i').test(p) || /family|since|owned|serving/i.test(p));
  const src = (isUseful(meta) && meta) || local || paras[0] || '';
  if (!src) return `We're ${name}${city ? ` in ${city}` : ''}.`;
  let line = firstSentence(src, 220);
  if (!new RegExp(name.split(/[\s,]/)[0], 'i').test(line) && line.length < 150) {
    line = `We're ${name}. ${line}`;
  }
  return tidy(line);
}

function pickOffers(harvest, vertical) {
  const heads = (harvest.voice?.headings || []).map(tidy).filter((h) => h.length > 8 && h.length < 90 && !CHROME.test(h));
  const paras = (harvest.voice?.paragraphs || []).filter(isUseful);
  const fromHeads = heads.filter((h) => /care|service|repair|install|family|custom|emergency|menu|class|session|exam|align|treat/i.test(h));
  const out = [];
  for (const h of fromHeads) {
    const extra = paras.find((p) => p.toLowerCase().includes(h.split(' ')[0].toLowerCase()));
    out.push(extra ? firstSentence(`${h}. ${firstSentence(extra, 120)}`, 200) : h);
    if (out.length === 3) return out;
  }
  for (const p of paras) {
    out.push(firstSentence(p, 180));
    if (out.length === 3) return out;
  }
  const fallback = {
    dentist: ['Cleanings and exams in the chair.', 'Restorative work when a tooth needs it.', 'Same-week visits when something hurts.'],
    hvac: ['Installs that fit the house.', 'Service when the unit quits.', 'Seasonal clean so summer is not a surprise.'],
    restaurant: ['The plates people already order.', 'A room you can sit in.', 'Takeout when you want the same food at home.'],
  };
  return fallback[vertical] || ['Call and say what you need.', 'They do the work they already list.', 'You leave with the thing you came for.'];
}

function pickProofs(harvest, name) {
  const paras = (harvest.voice?.paragraphs || []).map(tidy);
  const quotes = paras.filter((p) => /great|friendly|best|love|amazing|recommend|awesome|kind|clean|professional/i.test(p) && p.length < 240);
  const out = [];
  for (const q of quotes) {
    out.push({ quote: firstSentence(q, 160), cite: 'From their site' });
    if (out.length === 3) return out;
  }
  const facts = paras.filter((p) => /since|year|family|serving|authorized|member|board|neighborhood/i.test(p));
  for (const f of facts) {
    out.push({ quote: firstSentence(f, 160), cite: name });
    if (out.length === 3) return out;
  }
  const heads = (harvest.voice?.headings || []).map(tidy).filter((h) => h.length > 10 && !CHROME.test(h));
  for (const h of heads) {
    out.push({ quote: h, cite: name });
    if (out.length === 3) return out;
  }
  return [
    { quote: `${name} is still the name on the door.`, cite: name },
    { quote: 'The work is the list they already publish.', cite: name },
    { quote: 'Call if the page left a question.', cite: name },
  ];
}

function pickSteps(harvest, vertical) {
  const cta = (harvest.voice?.ctaLabels || []).map(tidy);
  const paras = (harvest.voice?.paragraphs || []).filter(isUseful);
  const visit = paras.find((p) => /call|schedule|appointment|visit|walk in|book/i.test(p));
  const work = paras.find((p) => /treat|install|cook|repair|exam|session|climb|float/i.test(p) && p !== visit);
  const leave = paras.find((p) => /leave|home|after|follow|warranty|result/i.test(p));
  const steps = [];
  const cta0 = (cta[0] || '').toLowerCase();
  if (cta0 && !/contact|facebook|learn more|shop|menu/i.test(cta0)) steps.push(`Start with ${cta0}.`);
  else if (visit) steps.push(firstSentence(visit, 140));
  else steps.push('Call or walk in and say what you need.');
  if (work) steps.push(firstSentence(work, 140));
  else steps.push('They do the work they already list on the site.');
  if (leave) steps.push(firstSentence(leave, 140));
  else {
    const done = {
      dentist: 'You leave with a plan for the next visit.',
      veterinary: 'The pet leaves with you.',
      restaurant: 'You leave fed.',
      hvac: 'The house is quiet and the unit is running.',
    };
    steps.push(done[vertical] || 'You leave with the thing you came for.');
  }
  return steps.slice(0, 3);
}

function pickAreas(harvest, city, hours) {
  const paras = (harvest.voice?.paragraphs || []).filter(isUseful);
  const local = paras.find((p) => /philadelphia|county|serving|neighborhood|town|hill|park|avenue|ave/i.test(p));
  const out = [];
  if (city) out.push(`Based in ${city}.`);
  if (local) out.push(firstSentence(local, 150));
  if (hours) out.push(hours);
  if (out.length < 3) {
    const extra = paras.find((p) => !out.includes(p) && p.length < 180);
    if (extra) out.push(firstSentence(extra, 150));
  }
  while (out.length < 3) out.push('Directions sit under Visit.');
  return out.slice(0, 3);
}

function pickStory(harvest, name) {
  const paras = (harvest.voice?.paragraphs || []).filter(isUseful);
  const storyish = paras.filter((p) => /we |our |family|since|practice|shop|team|owned/i.test(p));
  const pick = storyish.length ? storyish : paras;
  const a = pick[0] ? firstSentence(pick[0], 240) : `${name} is the name on the site.`;
  const b = pick[1] ? firstSentence(pick[1], 240) : '';
  return b ? [a, b] : [a];
}

function pickExperience(harvest) {
  const paras = (harvest.voice?.paragraphs || []).filter(isUseful);
  const bits = paras.filter((p) => /hour|team|comfort|friendly|same.day|walk|park|wait/i.test(p)).slice(0, 3);
  if (bits.length === 3) return bits.map((p) => firstSentence(p, 140));
  const heads = (harvest.voice?.headings || []).map(tidy).filter((h) => h.length > 8 && h.length < 80 && !CHROME.test(h));
  const out = bits.map((p) => firstSentence(p, 140));
  for (const h of heads) {
    if (out.length === 3) break;
    out.push(h);
  }
  while (out.length < 3) out.push('Ask when you get there. They already answer this on the phone.');
  return out.slice(0, 3);
}

function titlesFor(word, vertical) {
  const map = {
    'smile more': {
      offer: 'How we can help today',
      proof: 'Why people stay',
      process: 'What a visit feels like',
      exp: 'In the chair',
      area: 'The block',
      close: 'Here to help you smile more',
    },
    'stay cool': {
      offer: 'What the shop actually does',
      proof: 'Why the same blocks call back',
      process: 'How a visit goes',
      exp: 'In the shop',
      area: 'The block',
      close: 'One shop, one number',
    },
    'come hungry': {
      offer: 'What comes out of the kitchen',
      proof: 'Why people keep a booth',
      process: 'From the door to the plate',
      exp: 'In the room',
      area: 'The block',
      close: 'Come hungry',
    },
    'come home': {
      offer: 'Care for the one in the carrier',
      proof: 'Why they come back',
      process: 'How a visit goes',
      exp: 'In the room',
      area: 'The block',
      close: 'They leave with you',
    },
    'go up': {
      offer: 'What the wall is for',
      proof: 'Why climbers stay',
      process: 'From the desk to the wall',
      exp: 'In the gym',
      area: 'The block',
      close: 'Go up',
    },
    'your side': {
      offer: 'What the firm takes',
      proof: 'Why people call',
      process: 'How a case starts',
      exp: 'In the office',
      area: 'The block',
      close: 'Someone on your side',
    },
    'step out': {
      offer: 'What the shop actually does',
      proof: 'Why people come back',
      process: 'How a visit goes',
      exp: 'On the floor',
      area: 'The block',
      close: 'Step out',
    },
    'breathe easy': {
      offer: 'What the shop actually does',
      proof: 'Why the same blocks call back',
      process: 'How a visit goes',
      exp: 'In the shop',
      area: 'The block',
      close: 'Breathe easy',
    },
    'go hard': {
      offer: 'What the floor is for',
      proof: 'Why people stay',
      process: 'How a session goes',
      exp: 'On the floor',
      area: 'The block',
      close: 'Go hard',
    },
    'ink on': {
      offer: 'What stays on the skin',
      proof: 'Why people sit again',
      process: 'How a session goes',
      exp: 'In the shop',
      area: 'The block',
      close: 'Ink on',
    },
    'get well': {
      offer: 'How we can help today',
      proof: 'Why families stay',
      process: 'What a visit feels like',
      exp: 'In the room',
      area: 'The block',
      close: 'Get well',
    },
    'sip more': {
      offer: 'What comes out of the bar',
      proof: 'Why people keep a stool',
      process: 'From the door to the cup',
      exp: 'In the room',
      area: 'The block',
      close: 'Sip more',
    },
    'grow wild': {
      offer: 'What the yard becomes',
      proof: 'Why the same blocks call back',
      process: 'How a job goes',
      exp: 'On the lot',
      area: 'The block',
      close: 'Grow wild',
    },
    'stay warm': {
      offer: 'What the shop actually does',
      proof: 'Why the same houses call back',
      process: 'How a visit goes',
      exp: 'In the shop',
      area: 'The block',
      close: 'Stay warm',
    },
    'lights on': {
      offer: 'What the shop actually does',
      proof: 'Why the same blocks call back',
      process: 'How a visit goes',
      exp: 'In the shop',
      area: 'The block',
      close: 'Lights on',
    },
    'move again': {
      offer: 'How we can help today',
      proof: 'Why people come back',
      process: 'What a visit feels like',
      exp: 'On the floor',
      area: 'The block',
      close: 'Move again',
    },
    'walk in': {
      offer: 'What the office actually does',
      proof: 'Why people call back',
      process: 'How a search goes',
      exp: 'In the office',
      area: 'The block',
      close: 'Walk in',
    },
    'dive in': {
      offer: 'What the shop actually does',
      proof: 'Why people come back',
      process: 'How a visit goes',
      exp: 'On the floor',
      area: 'The block',
      close: 'Dive in',
    },
    'one scoop': {
      offer: 'What comes out of the case',
      proof: 'Why people keep a booth',
      process: 'From the door to the cup',
      exp: 'In the room',
      area: 'The block',
      close: 'One scoop',
    },
    'see more': {
      offer: 'What the shop actually does',
      proof: 'Why people come back',
      process: 'How a visit goes',
      exp: 'On the floor',
      area: 'The block',
      close: 'See more',
    },
    'in bloom': {
      offer: 'What leaves the shop',
      proof: 'Why people keep calling',
      process: 'How an order goes',
      exp: 'On the bench',
      area: 'The block',
      close: 'In bloom',
    },
    'line up': {
      offer: 'How we can help today',
      proof: 'Why people come back',
      process: 'What a visit feels like',
      exp: 'In the room',
      area: 'The block',
      close: 'Line up',
    },
    'read on': {
      offer: 'What the shop actually does',
      proof: 'Why players come back',
      process: 'How a visit goes',
      exp: 'On the bench',
      area: 'The block',
      close: 'Read on',
    },
    'fresh set': {
      offer: 'What the chair is for',
      proof: 'Why people book again',
      process: 'How a visit goes',
      exp: 'In the chair',
      area: 'The block',
      close: 'Fresh set',
    },
    'glow up': {
      offer: 'What the room is for',
      proof: 'Why people come back',
      process: 'How a visit goes',
      exp: 'In the room',
      area: 'The block',
      close: 'Glow up',
    },
    'sip slow': {
      offer: 'What comes out of the bar',
      proof: 'Why people keep a stool',
      process: 'From the door to the cup',
      exp: 'In the room',
      area: 'The block',
      close: 'Sip slow',
    },
    'clean ride': {
      offer: 'What the bay actually does',
      proof: 'Why the same cars come back',
      process: 'How a wash goes',
      exp: 'In the bay',
      area: 'The block',
      close: 'Clean ride',
    },
  };
  return map[word] || {
    offer: 'What they actually do',
    proof: 'Why people come back',
    process: 'How it goes',
    exp: 'On the floor',
    area: 'The block',
    close: word,
  };
}

module.exports = {
  tidy,
  firstSentence,
  markFromName,
  signFromName,
  pickHeadline,
  pickLede,
  pickOffers,
  pickProofs,
  pickSteps,
  pickAreas,
  pickStory,
  pickExperience,
  titlesFor,
};
