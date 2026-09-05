---
name: aeo-report
description: Pull live AI-visibility and search-visibility facts for a client from OpenRush and Abency and render an AEO report — into the client's existing client-report HTML flow if it has one, markdown otherwise. Use for an AEO audit, an AI-visibility check, or "are we showing up in AI answers" for a named client.
---

# AEO Report

Turns a client slug and domain into a sourced AI-visibility and search-
visibility snapshot. Every number keeps the provenance it was pulled with —
this is a citation-carrying report, not a summary.

## When to use

Client slug + domain, asked for AEO/AI-visibility standing, or adding an AEO
section to an existing monthly [[.claude/skills/client-report|client-report]].
Not for a brand-new prospect with no domain history — that's
[[.claude/skills/site-grade|site-grade]] / radar-operator territory.

## Inputs

- Client slug (matches its `01_Clients/<Client>/` folder and, if present, its
  Abency brand).
- Domain.

## Steps

1. **Preflight.** Per [[12_Brain/protocols/Connector Preflight]]: OpenRush and
   Abency are both read-only surfaces. Missing either drops that source to
   `degraded` — say so, never substitute a guess.
2. **OpenRush capabilities.** `describe_capabilities` once this session,
   before any other OpenRush call — it says what's actually enabled here.
3. **OpenRush pulls.** `inspect_ai_visibility`, `discover_ai_citations`,
   `inspect_search_visibility`, `audit_site` on the domain (default
   location/language unless the client's market calls for another).
4. **Abency check.** `list_brands` to see whether the client exists there. If
   yes: `gsc_top_queries` and `keywords_gsc_opportunities` for that brand. If
   no, skip Abency and say so — never borrow another client's brand.
5. **Render.** If the client already has a `client-report` data file or a
   rendered report, add an AEO section through that HTML pipeline. Otherwise
   write markdown to `Daily-Briefs/seo/<slug>-aeo-<date>.md`.
6. **Provenance on every number.** Carry OpenRush's `source_class` and
   `confidence` from each fact's envelope, or "Abency GSC" for Search Console
   numbers. No bare numbers anywhere in the report.
7. **Format.** Once content and citations are locked, a pure formatting pass
   (headings, tables) can run separately from the judgment steps above.

## Cost

Sonnet: capability discovery, all OpenRush/Abency calls, provenance judgment,
narrative. Haiku: the formatting-only pass in step 7 — never re-deciding a
number's confidence. Fable: never — this is a repeatable reporting pull, not
synthesis. A subagent for this skill returns a summary capped at 150 words:
sources hit, sources skipped, output path.

## Approval gates

- Nothing to send — OpenRush and Abency are read-only in this skill.
- Do not deliver the finished report to the client from here. Email, Slack, or
  portal delivery goes through `System/approval-queue.md` like any other
  client-facing send.

## Output paths

- `Daily-Briefs/seo/<slug>-aeo-<date>.md` when rendered standalone.
- The client's existing `client-report` output path (`Daily-Briefs/reports/`)
  when an AEO section is folded into that flow instead.

## References

[[12_Brain/protocols/Connector Preflight]] · [[12_Brain/09_Ops/Connector Map]] · [[.claude/skills/client-report|client-report]]
