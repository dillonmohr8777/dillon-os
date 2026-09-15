'use strict';

const LAST_DATE = '9999-12-31';

function normalizedFirstSeen(value) {
  const date = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : LAST_DATE;
}

function compareCandidatesChronologically(a, b) {
  return normalizedFirstSeen(a.firstSeen).localeCompare(normalizedFirstSeen(b.firstSeen))
    || Number(b.lifecycle === 'queued_build') - Number(a.lifecycle === 'queued_build')
    || Number(b.registryBuildable) - Number(a.registryBuildable)
    || Number(b.opportunity || 0) - Number(a.opportunity || 0)
    || Number(a.quality || 0) - Number(b.quality || 0)
    || String(a.domain || '').localeCompare(String(b.domain || ''));
}

function chooseOldestReady(ready, count) {
  return ready
    .slice()
    .sort((a, b) => compareCandidatesChronologically(a.candidate, b.candidate))
    .slice(0, count);
}

module.exports = {
  LAST_DATE,
  normalizedFirstSeen,
  compareCandidatesChronologically,
  chooseOldestReady,
};
