---
type: runbook
task: Unblock AI crawlers on alignhcm.com
priority: CRITICAL (standing directive: AI crawlers must have full access)
created: 2026-07-16
status: RESOLVED
resolved: 2026-07-16
---

# Unblock AI Crawlers on alignhcm.com

## Resolution (verified 2026-07-16)

- The portal-level block is no longer active. `www.alignhcm.com`, `robots.txt`, and the default HubSpot domain return HTTP 200 to GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, and Applebot-Extended.
- The current HubSpot-generated robots.txt allows the public site and restricts only internal HubSpot paths. No crawler-specific deny rules remain.
- `llms.txt` was published through the HubSpot Files API and mapped from `https://www.alignhcm.com/llms.txt` with a permanent redirect. Every tested AI crawler receives HTTP 200 and `text/plain`.
- The published file's SHA-256 matches the repository copy: `19147fa3b701096e1f09fbc4e489437a332a06a5bc3e4c3bf34681b4b23eca5f`.
- Re-run `Publish-FromTerminal.ps1` from this folder to inspect or repair the file and redirect without using the HubSpot website.

## Original diagnosis (earlier on 2026-07-16)

- `www.alignhcm.com`, `alignhcm.com`, AND the default domain `242825734.hs-sites-na2.com` all return **HTTP 403** to any non-browser user agent, including robots.txt and sitemap.xml.
- DNS: www.alignhcm.com and alignhcm.com resolve to HubSpot's CDN (199.60.103.x); the hs-sites domain resolves to HubSpot's Cloudflare edge.
- Because the default HubSpot domain is blocked identically, this is **HubSpot's portal-level bot protection**, not a customer-managed Cloudflare or DNS-level WAF.
- Googlebot is evidently allowed (site is indexed), so the setting is blocking "non-standard" bots, which includes every AI assistant crawler.

## Why this matters

AI assistants (ChatGPT, Perplexity, Claude, Copilot, Gemini) cannot read the site, so Align HCM cannot be cited or recommended in AI answers, where HCM buyers increasingly research. The AEO scoreboard proves it: 2 AI referrals YTD, all from ChatGPT, everything else zero.

## Browser fallback (only if terminal verification regresses)

Portal: 242825734 (app-na2.hubspot.com)

1. Log in as an admin at app-na2.hubspot.com.
2. Go to **Settings (gear) > Content > Pages** (in some portals: Settings > Website > Pages).
3. Select the domain **www.alignhcm.com** at the top (repeat for the default domain after).
4. Open the **SEO & Crawlers** tab.
5. Find the bot / crawler controls:
   - If there is an **"AI crawlers"** or **"Allow AI crawlers"** section (newer portals): enable access for all listed crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, etc.).
   - If there is a **"Block non-standard bots"** or **bot protection** toggle: turn it OFF (or set to allow verified crawlers).
6. In the same tab, open **Customize robots.txt** and replace the contents with `robots.txt` from this folder.
7. If the portal offers an **llms.txt** option, enable it; otherwise publish the `llms.txt` in this folder at the site root (Marketing > Files, or a CMS page at /llms.txt with text content type).
8. If any setting is greyed out, HubSpot support (help button > contact support) can disable bot protection on the portal; reference the 403s served to GPTBot/ClaudeBot user agents.

## Verification (automatic)

The watchdog attempts a fetch of https://www.alignhcm.com/robots.txt and https://www.alignhcm.com/llms.txt on every run:
- **403** = still blocked, CRITICAL alert stays in every report.
- **200 on both** = fixed. The watchdog keeps the issue resolved in baseline.json and tracks the AEO referral trend as the success metric.

Manual spot-check from any terminal:

    curl -A "Mozilla/5.0 AppleWebKit/537.36; compatible; GPTBot/1.2; +https://openai.com/gptbot" -o /dev/null -s -w "%{http_code}\n" https://www.alignhcm.com/
    curl -A "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)" -o /dev/null -s -w "%{http_code}\n" https://www.alignhcm.com/

Both should print 200 after the fix.

## After it's live

1. Watch the AEO panel on the dashboards; AI referral contacts are the scoreboard.
2. Expect first movement in 2 to 6 weeks as crawlers re-index.
3. The buyer's guide series is the most likely content to get cited; keep it current.
