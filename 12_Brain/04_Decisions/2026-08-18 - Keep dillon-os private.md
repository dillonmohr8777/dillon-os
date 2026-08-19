---
tags: [decision, github, privacy]
decided: 2026-08-18
status: active
supersedes: ""
source: "[[12_Brain/01_Captures/2026-08-19 - request to make dillon-os public]]"
updated: 2026-08-19
note_type: decision
created: 2026-08-19
review_on: 2026-09-18
owner: Dillon Mohr
source_refs:
  - "[[CLAUDE.md]]"
  - "[[AGENTS.md]]"
  - "[[12_Brain/INDEX.md]]"
  - "_os/test/public-safety.test.js"
  - "[[12_Brain/01_Captures/2026-08-19 - request to make dillon-os public]]"
  - "[[12_Brain/01_Captures/2026-08-19 - claude dual machine full access]]"
  - "[[12_Brain/01_Captures/2026-08-19 - dillon-os briefly public then reverted]]"
  - "[[04_SOPs/Claude Dual Machine Access]]"
---

# Keep dillon-os private

Keep `dillonmohr8777/dillon-os` **private** while client evidence, comms,
transcripts, and reports live in the tracked vault.

**Why:** On 2026-08-18 the repository went private so the brain layer could
hold client evidence. `_os/test/public-safety.test.js` still hard-fails
secrets, but treats client PII and private paths as advisory **because the
repo is private**. Flipping visibility to public would publish that tree to
the internet, including third-party client material the clients did not
consent to release.

**Implications:**

- Do not change GitHub visibility on `dillon-os`.
- Credentials and access inventories stay in gitignored `12_Brain/private/`.
- A public Dillon OS, if wanted, is a **sanitized fork** (opensource forker /
  sanitizer / packager), not a visibility toggle on this vault.
- A 2026-08-19 operator request to make this repo public does **not**
  supersede this decision.
- Claude Code on both operator machines gets full tool access from tracked
  `.claude/settings.json` (`bypassPermissions`) plus `gh auth login` on each
  machine. That is the access path. Publishing the vault is not.
- 2026-08-19T19:14Z: the repo was observed **public** (unauthenticated HTTP
  200). It was set **private** again the same minute. See
  [[12_Brain/01_Captures/2026-08-19 - dillon-os briefly public then reverted]].

**Review:** Revisit only if client evidence is removed from Git or a
sanitized public fork is the actual deliverable.
