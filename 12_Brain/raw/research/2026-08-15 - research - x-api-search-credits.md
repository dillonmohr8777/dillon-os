---
tags: [research, raw, x-api, ads]
captured: 2026-08-15
topic: Operator X bearer authenticates; recent search is credit-blocked
---

# 2026-08-15 research — X recent search vs Activity API

Receipts for using the operator X developer app to search for ads-skill posts.
No keys, tokens, or project IDs in this file. Compiled into
[[12_Brain/concepts/Ads Optimization Skill Stack]].

## Question

Can the operator X app search the last 7 days for ads-optimization skill
posts, and is the Activity API a substitute?

## Receipts

1. **Claim:** `GET /2/tweets/search/recent` is the public keyword-search
   endpoint for Posts from the last 7 days. App-only Bearer auth is enough.
   - Source: [Recent Search introduction](https://x-preview.mintlify.app/x-api/posts/search/introduction)
     and [quickstart](https://x-preview.mintlify.app/x-api/posts/search/quickstart/recent-search),
     fetched 2026-08-15. Official `https://docs.x.com/llms.txt` returned HTTP 403
     from this environment (reconfirmed same day).

2. **Claim:** Five ads-skill queries against `https://api.x.com/2/tweets/search/recent`
   with the operator app-only Bearer all returned HTTP 402
   `credits depleted` / `Payment Required` on 2026-08-15. Auth was accepted
   (not 401). Reconfirmed the same day after the Activity API paste:
   `ads-audit skill` still 402; `/2/usage/tweets` still `project_usage` 0.
   - Source: live API calls this session. Queries covered Claude Ads, AdKit,
     Adspirer, `SKILL.md` + ads/PPC, and paid-media + Claude/Cursor/OpenClaw.

3. **Claim:** `GET /2/usage/tweets` returned HTTP 200 with `project_usage` of
   `0` against a multi-million `project_cap`, and `cap_reset_day` of `12`.
   That meter is not the one blocking search.
   - Source: live `https://api.x.com/2/usage/tweets` this session. Numeric
     project id omitted from this public receipt.

4. **Claim:** `GET /2/users/by/username/X` also returned 402 credits
   depleted. `GET /2/users/me` returned 403 unsupported authentication
   because app-only Bearer cannot call user-context endpoints.
   - Source: live API calls this session.

5. **Claim:** X Activity API (`/2/activity/stream` and
   `/2/activity/subscriptions`) delivers per-`user_id` events (posts, likes,
   follows, DMs, profile edits) over a persistent HTTP stream or webhook. It
   does not accept keyword/boolean search. `news.new` is Enterprise/Partner
   only. Each delivered Post event is billed as a Post.
   - Source: operator-pasted Activity API page (same contract as
     [Activity API](https://docs.x.com/x-api/activity) / delivery via
     stream or [webhooks](https://docs.x.com/x-api/webhooks/introduction)).

## Killed claims

- A newly generated Bearer token bypasses the 402. Contradicted by receipt 2
  (valid auth, same credit wall as the Cursor X MCP earlier this session).
- Activity API can replace Recent Search for “find posts about ads skills.”
  Contradicted by receipt 5 (user_id subscriptions, not query operators).
- The tweet-usage cap is exhausted. Contradicted by receipt 3 (`project_usage` 0).

## Web fallback (same day, after Activity API paste)

6. **Claim:** Official `https://docs.x.com/llms.txt` is still HTTP 403 from
   this environment. The Activity API page is readable via the Mintlify
   preview and matches the operator paste: per-`user_id` events, not
   keyword search. Docs themselves say use Filtered Stream for boolean /
   keyword operators.
   - Source: [Activity API preview](https://x-preview.mintlify.app/x-api/activity)
     fetched 2026-08-15.

7. **Claim:** A public-web substitute for Recent Search did not recover X
   posts. `site:x.com` queries for ads-audit / claude-ads / ads-skills
   returned no posts. Exa MCP was rate-limited. Cursor X MCP tool discovery
   failed this pass (server error).
   - Source: web search + Exa + X MCP, 2026-08-15.

8. **Claim:** The same web pass re-found the already-known GitHub packs
   (AgriciDaniel/claude-ads, adkit/ads-mcp) plus one pack not in the first
   harvest: [itallstartedwithaidea/agent-skills](https://github.com/itallstartedwithaidea/agent-skills)
   (MIT, 73 skills, 12 labeled Google Ads; powers commercial
   googleadsagent.ai / Buddy Agent). Do not vendor it into `.claude/skills/`.
   - Source: GitHub README fetched 2026-08-15.

## Decision this run

Do not stand up Activity webhooks for this research. Top up the X developer
credit wallet (or wait for the next credit grant) before another search pass.
Keys stay in the gitignored private access layer, never in tracked files.
Do not install the googleadsagent.ai skill dump this session.
