'use strict';

const { collapse } = require('./normalize.ts');
const { redactText } = require('./redact.ts');

const OFFER_LABELS = {
  rebuild: 'website rebuild',
  seo_aeo: 'SEO and AI search',
  local: 'local visibility',
  paid: 'paid ads',
  conversion: 'conversion fixes',
  polish: 'site polish',
  nurture: 'relationship only',
};

const STAGE_LABELS = {
  discovered: 'received',
  deduped: 'received',
  scan_pending: 'queued for scan',
  scanning: 'scanning the public site',
  scanned: 'scan complete',
  scored: 'scored',
  report_draft: 'drafting the report',
  qa_pending: 'in human review',
  report_approved: 'report ready',
  enrichment_pending: 'preparing outreach drafts',
  outreach_ready: 'outreach drafts ready',
  outreach_approved: 'outreach approved for dry run',
  handed_off: 'handed to CRM as a dry run',
  contacted: 'contacted',
  engaged: 'engaged',
  booked: 'booked',
  qualified: 'qualified',
  proposal: 'proposal',
  won: 'won',
  lost: 'lost',
  nurture: 'nurture',
  suppressed: 'cannot run this audit',
  quarantined: 'held for review',
  needs_review: 'needs a human look',
  failed_retryable: 'scan failed and can retry',
  failed_terminal: 'scan failed',
  expired: 'expired',
};

function offerLabel(offer) {
  if (!offer) return 'human review';
  return OFFER_LABELS[offer] || String(offer);
}

function stageLabel(lifecycle) {
  if (!lifecycle) return 'received';
  return STAGE_LABELS[lifecycle] || String(lifecycle);
}

function firstName(name) {
  const part = collapse(name).split(' ')[0];
  return part || '';
}

function publicIntake(submission) {
  if (!submission) return null;
  return {
    primary_services: redactText(collapse(submission.primary_services)),
    growth_goals: redactText(collapse(submission.growth_goals)),
    current_channels: redactText(collapse(submission.current_channels)),
    role: collapse(submission.role),
  };
}

module.exports = {
  OFFER_LABELS,
  STAGE_LABELS,
  offerLabel,
  stageLabel,
  firstName,
  publicIntake,
};
