'use strict';

/**
 * Haoqi craft hooks: one or two lowercase Pacifico words.
 *
 * The line is the feeling after the visit, not a service list.
 * "smile more" beats "smile". "stay cool" unlocks HVAC. "window & wall
 * units" is still a skip because it is a catalog line.
 */

const WORDS = {
  'smile more': { quality: 100, why: 'the face they walk out with' },
  'see more': { quality: 97, why: 'the exam is for more years of sight' },
  'come home': { quality: 96, why: 'the pet leaves with them' },
  'stay cool': { quality: 95, why: 'what an AC shop actually sells' },
  'breathe easy': { quality: 94, why: 'year-round HVAC, not a season' },
  'go up': { quality: 95, why: 'a climbing gym has one verb' },
  'sink in': { quality: 94, why: 'a float tank is surrender' },
  'glow up': { quality: 93, why: 'skin, spa, the after' },
  'go hard': { quality: 92, why: 'a gym is effort, not equipment' },
  'let go': { quality: 92, why: 'massage and slow rooms' },
  'come hungry': { quality: 91, why: 'a restaurant is appetite' },
  'first bite': { quality: 90, why: 'the moment the plate lands' },
  'shine on': { quality: 90, why: 'jewelry is worn light' },
  'ink on': { quality: 94, why: 'a tattoo stays' },
  'in bloom': { quality: 92, why: 'what a florist is for' },
  'fresh cut': { quality: 90, why: 'a salon changes the outline' },
  'fresh set': { quality: 88, why: 'nails, done' },
  'lights on': { quality: 91, why: 'an electrician ends the dark' },
  'water on': { quality: 88, why: 'a plumber restores the tap' },
  'dive in': { quality: 88, why: 'pools and soak shops' },
  'grow wild': { quality: 90, why: 'lawns and gardens, not mulch SKUs' },
  'drive home': { quality: 88, why: 'the car leaves running' },
  'ride out': { quality: 90, why: 'bikes and motorcycles' },
  'step out': { quality: 86, why: 'shoes and feet' },
  'move again': { quality: 92, why: 'PT gives the body back' },
  'line up': { quality: 90, why: 'chiro is alignment' },
  'get well': { quality: 86, why: 'a clinic is recovery' },
  'walk in': { quality: 84, why: 'a house becomes theirs' },
  'sip slow': { quality: 88, why: 'cafe pace' },
  'sip more': { quality: 87, why: 'juice, not a menu' },
  'one scoop': { quality: 90, why: 'ice cream is a single yes' },
  'pour up': { quality: 88, why: 'a taproom or still' },
  'read on': { quality: 86, why: 'a bookstore is the next page' },
  'stay warm': { quality: 90, why: 'heat, fireplaces, winter' },
  'stay dry': { quality: 86, why: 'a roof is weather' },
  'fresh coat': { quality: 84, why: 'paint as a new skin' },
  'your side': { quality: 88, why: 'a lawyer is allegiance' },
  'rest easy': { quality: 82, why: 'insurance as relief, not a policy' },
  'look back': { quality: 86, why: 'a photograph holds the day' },
  'breathe in': { quality: 88, why: 'yoga and slow practice' },
  'clean ride': { quality: 84, why: 'a wash, not a part' },
  'built in': { quality: 80, why: 'trades that make the room' },
};

const SKIP_VERTICAL = new Set([
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
]);

function textOf(p) {
  return [
    p.business_name || p.name || '',
    p.domain || p.host || '',
    p.vertical || '',
    p.notes || '',
  ].join(' ').toLowerCase();
}

function skip(why) {
  return { word: null, quality: 0, why, skip: true };
}

function pickWord(p) {
  const t = textOf(p);
  const vertical = String(p.vertical || '');

  if (/research building|translational|\.edu\b/.test(t)) {
    return skip('campus / research building, not a local craft hook');
  }
  if (/funeral/.test(t) || vertical === 'funeral-directors') {
    return skip('funeral: no craft hook');
  }
  if ((/\btax\b/.test(t) && !/taxi/.test(t)) || /accountant|\bcpa\b/.test(t) || vertical === 'tax-advisor' || vertical === 'accountant') {
    return skip('tax: no honest craft line');
  }
  if (/\b(managed it|it services|it shop)\b/.test(t) || vertical === 'it') {
    return skip('it shop: no honest craft line');
  }
  if (/window and wall|window.?wall unit/.test(t) && !/hvac|air.?cond|heating|cooling/.test(t)) {
    return skip('catalog line, not a craft hook');
  }
  if (SKIP_VERTICAL.has(vertical) && !/dental|dentist|orthodont|smile|vet|optical/.test(t)) {
    return skip(`skip ${vertical}: no honest craft line`);
  }

  if (/dental|dentist|orthodont|odont|smile|invisalign/.test(t)) return hit('smile more');
  if (/climb|bould/.test(t)) return hit('go up');
  if (/float/.test(t)) return hit('sink in');
  if (/vet|animal hospital|pet clinic/.test(t) || vertical === 'veterinary' || vertical === 'pet') {
    return hit('come home');
  }
  if (/tattoo/.test(t)) return hit('ink on');
  if (/\b(eye|optical|vision|optom|optician)\b/.test(t) || vertical === 'optician' || vertical === 'optometrist') {
    return hit('see more');
  }
  if (/realtor|real estate|realty|estate-agent/.test(t) || vertical === 'estate-agent') return hit('walk in');
  if (/juice/.test(t)) return hit('sip more');
  if (/ice.?cream|gelato|bakery|pastry|donut|cake|confection/.test(t) || vertical === 'ice-cream' || vertical === 'bakery' || vertical === 'pastry' || vertical === 'confectionery') {
    return hit('one scoop');
  }
  if (/\bnail/.test(t)) return hit('fresh set');
  if (/\bhair\b|salon|barber/.test(t) || vertical === 'hairdresser') return hit('fresh cut');
  if (/\bpool\b|hot tub/.test(t) || vertical === 'swimming-pool') return hit('dive in');
  if (/\bspa\b|\bskin\b|esthetic|beauty|cosmetic/.test(t) || vertical === 'beauty' || vertical === 'cosmetics') {
    return hit('glow up');
  }
  if (/hvac|air.?cond|cooling/.test(t) || vertical === 'hvac') {
    const heat = /heat|furnace|boiler/.test(t);
    const cool = /cool|\bac\b|air.?cond|\bair\b/.test(t);
    if (heat && !cool) return hit('stay warm');
    if (heat && cool) return hit('breathe easy');
    return hit('stay cool');
  }
  if (/heating|furnace|boiler/.test(t) && !/cool|hvac|air.?cond/.test(t)) return hit('stay warm');
  if (/restaurant|bistro|diner|grill|hoagie|pizza|pub|deli|seafood|cater/.test(t) || vertical === 'restaurant' || vertical === 'pub' || vertical === 'bar' || vertical === 'deli' || vertical === 'seafood' || vertical === 'caterer') {
    return hit('come hungry');
  }
  if (/chiro/.test(t)) return hit('line up');
  if (/physio|physical ther|\bpt\b/.test(t) || vertical === 'physiotherapist') return hit('move again');
  if (/florist|flower/.test(t) || vertical === 'florist') return hit('in bloom');
  if (/jewel/.test(t) || vertical === 'jewelry') return hit('shine on');
  if (/coffee|espresso/.test(t) || vertical === 'cafe') return hit('sip slow');
  if (/wine|distill|taproom|brewery|alcohol/.test(t) || vertical === 'wine' || vertical === 'distillery' || vertical === 'alcohol') {
    return hit('pour up');
  }
  if (/photo/.test(t)) return hit('look back');
  if (/yoga|pilates/.test(t)) return hit('breathe in');
  if (/plumb/.test(t) || vertical === 'plumber') return hit('water on');
  if (/electric/.test(t) || vertical === 'electrician') return hit('lights on');
  if (/landscap|garden|lawn|nursery|farm/.test(t) || vertical === 'garden-centre' || vertical === 'gardener' || vertical === 'farm') {
    return hit('grow wild');
  }
  if (/car.?wash/.test(t) || vertical === 'car-wash') return hit('clean ride');
  if (/massage|sauna/.test(t) || vertical === 'massage' || vertical === 'sauna') return hit('let go');
  if (/gym|fitness|crossfit/.test(t) || vertical === 'fitness-centre') return hit('go hard');
  if (vertical === 'sports') {
    return skip('sporting goods is inventory, not a craft line');
  }
  if (/motorc|bicycle|bike/.test(t) || vertical === 'motorcycle' || vertical === 'bicycle') return hit('ride out');
  if (/shoe|podiat/.test(t) || vertical === 'shoes' || vertical === 'podiatrist') return hit('step out');
  if (/\bbook/.test(t) || vertical === 'books') return hit('read on');
  if (/lawyer|attorney|\blegal\b/.test(t) || vertical === 'lawyer') return hit('your side');
  if (/insurance/.test(t) || vertical === 'insurance') return hit('rest easy');
  if (/\broof/.test(t) || vertical === 'roofer') return hit('stay dry');
  if (vertical === 'painter' || vertical === 'paint') return hit('fresh coat');
  if (vertical === 'fireplace') return hit('stay warm');
  if (vertical === 'lighting') return hit('lights on');
  if (/architect|mason|carpenter|joiner|builder|construction/.test(t) || vertical === 'architect' || vertical === 'builder' || vertical === 'carpenter' || vertical === 'joiner' || vertical === 'stonemason' || vertical === 'construction-company') {
    return hit('built in');
  }
  if (/doctor|clinic|hospital/.test(t) || vertical === 'doctor' || vertical === 'clinic') return hit('get well');
  if (vertical === 'car' || vertical === 'car-repair') return hit('drive home');
  if (vertical === 'tyres') return skip('tires are a part, not a feeling');
  if (vertical === 'kitchen') return skip('kitchen remodel is a catalog line');
  if (vertical === 'clothes' || vertical === 'furniture' || vertical === 'antiques') {
    return skip('inventory retail, not a craft line');
  }
  if (vertical === 'alternative' || vertical === 'psychotherapist') {
    return skip('needs a harvested hook, not a default');
  }
  if (vertical === 'musical-instrument' || vertical === 'toys') return hit('read on');

  return skip('no honest craft line');
}

function hit(word) {
  const meta = WORDS[word];
  if (!meta) throw new Error(`unknown craft line: ${word}`);
  return { word, quality: meta.quality, why: meta.why, skip: false };
}

function skipReason(p) {
  const pick = pickWord(p);
  return pick.skip ? pick.why : null;
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
  const opp = Number(p.current?.opportunity ?? p.opportunity) || 0;
  const verdict = p.current?.verdict || p.verdict || 'enrich';
  if (pick.skip) {
    return { ...pick, score: 0, opportunity: opp, verdict };
  }
  const score = pick.quality * 0.5 + opp * 0.35 + verdictBonus(verdict);
  return { ...pick, score, opportunity: opp, verdict };
}

function wordCap(word, perWord) {
  if (typeof perWord === 'number') {
    if (word === 'smile more') return Math.max(perWord, 16);
    if (word === 'come hungry') return Math.min(perWord, 8);
    return perWord;
  }
  return perWord[word] || perWord.default || 12;
}

function asProspectMap(list) {
  if (!Array.isArray(list)) return list;
  const map = {};
  list.forEach((row, i) => {
    const domain = row.domain || row.host || `row-${i}`;
    map[domain] = {
      business_name: row.name || row.business_name,
      domain,
      vertical: row.vertical || '',
      notes: row.notes || '',
      current: {
        opportunity: row.opportunity ?? row.current?.opportunity ?? 0,
        verdict: row.verdict || row.current?.verdict || 'rebuild',
      },
    };
  });
  return map;
}

function rankRadar(prospects, { limit = 100, perWord = 12, minQuality = 84 } = {}) {
  const rows = Object.values(asProspectMap(prospects)).map((p) => {
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

function topWords(list, limit = 100) {
  return rankRadar(list, { limit, perWord: 40, minQuality: 80 }).top;
}

module.exports = {
  WORDS,
  SKIP_VERTICAL,
  pickWord,
  skipReason,
  scoreProspect,
  rankRadar,
  topWords,
  verdictBonus,
};
