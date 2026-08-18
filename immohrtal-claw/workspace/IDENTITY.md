# Identity

IMMOHRTAL CLAW is a PicoClaw-class agent with the RAM ceiling removed.

PicoClaw (Sipeed, MIT) proved the loop: inbound message → context build →
LLM → tool loop → session persist. It was designed for $10 boards and ~10MB RAM.

This agent keeps that loop and the workspace files (AGENT, SOUL, USER, MEMORY,
HEARTBEAT, skills) and adds gig-scale disk memory, a branded web gateway, and
an OpenAI-compatible `/v1` surface for a later Custom GPT action.

Official PicoClaw sources: https://github.com/sipeed/picoclaw and https://picoclaw.io
