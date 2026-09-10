'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

/**
 * Locks the imagery queue ordering used by bin/radar-refresh.js.
 *
 * The regression: ordering by priority_score alone re-selected the identical
 * top rows every morning. On 2026-09-09 all 60 rows the sweep checked carried
 * `logo_checked: 2026-09-09` while 1,303 rows had never been checked once, so
 * a permanently unverifiable head starved the entire registry.
 */
const LOGO_RECHECK_COOLDOWN_DAYS = 10;

function dayNumber(value) {
  const t = Date.parse(value);
  return Number.isFinite(t) ? Math.floor(t / 86400000) : -Infinity;
}

/** Mirror of the selection in bin/radar-refresh.js. */
function selectForLogoCheck(rows, { today, budget }) {
  const todayNumber = dayNumber(today);
  return rows
    .filter((p) => p.lifecycle !== 'client' && p.lifecycle !== 'excluded' && p.website)
    .filter((p) => !p.logo_checked || todayNumber - dayNumber(p.logo_checked) >= LOGO_RECHECK_COOLDOWN_DAYS)
    .sort((a, b) => {
      const A = a.logo_checked ? dayNumber(a.logo_checked) : -Infinity;
      const B = b.logo_checked ? dayNumber(b.logo_checked) : -Infinity;
      if (A !== B) return A - B;
      return (b.priority_score || 0) - (a.priority_score || 0);
    })
    .slice(0, budget);
}

const row = (over = {}) => ({ website: 'https://x.example', priority_score: 10, ...over });

test('rows never checked are taken before anything already checked', () => {
  const rows = [
    row({ domain: 'hot', priority_score: 99, logo_checked: '2026-09-09' }),
    row({ domain: 'cold', priority_score: 1 }),
  ];
  const picked = selectForLogoCheck(rows, { today: '2026-09-10', budget: 5 });
  assert.deepEqual(picked.map((p) => p.domain), ['cold'], 'a high-priority row checked yesterday waits');
});

test('a failing high-priority row cannot hold the queue day after day', () => {
  // 3 stubborn heads, 5 never-checked rows, budget of 3: the heads must not
  // consume the budget on consecutive days.
  const rows = [
    ...Array.from({ length: 3 }, (_, i) => row({ domain: `head${i}`, priority_score: 100, logo_checked: '2026-09-09' })),
    ...Array.from({ length: 5 }, (_, i) => row({ domain: `new${i}`, priority_score: 5 })),
  ];
  const day1 = selectForLogoCheck(rows, { today: '2026-09-10', budget: 3 });
  assert.ok(day1.every((p) => p.domain.startsWith('new')), 'day 1 advances past the heads');

  for (const p of day1) p.logo_checked = '2026-09-10';
  const day2 = selectForLogoCheck(rows, { today: '2026-09-11', budget: 3 });
  assert.ok(day2.every((p) => p.domain.startsWith('new')), 'day 2 keeps advancing');
  assert.equal(new Set([...day1, ...day2].map((p) => p.domain)).size, 5, 'no row is re-checked inside the cooldown');
});

test('once the cooldown expires a held row comes back for another attempt', () => {
  const rows = [row({ domain: 'retry', logo_checked: '2026-09-01' })];
  assert.equal(selectForLogoCheck(rows, { today: '2026-09-05', budget: 5 }).length, 0, 'still cooling down');
  assert.equal(selectForLogoCheck(rows, { today: '2026-09-11', budget: 5 }).length, 1, 'eligible again after 10 days');
});

test('oldest check wins, and priority only breaks ties', () => {
  const rows = [
    row({ domain: 'recent-important', priority_score: 100, logo_checked: '2026-08-20' }),
    row({ domain: 'ancient-trivial', priority_score: 1, logo_checked: '2026-07-01' }),
    row({ domain: 'tie-a', priority_score: 50, logo_checked: '2026-07-01' }),
  ];
  const picked = selectForLogoCheck(rows, { today: '2026-09-10', budget: 3 });
  assert.deepEqual(picked.map((p) => p.domain), ['tie-a', 'ancient-trivial', 'recent-important']);
});

test('clients and excluded rows are never queued for logo work', () => {
  const rows = [
    row({ domain: 'client', lifecycle: 'client' }),
    row({ domain: 'excluded', lifecycle: 'excluded' }),
    row({ domain: 'ok' }),
  ];
  assert.deepEqual(selectForLogoCheck(rows, { today: '2026-09-10', budget: 9 }).map((p) => p.domain), ['ok']);
});
