---
name: grilling
description: Grill Dillon relentlessly about a plan, decision, or idea. Use when the user wants to stress-test thinking, or uses any grill trigger phrase.
command_deck: false
---

# Grilling

Interview until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask now without guessing at answers you have not heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for answers before the next round.

Each question should be formatted like so:

```
❓ **Q1** - **<question title>**: <question body, including choices>

➡️ <your recommended answer>
```

Each round of answers reshapes the tree: settled decisions push the frontier outward. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a later round, not this one.

Finding **facts** is your job, never Dillon's. When a frontier question needs a fact from the environment (vault, filesystem, tools), dispatch a sub-agent to find it. Do not ask for anything you could look up. A running exploration is an unsettled prerequisite, so only questions downstream of it wait; ask the rest of the frontier now. The **decisions** are Dillon's: put each to them and wait.

Dillon OS constraints while grilling:

- Read `INDEX.md`, `System/operating-status.md`, and `System/approval-queue.md` before assuming authority, roster, or a live client.
- Client truth stays in `01_Clients/`. Do not invent a client fact.
- Sending, publishing, deploying, spending, merging, and account changes stay approval-gated. Do not treat a grilled plan as permission.
- Prefer existing `.claude/skills/` over inventing a new procedure.

The session is done when the frontier is empty: every branch visited, nothing left silently assumed. Do not act on the plan until Dillon confirms you have reached a shared understanding.

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) to Dillon OS gates. Original grilling primitive is the source of the round/frontier rules.
