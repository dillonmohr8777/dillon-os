'use strict';

const { collapse } = require('./normalize.ts');

const RULES = [
  { id: 'hvac', re: /\b(hvac|heating|cooling|air\s*condition|furnace|heat\s*pump)\b/i },
  { id: 'plumbing', re: /\bplumb/i },
  { id: 'roofing', re: /\broof/i },
  { id: 'landscaping', re: /\b(landscape|landscaping|lawn|hardscape)\b/i },
  { id: 'electrical', re: /\b(electric|electrician)\b/i },
  { id: 'remodeling', re: /\b(remodel|renovat|home\s*improv|general\s*contract)\b/i },
  { id: 'construction', re: /\b(construction|builder|contractor)\b/i },
  { id: 'dental', re: /\b(dental|dentist|orthodont|dds|dmd)\b/i },
  { id: 'chiropractic', re: /\bchiro/i },
  { id: 'legal', re: /\b(law\s*firm|attorney|lawyer|legal)\b/i },
  { id: 'insurance', re: /\binsurance\b/i },
  { id: 'real-estate', re: /\b(real\s*estate|realtor)\b/i },
  { id: 'auto-repair', re: /\b(auto\s*repair|mechanic|car\s*service)\b/i },
  { id: 'fitness', re: /\b(fitness|gym|personal\s*train)\b/i },
  { id: 'restaurant', re: /\b(restaurant|diner|eatery|cafe|bakery)\b/i },
  { id: 'salon', re: /\b(salon|barber|spa)\b/i },
  { id: 'veterinary', re: /\b(vet|veterinary)\b/i },
  { id: 'cleaning', re: /\b(clean|janitorial)\b/i },
];

function inferVertical({ services = '', name = '', website = '', notes = '' } = {}) {
  const hay = collapse([services, name, website, notes].filter(Boolean).join(' '));
  if (!hay) return 'unknown';
  for (const rule of RULES) {
    if (rule.re.test(hay)) return rule.id;
  }
  return 'unknown';
}

module.exports = { inferVertical, RULES };
