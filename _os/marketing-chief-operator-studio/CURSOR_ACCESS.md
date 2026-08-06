# Cursor access handoff

This directory is a source snapshot of the private Marketing Chief Operator
Studio deployed at:

https://dillon-marketing-chief.dillonmohr8777.chatgpt.site

## Provenance

- Sites project: `appgprj_6a61488852308191ba5cfb03ff59178f`
- Deployed Sites version: 14
- Canonical source commit: `72df5db1fc71398bcfb983586564bbd856079371`
- Snapshot imported into `dillon-os`: 2026-07-24

The live ChatGPT Site remains private to Dillon's OpenAI account. This snapshot
exists so Cursor can inspect, test, and propose code changes through the private
`dillon-os` repository without receiving an OpenAI session, bypass credential,
or other secret.

## Working rules

- Treat the ChatGPT Site and its Sites source repository as canonical.
- Treat this directory as a synchronized collaboration snapshot until a
  deliberate source-of-truth migration is approved.
- Never commit site bypass tokens, OpenAI sessions, Windows bridge credentials,
  raw Gmail or Slack content, direct client contacts, or access locators.
- Keep client records separated.
- Use a branch and pull request for changes.
- Do not deploy, publish, send, spend, rotate credentials, or perform canonical
  queue writes without Dillon's separate explicit approval.
- Run `npm ci`, `npm run lint`, and `npm test` before proposing changes.

