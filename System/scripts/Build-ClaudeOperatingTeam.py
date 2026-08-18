"""Generator (owner) for the Claude-native operating team registry.

Reads the Grok canonical sources and emits, idempotently:
  11_Agents/claude-operating-team.json
  11_Agents/claude-stage-discrepancy-ledger.json

Two provenance classes matter here:
  canonical / derived  - recovered from a Grok or Dillon OS source
  delegated-autonomy-v1-2026-08-12 - a NEW conservative operating decision Dillon
      delegated on 2026-08-12. These are not recovered historical facts. They are
      reviewable defaults chosen by risk class, cadence, and capability.

Run:  python System/scripts/Build-ClaudeOperatingTeam.py
"""
import json, collections, os, re

AV = r'C:\Users\dillo\Documents\Codex\projects\agent-vault\notes\inbox'
VAULT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ROCK = os.path.join(VAULT, '11_Agents', 'Rockbot Operating System')
OUT = os.path.join(VAULT, '11_Agents', 'claude-operating-team.json')
LEDGER_OUT = os.path.join(VAULT, '11_Agents', 'claude-stage-discrepancy-ledger.json')
DELEGATED = 'delegated-autonomy-v1-2026-08-12'

man = json.load(open(os.path.join(AV, '2026-08-11-grok-bot-routine-recording-manifest.json'), encoding='utf-8-sig'))
routines = man['routines']

# --------------------------------------------------- canonical: 9 stage model
sim_src = open(os.path.join(ROCK, 'training-simulator', 'app.js'), encoding='utf-8').read()
block = sim_src.split('const stages = [', 1)[1].split('];', 1)[0]
OPERATING_STAGES = [
    {'index': i + 1, 'key': m.group(1), 'label': m.group(2), 'verb': m.group(3), 'title': m.group(4)}
    for i, m in enumerate(re.finditer(
        r'key:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*verb:\s*"([^"]+)",\s*title:\s*"([^"]+)"', block))
]
assert len(OPERATING_STAGES) == 9, f'expected 9 stages, parsed {len(OPERATING_STAGES)}'
RECEIPT_FIELDS = ['route', 'artifact_paths', 'sources_and_freshness', 'checks', 'assumptions',
                  'privacy_state', 'approval_state', 'external_action_attempted', 'next_safest_action']

MODULES = {
    'Command':        ['D01', 'D02', 'D08', 'D09', 'D10', 'D11', 'D27', 'E01', 'E02', 'M04', 'W01', 'W10'],
    'Communications': ['D04', 'D05', 'D06', 'D20', 'D21', 'D22', 'D23', 'D26', 'W07', 'W11', 'E07', 'E11', 'M05'],
    'Web':            ['D12', 'D13', 'D14', 'D15', 'D24', 'D25', 'W05', 'E03', 'E05', 'M02'],
    'Performance':    ['D17', 'D18', 'D19', 'W02', 'W03', 'W06', 'E06', 'M03'],
    'Growth':         ['D16', 'W04', 'W08', 'E09'],
    'Reliability':    ['D03', 'D07', 'W09', 'M01', 'E04', 'E08', 'E10'],
}
LEDGER_MODULE_STAGES = {'Command': 108, 'Communications': 117, 'Web': 90,
                        'Performance': 72, 'Growth': 36, 'Reliability': 63}
ROUTINE_MODULE = {}
for mod, ids in MODULES.items():
    for i in ids:
        assert i not in ROUTINE_MODULE, f'{i} in two modules'
        ROUTINE_MODULE[i] = mod
assert len(ROUTINE_MODULE) == 54

CADENCE_BOTS = ['Morning Marketing Chief Operator', 'Prospect Radar Website Factory',
                'Client Communications Draft Desk', 'Paid Media Twice-Weekly Review',
                'Weekly Reporting Operator', 'Weekly Executive Review']
SPECIALISTS = ['Client Context Router', 'Grok Research Scout', 'Communications Intake Analyst',
               'Paid Media Auditor', 'Reporting and Analytics Analyst', 'Web and Product Builder',
               'Design and Art Direction Critic', 'Brand Voice and Content Studio',
               'SEO AEO GEO Strategist', 'CRO Experiment Planner', 'CRM and Revenue Ops Analyst',
               'Automation Reliability Scout', 'Knowledge and Obsidian Curator',
               'Independent QA and Release Critic', 'Delivery Evidence Auditor']

BENCH = {
    'Grok Research Scout': (10000, 900,
        'Source-located market, competitor, platform, audience, AEO/GEO, and opportunity research.',
        ['bounded question', 'current source window', 'client route', 'decision supported', 'freshness requirement'],
        ['findings', 'source locators', 'confidence', 'contradictions', 'decision-ready handoff'],
        ['substitute research for the requested artifact']),
    'Web and Product Builder': (20000, 2700,
        'Scoped website, landing-page, dashboard, and application work in the exact repository selected by Codex.',
        ['repository status', 'nearest AGENTS.md', 'PRODUCT.md', 'DESIGN.md', 'surface brief', 'verified assets'],
        ['implementation artifact', 'desktop and mobile evidence', 'formatter/typecheck/tests/build',
         'accessibility checks', 'console status', 'impeccable detect --json'],
        ['deploy', 'publish', 'commit', 'push', 'merge', 'create a new public destination', 'cross client boundaries']),
    'Reporting and Analytics Analyst': (12000, 1200,
        'Client-separated marketing, paid-media, CRM, and operating reports.',
        ['exact client', 'source of truth', 'account', 'channel', 'date range', 'KPI definitions',
         'attribution window', 'reporting latency', 'tracking health'],
        ['verified metrics', 'source ledger', 'pending fields', 'calculations', 'interpretation',
         'next actions', 'client-ready draft'],
        ['blend clients or channels', 'invent totals', 'change spend', 'deliver a report externally']),
    'Brand Voice and Content Studio': (10000, 1200,
        'Draft emails, Slack replies, ads, landing-page copy, blogs, social content, scripts, internal narratives.',
        ['exact client and audience', 'current evidence', 'relevant thread', 'Dillon voice',
         'client voice', 'approved terminology'],
        ['usable draft', 'fact checks', 'source locators', 'intended recipient/channel', 'approval state'],
        ['send', 'post', 'schedule', 'publish', 'add recipients', 'claim unsupported results']),
    'Independent QA and Release Critic': (8000, 900,
        'Independently evaluate material artifacts before Codex accepts them.',
        ['brief', 'acceptance checklist', 'artifact', 'source evidence', 'test evidence', 'declared risks'],
        ['score on brand match, clarity, conversion intent, factual support, accessibility, technical integrity',
         'pass|revise|blocked', 'prioritized findings', 'exact retest requirements'],
        ['edit production', 'approve its own work', 'claim completion without reviewable evidence']),
    'Automation Reliability Scout': (8000, 900,
        'Inspect scheduled tasks, agents, ingestion, checkpoints, bridges, logs, queues, runtime health.',
        ['observed runtime state', 'last known good checkpoint', 'logs', 'queue state'],
        ['observed state', 'last known good checkpoint', 'failure classification', 'blast radius',
         'safe recovery proposal', 'deterministic verification command'],
        ['fabricate source items', 'advance checkpoints after a failed collector', 'change credentials',
         'restart external services', 'delete state']),
}

CLAUDE_ROLE = {
    'critic': ['D24', 'D25', 'W09', 'W10', 'W11', 'M02', 'M03', 'M04'],
    'architect': ['E05', 'E11', 'M05'],
    'maker': ['D13', 'D14', 'D16', 'D19', 'D26', 'W04', 'W05', 'W06'],
    'terminal_readonly': ['D03', 'D07', 'D12', 'E04', 'E10'],
    'analyst': ['D10', 'D11', 'D17', 'D18', 'W08'],
    'never': ['D01', 'D02', 'D04', 'D05', 'D06', 'D08', 'D09', 'D15', 'D20', 'D21', 'D22', 'D23',
              'D27', 'E01', 'E02', 'E03', 'E06', 'E07', 'E08', 'E09', 'M01', 'W01', 'W02', 'W03', 'W07'],
}
NEVER_REASON = {
    'D01': 'regenerates the agent-vault projection Codex owns',
    'D02': 'access and session continuity touches credentials',
    'D04': 'raw private Gmail content', 'D05': 'raw private Slack content',
    'D06': 'raw meeting content', 'D08': 'canonical client routing authority',
    'D09': 'canonical queue priority authority',
    'D15': 'client creative standard requires Grok Imagine plus verified logo bundle',
    'D20': 'outbound draft desk on private threads', 'D21': 'outbound Slack preview',
    'D22': 'approval package assembly is the Chief role',
    'D23': 'executes an approved external delivery',
    'D27': 'closing the operating day is a canonical write',
    'E01': 'client onboarding creates canonical registry state',
    'E02': 'urgent inbound request handling is owner-facing',
    'E03': 'deployment to a live mapped site', 'E06': 'paid-media launch gate and spend',
    'E07': 'human-only authentication handoff',
    'E08': 'privacy or credential incident containment is human-led',
    'E09': 'publishes a social content packet',
    'M01': 'credential and access continuity audit',
    'W01': 'canonical queue reconciliation', 'W02': 'paid-media account authority',
    'W03': 'paid-media account authority',
    'W07': 'outreach send preparation on private threads',
}
TIER2 = {'D23', 'E03', 'E06', 'E09', 'D15', 'W02', 'W03', 'D20', 'D21', 'D22', 'E01', 'E02',
         'E07', 'E08', 'M01', 'D02', 'W07'}
TIER1 = {'D26', 'W11', 'D01', 'D27', 'W01', 'D08', 'D09'}
FORBIDDEN_VERBS = ['send', 'post', 'publish', 'schedule', 'deploy', 'merge', 'spend', 'purchase',
                   'account_change', 'credential_read', 'rotate', 'delete', 'canonical_write',
                   'push', 'commit']

READONLY_BASE = ['read_files', 'diff_sources', 'aggregate_counts', 'hash_files',
                 'git_readonly', 'check_ports_readonly', 'emit_receipt']
ROLE_EXTRAS = {'critic': ['run_validator'], 'analyst': [], 'terminal_readonly': ['list_processes_readonly'],
               'maker': ['write_local_artifact', 'run_local_test', 'run_validator'],
               'architect': ['write_proposal'], 'never': None}
EXEC_CAPS = {r: ([] if e is None else sorted(set(READONLY_BASE + e))) for r, e in ROLE_EXTRAS.items()}

# ===========================================================================
# DELEGATED AUTONOMY v1 POLICY  (new operating decisions, 2026-08-12)
# ===========================================================================
# Budget and timeout by capability class. Conservative: a read-only class gets
# the least, a maker the most. A bench-defined canonical value always wins.
ROLE_BUDGET = {'terminal_readonly': (4000, 300), 'analyst': (8000, 600), 'critic': (8000, 900),
               'architect': (12000, 900), 'maker': (16000, 1800), 'never': (0, 0)}

# Freshness window by cadence, in hours. One cadence period plus slack.
CADENCE_WINDOW_HOURS = {'daily': 26, 'weekly-twice': 96, 'weekly': 192, 'monthly': 768, 'event': 6}

# Retry by class. Cheap read-only work may retry more; expensive work retries less.
ROLE_RETRY = {
    'terminal_readonly': {'max_attempts': 3, 'backoff_seconds': [60, 300, 900]},
    'analyst':           {'max_attempts': 3, 'backoff_seconds': [60, 300, 900]},
    'critic':            {'max_attempts': 3, 'backoff_seconds': [60, 300, 900]},
    'architect':         {'max_attempts': 2, 'backoff_seconds': [120, 600]},
    'maker':             {'max_attempts': 2, 'backoff_seconds': [120, 600]},
    'never':             {'max_attempts': 0, 'backoff_seconds': []},
}

# Freshness probe per routine. Determines WHAT the stale-source gate measures.
#   vault_notes        newest .md under 12_Brain
#   registry_state     newest file under 12_Brain/state
#   repo_state         git working-tree state of dillon-os
#   canonical_queue    read-only mtime of client-operations queue
#   automation:<id>    12_Brain/state/<id>.json written by a registered automation
#   external_connector NOT locally probeable -> gate fails closed, by design
# Probe classes: vault_notes / registry_state / automation:* are SNAPSHOT probes where
# staleness is real. repo_state and canonical_queue are LIVE probes read at execution
# time, so they report what was observed rather than aging a pointer.
# 2026-08-18: D24, W05, and W08 previously probed 'automation:maker-checker',
# 'automation:site-factory-batch', and 'automation:experiment-queue'. No code in
# the repo writes a state file for any of those three ids, so 12_Brain/state/<id>.json
# never existed, G5_stale_source failed closed on every cycle, and all three
# routines were permanently unrunnable rather than merely waiting on an upstream
# run. Repointed to sources that actually exist and reflect what each routine
# reads: D24 (release QA) -> repo_state, a live working-tree read; W05 (radar
# website factory) -> the radar's own last-sweep state; W08 (experiment review) ->
# vault_notes, since experiments live as notes under 12_Brain/05_Projects/Experiments.
# Dedupe bucket per cadence. Before 2026-08-18 every cadence used {yyyy-mm-dd},
# so weekly routines ran 7x and monthly routines ~30x their declared intent.
CADENCE_BUCKET = {
    'daily': '{yyyy-mm-dd}',
    'weekly': '{yyyy-Www}',
    'weekly-twice': '{yyyy-Www}{A|B}',
    'monthly': '{yyyy-mm}',
    'event': '{yyyy-mm-dd}',
}

FRESHNESS_PROBE = {
    'D03': 'registry_state', 'D07': 'registry_state', 'D12': 'repo_state',
    'D10': 'canonical_queue', 'D11': 'canonical_queue', 'D13': 'repo_state',
    'D14': 'automation:aeo-trust-gate', 'D16': 'vault_notes',
    'D17': 'external_connector', 'D18': 'external_connector',
    'D19': 'automation:report-brain-ingest', 'D24': 'repo_state',
    'D25': 'canonical_queue', 'D26': 'vault_notes',
    'W04': 'vault_notes', 'W05': 'automation:radar-last',
    'W06': 'external_connector', 'W08': 'vault_notes',
    'W09': 'registry_state', 'W10': 'canonical_queue', 'W11': 'vault_notes',
    'M02': 'vault_notes', 'M03': 'registry_state', 'M04': 'vault_notes',
    'M05': 'vault_notes', 'E04': 'external_connector', 'E05': 'repo_state',
    'E10': 'registry_state', 'E11': 'vault_notes',
}
# Checkpoint: the 9 routines with a registered automation keep it; every other
# Claude-executable routine gets a dedicated Claude checkpoint path.
AUTOMATION_CHECKPOINT = {'W05': 'site-factory-batch', 'D24': 'maker-checker', 'D19': 'report-brain-ingest',
                         'W06': 'report-brain-ingest', 'D04': 'daily-communications-brain',
                         'D05': 'daily-communications-brain', 'W08': 'experiment-queue',
                         'D14': 'aeo-trust-gate', 'W11': 'obsidian-guard-dog'}
SCHEDULE_CARDS = {'W05': 'Mondays 09:00', 'W02': 'Tuesdays 09:36', 'W03': 'Fridays 09:36',
                  'D19': 'weekdays 10:36', 'W06': 'Mondays 09:36', 'D09': 'weekdays 09:36',
                  'D27': 'weekdays 17:36', 'W01': 'Mondays 09:36', 'W10': 'Fridays 16:36',
                  'M03': '1st monthly 10:36'}


def role_of(rid):
    for role, ids in CLAUDE_ROLE.items():
        if rid in ids:
            return role
    raise SystemExit(f'FATAL: {rid} unassigned')


def tier_of(rid):
    return 2 if rid in TIER2 else (1 if rid in TIER1 else 0)


def prov(state, source, note=None):
    d = {'state': state, 'source': source}
    if note:
        d['note'] = note
    return d


records = []
for r in routines:
    rid, owner = r['id'], r['owner_bot']
    role, tier = role_of(rid), tier_of(rid)
    executable = role != 'never'
    b = BENCH.get(owner)

    # budget / timeout: canonical bench value wins, else delegated by role class
    if b:
        budget, timeout = b[0], b[1]
        budget_prov = prov('canonical', 'grok-specialist-bench.md default budget')
        timeout_prov = prov('canonical', 'grok-specialist-bench.md timeout')
    else:
        budget, timeout = ROLE_BUDGET[role]
        budget_prov = prov(DELEGATED, f'role class {role}: conservative v1 ceiling')
        timeout_prov = prov(DELEGATED, f'role class {role}: conservative v1 timeout')

    # freshness
    probe = FRESHNESS_PROBE.get(rid)
    if executable and probe:
        freshness = {'probe': probe, 'window_hours': CADENCE_WINDOW_HOURS[r['cadence']],
                     'fail_closed': True}
        fresh_prov = prov(DELEGATED, f"cadence {r['cadence']} window plus slack; probe {probe}")
    elif executable:
        freshness = {'probe': 'external_connector', 'window_hours': CADENCE_WINDOW_HOURS[r['cadence']],
                     'fail_closed': True}
        fresh_prov = prov(DELEGATED, 'no local probe assigned; fails closed until one is')
    else:
        freshness = None
        fresh_prov = prov('not_applicable', 'routine is never Claude-owned')

    # retry
    retry = ROLE_RETRY[role] if executable else None
    retry_prov = prov(DELEGATED, f'role class {role}') if executable else prov('not_applicable', 'never Claude-owned')

    # checkpoint
    auto = AUTOMATION_CHECKPOINT.get(rid)
    if auto:
        ckpath = f'12_Brain/state/{auto}.json'
        ck_prov = prov('derived', f'12_Brain/registry/automations.json id={auto}')
    elif executable:
        ckpath = f'12_Brain/state/claude-routines/{rid}.json'
        ck_prov = prov(DELEGATED, 'dedicated Claude routine checkpoint, created on first run')
    else:
        ckpath = None
        ck_prov = prov('not_applicable', 'never Claude-owned')

    caps = EXEC_CAPS[role]
    records.append({
        'routine_id': rid, 'name': r['name'], 'module': ROUTINE_MODULE[rid],
        'cadence': r['cadence'], 'trigger': r['trigger'],
        'source_freshness': freshness,
        'owner_bot': owner,
        'owner_class': 'cadence_bot' if owner in CADENCE_BOTS else 'specialist',
        'claude_role': role, 'claude_may_execute': executable,
        'claude_never_reason': NEVER_REASON.get(rid),
        'executable_capabilities': caps, 'allowed_actions': caps,
        'forbidden_actions': FORBIDDEN_VERBS,
        'recorded_steps': r.get('steps', []), 'artifact': r['output'],
        'verifier': ('Codex acting as Marketing Chief'
                     if owner == 'Independent QA and Release Critic'
                     else 'Independent QA and Release Critic, then Codex acting as Marketing Chief'),
        'budget_tokens': budget, 'timeout_seconds': timeout,
        # The dedupe bucket must match the declared cadence, or the cadence is
        # decorative. Invoke-ClaudeLoop.ps1 computes the same buckets.
        'dedupe_key_pattern': f'{{client_id|internal}}:{CADENCE_BUCKET.get(r["cadence"], "{yyyy-mm-dd}")}:{rid}',
        'retry_policy': retry, 'approval_tier': tier, 'approval_boundary': r['approval_boundary'],
        'operating_stages': [s['key'] for s in OPERATING_STAGES],
        'stage_count': len(OPERATING_STAGES), 'receipt_fields': RECEIPT_FIELDS,
        'checkpoint_resume': ckpath,
        'escalation': 'Codex acting as Marketing Chief; at most one human gate per operating day',
        'value_signal': r['success_evidence'], 'schedule_card': SCHEDULE_CARDS.get(rid),
        'route': f'{ROUTINE_MODULE[rid]} / {owner} / {rid}',
        'provenance': {
            'module': prov('canonical', 'recording-ledger Fixture B module receipts table'),
            'cadence': prov('canonical', 'manifest.routines[].cadence'),
            'trigger': prov('canonical', 'manifest.routines[].trigger'),
            'owner_bot': prov('canonical', 'manifest.routines[].owner_bot'),
            'artifact': prov('canonical', 'manifest.routines[].output'),
            'recorded_steps': prov('canonical', 'manifest.routines[].steps (build stage only)'),
            'approval_boundary': prov('canonical', 'manifest.routines[].approval_boundary'),
            'value_signal': prov('canonical', 'manifest.routines[].success_evidence'),
            'operating_stages': prov('canonical', 'training-simulator/app.js stages[] + curriculum chain'),
            'stage_count': prov('canonical', 'recording-ledger "every routine sealed 9/9"'),
            'receipt_fields': prov('canonical', 'manifest.recording_policy.recording_finish_line'),
            'owner_class': prov('canonical', 'receipt "Operating team" cadence-bot list'),
            'claude_role': prov('derived', 'audit s5.2 + AGENT_PROTOCOL maker-checker separation'),
            'executable_capabilities': prov('derived', 'approval-tiers.md Tier 0 + automatic-work clause'),
            'allowed_actions': prov('derived', 'approval-tiers.md Tier 0 + automatic-work clause'),
            'forbidden_actions': prov('canonical', 'client-operations/AGENTS.md + approval-tiers.md Tier 2'),
            'verifier': prov('derived', 'grok-specialist-bench routing + never-approve-own-work'),
            'approval_tier': prov('derived', '12_Brain/protocols/approval-tiers.md'),
            'escalation': prov('canonical', 'curriculum s10 at most one human gate'),
            'dedupe_key_pattern': prov('derived', 'queue/work-items.json dedupeKey shape'),
            'schedule_card': prov('canonical' if rid in SCHEDULE_CARDS else 'not_scheduled',
                                  'receipt Live schedule cards'),
            'budget_tokens': budget_prov, 'timeout_seconds': timeout_prov,
            'source_freshness': fresh_prov, 'retry_policy': retry_prov,
            'checkpoint_resume': ck_prov,
        },
    })

by_owner = collections.defaultdict(list)
for rec in records:
    by_owner[rec['owner_bot']].append(rec)


def agent_contract(name, cls):
    owned = by_owner.get(name, [])
    b = BENCH.get(name)
    exec_ids = [r['routine_id'] for r in owned if r['claude_may_execute']]
    return {
        'agent': name, 'agent_class': cls,
        'departments': sorted({r['module'] for r in owned}),
        'contract_detail': 'bench-defined' if b else 'name-only',
        'purpose': b[2] if b else None,
        'required_startup': (b[3] if b else
                             ['resolve the exact routine record in this registry',
                              'resolve the client through client-operations/registry/clients.json',
                              'read the nearest AGENTS.md']),
        'outputs': b[4] if b else ['bounded artifact', 'evidence locators', 'receipt with the 9 receipt fields'],
        'agent_specific_prohibitions': b[5] if b else [],
        'forbidden_actions': FORBIDDEN_VERBS,
        'budget_tokens': b[0] if b else (max([r['budget_tokens'] for r in owned]) if owned else None),
        'timeout_seconds': b[1] if b else (max([r['timeout_seconds'] for r in owned]) if owned else None),
        'routines_owned': [r['routine_id'] for r in owned],
        'routines_claude_may_execute': exec_ids,
        'routines_claude_must_refuse': [r['routine_id'] for r in owned if not r['claude_may_execute']],
        'claude_instantiable': len(exec_ids) > 0,
        'executable_capabilities': sorted({c for r in owned for c in r['executable_capabilities']}),
        'approval_ceiling_observed': max([r['approval_tier'] for r in owned], default=0),
        'evidence_gate': {'operating_stages': [s['key'] for s in OPERATING_STAGES],
                          'receipt_fields': RECEIPT_FIELDS, 'privacy_state': 'redacted',
                          'external_action_attempted_default': 'none'},
        'escalation': 'Codex acting as Marketing Chief',
        'source_locators': [
            'agent-vault/notes/inbox/2026-08-11-grok-specialist-bench.md' if b else
            'agent-vault/notes/inbox/2026-08-11-grok-bot-dillon-operating-curriculum.md',
            'agent-vault/notes/inbox/2026-08-12-grok-operating-team-verification-receipt.md',
            'dillon-os/11_Agents/Rockbot Operating System/recorded-training/2026-08-11-grok-bot-recording-ledger.md',
        ],
        'provenance': {
            'agent': prov('canonical', 'receipt cadence-bot list' if cls == 'cadence_bot' else 'curriculum Specialist Bots'),
            'departments': prov('canonical', 'recording-ledger module table via owned routines'),
            'purpose': prov('canonical' if b else 'unresolved',
                            'grok-specialist-bench.md' if b else 'no purpose statement exists for this agent'),
            'budget_tokens': prov('canonical' if b else DELEGATED,
                                  'grok-specialist-bench.md' if b else 'max of owned routine ceilings'),
            'timeout_seconds': prov('canonical' if b else DELEGATED,
                                    'grok-specialist-bench.md' if b else 'max of owned routine timeouts'),
        },
    }


agents = ([agent_contract(n, 'cadence_bot') for n in CADENCE_BOTS] +
          [agent_contract(n, 'specialist') for n in SPECIALISTS])

unres = collections.Counter()
deleg = collections.Counter()
for rec in records:
    for f, p in rec['provenance'].items():
        if p['state'] == 'unresolved':
            unres[f] += 1
        elif p['state'] == DELEGATED:
            deleg[f] += 1

registry = {
    'schema_version': '3.0',
    'name': 'claude-operating-team',
    'purpose': ('Executable Claude-native reconstruction of the Grok Bot operating team, with '
                'delegated autonomy v1 operating limits. Clones capability, never authority.'),
    'generated_by': 'System/scripts/Build-ClaudeOperatingTeam.py',
    'authority': {
        'human': 'Dillon Mohr',
        'sole_orchestrator_and_canonical_writer': 'Codex acting as Marketing Chief',
        'claude_position': 'bounded specialist worker; never a parallel command center',
        'canonical_write_allowed': False, 'external_action_allowed': False,
        'autonomy_grant': DELEGATED,
        'autonomy_scope': ('unsupervised Tier 0 and bounded Tier 1 local work; every Tier 2 action, '
                           'external delivery, canonical write, deployment, and browser session excluded'),
    },
    'delegated_policy_v1': {
        'grant_id': DELEGATED,
        'granted_by': 'Dillon Mohr, 2026-08-12',
        'nature': 'NEW operating decisions chosen by Claude under delegation, not recovered history',
        'reviewable': True,
        'role_budget_timeout': {k: {'budget_tokens': v[0], 'timeout_seconds': v[1]} for k, v in ROLE_BUDGET.items()},
        'cadence_freshness_window_hours': CADENCE_WINDOW_HOURS,
        'role_retry': ROLE_RETRY,
        'freshness_probes': sorted(set(FRESHNESS_PROBE.values())),
        'fail_closed_rule': ('external_connector probes cannot be verified locally and therefore always '
                             'block; a connector outage is a blocked result, never synthetic success'),
        'delegated_field_counts': dict(deleg),
    },
    'departments': {m: {'routine_ids': ids, 'routines': len(ids),
                        'ledger_stages': LEDGER_MODULE_STAGES[m],
                        'stages_per_routine': LEDGER_MODULE_STAGES[m] // len(ids)}
                    for m, ids in MODULES.items()},
    'stage_model': {
        'unit': 'operating stage', 'stages_per_routine': 9,
        'operating_stages': OPERATING_STAGES, 'total_stages': len(records) * 9,
        'receipt_fields': RECEIPT_FIELDS, 'receipt_field_count': len(RECEIPT_FIELDS),
        'unit_warning': ('Three different 9s and one 272 exist. operating_stages (9) x 54 = 486 sealed '
                         'stages. receipt_fields (9) is the finish-line contract, NOT the stage unit. '
                         'manifest steps (272 total, 4-6 per routine) are the contents of the build stage.'),
        'provenance': prov('canonical', 'app.js stages[]; curriculum chain; ledger 9/9; DESIGN.md nine-stage track'),
    },
    'cadence_bots': CADENCE_BOTS, 'specialists': SPECIALISTS, 'agents': agents,
    'reconciliation_findings': [
        {'id': 'RF1', 'severity': 'medium', 'status': 'open',
         'finding': 'Grok Research Scout is 1 of 15 specialists but owns 0 of the 54 routines.',
         'evidence': 'manifest distinct owner_bot = 20; specialists(15) + cadence bots(6) = 21'},
        {'id': 'RF2', 'severity': 'high', 'status': 'resolved',
         'finding': '486 vs 272 was a unit conflation, not a false receipt. 54 x 9 operating stages = 486.',
         'evidence': 'app.js stages[] has 9 entries; ledger states every routine sealed 9/9; all six '
                     'module rows divide to exactly 9; manifest steps feed the build stage only'},
        {'id': 'RF3', 'severity': 'medium', 'status': 'resolved-by-delegation',
         'finding': f'Bench covers 6 of 15 specialists; {sum(1 for r in records if r["provenance"]["budget_tokens"]["state"] == DELEGATED)} routines now carry a delegated v1 ceiling.',
         'evidence': f'{sum(1 for r in records if r["provenance"]["budget_tokens"]["state"] == "canonical")} canonical, '
                     f'{sum(1 for r in records if r["provenance"]["budget_tokens"]["state"] == DELEGATED)} delegated'},
        {'id': 'RF4', 'severity': 'medium', 'status': 'resolved-by-delegation',
         'finding': 'Freshness windows and retry policies now exist for all 54 routines as delegated v1 values.',
         'evidence': 'no canonical source defined them; they are marked ' + DELEGATED},
        {'id': 'RF5', 'severity': 'low', 'status': 'resolved',
         'finding': 'Module membership IS recoverable from the recording ledger Fixture B table.',
         'evidence': 'six module ID sets partition all 54 routine IDs with no gap or overlap'},
    ],
    'unresolved_field_counts': dict(unres),
    'routines': records,
}

with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(registry, f, indent=2, ensure_ascii=False)
    f.write('\n')

disc = {
    'schema_version': '1.0',
    'question': 'What does 486 mean, and are 214 stages missing?',
    'verdict': 'RESOLVED. 486 is real and verified. Nothing is missing. 486 and 272 are different units.',
    'arithmetic': {'routines': 54, 'operating_stages_per_routine': 9, 'product': 486,
                   'manifest_steps_total': sum(len(r.get('steps', [])) for r in routines),
                   'difference': 486 - sum(len(r.get('steps', [])) for r in routines),
                   'difference_explanation': ('Not missing stages. manifest steps are the recorded actions '
                                              'inside the single build stage; the other 8 stages carry no '
                                              'manifest steps. Subtracting the two units is a category error.')},
    'evidence_chain': [
        {'id': 'E1', 'claim': 'The stage unit has exactly 9 members.',
         'source': '11_Agents/Rockbot Operating System/training-simulator/app.js lines 3-13',
         'quote': 'const stages = [ sense, route, prioritize, build, verify, approve, deliver, readback, learn ]',
         'verification': 'parsed programmatically; 9 entries asserted at build time'},
        {'id': 'E2', 'claim': 'The 9 stages are the documented operating chain.',
         'source': 'recorded-training/2026-08-11-grok-bot-dillon-operating-curriculum.md line 18',
         'quote': 'sense -> route -> prioritize -> build -> verify -> approve -> deliver -> read back -> learn',
         'verification': '9 links, identical order and keys to E1'},
        {'id': 'E3', 'claim': 'Every routine sealed 9 of 9 stages.',
         'source': 'recorded-training/2026-08-11-grok-bot-recording-ledger.md routine status table',
         'quote': 'every routine sealed 9/9; privacy redacted; external action false; canonical write false',
         'verification': 'stated for all four cadence bands D01-D27, W01-W11, M01-M05, E01-E11'},
        {'id': 'E4', 'claim': 'Module stage totals divide to exactly 9 per routine.',
         'source': 'recording-ledger Fixture B module receipts + verification receipt Routine proof',
         'quote': '108/12, 117/13, 90/10, 72/8, 36/4, 63/7 all equal 9; total 54/54 and 486/486 SEALED',
         'verification': 'arithmetic checked on all six modules independently'},
        {'id': 'E5', 'claim': 'The simulator seals a receipt only after nine stages pass.',
         'source': 'training-simulator/DESIGN.md',
         'quote': 'a nine-stage track ... It seals only after all nine stages pass',
         'verification': 'independent design document, same stage count'},
        {'id': 'E6', 'claim': 'manifest steps belong to the build stage only.',
         'source': 'training-simulator/app.js actionModel build branch',
         'quote': 'build: { steps: routine.steps }',
         'verification': 'only the build stage consumes routine.steps'},
        {'id': 'E7', 'claim': 'An independent Codex rollout recorded the same total.',
         'source': 'evidence/codex-rollouts/2026-08-11T20-57-22-N9CM-grok_bot_operating_team_setup_blocked_on_consent_and_ios.md',
         'quote': 'Verified 54 learned workflows across 486 stages, 6 cadence Bots, 15 specialist agents, and 12 schedule cards.',
         'verification': 'separate artifact, separate author, same figure'},
    ],
    'searched_and_negative': [
        {'scope': 'dillon-os, agent-vault, client-operations, .grok, .codex/memories literal "486"',
         'result': 'only the ledger, receipt, codex rollout, this registry, and unrelated binary files'},
        {'scope': 'git grep across 347 local and remote refs, no checkout, plus git log --all -S486',
         'result': 'no Grok stage artifact on any ref; only unrelated hits'},
        {'scope': 'grep stage_id|stage_run|per-stage|stageRun across all 347 refs',
         'result': 'one false positive in an unrelated SQL migration; no per-stage logging schema exists'},
        {'scope': 'authenticated GitHub read-only: gh search issues 486; branch enumeration',
         'result': 'zero issues or PRs referencing 486; 100 branches enumerated; no stage artifact'},
    ],
    'prior_claim_assessment': {
        'phase2_claim': '486 = 54 x the 9 recording finish-line receipt fields',
        'assessment': 'WRONG NAMES, RIGHT COUNT. Two distinct canonical 9-member sets exist.',
        'consequence_if_uncorrected': 'a verifier would check receipt formatting instead of the execution chain',
        'corrected_in': 'registry schema 2.0+; operating_stages and receipt_fields are separate fields',
    },
    'residual_unsupported_claims': [
        {'claim': 'Fixture B replay actually executed all 486 stages',
         'status': 'attested-not-reproducible',
         'requirement_to_verify': 'per-stage replay logs for each of the 54 routines; none exist locally or on any ref',
         'missing_identifiers': 'stage-level run IDs, per-stage timestamps, per-stage pass records'},
    ],
}
with open(LEDGER_OUT, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(disc, f, indent=2, ensure_ascii=False)
    f.write('\n')

print('registry :', os.path.getsize(OUT), 'bytes')
print('routines :', len(records), '| stages:', len(records) * 9, '| agents:', len(agents))
print('delegated fields  :', dict(deleg))
print('unresolved fields :', dict(unres) if unres else '{} - none')
print('budgets: canonical', sum(1 for r in records if r['provenance']['budget_tokens']['state'] == 'canonical'),
      '| delegated', sum(1 for r in records if r['provenance']['budget_tokens']['state'] == DELEGATED))
print('freshness probes  :', dict(collections.Counter(
    (r['source_freshness'] or {}).get('probe', 'n/a') for r in records)))
