---
name: client-pulse
description: Sweep 01_Clients for movement, stalls, and due-soon work — writes the pulse report to Daily-Briefs/pulse-today.md.
---

# Client Pulse

Sweep the client roster for state changes. Work only from this vault.

1. For every client under `01_Clients/`: last-modified time, any `due` /
   `next_action` / `last_touched` frontmatter, and open `- [ ]` tasks inside.
2. Classify each client: **moving** (touched < 48h), **watch** (2–7 days),
   **stalled** (7+ days untouched).
3. Note anything due within 48 hours.

Overwrite `Daily-Briefs/pulse-today.md` with:

- **Coverage notes** — what was scanned and any blind spots
- **Moving** / **Watch** / **Stalled** — client, evidence, suggested next touch
- **Due in 48h** — hard list
- **Tomorrow's priority stack** — ranked 1–3 with one-line reasons

Match the tone of the existing pulse reports: blunt, evidence-based, and honest
about data gaps (e.g., missing frontmatter that prevents a section from populating).
