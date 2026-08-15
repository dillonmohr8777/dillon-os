---
tags: [research, raw, ads, skills]
captured: 2026-08-15
topic: Ads optimization skills to bring into Dillon OS
---

# 2026-08-15 research — ads optimization skills for the stack

Receipts for which ads-optimization skills already exist in Dillon's GitHub,
which public packs are worth learning from, and which paid MCPs stay out.
Compiled into [[12_Brain/concepts/Ads Optimization Skill Stack]] and
[[12_Brain/entities/Claude Ads]].

## Question

Which ads-optimization skills can enter Dillon OS now, without a new MCP or a
vendor lock-in?

## Receipts

1. **Claim:** Dillon OS had 24 vault skills and zero ads-optimize skills. HUD
   Command Deck only lists folders under `.claude/skills/`.
   - Source: this repository's `.claude/skills/` listing and `_os/vault-state.js`
     `getSkills()`, checked 2026-08-15.

2. **Claim:** The authenticated GitHub user owns 34 repositories (22 public +
   11 private owned, plus member access). Ads-relevant owned repos include
   `dillonmohr8777/claude-ads` (public fork), `dillonmohr8777/claude-skills-repo`
   (public), and `dillonmohr8777/alignhcm-ai-marketing-skills` (private).
   - Source: Composio `GITHUB_LIST_REPOSITORIES_FOR_THE_AUTHENTICATED_USER`
     on 2026-08-15 (`type: all`, `per_page: 100`).

3. **Claim:** `dillonmohr8777/claude-ads` is a 2026-05-22 fork of AgriciDaniel
   Claude Ads. The fork's `skills/` tree includes `ads-audit`, `ads-google`,
   `ads-meta`, `ads-server-side-tracking`, `ads-attribution`, and other
   platform sub-skills. The `ads-audit` contract asks for exports, scores
   platforms 0–100, and writes `ADS-AUDIT-REPORT.md` in that repo's layout.
   - Source: [dillonmohr8777/claude-ads](https://github.com/dillonmohr8777/claude-ads)
     and [skills/ads-audit/SKILL.md](https://github.com/dillonmohr8777/claude-ads/blob/main/skills/ads-audit/SKILL.md)
     fetched 2026-08-15.

4. **Claim:** Upstream Claude Ads is MIT, read-only by default, and ships
   `/ads audit`, `/ads optimize --draft`, and 12-platform contracts. Public
   install path is a Claude Code plugin marketplace add.
   - Source: [AgriciDaniel/claude-ads](https://github.com/AgriciDaniel/claude-ads)
     README and [claude-ads.md/docs](https://claude-ads.md/docs), fetched
     2026-08-15.

5. **Claim:** `dillonmohr8777/claude-skills-repo` already stores a generic
   `paid-ads` skill (Alireza Rezvani, MIT, updated 2026-03-06) plus
   `campaign-analytics`, `ad-creative`, and `analytics-tracking`. `paid-ads`
   is campaign-strategy prose, not a vault writer. `campaign-analytics` is
   three offline Python scripts that need a caller-supplied JSON journey file.
   - Source: [skills/paid-ads/SKILL.md](https://github.com/dillonmohr8777/claude-skills-repo/blob/main/skills/paid-ads/SKILL.md)
     and [skills/campaign-analytics/SKILL.md](https://github.com/dillonmohr8777/claude-skills-repo/blob/main/skills/campaign-analytics/SKILL.md)
     fetched 2026-08-15.

6. **Claim:** Other 2026 public skill packs exist: AdKit `ads-skills` +
   `ads-mcp` (draft-first hosted MCP), Adspirer Claude plugin (OAuth, paid
   tiers advertised), `narayan-metaflow/metaflow-marketing-skills`
   (`google-ads-account-audit`), `ivangfalco/ads-skills`,
   `mathiaschu/google-ads-analyzer` + `meta-ads-analyzer`,
   `OpenClaudia/openclaudia-skills`.
   - Source: GitHub search `claude ads skill google-ads OR meta-ads OR ppc`
     on 2026-08-15; vendor pages [adkit.so](https://adkit.so/features/ads-mcp)
     and [adspirer.com](https://www.adspirer.com/docs/ai-clients/claude-code).

7. **Claim:** Composio toolkit `twitter` has **no active connection**. A
   GitHub code search across `user:dillonmohr8777` for `TWITTER_BEARER`,
   `X_BEARER`, and `bearer_token` returned zero hits. Gmail and Drive
   filename/content searches for Twitter/X bearer material returned zero
   files. The Cursor X MCP rejected `search_posts_all` and
   `get_users_by_usernames` with credits-depleted (HTTP 402) on 2026-08-15.
   - Source: Composio `COMPOSIO_SEARCH_TOOLS` connection status,
     `GITHUB_SEARCH_CODE`, `GMAIL_FETCH_EMAILS`, `GOOGLEDRIVE_FIND_FILE`,
     and X MCP errors, all 2026-08-15. No token values were written down.

8. **Claim:** Dillon OS already forbids installing a new MCP until
   `_os/automation/bin/mcp-gate.js` passes source, Inspector, permission,
   prompt-injection, and overlap checks. LandingFolio is the only project MCP
   and is still sandbox-only.
   - Source: [[12_Brain/entities/LandingFolio MCP]] and
     `_os/automation/lib/mcp-gate.js`.

## Killed claims

- The X bearer token is sitting in Composio, Gmail, Drive, or a tracked
  GitHub file. Contradicted by receipt 7.
- Installing Adspirer or AdKit this session would be a free skill drop-in.
  Contradicted by their OAuth/paid MCP docs and by the vault MCP gate
  (receipts 6 and 8).
- Copying the whole `claude-ads` plugin into `.claude/skills/` is the same
  as a Dillon OS skill. Contradicted by that pack's output paths
  (`ADS-AUDIT-REPORT.md` in the plugin tree) vs this vault's
  `Daily-Briefs/` + Optimization Ledger contract (receipt 3).
- `campaign-analytics` is ready to run on live client accounts. Contradicted
  by its own limitation: static JSON journeys, no Ads API (receipt 5).
- X practitioner posts from this session can be cited. Killed: X search and
  user-lookup both returned 402 credits-depleted (receipt 7).

## Single-source / keep labeled

- "250+ checks" / "10–15 minute audit" language on Claude Ads marketing
  pages. Single-source vendor copy. The fork's skill files exist; the speed
  and check-count claims were not re-run here.
- Adspirer "400+ tools" / "91 tools" counts disagree across their own pages.
  Treat as marketing, not inventory.

## Decision this run

Bring four **vault-native** skills into `.claude/skills/`: `ads-audit`,
`ads-search-terms`, `ads-tracking`, `meta-ads`. Distill from
[[11_Agents/Google Ads Agent]], the 2026 ads concepts, and the contracts in
receipts 3 and 5. Do not vendor the plugin. Do not add an ads MCP.
