---
note_type: research_intake
status: reviewed
source_platform: TikTok
source_creator: GigaQian
source_handle: "@gigaqian"
source_video_id: "7659929804635983117"
reviewed_at: 2026-08-12
tags: [claude, j-space, reasoning, prompting, research]
---

# TikTok review: Claude J-space and prompting

## Source

- User-supplied short link: https://www.tiktok.com/t/ZP8n7kVTD/
- Resolved video: https://www.tiktok.com/@gigaqian/video/7659929804635983117
- Creator: GigaQian (`@gigaqian`)
- Runtime: approximately 2 minutes 52 seconds
- Caption source: TikTok automatic speech recognition, reviewed 2026-08-12
- Volatile engagement observed 2026-08-12: approximately 23.6K plays,
  2,077 likes, 91 comments, 723 saves, and 239 shares

This record is a source-linked paraphrase and assessment, not a copied
transcript or a claim that engagement proves accuracy.

## What the video argues

The video introduces Anthropic's research on a latent neural-activation space
called J-space. It connects that work to global workspace theory and describes
J-space as an emergent internal workspace used during some multi-step
reasoning. It also says Anthropic's Jacobian lens can identify activation
patterns associated with later outputs and inspect how information is routed.

The practical section recommends prompts that encourage deliberate reasoning,
scratchpad use, intermediate steps, collaborative framing, and meta-questions
about the considerations the model is weighing. The video ends more carefully
than it begins: it says consciousness should not be claimed without stronger
proof.

## Primary-source verification

Anthropic's official research page supports these narrower claims:

- Researchers found an emergent activation space they call J-space.
- J-space is distinct from a written chain-of-thought scratchpad.
- It appears especially relevant to some higher-order and multi-step tasks.
- The Jacobian lens is an early interpretability method and is imperfect.
- Functional similarities to a global workspace do not establish phenomenal
  consciousness.

Official source:
https://www.anthropic.com/research/global-workspace

## Assessment

### Keep

- Give Claude a clear objective, context, constraints, and success criteria.
- For complex work, direct Claude to plan before acting and to reassess after
  important tool results.
- Ask for the decision factors, assumptions, evidence, checks, and uncertainty
  needed to audit the result.
- Use collaborative language that explains why a constraint matters.

### Modify

- Replace requests to "think out loud" or reveal hidden chain-of-thought with
  requests for a concise decision log and verifiable work artifacts.
- Use an external scratch file only when the task benefits from a durable plan,
  calculation, checklist, or handoff artifact. Do not treat it as access to the
  model's hidden neural reasoning.

### Reject

- Do not treat J-space as proof that Claude is conscious.
- Do not say the researchers forced Claude to evolve consciousness.
- Do not infer model reliability from a compelling internal explanation. The
  artifact and checks remain the acceptance evidence.

## Implication for Dillon's agent system

The useful operational change is a deliberation contract:

1. Retrieve the exact current sources.
2. Plan internally before consequential execution.
3. Reassess when tool output changes the facts.
4. Return a concise decision log: assumptions, options, evidence, checks,
   uncertainty, approval state, and next action.
5. Never substitute hidden-reasoning claims for source-linked verification.

