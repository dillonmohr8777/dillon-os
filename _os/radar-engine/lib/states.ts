'use strict';

/**
 * Prospect Radar V2 lifecycle. Illegal transitions throw.
 * Every successful transition must be paired with an event by the caller.
 */

const HAPPY_PATH = [
  'discovered',
  'deduped',
  'scan_pending',
  'scanning',
  'scanned',
  'scored',
  'report_draft',
  'qa_pending',
  'report_approved',
  'enrichment_pending',
  'outreach_ready',
  'outreach_approved',
  'handed_off',
  'contacted',
  'engaged',
  'booked',
  'qualified',
  'proposal',
];

const TERMINALS = new Set(['won', 'lost', 'nurture']);
const SIDE = new Set([
  'suppressed',
  'quarantined',
  'needs_review',
  'failed_retryable',
  'failed_terminal',
  'expired',
]);

const EXTRA = {
  discovered: ['suppressed', 'quarantined', 'needs_review'],
  deduped: ['suppressed', 'needs_review', 'scan_pending'],
  scan_pending: ['scanning', 'suppressed', 'failed_retryable'],
  scanning: ['scanned', 'failed_retryable', 'failed_terminal', 'needs_review'],
  scanned: ['scored', 'needs_review', 'failed_retryable'],
  scored: ['report_draft', 'needs_review', 'suppressed'],
  report_draft: ['qa_pending', 'needs_review', 'failed_retryable'],
  qa_pending: ['report_approved', 'needs_review', 'scan_pending', 'failed_terminal'],
  report_approved: ['enrichment_pending', 'expired'],
  enrichment_pending: ['outreach_ready', 'needs_review', 'suppressed'],
  outreach_ready: ['outreach_approved', 'suppressed', 'needs_review'],
  outreach_approved: ['handed_off', 'suppressed'],
  handed_off: ['contacted', 'expired', 'suppressed'],
  contacted: ['engaged', 'nurture', 'expired'],
  engaged: ['booked', 'nurture'],
  booked: ['qualified', 'nurture'],
  qualified: ['proposal', 'nurture', 'lost'],
  proposal: ['won', 'lost', 'nurture'],
  failed_retryable: ['scan_pending', 'scanning', 'failed_terminal'],
  needs_review: ['scan_pending', 'qa_pending', 'suppressed', 'failed_terminal'],
  quarantined: ['needs_review', 'suppressed', 'failed_terminal'],
  suppressed: [],
  failed_terminal: [],
  expired: ['nurture'],
  won: [],
  lost: ['nurture'],
  nurture: ['engaged'],
};

function allStates() {
  return [...HAPPY_PATH, ...TERMINALS, ...SIDE];
}

function allowedFrom(from) {
  const idx = HAPPY_PATH.indexOf(from);
  const next = new Set(EXTRA[from] || []);
  if (idx >= 0 && idx < HAPPY_PATH.length - 1) next.add(HAPPY_PATH[idx + 1]);
  if (idx === HAPPY_PATH.length - 1) {
    next.add('won');
    next.add('lost');
    next.add('nurture');
  }
  return next;
}

function assertTransition(from, to) {
  if (from === to) return to;
  if (!allStates().includes(from)) throw new Error(`unknown lifecycle state "${from}"`);
  if (!allStates().includes(to)) throw new Error(`unknown lifecycle state "${to}"`);
  const allowed = allowedFrom(from);
  if (!allowed.has(to)) {
    throw new Error(`illegal transition ${from} -> ${to}`);
  }
  return to;
}

module.exports = { HAPPY_PATH, TERMINALS, SIDE, allStates, allowedFrom, assertTransition };
