---
tags: [decision]
decided: 2026-08-17
status: active
supersedes:
source: "[[12_Brain/raw/research/2026-08-17 Honeycove Seedance Roundup Receipts]]"
updated: 2026-08-17
expires: 2026-11-17
---

# Institute Seedance 2.5 plus gated Krea 2 and Mistral OCR 4

**Decision:** Bring the Honeycove roundup's useful tools in as skills,
not as installs. `/seedance` is the production-adjacent video skill.
`/krea-2` fills thin harvests. `/mistral-ocr` reads PDFs only when a
key exists. Qwen-AgentWorld, Ornith 1.0, and GPT-5.6 stay watch-only.

**Why:** Dillon flagged Seedance 2.5 as the one to bring in. Official
Seed facts (30s one-take, 30/10/10 refs) are real. Higgsfield already
sits in the AI Video Outreach plan, but this session's MCP is
`needsAuth` and the live enum is 720p, not the 4K headline. Krea and
OCR help existing lanes (site factory, FDD PDFs) without a new MCP.
35B/12B weight downloads and coding-model swaps do not.

**Implications:**

- Skills live at `.claude/skills/seedance/`, `.claude/skills/krea-2/`,
  `.claude/skills/mistral-ocr/`.
- Prompt drafts are Tier 0. Higgsfield auth, Krea API, Mistral pages,
  Jimeng/BytePlus keys, and any publish are Tier 2.
- Do not claim 4K as the live Seedance 2.5 path.
- Do not download Krea 2 or AgentWorld weights onto this VM.
- Do not open a new video MCP; Higgsfield is already registered and
  still ungated. New MCPs still go through `mcp-gate.js`.

**Not chosen:** installing Jimeng CLI, authenticating Higgsfield from
this session, swapping the coding model for Ornith or AgentWorld, or
folding generative video into `/motion-design`.
