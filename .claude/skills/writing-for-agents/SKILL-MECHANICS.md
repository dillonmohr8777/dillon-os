# Skill mechanics

The skill-specific branch of writing-for-agents: frontmatter, invocation, and routers.

## Invocation

- **Model-invoked** — keep a `description` with trigger branches. The agent can fire it, and other skills can reach it. Permanent context load in exchange for discoverability.
- **User-invoked** — set `disable-model-invocation: true`. The description becomes a one-line human summary. Zero context load. Only Dillon typing the name can invoke it.

Pick model-invocation only when the agent must reach the skill on its own, or another skill must.

## Command Deck

Dillon OS HUD lists `.claude/skills` as one-click jobs. Interactive or session skills set `command_deck: false` so they are not launched headlessly.

## Router skills

When user-invoked skills multiply, one router names the others and when to reach for each. A router can only hint. It cannot fire a user-invoked skill.

`ask-dillon-skills` is the router for this repo.
