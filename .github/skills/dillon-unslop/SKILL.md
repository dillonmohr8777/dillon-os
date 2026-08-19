---
name: dillon-unslop
description: Cut AI tells from client copy, ads, emails, blogs, and landing-page prose in a diff or draft. Use on copy reviews and unslop, de-AI, or tighten-the-writing requests.
---

# Dillon unslop

Copilot-facing wrapper around `.claude/skills/unslop/SKILL.md`. Read that file and run the scan.

1. Read `System/writing-rules.md`. House style wins.
2. Only rewrite agent-authored prose. Keep harvested client nouns and pre-approved ad libraries.
3. Do not rewrite `12_Brain/01_Captures/`, skills, or live published copy in place.
4. Do not invent facts to make the writing sound more human.
5. Do not send, publish, or deploy the cleaned draft.

Source: pstack `unslop` (MIT), adapted for Dillon OS.
