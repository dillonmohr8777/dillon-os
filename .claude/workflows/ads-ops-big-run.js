export const meta = {
  name: 'ads-ops-big-run',
  description: 'Full-roster ads swarm: research wave, one auditor per account, adversarial verify, Action Packet synthesis',
  whenToUse: 'The every-2-days Ads Ops analysis at full ultracode scale, or whenever Dillon says run the big one',
  phases: [
    { title: 'Research', detail: '2026 Google + Meta practices, skeptic-gated' },
    { title: 'Audit', detail: 'one agent per account spec' },
    { title: 'Verify', detail: 'adversarial check vs brand rules + evidence' },
    { title: 'Packet', detail: 'synthesize + commit the Action Packet' },
  ],
}

const SPECS = [
  { key: 'bar-crawl',  file: '02_Campaigns/Ads Ops/Bar Crawl Ads Spec.md' },
  { key: 'replenish',  file: '02_Campaigns/Ads Ops/Replenish Ads Spec.md' },
  { key: 'omega',      file: '02_Campaigns/Ads Ops/Omega Ads Spec.md' },
  { key: 'kjb',        file: '02_Campaigns/Ads Ops/KJB Ads Spec.md' },
  { key: 'fagan',      file: '02_Campaigns/Ads Ops/Fagan Painting Ads Spec.md' },
  { key: 'nkcdc',      file: '02_Campaigns/Ads Ops/NKCDC Ads Spec.md' },
  { key: 'onsite',     file: '02_Campaigns/Ads Ops/Onsite Ads Spec.md' },
  { key: 'shadow',     file: '02_Campaigns/Ads Ops/Shadow HVAC Ads Spec.md' },
]

const FINDINGS = {
  type: 'object',
  properties: {
    claims: { type: 'array', items: { type: 'object', properties: {
      claim: { type: 'string' }, source: { type: 'string' }, date: { type: 'string' },
    }, required: ['claim', 'source'] } },
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
      verdict: { type: 'string', enum: ['survives', 'single-source', 'killed'] },
      why: { type: 'string' },
    }, required: ['claim', 'verdict'] } },
  },
  required: ['verdicts'],
}

const ACTIONS = {
  type: 'object',
  properties: {
    client: { type: 'string' },
    actions: { type: 'array', items: { type: 'object', properties: {
      change: { type: 'string', description: 'exact change instruction for the apply session' },
      lane: { type: 'string', enum: ['publish', 'optimize', 'conversions', 'lead-delivery'] },
      impact: { type: 'string', enum: ['high', 'medium', 'low'] },
      verify: { type: 'string', description: 'how the apply session confirms it took' },
    }, required: ['change', 'lane', 'impact', 'verify'] } },
    flags: { type: 'array', items: { type: 'string' } },
    blocked: { type: 'array', items: { type: 'string' } },
  },
  required: ['client', 'actions', 'flags', 'blocked'],
}

// ---- Phase 1: research wave (skip if cache is fresh) ----
phase('Research')
const cacheCheck = await agent(
  'In /home/user/dillon-os (or the repo root if elsewhere — find the dillon-os vault), grep concepts/ for pages tagged ads-research with an expires: date. Return ONLY the word FRESH if any unexpired page exists (compare to today via the date command), else STALE.',
  { label: 'research-cache', phase: 'Research', effort: 'low', model: 'haiku' }
)

let survivors = []
if (!String(cacheCheck).includes('FRESH')) {
  const TOPICS = [
    'Google Ads Search optimization 2026: what practitioners are actually doing now (search-term hygiene, broad match + smart bidding state, RSA best practice)',
    'Performance Max 2026: current controls, asset group structure, per-location PMax patterns, what wastes spend',
    'Meta lead ads 2026: higher-intent forms vs volume, Advantage+ audience overrides, geo/language targeting reliability, cost-per-qualified-lead tactics',
    'Conversion tracking 2026: enhanced conversions, gclid/offline stitching, Squarespace + GA4 + Google Ads attribution patterns',
  ]
  const found = await parallel(TOPICS.map(t => () => agent(
    `Research (WebSearch/WebFetch): ${t}. Practitioner layer preferred (recent threads, changelogs, credible operators) over old blog posts. Return claims as receipts: claim + source URL + date. Max 8 claims, only actionable ones.`,
    { label: `research:${t.slice(0, 30)}`, phase: 'Research', schema: FINDINGS, model: 'opus' }
  )))
  const allClaims = found.filter(Boolean).flatMap(f => f.claims)
  const skeptic = await agent(
    `You did NOT do this research. Attack every claim below — kill undated/unverifiable ones, label single-source ones, pass only what a marketer should act on in July 2026. Carry each claim's source and date through into your verdicts:\n${JSON.stringify(allClaims)}`,
    { label: 'skeptic', phase: 'Research', schema: VERDICTS, model: 'opus' }
  )
  survivors = skeptic ? skeptic.verdicts.filter(v => v.verdict !== 'killed') : []
  log(`research: ${allClaims.length} claims → ${survivors.length} survive`)
} else {
  log('research cache fresh — skipping wave')
}

// ---- Phase 2 + 3: audit each account, then adversarially verify (pipelined) ----
const audited = await pipeline(
  SPECS,
  s => agent(
    `You are the ads analyst for one account. Read, in the dillon-os vault:
1. ${s.file} (the spec — its rules are law)
2. 02_Campaigns/Ads Ops/Ads Ops Hub.md (mission + guardrails)
3. The newest files in raw/ads-exports/ mentioning this client (if none or >4 days old, say so in flags)
4. The newest Daily-Briefs/ads-ops/action-packet-*.md (grade prior items for this client)
${survivors.length ? `5. Verified fresh research: ${JSON.stringify(survivors.slice(0, 12))}` : ''}

Produce this cycle's actions for the apply session: exact changes (publish / optimize / conversions / lead-delivery lanes), each with a verify step. Flag tracking failures and policy risks. List blocked items with what unblocks them. Respect brand rules absolutely.`,
    { label: `audit:${s.key}`, phase: 'Audit', schema: ACTIONS, model: 'opus' }
  ),
  (audit, s) => audit && agent(
    `Adversarial check. Read ${s.file} fresh. Below are proposed actions for ${audit.client}. KILL any action that: violates a brand rule in the spec, edits an account the spec says verify-live-first without verification as step one, changes budget >20% in one step, or claims a number without a source. Return the surviving actions in the same schema (keep flags/blocked as-is, minus anything you killed with a note in flags).

Proposed actions (audit JSON):
${JSON.stringify(audit)}`,
    { label: `verify:${s.key}`, phase: 'Verify', schema: ACTIONS, model: 'opus' }
  ).then(v => v || audit)
)

// ---- Phase 4: synthesize + commit ----
phase('Packet')
const packet = await agent(
  `Compose and commit this cycle's Action Packet for the dillon-os vault.
1. Run \`date +%Y-%m-%d\` for today's date.
2. Write Daily-Briefs/ads-ops/action-packet-<date>.md with sections:
   **Apply list** (per client, high-impact first, each change with its verify step),
   **Flags**, **Blocked**, **Research notes** (if any), **Last cycle scorecard**.
3. ${survivors.length ? 'Also land the research survivors as concepts/ pages tagged ads-research with source links and expires: +30 days, and add them to INDEX.md.' : 'No new research pages this cycle.'}
4. git add, commit ("Ads Ops action packet <date>"), push to the current branch.
5. Return the packet path + a 5-line executive summary.

Data: ${JSON.stringify(audited.filter(Boolean))}
${survivors.length ? `Research survivors to land: ${JSON.stringify(survivors)}` : ''}
Rules: no lead PII; numbers only with sources; Dillon-first lead routing is the standard.`,
  { label: 'packet', phase: 'Packet', model: 'opus' }
)

return { packet, accounts: audited.filter(Boolean).length }
