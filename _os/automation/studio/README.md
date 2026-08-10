# radar-studio

Daily production system for Prospect Radar composited scroll-world homepage concepts. One command researches the day's prospects into shape briefs; a human approves the batch (hash-pinned); a second command builds, QAs, and evaluates the sites. Local-first, resumable, fail-closed: **nothing here sends outreach, and publishing stays disarmed until `arm` writes an explicit scoped authority file.**

## Daily flow

```
node bin/radar-studio.mjs doctor                 # environment gate (never prints secrets)
node bin/radar-studio.mjs run-daily --count 20   # research phase -> reviewer page
# open the printed reviewer page, uncheck rejects, run the printed approve command
node bin/radar-studio.mjs run-daily --phase build --run YYYY-MM-DD
node bin/radar-studio.mjs status                 # progress + quarantines
node bin/radar-studio.mjs resume                 # continue an interrupted run
```

State lives in SQLite (WAL) under `%LOCALAPPDATA%\prospect-radar-studio` — never OneDrive. Every stage is an immutable attempt row keyed by a Merkle input hash; re-running a phase memo-hits verified work, so a crash anywhere costs one stage, not the day. LLM calls run headless `claude -p` with strict fenced-JSON contracts, ajv schemas, and hard gates (no em dashes, 1,100–1,700 words, chapter/state arcs, font-pool-only picks, design-signature divergence vs. the last 30 days).

## Layout

- `bin/radar-studio.mjs` — CLI: doctor, run-daily, resume, approve, status, arm/disarm; rollback/verify-live land with the deploy milestone; register-schedule refuses until the measured capacity run.
- `core/` — paths, db (node:sqlite, zero native deps), stage machine (leases, memoization, manifests), scheduler (lanes + budgets), claude-invoke (stdin prompt, strict JSON, tree-kill, response cache), run-daily orchestration.
- `stages/` — research phase (intake → research → logo → brief → reviewer page) and build phase (copy → fonts → images → worldspec → assemble → build → static QA → browser QA → eval → report).
- `prompts/` — the five stage contracts (research, brief, copy, worldspec, eval) + the worked germantown example.
- `config/` — studio.config.json (lanes, budgets, thresholds) and font-pool.json (14 OFL families; the reflex-reject list is absent by construction).
- `test/` — core unit tests plus the fixture smoke harness (`inject-fixture-run.mjs`), which drives the full deterministic path with zero LLM calls.
- `approvals/` — hash-pinned batch approvals (committed; the build phase refuses briefs whose hash moved after approval).

The engine consumed by builds is `_templates/scroll-engine` (see its README and `engine.version.json` provenance).

## Current blockers (2026-08-10)

1. **Headless `claude -p` is logged out on this machine** (desktop-app auth is separate). Run `claude` in a terminal once and `/login`. Until then research/copy/worldspec/eval stages quarantine honestly.
2. **Image provider undecided** (gpt-image-1 API vs Higgsfield credits). The `images` stage ships with the placeholder adapter; the brief's image_plan already carries final prompts, so switching providers re-runs only that stage.

## Verified so far

Fixture smoke run (germantown-derived data, slug `fixture-*`, never a deliverable): approval pin → memo-hits → per-brand fonts (Oswald + Source Sans 3 downloaded, ledgered, rendered) → placeholder plates (sharp) → config serialization → vite build → static QA PASS → browser QA 6/6 (desktop, mobile, reduced-motion, forced-fallback, WebGL real under SwiftShader) → eval quarantined on the auth blocker exactly as designed. Engine v0.2.1.
