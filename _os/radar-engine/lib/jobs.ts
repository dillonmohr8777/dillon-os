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

async function applyRetention(store, cfg) {
  const plan = retentionPlan(cfg);
  const revoked = [];
  for (const report of store.all('reports')) {
    if (report.expires_at && new Date(report.expires_at) < new Date()) {
      store.update('reports', report.id, { revoked_at: new Date().toISOString() });
      revoked.push(report.id);
    }
  }
  return { ...plan, revoked };
}

module.exports = { processJobs, retentionPlan, applyRetention };
