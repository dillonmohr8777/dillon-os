import { normalizeDomain, sha256 } from './policy.mjs';

export const Scout = Object.freeze({
  name: 'Scout',
  role: 'Website intelligence maker',
  run(prospect) {
    const observations = Array.isArray(prospect.observations) ? prospect.observations.filter(Boolean) : [];
    return {
      agent: 'Scout',
      evidence_mode: 'supplied_record_only',
      domain: normalizeDomain(prospect.website),
      fit: observations.length ? 'review_candidate' : 'needs_manual_research',
      observations,
      unknowns: ['Current website behavior is not live-verified.', 'Analytics, search visibility, and conversion performance are unknown.']
    };
  }
});

export const Atlas = Object.freeze({
  name: 'Atlas',
  role: 'AEO and GEO research maker',
  run(prospect, scout) {
    const topic = String(prospect.category).trim().toLowerCase();
    return {
      agent: 'Atlas',
      evidence_mode: 'hypothesis_only_pending_live_research',
      search_surface_hypotheses: [
        `Answer-first pages for ${topic} questions in ${prospect.market}`,
        'Clear entity, service, location, and trust signals for search and AI retrieval',
        'Structured FAQs grounded in verified customer questions and first-party expertise'
      ],
      source_observation_count: scout.observations.length,
      prohibited_claims: ['ranking gained', 'traffic gained', 'revenue gained', 'AI Overview inclusion guaranteed']
    };
  }
});

export const Forge = Object.freeze({
  name: 'Forge',
  role: 'Web solution maker',
  run(prospect, scout, atlas) {
    return {
      agent: 'Forge',
      solution_mode: 'draft_scope',
      workstreams: [
        { name: 'Website optimization', output: 'Mobile path, page hierarchy, speed, accessibility, and conversion review' },
        { name: 'AEO and GEO foundation', output: atlas.search_surface_hypotheses.join('; ') },
        { name: 'Agent integration', output: 'Map one repetitive intake, CRM, or reporting workflow before proposing automation' }
      ],
      prerequisite: scout.fit === 'needs_manual_research' ? 'Manual website research required before outreach review.' : 'Validate supplied observations against the current public website.'
    };
  }
});

export const Relay = Object.freeze({
  name: 'Relay',
  role: 'Draft packaging maker',
  run(prospect, scout, forge, sender) {
    const firstName = String(prospect.contact_name || '').trim() || 'there';
    const observation = String(scout.observations[0] || 'the mobile path and answer structure may be worth reviewing').replace(/\s+/g, ' ').slice(0, 240);
    const subject = `A website idea for ${prospect.company_name}`;
    const body = `Hi ${firstName},\n\nI was looking at the website information available for ${prospect.company_name}. One item in the source record stood out: ${observation}\n\nI run ${sender.business_name}, focused on website optimization, AEO and GEO visibility, and practical business agents. I drafted a short review framework for ${prospect.company_name}, but I would validate everything against the current site before making any recommendations.\n\nWould a concise, no-pressure website and AI search visibility review be useful?\n\n${sender.name}`;
    const packageValue = {
      channel: 'email',
      to: prospect.contact_email || null,
      subject,
      body,
      claims_status: 'hypothesis_only_pending_human_validation',
      forge_scope: forge.workstreams.map((item) => item.name),
      delivery_status: 'DRAFT_ONLY_DO_NOT_SEND'
    };
    return { agent: 'Relay', ...packageValue, fingerprint: sha256(packageValue) };
  }
});

export const Proof = Object.freeze({
  name: 'Proof',
  role: 'Independent checker',
  run(record) {
    const failures = [];
    const draft = record.outputs.relay;
    if (!record.outputs.scout || !record.outputs.atlas || !record.outputs.forge || !draft) failures.push('Missing maker output.');
    if (draft?.delivery_status !== 'DRAFT_ONLY_DO_NOT_SEND') failures.push('Draft-only marker missing.');
    if (record.approval_gate.status !== 'NOT_GRANTED') failures.push('Approval gate is not closed.');
    if (!draft?.subject || !draft?.body) failures.push('Draft subject or body missing.');
    if (!draft?.to) failures.push('No validated draft recipient was supplied.');
    if (!Array.isArray(record.prospect.allowed_channels) || !record.prospect.allowed_channels.includes('email')) failures.push('Email is not an allowed channel for this prospect.');
    if (/(guarantee|guaranteed|we increased|we grew|zero conversions)/i.test(`${draft?.subject || ''} ${draft?.body || ''}`)) failures.push('Unsupported or prohibited claim language detected.');
    if (record.prospect.opt_out === true || record.prospect.do_not_contact === true) failures.push('Opted-out prospect reached Proof.');
    if (record.outputs.model_analysis) {
      const serialized = JSON.stringify(record.outputs.model_analysis);
      if (record.outputs.model_trace?.mode !== 'codex_cli_model_analysis' || record.outputs.model_trace?.sandbox !== 'read-only' || record.outputs.model_trace?.tool_activity_detected !== false) failures.push('Model trace did not satisfy the safe execution contract.');
      if (/(will rank|guarantee(?:d|s)? results|will increase (?:traffic|revenue)|guaranteed ai overview)/i.test(serialized)) failures.push('Model output contains a prohibited outcome claim.');
    }
    return {
      agent: 'Proof',
      checker_only: true,
      status: failures.length ? 'failed' : 'passed',
      failures
    };
  }
});
