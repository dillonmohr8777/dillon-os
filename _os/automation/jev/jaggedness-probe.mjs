import { experimental_evaluate as evaluate } from 'ai';
// Independent check of TypeSafe's own documented weak spots. Every item has a
// verifiable right answer. "Cannot hallucinate" only means it stays inside your
// option set; it does not mean the option it picks is correct.
const cases = [
  { id: 'date-order', state: { a: '2026-09-10', b: '2026-09-13' },
    q: { type: 'boolean', instructions: 'Is date `a` earlier than date `b`?' }, truth: 'true' },
  { id: 'date-in-window', state: { event: '2026-09-10 20:00', window_start: '2026-09-11', window_end: '2026-09-13' },
    q: { type: 'boolean', instructions: 'Does `event` fall inside the window from `window_start` to `window_end`?' }, truth: 'false' },
  { id: 'counting', state: { items: ['a','b','c','d','e','f','g'] },
    q: { type: 'choice', instructions: 'How many items are in `items`?', criteria: { five: '5', six: '6', seven: '7', eight: '8' } }, truth: 'seven' },
  { id: 'hex-proximity', state: { one: '#0A2540', two: '#0A2541' },
    q: { type: 'boolean', instructions: 'Are these two hex colours nearly identical?' }, truth: 'true' },
  { id: 'hex-difference', state: { one: '#0A2540', two: '#F5A623' },
    q: { type: 'boolean', instructions: 'Are these two hex colours nearly identical?' }, truth: 'false' },
  { id: 'double-negative', state: { policy: 'Refunds are not unavailable for cancelled flights.' },
    q: { type: 'boolean', instructions: 'Can a customer get a refund for a cancelled flight?' }, truth: 'true' },
];
let billed = 0, right = 0;
for (const c of cases) {
  const r = await evaluate({ model: 'typesafe-ai/jev', state: c.state, questions: { q: c.q } });
  billed += Number(r.providerMetadata?.gateway?.cost ?? 0);
  const a = r.answers.q;
  const got = a.type === 'boolean' ? (a.probability >= 0.5 ? 'true' : 'false') : a.choice;
  const conf = a.type === 'boolean' ? a.probability.toFixed(2) : JSON.stringify(a.probabilities);
  const ok = got === c.truth;
  if (ok) right++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.id.padEnd(16)} truth=${c.truth.padEnd(6)} got=${String(got).padEnd(6)} ${conf}`);
}
console.log(`\n${right}/${cases.length} correct   billed $${billed.toFixed(7)}`);
