---
tags: [concept, pattern]
source: "[[12_Brain/raw/2026-06-26 - intel-core-7-master-operating-transfer]]"
updated: 2026-07-04
---

# Google Docs Sharding Pattern

**Summary:** to hand a large corpus to any Docs-reading agent, shard it into sub-megabyte plain-text files, import each as a native Doc, and bind the family with one index doc under a stable title prefix.

Proven on the old machine (66 native Docs, prefix `Dillon OS Hermes Orgo Vault -`):

1. Build a local package + manifests first.
2. Shard into sub-megabyte `text/plain` `.txt` files (the Drive connector rejects `text/markdown`).
3. Import each shard as a **native Google Doc**.
4. Create one index doc naming shard order, source roots, manifests, and SHA-256 hashes.
5. Use a stable title prefix so the whole family is recoverable by Drive search.
6. Index sensitive/browser state instead of flattening it into the corpus.

## Links
- [[12_Brain/entities/Codex Workspace (Legacy)|Codex Workspace (Legacy)]] · [[12_Brain/entities/Hermes|Hermes]]
