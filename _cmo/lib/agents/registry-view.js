/**
 * A description-only view of the roster.
 *
 * The CLI and the HTTP server both need to LIST agents without running them.
 * Keeping the view separate means `cmo agents` does not pay for the heavier
 * imports the agent implementations pull in.
 */

import { ROSTER, LANES } from './index.js';
import { riskFor } from '../runtime/approval.js';

export { ROSTER, LANES };

export function describeAgentList() {
  return ROSTER.map((a) => ({
    id: a.id,
    label: a.label,
    lane: a.lane,
    cadence: a.cadence,
    needs: a.needs || [],
    optional: a.optional || [],
    produces: a.produces,
    effect: a.effect,
    risk: riskFor(a.effect || 'internal.brief'),
    version: a.version || 1,
    description: a.description || '',
  }));
}

export function laneSummary() {
  return LANES.map((lane) => {
    const set = ROSTER.filter((a) => a.lane === lane);
    return { lane, count: set.length, agents: set.map((a) => a.id) };
  });
}
