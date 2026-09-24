'use strict';

async function processJobs(store, handlers, { workerId = 'worker-1', max = 10 } = {}) {
  const results = [];
  for (let i = 0; i < max; i++) {
    const job = await store.claimJob(workerId);
    if (!job) break;
    const handler = handlers[job.type];
    try {
      if (!handler) throw new Error(`no handler for ${job.type}`);
      await handler(job.payload, job);
      results.push(await store.completeJob(job.id));
    } catch (err) {
      results.push(await store.failJob(job.id, err.message || err));
    }
  }
  return results;
}

function retentionPlan(cfg, now = new Date()) {
  const days = cfg.retentionDays || 365;
  const cutoff = new Date(now.getTime() - days * 86400000).toISOString();
  return {
    cutoff,
    tables: [
      'intake_submissions',
      'contacts',
      'contact_sources',
      'outreach_drafts',
      'reports',
      'report_versions',
    ],
    note: 'Deletion hook: drop or anonymize rows older than cutoff. Public report tokens are revoked first.',
  };
}

async function applyRetention(store, cfg, now = new Date()) {
  const plan = retentionPlan(cfg, now);
  const cutoff = new Date(plan.cutoff);
  const revoked = [];
  const anonymized = [];
  for (const report of store.all('reports')) {
    const expired = report.expires_at && new Date(report.expires_at) < now;
    const aged = report.created_at && new Date(report.created_at) < cutoff;
    if ((expired || aged) && !report.revoked_at) {
      store.update('reports', report.id, { revoked_at: now.toISOString() });
      revoked.push(report.id);
    }
  }
  for (const sub of store.all('intake_submissions')) {
    if (sub.created_at && new Date(sub.created_at) < cutoff) {
      store.update('intake_submissions', sub.id, {
        requester_name: '[deleted]',
        requester_email: '[deleted]',
        requester_phone: '',
        business_description: '',
        growth_goals: '',
        notes: '',
      });
      anonymized.push(sub.id);
    }
  }
  for (const c of store.all('contacts')) {
    if (c.created_at && new Date(c.created_at) < cutoff) {
      store.update('contacts', c.id, { value: '[deleted]', person_name: null, person_title: null });
      anonymized.push(c.id);
    }
  }
  return { ...plan, revoked, anonymized };
}

module.exports = { processJobs, retentionPlan, applyRetention };
