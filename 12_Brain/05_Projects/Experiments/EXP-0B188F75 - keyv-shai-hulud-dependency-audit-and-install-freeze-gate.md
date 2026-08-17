---
note_type: project
project_kind: experiment
experiment_id: EXP-0B188F75
status: proposed
experiment_stage: intake
created: 2026-08-04
updated: 2026-08-04
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for Keyv/Shai-Hulud dependency audit and install freeze gate without weakening safety or existing capability."
next_action: "Sandbox CI on fixture repo: lockfile/IOC scan reports zero malicious versions from published list; npm ci with ignore-scripts succeeds; attempt to resolve known-bad keyv@6.0.0 is blocked or fails closed; no network exfil artifacts in dry-run."
review_on: 2026-08-04
verification_status: unverified
risk: low
source_refs:
  - "https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack"
  - "https://www.aikido.dev/blog/keyv-and-friends-compromised-in-npm-supply-chain-attack"
tags:
  - brain
  - project
  - experiment
  - automation
---

# Keyv/Shai-Hulud dependency audit and install freeze gate

## Why this may matter

Active 2026-08-04 npm worm steals CI/cloud/GitHub/AI secrets and plants Claude/VS Code hooks; factory agents routinely install packages.

## Expected benefit

Prevent credential compromise and poisoned previews; protect 25-site pipeline integrity.

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Second agent or human compares npm ls/lockfile against Wiz IOC CSV and confirms no lifecycle scripts executed.
- **Acceptance test:** Sandbox CI on fixture repo: lockfile/IOC scan reports zero malicious versions from published list; npm ci with ignore-scripts succeeds; attempt to resolve known-bad keyv@6.0.0 is blocked or fails closed; no network exfil artifacts in dry-run.
- **Rollback:** Restore previous lockfile and known-good cache; rebuild containers from clean base.
- **Human gate:** true
- **Overlap:** Extends existing CI/preview safety; may overlap simple npm audit but adds worm-specific IOCs and script policy.

## Evidence

- https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack
- https://www.aikido.dev/blog/keyv-and-friends-compromised-in-npm-supply-chain-attack

## Run history

- 2026-08-04: Added from Grok intelligence intake. No software installed or account authorized.
