---
note_type: ops
status: active
created: 2026-09-01
updated: 2026-09-15
owner: Dillon Mohr
verification_status: verified
review_on: 2026-10-01
source_refs:
  - "[[System/tool-access-catalog]]"
  - "[[12_Brain/01_Captures/sessions/2026-09-01 - fable-5-1-integration-session]]"
  - "client-operations-canonical/queue/work-items.json (revision 423)"
tags:
  - brain
  - ops
  - connectors
  - mcp
  - access
---

# Connector Map

**Summary:** six connectors are live in the Claude workspace, two are installed
but switched off, and the agents reference two servers (Composio, Claude Browser)
that only exist on the Windows box. Nine of ten blocked queue items are access
gates, and four of them are fixable with connectors that do not exist yet.

Live-checked 2026-09-01 from a Claude Code remote session with `ListConnectors`
and the connector registry. Cursor and Codex hold their own OAuth sessions; a
connection here proves nothing there (see `System/tool-access-catalog.md`).

## 1. Connected and enabled (claude.ai workspace)

| Connector | Used for | Notes |
|---|---|---|
| Gmail | inbox sweep, client threads, drafts | read-heavy; sends stay approval-gated |
| Slack | Momentum 360 requests, #puttery, DMs | read-heavy; posts stay approval-gated |
| Google Drive | shared files, decks, sheets | search only used so far |
| Google Calendar | scheduling context | rarely called |
| HyperFrames by HeyGen | code-driven motion video | compose/render disabled from CLI agents; use the local skill |
| Indeed | job search | not part of any workflow; candidate for removal |
| Higgsfield | image, video, 3D, audio generation for hero loops and boards; also `.cursor/mcp.json` | **connected 2026-09-01** (claude.ai workspace, Ultra plan); 80+ tools incl. generate_image/video/audio, video_analysis, website builder, TikTok publish. Every generate_* call spends credits: approval-gated |

## 2. Installed but not enabled in chat

| Connector | Why it matters | Action |
|---|---|---|
| Netlify | With Not For preview and every prospect site deploy | enable in chat settings, then re-auth if state is stale |
| WordPress.com | BigOrange pilot review state, client WP sites | enable; note most client sites are self-hosted WP, not WP.com |

Both show `installState: unknown`, which means the auth check did not resolve.
Toggle them on in this chat's connector settings and re-run `ListConnectors`.

## 3. Referenced by agents, absent from this workspace

| Server | Where referenced | Reality |
|---|---|---|
| Composio MCP | 6 of 7 `.claude/agents` | Windows-box MCP with its own OAuth. Not in the claude.ai registry. Agents that run in the cloud silently lose HubSpot, Ads, GA4, Meta, Search Console, Semrush. |
| Claude Browser | web-product-builder, qa-critic, growth-content | local extension; unavailable remotely, Playwright substitutes |
| LandingFolio | `.mcp.json` | token-gated, sandbox-only per its entity page |

## 4. Gaps mapped to blocked work

| Gap | Blocked or manual work it unlocks | Registry option | Verdict |
|---|---|---|---|
| **HubSpot** | wi-20260723-0005 Align portal agent (reauth), wi-20260801-0001 caller-response alerts, wi-20260718-0003 CallRail↔HubSpot verification | Official HubSpot connector (search, properties, campaign analytics, 22 tools) | **Connect first.** Two portals (Momentum 50612503, Align 242825734); connect as Momentum identity only, keep Align separate. |
| **Google Ads (read)** | Tags 2 Go baseline (wi-20260807-0001), Replenish billing block, weekly paid-media reporting for 7 accounts | No official Google Ads connector. Supermetrics or Windsor.ai bundle Ads + GA4 + Meta read-only | **Connect one bundle.** Windsor.ai is the lighter surface (5 tools). Read-only by design, which matches the approval boundary. |
| **GA4 + Search Console** | Revive sitemap (wi-20260717-0002), Puttery attribution dashboard, AEO reporting | same bundle as above; Search Console needs verifying which bundle exposes it | covered by the bundle choice |
| **Meta Ads (read)** | Fagan attribution LP, KJB, Omega, Onsite reporting | same bundle; Motion Creative Analytics for creative-level insight | bundle first, Motion only if creative testing becomes a service |
| **Semrush** | BigOrange pillar review, Bar Crawl on-page SEO proof, site-grade batches | Official Semrush connector (14 tools) | **Connect.** Emelia's report request in the approval queue becomes self-serve. |
| **Stripe** | wi-20260724-0024 foundation donation flow | Official Stripe connector | do not connect to the foundation account; the gate is their identity verification, not tooling |
| **Vercel** | vace-platform PR previews, Bridge staging | Official Vercel connector | connect when Bridge or VA Claims staging moves to Vercel; not today |
| **Zapier** | Fagan Meta→Zapier routing, QRTIGER/PostGrid drafts | Official Zapier connector (zero exposed tools in registry) | skip; the Zap drafts are done and the remaining gate is human CAPTCHA |
| CallRail | after-hours routing verification | none in registry | stays browser-driven on the Windows box |
| HighLevel | Revive publish | none in registry | stays browser-driven |
| Bitwarden | VA Claims WP, Google password gates | never | credentials never enter an agent surface |

## 5. Recommended connect order

1. **HubSpot** (Momentum identity). Unblocks three queue items and the Puttery
   CRM side.
2. **Windsor.ai or Supermetrics** for Ads, GA4, Meta read. Pick one; both are
   paid. Windsor has a free tier for small account counts. Verify Search Console
   is in the chosen bundle before committing.
3. **Semrush**. Already paid for; the connector is free.
4. **Enable Netlify and WordPress.com** that are already installed.
5. **Remove Indeed** from the workspace to keep the tool list short. Every
   loaded connector costs tokens on every turn.

## 6. What Cursor needs, separately

Per `System/tool-access-catalog.md`, Cursor's `user-composio`,
`user-wordpress-com`, and `plugin-slack-slack` were all `needsAuth` at the last
check. Cursor gets its own OAuth; the list above does not carry over. Sequence
for the Windows box: Composio OAuth in Cursor, then Slack, then WordPress.com,
then `claude mcp add` for Higgsfield, then `/mcp` login.

## Dated preflight log

- 2026-09-01 (session 2, `ListConnectors`): live Gmail, Slack, Google Drive, Google Calendar, HyperFrames, Indeed, Higgsfield. Degraded Netlify and WordPress.com (installed, `installState: unknown`, not enabled in chat; deploys drafted to approval queue). Blocked Composio, Claude Browser, HubSpot, Ads/GA4/Meta, Semrush (absent from workspace). Higgsfield moved from pending to live.
- 2026-09-14 (Windows box, live probes — **scope correction to the row above**): the 09-01 "Blocked Composio" verdict was true of *that cloud workspace* and was not a fact about the Composio server. On the Windows box, `google_search_console`, `google_analytics` and `googleads` were all `active`; a read-only `GET_SITE` on `alignhcm.com` returned `siteOwner`, `LIST_SITEMAPS` and a totals query returned data, and `LIST_ACCOUNT_SUMMARIES` returned Align HCM property 320235048. **The only genuine block is Google Ads entitlement**, because Explorer access attaches to Cloud project 150963436905 and Composio's OAuth client does not use it — Search Console and GA4 were never blocked. Separately, Composio is not required for these reads at all: the gcloud Application Default Credential carries webmasters.readonly, analytics.readonly, tagmanager.readonly and adwords, and all four APIs are enabled on `momentum-360-489301`. Supersedes the 2026-09-12 closeout's "gcloud is unauthenticated". Source: [[12_Brain/01_Captures/2026-09-14 - Align Search Console and GA4 direct snapshot, gap table, and the Google access answer]].

## Rules

- Connect read-only surfaces first. Anything that can send, publish, or spend
  stays behind `System/approval-queue.md` regardless of connector.
- One identity per client space. Never connect Align and Momentum HubSpot in the
  same session.
- Re-verify with `ListConnectors` before claiming a connector is usable; the
  state changes and installed does not mean authenticated.
- Write every verdict as `<surface>: <state> because <scope>`, with the date and
  the workspace it was observed in. A bare "blocked" is read as a fact about the
  whole connector and outlives the condition that produced it — see the 2026-09-14
  correction above and
  [[12_Brain/11_Craft/earned-lessons|earned-lessons]].

## Links

- [[System/tool-access-catalog|Tool and Access Catalog]]
- [[12_Brain/02_Entities/Higgsfield MCP|Higgsfield MCP]]
- [[12_Brain/02_Entities/LandingFolio MCP|LandingFolio MCP]]
- [[12_Brain/protocols/approval-tiers|Approval & safety protocol]]
