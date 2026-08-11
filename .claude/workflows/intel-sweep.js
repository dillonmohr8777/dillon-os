export const meta = {
  name: 'intel-sweep',
  description: 'Full stack-intelligence sweep: parallel scouts on models, skills, and harnesses; skeptic gate; roster + registry deltas; one committed intel brief',
  whenToUse: 'Quarterly, after a major model release wave, or whenever Dillon says sweep the stack',
  phases: [
    { title: 'Scout', detail: 'models + skills + harnesses in parallel, receipts required' },
    { title: 'Skeptic', detail: 'fresh-context attack; two receipts + a price for tier changes' },
    { title: 'Deltas', detail: 'roster + registry diffs, drafted not applied' },
    { title: 'Brief', detail: 'one intel brief committed to Daily-Briefs/intel/' },
  ],
}

const RECEIPTS = {
  type: 'object',
  properties: {
    claims: { type: 'array', items: { type: 'object', properties: {
      claim: { type: 'string' }, source: { type: 'string' }, date: { type: 'string' },
      lane: { type: 'string', enum: ['models', 'skills', 'harnesses'] },
    }, required: ['claim', 'source', 'lane'] } },
  },
  required: ['claims'],
}

const VERDICTS = {
  type: 'object',
  properties: {
    verdicts: { type: 'array', items: { type: 'object', properties: {
      claim: { type: 'string' },
      source: { type: 'string' },
      date: { type: 'string' },
      lane: { type: 'string' },
      verdict: { type: 'string', enum: ['survives', 'single-source', 'killed'] },
      why: { type: 'string' },
    }, required: ['claim', 'verdict'] } },
  },
  required: ['verdicts'],
}

// ---- Phase 1: parallel scouts ----
const LANES = [
  { key: 'models', prompt: 'Research (WebSearch/WebFetch) the frontier model landscape THIS month: leaders on SWE-bench Verified, Terminal-Bench, LMArena, GPQA, agentic benches; pricing moves; OpenRouter rankings incl. best free-tier models. Only deltas newer than the updated: date in 12_Brain/System/Model Roster.md (read it first). Max 10 claims, receipts required (claim + source URL + date), lane="models".' },
  { key: 'skills', prompt: 'Research (WebSearch/WebFetch) the Claude Code / agent-skills ecosystem THIS month: new high-signal skills, plugins, marketplaces; anything blowing up in awesome-claude-code or the official plugin directory. Read 12_Brain/System/Skill Registry.md first — only NEW candidates not already tracked. Max 10 claims, receipts, lane="skills".' },
  { key: 'harnesses', prompt: 'Research (WebSearch/WebFetch) the agentic-CLI harness landscape THIS month: Claude Code, Codex CLI, Gemini CLI, opencode, new entrants — releases, Terminal-Bench placements, pricing/quota changes, migration chatter. Max 8 claims, receipts, lane="harnesses".' },
]

const found = await parallel(LANES.map(l => () => agent(
  l.prompt,
  { label: `scout:${l.key}`, phase: 'Scout', schema: RECEIPTS }
)))
const allClaims = found.filter(Boolean).flatMap(f => f.claims)
log(`scouts returned ${allClaims.length} claims`)

// ---- Phase 2: skeptic gate ----
const skeptic = await agent(
  `You did NOT do this research. Attack every claim: kill undated/unverifiable ones; label single-source hype; any claim recommending a model-tier change must carry TWO independent receipts AND a price check or it gets labeled single-source. Carry source/date/lane through:\n${JSON.stringify(allClaims)}`,
  { label: 'skeptic', phase: 'Skeptic', schema: VERDICTS, model: 'opus' }
)
const survivors = skeptic ? skeptic.verdicts.filter(v => v.verdict !== 'killed') : []
log(`skeptic: ${allClaims.length} claims -> ${survivors.length} survive`)

// ---- Phase 3: deltas (drafted, not applied) ----
const deltas = await agent(
  `In the dillon-os vault, read 12_Brain/System/Model Roster.md and 12_Brain/System/Skill Registry.md. Below are skeptic-gated survivors from a stack sweep. Produce the DELTAS:
1. Roster: which tier/role rows change, with the receipts that justify each (two receipts + price for a swap; otherwise add as "challenger" note only).
2. Registry: new watchlist candidates (name, repo, one-line, lane fit).
3. Update BOTH files accordingly (roster: updated + expires +30d; registry: watchlist section), conservative bias — churn is a cost.
4. Do NOT touch any config files. If roster tiers changed, note that /stack-sync should run.
Survivors: ${JSON.stringify(survivors)}`,
  { label: 'deltas', phase: 'Deltas', model: 'opus' }
)

// ---- Phase 4: brief + commit ----
const brief = await agent(
  `Compose and commit this sweep's intel brief in the dillon-os vault.
1. Run date +%Y-%m-%d for today.
2. Write 12_Brain/raw/research/<date> - intel-sweep.md: all claims + verdicts (receipts intact). Untouched after this.
3. Write Daily-Briefs/intel/intel-brief-<date>.md: **What changed** (models / skills / harnesses, one line each), **Roster deltas** (or "none"), **Watchlist adds**, **Recommended next actions** (e.g. run /stack-sync, vet a staged skill), **Killed at the gate** (count + notable). Keep it under a page — it's a Monday read, not a report.
4. Append a one-line entry to 12_Brain/System/Upgrade Log.md (approved: pending for anything needing Dillon).
5. git add + commit ("Intel sweep <date>"). Do not push unless the branch tracks a remote and prior workflow commits pushed.
6. Return the brief path + 5-line executive summary.
Deltas summary from prior phase: ${JSON.stringify(deltas)}
Verdict data: ${JSON.stringify(survivors.slice(0, 40))}`,
  { label: 'brief', phase: 'Brief', model: 'opus' }
)

return { brief, claims: allClaims.length, survivors: survivors.length }
