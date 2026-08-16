'use strict';

/**
 * One-word Haoqi craft hooks for radar prospects.
 *
 * A craft word is the thing they do, written like `hello`: lowercase Pacifico,
 * 4–6 letters, sitting in the back. Service phrases ("window & wall units")
 * are not words. Trades without an honest hook are a skip.
 */

const WORDS = {
  smile: { quality: 100, why: 'the outcome in the chair' },
  sight: { quality: 96, why: 'the outcome of the exam' },
  climb: { quality: 95, why: 'what a climbing gym is' },
  float: { quality: 95, why: 'what a float tank is' },
  paws: { quality: 94, why: 'the patient in the room' },
  ink: { quality: 94, why: 'what a tattoo shop puts down' },
  bloom: { quality: 92, why: 'what a florist sells' },
  glow: { quality: 92, why: 'the finish people come for' },
  spark: { quality: 91, why: 'what an electrician is' },
  shine: { quality: 90, why: 'what jewelry is for' },
  brew: { quality: 90, why: 'what a cafe makes' },
  sweet: { quality: 90, why: 'what a dessert shop is' },
  move: { quality: 90, why: 'what PT restores' },
  align: { quality: 90, why: 'what a chiro changes' },
  style: { quality: 88, why: 'what a salon changes' },
  ease: { quality: 88, why: 'what massage leaves' },
  strong: { quality: 88, why: 'what a gym builds' },
  flow: { quality: 88, why: 'water in the pipes' },
  grow: { quality: 88, why: 'plants, lawns, gardens' },
  ride: { quality: 88, why: 'bikes and motorcycles' },
  snap: { quality: 88, why: 'what a photographer takes' },
  pour: { quality: 87, why: 'what a taproom does' },
  sip: { quality: 86, why: 'what a juice bar pours' },
  taste: { quality: 86, why: 'the meal, not the menu' },
  gloss: { quality: 86, why: 'a hard shine: nails or a wash' },
  read: { quality: 86, why: 'what a bookstore is' },
  soak: { quality: 84, why: 'pools and soak spas' },
  heal: { quality: 84, why: 'what a clinic is for' },
  step: { quality: 84, why: 'shoes and feet' },
  play: { quality: 83, why: 'music or toys' },
  drive: { quality: 80, why: 'what a car shop returns' },
  home: { quality: 78, why: 'what a realtor sells' },
  craft: { quality: 76, why: 'a trade that makes' },
};

const SKIP_VERTICAL = new Set([
  'hvac',
  'insurance',
  'accountant',
  'tax-advisor',
  'financial',
  'financial-advisor',
  'advertising-agency',
  'it',
  'employment-agency',
  'funeral-directors',
  'energy-supplier',
  'slaughterhouse',
  'scrap-yard',
  'shipyard',
  'port',
  'hardware',
  'car-parts',
  'electronics-repair',
  'engineer',
  'works',
  'trade',
  'doityourself',
  'floorer',
  'flooring',
  'tiler',
  'paver',
  'glaziery',
  'notary',
  'appliance',
  'truck',
  'houseware',
  'lawyer',
]);

function textOf(p) {
  return `${p.business_name || ''} ${p.domain || ''} ${p.vertical || ''}`.toLowerCase();
}

function pickWord(p) {
  const t = textOf(p);
  const vertical = String(p.vertical || '');

  if (/hvac|air.?cond|heating|cooling|furnace/.test(t)) {
    return { word: null, quality: 0, why: 'no honest one-word hook for HVAC', skip: true };
  }
  if (/research building|translational|\.edu\b/.test(t)) {
    return { word: null, quality: 0, why: 'campus / research building, not a local craft hook', skip: true };
  }
  if (SKIP_VERTICAL.has(vertical) && !/dental|dentist|ortho|smile|vet|optical/.test(t)) {
    return { word: null, quality: 0, why: `skip ${vertical}: no honest craft word`, skip: true };
  }

  if (/dental|dentist|orthodont|odont|smile|invisalign/.test(t)) return hit('smile');
  if (/climb|bould/.test(t)) return hit('climb');
  if (/float/.test(t)) return hit('float');
  if (/vet|animal hospital|pet clinic/.test(t) || vertical === 'veterinary' || vertical === 'pet') {
    return hit('paws');
  }
  if (/tattoo/.test(t)) return hit('ink');
  if (/\b(eye|optical|vision|optom|optician)\b/.test(t) || vertical === 'optician' || vertical === 'optometrist') {
    return hit('sight');
  }
  if (/realtor|real estate|realty|estate-agent/.test(t) || vertical === 'estate-agent') return hit('home');
  if (/juice/.test(t)) return hit('sip');
  if (/nail/.test(t)) return hit('gloss');
  if (/hair|salon|barber/.test(t) || vertical === 'hairdresser') return hit('style');
  if (/spa|skin|esthetic|beauty|cosmetic/.test(t) || vertical === 'beauty' || vertical === 'cosmetics') {
    return hit('glow');
  }
  if (/restaurant|bistro|diner|grill|hoagie|pizza|pub|deli|seafood|cater/.test(t) || vertical === 'restaurant' || vertical === 'pub' || vertical === 'bar' || vertical === 'deli' || vertical === 'seafood' || vertical === 'caterer') {
    return hit('taste');
  }
  if (/chiro/.test(t)) return hit('align');
  if (/physio|physical ther|\bpt\b/.test(t) || vertical === 'physiotherapist') return hit('move');
  if (/florist|flower/.test(t) || vertical === 'florist') return hit('bloom');
  if (/jewel/.test(t) || vertical === 'jewelry') return hit('shine');
  if (/coffee|espresso/.test(t) || vertical === 'cafe') return hit('brew');
  if (/ice.?cream|gelato|bakery|pastry|donut|cake|confection/.test(t) || vertical === 'ice-cream' || vertical === 'bakery' || vertical === 'pastry' || vertical === 'confectionery') {
    return hit('sweet');
  }
  if (/wine|distill|taproom|brewery|alcohol/.test(t) || vertical === 'wine' || vertical === 'distillery' || vertical === 'alcohol') {
    return hit('pour');
  }
  if (/photo/.test(t)) return hit('snap');
  if (/yoga|pilates/.test(t)) return hit('flow');
  if (/pool|soak/.test(t) || vertical === 'swimming-pool') return hit('soak');
  if (/plumb/.test(t) || vertical === 'plumber') return hit('flow');
  if (/electric/.test(t) || vertical === 'electrician') return hit('spark');
  if (/landscap|garden|lawn|nursery|farm/.test(t) || vertical === 'garden-centre' || vertical === 'gardener' || vertical === 'farm') {
    return hit('grow');
  }
  if (/car.?wash/.test(t) || vertical === 'car-wash') return hit('gloss');
  if (/massage|sauna/.test(t) || vertical === 'massage' || vertical === 'sauna') return hit('ease');
  if (/gym|fitness|crossfit/.test(t) || vertical === 'fitness-centre') return hit('strong');
  if (vertical === 'sports') {
    return { word: null, quality: 0, why: 'sporting goods is inventory, not a craft word', skip: true };
  }
  if (/motorc|bicycle|bike/.test(t) || vertical === 'motorcycle' || vertical === 'bicycle') return hit('ride');
  if (/shoe|podiat/.test(t) || vertical === 'shoes' || vertical === 'podiatrist') return hit('step');
  if (/book/.test(t) || vertical === 'books') return hit('read');
  if (/architect/.test(t) || vertical === 'architect') return hit('craft');
  if (/mason|carpenter|joiner|builder|construction/.test(t) || vertical === 'builder' || vertical === 'carpenter' || vertical === 'joiner' || vertical === 'stonemason' || vertical === 'construction-company') {
    return hit('craft');
  }
  if (/doctor|clinic|hospital/.test(t) || vertical === 'doctor' || vertical === 'clinic') return hit('heal');
  if (vertical === 'car' || vertical === 'car-repair') return hit('drive');
  if (vertical === 'tyres') return { word: null, quality: 0, why: 'tires are a part, not a feeling', skip: true };
  if (vertical === 'painter' || vertical === 'paint') return { word: null, quality: 0, why: 'paint is the material, not the hook', skip: true };
  if (vertical === 'roofer') return { word: null, quality: 0, why: 'no honest one-word hook for roofing', skip: true };
  if (vertical === 'fireplace') return hit('glow');
  if (vertical === 'lighting') return hit('glow');
  if (vertical === 'musical-instrument') return hit('play');
  if (vertical === 'toys') return hit('play');
  if (vertical === 'clothes') return { word: null, quality: 0, why: 'apparel has no single craft word', skip: true };
  if (vertical === 'furniture' || vertical === 'antiques') {
    return { word: null, quality: 0, why: 'furniture/antiques read as inventory, not a word', skip: true };
  }
  if (vertical === 'kitchen') return { word: null, quality: 0, why: 'kitchen remodel is a phrase', skip: true };
  if (vertical === 'alternative') {
    return { word: null, quality: 0, why: 'alt-wellness needs a harvested hook, not a default', skip: true };
  }
  if (vertical === 'psychotherapist') return { word: null, quality: 0, why: 'therapy should not get a cute glass word', skip: true };

  return { word: null, quality: 0, why: 'no honest craft word', skip: true };
}

function hit(word) {
  const meta = WORDS[word];
  return { word, quality: meta.quality, why: meta.why, skip: false };
}

function verdictBonus(verdict) {
  if (verdict === 'rebuild') return 15;
  if (verdict === 'ads_seo') return 8;
  if (verdict === 'polish') return 4;
  if (verdict === 'nurture') return 0;
  return -8;
}

function scoreProspect(p) {
  const pick = pickWord(p);
  const opp = Number(p.current?.opportunity) || 0;
  const verdict = p.current?.verdict || 'enrich';
  if (pick.skip) {
    return { ...pick, score: 0, opportunity: opp, verdict };
  }
  const score = pick.quality * 0.5 + opp * 0.35 + verdictBonus(verdict);
  return { ...pick, score, opportunity: opp, verdict };
}

function wordCap(word, perWord) {
  if (typeof perWord === 'number') {
    if (word === 'smile') return Math.max(perWord, 18);
    if (word === 'taste' || word === 'drive') return Math.min(perWord, 8);
    return perWord;
  }
  return perWord[word] || perWord.default || 12;
}

function rankRadar(prospects, { limit = 100, perWord = 12, minQuality = 84 } = {}) {
  const rows = Object.values(prospects).map((p) => {
    const scored = scoreProspect(p);
    return {
      name: p.business_name,
      domain: p.domain,
      vertical: p.vertical,
      group: p.vertical_group,
      area: p.area || p.city || '',
      ...scored,
    };
  });
  const eligible = rows
    .filter((r) => !r.skip && r.word && r.quality >= minQuality)
    .sort((a, b) => b.score - a.score);
  const used = new Map();
  const picked = [];
  for (const row of eligible) {
    const n = used.get(row.word) || 0;
    if (n >= wordCap(row.word, perWord)) continue;
    used.set(row.word, n + 1);
    picked.push(row);
    if (picked.length >= limit) break;
  }
  const unlock = {};
  for (const row of eligible) unlock[row.word] = (unlock[row.word] || 0) + 1;
  return {
    scanned: rows.length,
    eligible: eligible.length,
    skipped: rows.length - eligible.length,
    unlock,
    words: WORDS,
    top: picked,
  };
}

module.exports = { WORDS, SKIP_VERTICAL, pickWord, scoreProspect, rankRadar, verdictBonus };
