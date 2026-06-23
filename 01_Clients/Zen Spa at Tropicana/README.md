# Zen Spa at Tropicana — Site Polish

Goal: keep the restored **Squarespace-native, fully client-editable** site, but make it
look like the luxury Atlantic City spa it is — and fix the **mobile design**, which is the
worst of it right now. No rebuild of the content; this is a visual layer on top.

## Files
- `zenspa-code-injection.css` — the visual layer. Squarespace 7.1 Code Injection CSS:
  luxury type, real header/logo treatment, card/panel content, proper buttons, and a
  dedicated mobile overhaul.

## How to apply (≈2 minutes, no rebuild)
1. Squarespace → **Settings → Advanced → Code Injection → HEADER**.
2. Paste the entire contents of `zenspa-code-injection.css`, wrapped in `<style>` … `</style>`.
   - The `@import` font line must be the **first line inside** the `<style>` tag.
3. **Save**, then open the live site on **desktop and phone** and screenshot it.
4. Send the screenshots back and we tune. The selectors use stable 7.1 conventions, but a
   few may need retargeting to this exact template — that's expected for a v1 pass.

### Editing colors/fonts
Everything you'll want to change lives in the `:root { ... }` **TOKENS** block at the top of
the CSS (background, sage/forest/brass accents, fonts, corner radius). Change them there —
not scattered through the file. Drop in Ambika's exact brand hexes when we have them.

> Note: this keeps every text/image block editable in Squarespace exactly as it is today.
> CSS only changes how things *look*, never the content or the editing UX.

---

## The Orgo MCP route (hands-on-keyboard automation)

You asked how to wire up Orgo so an agent can actually drive the desktop. Honest version:

**What it is.** The Orgo *API key* is just a credential. To have an agent click around the
desktop, the assistant also needs an Orgo **MCP connector** (or the Orgo SDK) — the "wire"
that turns instructions into clicks/keystrokes. In *this* session that wire isn't present,
which is why I can't take the wheel here no matter what key I'm given.

**How you'd add it (general Claude Code mechanism):**
1. Confirm Orgo's current MCP offering in their own docs (`orgo.ai` / their dashboard).
   I'm not going to guess a package/command name and have you paste something wrong — grab
   the exact server command or HTTP URL they publish.
2. In a **local** Claude Code CLI (this matters — see caveat), register it:
   - stdio server:  `claude mcp add orgo -- <command they give you>`
   - or HTTP:       `claude mcp add --transport http orgo <url they give you>`
3. Put the key in the environment, e.g. `ORGO_API_KEY=...`, so the server can authenticate.
   Keep it in an env var / secret store — not pasted into chat or committed anywhere.
4. Start a **fresh** session and the Orgo tools become available to the assistant.

**Important caveats (so you don't waste usage):**
- A newly added MCP server is **not** picked up mid-session — it needs a new session.
- This hosted **web** session can't drive an external desktop even with the server added;
  the Orgo route realistically belongs in the **desktop/CLI** Claude Code (or Orgo's own
  agent UI), where the MCP server can run next to the browser it controls.
- The fast, reliable path to "make it pretty" does **not** need any of this: it's the
  Code Injection CSS above + a screenshot iteration loop.

## Status / next steps
- [x] v1 Code Injection CSS drafted (luxury look + mobile overhaul)
- [ ] Applied to Squarespace; desktop + mobile screenshots captured
- [ ] Tune selectors/spacing to the live template from screenshots
- [ ] Drop in exact brand colors/fonts (and image logo, to kill the text fallback)
- [ ] Decide Orgo MCP route only if true desktop automation is still wanted
