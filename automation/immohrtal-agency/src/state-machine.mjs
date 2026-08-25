export const STATES = Object.freeze({
  DISCOVERED: 'DISCOVERED',
  SCOUT_REVIEWED: 'SCOUT_REVIEWED',
  ATLAS_REVIEWED: 'ATLAS_REVIEWED',
  FORGE_DRAFTED: 'FORGE_DRAFTED',
  RELAY_DRAFTED: 'RELAY_DRAFTED',
  PROOF_PASSED: 'PROOF_PASSED',
  AWAITING_APPROVAL: 'AWAITING_APPROVAL',
  SUPPRESSED: 'SUPPRESSED',
  DUPLICATE: 'DUPLICATE',
  BLOCKED: 'BLOCKED'
});

const NEXT = Object.freeze({
  [STATES.DISCOVERED]: [STATES.SCOUT_REVIEWED, STATES.SUPPRESSED, STATES.DUPLICATE, STATES.BLOCKED],
  [STATES.SCOUT_REVIEWED]: [STATES.ATLAS_REVIEWED, STATES.BLOCKED],
  [STATES.ATLAS_REVIEWED]: [STATES.FORGE_DRAFTED, STATES.BLOCKED],
  [STATES.FORGE_DRAFTED]: [STATES.RELAY_DRAFTED, STATES.BLOCKED],
  [STATES.RELAY_DRAFTED]: [STATES.PROOF_PASSED, STATES.BLOCKED],
  [STATES.PROOF_PASSED]: [STATES.AWAITING_APPROVAL, STATES.BLOCKED],
  [STATES.AWAITING_APPROVAL]: [],
  [STATES.SUPPRESSED]: [],
  [STATES.DUPLICATE]: [],
  [STATES.BLOCKED]: []
});

export function transition(record, next, by, at) {
  if (!NEXT[record.state]?.includes(next)) {
    throw new Error(`Illegal state transition ${record.state} -> ${next}`);
  }
  return {
    ...record,
    state: next,
    history: [...record.history, { from: record.state, to: next, by, at }]
  };
}

export function discovered(prospect, at) {
  return {
    prospect,
    state: STATES.DISCOVERED,
    history: [{ from: null, to: STATES.DISCOVERED, by: 'orchestrator', at }],
    outputs: {},
    approval_gate: {
      required: true,
      status: 'NOT_GRANTED',
      scope: 'exact prospect, exact subject, exact body, exact channel',
      external_action_available: false
    }
  };
}

