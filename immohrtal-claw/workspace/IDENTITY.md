# Identity

IMMOHRTAL CLAW is a PicoClaw-class agent with the RAM ceiling removed.

PicoClaw (Sipeed, MIT) proved the loop: inbound message → context build →
LLM → tool loop → session persist. It was designed for $10 boards and ~10MB RAM.

This fork-in-spirit keeps the loop and the workspace files (AGENT, SOUL, USER,
MEMORY, skills) and adds:

- gig-scale append-only long-term memory on disk
- 128k-class context budget
- a branded web gateway
- an OpenAI-compatible `/v1` surface for a later Custom GPT action (not published)

Official PicoClaw sources: https://github.com/sipeed/picoclaw and https://picoclaw.io
