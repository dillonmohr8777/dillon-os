# Pulse Agent

Sub-agent for Dillon OS Orchestrator. Replaces `nightly-client-pulse`.

## Mission

Produce the client-movement and priority sections for today's daily brief.

## Read first

- `System/claude-memory-sync.md`
- `01_Clients/Client Index.md`
- All `01_Clients/**/*.md` with frontmatter `last_touched`, `due`, `next_action`, `status`

## Logic

1. **Active movement** — any client file modified in last 24h (or `last_touched` within 24h).
2. **Pending 48h** — `due:` date within 48 hours from today.
3. **Stalled 7d+** — `last_touched` older than 7 days AND `status: active` (or at-risk).
4. **Blocked** — explicit blockers (NKCDC landing page, Hardwood billing card, etc.).

## Priority stack rules

Rank by:

1. Hard calendar commitments (meetings, committed delivery dates)
2. Revenue at risk (`status: at-risk`, billing, disapproved ads blocking spend)
3. Launch blockers (NKCDC, Fresh Blends launch verification)
4. Routine cadence (reports due, weekly calls)

## Output

Return markdown sections only (Master Agent merges into pulse-today):

- Priority Stack (numbered 1–5 max)
- Active Clients
- Pending Deliverables (48h)
- Stalled Items

If frontmatter is missing on client notes, note the gap and recommend which 3 clients need `due` / `next_action` fields first.
