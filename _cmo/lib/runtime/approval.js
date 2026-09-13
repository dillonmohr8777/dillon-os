/**
 * The approval gate.
 *
 * Nothing leaves this system without a human decision. Not a post, not an ad
 * change, not an email, not a deploy. That is the single largest behavioural
 * difference from the autopilot products: they optimise for "it posted while
 * you slept", which is exactly how an agency loses an account.
 *
 * Two properties make this an actual control rather than a checkbox:
 *
 *   SEPARATION OF DUTIES - the actor who created an artifact cannot be the
 *   actor who approves it. An agent is always the maker; a named human is
 *   always the checker. `agent:*` actors are refused as checkers outright.
 *
 *   RISK TIERING - risk is a property of the EFFECT, not of the content.
 *   Anything that spends money, touches a live account, or is externally
 *   visible is high risk and cannot be auto-approved at any setting.
 */

import { GuardrailError, ValidationError } from '../core/errors.js';
import { daysBetween } from '../core/clock.js';

export const DRAFT = 'draft';
export const PENDING = 'pending';
export const APPROVED = 'approved';
export const REJECTED = 'rejected';
export const CHANGES_REQUESTED = 'changes_requested';
export const PUBLISHED = 'published';
export const FAILED = 'failed';
export const EXPIRED = 'expired';

const TRANSITIONS = {
  [DRAFT]: [PENDING, REJECTED],
  [PENDING]: [APPROVED, REJECTED, CHANGES_REQUESTED, EXPIRED],
  [CHANGES_REQUESTED]: [PENDING, REJECTED],
  [APPROVED]: [PUBLISHED, FAILED, EXPIRED],
  [REJECTED]: [],
  [PUBLISHED]: [],
  [FAILED]: [APPROVED],
  [EXPIRED]: [PENDING],
};

/**
 * Risk tiers. `low` may be auto-approved when a workspace opts in; `medium`
 * needs a human; `high` needs a human AND is never auto-approvable.
 */
export const RISK = Object.freeze({
  low: 'low',
  medium: 'medium',
  high: 'high',
});

/**
 * Effect -> risk. Deliberately conservative: an unrecognised effect is high
 * risk, so adding a new publisher cannot accidentally inherit auto-approval.
 */
export const EFFECT_RISK = Object.freeze({
  'internal.brief': RISK.low,
  'internal.report': RISK.low,
  'internal.audit': RISK.low,
  'internal.research': RISK.low,
  'internal.experiment': RISK.low,
  'draft.article': RISK.medium,
  'draft.social': RISK.medium,
  'draft.email': RISK.medium,
  'draft.adcopy': RISK.medium,
  'publish.cms': RISK.high,
  'publish.social': RISK.high,
  'publish.gbp': RISK.high,
  'send.email': RISK.high,
  'deploy.site': RISK.high,
  'mutate.ads': RISK.high,
  'spend.change': RISK.high,
  'account.change': RISK.high,
});

export function riskFor(effect) {
  return EFFECT_RISK[effect] ?? RISK.high;
}

export function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

function isAgentActor(actor) {
  return String(actor || '').startsWith('agent:');
}

export function createApprovalQueue({ store, wsId, clock, policy = {} }) {
  const ws = store.ws(wsId);
  const settings = {
    autoApproveLow: false,        // opt-in per workspace
    requireSeparation: true,
    staleAfterDays: 7,
    ...policy,
  };

  /** Open an approval for an artifact. Called by the engine, never by hand. */
  async function open({
    id, artifactId, effect, title, summary = '', createdBy,
    risk = null, evidence = [], payload = null, channel = null, target = null,
    guardrails = null, runId = null,
  }) {
    if (!id) throw new ValidationError('approval requires an id');
    if (!artifactId) throw new ValidationError('approval requires an artifactId');
    if (!createdBy) throw new ValidationError('approval requires createdBy');
    if (!effect) throw new ValidationError('approval requires an effect');

    const tier = risk || riskFor(effect);
    const autoEligible = settings.autoApproveLow && tier === RISK.low;

    const doc = {
      kind: 'approval',
      artifactId,
      runId,
      effect,
      risk: tier,
      title: title || effect,
      summary,
      channel,
      target,
      payload,
      evidence,
      guardrails,
      createdBy,
      state: autoEligible ? APPROVED : PENDING,
      decidedBy: autoEligible ? 'policy:auto-approve-low-risk' : null,
      decidedAt: autoEligible ? clock.iso() : null,
      decisionNote: autoEligible ? 'auto-approved: low-risk internal artifact' : null,
      history: [
        { at: clock.iso(), from: DRAFT, to: autoEligible ? APPROVED : PENDING, by: createdBy, note: 'opened' },
      ],
      openedAt: clock.iso(),
    };
    await ws.put('approvals', id, doc);
    await ws.append('events', { type: 'approval.opened', approvalId: id, effect, risk: tier, artifactId, by: createdBy });
    return { ...doc, id };
  }

  async function move(id, to, { by, note = '', extra = {} }) {
    const doc = await ws.get('approvals', id);
    if (!doc) throw new ValidationError(`approval ${id} not found`);
    if (!canTransition(doc.state, to)) {
      throw new ValidationError(`cannot move approval ${id} from ${doc.state} to ${to}`, { from: doc.state, to });
    }
    const next = {
      ...doc,
      ...extra,
      state: to,
      history: [...(doc.history || []), { at: clock.iso(), from: doc.state, to, by, note }],
    };
    await ws.put('approvals', id, next);
    await ws.append('events', { type: `approval.${to}`, approvalId: id, by, note, effect: doc.effect });
    return { ...next, id };
  }

  /**
   * Approve. This is the one place separation of duties is enforced, so it
   * cannot be bypassed by calling a lower-level helper.
   */
  async function approve(id, { by, note = '' }) {
    if (!by) throw new ValidationError('approve requires an actor');
    const doc = await ws.get('approvals', id);
    if (!doc) throw new ValidationError(`approval ${id} not found`);
    if (isAgentActor(by)) {
      throw new GuardrailError('an agent cannot approve its own work - a named human must decide', {
        approvalId: id, actor: by,
      });
    }
    if (settings.requireSeparation && by === doc.createdBy) {
      throw new GuardrailError('separation of duties: the maker cannot be the checker', {
        approvalId: id, actor: by, createdBy: doc.createdBy,
      });
    }
    if (doc.guardrails && doc.guardrails.blocking?.length) {
      throw new GuardrailError('cannot approve while blocking guardrails are unresolved', {
        approvalId: id, blocking: doc.guardrails.blocking.map((g) => g.rule),
      });
    }
    return move(id, APPROVED, { by, note, extra: { decidedBy: by, decidedAt: clock.iso(), decisionNote: note } });
  }

  async function reject(id, { by, note = '' }) {
    if (!by) throw new ValidationError('reject requires an actor');
    return move(id, REJECTED, { by, note, extra: { decidedBy: by, decidedAt: clock.iso(), decisionNote: note } });
  }

  async function requestChanges(id, { by, note = '' }) {
    if (!by) throw new ValidationError('requestChanges requires an actor');
    return move(id, CHANGES_REQUESTED, { by, note, extra: { decisionNote: note } });
  }

  async function resubmit(id, { by, note = '', payload = undefined }) {
    const extra = payload === undefined ? {} : { payload };
    return move(id, PENDING, { by, note, extra });
  }

  /** Mark an approved effect as actually performed. Records the receipt. */
  async function markPublished(id, { by, receipt = null, note = '' }) {
    return move(id, PUBLISHED, { by, note, extra: { publishedAt: clock.iso(), receipt } });
  }

  async function markFailed(id, { by, error = null, note = '' }) {
    return move(id, FAILED, { by, note, extra: { failedAt: clock.iso(), error } });
  }

  /** Anything pending longer than the stale window is expired, not silently held. */
  async function expireStale({ by = 'policy:stale' } = {}) {
    const pending = await ws.list('approvals', { where: { state: PENDING } });
    const expired = [];
    for (const doc of pending) {
      const age = daysBetween(doc.openedAt, clock.iso());
      if (age != null && age >= settings.staleAfterDays) {
        expired.push(await move(doc.id, EXPIRED, { by, note: `no decision in ${age} days` }));
      }
    }
    return expired;
  }

  async function get(id) { return ws.get('approvals', id); }

  async function list({ state = null, effect = null, risk = null, limit = null } = {}) {
    const where = {};
    if (state) where.state = state;
    if (effect) where.effect = effect;
    if (risk) where.risk = risk;
    return ws.list('approvals', { where: Object.keys(where).length ? where : null, limit, sort: 'updatedAt', order: 'desc' });
  }

  /** The board a human actually looks at: grouped, oldest-first inside groups. */
  async function board() {
    const all = await ws.list('approvals', { sort: 'openedAt', order: 'asc' });
    const groups = { pending: [], changes_requested: [], approved: [], published: [], rejected: [], expired: [], failed: [] };
    for (const doc of all) (groups[doc.state] ||= []).push(doc);
    return {
      counts: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])),
      waitingOnHuman: [...groups.pending, ...groups.changes_requested],
      readyToPublish: groups.approved,
      groups,
      oldestPendingDays: groups.pending.length
        ? Math.max(...groups.pending.map((d) => daysBetween(d.openedAt, clock.iso()) ?? 0))
        : 0,
    };
  }

  return {
    settings, open, approve, reject, requestChanges, resubmit,
    markPublished, markFailed, expireStale, get, list, board,
  };
}
